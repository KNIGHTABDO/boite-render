// node tools/shot.mjs <page.html> <out.png> [t1,t2,...]  -> screenshots of window.drawAt(t)
import puppeteer from 'puppeteer-core'; import { serve } from './serve.mjs'; import fs from 'node:fs';
const [page, out, ts = '0'] = process.argv.slice(2);
const srv = await serve(); const port = srv.address().port;
const b = await puppeteer.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', headless: 'new', args: ['--disable-gpu-sandbox', ...(process.env.CHROME_EXTRA || '').split(' ').filter(Boolean)] });
const p = await b.newPage(); await p.setViewport({ width: 1920, height: 1080 });
p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.log('PAGE', m.type(), m.text()); });
p.on('pageerror', e => console.log('PAGEERROR', e.message));
await p.goto(`http://localhost:${port}/${page}`, { waitUntil: 'networkidle0' });
await p.waitForFunction('window.ready === true', { timeout: 60000 });
for (const t of ts.split(',')) {
  const data = await p.evaluate(async t => { await window.drawAt(+t); return window.cv.toDataURL('image/jpeg', .9); }, t);
  const f = ts.includes(',') ? out.replace(/\.(png|jpg)$/, `_${t}.jpg`) : out;
  fs.writeFileSync(f, Buffer.from(data.split(',')[1], 'base64')); console.log(f);
}
await b.close(); srv.close();
