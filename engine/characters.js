// Character system: one parametric figure drawer + a design per character (from art/ref/cast.png).
// Origin = between the feet on the ground. Up is -y. Adult woman ~ 600 units tall at scale 1.
import { c, T, P, paint, ink, line, INK, clamp, lerp, hash, noise, shade, light, rgba, mix, radial, glow } from './core.js';

// ------------------------------------------------------------------ designs
export const CAST = {
  mohammed: { h: 330, head: 86, bodyW: 88, skin: '#d9a27a', robe: '#ece2cc', robeTrim: '#b9a888', robeShape: 'djellaba', pattern: 'seam',
    hair: 'tuft', eyes: 1.08, iris: '#2b1a12', brow: 2.6, child: true, barefoot: true, trousers: '#e6dcc4', blush: .35 },
  zoubida: { h: 600, head: 70, bodyW: 118, skin: '#d9a077', robe: '#4f55a3', robeTrim: '#f2a31b', robeShape: 'caftan', pattern: 'chevron', sash: '#f2a31b', hem2: '#c8582f',
    hair: 'scarf', scarf: '#5a5fae', scarfPat: '#f2a31b', curls: '#1c1210', eyes: 1.05, iris: '#3a2214', brow: 2.6, lashes: true, earrings: '#e0a53c', shoes: '#4b2f4a', blush: .25, lips: '#a2453c' },
  father: { h: 660, head: 70, bodyW: 124, skin: '#c98f63', robe: '#efe3c3', robeTrim: '#c8b27a', robeShape: 'djellaba', pattern: 'stripes', stripe: '#d8c48e',
    hair: 'turban', turban: '#f4efe4', beard: '#1c1410', beardShape: 'short', eyes: .95, iris: '#2e1d12', brow: 3, shoes: '#e8c230', blush: .1 },
  rahma: { h: 575, head: 78, bodyW: 164, skin: '#d8a07a', robe: '#8a2e46', robeTrim: '#d28a8a', robeShape: 'caftan', pattern: 'leaf', patCol: '#d6897f', sleeveRoll: '#c26a6a', hem2: '#d06a2a',
    hair: 'scarf', scarf: '#e8741e', scarfPat: '#f5a14a', curls: '#1c1210', eyes: .95, iris: '#2e1d12', brow: 3, earrings: '#e0a53c', shoes: '#4a2a1a', blush: .45, lips: '#9a3a34', round: 1.25 },
  zineb: { h: 360, head: 80, bodyW: 92, skin: '#d6a47c', robe: '#5f9a4a', robeTrim: '#e6c35a', robeShape: 'dress', pattern: 'flowers', patCol: '#e0513a',
    hair: 'braids', hairCol: '#1c1210', eyes: 1.2, iris: '#2e1d12', brow: 2.6, child: true, shoes: '#5a3020', blush: .4, lips: '#a2453c' },
  chouafa: { h: 520, head: 72, bodyW: 130, skin: '#b98160', robe: '#8ec5dc', robeTrim: '#d8e8f0', robeShape: 'caftan', pattern: 'border', inner: '#b8322b', hem2: '#b8322b',
    hair: 'scarf', scarf: '#b8322b', scarfPat: '#2f5a8a', curls: '#8a8078', eyes: .85, iris: '#e0c12a', brow: 3.2, old: true, hunch: .22, amulets: true, henna: true, shoes: '#4a3a2a', blush: 0 },
  fqih: { h: 700, head: 66, bodyW: 116, skin: '#c28a62', robe: '#f6f3ec', robeTrim: '#dcd6c8', robeShape: 'djellaba', pattern: 'none',
    hair: 'turbanHood', turban: '#f8f6f0', beard: '#141010', beardShape: 'long', eyes: .9, iris: '#1a0f0a', brow: 4.4, angry: 1, shoes: '#3a2a22', blush: 0, rod: true },
  abdallah: { h: 610, head: 74, bodyW: 150, skin: '#c99470', robe: '#8a6440', robeTrim: '#6e4e30', robeShape: 'djellaba', pattern: 'stripes', stripe: '#77543a', hood: true,
    hair: 'cap', cap: '#efe8da', beard: '#bdb7ae', beardShape: 'round', eyes: .95, iris: '#2e1d12', brow: 3.4, old: true, shoes: '#4a2e1a', blush: .25, round: 1.15 },
  // generic women / men for crowds (hammam, neighbours, gnaoua)
  woman: { h: 590, head: 70, bodyW: 124, skin: '#d6a07a', robe: '#7a5a8a', robeShape: 'caftan', pattern: 'none', hair: 'scarf', scarf: '#d9a441', curls: '#1c1210', eyes: 1, iris: '#2e1d12', brow: 2.6, blush: .2, lips: '#a2453c' },
  man: { h: 650, head: 70, bodyW: 124, skin: '#c98f63', robe: '#d8cdb4', robeShape: 'djellaba', pattern: 'seam', hair: 'turban', turban: '#f4efe4', beard: '#1c1410', beardShape: 'short', eyes: .95, iris: '#2e1d12', brow: 3, shoes: '#e8c230', blush: .1 },
};

// ------------------------------------------------------------------ default pose
export function pose(o = {}) {
  return Object.assign({
    turn: 0,            // -1..1  head/body turn (negative = facing screen-left)
    bodyTurn: null,     // defaults to turn*.6
    lean: 0, headTilt: 0, bob: null,
    look: [0, 0],       // pupil offset (-1..1)
    blink: 0,           // 0 open .. 1 closed
    lid: 0,             // resting lid droop (sleepy / sad)
    mouth: 0,           // lip-sync openness 0..1
    smile: 0,           // -1 frown .. 1 smile
    brows: 0,           // -1 angry .. 1 worried/raised
    armL: [.15, .25], armR: [-.15, -.25], // [shoulder, elbow] radians; 0 = straight down. L = screen-left arm
    handL: 'open', handR: 'open',
    walk: null,         // phase in cycles, null = standing
    sit: false,         // cross-legged
    tears: 0, sweat: 0, flush: 0,
  }, o);
}

/** natural blink: returns 0..1 lid closure for time t, seeded per character */
export function autoBlink(t, seed = 0, rate = 1) {
  const period = 3.2 / rate, ph = (t + hash(seed) * period) % period;
  // occasional double blink
  const d = ph < .16 ? Math.sin(ph / .16 * Math.PI) : (hash(Math.floor((t + hash(seed) * period) / period), seed) > .7 && ph > .28 && ph < .44) ? Math.sin((ph - .28) / .16 * Math.PI) : 0;
  return d;
}
/** breathing / idle sway */
export function idle(t, seed = 0, amt = 1) { return { bob: Math.sin(t * 1.7 + seed) * 1.6 * amt, sway: noise(t * .4, seed) * amt }; }

// ------------------------------------------------------------------ figure
/**
 * draw(name, x, y, scale, pose, flip)  -> draws character at ground point (x,y)
 * flip = -1 mirrors (character faces other way). Returns anchor points (hands, head) for props.
 */
export function draw(name, x, y, s, p, flip = 1) {
  const d = typeof name === 'string' ? CAST[name] : name;
  p = pose(p);
  const id = hashName(typeof name === 'string' ? name : 'x');
  const H = d.h, hr = d.head, bw = d.bodyW * (d.round || 1);
  const turn = clamp(p.turn * flip, -1, 1) , bt = p.bodyTurn ?? turn * .6;
  const breathe = p.bob ?? Math.sin(T * 1.7 + id) * 1.4;
  const walk = p.walk != null ? p.walk * Math.PI * 2 : null;
  const wbob = walk != null ? -Math.abs(Math.sin(walk)) * 7 : 0;
  const out = {};

  c.save(); c.translate(x, y); c.scale(s * flip, s);
  // soft contact shadow
  c.fillStyle = 'rgba(20,10,30,.22)'; c.beginPath(); c.ellipse(0, 0, bw * (p.sit ? 1.25 : .75), 14, 0, 0, 7); c.fill();

  const sitDrop = p.sit ? H * .30 : 0;
  const shoulderY = -H * (d.child ? .64 : .77) + sitDrop + wbob + breathe * .5;
  const neckY = shoulderY - hr * .12;
  const hemY = -H * .02;
  const hunch = d.hunch || 0;
  c.save(); c.rotate(p.lean + hunch * .25);

  // ---------- feet (walking) ----------
  if (!p.sit) {
    const feet = walk != null ? [Math.sin(walk) * 26, -Math.sin(walk) * 26] : [-bw * .2, bw * .2];
    const lifts = walk != null ? [Math.max(0, Math.cos(walk)) * 8, Math.max(0, -Math.cos(walk)) * 8] : [0, 0];
    feet.forEach((fx, i) => foot(d, fx + bt * 8, -lifts[i], id + i, turn));
    if (d.barefoot || d.trousers) {
      feet.forEach((fx, i) => paint(P(q => q.rect(fx + bt * 8 - 11, hemY - 26 - lifts[i], 22, 22)), d.trousers || d.skin, { lw: 2, id: id + 40 + i, tex: .5 }));
    }
  }

  // ---------- back arm (screen-right when facing left, etc.) ----------
  const shW = bw * .5;
  const shL = [-shW * .86 * (1 - Math.max(0, bt) * .3) + bt * 6, shoulderY + shW * .3], shR = [shW * .86 * (1 + Math.min(0, bt) * .3) + bt * 6, shoulderY + shW * .3];
  const backIsL = turn > 0.05;             // turned to the right -> left arm is behind
  const arms = { L: { sh: shL, ang: p.armL, hand: p.handL, side: -1 }, R: { sh: shR, ang: p.armR, hand: p.handR, side: 1 } };
  const back = backIsL ? 'L' : 'R', front = backIsL ? 'R' : 'L';
  if (Math.abs(turn) > .05) out['hand' + back] = arm(d, arms[back], H, id + 50, true);

  // ---------- body ----------
  body(d, p, bt, shoulderY, hemY, walk, id);

  // ---------- arms ----------
  if (Math.abs(turn) <= .05) { out.handL = arm(d, arms.L, H, id + 60); out.handR = arm(d, arms.R, H, id + 61); }

  // ---------- head ----------
  const headCx = bt * 10 + turn * 4, headCy = neckY - hr * 1.18 + hunch * hr * .7;
  c.save(); c.translate(headCx, headCy + hr * .9); c.rotate(p.headTilt + noise(T * .5, id) * .015); c.translate(0, -hr * .9);
  head(d, p, turn, hr, id);
  c.restore();
  out.head = [x + (headCx) * s * flip, y + headCy * s];

  if (Math.abs(turn) > .05) out['hand' + front] = arm(d, arms[front], H, id + 51);
  c.restore();
  c.restore();
  // convert hand anchors to world
  for (const k of ['handL', 'handR']) if (out[k]) { const [hx, hy] = out[k]; out[k] = [x + hx * s * flip, y + hy * s]; }
  return out;
}
const hashName = n => [...n].reduce((a, ch) => a + ch.charCodeAt(0), 0);

function foot(d, fx, lift, id, turn) {
  const col = d.barefoot ? d.skin : (d.shoes || '#3a2a22');
  const dir = turn >= 0 ? 1 : -1;
  paint(P(q => { q.moveTo(fx - 16 * dir, -lift); q.quadraticCurveTo(fx - 18 * dir, -18 - lift, fx + 4 * dir, -16 - lift); q.quadraticCurveTo(fx + 26 * dir, -12 - lift, fx + 26 * dir, -lift); q.closePath(); }), col, { lw: 2.2, id, tex: .6 });
  if (d.barefoot) for (let k = 0; k < 3; k++) { c.fillStyle = rgba(INK, .5); c.beginPath(); c.arc(fx + (16 + k * 4) * dir, -lift - 4, 1.2, 0, 7); c.fill(); }
}

function body(d, p, bt, shY, hemY, walk, id) {
  const bw = d.bodyW * (d.round || 1), sw = walk != null ? Math.sin(walk) * 8 : noise(T * .6, id) * 2;
  const top = shY - 8, hemW = bw * (d.robeShape === 'dress' ? .62 : d.robeShape === 'caftan' ? .66 : .6);
  const midW = bw * .52 * (d.round ? 1.08 : 1);
  let hem = p.sit ? shY + (hemY - shY) * .72 : hemY;
  // organic silhouette: sloped shoulders, soft chest, A-line flare, hem that swings
  const nw = d.head * .34, shw = bw * .5, hip = noise(T * .3, id) * 3;
  const y1 = top + shw * .42, yMid = lerp(top, hem, .5);
  const path = P(q => {
    q.moveTo(-nw + bt * 6, top - 8);
    q.bezierCurveTo(-shw * .55, top - 8, -shw * .95, top - 2, -shw * 1.0, y1);                       // left shoulder slope
    q.bezierCurveTo(-shw * 1.04, lerp(y1, yMid, .5), -midW * 1.0 + hip, yMid, -midW * 1.02 + hip + sw * .3, lerp(yMid, hem, .35));
    q.bezierCurveTo(-hemW * .98 + sw * .6, lerp(yMid, hem, .7), -hemW * 1.02 + sw, hem - 10, -hemW + sw, hem);
    q.bezierCurveTo(-hemW * .5 + sw, hem + 12, hemW * .5 + sw, hem + 12, hemW + sw, hem);           // hem
    q.bezierCurveTo(hemW * 1.02 + sw, hem - 10, hemW * .98 + sw * .6, lerp(yMid, hem, .7), midW * 1.02 + hip + sw * .3, lerp(yMid, hem, .35));
    q.bezierCurveTo(midW * 1.0 + hip, yMid, shw * 1.04, lerp(y1, yMid, .5), shw * 1.0, y1);
    q.bezierCurveTo(shw * .95, top - 2, shw * .55, top - 8, nw + bt * 6, top - 8);
    q.quadraticCurveTo(bt * 6, top + 4, -nw + bt * 6, top - 8);
    q.closePath();
  });
  const shadow = P(q => { q.moveTo(shw * .25 + bt * 24, top - 20); q.bezierCurveTo(shw * .55, lerp(top, hem, .3), shw * .35 + sw, lerp(top, hem, .75), shw * .45 + sw, hem + 14); q.lineTo(bw * 1.2, hem + 20); q.lineTo(bw * 1.2, top - 20); q.closePath(); });
  // folds: a few soft vertical fold lines
  const folds = [-.55, -.2, .3, .62].map((k, i) => [k * hemW + sw * .8, lerp(top, hem, .45 + (i % 2) * .1)]);
  paint(path, d.robe, { lw: 2.8, id: id + 1, shadow, shadowCol: 'rgba(50,25,80,.2)' });
  c.save(); c.clip(path); c.strokeStyle = rgba(shade(d.robe, .45), .35); c.lineWidth = 2; c.lineCap = 'round';
  for (const [fx, fy] of folds) { c.beginPath(); c.moveTo(fx * .7, fy); c.quadraticCurveTo(fx * .9 + sw * .3, lerp(fy, hem, .5), fx + sw * .2, hem - 4); c.stroke(); }
  c.restore();
  // neckline: skin V + trim
  paint(P(q => { q.moveTo(-nw * .8 + bt * 6, top - 7); q.lineTo(bt * 6, top + d.head * .55); q.lineTo(nw * .8 + bt * 6, top - 7); q.closePath(); }), shade(d.skin, .12), { lw: 2, id: id + 11, tex: .4 });
  line([[-nw * .85 + bt * 6, top - 7], [bt * 6, top + d.head * .58], [nw * .85 + bt * 6, top - 7]], 3, id + 12, d.robeTrim || shade(d.robe, .3));

  // sitting: lap / crossed legs
  if (p.sit) {
    const lap = P(q => q.ellipse(sw * .3, hem - 4, bw * .95, 30, 0, 0, 7));
    paint(lap, shade(d.robe, .08), { lw: 2.6, id: id + 2 });
    if (d.barefoot) for (const sx of [-1, 1]) paint(P(q => q.ellipse(sx * bw * .55, hem + 8, 20, 10, sx * .3, 0, 7)), d.skin, { lw: 2, id: id + 3 + sx });
  }

  c.save(); c.clip(path);
  // ---- patterns ----
  const cx = bt * bw * .28;
  if (d.robeShape === 'caftan' && d.inner) { paint(P(q => { q.moveTo(cx - 20, top); q.lineTo(cx + 20, top); q.lineTo(cx + 60, hem + 20); q.lineTo(cx - 60, hem + 20); q.closePath(); }), d.inner, { lw: 2, id: id + 4 }); }
  if (d.hem2) { c.fillStyle = d.hem2; c.fillRect(-bw, hem - 16, bw * 2, 30); line([[-bw, hem - 16], [bw, hem - 16]], 1.6, id + 5); }
  if (d.pattern === 'chevron') {
    c.strokeStyle = rgba(light(d.robe, .45), .75); c.lineWidth = 2;
    for (let yy = top + 30; yy < hem; yy += 34) for (let xx = -bw; xx < bw; xx += 40) { c.beginPath(); c.moveTo(xx, yy); c.lineTo(xx + 10, yy - 8); c.lineTo(xx + 20, yy); c.stroke(); }
    c.strokeStyle = rgba(light(d.robe, .5), .8); c.lineWidth = 3; for (const off of [-24, 24]) { c.beginPath(); c.moveTo(cx + off * .4, top); c.lineTo(cx + off, hem); c.stroke(); }
  } else if (d.pattern === 'leaf') {
    c.fillStyle = rgba(d.patCol, .7);
    for (let yy = top + 30, j = 0; yy < hem; yy += 46, j++) for (let xx = -bw + (j % 2) * 26; xx < bw; xx += 52) { c.beginPath(); c.moveTo(xx, yy - 10); c.quadraticCurveTo(xx + 7, yy, xx, yy + 10); c.quadraticCurveTo(xx - 7, yy, xx, yy - 10); c.fill(); }
  } else if (d.pattern === 'stripes') {
    c.strokeStyle = rgba(d.stripe, .8); c.lineWidth = 3;
    for (let xx = -bw; xx < bw; xx += 16) { c.beginPath(); c.moveTo(xx, top); c.lineTo(xx * 1.15 + sw * .5, hem + 10); c.stroke(); }
  } else if (d.pattern === 'flowers') {
    for (let k = 0; k < 7; k++) { const fx = -bw * .5 + k * bw * .17, fy = hem - 24 - (k % 2) * 8; c.fillStyle = d.patCol; for (let pp = 0; pp < 5; pp++) { const a = pp / 5 * 7; c.beginPath(); c.arc(fx + Math.cos(a) * 5, fy + Math.sin(a) * 5, 4, 0, 7); c.fill(); } c.fillStyle = '#f2d04a'; c.beginPath(); c.arc(fx, fy, 3, 0, 7); c.fill(); c.strokeStyle = '#3a7a2a'; c.lineWidth = 2; c.beginPath(); c.moveTo(fx, fy + 6); c.lineTo(fx, hem + 5); c.stroke(); }
  } else if (d.pattern === 'border') {
    c.strokeStyle = '#d9a441'; c.lineWidth = 3; for (let yy = hem - 60; yy < hem; yy += 14) { c.beginPath(); for (let xx = -bw; xx < bw; xx += 14) { c.lineTo(xx, yy); c.lineTo(xx + 7, yy - 6); } c.stroke(); }
  }
  // centre seam / buttons (djellaba) or neckline slit
  if (d.robeShape === 'djellaba' || d.pattern === 'seam') {
    line([[cx, top + 4], [cx + sw * .3, hem]], 1.6, id + 6, rgba(INK, .55));
    c.fillStyle = d.robeTrim || shade(d.robe, .3); for (let k = 0; k < 7; k++) { c.beginPath(); c.arc(cx + 5, top + 26 + k * 13, 2.6, 0, 7); c.fill(); }
  }
  c.restore();
  // sash
  if (d.sash) {
    const sy = lerp(top, hem, .32);
    paint(P(q => { q.moveTo(-midW * 1.05, sy - 16); q.quadraticCurveTo(0, sy - 22, midW * 1.05, sy - 16); q.lineTo(midW * 1.07, sy + 18); q.quadraticCurveTo(0, sy + 12, -midW * 1.07, sy + 18); q.closePath(); }), d.sash, { lw: 2.4, id: id + 7 });
    paint(P(q => { q.moveTo(midW * .5, sy); q.quadraticCurveTo(midW * .7 + sw, sy + 90, midW * .55 + sw * 1.5, sy + 170); q.lineTo(midW * .8 + sw * 1.5, sy + 168); q.quadraticCurveTo(midW * .85 + sw, sy + 80, midW * .8, sy); q.closePath(); }), d.sash, { lw: 2.2, id: id + 8 });
  }
  // amulets (chouafa)
  if (d.amulets) {
    for (let k = 0; k < 3; k++) { c.strokeStyle = ['#b8322b', '#2f7a8a', '#d9a441'][k]; c.lineWidth = 3; c.beginPath(); c.arc(cx, top - 10, 30 + k * 12, .35, Math.PI - .35); c.stroke(); }
    for (let k = 0; k < 5; k++) { const a = .5 + k * .5, ax = cx + Math.cos(a) * 56, ay = top - 10 + Math.sin(a) * 56; paint(P(q => q.ellipse(ax, ay + 8, 8, 11, 0, 0, 7)), '#cfd3d6', { lw: 1.6, id: id + 20 + k, tex: .3 }); }
    paint(P(q => q.rect(cx - 10, top + 58, 20, 20)), '#cfd3d6', { lw: 1.8, id: id + 30, tex: .3 });
  }
  // hood behind neck
  if (d.hood) paint(P(q => { q.moveTo(-bw * .3, top - 4); q.quadraticCurveTo(0, top + 40, bw * .3, top - 4); q.quadraticCurveTo(0, top + 14, -bw * .3, top - 4); }), shade(d.robe, .12), { lw: 2, id: id + 9 });
}

function arm(d, a, H, id, isBack = false) {
  const L1 = H * (d.child ? .17 : .165), L2 = H * (d.child ? .15 : .15);
  const [sx, sy] = a.sh, side = a.side;
  const a1 = a.ang[0] * -side, a2 = a1 + a.ang[1] * -side;
  const ex = sx + Math.sin(a1) * L1 * side * -1 * -1, ey = sy + Math.cos(a1) * L1;
  const wx = ex + Math.sin(a2) * L2, wy = ey + Math.cos(a2) * L2;
  // arm hangs slightly outward from the body
  const out = side * 10;
  const E = [ex + out * .6, ey], Wr = [wx + out, wy];
  const col = isBack ? shade(d.robe, .18) : d.robe;
  const w1 = d.child ? 16 : 20, w2 = d.robeShape === 'dress' ? 11 : 30;
  // sleeve polygon
  const n1 = norm(sx, sy, E[0], E[1]), n2 = norm(E[0], E[1], Wr[0], Wr[1]);
  const sl = P(q => {
    q.moveTo(sx + n1[0] * w1, sy + n1[1] * w1);
    q.quadraticCurveTo(E[0] + (n1[0] + n2[0]) * w1 * .6, E[1] + (n1[1] + n2[1]) * w1 * .6, Wr[0] + n2[0] * w2, Wr[1] + n2[1] * w2);
    q.lineTo(Wr[0] - n2[0] * w2, Wr[1] - n2[1] * w2);
    q.quadraticCurveTo(E[0] - (n1[0] + n2[0]) * w1 * .45, E[1] - (n1[1] + n2[1]) * w1 * .45, sx - n1[0] * w1, sy - n1[1] * w1);
    q.closePath();
  });
  const handDir = Math.atan2(Wr[1] - E[1], Wr[0] - E[0]);
  const hx = Wr[0] + Math.cos(handDir) * 16, hy = Wr[1] + Math.sin(handDir) * 16;
  hand(d, hx, hy, handDir, a.hand, id + 3, isBack, side);
  paint(sl, col, { lw: 2.5, id, ink: false, shadow: P(q => q.rect(Wr[0] - 60, Wr[1] - 16, 120, 60)), shadowCol: 'rgba(40,20,70,.18)' });
  ink(P(q => {
    q.moveTo(sx + n1[0] * w1 * .8, sy + n1[1] * w1 * .8 + 6);
    q.quadraticCurveTo(E[0] + (n1[0] + n2[0]) * w1 * .6, E[1] + (n1[1] + n2[1]) * w1 * .6, Wr[0] + n2[0] * w2, Wr[1] + n2[1] * w2);
    q.lineTo(Wr[0] - n2[0] * w2, Wr[1] - n2[1] * w2);
    q.quadraticCurveTo(E[0] - (n1[0] + n2[0]) * w1 * .45, E[1] - (n1[1] + n2[1]) * w1 * .45, sx - n1[0] * w1 * .8, sy - n1[1] * w1 * .8 + 6);
  }), 2.5, id);
  if (d.sleeveRoll) paint(P(q => q.ellipse(Wr[0], Wr[1], w2 * .9, 9, handDir + Math.PI / 2, 0, 7)), d.sleeveRoll, { lw: 2, id: id + 1 });
  else { c.strokeStyle = d.robeTrim || shade(d.robe, .25); c.lineWidth = 3; c.beginPath(); c.moveTo(Wr[0] + n2[0] * (w2 - 3), Wr[1] + n2[1] * (w2 - 3)); c.lineTo(Wr[0] - n2[0] * (w2 - 3), Wr[1] - n2[1] * (w2 - 3)); c.stroke(); }
  return [hx, hy];
}
function norm(x0, y0, x1, y1) { const dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy) || 1; return [-dy / l, dx / l]; }

function hand(d, x, y, dir, shape, id, isBack, side) {
  const col = isBack ? shade(d.skin, .12) : d.skin, s = d.child ? .8 : 1;
  c.save(); c.translate(x, y); c.rotate(dir - Math.PI / 2); c.scale(s, s);
  let path;
  if (shape === 'fist' || shape === 'hold') path = P(q => { q.moveTo(-12, -4); q.bezierCurveTo(-16, 10, -12, 22, 0, 22); q.bezierCurveTo(12, 22, 16, 10, 12, -4); q.closePath(); q.moveTo(-9, 8); });
  else if (shape === 'point') path = P(q => { q.moveTo(-11, -4); q.bezierCurveTo(-15, 8, -10, 18, -3, 18); q.lineTo(-3, 40); q.quadraticCurveTo(1, 45, 4, 40); q.lineTo(5, 18); q.bezierCurveTo(12, 16, 14, 6, 11, -4); q.closePath(); });
  else if (shape === 'palm') path = P(q => { q.moveTo(-11, -6); q.bezierCurveTo(-17, 8, -16, 22, -12, 32); q.quadraticCurveTo(-9, 38, -6, 32); q.quadraticCurveTo(-4, 42, 0, 40); q.quadraticCurveTo(3, 44, 6, 38); q.quadraticCurveTo(10, 40, 11, 32); q.bezierCurveTo(14, 20, 12, 10, 12, 2); q.quadraticCurveTo(22, 4, 24, 12); q.quadraticCurveTo(20, -4, 11, -6); q.closePath(); });
  else path = P(q => { q.moveTo(-11, -6); q.bezierCurveTo(-15, 8, -13, 26, -3, 30); q.bezierCurveTo(8, 32, 13, 22, 12, 8); q.quadraticCurveTo(19, 10, 19, 18); q.quadraticCurveTo(21, 2, 11, -6); q.closePath(); });
  paint(path, col, { lw: 2.2, id, tex: .5 });
  if (d.henna) { c.strokeStyle = '#8a2a14'; c.lineWidth = 1.4; c.beginPath(); c.arc(0, 10, 6, 0, 5); c.stroke(); c.beginPath(); c.moveTo(-6, 18); c.lineTo(6, 22); c.stroke(); }
  if (d.amulets) { for (let k = 0; k < 3; k++) { c.strokeStyle = '#cfd3d6'; c.lineWidth = 3; c.beginPath(); c.ellipse(0, -8 - k * 6, 16, 5, 0, 0, 7); c.stroke(); } }
  c.restore();
}

// ------------------------------------------------------------------ head & face
function head(d, p, turn, r, id) {
  const tw = turn * r * .42;                         // feature shift for 3/4 views
  const jaw = d.child ? 1.02 : d.old ? 1.12 : 1.1, wide = d.round ? 1.08 : 1;
  const skinS = shade(d.skin, .18);
  // back hair / scarf tails / braids (behind head)
  if (d.hair === 'scarf') paint(P(q => { q.moveTo(-r * .9 - tw * .5, -r * .1); q.quadraticCurveTo(-r * 1.4 - tw, r * .8, -r * 1.05 - tw * .6, r * 1.3); q.lineTo(-r * .6 - tw, r * 1.2); q.quadraticCurveTo(-r * .8, r * .4, -r * .6, 0); q.closePath(); }), shade(d.scarf, .1), { lw: 2.2, id: id + 70 });
  if (d.hair === 'braids') for (const sx of [-1, 1]) { const bx = sx * r * .88 - tw * .4; c.save(); for (let k = 0; k < 6; k++) paint(P(q => q.ellipse(bx + Math.sin(T * 2 + k) * .8, r * .2 + k * 16, 9, 10, 0, 0, 7)), d.hairCol, { lw: 1.8, id: id + 80 + k + sx * 10, tex: .4 }); paint(P(q => q.ellipse(bx, r * .2 + 104, 7, 5, 0, 0, 7)), '#e0513a', { lw: 1.6, id: id + 99 }); c.restore(); }
  if (d.hair === 'turbanHood') paint(P(q => { q.moveTo(-r * 1.05, -r * .5); q.quadraticCurveTo(-r * 1.25, r * .9, -r * 1.3, r * 1.7); q.lineTo(r * 1.3, r * 1.7); q.quadraticCurveTo(r * 1.25, r * .9, r * 1.05, -r * .5); q.closePath(); }), '#ecebe4', { lw: 2.4, id: id + 71 });

  // neck
  paint(P(q => { const nk = Math.min(r * .26, 17); q.moveTo(-nk + tw * .2, r * .5); q.lineTo(-nk * 1.1 + tw * .15, r * 1.35); q.lineTo(nk * 1.1 + tw * .15, r * 1.35); q.lineTo(nk + tw * .2, r * .5); q.closePath(); }), skinS, { ink: false, tex: .4 });
  { const nk = Math.min(r * .26, 17); ink(P(q => { q.moveTo(-nk + tw * .2, r * .6); q.lineTo(-nk * 1.1 + tw * .15, r * 1.25); q.moveTo(nk + tw * .2, r * .6); q.lineTo(nk * 1.1 + tw * .15, r * 1.25); }), 2.2, id + 72); }

  // ear (near side moves back as the head turns)
  const earX = turn >= 0 ? -r * .95 + tw * .75 : r * .95 + tw * .75;
  if (!(d.hair === 'scarf' || d.hair === 'turbanHood')) paint(P(q => q.ellipse(earX, r * .08, r * .17, r * .25, 0, 0, 7)), d.skin, { lw: 2.2, id: id + 73, tex: .5 });

  // face shape: true round cranium + soft cheeks to a rounded chin
  const cy0 = -r * .12, chin = r * 1.0 * jaw;
  const face = P(q => {
    q.moveTo(-r * wide, cy0);
    q.ellipse(0, cy0, r * wide, r * 1.02, 0, Math.PI, 2 * Math.PI);
    q.bezierCurveTo(r * wide * 1.01 + tw * .15, r * .42, r * .62 + tw * .55, chin * .96, tw * .75, chin);
    q.bezierCurveTo(-r * .62 + tw * .55, chin * .96, -r * wide * 1.01 + tw * .15, r * .42, -r * wide, cy0);
    q.closePath();
  });
  const faceShadow = P(q => { const sx = turn >= 0 ? 1 : -1; q.moveTo(sx * r * .45 + tw, -r * 1.2); q.bezierCurveTo(sx * r * .75 + tw, -r * .2, sx * r * .55 + tw, r * .6, sx * r * .1 + tw, r * 1.2); q.lineTo(sx * r * 1.5, r * 1.3); q.lineTo(sx * r * 1.5, -r * 1.3); q.closePath(); });
  paint(face, d.skin, { lw: 2.6, id: id + 74, shadow: faceShadow, shadowCol: 'rgba(150,60,50,.13)', tex: .35 });

  // blush / flush
  const bl = (d.blush || 0) + (p.flush || 0) * .6;
  if (bl > 0) for (const sx of [-1, 1]) { const f = sx * turn > 0 ? .75 : 1; c.fillStyle = radial(sx * r * .52 * f + tw, r * .38, 0, r * .26, `rgba(220,90,80,${.35 * bl})`, 'rgba(220,90,80,0)'); c.fillRect(-r * 2, -r, r * 4, r * 2); }
  // wrinkles
  if (d.old) { c.strokeStyle = rgba(shade(d.skin, .45), .8); c.lineWidth = 1.6; for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(sx * r * .28 + tw, r * .36); c.quadraticCurveTo(sx * r * .42 + tw, r * .58, sx * r * .34 + tw, r * .74); c.stroke(); c.beginPath(); c.moveTo(sx * r * .66 + tw, -r * .12); c.lineTo(sx * r * .8 + tw, -r * .2); c.moveTo(sx * r * .66 + tw, -r * .06); c.lineTo(sx * r * .82 + tw, -r * .04); c.stroke(); } c.beginPath(); c.moveTo(-r * .3 + tw, -r * .62); c.quadraticCurveTo(tw, -r * .68, r * .3 + tw, -r * .62); c.stroke(); }

  // beard (under features)
  if (d.beard) beard(d, r, tw, id);

  // ----- eyes -----
  const es = d.eyes * r;
  const eyeY = r * (d.child ? .12 : .06), gap = r * (d.child ? .33 : .38);
  const eyes = [[-gap + tw, -1], [gap + tw, 1]];
  for (const [ex, sd] of eyes) {
    const far = sd * turn < 0 ? 1 - Math.abs(turn) * .38 : 1 + Math.abs(turn) * .05;
    eye(d, ex, eyeY, es * .24 * far, es * .2, p, sd, id + 100 + sd, turn);
  }
  // brows
  const bAng = (p.brows || 0) - (d.angry || 0) * .6;
  for (const [ex, sd] of eyes) {
    const far = sd * turn < 0 ? 1 - Math.abs(turn) * .38 : 1;
    const by = eyeY - es * .2 * 1.9 + (d.child ? 4 : 0) - (p.brows > 0 ? p.brows * 6 : 0);
    const inner = [ex - sd * es * .2 * far, by + bAng * -8 * -1 * (bAng < 0 ? -1 : 1) * (bAng < 0 ? 1 : -1)], outer = [ex + sd * es * .26 * far, by - 2 + (bAng > 0 ? bAng * 5 : 0)];
    inner[1] = by + (bAng < 0 ? -bAng * 10 : -bAng * 9);
    c.save(); c.strokeStyle = d.hair === 'cap' || d.old && d.beard ? '#8a8480' : INK; c.lineCap = 'round'; c.lineWidth = d.brow * (d.angry ? 1.4 : 1);
    c.beginPath(); c.moveTo(inner[0], inner[1]); c.quadraticCurveTo((inner[0] + outer[0]) / 2, Math.min(inner[1], outer[1]) - 5, outer[0], outer[1]); c.stroke(); c.restore();
  }
  // nose
  const nx = tw * 1.25;
  c.save(); c.strokeStyle = rgba(shade(d.skin, .6), .95); c.lineWidth = 2.2; c.lineCap = 'round'; c.beginPath();
  if (Math.abs(turn) < .2) { c.moveTo(nx - 3, r * .22); c.quadraticCurveTo(nx + 7, r * .4, nx - 2, r * .44); }
  else { const sd = turn > 0 ? 1 : -1; c.moveTo(nx - sd * 4, r * .14); c.quadraticCurveTo(nx + sd * r * .2, r * .38, nx - sd * 2, r * .45); }
  c.stroke(); c.restore();

  // mouth
  mouth(d, tw * 1.1, r * .66, r, p, id);
  // tears
  if (p.tears > 0) for (const [ex] of eyes) { const k = (T * .8 + ex) % 1; c.fillStyle = `rgba(190,225,255,${.85 * p.tears})`; c.beginPath(); c.ellipse(ex, eyeY + es * .2 + k * r * .6, 3, 5, 0, 0, 7); c.fill(); }
  if (p.sweat > 0) { c.fillStyle = `rgba(210,235,255,${.8 * p.sweat})`; c.beginPath(); c.ellipse(r * .8 + tw, -r * .5 + (T * 30 % 30), 4, 6, 0, 0, 7); c.fill(); }

  // hair / headwear on top
  headwear(d, r, tw, turn, id);
  if (d.earrings && d.hair === 'scarf') { const ex = turn >= 0 ? -r * .86 + tw * .75 : r * .86 + tw * .75; c.strokeStyle = d.earrings; c.lineWidth = 3; c.beginPath(); c.arc(ex, r * .42, 7, 0, 7); c.stroke(); glow(ex, r * .42, 10, '#ffd88a', .2); }
}

function eye(d, x, y, rx, ry, p, sd, id, turn) {
  const bl = clamp(Math.max(p.blink, p.lid));
  // almond white
  const white = P(q => { q.moveTo(x - rx, y); q.quadraticCurveTo(x - rx * .2, y - ry * 1.5, x + rx, y - ry * .15); q.quadraticCurveTo(x + rx * .1, y + ry * 1.25, x - rx, y); q.closePath(); });
  if (bl < .98) {
    c.save(); c.fillStyle = '#fbf6ea'; c.fill(white); c.clip(white);
    const ir = ry * 1.02 * (d.child ? 1.1 : 1), lx = x + (p.look[0] + turn * .25) * rx * .45, ly = y + p.look[1] * ry * .45;
    c.fillStyle = d.iris; c.beginPath(); c.arc(lx, ly, ir, 0, 7); c.fill();
    c.fillStyle = '#0d0806'; c.beginPath(); c.arc(lx, ly, ir * .55, 0, 7); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(lx - ir * .35, ly - ir * .38, ir * .28, 0, 7); c.fill(); c.beginPath(); c.arc(lx + ir * .35, ly + ir * .3, ir * .12, 0, 7); c.fill();
    // upper lid (skin) coming down
    if (bl > 0) { c.fillStyle = d.skin; c.fillRect(x - rx * 1.2, y - ry * 1.6, rx * 2.4, ry * 2.8 * bl); }
    c.restore();
  }
  // lash line (follows lid)
  c.save(); c.strokeStyle = INK; c.lineCap = 'round'; c.lineWidth = d.lashes ? 3.6 : 3;
  const ly = y - ry * 1.05 + ry * 2.2 * bl;
  c.beginPath(); c.moveTo(x - rx * 1.05, y + (bl > .9 ? ry * .1 : 0)); c.quadraticCurveTo(x - rx * .2, bl > .9 ? y + ry * .9 : ly - ry * .45, x + rx * 1.05, y - ry * .15 + (bl > .9 ? ry * .2 : 0)); c.stroke();
  if (d.lashes && bl < .5) { c.lineWidth = 2; c.beginPath(); c.moveTo(x + rx * sd * .95, y - ry * .2); c.lineTo(x + rx * sd * 1.3, y - ry * .6); c.stroke(); }
  if (bl < .9 && d.old) { c.lineWidth = 1.4; c.strokeStyle = rgba(INK, .5); c.beginPath(); c.moveTo(x - rx * .7, y + ry * .9); c.quadraticCurveTo(x, y + ry * 1.2, x + rx * .6, y + ry * .75); c.stroke(); }
  c.restore();
}

function mouth(d, x, y, r, p, id) {
  const o = clamp(p.mouth), sm = p.smile, w = r * (d.child ? .22 : .26) * (1 + o * .15);
  c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
  if (o < .08) {
    c.strokeStyle = shade(d.lips || d.skin, .55); c.lineWidth = 2.6;
    c.beginPath(); c.moveTo(x - w, y - sm * 4); c.quadraticCurveTo(x, y + sm * 9, x + w, y - sm * 4); c.stroke();
    if (sm > .4) { c.lineWidth = 1.6; c.beginPath(); c.moveTo(x + w + 2, y - sm * 6); c.lineTo(x + w + 5, y - sm * 2); c.stroke(); }
  } else {
    const hgt = 4 + o * r * .32;
    const m = P(q => { q.moveTo(x - w, y - sm * 3); q.quadraticCurveTo(x, y - 3 + sm * 2, x + w, y - sm * 3); q.quadraticCurveTo(x + w * .6, y + hgt + sm * 3, x, y + hgt + sm * 4); q.quadraticCurveTo(x - w * .6, y + hgt + sm * 3, x - w, y - sm * 3); q.closePath(); });
    c.fillStyle = '#4a1a1c'; c.fill(m);
    c.save(); c.clip(m);
    if (o > .35) { c.fillStyle = '#f4eee2'; c.fillRect(x - w, y - 6, w * 2, 5 + o * 2); }
    c.fillStyle = '#b8505a'; c.beginPath(); c.ellipse(x, y + hgt + 2, w * .6, hgt * .45, 0, 0, 7); c.fill();
    c.restore();
    c.strokeStyle = INK; c.lineWidth = 2.2; c.stroke(m);
  }
  c.restore();
}

function beard(d, r, tw, id) {
  const col = d.beard;
  let path;
  if (d.beardShape === 'long') path = P(q => { q.moveTo(-r * .95, -r * .05); q.bezierCurveTo(-r * .95, r * .9, -r * .45 + tw, r * 1.9, tw * .8, r * 2.05); q.bezierCurveTo(r * .45 + tw, r * 1.9, r * .95, r * .9, r * .95, -r * .05); q.bezierCurveTo(r * .7, r * .4, r * .4 + tw, r * .42, tw, r * .5); q.bezierCurveTo(-r * .4 + tw, r * .42, -r * .7, r * .4, -r * .95, -r * .05); q.closePath(); });
  else if (d.beardShape === 'round') path = P(q => { q.moveTo(-r * 1.02, -r * .15); q.bezierCurveTo(-r * 1.15, r * 1.1, -r * .3 + tw, r * 1.5, tw * .8, r * 1.5); q.bezierCurveTo(r * .3 + tw, r * 1.5, r * 1.15, r * 1.1, r * 1.02, -r * .15); q.bezierCurveTo(r * .7, r * .38, r * .4 + tw, r * .42, tw, r * .48); q.bezierCurveTo(-r * .4 + tw, r * .42, -r * .7, r * .38, -r * 1.02, -r * .15); q.closePath(); });
  else path = P(q => { q.moveTo(-r * 1.0, -r * .08); q.bezierCurveTo(-r * 1.0, r * .75, -r * .4 + tw, r * 1.25, tw * .8, r * 1.28); q.bezierCurveTo(r * .4 + tw, r * 1.25, r * 1.0, r * .75, r * 1.0, -r * .08); q.bezierCurveTo(r * .75, r * .36, r * .4 + tw, r * .4, tw, r * .46); q.bezierCurveTo(-r * .4 + tw, r * .4, -r * .75, r * .36, -r * 1.0, -r * .08); q.closePath(); });
  paint(path, col, { lw: 2.4, id: id + 90, tex: .5 });
  // moustache
  paint(P(q => { q.moveTo(-r * .38 + tw, r * .5); q.quadraticCurveTo(tw, r * .34, r * .38 + tw, r * .5); q.quadraticCurveTo(tw, r * .46, -r * .38 + tw, r * .5); }), col, { lw: 2, id: id + 91, tex: .4 });
  c.strokeStyle = rgba(light(col, .35), .5); c.lineWidth = 1.2; for (let k = 0; k < 8; k++) { const bx = -r * .6 + k * r * .17 + tw * .6; c.beginPath(); c.moveTo(bx, r * .7); c.quadraticCurveTo(bx + 2, r * .95, bx - 1, r * 1.12); c.stroke(); }
}

function headwear(d, r, tw, turn, id) {
  if (d.hair === 'tuft') {
    // shaved scalp tint + the little curl (gourra)
    c.save(); c.clip(P(q => q.ellipse(0, -r * .12, r * .99, r * 1.0, 0, Math.PI, 2 * Math.PI))); c.fillStyle = c.createLinearGradient(0, -r * 1.2, 0, -r * .35); c.fillStyle.addColorStop(0, 'rgba(60,50,80,.16)'); c.fillStyle.addColorStop(1, 'rgba(60,50,80,0)'); c.fillRect(-r * 1.2, -r * 1.2, r * 2.4, r); c.restore();
    const tx = tw * .3 + r * .05, ty = -r * 1.1;
    paint(P(q => { q.moveTo(tx - 12, ty + 10); q.bezierCurveTo(tx - 24, ty - 14, tx + 4, ty - 30, tx + 14, ty - 12); q.bezierCurveTo(tx + 20, ty - 2, tx + 4, ty + 6, tx + 2, ty - 6); q.bezierCurveTo(tx, ty - 14, tx + 10, ty - 14, tx + 8, ty - 8); q.bezierCurveTo(tx + 16, ty + 4, tx + 4, ty + 14, tx - 12, ty + 10); q.closePath(); }), '#2a1a14', { lw: 2, id: id + 110, tex: .3 });
  } else if (d.hair === 'scarf') {
    const sc = d.scarf;
    // curls at the temple
    for (const sx of [-1, 1]) { if (sx * turn > .55) continue; const hx = sx * r * .98 + tw * .35;
      paint(P(q => { q.moveTo(hx - sx * r * .3, -r * .55); q.bezierCurveTo(hx + sx * r * .12, -r * .45, hx + sx * r * .14, -r * .05, hx + sx * r * .02, r * .22); q.quadraticCurveTo(hx - sx * r * .06, r * .12, hx - sx * r * .08, r * .26); q.bezierCurveTo(hx - sx * r * .2, 0, hx - sx * r * .16, -r * .3, hx - sx * r * .3, -r * .38); q.closePath(); }), d.curls, { lw: 1.8, id: id + 116 + sx, tex: .3 }); }
    const cap = P(q => { q.moveTo(-r * 1.12, -r * .05); q.bezierCurveTo(-r * 1.3, -r * 1.55, r * 1.3, -r * 1.6, r * 1.12, -r * .05); q.quadraticCurveTo(r * .95 + tw * .3, -r * .5, tw * .4, -r * .56); q.quadraticCurveTo(-r * .95 + tw * .3, -r * .5, -r * 1.12, -r * .05); q.closePath(); });
    paint(cap, sc, { lw: 2.6, id: id + 111, shadow: P(q => q.rect(tw * .4 + (turn >= 0 ? r * .3 : -r * 2), -r * 2, r * 1.7, r * 3)), shadowCol: 'rgba(60,20,70,.18)' });
    // pattern dots + fringe
    c.save(); c.clip(cap); c.fillStyle = d.scarfPat || light(sc, .4);
    for (let k = 0; k < 14; k++) { const a = Math.PI + k / 13 * Math.PI, rx = Math.cos(a) * r * .9 + tw * .2, ry = Math.sin(a) * r * .95 - r * .3; c.beginPath(); c.arc(rx, ry, 4, 0, 7); c.fill(); c.beginPath(); c.arc(rx * .7, ry * .7 - 6, 3, 0, 7); c.fill(); }
    c.restore();
    // knot at the back
    const kx = turn >= 0 ? -r * 1.05 : r * 1.05; paint(P(q => q.ellipse(kx, -r * .5, 14, 18, .5, 0, 7)), shade(sc, .1), { lw: 2.2, id: id + 112 });
  } else if (d.hair === 'turban' || d.hair === 'turbanHood') {
    const col = d.turban;
    const tb = P(q => { q.moveTo(-r * 1.1, -r * .36); q.bezierCurveTo(-r * 1.36, -r * 1.85, r * 1.36, -r * 1.9, r * 1.1, -r * .36); q.quadraticCurveTo(tw * .3, -r * .6, -r * 1.1, -r * .36); q.closePath(); });
    paint(tb, col, { lw: 2.6, id: id + 113, shadow: P(q => q.rect(turn >= 0 ? r * .2 : -r * 2, -r * 2, r * 1.8, r * 2)), shadowCol: 'rgba(70,60,110,.2)' });
    c.save(); c.clip(tb); c.strokeStyle = rgba(shade(col, .35), .7); c.lineWidth = 2;
    for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(-r * 1.2, -r * (.55 + k * .18)); c.quadraticCurveTo(tw * .3, -r * (.9 + k * .16), r * 1.2, -r * (.7 + k * .2)); c.stroke(); }
    c.restore();
  } else if (d.hair === 'cap') {
    paint(P(q => { q.moveTo(-r * 1.0, -r * .5); q.bezierCurveTo(-r * 1.05, -r * 1.5, r * 1.05, -r * 1.5, r * 1.0, -r * .5); q.quadraticCurveTo(0, -r * .66, -r * 1.0, -r * .5); q.closePath(); }), d.cap, { lw: 2.4, id: id + 114 });
    c.fillStyle = '#bdb7ae'; for (const sx of [-1, 1]) { if (sx * turn > .5) continue; c.beginPath(); c.ellipse(sx * r * .92 + tw * .5, -r * .25, 9, 16, 0, 0, 7); c.fill(); }
  } else if (d.hair === 'braids') {
    paint(P(q => { q.moveTo(-r * 1.04, 0); q.bezierCurveTo(-r * 1.2, -r * 1.6, r * 1.2, -r * 1.6, r * 1.04, 0); q.quadraticCurveTo(r * .8, -r * .6, r * .2 + tw * .5, -r * .68); q.quadraticCurveTo(tw * .4, -r * .5, -r * .1 + tw * .5, -r * .7); q.quadraticCurveTo(-r * .8, -r * .6, -r * 1.02, 0); q.closePath(); }), d.hairCol, { lw: 2.4, id: id + 115, tex: .4 });
    c.strokeStyle = rgba('#8a6a5a', .5); c.lineWidth = 1.5; c.beginPath(); c.moveTo(tw * .4, -r * 1.02); c.quadraticCurveTo(tw * .5 + 4, -r * .8, tw * .45, -r * .68); c.stroke();
  }
}

// ------------------------------------------------------------------ props
export function box(x, y, s = 1, open = 0, glowK = 0) {
  c.save(); c.translate(x, y); c.scale(s, s);
  const w = 120, h = 58;
  if (glowK > 0) glow(0, -h, 200 * glowK + 40, '#ffc870', .55 * glowK);
  paint(P(q => q.rect(-w / 2, -h, w, h)), '#8a5530', { lw: 2.6, id: 501, shadow: P(q => q.rect(w * .15, -h, w, h)) });
  c.strokeStyle = '#e0b453'; c.lineWidth = 2; c.strokeRect(-w / 2 + 8, -h + 8, w - 16, h - 16);
  for (let k = 0; k < 5; k++) { c.beginPath(); c.arc(-w / 2 + 20 + k * 20, -h / 2, 5, 0, 7); c.stroke(); }
  c.save(); c.translate(w / 2, -h); c.rotate(-open * 1.9);
  paint(P(q => { q.moveTo(-w, 0); q.lineTo(-w, -12); q.quadraticCurveTo(-w / 2, -26, 0, -12); q.lineTo(0, 0); q.closePath(); }), '#9a6236', { lw: 2.4, id: 502 });
  c.restore();
  c.restore();
}
export function orange(x, y, s = 1, peeled = 0) { c.save(); c.translate(x, y); c.scale(s, s); paint(P(q => q.arc(0, 0, 16, 0, 7)), peeled > .5 ? '#f3b25a' : '#ec8a1e', { lw: 2.2, id: 520, shadow: P(q => q.arc(6, 6, 16, 0, 7)) }); if (peeled > .5) { c.strokeStyle = rgba('#fff', .6); c.lineWidth = 1.5; for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(k) * 14, Math.sin(k) * 14); c.stroke(); } } else { c.fillStyle = '#3f7a2a'; c.beginPath(); c.ellipse(3, -15, 6, 3, .4, 0, 7); c.fill(); } c.restore(); }
export function egg(x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); paint(P(q => q.ellipse(0, 0, 11, 14, 0, 0, 7)), '#f6f0e2', { lw: 2, id: 521, shadow: P(q => q.ellipse(5, 5, 11, 14, 0, 0, 7)) }); c.restore(); }
export function bucket(x, y, s = 1, col = '#8a5a34', water = true) {
  c.save(); c.translate(x, y); c.scale(s, s);
  paint(P(q => { q.moveTo(-40, -70); q.lineTo(40, -70); q.lineTo(32, 0); q.lineTo(-32, 0); q.closePath(); }), col, { lw: 2.4, id: 530, shadow: P(q => q.rect(10, -80, 60, 90)) });
  c.strokeStyle = '#3a2a1a'; c.lineWidth = 4; for (const yy of [-58, -14]) { c.beginPath(); c.moveTo(-40 + (70 + yy) * .11, yy); c.lineTo(40 - (70 + yy) * .11, yy); c.stroke(); }
  if (water) { c.fillStyle = 'rgba(170,210,230,.8)'; c.beginPath(); c.ellipse(0, -70, 38, 8, 0, 0, 7); c.fill(); }
  c.restore();
}
export function planchette(x, y, s = 1, rot = 0) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  paint(P(q => { q.moveTo(-50, -110); q.quadraticCurveTo(0, -150, 50, -110); q.lineTo(50, 60); q.lineTo(-50, 60); q.closePath(); }), '#d9c49a', { lw: 2.4, id: 540 });
  c.strokeStyle = '#3a2a1a'; c.lineWidth = 2; for (let k = 0; k < 7; k++) { c.beginPath(); for (let xx = 36; xx > -36; xx -= 6) c.lineTo(xx, -90 + k * 20 + Math.sin(xx * .6 + k) * 3); c.stroke(); }
  c.restore();
}
export function trap(x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); c.strokeStyle = '#c9773c'; c.lineWidth = 2.5; c.beginPath(); c.arc(0, 0, 26, Math.PI, 0); c.stroke(); for (let k = -3; k <= 3; k++) { c.beginPath(); c.moveTo(k * 8, 0); c.lineTo(k * 6, -Math.sqrt(Math.max(0, 26 * 26 - (k * 8) ** 2)) + 2); c.stroke(); } c.beginPath(); c.moveTo(-28, 0); c.lineTo(28, 0); c.stroke(); c.restore(); }
