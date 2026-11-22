// Zellige khatem rosette (8-fold star medallion), shared by s02_titre and s14_fin.
// rosette(x, y, R, t, bloom 0..1, {alpha, rot}) draws rings that open from the centre outward.
import * as K from '../../../engine/core.js';
const { c, P, paint, ease, clamp, rgba, glow, ZC, star8 } = K;
const [GREEN, INDIGO, SAFFRON, CREAM, CLAY] = ZC;

/** regular star polygon with n points */
function starN(p, n, ro, ri, rot = 0) {
  for (let k = 0; k < n * 2; k++) { const r = k % 2 ? ri : ro, a = rot + k * Math.PI / n; const X = Math.cos(a) * r, Y = Math.sin(a) * r; k ? p.lineTo(X, Y) : p.moveTo(X, Y); }
  p.closePath();
}
/** kite (petal) pointing outward along angle a, from radius r0 to r1, half-width w at radius rm */
function kite(p, a, r0, rm, r1, w) {
  const ca = Math.cos(a), sa = Math.sin(a), px = -sa, py = ca;
  p.moveTo(ca * r0, sa * r0); p.lineTo(ca * rm + px * w, sa * rm + py * w); p.lineTo(ca * r1, sa * r1); p.lineTo(ca * rm - px * w, sa * rm - py * w); p.closePath();
}

export function rosette(x, y, R, t, bloom = 1, o = {}) {
  const alpha = o.alpha ?? 1; if (alpha <= 0 || bloom <= 0) return;
  const ring = (i, n = 6) => ease(clamp(bloom * n - i));          // staggered ring reveal
  const spin = (o.rot ?? 0) + t * .045;
  c.save(); c.translate(x, y); c.globalAlpha *= alpha;
  // soft golden aura behind the tiles
  glow(0, 0, R * 1.7, '#e0a53c', .22 * ease(bloom), 'screen');
  const lw = Math.max(1.2, R / 120);

  // ring 5: outer 16-point star frame + gold bands (widest, appears last)
  const k5 = ring(5, 6.2);
  if (k5 > 0) {
    c.save(); c.rotate(-spin * .5); c.scale(.85 + .15 * k5, .85 + .15 * k5); c.globalAlpha *= k5;
    paint(P(p => starN(p, 16, R * 1.02, R * .9, Math.PI / 16)), '#123a66', { lw: lw * 1.1, id: 901, tex: .5 });
    paint(P(p => p.arc(0, 0, R * .66, 0, 7)), '#0f2e57', { lw: lw * .7, id: 902, tex: .6 });
    c.strokeStyle = rgba('#e8c06a', .9); c.lineWidth = lw * 1.3; c.beginPath(); c.arc(0, 0, R * .88, 0, 7); c.stroke();
    c.lineWidth = lw * .6; c.beginPath(); c.arc(0, 0, R * .84, 0, 7); c.stroke();
    c.restore();
  }
  // ring 4: sixteen small 8-point stars on the band
  const k4 = ring(4);
  if (k4 > 0) {
    c.save(); c.rotate(-spin * .5); c.globalAlpha *= k4;
    for (let i = 0; i < 16; i++) {
      const a = i * Math.PI / 8 + Math.PI / 16, r = R * (.72 + .03 * (1 - k4));
      const s = R * .085 * (.4 + .6 * k4);
      paint(P(p => star8(p, Math.cos(a) * r, Math.sin(a) * r, s)), i % 2 ? GREEN : SAFFRON, { lw: lw * .8, id: 910 + i, tex: .45 });
      c.fillStyle = CREAM; c.beginPath(); c.arc(Math.cos(a) * r, Math.sin(a) * r, s * .28, 0, 7); c.fill();
    }
    c.restore();
  }
  // ring 3: sixteen long petals, alternating clay and indigo
  const k3 = ring(3);
  if (k3 > 0) {
    c.save(); c.rotate(spin); c.globalAlpha *= k3;
    for (let i = 0; i < 16; i++) {
      const a = i * Math.PI / 8, r1 = R * (.36 + .28 * k3);
      paint(P(p => kite(p, a, R * .3, R * .46, r1, R * .105)), i % 2 ? INDIGO : CLAY, { lw: lw * .9, id: 930 + i, tex: .5 });
      // small cream diamond between petals (the grout rhythm)
      const b = a + Math.PI / 16; paint(P(p => kite(p, b, R * .52, R * .6, R * .68 * (.7 + .3 * k3), R * .035)), CREAM, { lw: lw * .6, id: 990 + i, tex: .3 });
    }
    c.restore();
  }
  // ring 2: cream 16-point star (the ground the petals sit on)
  const k2 = ring(2);
  if (k2 > 0) {
    c.save(); c.rotate(spin); c.globalAlpha *= k2; const s = .6 + .4 * k2;
    paint(P(p => starN(p, 16, R * .4 * s, R * .3 * s)), CREAM, { lw, id: 950, tex: .4 });
    c.restore();
  }
  // ring 1: eight green almond petals
  const k1 = ring(1);
  if (k1 > 0) {
    c.save(); c.rotate(-spin * 1.4); c.globalAlpha *= k1;
    for (let i = 0; i < 8; i++) paint(P(p => kite(p, i * Math.PI / 4, R * .1, R * .22, R * (.12 + .2 * k1), R * .06)), GREEN, { lw: lw * .9, id: 960 + i, tex: .5 });
    c.restore();
  }
  // ring 0: the saffron heart star
  const k0 = ring(0);
  if (k0 > 0) {
    c.save(); c.rotate(spin * 2); c.globalAlpha *= k0;
    paint(P(p => star8(p, 0, 0, R * .15 * k0)), SAFFRON, { lw, id: 970, tex: .4 });
    c.fillStyle = CREAM; c.beginPath(); c.arc(0, 0, R * .045 * k0, 0, 7); c.fill();
    c.restore();
  }
  // a slow glint sweeping over the glaze
  const g = (t * .18) % 1;
  c.save(); c.globalCompositeOperation = 'screen'; c.rotate(-.6);
  const gr = c.createLinearGradient(-R + g * 2.6 * R - .3 * R, 0, -R + g * 2.6 * R + .3 * R, 0);
  gr.addColorStop(0, 'rgba(255,240,200,0)'); gr.addColorStop(.5, `rgba(255,240,200,${.16 * ease(bloom)})`); gr.addColorStop(1, 'rgba(255,240,200,0)');
  c.fillStyle = gr; c.beginPath(); c.arc(0, 0, R * .9, 0, 7); c.fill(); c.restore();
  c.restore();
}

/** floating golden dust with soft bokeh, in screen space */
export function goldDust(t, n, x, y, w, h, a = .6, seed = 3) {
  c.save(); c.globalCompositeOperation = 'screen';
  for (let i = 0; i < n; i++) {
    const hs = K.hash(i, seed), sp = 8 + K.hash(i, seed + 1) * 18;
    const px = x + ((K.hash(i, seed + 2) * w + K.noise(t * .15 + i, seed) * 60) % w + w) % w;
    const py = y + ((K.hash(i, seed + 3) * h - t * sp) % h + h) % h;
    const big = hs > .85, r = big ? 5 + hs * 8 : 1 + hs * 2.4;
    const tw = (.55 + .45 * Math.sin(t * (1.3 + hs * 2) + i * 2.1)) * a * (big ? .35 : 1);
    c.fillStyle = K.radial(px, py, 0, r * 2.2, `rgba(255,214,140,${tw})`, 'rgba(255,214,140,0)');
    c.fillRect(px - r * 2.2, py - r * 2.2, r * 4.4, r * 4.4);
  }
  c.restore();
}
