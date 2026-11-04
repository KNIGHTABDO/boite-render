#!/usr/bin/env node
// Geometry gate. t in the output is SCENE-LOCAL seconds; published = timing.start + t.
import puppeteer from 'puppeteer-core';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from './serve.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const usage = 'node tools/shotcheck.mjs epNN [--scenes s05_frotteurs,s15_gilet] [--fps 4] [--out episodes/epNN/shotcheck.json] [-o report.md] [--from localSeconds --to localSeconds] [--annotations file.json]';
export function options(argv) {
  const [episode, ...args] = argv;
  if (!/^ep\d{2}$/.test(episode || '')) throw new Error(usage);
  const opt = { episode, fps: 4, out: `episodes/${episode}/shotcheck.json`, from: 0, to: Infinity };
  const names = { '--scenes': 'scenes', '--fps': 'fps', '--out': 'out', '-o': 'report', '--from': 'from', '--to': 'to', '--annotations': 'annotations' };
  while (args.length) {
    const flag = args.shift(), key = names[flag], value = args.shift();
    if (!key || value === undefined) throw new Error(`Invalid option ${flag}\n${usage}`);
    opt[key] = ['fps', 'from', 'to'].includes(key) ? Number(value) : value;
  }
  if (!(Number.isFinite(opt.fps) && opt.fps > 0 && opt.fps <= 120)) throw new Error('--fps must be > 0 and <= 120');
  if (!(Number.isFinite(opt.from) && opt.from >= 0 && opt.to > opt.from)) throw new Error('Invalid --from/--to range');
  if (opt.scenes !== undefined) opt.scenes = opt.scenes.split(',').filter(Boolean);
  return opt;
}
// Read literal ac/st boundaries without executing scene code. Nonliteral timelines use the camera fallback.
export function boundaries(source, sc) {
  const start = source.lastIndexOf('segs:');
  if (start < 0) return [];
  const calls = [...source.slice(start).matchAll(/\b(?:ac\(\s*|st\(\s*['"][^'"]+['"]\s*,\s*)\[\s*(\d+)\s*,\s*([\d.]+)\s*\]/g)];
  let prev = -1;
  return calls.map((m, i) => {
    const line = sc.lines[+m[1]], a = i && line ? line.start - sc.start + Number(m[2]) * line.dur : 0;
    prev = Math.max(a, prev + .05); return prev;
  });
}
async function write(file, data) {
  const target = path.resolve(root, file); await fs.mkdir(path.dirname(target), { recursive: true });
  const temp = target + '.tmp'; await fs.writeFile(temp, data); await fs.rename(temp, target);
}
export async function run(opt) {
  const base = path.join(root, 'episodes', opt.episode);
  const timing = JSON.parse(await fs.readFile(path.join(base, 'timing.json'), 'utf8'));
  let cast = {};
  try { cast = JSON.parse(await fs.readFile(path.join(base, 'cast.json'), 'utf8')).characters || {}; }
  catch (e) { if (e.code !== 'ENOENT') throw e; }
  const annotations = opt.annotations ? JSON.parse(await fs.readFile(path.resolve(root, opt.annotations), 'utf8')) : {};
  const selected = opt.scenes || timing.map(s => s.id);
  if (!selected.length || selected.some(id => !timing.some(s => s.id === id))) throw new Error('Unknown or empty --scenes');
  const failures = [], stats = [], srv = await serve();
  try {
    for (const id of selected) {
      const sc = timing.find(s => s.id === id), duration = sc.end - sc.start;
      if (opt.from >= duration) throw new Error(`--from is beyond ${id} (${duration}s)`);
      const source = await fs.readFile(path.join(base, 'scenes', id + '.js'), 'utf8');
      const cuts = boundaries(source, sc), started = performance.now();
      let browser;
      console.log(`${id}: loading (320x180, WebGL draw disabled)`);
      try {
        browser = await puppeteer.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', headless: true,
          args: ['--disable-dev-shm-usage', '--disable-gpu-sandbox', '--js-flags=--max-old-space-size=1024', ...(process.env.CHROME_EXTRA || '').split(' ').filter(Boolean)] });
        const page = await browser.newPage(); await page.setViewport({ width: 320, height: 180 });
        const errors = [];
        page.on('pageerror', e => errors.push(e.message));
        page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
        await page.setRequestInterception(true);
        page.on('request', req => {
          // Fonts have no bearing on geometry, and remote font services can stall page readiness.
          if (!req.url().startsWith(`http://localhost:${srv.address().port}/`) && !req.url().startsWith('data:')) return void req.abort();
          void req.continue();
        });
        await page.evaluateOnNewDocument(() => { window.QA = { noRender: true }; window.NOSUB = true; });
        await page.goto(`http://localhost:${srv.address().port}/episodes/${opt.episode}/film.html`, { waitUntil: 'load', timeout: 60000 });
        await page.waitForFunction('window.ready === true', { timeout: 60000 });
        // Use the real film entry point and helper/timing objects, but keep the canvas tiny too.
        await page.evaluate(async () => {
          window.cv.width = 320; window.cv.height = 180;
          window.__shotcheck = await import('/tools/shotcheck-browser.mjs');
          window.__qaPrevious = null;
        });
        let count = 0, last = null, lastProgress = performance.now();
        const end = Math.min(duration, opt.to);
        for (let n = 0; opt.from + n / opt.fps < end - 1e-8; n++) {
          const t = opt.from + n / opt.fps, cut = last === null || cuts.some(c => c > last && c <= t);
          const rows = await page.evaluate(async args => {
            if (window.__qa) { window.__qa.active = []; for (const q of window.__qa.stages) q.faces.clear(); }
            await window.drawAt(args.published);
            const result = window.__shotcheck.sample({ ...args, previous: window.__qaPrevious });
            window.__qaPrevious = { states: result.states, cameras: result.cameras };
            return result.failures;
          }, { scene: id, t, published: sc.start + t, cast, annotations: annotations[id] || {}, cut });
          // Film.js catches preload errors: surface those instead of treating a placeholder as a clean scene.
          const fatal = errors.filter(e => !/net::ERR_FAILED|Failed to load resource|favicon/.test(e));
          if (fatal.length) throw new Error(fatal.join('\n'));
          failures.push(...rows); count++; last = t;
          if (performance.now() - lastProgress > 15000) { console.log(`${id}: ${count} samples, local ${t.toFixed(2)}s`); lastProgress = performance.now(); }
        }
        const sceneFailures = failures.filter(f => f.scene === id), counts = {};
        for (const f of sceneFailures) counts[f.check] = (counts[f.check] || 0) + 1;
        const seconds = (performance.now() - started) / 1000;
        const registrations = await page.evaluate(() => ({ actors: window.__qa?.actors.length || 0, props: window.__qa?.props.length || 0 }));
        const stat = { scene: id, samples: count, seconds: +seconds.toFixed(2), counts, ...registrations }; stats.push(stat);
        console.log(`${id}: ${sceneFailures.length ? 'FAIL' : 'PASS'} ${count} samples, ${stat.seconds}s; ${Object.entries(counts).map(([k, v]) => `${k}=${v}`).join(' ') || 'no failures'}; registered actors=${stat.actors} props=${stat.props}`);
        for (const f of sceneFailures.slice(0, 5)) console.log(`  ${f.t.toFixed(2)}s ${f.check} ${JSON.stringify(f.who)} ${JSON.stringify(f.value)} (limit ${f.limit})`);
      } finally { if (browser) await browser.close(); }
    }
    await write(opt.out, JSON.stringify(failures, null, 2) + '\n');
    await write(opt.out.replace(/\.json$/, '') + '.stats.json', JSON.stringify(stats, null, 2) + '\n');
    if (opt.report) await write(opt.report, [
      `shotcheck ${opt.episode}: ${failures.length ? 'FAIL' : 'PASS'}`, `Command: ${usage}`, `JSON: ${opt.out}`,
      'Times in JSON are scene-local seconds; add timing.json start for published time.',
      ...stats.map(s => `${s.scene}: ${s.samples} samples in ${s.seconds}s; ${JSON.stringify(s.counts)}`),
      'Checks: feet, overlap, faceyaw, headcut, arm, prop, height, pop.',
      'Geometry only, 320x180 canvas, no WebGL rendering, one Chrome process at a time.',
      'Limits: undeclared supports/grips/ownership and incorrect cast metadata need annotations.',
    ].join('\n') + '\n');
    return { failures, stats };
  } finally { await new Promise(resolve => srv.close(resolve)); }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = await run(options(process.argv.slice(2))); process.exitCode = result.failures.length ? 1 : 0;
  } catch (e) { console.error('shotcheck:', e.stack || e.message); process.exitCode = 2; }
}
