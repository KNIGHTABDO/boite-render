// R16F: s10 hands on hips with the elbows pushed out, so the pose reads as akimbo instead of arms hanging.
import * as PO from '../../../engine/poses.js';
import { at, dirW, V } from './beatscene.js';

export function akimbo(a, curl = .4) {
  const k = a.group.scale.y / 1.6;
  const inv = a.group.quaternion.clone().invert();
  for (const side of ['L', 'R']) {
    const sh = at(a, 'upperArm' + side);
    const out = sh.clone().sub(at(a, 'chest')); out.y = 0;
    if (out.lengthSq() < 1e-8) out.copy(dirW(a, 1, 0, 0));
    out.normalize();
    const sgn = out.clone().applyQuaternion(inv).x >= 0 ? 1 : -1;
    const hip = sh.clone().addScaledVector(out, .15 * k).addScaledVector(dirW(a, 0, 0, 1), -.02 * k).add(V(0, -.33 * k, 0));
    PO.reach(a, side, hip, { grip: .02, pole: [sgn * 1, .05, -.35] });
    PO.fingers(a, side, curl, { spread: .1 });
  }
}
