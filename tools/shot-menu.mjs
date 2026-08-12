/**
 * Screenshot a mega-menu panel, open.
 *
 *   node tools/shot-menu.mjs Technology
 *   node tools/shot-menu.mjs Products
 *
 * The panels only exist while a nav item is hovered or focused, so a plain
 * page screenshot can never show one. This focuses the trigger, waits for the
 * panel to settle, and captures the top of the page.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { webkit } from 'playwright';

const WHICH = process.argv[2] || 'Technology';
const BASE = (process.argv[3] || 'http://localhost:4319') + '/navinetics-web-v2';
const DIR = new URL('./.shots/', import.meta.url).pathname.replace(/^\//, '');
mkdirSync(DIR, { recursive: true });

const browser = await webkit.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 760 } });
await page.goto(`${BASE}/`, { waitUntil: 'load' });
await page.waitForTimeout(2500);

const link = page.locator(`nav a:has-text("${WHICH}")`).first();
await link.hover();
await page.waitForTimeout(900);

writeFileSync(`${DIR}menu-${WHICH.toLowerCase()}.jpg`,
  await page.screenshot({ type: 'jpeg', quality: 90, clip: { x: 0, y: 0, width: 1440, height: 520 } }));
console.log(`tools/.shots/menu-${WHICH.toLowerCase()}.jpg`);

await browser.close();
process.exit(0);
