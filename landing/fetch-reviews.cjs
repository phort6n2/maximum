#!/usr/bin/env node
/**
 * Weekly Google reviews fetch — Places API (New).
 *
 * Runs from CI only, once a week. Visitors never trigger the API and the key
 * never reaches the browser. Writes landing/reviews.json, which the generator
 * bakes into every page.
 *
 * Failure policy: this script must NEVER fail the build. Any error — missing
 * key, API outage, malformed response, wrong listing — exits 0 and leaves the
 * previous reviews.json untouched, so the site keeps the last known-good data
 * rather than blanking its social proof.
 *
 * Run locally:  GOOGLE_PLACES_API_KEY=... node landing/fetch-reviews.cjs
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const site = require(path.join(__dirname, 'pages.config.cjs')).site;

const OUT = path.join(__dirname, 'reviews.json');

/* -------------------------------------------------------------------------
 * Place ID.
 *
 * Place IDs are public — they appear in Google Maps URLs. Only the API key is
 * secret, so this is safe to commit.
 *
 * PLAYBOOK GOTCHA #1: a client-supplied Place ID once resolved to a DIFFERENT
 * company two doors down, and the build cheerfully published that other
 * business's rating and reviews across every page. A wrong Place ID fails
 * completely silently because the numbers it returns look plausible.
 * The EXPECT_* guards below are the defence. Do not remove them.
 * ---------------------------------------------------------------------- */
/* Client-supplied Place ID, from site.reviews.placeId. Place IDs are public —
 * they appear in Google Maps URLs — so this is safe to commit. Only the API key
 * is secret. Override with GOOGLE_PLACE_ID if it ever changes. */
const REV = (site.reviews || {});
const PLACE_ID = process.env.GOOGLE_PLACE_ID || REV.placeId || '';

/* --dry-run resolves the listing and prints what it found WITHOUT writing
 * reviews.json. Run this once before trusting a Place ID:
 *   GOOGLE_PLACES_API_KEY=... node landing/fetch-reviews.cjs --dry-run          */
const DRY_RUN = process.argv.includes('--dry-run');

/* The resolved listing must look like THIS business in THIS market, or we bail
 * without writing anything. All three come from site.reviews.expect so they
 * follow the client rather than being tuned for whoever this was built for. */
const rx = (src, fallback) => new RegExp(src || fallback, 'i');
const EXPECT_NAME     = rx(REV.expectName, '$^');
const EXPECT_VERTICAL = rx(REV.expectVertical, '');
const EXPECT_ADDRESS  = rx(REV.expectAddress, '$^');

const FIELDS = [
  'displayName',
  'formattedAddress',
  'rating',
  'userRatingCount',
  'googleMapsUri',
  'reviews'
].join(',');

function bail(msg) {
  console.error('[fetch-reviews] SKIPPED: ' + msg);
  console.error('[fetch-reviews] Leaving any existing reviews.json in place.');
  process.exit(0); // never fail the build
}

function get(url, fieldMask, apiKey) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      url,
      {
        method: 'GET',
        headers: {
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': fieldMask,
          Accept: 'application/json'
        },
        timeout: 20000
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          if (res.statusCode !== 200) {
            return reject(new Error('HTTP ' + res.statusCode + ' — ' + body.slice(0, 400)));
          }
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(new Error('unparseable JSON response'));
          }
        });
      }
    );
    req.on('timeout', () => req.destroy(new Error('request timed out')));
    req.on('error', reject);
    req.end();
  });
}

(async function main() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) bail('GOOGLE_PLACES_API_KEY is not set.');
  if (!PLACE_ID) {
    bail(
      'no Place ID configured. Set site.reviews.placeId (or the GOOGLE_PLACE_ID ' +
      'env/repo variable) to the verified Place ID for ' + site.name + ', then re-run.'
    );
  }

  let d;
  try {
    // Places API (New) — places.googleapis.com.
    // NOT places-backend.googleapis.com, which is the legacy API and 403s.
    d = await get(
      'https://places.googleapis.com/v1/places/' + encodeURIComponent(PLACE_ID),
      FIELDS,
      apiKey
    );
  } catch (e) {
    bail('Places API request failed — ' + e.message);
  }

  /* ---- Gotcha #1 guard: is this actually the right business? ---- */
  const placeName = (d.displayName && d.displayName.text) || '';
  const addr = d.formattedAddress || '';

  const wrong = !EXPECT_NAME.test(placeName)
    ? 'the name does not match site.reviews.expectName (' + EXPECT_NAME + ')'
    : !EXPECT_VERTICAL.test(placeName)
    ? 'the name does not match site.reviews.expectVertical (' + EXPECT_VERTICAL + ')'
    : !EXPECT_ADDRESS.test(addr)
    ? 'the address does not match site.reviews.expectAddress (' + EXPECT_ADDRESS + ')'
    : null;

  if (wrong) {
    bail(
      'resolved listing is "' + placeName + '" (' + addr + ') — ' + wrong + '. ' +
      'Verify the Place ID against the business\'s real Google Maps listing before publishing.'
    );
  }

  /* ---- Sanity-check the numbers before overwriting good data ---- */
  const rating = Number(d.rating);
  const count = Number(d.userRatingCount);
  if (!(rating >= 1 && rating <= 5)) bail('rating out of range: ' + d.rating);
  if (!(count >= 1)) bail('review count is not a positive number: ' + d.userRatingCount);

  /* ---- Pick quotable reviews: 5-star, readable length, top 3 ---- */
  const quotes = (Array.isArray(d.reviews) ? d.reviews : [])
    .map((r) => ({
      text: ((r.originalText && r.originalText.text) || (r.text && r.text.text) || '').trim(),
      author: (r.authorAttribution && r.authorAttribution.displayName) || 'Google reviewer',
      stars: Number(r.rating) || 0,
      when: r.relativePublishTimeDescription || ''
    }))
    /* Places API (New) returns at most 5 reviews, so the filter has to be
     * generous or we end up showing one card. Still 5-star only — we are not
     * padding the wall with 4-star reviews — but the length window is wide
     * enough to keep anything readable. Longest first: a substantial review is
     * more persuasive than a two-line one. */
    .filter((r) => r.stars === 5 && r.text.length >= 40 && r.text.length <= 650)
    .sort((a, b) => b.text.length - a.text.length)
    .slice(0, 3);

  if (DRY_RUN) {
    console.log('[fetch-reviews] DRY RUN — nothing written.');
    console.log('  place id : ' + PLACE_ID);
    console.log('  business : ' + placeName);
    console.log('  address  : ' + addr);
    console.log('  rating   : ' + rating + ' from ' + count + ' reviews');
    console.log('  maps     : ' + (d.googleMapsUri || '(none)'));
    console.log('');
    console.log('  >> Confirm the business name and address above really are');
    console.log('  >> ' + site.name + ' before running without --dry-run. A wrong');
    console.log('  >> Place ID returns perfectly plausible numbers for somebody else.');
    process.exit(0);
  }

  const out = {
    fetched_at: new Date().toISOString(),
    place_id: PLACE_ID,
    name: placeName,
    address: addr,
    rating: Math.round(rating * 10) / 10,
    count: count,
    maps_uri: d.googleMapsUri || '',
    quotes: quotes
  };

  fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');

  console.log('[fetch-reviews] OK');
  console.log('  business : ' + out.name);
  console.log('  address  : ' + out.address);
  console.log('  rating   : ' + out.rating + ' from ' + out.count + ' reviews');
  console.log('  quotes   : ' + quotes.length);
  if (!quotes.length) {
    console.log('  NOTE: no review passed the 5-star / 60-400 char filter — the build will');
    console.log('        show the rating and link to Google instead of quoting reviews.');
  }
})();
