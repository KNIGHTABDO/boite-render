// Acting layer for 3D shots (ep08+). Everything is a pure function of the shot time t (frames render in any order).
// Layer it AFTER the body pose (stool/kneel/reach...) and BEFORE draw:
//   const G = AC.gazeNet(S.lines, { mohammed: A, zoubida: Z }, { addressee: { zoubida: 'mohammed' } });
//   AC.idle(Z, t, 2); AC.speak(Z, t, S.lines, 'zoubida'); G.apply(t);
import * as THREE from 'three';
import { look } from './poses.js';

const sm = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);
const hash = (i, s) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
/** smooth value noise in [-1, 1] */
export function noise1(t, seed = 0) { const i = Math.floor(t), f = t - i; return (hash(i, seed) * (1 - sm(f)) + hash(i + 1, seed) * sm(f)) * 2 - 1; }

const headOf = a => { a.B.head.updateWorldMatrix(true, false); return new THREE.Vector3().setFromMatrixPosition(a.B.head.matrixWorld).add(new THREE.Vector3(0, .06 * a.group.scale.y / 1.6, 0)); };

/**
 * Who looks at whom. Listeners turn to the current speaker ~0.25 s after the line starts (0.45 s turn, eased);
 * the speaker looks at their addressee (opts.addressee[who], else the previous speaker), glancing away on long lines.
 * Between lines everybody keeps their last target. opts.fixed[who] = THREE.Vector3 pins a gaze (e.g. on a prop).
 * Returns { at(who, t) -> world point | null, apply(t, amt) }.
 */
export function gazeNet(lines, actors, { addressee = {}, fixed = {}, lag = .25, turn = .45, amt = .85 } = {}) {
  const names = Object.keys(actors), L = lines.filter(l => actors[l.who]).sort((a, b) => a.t0 - b.t0);
  // per actor: list of [t_switch, targetName]
  const plan = Object.fromEntries(names.map(n => [n, []]));
  let prev = null;
  for (const l of L) {
    const ad = typeof addressee[l.who] === 'function' ? addressee[l.who](l) : addressee[l.who];
    const to = ad ?? (prev && prev !== l.who ? prev : names.find(n => n !== l.who));
    if (to) plan[l.who].push([l.t0 - .15, to]);                      // speakers look just before they speak
    for (const n of names) if (n !== l.who) plan[n].push([l.t0 + lag + hash(n.length, l.t0) * .2, l.who]);
    prev = l.who;
  }
  const target = (n, name, t) => {
    const p = headOf(actors[name]);
    // glance-away on long speaker lines: 1-2 s look-aways to a random side every ~5 s
    const l = L.find(l => l.who === n && t >= l.t0 && t < l.t1);
    if (l && l.t1 - l.t0 > 4) {
      const ph = (t - l.t0) % 5.2, g = sm((ph - 2.6) / .4) * (1 - sm((ph - 3.9) / .4));
      p.add(new THREE.Vector3(noise1(l.t0, 3) * .5, -.12, 0).multiplyScalar(g));
    }
    // micro-saccades: tiny, stepped (eyes dart, they do not drift)
    const st = Math.floor(t * 2.3 + n.length), j = .025;
    return p.add(new THREE.Vector3((hash(st, 1) - .5) * j, (hash(st, 2) - .5) * j * .6, 0));
  };
  const at = (n, t) => {
    if (fixed[n]) return fixed[n].clone();
    const P = plan[n]; let k = -1; for (let i = 0; i < P.length; i++) if (P[i][0] <= t) k = i;
    if (k < 0) return P.length ? target(n, P[0][1], t) : null;
    const cur = target(n, P[k][1], t), w = sm((t - P[k][0]) / turn);
    if (w >= 1 || k === 0) return cur;
    return target(n, P[k - 1][1], t).lerp(cur, w);
  };
  return { at, plan, apply(t, a = amt) { for (const n of names) { const p = at(n, t); if (p) look(actors[n], p, a); } } };
}

/**
 * Asymmetric idle on top of a pose: slow weight shift (chest/spine), breathing (chest + shoulders), head drift.
 * seed makes two actors never move in sync. seated = true keeps the spine sway smaller.
 * Touches only spine/chest/neck/head/shoulders, so contact bones (hips, feet, hands on a prop) stay put.
 */
export function idle(a, t, seed = 0, { seated = false, k = 1 } = {}) {
  const B = a.B, f = .8 + hash(seed, 9) * .45, s = seated ? .6 : 1;
  const br = Math.sin(t * (1.45 + hash(seed, 4) * .3) + seed * 2.1);       // breathing ~0.25 Hz
  const sway = noise1(t * .23 * f, seed + 11), lean = noise1(t * .17 * f, seed + 23);
  const rot = (b, x, y, z) => { if (!b) return; b.rotateX(x * k); b.rotateY(y * k); b.rotateZ(z * k); b.updateWorldMatrix(false, true); };
  rot(B.spine, lean * .025 * s, sway * .03 * s, sway * .02 * s);
  rot(B.chest, br * .012 - lean * .01, sway * .02, 0);
  rot(B.LeftShoulder, 0, 0, br * .015); rot(B.RightShoulder, 0, 0, -br * .012);
  rot(B.neck, noise1(t * .31, seed + 5) * .03, noise1(t * .27, seed + 7) * .04, 0);
  rot(B.head, noise1(t * .41, seed + 13) * .02, 0, noise1(t * .19, seed + 17) * .035);   // the slight tilt people hold
}

/** speech body: head nods / beats following the loudness envelope of the actor's own lines (l.env at 24 fps) */
export function speak(a, t, lines, who, { k = 1 } = {}) {
  const l = lines.find(l => l.who === who && t >= l.t0 && t < l.t1); if (!l) return 0;
  const env = l.env?.length ? l.env : null, i = Math.floor((t - l.t0) * 24);
  const e = env ? (env[i] ?? 0) : .5 + .5 * noise1(t * 3, who.length);
  const e2 = env ? (env[Math.max(0, i - 4)] ?? 0) : e;                       // stress = rise in loudness
  const beat = Math.max(0, e - e2) * 2.2;
  const B = a.B; B.head.rotateX(-(beat * .09 + e * .02) * k); B.neck.rotateX(-beat * .03 * k);
  B.chest?.rotateX(e * .012 * k); B.head.updateWorldMatrix(false, true);
  return e;
}

/** blink weight 0..1 for a face layer (every 2.5-6 s, 150 ms, sometimes a double blink); deterministic per seed */
export function blink(t, seed = 0) {
  let t0 = hash(seed, 1) * 3, i = 0;
  while (t0 < t + 1) { const d = t - t0; if (d >= 0 && d < .15) return Math.sin(d / .15 * Math.PI); if (hash(i, seed) < .15 && d >= .25 && d < .4) return Math.sin((d - .25) / .15 * Math.PI); t0 += 2.5 + hash(i++, seed + 5) * 3.5; }
  return 0;
}

/**
 * Arms that live: relaxed elbows (never the straight bind-pose A), slow asymmetric drift, and while speaking a
 * gesture hand that rises on stressed syllables and holds through the phrase (envelope-driven, like speak()).
 * For standing actors with free hands only; reach()/grip() applied afterwards override it.
 */
export function arms(a, t, seed = 0, lines = [], who = '', { k = 1, talk = 1, relax = true } = {}) {
  const B = a.B; if (!B.upperArmL) return;
  const rot = (b, x, y, z) => { if (!b) return; b.rotateX(x * k); b.rotateY(y * k); b.rotateZ(z * k); b.updateWorldMatrix(false, true); };
  const d = s => noise1(t * .21, seed + s) * .06;
  if (relax) rot(B.upperArmL, .1 + d(31), 0, .07 + d(33)), rot(B.upperArmR, .1 + d(35), 0, -.07 - d(37));
  if (relax) rot(B.foreArmL, -.32 + d(39), 0, 0), rot(B.foreArmR, -.3 + d(41), 0, 0);
  const l = lines.find(l => l.who === who && t >= l.t0 - .3 && t < l.t1 + .4); if (!l || !talk) return;
  const env = l.env?.length ? l.env : null, i = Math.floor((t - l.t0) * 24);
  // phrase-level hold: smoothed loudness over ~0.6 s, eased in/out at the line edges
  let e = 0; for (let j = -7; j <= 7; j++) e += env ? (env[i + j] ?? 0) : .5 + .5 * noise1((t + j / 24) * 1.3, who.length);
  e /= 15; const edge = sm((t - l.t0 + .3) / .5) * (1 - sm((t - l.t1) / .4));
  const g = Math.min(1, e * 1.6) * edge * talk, side = hash(Math.floor(l.t0 * 3), seed) < .65 ? 'R' : 'L', sg = side === 'R' ? -1 : 1;
  const beat = noise1(t * 2.6, seed + 51) * .12 * g;
  rot(B['upperArm' + side], .42 * g + beat, 0, sg * -.12 * g); rot(B['foreArm' + side], -.85 * g - beat, sg * .35 * g, 0);
  rot(B['hand' + side], -.25 * g, 0, sg * .2 * g);
  const o = side === 'R' ? 'L' : 'R';   // the other hand joins on loud phrases
  const g2 = Math.max(0, g - .55) * 1.8; if (g2 > 0) { rot(B['upperArm' + o], .3 * g2, 0, -sg * -.1 * g2); rot(B['foreArm' + o], -.6 * g2, 0, 0); }
}
