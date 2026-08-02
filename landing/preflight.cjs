#!/usr/bin/env node
/**
 * Refuses to let a client site build or deploy while it still carries template
 * placeholders or another client's live values.
 *
 * The failure this exists to prevent is quiet and expensive: a copied repo
 * deploys with the previous client's phone number, GHL webhook or Ads
 * conversion ID, and their leads land in someone else's CRM. Nothing about the
 * page looks wrong, so it is found by a client asking where their leads went.
 *
 * Run by `npm run verify`, so it gates every build.
 *
 *   node landing/preflight.cjs
 */
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const cfg = require(path.join(__dirname, 'pages.config.cjs'));
const site = cfg.site;

let failures = 0;
const fail = (m) => { console.log('  FAIL  ' + m); failures++; };
const ok = (m) => console.log('  ok    ' + m);

/* Every value a copied repo must change. `test` returns true when the value is
   still unset, still a placeholder, or obviously not this client's. */
const REQUIRED = [
  ['site.domain',            site.domain],
  ['site.legalName',         site.legalName],
  ['site.brandShort',        site.brandShort],
  ['site.email',             site.email],
  ['site.phoneFormatted',    site.phoneFormatted],
  ['site.phoneE164',         site.phoneE164],
  ['site.callAsset.e164',    site.callAsset && site.callAsset.e164],
  ['site.address.street',    site.address && site.address.street],
  ['site.address.city',      site.address && site.address.city],
  ['site.address.zip',       site.address && site.address.zip],
  ['site.ghl.webhook',       site.ghl && site.ghl.webhook],
  ['site.ghl.locationId',    site.ghl && site.ghl.locationId],
  ['site.ads.conversionId',  site.ads && site.ads.conversionId],
  ['site.ads.conversionLabel', site.ads && site.ads.conversionLabel]
];

const PLACEHOLDER = /REPLACE__|TODO|CHANGEME|XXXX|your-domain|example\.com/i;

for (const [name, value] of REQUIRED) {
  if (!value) fail(name + ' is empty');
  else if (PLACEHOLDER.test(String(value))) fail(name + ' is still a placeholder: ' + value);
}

/* Shape checks — a malformed value fails silently at runtime rather than loudly
   at build time, which is the worst combination. */
if (site.phoneE164 && !/^\+1\d{10}$/.test(site.phoneE164)) {
  fail('site.phoneE164 must be +1 then 10 digits, got: ' + site.phoneE164);
}
if (site.callAsset && site.callAsset.e164 && !/^\+1\d{10}$/.test(site.callAsset.e164)) {
  fail('site.callAsset.e164 must be +1 then 10 digits, got: ' + site.callAsset.e164);
}
if (site.ads && site.ads.conversionId && !/^AW-\d{9,12}$/.test(site.ads.conversionId)) {
  fail('site.ads.conversionId must look like AW-1234567890, got: ' + site.ads.conversionId);
}
if (site.ghl && site.ghl.webhook && !/^https:\/\/services\.leadconnectorhq\.com\/hooks\//.test(site.ghl.webhook)) {
  fail('site.ghl.webhook does not look like a HighLevel inbound webhook URL');
}
if (site.domain && /^https?:/.test(site.domain)) {
  fail('site.domain should be a bare hostname, not a URL: ' + site.domain);
}

/* The call asset must be a different number from the DNI-swapped one. If they
   match, Google's forwarding number and the number pool fight over the same
   line and call attribution silently becomes meaningless. */
if (site.callAsset && site.callAsset.e164 && site.callAsset.e164 === site.phoneE164) {
  fail('site.callAsset.e164 is the same as site.phoneE164 — the Google call asset must be its own number');
}

/* Geo defaults are easy to leave at whatever the previous client had. */
if (!site.geo || typeof site.geo.lat !== 'number' || typeof site.geo.lng !== 'number') {
  fail('site.geo.lat / site.geo.lng missing — LocalBusiness JSON-LD needs real coordinates');
}
if (site.geo && site.geo.lat === 0 && site.geo.lng === 0) {
  fail('site.geo is still 0,0 — that is in the Atlantic');
}

/* ------------------------------------------------------- template leftovers
 * The named checks above cover the values that route leads and money. This
 * walks the ENTIRE config — every page body, every FAQ answer, every city — and
 * fails on any surviving REPLACE__ marker. Without it the skeleton copy ships:
 * the site builds, it verifies, and it reads as a placeholder to the first
 * person who clicks an ad. */
const leftovers = [];
(function walk(node, trail) {
  if (typeof node === 'string') {
    if (node.indexOf('REPLACE__') !== -1) leftovers.push(trail);
    return;
  }
  if (Array.isArray(node)) return node.forEach((v, i) => walk(v, trail + '[' + i + ']'));
  if (node && typeof node === 'object') {
    return Object.keys(node).forEach((k) => walk(node[k], trail ? trail + '.' + k : k));
  }
})(cfg, '');

if (leftovers.length) {
  /* One line per site is unreadable at 200 markers, so report the count and the
     first handful — fixing those surfaces the next batch. */
  fail(leftovers.length + ' REPLACE__ placeholder(s) left in the config, starting at:');
  for (const p of leftovers.slice(0, 12)) console.log('          ' + p);
  if (leftovers.length > 12) console.log('          … and ' + (leftovers.length - 12) + ' more');
} else {
  ok('no REPLACE__ placeholders anywhere in the config');
}

/* ------------------------------------------------------------- structure
 * Shape errors that would otherwise surface as an undefined-property crash
 * somewhere in the generator, which is a much longer walk back to the cause. */
if (!Array.isArray(cfg.areaGroups) || cfg.areaGroups.length !== 2) {
  fail('cfg.areaGroups must hold exactly 2 groups — the template has two area columns');
} else {
  const ids = cfg.areaGroups.map((g) => g.id);
  const placed = [].concat(cfg.hubs || [], cfg.cities || []);
  const orphans = placed.filter((p) => ids.indexOf(p.area) === -1).map((p) => p.slug);
  if (orphans.length) {
    fail('hub/city pages with an area not in areaGroups (' + ids.join(', ') + '): ' + orphans.join(', '));
  }
}

const allSlugs = []
  .concat(cfg.services || [], cfg.hubs || [], cfg.cities || [])
  .map((p) => p.slug);
const dupes = allSlugs.filter((s, i) => allSlugs.indexOf(s) !== i);
if (dupes.length) fail('duplicate slugs: ' + Array.from(new Set(dupes)).join(', '));

const badNav = (cfg.nav || []).filter((s) => allSlugs.indexOf(s) === -1);
if (badNav.length) fail('nav points at slugs that do not exist: ' + badNav.join(', '));

/* --------------------------------------------------------------- legal copy
 * Both legal pages ship as worked examples written for one client in one state.
 * They describe what THAT site collected and which statutes applied. Publishing
 * them unread is publishing a false statement about your client's data
 * handling, which is a worse failure than any of the above. */
for (const name of ['legal-privacy.html', 'legal-terms.html']) {
  const f = path.join(__dirname, name);
  if (fs.existsSync(f) && fs.readFileSync(f, 'utf8').indexOf('REPLACE__REVIEW_LEGAL') !== -1) {
    fail(name + ' has not been reviewed — read it against what this client ' +
         'actually collects and which statutes apply, then remove the ' +
         'REPLACE__REVIEW_LEGAL marker at the top of the file');
  }
}

/* ------------------------------------------------------------ brand assets
 * The repo ships generated placeholder artwork so a fresh clone builds and can
 * be looked at. Shipping it to production would put a grey box where the
 * client's logo goes, on every page and in every share preview. */
const IMG = path.join(__dirname, 'img');
const MANIFEST = path.join(IMG, '.placeholder-assets');
if (fs.existsSync(MANIFEST)) {
  /* Manifest lines are "<md5>  <filename>". Comparing hashes rather than merely
     checking a file exists is what makes this survive a client dropping in a
     file of the same name. */
  const stale = fs
    .readFileSync(MANIFEST, 'utf8')
    .split('\n')
    .map((l) => l.trim().split(/\s+/))
    .filter((p) => p.length === 2)
    .filter(([md5, name]) => {
      const f = path.join(IMG, name);
      if (!fs.existsSync(f)) return false;
      return crypto.createHash('md5').update(fs.readFileSync(f)).digest('hex') === md5;
    })
    .map((p) => p[1]);

  if (stale.length) {
    fail('still using placeholder artwork: ' + stale.join(', ') +
         ' — replace with the client\'s own, then delete landing/img/.placeholder-assets');
  } else {
    ok('brand artwork has been replaced');
  }
}

if (!failures) {
  ok('all client-specific values are set and well-formed (' + REQUIRED.length + ' checked)');
}

console.log(
  '\nPREFLIGHT ' + (failures ? 'FAILED' : 'PASSED') + ' — ' + failures + ' problem(s)\n'
);
process.exit(failures ? 1 : 0);
