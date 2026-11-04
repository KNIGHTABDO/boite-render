// s28 end card (8 s, no voice). Night indigo; the zellige rosette blooms at the top; "à suivre…"; the next episode
// (chapter VIII, the secret of Lalla Aïcha); then the two calls: TikTok @la.boite.a.bac and the WhatsApp community.
import * as K from '../../../engine/core.js';
import { rosette, goldDust } from '../lib/s02_rosette.js';
const { c, W, H, clamp, ease } = K;
const SERIF = '"IM Fell English", Georgia, serif';
const PAPER = '#f2e6c8', GOLD = '#e0a53c', RED = '#b8322a';

function txt(s, x, y, font, col, a) { if (a <= 0) return; c.save(); c.globalAlpha = a; c.font = font; c.fillStyle = col; c.textAlign = 'center'; c.fillText(s, x, y); c.restore(); }
function pill(x, y, w, h, a, col) { c.save(); c.globalAlpha = a; c.fillStyle = col; c.beginPath(); c.roundRect(x, y, w, h, h / 2); c.fill(); c.restore(); }

export default {
  async preload() {},
  draw(t) {
    c.fillStyle = K.grad(0, 0, 0, H, ['#0a0f26', '#141633', '#22160f']); c.fillRect(0, 0, W, H);
    rosette(W / 2, 220, 120, t, ease(clamp(t / 1.6)));
    txt('à suivre…', W / 2, 440 + (1 - ease(clamp((t - .6) / 1))) * 12, `italic 64px ${SERIF}`, '#f0d593', ease(clamp((t - .6) / .8)));
    const n = ease(clamp((t - 1.6) / .7));
    txt('Prochain épisode — Chapitre VIII', W / 2, 540, `bold 46px ${SERIF}`, PAPER, n);
    txt('Le secret de Lalla Aïcha', W / 2, 600, `italic 40px ${SERIF}`, GOLD, n);
    // the two calls, side by side
    const a1 = ease(clamp((t - 2.8) / .6)), a2 = ease(clamp((t - 3.4) / .6));
    const y = 700, w = 720, h = 210, x1 = W / 2 - w - 30, x2 = W / 2 + 30;
    pill(x1, y, w, h, .9 * a1, 'rgba(242,230,200,.08)'); pill(x2, y, w, h, .9 * a2, 'rgba(242,230,200,.08)');
    txt('TikTok', x1 + w / 2, y + 62, `bold 40px ${SERIF}`, RED, a1);
    txt('@la.boite.a.bac', x1 + w / 2, y + 125, `bold 52px ${SERIF}`, PAPER, a1);
    txt('les extraits du bac, chaque semaine', x1 + w / 2, y + 172, `italic 28px ${SERIF}`, '#c8b890', a1);
    txt('Communauté WhatsApp', x2 + w / 2, y + 62, `bold 40px ${SERIF}`, '#3fa45a', a2);
    txt('chat.whatsapp.com/JM6fSLZvAKqHV95joZuy4e', x2 + w / 2, y + 120, `30px ${SERIF}`, PAPER, a2);
    txt('lien dans la description', x2 + w / 2, y + 172, `italic 28px ${SERIF}`, '#c8b890', a2);
    goldDust(t, 40, 0, 0, W, H, .5, 7);
    // fade out on the last half second
    const f = clamp((t - 7.4) / .6); if (f > 0) { c.fillStyle = `rgba(0,0,0,${f})`; c.fillRect(0, 0, W, H); }
    return { vignette: .6, paper: .2, letterbox: false };
  },
};
