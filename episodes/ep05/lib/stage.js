// Staging layer for ep05: richer acting for the 3D actors and painted inserts.
//  - pose presets: additive bone moves, each driven by a 0..1 weight (blend in/out with win()/ease())
//  - act(): voice-driven acting (head beats on stressed syllables, hand gestures while talking, breathing, weight shifts)
//  - still(): a full painted ChatGPT frame (art/ep05/<id>.png) as an insert shot, with camera move and FX
import * as K from '../../../engine/core.js';
import { place, faceFX } from '../../../engine/actors.js';
import { autoBlink } from '../../../engine/characters.js';
const { clamp, lerp, ease, easeIO, noise, hash, glow, rgba } = K;

// ---------------------------------------------------------------- pose presets (all additive, k = weight 0..1)
// conventions (engine/actors.js): upperArm.x negative = forward/up, upperArm.z = out to the side (L +, R -),
// foreArm.x negative = bend forward; head.y = turn (+ = toward screen-right when yaw=0), head.x negative = look up.
export const P = {
  /** look: yaw (turn) and pitch (negative = up) shared by neck/head/chest */
  look(B, k, yaw = 0, pitch = 0) { B.head.rotation.y += yaw * .6 * k; B.neck.rotation.y += yaw * .25 * k; B.chest.rotation.y += yaw * .15 * k; B.head.rotation.x += pitch * k; },
  /** open-hand explaining gesture (one side, 'L' or 'R') */
  explain(B, k, s = 'R', t = 0, seed = 0) {
    const w = .5 + .5 * noise(t * 1.4, seed), sg = s === 'L' ? 1 : -1;
    B['upperArm' + s].rotation.x += (-.55 - .35 * w) * k; B['upperArm' + s].rotation.z += sg * (.25 + .15 * w) * k; B['foreArm' + s].rotation.x += (-.9 - .4 * w) * k;
  },
  point(B, k, s = 'R', up = 0) { const sg = s === 'L' ? 1 : -1; B['upperArm' + s].rotation.x += (-1.35 - up) * k; B['upperArm' + s].rotation.z += sg * .2 * k; B['foreArm' + s].rotation.x += -.15 * k; },
  /** both palms raised to the sky (prayer / blessing / invocation) */
  palmsUp(B, k) { for (const [s, sg] of [['L', 1], ['R', -1]]) { B['upperArm' + s].rotation.x += -.75 * k; B['upperArm' + s].rotation.z += sg * .35 * k; B['foreArm' + s].rotation.x += -1.25 * k; } B.head.rotation.x += -.12 * k; },
  /** reaching both arms forward (to lift a child, to receive something) */
  reach(B, k, h = 0) { for (const [s, sg] of [['L', 1], ['R', -1]]) { B['upperArm' + s].rotation.x += (-1.0 - h) * k; B['upperArm' + s].rotation.z += sg * -.08 * k; B['foreArm' + s].rotation.x += (-.55 + h * .3) * k; } B.spine.rotation.x += .12 * k; },
  /** holding something up at chest height in front (a lamp, a child under the armpits) */
  hold(B, k, h = .2) { for (const [s, sg] of [['L', 1], ['R', -1]]) { B['upperArm' + s].rotation.x += (-.65 - h) * k; B['upperArm' + s].rotation.z += sg * -.12 * k; B['foreArm' + s].rotation.x += (-1.25 + h) * k; } },
  /** hands to the cheeks (wailing / slapping: slap 0..1 pulses the hands away and back) */
  cheeks(B, k, slap = 0) { for (const [s, sg] of [['L', 1], ['R', -1]]) { B['upperArm' + s].rotation.x += (-.8 + .25 * slap) * k; B['upperArm' + s].rotation.z += sg * (.45 + .35 * slap) * k; B['foreArm' + s].rotation.x += (-2.05 + .45 * slap) * k; } },
  /** hand to the chest/heart (left hand) */
  heart(B, k, s = 'L') { const sg = s === 'L' ? 1 : -1; B['upperArm' + s].rotation.x += -.55 * k; B['upperArm' + s].rotation.z += sg * -.35 * k; B['foreArm' + s].rotation.x += -1.75 * k; },
  /** hand at the mouth: calling across the patio, yawning, giggling behind it */
  mouthHand(B, k, s = 'R') { const sg = s === 'L' ? 1 : -1; B['upperArm' + s].rotation.x += -.6 * k; B['upperArm' + s].rotation.z += sg * -.15 * k; B['foreArm' + s].rotation.x += -2.15 * k; },
  /** arms crossed (sulking) */
  crossed(B, k) { for (const [s, sg] of [['L', 1], ['R', -1]]) { B['upperArm' + s].rotation.x += -.45 * k; B['upperArm' + s].rotation.z += sg * -.35 * k; B['foreArm' + s].rotation.x += -1.85 * k; } B.head.rotation.x += .05 * k; },
  /** both arms up (joy, a jump) */
  armsUp(B, k) { for (const [s, sg] of [['L', 1], ['R', -1]]) { B['upperArm' + s].rotation.x += -2.3 * k; B['upperArm' + s].rotation.z += sg * .35 * k; B['foreArm' + s].rotation.x += -.25 * k; } },
  /** protest: both hands raised palms out, a little shake */
  protest(B, k, t = 0) { const w = Math.sin(t * 9) * .08; for (const [s, sg] of [['L', 1], ['R', -1]]) { B['upperArm' + s].rotation.x += (-.95 + w) * k; B['upperArm' + s].rotation.z += sg * .55 * k; B['foreArm' + s].rotation.x += (-1.1 - w) * k; } B.head.rotation.z += w * .5 * k; },
  /** bow forward from the hips (kissing a hand, bending to a child, picking something up) */
  bow(B, k, deep = .5) { B.spine.rotation.x += deep * .6 * k; B.chest.rotation.x += deep * .4 * k; B.head.rotation.x += -deep * .3 * k; },
  /** a sob: shoulders shaking, head down, hands to the eyes */
  sob(B, k, t = 0) { const sh = Math.max(0, Math.sin(t * 7)) * .06; B.chest.rotation.x += (.15 + sh) * k; B.head.rotation.x += .25 * k; for (const [s, sg] of [['L', 1], ['R', -1]]) { B['upperArm' + s].rotation.x += -.85 * k; B['upperArm' + s].rotation.z += sg * -.1 * k; B['foreArm' + s].rotation.x += (-2.0 + sh) * k; } },
  /** stirring a pot / ladle with the right hand (rhythmic) */
  stir(B, k, t = 0) { const a = t * 3.2; B.upperArmR.rotation.x += (-.7 + Math.sin(a) * .15) * k; B.upperArmR.rotation.z += (-.2 + Math.cos(a) * .12) * k; B.foreArmR.rotation.x += (-.9 + Math.cos(a) * .2) * k; B.spine.rotation.x += .15 * k; },
  /** sweeping with a broom held low in both hands */
  sweep(B, k, t = 0) { const a = Math.sin(t * 3.4); B.spine.rotation.x += .25 * k; B.chest.rotation.y += a * .25 * k; B.upperArmL.rotation.x += (-.5 + a * .2) * k; B.upperArmR.rotation.x += (-.35 - a * .2) * k; B.foreArmL.rotation.x += -.5 * k; B.foreArmR.rotation.x += -.7 * k; },
  /** sipping from a glass held in the right hand: sip 0..1 brings it to the mouth */
  sip(B, k, sip = 0) { B.upperArmR.rotation.x += (-.45 - .35 * sip) * k; B.upperArmR.rotation.z += -.25 * k; B.foreArmR.rotation.x += (-1.4 - .6 * sip) * k; B.head.rotation.x += -.12 * sip * k; },
  /** pouring tea from high: right arm raised with the pot, left low with the glass */
  pour(B, k) { B.upperArmR.rotation.x += -1.45 * k; B.upperArmR.rotation.z += -.25 * k; B.foreArmR.rotation.x += -.6 * k; B.upperArmL.rotation.x += -.6 * k; B.foreArmL.rotation.x += -.9 * k; B.head.rotation.x += -.1 * k; },
  /** eating with the right hand from a low table */
  eat(B, k, t = 0, seed = 0) { const bite = Math.max(0, Math.sin(t * 1.6 + seed)) ** 3; B.spine.rotation.x += .2 * k; B.upperArmR.rotation.x += (-.6 - .3 * bite) * k; B.foreArmR.rotation.x += (-.8 - 1.0 * bite) * k; B.head.rotation.x += (.1 - .1 * bite) * k; },
  /** cheeky finger wag (scolding a cat, a proverb) */
  wag(B, k, t = 0, s = 'R') { const sg = s === 'L' ? 1 : -1, w = Math.sin(t * 8) * .12; B['upperArm' + s].rotation.x += -1.05 * k; B['upperArm' + s].rotation.z += sg * .1 * k; B['foreArm' + s].rotation.x += (-1.35 + w) * k; },
  /** walk with a cane / guided: slow, head up (blind) */
  blind(B, k, t = 0) { B.head.rotation.x += -.18 * k; B.upperArmR.rotation.x += -.55 * k; B.foreArmR.rotation.x += -.6 * k; B.upperArmL.rotation.x += -.4 * k; B.upperArmL.rotation.z += .1 * k; B.foreArmL.rotation.x += -.5 * k; },
  /** rocking forward/back while reciting (msid) */
  rock(B, k, t = 0, f = 1.6, seed = 0) { const r = Math.sin(t * f * Math.PI * 2 + seed); B.spine.rotation.x += (.08 + r * .14) * k; B.chest.rotation.x += r * .06 * k; B.head.rotation.x += r * .05 * k; },
  /** fist hammering the planchette held in the left hand (msid) */
  hammer(B, k, t = 0, f = 3, seed = 0) { const h = Math.abs(Math.sin(t * f * Math.PI + seed)); B.upperArmL.rotation.x += -.55 * k; B.foreArmL.rotation.x += -1.0 * k; B.upperArmR.rotation.x += (-.7 - .45 * h) * k; B.foreArmR.rotation.x += (-1.1 - .4 * h) * k; },
};

// ---------------------------------------------------------------- acting driven by the voice
/**
 * Natural idle + talk acting. e = talk energy (kit.talk), t = time, seed = per character.
 * Adds: breathing, small weight shifts, head beats on loud syllables, eyebrow-like head tilts, and
 * (if hands) an explaining hand that rises with the phrase.
 */
export function act(B, t, e = 0, seed = 0, o = {}) {
  const br = Math.sin(t * 1.6 + seed);
  B.chest.rotation.x += br * .012; B.head.rotation.x += Math.sin(t * 1.6 + seed + .7) * .01;
  B.root.rotation.z += noise(t * .23, seed) * .025 * (o.sway ?? 1);
  B.head.rotation.y += noise(t * .31, seed + 3) * .08 * (o.wander ?? 1);
  if (e > 0) {
    const beat = Math.max(0, noise(t * 5.5, seed + 7)) * e;
    B.head.rotation.x += -beat * .09 + Math.sin(t * 4.1 + seed) * .025 * e;
    B.head.rotation.z += noise(t * 2.1, seed + 11) * .06 * e;
    B.chest.rotation.y += noise(t * 1.3, seed + 5) * .05 * e;
    if (o.hands !== false) P.explain(B, clamp(e * 1.2) * (o.handAmt ?? .8), o.hand || (noise(t * .15, seed + 9) > 0 ? 'R' : 'L'), t, seed);
  }
}
/** a smoothed talk energy: rises fast on speech, decays over ~0.6 s (so gestures don't flicker) */
export function energy(S, who, t) {
  let m = 0;
  for (let k = 0; k < 6; k++) { const tt = t - k * .1; m = Math.max(m, (S.speaking(who, tt) ? clamp(S.mouth(who, tt) * 1.6 + .25) : 0) * (1 - k / 7)); }
  return m;
}

/** place + face in one call. who = speaking name for lip-sync (or null), blinkSeed */
export function actor3d(S, a, X, Y, h, t, o = {}) {
  const r = place(a, X, Y, h, o);
  faceFX(r.face, { blink: o.blink ?? autoBlink(t, o.seed ?? 1), open: o.who ? S.mouth(o.who, t) : 0, lid: o.lid ?? 0, sad: o.sad ?? 0 });
  return r;
}

// ---------------------------------------------------------------- painted inserts
const imgs = {};
export async function loadStill(id) {
  if (imgs[id]) return imgs[id];
  const im = new Image(); im.src = `/art/ep05/${id}.png`;
  try { await im.decode(); imgs[id] = im; } catch { imgs[id] = null; }
  return imgs[id];
}
/** a painting pre-rendered through a CSS filter once (filters per frame are very slow) */
const fcache = new Map();
function filtered(id, im, filter) {
  const k = id + '|' + filter; let cv = fcache.get(k);
  if (!cv) { cv = new OffscreenCanvas(im.naturalWidth, im.naturalHeight); const g = cv.getContext('2d'); g.filter = filter; g.drawImage(im, 0, 0); if (fcache.size > 24) fcache.delete(fcache.keys().next().value); fcache.set(k, cv); }
  return cv;
}
/** draw a painted frame full-screen with a camera move: cam = [x0,y0,z0,x1,y1,z1] (fractions + zoom), u = 0..1 */
export function still(id, u, cam = [.5, .5, 1.06, .5, .48, 1.16], o = {}) {
  const im = imgs[id], c = K.c, W = K.W, H = K.H;
  if (!im) { c.fillStyle = '#20182a'; c.fillRect(0, 0, W, H); return; }
  const e = easeIO(u * .9 + .05), z = lerp(cam[2], cam[5], e);
  // the painting is cover-fitted; camera fractions refer to the painting itself (portrait panels pan vertically)
  const iw = im.naturalWidth, ih = im.naturalHeight, k = Math.max(W / iw, H / ih), dw = iw * k, dh = ih * k, x0 = (W - dw) / 2, y0 = (H - dh) / 2;
  let cx = x0 + lerp(cam[0], cam[3], e) * dw, cy = y0 + lerp(cam[1], cam[4], e) * dh;
  cx = clamp(cx, x0 + W / 2 / z, x0 + dw - W / 2 / z); cy = clamp(cy, y0 + H / 2 / z, y0 + dh - H / 2 / z);
  c.save(); K.camera({ x: cx, y: cy, z }, o.drift ?? 1);
  c.drawImage(o.filter ? filtered(id, im, o.filter) : im, x0, y0, dw, dh);
  if (o.fx) o.fx(c);
  c.restore();
}
/** candle flame halo with the room breathing (coords in world px of the current space) */
export function flame(t, x, y, r = 450, col = '#ffa040', room = true, seed = 0) {
  const fl = .82 + .18 * noise(t * 7, seed) + .08 * noise(t * 23, seed + 3);
  glow(x, y, r * fl, col, .34 * fl, 'screen');
  glow(x, y, r * .16 * fl, '#fff2c8', .6, 'lighter');
  if (room) { const c = K.c; c.save(); c.fillStyle = `rgba(10,5,20,${clamp((1 - fl) * .5, 0, .1)})`; c.fillRect(-K.W, -K.H, 3 * K.W, 3 * K.H); c.restore(); }
  return fl;
}
export { ease, easeIO, clamp, lerp };

/** a boy's cap drawn over a 3D head (h.head = [x, y, r] = top of head + head radius): 'kufi' white skullcap, 'fez' red tarbouch */
export function cap(h, kind = 'kufi', tilt = 0, col) {
  if (!h || !h.head) return;
  const [x, y, r] = h.head, c = K.c;
  c.save(); c.translate(x, y - r * .62); c.rotate(tilt);
  if (kind === 'fez') {
    const p = new Path2D(); p.moveTo(-r * .78, 0); p.lineTo(-r * .6, -r * .95); p.quadraticCurveTo(0, -r * 1.08, r * .6, -r * .95); p.lineTo(r * .78, 0); p.quadraticCurveTo(0, r * .22, -r * .78, 0);
    K.paint(p, col || '#a8282a', { lw: 1.6, id: 2100 + (x | 0), tex: .4, shadow: new Path2D(`M ${r * .2} ${-r} L ${r * .78} 0 L ${r * .2} ${r * .1} Z`), shadowCol: 'rgba(40,10,30,.35)' });
    c.strokeStyle = '#1a1010'; c.lineWidth = Math.max(1, r * .06); c.beginPath(); c.moveTo(0, -r * 1.0); c.quadraticCurveTo(r * .5, -r * .9, r * .55, -r * .35); c.stroke();
  } else {
    const p = new Path2D(); p.moveTo(-r * .92, 0); p.bezierCurveTo(-r * .9, -r * .8, r * .9, -r * .8, r * .92, 0); p.quadraticCurveTo(0, r * .16, -r * .92, 0);
    K.paint(p, col || '#f2ede2', { lw: 1.6, id: 2200 + (x | 0), tex: .35, shadow: new Path2D(`M 0 ${-r * .6} C ${r * .7} ${-r * .55} ${r * .9} ${-r * .2} ${r * .92} 0 L 0 ${r * .1} Z`), shadowCol: 'rgba(60,50,90,.25)' });
    c.strokeStyle = 'rgba(120,100,80,.45)'; c.lineWidth = Math.max(.8, r * .04); for (const k of [-.45, 0, .45]) { c.beginPath(); c.moveTo(k * r, -r * .58); c.lineTo(k * r * 1.2, r * .02); c.stroke(); }
  }
  c.restore();
}

/** the 1930s kerosene lamp as a hand prop: brass reservoir, clarinet chimney, round reflector (s = scale, lit 0..1) */
export function kLamp(x, y, s = 1, lit = 0, t = 0) {
  const c = K.c; c.save(); c.translate(x, y); c.scale(s, s);
  const ink = (p, w = 1.6) => K.ink(p, w, 2300);
  const refl = new Path2D(); refl.arc(-6, -46, 26, 0, 7); c.fillStyle = '#d8d0c0'; c.fill(refl); c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.arc(-12, -54, 10, 0, 7); c.fill(); ink(refl);
  const res = new Path2D(); res.moveTo(-14, -14); res.quadraticCurveTo(-18, 2, 0, 4); res.quadraticCurveTo(18, 2, 14, -14); res.closePath(); c.fillStyle = '#b8862e'; c.fill(res); ink(res);
  const ch = new Path2D(); ch.moveTo(-5, -16); ch.quadraticCurveTo(-11, -30, -4, -44); ch.lineTo(-3, -78); ch.lineTo(3, -78); ch.lineTo(4, -44); ch.quadraticCurveTo(11, -30, 5, -16); ch.closePath();
  c.fillStyle = 'rgba(220,235,245,.55)'; c.fill(ch); ink(ch, 1.2);
  if (lit > 0) { K.glow(0, -32, 60, '#ffffff', .7 * lit, 'lighter'); K.glow(0, -32, 14, '#fff8e0', lit, 'lighter'); }
  c.restore();
}

/** place() that honours o.robed (a recolourRobe wrapper) for standing actors too */
export function robedPlace(a, X, Y, h, o = {}) { return (o.robed || (f => f()))(() => place(a, X, Y, h, o)); }
