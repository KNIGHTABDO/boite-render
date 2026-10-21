// s27: end card (copied from ep04 s19_fin). The carved box of wonders closes softly, its last light rises into the zellige rosette; "à suivre…"; credits.
import * as K from '../../../engine/core.js';
import { rosette, goldDust } from '../lib/s02_rosette.js';
const { c, P, paint, ease, easeIO, easeOut, clamp, key, lerp, hash, noise, rgba, radial, glow, W, H, star8, horseshoe } = K;

// ---------------------------------------------------------------- the box, in 3D (X right, Y up, Z away), projected to 2D
const BW = 360, BD = 220, BH = 150, LT = 34;
const YAW = .42, PITCH = .42, F = 2200;
function projector(cx, cy, s) {
  const cy_ = Math.cos(YAW), sy_ = Math.sin(YAW), cp = Math.cos(PITCH), sp = Math.sin(PITCH);
  return ([X, Y, Z]) => {
    const x1 = X * cy_ + Z * sy_, z1 = -X * sy_ + Z * cy_;
    const d = z1 * cp - Y * sp, k = F / (F + d);
    return [cx + x1 * k * s, cy - (Y * cp + z1 * sp) * k * s];
  };
}
const poly = pts => P(q => { pts.forEach((p, i) => i ? q.lineTo(p[0], p[1]) : q.moveTo(p[0], p[1])); q.closePath(); });
const area = pts => { let a = 0; for (let i = 0; i < pts.length; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % pts.length]; a += x0 * y1 - x1 * y0; } return a; };
/** map face-local (u,v) in [0,w]x[0,h] onto a projected quad (p0 origin, p1 = +u, p3 = +v): affine approximation */
function onFace(p0, p1, p3, w, h, f) {
  c.save(); c.transform((p1[0] - p0[0]) / w, (p1[1] - p0[1]) / w, (p3[0] - p0[0]) / h, (p3[1] - p0[1]) / h, p0[0], p0[1]); f(); c.restore();
}
const WOOD = '#8a5530', WOOD_D = '#5e331b', WOOD_L = '#b47a4a', BRASS = '#d9a441';
/** incised line: dark cut + light lip below it (carving) */
function carve(path, lw = 2.2) {
  c.save(); c.lineJoin = c.lineCap = 'round';
  c.translate(.8, 1.2); c.strokeStyle = rgba('#e0a878', .45); c.lineWidth = lw; c.stroke(path);
  c.translate(-.8, -1.2); c.strokeStyle = rgba('#2a1208', .75); c.stroke(path); c.restore();
}
/** carved front panel: chip-carved bands, two horseshoe arches, a brass star in the middle */
function frontCarving(w, h, t) {
  carve(P(q => q.rect(10, 10, w - 20, h - 20)), 2);
  for (const y of [18, h - 18]) carve(P(q => { for (let x = 16; x < w - 16; x += 14) { q.moveTo(x, y - 5); q.lineTo(x + 7, y + 5); q.lineTo(x + 14, y - 5); } }), 1.6);
  for (const cx of [w * .2, w * .8]) {
    carve(P(q => horseshoe(q, cx, h * .47, 22, h - 32)), 2);
    carve(P(q => horseshoe(q, cx, h * .5, 13, h - 38)), 1.4);
  }
  c.save(); c.translate(w / 2, h / 2 + 2);
  paint(P(q => q.arc(0, 0, 30, 0, 7)), '#6a3a1e', { lw: 1.6, id: 850, tex: .5 });
  paint(P(q => star8(q, 0, 0, 24)), BRASS, { lw: 1.4, id: 851, tex: .35 });
  c.fillStyle = rgba('#fff2c0', .5 + .2 * Math.sin(t * 2)); c.beginPath(); c.arc(-5, -6, 4, 0, 7); c.fill();
  c.fillStyle = '#7a4a20'; c.beginPath(); c.arc(0, 0, 6, 0, 7); c.fill();
  c.restore();
  for (const cx of [w * .36, w * .64]) for (const cy of [h * .3, h * .7]) { c.fillStyle = BRASS; c.beginPath(); c.arc(cx, cy, 3, 0, 7); c.fill(); }
}
function sideCarving(w, h) {
  carve(P(q => q.rect(10, 10, w - 20, h - 20)), 2);
  carve(P(q => star8(q, w / 2, h / 2, Math.min(w, h) * .26)), 2);
  carve(P(q => q.arc(w / 2, h / 2, Math.min(w, h) * .12, 0, 7)), 1.4);
}
function lidCarving(w, h) {
  carve(P(q => q.rect(12, 12, w - 24, h - 24)), 2.2);
  carve(P(q => q.rect(24, 24, w - 48, h - 48)), 1.4);
  c.save(); c.translate(w / 2, h / 2);
  for (let i = 0; i < 8; i++) { c.rotate(Math.PI / 4); carve(P(q => { q.moveTo(0, 14); q.lineTo(8, 40); q.lineTo(0, 62); q.lineTo(-8, 40); q.closePath(); }), 1.6); }
  paint(P(q => star8(q, 0, 0, 16)), BRASS, { lw: 1.2, id: 852, tex: .3 });
  c.restore();
  for (const [x, y] of [[40, 40], [w - 40, 40], [40, h - 40], [w - 40, h - 40]]) carve(P(q => star8(q, x, y, 12)), 1.4);
}

/** the whole box. open: lid angle (rad). glowK: light inside. */
function box(cx, cy, s, open, glowK, t) {
  const pr = projector(cx, cy, s);
  const x0 = -BW / 2, x1 = BW / 2, z0 = -BD / 2, z1 = BD / 2, i = 14;
  const V = (X, Y, Z) => pr([X, Y, Z]);
  // soft contact shadow
  c.save(); c.fillStyle = radial(cx, cy + 10 * s, 10, 300 * s, 'rgba(5,2,10,.7)', 'rgba(5,2,10,0)'); c.save(); c.translate(cx, cy + 10 * s); c.scale(1, .35); c.translate(-cx, -cy - 10 * s); c.fillRect(cx - 320 * s, cy - 300 * s, 640 * s, 620 * s); c.restore(); c.restore();

  const gap = Math.sin(clamp(open, 0, 1.6));
  // top rim + dark interior (only matters when the lid is up)
  if (open > .02) {
    paint(poly([V(x0, BH, z0), V(x1, BH, z0), V(x1, BH, z1), V(x0, BH, z1)]), WOOD_L, { lw: 1.8, id: 860, tex: .5 });
    const inner = [V(x0 + i, BH, z0 + i), V(x1 - i, BH, z0 + i), V(x1 - i, BH, z1 - i), V(x0 + i, BH, z1 - i)];
    const hole = poly(inner);
    c.save(); c.clip(hole);
    c.fillStyle = '#2a140c'; c.fill(hole);
    // inner back and left walls, lit from the treasure
    paint(poly([V(x0 + i, BH, z1 - i), V(x1 - i, BH, z1 - i), V(x1 - i, 12, z1 - i), V(x0 + i, 12, z1 - i)]), '#6a3a20', { lw: 1.2, id: 861, tex: .5 });
    paint(poly([V(x0 + i, BH, z0 + i), V(x0 + i, BH, z1 - i), V(x0 + i, 12, z1 - i), V(x0 + i, 12, z0 + i)]), '#4a2614', { lw: 1.2, id: 862, tex: .5 });
    // the treasures: a heap catching light (marbles, rings, buttons)
    const [hx, hy] = V(0, 40, 10);
    for (let k = 0; k < 16; k++) {
      const px = hx + (hash(k, 1) - .5) * 230 * s, py = hy + (hash(k, 2) - .5) * 50 * s, r = (7 + hash(k, 3) * 9) * s;
      const col = ['#d9a441', '#6ab0d0', '#e8dcc4', '#c0583f', '#2a8a66', '#f0e0b0'][k % 6];
      c.fillStyle = col; c.beginPath(); c.arc(px, py, r, 0, 7); c.fill();
      c.fillStyle = rgba('#fffbe8', .7); c.beginPath(); c.arc(px - r * .35, py - r * .35, r * .3, 0, 7); c.fill();
    }
    glow(hx, hy, 260 * s, '#ffc860', .5 * glowK * gap, 'lighter');
    c.restore();
  }
  // outer faces: front and right (the others face away)
  const front = [V(x0, 0, z0), V(x1, 0, z0), V(x1, BH, z0), V(x0, BH, z0)];
  const right = [V(x1, 0, z0), V(x1, 0, z1), V(x1, BH, z1), V(x1, BH, z0)];
  paint(poly(right), WOOD_D, { lw: 2.4, id: 863, tex: .6 });
  onFace(right[3], right[2], right[0], BD, BH, () => sideCarving(BD, BH));
  paint(poly(front), WOOD, { lw: 2.6, id: 864, tex: .6 });
  onFace(front[3], front[2], front[0], BW, BH, () => frontCarving(BW, BH, t));
  // brass corner brackets
  for (const X of [x0, x1]) { const a = V(X, BH, z0), b = V(X, BH - 34, z0), d = V(X + (X < 0 ? 34 : -34), BH, z0); paint(poly([a, b, d]), BRASS, { lw: 1.4, id: 865 + (X < 0 ? 0 : 1), tex: .3 }); }
  // warm light spilling over the lip onto the front face while open
  if (gap > .01) { c.save(); c.clip(poly(front)); const [fx, fy] = V(0, BH, z0); glow(fx, fy, 200 * s, '#ffb040', .35 * glowK * gap, 'screen'); c.restore(); }

  // the lid: a slab hinged on the back top edge
  const L = (X, y, z) => { const ca = Math.cos(open), sa = Math.sin(open); return V(X, BH + y * ca - z * sa, z1 + y * sa + z * ca); };
  const lx0 = x0 - 5, lx1 = x1 + 5, lz = -(BD + 10);
  const faces = [
    { p: [L(lx0, LT, lz), L(lx1, LT, lz), L(lx1, LT, 0), L(lx0, LT, 0)], col: WOOD, top: true },           // outer top
    { p: [L(lx0, 0, lz), L(lx0, 0, 0), L(lx1, 0, 0), L(lx1, 0, lz)], col: '#7a4526', under: true },          // underside
    { p: [L(lx0, 0, lz), L(lx1, 0, lz), L(lx1, LT, lz), L(lx0, LT, lz)], col: WOOD_L },                     // front edge
    { p: [L(lx1, 0, lz), L(lx1, 0, 0), L(lx1, LT, 0), L(lx1, LT, lz)], col: WOOD_D },                       // right edge
    { p: [L(lx0, 0, 0), L(lx1, 0, 0), L(lx1, LT, 0), L(lx0, LT, 0)].reverse(), col: WOOD_D },              // back edge
  ];
  const ref = area(front);        // front face is visible: its winding tells which sign faces us
  for (const f of faces) {
    if (Math.sign(area(f.p)) !== Math.sign(ref)) continue;
    paint(poly(f.p), f.col, { lw: 2.4, id: 870 + faces.indexOf(f), tex: .6 });
    if (f.top) onFace(f.p[3], f.p[2], f.p[0], BW + 10, BD + 10, () => lidCarving(BW + 10, BD + 10));
    if (f.under) { c.save(); c.clip(poly(f.p)); const m = f.p.reduce((a, p) => [a[0] + p[0] / 4, a[1] + p[1] / 4], [0, 0]); glow(m[0], m[1], 260 * s, '#ffc060', .3 * glowK * gap, 'screen'); c.restore(); }
  }
  // brass hasp hanging from the lid front
  const hp = L(0, LT * .5, lz - 1); paint(P(q => q.roundRect(hp[0] - 12 * s, hp[1] - 4 * s, 24 * s, 34 * s, 5 * s)), BRASS, { lw: 1.6, id: 880, tex: .3 });
  c.fillStyle = '#5a3a14'; c.beginPath(); c.arc(hp[0], hp[1] + 20 * s, 3.5 * s, 0, 7); c.fill();
  return { top: V(0, BH, 0), seam: [V(x0, BH, z0), V(x1, BH, z0)], V };
}

// ---------------------------------------------------------------- text helpers
function txt(s, x, y, font, col, a, o = {}) {
  if (a <= 0) return;
  c.save(); c.globalAlpha = clamp(a); c.font = font; c.textAlign = 'center'; c.fillStyle = col;
  if (o.spacing) c.letterSpacing = o.spacing;
  if (o.glow) { c.shadowColor = o.glow; c.shadowBlur = 18; }
  c.fillText(s, x, y); c.restore();
}
const LABEL = '500 22px "IM Fell English", Georgia, serif', VALUE = '46px "IM Fell English", Georgia, serif';
function card(t, a, b, lines) {
  const k = Math.min(ease((t - a) / .7), ease((b - t) / .6)); if (k <= 0) return;
  const rise = (1 - ease((t - a) / .9)) * 10;
  for (const [kind, s] of lines) txt(s, W / 2, kind.y + rise, kind.font, kind.col, k, kind.o || {});
}
const L_ = y => ({ y, font: LABEL, col: '#e0a53c', o: { spacing: '5px' } });
const V_ = y => ({ y, font: VALUE, col: '#f3e6c8' });
const I_ = y => ({ y, font: 'italic 34px "IM Fell English", Georgia, serif', col: '#cdbd9a' });

export default {
  noSubs: true, fadeIn: 1.2, fadeOut: .9,
  draw(t, S) {
    // night room: indigo above, a warm low table below
    c.fillStyle = K.grad(0, 0, 0, H, ['#0a0f26', '#141633', '#22160f']); c.fillRect(0, 0, W, H);
    // lid motion: open, closes softly with a small settle
    const close = easeIO((t - 1.0) / 3.4), settle = Math.sin(clamp((t - 4.4) / .5) * Math.PI) * .03;
    const open = lerp(1.78, 0, close) + settle * (1 - ease((t - 4.9) / .2));
    const glowK = 1 - ease((t - 3.6) / 1.2);
    // camera: the box drifts down and shrinks to make room for the rosette and the words
    const mv = easeIO((t - 4.6) / 2.4);
    const bx = W / 2, by = lerp(760, 905, mv), bs = lerp(1.25, .62, mv) * (1 + t * .004);
    // pool of lamp light on the table
    glow(bx, by - 40, lerp(700, 420, mv), '#ff9a40', .22 + .25 * glowK, 'screen');
    const b = box(bx, by, bs, open, glowK, t);
    // light escaping: rays and rising motes while open; a puff through the seam as it shuts
    const gap = Math.sin(clamp(open, 0, 1.6));
    if (gap > .02) {
      const [tx, ty] = b.top;
      c.save(); c.globalCompositeOperation = 'screen';
      for (let k = 0; k < 7; k++) {
        const a = -Math.PI / 2 + (k - 3) * .16 + Math.sin(t * .6 + k) * .03, len = (380 + 120 * hash(k, 9)) * gap;
        const g = c.createLinearGradient(tx, ty, tx + Math.cos(a) * len, ty + Math.sin(a) * len);
        g.addColorStop(0, `rgba(255,200,110,${.15 * gap * glowK})`); g.addColorStop(1, 'rgba(255,200,110,0)');
        c.fillStyle = g; c.beginPath(); c.moveTo(tx - 50 * gap, ty); c.lineTo(tx + Math.cos(a) * len - 40, ty + Math.sin(a) * len); c.lineTo(tx + Math.cos(a) * len + 40, ty + Math.sin(a) * len); c.lineTo(tx + 50 * gap, ty); c.fill();
      }
      c.restore();
      glow(tx, ty, 320 * gap, '#ffd080', .28 * gap * glowK, 'lighter');
    }
    // seam glow once closed, fading
    const seam = ease((t - 4.0) / .4) * (1 - ease((t - 5.0) / 1.8));
    if (seam > 0) {
      const [[sx0, sy0], [sx1, sy1]] = b.seam;
      c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = rgba('#ffd890', .8 * seam); c.lineWidth = 3; c.shadowColor = '#ffb040'; c.shadowBlur = 20;
      c.beginPath(); c.moveTo(sx0, sy0 - 2); c.lineTo(sx1, sy1 - 2); c.stroke(); c.restore();
    }
    // the escaped motes rise and gather into the rosette
    const RX = W / 2, RY = 262;
    for (let k = 0; k < 40; k++) {
      const st = .4 + hash(k, 4) * 4.2, life = (t - st) / 3.2;
      if (life <= 0 || life >= 1) continue;
      const [tx, ty] = b.top, sx = tx + (hash(k, 5) - .5) * 260 * bs, u = easeIO(life);
      const px = lerp(sx, RX + Math.cos(k * 2.4) * 90 * hash(k, 6), u) + Math.sin(life * 9 + k) * 30 * (1 - u), py = lerp(ty, RY + Math.sin(k * 2.4) * 90 * hash(k, 6), u);
      glow(px, py, 10 + 8 * hash(k, 7), '#ffd88a', .8 * Math.sin(life * Math.PI), 'lighter');
    }
    const bloom = easeOut((t - 5.2) / 2.6);
    rosette(RX, RY, 120, t, bloom);

    // "à suivre…", then the credits in three calm cards
    const a1 = Math.min(ease((t - 6.2) / 1.0), 1 - ease((t - 8.4) / .7));
    txt('à suivre…', W / 2, 590 + (1 - ease((t - 6.2) / 1.2)) * 12, 'italic 76px "IM Fell English", Georgia, serif', '#f0d593', a1, { glow: 'rgba(224,165,60,.5)' });
    card(t, 9.0, 11.6, [[L_(500), "D'APRÈS LE ROMAN D'"], [V_(566), 'Ahmed Sefrioui'], [I_(622), 'La Boîte à Merveilles (1954)']]);
    card(t, 11.5, 14.0, [[L_(478), 'VOIX'], [V_(530), 'Gemini 3.8 Flash TTS'], [L_(600), 'IMAGES'], [V_(652), 'ChatGPT Images']]);
    card(t, 13.9, 16.4, [[L_(478), 'ANIMATION, MUSIQUE ET SONS'], [V_(530), 'composés en code'], [L_(600), 'RÉALISATION'], [V_(652), 'Claude & knightabdo']]);

    goldDust(t, 45, 0, 0, W, H, .45 + .3 * glowK, 11);
    return { vignette: .7, paper: .25, grade: 'rgba(60,40,90,.2)' };
  },
};
