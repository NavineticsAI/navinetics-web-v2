# Public launch runbook: navinetics.com

> **STATUS: READY, WAITING ON HOST ACCESS**
>
> The site, the build and the Apache rules are ready. Cutover waits on the
> items in "Needed from NaviNetics" below (asked of Carol Davis, 25 Nov 2026).
> This runbook does not change DNS.

## Route

**Replace the WordPress files in the web root of the existing host with the
static build.**

- `navinetics.com` already points at that host (Apache, `server.suiportal.com`,
  ARIN: Gotekky). DNS is at GoDaddy and does not change.
- Email does not change: MX, SPF, DKIM and DMARC are DNS records, not files in
  the web root.
- GitHub stays the source and the review site
  (`https://navineticsai.github.io/navinetics-web-v2/`). Merging to `main`
  updates only the review site; navinetics.com changes only when someone
  uploads a `build:live` build.

## Needed from NaviNetics

| Item | Why |
|---|---|
| Who hosts the site, and a contact there | Access, and help if the host blocks a step |
| Hosting login (cPanel or similar) | File Manager, backups, document root |
| FTP/SFTP login, if cPanel has no File Manager | Upload |
| WordPress admin login | Content export before cutover |
| Named approver | Gives the go-ahead after the checks below |
| Cutover date and time | Pick a quiet hour; allow 1 hour plus checks |
| GoDaddy login holder | Only needed if DNS turns out to be wrong |

## Two builds

| Command | Base | For |
|---|---|---|
| `npm run build` | `/navinetics-web-v2/` | GitHub Pages review site. CI and the copy-review run use this. |
| `npm run build:live` | `/` | navinetics.com. The only build to upload. |

Do **not** upload an `npm run build` output to navinetics.com: every page
would be blank, because its files are addressed under `/navinetics-web-v2/`.

## Build and check (on the day)

From an up-to-date `main`:

```powershell
npm ci
npm run lint
npm run build:live
npm run check:build:live
npm run preview:live        # leave running, second terminal:
npm run check:routes
```

`check:build:live` confirms the build is addressed from `/`, every absolute
URL in `index.html` is `https://navinetics.com/`, and `.htaccess` is in
`dist/`. `check:routes` loads every page of the preview in Chrome.

The upload is the **contents** of `dist/`. These must all be there:
`index.html`, `404.html`, `.htaccess`, `assets/`, `fonts/`, `pdf/`,
`robots.txt`, `sitemap.xml`, `favicon.svg`, `icons.svg` and the images at the
top level. `.nojekyll` is for GitHub Pages and is harmless. There is no
`CNAME`, and none is needed.

Never upload the repository or `node_modules/`.

## Before cutover

1. **Find the document root.** cPanel → Domains: the folder for
   `navinetics.com`, usually `public_html`.
2. **Look inside it first.** Folders for other domains or subdomains
   (cPanel "addon domains") can live inside `public_html`. Leave those
   folders where they are; move only the WordPress files.
3. **Back up.**
   - cPanel → Backup → **Full Account Backup**, downloaded to a NaviNetics
     machine.
   - WordPress → Tools → Export → **All content**, downloaded too.
   - The full backup is what a rollback uses; the export alone cannot restore
     the site.
4. **Turn on "Show Hidden Files"** in File Manager settings, so `.htaccess` is
   visible.

## Cutover

1. In the home folder (one level **above** `public_html`), create
   `wordpress_backup_YYYY-MM-DD`.
2. Move every WordPress file and folder from `public_html` into it, including
   `.htaccess`. Leave any addon-domain folders, `cgi-bin` and `.well-known`.
3. Upload the contents of `dist/` into `public_html`. Upload the zip and
   extract it in File Manager if the FTP client skips hidden files; confirm
   `.htaccess` arrived.
4. Copy `wp-content/uploads/` from the backup folder to
   `public_html/wp-content/uploads/`. Old links to the 17 publication PDFs
   keep working that way, and the `.htaccess` stops any PHP in it from
   running.
5. Run the checks below. Any failure you cannot fix in 15 minutes: roll back.

## Checks on the live site

**Addresses** (each must end at `https://navinetics.com/…` with one 301):

- `http://navinetics.com/`
- `http://www.navinetics.com/`
- `https://www.navinetics.com/`

**Pages** (open each, then refresh it; each must show the page, not a blank
screen or "Page not found"):

- `/`
- `/company/who-we-are`
- `/company/our-founders`
- `/company/community`
- `/products/d1-stereotactic-frame`
- `/products/maven-neuromodulation`
- `/technology/education`
- `/resources/publications`
- `/contact`

**PDFs:**

- `/pdf/LABL3001-NaviNetics-Reusable-Stereotactic-System-Instructions-for-Use-rev-K.pdf`
- `/pdf/QUAL5034-NaviNetics-Financial-Conflict-of-Interest-Policy-rev-A.pdf`
- `/wp-content/uploads/2020-Rusheen_D1_JNE_2020.pdf` (old link, should open)

**Old WordPress URLs** (each must redirect to its new page):

| Old | New |
|---|---|
| `/about-us/`, `/who-we-are/` | `/company/who-we-are` |
| `/who-we-are/our-founders/` | `/company/our-founders` |
| `/who-we-are/community/` | `/company/community` |
| `/what-we-do/`, `/what-we-do/navinetics-frame-system/` | `/products/d1-stereotactic-frame` |
| `/system_category/reusable/`, `/system_category/single-use/` | `/products/d1-stereotactic-frame` |
| `/what-we-do/neuromodulation/` | `/products/maven-neuromodulation` |
| `/careers/` | `/resources/careers` |
| `/resources/`, `/category/publications/` | `/resources/publications` |
| `/resources/education/` | `/technology/education` |
| `/investment-opportunities/` | `/contact` |
| `/search/`, `/author/support_unlimited/` | `/` |
| `/contact/`, `/resources/publications/` | the same page without the `/` |

A quick way, from any terminal:

```bash
for u in / /about-us/ /who-we-are/our-founders/ /what-we-do/ /careers/ /resources/ /contact/; do
  curl -s -o /dev/null -w "%{http_code} $u -> %{redirect_url}\n" "https://navinetics.com$u"
done
```

**Browsers:** Chrome, Edge and Safari on a laptop; an iPhone and an Android
phone. Check light and dark themes, back/forward, the contact form, PDFs,
images, fonts, the NRSS video, the FCOI section and the neurosurgeon
testimonials.

**If a page is blank or every deep link says "Page not found":** the
`.htaccess` did not arrive, or the host has `mod_rewrite` off. Upload it
again, or ask the host to enable `mod_rewrite` for the account.

**If the whole site answers "500 Internal Server Error":** the host forbids
a directive in `.htaccess`. Delete the `<IfModule mod_expires.c>` and
`<IfModule mod_filter.c>` blocks and reload; if it persists, roll back and
send the host the file.

## Rollback

1. Move everything in `public_html` (except addon-domain folders) into a
   folder named `static_failed_YYYY-MM-DD` in the home folder.
2. Move the contents of `wordpress_backup_YYYY-MM-DD` back into
   `public_html`.
3. Open `https://navinetics.com/` and `https://navinetics.com/wp-admin/`.
4. If WordPress is broken, restore the Full Account Backup from cPanel.
5. DNS stays as it is throughout.

Keep the backup folder and the downloaded backups until the approver signs
off, and for at least 30 days after.

## Later releases

Build with `npm run build:live`, run the checks, then replace everything in
`public_html` except `wp-content/` and any addon-domain folders. Built file
names change on every release, so old `assets/` files can be deleted.
