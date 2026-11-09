// s22 the revision sheet (51.6 s, screenshot-ready: the last frame holds the whole sheet). Paper sheet on the dark desk;
// parts appear with the narration and stay: header (0.8 s), the 4-step chronology with its paintings (8.9 s, one card per
// item), "Le detail a retenir" in three bullets (18.7 / 24.7 / 29.0 s), themes one by one (34.7 s) + the ch. IX teaser (43.4 s).
// The part being read gets a gold frame. Chrono/theme times = enum.json word times (b157/b160); the detail bullets are char estimates. The global enum card is off for fiche scenes (lib/exam.js).
import * as K from '../../../engine/core.js';
import { loadStill } from '../lib/stage.js';
const { c, W, H, clamp, ease } = K;
const SERIF = '"IM Fell English", Georgia, serif';
const PAPER = '#f2e6c8', RED = '#b8322a', INK = '#2a1a10', GOLD = '#e0a53c', BG = '#140e0a';
const LN = [.8, 8.94, 17.21, 34.67];
const CHRONO = [
  { id: 'p01_ete_patio', d: "L'été", t: 'Au mausolée', s: 'les jours de visite, la chaleur', at: 9.06 },
  { id: 'p11_fleurs_terrasse', d: 'Le matin', t: "L'escalier & les fleurs", s: "les jeux et les rêves de l'enfant", at: 11.23 },
  { id: 'p23_course', d: 'Au souk', t: 'La bagarre', s: 'le père contre le dellal', at: 13.39 },
  { id: 'p31_cheval_noir', d: 'La nuit', t: 'Le cauchemar', s: 'le cheval noir, la fièvre', at: 15.29 },
];
const DETAIL = [
  { at: 18.7, html: [['Les bracelets', RED, 'bold'], [' désirés par la mère  →  ', INK], ['« bijoux de mauvais augure »', RED, 'italic']] },
  { at: 24.7, html: [['Le bonheur', INK, 'bold'], ['  se transforme en  ', INK], ['malheur', RED, 'bold']] },
  { at: 29.0, html: [['Sidi Larbi', RED, 'bold'], [' (annoncé chez le barbier, ch. VII)  =  ', INK], ['une seconde femme', RED, 'bold']] },
];
const THEMES = [["l'imaginaire de l'enfant", 35.76], ['la solitude', 38.07], ['le regard des adultes', 39.67], ['la condition de la femme', 41.52]];
const im = {};

function rule(x0, x1, y, col = RED, w = 2) { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke(); }
function heading(txt, x, y, a) { c.globalAlpha = a; c.fillStyle = RED; c.font = `bold 40px ${SERIF}`; c.textAlign = 'left'; c.fillText(txt, x, y); rule(x, x + c.measureText(txt).width, y + 10, RED, 2); c.globalAlpha = 1; }
/** one line of mixed runs [[text, colour, style]] */
function runs(rs, x, y, size) {
  for (const [s, col, st = ''] of rs) { c.font = `${st} ${size}px ${SERIF}`; c.fillStyle = col; c.fillText(s, x, y); x += c.measureText(s).width; }
}
/** gold frame round the part being read */
function focus(x, y, w, h, t, t0, t1) {
  const a = clamp((t - t0) / .4) * (1 - clamp((t - t1 + .4) / .4)); if (a <= 0) return;
  c.save(); c.globalAlpha = a; c.strokeStyle = GOLD; c.lineWidth = 5; c.setLineDash([]); c.strokeRect(x, y, w, h); c.restore();
}

export default {
  async preload() { for (const p of CHRONO) im[p.id] = await loadStill(p.id); },
  draw(t) {
    c.fillStyle = BG; c.fillRect(0, 0, W, H);
    // the sheet slides up and settles
    const s0 = ease(clamp(t / .7));
    c.save(); c.translate(0, (1 - s0) * 60); c.globalAlpha = s0;
    c.fillStyle = PAPER; c.fillRect(60, 30, W - 120, H - 60);
    c.strokeStyle = 'rgba(42,26,16,.35)'; c.lineWidth = 2; c.strokeRect(78, 48, W - 156, H - 96);
    c.restore();
    c.textBaseline = 'alphabetic';
    // ---- header
    const h = ease(clamp((t - LN[0]) / .5));
    if (h > 0) {
      c.save(); c.globalAlpha = h; c.textAlign = 'center';
      c.fillStyle = INK; c.font = `bold 58px ${SERIF}`; c.fillText('Fiche de révision — Chapitre VIII', W / 2, 100);
      c.fillStyle = RED; c.font = `italic 34px ${SERIF}`; c.fillText('Les bracelets soleil et lune, en quatre temps', W / 2, 142);
      c.restore();
    }
    // ---- chronology: four cards, a painting each, joined by arrows
    if (t > LN[1] - .3) heading('Chronologie', 120, 198, ease(clamp((t - LN[1] + .3) / .4)));
    const cw = 400, gap = 40, cx0 = (W - 4 * cw - 3 * gap) / 2, cy = 218, ph = 150;
    CHRONO.forEach((p, i) => {
      const k = ease(clamp((t - p.at) / .4)); if (k <= 0) return;
      const x = cx0 + i * (cw + gap);
      c.save(); c.globalAlpha = k; c.translate(0, (1 - k) * 20);
      c.fillStyle = '#fbf3de'; c.fillRect(x, cy, cw, ph + 110); c.strokeStyle = 'rgba(42,26,16,.4)'; c.lineWidth = 2; c.strokeRect(x, cy, cw, ph + 110);
      const img = im[p.id];
      if (img) { const iw = img.naturalWidth, ih = img.naturalHeight, z = Math.max(cw / iw, ph / ih); c.save(); c.beginPath(); c.rect(x, cy, cw, ph); c.clip(); c.drawImage(img, x + cw / 2 - iw * z / 2, cy + ph / 2 - ih * z / 2, iw * z, ih * z); c.restore(); }
      c.fillStyle = RED; c.fillRect(x, cy, 150, 42); c.fillStyle = PAPER; c.font = `bold 28px ${SERIF}`; c.textAlign = 'center'; c.fillText(p.d, x + 75, cy + 31);
      c.textAlign = 'left'; c.fillStyle = INK; c.font = `bold 30px ${SERIF}`; c.fillText(p.t, x + 14, cy + ph + 44);
      c.fillStyle = '#5a4030'; c.font = `italic 25px ${SERIF}`; c.fillText(p.s, x + 14, cy + ph + 84);
      if (i < 3) { c.fillStyle = RED; c.font = `bold 40px ${SERIF}`; c.textAlign = 'center'; c.fillText('→', x + cw + gap / 2, cy + ph / 2 + 14); }
      c.restore();
      focus(x - 6, cy - 6, cw + 12, ph + 122, t, p.at, i < 3 ? CHRONO[i + 1].at : LN[2]);
    });
    // ---- the detail to remember
    const dy = 530;
    if (t > LN[2] - .2) {
      const a = ease(clamp((t - LN[2] + .2) / .4));
      heading('Le détail à retenir', 120, dy, a);
      c.save(); c.globalAlpha = a; c.fillStyle = 'rgba(184,50,42,.08)'; c.fillRect(110, dy + 22, W - 220, 196); c.fillStyle = RED; c.fillRect(110, dy + 22, 8, 196); c.restore();
    }
    DETAIL.forEach((d, i) => {
      const k = ease(clamp((t - d.at) / .4)); if (k <= 0) return;
      c.save(); c.globalAlpha = k; c.textAlign = 'left';
      runs([['•  ', RED, 'bold'], ...d.html], 140 + (1 - k) * 20, dy + 80 + i * 60, 34);
      c.restore();
    });
    focus(104, dy - 40, W - 208, 268, t, LN[2], LN[3] - .3);
    // ---- themes (one by one, two columns), then the ch. IX teaser
    const ty = 800;
    if (t > LN[3] - .2) heading('Thèmes', 120, ty, ease(clamp((t - LN[3] + .2) / .4)));
    THEMES.forEach(([s, at], i) => {
      const k = ease(clamp((t - at) / .4)); if (k <= 0) return;
      c.save(); c.globalAlpha = k; c.textAlign = 'left'; c.fillStyle = INK; c.font = `32px ${SERIF}`;
      c.fillText('•  ' + s, 130 + (i % 2) * 560 + (1 - k) * 16, ty + 58 + Math.floor(i / 2) * 50); c.restore();
    });
    focus(104, ty - 44, 1140, 200, t, LN[3], 43.3);
    const tz = ease(clamp((t - 43.3) / .6));
    if (tz > 0) {
      c.save(); c.globalAlpha = tz; c.fillStyle = INK; c.fillRect(1290, ty - 40, 510, 190);
      c.textAlign = 'center'; c.fillStyle = GOLD; c.font = `bold 30px ${SERIF}`; c.fillText('Au chapitre IX', 1545, ty + 8);
      c.fillStyle = PAPER; c.font = `italic 36px ${SERIF}`; c.fillText("l'enfant malade", 1545, ty + 62);
      const k2 = ease(clamp((t - 46.6) / .6)); c.globalAlpha = tz * k2; c.font = `italic 30px ${SERIF}`; c.fillText('une maison qui ne dort plus', 1545, ty + 112);
      c.restore();
    }
    return { vignette: .35, paper: .3, letterbox: false };
  },
};
