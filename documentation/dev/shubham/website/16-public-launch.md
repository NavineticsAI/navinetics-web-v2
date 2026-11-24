# Public launch runbook: navinetics.com

> **STATUS: IN PROGRESS**
>
> Not ready for deployment until the required host access and WordPress backup
> are confirmed. This runbook does not change DNS or replace the live site.

## Recommended route

**Replace the web root of the existing WordPress host with this static React
build.**

This is the best route because:

- `navinetics.com` already points to the existing Apache host.
- MX, SPF, DKIM, DMARC and GoDaddy DNS records stay unchanged.
- No DNS migration or GitHub custom-domain configuration is required.
- There is no WordPress hosting cost or DNS dependency to replace.
- GitHub remains the source/review system, while the production server remains
  the WordPress host.

GitHub Pages is a secondary option for a separate review or staging environment.
It is not the preferred public replacement route.

## Required before deployment

| Required item | Where to obtain it |
|---|---|
| cPanel or hosting-control-panel access | The WordPress hosting provider |
| FTP/SFTP or SSH access | Hosting provider or cPanel dashboard |
| Full WordPress backup | Hosting provider backup tool, plus WordPress Tools -> Export -> All content |
| Production web root | Usually `public_html` in cPanel or the SFTP root |
| Hosting and PHP support check | Confirm Apache supports `.htaccess` and `mod_rewrite` |
| Deploy approval | Named NaviNetics approver |
| Rollback owner | Named person who can restore the WordPress backup |
| Final review window | Date/time for cutover and verification |

## What is being replaced

The new site is a static build. It does not require PHP or WordPress.

At cutover:

1. Rename the current public web root to a dated backup directory.
2. Create a new empty production web root.
3. Upload the complete `dist/` build output.
4. Confirm `index.html`, `404.html`, `.htaccess`, `assets/`, `public/pdf/`,
   `sitemap.xml`, `robots.txt` and `CNAME` are not needed.
5. Test every route and old WordPress URL.
6. Keep the WordPress backup outside the public web root until final approval.

Do not upload the repository or `node_modules/`.

## Build and package

On the release branch:

```powershell
npm ci
npm run lint
npm run build
npm run check:build
npm run check:routes
```

The deploy package is the repository's `dist/` directory.

## Hosting locations

### Existing WordPress host

Log in to the host control panel or WordPress hosting account.

Look for:

- cPanel -> File Manager
- cPanel -> Domains -> Document Root
- cPanel -> FTP Accounts
- cPanel -> Backup -> Full Account Backup
- cPanel -> Terminal or SSH access

The common production document root is `public_html`.

The WordPress login remains:

- `https://navinetics.com/wp-admin/`

WordPress content should be backed up before the web root is replaced.

### GitHub

GitHub is the source and review system only for this route.

Do not configure a custom domain or DNS records in GitHub Pages for the
public navinetics.com launch unless the existing-host approach is cancelled.

### GoDaddy

No DNS change is expected.

Only check DNS if DNS verification fails after the host upload:

- `@` should continue to point to the existing WordPress host.
- `www` should continue to point to the same host or existing canonical target.
- MX and email verification records must remain unchanged.

## WordPress backup

Create both a server backup and WordPress export:

1. In WordPress: **Tools -> Export -> All content**
2. Download the exported XML file outside the host.
3. In cPanel or the hosting provider: create a full backup.
4. Record the current web root and database locations.

The full backup is for rollback; the WordPress XML export alone is not enough
to restore the server configuration.

## Upload procedure

The following names are examples. Use the exact document root shown by hosting.

1. Open cPanel File Manager or connect by SFTP.
2. Rename the current web root:
   - `public_html` -> `public_html_wordpress_backup_YYYY-MM-DD`
3. Create a new `public_html` directory.
4. Upload all `dist/` contents directly into `public_html`.
5. Confirm `.htaccess` is copied. Hidden files may be excluded by an FTP client.
6. Confirm `index.html` is the document root index.
7. Confirm `/pdf/` exists in `public_html`.

Do not copy only `dist/index.html`. The complete assets directory is required.

## Apache verification

The deployment includes `public/.htaccess`, which:

- redirects common old WordPress URLs
- routes unmatched paths to `index.html`
- caches static assets

Confirm Apache `mod_rewrite` is enabled. If it is not, enable it through the
hosting provider or server configuration before public cutover.

## HTTP and route verification

Test these after upload:

- `https://navinetics.com/`
- `https://navinetics.com/company/who-we-are`
- `https://navinetics.com/company/our-founders`
- `https://navinetics.com/products/d1-stereotactic-frame`
- `https://navinetics.com/products/maven-neuromodulation`
- `https://navinetics.com/resources/publications`
- `https://navinetics.com/contact`
- `https://navinetics.com/pdf/LABL3001-NaviNetics-Reusable-Stereotactic-System-Instructions-for-Use-rev-K.pdf`
- `https://navinetics.com/pdf/QUAL5034-NaviNetics-Financial-Conflict-of-Interest-Policy-rev-A.pdf`

Test refresh directly on deep routes. A 404 or WordPress page means the upload
or `.htaccess` is incomplete.

Test these old WordPress URLs:

- `/about-us/`
- `/who-we-are/`
- `/who-we-are/our-founders/`
- `/what-we-do/navinetics-frame-system/`
- `/what-we-do/neuromodulation/`
- `/careers/`
- `/resources/education/`
- `/resources/publications/`
- `/investment-opportunities/`

## Browser/device verification

Before release:

- Desktop Chrome, Edge and Safari
- Mobile iOS and Android
- Light and dark themes
- Direct route refresh
- Back/forward navigation
- Contact page
- PDF downloads
- Images and fonts
- FCOI section
- NRSS/neurosurgeon testimonials

## Rollback

Keep both backups until the replacement is stable.

To roll back:

1. Remove or rename the new `public_html`.
2. Rename `public_html_wordpress_backup_YYYY-MM-DD` back to `public_html`.
3. Confirm the WordPress database and uploaded files are intact.
4. Remove the static `.htaccess` by restoring the backup.
5. Test `https://navinetics.com/` and `https://navinetics.com/wp-admin/`.
6. Leave DNS unchanged.

## GitHub Pages fallback

GitHub Pages can remain available for internal review at:

`https://navineticsai.github.io/navinetics-web-v2/`

Use it only if NaviNetics decides to move hosting away from the existing
WordPress server in the future. It requires DNS changes and GitHub Pages
configuration and is not recommended for this cutover.
