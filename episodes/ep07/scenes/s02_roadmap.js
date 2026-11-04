// s02 roadmap (4 s title): three painted panels slam in one per bendir hit (0.2 / 1.4 / 2.6 s), numbered parts of the episode,
// then "Fiche de révision à la fin" under them. The panels reuse this episode's own paintings, framed on their subject.
import * as K from '../../../engine/core.js';
import { loadStill } from '../lib/stage.js';
const { c, W, H, clamp, ease } = K;
const SERIF = '"IM Fell English", Georgia, serif';
const P = [
  { id: 'i_grappes_tambourins', n: '1', t: 'Tambourins et lustres', at: .2 },
  { id: 'p04_souk_foule', n: '2', t: 'Le souk et le barbier', at: 1.4 },
  { id: 'i_flash_facade', n: '3', t: "La nuit de l'Achoura", at: 2.6 },
];
const im = {};
export default {
  async preload() { for (const p of P) im[p.id] = await loadStill(p.id); },
  draw(t) {
    c.fillStyle = '#140e0a'; c.fillRect(0, 0, W, H);
    const pw = 520, ph = 640, gap = 60, x0 = (W - 3 * pw - 2 * gap) / 2, y0 = 150;
    P.forEach((p, i) => {
      const k = clamp((t - p.at) / .28); if (k <= 0) return;
      const s = 1.18 - .18 * ease(k), x = x0 + i * (pw + gap), cx = x + pw / 2, cy = y0 + ph / 2;
      c.save(); c.globalAlpha = k; c.translate(cx, cy); c.rotate((i - 1) * .025 * (1 - k * .4)); c.scale(s, s); c.translate(-cx, -cy);
      c.fillStyle = '#f2e6c8'; c.fillRect(x - 14, y0 - 14, pw + 28, ph + 28 + 96);   // paper mount
      const img = im[p.id];
      if (img) { const iw = img.naturalWidth, ih = img.naturalHeight, z = Math.max(pw / iw, ph / ih) * (1.08 + .05 * clamp((t - p.at) / 3)); c.save(); c.beginPath(); c.rect(x, y0, pw, ph); c.clip(); c.drawImage(img, cx - iw * z / 2, cy - ih * z / 2, iw * z, ih * z); c.restore(); }
      c.fillStyle = '#b8322a'; c.font = `bold 64px ${SERIF}`; c.textAlign = 'left'; c.fillText(p.n, x + 4, y0 + ph + 72);
      c.fillStyle = '#2a1a10'; c.font = `bold 36px ${SERIF}`; c.fillText(p.t, x + 60, y0 + ph + 64);
      c.restore();
    });
    const k = clamp((t - 3.2) / .4);
    if (k > 0) { c.save(); c.globalAlpha = k; c.fillStyle = '#e0a53c'; c.font = `italic 40px ${SERIF}`; c.textAlign = 'center'; c.fillText('+ Fiche de révision à la fin', W / 2, H - 80); c.restore(); }
    return { vignette: .45, paper: .3, letterbox: false };
  },
};
