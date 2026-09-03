/**
 * Shared machinery for the website-copy round trip.
 *
 * The round trip is: source -> manifest -> Word document -> stakeholder edits
 * -> manifest diff -> source. This file owns the first and last legs, because
 * both of them have to agree exactly about WHICH bytes of WHICH file hold a
 * given sentence. Extraction and write-back reading the same rules from the
 * same module is the only reason a value can survive the journey.
 *
 * Strings are located by BYTE RANGE from an AST parse, not by search. Two
 * founders can share a job title, four cards can say "Learn more", and a
 * search-and-replace would rewrite all of them from one edit. An offset is
 * unambiguous.
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { Parser } from 'acorn';
import jsx from 'acorn-jsx';

const JSX_PARSER = Parser.extend(jsx());

export const sha = (s) => createHash('sha1').update(s).digest('hex');

/* ── what counts as copy ────────────────────────────────────────────────────
   A string is exposed for editing only if it passes the value test AND is not
   excluded by where it sits. Both halves are needed: className values are
   prose-shaped often enough to fool a value test on their own, and a page's
   headline is sometimes a single word that no value test would pass. */

// Attributes and object keys that NEVER hold copy, however prose-like the value.
const KEY_DENY = new Set([
  'className', 'class', 'id', 'key', 'ref', 'style', 'src', 'href', 'to', 'type',
  'slug', 'path', 'icon', 'tone', 'variant', 'size', 'color', 'colour', 'scene',
  'ground', 'kind', 'as', 'target', 'rel', 'xmlns', 'viewBox', 'd', 'fill',
  'stroke', 'width', 'height', 'loading', 'decoding', 'poster', 'video', 'image',
  'img', 'file', 'asset', 'accept', 'method', 'action', 'autoComplete', 'htmlFor',
  'inputMode', 'min', 'max', 'step', 'tabIndex', 'dir', 'lang', 'charSet',
  'property', 'rows', 'cols', 'objectPosition', 'focus', 'anchor', 'axis', 'span',
]);

// Attributes and object keys that ALWAYS hold copy, however short the value.
const KEY_ALLOW = new Set([
  'alt', 'title', 'label', 'lead', 'eyebrow', 'heading', 'subtitle', 'caption',
  'description', 'summary', 'blurb', 'body', 'text', 'quote', 'question',
  'answer', 'note', 'placeholder', 'aria-label', 'ariaLabel', 'legend', 'cta',
  'ctaLabel', 'headline', 'subhead', 'intro', 'outro', 'footnote', 'unit',
  'value', 'stat', 'role', 'suffix', 'line', 'point', 'claim', 'disclaimer',
  'error', 'empty', 'success', 'prompt', 'hint', 'tagline', 'name',
]);
// `role` and `name` are in both lists: they are copy fields in the founder and
// product records ("Co-Founder", "MAVEN") and plain attributes in JSX. Which
// one wins is decided by context below, not by the sets.

const LOOKS_LIKE_CODE = [
  /^[a-z0-9]+(-[a-z0-9]+)*$/, //                     kebab keys and slugs
  /^[a-z][A-Za-z0-9]*$/, //                          camelCase identifiers
  /^[A-Z0-9_]+$/, //                                 CONSTANTS
  /^[/#.]/, //                                       routes, anchors, selectors
  /^https?:/i,
  /^data:/i,
  /^[0-9\s.,%x+-]+$/, //                             pure numbers and dimensions
  /\.(jpg|jpeg|png|svg|webp|mp4|webm|gif|json|css|js|mjs|py)$/i,
  /\b(?:flex|grid|absolute|relative|rounded|border|shadow|opacity|translate|scale)-/,
  /^(?:text|bg|from|to|via|px|py|pt|pb|pl|pr|mx|my|mt|mb|ml|mr|gap|w|h|max|min)-/,
  /^(?:rgb|rgba|hsl|var|calc|linear-gradient|radial-gradient)\(/,
  /^#[0-9a-fA-F]{3,8}$/,
  /^(?:hover|focus|active|group|peer|dark|sm|md|lg|xl):/,
  // Values that read as prose to a machine and as gibberish to a reviewer.
  // Each of these reached the review document once: a framer-motion scroll
  // offset ("start start"), an IntersectionObserver rootMargin
  // ("0px 0px -12% 0px"), a CSS filter, an SVG transform, and an element id
  // built from a template. A marketing lead asked what they were, which is
  // the correct reaction.
  /^(?:start|end|center)(?:\s+(?:start|end|center))+$/,
  /^-?[\d.]+(?:px|%|rem|em|vh|vw)(?:\s|$)/,
  /^(?:drop-shadow|translate|rotate|scale|matrix|skew|blur|brightness|url|polygon|inset|circle|ellipse)[XY]?\(/,
];

const looksLikeCode = (s) => LOOKS_LIKE_CODE.some((r) => r.test(s.trim()));

/** Prose test: multi-word, or a single capitalised word like "Careers". */
function looksLikeProse(s) {
  const t = s.trim();
  if (!t || t.length > 4000) return false;
  if (looksLikeCode(t)) return false;
  if (!/[A-Za-z]/.test(t)) return false;
  if (/\s/.test(t)) return true;
  return /^[A-ZÀ-ɏ]/.test(t);
}

/* ARIA role values, which must not be mistaken for a job title. */
const ARIA_ROLES = new Set([
  'button', 'dialog', 'list', 'listitem', 'navigation', 'banner', 'main',
  'region', 'status', 'alert', 'presentation', 'none', 'img', 'group', 'tab',
  'tabpanel', 'tablist', 'menu', 'menuitem', 'form', 'search', 'contentinfo',
  'complementary', 'article', 'heading', 'separator', 'switch', 'link',
]);

/**
 * The text of a template literal, as a reader of the page would see it.
 *
 * A template literal wrapped across source lines carries the wrap INTO its
 * value — a newline and then ten spaces of indentation — and the browser
 * collapses that to a single space when it renders. Carrying it into the
 * document instead would show reviewers a paragraph broken at column 84 with
 * the code's indentation hanging off it, and every one of those would come back
 * as a spurious change.
 *
 * A newline followed by INDENTATION is source formatting and collapses. A `\n`
 * followed by anything else was written deliberately — the two-line headlines
 * on this site are written that way — and survives.
 */
const templateText = (s) => s
  .replace(/\r\n/g, '\n')
  .replace(/\n[ \t]+/g, ' ')
  .replace(/[ \t]+\n/g, '\n');

/**
 * A string written as `'one ' + 'two ' + 'three'`, joined back up.
 *
 * This codebase wraps every long sentence that way to keep lines short, so it
 * is not an edge case — it is how most of the actual prose on the site is
 * written. A walker that only understands single literals silently drops the
 * paragraphs and keeps the headings, which is the most dangerous kind of
 * incomplete: the document still looks full.
 *
 * Returns null unless EVERY leaf is a plain string, so a concatenation with a
 * variable in it is left alone rather than half-captured.
 */
function flattenConcat(node) {
  if (!node) return null;
  if (node.type === 'Literal' && typeof node.value === 'string') return node.value;
  if (node.type === 'TemplateLiteral') {
    if (node.expressions.length) return null;
    return templateText(node.quasis.map((q) => q.value.cooked).join(''));
  }
  if (node.type === 'BinaryExpression' && node.operator === '+') {
    const l = flattenConcat(node.left);
    if (l === null) return null;
    const r = flattenConcat(node.right);
    if (r === null) return null;
    return l + r;
  }
  return null;
}

/**
 * Every editable string in one file, with the byte range it occupies.
 *
 * `astPath` is what each id is derived from, and it deliberately describes the
 * string's POSITION IN THE STRUCTURE rather than its content —
 * `founders[0].bio[2]`, not a hash of the sentence. An id that changed when the
 * text changed would be a new id on every edit, and the second round trip would
 * match nothing.
 */
export function extractFile(file) {
  const src = readFileSync(file, 'utf8');
  const out = [];
  let ast;
  try {
    ast = JSX_PARSER.parse(src, { ecmaVersion: 'latest', sourceType: 'module' });
  } catch (e) {
    return { file, hash: sha(src), entries: [], error: String(e.message || e) };
  }

  // Line numbers are for the human reading the report, so one pass up front
  // beats slicing the source once per entry.
  const lineStarts = [0];
  for (let i = 0; i < src.length; i += 1) if (src[i] === '\n') lineStarts.push(i + 1);
  const lineOf = (idx) => {
    let lo = 0;
    let hi = lineStarts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (lineStarts[mid] <= idx) lo = mid; else hi = mid - 1;
    }
    return lo + 1;
  };

  /* The section a string sits in, as a reader would name it.
     Sections on this site are components carrying a `title` or `eyebrow` —
     <Hero>, <Section>, <ScienceBand>, <NextSection>. Tracking the nearest one
     above each string is what lets the document say "Home > What we make >
     second paragraph" instead of "item 1 - div - p 2", which is the difference
     between a reviewer finding a sentence on the page and giving up. */
  let section = '';

  const push = (node, text, kind, astPath, keyName) => {
    if (!text || !text.trim()) return;
    // Source files here are CRLF; Word is not. Normalising at the door
    // means every later comparison is between like and like, and an
    // untouched document round-trips to zero changes, not one per paragraph.
    text = text.split('\r\n').join('\n');
    // A concatenation is rewritten as a concatenation, so the write-back needs
    // the indentation its continuation lines were wrapped to.
    const lineStart = src.lastIndexOf('\n', node.start) + 1;
    out.push({
      file,
      kind,
      astPath,
      section,
      key: keyName || '',
      line: lineOf(node.start),
      start: node.start,
      end: node.end,
      indent: /^[ \t]*/.exec(src.slice(lineStart, node.start))[0],
      raw: src.slice(node.start, node.end),
      text,
    });
  };

  /**
   * A template with holes: `Explore ${name}`.
   *
   * Rendered as `Explore {1}` so a stakeholder can edit the words around the
   * value without being shown, or able to break, the expression that fills it.
   * The write-back refuses any edit that loses or reorders a {n}, which is what
   * makes handing these to a non-programmer safe.
   */
  const dynTemplate = (node) => {
    if (node?.type !== 'TemplateLiteral' || !node.expressions.length) return null;
    let text = '';
    node.quasis.forEach((q, i) => {
      text += q.value.cooked;
      if (i < node.expressions.length) text += `{${i + 1}}`;
    });
    text = templateText(text);
    // A template whose fixed text holds no actual WORDS is not copy: it is
    // an id (`${a}-panel-${b}`) or an SVG transform
    // (`translate(${x} ${y}) rotate(${r})`). Both reached the review
    // document, and a reviewer rightly asked what they were.
    const fixed = text.replace(/\{\d+\}/g, ' ').trim();
    if (!/[A-Za-z]{2,}\s+[A-Za-z]{2,}/.test(fixed) && !/^[A-Z][a-z]+/.test(fixed)) return null;
    // The expressions themselves are kept verbatim so the write-back can put
    // them back where the reviewer left the {n} markers.
    const slotSrc = node.expressions.map((x) => src.slice(x.start, x.end));
    return /[A-Za-z]{3}/.test(text) ? { text, slots: node.expressions.length, slotSrc } : null;
  };

  const walk = (node, path, bare = false) => {
    if (!node || typeof node !== 'object') return;

    // 0. A bare string inside a JSX expression — `{busy ? 'Sending…' : 'Send message'}`.
    //    Conditional button labels and empty-state text live here and nowhere
    //    else, so without this the Contact form's own submit button is absent
    //    from a document that claims to hold every word on the site.
    if (bare && node.type === 'Literal' && typeof node.value === 'string') {
      if (looksLikeProse(node.value)) push(node, node.value, 'jsx-expr', path);
      return;
    }
    if (node.type === 'JSXExpressionContainer') {
      const dyn = dynTemplate(node.expression);
      if (dyn) {
        push(node.expression, dyn.text, 'template-dyn', path);
        Object.assign(out[out.length - 1], { slots: dyn.slots, slotSrc: dyn.slotSrc });
        return;
      }
      walk(node.expression, path, true);
      return;
    }

    // 1. Text sitting directly between JSX tags.
    if (node.type === 'JSXText') {
      const v = node.value.replace(/\s+/g, ' ').trim();
      if (v && /[A-Za-z]/.test(v)) {
        push(node, v, 'jsx-text', path);
        // The whitespace AROUND the words is not formatting — in
        // `<a>one</a> and <a>two</a>` the spaces either side of "and" are the
        // only thing separating the words from the links. The write-back puts
        // exactly what was there back, so it can never weld two words together.
        Object.assign(out[out.length - 1], {
          // From the RAW SOURCE, not node.value: acorn normalises line
          // endings in a JSXText value, and taking them from there writes LF
          // into a CRLF file and leaves it with mixed endings.
          pre: /^\s*/.exec(src.slice(node.start, node.end))[0],
          post: /\s*$/.exec(src.slice(node.start, node.end))[0],
        });
      }
      return;
    }

    // 2. A string attribute on a JSX element: <Hero title="..." />
    if (node.type === 'JSXAttribute' && node.value) {
      const nm = node.name?.name || '';
      const inner = node.value.type === 'JSXExpressionContainer'
        ? node.value.expression
        : node.value;
      const dyn = dynTemplate(inner);
      if (dyn && !KEY_DENY.has(nm)) {
        push(inner, dyn.text, 'template-dyn', `${path}@${nm}`, nm);
        Object.assign(out[out.length - 1], { slots: dyn.slots, slotSrc: dyn.slotSrc });
        return;
      }
      const flat = inner && inner.type !== 'Literal' ? flattenConcat(inner) : null;
      const v = inner?.type === 'Literal' && typeof inner.value === 'string' ? inner.value : flat;
      if (typeof v === 'string') {
        const aria = (nm === 'role' && ARIA_ROLES.has(v)) || (nm === 'name' && !/\s/.test(v));
        const allow = KEY_ALLOW.has(nm) && !aria;
        if (allow || (!KEY_DENY.has(nm) && !aria && looksLikeProse(v))) {
          push(inner, v, flat === null ? 'jsx-attr' : 'concat', `${path}@${nm}`, nm);
        }
        return;
      }
      walk(inner, path);
      return;
    }

    // 3. A string in a plain object literal — how every src/data record is written.
    if (node.type === 'Property' && !node.computed) {
      const nm = node.key.name ?? node.key.value;
      const val = node.value;
      const kp = `${path}.${nm}`;
      if (val?.type === 'Literal' && typeof val.value === 'string') {
        const allow = KEY_ALLOW.has(nm);
        if ((allow || !KEY_DENY.has(nm)) && (allow ? !looksLikeCode(val.value) : looksLikeProse(val.value))) {
          push(val, val.value, 'object-field', kp, nm);
        }
        return;
      }
      if (val?.type === 'TemplateLiteral' && val.expressions.length === 0) {
        const v = templateText(val.quasis.map((q) => q.value.cooked).join(''));
        if (!KEY_DENY.has(nm) && (KEY_ALLOW.has(nm) || looksLikeProse(v))) {
          push(val, v, 'template', kp, nm);
        }
        return;
      }
      if (val?.type === 'BinaryExpression') {
        const v = flattenConcat(val);
        if (v !== null && !KEY_DENY.has(nm) && (KEY_ALLOW.has(nm) || looksLikeProse(v))) {
          push(val, v, 'concat', kp, nm);
          return;
        }
      }
      walk(val, kp);
      return;
    }

    // 4. Bare strings in an array — bio paragraphs, bullet lists.
    if (node.type === 'ArrayExpression') {
      // An array of prose can hold DELIBERATELY EMPTY entries: a founder with
      // material still to supply carries the same number of slots as the
      // others, so nobody's biography reads as shorter than his neighbour's
      // before anyone has had the chance to fill it in. Those slots have to
      // reach the review document as blank rows - the whole point is that
      // someone types into them - so they are collected here rather than
      // skipped as empty.
      const prose = node.elements.filter((el) => el?.type === 'Literal'
        && typeof el.value === 'string' && looksLikeProse(el.value)).length;
      node.elements.forEach((el, i) => {
        const kp = `${path}[${i}]`;
        if (el?.type === 'Literal' && typeof el.value === 'string') {
          if (!el.value.trim() && prose >= 2) {
            out.push({
              file, kind: 'placeholder', astPath: kp, section, key: '',
              line: lineOf(el.start), start: el.start, end: el.end,
              indent: '', raw: src.slice(el.start, el.end), text: '',
            });
            return;
          }
          if (looksLikeProse(el.value)) push(el, el.value, 'array-item', kp);
        } else if (el?.type === 'TemplateLiteral' && el.expressions.length === 0) {
          const v = templateText(el.quasis.map((q) => q.value.cooked).join(''));
          if (looksLikeProse(v)) push(el, v, 'template', kp);
        } else if (el?.type === 'BinaryExpression' && flattenConcat(el) !== null) {
          const v = flattenConcat(el);
          if (looksLikeProse(v)) push(el, v, 'concat', kp);
        } else {
          walk(el, kp);
        }
      });
      return;
    }

    // 5. A JSX element: descend through the tag tree, naming each step. Without
    // this every string in a page shares one path — the whole of Footer.jsx
    // came out as eight entries with one id between them — and the ids have to
    // be unique or the document cannot say which sentence an edit belongs to.
    if (node.type === 'JSXElement' || node.type === 'JSXFragment') {
      const open = node.openingElement;
      const nm = open?.name;
      const tag = !nm ? 'frag'
        : nm.type === 'JSXMemberExpression' ? `${nm.object?.name}.${nm.property?.name}`
          : nm.name || 'el';
      // A component with a title or an eyebrow opens a new section.
      const attrOf = (n) => (open?.attributes || []).find((a) => a.type === 'JSXAttribute'
        && a.name?.name === n && a.value?.type === 'Literal'
        && typeof a.value.value === 'string');
      // Title first: a band's eyebrow is a category word ("Origin", "Research")
      // and its title is the thing a reader would actually call that section.
      const titleAttr = attrOf('title') || attrOf('eyebrow');
      const outer = section;
      if (titleAttr) section = titleAttr.value.value.split('\n')[0].trim();

      (open?.attributes || []).forEach((a) => walk(a, `${path}/${tag}`));
      let i = 0;
      for (const c of node.children || []) {
        const isNode = c.type === 'JSXElement' || c.type === 'JSXFragment' || c.type === 'JSXText';
        if (c.type === 'JSXText' && !c.value.trim()) continue; // layout whitespace
        walk(c, `${path}/${tag}[${i}]`);
        if (isNode) i += 1;
      }
      section = outer;
      return;
    }

    // Everything else: descend, naming the path after the nearest declaration so
    // an id reads like `founders[0].bio[2]` rather than a bare index.
    const named = (node.type === 'VariableDeclarator' || node.type === 'FunctionDeclaration')
      && node.id?.name ? node.id.name : path;
    // `bare` has to survive the descent: the strings in
    // `{busy ? 'Sending…' : 'Send message'}` sit two nodes below the container.
    // It stops at anything that introduces its own naming — an object, an array,
    // a nested element — because those are handled by their own cases above.
    const stillBare = bare && (node.type === 'ConditionalExpression'
      || node.type === 'LogicalExpression'
      || node.type === 'BinaryExpression'
      || node.type === 'ParenthesizedExpression'
      || node.type === 'CallExpression'
      || node.type === 'ArrowFunctionExpression');

    for (const k of Object.keys(node)) {
      if (k === 'type' || k === 'start' || k === 'end' || k === 'loc' || k === 'range') continue;
      // The test of a ternary is a comparison, not copy: 'sending' in
      // `status === 'sending' ? …` is a state name the code matches on.
      if (node.type === 'ConditionalExpression' && k === 'test') continue;
      const v = node[k];
      if (Array.isArray(v)) v.forEach((c) => walk(c, named, stillBare));
      else if (v && typeof v === 'object') walk(v, named, stillBare);
    }
  };

  walk(ast, '');

  // Source order, and never two entries claiming the same bytes.
  out.sort((a, b) => a.start - b.start);
  const seen = new Set();
  const entries = out.filter((e) => {
    const k = `${e.start}:${e.end}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  // Backstop: two entries must never share an astPath, because the id is
  // derived from it and a duplicate id makes an edit unattributable. The JSX
  // walk above makes this rare; a repeated `#n` is still better than a clash.
  const used = new Map();
  for (const e of entries) {
    const n = used.get(e.astPath) || 0;
    used.set(e.astPath, n + 1);
    if (n) e.astPath = `${e.astPath}#${n}`;
  }
  return { file, hash: sha(src), entries };
}

/** Short, stable id for one string: position in the structure, never content. */
export const idFor = (e) => sha(`${e.file}|${e.astPath}|${e.kind}`).slice(0, 8);
