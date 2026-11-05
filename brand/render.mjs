import puppeteer from 'puppeteer-core'; import { serve } from '../tools/serve.mjs'; import fs from 'node:fs';
const srv = await serve(), port = srv.address().port;
const b = await puppeteer.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', headless: 'new', args: (process.env.CHROME_EXTRA || '').split(' ').filter(Boolean) });
const p = await b.newPage(); p.on('pageerror', e => console.log('PAGEERROR', e.message));
await p.goto(`http://localhost:${port}/brand/brand.html${process.env.EP ? '?ep=' + process.env.EP : ''}`, { waitUntil: 'networkidle0', timeout: 300000 }); await p.waitForFunction('window.ready === true', { timeout: 300000 });
for (const n of (process.argv[2] || 'logo,wordmark,banner,thumb').split(',')) {
  const d = await p.evaluate(n => window.render(n), n); fs.writeFileSync(`brand/${n}.png`, Buffer.from(d.split(',')[1], 'base64')); console.log('brand/' + n + '.png');
}
await b.close(); srv.close();
