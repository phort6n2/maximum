#!/usr/bin/env node
/**
 * Migration safety net: compare the URLs a client's ads and old site already
 * use against what this build actually serves, and report what would 404.
 *
 * The rule for anything an ad points at is EXACT PARITY: the new site must serve
 * the same path the old site served. Not a redirect to it — the same path.
 *
 *   - A final URL that 404s gets the ad disapproved for "Destination not
 *     working", usually within hours and with no warning first.
 *   - A final URL that redirects off-domain is a policy violation outright
 *     (destination mismatch).
 *   - Even a same-domain redirect adds a hop the crawler follows before it
 *     evaluates landing page experience, for no benefit.
 *
 * So a redirect is treated as a FAILURE by default here. Redirects still have a
 * place for legacy organic URLs, Google Business Profile links, printed
 * material — things no ad depends on. Check those with --allow-redirects.
 *
 * The authoritative URL list is the Ads account, not the old site: a final URL
 * can be referenced by an ad without being linked anywhere crawlable. Export
 * final URLs at keyword, ad AND sitelink level and feed them in with --file.
 *
 *   node landing/check-urls.cjs --file ads-final-urls.txt        # strict parity
 *   node landing/check-urls.cjs --sitemap https://old.example.com/sitemap.xml
 *   node landing/check-urls.cjs --file legacy.txt --allow-redirects
 *
 * Exits non-zero if any input URL would 404 or would only resolve via a
 * redirect, so it can gate a cutover.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');

const cfg = require(path.join(__dirname, 'pages.config.cjs'));
const OUTDIR = process.env.OUTDIR
  ? path.resolve(process.env.OUTDIR)
  : path.join(__dirname, '..', 'quote-site');

const args = process.argv.slice(2);
const argVal = (flag) => {
  const i = args.indexOf(flag);
  return i === -1 ? null : args[i + 1];
};

function normPath(u) {
  let s = String(u || '').trim();
  if (!s) return '';
  s = s.replace(/^https?:\/\/[^/]+/i, '');
  s = s.split('#')[0].split('?')[0];
  if (!s.startsWith('/')) s = '/' + s;
  if (s.length > 1) s = s.replace(/\/+$/, '');
  return s;
}

/* ------------------------------------------------------- what this build serves */

function builtSlugs() {
  const out = new Set();
  if (!fs.existsSync(OUTDIR)) {
    console.error('No build found at ' + OUTDIR + ' — run `npm run build:landing` first.');
    process.exit(2);
  }
  (function walk(dir, prefix) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory()) {
        if (e.name === 'img') continue;
        walk(path.join(dir, e.name), prefix + '/' + e.name);
      } else if (e.name === 'index.html') {
        out.add(prefix === '' ? '/' : prefix);
      }
    }
  })(OUTDIR, '');
  return out;
}

const migration = cfg.migration || { preserve: [], redirects: [] };
const redirectMap = new Map(
  (migration.redirects || []).map((r) => [normPath(r.from), normPath(r.to)])
);

/* ------------------------------------------------------------------- inputs */

function readFileUrls(file) {
  return fs
    .readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'))
    /* Tolerate a pasted Ads export: take the first column that looks like a URL. */
    .map((l) => {
      const m = l.match(/https?:\/\/\S+/);
      return m ? m[0] : l.split(/[\t,]/)[0];
    });
}

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': 'landing-migration-check' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return resolve(fetchText(new URL(res.headers.location, url).href));
        }
        if (res.statusCode !== 200) return reject(new Error('HTTP ' + res.statusCode));
        let b = '';
        res.on('data', (d) => (b += d));
        res.on('end', () => resolve(b));
      })
      .on('error', reject);
  });
}

/* ---------------------------------------------------------------------- run */

(async () => {
  const urls = [];
  const file = argVal('--file');
  const sitemap = argVal('--sitemap');

  if (file) urls.push(...readFileUrls(file));
  if (sitemap) {
    try {
      const xml = await fetchText(sitemap);
      urls.push(...[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
    } catch (e) {
      console.error('Could not read sitemap ' + sitemap + ': ' + e.message);
      process.exit(2);
    }
  }
  if (!urls.length) {
    console.error('Nothing to check. Pass --file <path> and/or --sitemap <url>.');
    console.error('Export final URLs from Google Ads at keyword, ad and sitelink level.');
    process.exit(2);
  }

  const allowRedirects = args.includes('--allow-redirects');
  const slugs = builtSlugs();
  const seen = new Set();
  const served = [];
  const redirected = [];
  const broken = [];

  for (const raw of urls) {
    const p = normPath(raw);
    if (!p || seen.has(p)) continue;
    seen.add(p);
    if (slugs.has(p)) served.push(p);
    else if (redirectMap.has(p)) {
      const to = redirectMap.get(p);
      if (!slugs.has(to)) broken.push(p + '  (redirect points at ' + to + ', which does not exist)');
      else redirected.push(p + '  ->  ' + to);
    } else broken.push(p);
  }

  const say = (label, rows) => {
    if (!rows.length) return;
    console.log('\n' + label + ' (' + rows.length + ')');
    rows.forEach((r) => console.log('  ' + r));
  };

  say('EXACT — same path on both sites', served);
  say(
    allowRedirects
      ? 'REDIRECTED — 301 configured, accepted (--allow-redirects)'
      : 'REDIRECT ONLY — not good enough for an ad final URL, build the page at this path',
    redirected
  );
  say('WOULD 404 — fix before cutover', broken);

  /* Slugs declared as must-keep but missing from the build. */
  const missingPreserved = (migration.preserve || [])
    .map(normPath)
    .filter((p) => !slugs.has(p));
  say('DECLARED IN migration.preserve BUT NOT BUILT', missingPreserved);

  /* Strict by default: a redirect is a fail for anything an ad points at. */
  const bad = broken.length + missingPreserved.length + (allowRedirects ? 0 : redirected.length);
  console.log(
    '\n' +
      (bad ? 'FAILED' : 'PASSED') +
      ' — ' +
      seen.size +
      ' URL(s) checked, ' +
      served.length +
      ' exact, ' +
      redirected.length +
      ' redirect-only, ' +
      broken.length +
      ' missing\n'
  );
  if (broken.length) {
    console.log('Missing: build a page at that exact slug. Set the slug in');
    console.log('pages.config.cjs to match the old URL — do not rename and redirect.\n');
  }
  if (redirected.length && !allowRedirects) {
    console.log('Redirect-only: a redirect is fine for an organic or printed link, but not');
    console.log('for an ad final URL — off-domain redirects are a policy violation and');
    console.log('same-domain ones add a crawler hop before landing page experience is');
    console.log('scored. Rename the page to the old slug instead. If none of these URLs');
    console.log('are referenced by an ad, re-run with --allow-redirects.\n');
  }
  process.exit(bad ? 1 : 0);
})();
