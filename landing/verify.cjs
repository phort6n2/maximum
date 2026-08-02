#!/usr/bin/env node
/**
 * Build verification. Runs against the generated output, not the config, so it
 * catches generator bugs as well as content mistakes.
 *
 * Exits non-zero on any failure so CI refuses to publish a broken site.
 *
 *   node landing/verify.cjs
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUTDIR = process.env.OUTDIR ? path.resolve(process.env.OUTDIR) : path.join(ROOT, 'quote-site');

let failures = 0;
let warnings = 0;

/** '' when the marker is absent — legal pages render through their own path. */
function pageKind(html) {
  const m = /<meta name="page-kind" content="([a-z]*)">/.exec(html);
  return m ? m[1] : '';
}

function fail(msg) {
  console.error('  FAIL  ' + msg);
  failures++;
}
function warn(msg) {
  console.warn('  WARN  ' + msg);
  warnings++;
}
function pass(msg) {
  console.log('  ok    ' + msg);
}
function head(msg) {
  console.log('\n' + msg);
}

if (!fs.existsSync(OUTDIR)) {
  console.error('Output directory does not exist: ' + OUTDIR + '\nRun: npm run build:landing');
  process.exit(1);
}

/* ------------------------------------------------------------ collect pages */

function walk(dir, acc) {
  acc = acc || [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, acc);
    else if (e.name === 'index.html') acc.push(full);
  }
  return acc;
}

const pageFiles = walk(OUTDIR);
const pages = pageFiles.map((f) => {
  const rel = path.relative(OUTDIR, f);
  const slug = rel === 'index.html' ? '/' : rel.replace(/\/index\.html$/, '');
  return { file: f, slug: slug, html: fs.readFileSync(f, 'utf8') };
});

console.log('Verifying ' + pages.length + ' pages in ' + OUTDIR);

const contentPages = pages.filter((p) => p.slug !== 'privacy' && p.slug !== 'terms');

/* ------------------------------------------------------- 1. unique metadata */

head('1. Unique H1 / title / meta description');

function extract(html, re) {
  const m = html.match(re);
  if (!m) return '';
  /* Unescape entities before measuring — "&amp;" is one character to a human and
   * to Google, so counting it as five wrongly flags titles as too long. */
  return m[1]
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const seen = { title: new Map(), desc: new Map(), h1: new Map() };
for (const p of contentPages) {
  const title = extract(p.html, /<title>([\s\S]*?)<\/title>/);
  const desc = extract(p.html, /<meta name="description" content="([\s\S]*?)">/);
  const h1 = extract(p.html, /<h1[^>]*>([\s\S]*?)<\/h1>/);

  if (!title) fail(p.slug + ' has no <title>');
  if (!desc) fail(p.slug + ' has no meta description');
  if (!h1) fail(p.slug + ' has no <h1>');

  if (desc && (desc.length < 70 || desc.length > 165)) {
    warn(p.slug + ' meta description is ' + desc.length + ' chars (aim 70–165)');
  }
  if (title && title.length > 65) {
    warn(p.slug + ' title is ' + title.length + ' chars (may truncate in SERP)');
  }

  for (const [k, v] of [['title', title], ['desc', desc], ['h1', h1]]) {
    if (!v) continue;
    const key = v.toLowerCase();
    if (seen[k].has(key)) fail('duplicate ' + k + ': ' + p.slug + ' vs ' + seen[k].get(key));
    else seen[k].set(key, p.slug);
  }

  /* exactly one h1 per page */
  const h1count = (p.html.match(/<h1[\b>]/g) || p.html.match(/<h1[ >]/g) || []).length;
  if (h1count > 1) fail(p.slug + ' has ' + h1count + ' <h1> elements');
}
if (!failures) pass('all unique, one H1 per page');

/* ------------------------------------------------- 2. head tags on every page */

head('2. Canonical + Open Graph + JSON-LD on every page (home included)');

for (const p of contentPages) {
  if (!/<link rel="canonical" href="https:\/\/[^"]+">/.test(p.html)) {
    fail(p.slug + ' missing or malformed canonical');
  }
  for (const tag of ['og:title', 'og:description', 'og:url', 'og:image']) {
    if (p.html.indexOf('property="' + tag + '"') === -1) fail(p.slug + ' missing ' + tag);
  }
  const lds = p.html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g) || [];
  if (!lds.length) fail(p.slug + ' has no JSON-LD');
  let sawBusiness = false;
  let sawFaq = false;
  for (const block of lds) {
    const raw = block
      .replace(/^<script type="application\/ld\+json">/, '')
      .replace(/<\/script>$/, '')
      .replace(/\\u003c/g, '<');
    let obj;
    try {
      obj = JSON.parse(raw);
    } catch (e) {
      fail(p.slug + ' has unparseable JSON-LD: ' + e.message);
      continue;
    }
    if (obj['@type'] === 'AutoGlassShop' || obj['@type'] === 'LocalBusiness') sawBusiness = true;
    if (obj['@type'] === 'FAQPage') sawFaq = true;
  }
  if (!sawBusiness) fail(p.slug + ' JSON-LD has no business entity');
  if (!sawFaq) warn(p.slug + ' JSON-LD has no FAQPage');
}
pass('head tags checked');

/* --------------------------------------------- 3. canonical matches own slug */

head('3. Canonical points at the page itself');
for (const p of contentPages) {
  const canon = extract(p.html, /<link rel="canonical" href="([^"]+)">/);
  const expectSuffix = p.slug === '/' ? '/' : '/' + p.slug;
  if (canon && !canon.endsWith(expectSuffix)) {
    fail(p.slug + ' canonical is ' + canon + ' (expected to end with ' + expectSuffix + ')');
  }
}
pass('canonicals self-referential');

/* ---------------------------------------------------------- 4. zero orphans */

head('4. Zero orphan pages — every page linked from every page');

const allSlugs = pages.map((p) => p.slug).filter((s) => s !== '/');
for (const p of pages) {
  const linked = new Set();
  const hrefs = p.html.match(/href="([^"]*)"/g) || [];
  for (const h of hrefs) {
    let v = h.slice(6, -1);
    if (/^(https?:|tel:|mailto:|#)/.test(v)) continue;
    v = v.replace(/^\//, '').replace(/#.*$/, '').replace(/\/$/, '');
    if (v) linked.add(v);
  }
  const missing = allSlugs.filter((s) => s !== p.slug && !linked.has(s));
  if (missing.length) {
    fail(p.slug + ' does not link to: ' + missing.join(', '));
  }
}
if (!failures) pass('every page links to all ' + allSlugs.length + ' others');

/* --------------------------------------- 5. every internal href/src resolves */

head('5. Every internal href and src resolves to a file on disk');

function resolves(v) {
  const clean = v.replace(/[?#].*$/, '');
  if (!clean || clean === '/') return fs.existsSync(path.join(OUTDIR, 'index.html'));
  const rel = clean.replace(/^\//, '');
  if (fs.existsSync(path.join(OUTDIR, rel))) return true;
  if (fs.existsSync(path.join(OUTDIR, rel, 'index.html'))) return true;
  if (fs.existsSync(path.join(OUTDIR, rel + '.html'))) return true;
  return false;
}

const brokenRefs = new Set();
for (const p of pages) {
  const refs = p.html.match(/(?:href|src)="([^"]+)"/g) || [];
  for (const r of refs) {
    const v = r.replace(/^(?:href|src)="/, '').slice(0, -1);
    if (/^(https?:|tel:|mailto:|data:|#|\/\/)/.test(v)) continue;
    if (!resolves(v)) brokenRefs.add(p.slug + ' → ' + v);
  }
}
if (brokenRefs.size) [...brokenRefs].forEach(fail);
else pass('all internal references resolve');

/* ------------------------------------------ 6. no dangling template artifacts */

head('6. No unreplaced template tokens or asset prefixes');
for (const p of pages) {
  if (p.html.indexOf('/ASSET') !== -1) fail(p.slug + ' still contains the /ASSET asset prefix');
  const tokens = p.html.match(/\{\{[A-Z0-9_]+\}\}/g);
  if (tokens) fail(p.slug + ' has unreplaced tokens: ' + [...new Set(tokens)].join(', '));
  if (p.html.indexOf('<!--PAGE:') !== -1 && p.slug !== 'privacy' && p.slug !== 'terms') {
    /* markers themselves are fine to keep, but flag an empty required region */
    for (const name of ['H1', 'BODY', 'FAQ', 'JSONLD', 'NAV']) {
      const re = new RegExp('<!--PAGE:' + name + '--></?\\s*<!--/PAGE:' + name + '-->');
      if (re.test(p.html)) fail(p.slug + ' region ' + name + ' is empty');
    }
  }
  if (/lorem ipsum/i.test(p.html)) fail(p.slug + ' contains placeholder lorem text');
}
pass('no dangling artifacts');

/* ---------------------------------------- 7. city page copy overlap (doorway) */

head('7. City-page body copy overlap (target < 5%)');

function bodyText(html) {
  const m = html.match(/<!--PAGE:BODY-->([\s\S]*?)<!--\/PAGE:BODY-->/);
  let s = m ? m[1] : '';
  const h = html.match(/<!--PAGE:H1-->([\s\S]*?)<!--\/PAGE:H1-->/);
  const sub = html.match(/<!--PAGE:SUB-->([\s\S]*?)<!--\/PAGE:SUB-->/);
  s = (h ? h[1] : '') + ' ' + (sub ? sub[1] : '') + ' ' + s;
  /* Figure captions are stripped before measuring. They are GENERATED, written
     once per photograph in the config, and the same photo carries the same
     caption wherever it appears — so two pages that share photographs look like
     duplicated prose purely for sharing photographs.
     That is the opposite of what this check is for. It exists to catch one
     authored page template with the city name swapped, which is what the site
     this build replaced actually did. Leaving captions in it fails honest pages
     and, worse, pressures whoever hits the failure into UN-illustrating pages to
     get green — making the site worse to satisfy a check meant to make it
     better. Measured here: including captions took the worst pair from 3.79% to
     8.33% without a word of body copy changing. */
  s = s.replace(/<figcaption[\s\S]*?<\/figcaption>/g, ' ');
  return s
    /* Figure captions are generated, not authored, and the same photo carries
       the same caption wherever it is reused — which is deliberate. Counting
       them as body copy made two pages look 8% duplicated purely because they
       shared photographs. This check exists to catch duplicated PROSE. */
    .replace(/<figcaption>[\s\S]*?<\/figcaption>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function shingles(text, n) {
  const w = text.split(' ').filter(Boolean);
  const set = new Set();
  for (let i = 0; i + n <= w.length; i++) set.add(w.slice(i, i + n).join(' '));
  return set;
}

/* City and hub pages are the doorway-page risk: same service, different place
   name. Identified by the page-kind marker rather than a slug pattern — client
   slug schemes differ, and a check that silently matches nothing is worse than
   no check at all. */
const placePages = contentPages.filter((p) => /city|hub/.test(pageKind(p.html)));
const cityLike = placePages;
if (cityLike.length < 2) {
  warn('fewer than 2 city pages found — skipping overlap check');
} else {
  const sh = cityLike.map((p) => ({ slug: p.slug, s: shingles(bodyText(p.html), 5) }));
  let worst = { pct: 0, a: '', b: '' };
  const pcts = [];
  for (let i = 0; i < sh.length; i++) {
    for (let j = i + 1; j < sh.length; j++) {
      const a = sh[i].s;
      const b = sh[j].s;
      if (!a.size || !b.size) continue;
      let inter = 0;
      for (const g of a) if (b.has(g)) inter++;
      const pct = (inter / Math.min(a.size, b.size)) * 100;
      pcts.push(pct);
      if (pct > worst.pct) worst = { pct: pct, a: sh[i].slug, b: sh[j].slug };
    }
  }
  const avg = pcts.reduce((x, y) => x + y, 0) / (pcts.length || 1);
  console.log(
    '        avg overlap ' + avg.toFixed(2) + '%, worst ' + worst.pct.toFixed(2) +
      '% (' + worst.a + ' vs ' + worst.b + ')'
  );
  if (worst.pct >= 5) fail('city-page overlap ' + worst.pct.toFixed(2) + '% exceeds the 5% ceiling');
  else pass('city copy is genuinely distinct');
}

/* -------------------------------------------------------- 8. static assets */

head('8. Static assets present');
for (const f of ['sitemap.xml', 'robots.txt', 'site.webmanifest', 'vercel.json']) {
  if (fs.existsSync(path.join(OUTDIR, f))) pass(f);
  else fail('missing ' + f);
}
if (fs.existsSync(path.join(OUTDIR, 'favicon.ico'))) pass('favicon.ico');
else warn('missing favicon.ico (add landing/img/favicon.ico)');

/* The sitemap lists every indexable page and nothing else. Submitting a noindex
   URL earns a "Submitted URL marked noindex" error in Search Console, so the
   legal pages must be absent, not present. */
if (fs.existsSync(path.join(OUTDIR, 'sitemap.xml'))) {
  const sm = fs.readFileSync(path.join(OUTDIR, 'sitemap.xml'), 'utf8');
  for (const p of pages) {
    const suffix = p.slug === '/' ? '/</loc>' : '/' + p.slug + '</loc>';
    const noindex = /content="noindex/.test(p.html);
    const listed = sm.indexOf(suffix) !== -1;
    if (noindex && listed) fail('sitemap.xml lists noindex page ' + p.slug);
    if (!noindex && !listed) fail('sitemap.xml missing ' + p.slug);
  }
}

/* ------------------------------------------------------- 9. tracking wiring */

head('9. Tracking wiring');
const home = pages.find((p) => p.slug === '/');
if (home) {
  const checks = [
    ['SITE_CONFIG block', /window\.SITE_CONFIG\s*=/],
    ['allow_enhanced_conversions', /allow_enhanced_conversions:\s*true/],
    ['attribution keys incl gbraid/wbraid', /gbraid[\s\S]{0,40}wbraid/],
    ['sessionStorage attribution persistence', /sessionStorage\.setItem\(\s*['"]lp_attr/],
    ['re-entrancy guard (one click cannot become two POSTs)', /submitting\s*=\s*true/],
    ['gtag set user_data', /gtag\('set',\s*'user_data'/],
    ['conversion event', /gtag\('event',\s*'conversion'/],
    ['E.164 normalisation', /\+1'\s*\+\s*d|'\+1'\s*\+/]
  ];
  for (const [label, re] of checks) {
    if (re.test(home.html)) pass(label);
    else fail('home page missing ' + label);
  }
  /* The form submit IS the conversion action, so the conversion must be
     reported on a validated submit and must NOT be conditional on the CRM
     accepting the lead — a GHL outage cannot be allowed to blank the ad
     account's conversion feed. This asserts the inverse of what it used to:
     fireAdsConversion has to appear BEFORE the webhook fetch, and must not
     appear after it.

     GHL reports phone calls from the number pool and nothing else. If form
     submissions are ever re-enabled as a GHL conversion action, every lead
     counts twice — that is the failure this pairing guards against, and it is
     invisible in the ad account until the numbers are already wrong. */
  const submitIdx = home.html.indexOf('fetch(LEAD_WEBHOOK');
  const beforeIdx = home.html.lastIndexOf('fireAdsConversion(leadInfo)', submitIdx);
  const afterIdx = submitIdx === -1 ? -1 : home.html.indexOf('fireAdsConversion(', submitIdx);
  if (submitIdx === -1) warn('no webhook fetch found (webhook may be unconfigured)');
  else if (beforeIdx === -1) fail('conversion is not reported before the webhook POST — a CRM outage would lose it');
  else if (afterIdx !== -1) fail('conversion also fires after the webhook resolves — it would be double-counted');
  else pass('conversion reported on submit, independent of CRM delivery');

  /* Every submission counts, repeats included. Two dedupes had to go for that
     to be true, and only one of them is visible in this file — Google Ads
     discards a repeated transaction_id server-side, so a STABLE id would let
     the browser send a conversion that the account silently drops. That failure
     shows up as "the numbers are lower than the CRM" weeks later, with nothing
     in the page to explain it. Assert the id cannot be stable. */
  /* Quoted literal, not the bare word: the code carries a comment explaining
     what the old key was and why it went, and matching prose would fail the
     build for describing the fix. */
  if (/['"]lp_conv_/.test(home.html))
    fail('a browser-side conversion dedupe store is back — repeat submissions would be suppressed');
  else pass('no browser-side conversion dedupe');
  const txn = /var txnId =([\s\S]{0,320}?);/.exec(home.html);
  if (!txn) fail('could not find the transaction_id construction');
  else if (/Date\.now\(\)|Math\.random\(\)/.test(txn[1]))
    pass('transaction_id is unique per submission, so Google cannot dedupe a repeat lead');
  else fail('transaction_id looks stable — Google Ads will discard repeat conversions');

  /* The tag has to be readable in the SERVED HTML, and there has to be exactly
     one of it. Two ways this breaks, both of which look fine in a browser:

     - Built in JS and appended to the head. Loads correctly, Tag Assistant
       still sees it, but Google Ads' site scan reads the page HTML and reports
       the tag as missing on a site where it works.
     - Someone pastes the snippet from the Ads UI on top of this one. Two
       library loads and two config calls for the same account.  */
  const loads = (home.html.match(/googletagmanager\.com\/gtag\/js/g) || []).length;
  const adsConfigured = /GOOGLE_ADS_ID:\s*"(?!"|REPLACE__)[^"]+"/.test(home.html) ||
                        /GA4_ID:\s*"(?!"|REPLACE__)[^"]+"/.test(home.html);
  if (loads === 1) pass('exactly one gtag.js load, static in the served HTML');
  else if (loads === 0 && !adsConfigured) warn('no gtag.js — no Ads or GA4 ID configured yet');
  else if (loads === 0) fail('no gtag.js in the served HTML — the Ads site scan will not find the tag');
  else fail(loads + ' gtag.js loads on one page — the tag is duplicated');
  if (/createElement\(\s*['"]script['"]\s*\)[\s\S]{0,200}googletagmanager/.test(home.html))
    fail('gtag.js is being injected from JS — it must be a static script tag');
  else pass('gtag.js is not injected from JS');
  const configs = (home.html.match(/gtag\(\s*['"]config['"]/g) || []).length;
  if (configs <= 2) pass('gtag config calls: ' + configs + ' (Ads and at most one GA4)');
  else fail(configs + ' gtag config calls — an ID is being configured twice');

  /* The honeypot must be invisible to Chrome's autofill, not just to people.
     An off-screen input named `company` (or address/organization/name/email/
     phone) is filled by Chrome's address-profile autofill, and autocomplete="off"
     does not stop it. A filled honeypot is treated as a bot: no lead POSTed, no
     conversion, and the success screen shown anyway. That silently loses real
     customers who use autofill, and it is invisible in every log we keep.

     display:none is the one thing Chrome reliably skips. Anything clever enough
     to notice display:none is caught by the trusted-interaction check instead. */
  const hpInput = /<div class="hp"[\s\S]*?<\/div>/.exec(home.html);
  if (!hpInput) warn('no honeypot found in the form');
  else {
    const nameAttr = /name="([^"]+)"/.exec(hpInput[0]);
    const risky = /^(company|organization|org|name|fname|lname|email|phone|tel|address|address1|city|state|zip|postal|country|title|url|website)$/i;
    if (nameAttr && risky.test(nameAttr[1]))
      fail('honeypot is named "' + nameAttr[1] + '" — Chrome autofill fills that, and a filled honeypot silently drops a real lead');
    else pass('honeypot name is not an autofill target');
    if (/<label/.test(hpInput[0]))
      fail('honeypot carries a <label> — that is a strong autofill hint');
    else pass('honeypot has no label to key autofill off');
    if (/\.hp\{[^}]*display:\s*none/.test(home.html)) pass('honeypot is display:none, which Chrome autofill skips');
    else fail('honeypot is not display:none — Chrome autofill will fill an off-screen input');
  }
}

/* ------------------------------- 10. call-asset number must not be swappable */

head('10. Google call-asset number is present and excluded from DNI');

/* Google verifies the call-asset number appears on the site. If DNI ever rewrote
 * it, or it silently dropped out of the footer, call-asset verification fails —
 * and nothing on the page would look broken. Assert it explicitly. */
const cfgSite = require('./pages.config.cjs').site;
const assetDigits = String(cfgSite.callAsset.e164).replace(/\D/g, '');
for (const p of contentPages) {
  const tel = new RegExp('<a[^>]*href="tel:\\+?' + assetDigits + '"[^>]*>', 'i');
  const m = p.html.match(tel);
  if (!m) fail(p.slug + ' does not display the Google call-asset number ' + cfgSite.callAsset.formatted);
  else if (!/ghl-no-swap|data-no-swap/.test(m[0])) {
    fail(p.slug + ' shows the call-asset number but it is NOT marked no-swap — DNI would rewrite it');
  }
}
pass('call-asset number present and no-swap on every content page');

for (const p of pages) {
  const callAssetLinks = p.html.match(/<a[^>]*href="tel:\+1[0-9]+"[^>]*>/g) || [];
  const noSwap = callAssetLinks.filter((a) => /ghl-no-swap|data-no-swap/.test(a));
  if (p.slug !== 'privacy' && p.slug !== 'terms' && !noSwap.length) {
    warn(p.slug + ' has no ghl-no-swap tel link (expected on the footer call-asset number)');
  }
}
pass('call-asset markers checked');

/* -------------------------------------------------- 11. accessibility basics */

head('11. Accessibility basics');
for (const p of pages) {
  const imgs = p.html.match(/<img[^>]*>/g) || [];
  for (const img of imgs) {
    if (!/\salt=/.test(img)) fail(p.slug + ' has an <img> with no alt attribute');
  }
  /* inputs must be >=16px to stop iOS Safari zoom-on-focus — checked via CSS */
  const inputs = p.html.match(/<input[^>]*>/g) || [];
  for (const i of inputs) {
    if (/type="(text|email|tel|number)"/.test(i) && !/\sid=/.test(i)) {
      warn(p.slug + ' has an input with no id (label association)');
    }
  }
  /* heading order */
  const hs = (p.html.match(/<h([1-6])[ >]/g) || []).map((m) => Number(m.match(/h([1-6])/)[1]));
  for (let i = 1; i < hs.length; i++) {
    if (hs[i] - hs[i - 1] > 1) {
      warn(p.slug + ' heading jumps from h' + hs[i - 1] + ' to h' + hs[i]);
      break;
    }
  }
}
pass('accessibility basics checked');

/* -------------------------------------------------- 12. honest review claims */

/* Config strings the docs describe as HTML carry entities like &amp;. Passing
   one through esc() a second time renders "&amp;amp;" on the page — visible,
   embarrassing, and easy to reintroduce whenever a new token is wired up. */
for (const p of pages) {
  const n = (p.html.match(/&amp;(amp|lt|gt|quot);/g) || []).length;
  if (n) fail(p.slug + ' has ' + n + ' double-escaped entit' + (n === 1 ? 'y' : 'ies') +
              ' — a config string described as HTML was passed through esc()');
}
if (!failures) pass('no double-escaped entities');

/* A photo used beside the body is removed from that page's gallery. If that
   ever regresses the page shows the same photograph twice, which reads as a
   thin photo library rather than a rich one — and it is invisible in a diff. */
for (const p of contentPages) {
  /* Photography only — matched inside the .shot wrapper. The logo is
     deliberately in both the header and the footer, so a plain <img> sweep
     flags every page. */
  const srcs = (p.html.match(/<span class="shot"><img[^>]+src="([^"]+)"/g) || [])
    .map((t) => /src="([^"]+)"/.exec(t)[1]);
  const seen = new Set();
  const twice = srcs.filter((u) => (seen.has(u) ? true : (seen.add(u), false)));
  if (twice.length) {
    fail(p.slug + ' shows the same photo twice: ' + Array.from(new Set(twice)).join(', '));
  }
}
if (!failures) pass('no page repeats a photograph');

head('12. Review claims match available data');
const hasReviews = fs.existsSync(path.join(__dirname, 'reviews.json'));
for (const p of contentPages) {
  const claimsRating = /\b[45]\.\d\s*(?:★|stars?|out of 5)/i.test(p.html);
  const hasAggregate = /"aggregateRating"/.test(p.html);
  if (!hasReviews && claimsRating) fail(p.slug + ' asserts a star rating but there is no reviews.json');
  if (!hasReviews && hasAggregate) fail(p.slug + ' emits aggregateRating with no live review data');
}
pass(hasReviews ? 'live review data present' : 'no review data — no rating claims found');

/* ------------------------------------------ 13. no region left unfilled */

/* The footer's Orange County and Los Angeles County columns once shipped as
   bare headings with nothing under them: FOOTER_OC and FOOTER_LA each appear
   twice in the template, and the generator filled only the first occurrence.
   Nothing caught it — the orphan check passed because the city links also
   appear in the "areas we serve" list in the body. So assert directly that no
   region marker pair is empty in the output, which catches the whole class. */

head('13. Every region marker is filled');

/* Regions that are legitimately empty on a correctly-built site. GTAGSRC holds
   the gtag.js tag, which is deliberately omitted when no Google Ads or GA4 ID
   is configured — a build with no account yet must ship no tag rather than a
   request to `?id=REPLACE__...`. Without this exemption every page of a
   half-configured build reports a spurious empty-region failure, which buries
   the real ones. */
const MAY_BE_EMPTY = new Set(['GTAGSRC']);

for (const p of pages) {
  const re = /<!--PAGE:([A-Z_0-9]+)-->([\s\S]*?)<!--\/PAGE:\1-->/g;
  let m;
  while ((m = re.exec(p.html))) {
    if (!m[2].trim() && !MAY_BE_EMPTY.has(m[1])) fail(p.slug + ' has an empty region: ' + m[1]);
  }
}

/* And specifically: the footer columns carry every city, not just the body list. */
const cityLinks = pages
  .filter((p) => /city|hub/.test(pageKind(p.html)))
  .map((p) => p.slug);
for (const p of pages) {
  const footer = p.html.slice(p.html.indexOf('<footer'));
  const missing = cityLinks.filter((s) => !footer.includes('href="/' + s + '"'));
  if (missing.length) fail(p.slug + ' footer omits: ' + missing.join(', '));
}
if (!failures) pass('all regions filled; footer links all ' + cityLinks.length + ' city/hub pages');

/* ------------------------------------------- 14. form failure modes */

/* Each of these was a real defect found before launch, and each fails silently
   — the page looks fine and the lead just never arrives. Assert the guards. */

head('14. Form failure modes');

const formPages = pages.filter((p) => p.html.indexOf('id="quoteForm"') !== -1);
for (const p of formPages) {
  const f = p.html;
  /* A bare fetch has no timeout: a webhook that never answers left the button
     reading "Sending…" forever with no error and no lead. */
  if (f.indexOf('AbortController') === -1) fail(p.slug + ' form fetch has no abort timeout');
  /* aria-disabled and pointer-events do not stop a keyboard submit. */
  if (!/if\s*\(\s*submitting\s*\)\s*return/.test(f)) fail(p.slug + ' form has no re-entrancy guard');
  /* Fields carry name=, so a default submit would put PII in the query string
     and gtag would forward it to Google Ads as page_location. */
  if (!/id="quoteForm"[^>]*method="post"/.test(f)) fail(p.slug + ' form is missing method="post"');
  if (!/id="quoteForm"[^>]*onsubmit="return false"/.test(f)) fail(p.slug + ' form is missing the inline onsubmit guard');
  if (f.indexOf('<noscript>') === -1) fail(p.slug + ' has no noscript fallback for the form');
  /* Required fields must be outside the collapsed drawer, or submitting raises
     an error on a field the visitor cannot see. */
  const drawer = f.slice(f.indexOf('id="qcMore"'), f.indexOf('</form>'));
  for (const id of ['svc', 'veh']) {
    if (drawer.indexOf('id="' + id + '"') !== -1) {
      fail(p.slug + ' has required field #' + id + ' hidden inside the collapsed drawer');
    }
    if (f.indexOf('id="' + id + '-err"') === -1) fail(p.slug + ' has no error slot for #' + id);
  }
  if (f.indexOf('class="hp"') === -1) fail(p.slug + ' is missing the honeypot field');
  if (!/form\.addEventListener\('pointerdown'/.test(f)) fail(p.slug + ' has no bot interaction check');
}
if (!failures) pass('timeout, re-entrancy, POST method, inline guard and noscript on all ' + formPages.length + ' form pages');

/* ------------------------------------------------ 15. migration URL parity */

/* When a client moves off an existing landing page, every URL their ads point
   at has to keep resolving. A final URL that 404s gets the ad disapproved for
   "Destination not working" within hours and the ad group stops serving. */

head('15. Migration URL parity');

const migration = require('./pages.config.cjs').migration || { preserve: [], redirects: [] };
const normP = (u) => {
  let s = String(u || '').trim().replace(/^https?:\/\/[^/]+/i, '').split('#')[0].split('?')[0];
  if (!s.startsWith('/')) s = '/' + s;
  return s.length > 1 ? s.replace(/\/+$/, '') : s;
};
const builtPaths = new Set(pages.map((p) => (p.slug === '/' ? '/' : '/' + p.slug)));

for (const slug of migration.preserve || []) {
  if (!builtPaths.has(normP(slug))) {
    fail('migration.preserve lists ' + slug + ' but no page builds at that path');
  }
}

const froms = new Set();
for (const r of migration.redirects || []) {
  const from = normP(r.from);
  const to = normP(r.to);
  /* A redirect whose source is also a real page never fires — the file wins. */
  if (builtPaths.has(from)) fail('redirect source ' + from + ' is also a built page, so it will never fire');
  if (!builtPaths.has(to)) fail('redirect ' + from + ' points at ' + to + ', which is not a built page');
  if (froms.has(from)) fail('duplicate redirect source: ' + from);
  froms.add(from);
  if (from === to) fail('redirect loops on itself: ' + from);
}

/* What ships in vercel.json must match the config, or the build lies. */
const rootVercel = path.join(__dirname, '..', 'vercel.json');
if (fs.existsSync(rootVercel)) {
  const conf = JSON.parse(fs.readFileSync(rootVercel, 'utf8'));
  const shipped = (conf.redirects || []).length;
  const configured = (migration.redirects || []).length;
  if (shipped !== configured) {
    fail('vercel.json ships ' + shipped + ' redirect(s) but config declares ' + configured +
         ' — rebuild');
  }
  for (const r of conf.redirects || []) {
    if (r.permanent !== true) fail('redirect ' + r.source + ' is not permanent (301)');
  }
}

if (!failures) {
  pass(
    (migration.redirects || []).length + ' redirect(s), ' +
    (migration.preserve || []).length + ' preserved slug(s) — all resolve'
  );
}

/* -------------------------------------------------------------------- done */

console.log(
  '\n' +
    (failures ? 'FAILED' : 'PASSED') +
    ' — ' + failures + ' failure(s), ' + warnings + ' warning(s), ' + pages.length + ' pages\n'
);
process.exit(failures ? 1 : 0);
