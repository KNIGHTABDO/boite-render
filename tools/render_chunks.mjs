// Resumable chunked render for big multi-core machines: node tools/render_chunks.mjs [workers] [width=1920] [chunk=400]
// Splits the whole film into equal frame chunks (out/chunks/<EP>/cNNNNN.mp4), renders them with a worker pool,
// skips chunks already complete (so a disconnect only loses chunks in progress), then concat + mux -> out/<EP>.mp4.
import { spawn, execFileSync } from 'node:child_process'; import fs from 'node:fs';
const EP = process.env.EP || 'ep03', FPS = 24, workers = +(process.argv[2] || 4), width = +(process.argv[3] || 1920), CH = +(process.argv[4] || 400);
const TITLE = { ep03: 'Épisode 3 · La lampe à pétrole', ep04: 'Épisode 4 · Chez Lalla Aïcha', ep05: 'Épisode 5 · Le Deuil' }[EP] || EP;
const timing = JSON.parse(fs.readFileSync(`episodes/${EP}/timing.json`, 'utf8'));
const N = Math.round(timing[timing.length - 1].end * FPS), dir = `out/chunks/${EP}`; fs.mkdirSync(dir, { recursive: true });
const frames = f => { try { return +execFileSync('ffprobe', ['-v', 'error', '-count_packets', '-select_streams', 'v:0', '-show_entries', 'stream=nb_read_packets', '-of', 'csv=p=0', f]).toString().trim(); } catch { return -1; } };
const jobs = []; for (let a = 0; a < N; a += CH) jobs.push({ a, b: Math.min(N, a + CH), out: `${dir}/c${String(a).padStart(6, '0')}.mp4` });
const todo = jobs.filter(j => !(fs.existsSync(j.out) && frames(j.out) === j.b - j.a));
console.log(`${N} frames, ${jobs.length} chunks, ${jobs.length - todo.length} done, rendering ${todo.length} with ${workers} workers`);
const t0 = Date.now(); let done = jobs.length - todo.length;
// CHROME_EXTRA_LIST='flagsA|flagsB|...' gives worker i its own Chrome flags (e.g. GPU workers next to swiftshader ones)
const FLAGS = process.env.CHROME_EXTRA_LIST ? process.env.CHROME_EXTRA_LIST.split('|') : null;
async function run(w) {
  while (todo.length) {
    const j = todo.shift(), tmp = `/tmp/${EP}_${j.a}.mp4`;
    const env = FLAGS ? { ...process.env, CHROME_EXTRA: FLAGS[w % FLAGS.length] } : process.env;
    const ok = await new Promise(res => { const ch = spawn(process.execPath, ['tools/render_film.mjs', '--worker', j.a, j.b, tmp, width], { stdio: ['ignore', 'inherit', 'inherit'], env }); ch.on('close', c => res(c === 0)); });
    if (ok) { fs.copyFileSync(tmp, j.out); fs.unlinkSync(tmp); done++; console.log(`✓ chunk ${j.a} (${done}/${jobs.length}, ${((Date.now() - t0) / 60000).toFixed(1)} min)`); }
    else { console.log(`✗ chunk ${j.a} failed, retrying later`); todo.push(j); }
  }
}
await Promise.all(Array.from({ length: workers }, (_, w) => run(w)));
fs.writeFileSync(`${dir}/list.txt`, jobs.map(j => `file '${j.out.split('/').pop()}'`).join('\n'));
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', `${dir}/list.txt`, '-c', 'copy', `/tmp/${EP}_video.mp4`]);
const srt = []; let k = 1; const ts = s => { const ms = Math.round(s * 1000); return `${String(Math.floor(ms / 3600000)).padStart(2, '0')}:${String(Math.floor(ms / 60000) % 60).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
for (const sc of timing) for (const l of sc.lines) srt.push(`${k++}\n${ts(l.start)} --> ${ts(l.start + l.dur + .3)}\n${l.text.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()}\n`);
fs.writeFileSync(`/tmp/${EP}.fr.srt`, srt.join('\n'));
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', `/tmp/${EP}_video.mp4`, '-i', `audio/${EP}_mix.wav`, '-i', `/tmp/${EP}.fr.srt`,
  '-map', '0:v', '-map', '1:a', '-map', '2:s', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-c:s', 'mov_text', '-metadata:s:s:0', 'language=fre',
  '-metadata', `title=La Boîte à Merveilles · ${TITLE}`, '-movflags', '+faststart', `/tmp/${EP}.mp4`]);
fs.copyFileSync(`/tmp/${EP}.mp4`, `out/${EP}.mp4`); fs.copyFileSync(`/tmp/${EP}.fr.srt`, `out/${EP}.fr.srt`);
console.log(`out/${EP}.mp4 done in ${((Date.now() - t0) / 60000).toFixed(1)} min`);
