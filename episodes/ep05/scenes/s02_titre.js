// s02: title. A zellige rosette blooms in deep indigo; the Arabic title, then the French one caught by a travelling light.
import * as K from '../../../engine/core.js';
import { rosette, goldDust } from '../lib/s02_rosette.js';
const { c, ease, easeOut, clamp, key, rgba, radial, glow, W, H } = K;

/** text revealed by a moving light: settled gold behind the light, bright edge at it, nothing ahead */
function lightText(txt, x, y, font, p, col = '#f0d593') {
  c.save(); c.font = font; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
  const w = c.measureText(txt).width, x0 = x - w / 2 - 40, x1 = x + w / 2 + 40, e = x0 + (x1 - x0) * p;
  const g = c.createLinearGradient(x0, 0, x1, 0), f = (e - x0) / (x1 - x0), f0 = Math.max(0, f - .1), f1 = Math.min(1, f + .035);
  g.addColorStop(0, col); if (f0 > 0) g.addColorStop(f0, col);
  g.addColorStop(clamp(f), '#fffaf0'); g.addColorStop(f1, 'rgba(255,240,200,0)'); if (f1 < 1) g.addColorStop(1, 'rgba(255,240,200,0)');
  c.shadowColor = 'rgba(240,170,70,.55)'; c.shadowBlur = 26; c.fillStyle = g; c.fillText(txt, x, y);
  c.shadowBlur = 0; c.restore();
  // the light itself: a soft flare riding along the letters
  if (p > 0 && p < 1) glow(e, y - 38, 150, '#ffe2a0', .35 * Math.sin(p * Math.PI), 'screen');
  return w;
}

export default {
  noSubs: true, fadeIn: 1.0, fadeOut: .9,
  draw(t, S) {
    // deep indigo night, a warm breath at the centre
    c.fillStyle = '#0b1230'; c.fillRect(0, 0, W, H);
    c.fillStyle = radial(W / 2, 420, 60, 1100, '#1f3a78', 'rgba(11,18,48,0)'); c.fillRect(0, 0, W, H);
    // slow watercolour clouds of violet and teal drifting in the dark
    c.save(); c.globalCompositeOperation = 'screen';
    for (let i = 0; i < 7; i++) {
      const x = K.hash(i, 1) * W + Math.sin(t * .05 + i) * 120 + t * (6 + i * 2), y = 120 + K.hash(i, 2) * 840, r = 260 + K.hash(i, 3) * 320;
      c.fillStyle = radial(x, y, 0, r, rgba(i % 3 ? '#3a2f7a' : '#1f5a70', .22), 'rgba(0,0,0,0)'); c.fillRect(x - r, y - r, r * 2, r * 2);
    }
    c.restore();
    const zoom = 1 + t * .006;
    c.save(); c.translate(W / 2, H / 2); c.scale(zoom, zoom); c.translate(-W / 2, -H / 2);
    // faint zellige lattice in the dark, like tiles seen by moonlight
    c.save(); c.globalAlpha = .05 + .03 * ease(t / 4); c.translate(W / 2, 400); c.rotate(t * .01);
    c.strokeStyle = '#8fb4ff'; c.lineWidth = 1.2;
    for (let i = -6; i <= 6; i++) for (let j = -4; j <= 5; j++) { const p = new Path2D(); K.star8(p, i * 170, j * 170, 70); c.stroke(p); }
    c.restore();

    // the rosette blooms, then settles back to make room for the words
    const bloom = easeOut((t - .3) / 2.8), R = 150;
    rosette(W / 2, 330, R, t, bloom);
    // rays turning behind it
    c.save(); c.globalCompositeOperation = 'screen'; c.translate(W / 2, 330); c.rotate(t * .03);
    for (let i = 0; i < 16; i++) {
      c.rotate(Math.PI / 8); const a = .035 * bloom * (.6 + .4 * Math.sin(t * .8 + i * 1.7));
      const g = c.createLinearGradient(0, 0, 0, -520); g.addColorStop(0, `rgba(240,190,100,${a})`); g.addColorStop(1, 'rgba(240,190,100,0)');
      c.fillStyle = g; c.beginPath(); c.moveTo(-6, -R * .9); c.lineTo(-40, -520); c.lineTo(40, -520); c.lineTo(6, -R * .9); c.fill();
    }
    c.restore();

    // Arabic title, rising gently out of the dark
    const a1 = ease((t - 2.0) / 1.3);
    if (a1 > 0) {
      c.save(); c.globalAlpha = a1; c.font = '700 74px Amiri, serif'; c.textAlign = 'center'; c.direction = 'rtl';
      c.shadowColor = 'rgba(224,165,60,.6)'; c.shadowBlur = 22; c.fillStyle = '#e3b456';
      c.fillText('صندوق العجائب', W / 2, 596 + 14 * (1 - a1)); c.restore();
    }
    // French title, revealed by the travelling light
    const p = clamp((t - 3.1) / 2.3);
    if (p > 0) {
      const w = lightText('La Boîte à Merveilles', W / 2, 738, '118px "IM Fell English", Georgia, serif', ease(p));
      // hairline rule with a lozenge, drawn from the centre outward
      const r = ease((t - 5.0) / 1.1) * (w / 2 - 60);
      if (r > 0) {
        c.save(); c.strokeStyle = rgba('#e0a53c', .75); c.lineWidth = 1.6;
        c.beginPath(); c.moveTo(W / 2 - 22, 790); c.lineTo(W / 2 - 22 - r, 790); c.moveTo(W / 2 + 22, 790); c.lineTo(W / 2 + 22 + r, 790); c.stroke();
        c.fillStyle = '#e0a53c'; c.beginPath(); c.moveTo(W / 2, 780); c.lineTo(W / 2 + 10, 790); c.lineTo(W / 2, 800); c.lineTo(W / 2 - 10, 790); c.fill(); c.restore();
      }
    }
    // episode line
    const a3 = ease((t - 5.6) / 1.1);
    if (a3 > 0) {
      c.save(); c.globalAlpha = a3; c.textAlign = 'center';
      c.font = '30px "IM Fell English", Georgia, serif'; c.letterSpacing = '6px'; c.fillStyle = '#d9cdb2';
      c.fillText('ÉPISODE 5  ·  LE COIFFEUR EST MORT', W / 2, 858 + 8 * (1 - a3)); c.restore();
    }
    c.restore();
    goldDust(t, 70, 0, 0, W, H, .7, 5);
    return { vignette: .7, paper: .22, grade: 'rgba(40,50,120,.25)' };
  },
};
