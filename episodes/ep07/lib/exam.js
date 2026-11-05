// exam.js: the exam layer (POSTMORTEM R13) drawn by film.js over every scene, driven by beats.json so no scene draws it by hand.
//   card  : day card burned over the action (the Achoura countdown students are tested on), centred high, 3.2 s
//   label : first appearance of a character or place, lower-left above the subtitles, 4 s
//   tag   : "À RETENIR : ..." plant for later chapters, top-right, 6 s
//   badge : "TEXT @m:ss" chapter badge top-left, 8 s
// Beat j of a scene (beats with no spoken line excepted) starts with line j of that scene in timing.json.
import * as K from '../../../engine/core.js';
const { W, H, clamp, ease } = K;
import { c } from '../../../engine/core.js';   // live binding: film.js imports this before the first setCtx()

const SERIF = '"IM Fell English", Georgia, serif';
export function examEvents(beats, timing) {
  const ev = [];
  for (const sc of timing) {
    const bs = beats.filter(b => b.scene === sc.id && !(b.mode === 'title' && !sc.lines.length));
    bs.forEach((b, j) => {
      const l = sc.lines[j], t0 = l ? l.start : sc.start;
      if (b.card) ev.push({ kind: 'card', text: b.card, a: t0, b: t0 + 3.2 });
      if (b.label) ev.push({ kind: 'label', text: b.label, a: t0 + .4, b: t0 + 4.4 });
      if (b.tag) ev.push({ kind: 'tag', text: b.tag, a: t0 + .3, b: t0 + 6.3 });
      if (b.badge) { const [txt, at] = b.badge.split('@'), [m, s] = (at || '0:00').trim().split(':').map(Number); ev.push({ kind: 'badge', text: txt.trim(), a: sc.start + m * 60 + s, b: sc.start + m * 60 + s + 8 }); }
    });
  }
  return ev;
}

/** fade envelope: in over fi, out over fo */
const env = (t, a, b, fi = .35, fo = .5) => clamp((t - a) / fi) * clamp((b - t) / fo);

function spaced(s, x, y, sp) {   // letter-spaced text centred on x (canvas letterSpacing is not in every headless Chrome)
  const w = [...s].reduce((p, ch) => p + c.measureText(ch).width + sp, -sp); let cx = x - w / 2;
  for (const ch of s) { c.fillText(ch, cx, y); cx += c.measureText(ch).width + sp; }
  return w;
}

function card(text, k, t, a) {
  const u = ease(clamp((t - a) / .6)), y = 165 - 14 * (1 - u);   // high: at 250 it sat on Zoubida's face (s03, s24)
  c.save(); c.globalAlpha = k; c.textAlign = 'left'; c.textBaseline = 'alphabetic';
  c.font = `bold 68px ${SERIF}`;
  const g = c.createRadialGradient(W / 2, y - 20, 40, W / 2, y - 20, 760); g.addColorStop(0, 'rgba(10,6,3,.55)'); g.addColorStop(1, 'rgba(10,6,3,0)');
  c.fillStyle = g; c.fillRect(0, y - 200, W, 340);
  c.shadowColor = 'rgba(255,170,60,.55)'; c.shadowBlur = 26 * u; c.fillStyle = '#f6e3b4';
  const w = spaced(text, W / 2, y, 7);
  c.shadowBlur = 0; c.fillStyle = '#e0a53c'; c.fillRect(W / 2 - w / 2 * u, y + 26, w * u, 3);   // the rule burns outward
  c.restore();
}

function label(text, k, t, a) {
  const [name, ...rest] = text.split(/\s*(?=[=(«,])/), x = 96, y = 820, slide = 30 * (1 - ease(clamp((t - a) / .45)));
  c.save(); c.globalAlpha = k; c.textAlign = 'left'; c.textBaseline = 'alphabetic';
  c.font = `bold 46px ${SERIF}`; const w1 = c.measureText(name).width; c.font = `italic 32px ${SERIF}`; const sub = rest.join(' ').replace(/^=\s*/, ''), w2 = sub ? c.measureText(sub).width : 0;
  const bw = Math.max(w1, w2) + 56;
  c.fillStyle = 'rgba(14,9,6,.72)'; c.fillRect(x - 28 - slide, y - 58, bw, sub ? 108 : 74);
  c.fillStyle = '#e0a53c'; c.fillRect(x - 28 - slide, y - 58, 6, sub ? 108 : 74);
  c.fillStyle = '#f6e9cc'; c.font = `bold 46px ${SERIF}`; c.fillText(name, x - slide, y - 6);
  if (sub) { c.fillStyle = '#d8c39a'; c.font = `italic 32px ${SERIF}`; c.fillText(sub, x - slide, y + 36); }
  c.restore();
}

function tag(text, k) {
  const [head, body] = text.includes(':') ? [text.slice(0, text.indexOf(':')).trim(), text.slice(text.indexOf(':') + 1).trim()] : ['À RETENIR', text];
  c.save(); c.globalAlpha = k; c.textAlign = 'left'; c.textBaseline = 'alphabetic';
  c.font = `34px ${SERIF}`; const words = body.split(' '), lines = []; let cur = '';
  for (const w of words) { const s = cur ? cur + ' ' + w : w; if (c.measureText(s).width > 560 && cur) { lines.push(cur); cur = w; } else cur = s; } if (cur) lines.push(cur);
  const bw = 620, bh = 74 + lines.length * 42, x = W - bw - 80, y = 90;
  c.fillStyle = 'rgba(246,233,204,.94)'; c.fillRect(x, y, bw, bh);
  c.strokeStyle = '#b8322a'; c.lineWidth = 4; c.strokeRect(x + 6, y + 6, bw - 12, bh - 12);
  c.fillStyle = '#b8322a'; c.font = `bold 30px ${SERIF}`; spaced(head, x + bw / 2, y + 48, 4);
  c.fillStyle = '#2a1a10'; c.font = `34px ${SERIF}`; c.textAlign = 'center'; lines.forEach((l, i) => c.fillText(l, x + bw / 2, y + 92 + i * 42));
  c.restore();
}

function badge(text, k) {
  c.save(); c.globalAlpha = k * .92; c.textAlign = 'left'; c.textBaseline = 'alphabetic';
  const [a, b] = text.split('·').map(s => s.trim());
  c.font = `bold 30px ${SERIF}`; const w1 = c.measureText(a).width; c.font = `italic 30px ${SERIF}`; const w2 = b ? c.measureText(' · ' + b).width : 0;
  c.fillStyle = 'rgba(14,9,6,.6)'; c.fillRect(70, 64, w1 + w2 + 40, 52);
  c.fillStyle = '#e0a53c'; c.font = `bold 30px ${SERIF}`; c.fillText(a, 90, 100);
  if (b) { c.fillStyle = '#f6e9cc'; c.font = `italic 30px ${SERIF}`; c.fillText(' · ' + b, 90 + w1, 100); }
  c.restore();
}

/** draw every exam event active at global time t (call after finish(), before the subtitles) */
export function drawExam(ev, t) {
  for (const e of ev) {
    if (t < e.a || t > e.b) continue;
    const k = env(t, e.a, e.b);
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0); const s = c.canvas.width / W; c.scale(s, s);
    if (e.kind === 'card') card(e.text, k, t, e.a); else if (e.kind === 'label') label(e.text, k, t, e.a); else if (e.kind === 'tag') tag(e.text, k); else badge(e.text, k);
    c.restore();
  }
}
