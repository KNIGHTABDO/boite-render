// Shared kit for episode 2: camera clamp, lights, plate occlusion, an animated 2D cat, and the chapter's props
// (paper rounds, tea glasses, herbs, knotted handkerchief, coins, sfenj, couffin, fava beans, radish, glass cabochon).
import * as K from '../../../engine/core.js';
import { drawPlate } from '../../../engine/plates.js';
const { c, P, paint, ink, line, INK, clamp, lerp, ease, noise, hash, rgba, glow, radial, mix } = K;

// ---------------------------------------------------------------- camera
export const clampCam = (x, y, z) => { z = Math.max(z, 1.06); return { x: clamp(x, 960 / z + 2, 1920 - 960 / z - 2), y: clamp(y, 540 / z + 2, 1080 - 540 / z - 2), z }; };
export const cam = (x, y, z, rot = 0, drift = 1) => K.camera({ ...clampCam(x, y, z), rot }, drift);
/** shot timeline: shots = [[t0, fn], ...] ; returns fn for time t with local u (0..1 across the shot) */
export function shots(t, list, end) {
  for (let i = list.length - 1; i >= 0; i--) if (t >= list[i][0]) { const t0 = list[i][0], t1 = i + 1 < list.length ? list[i + 1][0] : end; return list[i][1](t - t0, clamp((t - t0) / (t1 - t0)), t1 - t0); }
  return list[0][1](0, 0, 1);
}
/** redraw the plate inside a polygon (world coords) over actors: a table edge, a door jamb, a parapet */
export function occlude(img, pts) { c.save(); c.beginPath(); c.moveTo(...pts[0]); for (const p of pts.slice(1)) c.lineTo(...p); c.closePath(); c.clip(); drawPlate(img); c.restore(); }
/** camera shake offset that decays after t0 */
export function shake(t, t0, amp = 10, decay = 4, f = 30) { const k = t > t0 ? Math.exp(-(t - t0) * decay) * amp : 0; c.translate(noise(t * f, 1) * k, noise(t * f, 2) * k); }

// ---------------------------------------------------------------- lights (three.js colours for place())
export const L = {
  day: { key: 0xfff0d8, keyI: 2.1, dir: [-2, 3, 2.5], sky: 0xcfd8ff, ground: 0x9a7a58, fillI: 1.6 },
  dayR: { key: 0xfff0d8, keyI: 2.1, dir: [2, 3, 2.5], sky: 0xcfd8ff, ground: 0x9a7a58, fillI: 1.6 },
  warmRoom: { key: 0xffd9a0, keyI: 2.0, dir: [-2.2, 2.4, 2], sky: 0xb8b8e8, ground: 0x8a5a3a, fillI: 1.5, rim: 0xffc070, rimI: .9, rimDir: [2, 2, -3] },
  sun: { key: 0xfff0c8, keyI: 2.5, dir: [-1.5, 4, 1.5], sky: 0xa8c8ff, ground: 0xc09060, fillI: 1.7, rim: 0xffe0a0, rimI: 1.2, rimDir: [1.5, 2, -3] },
  shade: { key: 0xe0e8ff, keyI: 1.3, dir: [-1, 3, 2], sky: 0xa8b8e8, ground: 0x8a7060, fillI: 1.9 },
  candle: { key: 0xffa850, keyI: 2.3, dir: [1.5, 1.2, 2], sky: 0x40508e, ground: 0x6a4030, fillI: 1.0, rim: 0xffc070, rimI: 1.3, rimDir: [-2, 1.5, -3] },
  dawn: { key: 0xc8d4ff, keyI: 1.2, dir: [2, 2, 1.5], sky: 0x6878c0, ground: 0x4a4050, fillI: 1.3, rim: 0xffc090, rimI: .7, rimDir: [-2, 2, -3] },
  night: { key: 0x9aa8ff, keyI: .9, dir: [1, 3, 1], sky: 0x303a80, ground: 0x2a2030, fillI: 1.0 },
};

// ---------------------------------------------------------------- the cat
/**
 * Side-view painted cat. o.mode: 'sleep' | 'loaf' | 'sit' | 'walk' | 'run' | 'swipe' | 'stretch'
 * o.dir 1 faces right; o.ph gait phase; o.eyes 0 closed..1 open; o.swipe 0..1 paw strike; o.col / o.patch colours.
 */
export function cat(x, y, s, t, o = {}) {
  const mode = o.mode || 'sit', col = o.col || '#c9884a', dark = o.dark || K.shade(col, .35), patch = o.patch, eyeC = o.eyeCol || '#e8c23a';
  const ph = o.ph ?? t * 1.6, id = o.id ?? 800;
  c.save(); c.translate(x, y); c.scale(s * (o.dir ?? 1), s);
  const breathe = Math.sin(t * 2.2 + id) * 1.2;
  const run = mode === 'run', walk = mode === 'walk' || run;
  const gait = ph * Math.PI * 2, bob = walk ? Math.abs(Math.sin(gait)) * (run ? -9 : -3) : 0;
  c.translate(0, bob);
  const bodyY = mode === 'sleep' ? -16 : mode === 'loaf' ? -20 : mode === 'sit' ? -34 : mode === 'stretch' ? -30 : run ? -40 : -42;
  const len = run ? 58 : mode === 'sleep' ? 44 : 50;
  // tail (a lazy S that swishes; flicks when annoyed)
  const tw = Math.sin(t * (o.annoy ? 5 : 1.3) + id) * (o.annoy ? 18 : 9);
  c.save(); c.lineCap = 'round';
  const tail = P(q => {
    if (mode === 'sleep') { q.moveTo(-len * .8, bodyY + 6); q.quadraticCurveTo(-len * 1.1, bodyY + 18, -len * .2, bodyY + 20); }
    else if (mode === 'sit') { q.moveTo(-26, -8); q.quadraticCurveTo(-52, -4 + tw * .3, -40 + tw, 4); }
    else { q.moveTo(-len * .9, bodyY - 4); q.bezierCurveTo(-len * 1.3, bodyY - 30 + tw, -len * 1.5, bodyY - 60 - tw * .6 + (run ? 30 : 0), -len * 1.35 + tw * .5, bodyY - (run ? 40 : 70)); }
  });
  c.strokeStyle = INK; c.lineWidth = 12; c.stroke(tail); c.strokeStyle = col; c.lineWidth = 8.5; c.stroke(tail); c.restore();
  // legs
  const leg = (lx, a, back) => {
    const sw = walk ? Math.sin(gait + a) * (run ? 26 : 12) : 0, lift = walk ? Math.max(0, Math.cos(gait + a)) * (run ? 12 : 6) : 0;
    const top = bodyY + 8, foot = -lift;
    paint(P(q => { q.moveTo(lx - 7, top); q.quadraticCurveTo(lx + sw * .4 - 8, (top + foot) / 2, lx + sw - 6, foot); q.lineTo(lx + sw + 7, foot); q.quadraticCurveTo(lx + sw * .4 + 7, (top + foot) / 2, lx + 7, top); q.closePath(); }), back ? dark : col, { lw: 1.8, id: id + 1 + a * 3, tex: .35 });
  };
  if (mode === 'walk' || mode === 'run' || mode === 'stretch' || mode === 'swipe') {
    leg(-len * .6, Math.PI, 1); leg(len * .45, 0, 1);
    paint(P(q => q.ellipse(0, bodyY, len, 21 + breathe * .2, run ? -.05 : 0, 0, 7)), col, { lw: 2.2, id, tex: .45, shadow: P(q => q.ellipse(4, bodyY + 12, len, 12, 0, 0, 7)), shadowCol: 'rgba(40,20,60,.25)' });
    if (patch) paint(P(q => q.ellipse(-12, bodyY - 6, 22, 14, .2, 0, 7)), patch, { lw: 0, ink: false, id: id + 9, tex: .3 });
    leg(-len * .6 + 10, 0, 0);
    if (mode !== 'swipe') leg(len * .45 + 8, Math.PI, 0);
  } else if (mode === 'sit') {
    paint(P(q => { q.moveTo(-30, 0); q.quadraticCurveTo(-36, -44, -4, -62); q.quadraticCurveTo(22, -60, 24, -30); q.lineTo(26, 0); q.closePath(); }), col, { lw: 2.2, id, tex: .45, shadow: P(q => q.ellipse(-14, -18, 18, 22, 0, 0, 7)) });
    if (patch) paint(P(q => q.ellipse(-8, -34, 14, 18, 0, 0, 7)), patch, { ink: false, id: id + 9, tex: .3 });
    for (const fx of [6, 18]) paint(P(q => q.ellipse(fx, -2, 7, 5, 0, 0, 7)), col, { lw: 1.6, id: id + fx, tex: .3 });
  } else {  // sleep / loaf: a round bun
    paint(P(q => q.ellipse(0, bodyY, len, mode === 'sleep' ? 17 + breathe * .4 : 22 + breathe * .3, 0, 0, 7)), col, { lw: 2.2, id, tex: .45, shadow: P(q => q.ellipse(4, bodyY + 8, len, 9, 0, 0, 7)) });
    if (patch) paint(P(q => q.ellipse(-10, bodyY - 4, 20, 10, 0, 0, 7)), patch, { ink: false, id: id + 9, tex: .3 });
  }
  // head
  const hx = mode === 'sit' ? 8 : mode === 'sleep' ? len * .75 : len * .9 + (run ? 10 : 0), hy = mode === 'sit' ? -70 : mode === 'sleep' ? bodyY + 2 : bodyY - 18 + (run ? 10 : 0);
  const hr = 17, look = o.look ?? 0;
  c.save(); c.translate(hx, hy); c.rotate(mode === 'sleep' ? .35 : noise(t * .5, id) * .08 + look);
  for (const e of [-1, 1]) paint(P(q => { q.moveTo(e * 5 - 6, -hr + 5); q.lineTo(e * 9 + (o.ears === 'flat' ? e * 10 : 0), -hr - (o.ears === 'flat' ? 2 : 13)); q.lineTo(e * 13 + 5, -hr + 7); q.closePath(); }), e > 0 ? col : dark, { lw: 1.6, id: id + 20 + e, tex: .3 });
  paint(P(q => q.ellipse(0, 0, hr * 1.12, hr, 0, 0, 7)), col, { lw: 2, id: id + 23, tex: .4 });
  c.fillStyle = K.light(col, .45); c.beginPath(); c.ellipse(9, 6, 9, 6, 0, 0, 7); c.fill();
  c.fillStyle = '#d97a8a'; c.beginPath(); c.moveTo(15, 2); c.lineTo(19, 2); c.lineTo(17, 5); c.fill();
  const eo = clamp(o.eyes ?? (mode === 'sleep' ? 0 : 1));
  for (const ex of [2, 12]) {
    if (eo < .15) { c.strokeStyle = INK; c.lineWidth = 1.8; c.beginPath(); c.moveTo(ex - 4, -4); c.quadraticCurveTo(ex, -1, ex + 4, -4); c.stroke(); }
    else {
      c.fillStyle = eyeC; c.beginPath(); c.ellipse(ex, -4, 4.2, 4.6 * eo, 0, 0, 7); c.fill();
      c.fillStyle = '#120a06'; c.beginPath(); c.ellipse(ex + 1, -4, 1.1 + (o.pupil ?? 0) * 2.5, 4 * eo, 0, 0, 7); c.fill();
      if (o.glint !== false) { c.fillStyle = 'rgba(255,255,255,.9)'; c.beginPath(); c.arc(ex + 2, -6, 1, 0, 7); c.fill(); }
    }
  }
  c.strokeStyle = rgba('#f5eee0', .8); c.lineWidth = .8;
  for (const k of [-1, 0, 1]) { c.beginPath(); c.moveTo(14, 6); c.lineTo(34, 5 + k * 5); c.stroke(); }
  if (o.hiss) { c.fillStyle = '#5a1a20'; c.beginPath(); c.ellipse(14, 10, 5, 4 * o.hiss, 0, 0, 7); c.fill(); c.fillStyle = '#fff'; c.fillRect(11, 7, 1.5, 3 * o.hiss); c.fillRect(16, 7, 1.5, 3 * o.hiss); }
  c.restore();
  // the striking paw (swipe): forearm reaches forward, claws out
  if (mode === 'swipe' || o.swipe) {
    const k = clamp(o.swipe ?? 0), ang = lerp(.6, -1.3, k);
    c.save(); c.translate(len * .5, bodyY + 4); c.rotate(ang);
    paint(P(q => { q.moveTo(-7, 0); q.lineTo(-6, 44); q.quadraticCurveTo(0, 52, 8, 44); q.lineTo(7, 0); q.closePath(); }), col, { lw: 1.8, id: id + 30, tex: .3 });
    if (k > .3) { c.strokeStyle = '#f8f2e6'; c.lineWidth = 1.6; for (const cx of [-5, 0, 5]) { c.beginPath(); c.moveTo(cx, 48); c.quadraticCurveTo(cx + 2, 56, cx - 1, 60); c.stroke(); } }
    c.restore();
  }
  c.restore();
}

// ---------------------------------------------------------------- props
/** a round of paper glued with flour paste on the temple (migraine remedy) */
export function paperRound(x, y, r, rot = 0, id = 0) {
  c.save(); c.translate(x, y); c.rotate(rot);
  paint(P(q => q.ellipse(0, 0, r, r * .92, 0, 0, 7)), '#f4ecd8', { lw: 1.4, id: 1300 + id, tex: .5, shadow: P(q => q.ellipse(r * .3, r * .3, r, r * .9, 0, 0, 7)), shadowCol: 'rgba(160,140,100,.35)' });
  c.fillStyle = 'rgba(230,220,190,.8)'; c.beginPath(); c.ellipse(-r * .2, -r * .1, r * .5, r * .35, .4, 0, 7); c.fill();
  c.restore();
}
/** glass of mint tea (with herbs), optional steam */
export function teaGlass(t, x, y, s = 1, herbs = 1, full = .8, steamy = true, id = 0) {
  c.save(); c.translate(x, y); c.scale(s, s);
  const g = P(q => { q.moveTo(-9, -30); q.lineTo(9, -30); q.lineTo(7, 0); q.lineTo(-7, 0); q.closePath(); });
  c.save(); c.clip(g); c.fillStyle = mix('#c8962a', '#6a7a2a', herbs * .5); c.fillRect(-12, -30 + 30 * (1 - full), 24, 32);
  if (herbs) { c.fillStyle = '#3f7a2a'; for (let k = 0; k < 4 * herbs; k++) { c.beginPath(); c.ellipse(-5 + hash(k, id) * 10, -26 + 30 * (1 - full) + hash(k, id + 3) * 10, 4, 2, hash(k, id + 7) * 3, 0, 7); c.fill(); } }
  c.restore();
  c.strokeStyle = rgba('#fff', .5); c.lineWidth = 1.5; c.beginPath(); c.moveTo(-6, -26); c.lineTo(-5, -4); c.stroke();
  c.strokeStyle = '#d9a441'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-8.6, -24); c.lineTo(8.6, -24); c.stroke();
  ink(g, 1.4, 1350 + id);
  c.restore();
  if (steamy) K.smoke(t, x, y - 32 * s, 70 * s, '#ffffff', .12, .45 * s, id + 3);
}
/** a teapot pouring from high up (arc of tea) */
export function teapot(x, y, s = 1, tilt = 0, id = 0) {
  const sp = prop('teapot'); if (sp) { c.save(); c.translate(x, y); c.rotate(tilt); drawSprite(sp, 0, 0, 90 * s, { shadow: false }); c.restore(); return; }
  c.save(); c.translate(x, y); c.rotate(tilt); c.scale(s, s);
  const body = P(q => { q.moveTo(-26, 0); q.quadraticCurveTo(-34, -30, -14, -40); q.lineTo(14, -40); q.quadraticCurveTo(34, -30, 26, 0); q.closePath(); });
  paint(P(q => { q.moveTo(24, -24); q.quadraticCurveTo(46, -26, 58, -48); q.lineTo(62, -46); q.quadraticCurveTo(52, -18, 26, -10); q.closePath(); }), '#c9ced8', { lw: 1.8, id: 1360 + id, tex: .3 });
  paint(body, '#d6dae2', { lw: 2, id: 1361 + id, tex: .35, shadow: P(q => q.ellipse(10, -16, 20, 20, 0, 0, 7)), shadowCol: 'rgba(60,60,110,.3)' });
  paint(P(q => { q.moveTo(-12, -40); q.quadraticCurveTo(0, -60, 12, -40); q.closePath(); }), '#c9ced8', { lw: 1.6, id: 1362 + id, tex: .3 });
  c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.arc(-30, -22, 12, 1.8, 4.6); c.stroke();
  c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.ellipse(-12, -26, 5, 9, .3, 0, 7); c.fill();
  c.restore();
}
export function pourStream(t, x0, y0, x1, y1, k = 1) {
  if (k <= 0) return;
  c.save(); c.strokeStyle = rgba('#c8902a', .85 * k); c.lineWidth = 3.2; c.lineCap = 'round';
  c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(x0 + (x1 - x0) * .3, y0 + (y1 - y0) * .1, x1 + Math.sin(t * 30) * 1.2, y1); c.stroke();
  c.strokeStyle = rgba('#ffe8b0', .6 * k); c.lineWidth = 1; c.stroke(); c.restore();
  K.glow(x1, y1, 16, '#ffe0a0', .4 * k, 'screen');
}
/** a bunch of fresh herbs (verbena, sage, absinthe) */
export function herbs(x, y, s = 1, t = 0, id = 0, n = 9) {
  c.save(); c.translate(x, y); c.scale(s, s);
  for (let i = 0; i < n; i++) {
    const a = -1.2 + i / (n - 1) * 1.1 + noise(t * .8 + i, id) * .05, L = 40 + hash(i, id) * 30, col = ['#4f8a3a', '#7aa05a', '#9ab0a0'][i % 3];
    c.strokeStyle = '#3a5a2a'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * L, Math.sin(a) * L); c.stroke();
    for (let k = 1; k <= 4; k++) { const px = Math.cos(a) * L * k / 4.3, py = Math.sin(a) * L * k / 4.3; paint(P(q => q.ellipse(px, py, 7, 3.2, a + (k % 2 ? .7 : -.7), 0, 7)), col, { lw: .9, id: 1370 + i * 5 + k + id, tex: .2 }); }
  }
  c.restore();
}
/** a handkerchief knotted around coins; untie 0..1 opens it and reveals two coins */
export function hanky(x, y, s = 1, untie = 0, t = 0) {
  c.save(); c.translate(x, y); c.scale(s, s);
  const open = ease(untie);
  paint(P(q => { q.moveTo(-26 - 14 * open, 0); q.quadraticCurveTo(-30 - 10 * open, -20 + 10 * open, -8, -18 + 6 * open); q.quadraticCurveTo(0, -32 + 20 * open, 8, -18 + 6 * open); q.quadraticCurveTo(30 + 10 * open, -20 + 10 * open, 26 + 14 * open, 0); q.quadraticCurveTo(0, 12, -26 - 14 * open, 0); q.closePath(); }), '#e8e0f0', { lw: 1.8, id: 1400, tex: .4, shadow: P(q => q.ellipse(6, 2, 22, 7, 0, 0, 7)), shadowCol: 'rgba(80,60,120,.25)' });
  c.strokeStyle = '#8a3a4a'; c.lineWidth = 1.4; c.beginPath(); c.ellipse(0, -2, 24 + 10 * open, 7, 0, 0, 7); c.stroke();
  if (open < .6) paint(P(q => q.ellipse(0, -26 + 20 * open, 8, 6, 0, 0, 7)), '#ded4e8', { lw: 1.6, id: 1401, tex: .3 });
  if (open > .4) for (const cx of [-7, 8]) coin(cx, -4, .8, t, (open - .4) / .6);
  c.restore();
}
export function coin(x, y, s = 1, t = 0, a = 1) {
  c.save(); c.globalAlpha *= clamp(a); c.translate(x, y); c.scale(s, s);
  paint(P(q => q.ellipse(0, 0, 9, 8, 0, 0, 7)), '#c9c4b0', { lw: 1.4, id: 1410, tex: .3, shadow: P(q => q.ellipse(3, 3, 9, 8, 0, 0, 7)), shadowCol: 'rgba(60,60,80,.3)' });
  c.strokeStyle = rgba(INK, .4); c.lineWidth = 1; c.beginPath(); c.arc(0, 0, 5.5, 0, 7); c.stroke();
  const gl = Math.max(0, Math.sin(t * 3 + x)) ** 8; if (gl > .05) K.glow(-3, -3, 10, '#ffffff', .8 * gl, 'lighter');
  c.restore();
}
/** two golden sfenj (Moroccan ring doughnuts) on a faience plate */
export function sfenjPlate(t, x, y, s = 1, n = 2, steamy = true) {
  const sp = prop('sfenj_plate'); if (sp) { drawSprite(sp, x, y + 24 * s, 110 * s, { shadow: false }); if (steamy) for (let i = 0; i < 2; i++) K.smoke(t, x + (i - .5) * 40 * s, y - 20 * s, 60 * s, '#ffffff', .1, .35 * s, 40 + i); return; }
  c.save(); c.translate(x, y); c.scale(s, s);
  paint(P(q => q.ellipse(0, 0, 70, 22, 0, 0, 7)), '#f2efe6', { lw: 2, id: 1420, tex: .3, shadow: P(q => q.ellipse(8, 6, 66, 18, 0, 0, 7)), shadowCol: 'rgba(60,70,120,.2)' });
  c.strokeStyle = '#1d4e89'; c.lineWidth = 2.4; c.beginPath(); c.ellipse(0, 0, 58, 17, 0, 0, 7); c.stroke();
  for (let k = 0; k < 10; k++) { const a = k / 10 * 6.283; c.fillStyle = '#2a8a66'; c.beginPath(); c.arc(Math.cos(a) * 64, Math.sin(a) * 19.5, 2.4, 0, 7); c.fill(); }
  for (let i = 0; i < n; i++) {
    const cx = (i - (n - 1) / 2) * 44, cy = -8;
    const ring = P(q => { q.ellipse(cx, cy, 30, 15, i * .2 - .1, 0, 7); q.ellipse(cx, cy - 1, 11, 5, 0, 0, 7); });
    c.save(); c.fillStyle = '#d9962f'; c.fill(ring, 'evenodd'); c.clip(ring, 'evenodd');
    c.fillStyle = 'rgba(255,220,140,.5)'; c.beginPath(); c.ellipse(cx - 8, cy - 7, 18, 5, -.2, 0, 7); c.fill();
    c.fillStyle = 'rgba(120,60,20,.35)'; c.beginPath(); c.ellipse(cx + 6, cy + 9, 26, 6, 0, 0, 7); c.fill(); c.restore();
    ink(ring, 1.8, 1421 + i);
    if (steamy) K.smoke(t, x + cx * s, y + (cy - 14) * s, 60 * s, '#ffffff', .1, .35 * s, 40 + i);
  }
  c.restore();
}
/** doum-palm shopping basket (couffin), full = shows meat, beans, herbs at the top */
export function couffin(x, y, s = 1, full = 1, t = 0) {
  const sp = prop(full ? 'couffin_full' : 'couffin_empty'); if (sp) { drawSprite(sp, x, y + 4 * s, 120 * s, { shadow: false }); return; }
  c.save(); c.translate(x, y); c.scale(s, s);
  if (full) {
    for (let i = 0; i < 6; i++) paint(P(q => q.ellipse(-30 + i * 12, -58 - hash(i, 3) * 10, 16, 5, -.6 + i * .25, 0, 7)), '#5f9a3a', { lw: 1.2, id: 1440 + i, tex: .3 });
    paint(P(q => q.ellipse(14, -58, 20, 12, .2, 0, 7)), '#b8453a', { lw: 1.6, id: 1447, tex: .4 });
    herbs(-30, -52, .6, t, 3, 6);
  }
  const body = P(q => { q.moveTo(-50, -54); q.lineTo(50, -54); q.lineTo(40, 0); q.lineTo(-40, 0); q.closePath(); });
  paint(body, '#c9a45a', { lw: 2, id: 1450, tex: .5, shadow: P(q => q.rect(10, -54, 40, 54)), shadowCol: 'rgba(90,50,30,.25)' });
  c.save(); c.clip(body); c.strokeStyle = rgba('#8a6a2a', .6); c.lineWidth = 1.2;
  for (let yy = -50; yy < 0; yy += 7) { c.beginPath(); c.moveTo(-60, yy); c.lineTo(60, yy); c.stroke(); }
  for (let xx = -60; xx < 60; xx += 9) { c.beginPath(); c.moveTo(xx, -54); c.lineTo(xx - 4, 0); c.stroke(); }
  c.fillStyle = '#b8453a'; c.fillRect(-60, -34, 120, 5); c.restore();
  c.strokeStyle = '#8a6a2a'; c.lineWidth = 4; for (const e of [-1, 1]) { c.beginPath(); c.moveTo(e * 34, -54); c.quadraticCurveTo(e * 30, -100, 0, -102); c.stroke(); }
  c.restore();
}
/** sparterie platter of fava bean pods; shelled 0..1 fills the bowl with beans */
export function beans(x, y, s = 1, shelled = 0, t = 0) {
  c.save(); c.translate(x, y); c.scale(s, s);
  paint(P(q => q.ellipse(0, 0, 110, 30, 0, 0, 7)), '#c9a45a', { lw: 2, id: 1460, tex: .5, shadow: P(q => q.ellipse(10, 8, 104, 22, 0, 0, 7)) });
  c.strokeStyle = rgba('#8a6a2a', .5); for (let r = 20; r < 110; r += 14) { c.beginPath(); c.ellipse(0, 0, r, r * .27, 0, 0, 7); c.stroke(); }
  const pods = Math.round(18 * (1 - shelled * .8));
  for (let i = 0; i < pods; i++) { const px = -80 + hash(i, 1) * 160, py = -14 + hash(i, 2) * 22, a = hash(i, 3) * 3; paint(P(q => q.ellipse(px, py, 22, 6, a, 0, 7)), '#6aa04a', { lw: 1.3, id: 1461 + i, tex: .3 }); }
  const bn = Math.round(30 * shelled);
  for (let i = 0; i < bn; i++) { const px = 40 + hash(i, 5) * 50 - 25, py = -4 + hash(i, 6) * 12; c.fillStyle = '#9ac860'; c.beginPath(); c.ellipse(px, py, 5, 3.6, hash(i, 7) * 3, 0, 7); c.fill(); c.strokeStyle = rgba(INK, .5); c.lineWidth = .8; c.stroke(); }
  c.restore();
}
/** a long ruby radish (a span long), bite 0..1 takes a crescent out of its tip */
export function radish(x, y, s = 1, rot = 0, bite = 0) {
  const sp = prop('radish'); if (sp && !bite) { c.save(); c.translate(x, y); c.rotate(rot); drawSprite(sp, 0, 30 * s, 90 * s, { shadow: false }); c.restore(); return; }
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  for (let i = 0; i < 4; i++) paint(P(q => { q.moveTo(-40, 0); q.quadraticCurveTo(-60 - i * 6, -20 + i * 10, -84 - i * 4, -18 + i * 12); q.quadraticCurveTo(-62, -2 + i * 4, -40, 2); q.closePath(); }), '#4f8a3a', { lw: 1.2, id: 1480 + i, tex: .3 });
  const body = P(q => { q.moveTo(-42, -9); q.quadraticCurveTo(10, -13, 60, -2); q.quadraticCurveTo(68, 0, 60, 2); q.quadraticCurveTo(10, 13, -42, 9); q.closePath(); });
  c.save();
  if (bite > 0) { const cut = P(q => { q.rect(-100, -40, 300, 80); q.arc(60 - 8 * bite, 0, 12 * bite, 0, 7); }); c.clip(cut, 'evenodd'); }
  paint(body, '#c8243e', { lw: 1.8, id: 1485, tex: .35, shadow: P(q => q.rect(-50, 2, 120, 12)), shadowCol: 'rgba(90,10,40,.3)' });
  c.fillStyle = 'rgba(255,200,210,.55)'; c.beginPath(); c.ellipse(-4, -5, 30, 2.5, -.03, 0, 7); c.fill();
  if (bite > 0) { c.fillStyle = '#fbf0f0'; c.beginPath(); c.arc(60 - 8 * bite, 0, 12 * bite * .82, 0, 7); c.fill(); }
  c.restore();
  c.strokeStyle = '#c8243e'; c.lineWidth = 1; c.beginPath(); c.moveTo(66, 0); c.quadraticCurveTo(80, 2, 92, -1); c.stroke();
  c.restore();
}
/** the faceted glass cabochon: glints, inner fire, and optional rainbow scatter */
export function cabochon(t, x, y, r, glint = 1, rainbow = 0) {
  c.save(); c.translate(x, y);
  const facets = 8, rot = t * .15;
  for (let i = 0; i < facets; i++) {
    const a0 = rot + i / facets * 6.283, a1 = rot + (i + 1) / facets * 6.283, v = .5 + .5 * Math.sin(i * 2.1 + t * 1.3);
    c.fillStyle = mix('#7fd0e8', '#e8f6ff', v); c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a0) * r, Math.sin(a0) * r * .9); c.lineTo(Math.cos(a1) * r, Math.sin(a1) * r * .9); c.closePath(); c.fill();
    c.strokeStyle = rgba('#ffffff', .5); c.lineWidth = 1; c.stroke();
  }
  c.fillStyle = radial(-r * .2, -r * .2, 0, r * .7, 'rgba(255,255,255,.8)', 'rgba(255,255,255,0)'); c.beginPath(); c.arc(0, 0, r * .6, 0, 7); c.fill();
  ink(P(q => q.ellipse(0, 0, r, r * .9, 0, 0, 7)), 1.8, 1500);
  c.restore();
  if (glint > 0) {
    const g = (.5 + .5 * Math.sin(t * 2.3)) * glint;
    K.glow(x, y, r * 4, '#bfefff', .35 * glint, 'screen');
    c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = rgba('#ffffff', .9 * g); c.lineWidth = 2; c.translate(x - r * .3, y - r * .35);
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + t * .3, L = r * (1.3 + g); c.beginPath(); c.moveTo(Math.cos(a) * 2, Math.sin(a) * 2); c.lineTo(Math.cos(a) * L, Math.sin(a) * L); c.stroke(); }
    c.restore();
  }
  if (rainbow > 0) {
    c.save(); c.globalCompositeOperation = 'screen';
    const hues = ['#ff5a5a', '#ffb050', '#fff070', '#70e070', '#60b0ff', '#b070ff'];
    for (let i = 0; i < 14; i++) {
      const a = i / 14 * 6.283 + t * .2, d = 120 + hash(i, 3) * 380 * rainbow, px = x + Math.cos(a) * d, py = y + Math.sin(a) * d * .7;
      c.fillStyle = rgba(hues[i % 6], .22 * rainbow * (.6 + .4 * Math.sin(t * 2 + i))); c.beginPath(); c.ellipse(px, py, 30 + hash(i, 4) * 40, 8 + hash(i, 5) * 10, a, 0, 7); c.fill();
    }
    c.restore();
  }
}
/** the goat-hair rope the father winds around his waist: from the hand at (hx,hy) to a coil on the floor */
export function rope(t, hx, hy, fx, fy, wound = 0) {
  c.save(); c.strokeStyle = '#3a2a22'; c.lineWidth = 5; c.lineCap = 'round';
  c.beginPath(); c.moveTo(hx, hy);
  const mx = (hx + fx) / 2 + Math.sin(t * 2.5) * 30, my = Math.max(hy, fy) + 40 * (1 - wound);
  c.quadraticCurveTo(mx, my, fx, fy); c.stroke();
  c.strokeStyle = 'rgba(120,90,70,.6)'; c.lineWidth = 1.5; c.stroke();
  for (let i = 0; i < Math.round(5 * (1 - wound)); i++) { c.strokeStyle = '#3a2a22'; c.lineWidth = 4.5; c.beginPath(); c.ellipse(fx, fy - i * 3, 34 - i * 2, 9, 0, 0, 7); c.stroke(); }
  c.restore();
}
/** ink-and-smoke nightmare woman: wild hair, reaching claws (2D, semi-transparent) */
export function inkWoman(t, x, y, s, reach = 0, seed = 0, a = .8) {
  c.save(); c.translate(x, y); c.scale(s, s); c.globalAlpha *= a;
  c.fillStyle = 'rgba(12,8,24,.85)';
  c.beginPath(); c.moveTo(-60, 0); c.quadraticCurveTo(-80 + noise(t, seed) * 20, -180, -20, -260); c.lineTo(20, -260); c.quadraticCurveTo(80 + noise(t, seed + 1) * 20, -180, 60, 0); c.closePath(); c.fill();
  // hair: whipping strands
  c.strokeStyle = 'rgba(12,8,24,.9)'; c.lineCap = 'round';
  for (let i = 0; i < 16; i++) {
    const a0 = -Math.PI / 2 + (i / 15 - .5) * 2.6, L = 90 + hash(i, seed) * 90; c.lineWidth = 6 - hash(i, seed + 2) * 3; c.beginPath(); c.moveTo(0, -290);
    for (let k = 1; k <= 6; k++) { const d = L * k / 6; c.lineTo(Math.cos(a0) * d + noise(t * 2 + i + k * .3, seed) * 18 * k / 3, -290 + Math.sin(a0) * d + noise(t * 2.2 + i, seed + 5) * 10); }
    c.stroke();
  }
  c.fillStyle = 'rgba(20,12,34,.95)'; c.beginPath(); c.ellipse(0, -290, 34, 42, 0, 0, 7); c.fill();
  // burning eyes
  for (const e of [-12, 12]) { K.glow(e, -296, 20, '#ff5a3a', .7, 'lighter'); c.fillStyle = '#ffd0a0'; c.beginPath(); c.ellipse(e, -296, 5, 2.5, 0, 0, 7); c.fill(); }
  // arms with claws, reaching toward +x
  for (const side of [-1, 1]) {
    const ex = 60 + reach * 160, ey = -200 + side * 30 + noise(t * 1.5, seed + side) * 20;
    c.strokeStyle = 'rgba(12,8,24,.9)'; c.lineWidth = 12; c.beginPath(); c.moveTo(side * 30, -230); c.quadraticCurveTo(ex * .5, ey - 40, ex, ey); c.stroke();
    c.lineWidth = 3;
    for (let f = 0; f < 4; f++) { const fa = -.6 + f * .4; c.beginPath(); c.moveTo(ex, ey); c.quadraticCurveTo(ex + Math.cos(fa) * 20, ey + Math.sin(fa) * 20 - 6, ex + Math.cos(fa) * 38, ey + Math.sin(fa) * 38); c.stroke(); }
  }
  c.restore();
}
/** speech rhythm helper: 0..1 "talk energy" for gestures while `who` speaks */
export const talk = (S, who, t) => S.speaking(who, t) ? clamp(S.mouth(who, t) * 1.8) : 0;
/** a hand gesture curve that is lively while talking (use as additive rotation) */
export const gest = (S, who, t, seed = 0) => (S.speaking(who, t) ? 1 : 0) * (.5 + .5 * noise(t * 1.3, seed));
/** a painted woman's hand + forearm (sleeve) entering from off-frame; (x,y) = palm centre, ang = forearm direction (rad, pointing back to the elbow) */
export function hand2d(x, y, s = 1, ang = -2.2, o = {}) {
  const skin = o.skin || '#d9a077', sleeve = o.sleeve || '#4f55a3', trim = o.trim || '#f2a31b';
  c.save(); c.translate(x, y); c.rotate(ang); c.scale(s, s);
  // forearm with sleeve going off to +x (towards the elbow)
  paint(P(q => { q.moveTo(20, -26); q.lineTo(900, -60); q.lineTo(900, 70); q.lineTo(20, 26); q.closePath(); }), skin, { lw: 2.2, id: 1600, tex: .3, shadow: P(q => q.rect(20, 6, 900, 70)), shadowCol: 'rgba(90,40,50,.25)' });
  const sl = P(q => { q.moveTo(170, -40); q.quadraticCurveTo(300, -70, 900, -86); q.lineTo(900, 96); q.quadraticCurveTo(300, 70, 170, 40); q.closePath(); });
  paint(sl, sleeve, { lw: 2.4, id: 1601, tex: .6, shadow: P(q => { q.moveTo(170, 10); q.quadraticCurveTo(300, 40, 900, 30); q.lineTo(900, 96); q.quadraticCurveTo(300, 70, 170, 40); q.closePath(); }), shadowCol: 'rgba(20,10,50,.35)' });
  c.save(); c.clip(sl); c.strokeStyle = 'rgba(20,10,50,.35)'; c.lineWidth = 3;
  for (const [a, b] of [[260, -20], [390, 10], [520, -30], [650, 20]]) { c.beginPath(); c.moveTo(a, b - 40); c.quadraticCurveTo(a + 40, b, a + 10, b + 50); c.stroke(); }
  c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(170, -60, 800, 30); c.restore();
  c.strokeStyle = trim; c.lineWidth = 8; c.beginPath(); c.moveTo(176, -46); c.quadraticCurveTo(160, 0, 176, 46); c.stroke();
  // palm and fingers, curved to rest on something round (a forehead)
  paint(P(q => { q.moveTo(24, -28); q.quadraticCurveTo(-10, -34, -30, -22); q.lineTo(-100, -30); q.quadraticCurveTo(-112, -24, -102, -16); q.lineTo(-40, -8); q.lineTo(-112, -4); q.quadraticCurveTo(-120, 4, -108, 10); q.lineTo(-40, 8); q.lineTo(-102, 22); q.quadraticCurveTo(-106, 32, -94, 32); q.lineTo(-34, 22); q.quadraticCurveTo(-4, 34, 24, 28); q.closePath(); }), skin, { lw: 2.2, id: 1602, tex: .3, shadow: P(q => q.rect(-120, 6, 150, 30)), shadowCol: 'rgba(90,40,50,.22)' });
  if (o.henna) { c.strokeStyle = 'rgba(140,50,30,.6)'; c.lineWidth = 1.6; for (const yy of [-16, 0, 16]) { c.beginPath(); c.moveTo(-96, yy); c.lineTo(-60, yy); c.stroke(); } c.beginPath(); c.arc(-10, 0, 10, 0, 7); c.stroke(); }
  c.restore();
}
/** striped wool hanbel blanket over a sleeper lying on the right-hand mattress: covers from the neck to the feet */
export function hanbel(t, h, s = 1, toss = 0) {
  const f = h.face, [hx, hy] = f ? f.mouth : h.head, br = Math.sin(t * 1.6) * 2.5 * s + toss * Math.sin(t * 5) * 6;
  const x0 = hx + 30 * s, y0 = hy + 6 * s, len = 270 * s;
  const path = P(q => { q.moveTo(x0, y0 - 26 * s); q.bezierCurveTo(x0 + 40 * s, y0 - 58 * s - br, x0 + len * .55, y0 - 50 * s - br, x0 + len, y0 - 26 * s); q.quadraticCurveTo(x0 + len + 26 * s, y0 + 20 * s, x0 + len - 6 * s, y0 + 70 * s); q.lineTo(x0 - 20 * s, y0 + 74 * s); q.quadraticCurveTo(x0 - 30 * s, y0 + 10 * s, x0, y0 - 26 * s); q.closePath(); });
  paint(path, '#7a3a2e', { lw: 2.2, id: 1350, tex: .5, shadow: P(q => q.rect(x0 - 30 * s, y0 + 4 * s, len + 60 * s, 40 * s)), shadowCol: 'rgba(20,10,40,.4)' });
  c.save(); c.clip(path);
  const cols = ['#b8704a', '#e0cfa8', '#34507a', '#d9a441'];
  for (let k = 0; k < 7; k++) { c.fillStyle = rgba(cols[k % 4], .55); c.save(); c.translate(x0 + k * 40 * s, y0); c.transform(1, 0, -.25, 1, 0, 0); c.fillRect(0, -90 * s, (k % 2 ? 9 : 20) * s, 180 * s); c.restore(); }
  c.fillStyle = 'rgba(20,10,40,.22)'; c.fillRect(x0 - 40 * s, y0 + 20 * s, len + 80 * s, 60 * s);
  c.fillStyle = 'rgba(255,240,210,.12)'; c.beginPath(); c.ellipse(x0 + len * .45, y0 - 36 * s - br, len * .45, 10 * s, -.05, 0, 7); c.fill();
  c.restore();
  // fringe at the foot end
  c.strokeStyle = '#e8d8b8'; c.lineWidth = 1.6 * s; for (let k = 0; k < 8; k++) { const fy = y0 - 18 * s + k * 6 * s; c.beginPath(); c.moveTo(x0 + len + 6 * s, fy); c.lineTo(x0 + len + 18 * s, fy + 3 * s); c.stroke(); }
}
import * as THREE from 'three';
/** permanently turn the dark, warm robe texels of an actor's texture grey (skin is lighter and stays): mohammed_gris' djellaba */
const greyed = new Set();
export function greyRobe(a, vmax = .6, amt = .85, tintRGB = [128, 128, 134]) {
  if (greyed.has(a)) return; greyed.add(a);
  a.group.traverse(o => {
    if (!o.isMesh || !o.material.map || o.material.side === THREE.BackSide) return;
    const img = o.material.map.image, w = img.width, h = img.height, cv = new OffscreenCanvas(w, h), g = cv.getContext('2d');
    g.drawImage(img, 0, 0); const d = g.getImageData(0, 0, w, h), px = d.data;
    for (let i = 0; i < px.length; i += 4) {
      const r = px[i], gg = px[i + 1], b = px[i + 2], mx = Math.max(r, gg, b), v = mx / 255;
      if (v > vmax + .08) continue;
      const k = amt * Math.min(1, (vmax + .08 - v) / .08), lum = (r * .3 + gg * .59 + b * .11) / 255;
      px[i] = r + (tintRGB[0] * lum * 1.9 - r) * k; px[i + 1] = gg + (tintRGB[1] * lum * 1.9 - gg) * k; px[i + 2] = b + (tintRGB[2] * lum * 1.9 - b) * k;
    }
    g.putImageData(d, 0, 0);
    const t = new THREE.CanvasTexture(cv), m0 = o.material.map; t.flipY = m0.flipY; t.colorSpace = THREE.SRGBColorSpace; t.wrapS = m0.wrapS; t.wrapT = m0.wrapT;
    o.material.map = t; o.material.needsUpdate = true;
  });
}
/** load the grey-djellaba Mohammed (everyday clothes) */
export async function grayBoy(actor, n = 0) { const a = await actor('mohammed_gris', n); greyRobe(a); return a; }

// ---------------------------------------------------------------- sitting on a mattress / floor
/**
 * An actor that goes from standing (sit = 0) to sitting cross-legged on a seat (sit = 1).
 * (X, Y) = seat point on the 2D canvas; h = standing height there. The actor is sunk by `drop`*h and clipped at the lap;
 * a painted robe mound makes the folded legs. o = place() options + { robe, mound: 1 }.
 */
export function sitting(actorPlace, a, X, Y, h, sit, o = {}) {
  const k = ease(sit), drop = (o.occ ? (o.drop ?? .47) : (o.drop ?? .4)) * k, clipY = o.occ ? Math.min(...o.occ.map(p => p[1])) + (Math.max(...o.occ.map(p => p[1])) - Math.min(...o.occ.map(p => p[1]))) * .5 : Y - h * .03 * k + (1 - k) * h * .8;
  c.save(); c.beginPath(); c.rect(X - h * 1.5, Y - h * 1.5, h * 3, clipY - (Y - h * 1.5)); c.clip();
  const r = (o.robed || (f => f()))(() => actorPlace(a, X, Y + h * drop, h, { ...o, shadow: k < .5 }));
  c.restore();
  if (k > .02 && o.mound !== 0 && !o.occ) {
    // sample the real rendered robe just above the lap (so the folded-legs mound matches the 3D caftan under any light)
    let robeCol = o.robe || '#8a2e46';
    if (o.robe === undefined || o.autoRobe !== false) {
      const m = c.getTransform(), sx = m.a * X + m.c * (clipY - h * .07) + m.e, sy = m.b * X + m.d * (clipY - h * .07) + m.f;
      try { const s = [[-.11, 0], [.11, 0], [-.08, 0], [.08, 0]].map(([dx]) => c.getImageData(Math.round(sx + dx * h * m.a), Math.round(sy), 1, 1).data);
        const avg = [0, 1, 2].map(i => Math.round(s.reduce((a, d) => a + d[i], 0) / s.length)); if (s.every(d => d[3] > 200)) robeCol = `rgb(${avg.join(',')})`; } catch { }
    }
    // cross-legged lap: grows out of the clipped hips (no hard top edge), knees at the sides, shaded like cloth
    const w = (o.moundW || 1) * h * .26, top = clipY - h * .045, bot = Y + h * .04, yb = (top + bot) / 2;
    c.save(); c.globalAlpha *= clamp(k * 1.6);
    c.fillStyle = 'rgba(25,12,35,.28)'; c.beginPath(); c.ellipse(X, bot, w * 1.05, h * .03, 0, 0, 7); c.fill();          // contact shadow
    const lapP = new Path2D(); lapP.moveTo(X - w * .42, top);
    lapP.bezierCurveTo(X - w * .62, top + h * .005, X - w * 1.0, yb - h * .01, X - w * .98, yb + h * .02);                    // left knee
    lapP.quadraticCurveTo(X - w * .96, bot, X - w * .6, bot); lapP.quadraticCurveTo(X, bot + h * .012, X + w * .6, bot);
    lapP.quadraticCurveTo(X + w * .96, bot, X + w * .98, yb + h * .02); lapP.bezierCurveTo(X + w * 1.0, yb - h * .01, X + w * .62, top + h * .005, X + w * .42, top);
    lapP.closePath();
    const g = c.createLinearGradient(0, top, 0, bot); g.addColorStop(0, robeCol); g.addColorStop(.55, K.mix(robeCol, '#1a1030', .2)); g.addColorStop(1, K.mix(robeCol, '#1a1030', .45));
    c.fillStyle = g; c.fill(lapP);
    c.save(); c.clip(lapP);
    c.fillStyle = 'rgba(255,240,220,.12)'; for (const e of [-1, 1]) { c.beginPath(); c.ellipse(X + e * w * .72, yb, w * .22, h * .02, 0, 0, 7); c.fill(); }   // light on the knees
    c.strokeStyle = 'rgba(25,12,35,.28)'; c.lineWidth = Math.max(1, h * .004); for (const e of [-.45, -.1, .25]) { c.beginPath(); c.moveTo(X + e * w, top + h * .01); c.quadraticCurveTo(X + e * w + w * .1, yb, X + e * w - w * .05, bot); c.stroke(); }   // folds
    c.restore();
    const out = new Path2D(); out.moveTo(X - w * .5, top + h * .003); out.bezierCurveTo(X - w * .9, top + h * .01, X - w * 1.0, yb - h * .01, X - w * .98, yb + h * .02);
    out.quadraticCurveTo(X - w * .96, bot, X - w * .6, bot); out.quadraticCurveTo(X, bot + h * .012, X + w * .6, bot); out.quadraticCurveTo(X + w * .96, bot, X + w * .98, yb + h * .02); out.bezierCurveTo(X + w * 1.0, yb - h * .01, X + w * .9, top + h * .01, X + w * .5, top + h * .003);
    K.ink(out, 2.2, 1800 + (o.id || 0));
    c.restore();
  }
  if (o.occ && o.occImg) occlude(o.occImg, o.occ);
  return r;
}
/** a clay brazier with glowing charcoal and a kettle that sings (steam) */
export function brazier(t, x, y, s = 1, kettle = true, song = 1) {
  c.save(); c.translate(x, y); c.scale(s, s);
  paint(P(q => { q.moveTo(-46, -70); q.lineTo(46, -70); q.lineTo(34, 0); q.lineTo(-34, 0); q.closePath(); }), '#b8654a', { lw: 2.2, id: 1820, tex: .6, shadow: P(q => q.rect(8, -70, 40, 70)), shadowCol: 'rgba(60,20,20,.3)' });
  c.fillStyle = '#2a1410'; c.beginPath(); c.ellipse(0, -70, 42, 10, 0, 0, 7); c.fill();
  for (let i = 0; i < 7; i++) { const g = .6 + .4 * noise(t * 3 + i, 4); c.fillStyle = K.mix('#8a2a10', '#ffb040', g); c.beginPath(); c.arc(-28 + i * 9, -71 + (i % 2) * 3, 5, 0, 7); c.fill(); }
  glow(0, -72, 90, '#ff7a30', .35 * (.8 + .2 * noise(t * 5, 9)), 'lighter');
  c.fillStyle = '#6a3020'; c.beginPath(); c.moveTo(-10, -30); c.lineTo(10, -30); c.lineTo(8, -14); c.lineTo(-8, -14); c.closePath(); c.fill();
  if (kettle) {
    const jig = Math.sin(t * 40) * .6 * song;
    paint(P(q => { q.moveTo(-34, -78); q.quadraticCurveTo(-40, -130, 0, -134); q.quadraticCurveTo(40, -130, 34, -78); q.closePath(); }), '#b87a3a', { lw: 2, id: 1821, tex: .4, shadow: P(q => q.ellipse(14, -104, 20, 26, 0, 0, 7)), shadowCol: 'rgba(80,30,10,.3)' });
    paint(P(q => { q.moveTo(28, -104); q.quadraticCurveTo(52, -110, 64, -132 + jig); q.lineTo(68, -128 + jig); q.quadraticCurveTo(56, -96, 30, -90); q.closePath(); }), '#a86a2a', { lw: 1.8, id: 1822, tex: .3 });
    c.strokeStyle = '#3a2010'; c.lineWidth = 3; c.beginPath(); c.arc(0, -134, 26, Math.PI * 1.1, Math.PI * 1.9); c.stroke();
    c.fillStyle = 'rgba(255,240,200,.5)'; c.beginPath(); c.ellipse(-14, -112, 6, 12, .3, 0, 7); c.fill();
    if (song > 0) K.smoke(t * 1.3, 66, -130, 120, '#ffffff', .16 * song, .6, 12);
  }
  c.restore();
}

// ---------------------------------------------------------------- painted sprites (ChatGPT, background keyed by tools/sprites.py)
const SPR = {};
export async function sprite(name) { if (SPR[name] !== undefined) return SPR[name]; const img = new Image(); img.src = `/art/sprites/${name}.png`; try { await img.decode(); SPR[name] = img; } catch { SPR[name] = null; } return SPR[name]; }
/** draw a sprite standing on (x, y) (bottom centre), h px tall. o: flip (face right), breathe, rot, alpha, sx/sy squash, ox (anchor offset 0..1) */
export function drawSprite(img, x, y, h, o = {}) {
  if (!img) return;
  const s = h / img.naturalHeight, w = img.naturalWidth * s, br = o.breathe ? 1 + Math.sin((o.t || 0) * 2.2) * .012 * o.breathe : 1;
  c.save(); c.translate(x, y); if (o.rot) c.rotate(o.rot); c.scale((o.flip ? -1 : 1) * (o.sx || 1), br * (o.sy || 1)); if (o.alpha != null) c.globalAlpha *= o.alpha; if (o.filter) c.filter = o.filter;
  if (o.shadow !== false) { c.fillStyle = 'rgba(30,15,40,.25)'; c.beginPath(); c.ellipse(0, -2, w * .42, h * .06, 0, 0, 7); c.fill(); }
  c.drawImage(img, -w * (o.ox ?? .5), -h, w, h);
  c.restore();
}
/** a running cat from two painted gallop frames (8 fps flip) */
export function runCat(A, B, x, y, h, t, dir = 1, seed = 0, filter) {
  const f = Math.floor(t * 9 + seed * 3) % 2, bob = f ? -h * .04 : 0;
  drawSprite(f ? B : A, x, y + bob, h, { flip: dir > 0, filter });
}

/** preload every painted prop (missing ones fall back to the drawn versions) */
export const PROPS = ['couffin_empty', 'couffin_full', 'meat', 'beans', 'garlic', 'parsley', 'spices', 'sfenj_plate', 'radish', 'cabochon', 'teapot', 'boite_open', 'boite_closed'];
export async function preloadProps() { await Promise.all(PROPS.map(sprite)); }
export const prop = n => SPR[n] || null;
