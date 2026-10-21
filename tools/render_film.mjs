// Full-film renderer: node tools/render_film.mjs [workers=4] [width=1920] [from=0] [to=DURATION]
// Splits the frame range into chunks, renders them in parallel headless-Edge workers (each pipes JPEGs into its own ffmpeg),
// concatenates them frame-exactly, then muxes audio/${EP}_mix.wav + French subtitles into out/${EP}.mp4.
import puppeteer from 'puppeteer-core'; import { serve } from './serve.mjs'; import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs'; import path from 'node:path';
const EP = process.env.EP || 'ep01', TITLE = { ep01: 'Épisode 1 · Dar Chouafa', ep02: 'Épisode 2 · Sidi Ali Boughaleb', ep03: 'Épisode 3 · La lampe à pétrole', ep04: 'Épisode 4 · Chez Lalla Aïcha' }[EP];
const FPS = 24, PAGE = `episodes/${EP}/film.html`;
const EDGE = process.env.CHROME || '/usr/bin/google-chrome';

async function worker(f0, f1, out, width) {
  const srv = await serve(), port = srv.address().port;
  const b = await puppeteer.launch({ executablePath: EDGE, headless: 'new', args: ['--disable-gpu-sandbox', '--ignore-gpu-blocklist', ...(process.env.CHROME_EXTRA ? process.env.CHROME_EXTRA.split(' ') : [])], protocolTimeout: 600000 });
  const p = await b.newPage(); await p.setViewport({ width: 1920, height: 1080 });
  p.on('pageerror', e => console.error('PAGEERROR', e.message));
  await p.goto(`http://localhost:${port}/${PAGE}`, { waitUntil: 'networkidle0', timeout: 300000 });
  await p.waitForFunction('window.ready === true', { timeout: 300000 });
  if (process.env.RENDER_H) await p.evaluate(h => { window.cv.width = Math.round(h * 16 / 9); window.cv.height = h; }, +process.env.RENDER_H);   // draw smaller, ffmpeg upscales to `width`
  const H = Math.round(width * 9 / 16);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-', '-vf', `scale=${width}:${H}:flags=lanczos`, ...(process.env.ENC === 'nvenc' ? ['-c:v', 'h264_nvenc', '-preset', 'p5', '-rc', 'vbr', '-cq', '19', '-b:v', '0'] : ['-c:v', 'libx264', '-preset', process.env.X264_PRESET || 'slow', '-crf', '17']), '-pix_fmt', 'yuv420p', '-r', String(FPS), out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = f0; f < f1; f++) {
    const data = await p.evaluate(async t => { await window.drawAt(t); return window.cv.toDataURL('image/jpeg', .95); }, f / FPS);
    if (!ff.stdin.write(Buffer.from(data.split(',')[1], 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
    if ((f - f0) % 120 === 0) console.log(`[${path.basename(out)}] ${f - f0}/${f1 - f0}  ${((Date.now() - t0) / 1000 / (f - f0 + 1)).toFixed(2)}s/frame`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await b.close(); srv.close();
}

const [, , a1, a2, a3, a4, a5] = process.argv;
if (a1 === '--worker') { await worker(+a2, +a3, a4, +a5); process.exit(0); }

const workers = +(a1 || 4), width = +(a2 || 1920);
const timing = JSON.parse(fs.readFileSync(`episodes/${EP}/timing.json`, 'utf8'));
const DUR = timing[timing.length - 1].end, from = +(a3 || 0), to = +(a4 || DUR);
const F0 = Math.round(from * FPS), F1 = Math.round(to * FPS), n = F1 - F0;
fs.mkdirSync('out/chunks', { recursive: true });
// split at scene boundaries when possible so heavy scenes spread across workers: equal frame counts is fine too
const size = Math.ceil(n / workers), jobs = [];
for (let i = 0; i < workers; i++) { const a = F0 + i * size, b = Math.min(F1, a + size); if (a < b) jobs.push([a, b, `out/chunks/c${String(i).padStart(2, '0')}.mp4`]); }
console.log(`rendering ${n} frames (${(n / FPS).toFixed(1)} s) with ${jobs.length} workers at ${width}px`);
const t0 = Date.now();
await Promise.all(jobs.map(([a, b, o]) => new Promise((res, rej) => {
  const ch = spawn(process.execPath, [process.argv[1], '--worker', a, b, o, width], { stdio: 'inherit' });
  ch.on('close', c => c === 0 ? res() : rej(new Error('worker failed ' + o)));
})));
console.log(`frames done in ${((Date.now() - t0) / 60000).toFixed(1)} min`);
fs.writeFileSync('out/chunks/list.txt', jobs.map(j => `file '${path.basename(j[2])}'`).join('\n'));
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', 'out/chunks/list.txt', '-c', 'copy', `out/${EP}_video.mp4`]);

// subtitles (French, from timing.json) as a soft track
const srt = []; let k = 1; const ts = s => { const ms = Math.round(s * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
for (const sc of timing) for (const l of sc.lines) { const txt = l.text.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(); srt.push(`${k++}\n${ts(l.start)} --> ${ts(l.start + l.dur + .3)}\n${txt}\n`); }
fs.writeFileSync(`out/${EP}.fr.srt`, srt.join('\n'));

const audio = fs.existsSync(`audio/${EP}_mix.wav`) ? `audio/${EP}_mix.wav` : null;
const args = ['-y', '-loglevel', 'error', '-i', `out/${EP}_video.mp4`];
if (audio) args.push('-i', audio);
args.push('-i', `out/${EP}.fr.srt`, '-map', '0:v');
if (audio) args.push('-map', '1:a');
args.push('-map', `${audio ? 2 : 1}:s`, '-c:v', 'copy');
if (audio) args.push('-c:a', 'aac', '-b:a', '256k');
args.push('-c:s', 'mov_text', '-metadata:s:s:0', 'language=fre', '-metadata', `title=La Boîte à Merveilles · ${TITLE}`, '-shortest', `out/${EP}.mp4`);
execFileSync('ffmpeg', args);
console.log(`out/${EP}.mp4`, audio ? 'with audio' : `WITHOUT audio (audio/${EP}_mix.wav missing)`);
