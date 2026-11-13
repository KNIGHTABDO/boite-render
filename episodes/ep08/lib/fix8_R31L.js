// R31L: s10 helpers. Blend one hand between a loose handTo target and a hands-on-hips target (no snap),
// with the hip target slightly outside and in front of the sash.
import * as PO from '../../../engine/poses.js';
import { at, dirW, V } from './beatscene.js';

const lat = (a, side) => { const o = at(a, 'upperArm' + side).sub(at(a, 'chest')); o.y = 0; if (o.lengthSq() < 1e-8) o.copy(dirW(a, 1, 0, 0)); return o.normalize(); };
const sgnOf = (a, o) => o.clone().applyQuaternion(a.group.quaternion.clone().invert()).x >= 0 ? 1 : -1;
const tgt = (a, side, o, { fwd, out, drop }) => { const k = a.group.scale.y / 1.6; return at(a, 'upperArm' + side).addScaledVector(o, out * k).addScaledVector(dirW(a, 0, 0, 1), fwd * k).add(V(0, -drop * k, 0)); };

export const HIP = { fwd: .035, out: .2, drop: .3 };
export function hipBlend(a, side, w, loose = { fwd: .22, out: .0, drop: .25, curl: .35, spread: .08 }, hip = HIP) {
  const o = lat(a, side), s = sgnOf(a, o);
  const p0 = tgt(a, side, o, loose), p1 = tgt(a, side, o, hip);
  const p = p0.lerp(p1, w);
  const pw = w;   // elbow pole: from loose (.5,.02,-.32) to akimbo (1,.05,-.35)
  PO.reach(a, side, p, { grip: .02, pole: [s * (.5 + .5 * pw), .02 + .03 * pw, -.32 - .03 * pw] });
  PO.fingers(a, side, (loose.curl ?? .35) * (1 - w) + .4 * w, { spread: .1 });
}
