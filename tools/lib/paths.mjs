/**
 * Turning `import.meta.url` into a path, correctly on every platform.
 *
 * Every tool in here used to open with:
 *
 *     const ROOT = new URL('../', import.meta.url).pathname.replace(/^\//, '');
 *
 * which is wrong everywhere except Windows, and silently so. `.pathname` on a
 * file: URL is always `/`-prefixed. On Windows that gives `/C:/repo/` and
 * stripping the slash leaves the correct absolute `C:/repo/`; the drive letter
 * absorbs the mistake. On Linux and macOS it gives `/home/runner/repo/` and
 * stripping the slash leaves `home/runner/repo/` — a RELATIVE path, which then
 * resolves against the working directory and points at nothing.
 *
 * It survived because it was written on Windows and copied into two dozen
 * files, and because the tools that use it are mostly local. CI found it the
 * moment a check ran on ubuntu-latest.
 *
 * `.pathname` is also percent-encoded, so a repository checked out under a
 * path containing a space would break on Windows too. fileURLToPath decodes.
 */
import { fileURLToPath, pathToFileURL } from 'node:url';

/**
 * Absolute filesystem path for `relative` resolved against a module's URL.
 *
 * Separators are normalised to `/`. Node's fs accepts either on Windows, and
 * it keeps `${DIR}name.png` concatenation — which every one of these tools
 * does — reading the same on both platforms.
 */
export const dir = (relative, base) => fileURLToPath(new URL(relative, base)).replace(/\\/g, '/');

/**
 * A `file:` URL for a path, for handing to Chrome.
 *
 * Not `'file:///' + path`: on Linux the path already starts with `/`, so that
 * produces `file:////home/...` with four slashes. pathToFileURL also escapes
 * spaces and other characters that would otherwise truncate the URL.
 */
export const fileUrl = (p) => pathToFileURL(p).href;
