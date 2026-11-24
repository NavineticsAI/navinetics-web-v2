# Publishing the replacement site to navinetics.com

> **STATUS: IN PROGRESS - NOT READY FOR REVIEW OR DEPLOYMENT**
>
> This is a launch-plan branch. The repository configuration is prepared, but
> the public cutover must not proceed until the required WordPress, DNS and
> GoDaddy setup details below are confirmed.

## Required from NaviNetics before cutover

Do not mark this branch ready until all of these are known:

1. **WordPress backup confirmed**
   - A full backup/export exists and was downloaded or stored outside
     WordPress.
2. **GoDaddy DNS access confirmed**
   - A named person can sign in to the account that controls
     `navinetics.com`.
3. **Complete current DNS records recorded**
   - A screenshot/export of the GoDaddy `@`, `www`, MX, TXT, SPF, DKIM,
     DMARC, CAA and verification records is available.
4. **Web hosting record confirmed**
   - The current `@` A record and `www` record are identified before they are
     replaced.
5. **Nameservers confirmed**
   - The nameservers remain `ns51.domaincontrol.com` and
     `ns52.domaincontrol.com`, or the actual production nameservers are
     provided.
6. **GitHub Pages access confirmed**
   - Someone with repository administration can set the custom domain,
     configure HTTPS and approve the deployment.
7. **Cutover window approved**
   - A date/time, rollback owner and expected downtime/propagation window
     are agreed.
8. **Final public behavior confirmed**
   - The team confirms that `navinetics.com` and `www.navinetics.com` must
     both serve the replacement site.
9. **WordPress disposition confirmed**
   - Decide whether WordPress remains parked as a backup or is closed after
     successful verification.

This replaces the WordPress/public pages at `navinetics.com` with the new React
site. It is a DNS cutover. It does not publish the replacement branch or change
WordPress content on its own.

## Current status

**Complete in the repository**

- Root deployment path is `/`.
- Canonicals and sitemap use `https://navinetics.com`.
- `public/CNAME` contains `navinetics.com`.
- Old WordPress routes redirect to the replacement routes.
- Production build, route test, build check and lint have been run.

**Not complete**

- DNS has not been changed.
- GitHub Pages has not been configured with the final custom domain.
- HTTPS must be enabled after DNS verifies.
- The public WordPress site is still live.

## What access is required

The person doing the cutover needs:

- GoDaddy account access for `navinetics.com`.
- Permission to merge and deploy in the GitHub repository.
- A WordPress full backup. This is optional for DNS safety but strongly
  recommended before the public WordPress site is replaced.

The required DNS work is in GoDaddy, not in the WordPress dashboard.

## Step 1: Back up WordPress

Log in at `https://navinetics.com/wp-admin/`.

1. Open **Tools**.
2. Open **Export**.
3. Export **All content**.
4. Save the exported file outside WordPress.

Before DNS changes, also record or export WordPress media/uploads, database and
configuration if the current hosting provider provides backup tools. The
exported content alone is not a full server backup.

## Step 2: Back up DNS

Log in to GoDaddy.

1. Open **My Products**.
2. Find **navinetics.com** under **Domains**.
3. Open **DNS** or **Manage DNS**.
4. Open the **Records** table.
5. Export or take screenshots of every current record.

Do not change nameservers.

Keep every MX, TXT, SPF, DKIM, DMARC, CAA and domain-verification record.
Only replace records that send web traffic to `104.245.201.220`.

## Step 3: Merge and deploy the code

Merge `public-launch-configuration` into `main`.

After merge, GitHub Actions must show:

- `Deploy website to GitHub Pages`: completed successfully.

Do not continue until the GitHub Pages deployment succeeds.

## Step 4: Configure GitHub Pages

In GitHub:

1. Open `NavineticsAI/navinetics-web-v2`.
2. Open **Settings**.
3. Open **Pages**.
4. Set **Custom domain** to `navinetics.com`.
5. Save.
6. Wait for the DNS check.
7. Enable **Enforce HTTPS** after the check passes.

The `public/CNAME` file in the deployed branch also declares
`navinetics.com`.

## Step 5: Change GoDaddy DNS

In GoDaddy **My Products -> Domains -> navinetics.com -> DNS -> Records**:

1. Add or edit the `@` A record.
2. Replace the old WordPress web A record for `@`.
3. Create four `@` A records with these values:

```text
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

4. For `www`, remove the existing web A/CNAME record and add:

```text
Type: CNAME
Name: www
Value: navineticsai.github.io
```

Do not use `www.navinetics.com` as the CNAME value.

Optional IPv6 records are:

```text
2606:50c0:8000::153
2606:50c0:8000::154
2606:50c0:8000::155
2606:50c0:8000::156
```

Set A/CNAME TTL to 600 seconds or lower during cutover. Restore a normal TTL
after the site is stable.

## Step 6: Wait for DNS

On a person’s machine, run:

```powershell
Resolve-DnsName navinetics.com -Type A
Resolve-DnsName www.navinetics.com -Type CNAME
```

The `A` results must include the four GitHub addresses. The `www` result must
point to `navineticsai.github.io`.

Wait until GoDaddy and GitHub both show the new DNS values. Propagation may take
time.

## Step 7: Verify before public release

Open these URLs and confirm HTTP 200 plus valid HTTPS:

- `https://navinetics.com/`
- `https://navinetics.com/company/who-we-are`
- `https://navinetics.com/company/our-founders`
- `https://navinetics.com/products/d1-stereotactic-frame`
- `https://navinetics.com/products/maven-neuromodulation`
- `https://navinetics.com/resources/publications`
- `https://navinetics.com/contact`
- `https://navinetics.com/pdf/LABL3001-NaviNetics-Reusable-Stereotactic-System-Instructions-for-Use-rev-K.pdf`
- `https://navinetics.com/pdf/QUAL5034-NaviNetics-Financial-Conflict-of-Interest-Policy-rev-A.pdf`

Test old WordPress URLs:

- `/who-we-are/`
- `/who-we-are/our-founders/`
- `/what-we-do/navinetics-frame-system/`
- `/what-we-do/neuromodulation/`
- `/careers/`
- `/resources/education/`
- `/resources/publications/`
- `/investment-opportunities/`

Each old route should open the replacement page rather than WordPress.

## Step 8: Final confirmation

Confirm:

- `http://navinetics.com` redirects to `https://navinetics.com`.
- `http://www.navinetics.com` redirects to `https://navinetics.com`.
- The HTTPS certificate is valid.
- Email MX records are unchanged.
- The FCOI policy and LABL 3001 PDF open.
- Search, publications, careers and contact routes work.
- No assets or canonical URLs point to `navineticsai.github.io/navinetics-web-v2`.

## Rollback

Keep the WordPress backup and DNS export until final release is verified.

To roll back:

1. Restore the WordPress `@` A record.
2. Restore the previous `www` record.
3. Remove the GitHub Pages A/CNAME records.
4. Restore original DNS TTL values.
5. Remove the custom domain in GitHub Pages if necessary.

