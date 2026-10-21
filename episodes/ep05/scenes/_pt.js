// _pt.js: shared timeline for the ep05 scenes (not a scene itself; film.js never loads it by id).
// A scene = an ordered list of segments, each starting at (line index, fraction of that line) read from S.L(i), so nothing
// depends on hard-coded seconds. Segment kinds:
//   st(id, at, move?, o?)  a painted still (art/ep05/<id>.png) with a slow camera move (z >= 1.06 always)
//   ac(at, fn, o?)         a 3D-actor beat on a plate: fn(lt, u, t, S) draws it and may return finish() options
// Segments hand over with a soft cross-fade. A still whose PNG is missing never crashes: a painted-looking stand-in
// (the scene's plate, tinted, or a dusk gradient) is drawn with the same camera move until the real frame exists.
import * as K from '../../../engine/core.js';
import { plate, drawPlate } from '../../../engine/plates.js';
import { cam } from '../lib/kit.js';
import { still, loadStill, robedPlace } from '../lib/stage.js';
import { faceFX } from '../../../engine/actors.js';
import { autoBlink } from '../../../engine/characters.js';
const { c, W, H, lerp, clamp, ease, hash, glow, dust } = K;

// camera moves for stills: [x0, y0, zoom0, x1, y1, zoom1] (fractions of the painting, zoom >= 1.06)
export const MOVES = {
  push: [.5, .53, 1.07, .5, .47, 1.2], pushL: [.58, .52, 1.08, .45, .49, 1.24], pushR: [.42, .52, 1.08, .56, .49, 1.24],
  panR: [.43, .5, 1.18, .57, .5, 1.18], panL: [.57, .5, 1.18, .43, .5, 1.18], rise: [.5, .59, 1.16, .5, .43, 1.16],
  sink: [.5, .42, 1.16, .5, .58, 1.16], pull: [.5, .47, 1.26, .5, .5, 1.07], pullL: [.55, .48, 1.24, .46, .5, 1.07],
  pullR: [.45, .48, 1.24, .54, .5, 1.07], face: [.5, .56, 1.1, .5, .44, 1.3], faceL: [.56, .54, 1.12, .46, .46, 1.3],
};
const AUTO = ['push', 'panR', 'pull', 'pushL', 'panL', 'rise', 'pushR', 'sink'];
// second/third framings for long holds: contrast with the first move (closer detail, opposite side)
const ALT = {
  push: ['faceL', 'panL', 'pullR'], pushL: ['pushR', 'face', 'panR'], pushR: ['pushL', 'faceL', 'panL'], panR: ['face', 'pullL', 'sink'],
  panL: ['faceL', 'pullR', 'rise'], rise: ['pushR', 'faceL', 'panL'], sink: ['pushL', 'face', 'panR'], pull: ['faceL', 'panR', 'pushL'],
  pullL: ['pushR', 'face', 'panR'], pullR: ['pushL', 'faceL', 'panL'], face: ['pullR', 'panL', 'pushL'], faceL: ['pullL', 'panR', 'pushR'],
};

export const st = (id, at, move, o = {}, fx) => ({ kind: 'still', id, at, move, o, fx });
export const ac = (at, fn, o = {}) => ({ kind: 'act', at, fn, ...o });

// ---------------------------------------------------------------- lights for place()
export const LT = {
  day: { key: 0xfff0d8, keyI: 2.1, dir: [2, 3, 2.5], sky: 0xcfd8ff, ground: 0x9a7a58, fillI: 1.6, rim: 0xffe0a0, rimI: .8, rimDir: [-2, 2, -3] },
  dayL: { key: 0xfff0d8, keyI: 2.1, dir: [-2, 3, 2.5], sky: 0xcfd8ff, ground: 0x9a7a58, fillI: 1.6, rim: 0xffe0a0, rimI: .8, rimDir: [2, 2, -3] },
  room: { key: 0xffe4b8, keyI: 1.9, dir: [2.2, 2.4, 2], sky: 0xb8b8e8, ground: 0x8a5a3a, fillI: 1.5, rim: 0xffc070, rimI: .9, rimDir: [-2, 2, -3] },
  alley: { key: 0xffe8c0, keyI: 1.8, dir: [-2.5, 2.5, 2], sky: 0x9aa8e0, ground: 0x7a6050, fillI: 1.5, rim: 0xffd8a0, rimI: .9, rimDir: [2, 2, -3] },
  night: { key: 0x8898e0, keyI: 1.0, dir: [1, 3, 1.5], sky: 0x303a80, ground: 0x2a2030, fillI: 1.1, rim: 0xffc890, rimI: .5, rimDir: [-1, 2, -3] },
  lantern: { key: 0xffb060, keyI: 2.3, dir: [0, .8, 2.6], sky: 0x384488, ground: 0x4a3030, fillI: 1.0, rim: 0xffc070, rimI: 1.0, rimDir: [0, 2, -3] },
};

// ---------------------------------------------------------------- small shared helpers for the 3D beats
/** place an actor and drive its face: o = place() options + { open (mouth 0..1), seed, blink, lid, sad, robed } */
export function fig(a, X, Y, h, t, o = {}) {
  const r = robedPlace(a, X, Y, h, { elev: .5, ...o });
  faceFX(r.face, { blink: o.blink ?? autoBlink(t, o.seed ?? 1), open: o.open ?? 0, lid: o.lid ?? 0, sad: o.sad ?? 0 });
  return r;
}
/** waving hand (right arm raised, forearm oscillating) */
export function wave(B, k, t, s = 'R', seed = 0) {
  const sg = s === 'L' ? 1 : -1, w = Math.sin(t * 7 + seed);
  B['upperArm' + s].rotation.x += -2.1 * k; B['upperArm' + s].rotation.z += sg * (.15 + .1 * w) * k; B['foreArm' + s].rotation.x += (-.35 + .3 * w) * k;
}
/** redraw the plate inside a polygon over actors (a railing in front of them) */
export function railing(img, pts) { c.save(); c.beginPath(); c.moveTo(...pts[0]); for (const p of pts.slice(1)) c.lineTo(...p); c.closePath(); c.clip(); drawPlate(img); c.restore(); }
/** a wrapped cloth bundle carried between the hands */
export function bundle(x, y, s = 1, col = '#f4ecdc') {
  c.save(); c.translate(x, y); c.scale(s, s);
  const p = new Path2D(); p.moveTo(-26, 2); p.quadraticCurveTo(-30, -26, 0, -30); p.quadraticCurveTo(30, -26, 26, 2); p.quadraticCurveTo(0, 14, -26, 2); p.closePath();
  c.fillStyle = col; c.fill(p); K.ink(p, 2, 3100);
  c.strokeStyle = 'rgba(160,60,60,.7)'; c.lineWidth = 3; c.beginPath(); c.moveTo(-22, -10); c.quadraticCurveTo(0, -2, 22, -10); c.stroke();
  c.fillStyle = 'rgba(70,50,110,.18)'; c.beginPath(); c.ellipse(12, -2, 14, 10, .3, 0, 7); c.fill();
  c.restore();
}
/** amber prayer beads hanging from a hand */
export function beads(x, y, s = 1, t = 0) {
  c.save(); c.translate(x, y); c.scale(s, s);
  const sw = Math.sin(t * 1.3) * 3;
  for (let i = 0; i < 12; i++) {
    const k = i / 11, bx = Math.sin(k * 3.1) * 11 + sw * k, by = k * 46;
    c.fillStyle = '#c8741c'; c.beginPath(); c.arc(bx, by, 4.2, 0, 7); c.fill(); c.strokeStyle = '#3a1a08'; c.lineWidth = 1.2; c.stroke();
    c.fillStyle = 'rgba(255,230,160,.7)'; c.beginPath(); c.arc(bx - 1.2, by - 1.4, 1.2, 0, 7); c.fill();
  }
  c.restore();
}
/** tin lantern with coloured panes in hand (hx, hy = hand); lit glow + wall spots handled by lanternLight() */
export function tinLantern(x, y, s = 1, t = 0) {
  c.save(); c.translate(x, y); c.scale(s, s);
  glow(0, 30, 95, '#ffb050', .5, 'screen');
  const body = new Path2D(); body.moveTo(-16, 0); body.lineTo(-20, 52); body.lineTo(20, 52); body.lineTo(16, 0); body.closePath();
  c.fillStyle = '#6a5a48'; c.fill(body);
  const fl = .8 + .2 * Math.sin(t * 9) * Math.sin(t * 5.3);
  c.fillStyle = `rgba(255,214,120,${.75 * fl})`; c.fill(body);
  for (const [i, col] of [[0, '#e04030'], [1, '#30b050'], [2, '#3070e0']]) { c.fillStyle = col; c.globalAlpha = .75; c.fillRect(-12 + i * 9, 14, 7, 22); }
  c.globalAlpha = 1; K.ink(body, 2, 3200);
  c.strokeStyle = '#2a2018'; c.lineWidth = 3; c.beginPath(); c.moveTo(-16, 0); c.quadraticCurveTo(0, -26, 16, 0); c.stroke();
  c.restore();
}
/** warm lantern light on the street and coloured spots of glass projected on the walls */
export function lanternLight(x, y, t, r = 520) {
  const fl = .85 + .15 * Math.sin(t * 8.1) * Math.sin(t * 4.3);
  glow(x, y, r * fl, '#ffa850', .4 * fl, 'screen'); glow(x, y, r * .14, '#fff0c0', .6, 'lighter');
  [['#ff4a3a', 0], ['#3ad06a', 2.1], ['#4a80ff', 4.2]].forEach(([col, ph], i) => {
    const a = t * .7 + ph, sx = x + Math.cos(a) * r * .78, sy = y - 20 + Math.sin(a * 1.3) * r * .3;
    glow(sx, sy, 46, col, .5, 'screen'); glow(sx, sy, 16, col, .55, 'lighter');
  });
}

// ---------------------------------------------------------------- stand-in for a still that does not exist yet
const TINTS = ['rgba(120,70,150,.28)', 'rgba(210,140,70,.22)', 'rgba(60,90,150,.28)', 'rgba(170,80,90,.22)'];
function standIn(id, u, mv, back, tint, t) {
  const m = MOVES[mv], e = ease(u);
  if (back) {
    c.save(); cam(lerp(m[0], m[3], e) * W, lerp(m[1], m[4], e) * H, lerp(m[2], m[5], e)); drawPlate(back); c.restore();
  } else {
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, tint[0]); g.addColorStop(1, tint[1]); c.fillStyle = g; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 6; i++) glow(hash(id.length * 7 + i, 3) * W + Math.sin(t * .1 + i) * 80, 200 + hash(i, 5) * 600, 340, i % 2 ? '#5a3a7a' : '#8a5a3a', .22, 'screen');
  }
  c.fillStyle = TINTS[(id.charCodeAt(0) + id.charCodeAt(id.length - 1)) % TINTS.length]; c.fillRect(0, 0, W, H);
  glow(W * (.35 + .3 * hash(id.length + id.charCodeAt(2), 9)), H * .5, 380, '#ffd9a0', .18, 'screen');
  dust(t, 24, 300, 200, 1300, 700, '#fff2d0', .35, 4);
}

const mix = (a, b, k) => (typeof a === 'number' && typeof b === 'number') ? lerp(a, b, k) : (k < .5 ? a : b);

/**
 * build a scene module.
 *  segs: [st(...), ac(...), ...] in time order (first one always starts at 0)
 *  plate: plate name used for the stand-in of missing stills; tint: [top, bottom] gradient if no plate
 *  fx: default finish() options for stills (acts default to paper .28)
 */
export function make({ preload, segs, plate: bp, tint = ['#241a38', '#6a4838'], fx = {}, fadeIn, fadeOut }) {
  const have = {}; let back = null, cache = null;
  segs.forEach((s, i) => { if (s.kind === 'still' && !s.move) s.move = AUTO[(i + s.id.charCodeAt(1) + s.id.charCodeAt(2)) % AUTO.length]; });
  const timeline = (S) => {
    if (cache && cache.S === S) return cache;
    let prev = -1;
    const starts = segs.map((s, i) => {
      let a = 0;
      if (i > 0) { const [l0, l1] = S.L(s.at[0]); a = l0 + s.at[1] * (l1 - l0); }
      a = Math.max(a, prev + .05); prev = a; return a;
    });
    const ends = starts.map((a, i) => (i + 1 < starts.length ? starts[i + 1] : S.dur));
    const list = [], st2 = [], en2 = [];
    segs.forEach((s, i) => {
      // v2: one painting = one continuous move for its whole beat (re-framing the same image read as a self-dissolve)
      const d = ends[i] - starts[i], n = 1;
      for (let j = 0; j < n; j++) {
        const alt = ALT[s.move] || ALT.push;
        list.push(j ? { ...s, move: alt[(j - 1 + s.id.charCodeAt(2)) % alt.length] } : s);
        st2.push(starts[i] + d * j / n); en2.push(starts[i] + d * (j + 1) / n);
      }
    });
    return cache = { S, list, starts: st2, ends: en2 };
  };
  const mod = {
    async preload() {
      if (preload) await preload();
      if (bp) { try { back = await plate(bp); } catch { back = null; } }
      await Promise.all(segs.filter(s => s.kind === 'still').map(async s => { have[s.id] = !!(await loadStill(s.id)); }));
    },
    draw(t, S) {
      const { list, starts, ends } = timeline(S);
      let i = 0; for (let k = list.length - 1; k >= 0; k--) if (t >= starts[k]) { i = k; break; }
      const drawSeg = (k, a) => {
        const s = list[k], lt = t - starts[k], d = Math.max(.01, ends[k] - starts[k]), u = clamp(lt / d);
        c.save(); if (a < 1) c.globalAlpha *= a;
        let f = null;
        if (s.kind === 'still') {
          if (have[s.id]) still(s.id, u, MOVES[s.move], s.o); else standIn(s.id, u, s.move, back, tint, t);
        } else f = s.fn(Math.max(0, lt), u, t, S);
        c.restore();
        return { vignette: .5, paper: s.kind === 'still' ? .2 : .28, ...(s.kind === 'still' ? fx : {}), ...(s.fx || {}), ...(f || {}) };
      };
      // v2: hard cuts between segments; a segment asks for a dissolve with dissolve: true
      const xf = i > 0 && list[i].dissolve ? Math.min(.9, (ends[i] - starts[i]) * .45, (ends[i - 1] - starts[i - 1]) * .45 + .3) : 0;
      const a = xf > 0 ? clamp((t - starts[i]) / xf) : 1;
      if (a < 1) {
        const f0 = drawSeg(i - 1, 1), f1 = drawSeg(i, ease(a));
        const out = {}; for (const k of new Set([...Object.keys(f0), ...Object.keys(f1)])) out[k] = mix(f0[k] ?? (typeof f1[k] === 'number' ? 0 : undefined), f1[k] ?? (typeof f0[k] === 'number' ? 0 : undefined), a);
        return out;
      }
      return drawSeg(i, 1);
    },
  };
  if (fadeIn !== undefined) mod.fadeIn = fadeIn;
  if (fadeOut !== undefined) mod.fadeOut = fadeOut;
  return mod;
}
