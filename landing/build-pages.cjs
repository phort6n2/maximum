#!/usr/bin/env node
/**
 * Static site generator for a single-client Google Ads landing site.
 *
 * Nothing about this file is client-specific: every name, number, geography and
 * compliance line comes out of landing/pages.config.cjs. If you find yourself
 * about to type a client's city or phone number in here, it belongs in config.
 *
 * Reads:   landing/template.html    master template (also renders standalone as the home page)
 *          landing/pages.config.cjs all page content
 *          landing/reviews.json      optional; real Google review data
 *
 * Writes:  quote-site/              index.html + <slug>/index.html per page,
 *                                   sitemap.xml, robots.txt, manifest, favicons,
 *                                   img/, vercel.json
 *
 * Design notes:
 *  - Nav and footer link lists are GENERATED from the config, so every page is
 *    linked from every other page by construction. Orphan pages (which read as
 *    doorway pages to Google) can't happen by forgetting a link.
 *  - The home page gets the exact same head treatment as every other page —
 *    canonical, OG, JSON-LD. It's the easiest page in the account to leave bare.
 *  - When reviews.json is absent, every numeric rating claim is stripped and the
 *    review cards degrade to a link to the real Google listing. aggregateRating
 *    is only ever emitted from live data.
 *
 * Env:
 *   BASE    URL prefix for asset/link rewriting (default '' = served at root)
 *   OUTDIR  output directory (default <repo>/quote-site)
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const BASE = process.env.BASE !== undefined ? process.env.BASE : '';
const OUTDIR = process.env.OUTDIR
  ? path.resolve(process.env.OUTDIR)
  : path.join(ROOT, 'quote-site');

/* The literal prefix used on every asset path inside the template. Rewritten at
 * build time so the template can be opened directly from disk during design
 * work while the built site uses real root-relative (or BASE-prefixed) paths. */
const ASSET_PREFIX = '/ASSET';

/* Illustrated-chapter geometry, mirrored from the .pchap-fig rules in
 * template.html. proseHtml() uses these to pair each chapter with a photo whose
 * rendered height matches the text beside it, so they must be kept in step with
 * the CSS — if you change the column ratio, the wrap width or the image cap
 * there, change them here too or the pairing silently drifts. */
const CHAP_MAX_W = 934;     // .pchap-fig max-width
const CHAP_GAP = 56;        // .pchap-fig column gap
const CHAP_TEXT_FR = 498;   // grid-template-columns, text track
const CHAP_FIG_FR = 380;    //                        figure track
const CHAP_IMG_MAX_H = 620; // .pchap-fig img max-height

const cfg = require('./pages.config.cjs');
const site = cfg.site;

/* ------------------------------------------------------------------ helpers */

const esc = (s) =>
  String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Text for JSON-LD / meta: strip tags, collapse whitespace. */
const plain = (s) =>
  String(s == null ? '' : s)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

function region(html, name, replacement) {
  const open = '<!--PAGE:' + name + '-->';
  const close = '<!--/PAGE:' + name + '-->';
  /* Every occurrence, not just the first. FOOTER_OC and FOOTER_LA each appear
     twice in the template — once in the "areas we serve" list and once in the
     footer column — and filling only the first left the footer columns empty
     under their headings. */
  let out = '';
  let rest = html;
  let filled = 0;
  for (;;) {
    const i = rest.indexOf(open);
    if (i === -1) break;
    const j = rest.indexOf(close, i);
    if (j === -1) {
      throw new Error('Template is missing closing marker ' + close);
    }
    out += rest.slice(0, i + open.length) + replacement;
    rest = rest.slice(j);
    filled++;
  }
  if (!filled) {
    throw new Error('Template is missing region marker ' + open);
  }
  return out + rest;
}

/**
 * Keep or delete an optional band of chrome.
 *
 * region() can only fill a hole; it cannot remove the section around it. A
 * client with no photography or no insurance copy would otherwise ship a
 * heading, an eyebrow and an empty grid — which on a paid landing page reads
 * as a broken page rather than a shorter one.
 *
 * Like region(), this handles EVERY occurrence, not just the first.
 */
function section(html, name, keep) {
  const open = '<!--SECTION:' + name + '-->';
  const close = '<!--/SECTION:' + name + '-->';
  if (html.indexOf(open) === -1) {
    throw new Error('Template is missing section marker ' + open);
  }
  if (keep) return html.split(open).join('').split(close).join('');
  let out = '';
  let rest = html;
  for (;;) {
    const i = rest.indexOf(open);
    if (i === -1) break;
    const j = rest.indexOf(close, i);
    if (j === -1) throw new Error('Template is missing closing marker ' + close);
    out += rest.slice(0, i);
    rest = rest.slice(j + close.length);
  }
  return out + rest;
}

/**
 * Fill a region, or delete it and its markers when there is nothing to put
 * there. A client with no review data and no configured badges would otherwise
 * ship an empty region, which verify.cjs correctly refuses — the trust cluster
 * is optional by design, so its absence must not be a build failure.
 */
function optionalRegion(html, name, filling) {
  if (filling) return region(html, name, filling);
  return html.replace(
    new RegExp('<!--PAGE:' + name + '-->[\\s\\S]*?<!--/PAGE:' + name + '-->', 'g'),
    ''
  );
}

function url(slug) {
  const b = BASE || '';
  if (!slug || slug === '/') return b + '/';
  return b + '/' + slug;
}

function absUrl(slug) {
  const origin = 'https://' + site.domain;
  if (!slug || slug === '/') return origin + '/';
  return origin + '/' + slug;
}

/* ------------------------------------------------------- page list assembly */

const homePage = Object.assign({}, cfg.home, { slug: '/', kind: 'home' });
const servicePages = cfg.services.map((p) => Object.assign({}, p, { kind: 'service' }));
const hubPages = cfg.hubs.map((p) => Object.assign({}, p, { kind: 'hub' }));
const cityPages = cfg.cities.map((p) => Object.assign({}, p, { kind: 'city' }));

/* kind drives nothing in the layout — it is emitted as a meta tag purely so
   the checkers can tell a city page from a service page without pattern-matching
   slugs, which differ per client. */
homePage.kind = 'home';
servicePages.forEach((p) => { p.kind = 'service'; });
hubPages.forEach((p) => { p.kind = 'hub'; });
cityPages.forEach((p) => { p.kind = 'city'; });

const contentPages = [homePage].concat(servicePages, hubPages, cityPages);

/* ------------------------------------------------------------- review state */

let reviews = null;
const reviewsPath = path.join(__dirname, 'reviews.json');
if (fs.existsSync(reviewsPath)) {
  try {
    const r = JSON.parse(fs.readFileSync(reviewsPath, 'utf8'));
    /* Only trust it if it actually carries usable numbers. */
    if (Number(r.rating) >= 1 && Number(r.rating) <= 5 && Number(r.count) >= 1) {
      reviews = r;
    } else {
      console.warn('[build] reviews.json present but values are out of range — ignoring it.');
    }
  } catch (e) {
    console.warn('[build] reviews.json is unparseable — ignoring it. (' + e.message + ')');
  }
}

const mapsUrl = (reviews && reviews.maps_uri) || site.mapsUrl || '';

/* ------------------------------------------------------------- nav + footer */

/* Header nav: a small curated set (the highest-intent services plus both county
 * hubs). The footer carries the complete link set. */
const navHtml = cfg.nav
  .map((slug) => {
    const p = contentPages.find((x) => x.slug === slug);
    if (!p) throw new Error('nav references unknown slug: ' + slug);
    return '<a href="' + url(p.slug) + '">' + esc(p.navLabel || p.shortLabel) + '</a>';
  })
  .join('\n            ');

function linkList(pages) {
  return pages
    .map(
      (p) =>
        '<li><a href="' + url(p.slug) + '">' + esc(p.shortLabel || p.navLabel) + '</a></li>'
    )
    .join('\n              ');
}

const footerServices = linkList(servicePages);
/* Two area columns, both driven from cfg.areaGroups. The template has exactly
   two — in the coverage band and again in the footer — so a client with a single
   service area gives the second group an empty city list rather than a third
   being invented here. */
const GROUPS = cfg.areaGroups;
const groupPages = (id) =>
  hubPages.filter((p) => p.area === id).concat(cityPages.filter((p) => p.area === id));

const footerAreaA = linkList(groupPages(GROUPS[0].id));
const footerAreaB = linkList(groupPages(GROUPS[1].id));

/* ------------------------------------------------------------- review block */

/** 1110 → "1,110". Used everywhere a review count is shown to a human. */
const fmtCount = (n) => Number(n).toLocaleString('en-US');

function starRow(n) {
  /* Round to the nearest half star first. Without this, 4.9 renders as 4 full
     plus a half — visually 4.5 — which understates the real rating. */
  const r = Math.round(Number(n) * 2) / 2;
  const full = Math.floor(r);
  const half = r - full >= 0.5;
  let out = '';
  for (let i = 0; i < full; i++) out += '<span class="star" aria-hidden="true">★</span>';
  if (half) out += '<span class="star star-half" aria-hidden="true">★</span>';
  return out;
}

/**
 * Compact rating for the mobile sticky header, filling the space between the
 * logo and the call button.
 *
 * A <span>, never a link. The call button is the only thing in that header
 * worth a tap, and a tappable rating sitting beside it would take taps aimed
 * at the button. Drops out entirely without live review data, like every other
 * rating claim on the site.
 */
function headerRatingHtml() {
  if (!reviews) return '';
  return (
    '<span class="hdr-rating" aria-label="' +
    esc(reviews.rating + ' out of 5 stars from ' + fmtCount(reviews.count) + ' Google reviews') +
    '">' +
    '<span class="hr-top" aria-hidden="true">' +
    GOOGLE_G_SM.replace('class="rb-g"', 'class="hr-g"') +
    '<span class="hr-score">' + esc(reviews.rating) + '</span>' +
    '<span class="stars">' + starRow(reviews.rating) + '</span>' +
    '</span>' +
    '<span class="hr-sub" aria-hidden="true">' + esc(fmtCount(reviews.count)) + ' Google reviews</span>' +
    '</span>'
  );
}

function ratingBarHtml() {
  if (!reviews) {
    /* No live data → no numbers. Point at the real listing instead. */
    return (
      '<a class="rb-item rb-link" href="' +
      esc(mapsUrl) +
      '" target="_blank" rel="noopener">' +
      GOOGLE_G_SM +
      '<strong>Read our Google reviews</strong>' +
      '</a>'
    );
  }
  /* The rating is the strongest trust signal on the page, so it gets the Google
     mark, a score sized like a score, and stars that animate in. data-animate is
     picked up by the observer in the page script; without JS or with reduced
     motion the stars are simply already there. */
  return (
    '<a class="rb-item rb-link rb-google" href="' +
    esc(mapsUrl) +
    '" target="_blank" rel="noopener" data-animate ' +
    'aria-label="' +
    esc(reviews.rating + ' out of 5 stars from ' + fmtCount(reviews.count) + ' Google reviews') +
    '">' +
    GOOGLE_G_SM +
    '<span class="rb-score">' + esc(reviews.rating) + '</span>' +
    '<span class="rb-stack">' +
    '<span class="stars">' + starRow(reviews.rating) + '</span>' +
    '<span class="rb-sub">' + esc(fmtCount(reviews.count)) + ' Google reviews</span>' +
    '</span>' +
    '</a>'
  );
}

/* ------------------------------------------------- visual furniture ------- */

/* Line icons, 24x24, drawn with currentColor so they inherit whatever they sit
   on. Inline rather than a sprite or a font: the whole page is one document and
   an icon that arrives late is an icon that shifts layout. */
const ICONS = {
  /* The four already drawn in the hero trust strip, kept byte-identical so
     making that block config-driven changes nothing on screen. */
  van: '<rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v5h-7V8Z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
  shield: '<path d="M12 2 4 6v6c0 5 3.4 9.3 8 10 4.6-.7 8-5 8-10V6l-8-4Z"/>',
  doc: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z"/><path d="M14 2v6h6"/><path d="M9 15h6"/>',
  camera: '<circle cx="12" cy="12" r="3"/><path d="M2 12h4m12 0h4M12 2v4m0 12v4"/>',
  /* Added for the step cards. */
  form: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
  check: '<path d="M12 2 4 6v6c0 5 3.4 9.3 8 10 4.6-.7 8-5 8-10V6l-8-4Z"/><path d="M8.6 12.2l2.4 2.4 4.4-4.6"/>',
  pin: '<path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/>',
  /* Added for the service cards. These six are auto-glass shapes; add whatever
     the client's trade needs rather than reusing one that nearly fits — a card
     illustrated with the wrong object is worse than a card with no icon. */
  windshield: '<path d="M3 17 5 8a2 2 0 0 1 2-1.6h10A2 2 0 0 1 19 8l2 9"/><path d="M2 17h20"/>',
  star: '<path d="m12 3 2.5 5 5.5.8-4 3.9.9 5.5L12 15.6 7.1 18.2l.9-5.5-4-3.9L9.5 8Z"/>',
  target: '<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3"/>',
  rear: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 19V10"/>',
  door: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M12 4v16"/>',
  wrench: '<path d="M14.7 6.3a4 4 0 0 0 5 5L21 21H3l6.9-6.9a4 4 0 0 0 4.8-7.8Z"/>'
};

function icon(name, opts) {
  const d = ICONS[name];
  if (!d) throw new Error('Unknown icon: ' + name + ' (have: ' + Object.keys(ICONS).join(', ') + ')');
  const o = opts || {};
  const size = o.size || 20;
  return (
    '<svg' + (o.cls ? ' class="' + o.cls + '"' : '') +
    ' width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" ' +
    'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ' +
    'aria-hidden="true">' + d + '</svg>'
  );
}

/** Trust strip under the hero. Facts only — see the note in pages.config.cjs. */
/**
 * Hero bullets. These were hardcoded in the template until a client build put
 * six insurance carrier names in the hero of a site whose own compliance rules
 * ban exactly that — the reference client's copy, shipped verbatim because it
 * lived in markup nobody thought of as content. They are config now.
 *
 * `text` is emitted as HTML so a bullet can carry an em dash and inline markup;
 * `lead` is the bold opening clause.
 */
/**
 * The static gtag.js loader.
 *
 * One tag per page and one `config` per ID — pasting the snippet from the Ads
 * UI on top of this is the obvious-looking move and it double-counts: two
 * loads of the library and two config calls for the same account.
 *
 * Ads ID wins when both are set, matching gtag's own guidance that the library
 * is loaded once with a primary ID and every other destination is configured
 * against it. Emits nothing when neither is set, so a build with no account yet
 * ships no tag rather than a request to `?id=`.
 */
function gtagSrcHtml() {
  /* A REPLACE__ placeholder is a non-empty string and would sail straight
     through a truthiness check, emitting `?id=REPLACE__AW-0000000000` — a real
     request to Google carrying a junk ID, on every page of a half-configured
     build. Preflight blocks the SHIP, not the build, so anyone previewing
     locally would have been firing those. Unconfigured means empty OR
     placeholder. */
  const real = (v) => (v && !String(v).startsWith('REPLACE__') ? String(v) : '');
  const primary = real(site.ads && site.ads.conversionId) || real(site.ads && site.ads.ga4Id);
  if (!primary) return '';
  return '<script async src="https://www.googletagmanager.com/gtag/js?id=' +
         encodeURIComponent(primary) + '"></' + 'script>';
}

function heroBulletsHtml() {
  const items = (cfg.site && cfg.site.heroBullets) || [];
  if (!items.length) return '';
  const check = '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" ' +
    'stroke="currentColor" stroke-width="2.6" stroke-linecap="round" ' +
    'stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
  return items
    .map((b) => '<li>' + check + '<span><strong>' + b.lead + '</strong> ' + b.text + '</span></li>')
    .join('\n          ');
}

function trustStripHtml() {
  const items = cfg.trust || [];
  if (!items.length) return '';
  return items
    .map(
      (t) =>
        '<div>' + icon(t.icon) + '<div><b>' + esc(t.label) + '</b><span>' +
        esc(t.sub) + '</span></div></div>'
    )
    .join('\n      ');
}

/**
 * Stat band. Every number is derived from real data, never authored — the
 * review figures come straight from reviews.json and drop out entirely when
 * there is no live review data, the same as every other rating claim.
 */
function statBandHtml() {
  /* data-count marks the figures that can be counted up on screen. The element
     already contains the final formatted value, so with no JS or reduced motion
     the correct number is simply there — the animation only ever replaces it
     temporarily. */
  const stats = [];
  if (reviews) {
    stats.push({ value: String(reviews.rating), label: 'average rating',
                 count: reviews.rating, decimals: 1 });
    stats.push({ value: fmtCount(reviews.count), label: 'Google reviews',
                 count: reviews.count, group: true });
  }
  if (site.established) {
    /* Years in business rather than "Since 2018": a short countable number
       instead of a two-line string, and it stays current on its own because the
       weekly review refresh rebuilds the site. */
    const years = new Date().getFullYear() - Number(site.established);
    if (years > 0) {
      stats.push({ value: String(years), label: 'years in business', count: years });
    }
  }
  /* Counties beat cities whenever the config names any. "5 cities covered"
     directly contradicted the coverage band on the same page, which promises
     seven counties from Miami to Naples — the stat made the business sound
     SMALLER than its own headline claim, which is the one direction a trust
     figure must never point.
     Still derived, never authored: this counts the entries in areaServed that
     are actually counties, so it cannot drift from what the site claims. A
     client whose areaServed lists no counties falls back to city pages. */
  const counties = (cfg.areaServed || []).filter((a) => /\bcount(y|ies)\b/i.test(a));
  if (counties.length) {
    stats.push({ value: String(counties.length), label: 'counties served',
                 count: counties.length });
  } else {
    stats.push({ value: String(cityPages.length), label: 'cities covered',
                 count: cityPages.length });
  }

  return stats
    .map((st) => {
      const attrs =
        st.count === undefined
          ? ''
          : ' data-count="' + esc(st.count) + '"' +
            (st.decimals ? ' data-decimals="' + st.decimals + '"' : '') +
            (st.group ? ' data-group="1"' : '');
      return '<div class="stat"><b' + attrs + '>' + esc(st.value) + '</b>' +
             '<span>' + esc(st.label) + '</span></div>';
    })
    .join('\n        ');
}

/**
 * Guarantee seal.
 *
 * Deliberately a SELF-ISSUED mark, not a third-party certification: it carries
 * the firm's own name and states the warranty the site already defines in full
 * further down the page. Nothing here implies an outside body has certified
 * anything. Do not restyle it to imitate a certification seal.
 */
function sealHtml() {
  /* The client's own warranty badge, as used on their main site. It is a
     SELF-ISSUED mark stating a promise this page defines in full directly
     beside it — not a third-party certification, and it must never be swapped
     for one that implies outside accreditation the business does not hold. */
  return (
    '<img class="seal" src="' + ASSET_PREFIX + '/img/warranty-badge.png" ' +
    'width="160" height="139" loading="lazy" decoding="async" alt="' +
    esc(site.legalName + ' lifetime workmanship warranty') + '">'
  );
}

/**
 * The service card grid.
 *
 * Built from the services array rather than written into the template, because
 * a card is a link: hand-maintained cards go stale the moment a slug is renamed
 * and produce a 404 on the highest-traffic block of the home page. A service
 * with no `card` simply does not get one.
 */
function serviceCardsHtml() {
  return (cfg.services || [])
    .filter((sv) => sv.card)
    .map((sv) =>
      '<a class="card" href="' + ASSET_PREFIX + '/' + esc(sv.slug) + '">' +
      '<div class="card-i">' + icon(sv.card.icon, { size: 24 }) + '</div>' +
      '<h3>' + sv.card.title + '</h3>' +
      '<p>' + sv.card.blurb + '</p>' +
      '<span class="card-link">' + sv.card.cta + ' \u2192</span>' +
      '</a>'
    )
    .join('\n      ');
}

/**
 * The money-and-law band.
 *
 * Each card states something about price, coverage or statute, which makes this
 * the copy most likely to get an ad account in trouble. It is config-driven so
 * the statutes cited move with the client's state instead of being inherited
 * from whoever the template was built for.
 */
function insuranceCardsHtml() {
  const cards = (cfg.insurance && cfg.insurance.cards) || [];
  return cards
    .map((c) => '<div class="card"><h3>' + c.h + '</h3>' + c.p + '</div>')
    .join('\n      ');
}

/** One photo, card-styled, with the .shot wrapper the watermark anchors to.
 *  Shared by the gallery and by the body chapters so a photo looks the same
 *  either way and only has to be described once in config. */
function figureHtml(g, imgCapPx) {
  return (
    '<figure' + (imgCapPx ? ' style="--fig-img-h:' + Math.round(imgCapPx) + 'px"' : '') + '>' +
    '<span class="shot">' +
    '<img src="' + ASSET_PREFIX + '/img/' + esc(g.src) + '" width="' + esc(g.w) +
    '" height="' + esc(g.h) + '" alt="' + esc(g.alt) + '" loading="lazy" decoding="async">' +
    '</span>' +
    (g.caption ? '<figcaption>' + esc(g.caption) + '</figcaption>' : '') +
    '</figure>'
  );
}

/** Resolve a body figure against the gallery config, so src, dimensions, alt
 *  text and caption are written once. A page names a photo; it does not
 *  re-describe it. */
function galleryEntry(src) {
  /* bodyPhotos first: keeping the two pools separate is what lets the gallery
     stay a full six-up grid on every page while the bodies still get their own
     photography. A photo that IS in the gallery may still be named here — it is
     then dropped from that page's grid, which is the older behaviour. */
  const g = (cfg.bodyPhotos || []).concat(cfg.gallery || []).find((x) => x.src === src);
  if (!g) {
    throw new Error(
      'figures references "' + src + '", which is in neither cfg.bodyPhotos nor ' +
      'cfg.gallery. Those arrays are where src/w/h/alt/caption live; name it here.'
    );
  }
  return g;
}

/**
 * Photo gallery.
 *
 * Photos already used in THIS page's body are dropped: the same photograph
 * twice on one page reads as a thin library rather than a rich one. The grid's
 * nth-last-child rules keep the last row symmetric at any count, so removing
 * one or two costs nothing visually. verify.cjs asserts no page repeats a shot.
 */
function galleryHtml(page) {
  const used = new Set(((page && page.figures) || []).map((f) => f.src));
  const shots = (cfg.gallery || []).filter((g) => !used.has(g.src));
  if (!shots.length) return '';
  return shots.map(figureHtml).join('\n        ');
}

/**
 * The per-page body, split into chapters at each top-level <h2>.
 *
 * It used to render as one 56ch column centred in a 1180px container, which
 * left more than half the desktop width empty beside a 400-900 word wall of
 * text. Splitting at the headings gives the photographs somewhere to go:
 *
 *   .pchap       heading and prose in the reading column, nothing in the rail
 *                beside it. This is the default and the only one that scales:
 *                there are 98 h2 chapters across a site like this and a handful
 *                of real photographs, so a photo beside every block is not
 *                reachable, and recycling the same six across all of them would
 *                look worse than the wall of text does.
 *   .pchap-fig   the same chapter with a photo in the rail. Only where
 *                `figures` names a photo that genuinely illustrates that
 *                chapter.
 *
 * Both put the heading and the prose in the SAME column at the SAME left edge
 * — see the .pchap grid in template.html. The two used to be laid out
 * separately, which gave the prose three different left edges on one page and
 * stranded every un-illustrated chapter in a narrow centred column. A chapter
 * having a photo is not a reason to move its text.
 */
function proseHtml(page) {
  const byChapter = new Map();
  for (const f of page.figures || []) byChapter.set(f.chapter, f);

  /* Split before an <h2> that starts a line. Every body is authored that way
     and callouts use <h3>, so this cannot catch a nested heading. */
  const parts = page.body.trim().split(/\n(?=<h2>)/);

  /* Fill every chapter that has no explicit figure from the bodyPhotos pool.
   *
   * A chapter block comes in two shapes — with a photo and without — and they
   * are different widths. A page that mixes them shows two different block
   * edges, which is what a client sees and reports as "some full width and some
   * in the centre". Rather than force the two shapes to agree, this removes the
   * second shape: illustrate everything and every block is the same by
   * construction.
   *
   * Photos repeat ACROSS pages, which is fine and always has been — nobody
   * reads two city pages side by side, and a real photograph reused beats a
   * stock one that is not this business. What must not happen is a repeat
   * WITHIN a page, so anything already used here is excluded from the pool.
   *
   * If the pool runs out the chapter stays unillustrated, and the CSS fallback
   * keeps it at the same block width and the same text column rather than
   * re-centring it. That path is for a client with fewer photos than chapters,
   * not for this one. */
  const used = new Set([...byChapter.values()].map((f) => f.src));
  const pool = (cfg.bodyPhotos || []).filter((b) => !used.has(b.src));

  /* Pair each chapter with the photo whose RENDERED HEIGHT is closest to the
     height of the text beside it.

     This used to be `portraits.concat(landscapes)` against chapters sorted
     longest-first, on the reasoning that long prose needs a tall photo. The
     reasoning is right and the implementation only half-delivered it: it hands
     out every portrait before it reaches the first landscape, so on a page with
     four chapters and four portraits in the pool the SHORTEST chapter got a
     portrait too. A 640px photo beside 300px of text left 340px of dead rail —
     the single most-reported layout complaint on this build.

     Both figure heights are derived from the layout rather than hardcoded, so
     this stays correct if the column ratio or the wrap width changes. */
  const FIG_COL = (CHAP_MAX_W - CHAP_GAP) * CHAP_FIG_FR / (CHAP_TEXT_FR + CHAP_FIG_FR);
  const PROSE_COL = (CHAP_MAX_W - CHAP_GAP) * CHAP_TEXT_FR / (CHAP_TEXT_FR + CHAP_FIG_FR);
  /* Caption is one or two lines at .875rem/1.5 plus 12/16px padding. */
  const CAPTION_H = 70;
  const figHeight = (b) => Math.min(b.h / b.w * FIG_COL, CHAP_IMG_MAX_H) + CAPTION_H;

  /* Text height from character count. Calibrated against measured renders on
     this template: ~62 characters to a 498px line at the prose size, ~30px per
     line, plus a two-line h2. Crude on purpose — it only ever has to choose
     between a ~640px portrait and a ~320px landscape, and it is scale-free
     enough to survive a different type ramp. */
  const CHAR_W = 8.05, LINE_H = 30, HEAD_H = 88;
  const textHeight = (chars) => HEAD_H + Math.ceil(chars / (PROSE_COL / CHAR_W)) * LINE_H;

  /* Per-chapter image cap, emitted as --fig-img-h on the figure.
   *
   * The global cap in the CSS was raised 470 -> 620 on the reasoning that
   * portraits only ever land beside the LONGEST chapters, where a tall photo is
   * what the rail wants. Pairing does aim for that, but it cannot honour it for
   * a figure the page pins explicitly — and pinning is an editorial choice about
   * WHICH photo, not about how tall it should be. The result was a 639px
   * portrait beside 187px of prose: 452px of empty rail on the Tualatin page,
   * and twelve more chapters over 150px.
   *
   * So the cap becomes per-chapter: crop the photo toward the height of the text
   * it illustrates. object-fit:cover with the default centre origin, so the crop
   * takes equal slices off the top and bottom and keeps the subject.
   *
   * MIN_IMG_H is the floor. Below roughly this the crop stops reading as a
   * photograph of anything and starts reading as a letterboxed strip, which is
   * worse than the gap it fixes. A chapter shorter than that keeps some slack,
   * and that is the correct trade. */
  const MIN_IMG_H = 320;
  const imgCap = (g, chars) => {
    if (!g || !g.w || !g.h) return 0;
    const natural = Math.min(g.h / g.w * FIG_COL, CHAP_IMG_MAX_H);
    const want = textHeight(chars) - CAPTION_H;
    const capped = Math.max(MIN_IMG_H, Math.min(want, natural));
    /* Only emit when it actually crops, and only when the saving is worth an
       inline style — a 20px trim is not worth the attribute on every figure. */
    return capped < natural - 24 ? capped : 0;
  };

  /* Opt-OUT, not opt-in: `bodyPhotoFill !== false` rather than a truthiness
     test. The template config carries `bodyPhotoFill: true` and this client's
     does not carry the key at all, so a truthy check would fill one repo and
     silently stop filling the other — the exact split-brain the shared
     generator exists to prevent. Absent means on; only an explicit false
     disables it, for a client whose photo pool is genuinely smaller than its
     chapter count. */
  const needFill = [];
  if (cfg.bodyPhotoFill !== false) {
    for (let i = 0; i < parts.length; i++) if (!byChapter.has(i)) needFill.push(i);
  }
  /* Longest prose first, measured on the chapter text with tags stripped so a
     markup-heavy callout does not count as length. Longest-first matters: the
     tall chapters are the ones with only one good answer, so they choose before
     the short ones start competing for the same landscape. */
  const weight = (i) => parts[i].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').length;
  needFill.sort((a, b) => weight(b) - weight(a));

  const remaining = pool.slice();
  needFill.forEach((chapterIndex) => {
    if (!remaining.length) return;
    const want = textHeight(weight(chapterIndex));
    let best = 0;
    for (let n = 1; n < remaining.length; n++) {
      if (Math.abs(figHeight(remaining[n]) - want) < Math.abs(figHeight(remaining[best]) - want)) best = n;
    }
    byChapter.set(chapterIndex, { chapter: chapterIndex, src: remaining[best].src });
    remaining.splice(best, 1);
  });

  /* Alternation is back, and it is only defensible because every chapter is now
     illustrated. Alternating the photo moves the prose between two positions
     inside the block; when some chapters had no photo that read as text which
     would not sit still, but when all of them do it reads as rhythm. If a future
     client's pool runs short, revisit this before revisiting the CSS. */
  let illustrated = 0;

  const chapters = parts.map((part, i) => {
    const m = /^<h2>([\s\S]*?)<\/h2>\s*/.exec(part);
    const heading = m ? '<h2>' + m[1] + '</h2>' : '';
    const rest = m ? part.slice(m[0].length) : part;
    const fig = byChapter.get(i);

    if (!fig) {
      return '<div class="pchap">' + heading + '<div class="prose">' + rest + '</div></div>';
    }
    const alt = illustrated++ % 2 === 1 ? ' pchap-alt' : '';
    /* Heading, figure and prose as three siblings rather than a figure beside a
       wrapped heading+prose. Source order is what a phone gets, and heading ->
       photo -> text is the readable order there; on desktop grid-template-areas
       lifts the figure into its own column spanning both rows. Wrapping the text
       instead delivered the photo before its own heading on mobile. */
    return (
      '<div class="pchap pchap-fig' + alt + '">' +
      heading +
      figureHtml(galleryEntry(fig.src), imgCap(galleryEntry(fig.src), weight(i))) +
      '<div class="prose">' + rest + '</div>' +
      '</div>'
    );
  });

  return '<div class="chaps">' + chapters.join('\n      ') + '</div>';
}

/* Official four-colour Google mark, inlined. Never recoloured, never distorted:
   Google's brand terms require the mark be used as supplied, and .rev-g fixes
   its box so flex cannot squash it. Decorative here — the card already says
   "Verified Google reviews" in text — so it is hidden from assistive tech. */
const GOOGLE_G_SM =
  '<svg class="rb-g" viewBox="0 0 48 48" aria-hidden="true" focusable="false">' +
  '<path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>' +
  '<path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>' +
  '<path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z"/>' +
  '<path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"/>' +
  '</svg>';

const GOOGLE_G =
  '<svg class="rev-g" viewBox="0 0 48 48" aria-hidden="true" focusable="false">' +
  '<path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>' +
  '<path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>' +
  '<path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z"/>' +
  '<path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"/>' +
  '</svg>';

/** First letter of the reviewer's name, for the avatar disc. */
function initial(name) {
  const c = String(name || '').trim().charAt(0).toUpperCase();
  return /[A-Z0-9]/.test(c) ? c : '★';
}

/* Avatar colours, every one of them checked at >= 4.5:1 against the white
   initial (measured, not eyeballed — the lightest, #1A73E8, is 4.51:1). Chosen
   by name hash so a reviewer keeps the same colour between builds instead of
   flickering each time the reviews refresh. */
const AVATAR_COLORS = ['#1967D2', '#188038', '#C5221F', '#7B1FA2', '#8E5000', '#0F5C8C', '#3C4043'];
function avatarColor(name) {
  let h = 0;
  const s = String(name || '');
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

/* ------------------------------------------------------ migration redirects */

const migration = cfg.migration || { preserve: [], redirects: [] };

/** Normalise to a leading-slash, no-trailing-slash path. Accepts a full URL. */
function normPath(u) {
  let s = String(u || '').trim();
  if (!s) return '';
  s = s.replace(/^https?:\/\/[^/]+/i, '');   // strip origin if a full URL was pasted
  s = s.split('#')[0].split('?')[0];         // and any query or fragment
  if (!s.startsWith('/')) s = '/' + s;
  if (s.length > 1) s = s.replace(/\/+$/, '');
  return s;
}

/**
 * Rewrite the `redirects` key of the root vercel.json in place.
 *
 * 301 rather than 302: a permanent redirect passes link equity and tells Google
 * the move is final. A 302 leaves the old URL as the canonical one, which is
 * the opposite of what a migration wants.
 */
function writeRootRedirects() {
  const file = path.join(ROOT, 'vercel.json');
  if (!fs.existsSync(file)) return;
  const raw = fs.readFileSync(file, 'utf8');
  const conf = JSON.parse(raw);
  const list = (migration.redirects || []).map((r) => ({
    source: normPath(r.from),
    destination: normPath(r.to),
    permanent: true
  }));

  /* Only rewrite when the redirects actually differ. JSON.stringify reformats
     the whole file, so writing unconditionally would put a cosmetic diff in
     every single build on sites that have no redirects at all. */
  const current = JSON.stringify(conf.redirects || []);
  if (current === JSON.stringify(list)) return;

  if (list.length) conf.redirects = list;
  else delete conf.redirects;
  fs.writeFileSync(file, JSON.stringify(conf, null, 2) + '\n');
  console.log('[build] wrote ' + list.length + ' migration redirect(s) to vercel.json');
}

function reviewsSectionHtml() {
  if (!reviews || !reviews.quotes.length) {
    return (
      '<div class="rev-empty">' +
      '<p>' + esc(site.legalName) + ' has been serving ' + esc(site.regionPhrase) +
      ' drivers since ' + esc(site.established) +
      '. Every review on our Google listing is from a real customer — read them yourself:</p>' +
      '<a class="btn btn-ghost" href="' +
      esc(mapsUrl) +
      '" target="_blank" rel="noopener">See our reviews on Google</a>' +
      '</div>'
    );
  }
  const cards = reviews.quotes
    .map(
      (q) =>
        '<figure class="rev">' +
        /* figcaption is legal as the first child of a figure, which lets the
           header sit above the quote where Google puts it. */
        '<figcaption class="rev-head">' +
        '<span class="rev-av" style="--av-bg:' + avatarColor(q.author) + '" aria-hidden="true">' +
        esc(initial(q.author)) +
        '</span>' +
        '<span class="rev-id">' +
        '<span class="rev-name">' + esc(q.author) + '</span>' +
        (q.when ? '<span class="rev-when">' + esc(q.when) + '</span>' : '') +
        '</span>' +
        GOOGLE_G +
        '</figcaption>' +
        '<div class="stars" aria-label="5 out of 5 stars">' +
        starRow(5) +
        '</div>' +
        '<blockquote>' +
        esc(q.text) +
        '</blockquote>' +
        '</figure>'
    )
    .join('\n          ');

  return (
    cards +
    '\n          <p class="rev-foot">' +
    'Verified Google reviews for ' + esc(site.legalName) + ' · ' +
    '<a href="' +
    esc(mapsUrl) +
    '" target="_blank" rel="noopener">read all ' +
    esc(fmtCount(reviews.count)) +
    ' on Google</a></p>'
  );
}

/* ------------------------------------------------------ Google listing + map
 * The value here is the verified Google listing behind the rating, not a
 * "come see us" pin. That distinction matters whenever the registered address
 * is not in the area the ads target: an embedded map of a city the customer
 * cannot visit is misleading unless the copy says so plainly, which is what
 * site.serviceArea.mapNote is for. Uses the keyless maps embed — no
 * browser-exposed API key. */
function mapBlockHtml() {
  const q = encodeURIComponent(
    site.address.street + ', ' + site.address.city + ', ' +
    site.address.region + ' ' + site.address.zip
  );
  const embed = 'https://maps.google.com/maps?q=' + q + '&z=15&output=embed';

  const heading = reviews
    ? esc(reviews.rating) + ' stars from ' + esc(fmtCount(reviews.count)) +
      ' Google reviews'
    : 'Our Google listing';

  const ratingRow = reviews
    ? '<div class="gscore" data-animate>' +
      '<div class="gscore-head">' + GOOGLE_G_SM + '<span>Google Reviews</span></div>' +
      '<div class="gscore-row">' +
      '<div class="big">' + esc(reviews.rating) + '</div>' +
      '<div><div class="stars" aria-label="' +
      esc(reviews.rating + ' out of 5 stars') + '">' + starRow(reviews.rating) + '</div>' +
      '<p class="mapnote" style="margin:4px 0 0">' +
      esc(fmtCount(reviews.count)) + ' reviews</p></div>' +
      '</div></div>'
    : '';

  return (
    '<div class="sec-head center">' +
      /* The eyebrow said "Verified on Google" in plain text while the card
         below carried the actual mark. Put the mark on the claim itself — this
         is the line doing the verifying. */
      '<span class="eyebrow eyebrow-g">' + GOOGLE_G_SM + 'Verified on Google</span>' +
      '<h2>' + heading + '</h2>' +
      (reviews
        ? '<div class="head-stars" data-animate aria-hidden="true">' + starRow(reviews.rating) + '</div>'
        : '') +
      (site.serviceArea.mapNote
        ? '<p class="lead">' + site.serviceArea.mapNote + '</p>'
        : '') +
    '</div>' +
    '<div class="mapgrid">' +
      '<div class="mapframe">' +
        '<iframe src="' + esc(embed) + '" loading="lazy" referrerpolicy="no-referrer-when-downgrade" ' +
        /* Attribute, so it must be escaped — but the config strings are
           authored HTML and may already carry entities. plain() decodes first
           so esc() cannot double-escape an &amp; into &amp;amp;. */
        'title="' + esc(plain('Map showing ' + site.name + ' in ' + site.address.city + ', ' +
          site.address.region)) + '"></iframe>' +
      '</div>' +
      '<div class="mapinfo">' +
        ratingRow +
        '<dl>' +
          '<div><dt>' + (site.serviceArea.addressLabel || 'Registered address') + '</dt>' +
            '<dd>' + esc(site.address.street) + '<br>' +
            esc(site.address.city) + ', ' + esc(site.address.region) + ' ' + esc(site.address.zip) + '</dd></div>' +
          '<div><dt>Service area</dt><dd>' + site.serviceArea.label +
            (site.serviceArea.qualifier ? ' \u2014 ' + site.serviceArea.qualifier : '') + '</dd></div>' +
          '<div><dt>Hours</dt><dd>' + esc(hoursLine()) + '</dd></div>' +
        '</dl>' +
        (mapsUrl
          ? '<a class="btn btn-ghost" href="' + esc(mapsUrl) + '" target="_blank" rel="noopener">' +
            'View our Google listing</a>'
          : '') +
      '</div>' +
    '</div>'
  );
}

/* ---------------------------------------------------------------- FAQ block */

function faqHtml(faq) {
  return faq
    .map(
      (f, i) =>
        '<div class="faq">' +
        '<button type="button" aria-expanded="false" aria-controls="faq-a-' +
        i +
        '" id="faq-q-' +
        i +
        '">' +
        '<span>' +
        esc(f.q) +
        '</span><span class="chev" aria-hidden="true"></span>' +
        '</button>' +
        '<div class="ans" id="faq-a-' +
        i +
        '" role="region" aria-labelledby="faq-q-' +
        i +
        '"><div class="ans-in">' +
        f.a +
        '</div></div>' +
        '</div>'
    )
    .join('\n          ');
}

/* ------------------------------------------------------------- JSON-LD */

/* "Mon–Fri 8:00am–6:30pm · Sat 8:00am–4:00pm · Sun closed", built from the
   same site.hours the JSON-LD uses so the two can never drift apart. Consecutive
   days sharing a window collapse into a range. */
const DAY_SHORT = { Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu',
                    Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun' };

function clock(hhmm) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(hhmm || ''));
  if (!m) return String(hhmm || '');
  const h = Number(m[1]);
  const suffix = h >= 12 ? 'pm' : 'am';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return h12 + ':' + m[2] + suffix;
}

function hoursLine() {
  return (site.hours || [])
    .map((h) => {
      const days = h.days.map((d) => DAY_SHORT[d] || d);
      const label = days.length > 1 ? days[0] + '\u2013' + days[days.length - 1] : days[0];
      return label + ' ' + (h.closed ? 'closed' : clock(h.opens) + '\u2013' + clock(h.closes));
    })
    .join(' \u00b7 ');
}

function openingHours() {
  return site.hours
    .filter((h) => !h.closed)
    .map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.days,
      opens: h.opens,
      closes: h.closes
    }));
}

function localBusinessLd(page) {
  const ld = {
    '@context': 'https://schema.org',
    '@type': site.schemaType,
    '@id': 'https://' + site.domain + '/#business',
    name: site.name,
    telephone: site.phoneE164,
    url: absUrl(page.slug),
    image: 'https://' + site.domain + '/img/' + site.ogImage,
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      postalCode: site.address.zip,
      addressCountry: 'US'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: site.geo.lat,
      longitude: site.geo.lng
    },
    areaServed: cfg.areaServed.map((c) => ({ '@type': 'City', name: c })),
    openingHoursSpecification: openingHours()
  };
  if (site.email) ld.email = site.email;
  if (mapsUrl) ld.hasMap = mapsUrl;
  if (site.sameAs && site.sameAs.length) ld.sameAs = site.sameAs;

  /* Only ever attach a rating when we actually have live review data. */
  if (reviews) {
    ld.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: String(reviews.rating),
      reviewCount: String(reviews.count),
      bestRating: '5',
      worstRating: '1'
    };
  }
  return ld;
}

function faqLd(page) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: page.faq.map((f) => ({
      '@type': 'Question',
      name: plain(f.q),
      acceptedAnswer: { '@type': 'Answer', text: plain(f.a) }
    }))
  };
}

function breadcrumbLd(page) {
  if (page.slug === '/') return null;
  const items = [{ '@type': 'ListItem', position: 1, name: 'Home', item: absUrl('/') }];
  items.push({
    '@type': 'ListItem',
    position: 2,
    name: plain(page.shortLabel || page.navLabel),
    item: absUrl(page.slug)
  });
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items };
}

function jsonLdHtml(page) {
  const blocks = [localBusinessLd(page), faqLd(page), breadcrumbLd(page)].filter(Boolean);
  return blocks
    .map(
      (b) =>
        '<script type="application/ld+json">' +
        JSON.stringify(b).replace(/</g, '\\u003c') +
        '</script>'
    )
    .join('\n');
}

/**
 * Trust cluster inside the footer identity panel.
 *
 * That panel exists to state the registered identity, and on desktop it left
 * most of its own width empty. What fills it has to be things this page has
 * ALREADY substantiated further up — the footer is the last place to introduce
 * a new claim, because it is exactly where a cautious buyer goes to check the
 * ones already made.
 *
 * So: the real Google rating, omitted entirely when there is no live review
 * data, plus whatever site.footerBadges lists. Those badges must restate page
 * facts. Never a third-party accreditation, certification or carrier
 * relationship the business does not hold — a badge shape reads as "somebody
 * else verified this", which is the whole reason it is tempting and the whole
 * reason it is a problem.
 */
function barTrustHtml() {
  const items = [];

  if (reviews) {
    items.push(
      '<div class="bt">' + GOOGLE_G_SM +
      '<div><b>' + esc(reviews.rating) + ' out of 5 on Google</b>' +
      '<span>' + esc(fmtCount(reviews.count)) + ' reviews</span></div></div>'
    );
  }

  for (const b of site.footerBadges || []) {
    items.push(
      '<div class="bt">' + icon(b.icon, { size: 18, cls: 'bt-i' }) +
      '<div><b>' + b.label + '</b>' +
      (b.sub ? '<span>' + b.sub + '</span>' : '') + '</div></div>'
    );
  }

  if (!items.length) return '';
  return '<div class="bar-trust">' + items.join('') + '</div>';
}

/* ------------------------------------------- regulator registration block
 * Many licensed trades must show a registration number in internet advertising.
 * California auto glass is one: 16 CCR § 3371.2 requires a registered
 * Automotive Repair Dealer's internet advertising to carry the registered firm
 * name, the ARD registration number and the BAR-registered phone. Contractors,
 * HVAC, electrical, pest control and locksmiths all have equivalents in most
 * states, and the wording of the authority differs every time — so it is
 * configured, not hardcoded.
 *
 * With no registration number configured we cannot show a real one, and a
 * placeholder on a live page is worse than omitting it. The block degrades to
 * plain name / phone / address (still DNI-excluded, which the Google call asset
 * needs anyway).
 *
 * Set site.compliance.registration.number to switch the full block on. */
const REG = (site.compliance && site.compliance.registration) || {};
const cards = cfg.serviceCards || {};
const ins = cfg.insurance || {};
const insCards = ins.cards || [];

function applyRegistrationBlock(s) {
  if (REG.number) {
    return s
      .replace(/\{\{REG_AUTHORITY\}\}/g, esc(REG.authority || ''))
      .replace(/\{\{REG_LABEL\}\}/g, esc(REG.label || 'Registration'))
      .replace(/\{\{REG_NUMBER\}\}/g, esc(REG.number));
  }
  /* Drop the registration line AND the registered-telephone line entirely —
   * with no number there is nothing to comply with, and leaving a bare
   * unlabelled number next to the call-asset number just reads as two random
   * phone numbers. The call-asset line stays: Google verifies that number
   * appears on the site. */
  return s
    .replace(/ · \{\{REG_AUTHORITY\}\} \{\{REG_LABEL\}\} <b>\{\{REG_NUMBER\}\}<\/b>/g, '')
    .replace(/\s*Registered telephone: <a[^>]*>\{\{REG_PHONE\}\}<\/a><br>/g, '');
}

/* ------------------------------------------------------------ page renderer */

const template = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf8');

function renderPage(page) {
  let s = template;

  const title = page.title;
  const desc = page.desc;

  /* ---- head ---- */
  s = s.replace(/<title>[\s\S]*?<\/title>/, '<title>' + esc(title) + '</title>');
  s = s.replace(
    /<meta name="description" content="[\s\S]*?">/,
    '<meta name="description" content="' + esc(desc) + '">'
  );
  s = s.replace(
    /<link rel="canonical" href="[\s\S]*?">/,
    '<link rel="canonical" href="' + esc(absUrl(page.slug)) + '">'
  );
  s = s.replace(
    /<meta property="og:title" content="[\s\S]*?">/,
    '<meta property="og:title" content="' + esc(page.ogTitle || title) + '">'
  );
  s = s.replace(
    /<meta property="og:description" content="[\s\S]*?">/,
    '<meta property="og:description" content="' + esc(desc) + '">'
  );
  s = s.replace(
    /<meta property="og:url" content="[\s\S]*?">/,
    '<meta property="og:url" content="' + esc(absUrl(page.slug)) + '">'
  );
  s = s.replace(
    /<meta name="twitter:title" content="[\s\S]*?">/,
    '<meta name="twitter:title" content="' + esc(page.ogTitle || title) + '">'
  );
  s = s.replace(
    /<meta name="twitter:description" content="[\s\S]*?">/,
    '<meta name="twitter:description" content="' + esc(desc) + '">'
  );

  /* ---- content regions ---- */
  s = region(s, 'EYEBROW', page.eyebrow);   // authored HTML — already entity-encoded
  s = region(s, 'H1', page.h1);
  s = region(s, 'SUB', page.sub);
  s = region(s, 'BODY', proseHtml(page));
  s = region(s, 'FAQ', faqHtml(page.faq));
  s = region(s, 'JSONLD', jsonLdHtml(page));
  s = region(s, 'NAV', navHtml);
  s = region(s, 'FOOTER_SERVICES', footerServices);
  s = region(s, 'FOOTER_AREA_A', footerAreaA);
  s = region(s, 'FOOTER_AREA_B', footerAreaB);
  s = section(s, 'INSURANCE', insCards.length > 0);
  s = section(s, 'INS_DISCLAIMER', Boolean(ins.disclaimer));
  /* Computed once: a page whose body uses every gallery photo has nothing left
     for the band, and the band has to go rather than render an empty grid. */
  const gallery = galleryHtml(page);
  s = section(s, 'GALLERY', Boolean(gallery));
  if (insCards.length) s = region(s, 'INSURANCE', insuranceCardsHtml());
  s = region(s, 'SERVICECARDS', serviceCardsHtml());
  /* Both rating elements are review-data dependent, so the bands come out
     entirely rather than rendering as empty boxes on a site whose Place ID has
     not been verified yet. */
  const ratingBar = ratingBarHtml();
  const hdrRating = headerRatingHtml();
  s = section(s, 'RATINGBAR', Boolean(ratingBar));
  s = section(s, 'HDRRATING', Boolean(hdrRating));
  if (ratingBar) s = region(s, 'RATINGBAR', ratingBar);
  if (hdrRating) s = region(s, 'HDRRATING', hdrRating);
  s = region(s, 'REVIEWS', reviewsSectionHtml());
  s = region(s, 'GTAGSRC', gtagSrcHtml());
  s = region(s, 'HEROBULLETS', heroBulletsHtml());
  s = region(s, 'TRUST', trustStripHtml());
  s = region(s, 'STATS', statBandHtml());
  /* Guarded because section() has already deleted the band — and with it the
     region marker — when there is nothing left to show. */
  if (gallery) s = region(s, 'GALLERY', gallery);
  s = region(s, 'SEAL', sealHtml());
  s = region(s, 'MAPBLOCK', mapBlockHtml());

  /* ---- pre-select the matching service in the quote form ----
   * An ad for back glass should land on a form that already says back glass.
   * Remove any hardcoded selected first so exactly one option carries it. */
  s = s.replace(/(<select[^>]*id="svc"[\s\S]*?<\/select>)/, function (block) {
    let b = block.replace(/\s+selected(?=[\s>])/g, '');
    if (page.svcValue) {
      const re = new RegExp('(<option value="' + page.svcValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '")');
      b = b.replace(re, '$1 selected');
    }
    return b;
  });

  /* ---- rating claims outside the managed regions ----
   * With no live data, any prose that asserts a star rating must go. */
  if (!reviews) {
    s = s.replace(/<!--RATING-CLAIM-->[\s\S]*?<!--\/RATING-CLAIM-->/g, '');
  } else {
    s = s
      .replace(/\{\{RATING\}\}/g, esc(reviews.rating))
      .replace(/\{\{REVIEW_COUNT\}\}/g, esc(fmtCount(reviews.count)));
  }

  s = optionalRegion(s, 'BARTRUST', barTrustHtml());
  s = applyRegistrationBlock(s);

  /* ---- site-wide tokens ---- */
  s = s
    .replace(/\{\{PHONE_E164\}\}/g, esc(site.phoneE164))
    .replace(/\{\{PHONE\}\}/g, esc(site.phoneFormatted))
    .replace(/\{\{PHONE_DIGITS\}\}/g, esc(site.phoneE164.replace(/\D/g, '')))
    .replace(/\{\{CALL_ASSET_E164\}\}/g, esc(site.callAsset.e164))
    .replace(/\{\{CALL_ASSET\}\}/g, esc(site.callAsset.formatted))
    .replace(/\{\{REG_PHONE_E164\}\}/g, esc(REG.phoneE164 || site.phoneE164))
    .replace(/\{\{REG_PHONE\}\}/g, esc(REG.phoneFormatted || site.phoneFormatted))
    .replace(/\{\{BRAND_SHORT\}\}/g, esc(site.brandShort || site.legalName))
    .replace(/\{\{AREA\}\}/g, site.serviceArea.label)
    .replace(/\{\{AREA_SHORT\}\}/g, site.serviceArea.short || site.serviceArea.label)
    .replace(/\{\{AREA_NOTE\}\}/g, site.serviceArea.footerNote || '')
    .replace(/\{\{AREA_A\}\}/g, GROUPS[0].label)
    .replace(/\{\{AREA_B\}\}/g, GROUPS[1].label)
    .replace(/\{\{COVERAGE_LEAD\}\}/g, site.serviceArea.coverageLead || '')
    .replace(/\{\{FOOTER_BLURB\}\}/g, site.footerBlurb)
    .replace(/\{\{UTIL_NOTE\}\}/g, site.utilNote)
    .replace(/\{\{UTIL_NOTE_MORE\}\}/g, site.utilNoteMore || '')
    .replace(/\{\{CARDS_EYEBROW\}\}/g, cards.eyebrow || 'What we do')
    .replace(/\{\{CARDS_HEADING\}\}/g, cards.heading || '')
    .replace(/\{\{CARDS_LEAD\}\}/g, cards.lead || '')
    .replace(/\{\{INS_EYEBROW\}\}/g, ins.eyebrow || 'Insurance')
    .replace(/\{\{INS_HEADING\}\}/g, ins.heading || '')
    .replace(/\{\{INS_LEAD\}\}/g, ins.lead || '')
    .replace(/\{\{INS_DISCLAIMER\}\}/g, ins.disclaimer || '')
    .replace(/\{\{LOGO\}\}/g, esc(site.logo))
    .replace(/\{\{OG_IMAGE\}\}/g, esc(site.ogImage))
    .replace(/\{\{ORIGIN\}\}/g, 'https://' + site.domain)
    .replace(/\{\{LEGAL_NAME\}\}/g, esc(site.legalName))
    .replace(/\{\{EMAIL\}\}/g, esc(site.email))
    .replace(/\{\{DOMAIN\}\}/g, esc(site.domain))
    .replace(/\{\{MAPS_URL\}\}/g, esc(mapsUrl))
    .replace(/\{\{YEAR\}\}/g, String(new Date().getFullYear()))
    .replace(/\{\{ESTABLISHED\}\}/g, esc(site.established))
    .replace(/\{\{ADDRESS_STREET\}\}/g, esc(site.address.street))
    .replace(/\{\{ADDRESS_CITY\}\}/g, esc(site.address.city))
    .replace(/\{\{ADDRESS_REGION\}\}/g, esc(site.address.region))
    .replace(/\{\{ADDRESS_ZIP\}\}/g, esc(site.address.zip))
    .replace(/\{\{GHL_LOCATION_ID\}\}/g, esc(site.ghl.locationId))
    .replace(/\{\{GHL_POOL_ID\}\}/g, esc(site.ghl.poolId))
    .replace(/\{\{LEAD_WEBHOOK\}\}/g, site.ghl.webhook)
    .replace(/\{\{ADS_ID\}\}/g, esc(site.ads.conversionId))
    .replace(/\{\{ADS_LABEL\}\}/g, esc(site.ads.conversionLabel))
    .replace(/\{\{GA4_ID\}\}/g, esc(site.ads.ga4Id))
    .replace(/\{\{LEAD_VALUE\}\}/g, String(Number(site.ads.leadValue) || 0))
    .replace(/\{\{PAGE_KIND\}\}/g, esc(page.kind))
    .replace(/\{\{PAGE_PATH\}\}/g, esc(page.slug === '/' ? '/' : '/' + page.slug))
    .replace(/\{\{SOURCE_TAG\}\}/g, esc(site.sourceTag));

  /* ---- GHL number pool: only emit the DNI scripts once configured ---- */
  if (!site.ghl.locationId || !site.ghl.poolId) {
    s = s.replace(/<!--DNI-->[\s\S]*?<!--\/DNI-->/g, '');
  }

  /* ---- asset/link prefix rewrite ----
   * Rewrite EVERY attribute, not just href — a missed src= means every image
   * 404s from a root-served build. The bare form (no trailing slash) has to be
   * handled too or "/ASSET" is left dangling in the output. */
  s = s
    .replace(new RegExp('="' + ASSET_PREFIX + '/', 'g'), '="' + (BASE ? BASE + '/' : '/'))
    .replace(new RegExp('="' + ASSET_PREFIX + '(?=["#?])', 'g'), '="' + (BASE || '/'))
    .replace(new RegExp('\\("' + ASSET_PREFIX + '/', 'g'), '("' + (BASE ? BASE + '/' : '/'))
    .replace(new RegExp("url\\(" + ASSET_PREFIX + "/", 'g'), 'url(' + (BASE ? BASE + '/' : '/'));

  return s;
}

/* ------------------------------------------------- content-hashed image URLs
 * quote-site/img/* is served with `immutable, max-age=31536000`. That is the
 * right header for performance and completely wrong if the filename never
 * changes: re-crop a photo, keep the name, and every browser that already saw
 * it keeps the stale copy for a year. Hashing the filename means changed bytes
 * get a new URL, so the cache is busted automatically and unchanged files stay
 * cached. Learned the hard way. */
function hashImages(outdir) {
  const imgDir = path.join(outdir, 'img');
  if (!fs.existsSync(imgDir)) return {};
  const map = {};
  for (const name of fs.readdirSync(imgDir)) {
    const full = path.join(imgDir, name);
    if (!fs.statSync(full).isFile()) continue;
    const ext = path.extname(name);
    const base = name.slice(0, -ext.length);
    if (/\.[0-9a-f]{8}$/.test(base)) continue;               // already hashed
    const h = crypto.createHash('md5').update(fs.readFileSync(full)).digest('hex').slice(0, 8);
    const hashed = base + '.' + h + ext;
    fs.renameSync(full, path.join(imgDir, hashed));
    map[name] = hashed;
  }
  return map;
}

/** Rewrite every img/<name> reference in the generated text files. */
function applyImageHashes(outdir, map) {
  const names = Object.keys(map).sort((a, b) => b.length - a.length);  // longest first
  if (!names.length) return;
  const targets = [];
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) { if (e.name !== 'img') walk(full); }
      else if (/\.(html|webmanifest|xml|json|txt)$/.test(e.name)) targets.push(full);
    }
  })(outdir);
  for (const f of targets) {
    let s = fs.readFileSync(f, 'utf8'), changed = false;
    for (const n of names) {
      const re = new RegExp('img/' + n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      if (re.test(s)) { s = s.replace(re, 'img/' + map[n]); changed = true; }
    }
    if (changed) fs.writeFileSync(f, s);
  }
}

/* ------------------------------------------------------------------- output */

function rmrf(p) {
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}

function writeFile(rel, content) {
  const full = path.join(OUTDIR, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
}

function copyDir(from, to) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dst = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(src, dst);
    else fs.copyFileSync(src, dst);
  }
}

/* ---- build assertions: fail loudly rather than shipping duplicates ---- */
function assertUnique(field, label) {
  const seen = new Map();
  for (const p of contentPages) {
    const v = plain(p[field]).toLowerCase();
    if (!v) throw new Error('Page "' + p.slug + '" has an empty ' + label + '.');
    if (seen.has(v)) {
      throw new Error(
        'Duplicate ' + label + ' between "' + seen.get(v) + '" and "' + p.slug + '": ' + v
      );
    }
    seen.set(v, p.slug);
  }
}

function build() {
  assertUnique('title', 'title');
  assertUnique('desc', 'meta description');
  assertUnique('h1', 'H1');

  /* Slug collisions would silently overwrite a page. */
  const slugs = new Set();
  for (const p of contentPages) {
    if (slugs.has(p.slug)) throw new Error('Duplicate slug: ' + p.slug);
    slugs.add(p.slug);
  }

  rmrf(OUTDIR);
  fs.mkdirSync(OUTDIR, { recursive: true });

  /* pages */
  for (const p of contentPages) {
    const html = renderPage(p);
    writeFile(p.slug === '/' ? 'index.html' : p.slug + '/index.html', html);
  }

  /* standalone legal pages — same token + prefix treatment */
  for (const legal of [
    { file: 'legal-privacy.html', slug: 'privacy' },
    { file: 'legal-terms.html', slug: 'terms' }
  ]) {
    const src = path.join(__dirname, legal.file);
    if (!fs.existsSync(src)) {
      console.warn('[build] missing ' + legal.file + ' — skipping /' + legal.slug);
      continue;
    }
    let s = fs.readFileSync(src, 'utf8');
    /* Same generated link lists as every other page, so the legal pages can't
     * silently fall out of the internal link graph when a slug is added. */
    s = region(s, 'FOOTER_SERVICES', footerServices);
    s = region(s, 'FOOTER_AREA_A', footerAreaA);
    s = region(s, 'FOOTER_AREA_B', footerAreaB);
    s = optionalRegion(s, 'BARTRUST', barTrustHtml());
    s = applyRegistrationBlock(s);
    s = s
      .replace(/\{\{PHONE_E164\}\}/g, esc(site.phoneE164))
      .replace(/\{\{PHONE\}\}/g, esc(site.phoneFormatted))
      .replace(/\{\{CALL_ASSET_E164\}\}/g, esc(site.callAsset.e164))
      .replace(/\{\{CALL_ASSET\}\}/g, esc(site.callAsset.formatted))
      .replace(/\{\{REG_PHONE_E164\}\}/g, esc(REG.phoneE164 || site.phoneE164))
      .replace(/\{\{REG_PHONE\}\}/g, esc(REG.phoneFormatted || site.phoneFormatted))
      .replace(/\{\{BRAND_SHORT\}\}/g, esc(site.brandShort || site.legalName))
      .replace(/\{\{AREA\}\}/g, site.serviceArea.label)
      .replace(/\{\{AREA_SHORT\}\}/g, site.serviceArea.short || site.serviceArea.label)
      .replace(/\{\{AREA_NOTE\}\}/g, site.serviceArea.footerNote || '')
      .replace(/\{\{AREA_A\}\}/g, GROUPS[0].label)
      .replace(/\{\{AREA_B\}\}/g, GROUPS[1].label)
      .replace(/\{\{FOOTER_BLURB\}\}/g, site.footerBlurb)
      .replace(/\{\{LOGO\}\}/g, esc(site.logo))
      .replace(/\{\{OG_IMAGE\}\}/g, esc(site.ogImage))
    .replace(/\{\{ORIGIN\}\}/g, 'https://' + site.domain)
    .replace(/\{\{LEGAL_NAME\}\}/g, esc(site.legalName))
      .replace(/\{\{EMAIL\}\}/g, esc(site.email))
      .replace(/\{\{DOMAIN\}\}/g, esc(site.domain))
      .replace(/\{\{YEAR\}\}/g, String(new Date().getFullYear()))
      .replace(/\{\{ADDRESS_STREET\}\}/g, esc(site.address.street))
      .replace(/\{\{ADDRESS_CITY\}\}/g, esc(site.address.city))
      .replace(/\{\{ADDRESS_REGION\}\}/g, esc(site.address.region))
      .replace(/\{\{ADDRESS_ZIP\}\}/g, esc(site.address.zip))
      .replace(/\{\{CANONICAL\}\}/g, esc(absUrl(legal.slug)))
      .replace(new RegExp('="' + ASSET_PREFIX + '/', 'g'), '="' + (BASE ? BASE + '/' : '/'))
      .replace(new RegExp('="' + ASSET_PREFIX + '(?=["#?])', 'g'), '="' + (BASE || '/'));
    writeFile(legal.slug + '/index.html', s);
  }

  /* 404 — Vercel serves /404.html for any unmatched path. A typo'd final URL or
     an expired ad otherwise lands on Vercel's generic page: no logo, no phone,
     no way back, which on a paid click is a guaranteed bounce. Deliberately
     standalone rather than rendered through the template — it must keep working
     even if the template is mid-edit, and it carries no form or tracking. */
  writeFile(
    '404.html',
    '<!doctype html>\n<html lang="en">\n<head>\n' +
      '<meta charset="utf-8">\n' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">\n' +
      '<meta name="robots" content="noindex,follow">\n' +
      '<title>Page not found — ' + esc(site.legalName) + '</title>\n' +
      '<style>\n' +
      'body{margin:0;background:#F5FCFE;color:#0B1B2B;font:400 17px/1.6 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}\n' +
      '.w{max-width:640px;margin:0 auto;padding:56px 20px 72px;text-align:center}\n' +
      'h1{font-size:clamp(28px,6vw,40px);line-height:1.15;margin:24px 0 12px;letter-spacing:-.02em}\n' +
      'p{color:#4C5C6B;margin:0 0 28px}\n' +
      '.cta{display:inline-flex;align-items:center;justify-content:center;min-height:52px;padding:0 26px;' +
      'border-radius:12px;background:#CB4E1A;color:#fff;font-weight:700;text-decoration:none;font-size:18px}\n' +
      '.cta.alt{background:#fff;color:#0A2650;border:2px solid #C9DCE8;margin-left:10px}\n' +
      'nav{margin-top:40px;border-top:1px solid #D8E7EF;padding-top:28px}\n' +
      'nav b{display:block;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#4C5C6B;margin-bottom:14px}\n' +
      'nav a{display:inline-block;margin:0 10px 12px;color:#0A2650;font-weight:600}\n' +
      '@media(max-width:520px){.cta,.cta.alt{display:flex;margin:0 0 12px}}\n' +
      '</style>\n</head>\n<body>\n<div class="w">\n' +
      /* plain img/… path: applyImageHashes() rewrites it to the content-hashed
         filename below, the same as every other page. */
      '<img src="' + (BASE ? BASE : '') + '/img/' + esc(site.logo) + '" width="156" height="64" alt="' +
      esc(site.legalName) + '">\n' +
      '<h1>That page has moved or never existed</h1>\n' +
      '<p>' + site.notFoundNote + '</p>\n' +
      '<a class="cta" href="tel:' + esc(site.phoneE164) + '">Call ' + esc(site.phoneFormatted) + '</a>' +
      '<a class="cta alt" href="' + url('/') + '">Get a free quote</a>\n' +
      '<nav><b>Popular pages</b>\n' +
      cfg.nav
        .map((slug) => {
          const p = contentPages.find((x) => x.slug === slug);
          return '<a href="' + url(slug) + '">' + esc(p ? p.navLabel || p.shortLabel : slug) + '</a>';
        })
        .join('\n') +
      '\n</nav>\n</div>\n</body>\n</html>\n'
  );

  /* images + static assets */
  copyDir(path.join(__dirname, 'img'), path.join(OUTDIR, 'img'));

  /* favicon.ico is served from the root (browsers probe /favicon.ico directly) and
   * must NOT be content-hashed, so it is copied out and the img/ copy removed —
   * otherwise the same 60KB ships twice. */
  const icoSrc = path.join(__dirname, 'img', 'favicon.ico');
  if (fs.existsSync(icoSrc)) {
    fs.copyFileSync(icoSrc, path.join(OUTDIR, 'favicon.ico'));
    const dupe = path.join(OUTDIR, 'img', 'favicon.ico');
    if (fs.existsSync(dupe)) fs.unlinkSync(dupe);
  }

  /* manifest */
  writeFile(
    'site.webmanifest',
    JSON.stringify(
      {
        name: site.name,
        short_name: site.shortName || site.brandShort || site.name,
        icons: [
          { src: url('img/icon-192.png'), sizes: '192x192', type: 'image/png' },
          { src: url('img/icon-512.png'), sizes: '512x512', type: 'image/png' }
        ],
        theme_color: site.themeColor,
        background_color: '#FFFFFF',
        display: 'browser',
        start_url: url('/')
      },
      null,
      2
    )
  );

  /* sitemap — content pages only. The legal pages are deliberately noindex, and
     submitting a noindex URL just files a "Submitted URL marked noindex" error in
     Search Console against a report you want clean enough to read. */
  const today = new Date().toISOString().slice(0, 10);
  const sitemapUrls = contentPages.map((p) => ({
    loc: absUrl(p.slug),
    pri: p.slug === '/' ? '1.0' : p.kind === 'city' ? '0.7' : '0.8'
  }));

  writeFile(
    'sitemap.xml',
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      sitemapUrls
        .map(
          (u) =>
            '  <url><loc>' +
            u.loc +
            '</loc><lastmod>' +
            today +
            '</lastmod><priority>' +
            u.pri +
            '</priority></url>'
        )
        .join('\n') +
      '\n</urlset>\n'
  );

  writeFile(
    'robots.txt',
    'User-agent: *\nAllow: /\n\nSitemap: https://' + site.domain + '/sitemap.xml\n'
  );

  /* vercel.json — read by Vercel because Root Directory points at this folder */
  const vjson = path.join(__dirname, 'vercel-static.json');
  if (fs.existsSync(vjson)) {
    fs.copyFileSync(vjson, path.join(OUTDIR, 'vercel.json'));
  }

  /* Migration redirects go in the ROOT vercel.json, because that is the file
     Vercel reads when outputDirectory is set — the copy inside the output
     directory is ignored. Rewrite only the `redirects` key so hand-edited
     headers and outputDirectory survive. */
  writeRootRedirects();

  const imgMap = hashImages(OUTDIR);
  applyImageHashes(OUTDIR, imgMap);

  console.log('[build] wrote ' + contentPages.length + ' content pages + 2 legal → ' + OUTDIR);
  console.log('[build] content-hashed ' + Object.keys(imgMap).length + ' images (cache-busting)');
  console.log(
    '[build] reviews: ' +
      (reviews
        ? reviews.rating + '★ from ' + reviews.count + ' (' + reviews.quotes.length + ' quotes)'
        : 'NO DATA — rating claims stripped, aggregateRating omitted')
  );
  if (!site.ads.conversionId) {
    console.log('[build] NOTE: Google Ads conversion ID not set — tracking is a safe no-op.');
  }
  if (!site.ghl.webhook) {
    console.log('[build] NOTE: GHL webhook not set — form reports conversion and shows success.');
  }
}

build();
