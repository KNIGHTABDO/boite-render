// acts.js: per-frame actions shared by the ep07 scenes. Each one sets arms/head with IK against points computed from the
// actor itself (so it holds at any placement), and places the held prop on the solved hand. Call after idle()/rest().
import * as K from '../../../engine/core.js';
import * as PO from '../../../engine/poses.js';
import { walkPose } from '../../../engine/rig3d.js';
import { at, front, dirW, orient, V } from './beatscene.js';

/** the mouth, in world space (head bone frame, model units) */
export const mouthW = a => at(a, 'head', [0, .05, .12]);

/** frame drum (bendir / tambourin) held up in the left hand, struck by the right: bpm, pattern of hit strengths (1 = deep dum).
 *  Returns the hit envelope 0..1 at t (1 on the stroke), for a camera kick or a face. */
export function strike(a, drum, t, { bpm = 132, pat = [1, .5, .5, 1, .5], fwd = .3, up = -.04, wild = 0 } = {}) {
  const k = a.group.scale.y / 1.6, beat = t * bpm / 60, i = Math.floor(beat), p = beat - i, s = pat[i % pat.length];
  const jit = wild ? (K.noise(i * 1.3, 7) - .5) * wild : 0;
  const c0 = front(a, 'chest', fwd * k, -.02 * k, up * k);   // drum centre, skin facing forward and a little out
  const n = dirW(a, -.25, .15, 1);
  orient(drum, c0, V(0, 1, 0), n);
  PO.reach(a, 'L', c0.clone().add(V(.0, -drum.userData.r * .9, 0)).addScaledVector(dirW(a, 1, 0, 0), .02), { grip: .02 });
  const lift = (.03 + .09 * s) * k * Math.pow(Math.sin(Math.PI * Math.min(1, p * 1.15)), .7);   // 0 on the stroke
  const hit = c0.clone().addScaledVector(n, drum.userData.r * .25 + .02 + lift).addScaledVector(dirW(a, -1, 0, 0), (s > .7 ? .02 : .09) * k).add(V(0, (s > .7 ? .02 : .08) * k + jit * .1, 0));
  PO.reach(a, 'R', hit, { grip: .015 });
  return Math.max(0, 1 - p * 5) * s;
}

/** toy trumpet to the mouth, both hands on the tube; puff 0..1 tips the head back a little */
export function blow(a, horn, t, puff = 1) {
  const m = mouthW(a), d = dirW(a, 0, -.35 + .1 * puff, 1);
  a.B.head.rotation.x -= .12 * puff; a.B.head.updateWorldMatrix(false, true);
  orient(horn, mouthW(a), d, V(0, 1, 0));
  PO.reach(a, 'R', horn.localToWorld(V(0, .08, 0)), { grip: .015 });
  PO.reach(a, 'L', horn.localToWorld(V(0, .18, 0)), { grip: .015 });
  return m;
}
/** trumpet held down at the side in the right hand (not playing) */
export function holdDown(a, o, side = 'R') {
  const k = a.group.scale.y / 1.6, h = front(a, 'root', .12 * k, (side === 'R' ? .2 : -.2) * k, -.05 * k);
  PO.reach(a, side, h, { grip: .02 }); const p = PO.handPts(a, side).palm;
  orient(o, p, dirW(a, 0, -.3, 1), V(0, 1, 0));
}

/** point at a world target with the right arm (straight, at shoulder height toward it); amt eases it in */
export function point(a, target, amt = 1, side = 'R') {
  const sh = at(a, 'upperArm' + side), d = target.clone().sub(sh).normalize(), k = a.group.scale.y / 1.6;
  const rest = front(a, 'root', .1 * k, (side === 'R' ? .22 : -.22) * k, -.1 * k);
  PO.reach(a, side, rest.lerp(sh.clone().addScaledVector(d, .62 * k), K.ease(amt)), { grip: .0 });
}
/** a hand cupped over the ear (hands over the ears at the din) */
export function earCover(a, side = 'L', amt = 1) {
  const k = a.group.scale.y / 1.6, e = at(a, 'head', [side === 'L' ? .1 : -.1, .06, 0]);
  const rest = front(a, 'root', .1 * k, (side === 'R' ? .22 : -.22) * k, -.1 * k);
  PO.reach(a, side, rest.lerp(e, K.ease(amt)), { grip: .01 });
}
/** waving someone over: forearm up, hand beckoning toward the body */
export function wave(a, t, amt = 1, side = 'R') {
  const k = a.group.scale.y / 1.6, s = side === 'R' ? -1 : 1;
  const h = front(a, 'chest', (.25 + .1 * Math.sin(t * 9)) * k, -s * .22 * k, .22 * k);
  const rest = front(a, 'root', .1 * k, -s * .22 * k, -.1 * k);
  PO.reach(a, side, rest.lerp(h, K.ease(amt)), { grip: .0 });
}

/** walk from p0 to p1 (world, y = 0) between t0 and t1 at cadence `cps` steps/s; sets position, yaw and the leg cycle.
 *  Before t0 / after t1 it stands at the end point. Returns progress 0..1. */
export function walk(a, p0, p1, t0, t1, t, { cps = 1.8, ease = true } = {}) {
  const u = K.clamp((t - t0) / (t1 - t0)), e = ease ? K.ease(u) : u, p = p0.clone().lerp(p1, e);
  a.group.position.set(p.x, a.group.position.y, p.z);
  a.group.rotation.y = Math.atan2(p1.x - p0.x, p1.z - p0.z);
  const amt = Math.min(1, Math.min(u, 1 - u) * 8);
  if (u > 0 && u < 1) walkPose(a.B, (t - t0) * cps / 2, amt);
  a.group.updateMatrixWorld(true);
  return u;
}

const GAP = .6;   // father-son spacing when walking hand in hand

/** the pair walks p0 -> p1 side by side (kid on the path's left), then links hands at kid hip height */
export function pair(fa, mo, p0, p1, t0, t1, t, { cf = 1.7, cm = 2.5 } = {}) {
  const d = p1.clone().sub(p0).setY(0).normalize(), left = V(d.z, 0, -d.x);
  const off = (p, s) => p.clone().addScaledVector(left, s * GAP / 2);
  const w = walk(fa, off(p0, -1), off(p1, -1), t0, t1, t, { cps: cf });
  walk(mo, off(p0, 1), off(p1, 1), t0, t1, t, { cps: cm });
  return w;
}
export function hold(fa, mo, t) {
  const g = at(fa, 'root').lerp(at(mo, 'root'), .5); g.y = .68 * mo.group.scale.y / 1.3 + .02 * Math.sin(t * 3);
  PO.reach(fa, 'R', g.clone().addScaledVector(at(fa, 'root').sub(at(mo, 'root')).setY(0).normalize(), .02), { grip: .03 });
  PO.reach(mo, 'L', g.clone().addScaledVector(at(mo, 'root').sub(at(fa, 'root')).setY(0).normalize(), .02), { grip: .03 });
}
