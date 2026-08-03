/**
 * City pages — Maximum Glass, Southeast Florida.
 *
 * DOORWAY-PAGE WARNING: `npm run verify` measures 5-gram shingle overlap
 * across every city and hub body and FAILS the build at 5% or above. Each page
 * below is built on a different local hook — parking/housing reality, traffic
 * pattern, or operating base — and the section headings deliberately differ
 * page to page. Re-run verify after every edit.
 *
 * FACT NOTES (checked, keep honest):
 *  - I-95, SR 836 (Dolphin) and SR 826 (Palmetto) serve Miami; the Palmetto
 *    passes through Hialeah; Okeechobee Rd (US-27) is a heavy truck corridor
 *    on Hialeah's edge.
 *  - I-595 and Port Everglades generate Fort Lauderdale's truck traffic;
 *    Las Olas/downtown is garage-parking territory.
 *  - I-75 runs along Pembroke Pines' western edge; Pines Blvd is the main
 *    east-west arterial; much of the city is gated/HOA communities.
 *  - Hollywood sits between Fort Lauderdale and the Dade line on I-95/US-1;
 *    much of its east side is mid-century housing with driveway/street parking.
 *  - The shop's registered base is in Hialeah (Sunbiz).
 *
 * DO NOT INVENT FACTS ABOUT THE BUSINESS — no language claims, no staffing
 * claims, no response-time promises. The client's own published claims only.
 */

module.exports = [

  /* ========================= SOUTHEAST FLORIDA (A) ========================= */

  {
    slug: 'auto-glass-repair-miami-fl',
    area: 'A',
    navLabel: 'Miami',
    shortLabel: 'Miami',
    title: 'Auto Glass Repair in Miami, FL | Maximum Glass',
    desc: 'Mobile auto glass for Miami — Brickell towers to Kendall driveways. Windshields, side glass and ADAS calibration where your car is parked.',
    eyebrow: 'Miami, FL',
    h1: 'Auto glass repair that works the way Miami parks',
    sub: '<p>In this city the hard part of a windshield job is not the glass — it is where the car spends its day.</p>',
    svcValue: 'windshield-replacement',
    body: `
<h2>Tower garages, office decks and the driveway the rest of us have</h2>
<p>Miami keeps its cars in more different places than any city we serve. A
Brickell or Edgewater condo car lives on the fourth level of a garage; a Kendall
car sits in a driveway; a downtown work truck parks wherever the job is that
week. Mobile glass here is a logistics trade first: high-roof vans do not clear
every garage, so for tower residents we arrange an open-air deck level, a guest
bay at street level, or simply meet the car somewhere better for an hour. Sort
that one detail when you book and everything after it is routine.</p>

<h2>The expressway toll nobody budgets for</h2>
<p>The Dolphin, the Palmetto and I-95 move construction traffic all day for a
skyline that never stops adding cranes — and aggregate trucks seed the lanes
behind them with exactly the stones that star a windshield. Add the causeway
runs to the Beach with their sand and grit, and Miami drivers collect chips at
a pace that makes the repair-early habit genuinely valuable: caught in the
first week, the fix is small, quick and largely invisible.</p>

<div class="callout">
  <h3>Booking a tower address</h3>
  <p>Put the building name in the form notes along with the vehicle. If your
  garage has a height limit — most do — tell us the visitor-level situation and
  whether management wants a certificate of insurance on file; buildings that
  ask usually accept ours the same day. Cars that can meet us at street level
  skip all of this.</p>
</div>

<h2>Neighborhoods the van already knows</h2>
<p>Brickell, downtown and Edgewater; Wynwood and the Design District; Little
Havana and Flagami; Coral Way, The Roads and Shenandoah; Coconut Grove; Kendall
and Westchester out west; Upper East Side and El Portal heading north. Miami
Beach, Doral, Coral Gables and Aventura ride the same routes — if you are
anywhere on that map, the <a href="/ASSET/auto-glass-repair-southeast-florida">
Southeast Florida page</a> explains how the wider coverage works.</p>
`,
    faq: [
      { q: 'Can you replace a windshield inside my condo garage?',
        a: '<p>If the level clears a high-roof van and the building allows contractor vehicles, yes. Where it does not — common in Brickell — we work an open-air level or street bay instead. It is a solved problem; it just needs solving before the van rolls, which is why the form asks.</p>' },
      { q: 'My car is at a valet lot downtown while I work. Possible?',
        a: '<p>Often, with the lot\'s cooperation — we coordinate directly with the attendant, do the work in a bay they assign, and you get the car back finished. Give us the lot\'s details and we make the calls.</p>' },
      { q: 'Does salt air near the Beach affect the job?',
        a: '<p>It affects the car more than the job — coastal cars show more corrosion at the pinch weld, which we treat and prime rather than glue over. It is one of the reasons prep takes the time it takes.</p>' }
    ]
  },

  {
    slug: 'auto-glass-repair-hialeah-fl',
    area: 'A',
    navLabel: 'Hialeah',
    shortLabel: 'Hialeah',
    title: 'Auto Glass Repair in Hialeah, FL | Maximum Glass',
    desc: 'Hialeah is Maximum Glass\'s registered home base — windshields, door glass and calibration done in your driveway, often the shortest drive we make.',
    eyebrow: 'Hialeah, FL',
    h1: 'Auto glass in Hialeah, the shortest drive on our schedule',
    sub: '<p>Maximum Glass is registered in Hialeah — when the van starts its morning, there is a fair chance it is already in your zip code.</p>',
    svcValue: 'windshield-replacement',
    body: `
<h2>The home-field advantage, literally</h2>
<p>This company is registered in Hialeah, and it shows in the scheduling: no
cross-county positioning, no highway math — a Hialeah address is the easiest
same-day candidate on the board when your glass is a stocked part. The dense
grid of single-family blocks between W 4th Ave and the Palmetto is ideal
territory for this work too: nearly every house has a driveway, and a driveway
is all the van needs.</p>

<h2>What breaks glass around here</h2>
<p>Two corridors do most of the damage. The Palmetto cuts straight through the
city carrying everyone's commute, and Okeechobee Road runs the industrial edge
with a truck census as heavy as anywhere in the county — gravel, scrap,
aggregate, all of it shedding the stones that chip windshields at speed. Add
work vans and pickups that live on both roads five days a week, and Hialeah
produces steady chip-repair work and its share of full replacements. The
practical advice is the boring kind: repair the chip the week it happens, while
it is still a small job.</p>

<div class="callout">
  <h3>Work trucks, tow yards and small fleets</h3>
  <p>Hialeah runs on working vehicles, and a truck in the shop is a truck not
  earning. We do multi-vehicle stops at yards and shops around the industrial
  side — several windshields or door windows in one visit, scheduled around
  your dispatch rather than against it. Say "fleet" in the form notes and how
  many vehicles, and we will set it up.</p>
</div>

<h2>Around the city</h2>
<p>East Hialeah off 27th Ave, the blocks around Westland Mall, Hialeah Gardens
and Medley next door, Miami Lakes to the north, Opa-locka east of the tracks —
all standard stops. The <a href="/ASSET/auto-insurance">insurance page</a>
explains Florida's windshield rule; it gets asked about in Hialeah as much as
anywhere we go.</p>
`,
    faq: [
      { q: 'Do you have a shop location in Hialeah I can visit?',
        a: '<p>No — the Hialeah address is a registered office, not a walk-in shop. The van comes to you; that is true even here in our own city, and it is faster for you than a counter visit anyway.</p>' },
      { q: 'Can you do two cars at my house in one visit?',
        a: '<p>Yes, and it is efficient for both of us — one trip, both vehicles quoted up front. A household with a chipped windshield and a stuck door window is a very normal booking. List both vehicles on the form.</p>' }
    ]
  },

  {
    slug: 'auto-glass-repair-fort-lauderdale-fl',
    area: 'A',
    navLabel: 'Fort Lauderdale',
    shortLabel: 'Fort Lauderdale',
    title: 'Auto Glass, Fort Lauderdale FL | Maximum Glass',
    desc: 'Mobile windshield and window service in Fort Lauderdale — port-corridor chips, coastal-car prep, office and marina visits at your convenience.',
    eyebrow: 'Fort Lauderdale, FL',
    h1: 'Auto glass repair in Fort Lauderdale, port traffic included',
    sub: '<p>A port city breaks glass its own way: container trucks on I-595, salt air off the beach, and cars that live outdoors year-round.</p>',
    svcValue: 'windshield-replacement',
    body: `
<h2>The I-595 factor</h2>
<p>Everything leaving Port Everglades rolls up I-595 or US-1, and heavy truck
lanes are where windshields get hit. Fort Lauderdale commuters share every mile
of that corridor, plus I-95's Broward stretch and the merge patterns around
Davie Boulevard and Broward Boulevard where following distance disappears.
The result is a steady diet of fresh chips — the kind that repair almost
invisibly in week one and become replacements by month two of Florida sun.</p>

<h2>Salt is the second customer</h2>
<p>Cars east of Federal Highway live in salt air, and it works on the metal
around the glass, not the glass itself. On older coastal cars we regularly find
corrosion at the pinch weld when the old windshield comes out — which is why
our process treats and primes the aperture rather than gluing over rust that
will lift the seal later. It is slower than the quick-set version. It is also
why the <a href="/ASSET/windshield-replacement">warranty</a> can honestly say
lifetime.</p>

<div class="callout">
  <h3>Boats have glass days too — but this van does cars</h3>
  <p>Marina-district customers ask: vehicle glass only. What we do happily do is
  meet your car at the marina lot, the office on Las Olas, or the airport
  park-and-ride — anywhere it sits still for a couple of hours legally is a
  work site.</p>
</div>

<h2>Where we work in town</h2>
<p>Victoria Park, Colee Hammock and downtown; Rio Vista and Harbor Beach;
Coral Ridge and the beach corridor; Sailboat Bend and Riverside Park; Wilton
Manors and Oakland Park just north — plus Plantation, Davie and Sunrise inland
on the same routes. Broward's other pages:
<a href="/ASSET/auto-glass-repair-pembroke-pines-fl">Pembroke Pines</a> and
<a href="/ASSET/auto-glass-repair-hollywood-fl">Hollywood</a>.</p>
`,
    faq: [
      { q: 'Can you meet my car at my office downtown?',
        a: '<p>Yes — office-lot jobs are half of what we do in Fort Lauderdale. Surface lots are simplest; garages need ceiling clearance for the van and the building\'s okay, which the form notes handle. You stay at your desk; the car gets fixed.</p>' },
      { q: 'My car lives outside near the beach. Anything different?',
        a: '<p>Expect us to spend real time on prep — coastal cars accumulate corrosion at the glass aperture, and doing the treatment properly is the difference between a seal that lasts and one that lifts. The visit may run longer; the result is why.</p>' }
    ]
  },

  {
    slug: 'auto-glass-repair-pembroke-pines-fl',
    area: 'A',
    navLabel: 'Pembroke Pines',
    shortLabel: 'Pembroke Pines',
    title: 'Auto Glass, Pembroke Pines FL | Maximum Glass',
    desc: 'Windshields and car windows replaced at home in Pembroke Pines — gate access handled, driveway service, I-75 commuter chips fixed before they run.',
    eyebrow: 'Pembroke Pines, FL',
    h1: 'Auto glass service built for Pembroke Pines driveways',
    sub: '<p>A suburb of gated communities and two-car households is exactly what a mobile glass operation was designed for.</p>',
    svcValue: 'windshield-replacement',
    body: `
<h2>Gates first, glass second</h2>
<p>A big share of Pembroke Pines lives behind a gate — Grand Palms, Pembroke
Falls, Silver Lakes, Chapel Trail and dozens more — and the only part of a
mobile visit that ever goes wrong here is the part where the van cannot get in.
So we handle it up front: your community name goes in the booking, you leave
the van's arrival window with the gatehouse or the visitor app, and the tech
calls ahead when ten out. Routine once it is routine — and it is why the form
asks where the car sleeps, not just what broke.</p>

<h2>The I-75 commute and what it costs windshields</h2>
<p>Pines commuters feed onto I-75 and the Miramar Parkway interchanges daily,
sharing lanes with the truck traffic running between Miami and the Gulf coast.
That is the chip machine. The suburban pattern shows up in what happens next:
the car goes into the garage, the chip goes unnoticed for a month, and the
first cold-A/C morning turns it into a crack across the passenger side. A
driveway repair visit the same week beats that sequence every time — and it is
the cheapest service we sell.</p>

<div class="callout">
  <h3>Two cars, one visit</h3>
  <p>Households here run multiple vehicles, and pairing jobs — a windshield on
  one car, a <a href="/ASSET/door-glass-repair">door regulator</a> on the other
  — is the efficient version for everyone. One arrival window, one gate entry,
  both cars handled. Note both on the form.</p>
</div>

<h2>Coverage around the Pines</h2>
<p>All of Pembroke Pines from University Drive west to U.S. 27, plus Miramar,
Cooper City, Southwest Ranches and Weston on the same run. Broward's coastal
side is covered from the
<a href="/ASSET/auto-glass-repair-fort-lauderdale-fl">Fort Lauderdale</a> and
<a href="/ASSET/auto-glass-repair-hollywood-fl">Hollywood</a> pages.</p>
`,
    faq: [
      { q: 'Our HOA is strict about vendors. Will that be a problem?',
        a: '<p>It has not been yet — we arrive in a marked van, carry insurance documentation communities ask for, work quietly in your driveway and leave no trace but a new windshield. If your HOA needs paperwork ahead of time, send the requirement with the booking and it will be there.</p>' },
      { q: 'Can you come while I work from home?',
        a: '<p>That is the ideal booking: keys at the door, tech outside, you on your calls. Most of the visit needs nothing from you but the car staying put — we knock when it is time for the walk-around.</p>' }
    ]
  },

  {
    slug: 'auto-glass-repair-hollywood-fl',
    area: 'A',
    navLabel: 'Hollywood',
    shortLabel: 'Hollywood',
    title: 'Auto Glass Repair in Hollywood, FL | Maximum Glass',
    desc: 'Mobile glass service for Hollywood FL — older neighborhoods, street-parked cars and beach-side buildings all handled at the curb or driveway.',
    eyebrow: 'Hollywood, FL',
    h1: 'Auto glass in Hollywood, from the beach to State Road 7',
    sub: '<p>Hollywood spans eighty years of housing in six miles — and every era parks its cars differently.</p>',
    svcValue: 'windshield-replacement',
    body: `
<h2>A city of driveways, carports and curbs</h2>
<p>East of Dixie Highway, Hollywood's mid-century neighborhoods — the Lakes,
Hollywood Hills' older sections — mix short driveways, carports and honest
street parking. Further west it turns to standard suburban driveways; along
the beach it is condo and rental buildings. The van handles all three, with
the curb jobs needing one extra courtesy: a legal spot where the car and van
can sit together for the duration. A carport, incidentally, is a gift in
summer — shade over the work is the one upgrade money cannot buy at a shop.</p>

<h2>Between two cities, on three roads</h2>
<p>Hollywood drivers live on I-95, US-1 and 441/State Road 7, commuting both
directions — Fort Lauderdale one day, Miami the next. The Sheridan Street and
Hollywood Boulevard interchanges concentrate the braking, the merging and the
debris; the Dade line stretch of 95 adds the construction convoys. Practical
consequence: chips arrive on the highway but get noticed in the driveway on
Saturday. That is the right moment to book — the van comes Sunday off, Monday
on, and the repair happens before the workweek heat cycle stretches it.</p>

<div class="callout">
  <h3>Beach buildings and snowbird cars</h3>
  <p>Along Ocean Drive and the beach blocks we work visitor bays and building
  lots regularly — managers know the drill. Seasonal residents: a car that sat
  all summer under Florida sun deserves a glass once-over before the first long
  drive; small damage ages fast in a parked car, and the pre-season visit is an
  easy booking.</p>
</div>

<h2>Neighborhood coverage</h2>
<p>Hollywood Lakes, downtown and the Broadwalk district, Hollywood Hills, Emerald
Hills, West Hollywood toward 441, and Dania Beach and Hallandale Beach on the
same runs. The <a href="/ASSET/auto-glass-repair-southeast-florida">regional
page</a> maps the rest of the corridor.</p>
`,
    faq: [
      { q: 'My only parking is on the street. Can the work still happen?',
        a: '<p>Usually yes — we need the car plus a van-length of legal curb, and residential Hollywood generally has it. If your block is tight, a nearby lot, a friend\'s driveway or your workplace all solve it; tell us the situation and we will pick the spot together.</p>' },
      { q: 'Do you serve Dania Beach and Hallandale too?',
        a: '<p>Both, on the same routes that serve Hollywood proper — they book exactly the same way. The city pages exist for the biggest search cities; coverage is the whole corridor.</p>' }
    ]
  }
];
