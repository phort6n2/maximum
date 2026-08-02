# Google Ads — build guide

> **This is a WORKED EXAMPLE, not a template.** It is the launch plan for one
> client — a mobile auto glass shop advertising into Orange County and LA County
> — kept here because the *reasoning* transfers: how the ad groups are split, why
> the geo groups get their own pages, how the negatives are layered, what to bid
> down and why, and which claims never reach ad copy.
>
> The keywords, the budgets and the group names do not transfer. Two shops in the
> same trade and market bidding the same terms compete with each other. Re-derive
> the campaign from this client's services, market and search-terms data, then put
> it in `landing/ads-sheet.cjs` so every asset gets length- and claim-checked on
> each build. The live version of the account described below is in the
> `phort6n2/speedyla` repo.

Speedy Windshield Repair, Orange County + LA County. One campaign, 10 ad groups,
expand at day 30. Build in the order below; each step depends on the one above it.

Everything here reflects the client steer that **windshield replacement is the target,
a replacement billed to insurance is better, and one that also needs ADAS calibration is
best.** That is a value ranking, not a volume ranking, and it is why there are three
replacement ad groups and no car-window or back-glass group at launch.

---

## Build order

1. Conversion actions (§6) — **before** the campaign, so the campaign can be created
   with the right goal attached
2. Account-level shared negative lists (§5)
3. Campaign shell and settings (§1)
4. Location targets, exclusions and bid adjustments (§2)
5. Ten ad groups with keywords (§4)
6. Cross-negatives for routing (§5.4) — do this the same day, not later
7. RSAs (§7), one per ad group
8. Assets: sitelinks, callouts, structured snippets, call asset (§8)
9. Pre-flight check (§9), then enable

---

## 1. Campaign

**`SRCH | OC+LAC | Core Glass`** — Search only.

| Setting | Value | Why |
|---|---|---|
| Networks | Search only. **Search Partners OFF, Display expansion OFF** | Both spend into junk on an account with no conversion history |
| Locations | **Curated municipality list** (§2), not the county geo-targets | "Los Angeles County" buys ~4,000 sq mi including the Antelope Valley, a 90-minute one-way dispatch that is margin-negative before the tech arrives |
| Location option | **"Presence: People in or regularly in your targeted locations"** | Google defaults to *presence or interest*, and you must change it by hand. Someone in Phoenix researching "windshield replacement Anaheim" is not a lead |
| Location assets | **Suppressed** | The only registered address is San Diego. Showing a Pacific Beach address to a Torrance searcher kills CTR |
| Bidding | **Maximize Clicks, CPC ceiling ~$12** for weeks 1–3 → Maximize Conversions → tCPA from ~week 9 | An untrained tCPA on a zero-history account throttles you to no impressions |
| Budget | **$150/day** | See below |
| Ad rotation | Optimize | — |
| Ad schedule | All hours at launch | Glass is urgent. Add hour-of-day bid adjustments after 2 weeks of real data, do not guess now |
| Match types | **Phrase and exact only, first 60 days** | "windshield wiper replacement" is the highest-volume waste term in this vertical and a near-perfect broad-match trap for "windshield replacement" |

### Budget rationale
Third-party benchmarks put auto glass around $6.90 CPC and $36 CPL nationally. My
estimate for a new advertiser with no local Business Profile competing against Safelite
in these metros is **$8–14 CPC and $60–110 CPL for the first 60 days**. Treat those as
planning ranges, not forecasts — I have not pulled Keyword Planner for these geos.
$150/day gets you to roughly 30 conversions in 30 days, which is what Smart Bidding
needs to exit learning.

### The trade-off you are accepting
One campaign means **one budget across both counties**. You cannot hold OC at a set
spend while LA proves out, and since LA has more query volume and higher CPCs it will
absorb the larger share on its own. That is fine for a launch — you are buying learning,
not optimising allocation. Watch the geographic report weekly. The moment OC and LA show
materially different CPLs, split into two campaigns. That is the day-30 decision.

---

## 2. Locations

**Orange County:** the county geo-target is fine. ~948 sq mi and dispatch-coherent end to
end. Note south OC (San Clemente, Dana Point, San Juan Capistrano) is your *closest* OC
territory from a San Diego dispatch, not your furthest.

**LA County — target these municipalities only:** Long Beach, Torrance, Redondo Beach,
Hermosa Beach, Manhattan Beach, El Segundo, Gardena, Carson, Santa Monica, Culver City,
Venice/West LA, Pasadena, South Pasadena, Altadena, Arcadia, Monrovia, Glendale, Burbank,
Downey, Norwalk, Bellflower, Lakewood, Whittier, Pico Rivera, Santa Fe Springs.

**Exclude explicitly:** Lancaster, Palmdale, Santa Clarita, Antelope Valley,
Avalon / Catalina Island, Angeles National Forest.

### Bid adjustments to set on day one

Weighted by **fleet age, not population** — ADAS attach rate tracks vehicle age, which
tracks income. Same query, very different job value.

| Bid up | Bid down |
|---|---|
| Irvine, Newport Beach **+20%** | Santa Ana **−15%** |
| Santa Monica, Manhattan/Hermosa Beach **+20%** | Downey, Norwalk, Bellflower **−15%** |
| Torrance, Redondo Beach **+15%** | Fullerton, Anaheim (flatland) **−10%** |
| Pasadena, San Marino, Arcadia **+15%** | — |

These are informed starting positions, not measurements. Revisit at 60 days against
booked-job value, not CPL.

---

## 3. The two ADAS audiences

Read this before spending on ad group 4, because the two get conflated constantly and
only one of them is reachable with keywords.

| Audience | Size | Searchable? | How you reach it |
|---|---|---|---|
| **A.** People who already know they need calibration | Small | **Yes** — "adas calibration near me" | Keywords → ad group 4 |
| **B.** People booking a replacement that will *turn out* to need calibration | **Large. This is the money** | **No** | Value-based bidding, geo weighting, VIN qualification |

**Audience A** is real and ad group 4 targets it: drivers a shop has already told they
need calibration and cannot do it themselves, plus body shops and reconditioning lots
looking for a mobile subcontractor. Both are high-ticket and low-competition. It is just
a *thin* pool, which is why it gets ~5% of budget.

**Audience B cannot be keyword-targeted at all.** A driver whose car has a camera behind
the windshield does not know that. They search "windshield replacement near me" exactly
like everyone else and find out about the camera when you tell them. No query separates
them from someone driving a fifteen-year-old Corolla, because the searcher does not
possess the information the keyword would have to encode.

You reach audience B four other ways:

1. **Value-based bidding via offline conversion import.** Push booked-job revenue back
   to Google from GHL against the stored `gclid`. Once Google can see that some clicks
   become $1,200 camera-equipped replacements and others become $150 chip repairs, Smart
   Bidding finds the expensive ones using signals you cannot see or target by hand. The
   site already captures `gclid`, `gbraid` and `wbraid`, so this is GHL configuration,
   not development. **Do this by day 30. It matters more than any keyword decision in
   this document.**
2. **Geo weighting toward newer fleets** — already built into §2.
3. **OEM and vehicle-brand keywords as a proxy** — ad group 3. Someone searching "OEM
   windshield replacement" or "Tesla windshield replacement" is self-selecting into a
   newer, camera-equipped, less price-sensitive vehicle.
4. **Qualify on the form.** The quote form asks for the VIN, which resolves the exact
   glass and whether there is a camera behind it. That is how you know what a job is
   worth before dispatching, and it is what feeds step 1.

---

## 4. Ad groups and keywords

| # | Ad group | Page | Budget share |
|---|---|---|---|
| 1 | `SVC \| WS Replacement — Core` | `/windshield-replacement` | ~25% |
| 2 | `SVC \| WS Replacement — Insurance` | `/insurance-claims` | ~15% |
| 3 | `SVC \| WS Replacement — OEM & Vehicle` | `/windshield-replacement` | ~10% |
| 4 | `SVC \| ADAS Calibration` | `/adas-calibration` | ~5% |
| 5 | `SVC \| Chip & Crack Repair` | `/windshield-repair` | ~10% |
| 6 | `SVC \| Auto Glass (Category)` | `/auto-glass-replacement` | ~10% |
| 7 | `SVC \| Mobile Auto Glass` | `/mobile-auto-glass` | ~5% |
| 8 | `GEO \| Irvine` | `/auto-glass-repair-irvine` | ~7% |
| 9 | `GEO \| Orange County` | `/auto-glass-repair-orange-county` | ~7% |
| 10 | `GEO \| Los Angeles` | `/auto-glass-repair-los-angeles-county` | ~6% |

`[exact]` · `"phrase"`

### 1. WS Replacement — Core
`[windshield replacement]` · `[windshield replacement near me]` · `[new windshield]` ·
`[auto windshield replacement]` · `"replace windshield"` · `"windshield replacement quote"` ·
`"front windshield replacement"` · `"windshield replacement same day"` ·
`"cracked windshield replacement"` · `"windshield replacement shop near me"` ·
`"windshield replacement cost"` *(bid −30%, price shopper)* ·
`"windshield replacement open now"` *(low volume, highest intent)*

### 2. WS Replacement — Insurance
`[windshield replacement insurance]` · `[does insurance cover windshield replacement]` ·
`"windshield replacement with insurance"` · `"is windshield replacement covered by insurance"` ·
`"insurance approved auto glass shop"` · `"auto glass insurance claim"` ·
`"file windshield insurance claim"` · `"comprehensive deductible windshield"` ·
`"geico windshield replacement"` · `"state farm windshield replacement"` ·
`"usaa windshield replacement"` · `"aaa windshield replacement"`

> Carrier names are fine as **keywords**. In **ad copy** they are a trademark and
> affiliation problem — see §7 rules. This is the most legally sensitive ad group in the
> account; read §10 before it goes live.
> **Do not bid `"windshield replacement no deductible"`** until counsel has cleared the
> deductible programme. That query invites exactly the claim you cannot make.

### 3. WS Replacement — OEM & Vehicle
`"oem windshield replacement"` · `"oem glass windshield"` · `"tesla windshield replacement"` ·
`"bmw windshield replacement"` · `"mercedes windshield replacement"` ·
`"lexus windshield replacement"` · `"audi windshield replacement"` ·
`"honda windshield replacement"` · `"acura windshield replacement"` ·
`"windshield replacement with camera"` · `"windshield replacement lane assist"` ·
`"heads up display windshield replacement"` · `"acoustic windshield replacement"`

> Your ADAS proxy. Honda and Acura are here deliberately: Torrance is American Honda's US
> headquarters city with an unusual per-capita concentration of those vehicles. Bid these
> up — they are the closest thing to a keyword meaning "expensive job".

### 4. ADAS Calibration
`[adas calibration]` · `[adas calibration near me]` · `[windshield camera calibration]` ·
`"adas calibration after windshield replacement"` · `"windshield calibration cost"` ·
`"adas recalibration"` · `"forward collision camera recalibration"` ·
`"mobile adas calibration for shops"` · `"adas calibration subcontractor"` ·
`"adas calibration service for body shops"`

> **Do not judge this ad group on lead count.** Its value is a handful of high-ticket
> consumer jobs plus a B2B subcontracting line that is worth more than the retail clicks.

### 5. Chip & Crack Repair
`[windshield repair]` · `[windshield chip repair]` · `[windshield crack repair]` ·
`[windshield chip repair near me]` · `"rock chip repair"` · `"windshield repair near me"` ·
`"fix windshield chip"` · `"chip in windshield repair"` · `"small crack in windshield fix"` ·
`"windshield crack repair cost"`
**Ad group negatives:** `"kit"` · `"diy"` · `"resin"` · `"toothpaste"` · `"nail polish"` · `"super glue"`

> A large share of people searching "windshield repair" actually need a replacement. The
> page handles that with an explicit size test and a branch to the replacement page.

### 6. Auto Glass (Category)
`[auto glass repair]` · `[auto glass near me]` · `[auto glass replacement]` ·
`"auto glass shop near me"` · `"car glass replacement"` · `"auto glass replacement cost"` ·
`"auto glass company near me"` · `"automotive glass replacement"` · `"best auto glass shop"`
**Ad group negatives (essential, or this eats the account):** `"windshield"` · `"back glass"` ·
`"rear window"` · `"side window"` · `"door glass"` · `"calibration"` · `"adas"` · `"mobile"` · `"tint"`

### 7. Mobile Auto Glass
`[mobile auto glass]` · `[mobile windshield replacement]` · `[mobile windshield repair]` ·
`"mobile auto glass near me"` · `"mobile auto glass service"` ·
`"windshield replacement that comes to you"` · `"at home windshield replacement"` ·
`"onsite windshield replacement"` · `"come to you auto glass"`

> Mobile is not one service among many, it is the entire fulfilment model and your only
> structural advantage over a shop with a storefront. Put it in the RSA headline rotation
> of **every** ad group, which §7 does.

### 8. GEO — Irvine
`[auto glass repair irvine]` · `[windshield replacement irvine]` · `"windshield repair irvine"` ·
`"auto glass irvine ca"` · `"mobile auto glass irvine"` · `"mobile windshield replacement irvine"` ·
`"auto glass shop irvine"` · `"car window replacement irvine"`
**Mandatory negatives:** `"irvine welsh"` · `"irvine ky"` · `"irvine kentucky"` · `"irvine scotland"` · `"uc irvine"` · `"uci"`

> Highest-value geo in the account: median household income ~$129k and the newest fleet
> in either county, so the ADAS attach rate is the best you will find. The +20% bid
> adjustment in §2 compounds with this ad group.

### 9. GEO — Orange County
`[auto glass repair orange county]` · `[windshield replacement orange county]` ·
`"auto glass orange county"` · `"mobile auto glass orange county"` ·
`"windshield repair orange county"` · `"orange county auto glass shop"` ·
`"windshield replacement oc"` · `"auto glass repair oc"`
**Mandatory negatives:** `"florida"` · `"fl"` · `"orlando"` · `"ny"` · `"new york"` · `"nc"` · `"tx"` · `"va"`

> Orange County, FL is the Orlando metro and it is large. This is a real budget leak.

### 10. GEO — Los Angeles
Keep exact-heavy and cap at roughly 15% of campaign spend. These are the most expensive
terms in the account and they pull the whole county, including the areas you geo-blocked.
`[auto glass repair los angeles]` · `[windshield replacement los angeles]` ·
`[auto glass repair los angeles county]` · `"auto glass los angeles"` ·
`"mobile auto glass los angeles"` · `"windshield repair los angeles"` ·
`"windshield replacement la county"` · `"los angeles auto glass shop"`

---

## 5. Negatives

### 5.1 `NEG — Global Waste` (shared list, apply to campaign)
`"windshield wiper"` · `"wiper blade"` · `"wiper blades"` · `"washer fluid"` ·
`"windshield washer"` · `"rain sensor"` · `"windshield sticker"` · `"registration sticker"` ·
`"windshield decal"` · `"windshield banner"` · `"sun shade"` · `"windshield cover"` ·
`"repair kit"` · `"diy"` · `"resin"` · `"how to"` · `"do it yourself"` · `"jobs"` ·
`"hiring"` · `"salary"` · `"training"` · `"course"` · `"school"` · `"apprentice"` ·
`"wholesale"` · `"supplier"` · `"distributor"` · `"junkyard"` · `"salvage"` ·
`"used windshield"` · `"car insurance quote"` · `"auto insurance"` · `"home window"` ·
`"house window"` · `"shower door"` · `"storefront glass"` · `"plexiglass"` · `"sunroof"` ·
`"side mirror"` · `"mirror glass"` · `"headlight"` · `"rv"` · `"motorhome"` · `"boat"` ·
`"forklift"` · `"tractor"` · `"motorcycle"` · `"semi truck"`

### 5.2 `NEG — Geo Confusion` (shared list, apply to campaign)
`"glendale az"` · `"glendale arizona"` · `"glendale heights"` · `"orange county florida"` ·
`"orange county fl"` · `"orlando"` · `"orange county ny"` · `"long beach ny"` ·
`"long beach island"` · `"pasadena tx"` · `"pasadena texas"` · `"santa ana winds"` ·
`"santa ana zoo"` · `"santa monica pier"` · `"robert downey"` · `"downey jr"` · `"downy"` ·
`"fabric softener"` · `"cal state fullerton"` · `"irvine spectrum"`

### 5.3 `NEG — Tint (no page yet)` (shared list, apply to campaign)
`"tint"` · `"tinting"` · `"window film"` · `"ceramic tint"` · `"limo tint"`
> The business does window tint but there is no tint page, so those clicks would land on
> a mismatched page. Build a tint page later, then remove this list.

### 5.4 Cross-negatives for routing — do not skip
Service and geo ad groups sit in the same campaign, so they will fight over geo-modified
queries. **Add `irvine`, `orange county`, `oc`, `los angeles`, `la county` as phrase
negatives in all seven service ad groups.** That forces "windshield replacement irvine"
into the Irvine ad group and onto the Irvine page, which is what earns the ad-relevance
and landing-page-experience components of Quality Score.

Likewise add `irvine` as a phrase negative in ad groups 9 and 10, so the county hubs do
not outbid the city page for its own name.

---

## 6. Conversion actions — build these first

| Action | Source | Category | Count | Primary? |
|---|---|---|---|---|
| Form — Quote Request | **the page**, via gtag | Submit lead form | One | Primary |
| Call — GHL pool (60s+) | GHL Number Pool Calling | Phone call leads | One | Primary |
| Click-to-Call tap | gtag `tel:` click | Phone call leads | One | **Secondary only** |
| Job Booked | GHL → offline import via GCLID | Qualified lead | One | Primary (day 30) |

Already live and firing: `AW-10977214637` / `tZMWCPuP6dYcEK2BrPIo`, with enhanced
conversions on and a `transaction_id` for dedupe.

Four things that will otherwise bite you:

1. **Set the form conversion to "page load", not "click".** The page fires it explicitly
   via `gtag`, and only after the GHL webhook confirms the lead actually landed.
2. **Turn off any "Add to Google Ads" action inside GHL's form workflow.** The page owns
   form conversions, GHL owns calls. If both report, every lead counts twice. This is the
   first thing a future contractor will re-break.
3. **Keep Click-to-Call Tap as Secondary.** A tap is not a call. Mis-taps and no-answers
   all fire it, and counting it as Primary corrupts Smart Bidding.
4. **Gate the GHL call conversion at 60 seconds.** Auto glass gets heavy sub-30-second
   volume: wrong numbers, price-only hangups, out-of-area callers.

**Weekly reconciliation:** compare Ads reported conversions against GHL new
opportunities. Google should run 5–15% higher from multi-touch and cross-device.
**If Google is near 2× GHL you have a duplicate** — start with items 1–3.

---

## 7. Ad copy

### Rules — these are compliance, not style

**Never write, in any headline, description or asset:**
- "We cover your deductible" / "deductible assistance" / "$300 toward your deductible"
- "We'll waive your deductible"
- "$0 out of pocket" or "free windshield" as an unqualified claim
- Anything implying California law makes glass free. **It does not**
- "GEICO-approved", "USAA preferred provider", "State Farm authorized". Carrier names are
  fine as *keywords*, but in ad copy they are a trademark and affiliation problem
- A specific drive-away time in minutes — that is set by the adhesive spec, not by you
- "#1", "best in Orange County", "lowest price guaranteed"
- Any price, until §10 item 4 is resolved

**Safe and strong, because each is verifiable:**
- "We come to you — mobile at no extra charge"
- "Camera recalibration on the same visit"
- "We bill your carrier direct"
- "Most carriers waive the deductible on chip repair" *(the insurer's decision, not a discount from you)*
- "We check your coverage before we dispatch"
- "Workmanship warranted for as long as you own the vehicle"
- "Your insurer can't require you to use its shop (Ins. Code § 758.5)"

### The assets

One RSA per ad group. **Pin headline 1 to position 1** (marked 📌) so the head keyword
always shows; pin nothing else, or you strangle the combination testing. Every asset
below is inside Google's limits — headline ≤30, description ≤90, path ≤15 — and every
one has been checked against the banned list above.


0 failures. 10 ad groups, 141 headlines (longest 30/30), 40 descriptions (longest 90/90).
### 1. `SVC | WS Replacement — Core`
**Final URL:** `https://la.speedywindshield.com/windshield-replacement`  
**Display path:** `/Windshield/Mobile`

| # | Headline | Len |
|---|---|---|
| 1 📌 | Windshield Replacement | 22 |
| 2 | Mobile Windshield Service | 25 |
| 3 | We Come To You | 14 |
| 4 | Replaced In Your Driveway | 25 |
| 5 | Same-Day Appointments | 21 |
| 6 | Mobile At No Extra Charge | 25 |
| 7 | Free Quote In Under A Minute | 28 |
| 8 | Orange County & LA County | 25 |
| 9 | Camera Recalibration Too | 24 |
| 10 | We Bill Your Carrier Direct | 27 |
| 11 | Lifetime Workmanship Warranty | 29 |
| 12 | 4.9 Stars On Google | 19 |
| 13 | 1,100+ Google Reviews | 21 |
| 14 | Send Your VIN, Get A Price | 26 |
| 15 | Book Today For Tomorrow | 23 |

| # | Description | Len |
|---|---|---|
| 1 | We replace your windshield where the car already is. Home, office, jobsite. No extra fee. | 89 |
| 2 | Send us the VIN and we quote the exact glass your car takes. No guessing, no bait price. | 88 |
| 3 | Cameras behind the glass are recalibrated on the same visit. One appointment, one tech. | 87 |
| 4 | Workmanship warranted for as long as you own the vehicle. Quote takes under a minute. | 85 |

### 2. `SVC | WS Replacement — Insurance`
**Final URL:** `https://la.speedywindshield.com/insurance-claims`  
**Display path:** `/Insurance/Claim`

| # | Headline | Len |
|---|---|---|
| 1 📌 | Windshield Insurance Claim | 26 |
| 2 | We Bill Your Carrier Direct | 27 |
| 3 | We Check Your Coverage First | 28 |
| 4 | Your Claim, Handled For You | 27 |
| 5 | Mobile Windshield Replacement | 29 |
| 6 | You Pick The Glass Shop | 23 |
| 7 | Insurance Code 758.5 | 20 |
| 8 | We Come To You | 14 |
| 9 | Calibration Billed Too | 22 |
| 10 | Know The Cost Before We Go | 26 |
| 11 | Same-Day Appointments | 21 |
| 12 | 4.9 Stars On Google | 19 |
| 13 | Lifetime Workmanship Warranty | 29 |
| 14 | Orange County & LA County | 25 |

| # | Description | Len |
|---|---|---|
| 1 | We verify your coverage before dispatch, so you know your cost before anyone shows up. | 86 |
| 2 | We file and bill your carrier directly. You approve the work and we handle the paperwork. | 89 |
| 3 | Your insurer cannot require you to use its shop. California Insurance Code 758.5. | 81 |
| 4 | Calibration is part of the claim, not a surprise line item. We bill it with the glass. | 86 |

### 3. `SVC | WS Replacement — OEM & Vehicle`
**Final URL:** `https://la.speedywindshield.com/windshield-replacement`  
**Display path:** `/OEM-Glass/Windshield`

| # | Headline | Len |
|---|---|---|
| 1 📌 | OEM Windshield Replacement | 26 |
| 2 | OEM & OEM-Equivalent Glass | 26 |
| 3 | Glass Matched To Your VIN | 25 |
| 4 | Camera & Sensor Glass | 21 |
| 5 | Lane Assist Recalibrated | 24 |
| 6 | Heads-Up Display Glass | 22 |
| 7 | Acoustic Windshields Stocked | 28 |
| 8 | Tesla, BMW, Lexus, Acura | 24 |
| 9 | Mobile At No Extra Charge | 25 |
| 10 | One Visit, Glass & Calibration | 30 |
| 11 | Lifetime Workmanship Warranty | 29 |
| 12 | 4.9 Stars On Google | 19 |
| 13 | Orange County & LA County | 25 |
| 14 | Send Your VIN, Get A Price | 26 |

| # | Description | Len |
|---|---|---|
| 1 | Send the VIN and we identify the exact glass your car takes, brackets and sensors. | 82 |
| 2 | Camera, rain sensor, acoustic layer, heads-up display. We order the glass your car needs. | 89 |
| 3 | We recalibrate the forward camera on the same visit, so you drive away finished. | 80 |
| 4 | OEM and OEM-equivalent options quoted side by side. You choose, we order it that day. | 85 |

### 4. `SVC | ADAS Calibration`
**Final URL:** `https://la.speedywindshield.com/adas-calibration`  
**Display path:** `/ADAS/Calibration`

| # | Headline | Len |
|---|---|---|
| 1 📌 | Mobile ADAS Calibration | 23 |
| 2 | Windshield Camera Calibration | 29 |
| 3 | Static & Dynamic Calibration | 28 |
| 4 | We Bring The Targets To You | 27 |
| 5 | Calibration After Glass Work | 28 |
| 6 | For Body Shops & Dealers | 24 |
| 7 | Subcontract Your Calibrations | 29 |
| 8 | Pre & Post Scan Report | 22 |
| 9 | Lane Assist & Collision Camera | 30 |
| 10 | Orange County & LA County | 25 |
| 11 | Same-Week Scheduling | 20 |
| 12 | 4.9 Stars On Google | 19 |
| 13 | Documented For The Claim | 24 |
| 14 | We Come To Your Shop | 20 |

| # | Description | Len |
|---|---|---|
| 1 | We bring the targets and the scan tool to your bay. No towing a finished car across town. | 89 |
| 2 | Static and dynamic calibration for forward cameras, with a pre and post scan report. | 84 |
| 3 | Body shops and recon lots: subcontract your calibrations instead of turning work away. | 86 |
| 4 | Replaced the glass elsewhere and got told it needs calibration? We do that part alone. | 86 |

### 5. `SVC | Chip & Crack Repair`
**Final URL:** `https://la.speedywindshield.com/windshield-repair`  
**Display path:** `/Chip-Repair/Mobile`

| # | Headline | Len |
|---|---|---|
| 1 📌 | Windshield Chip Repair | 22 |
| 2 | Rock Chip Repair | 16 |
| 3 | Stop The Crack Spreading | 24 |
| 4 | Repaired In Your Driveway | 25 |
| 5 | We Come To You | 14 |
| 6 | Often No Deductible To Pay | 26 |
| 7 | Same-Day Chip Repair | 20 |
| 8 | Cheaper Than A Replacement | 26 |
| 9 | Mobile At No Extra Charge | 25 |
| 10 | Quarter-Size Or Smaller | 23 |
| 11 | Orange County & LA County | 25 |
| 12 | 4.9 Stars On Google | 19 |
| 13 | Free Quote In Under A Minute | 28 |
| 14 | Book Today For Tomorrow | 23 |

| # | Description | Len |
|---|---|---|
| 1 | Most carriers waive the deductible on chip repair, so it often costs you nothing to claim. | 90 |
| 2 | A chip spreads with the next cold morning or speed bump. Repaired now it stays a chip. | 86 |
| 3 | Chip smaller than a quarter and out of your sightline? It repairs. We tell you either way. | 90 |
| 4 | We come to your home or office. Under an hour, and the glass keeps its factory seal. | 84 |

### 6. `SVC | Auto Glass (Category)`
**Final URL:** `https://la.speedywindshield.com/auto-glass-replacement`  
**Display path:** `/Auto-Glass/Mobile`

| # | Headline | Len |
|---|---|---|
| 1 📌 | Mobile Auto Glass Service | 25 |
| 2 | Auto Glass Replacement | 22 |
| 3 | We Come To You | 14 |
| 4 | Every Window On The Car | 23 |
| 5 | Windshield, Door, Back Glass | 28 |
| 6 | Same-Day Appointments | 21 |
| 7 | We Bill Your Carrier Direct | 27 |
| 8 | Mobile At No Extra Charge | 25 |
| 9 | Lifetime Workmanship Warranty | 29 |
| 10 | Certified Glass Technicians | 27 |
| 11 | 4.9 Stars On Google | 19 |
| 12 | 1,100+ Google Reviews | 21 |
| 13 | Orange County & LA County | 25 |
| 14 | Free Quote In Under A Minute | 28 |

| # | Description | Len |
|---|---|---|
| 1 | Windshields, door glass, back glass, quarter glass. We carry it and install it curbside. | 88 |
| 2 | One number for every piece of glass on the vehicle, replaced where the car is parked. | 85 |
| 3 | Send the VIN and get the exact glass and the exact price. No shop visit to find out. | 84 |
| 4 | Workmanship warranted for as long as you own the vehicle. Quote takes under a minute. | 85 |

### 7. `SVC | Mobile Auto Glass`
**Final URL:** `https://la.speedywindshield.com/mobile-auto-glass`  
**Display path:** `/Mobile/We-Come-To-You`

| # | Headline | Len |
|---|---|---|
| 1 📌 | Mobile Auto Glass | 17 |
| 2 | We Come To You | 14 |
| 3 | No Extra Charge For Mobile | 26 |
| 4 | Glass Done In Your Driveway | 27 |
| 5 | We Work At Your Office Lot | 26 |
| 6 | Never Visit A Shop | 18 |
| 7 | Same-Day Mobile Service | 23 |
| 8 | Windshields At Your Curb | 24 |
| 9 | Calibration Done On Site Too | 28 |
| 10 | Orange County & LA County | 25 |
| 11 | 4.9 Stars On Google | 19 |
| 12 | Lifetime Workmanship Warranty | 29 |
| 13 | Pick Your Time Window | 21 |
| 14 | Free Quote In Under A Minute | 28 |

| # | Description | Len |
|---|---|---|
| 1 | Our van carries the glass, the adhesive and the calibration targets. Nothing gets towed. | 88 |
| 2 | Home driveway, office lot, jobsite. Pick the address and a time window that works. | 82 |
| 3 | Mobile is how we work, not an upsell. There is no callout fee and no shop to drive to. | 86 |
| 4 | Even the camera recalibration happens on site, so one visit finishes the whole job. | 83 |

### 8. `GEO | Irvine`
**Final URL:** `https://la.speedywindshield.com/auto-glass-repair-irvine`  
**Display path:** `/Irvine/Auto-Glass`

| # | Headline | Len |
|---|---|---|
| 1 📌 | Irvine Auto Glass Repair | 24 |
| 2 | Windshield Replacement Irvine | 29 |
| 3 | Mobile Auto Glass In Irvine | 27 |
| 4 | We Come To You In Irvine | 24 |
| 5 | Irvine Spectrum To Woodbridge | 29 |
| 6 | Same-Day Service In Irvine | 26 |
| 7 | Glass At Your Irvine Office | 27 |
| 8 | Camera Recalibration Too | 24 |
| 9 | We Bill Your Carrier Direct | 27 |
| 10 | Mobile At No Extra Charge | 25 |
| 11 | 4.9 Stars On Google | 19 |
| 12 | Lifetime Workmanship Warranty | 29 |
| 13 | Free Quote In Under A Minute | 28 |
| 14 | Irvine Business Parks Served | 28 |

| # | Description | Len |
|---|---|---|
| 1 | We replace glass in the Irvine business park lots while you stay at your desk. | 78 |
| 2 | Newer cars mean cameras behind the glass. We recalibrate on the same visit, same tech. | 86 |
| 3 | From Woodbridge to Great Park to the Spectrum. Pick an address and a time window. | 81 |
| 4 | Send the VIN and get the exact glass and price before we dispatch a van to Irvine. | 82 |

### 9. `GEO | Orange County`
**Final URL:** `https://la.speedywindshield.com/auto-glass-repair-orange-county`  
**Display path:** `/Orange-County/Auto-Glass`

| # | Headline | Len |
|---|---|---|
| 1 📌 | Orange County Auto Glass | 24 |
| 2 | OC Windshield Replacement | 25 |
| 3 | Mobile Across Orange County | 27 |
| 4 | We Come To You In OC | 20 |
| 5 | Irvine To San Clemente | 22 |
| 6 | Same-Day Service In OC | 22 |
| 7 | Mobile At No Extra Charge | 25 |
| 8 | Camera Recalibration Too | 24 |
| 9 | We Bill Your Carrier Direct | 27 |
| 10 | Lifetime Workmanship Warranty | 29 |
| 11 | 4.9 Stars On Google | 19 |
| 12 | 1,100+ Google Reviews | 21 |
| 13 | Free Quote In Under A Minute | 28 |
| 14 | Every OC City Covered | 21 |

| # | Description | Len |
|---|---|---|
| 1 | Anaheim to San Clemente, Huntington Beach to Yorba Linda. Our vans cover the county. | 84 |
| 2 | We replace the glass where the car is parked anywhere in Orange County. No shop visit. | 86 |
| 3 | Send the VIN and get the exact glass and the exact price before a van leaves. | 77 |
| 4 | Cameras recalibrated on the same visit. Workmanship warranted as long as you own it. | 84 |

### 10. `GEO | Los Angeles`
**Final URL:** `https://la.speedywindshield.com/auto-glass-repair-los-angeles-county`  
**Display path:** `/LA-County/Auto-Glass`

| # | Headline | Len |
|---|---|---|
| 1 📌 | LA County Auto Glass | 20 |
| 2 | Windshield Replacement In LA | 28 |
| 3 | Mobile Auto Glass, LA County | 28 |
| 4 | We Come To You In LA County | 27 |
| 5 | Long Beach To Santa Monica | 26 |
| 6 | South Bay & San Gabriel Valley | 30 |
| 7 | Same-Day LA Appointments | 24 |
| 8 | Mobile At No Extra Charge | 25 |
| 9 | Camera Recalibration Too | 24 |
| 10 | We Bill Your Carrier Direct | 27 |
| 11 | Lifetime Workmanship Warranty | 29 |
| 12 | 4.9 Stars On Google | 19 |
| 13 | Free Quote In Under A Minute | 28 |
| 14 | Skip The LA Shop Traffic | 24 |

| # | Description | Len |
|---|---|---|
| 1 | Long Beach, Torrance, Santa Monica, Pasadena, Downey. We bring the glass to the car. | 84 |
| 2 | Nobody in LA wants to drive across town twice for a windshield. We come to the car. | 83 |
| 3 | Send the VIN and get the exact glass and the exact price before we dispatch a van. | 82 |
| 4 | Cameras recalibrated on the same visit. Workmanship warranted as long as you own it. | 84 |

---

## 8. Assets

Build these once at campaign level; Google will serve them across all ten ad groups.

### Sitelinks (4 minimum, 6 better)

| Text | Description line 1 | Description line 2 | URL |
|---|---|---|---|
| Mobile Service | We come to you at no extra charge | Home, office or jobsite | `/mobile-auto-glass` |
| Insurance Claims | We bill your carrier direct | We check coverage before dispatch | `/insurance-claims` |
| ADAS Calibration | Camera recalibrated on the same visit | Static and dynamic, mobile | `/adas-calibration` |
| Chip Repair | Stop a chip before it spreads | Often no deductible to pay | `/windshield-repair` |
| Orange County | Every OC city, mobile service | Anaheim to San Clemente | `/auto-glass-repair-orange-county` |
| LA County | South Bay to San Gabriel Valley | Long Beach to Pasadena | `/auto-glass-repair-los-angeles-county` |

### Callouts (min 4, use all 8)
`Mobile at no extra charge` · `Lifetime workmanship warranty` · `We bill your carrier direct` ·
`Same-day appointments` · `Camera recalibration on site` · `4.9 stars on Google` ·
`OEM and OEM-equivalent glass` · `Orange County & LA County`

### Structured snippet — header "Services"
`Windshield replacement` · `Chip and crack repair` · `ADAS calibration` ·
`Back glass replacement` · `Door and side glass` · `Mobile auto glass`

### Call asset
**(949) 736-5211** — the Google call-forwarding asset number, already in the site footer
marked no-swap. Schedule it to your real answering hours. Enable call reporting so the
Click-to-Call and call-asset conversions stay distinguishable.

### Image assets
Upload the vehicle and technician photos from `quote-site/img/`. Google will use them in
Search where eligible, and an ad group with no image assets loses that placement to
whoever supplied one.

---

## 9. Pre-flight before you enable

Run this list on the day you turn it on.

- [ ] Conversion actions exist and the form action is set to **page load**, not click
- [ ] "Add to Google Ads" is **off** inside the GHL form workflow (or every lead double-counts)
- [ ] Click-to-Call Tap is **Secondary**
- [ ] GHL call conversion gated at **60 seconds**
- [ ] Location option is **Presence**, not "presence or interest" — Google will not do this for you
- [ ] Search Partners **off**, Display expansion **off**
- [ ] Excluded locations are in: Lancaster, Palmdale, Santa Clarita, Antelope Valley, Catalina
- [ ] Location assets suppressed (the only registered address is San Diego)
- [ ] All three shared negative lists attached to the campaign
- [ ] Cross-negatives added: city and county names phrase-negative in the seven service ad groups
- [ ] Every ad group has ≥12 headlines and 4 descriptions, with only headline 1 pinned
- [ ] Every final URL returns 200 and matches the ad group's intent — click each of the ten
- [ ] Budget $150/day, bidding **Maximize Clicks with a ~$12 CPC ceiling**
- [ ] Submit one test lead through the live form with `?gclid=TEST123&utm_source=google&utm_medium=cpc`
      and confirm it lands in GHL with the attribution fields populated

---

## 10. Blocking items before spend

These gate the account, not the site.

1. **California counsel on the deductible-assistance programme** (Penal Code § 551(b)).
   Blocks all insurance messaging, including on the existing San Diego page. Ad group 2
   is the most exposed thing in the account.
2. **BAR ruling on the static-registered-number-plus-DNI configuration** (16 CCR
   § 3371.2). BAR guidance indicates a tracking number differing from the registered
   number may be treated as misleading. The site's mitigation is that the footer
   compliance number is excluded from DNI, but that is a judgement, not a ruling.
3. **Verified cash price floors**, if any ad is ever going to say "from $X". The ad and
   the page must show the same figure. Nothing in §7 quotes a price, so this only blocks
   you if you want to add one.
4. **What the technicians actually hold.** AGSC / AGRSS is the auto glass standard; ASE
   is primarily mechanical and collision. "Certified Glass Technicians" in ad group 6
   depends on this being accurate.

---

## 11. Day 30

In rough priority order.

1. **Offline conversion import.** Upload Job Booked and Job Completed with revenue back
   to Ads from GHL via the stored GCLID, as a **separate conversion action** from the one
   the page fires — uploading against the same action double-counts every lead. This is
   the highest-leverage change available, because raw lead CPL is a poor objective here:
   price shoppers, out-of-area callers and mechanical-window enquiries all register as
   leads and never book. See §3.
2. **Split into two campaigns**, OC and LAC, if their CPLs have diverged.
3. **The 10 remaining city ad groups** — Santa Ana, Huntington Beach, Costa Mesa,
   Fullerton, Anaheim, Long Beach, Torrance, Pasadena, Glendale, Santa Monica, Downey.
   The pages are already built, linked and in the sitemap.
4. **`SVC | Car Window / Door Glass`** → `/car-window-replacement`. Deliberately dropped
   from launch: it is the lowest-value work on the site, mostly cash-pay because a single
   door glass usually costs less than a comprehensive deductible, no camera, no insurance
   billing. It converts well and it is urgent, so it is worth adding — just not while the
   budget is meant to be finding replacement jobs.
   `[car window replacement]` · `[side window replacement]` · `[door glass replacement]` ·
   `"broken car window replacement"` · `"smashed car window repair"` ·
   `"driver side window replacement"`
   **Negatives (critical):** `"regulator"` · `"window motor"` · `"won't roll up"` ·
   `"wont go up"` · `"off track"` · `"switch"` — mechanical faults, not glass, and a large
   slice of "car window repair" queries
5. **`SVC | Back Glass / Rear Window`** → `/back-glass-replacement`. Same logic plus
   genuinely low volume.
   `[back glass replacement]` · `[rear windshield replacement]` · `"shattered rear windshield"` ·
   `"broken back windshield"` · `"truck back glass replacement"`
   > "Back glass" is trade jargon. Keep it in the H1 for the exact match, but the ads
   > should say **"back windshield"** and **"rear window"**, which is what people type.
6. **A Spanish path.** Santa Ana and Downey are majority-Hispanic markets with real
   Spanish query volume ("parabrisas", "cambio de parabrisas"). Sending those searchers
   to an English page is a landing-page-experience hit, so the keywords are held back
   until `/es` pages exist. Bilingual phone answering is worth more than the keywords in
   month one — a lot of Spanish-preferring searchers search in English and call in Spanish.
7. **Local Services Ads.** Auto glass is generally eligible under automotive services and
   LSA CPL is reported well below Search. Worth checking eligibility in parallel.
8. **Brand defence** at $5/day once you have any brand volume at all.

**Do not launch Performance Max in the first 90 days.** With no conversion history, no
Business Profile in either county and a legally sensitive offer, it will spend into brand
and junk queries and give you no query-level control at exactly the moment you need it.

### What launching this way costs you

Three replacement ad groups instead of one, and no car-window or back-glass group, means
you will get **fewer total leads than a volume-first build would produce, at a higher
average job value.** That is the trade you asked for. If the phone goes quiet in week
two, the fastest fix is re-adding car window and back glass (items 4 and 5), not raising
bids.
