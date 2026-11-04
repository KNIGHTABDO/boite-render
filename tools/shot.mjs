// node tools/shot.mjs <page.html> <out.png> [t1,t2,...]  -> screenshots of window.drawAt(t)
import puppeteer from 'puppeteer-core'; import { serve } from './serve.mjs'; import fs from 'node:fs';
const [page, out, ts = '0'] = process.argv.slice(2);
const srv = await serve(); const port = srv.address().port;
const b = await puppeteer.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', headless: 'new', timeout: 60000, env: { ...process.env, XDG_CONFIG_HOME: '/tmp/e1-xdg' }, args: ['--disable-gpu-sandbox', '--disable-dev-shm-usage', '--disable-background-networking', '--disable-component-update', '--disable-sync', '--no-first-run', '--proxy-server=http://127.0.0.1:9', '--proxy-bypass-list=localhost;127.0.0.1', ...(process.env.CHROME_EXTRA || '').split(' ').filter(Boolean)] });
const p = await b.newPage(); await p.setViewport({ width: 1920, height: 1080 });
p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.log('PAGE', m.type(), m.text()); });
p.on('pageerror', e => console.log('PAGEERROR', e.message));
// Benches are local: do not fetch remote fonts, services or other external resources.
await p.setRequestInterception(true);
p.on('request', r => { const u = new URL(r.url()); void (['localhost', '127.0.0.1', '[::1]'].includes(u.hostname) || ['data:', 'blob:'].includes(u.protocol) ? r.continue() : r.abort()); });
if (process.env.NOSUB) await p.evaluateOnNewDocument(() => { window.NOSUB = true; });
try {
await p.goto(`http://localhost:${port}/${page}`, { waitUntil: 'networkidle0' });
await p.waitForFunction('window.ready === true', { timeout: 60000 });
for (const t of ts.split(',')) {
  const f = ts.includes(',') ? out.replace(/\.(png|jpg)$/, `_${t}.$1`) : out;
  const data = await p.evaluate(async ({ t, png, width }) => {
    await window.drawAt(+t); let cv = window.cv;
    if (width > 0 && width !== cv.width) { const scaled = document.createElement('canvas'); scaled.width = width; scaled.height = Math.round(cv.height * width / cv.width); scaled.getContext('2d').drawImage(cv, 0, 0, scaled.width, scaled.height); cv = scaled; }
    return cv.toDataURL(png ? 'image/png' : 'image/jpeg', .9);
  }, { t, png: /\.png$/i.test(f), width: +(process.env.SHOT_WIDTH || 0) });
  fs.writeFileSync(f, Buffer.from(data.split(',')[1], 'base64')); console.log(f);
}
} finally { await b.close(); srv.close(); }
