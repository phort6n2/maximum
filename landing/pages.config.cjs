/**
 * ============================================================================
 *  ALL CLIENT CONTENT LIVES HERE. NOTHING CLIENT-SPECIFIC BELONGS ANYWHERE ELSE.
 * ============================================================================
 *
 * Client: Maximum Glass Corp — mobile auto glass, Hialeah FL, serving South
 * Florida. Migrated off the HighLevel funnel at maximumglass.co; slugs below
 * intentionally match that site so repointing ad final URLs is a domain swap.
 *
 * COMPLIANCE — Florida auto glass, re-derived (do not copy to other states):
 *
 *  1. NO deductible-offset offers. Florida's own twist: under FS 627.7288 the
 *     insurer may not apply a deductible to WINDSHIELD repair or replacement
 *     under comprehensive coverage on private passenger vehicles. That is the
 *     INSURER's obligation and may be stated as such. The shop offering to eat
 *     or offset a deductible (door/back glass, or any gap) is an inducement.
 *
 *  2. NO "anything of value" for a glass claim. Florida's 2023 auto glass law
 *     (SB 1002, effective July 1, 2023) prohibits offering incentives — gift
 *     cards, cash, rebates — to get a customer to file a motor vehicle glass
 *     claim, and ended assignment of benefits for glass work. Ad copy naming
 *     any incentive is banned below.
 *
 *  3. NO "free windshield" in ads. True only for a subset (comprehensive
 *     coverage, windshield specifically); as an unqualified ad claim it is
 *     misleading and inducement-adjacent.
 *
 *  4. NO invented prices, NO carrier logos or affiliation claims, NO
 *     unqualified time promises (safe drive-away time belongs to the urethane
 *     spec), and the lifetime warranty is defined in full on-page.
 *
 *  5. Registration: Florida's Motor Vehicle Repair Act (ch. 559, FS) requires
 *     registered shops to include the registration number in advertising.
 *     MV112120 below came from the client's BBB profile — VERIFY against the
 *     FDACS certificate before launch; it is not printed on either of the
 *     client's current sites.
 *
 *  6. Do NOT invent facts about the business. Everything factual below traces
 *     to the client's own sites (maximumglasscorp.com, maximumglass.co), their
 *     Sunbiz filing, or their BBB profile. "Since 2018" is the client's own
 *     published claim (maximumglass.co) even though the corporation filed in
 *     2020 — flagged to the client, kept because it is their claim to make.
 */

module.exports = {
  site: {
    domain: 'quote.maximumglasscorp.com',

    name: 'Maximum Glass',
    /* Sunbiz: MAXIMUM GLASS CORP, P20000019768, filed 2/28/2020. */
    legalName: 'Maximum Glass Corp',
    brandShort: 'Maximum Glass',
    shortName: 'MaximumGlass',

    schemaType: 'AutoGlassShop',

    sourceTag: 'landing:maximum-southfl',

    /* The number painted on the van. Swapped by the GHL pool for DNI. */
    phoneFormatted: '(305) 951-3295',
    phoneE164: '+13059513295',

    /* The Broward number from the old landing's footer — rendered static and
     * ghl-no-swap for Google call-asset verification. Confirm this is the
     * number loaded as the call asset in the Ads account. */
    callAsset: { formatted: '(954) 751-4739', e164: '+19547514739' },

    /* Directory-sourced (BBB/CitySquares cluster), NOT printed on the client's
     * own sites — confirm with the client before launch. */
    email: 'maximumglasscorp@gmail.com',

    /* Registered address per Sunbiz and BBB. This is a registered office, not
     * a walk-in shop — serviceArea.mapNote and addressLabel say so plainly.
     * The client does not print a street address on their own sites; they may
     * prefer city-level display. Confirm before launch. */
    address: {
      street: '400 W 29th Pl #110',
      city: 'Hialeah',
      region: 'FL',
      zip: '33012'
    },
    geo: { lat: 25.8486, lng: -80.291 },

    /* From maximumglasscorp.com: Mon–Fri 7:30–5, Sat 7:30–5 by appointment
     * (the "by appointment" nuance is carried in page copy), Sun closed. */
    hours: [
      { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '07:30', closes: '17:00' },
      { days: ['Saturday'], opens: '07:30', closes: '17:00' },
      { days: ['Sunday'], closed: true }
    ],

    reviews: {
      /* Recovered from the client's OWN properties, two independent sources
       * that agree — so this is not a guessed listing:
       *   1. the Google Maps embed on maximumglasscorp.com, whose CID pair
       *      0xa5bef1e2840a8e25:0x755f452f38cdff5e decodes to exactly the ID
       *      below, labelled "Maximum Glass";
       *   2. the same ChIJ string appearing literally in the page source of
       *      maximumglass.co.
       * Still run `npm run check:placeid` once the API key exists and READ what
       * it prints — the expect* guards below are the backstop, not a formality. */
      placeId: 'ChIJJY4KhOLxvqURXv_NOC9FX3U',
      expectName: 'maximum',
      expectVertical: 'glass|windshield|auto\\s*glass',
      expectAddress: ',\\s*FL\\b|Florida'
    },

    /* The client's own claim on maximumglass.co: "Quality Service Since 2018!"
     * (Sunbiz incorporation is 2020 — flagged to the client.) */
    established: '2018',
    mapsUrl: '',
    sameAs: ['https://maximumglasscorp.com/'],

    logo: 'logo-wordmark.png',
    ogImage: 'og-image.png',
    themeColor: '#0C2C47',

    serviceArea: {
      label: 'Southeast Florida &amp; the Southwest Gulf Coast',
      short: 'South Florida',
      coverageLead: 'The van covers seven counties — Miami-Dade, Broward, Palm Beach and Monroe on the east coast, Lee, Collier and Charlotte on the west. If your city is not named below, call: the answer is usually yes, and it is always a straight yes or no.',
      addressLabel: 'Registered address',
      qualifier: 'mobile only',
      mapNote: 'The pin is our registered address in Hialeah — there is no walk-in shop. Maximum Glass is mobile only: the work happens at your driveway, office or job site.',
      footerNote: 'Mobile auto glass service across Miami-Dade, Broward, Palm Beach, Monroe, Lee, Collier and Charlotte counties; registered in Hialeah, Florida.'
    },

    regionPhrase: 'South Florida',

    utilNote: 'Mobile only — the van comes to you',
    utilNoteMore: 'anywhere from Miami to Naples',

    footerBlurb: 'Mobile windshield replacement, chip repair, door and back glass, and ADAS recalibration across South Florida. No shop to drive to — the van comes to your driveway or workplace.',

    notFoundNote: 'The quote form on any page reaches us, and so does the phone — tell us the vehicle and the glass that is damaged, and we will take it from there.',

    heroBullets: [
      { lead: 'Mobile only, by design', text: '&mdash; the van comes to your driveway, office or job site anywhere in our seven-county footprint' },
      { lead: 'Same-day scheduling', text: 'when your glass is in stock &mdash; most common windshields are' },
      { lead: 'Lifetime workmanship warranty', text: 'against water leaks and air noise, defined in full further down this page' },
      { lead: 'Insurance claims handled', text: '&mdash; we set up the claim and bill your carrier directly, and Florida law waives the windshield deductible under comprehensive cover' }
    ],

    footerBadges: [
      { icon: 'van',    label: 'Mobile-only service',
        sub: 'Driveway, office or roadside — we come to you' },
      { icon: 'shield', label: 'Lifetime workmanship warranty',
        sub: 'Water leaks and air noise, defined on-page' },
      { icon: 'doc',    label: 'Insurance billing handled',
        sub: 'Claim set up and billed direct to your carrier' },
      { icon: 'target', label: 'ADAS recalibration on site',
        sub: 'Camera systems reset after windshield work' }
    ],

    ads: {
      /* From the old landing page's gtag. Confirm the account is current. */
      conversionId: 'AW-11429085252',
      conversionLabel: 'REPLACE__conversion-label',
      ga4Id: '',
      leadValue: 0
    },

    ghl: {
      webhook: 'REPLACE__https://services.leadconnectorhq.com/hooks/.../webhook-trigger/...',
      /* From the old landing page's pool scripts. */
      locationId: 'm9SeW3c9CosxSesyLGPd',
      /* Two pools exist on the old site (munli7D4GnStBIxVKIkK and
       * DXIkXwfUh1hPrDdoYV2m). Left empty per Matt's call until the right one
       * is confirmed in GHL — half-configured DNI silently shows the wrong
       * number. */
      poolId: ''
    },

    compliance: {
      registration: {
        /* Florida Motor Vehicle Repair Act, ch. 559 FS. Number sourced from
         * the client's BBB profile — verify against the FDACS certificate. */
        authority: 'Florida Dept. of Agriculture & Consumer Services',
        label: 'MV Repair Registration',
        number: 'MV112120',
        phoneFormatted: '',
        phoneE164: ''
      },

      adClaims: {
        banned: [
          ['deductible',                                   'deductible claim'],
          ['\\$\\d|\\$0',                                  'a price'],
          ['free windshield|windshield.{0,12}free|free replacement', 'free-work claim'],
          ['gift\\s*card|cash\\s*back|rebate|\\bincentive\\b|\\breward\\b', 'a glass-claim inducement (FL SB 1002)'],
          ['\\bapproved\\b|preferred provider|authorized', 'insurer affiliation'],
          ['\\bbest\\b|#1|lowest price',                   'superlative'],
          ['guarantee',                                    'guarantee'],
          ['\\bminutes\\b',                                'an unqualified time promise']
        ],
        allowed: []
      }
    }
  },

  /* ==================== migration from maximumglass.co ====================
   * New domain, so nothing here rescues a live ad URL by itself — the ads must
   * be repointed to quote.maximumglasscorp.com. Keeping every old slug
   * identical means that repoint is a find-and-replace on the domain only, and
   * `preserve` stops a future edit from silently dropping one of them. */
  migration: {
    preserve: [
      '/windshield-replacement',
      '/windshield-repair',
      '/windshield-chip-repair',
      '/windshield-crack-repair',
      '/rock-chip-repair',
      '/auto-glass-repair',
      '/auto-glass-replacement',
      '/car-window-repair',
      '/car-window-replacement',
      '/door-glass-repair',
      '/back-glass-repair',
      '/adas-calibration',
      '/mobile-service',
      '/auto-insurance',
      '/auto-glass-repair-miami-fl',
      '/auto-glass-repair-hialeah-fl',
      '/auto-glass-repair-fort-lauderdale-fl',
      '/auto-glass-repair-pembroke-pines-fl',
      '/auto-glass-repair-hollywood-fl',
      '/privacy',
      '/terms'
    ],
    redirects: []
  },

  trust: [
    { icon: 'van',    label: 'Mobile only, on purpose',
      sub: 'No shop to drive to — the van carries the job to you' },
    { icon: 'shield', label: 'Lifetime workmanship warranty',
      sub: 'Water leaks and air noise, for as long as you own the vehicle' },
    { icon: 'doc',    label: 'Insurance billing handled',
      sub: 'We set up the claim and bill your carrier directly' },
    { icon: 'target', label: 'ADAS recalibration',
      sub: 'Camera systems reset on site after windshield work' }
  ],

  /* ======================== photo gallery ========================
   * All real Maximum Glass photography, pulled from the client's own sites.
   * The old landing page also carried stock models, carrier logos and another
   * company's review screenshots — none of that came over. */
  gallery: [
    { src: 'van-arrival.webp', w: 1000, h: 750,
      alt: 'Maximum Glass service van parked beside a blue BMW M2 in a residential driveway',
      caption: 'The whole shop is in the van — glass rack, urethane, trim tools and the vacuum for the cleanup.' },
    { src: 'glass-set-wide.webp', w: 1000, h: 563,
      alt: 'Technician setting a windshield on a blue BMW M2 convertible next to the Maximum Glass van',
      caption: 'Setting glass on a soft-top: alignment gets one attempt once the urethane bead touches.' },
    { src: 'van-driveway-wide.webp', w: 1000, h: 563,
      alt: 'Maximum Glass van and technician working on a customer\'s BMW in a driveway under palm trees',
      caption: 'A driveway is a better work bay than most shops — flat, shaded and nobody waiting on a bench.' },
    { src: 'hood-wipe.webp', w: 1000, h: 563,
      alt: 'Technician wiping down the hood of a blue BMW beside the Maximum Glass service van',
      caption: 'Fender and hood covers come off last — glass dust ends up in the vacuum, not your cowl.' },
    { src: 'van-cowl-work.webp', w: 1000, h: 563,
      alt: 'Technician working at the cowl of a blue BMW with the Maximum Glass van behind',
      caption: 'Cowl panel and wiper arms come off before the cut-out — pushing trim around glass is how scratches happen.' },
    { src: 'suction-set.webp', w: 1000, h: 563,
      alt: 'Technician pressing a new windshield into place with suction cups on a blue BMW',
      caption: 'Suction handles carry the glass in level, so the moulding seats evenly on the first pass.' }
  ],

  /* ======================== body photography ======================== */
  bodyPhotos: [
    { src: 'urethane-bead.webp', w: 750, h: 1000,
      alt: 'Technician running a urethane bead along the windshield aperture with a powered gun',
      caption: 'A continuous urethane bead, one pass — stops and starts are where leaks begin.' },
    { src: 'urethane-gun.webp', w: 750, h: 1000,
      alt: 'Maximum Glass technician loading a powered urethane gun at the edge of the glass opening',
      caption: 'Powered gun keeps the bead height even; the urethane cartridge states the safe drive-away time we quote you.' },
    { src: 'cowl-prep.webp', w: 750, h: 1000,
      alt: 'Technician cleaning and priming the cowl area with wiper arms removed',
      caption: 'Wipers and cowl off, aperture cleaned and primed — prep is most of what a warranty rests on.' },
    { src: 'wiper-refit.webp', w: 562, h: 1000,
      alt: 'Technician refitting the wiper assembly on a blue BMW with a suction handle on the glass',
      caption: 'Wipers go back on only after the glass sits flush — park position is checked before we hand back the keys.' },
    { src: 'van-prep.webp', w: 1000, h: 750,
      alt: 'Maximum Glass van parked at a customer\'s home with the technician preparing the vehicle',
      caption: 'First job of the visit is protection: covers on the paint, tape where trim meets glass.' },
    { src: 'van-glass-clean.webp', w: 1000, h: 563,
      alt: 'Technician cleaning the new windshield beside the branded Maximum Glass van',
      caption: 'Final wipe-down happens after the trim is back on, so nothing gets pushed across bare glass.' },
    { src: 'van-side-job.webp', w: 1000, h: 563,
      alt: 'Maximum Glass service van with phone number and QR code parked at a mobile job',
      caption: 'The van carries the number on the door — the crew that quotes you is the crew that shows up.' },
    { src: 'tech-hood-detail.webp', w: 1000, h: 563,
      alt: 'Technician detailing the hood area of a blue car next to the Maximum Glass van',
      caption: 'The job is done when the car is clean — shards, dust and old urethane leave in the van.' }
  ],

  bodyPhotoFill: true,

  areaServed: [
    'Miami', 'Hialeah', 'Fort Lauderdale', 'Pembroke Pines', 'Hollywood',
    'Miami-Dade County', 'Broward County', 'Palm Beach County',
    'Monroe County', 'Lee County', 'Collier County', 'Charlotte County'
  ],

  areaGroups: [
    { id: 'A', label: 'Southeast Florida' },
    { id: 'B', label: 'Southwest Florida' }
  ],

  /* ======================== insurance / money band ======================== */
  insurance: {
    eyebrow: 'Insurance',
    heading: 'What Florida drivers actually pay for auto glass',
    lead: 'Florida\'s glass rules are unusual, and half of what customers have heard about them is out of date. Here is the current version, statutes named.',
    cards: [
      { h: 'The windshield deductible rule is real — and specific',
        p: '<p>Florida Statute 627.7288 says that if you carry comprehensive coverage on a private passenger vehicle, your insurer cannot apply a deductible to windshield repair or replacement. That is the insurer\'s obligation, not a shop discount. It covers the windshield only — not door, vent, quarter or back glass — and it does not apply if you carry liability-only cover.</p>' },
      { h: 'Door and back glass work differently',
        p: '<p>Every other piece of glass on the vehicle falls under your normal comprehensive deductible. If the deductible is higher than the cost of the work, paying cash is simply cheaper — we will tell you which side of that line your job lands on before anything is booked.</p>' },
      { h: 'The gift-card pitch is now illegal here',
        p: '<p>Florida\'s 2023 auto glass law (SB 1002) prohibits offering gift cards, cash or any incentive in exchange for a windshield insurance claim, and ended assignment-of-benefits for glass work. A shop still making that offer is telling you something about how it operates. We do not, and never did.</p>' },
      { h: 'No comprehensive cover? That is common',
        p: '<p>Plenty of South Florida drivers carry liability only. You get the same visit, the same glass options quoted for your exact VIN, and a written figure before we book — nothing is priced on this site because no honest number exists before we know the vehicle and the glass.</p>' }
    ],
    disclaimer: 'Maximum Glass Corp is an independent shop. We are not affiliated with, endorsed by or preferred by any insurance carrier; we bill carriers directly as a service to our customers.'
  },

  serviceCards: {
    eyebrow: 'What we do',
    heading: 'Every piece of glass on the vehicle',
    lead: 'One crew, one visit: windshields, chips, door and back glass, and the camera recalibration that modern windshields require.'
  },

  nav: [
    'windshield-replacement',
    'windshield-repair',
    'auto-glass-repair-southeast-florida',
    'auto-glass-repair-southwest-florida'
  ],

  /* ================================ HOME ================================ */
  home: {
    navLabel: 'Home',
    shortLabel: 'Home',
    title: 'Mobile Auto Glass, South Florida | Maximum Glass',
    desc: 'Mobile windshield replacement, chip repair and ADAS recalibration across Miami-Dade, Broward and South Florida. The van comes to you. Free quote.',
    eyebrow: 'South Florida · Mobile auto glass',
    h1: 'Auto glass replacement that comes to your driveway',
    sub: '<p>A cracked windshield means rearranging your day around a shop<span class="sub-more"> — unless the shop is a van that meets your car wherever it is parked</span>.</p>',
    svcValue: 'windshield-replacement',
    body: `
<h2>A mobile glass shop, not a shop with a van</h2>
<p>Maximum Glass has run mobile-only since 2018. There is no waiting room because
there is no building to wait in: the van carries the glass rack, the urethane,
the trim tools and the vacuum, and the job happens where your car already sits —
a driveway in Pembroke Pines, an office lot in Brickell, a job site off the
Palmetto. You keep your morning; the windshield gets done anyway.</p>

<h2>What one visit covers</h2>
<ul>
  <li><strong><a href="/ASSET/windshield-replacement">Windshield replacement</a></strong> — cut-out, full prep, new glass, and the safe drive-away time in writing</li>
  <li><strong><a href="/ASSET/windshield-repair">Chip and crack repair</a></strong> — resin injection that stops damage spreading, when the damage qualifies</li>
  <li><strong><a href="/ASSET/car-window-replacement">Door and side glass</a></strong> — tempered glass replaced and the door vacuumed of every shard</li>
  <li><strong><a href="/ASSET/back-glass-repair">Back glass</a></strong> — heated rear windows replaced with the defroster connections remade</li>
  <li><strong><a href="/ASSET/adas-calibration">ADAS recalibration</a></strong> — the camera behind your new windshield reset to see the road straight</li>
</ul>

<div class="callout">
  <h3>Is the windshield really no-cost in Florida?</h3>
  <p>Sometimes — and the qualifier matters. Florida law (FS 627.7288) stops your
  insurer applying a deductible to windshield repair or replacement, but only if
  you carry comprehensive coverage, and only for the windshield itself. Door and
  back glass carry your normal deductible, and liability-only policies get no
  glass benefit at all. Tell us your coverage when you call and we will tell you
  plainly which case you are in before anything is booked.</p>
</div>

<h2>Why drivers pick the van over the chains</h2>
<p>The person who quotes your job is the person who turns up to do it — one
crew, not a call center and a subcontractor. The work carries a lifetime
workmanship warranty against water leaks and air noise for as long as you own
the vehicle. And because the van comes to you, the usual reason to put off a
cracked windshield — losing half a day to a shop visit — is gone.</p>
`,
    faq: [
      { q: 'Do you have a shop I can drive to?',
        a: '<p>No — Maximum Glass is mobile only. The van comes to your home, workplace or wherever the vehicle is parked, anywhere in our seven-county South Florida service area. That is the whole model, not a side service.</p>' },
      { q: 'What does a new windshield cost?',
        a: '<p>It depends on the vehicle and the glass — a base sedan and a camera-equipped SUV are entirely different jobs, which is why no honest shop prints one price. Send the quote form with your vehicle details and you get a real figure for your exact VIN. If you carry comprehensive insurance, Florida law waives the windshield deductible and we bill the carrier directly.</p>' },
      { q: 'How soon can you come out?',
        a: '<p>Often same-day when your glass is in stock, and most common windshields are. Scheduling runs Monday to Friday 7:30–5, Saturdays by appointment. Call before mid-morning and there is a good chance the van reaches you the same afternoon.</p>' },
      { q: 'Is the work warrantied?',
        a: '<p>Yes — a lifetime workmanship warranty against water leaks and air noise, for as long as you own the vehicle. It covers the installation work we did; glass damaged by a new impact is a new job, and we say so up front rather than in fine print.</p>' }
    ]
  },

  /* ================================ SERVICES ================================ */
  services: [
    {
      slug: 'windshield-replacement',
      card: {
        icon: 'windshield',
        title: 'Windshield replacement',
        blurb: 'Cracked or shattered glass out, new glass in, at your driveway or workplace — with the safe drive-away time in writing.',
        cta: 'See windshield replacement'
      },
      navLabel: 'Windshields',
      shortLabel: 'Windshield replacement',
      title: 'Mobile Windshield Replacement | Maximum Glass',
      desc: 'Windshield replacement at your home or work across South Florida. Full prep, quality urethane, lifetime workmanship warranty. Get a free mobile quote.',
      eyebrow: 'Windshield replacement',
      h1: 'Windshield replacement, done where the car is parked',
      sub: '<p>A crack in the driver\'s view fails inspection sense and common sense — and the fix does not require a shop visit.</p>',
      svcValue: 'windshield-replacement',
      body: `
<h2>When replacement is the right call — and when it is not</h2>
<p>A chip smaller than a quarter, away from the edges and out of the driver's
line of sight, can usually be <a href="/ASSET/windshield-repair">repaired</a>
for far less than a new windshield. Replacement is the answer once a crack runs
long, reaches the edge of the glass, sits in front of the driver, or the damage
has spread into more than one layer. We will tell you which side of the line
your damage falls on from a photo — selling you a repair when you need one is
how the warranty stays honest.</p>

<h2>What actually happens at the van</h2>
<ul>
  <li>Covers go on the paint, wiper arms and cowl panel come off</li>
  <li>The old glass is cut out and the aperture trimmed and primed — not scraped bare</li>
  <li>A continuous urethane bead goes down in one pass</li>
  <li>The new glass sets on alignment blocks, mouldings and trim go back</li>
  <li>The urethane manufacturer's safe drive-away time goes to you in writing</li>
</ul>

<div class="callout">
  <h3>The camera behind the mirror is part of the job</h3>
  <p>If your vehicle has lane-keep assist or automatic emergency braking, the
  forward camera looks through the glass we just changed, and most manufacturers
  require <a href="/ASSET/adas-calibration">recalibration after replacement</a>.
  A shop that skips it hands you back a car whose safety systems are aiming
  through uncalibrated glass. We do not skip it — it is quoted with the
  windshield, not sprung on you after.</p>
</div>

<h2>The warranty, defined</h2>
<p>Every windshield we set carries a lifetime workmanship warranty against water
leaks and air noise for as long as you own the vehicle. It covers our
installation — the bead, the seal, the trim. It does not cover new rock strikes,
and nobody's warranty honestly does.</p>
`,
      faq: [
        { q: 'How long until I can drive the car?',
          a: '<p>The honest answer is printed on the urethane cartridge, not invented by the installer — safe drive-away time depends on the adhesive, the temperature and the humidity that day. You get the figure in writing before we leave. Plan loosely around an hour or two of cure time and let the written number govern.</p>' },
        { q: 'OEM glass or aftermarket?',
          a: '<p>We quote the options actually available for your VIN and tell you the difference plainly. On some vehicles the choice affects camera calibration and acoustic lamination; on others the aftermarket glass is made in the same plant. You pick with the trade-offs in front of you.</p>' },
        { q: 'Will insurance cover it?',
          a: '<p>If you carry comprehensive coverage in Florida, statute 627.7288 stops the insurer applying a deductible to windshield replacement — you pay nothing out of pocket and we bill the carrier directly. Liability-only policies do not include glass, in which case you get a written cash figure before booking.</p>' }
      ]
    },

    {
      slug: 'windshield-repair',
      card: {
        icon: 'star',
        title: 'Chip &amp; crack repair',
        blurb: 'Resin injection that stops a chip becoming a crack — a fraction of the cost of new glass, done at your kerb.',
        cta: 'See chip repair'
      },
      navLabel: 'Chip repair',
      shortLabel: 'Chip & crack repair',
      title: 'Windshield Chip & Crack Repair | Maximum Glass',
      desc: 'Mobile windshield repair across South Florida: resin injection for chips and short cracks before they spread. Honest advice on repair vs replacement.',
      eyebrow: 'Windshield repair',
      h1: 'Windshield repair, before the chip becomes a windshield',
      sub: '<p>A chip is a small job on a schedule of its own choosing — South Florida heat has a way of shortening the deadline.</p>',
      svcValue: 'chip-crack-repair',
      body: `
<h2>Why chips spread faster here</h2>
<p>Glass expands in heat, and a windshield in a Florida parking lot cycles from
air-conditioned cold to triple-digit surface temperature every single day. That
expansion works the edges of a chip like bending a paperclip. The first blast of
July A/C onto hot glass is when a month-old chip decides to run — which is why
the cheap fix has a shelf life and the quote form has a photo field.</p>

<h2>What a resin repair actually does</h2>
<p>The damaged area is cleaned out, air is drawn out of the break under vacuum,
and an optical resin is injected and UV-cured. Done early, the repair restores
the glass's structural bond and stops the crack spreading; the blemish shrinks
to a faint mark you have to look for. Done late — after dirt and water have
lived in the break — the strength still comes back but the cosmetic result is
honest rather than invisible. Earlier is simply better.</p>

<div class="callout">
  <h3>When we will refuse to repair</h3>
  <p>Damage in the driver's direct line of sight, chips bigger than a quarter,
  cracks longer than a few inches, or anything reaching the edge of the glass —
  those get a <a href="/ASSET/windshield-replacement">replacement</a>
  recommendation, because a repair there either distorts your view or will not
  hold. We would rather lose the small job than sign our name to one that fails.</p>
</div>
`,
      faq: [
        { q: 'Will the chip disappear completely?',
          a: '<p>No, and a shop promising invisibility is overselling. A fresh, clean chip usually cures to a faint blemish most people stop noticing. The point of the repair is structural — it stops the crack running — and the cosmetic improvement is the bonus.</p>' },
        { q: 'Does insurance cover chip repair?',
          a: '<p>With comprehensive coverage in Florida, windshield repair falls under the same statute as replacement — FS 627.7288 — so no deductible applies. Many carriers actively prefer paying for a repair over a replacement later. Cash-pay is also modest; we quote it before booking.</p>' },
        { q: 'How long does a repair visit take?',
          a: '<p>It is the shortest visit we make — the resin cure is UV-driven and quick. We will give you a realistic window when we book, and because the van comes to you, the honest answer is that it takes almost none of <em>your</em> time.</p>' }
      ]
    },

    {
      slug: 'windshield-chip-repair',
      navLabel: 'Chips',
      shortLabel: 'Chip repair',
      title: 'Windshield Chip Repair, Mobile | Maximum Glass',
      desc: 'Star breaks, bullseyes and combination chips repaired at your home or office in South Florida. Resin-injected, UV-cured, spread stopped.',
      eyebrow: 'Chip repair',
      h1: 'Chip repair for star breaks, bullseyes and everything between',
      sub: '<p>Not every chip looks like a chip — some look like a small star, a dark circle, or a half-moon at the edge of your vision.</p>',
      svcValue: 'chip-crack-repair',
      body: `
<h2>Know what hit you</h2>
<ul>
  <li><strong>Bullseye</strong> — a dark circle with a cone of glass missing below the surface; the cleanest repair candidate there is</li>
  <li><strong>Star break</strong> — short legs radiating from the impact; each leg is a crack waiting for permission to run</li>
  <li><strong>Combination break</strong> — a bullseye with legs; repairable early, a replacement once the legs stretch</li>
  <li><strong>Half-moon</strong> — a bullseye that did not close its circle; treated the same way</li>
</ul>
<p>All four repair well when they are fresh, smaller than a quarter, and away
from the glass edge and the driver's sightline. Send a close-up photo with the
quote form and we will name the break and the right fix, no visit needed.</p>

<h2>The repair, in the order it happens</h2>
<p>The impact point is opened and cleaned, a bridge tool seals over the break,
vacuum pulls the trapped air out, resin goes in under pressure, and UV light
cures it solid. The glass around the break regains its bond to the inner
laminate, which is what stops the legs running the next time the sun loads the
glass. The surface is then polished flush so the wiper glides over it.</p>

<div class="callout">
  <h3>Waiting is the expensive option</h3>
  <p>Dirt and water settle into an open break within days, and a rain-soaked
  chip never cures as clear. More to the point, a chip is the only auto glass
  problem that upgrades itself to a bigger invoice while you think about it —
  <a href="/ASSET/windshield-crack-repair">a running crack</a> usually means
  the repair window has closed.</p>
</div>
`,
      faq: [
        { q: 'Can you repair a chip in the rain?',
          a: '<p>The break has to be dry to cure properly, but that is a logistics question, not a no — a garage, a carport or a covered office deck all work fine, and the van carries what it needs to dry a damp break before injecting resin.</p>' },
        { q: 'How many chips can be repaired on one windshield?',
          a: '<p>Two or three well-separated chips can usually be repaired in one visit. Past that — or if any single break sits in the driver\'s critical viewing area — replacement becomes the safer and often cheaper path, and we will say so plainly.</p>' }
      ]
    },

    {
      slug: 'windshield-crack-repair',
      navLabel: 'Cracks',
      shortLabel: 'Crack repair',
      title: 'Windshield Crack Repair | Maximum Glass',
      desc: 'Short cracks stopped before they cross the glass. Honest limits: what a crack repair can hold, and when South Florida heat has already won.',
      eyebrow: 'Crack repair',
      h1: 'Crack repair — a race the crack is already running',
      sub: '<p>A crack is a chip that got moving. Whether it can still be stopped depends mostly on how far it has got.</p>',
      svcValue: 'chip-crack-repair',
      body: `
<h2>The honest limits of crack repair</h2>
<p>A short crack — a few inches, starting from a repairable impact point, not
reaching the edge — can be drilled at its tip, injected and cured, and reliably
stopped. Past roughly the length of a dollar bill, or once the crack touches the
edge of the glass where body flex works it constantly, resin becomes a delay
rather than a fix. We draw that line honestly on the first phone call, because
a failed crack repair costs you the repair <em>and</em> the
<a href="/ASSET/windshield-replacement">replacement</a> a month later.</p>

<h2>Why cracks run to the edge</h2>
<p>The windshield is a stressed structural panel, not a window pane — it carries
part of the roof-crush load and the body twists it slightly over every driveway
apron and speed bump in Miami. A crack relieves that stress by growing toward
the nearest free edge. Heat accelerates it; the afternoon storm-then-sun cycle
of a South Florida summer is close to a laboratory test for crack propagation.</p>

<div class="callout">
  <h3>Tape it, don't wait on it</h3>
  <p>A strip of clear packing tape over a fresh crack keeps dirt and water out
  and costs nothing — it is the one piece of DIY we actively recommend while the
  van is on its way. What does not help: dashboard defrosters on full, pressure
  washing, or slamming doors with the windows up, all of which load the glass.</p>
</div>
`,
      faq: [
        { q: 'My crack is longer than a dollar bill — is it worth trying?',
          a: '<p>Usually not, and we will not take your money to try. A long crack has already relieved the stress pattern across the panel, and resin at that stage is cosmetic at most. The realistic conversation is about replacement, and Florida\'s comprehensive-coverage windshield rule frequently makes that conversation easier than expected.</p>' },
        { q: 'Can a cracked windshield fail me at a traffic stop?',
          a: '<p>Florida law requires the windshield to be free of obstructions to the driver\'s clear view, and a crack across the driver\'s side can qualify. Beyond citations, the practical issue is that a compromised windshield does less for you in a crash — it is a structural part, not just weather protection.</p>' }
      ]
    },

    {
      slug: 'rock-chip-repair',
      navLabel: 'Rock chips',
      shortLabel: 'Rock chip repair',
      title: 'Rock Chip Repair on Your Schedule | Maximum Glass',
      desc: 'Highway rock chips repaired at home or work anywhere in our South Florida coverage. Quick resin fix now beats a full windshield later.',
      eyebrow: 'Rock chip repair',
      h1: 'Rock chips: the toll South Florida highways actually charge',
      sub: '<p>Follow a loaded truck up I-95 or the Turnpike long enough and the windshield collects the receipt.</p>',
      svcValue: 'chip-crack-repair',
      body: `
<h2>Where the rocks come from</h2>
<p>Construction never stops here — and neither do the dump trucks feeding it.
Aggregate spilling from truck beds and stones thrown up by tires are the two
big sources, which is why the classic South Florida chip arrives on I-95, the
Turnpike, I-75 across the Alley, or the Palmetto during rush hour. Following
distance helps; two car lengths of extra space behind anything hauling gravel
is the cheapest windshield insurance sold.</p>

<h2>The five-day rule of thumb</h2>
<p>A fresh chip is clean, dry and tight — the ideal patient. Within days,
Florida does what Florida does: an afternoon downpour drives water into the
break, sun bakes it, dust settles in, and the repair that would have cured
nearly invisible now cures merely sound. The structural fix works either way;
the cosmetic result rewards speed. Since the van comes to you, speed costs you
nothing but a phone call.</p>

<div class="callout">
  <h3>Fleet vehicles collect chips for a living</h3>
  <p>Work trucks and delivery vans live on the highway, and a windshield full of
  chips eventually becomes a windshield full of cracks — usually all at once,
  usually mid-route. We repair multiple vehicles in one stop at a yard or depot;
  mention it on the form and we will set it up.</p>
</div>
`,
      faq: [
        { q: 'Is a rock chip different from any other chip?',
          a: '<p>Mechanically no — "rock chip" describes the cause, and the damage is the same family of bullseyes and star breaks we repair every day. The distinction that matters is size, age and position on the glass, which decide whether it repairs cleanly or has graduated to replacement territory.</p>' },
        { q: 'The chip is tiny. Can I just ignore it?',
          a: '<p>You can, and sometimes you get away with it — but the failure mode is not gradual. The chip sits quiet until one hot afternoon plus one cold blast of A/C sends a crack across the driver\'s view in a second. The repair costs a fraction of that outcome, which is the whole argument.</p>' }
      ]
    },

    {
      slug: 'auto-glass-repair',
      navLabel: 'Glass repair',
      shortLabel: 'Auto glass repair',
      title: 'Mobile Auto Glass Repair, South FL | Maximum Glass',
      desc: 'One mobile crew for every glass problem on the vehicle — windshield damage, regulators, seals and leaks — diagnosed at your driveway, South Florida wide.',
      eyebrow: 'Auto glass repair',
      h1: 'Auto glass repair when you are not sure what the fix is',
      sub: '<p>You know something is wrong with the glass. Naming the repair is our job, not yours.</p>',
      svcValue: 'not-sure',
      body: `
<h2>Start with the symptom, not the part number</h2>
<p>Half our calls open with a description, not a diagnosis: the window will not
come up, there is water on the passenger floor after a storm, a whistle starts
at highway speed, a crack appeared overnight. Pick "not sure" on the quote form,
describe what the car is doing, add a photo if there is something to photograph
— and we will name the actual job and quote that, rather than the most
expensive thing it might be.</p>

<h2>What the symptom usually means</h2>
<ul>
  <li><strong>Chip or short crack</strong> — a <a href="/ASSET/windshield-repair">resin repair</a>, if it is caught early</li>
  <li><strong>Long or edge crack</strong> — a <a href="/ASSET/windshield-replacement">windshield replacement</a></li>
  <li><strong>Window off its track, or dead switch</strong> — regulator or motor work behind the <a href="/ASSET/door-glass-repair">door panel</a></li>
  <li><strong>Wet carpet after rain</strong> — a failed seal or blocked drain, found with water and patience, not guesswork</li>
  <li><strong>Wind noise that grew over weeks</strong> — a lifting moulding or a previous installation letting go</li>
</ul>

<div class="callout">
  <h3>Bad news delivered early is a service</h3>
  <p>If the honest answer is that a repair will not hold — a crack too long, a
  seal too far gone — we say it at quote time, with the replacement number next
  to it, so the decision is yours and made once. Nobody enjoys the shop that
  finds the "real" problem after the van is already in your driveway.</p>
</div>
`,
      faq: [
        { q: 'Do you diagnose without committing me to a repair?',
          a: '<p>The photo-and-description route on the quote form costs you nothing and usually lands the diagnosis. Where the van does need to come out to know for sure — leaks especially — we tell you before booking what the visit will and will not settle.</p>' },
        { q: 'Can you fix a window stuck down before the afternoon storm?',
          a: '<p>A window stuck open in a Florida summer is the closest thing auto glass has to an emergency, and we treat it like one — call rather than form, and if stock and schedule allow same-day we will say so on the spot. If we genuinely cannot reach you first, we will say that too.</p>' }
      ]
    },

    {
      slug: 'auto-glass-replacement',
      navLabel: 'Glass replacement',
      shortLabel: 'Auto glass replacement',
      title: 'Auto Glass Replacement at Your Door | Maximum Glass',
      desc: 'Windshields, door glass, quarter and back glass replaced mobile across South Florida. Correct glass for the VIN, proper adhesives, warranty in writing.',
      eyebrow: 'Auto glass replacement',
      h1: 'Auto glass replacement, matched to the exact vehicle',
      sub: '<p>"Auto glass" is six different parts and two different kinds of glass — the right replacement starts with which one broke.</p>',
      svcValue: 'windshield-replacement',
      body: `
<h2>Two kinds of glass, two kinds of job</h2>
<p>The windshield is laminated — two sheets bonded over a plastic interlayer —
and it is glued into the body as a structural panel. Nearly everything else on
the car is tempered: single-sheet glass engineered to explode into pellets
instead of blades, dropped into a frame or bolted to a regulator. That is why a
<a href="/ASSET/windshield-replacement">windshield job</a> is about adhesive,
prep and cure time, while a <a href="/ASSET/car-window-replacement">door glass
job</a> is about mechanisms, alignment and getting every last pellet out of the
door cavity.</p>

<h2>Matched to the VIN, not the model</h2>
<p>Two identical-looking SUVs can take different windshields — rain sensor or
not, acoustic interlayer or not, camera bracket or not, heated wiper park or
not. We pull the glass options from your VIN before quoting, so the part on the
van is the part your car takes, and the price you approved is the price that
holds. If both OEM and aftermarket options exist, you see both with the
difference explained.</p>

<div class="callout">
  <h3>The cheapest quote is often for the wrong glass</h3>
  <p>A quote produced without the VIN is a guess, and the gap usually surfaces
  as an "unexpected extra" once your sensor-equipped glass turns out to cost
  more than the generic one that was quoted. Ours is written against your VIN
  and includes <a href="/ASSET/adas-calibration">calibration</a> when your
  vehicle needs it — the number you approve is the number you pay.</p>
</div>
`,
      faq: [
        { q: 'Which glass on my car is safe to drive with broken?',
          a: '<p>None is ideal, but they rank. A shattered door or back glass is a security and weather problem more than a driving one. A windshield is structural — a bad crack degrades roof-crush protection and airbag timing, so it earns the most urgency even though it looks the most intact.</p>' },
        { q: 'Do you replace sunroof or quarter glass too?',
          a: '<p>Quarter glass, vent glass and most fixed panels, yes. Sunroof and specialty panels depend on the vehicle and part availability — describe it on the form and we will confirm rather than promise blind.</p>' }
      ]
    },

    {
      slug: 'car-window-replacement',
      card: {
        icon: 'door',
        title: 'Door &amp; side windows',
        blurb: 'Smashed side glass replaced, the door cavity vacuumed shard-free, and the window running its full travel again.',
        cta: 'See window replacement'
      },
      navLabel: 'Side windows',
      shortLabel: 'Car window replacement',
      title: 'Car Window Replacement, Mobile | Maximum Glass',
      desc: 'Broken door and side windows replaced at your home or office in South Florida — glass matched to the vehicle, every shard vacuumed out of the door.',
      eyebrow: 'Car window replacement',
      h1: 'Car window replacement after the glass is already gone',
      sub: '<p>A broken side window is an open door with extra steps — the priority is closing the hole today, not next week.</p>',
      svcValue: 'door-side-glass',
      body: `
<h2>Why the vacuum matters as much as the glass</h2>
<p>Tempered glass fails into thousands of pellets, and most of them fall
<em>inside</em> the door — into the cavity where the regulator, the motor and
the wiring live. New glass over old shards means grinding noises, scratched
glass and a regulator that fails early. So the door panel comes off, the cavity
gets vacuumed empty, the tracks get cleaned, and only then does the new pane go
onto the regulator. The seat and carpet get the same treatment before we hand
the car back.</p>

<h2>Between the break and the fix</h2>
<ul>
  <li>Do not run the window switch — the regulator may be carrying loose glass</li>
  <li>A trash bag and painter's tape keep the afternoon storm out without pulling paint when removed</li>
  <li>Empty the car of anything visible; a taped-over window advertises exactly one thing</li>
  <li>Photograph the door inside and out for us and, if you are claiming, for your insurer</li>
</ul>

<div class="callout">
  <h3>Side glass and your deductible</h3>
  <p>Florida's no-deductible windshield rule does not extend to side glass —
  door windows fall under your normal comprehensive deductible. If the
  deductible exceeds the job, cash is simply the better path, and we will show
  you both numbers rather than steer you into a claim that saves you nothing.</p>
</div>
`,
      faq: [
        { q: 'Can you match the tint on my other windows?',
          a: '<p>Factory "privacy glass" on rear doors and SUV cargo areas is tinted in the glass itself and matches automatically. Aftermarket film is a separate trade — the replacement glass arrives clear and a tint shop films it to match; plan for that if your car is filmed.</p>' },
        { q: 'The window works but fell inside the door. Same service?',
          a: '<p>That is usually a failed regulator clip rather than broken glass, and yes — it is <a href="/ASSET/door-glass-repair">door glass repair</a>, same van, same visit. If the glass survived, you may not be buying a window at all, just the mechanism work.</p>' }
      ]
    },

    {
      slug: 'car-window-repair',
      navLabel: 'Window repair',
      shortLabel: 'Car window repair',
      title: 'Car Window Repair — Off-Track & Stuck | Maximum Glass',
      desc: 'Windows that dropped, jam mid-travel or ignore the switch, fixed at your location in South Florida. Mechanism diagnosed before any glass is sold.',
      eyebrow: 'Car window repair',
      h1: 'Car window repair when the glass is fine and the window is not',
      sub: '<p>A window that will not move is usually a mechanism problem wearing a glass costume.</p>',
      svcValue: 'door-side-glass',
      body: `
<h2>Reading the symptom from the driver's seat</h2>
<ul>
  <li><strong>Motor hums, nothing moves</strong> — stripped regulator; the cable or scissor mechanism has let go</li>
  <li><strong>No sound at all</strong> — dead motor, failed switch or wiring; we test rather than replace on spec</li>
  <li><strong>Glass tilts and jams</strong> — off its track or a broken clip; forcing the switch finishes the job of breaking it</li>
  <li><strong>Loud clunk, then a dropped window</strong> — a regulator clip has failed and the glass is loose in the door</li>
</ul>
<p>Each of those is repairable at the van, and none of them requires buying
glass unless the pane actually cracked on its way down.</p>

<h2>Why "just the glass" quotes go wrong here</h2>
<p>A shop that sells you a pane for a mechanism problem gets to sell you a
second visit next week. Our tech opens the door, finds the failed component,
and quotes the actual repair — regulator, motor, switch, track alignment or, if
the pane did break, <a href="/ASSET/car-window-replacement">replacement glass</a>
as well. One diagnosis, one visit, one figure.</p>

<div class="callout">
  <h3>A stuck-open window cannot wait in this climate</h3>
  <p>Between the daily storm and what an open window invites, we treat
  stuck-open as the urgent version of this job. Call rather than use the form —
  if the schedule genuinely cannot reach you today, we will say so up front, and
  a taped trash bag will keep the rain out in the meantime without pulling paint.</p>
</div>
`,
      faq: [
        { q: 'Is a regulator repair worth it on an older car?',
          a: '<p>Usually yes — a regulator is a bounded, known-cost repair, far from the money pit category. We quote it against your actual vehicle and you decide; there is no minimum-job pressure because the van was coming through your area anyway.</p>' },
        { q: 'Only my rear child-locked window is dead. Urgent?',
          a: '<p>Not urgent, but worth bundling: if any other glass or window work is on your list, one visit prices better than two. Note it on the form and we will check the switch, lockout logic and motor while the van is there.</p>' }
      ]
    },

    {
      slug: 'door-glass-repair',
      navLabel: 'Door glass',
      shortLabel: 'Door glass repair',
      title: 'Door Glass Repair & Regulators | Maximum Glass',
      desc: 'Door glass, regulators, motors and switches repaired mobile across South Florida — panel off, fault found, fixed in one visit at your kerb.',
      eyebrow: 'Door glass repair',
      h1: 'Door glass repair, from the inside of the door out',
      sub: '<p>Everything that makes a door window work lives behind the door panel — which is exactly where we start.</p>',
      svcValue: 'door-side-glass',
      body: `
<h2>What lives behind the panel</h2>
<p>Pop the trim and a car door turns out to be a machine: the regulator that
carries the glass, the motor that drives it, the run channels that guide it, the
belt moulding that seals it, and the wiring that answers the switch. Any one of
them failing shows up as "the window is broken" from the driver's seat. The
repair starts with the panel off and a meter and eyes on the actual fault — a
step the parking-lot guess simply skips.</p>

<h2>One visit, done properly</h2>
<p>The van carries the tools to do this work in your driveway: trim tools that
do not crease the panel, replacement clips for the ones designed to break, and
the patience to re-align the run channels so the new or re-hung glass travels
its full height without wander. Before the panel goes back on, the window runs
its full travel several times, the vapor barrier is resealed, and every switch
position is tested — including the ones nobody uses.</p>

<div class="callout">
  <h3>The vapor barrier is not optional</h3>
  <p>Behind every door panel is a plastic membrane that keeps rain routed to the
  door drains instead of your carpet. Quick jobs tear it off and leave it. Weeks
  later the carpet is wet and the electronics in the door are corroding — a
  problem that costs more than the window did. Ours goes back sealed, every
  time.</p>
</div>
`,
      faq: [
        { q: 'My window works but rattles over bumps. Worth a visit?',
          a: '<p>A rattle is usually a worn run channel or a loose regulator fastener, and it is the cheap warning before the expensive failure — worth bundling with any other visit, and diagnosable at the same stop. Mention it on the form.</p>' },
        { q: 'Water is getting into the door and the floor is damp. Is that you?',
          a: '<p>Yes — blocked door drains or a failed vapor barrier are exactly this trade. It is also the fault people misdiagnose as a windshield leak, so describing the symptom (where, and after what weather) helps us bring the right materials.</p>' }
      ]
    },

    {
      slug: 'back-glass-repair',
      card: {
        icon: 'rear',
        title: 'Back glass',
        blurb: 'Rear windows replaced with defroster lines reconnected and the cargo area cleared of every pellet of glass.',
        cta: 'See back glass'
      },
      navLabel: 'Back glass',
      shortLabel: 'Back glass replacement',
      title: 'Back Glass Replacement, Mobile | Maximum Glass',
      desc: 'Shattered rear windows replaced across South Florida with heater grid and antenna connections remade — mobile, at your home or workplace.',
      eyebrow: 'Back glass',
      h1: 'Back glass replacement with the defroster working after',
      sub: '<p>The rear window carries more equipment than any other pane on the car — replacing it is half glass work, half reconnection.</p>',
      svcValue: 'back-glass',
      body: `
<h2>Why back glass fails so completely</h2>
<p>Rear windows are tempered, and tempered glass has exactly two states: intact,
and ten thousand pellets across your cargo floor. Heat stress, a break-in, a
mower stone or a slammed tailgate on a hot day all produce the same result — no
crack to monitor, just a hole where a window was. The job is therefore always
replacement, and always includes an unglamorous half hour with a vacuum in the
trunk carpet, the seal channels and the seat folds.</p>

<h2>The equipment on the glass</h2>
<p>Defroster grid, antenna elements on many vehicles, brake-light mounts on
some, dark privacy tint on most SUVs — the correct pane comes matched to your
VIN with the right connections in the right places, and the electrical
connections are remade and tested before we leave. The classic bad-job symptom
— a rear defroster that never works again after a cheap glass swap — is a
skipped connection, not a mystery.</p>

<div class="callout">
  <h3>Hatchbacks and sedans are different jobs</h3>
  <p>A sedan's back glass is bonded like a small windshield; a hatchback's lives
  in the moving tailgate, close to the hinges and the wiring loom, and needs its
  urethane fully cured before the gas struts start slamming it again. Both are
  van jobs — the difference is in the prep and the cure-time advice, which is
  why the quote asks what you drive.</p>
</div>
`,
      faq: [
        { q: 'Can I drive with the back glass gone?',
          a: '<p>Short distances, yes, with the cargo area cleared of loose glass. Taping plastic over the opening keeps weather out but blocks your mirror, so treat it as a to-the-driveway measure, not a for-the-week one. The van closing the hole at your home beats driving the problem around.</p>' },
        { q: 'Does the windshield deductible rule cover back glass?',
          a: '<p>No — FS 627.7288 is windshield-specific. Back glass falls under your ordinary comprehensive deductible, so we quote the cash figure alongside so you can pick the cheaper path knowingly.</p>' }
      ]
    },

    {
      slug: 'adas-calibration',
      card: {
        icon: 'target',
        title: 'ADAS recalibration',
        blurb: 'Lane-keep and emergency-braking cameras recalibrated after glass work, so the safety systems aim true.',
        cta: 'See ADAS calibration'
      },
      navLabel: 'ADAS',
      shortLabel: 'ADAS calibration',
      title: 'ADAS Camera Calibration After Glass | Maximum Glass',
      desc: 'Forward camera recalibration after windshield replacement, on site in South Florida. Required by most makers whenever the camera\'s glass changes.',
      eyebrow: 'ADAS calibration',
      h1: 'ADAS calibration: the part of a windshield you cannot see',
      sub: '<p>If your car steers itself back into lane or brakes before you do, it does it by looking through the windshield — the one we just changed.</p>',
      svcValue: 'adas-calibration',
      body: `
<h2>Why new glass means recalibration</h2>
<p>The forward camera behind your mirror measures the road in fractions of a
degree. Remove and replace the glass it looks through and the optical path
shifts — a distortion no human eye would notice, but enough to move where the
camera believes the lane lines are. That is why most manufacturers require
recalibration after windshield replacement. Skipping it does not switch the
systems off; it leaves them running on wrong information, which is worse.</p>

<h2>Static, dynamic, or both</h2>
<p>Depending on the vehicle, calibration is <strong>static</strong> — targets
placed at measured distances in a controlled space — or <strong>dynamic</strong>,
a scan-tool-guided drive at steady speed on well-marked roads, or both in
sequence. The van carries the targets and the scan hardware; South Florida's
flat, straight arterials make dynamic runs straightforward. Afterward you get
the calibration confirmation, not a shrug.</p>

<div class="callout">
  <h3>Ask this one question of any glass quote</h3>
  <p>"Does that include the camera calibration my vehicle requires?" A quote
  that leaves it out is not lower — it is incomplete, and the difference
  surfaces either as a surprise charge or as a car handed back with its safety
  systems un-aimed. Our <a href="/ASSET/windshield-replacement">windshield
  quotes</a> answer that question before you ask it.</p>
</div>
`,
      faq: [
        { q: 'How do I know if my car needs calibration?',
          a: '<p>If it has lane-keep assist, adaptive cruise, automatic emergency braking or a camera visible behind the mirror, assume yes — we confirm from your VIN when we quote, so you do not need to know your trim package\'s acronyms.</p>' },
        { q: 'Any warning signs the camera is out of calibration?',
          a: '<p>Sometimes a dash warning; more often subtle wrongness — lane-keep nudging off-center, cruise braking late or early. After any windshield work, if the paperwork does not say the camera was calibrated, treat it as not calibrated.</p>' },
        { q: 'Can you calibrate glass another shop installed?',
          a: '<p>Yes. Calibration-only visits are common cleanup for installations that skipped the step. We scan, calibrate to the maker\'s procedure and hand you the confirmation.</p>' }
      ]
    },

    {
      slug: 'mobile-service',
      card: {
        icon: 'van',
        title: 'Mobile service',
        blurb: 'Home, office, gym or roadside — the van is the shop, and it parks where your day already is.',
        cta: 'How mobile works'
      },
      navLabel: 'Mobile',
      shortLabel: 'Mobile service',
      title: 'How Mobile Auto Glass Service Works | Maximum Glass',
      desc: 'What actually happens when the glass shop comes to you: what the van carries, what a good work site needs, and how scheduling works across South FL.',
      eyebrow: 'Mobile service',
      h1: 'Mobile service is the product, not the upsell',
      sub: '<p>Some shops send a van when pressed. We never built the lobby in the first place.</p>',
      svcValue: 'not-sure',
      body: `
<h2>What the van actually carries</h2>
<p>Everything the job needs rides along: the glass (confirmed against your VIN
before the van rolls), powered urethane guns and fresh adhesive, primers, trim
tools and clips, regulators' worth of hand tools, ADAS targets and the scan
tablet, a generator for tools and vacuum, and covers for your paint and
interior. The van is not the shuttle to the shop — it <em>is</em> the shop.</p>

<h2>What makes a good work site</h2>
<ul>
  <li><strong>Level ground</strong> a car-length longer than your car — driveway, office lot, quiet curb</li>
  <li><strong>Shade or cover helps</strong> in summer heat and guards the cure against the 3pm downpour</li>
  <li><strong>Parking garages work</strong> when the ceiling clears a high-roof van and the office allows it — worth checking with building management before we book the slot</li>
  <li><strong>You do not need to be there</strong> for most of the visit — keys handed over and a phone number reachable covers it</li>
</ul>

<div class="callout">
  <h3>The morning-call advantage</h3>
  <p>Routes build through the day, so the earlier you call, the more of the map
  is still reachable. Same-day is genuinely common when your glass is a stocked
  part — most popular windshields are — and when it is a special-order pane we
  say so immediately rather than letting "same-day" quietly become Thursday.</p>
</div>
`,
      faq: [
        { q: 'Is mobile installation as good as in-shop?',
          a: '<p>The variables that decide quality — prep, primer, bead, glass handling, cure time honesty — travel perfectly well. Weather is the one thing a building adds, and South Florida\'s answer is scheduling around it plus your carport, garage or parking deck. We will postpone a set rather than beat a storm; that is the quality control.</p>' },
        { q: 'Do you charge extra for coming to me?',
          a: '<p>No trip fee inside our seven-county service area — mobile is the business model, not an add-on. The quote you approve on the form is the full figure.</p>' },
        { q: 'Can you work at my workplace parking?',
          a: '<p>Almost always — offices, hospitals, warehouses and campuses are half our schedule. Gated or managed sites just need the building\'s okay and a bay we can occupy for the duration; put the details in the form notes and we handle the rest.</p>' }
      ]
    },

    {
      slug: 'auto-insurance',
      navLabel: 'Insurance',
      shortLabel: 'Insurance claims',
      title: 'Auto Glass Insurance Claims in Florida | Maximum Glass',
      desc: 'How Florida glass coverage really works: the windshield deductible statute, the 2023 law changes, and how we bill your carrier directly.',
      eyebrow: 'Insurance claims',
      h1: 'Glass insurance claims, minus the folklore',
      sub: '<p>Florida glass coverage is genuinely unusual — which is why so much of what drivers have heard about it is half right.</p>',
      svcValue: 'not-sure',
      body: `
<h2>What the statute actually says</h2>
<p>Florida Statute 627.7288 is one sentence long once you strip the lawyering:
if a private passenger vehicle carries comprehensive coverage, the insurer
cannot apply a deductible to <em>windshield</em> repair or replacement. Not door
glass, not back glass, not liability-only policies — the windshield, under
comprehensive. Inside that boundary, your out-of-pocket is genuinely zero and
the claim does not carry a deductible to "offset," which is why any shop
offering to offset one is describing a transaction that should not exist.</p>

<h2>What changed in 2023</h2>
<p>Florida's SB 1002 rewired the glass-claim industry. Shops can no longer
offer gift cards, cash or anything of value to induce a glass claim, and
assignment of benefits — signing your claim over to the shop — is finished for
auto glass. What remains is the ordinary, legitimate path: you authorize the
work, we set up the claim with your carrier and bill them directly, and you see
everything that is filed in your name.</p>

<h2>How a claim runs at this shop</h2>
<ul>
  <li>You tell us the vehicle, the damage and your carrier on the form or the phone</li>
  <li>We confirm what your coverage pays before any work is booked — including when the honest answer is that cash is cheaper</li>
  <li>The claim is set up with you on the line, not signed away</li>
  <li>We bill the carrier directly; windshield-under-comprehensive means no deductible reaches you</li>
</ul>

<div class="callout">
  <h3>Will a glass claim raise my rates?</h3>
  <p>Rate-setting belongs to your carrier, not to us, and any shop promising "it
  never affects your premium" is promising something it does not control.
  What we can say: comprehensive glass claims are not fault claims, and your
  carrier can explain its own policy in one phone call. We would rather send
  you to the accurate answer than sell you a comfortable one.</p>
</div>
`,
      faq: [
        { q: 'Can my insurer make me use their preferred glass network?',
          a: '<p>Florida lets you choose your repair shop. Carriers may steer toward network vendors, and the steering can be persistent, but the choice of who touches your car is yours. We work with all major carriers\' claim processes daily — independent of all of them.</p>' },
        { q: 'Do I file the claim or do you?',
          a: '<p>We set it up together, typically in one call with the carrier while you are on the line to authorize. Since 2023 Florida law it must work that way — no more signing benefits over — and honestly, it was always the cleaner arrangement.</p>' },
        { q: 'What do I actually pay if I qualify under the statute?',
          a: '<p>For windshield repair or replacement under active comprehensive coverage on a private passenger vehicle: no deductible, billed direct to the carrier. For any other glass, your normal deductible applies and we quote the cash alternative beside it.</p>' }
      ]
    }
  ],

  /* ================================== HUBS ================================== */
  hubs: [
    {
      slug: 'auto-glass-repair-southeast-florida',
      area: 'A',
      navLabel: 'Southeast FL',
      shortLabel: 'All of Southeast Florida',
      title: 'Auto Glass Across Southeast Florida | Maximum Glass',
      desc: 'Mobile auto glass for Miami-Dade, Broward, Palm Beach and Monroe: windshields, side glass and ADAS calibration at your home or work.',
      eyebrow: 'Southeast Florida',
      h1: 'Auto glass service across the Southeast Florida coast',
      sub: '<p>Four counties, one van-based model: the shop drives the corridor so the customers do not have to.</p>',
      svcValue: 'windshield-replacement',
      body: `
<h2>Every city with its own page, and the coverage between them</h2>
<p>The cities we work most have their own pages —
<a href="/ASSET/auto-glass-repair-miami-fl">Miami</a>,
<a href="/ASSET/auto-glass-repair-hialeah-fl">Hialeah</a>,
<a href="/ASSET/auto-glass-repair-fort-lauderdale-fl">Fort Lauderdale</a>,
<a href="/ASSET/auto-glass-repair-pembroke-pines-fl">Pembroke Pines</a> and
<a href="/ASSET/auto-glass-repair-hollywood-fl">Hollywood</a>. Around them,
the van works the whole strip: Miami Beach, Coral Gables, Kendall, Doral,
Aventura and Homestead in Miami-Dade; Miramar, Davie, Plantation, Sunrise,
Coral Springs and Pompano Beach in Broward; Boca Raton, Delray Beach and up to
West Palm Beach in Palm Beach County; and the upper Keys in Monroe by
arrangement. If your town is not named, call — the answer is a straight yes or
no, not a maybe.</p>

<h2>Why this corridor eats windshields</h2>
<p>Southeast Florida stacks three glass hazards on one strip of coast: some of
the heaviest construction-truck traffic in the state feeding a permanent
building boom, hurricane-season storms that turn loose debris into projectiles,
and a daily heat cycle that takes every small chip and works it toward a crack.
Add the I-95, Turnpike, Palmetto and Dolphin interchanges — where following
distance goes to die — and the region produces cracked glass at a rate the
two-days-out shop appointment model was never going to serve. A van that comes
to the car serves it.</p>

<div class="callout">
  <h3>Keys trips are real, and planned</h3>
  <p>Monroe County jobs ride US-1 south with no alternate route, so we batch
  them and confirm a specific day rather than pretending the Overseas Highway is
  around the corner. Upper Keys are routine; further down, ask and we will give
  you a real answer on scheduling.</p>
</div>
`,
      faq: [
        { q: 'Do you really cover all four counties?',
          a: '<p>Yes, with honesty about the edges: the Miami-Dade and Broward core is same-day territory when glass is stocked, Palm Beach up through West Palm Beach is routine, and Monroe runs on planned days. Wherever you are, you get a real date at booking, not a window that slides.</p>' },
        { q: 'Which cities get same-day service most easily?',
          a: '<p>The closer to the Miami-Dade/Broward core, the easier: the five cities with their own pages above, plus their immediate neighbors. Distance is only half of it — glass stock is the other half, which is why the form asks for your vehicle details up front.</p>' }
      ]
    },

    {
      slug: 'auto-glass-repair-southwest-florida',
      area: 'B',
      navLabel: 'Southwest FL',
      shortLabel: 'All of Southwest Florida',
      title: 'Auto Glass in Southwest Florida | Maximum Glass',
      desc: 'Windshield and auto glass service reaching Lee, Collier and Charlotte counties — Fort Myers, Cape Coral, Naples and Punta Gorda — by scheduled mobile visit.',
      eyebrow: 'Southwest Florida',
      h1: 'Auto glass on the Gulf side, scheduled straight',
      sub: '<p>Fort Myers, Cape Coral, Naples, Punta Gorda: covered by the same van model, with scheduling that respects the distance.</p>',
      svcValue: 'windshield-replacement',
      body: `
<h2>What Gulf-coast coverage actually means</h2>
<p>Lee, Collier and Charlotte counties sit a hundred-plus miles from our
Hialeah base, across Alligator Alley — so we do not pretend they are around the
corner. What we offer instead is a firm appointment: your job is confirmed for
a specific day with the glass for your VIN already on the van when it crosses
the Alley. Fort Myers, Cape Coral, Naples, Bonita Springs, Estero, Punta Gorda
and Port Charlotte are all inside that arrangement. What you give up is the
same-afternoon option; what you keep is a shop that turns up when it said it
would, at your driveway instead of theirs.</p>

<h2>Glass life on the Gulf side</h2>
<p>The job mix differs from the east coast. I-75 and US-41 carry the chip
traffic, but the Gulf side adds its own patterns: seasonal residents returning
to cars that sat through a hot summer — and to windshields whose small chips
spent six months cycling in the heat; lanai screens and mowers feeding a steady
diet of thrown-stone side glass; and hurricane seasons that have treated this
coast roughly in recent years, with the debris cleanup still visible in tire
and glass shops' schedules. Batching several vehicles at one address — a
household, a fleet yard, an HOA's residents — makes the trip work even better;
say so on the form.</p>

<div class="callout">
  <h3>Booking a Gulf-side visit</h3>
  <p>Use the form with your vehicle details and city, and we come back with the
  next confirmed day for your area rather than a vague window. If your glass is
  special-order, the day is set after the part lands — the van does not cross
  the Alley on a maybe.</p>
</div>
`,
      faq: [
        { q: 'Is there an extra charge for Southwest Florida visits?',
          a: '<p>The quote covers the visit — there is no separate trip fee line. Scheduling is the honest cost of distance: you are booking a confirmed day rather than a same-day dash. The written figure you approve is the figure, whichever coast you are on.</p>' },
        { q: 'Can you do insurance claims on the Gulf side too?',
          a: '<p>Identically — the statute and the claim process do not change by coast. Windshield under comprehensive means no deductible; we set up the claim and bill the carrier directly wherever the van parks.</p>' }
      ]
    }
  ],

  cities: require('./cities.config.cjs')
};
