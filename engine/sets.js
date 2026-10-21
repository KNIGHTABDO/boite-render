// Shared Fès sets. Each takes the time and a tone, so a set can be lit for dawn, day, dusk or night.
import { c, P, paint, ink, INK, W, H, lerp, hash, shade, light, rgba, mix, grad, radial, glow, horseshoe } from './core.js';

export const TONES = {
  shade: { sky: ['#8fb0d8', '#e8e2d4'], wall: '#cdb89a', ground: '#7a6450', light: '#ffe2a8', amb: 'rgba(70,80,140,.12)' },
  day:   { sky: ['#6aa8d8', '#cfe3ee'], wall: '#e7d9bd', ground: '#9c8266', light: '#fff1c8', amb: 'rgba(255,230,180,.04)' },
  dawn:  { sky: ['#6c7cb6', '#f6c27a'], wall: '#d9c3b0', ground: '#7e6a5e', light: '#ffd9a0', amb: 'rgba(120,110,170,.14)' },
  dusk:  { sky: ['#4a3a6a', '#f0a06a'], wall: '#c99a7e', ground: '#6a4e46', light: '#ffb070', amb: 'rgba(120,60,90,.22)' },
  night: { sky: ['#0a1030', '#1e2a58'], wall: '#3a3f5e', ground: '#1e2034', light: '#f4b95a', amb: 'rgba(20,30,80,.35)' },
};
/** blend two tones */
export function tone(a, b, k) {
  const A = TONES[a], B = TONES[b], out = {};
  for (const key of Object.keys(A)) out[key] = Array.isArray(A[key]) ? A[key].map((v, i) => mix(v, B[key][i], k)) : A[key].startsWith('rgba') ? (k < .5 ? A[key] : B[key]) : mix(A[key], B[key], k);
  return out;
}

/** plaster wall texture: stains, damp, brick patches, cracks. Call inside a clip. */
export function plaster(x, y, w, h, col, seed = 1, grime = 1) {
  c.fillStyle = col; c.fillRect(x, y, w, h);
  for (let i = 0; i < 30 * grime; i++) { const px = x + hash(i, seed) * w, py = y + hash(i, seed + 1) * h, r = 30 + hash(i, seed + 2) * 140; c.fillStyle = radial(px, py, 0, r, rgba(shade(col, .25), .2), rgba(shade(col, .25), 0)); c.fillRect(px - r, py - r, r * 2, r * 2); }
  c.fillStyle = grad(0, y + h * .75, 0, y + h, [rgba(shade(col, .4), 0), rgba(shade(col, .45), .4)]); c.fillRect(x, y + h * .7, w, h * .3);
  for (let i = 0; i < Math.round(4 * grime); i++) {
    const px = x + hash(i, seed + 5) * (w - 120), py = y + hash(i, seed + 6) * (h - 100), rx = 50 + hash(i, seed) * 30, ry = 26 + hash(i, seed + 7) * 16, rot = hash(i, 3) - .5;
    c.save(); c.beginPath(); c.ellipse(px + 50, py + 40, rx, ry, rot, 0, 7); c.clip();
    c.fillStyle = mix(col, '#a0583a', .55); c.fillRect(px - 40, py - 30, 200, 140);
    c.strokeStyle = rgba('#5a2a1a', .45); c.lineWidth = 1.5; for (let r = 0; r < 8; r++) for (let k = 0; k < 8; k++) c.strokeRect(px - 20 + k * 26 + (r % 2) * 13, py - 20 + r * 14, 26, 14);
    c.restore(); c.strokeStyle = rgba(INK, .45); c.lineWidth = 1.6; c.beginPath(); c.ellipse(px + 50, py + 40, rx, ry, rot, 0, 7); c.stroke();
  }
  c.strokeStyle = rgba(INK, .32); c.lineWidth = 1.3;
  for (let i = 0; i < Math.round(6 * grime); i++) { let px = x + hash(i, seed + 9) * w, py = y + hash(i, seed + 10) * h; c.beginPath(); c.moveTo(px, py); for (let k = 0; k < 6; k++) { px += (hash(i * 7 + k, seed) - .5) * 30; py += 10 + hash(k, i) * 18; c.lineTo(px, py); } c.stroke(); }
}

/** medina door: horseshoe frame, studded planks, knocker. (x = centre, y = ground) */
export function door(x, y, w, h, col = '#5a3a22', open = 0, seed = 1, dim = 0) {
  const archR = w * .5;
  paint(P(q => horseshoe(q, x, y - h + archR, archR + 22, y, .28)), shade('#d8c8a8', dim), { lw: 2.6, id: seed });
  const hole = P(q => horseshoe(q, x, y - h + archR, archR, y, .28));
  c.fillStyle = shade('#1a1018', dim * .5); c.fill(hole);
  if (open < 1) {
    c.save(); c.clip(hole); c.translate(x - w / 2, 0); c.scale(1 - open * .85, 1); c.translate(-(x - w / 2), 0);
    paint(P(q => q.rect(x - w / 2, y - h - 10, w, h + 10)), shade(col, dim), { lw: 2.4, id: seed + 1, shadow: P(q => q.rect(x, y - h, w, h)), shadowCol: 'rgba(30,10,30,.2)' });
    c.strokeStyle = rgba(shade(col, .4 + dim), .6); c.lineWidth = 2; for (let k = 1; k < 5; k++) { c.beginPath(); c.moveTo(x - w / 2 + k * w / 5, y - h); c.lineTo(x - w / 2 + k * w / 5, y); c.stroke(); }
    c.fillStyle = shade('#2a2220', dim); for (let r = 0; r < 7; r++) for (let k = 0; k < 4; k++) { c.beginPath(); c.arc(x - w / 2 + 16 + k * (w - 32) / 3, y - h + archR * .6 + r * (h - archR) / 7, 4, 0, 7); c.fill(); }
    c.strokeStyle = shade('#2a2220', dim); c.lineWidth = 4; c.beginPath(); c.arc(x + w * .25, y - h * .45, 12, 0, 7); c.stroke();
    c.restore();
  }
  ink(hole, 2.4, seed + 2);
  paint(P(q => q.rect(x - w / 2 - 30, y - 10, w + 60, 18)), shade('#bfb3a0', dim), { lw: 2, id: seed + 3 });
}

/** small barred window, optionally lit from inside */
export function grille(x, y, w, h, dim = 0, lit = 0) {
  paint(P(q => q.rect(x - w / 2 - 10, y - 10, w + 20, h + 20)), shade('#d8c8a8', dim), { lw: 2.2, id: 900 + Math.round(x) });
  c.fillStyle = lit ? mix('#20141a', '#f4b95a', lit) : '#20141a'; c.fillRect(x - w / 2, y, w, h);
  if (lit) glow(x, y + h / 2, w * 1.4, '#f4b95a', .35 * lit);
  c.strokeStyle = shade('#2a2220', dim); c.lineWidth = 4; for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(x - w / 2 + k * w / 4, y); c.lineTo(x - w / 2 + k * w / 4, y + h); c.stroke(); } for (let k = 1; k < 3; k++) { c.beginPath(); c.moveTo(x - w / 2, y + k * h / 3); c.lineTo(x + w / 2, y + k * h / 3); c.stroke(); }
}

/**
 * The impasse (dead-end alley): frontal view, walls converge to a far covered passage
 * that opens onto a bright street. opt.far(): draws life inside the passage opening.
 */
export function impasse(t, tn, opt = {}) {
  const farL = 700, farR = 1220, farT = 170, farB = 760;
  c.fillStyle = grad(0, -300, 0, 300, [tn.sky[0], tn.sky[1]]); c.fillRect(-500, -600, W + 1000, 900);
  // the bright street beyond the passage
  const pass = P(q => horseshoe(q, 960, 470, 150, farB, .3));
  c.save(); c.clip(pass);
  c.fillStyle = light(tn.wall, .45); c.fillRect(700, 250, 520, 520);
  plaster(760, 300, 420, 470, light(tn.wall, .4), 41, .3);
  c.fillStyle = light(tn.ground, .45); c.fillRect(700, farB - 40, 520, 60);
  if (opt.far) opt.far();
  c.fillStyle = rgba(tn.light, .3); c.fillRect(700, 250, 520, 520);
  c.restore();
  // far wall around the passage
  c.save(); c.clip(P(q => { q.rect(farL, farT - 400, farR - farL, farB - farT + 400); horseshoe(q, 960, 470, 150, farB, .3); }), 'evenodd');
  plaster(farL, farT - 400, farR - farL, farB - farT + 400, shade(tn.wall, .14), 7, .8);
  c.restore();
  ink(pass, 2.6, 3);
  // side walls
  const L = P(q => { q.moveTo(-500, -900); q.lineTo(farL, farT - 400); q.lineTo(farL, farB); q.lineTo(-500, H + 500); q.closePath(); });
  const R = P(q => { q.moveTo(W + 500, -900); q.lineTo(farR, farT - 400); q.lineTo(farR, farB); q.lineTo(W + 500, H + 500); q.closePath(); });
  for (const [path, seed, dk] of [[L, 11, .04], [R, 23, .2]]) { c.save(); c.clip(path); plaster(-500, -900, W + 1000, H + 1400, shade(tn.wall, dk), seed, 1.4); c.restore(); }
  // doors and a window on the side walls, sheared into perspective
  c.save(); c.clip(R); c.setTransform(c.getTransform().multiply(new DOMMatrix([.55, -.33, 0, 1, 0, 0]))); door(2700, 1810, 200, 400, '#4a3a5a', 0, 51, .15); grille(2300, 1150, 90, 110, .15, opt.lamp || 0); c.restore();
  c.save(); c.clip(L); c.setTransform(c.getTransform().multiply(new DOMMatrix([.5, .36, 0, 1, 0, 0]))); door(240, 870, 190, 380, '#5a3a22', 0, 61, .05); c.restore();
  ink(L, 2.6, 11); ink(R, 2.6, 23);
  // a warm sunlit band high on the left wall: the sun never reaches the ground here
  if (opt.sunBand) { c.save(); c.clip(L); c.globalCompositeOperation = 'screen'; c.fillStyle = rgba(tn.light, .45 * opt.sunBand); c.beginPath(); c.moveTo(-500, -900); c.lineTo(farL, farT - 400); c.lineTo(farL, farT - 250); c.lineTo(-500, -380); c.closePath(); c.fill(); c.restore(); }
  // ground: damp beaten earth, pebbles, puddles that mirror the sky
  const G = P(q => { q.moveTo(-500, H + 500); q.lineTo(farL, farB); q.lineTo(farR, farB); q.lineTo(W + 500, H + 500); q.closePath(); });
  c.save(); c.clip(G); c.fillStyle = grad(0, farB, 0, H, [shade(tn.ground, .15), tn.ground]); c.fillRect(-500, farB, W + 1000, 900);
  for (let i = 0; i < 120; i++) { const k = hash(i, 5), px = lerp(farL, -400, k) + hash(i, 6) * lerp(farR - farL, W + 800, k), py = lerp(farB, H + 150, k * k); c.fillStyle = rgba(shade(tn.ground, .45), .5); c.beginPath(); c.ellipse(px, py, 3 + k * 9, 1.5 + k * 3.5, 0, 0, 7); c.fill(); }
  for (const [px, py, rx] of [[560, 960, 130], [1300, 850, 80], [1120, 1030, 170]]) {
    c.fillStyle = grad(0, py - rx * .16, 0, py + rx * .16, [rgba(tn.sky[1], .6), rgba(tn.sky[0], .4)]); c.beginPath(); c.ellipse(px, py, rx, rx * .16, 0, 0, 7); c.fill();
    c.strokeStyle = rgba('#fff', .2); c.lineWidth = 1.5; c.beginPath(); c.ellipse(px, py, rx * (.55 + .1 * Math.sin(t * .8 + px)), rx * .07, 0, 0, 7); c.stroke();
  }
  c.restore(); ink(G, 2.2, 31);
  c.fillStyle = tn.amb; c.fillRect(-500, -900, W + 1000, H + 1400);
}
