// Small living things: sparrow, pigeons, donkey, cat.
import { c, P, paint, noise, rgba } from './core.js';

/** sparrow. mode: 'perch' (hops, tilts, pecks) | 'fly' (wings flap). dir = 1 faces right. */
export function sparrow(x, y, s = 1, mode = 'perch', t = 0, dir = 1, seed = 0) {
  c.save(); c.translate(x, y); c.scale(s * dir, s);
  const hop = mode === 'perch' ? Math.max(0, Math.sin(t * 2.3 + seed)) ** 12 * -12 : 0;
  const tilt = mode === 'perch' ? noise(t * 1.3, seed) * .45 : 0;
  c.translate(0, hop);
  if (mode === 'fly') {
    const f = Math.sin(t * 40 + seed);
    for (const k of [1, -1]) paint(P(q => { q.moveTo(-4, -14); q.quadraticCurveTo(-10, -14 - 34 * f * k, -26, -8 - 30 * f * k); q.quadraticCurveTo(-14, -10, 6, -10); q.closePath(); }), k > 0 ? '#8a6242' : '#6e4a30', { lw: 1.6, id: 700 + k, tex: .3 });
  } else {
    paint(P(q => { q.moveTo(-24, -12); q.lineTo(-40, -2); q.lineTo(-38, -12); q.closePath(); }), '#5a3a26', { lw: 1.4, id: 703, tex: .2 });
    c.strokeStyle = '#7a5a3a'; c.lineWidth = 2; c.beginPath(); c.moveTo(-3, -2); c.lineTo(-5, 6); c.moveTo(4, -2); c.lineTo(3, 6); c.stroke();
  }
  paint(P(q => q.ellipse(-4, -14, 22, 13, -.15, 0, 7)), '#a37a52', { lw: 1.8, id: 704, tex: .3, shadow: P(q => q.ellipse(-2, -6, 22, 8, 0, 0, 7)), shadowCol: 'rgba(240,225,200,.55)' });
  if (mode !== 'fly') paint(P(q => q.ellipse(-8, -16, 13, 7, -.2, 0, 7)), '#6e4a30', { lw: 1.4, id: 705, tex: .3 });
  c.save(); c.translate(14, -24); c.rotate(tilt);
  paint(P(q => q.arc(0, 0, 11, 0, 7)), '#8a6242', { lw: 1.8, id: 706, tex: .3 });
  c.fillStyle = '#e9dcc4'; c.beginPath(); c.ellipse(2, 5, 7, 5, 0, 0, 7); c.fill();
  c.fillStyle = '#2a1a14'; c.beginPath(); c.moveTo(-2, 4); c.lineTo(8, 3); c.lineTo(3, 9); c.fill();
  paint(P(q => { q.moveTo(9, -2); q.lineTo(19, 1); q.lineTo(9, 4); q.closePath(); }), '#3a2a1a', { lw: 1.2, id: 707, tex: false });
  c.fillStyle = '#120a06'; c.beginPath(); c.arc(4, -3, 2.4, 0, 7); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(4.8, -3.8, .8, 0, 7); c.fill();
  c.restore(); c.restore();
}

/** pigeon (bigger, grey-blue), perched or flying */
export function pigeon(x, y, s = 1, mode = 'perch', t = 0, dir = 1, seed = 0) {
  c.save(); c.translate(x, y); c.scale(s * dir, s);
  const bob = mode === 'perch' ? Math.sin(t * 3 + seed) * 2 : 0;
  if (mode === 'fly') { const f = Math.sin(t * 22 + seed); for (const k of [1, -1]) paint(P(q => { q.moveTo(-6, -20); q.quadraticCurveTo(-14, -20 - 50 * f * k, -40, -12 - 44 * f * k); q.quadraticCurveTo(-20, -14, 10, -14); q.closePath(); }), k > 0 ? '#9aa3b8' : '#7a8398', { lw: 1.8, id: 740 + k, tex: .3 }); }
  paint(P(q => q.ellipse(-4, -20, 32, 17, -.1, 0, 7)), '#a4acbf', { lw: 2, id: 743, tex: .3 });
  c.save(); c.translate(22, -36 + bob); paint(P(q => q.arc(0, 0, 12, 0, 7)), '#8a92a8', { lw: 1.8, id: 744, tex: .3 });
  c.fillStyle = '#6aa08a'; c.beginPath(); c.ellipse(-4, 12, 9, 6, 0, 0, 7); c.fill();
  c.fillStyle = '#e07a3a'; c.beginPath(); c.arc(4, -3, 3, 0, 7); c.fill(); c.fillStyle = '#120a06'; c.beginPath(); c.arc(4, -3, 1.5, 0, 7); c.fill();
  c.fillStyle = '#3a3030'; c.beginPath(); c.moveTo(10, 0); c.lineTo(20, 3); c.lineTo(10, 5); c.fill();
  c.restore();
  if (mode !== 'fly') { c.strokeStyle = '#c05a5a'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(-4, -4); c.lineTo(-6, 4); c.moveTo(6, -4); c.lineTo(6, 4); c.stroke(); }
  c.restore();
}

/** donkey walking (background life). dir = 1 walks right. */
export function donkey(x, y, s = 1, t = 0, dir = 1, load = '#b8452f') {
  c.save(); c.translate(x, y); c.scale(s * dir, s);
  const ph = t * 5;
  for (let k = 0; k < 4; k++) { const lx = [-60, -40, 40, 60][k], sw = Math.sin(ph + (k % 2 ? Math.PI : 0)) * 10; paint(P(q => { q.moveTo(lx, -70); q.lineTo(lx + sw, 0); q.lineTo(lx + sw + 8, 0); q.lineTo(lx + 8, -70); q.closePath(); }), '#6a5a52', { lw: 2, id: 720 + k, tex: .3 }); }
  paint(P(q => q.ellipse(0, -100, 80, 38, 0, 0, 7)), '#7a6a60', { lw: 2.4, id: 724, tex: .4 });
  paint(P(q => { q.moveTo(60, -120); q.quadraticCurveTo(90, -160, 110, -150); q.quadraticCurveTo(124, -120, 112, -112); q.quadraticCurveTo(90, -110, 70, -90); q.closePath(); }), '#7a6a60', { lw: 2.4, id: 725, tex: .4 });
  for (const e of [0, 10]) paint(P(q => { q.moveTo(92 + e, -150); q.quadraticCurveTo(88 + e, -190, 98 + e, -196); q.quadraticCurveTo(104 + e, -180, 100 + e, -148); q.closePath(); }), '#6a5a52', { lw: 2, id: 726 + e, tex: .3 });
  paint(P(q => { q.moveTo(-50, -140); q.lineTo(50, -140); q.lineTo(60, -80); q.lineTo(-60, -80); q.closePath(); }), load, { lw: 2.2, id: 730, tex: .5 });
  c.strokeStyle = '#6a5a52'; c.lineWidth = 3; c.beginPath(); c.moveTo(-78, -104); c.quadraticCurveTo(-96, -80 + Math.sin(ph) * 6, -90, -60); c.stroke();
  c.restore();
}

/** sleeping / sitting cat */
export function cat(x, y, s = 1, t = 0, col = '#c9884a') {
  c.save(); c.translate(x, y); c.scale(s, s);
  paint(P(q => q.ellipse(0, -18, 40, 20, 0, 0, 7)), col, { lw: 2, id: 760, tex: .4 });
  paint(P(q => q.arc(34, -30, 16, 0, 7)), col, { lw: 2, id: 761, tex: .4 });
  for (const e of [-8, 8]) paint(P(q => { q.moveTo(34 + e - 6, -42); q.lineTo(34 + e, -56); q.lineTo(34 + e + 6, -42); q.closePath(); }), col, { lw: 1.6, id: 762 + e, tex: .3 });
  c.strokeStyle = rgba('#1f1612', .9); c.lineWidth = 2; c.beginPath(); c.moveTo(26, -30); c.quadraticCurveTo(30, -27, 33, -30); c.moveTo(36, -30); c.quadraticCurveTo(40, -27, 43, -30); c.stroke();
  c.strokeStyle = col; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(-36, -12); c.quadraticCurveTo(-60, -4 + Math.sin(t) * 4, -44, 0); c.stroke();
  c.restore();
}
