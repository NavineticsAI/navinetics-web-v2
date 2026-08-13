import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SUFFIX = 'NaviNetics';

/**
 * Where the site is served from. Used to build absolute canonical and og:url
 * values — both must be absolute, so a relative path is not an option.
 * Change this and index.html together if the domain moves.
 */
const ORIGIN = 'https://navineticsai.github.io';

function upsert(selector, make, attr, content) {
  if (!content) return;
  let el = document.head.querySelector(selector);
  if (!el) {
    el = make();
    document.head.appendChild(el);
  }
  el.setAttribute(attr, content);
}

const meta = (name, content) =>
  upsert(`meta[name="${name}"]`, () => {
    const el = document.createElement('meta');
    el.setAttribute('name', name);
    return el;
  }, 'content', content);

const prop = (property, content) =>
  upsert(`meta[property="${property}"]`, () => {
    const el = document.createElement('meta');
    el.setAttribute('property', property);
    return el;
  }, 'content', content);

/**
 * Per-route document title, description, canonical URL and Open Graph values.
 *
 * Previously this set title and description only, and index.html carried no
 * sharing tags at all — so every route shared one title, and a link posted to
 * LinkedIn or emailed to a surgeon unfurled as a bare URL. The tags in
 * index.html are the no-JavaScript floor; this raises them per route for
 * crawlers and unfurlers that do execute JS.
 *
 * A caveat worth keeping in view: nothing here helps a crawler that does not
 * run JavaScript, because the site is client-rendered. Prerendering the routes
 * at build time is the real fix; this is the correct behavior underneath it.
 */
export function usePageMeta({ title, description, image } = {}) {
  const { pathname } = useLocation();

  useEffect(() => {
    const full = title ? `${title} — ${SUFFIX}` : SUFFIX;
    const url = `${ORIGIN}${import.meta.env.BASE_URL}${pathname.replace(/^\//, '')}`;

    document.title = full;
    meta('description', description);

    upsert('link[rel="canonical"]', () => {
      const el = document.createElement('link');
      el.setAttribute('rel', 'canonical');
      return el;
    }, 'href', url);

    prop('og:title', full);
    prop('og:description', description);
    prop('og:url', url);
    meta('twitter:title', full);
    meta('twitter:description', description);

    if (image) {
      const absolute = /^https?:/.test(image) ? image : `${ORIGIN}${image}`;
      prop('og:image', absolute);
      meta('twitter:image', absolute);
    }
  }, [title, description, image, pathname]);
}
