// R31L: s10 helpers. Blend one hand between a loose handTo target and a hands-on-hips target (no snap),
// with the hip target slightly outside and in front of the sash.
import * as PO from '../../../engine/poses.js';
import { at, dirW, V } from './beatscene.js';

const lat = (a, side) => { const o = at(a, 'upperArm' + side).sub(at(a, 'chest')); o.y = 0; if (o.lengthSq() < 1e-8) o.copy(dirW(a, 1, 0, 0)); return o.normalize(); };
const sgnOf = (a, o) => o.clone().applyQuaternion(a.group.quaternion.clone().invert()).x >= 0 ? 1 : -1;
const tgt = (a, side, o, { fwd, out, drop }) => { const k = a.group.scale.y / 1.6; return at(a, 'upperArm' + side).addScaledVector(o, out * k).addScaledVector(dirW(a, 0, 0, 1), fwd * k).add(V(0, -drop * k, 0)); };

export const HIP = { fwd: -.02, out: .08, drop: .33 };
export function hipBlend(a, side, w, loose = { fwd: .22, out: .0, drop: .25, curl: .35, spread: .08 }, hip = HIP) {
  const o = lat(a, side), s = sgnOf(a, o);
  const p0 = tgt(a, side, o, loose), p1 = tgt(a, side, o, hip);
  const p = p0.lerp(p1, w);
  const pw = w;   // elbow pole: from loose (.5,.02,-.32) to akimbo (1,.05,-.35)
  PO.reach(a, side, p, { grip: .02, pole: [s * (.5 + 1.8 * pw), .0, -.32 - .35 * pw] });
  PO.fingers(a, side, (loose.curl ?? .35) * (1 - w) + .4 * w, { spread: .1 });
}

// Raised forearm: elbow down, hand at shoulder/face height in front and out, open (no straight-out arm).
export function raiseHand(a, side, { fwd = .2, out = .18, up = .0, curl = .12, spread = .35 } = {}) {
  const o = lat(a, side), s = sgnOf(a, o), k = a.group.scale.y / 1.6;
  const p = at(a, 'upperArm' + side).addScaledVector(o, out * k).addScaledVector(dirW(a, 0, 0, 1), fwd * k).add(V(0, up * k, 0));
  PO.reach(a, side, p, { grip: .02, pole: [s * .45, -.8, -.15] });
  PO.fingers(a, side, curl, { spread });
}
// Hand resting on another actor's nearer upper arm (shared gesture).
export function handOnArm(a, b, w, drop = .12) {   // R31AB: drop = how far below the target arm's shoulder the hand lands
  if (w <= 0) return;
  const k = a.group.scale.y / 1.6, bp = b.group.position;
  const near = (x, sd) => at(x, 'upperArm' + sd).distanceTo(sd === 'L' || sd === 'R' ? bp : bp);
  const sa = near(a, 'L') < near(a, 'R') ? 'L' : 'R';
  const ap = at(a, 'upperArm' + sa);
  const sb = at(b, 'upperArmL').distanceTo(ap) < at(b, 'upperArmR').distanceTo(ap) ? 'L' : 'R';
  const sh = ap.clone();
  const tp = at(b, 'upperArm' + sb).addScaledVector(dirW(b, 0, 0, 1), .15 * k).add(V(0, -drop * k, 0));
  const d = tp.clone().sub(sh), cap = .34 * k; if (d.length() > cap) tp.copy(sh).addScaledVector(d.normalize(), cap);   // never out of reach
  const o = lat(a, sa), s = sgnOf(a, o);
  PO.reach(a, sa, tp, { grip: .02, pole: [s * .5, -.5, -.25] });
  PO.fingers(a, sa, .25, { spread: .1 });
}
