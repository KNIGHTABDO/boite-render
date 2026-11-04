// node tools/scene-stills.mjs <epNN> <sceneId> [outDir=out/scenes-stills]
// GHA scene review: one still near the start and one at the middle of every spoken line of the scene (global times),
// 960 px JPGs via tools/shot.mjs, then a labelled contact sheet (tools/scene-sheet.py). Never run this on the laptop.
import fs from 'node:fs'; import { execFileSync } from 'node:child_process';
const [ep, id, out = 'out/scenes-stills'] = process.argv.slice(2);
const sc = JSON.parse(fs.readFileSync(`episodes/${ep}/timing.json`, 'utf8')).find(s => s.id === id);
if (!sc) throw new Error('no scene ' + id);
const ts = [sc.start + .25];
for (const l of sc.lines) ts.push(l.start + .35, l.start + l.dur * .6);
if (!sc.lines.length) ts.push((sc.start + sc.end) / 2, sc.end - .3);
const T = [...new Set(ts.map(t => +t.toFixed(2)))];
fs.mkdirSync(`${out}/${id}`, { recursive: true });
execFileSync('node', ['tools/shot.mjs', `episodes/${ep}/film.html`, `${out}/${id}/f.jpg`, T.join(',')], { stdio: 'inherit', env: { ...process.env, SHOT_WIDTH: '960' } });
fs.writeFileSync(`${out}/${id}/times.json`, JSON.stringify({ id, start: sc.start, times: T }));
