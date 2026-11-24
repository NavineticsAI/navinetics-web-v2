# Public launch runbook: navinetics.com

> **STATUS: IN PROGRESS**
>
> Not ready for review or deployment until every item in **Required from
> NaviNetics** is complete. This runbook does not change DNS or deploy the
> website.

## Required from NaviNetics

| # | Required item | What to provide or confirm |
|---|---|---|
| 1 | GoDaddy DNS access | A person who can sign in and edit DNS for `navinetics.com` |
| 2 | Current DNS export | Screenshot/export of `@`, `www`, MX, TXT, SPF, DKIM, DMARC, CAA and verification records |
| 3 | Web DNS records | Confirm the current web A/CNAME records and which one serves `@` and `www` |
| 4 | Nameservers | Confirm nameservers or provide the nameserver values shown in GoDaddy |
| 5 | WordPress full backup | Hosting-provider backup plus the WordPress **All content** export |
| 6 | WordPress admin access | Admin login or person who can sign in at `https://navinetics.com/wp-admin/` |
| 7 | GitHub access | Repository administration plus permission to configure Pages and merge the launch branch |
| 8 | Cutover approval | Agreed date/time and a named rollback owner |
| 9 | Public behavior | Confirm `navinetics.com` and `www.navinetics.com` both serve the new site |
| 10 | WordPress disposition | Decide: keep as parked backup or close/retire after verification |

Do not proceed until all ten rows are complete.

## Known current setup

- WordPress site: `https://navinetics.com`
- Current apex A record: `104.245.201.220`
- Current nameserver names: `ns51.domaincontrol.com` and
  `ns52.domaincontrol.com`
- DNS is managed in GoDaddy, not the WordPress dashboard.
- Existing email DNS, if any, must not be removed or changed.

## Repository status

Complete:

- Deployment uses `/` as the production base path.
- Canonical, Open Graph, robots and sitemap values use `navinetics.com`.
- `public/CNAME` contains `navinetics.com`.
- Existing WordPress routes are mapped to replacement routes.
- Production build, route tests, build checks and lint have passed.

Not complete:

- DNS update
- GitHub custom-domain setting
- HTTPS enforcement
- Public cutover
- Public verification

## Access locations

### WordPress

Open `https://navinetics.com/wp-admin/`.

Required for:

- confirming WordPress administrator access
- exporting content
- making any WordPress-side decision

WordPress is **not** where the DNS cutover is made.

### GoDaddy

1. Sign in to GoDaddy.
2. Open **My Products**.
3. Open **Domains**.
4. Select `navinetics.com`.
5. Open **DNS** or **Manage DNS**.
6. Use the **Records** section.

Do not change nameservers.

### GitHub

1. Open `NavineticsAI/navinetics-web-v2`.
2. Open **Settings**.
3. Open **Pages**.
4. Set the custom domain and HTTPS after DNS is prepared.

## Backups

Before the cutover:

1. In WordPress, open **Tools -> Export**.
2. Export **All content**.
3. Download the export outside WordPress.
4. Use the hosting backup tool to make or confirm a full site/database/media
   backup.
5. In GoDaddy, export or screenshot every current DNS record.
6. Record the original `@`, `www`, MX, TXT, SPF, DKIM, DMARC and CAA values.

## DNS values

Replace only the records that point `@` or `www` to the WordPress web server.
Keep all email and verification records.

Add four `@` A records:

```text
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

Set `www`:

```text
Type: CNAME
Name: www
Value: navineticsai.github.io
TTL: 600 or lower during cutover
```

Do not set `www.navinetics.com` as the CNAME value.

Optional IPv6 `@` values:

```text
2606:50c0:8000::153
2606:50c0:8000::154
2606:50c0:8000::155
2606:50c0:8000::156
```

## Cutover order

1. Merge `public-launch-configuration` into `main`.
2. Confirm the `Deploy website to GitHub Pages` workflow succeeds.
3. In GitHub Pages, enter `navinetics.com` as the custom domain.
4. In GoDaddy, add the four apex A records.
5. In GoDaddy, replace `www` with the GitHub Pages CNAME.
6. Remove only the old WordPress web A record that points `@` to
   `104.245.201.220`.
7. Wait for DNS propagation.
8. Wait for GitHub's DNS check to pass.
9. Enable **Enforce HTTPS**.
10. Run the verification checklist below.

Do not enable HTTPS or remove the WordPress backup until DNS verification
passes.

## Verify DNS

Run:

```powershell
Resolve-DnsName navinetics.com -Type A
Resolve-DnsName www.navinetics.com -Type CNAME
```

Expected:

- Apex: all four GitHub Pages A addresses
- `www`: `navineticsai.github.io`

## Verify public routes

The following must return HTTP 200 with valid HTTPS:

- `https://navinetics.com/`
- `https://navinetics.com/company/who-we-are`
- `https://navinetics.com/company/our-founders`
- `https://navinetics.com/products/d1-stereotactic-frame`
- `https://navinetics.com/products/maven-neuromodulation`
- `https://navinetics.com/resources/publications`
- `https://navinetics.com/contact`
- `https://navinetics.com/pdf/LABL3001-NaviNetics-Reusable-Stereotactic-System-Instructions-for-Use-rev-K.pdf`
- `https://navinetics.com/pdf/QUAL5034-NaviNetics-Financial-Conflict-of-Interest-Policy-rev-A.pdf`

These old WordPress URLs must redirect to the replacement site:

- `/who-we-are/`
- `/who-we-are/our-founders/`
- `/what-we-do/navinetics-frame-system/`
- `/what-we-do/neuromodulation/`
- `/careers/`
- `/resources/education/`
- `/resources/publications/`
- `/investment-opportunities/`

## Final acceptance

Before release:

- Email MX records are unchanged.
- `http://navinetics.com` redirects to HTTPS.
- `http://www.navinetics.com` redirects to HTTPS.
- The HTTPS certificate is valid.
- FCOI and LABL 3001 PDFs open.
- Careers, publications and contact routes work.
- Canonical URLs and assets use `navinetics.com`, not the GitHub review subpath.
- The WordPress disposition is confirmed.

## Rollback

Keep backups and DNS exports until final verification is stable.

1. Restore the previous WordPress `@` A record.
2. Restore the previous `www` record.
3. Remove the GitHub Pages A/CNAME records.
4. Restore the original DNS TTL values.
5. Remove the GitHub custom domain if needed.
