// Single Chrome, one reused plate bench; all requests remain on the local static server.
import fs from 'node:fs/promises';
import puppeteer from 'puppeteer-core';
import { serve } from './serve.mjs';
if (process.env.GITHUB_ACTIONS !== 'true') throw new Error('E1 renders run only in the stills.yml GitHub Actions workflow.');
const cal = JSON.parse(await fs.readFile('episodes/ep07/cal.json'));
const srv = await serve(); let browser;
try {
  browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: true, timeout: 60000, env: { ...process.env, XDG_CONFIG_HOME: '/tmp/e1-xdg' }, args: ['--no-sandbox','--disable-dev-shm-usage','--disable-gpu-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-background-networking','--disable-component-update','--no-first-run','--proxy-server=http://127.0.0.1:9','--proxy-bypass-list=localhost;127.0.0.1'] });
  const page = await browser.newPage(); await page.setViewport({ width: 1920, height: 1080 });
  await page.setRequestInterception(true); page.on('request', r => void (new URL(r.url()).hostname === 'localhost' ? r.continue() : r.abort()));
  page.on('pageerror', e => console.log('ERROR', e.message));
  await page.goto(`http://localhost:${srv.address().port}/test/proto/plate.html`); await page.waitForFunction('window.ready === true');
  const results = process.argv[2] ? JSON.parse(await fs.readFile('out/e1/calibration.json')) : {};
  const names = process.argv[2]?.split(',') || Object.keys(cal).filter(k => !k.startsWith('_') && !cal[k].alias);
  await fs.mkdir('out/e1/calibration', { recursive: true });
  for (const name of names) {
    const own = await fs.access(`art/plates/ep07/${name}.png`).then(() => true, () => false);
    const reference = cal[name].scale_check || { foot: [280,960], top: 85, height: 1.8, kind: 'door', actor: 1.62 };
    const r = await page.evaluate(async ({ name, entry, reference }) => {
      await window.setPlate(name, entry, reference); window.drawAt(0);
      const cv = new OffscreenCanvas(640,360);cv.getContext('2d').drawImage(window.cv,0,0,640,360);
      const blob = await cv.convertToBlob({ type:'image/jpeg', quality:.85 });
      return { metrics: window.M, jpg: await new Promise(ok => { const r = new FileReader(); r.onload = () => ok(r.result); r.readAsDataURL(blob); }) };
    }, { name: (own ? 'ep07/' : '') + name, entry: cal[name], reference });
    results[name] = r.metrics; await fs.writeFile(`out/e1/calibration/${name}.jpg`, Buffer.from(r.jpg.split(',')[1], 'base64'));
    console.log(name, JSON.stringify(r.metrics.reference));
  }
  await fs.writeFile('out/e1/calibration.json', JSON.stringify(results,null,2)+'\n');
} finally { if (browser) await browser.close(); await new Promise(r => srv.close(r)); }
