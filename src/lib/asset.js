/**
 * Resolve a file that lives in public/ against the deployed base path.
 *
 * Anything under public/ is copied verbatim and is NOT rewritten by Vite, so a
 * literal like '/DSC05397-1024x695.jpg' asks the browser for that file at the
 * server root. Under the sub-path deploy (see vite.config.js) the root is not
 * where the file is, and every one of these came back 404: the founder
 * portraits, the D1 photography, the whole media library, and — because
 * data/technology.js feeds `hero` into the mega-panel — two thumbnails in the
 * global navigation on every page.
 *
 * Files imported from src/assets/ do not need this; Vite already hashes and
 * base-prefixes those. The guard below makes the helper safe to apply to a
 * field that may hold either kind, so callers do not have to know which.
 */
const BASE = import.meta.env.BASE_URL;

export function asset(path) {
  if (!path) return path;
  // Already resolved (an import, an absolute URL, or a data URI).
  if (/^(https?:|data:|blob:)/.test(path)) return path;
  if (BASE !== '/' && path.startsWith(BASE)) return path;
  return `${BASE}${String(path).replace(/^\//, '')}`;
}
