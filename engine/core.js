// Core drawing kit for La Boîte à Merveilles.
// Everything is drawn in a 1920x1080 design space; film.html scales the canvas.
export const W = 1920, H = 1080, FPS = 24;
export const INK = '#1f1612';

export let c;          // the 2D context everyone draws into
export let T = 0;      // global film time (s)
export let BOIL = 0;   // line-boil index: changes 8x/s, like redrawn animation frames
export function setCtx(ctx) { c = ctx; }
export function setTime(t) { T = t; BOIL = Math.floor(t * 8) % 4; }

// ---------------------------------------------------------------- math
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a, b, k) => a + (b - a) * k;
export const ease = x => { x = clamp(x); return x * x * (3 - 2 * x); };
export const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
export const easeIn = x => Math.pow(clamp(x), 3);
export const easeIO = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
export const hash = (a, b = 0) => { const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return x - Math.floor(x); };
/** smooth 1D value noise in [-1,1] */
export function noise(x, seed = 0) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i, seed), hash(i + 1, seed), u) * 2 - 1; }
/** window: 0 before a, ramps to 1 over `f` s, back to 0 at b */
export const win = (t, a, b, f = .5) => clamp(Math.min((t - a) / f, (b - t) / f));
/** keyframes: k(t, [[t0,v0],[t1,v1],...], easing) */
export function key(t, ks, e = easeIO) {
  if (t <= ks[0][0]) return ks[0][1];
  for (let i = 1; i < ks.length; i++) if (t < ks[i][0]) { const [a, va] = ks[i - 1], [b, vb] = ks[i]; return lerp(va, vb, e((t - a) / (b - a))); }
  return ks[ks.length - 1][1];
}
export const P = f => { const p = new Path2D(); f(p); return p; };

// ---------------------------------------------------------------- colour
export function mix(a, b, k) {
  const pa = hex(a), pb = hex(b);
  return `rgb(${pa.map((v, i) => Math.round(lerp(v, pb[i], k))).join(',')})`;
}
function hex(h) { if (h.startsWith('rgb')) return h.match(/\d+/g).slice(0, 3).map(Number); h = h.replace('#', ''); if (h.length === 3) h = [...h].map(x => x + x).join(''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); }
export const rgba = (h, a) => { const p = hex(h); return `rgba(${p[0]},${p[1]},${p[2]},${a})`; };
export const shade = (h, k) => mix(h, '#1a1030', k);   // cool, violet shadows (painterly, never grey)
export const light = (h, k) => mix(h, '#fff4dc', k);

// ---------------------------------------------------------------- textures (built once)
function mk(w, h, f) { const cv = new OffscreenCanvas(w, h), g = cv.getContext('2d'); f(g, w, h); return cv; }
let TEX = null;
export function textures() {
  if (TEX) return TEX;
  const rnd = mulberry(7);
  // paper: fibres + grain, used with multiply over the whole frame
  const paper = mk(W + 64, H + 64, (g, w, h) => {
    const im = g.createImageData(w, h);
    for (let i = 0; i < im.data.length; i += 4) { const v = 236 + rnd() * 19; im.data[i] = v; im.data[i + 1] = v - 2; im.data[i + 2] = v - 8; im.data[i + 3] = 255; }
    g.putImageData(im, 0, 0);
    g.strokeStyle = 'rgba(110,80,50,.10)';
    for (let i = 0; i < 1400; i++) { g.lineWidth = rnd() * 1.2 + .2; g.beginPath(); const x = rnd() * w, y = rnd() * h; g.moveTo(x, y); g.quadraticCurveTo(x + rnd() * 20 - 10, y + rnd() * 8 - 4, x + rnd() * 30 - 15, y + rnd() * 10 - 5); g.stroke(); }
  });
  // watercolour wash: blotchy pigment pooling, used with multiply inside shapes
  const wash = mk(1024, 1024, (g, w, h) => {
    g.fillStyle = '#fff'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 520; i++) {
      const x = rnd() * w, y = rnd() * h, r = 8 + rnd() * 60, a = .012 + rnd() * .03;
      const gr = g.createRadialGradient(x, y, r * .2, x, y, r); gr.addColorStop(0, `rgba(90,60,70,${a})`); gr.addColorStop(.85, `rgba(90,60,70,${a * .6})`); gr.addColorStop(1, `rgba(60,40,50,${a * 1.8})`);
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
    }
    for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(60,40,40,${rnd() * .06})`; g.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 2, 1 + rnd() * 2); }
  });
  // dry-brush hatching for shadows
  const hatch = mk(512, 512, (g, w, h) => {
    g.strokeStyle = 'rgba(30,20,40,.22)'; g.lineCap = 'round';
    for (let i = 0; i < 700; i++) { const x = rnd() * w, y = rnd() * h, l = 6 + rnd() * 16; g.lineWidth = .6 + rnd(); g.beginPath(); g.moveTo(x, y); g.lineTo(x + l * .7, y - l * .7); g.stroke(); }
  });
  // film grain frames (4, cycled)
  const grain = [0, 1, 2, 3].map(() => mk(480, 270, (g, w, h) => {
    const im = g.createImageData(w, h);
    for (let i = 0; i < im.data.length; i += 4) { const v = rnd() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 20; }
    g.putImageData(im, 0, 0);
  }));
  TEX = { paper, wash, hatch, grain, washPat: null, hatchPat: null };
  return TEX;
}
export function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// ---------------------------------------------------------------- the painting primitives
/**
 * Paint a shape the way the whole film is painted: flat colour, watercolour wash texture,
 * optional cel shadow (a second path) and a boiling hand-inked outline.
 *   fill(path, colour, {ink, lw, id, shadow, shadowCol, tex, alpha})
 */
export function paint(path, col, o = {}) {
  const tx = textures();
  if (!tx.washPat) { tx.washPat = c.createPattern(tx.wash, 'repeat'); tx.hatchPat = c.createPattern(tx.hatch, 'repeat'); }
  c.save();
  if (o.alpha != null) c.globalAlpha *= o.alpha;
  if (col) {
    c.fillStyle = col; c.fill(path);
    if (o.tex !== false) {
      c.save(); c.clip(path); c.globalCompositeOperation = 'multiply'; c.globalAlpha *= (o.tex ?? .55);
      const id = o.id ?? 0; c.translate(-(hash(id, 3) * 900), -(hash(id, 4) * 900));
      c.fillStyle = tx.washPat; c.fillRect(0, 0, 3000, 3000); c.restore();
    }
    if (o.shadow) {
      c.save(); c.clip(path); c.fillStyle = o.shadowCol || 'rgba(40,20,70,.28)'; c.fill(o.shadow);
      if (o.hatch) { c.clip(o.shadow); c.fillStyle = tx.hatchPat; c.fillRect(-2000, -2000, 6000, 6000); }
      c.restore();
    }
    if (o.rim) { c.save(); c.clip(path); c.globalCompositeOperation = 'screen'; c.fillStyle = o.rim; c.fill(o.rimPath); c.restore(); }
  }
  if (o.ink !== false) ink(path, o.lw ?? 2.6, o.id ?? 0, o.inkCol);
  c.restore();
}
/** boiling ink line: main stroke + a thinner offset stroke that jitters 8x/s */
export function ink(path, lw = 2.6, id = 0, col = INK) {
  c.save(); c.lineJoin = 'round'; c.lineCap = 'round'; c.strokeStyle = col;
  const s = c.getTransform().a || 1, k = 1 / Math.max(.35, Math.sqrt(Math.abs(s)));   // keep lines readable when scaled
  c.lineWidth = lw * k; c.stroke(path);
  c.translate((hash(id, BOIL) - .5) * 2.2 * k, (hash(id + 9, BOIL) - .5) * 2.2 * k);
  c.globalAlpha *= .35; c.lineWidth = lw * .5 * k; c.stroke(path);
  c.restore();
}
export function line(pts, lw = 2.4, id = 0, col = INK) { ink(P(p => { p.moveTo(...pts[0]); for (let i = 1; i < pts.length; i++) p.lineTo(...pts[i]); }), lw, id, col); }

export function grad(x0, y0, x1, y1, stops) { const g = c.createLinearGradient(x0, y0, x1, y1); stops.forEach((s, i) => Array.isArray(s) ? g.addColorStop(s[0], s[1]) : g.addColorStop(i / (stops.length - 1), s)); return g; }
export function radial(x, y, r0, r1, a, b) { const g = c.createRadialGradient(x, y, r0, x, y, r1); g.addColorStop(0, a); g.addColorStop(1, b); return g; }

// ---------------------------------------------------------------- Moroccan ornament
export function horseshoe(p, cx, cy, r, bottom, a = .38) { const jx = r * Math.cos(a); p.moveTo(cx - jx, bottom); p.lineTo(cx - jx, cy + r * Math.sin(a)); p.arc(cx, cy, r, Math.PI - a, 2 * Math.PI + a); p.lineTo(cx + jx, bottom); p.closePath(); }
export function star8(p, x, y, r) { for (const o of [0, Math.PI / 4]) { for (let k = 0; k < 4; k++) { const an = o + k * Math.PI / 2 + Math.PI / 4, X = x + Math.cos(an) * r, Y = y + Math.sin(an) * r; k ? p.lineTo(X, Y) : p.moveTo(X, Y); } p.closePath(); } }
export const ZC = ['#2a8a66', '#1d4e89', '#d9a441', '#f3ecdc', '#b8452f'];
export function zellige(x0, y0, w, h, s, seed = 0, dim = 0) {
  c.save(); c.beginPath(); c.rect(x0, y0, w, h); c.clip();
  c.fillStyle = shade('#efe4cf', dim); c.fillRect(x0, y0, w, h);
  for (let y = y0 + s / 2, j = 0; y < y0 + h + s; y += s, j++) for (let x = x0 + s / 2, i = 0; x < x0 + w + s; x += s, i++) {
    const p = P(q => star8(q, x, y, s * .46)); c.fillStyle = shade(ZC[(i + j * 2 + seed) % 5], dim); c.fill(p);
    c.fillStyle = shade('#f3ecdc', dim); c.beginPath(); c.arc(x, y, s * .13, 0, 7); c.fill();
  }
  c.strokeStyle = rgba(INK, .45); c.lineWidth = 1;
  for (let y = y0; y < y0 + h; y += s) { c.beginPath(); c.moveTo(x0, y); c.lineTo(x0 + w, y); c.stroke(); }
  c.restore(); ink(P(p => p.rect(x0, y0, w, h)), 2, seed);
}

// ---------------------------------------------------------------- atmosphere
/** god-ray / light shaft */
export function shaft(x0, y0, x1, y1, w0, w1, col, a) {
  c.save(); c.globalCompositeOperation = 'screen';
  const g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, rgba(col, a)); g.addColorStop(1, rgba(col, 0));
  c.fillStyle = g; c.beginPath(); c.moveTo(x0 - w0 / 2, y0); c.lineTo(x0 + w0 / 2, y0); c.lineTo(x1 + w1 / 2, y1); c.lineTo(x1 - w1 / 2, y1); c.closePath(); c.fill(); c.restore();
}
export function glow(x, y, r, col, a = 1, op = 'lighter') { r = Math.max(1, r); c.save(); c.globalCompositeOperation = op; c.fillStyle = radial(x, y, 0, r, rgba(col, a), rgba(col, 0)); c.fillRect(x - r, y - r, r * 2, r * 2); c.restore(); }
/** dust motes drifting in light */
export function dust(t, n, x, y, w, h, col = '#fff1c8', a = .7, seed = 1) {
  for (let i = 0; i < n; i++) {
    const px = x + ((hash(i, seed) * w + t * (6 + hash(i, seed + 1) * 10) + noise(t * .3 + i, seed) * 30) % w + w) % w;
    const py = y + ((hash(i, seed + 2) * h - t * (3 + hash(i, seed + 3) * 6) + noise(t * .25 + i, seed + 5) * 20) % h + h) % h;
    const tw = .5 + .5 * Math.sin(t * 2 + i);
    c.fillStyle = rgba(col, a * tw); c.beginPath(); c.arc(px, py, .8 + hash(i, seed + 4) * 2.2, 0, 7); c.fill();
  }
}
/** rising smoke / steam ribbon */
export function smoke(t, x, y, hgt, col, a = .35, width = 1, seed = 0) {
  c.save(); c.lineCap = 'round';
  for (let k = 0; k < 5; k++) {
    c.strokeStyle = rgba(col, a * (1 - k * .16)); c.lineWidth = (14 - k * 2.4) * width; c.beginPath();
    for (let s = 0; s <= hgt; s += 8) {
      const X = x + noise(s * .012 - t * .5 + k * .7, seed) * (10 + s * .22) * width + Math.sin(s * .02 + t * 1.2 + k) * 4, Y = y - s;
      s ? c.lineTo(X, Y) : c.moveTo(X, Y);
    }
    c.stroke();
  }
  c.restore();
}
/** soft cloud of steam puffs */
export function steam(t, n, x, y, w, h, a = .25, seed = 3) {
  c.save(); c.globalCompositeOperation = 'screen';
  for (let i = 0; i < n; i++) {
    const life = (t * (.05 + hash(i, seed) * .05) + hash(i, seed + 1)) % 1;
    const px = x + hash(i, seed + 2) * w + noise(t * .2 + i, seed) * 80, py = y + h - life * h * 1.2, r = 60 + hash(i, seed + 3) * 160 + life * 120;
    c.fillStyle = radial(px, py, 0, r, `rgba(235,235,240,${a * Math.sin(life * Math.PI)})`, 'rgba(235,235,240,0)');
    c.fillRect(px - r, py - r, r * 2, r * 2);
  }
  c.restore();
}

// ---------------------------------------------------------------- camera
/** cam({x,y,z,rot}) around a focus point in design space. Adds tiny handheld drift. */
export function camera(o, drift = 1) {
  const z = o.z ?? 1, x = (o.x ?? W / 2) + noise(T * .35, 11) * 3 * drift, y = (o.y ?? H / 2) + noise(T * .3, 12) * 2.5 * drift;
  c.translate(W / 2, H / 2); c.rotate((o.rot ?? 0) + noise(T * .2, 13) * .0015 * drift); c.scale(z, z); c.translate(-x, -y);
}
/** parallax layer helper: draw f() shifted by depth relative to camera x/y */
export function layer(camX, camY, depth, f) { c.save(); c.translate(-(camX - W / 2) * (depth - 1), -(camY - H / 2) * (depth - 1)); f(); c.restore(); }
export function blurred(px, f) { if (px <= .3) return f(); c.save(); c.filter = `blur(${px}px)`; f(); c.restore(); }

// ---------------------------------------------------------------- finishing
export function finish(opts = {}) {
  const tx = textures();
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  const s = c.canvas.width / W; c.scale(s, s);
  if (opts.grade) { c.globalCompositeOperation = opts.gradeOp || 'soft-light'; c.fillStyle = opts.grade; c.fillRect(0, 0, W, H); c.globalCompositeOperation = 'source-over'; }
  c.globalCompositeOperation = 'multiply'; c.globalAlpha = opts.paper ?? .5; c.drawImage(tx.paper, -(BOIL * 17 % 64), -(BOIL * 11 % 64)); c.globalAlpha = 1;
  c.globalCompositeOperation = 'overlay'; c.drawImage(tx.grain[BOIL], 0, 0, W, H); c.globalCompositeOperation = 'source-over';
  c.fillStyle = radial(W / 2, H / 2, H * .42, H * 1.02, 'rgba(10,5,15,0)', `rgba(10,5,15,${opts.vignette ?? .5})`); c.fillRect(0, 0, W, H);
  if (opts.fade) { c.fillStyle = `rgba(0,0,0,${clamp(opts.fade)})`; c.fillRect(0, 0, W, H); }
  if (opts.white) { c.fillStyle = `rgba(255,248,235,${clamp(opts.white)})`; c.fillRect(0, 0, W, H); }
  c.restore();
}
export function letterbox(k = 1) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); const s = c.canvas.width / W; c.scale(s, s); const b = 70 * k; c.fillStyle = '#000'; c.fillRect(0, 0, W, b); c.fillRect(0, H - b, W, b); c.restore(); }

/** subtitles: italic, bottom centre, speaker-tinted */
const SUBCOL = { narrator: '#fbf3e0', mohammed: '#ffe6a8', zoubida: '#ffc9b8', father: '#d6e6ff', rahma: '#ffb3c4', chouafa: '#c9f0dc',
  aicha: '#f5c6f0', fatma: '#d8f0b0', moqadma: '#bfe4ff', driss: '#ffd9a0', allal: '#e0d0b8', moineau1: '#fff2a0', moineau2: '#fff2a0', femmes: '#ffd6c8', kanza: '#c9f0dc', aveugle: '#e8dcc0' };
export function subtitle(text, who, a) {
  if (a <= 0 || !text) return;
  text = text.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); const s = c.canvas.width / W; c.scale(s, s);
  c.globalAlpha = clamp(a); c.font = 'italic 44px "IM Fell English", Georgia, serif'; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
  const lines = wrap(text, 1500); let y = H - 70 - (lines.length - 1) * 52;
  for (const l of lines) { c.lineWidth = 7; c.lineJoin = 'round'; c.strokeStyle = 'rgba(10,6,4,.78)'; c.strokeText(l, W / 2, y); c.fillStyle = SUBCOL[who] || '#fbf3e0'; c.fillText(l, W / 2, y); y += 52; }
  c.restore();
}
function wrap(text, max) {
  const words = text.split(' '), out = []; let cur = '';
  for (const w of words) { const t = cur ? cur + ' ' + w : w; if (c.measureText(t).width > max && cur) { out.push(cur); cur = w; } else cur = t; }
  if (cur) out.push(cur);
  return out;
}
