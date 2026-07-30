import { useEffect } from 'react';

const SUFFIX = 'NaviNetics';

function upsertMeta(name, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * Per-route document title and description. Previously every page shared one
 * generic tag, which is bad for search, sharing, and browser history.
 */
export function usePageMeta({ title, description } = {}) {
  useEffect(() => {
    document.title = title ? `${title} — ${SUFFIX}` : SUFFIX;
    upsertMeta('description', description);
  }, [title, description]);
}
