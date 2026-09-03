/**
 * Fetch the review document straight out of OneDrive.
 *
 *   node tools/copy-fetch.mjs                    # writes copy/incoming/review.docx
 *   node tools/copy-fetch.mjs --quiet-hours 0    # take it however recently it was saved
 *
 * TWO WAYS IN, and the first needs nothing set up beyond one link.
 *
 * 1. A SHARE LINK — set REVIEW_DOC_URL.
 *    In OneDrive: right-click the document, Share, "Anyone with the link", Copy.
 *    Paste that into one repository secret and this can read it. No Azure, no
 *    app registration, no administrator, no tenant. Anyone holding the link can
 *    read the document, which is why it lives in a secret rather than in this
 *    file — but what it guards is the wording of a public website, and the link
 *    is unguessable.
 *
 * 2. AN APP REGISTRATION — set AZURE_TENANT_ID, AZURE_CLIENT_ID,
 *    AZURE_CLIENT_SECRET and REVIEW_DRIVE_USER. An Entra ID app with the
 *    APPLICATION permission Files.Read.All and admin consent. For when the
 *    tenant forbids anonymous sharing, or a link is not wanted at all.
 *
 * Either way it only ever downloads. Nothing here can write to OneDrive.
 *
 * WHY NOT POWER AUTOMATE. Reaching an outside URL from a flow needs its HTTP
 * action, which is a Premium licence — about £15 a month, forever, to move one
 * file once a day. This costs nothing and changes nothing for the reviewers:
 * same document, same folder, same Word. They never learn it exists.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const arg = (name, dflt) => {
  const i = process.argv.indexOf(name);
  return i > -1 ? process.argv[i + 1] : dflt;
};

const OUT = arg('--out', 'copy/incoming/review.docx');
const FOLDER = arg('--folder', process.env.REVIEW_FOLDER || 'Website Review');

/* How long the document must have been left alone before it is taken.
 *
 * There is no button and no switch: reviewers edit and save, and that is all
 * they ever do. The cost of that is a run could catch somebody mid-sentence —
 * half a thought, published. OneDrive records when the file was last saved, so
 * rather than asking a person to declare they have finished, infer it: nobody
 * has touched this for hours, so they are done.
 *
 * At 06:00 UTC it is around midnight in Rochester and this passes trivially.
 * It earns its keep on the evening somebody is still working at 01:00. */
const QUIET_HOURS = Number(arg('--quiet-hours', process.env.REVIEW_QUIET_HOURS ?? 4));

const {
  REVIEW_DOC_URL: SHARE,
  AZURE_TENANT_ID: TENANT,
  AZURE_CLIENT_ID: CLIENT,
  AZURE_CLIENT_SECRET: SECRET,
  REVIEW_DRIVE_USER: USER,
} = process.env;

const die = async (what, res) => {
  const body = await res.text().catch(() => '');
  console.error(`\n  ${what} failed: ${res.status} ${res.statusText}`);
  // Never print a response wholesale: a token request echoes back enough to be
  // worth keeping out of a log anybody can read.
  console.error(`  ${body.slice(0, 300).replace(/[A-Za-z0-9_-]{40,}/g, '<redacted>')}\n`);
  process.exit(1);
};

/** Exits 2 — nothing to do — if somebody may still be typing. */
const checkQuiet = (name, savedAt, by) => {
  const quietFor = (Date.now() - new Date(savedAt).getTime()) / 3600000;
  if (quietFor < QUIET_HOURS) {
    console.log(`\n  ${name}`);
    console.log(`  last saved ${quietFor.toFixed(1)}h ago by ${by}.`);
    console.log('  Somebody may still be working on it. Leaving it until it has been');
    console.log(`  quiet for ${QUIET_HOURS}h. Nothing was published.\n`);
    process.exit(2);
  }
  return quietFor;
};

const save = async (res, name, quietFor, by) => {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, Buffer.from(await res.arrayBuffer()));
  console.log(`\n  ${name}`);
  console.log(`  last saved ${quietFor.toFixed(1)}h ago by ${by}`);
  console.log(`  -> ${OUT}\n`);
};

/* ── the easy way: a share link ──────────────────────────────────────────────
   OneDrive hands a file to anybody holding an "anyone with the link" URL with
   no sign-in at all — which is exactly what a scheduled job has, and what an
   app registration exists to work around needing. The link becomes an API
   address by base64url-encoding it behind `u!`, which is Microsoft's own
   scheme for it. */
if (SHARE) {
  // SharePoint refuses a request that does not look like a browser — no
  // User-Agent gets 403 Forbidden whatever the sharing permissions are, which
  // reads exactly like "this link is private" and is not.
  const BROWSERISH = {
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
      + '(KHTML, like Gecko) Chrome/126.0 Safari/537.36',
    accept: '*/*',
  };

  /* THERE IS NO ONE URL THAT WORKS. A share link is a link to a VIEWER, not to
     a file, and how to ask for the bytes instead depends on which product minted
     it. `?download=1` is the answer everywhere on the internet and on a `:w:`
     link it just opens the Word web viewer, which arrives as HTML and looks
     exactly like a sign-in page. So: try each known form and take whichever
     hands back something that is not a web page. */
  const src = new URL(SHARE);
  const candidates = [];

  // 1. SharePoint's own download endpoint, built from the sharing token. The
  //    reliable one for OneDrive for Business.
  // /:w:/g/personal/<user>/<shareId>  ->  /personal/<user>/_layouts/15/…
  // The site path has to keep its `personal/` segment; dropping it 404s.
  const m = /^\/:[a-z]:\/[a-z]\/(.+)\/([^/?]+)$/i.exec(src.pathname);
  if (m) {
    candidates.push([
      `${src.origin}/${m[1]}/_layouts/15/download.aspx?share=${m[2]}`,
      'SharePoint download endpoint',
    ]);
  }

  // 2. The documented shares API. Serves personal OneDrive; a business link
  //    answers 308 "User migrated" and points at Graph, which wants a sign-in.
  const b64 = `u!${Buffer.from(SHARE).toString('base64')
    .replace(/=+$/, '').replaceAll('+', '-').replaceAll('/', '_')}`;
  candidates.push([`https://api.onedrive.com/v1.0/shares/${b64}/root/content`, 'shares API']);

  // 3. download=1, which does work on some link shapes.
  const dl = new URL(SHARE);
  dl.searchParams.set('download', '1');
  candidates.push([dl.toString(), 'download=1']);

  let res = null;
  const tried = [];
  for (const [candidate, how] of candidates) {
    let attempt = await fetch(candidate, { redirect: 'follow', headers: BROWSERISH })
      .catch(() => null);

    // api.onedrive.com answers a business link with 308 and the real address in
    // the body rather than in a Location header, so fetch has nothing to follow.
    if (attempt?.status === 308) {
      const where = await attempt.json().catch(() => null);
      const next = where?.redirectUri || attempt.headers.get('location');
      if (next) {
        attempt = await fetch(next, { redirect: 'follow', headers: BROWSERISH }).catch(() => null);
      }
    }

    const type = attempt?.headers.get('content-type') || '';
    if (attempt?.ok && !type.includes('text/html')) {
      console.log(`  opened via the ${how}`);
      res = attempt;
      break;
    }
    tried.push(`${how}: ${attempt ? `${attempt.status} ${type.split(';')[0] || 'no type'}` : 'no response'}`);
  }

  if (!res) {
    console.error('\n  That share link did not give up the document.');
    for (const t of tried) console.error(`    ${t}`);
    console.error('');
    console.error('  An HTML response is a viewer or a sign-in page. If the link opens for');
    console.error('  you in a private browser window then the sharing is right and this is');
    console.error('  a link shape not handled here — say so. If it asks you to sign in,');
    console.error('  re-share it as "Anyone with the link".\n');
    process.exit(1);
  }

  // The share API is what would have carried a proper name and author. Off a
  // plain download there is the filename out of Content-Disposition and the
  // Last-Modified header, which is all the quiet check needs.
  const disp = res.headers.get('content-disposition') || '';
  const name = decodeURIComponent(
    /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disp)?.[1] || 'the review document',
  );
  const modified = res.headers.get('last-modified');
  if (!modified) {
    console.error('\n  OneDrive did not say when that file was last saved, so there is no');
    console.error('  way to tell whether somebody is still working in it. Refusing rather');
    console.error('  than publishing a half-finished edit.\n');
    process.exit(1);
  }
  const quietFor = checkQuiet(name, modified, 'someone');
  await save(res, name, quietFor, 'someone');
  process.exit(0);
}

/* ── the other way: an app registration ─────────────────────────────────── */
const missing = Object.entries({
  AZURE_TENANT_ID: TENANT,
  AZURE_CLIENT_ID: CLIENT,
  AZURE_CLIENT_SECRET: SECRET,
  REVIEW_DRIVE_USER: USER,
}).filter(([, v]) => !v).map(([k]) => k);

if (missing.length) {
  console.error('\n  Nothing to fetch with.');
  console.error('  Either set REVIEW_DOC_URL to an "Anyone with the link" share of the');
  console.error(`  document, or set: ${missing.join(', ')}`);
  console.error('  See the comment at the top of this file.\n');
  process.exit(1);
}

const tokenRes = await fetch(`https://login.microsoftonline.com/${TENANT}/oauth2/v2.0/token`, {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    client_id: CLIENT,
    client_secret: SECRET,
    scope: 'https://graph.microsoft.com/.default',
    grant_type: 'client_credentials',
  }),
});
if (!tokenRes.ok) await die('Signing in', tokenRes);
const { access_token: token } = await tokenRes.json();
const auth = { authorization: `Bearer ${token}` };

// The folder is listed rather than the file named: the filename carries its
// date, so naming it here would mean editing this file every round.
const base = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(USER)}/drive/root:/${encodeURIComponent(FOLDER)}`;
const listRes = await fetch(`${base}:/children`, { headers: auth });
if (!listRes.ok) await die(`Reading the "${FOLDER}" folder`, listRes);
const { value: items = [] } = await listRes.json();

// Word leaves a ~$<name> lock file beside an open document. It is 162 bytes of
// nothing and it is not a document.
const docs = items.filter((f) => f.name.toLowerCase().endsWith('.docx') && !f.name.startsWith('~$'));

if (!docs.length) {
  console.log(`\n  No .docx in "${FOLDER}". Nothing to fetch.\n`);
  process.exit(2);
}
if (docs.length > 1) {
  console.error(`\n  ${docs.length} documents in "${FOLDER}". Which one is meant is a guess:`);
  for (const d of docs) console.error(`    ${d.name}`);
  console.error('  Leave exactly one and run again.\n');
  process.exit(1);
}

const [doc] = docs;
const who = doc.lastModifiedBy?.user?.displayName || 'someone';
const quiet = checkQuiet(doc.name, doc.lastModifiedDateTime, who);

const getRes = await fetch(`${base}/${encodeURIComponent(doc.name)}:/content`, { headers: auth });
if (!getRes.ok) await die(`Downloading ${doc.name}`, getRes);
await save(getRes, doc.name, quiet, who);
