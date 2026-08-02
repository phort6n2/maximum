#!/usr/bin/env node
/* Emits docs/google-ads-build-sheet.md — the paste-ready version of the plan in
 * docs/google-ads-launch.md. That doc explains the reasoning; this one is just
 * blocks you copy into the Google Ads UI, ad group by ad group.
 *
 * The RSA assets live here rather than in the markdown so they can be length-
 * checked on every run. Google silently truncates nothing — it rejects the
 * asset — so an over-length headline is a build error, not a warning.
 *
 *   node landing/ads-sheet.cjs
 */
'use strict';

const fs = require('fs');
const path = require('path');
const cfg = require('./pages.config.cjs');

const ORIGIN = 'https://' + cfg.site.domain;
const LIM = { headline: 30, description: 90, path: 15 };

/* ------------------------------------------------------------------ content
 *
 * This is the campaign, as data. It is here rather than in the markdown so that
 * every asset gets length-checked and compliance-checked on each run — Google
 * does not truncate an over-length headline, it rejects the asset, so an
 * over-length headline is a build error rather than a warning.
 *
 * WRITE THIS PER CLIENT. Do not carry another client's headlines across: two
 * shops in the same trade and market bidding identical copy compete with each
 * other and both look generic. A full worked example — 10 ad groups, 99
 * keywords, 141 headlines — lives in the speedyla repo if you want a model for
 * the shape and the density.
 *
 * Structure per group:
 *   name         'SVC | Thing — Angle' or 'GEO | Place'. The prefix is what
 *                makes the account navigable at 20+ groups.
 *   page         final URL path. Must be a page that actually built.
 *   share        rough budget share, for the plan doc.
 *   paths        the two display-URL path segments, ≤15 chars each.
 *   note         why this group exists and how to bid it.
 *   keywords     12ish. [exact] for head terms, "phrase" for the tail.
 *   headlines    12–15, each ≤30 chars, no duplicates within the group.
 *   descriptions exactly 4, each ≤90 chars.
 */

const GROUPS = [
{
  name: 'SVC | Windshield Replacement — Core',
  page: '/windshield-replacement',
  share: '~30%',
  paths: ['Windshield', 'Replacement'],
  note: 'The money group. Highest intent, highest ticket; protect its budget share and watch search terms for repair-intent queries leaking in.',
  keywords: [
    '[windshield replacement]',
    '[windshield replacement near me]',
    '[mobile windshield replacement]',
    '[replace windshield]',
    '[windshield replacement cost]',
    '"windshield replaced at home"',
    '"cracked windshield replacement"',
    '"new windshield"',
    '"windshield installation"'
  ],
  headlines: [
    'Mobile Windshield Replacement',
    'We Come to You in South FL',
    'Same-Day When Glass In Stock',
    'Lifetime Workmanship Warranty',
    'Insurance Claims Handled',
    'Quoted From Your Exact VIN',
    'Safe Drive-Away in Writing',
    'Replaced at Home or Work',
    'ADAS Recalibration Included',
    'The Van Is the Shop',
    'Maximum Glass Mobile Service',
    'Book Your Driveway Visit'
  ],
  descriptions: [
    'The van brings glass, urethane and tools to your driveway or office across South Florida.',
    'Quoted against your exact VIN so the glass on the van is the glass your vehicle takes.',
    'We set up the insurance claim and bill your carrier directly. Cash-pay quotes in writing.',
    'Lifetime workmanship warranty against water leaks and air noise, defined on the page.'
  ]
},
{
  name: 'SVC | Chip & Crack Repair',
  page: '/windshield-repair',
  share: '~15%',
  paths: ['Chip-Repair', 'Mobile'],
  note: 'Cheaper clicks, fast jobs, and the honest gateway to replacement work when damage is past repair.',
  keywords: [
    '[windshield repair]',
    '[windshield chip repair]',
    '[rock chip repair]',
    '[windshield crack repair]',
    '[windshield repair near me]',
    '"fix windshield chip"',
    '"cracked windshield repair"',
    '"stone chip windshield"'
  ],
  headlines: [
    'Windshield Chip Repair',
    'Stop the Crack Before It Runs',
    'Repaired at Your Driveway',
    'Quick Mobile Chip Fix',
    'Florida Heat Spreads Chips',
    'Resin Repair, UV-Cured',
    'Honest Repair-or-Replace Call',
    'Mobile Across South Florida',
    'Send a Photo, Get an Answer',
    'Small Job Now, Not Glass Later',
    'Maximum Glass Chip Repair',
    'Book Before It Spreads'
  ],
  descriptions: [
    'Resin injection stops a chip becoming a crack — done at your kerb, home or workplace.',
    'Florida heat works every chip toward a crack. Caught early, the fix is small and quick.',
    'If the damage is past repairing we say so, with the replacement figure next to it.',
    'Send a close-up photo with the quote form and we name the break and the right fix.'
  ]
},
{
  name: 'SVC | Auto Glass — General',
  page: '/auto-glass-repair',
  share: '~15%',
  paths: ['Auto-Glass', 'Repair'],
  note: 'Generic and diagnostic intent. The page routes symptoms to the right service, so broad match here is safer than in the core group.',
  keywords: [
    '[auto glass repair]',
    '[auto glass near me]',
    '[auto glass replacement]',
    '[car glass repair]',
    '[mobile auto glass]',
    '"auto glass service"',
    '"car glass replacement near me"',
    '"vehicle glass repair"'
  ],
  headlines: [
    'Mobile Auto Glass Service',
    'Every Pane on the Vehicle',
    'Windshields to Door Glass',
    'Not Sure What Broke? Ask Us',
    'Diagnosed From a Photo',
    'One Crew, One Visit',
    'We Drive to Your Car',
    'Seven-County FL Coverage',
    'Insurance Billing Handled',
    'Lifetime Work Warranty',
    'Serving South FL Since 2018',
    'Get a Fast Mobile Quote'
  ],
  descriptions: [
    'Windshields, door glass, back glass and camera recalibration — one mobile crew, one visit.',
    'Describe the symptom, add a photo, and we quote the actual job rather than the worst case.',
    'Mobile-only across Miami-Dade, Broward and South Florida. No shop visit, no waiting room.',
    'Workmanship warranted against water leaks and air noise for as long as you own the car.'
  ]
},
{
  name: 'SVC | Side & Back Glass',
  page: '/car-window-replacement',
  share: '~10%',
  paths: ['Car-Window', 'Replacement'],
  note: 'Break-in and failure traffic. Urgent intent — keep the schedule-today message up front.',
  keywords: [
    '[car window replacement]',
    '[car window repair]',
    '[door glass replacement]',
    '[back glass replacement]',
    '[rear windshield replacement]',
    '"broken car window"',
    '"power window repair"',
    '"car window off track"'
  ],
  headlines: [
    'Car Window Replacement',
    'Broken Side Glass Replaced',
    'Every Shard Vacuumed Out',
    'Door & Back Glass Mobile',
    'Regulators & Motors Fixed',
    'Close the Hole Before Rain',
    'Defroster Reconnected Right',
    'Glass Matched to Your VIN',
    'We Come to Home or Office',
    'Break-In Cleanup Included',
    'South FL Mobile Service',
    'Fast Quote by Form or Phone'
  ],
  descriptions: [
    'Door panel off, cavity vacuumed shard-free, new glass on, full window travel tested.',
    'Rear windows replaced with the heater grid and antenna connections remade and tested.',
    'A window stuck open in a Florida summer is urgent — call us for a straight answer.',
    'Mobile across South Florida: the van closes the hole at your driveway, not at a shop.'
  ]
},
{
  name: 'SVC | ADAS Calibration',
  page: '/adas-calibration',
  share: '~5%',
  paths: ['ADAS', 'Calibration'],
  note: 'Small volume, high specificity. Also catches cleanup work from installs that skipped the calibration.',
  keywords: [
    '[adas calibration]',
    '[windshield camera calibration]',
    '[adas calibration near me]',
    '"camera recalibration windshield"',
    '"lane assist calibration"',
    '"windshield replacement calibration"'
  ],
  headlines: [
    'ADAS Camera Recalibration',
    'After Windshield Replacement',
    'Static & Dynamic Calibration',
    'Scan Report Provided',
    'Lane-Keep Aiming True Again',
    'Required by Most Automakers',
    'On-Site at Your Location',
    'Calibration-Only Visits OK',
    'We Confirm From Your VIN',
    'South Florida Mobile Unit',
    'Maximum Glass ADAS Service',
    'Quoted With the Windshield'
  ],
  descriptions: [
    'Forward cameras recalibrated after glass work so lane-keep and braking systems aim true.',
    'Static targets and dynamic drives, done to the automaker procedure, with the scan report.',
    'Another shop skipped the calibration? We do calibration-only visits across South Florida.',
    'We confirm from your VIN whether your vehicle requires it — before you approve the quote.'
  ]
},
{
  name: 'GEO | Miami',
  page: '/auto-glass-repair-miami-fl',
  share: '~15%',
  paths: ['Miami', 'Auto-Glass'],
  note: 'Geo-modified queries route here via the routing negatives on the SVC groups. Clone this shape for Hialeah, Pembroke Pines and Hollywood when budget supports it.',
  keywords: [
    '[windshield replacement miami]',
    '[auto glass miami]',
    '[windshield repair miami]',
    '[auto glass repair miami fl]',
    '[mobile auto glass miami]',
    '"windshield miami"',
    '"car window replacement miami"'
  ],
  headlines: [
    'Windshield Replacement Miami',
    'Mobile Auto Glass in Miami',
    'Brickell to Kendall Coverage',
    'We Meet Your Car Anywhere',
    'Tower Garages Handled',
    'Same-Day When Glass In Stock',
    'Insurance Claims Set Up',
    'Lifetime Work Warranty',
    'The Shop That Drives to You',
    'Windshields & Door Glass',
    'Maximum Glass — Miami',
    'Fast Quote for Your VIN'
  ],
  descriptions: [
    'Mobile glass service that works the way Miami parks — towers, garages, driveways and lots.',
    'Condo garage with a height limit? We arrange a deck level or street bay when we book.',
    'Chips from the Dolphin, Palmetto and I-95 repaired at your address before they spread.',
    'We set up the claim and bill your carrier directly. Written cash quotes for everyone else.'
  ]
},
{
  name: 'GEO | Fort Lauderdale & Broward',
  page: '/auto-glass-repair-fort-lauderdale-fl',
  share: '~10%',
  paths: ['FtLauderdale', 'Auto-Glass'],
  note: 'Fort Lauderdale head terms. Hollywood and Pembroke Pines have their own pages — clone this group per city as spend grows rather than widening this one.',
  keywords: [
    '[windshield replacement fort lauderdale]',
    '[auto glass fort lauderdale]',
    '[windshield repair fort lauderdale]',
    '[mobile auto glass fort lauderdale]',
    '"auto glass broward"',
    '"windshield fort lauderdale"'
  ],
  headlines: [
    'Auto Glass Fort Lauderdale',
    'Windshields Replaced at Home',
    'Office & Marina Lot Visits',
    'Coastal-Car Prep Done Right',
    'Port Corridor Chip Repairs',
    'Mobile Across Broward',
    'Same-Day When In Stock',
    'Insurance Billed Direct',
    'Lifetime Workmanship Cover',
    'No Shop Visit Needed',
    'Maximum Glass — Broward',
    'Book a Driveway Visit'
  ],
  descriptions: [
    'Mobile windshield and window service at your Fort Lauderdale home, office or marina lot.',
    'Salt-air cars get real prep: corrosion treated and primed before any new glass goes in.',
    'I-595 and port traffic feed the chips; a quick driveway repair beats a replacement later.',
    'We set up insurance claims and bill carriers directly, or quote cash-pay in writing.'
  ]
}
];

/* Negative keyword lists, applied at campaign level. The waste list is where
   most of the saved budget is: search-terms reports on a new account are
   dominated by adjacent products, DIY intent, job seekers and trade supply.

   The geo-confusion list matters more than it looks. Nearly every US city name
   is shared with somewhere else, and a same-named city in another state will
   quietly eat budget for months. Check each of the client's target cities. */
const SHARED_NEGATIVES = {
  'NEG — Global Waste': [
    'tint', 'tinting', 'wiper', 'wipers', 'repair kit', 'resin kit', 'diy',
    'how to', 'jobs', 'hiring', 'salary', 'training', 'course', 'school',
    'wholesale', 'supplier', 'distributor', 'home window', 'house window',
    'shower', 'glass table', 'plexiglass', 'headlight'
  ],
  'NEG — Geo Confusion': [
    'hollywood ca', 'hollywood california', 'hollywood los angeles',
    'miami ohio', 'miami oklahoma', 'miami university', 'naples italy',
    'hollywood blvd los angeles'
  ]
};

/* Every targeted city and area name, phrase-negative in the service ad groups so
   that geo-modified queries route to the geo ad group and its matching page
   instead of being answered by a generic service page. */
const ROUTING_NEGATIVES = ['miami', 'hialeah', 'fort lauderdale', 'pembroke pines',
  'hollywood', 'naples', 'fort myers', 'cape coral', 'punta gorda', 'west palm beach'];

const SITELINKS = [
  ['Windshield Replacement', 'New glass at your driveway', 'Safe drive-away in writing', '/windshield-replacement'],
  ['Chip & Crack Repair', 'Stop the spread early', 'Quick mobile resin fix', '/windshield-repair'],
  ['ADAS Calibration', 'Camera reset after glass', 'Scan report provided', '/adas-calibration'],
  ['Insurance Claims', 'FL windshield rule explained', 'We bill carriers direct', '/auto-insurance']
];

const CALLOUTS = [
  'Mobile — We Come to You', 'Same-Day When In Stock',
  'Lifetime Work Warranty', 'Insurance Billing Handled'
];

const SNIPPETS = [
  'Windshield Replacement', 'Chip & Crack Repair', 'Door & Side Glass',
  'Back Glass', 'ADAS Calibration', 'Mobile Service'
];

/* ------------------------------------------------------------- validation */

let failures = 0;
const bad = (m) => { console.error('FAIL ' + m); failures++; };

/* Google rejects an over-length asset outright, so treat it as a build error. */
for (const g of GROUPS) {
  const seen = new Set();
  for (const h of g.headlines) {
    if (h.length > LIM.headline) bad(`headline ${h.length}/${LIM.headline} — "${h}" (${g.name})`);
    if (seen.has(h)) bad(`duplicate headline "${h}" (${g.name})`);
    seen.add(h);
  }
  for (const d of g.descriptions) {
    if (d.length > LIM.description) bad(`description ${d.length}/${LIM.description} — "${d}" (${g.name})`);
  }
  for (const p of g.paths) {
    if (p.length > LIM.path) bad(`path ${p.length}/${LIM.path} — "${p}" (${g.name})`);
  }
  if (g.headlines.length < 12) bad(`${g.name} has only ${g.headlines.length} headlines (Google wants 12–15)`);
  if (g.descriptions.length !== 4) bad(`${g.name} has ${g.descriptions.length} descriptions, expected 4`);

  /* Every final URL must be a page that actually built. A 404 behind a live ad
     burns budget silently and tanks the landing page experience score. */
  const out = path.join(__dirname, '..', 'quote-site', g.page.replace(/^\//, ''), 'index.html');
  if (!fs.existsSync(out)) bad(`${g.name} points at ${g.page} which does not exist in quote-site/`);
}

/* Compliance. The patterns live in pages.config.cjs so they move with the
   client's state and trade — a rule written for California auto glass is not a
   rule for a Texas roofer, and a checker that quietly tests the wrong thing is
   worse than no checker.
     banned  [regex source, what it is] pairs, tested against every headline and
             description in the account.
     allowed exact strings that trip a pattern but are defensible, each with a
             reason recorded in the config beside it. */
const AD = (cfg.site.compliance && cfg.site.compliance.adClaims) || {};
const ALLOWED = new Set(AD.allowed || []);
const BANNED = (AD.banned || []).map(([src, what]) => [new RegExp(src, 'i'), what]);
if (!BANNED.length) {
  console.error('FAIL site.compliance.adClaims.banned is empty — every account has ' +
                'claims it must not make. Write them before generating a sheet.');
  process.exit(1);
}
for (const g of GROUPS) {
  for (const s of g.headlines.concat(g.descriptions)) {
    if (ALLOWED.has(s)) continue;
    for (const [re, what] of BANNED) {
      if (re.test(s)) bad(`${what} in "${s}" (${g.name})`);
    }
  }
}

if (failures) {
  console.error(`\n${failures} problem(s) — sheet not written.`);
  process.exit(1);
}

/* ---------------------------------------------------------------- emit */

const L = [];
const put = (...x) => L.push(...x);
const block = (lines) => put('```', ...lines, '```', '');

put('# Google Ads — paste sheet',
    '',
    'Generated by `landing/ads-sheet.cjs`. Every headline, description and path in here',
    'is length-checked against Google\'s limits and scanned against the ad copy rules on',
    'each run, and every final URL is checked to exist in `quote-site/`.',
    '',
    'The reasoning behind these choices is in `docs/google-ads-launch.md` — this file is',
    'just the blocks to copy.',
    '',
    '**Campaign:** `SRCH | SouthFL | Core Glass` · Search only · set the real daily budget in',
    'the account · Maximize Clicks with a CPC ceiling to start · Presence-only location',
    'targeting · Search Partners and Display expansion OFF.',
    '',
    '> Paste keywords into the Google Ads keyword box as-is — it reads one per line and',
    '> understands `[exact]` and `"phrase"`. Headlines and descriptions have to go in one',
    '> field at a time; they are listed in the order to enter them.',
    '',
    '---',
    '');

GROUPS.forEach((g, i) => {
  put(`## ${i + 1}. ${g.name}`,
      '',
      `**Final URL** — paste into the ad group's ad:`,
      '');
  block([ORIGIN + g.page]);
  put(`**Display path** (the two boxes after the domain): \`${g.paths[0]}\` and \`${g.paths[1]}\``,
      '',
      `**Budget share:** ${g.share}`,
      '');
  if (g.note) put('> ' + g.note, '');

  put(`### Keywords (${g.keywords.length})`, '');
  block(g.keywords);

  if (g.negatives) {
    put(`### Ad group negatives (${g.negatives.length}) — add these to THIS ad group only`, '');
    block(g.negatives);
  }

  put(`### Headlines (${g.headlines.length}) — pin #1 to position 1, pin nothing else`, '');
  block(g.headlines);

  put(`### Descriptions (${g.descriptions.length})`, '');
  block(g.descriptions);

  put('---', '');
});

put('## Shared negative lists',
    '',
    'Build each as a shared list under Tools → Shared library → Negative keyword lists,',
    'then attach all three to the campaign.',
    '');
for (const [name, words] of Object.entries(SHARED_NEGATIVES)) {
  put(`### \`${name}\` (${words.length})`, '');
  block(words);
}

put('### Routing negatives — add to the five SVC ad groups (not the GEO groups)',
    '',
    'Service and geo ad groups share one campaign, so they compete for geo-modified',
    'queries. These force "windshield replacement miami" into the Miami ad group and',
    'onto the Miami page, which is what earns the ad relevance and landing page',
    'experience components of Quality Score.',
    '');
block(ROUTING_NEGATIVES.map((w) => '"' + w + '"'));
put('If hub-level ad groups are added later for the Southeast/Southwest pages, add each',
    "city's name to them too, so a hub never outbids a city page for its own name.",
    '',
    '---',
    '');

put('## Campaign assets', '', '### Sitelinks', '');
put('| Text | Description 1 | Description 2 | Final URL |', '|---|---|---|---|');
for (const [t, d1, d2, u] of SITELINKS) put(`| ${t} | ${d1} | ${d2} | \`${ORIGIN}${u}\` |`);
put('');
put('### Callouts', '');
block(CALLOUTS);
put('### Structured snippet — header "Services"', '');
block(SNIPPETS);
put(`### Call asset`, '',
    `Use **${cfg.site.callAsset.formatted}** — the Google call-forwarding number, already`,
    'in the site footer and deliberately excluded from dynamic number insertion. Schedule',
    'it to real answering hours and turn call reporting on.',
    '');

const outFile = path.join(__dirname, '..', 'docs', 'google-ads-build-sheet.md');
fs.writeFileSync(outFile, L.join('\n').replace(/\n{3,}/g, '\n\n') + '\n');

const nH = GROUPS.reduce((n, g) => n + g.headlines.length, 0);
const nD = GROUPS.reduce((n, g) => n + g.descriptions.length, 0);
const nK = GROUPS.reduce((n, g) => n + g.keywords.length, 0);
console.log(`[ads-sheet] ${GROUPS.length} ad groups, ${nK} keywords, ${nH} headlines, ${nD} descriptions`);
console.log(`[ads-sheet] all assets within limits, all final URLs exist → ${path.relative(process.cwd(), outFile)}`);
