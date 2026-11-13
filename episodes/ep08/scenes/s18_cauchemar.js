// s18 "Le cauchemar" (dream, all paintings, slow). Each painting is a live shot: one slow move for the whole beat plus a
// dream layer drawn over it. b123 p29 monsters: slow push, a red heartbeat pulse at the edges, eye-glints flicker. b124 p30
// hideous crowd: pan with the chase, lateral jitter, a blur ghost trailing. b125 p31 the black horse: push alongside the
// gallop, a gallop bob (3 beats/s), dust kicked across. b126 p32 the mane: slow track, wind streaks. b127 p33 desert hill:
// heat shimmer, warm light, silence (no jitter). b128 p34 the box held out: slow push-in on the box, a soft glow grows.
// b129 p35 treasure: crane over the open box, light blooms then sparkles. b130 p36 "mon trésor": slow push, sparkles. b131
// p37 Zoubida cold: zoom on her eyes while the colours drain to grey-blue. b132 p38 the great cold: frost creeps in from the
// corners, slow pull back, the image darkens to blue. Dissolves between dream images (a dream does not cut).
import * as K from '../../../engine/core.js';
import { still, loadStill } from '../lib/stage.js';
import { MOVES } from './_pt.js';
import { beatScene } from '../lib/beatscene.js';
const { c, W, H, clamp, ease, hash, glow } = K;

const ID = 's18_cauchemar';
const sm = (a, b, x) => { const u = clamp((x - a) / (b - a)); return u * u * (3 - 2 * u); };

// [x0, y0, z0, x1, y1, z1] in painting fractions (z >= 1.06): all slower and longer than the default moves
const MV = {
  monstres: [.5, .52, 1.06, .5, .45, 1.32], foule: [.44, .5, 1.12, .66, .5, 1.14], cheval: [.4, .5, 1.02, .56, .46, 1.2],
  criniere: [.38, .45, 1.18, .62, .5, 1.2], colline: [.5, .62, 1.06, .5, .5, 1.24], offre: [.5, .5, 1.0, .5, .49, 1.06],
  tresor: [.5, .35, 1.1, .5, .55, 1.32], mon: [.5, .5, 1.0, .5, .47, 1.1], augure: [.5, .55, 1.08, .5, .4, 1.55],
  froid: [.5, .48, 1.34, .5, .5, 1.08],
};

const edge = (col, a) => { c.save(); c.fillStyle = K.radial(W / 2, H / 2, H * .3, H * 1.05, 'rgba(0,0,0,0)', col.replace('A', a)); c.fillRect(0, 0, W, H); c.restore(); };
const sparkles = (t, n, a, seed = 1, x0 = 0, y0 = 0, w = W, h = H) => {
  for (let i = 0; i < n; i++) {
    const x = x0 + hash(i, seed) * w, y = y0 + hash(i, seed + 3) * h, f = Math.max(0, Math.sin(t * (1.5 + hash(i, seed + 7) * 2) + i * 2.1)) ** 6;
    if (f > .02) { glow(x, y, 26 * f + 4, '#fff2c0', a * f, 'lighter'); glow(x, y, 6, '#ffffff', a * f, 'lighter'); }
  }
};
/** frost from the corners: crystalline strokes growing inward with k (0..1) */
function frost(k, t) {
  if (k <= 0) return;
  c.save(); c.globalCompositeOperation = 'screen';
  edge('rgba(200,225,255,A)', .75 * k);
  c.strokeStyle = `rgba(235,245,255,${.55 * k})`; c.lineWidth = 2;
  for (let i = 0; i < 70; i++) {
    const cx = hash(i, 11) < .5 ? 0 : W, cy = hash(i, 13) < .5 ? 0 : H, ang = Math.atan2(H / 2 - cy, W / 2 - cx) + (hash(i, 17) - .5) * 1.6;
    const len = (160 + 520 * hash(i, 19)) * k; let x = cx + (hash(i, 23) - .5) * 300 * (cx ? -1 : 1) * -1, y = cy, a = ang;
    c.beginPath(); c.moveTo(x, y);
    for (let s = 0; s < 6; s++) { a += (hash(i * 7 + s, 29) - .5) * .9; x += Math.cos(a) * len / 6; y += Math.sin(a) * len / 6; c.lineTo(x, y);
      if (s % 2) { c.moveTo(x, y); c.lineTo(x + Math.cos(a + 1) * 22 * k, y + Math.sin(a + 1) * 22 * k); c.moveTo(x, y); } }
    c.stroke();
  }
  c.restore();
}

/** a painting shot: one move for its whole beat (u spans the beat), a dream layer on top */
function dream(id, mv, layer = () => ({}), o = {}) {
  return {
    load: () => loadStill(id),
    fn(lt, u, t) {
      c.save();
      const j = o.jitter ? o.jitter(t) : [0, 0]; c.translate(...j);
      still(id, u, MV[mv], { ...(o.filter ? { filter: o.filter } : {}), ...(o.flip ? { flip: true } : {}) });
      c.restore();
      return { vignette: .55, paper: .2, ...layer(lt, u, t) };
    },
  };
}

const shots = {
  monstres: dream('p29_monstres', 'monstres', (lt, u, t) => {
    const hb = Math.max(0, Math.sin(t * 7.2)) ** 8 + .6 * Math.max(0, Math.sin(t * 7.2 - .9)) ** 8;   // lub-dub
    edge('rgba(150,10,10,A)', .25 + .35 * hb);
    for (let i = 0; i < 9; i++) glow(W * (.15 + .7 * hash(i, 41)), H * (.2 + .45 * hash(i, 43)), 34, '#ff5a20', .35 * Math.max(0, Math.sin(t * 2.3 + i * 1.7)) ** 4, 'lighter');
    return { vignette: .75, grade: '#401020' };
  }),
  foule: dream('p30_foule_hideuse', 'foule', (lt, u, t) => { edge('rgba(60,10,40,A)', .4); return { vignette: .7 }; },
    { jitter: t => [5 * Math.sin(t * 13) + 3 * Math.sin(t * 29), 2 * Math.sin(t * 17)] }),
  cheval: dream('p31_cheval_noir', 'cheval', (lt, u, t) => {
    for (let i = 0; i < 14; i++) { const p = (t * .35 + hash(i, 51)) % 1; glow(W * (1.05 - p * 1.2), H * (.82 + .1 * hash(i, 53)), 90 + 60 * hash(i, 57), '#b89a70', .22 * Math.sin(p * Math.PI), 'screen'); }
    return { vignette: .6 };
  }, { jitter: t => [0, 7 * Math.abs(Math.sin(t * 3 * Math.PI))] }),
  criniere: dream('p32_criniere', 'criniere', (lt, u, t) => {
    c.save(); c.strokeStyle = 'rgba(255,255,255,.12)'; c.lineWidth = 2;
    for (let i = 0; i < 26; i++) { const p = (t * .8 + hash(i, 61)) % 1, y = H * hash(i, 63), x = W * (1.1 - p * 1.4); c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x - 120, y - 10 * Math.sin(t * 3 + i), x - 260, y); c.stroke(); }
    c.restore(); return {};
  }, { flip: true }),   // p32 gallops screen-left, p31 gallops screen-right: mirror p32 so the direction matches
  colline: dream('p33_colline', 'colline', (lt, u, t) => { glow(W * .7, H * .2, 700, '#ffd890', .18, 'screen'); return { vignette: .45, grade: '#f0c080' }; },
    { jitter: t => [1.5 * Math.sin(t * 2.1), 1.2 * Math.sin(t * 3.7)] }),
  offre: dream('p34_offre', 'offre', (lt, u, t) => { glow(W / 2, H * .55, 260 + 160 * ease(u), '#ffe0a0', .25 * ease(u), 'screen'); return { vignette: .55 }; }),
  tresor: dream('p35_tresor', 'tresor', (lt, u, t) => {
    const b = sm(.15, .55, u); glow(W / 2, H * .55, 300 + 500 * b, '#fff0c0', .45 * b, 'screen'); glow(W / 2, H * .55, 120, '#ffffff', .3 * b, 'lighter');
    sparkles(t, 40, .8 * b, 3, W * .2, H * .25, W * .6, H * .55);
    return { vignette: .45, white: .12 * b * (1 - sm(.6, 1, u)) };
  }),
  mon: dream('p36_mon_tresor', 'mon', (lt, u, t) => { sparkles(t, 30, .7, 9, W * .25, H * .2, W * .5, H * .6); return { vignette: .5 }; }),
  augure: {
    load: () => loadStill('p37_mauvais_augure'),
    fn(lt, u, t) {
      const d = sm(.1, .85, u);
      still('p37_mauvais_augure', u, MV.augure);
      if (d > 0) { c.save(); c.globalAlpha = d; still('p37_mauvais_augure', u, MV.augure, { filter: 'grayscale(1) brightness(.8) sepia(.15) hue-rotate(170deg)' }); c.restore(); }
      edge('rgba(40,60,110,A)', .45 * d);
      return { vignette: .6 + .2 * d };
    },
  },
  froid: dream('p38_froid', 'froid', (lt, u, t) => { frost(sm(.05, .9, u), t); return { vignette: .7, grade: '#5070b0', fade: .35 * sm(.75, 1, u) }; }),
};

export default beatScene(ID, {
  shots,
  pre: 'black',   // the pre-roll is black, the first painting dissolves in (no restart of its move)
  plan: {
    b123: { shot: 'monstres', dissolve: true },
    b124: { shot: 'foule', dissolve: true, at: -.1 },   // start the p29>p30 dissolve ~.8 s early so it has landed when the line starts,
    b125: { shot: 'cheval', dissolve: true },
    b126: { shot: 'criniere', dissolve: true },
    b127: { shot: 'colline', dissolve: true },
    b128: { shot: 'offre', dissolve: true },
    b129: { shot: 'tresor', dissolve: true },
    b130: { shot: 'mon', dissolve: true },
    b131: { shot: 'augure', dissolve: true },
    b132: { shot: 'froid', dissolve: true },
  },
});
