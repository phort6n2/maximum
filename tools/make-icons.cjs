#!/usr/bin/env node
/**
 * Generates the full favicon / app-icon / OG-image set into landing/img/.
 *
 * Every new client site needs the same eight files at the same eight exact
 * sizes, and producing them by hand is the kind of chore that quietly gets
 * skipped — which is how a site ends up shipping with the previous client's
 * favicon still in the tab.
 *
 *   node tools/make-icons.cjs                  placeholders, from the config
 *   node tools/make-icons.cjs path/to/logo.png the client's mark, centred
 *
 * With no source image it renders a plain mark from site.themeColor and the
 * initials of site.brandShort, and writes landing/img/.placeholder-assets so
 * preflight refuses to let the result reach production.
 *
 * Uses the Chromium that Playwright already installs — no image library, no
 * native build step. favicon.ico is an ICO container wrapping a 32x32 PNG,
 * which every browser released this century reads.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { chromium } = require('playwright');

const IMG = path.join(__dirname, '..', 'landing', 'img');
const cfg = require(path.join(__dirname, '..', 'landing', 'pages.config.cjs'));
const site = cfg.site;

const source = process.argv[2] ? path.resolve(process.argv[2]) : null;
if (source && !fs.existsSync(source)) {
  console.error('No such file: ' + source);
  process.exit(1);
}

/* Strip REPLACE__ so the placeholder art is legible rather than reading
   "REPLACE__Client" in 12px type. */
const clean = (s) => String(s || '').replace(/^REPLACE__/, '');
const theme = /^#[0-9a-f]{6}$/i.test(clean(site.themeColor)) ? clean(site.themeColor) : '#0A2650';
const label = clean(site.brandShort) || clean(site.name) || 'Brand';
const initials = label.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || 'AB';

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
  return undefined;
}

/* Square, full-bleed icon. Rounding is left to the platform — iOS masks the
   apple-touch icon itself and Android masks the maskable variant, so baking
   corners in produces a rounded square inside a rounded square.
   `pad` leaves breathing room; the maskable variant needs much more, because
   Android crops to a circle inscribed in the safe zone. */
function iconHtml(size, pad, dataUri) {
  const inner = Math.round(size * (1 - pad * 2));
  const art = dataUri
    ? `<img src="${dataUri}" style="width:${inner}px;height:${inner}px;object-fit:contain">`
    : `<span style="font:800 ${Math.round(inner * 0.52)}px/1 system-ui,sans-serif;color:#fff;
         letter-spacing:-.03em">${initials}</span>`;
  return `<body style="margin:0;width:${size}px;height:${size}px;display:flex;
    align-items:center;justify-content:center;background:${theme}">${art}</body>`;
}

/* Header wordmark, at 2x the 234x96 box the template reserves. Rendered on
   white because that is what the header is — a mark on the brand colour would
   ship as a coloured slab in the top-left corner of every page. */
function wordmarkHtml() {
  return `<body style="margin:0;width:468px;height:192px;display:flex;
    align-items:center;justify-content:center;background:#fff">
    <span style="font:800 46px/1 system-ui,sans-serif;color:${theme};
      letter-spacing:-.03em;text-align:center;padding:0 16px">${label}</span></body>`;
}

function ogHtml(dataUri) {
  const art = dataUri
    ? `<img src="${dataUri}" style="max-width:640px;max-height:220px;object-fit:contain">`
    : `<div style="font:800 84px/1 system-ui,sans-serif;color:#fff;letter-spacing:-.03em">${label}</div>`;
  return `<body style="margin:0;width:1200px;height:630px;display:flex;flex-direction:column;
    align-items:center;justify-content:center;gap:28px;background:${theme}">
    ${art}
    <div style="font:500 30px/1.3 system-ui,sans-serif;color:#ffffffcc">${clean(site.serviceArea && site.serviceArea.label) || ''}</div>
  </body>`;
}

/* Minimal ICO: one 32x32 PNG in a single-entry directory. */
function icoFromPng(png) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);        // reserved
  header.writeUInt16LE(1, 2);        // type 1 = icon
  header.writeUInt16LE(1, 4);        // one image
  const entry = Buffer.alloc(16);
  entry[0] = 32;                     // width  (0 would mean 256)
  entry[1] = 32;                     // height
  entry[2] = 0;                      // palette size
  entry[3] = 0;                      // reserved
  entry.writeUInt16LE(1, 4);         // colour planes
  entry.writeUInt16LE(32, 6);        // bits per pixel
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(header.length + entry.length, 12);
  return Buffer.concat([header, entry, png]);
}

(async () => {
  let dataUri = null;
  if (source) {
    const ext = path.extname(source).slice(1).toLowerCase();
    const mime = ext === 'svg' ? 'image/svg+xml' : ext === 'jpg' ? 'image/jpeg' : 'image/' + ext;
    dataUri = 'data:' + mime + ';base64,' + fs.readFileSync(source).toString('base64');
  }

  const browser = await chromium.launch({ executablePath: chromePath() });
  const written = [];

  async function shoot(name, html, w, h) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    await page.setContent(html);
    const buf = await page.screenshot({ type: 'png', omitBackground: false });
    fs.writeFileSync(path.join(IMG, name), buf);
    await ctx.close();
    written.push(name);
    return buf;
  }

  fs.mkdirSync(IMG, { recursive: true });

  await shoot('icon-16.png', iconHtml(16, 0.10, dataUri), 16, 16);
  const px32 = await shoot('icon-32.png', iconHtml(32, 0.10, dataUri), 32, 32);
  await shoot('icon-192.png', iconHtml(192, 0.14, dataUri), 192, 192);
  await shoot('icon-512.png', iconHtml(512, 0.14, dataUri), 512, 512);
  await shoot('icon-maskable-512.png', iconHtml(512, 0.24, dataUri), 512, 512);
  await shoot('apple-touch-icon.png', iconHtml(180, 0.14, dataUri), 180, 180);
  await shoot('og-image.png', ogHtml(dataUri), 1200, 630);

  /* The header logo is the one asset that must NOT be re-rendered onto the
     brand colour — it sits on a white header, so whatever transparency the
     client's file has needs to survive. Copy it through untouched. */
  if (source) {
    const logoName = 'logo-wordmark' + path.extname(source).toLowerCase();
    fs.copyFileSync(source, path.join(IMG, logoName));
    written.push(logoName);
    if (logoName !== site.logo) {
      console.log('NOTE set site.logo = \'' + logoName + '\' in pages.config.cjs');
    }
  } else {
    await shoot('logo-wordmark.png', wordmarkHtml(), 468, 192);
  }

  fs.writeFileSync(path.join(IMG, 'favicon.ico'), icoFromPng(px32));
  written.push('favicon.ico');

  await browser.close();

  const manifest = path.join(IMG, '.placeholder-assets');
  if (source) {
    /* Real artwork: drop the manifest so preflight stops objecting. */
    if (fs.existsSync(manifest)) fs.unlinkSync(manifest);
    console.log('Wrote ' + written.length + ' asset(s) from ' + path.basename(source));
  } else {
    const lines = written
      .filter((v, i, a) => a.indexOf(v) === i)
      .map((n) => crypto.createHash('md5').update(fs.readFileSync(path.join(IMG, n))).digest('hex') + '  ' + n);
    fs.writeFileSync(manifest, lines.join('\n') + '\n');
    console.log('Wrote ' + lines.length + ' PLACEHOLDER asset(s). Preflight will block a build');
    console.log('until they are replaced — rerun with the client\'s logo:');
    console.log('  node tools/make-icons.cjs path/to/client-logo.png');
  }
})();
