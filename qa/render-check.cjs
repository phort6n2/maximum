const { chromium } = require('playwright');
const path = require('path');
const http = require('http');
const fs = require('fs');

const ROOT = path.join(__dirname,'..','quote-site');
const MIME = {'.html':'text/html','.css':'text/css','.js':'application/javascript',
  '.webp':'image/webp','.png':'image/png','.ico':'image/x-icon','.xml':'application/xml',
  '.txt':'text/plain','.json':'application/json','.webmanifest':'application/manifest+json'};

/* Chromium lives at a version-stamped path that moves every Playwright bump.
   Resolve it, and fall back to letting Playwright find its own — a hardcoded
   path turns a routine dependency update into a mystery QA failure. */
function chromePath() {
  const roots = [process.env.PLAYWRIGHT_BROWSERS_PATH, '/opt/pw-browsers'].filter(Boolean);
  for (const root of roots) {
    let entries = [];
    try { entries = fs.readdirSync(root); } catch (e) { continue; }
    for (const name of entries.filter((n) => n.startsWith('chromium')).sort().reverse()) {
      for (const rel of ['chrome-linux/chrome', 'chrome-linux64/chrome', 'chrome']) {
        const p = path.join(root, name, rel);
        if (fs.existsSync(p)) return p;
      }
    }
  }
  return undefined;   // undefined => Playwright resolves it itself
}

/* Default targets when none are given on the command line: the home page, the
   first service page and the first city page, each at the breakpoints that have
   actually produced bugs here — 1440 desktop, 768 tablet, 390 phone, and 320,
   which is the width that catches anything relying on a minimum. Reading the
   slugs out of the built site keeps this working for any client's URL scheme. */
function defaultTargets() {
  const kind = (slug) => {
    const f = path.join(ROOT, slug, 'index.html');
    try {
      const m = /<meta name="page-kind" content="([a-z]*)">/.exec(fs.readFileSync(f, 'utf8'));
      return m ? m[1] : '';
    } catch (e) { return ''; }
  };
  const slugs = fs.readdirSync(ROOT, { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name !== 'img')
    .map((e) => e.name).sort();
  const first = (k) => slugs.find((s) => kind(s) === k);
  const svc = first('service');
  const city = first('city') || first('hub');
  const out = [
    '@1440@1100@desk-home', '@390@844@mob-home', '@320@700@w320-home'
  ];
  if (svc) out.push(svc + '@768@1000@tab-svc');
  if (city) out.push(city + '@1440@1100@desk-city');
  return out;
}

const server = http.createServer((req,res)=>{
  let p = decodeURIComponent(req.url.split('?')[0]);
  let f = path.join(ROOT, p);
  try { if (fs.statSync(f).isDirectory()) f = path.join(f,'index.html'); } catch(e){}
  if (!fs.existsSync(f)) { res.writeHead(404); return res.end('nf'); }
  res.writeHead(200, {'Content-Type': MIME[path.extname(f)] || 'application/octet-stream'});
  fs.createReadStream(f).pipe(res);
});

(async () => {
  await new Promise(r => server.listen(8099, r));
  const browser = await chromium.launch({ executablePath: chromePath() });
  const errors = [];
  const targets = process.argv.length > 2 ? process.argv.slice(2) : defaultTargets();
  for (const spec of targets) {
    const [slug, w, h, tag] = spec.split('@');
    const ctx = await browser.newContext({ viewport:{width:+w, height:+h}, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    /* The sandbox has no outbound network, so the Google Maps iframe and the GHL
       DNI scripts fail to load and surface as console errors that are noise, not
       defects. Stub them so real errors stand out. */
    await page.route('**maps.google.com/**', r => r.fulfill({ status: 200,
      contentType: 'text/html', body: '<body style="margin:0;background:#e8eef2"></body>' }));
    await page.route('**leadconnectorhq.com/**', r => r.fulfill({ status: 200,
      contentType: 'application/javascript', body: '/* stub */' }));
    await page.route('**googletagmanager.com/**', r => r.fulfill({ status: 200,
      contentType: 'application/javascript', body: 'window.__gtagStubbed=true;' }));
    page.on('console', m => { if (m.type()==='error') errors.push(`${slug} ${w}px CONSOLE: ${m.text()}`); });
    page.on('requestfailed', r => errors.push(`${slug} ${w}px REQFAIL: ${r.url()} :: ${(r.failure()||{}).errorText}`));
    page.on('pageerror', e => errors.push(`${slug} ${w}px PAGEERROR: ${e.message}`));
    await page.goto(`http://localhost:8099/${slug}?gclid=TEST123&utm_source=google&utm_campaign=oc-core`, {waitUntil:'load'});
    await page.waitForTimeout(350);
    // horizontal overflow check
    const ov = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
      offenders: [...document.querySelectorAll('*')]
        .filter(el => el.getBoundingClientRect().right > document.documentElement.clientWidth + 1)
        .slice(0,5).map(el => el.tagName+'.'+(el.className||'').toString().slice(0,40))
    }));
    if (ov.scrollW > ov.clientW + 1) {
      errors.push(`${slug} ${w}px HORIZONTAL OVERFLOW ${ov.scrollW}>${ov.clientW} :: ${ov.offenders.join(' | ')}`);
    } else if (ov.offenders.length) {
      /* Elements sitting past the viewport while the document does NOT scroll.
         A parent is clipping them, so the content is simply invisible and the
         old scrollWidth test stayed silent. That is how a broken card heading
         shipped: it wrapped one word per line off the right edge and this check
         reported "no overflow". Clipped is worse than scrollable, not better. */
      errors.push(`${slug} ${w}px CLIPPED OVERFLOW (content past the viewport, hidden by a parent) :: ${ov.offenders.join(' | ')}`);
    }
    // tap target check
    const small = await page.evaluate(() => [...document.querySelectorAll('a,button,input,select')]
      .filter(el => {              // WCAG 2.5.8 exempts links inline in a sentence
        if (el.tagName !== 'A') return true;
        const p = el.closest('p,li,blockquote,figcaption');
        if (!p) return true;
        const txt = (p.textContent || '').trim().length;
        const own = (el.textContent || '').trim().length;
        return !(txt > own + 12);   // surrounded by prose → inline, exempt
      })
      .map(el => { const r = el.getBoundingClientRect(); return {t:el.tagName, w:Math.round(r.width), h:Math.round(r.height),
        txt:(el.textContent||el.getAttribute('aria-label')||'').trim().slice(0,26)}; })
      .filter(x => x.h > 0 && x.h < 24).slice(0,6));
    if (small.length) errors.push(`${slug} ${w}px SMALL TAP: ${JSON.stringify(small)}`);
    await page.screenshot({ path:path.join(__dirname,'..','.qa-shots',`${tag}.png`), fullPage: (h>2000) });
    await ctx.close();
  }
  await browser.close();
  server.close();
  console.log(errors.length ? "ISSUES:\n" + errors.join('\n') : "No console errors, no overflow, no sub-24px tap targets.");
})();
