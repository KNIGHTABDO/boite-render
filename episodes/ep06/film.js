// Episode runtime: loads timing + lipsync, dispatches to scene modules, adds subtitles and finish.
import * as K from '../../engine/core.js';
import * as C from '../../engine/characters.js';

const base = new URL('.', import.meta.url);
const timing = await (await fetch(new URL('timing.json', base))).json();
const lipsync = await (await fetch(new URL('lipsync.json', base))).json();
export const DURATION = timing[timing.length - 1].end;

const mods = {}, ver = {};
/** lazily import a scene module and run its async preload (actors, textures) once */
async function load(id) {
  if (id in mods) return mods[id];
  try { const m = (await import(new URL(`scenes/${id}.js` + (ver[id] ? '?v=' + ver[id] : ''), base))).default; if (m.preload) await m.preload(); mods[id] = m; }
  catch (e) { if (!/Failed to fetch|404/.test(String(e))) console.error(id, e); mods[id] = null; }
  return mods[id];
}

// ---------------------------------------------------------------- subtitle chunks
function chunks(text) {
  const clean = text.replace(/<[^>]+>/g, '|').replace(/\s+/g, ' ');
  const parts = clean.split(/(?<=[.!?…:;])\s+|\s*\|\s*/).map(s => s.trim()).filter(s => s.length > 1);
  // merge tiny pieces so a subtitle is never a single word flash
  const out = [];
  for (const p of parts) { if (out.length && (out[out.length - 1].length < 28 || p.length < 12) && (out[out.length - 1] + ' ' + p).length < 95) out[out.length - 1] += ' ' + p; else out.push(p); }
  return out;
}
for (const sc of timing) for (const ln of sc.lines) {
  const cs = chunks(ln.text), total = cs.reduce((a, s) => a + s.length, 0);
  let t = ln.start; ln.subs = cs.map(s => { const d = ln.dur * s.length / total; const r = { text: s, a: t, b: t + d }; t += d; return r; });
  ln.env = (ln.wav && lipsync[ln.wav.split(/[\\/]/).pop().replace('.wav', '')]) || [];   // wav null = fake timing (tools/fake_timing.py)
}

// ---------------------------------------------------------------- scene helper object
function helper(sc) {
  const lines = sc.lines.map(l => ({ ...l, t0: l.start - sc.start, t1: l.start - sc.start + l.dur }));
  return {
    K, C, dur: sc.end - sc.start, lines,
    /** mouth openness for `who` at local time t (0 when not speaking) */
    mouth(who, t) {
      for (const l of lines) if (l.who === who && t >= l.t0 && t < l.t1) { const f = Math.floor((t - l.t0) * 24); return l.env[f] ?? 0; }
      return 0;
    },
    speaking(who, t) { return lines.some(l => l.who === who && t >= l.t0 - .1 && t < l.t1 + .1); },
    /** start/end of the i-th line (local) */
    L(i) { const l = lines[i]; return l ? [l.t0, l.t1] : [0, 0]; },
  };
}
const helpers = Object.fromEntries(timing.map(sc => [sc.id, helper(sc)]));

// ---------------------------------------------------------------- draw a frame
export async function drawFrame(ctx, t, opts = {}) {
  K.setCtx(ctx); K.setTime(t);
  const cw = ctx.canvas.width; ctx.setTransform(cw / K.W, 0, 0, cw / K.W, 0, 0);
  const i = Math.max(0, timing.findIndex(s => t >= s.start && t < s.end)), sc = timing[i] || timing[timing.length - 1];
  const lt = t - sc.start, mod = await load(sc.id), S = helpers[sc.id];
  ctx.save();
  let fin = {};
  if (mod) fin = mod.draw(lt, S) || {};
  else { ctx.fillStyle = '#1a1422'; ctx.fillRect(0, 0, K.W, K.H); ctx.fillStyle = '#e8d9b8'; ctx.font = '60px Georgia'; ctx.textAlign = 'center'; ctx.fillText(sc.id, K.W / 2, K.H / 2); }
  ctx.restore();
  // transitions (v2): hard cut at scene edges; a scene opts into a dip to black with fadeIn/fadeOut (time jumps only, <=2 per episode)
  const edgeIn = mod?.fadeIn ? K.clamp(lt / mod.fadeIn) : 1, edgeOut = mod?.fadeOut ? K.clamp((sc.end - t) / mod.fadeOut) : 1;
  fin.fade = Math.max(fin.fade || 0, 1 - Math.min(edgeIn, edgeOut));
  K.finish(fin);
  if (fin.letterbox !== false) K.letterbox(fin.letterbox ?? 1);
  // subtitles
  if (opts.subs !== false && !mod?.noSubs) for (const l of sc.lines) {
    // one chunk per line at a time: the latest one that has started (the previous one hands over instantly)
    let cur = null; for (const s of l.subs) if (t >= s.a - .05) cur = s;
    if (!cur) continue;
    const last = cur === l.subs[l.subs.length - 1], end = last ? cur.b + .35 : cur.b + 1e9;
    if (t < end) K.subtitle(cur.text, l.who, Math.min(1, cur === l.subs[0] ? (t - cur.a + .05) / .15 : 1, last ? (end - t) / .25 : 1));
  }
}
/** bench: re-import one edited scene without reloading the page (its build reuses the memo cache in _3d.js) */
export async function reload(id) { ver[id] = Date.now(); delete mods[id]; return !!(await load(id)); }
export { timing };
