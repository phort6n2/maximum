# landing-template

Template for single-client Google Ads landing sites. Static HTML, no framework,
one generator script, no runtime dependencies. Deploys to Vercel from `main`.

The reference build is **<https://la.speedywindshield.com>** — use it as the model
for layout, section order, motion and density. The full source of that build is in
the `speedyla` repo; when something here is unclear, read how it was actually done
there rather than guessing.

---

## What this produces

A small site — home page, one page per service, one hub page per service area,
one page per city, plus privacy and terms — where every page carries:

- a quote form that posts to the CRM and reports the Google Ads conversion
- click-ID and UTM attribution that survives navigation between pages
- dynamic number insertion on the header and CTA numbers, and never on the
  Google call-asset number
- `LocalBusiness` + `FAQPage` + `BreadcrumbList` JSON-LD
- content-hashed images served immutable, and a real 404 page

Nav and footer link lists are **generated from the config**, so every page is
linked from every other by construction. An orphan page — which reads as a
doorway page to Google — cannot happen by forgetting a link.

---

## Starting a new client site

```bash
gh repo create <client>-landing --private --template phort6n2/landing-template
git clone <the new repo> && cd <the new repo>
npm install
```

Then, in order. Steps 1 and 2 come before any copy is written, because getting
them wrong is expensive and getting them wrong quietly is worse.

### 1. URL parity with whatever they run today

If the client already advertises a landing page anywhere, **the new site must
serve the same paths the old one served.** Not redirect to them — serve them.

- a final URL that 404s gets the ad disapproved for "Destination not working",
  usually within hours and with no warning
- a final URL that redirects off-domain is a policy violation outright
- even a same-domain redirect adds a hop the crawler follows before it scores
  landing page experience, for no benefit

The authoritative URL list is the **Google Ads account**, not the old site — a
final URL can be referenced by an ad without being linked anywhere crawlable.
Export final URLs at keyword, ad and sitelink level, then:

```bash
npm run check:urls -- --file ads-final-urls.txt
```

It reports EXACT / REDIRECT ONLY / WOULD 404, and treats a redirect as a
**failure** unless you pass `--allow-redirects`. Name the pages with the old
slugs; keep `migration.redirects` for legacy URLs no ad depends on.

### 2. Harvest what already exists

Before asking the client for anything, take stock of:

- **their main website** — real photography, the warranty wording they already
  use, service names, the claims they are already comfortable making
- **their old landing page** — more photos, and the URL list from step 1
- **their Google Business Profile** — the Place ID, the review count, more photos

Real photos of this business only. Stock photography on a local service page
reads as fake and costs more trust than the polish gains.

### 3. Fill in the config

`landing/pages.config.cjs` and `landing/cities.config.cjs` hold **everything**
client-specific. Nothing about a client belongs in the generator, the template or
the checkers. Both files are full of `REPLACE__` markers and long comments
explaining what each field is for and what has gone wrong there before.

`npm run verify` walks the entire config recursively and refuses to pass while a
single `REPLACE__` survives, so you cannot half-fill it and ship.

### 4. Brand artwork

```bash
npm run make:icons -- path/to/client-logo.png
```

Writes the whole favicon / app-icon / OG set at the right sizes and copies the
logo through untouched. Run with no argument for placeholders — preflight blocks
a build while those are still in place.

The lifetime-warranty badge in `landing/img/warranty-badge.png` is a self-issued
mark, not a third-party certification, and it is reusable across clients **as
long as the page defines the warranty in full beside it** — which the warranty
section does. Never swap it for something implying outside accreditation.

### 5. Reviews

```bash
npm run check:placeid       # dry run — prints what the Place ID resolves to
npm run fetch:reviews       # writes landing/reviews.json
```

Read what the dry run prints. A client-supplied Place ID once resolved to a
different company two doors down and the site published that other business's
rating on every page — a wrong Place ID returns perfectly plausible numbers.
That is what `site.reviews.expect*` guards against; do not remove them.

With no `reviews.json` the site still builds: every numeric rating claim is
stripped, the rating bands are removed rather than left empty, and
`aggregateRating` is never emitted from anything but live data.

### 6. Photography placement

Two pools, deliberately separate:

- **`gallery`** — six photos, the "range of work" grid near the bottom of every
  page. Keep it at six; the grid's last-row rules stay symmetric at any count
  but six is what the layout was built around.
- **`bodyPhotos`** — process and detail shots that sit *beside* the prose.

**Every page gets figures**, not just the service pages. A hub or city page
without them reads as a wall of text next to pages that alternate text and
image. Two per page, at chapters 0 and 2, matches the rest of the site.

The pools must not overlap, or an illustrated page loses a tile from its grid.
Photos repeat across pages, and that is correct — nobody reads two city pages,
and a real photograph reused beats a stock one that is not this business.

### 7. Write the copy

Read `landing/cities.config.cjs`'s header before writing a single city page.
One template with the city name swapped is close to Google's own definition of a
doorway page. `npm run verify` measures 5-gram overlap across every city and hub
body and fails at 5%.

**Do not invent facts about the business.** Not staffing, not languages spoken,
not certifications, not years in business, not coverage. If the client has not
said it and it is not on their own site, it does not go on the page — however
well it would fit the local demographics. This has bitten before.

### 8. Verify, then deploy

```bash
npm run qa        # build + preflight + verify + render + tracking
```

All four have to be green. Then point Vercel at the repo — the root
`vercel.json` sets `outputDirectory: "quote-site"` — and add the domain.
**Production deploys from `main`**, so work merged to a feature branch is not
live no matter how green it is.

---

## Commands

| command | what it does |
|---|---|
| `npm run build:landing` | generate `quote-site/` |
| `npm run preflight` | refuse to build on placeholders, another client's IDs, or bad shapes |
| `npm run verify` | preflight + 16 sections of checks against the generated output |
| `npm run qa:render` | headless Chromium: console errors, overflow, clipping, tap targets |
| `npm run qa:tracking` | drives the real form; asserts what reached dataLayer and what was POSTed |
| `npm run qa` | all of the above |
| `npm run check:urls` | URL parity against a Google Ads final-URL export |
| `npm run build:adsheet` | paste-ready campaign sheet, with asset lengths and claims checked |
| `npm run make:icons` | favicon / app-icon / OG set |
| `npm run check:placeid` | dry-run the Google Places lookup |
| `npm run fetch:reviews` | write `landing/reviews.json` |

---

## How the templating works

`landing/template.html` is the master template and renders standalone from disk
during design work. The generator fills it per page:

- `<!--PAGE:NAME-->…<!--/PAGE:NAME-->` — a **region**, filled with generated
  HTML. Filled at *every* occurrence: `FOOTER_AREA_A` appears twice, and filling
  only the first once left the footer columns silently empty in production.
- `<!--SECTION:NAME-->…<!--/SECTION:NAME-->` — an **optional band**, deleted
  entirely when its content is empty. A heading and an eyebrow above an empty
  grid reads as a broken page rather than a shorter one.
- `{{TOKEN}}` — substituted from `site` in the config.
- `/ASSET/…` — the asset prefix, rewritten to `/` (or `$BASE`) at build time.
  **Internal links inside config body copy must use `/ASSET/`**, or they ship
  pointing at a path that does not exist. `verify` catches it.

Some config strings are emitted as HTML and some are escaped as plain text; the
list is at the top of `pages.config.cjs`, and `verify` fails on any
double-escaped entity.

---

## Compliance

`landing/pages.config.cjs` opens with the rules, and they are worth reading even
for a different trade: no offering to offset an insurance deductible, no claiming
a statute makes the work free, no invented prices, no third-party logos or
"approved/authorized" claims, no unqualified time promises, and a "lifetime
warranty" always defined on-page.

Two pieces are pluggable rather than hardcoded:

- **`site.compliance.registration`** — the regulator line in the footer. Many
  licensed trades must show a registration number in internet advertising
  (California auto glass: 16 CCR § 3371.2). Leave `number` empty and the block
  degrades to name / phone / address rather than printing a placeholder.
- **`site.compliance.adClaims`** — patterns the ad copy must never match,
  enforced by `build:adsheet` before a sheet is written. Re-derive them for the
  client's state and trade; do not inherit them unexamined.

`landing/legal-privacy.html` and `landing/legal-terms.html` are **worked
examples, not boilerplate**. They describe what one California auto glass site
collected and which statutes applied. Preflight refuses to build until you have
read them against this client and removed the `REPLACE__REVIEW_LEGAL` marker.

---

## Things that look like bugs and are not

- **Preflight fails on a fresh clone.** That is the point. It fails until the
  config is filled in, the legal pages are reviewed, and the artwork is replaced.
- **The skeleton fails the city-overlap check.** Two placeholder bodies really
  are near-duplicates. It clears as soon as real copy exists.
- **No rating anywhere.** No `reviews.json`. Rating claims are stripped rather
  than faked.
- **The registration line is missing from the footer.** No
  `site.compliance.registration.number` is set.
- **The gallery or insurance band is absent.** Those sections are removed when
  their config is empty.
