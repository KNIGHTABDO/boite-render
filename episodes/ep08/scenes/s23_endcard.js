// s23 end card (8 s, no voice). Night indigo; the zellige rosette blooms at the top; "à suivre…"; the next episode
// (chapter IX: the sick child, a house that no longer sleeps). No social calls (user rule: no TikTok / WhatsApp).
import * as K from '../../../engine/core.js';
import { rosette, goldDust } from '../lib/s02_rosette.js';
const { c, W, H, clamp, ease } = K;
const SERIF = '"IM Fell English", Georgia, serif';
const PAPER = '#f2e6c8', GOLD = '#e0a53c';

function txt(s, x, y, font, col, a) { if (a <= 0) return; c.save(); c.globalAlpha = a; c.font = font; c.fillStyle = col; c.textAlign = 'center'; c.fillText(s, x, y); c.restore(); }

export default {
  async preload() {},
  draw(t) {
    c.fillStyle = K.grad(0, 0, 0, H, ['#0a0f26', '#141633', '#22160f']); c.fillRect(0, 0, W, H);
    rosette(W / 2, 260, 140, t, ease(clamp(t / 1.6)));
    txt('à suivre…', W / 2, 520 + (1 - ease(clamp((t - .6) / 1))) * 12, `italic 72px ${SERIF}`, '#f0d593', ease(clamp((t - .6) / .8)));
    const n = ease(clamp((t - 1.8) / .7));
    txt('Prochain épisode — Chapitre IX', W / 2, 650, `bold 52px ${SERIF}`, PAPER, n);
    txt("L'enfant malade", W / 2, 725, `italic 44px ${SERIF}`, GOLD, n);
    txt('et une maison qui ne dort plus', W / 2, 790, `italic 36px ${SERIF}`, '#c8b890', ease(clamp((t - 2.8) / .7)));
    goldDust(t, 40, 0, 0, W, H, .5, 7);
    const f = clamp((t - 7.4) / .6); if (f > 0) { c.fillStyle = `rgba(0,0,0,${f})`; c.fillRect(0, 0, W, H); }
    return { vignette: .6, paper: .2, letterbox: false };
  },
};
