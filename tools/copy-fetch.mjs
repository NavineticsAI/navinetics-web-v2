/**
 * Fetch the review document straight out of OneDrive.
 *
 *   node tools/copy-fetch.mjs                       # writes copy/incoming/review.docx
 *   node tools/copy-fetch.mjs --out some/path.docx
 *
 * WHY THIS AND NOT POWER AUTOMATE. Calling an outside URL from Power Automate
 * needs the HTTP action, which is a Premium licence — about £15 a month for the
 * flow's owner, forever, to move one file. This does the same job from a
 * scheduled GitHub Action for nothing, and nothing about how the reviewers work
 * changes: the same Word document, in the same OneDrive folder, edited the same
 * way. They never learn this exists.
 *
 * WHAT IT NEEDS, once, from whoever administers Microsoft 365:
 *
 *   An app registration in Entra ID (Azure AD) with the APPLICATION permission
 *   Files.Read.All, granted admin consent. Application, not delegated: there is
 *   no signed-in user at 6am. Read, not write — this only ever downloads.
 *
 * and then four repository secrets:
 *
 *   AZURE_TENANT_ID      the directory (tenant) ID
 *   AZURE_CLIENT_ID      the application (client) ID
 *   AZURE_CLIENT_SECRET  a client secret from that app
 *   REVIEW_DRIVE_USER    whose OneDrive the folder lives in, e.g. an email
 *
 * It reads and never writes, so the worst a leaked secret does is let somebody
 * read that one document — which is the wording of a public website.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const arg = (name, dflt) => {
  const i = process.argv.indexOf(name);
  return i > -1 ? process.argv[i + 1] : dflt;
};

const OUT = arg('--out', 'copy/incoming/review.docx');
const FOLDER = arg('--folder', process.env.REVIEW_FOLDER || 'Website Review');
const {
  AZURE_TENANT_ID: TENANT,
  AZURE_CLIENT_ID: CLIENT,
  AZURE_CLIENT_SECRET: SECRET,
  REVIEW_DRIVE_USER: USER,
} = process.env;

const missing = Object.entries({ AZURE_TENANT_ID: TENANT, AZURE_CLIENT_ID: CLIENT, AZURE_CLIENT_SECRET: SECRET, REVIEW_DRIVE_USER: USER })
  .filter(([, v]) => !v).map(([k]) => k);
if (missing.length) {
  console.error(`\n  Missing: ${missing.join(', ')}`);
  console.error('  See the comment at the top of this file for what to set up.\n');
  process.exit(1);
}

const die = async (what, res) => {
  const body = await res.text().catch(() => '');
  console.error(`\n  ${what} failed: ${res.status} ${res.statusText}`);
  // Never print the response wholesale — a token request echoes back enough to
  // be worth not putting in a public log.
  console.error(`  ${body.slice(0, 300).replace(/[A-Za-z0-9_-]{40,}/g, '<redacted>')}\n`);
  process.exit(1);
};

// ── a token for the app itself, not for a person ────────────────────────────
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

// ── find the document ───────────────────────────────────────────────────────
// By listing the folder rather than by name: the filename carries its date, so
// naming it here would mean editing this file every time a round goes out.
const base = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(USER)}/drive/root:/${encodeURIComponent(FOLDER)}`;
const listRes = await fetch(`${base}:/children`, { headers: auth });
if (!listRes.ok) await die(`Reading the "${FOLDER}" folder`, listRes);
const { value: items = [] } = await listRes.json();

const docs = items.filter((f) => f.name.toLowerCase().endsWith('.docx')
  // Word leaves a ~$<name> lock file beside an open document. It is 162 bytes
  // of nothing and it is not a document.
  && !f.name.startsWith('~$'));

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
const getRes = await fetch(`${base}/${encodeURIComponent(doc.name)}:/content`, { headers: auth });
if (!getRes.ok) await die(`Downloading ${doc.name}`, getRes);

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, Buffer.from(await getRes.arrayBuffer()));

console.log(`\n  ${doc.name}`);
console.log(`  last saved ${doc.lastModifiedDateTime} by ${doc.lastModifiedBy?.user?.displayName || 'someone'}`);
console.log(`  -> ${OUT}\n`);
