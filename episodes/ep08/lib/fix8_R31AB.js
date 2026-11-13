// R31AB: s10 helpers. (1) palms-up / raised-open hands with the ELBOW pushed outward so both arms read in a 3/4 view
// (R31L's raiseHand used pole y=-.8: the elbow tucked at the waist, forearm crossed the belly, the far arm hid behind the torso).
// (2) a foot planted by measured sole height, (3) scornful crouch arms (one hand on the knee, the other gesturing).
import * as PO from '../../../engine/poses.js';
import * as IK from '../../../engine/ik.js';
import { at, dirW, V } from './beatscene.js';

const lat = (a, side) => { const o = at(a, 'upperArm' + side).sub(at(a, 'chest')); o.y = 0; if (o.lengthSq() < 1e-8) o.copy(dirW(a, 1, 0, 0)); return o.normalize(); };
const sgnOf = (a, o) => o.clone().applyQuaternion(a.group.quaternion.clone().invert()).x >= 0 ? 1 : -1;

// Hand held in front/out/up of the shoulder; elbow pole outward (px) and level (py).
export function openHand(a, side, { fwd = .3, out = .2, up = -.1, px = 1.1, py = -.25, pz = -.1, curl = .1, spread = .4, w = 1 } = {}) {
  const o = lat(a, side), s = sgnOf(a, o), k = a.group.scale.y / 1.6;
  const p = at(a, 'upperArm' + side).addScaledVector(o, out * k).addScaledVector(dirW(a, 0, 0, 1), fwd * k).add(V(0, up * k, 0));
  PO.reach(a, side, w < 1 ? at(a, 'hand' + side).lerp(p, w) : p, { grip: .02, pole: [s * px, py, pz] });
  PO.fingers(a, side, curl, { spread });
}
// Put the lowest vertex of the foot on `floor` (ankle moved straight up/down, knee kept).
export function plantFoot(a, side, floor, clear = .002) {
  const lo = PO.lowestOf(a, ['foot' + side]), d = lo - (floor + clear);
  if (Math.abs(d) < .002) return;
  const ankle = at(a, 'foot' + side).add(V(0, -d, 0)), knee = at(a, 'shin' + side);
  IK.leg(a, side, ankle, knee);
  a.B['foot' + side].updateWorldMatrix(false, true);
}
// Scornful seated arms: left hand on the left knee (elbow out), right forearm forward gesturing, palm half up.
export function scornArms(a, w, t) {
  if (w <= 0) return;
  const k = a.group.scale.y / 1.6;
  const kL = at(a, 'shinL').add(V(.0, .075 * k, 0)).addScaledVector(dirW(a, 0, 0, 1), .02 * k);
  const hL = at(a, 'handL'), pL = hL.clone().lerp(kL, w);
  PO.reach(a, 'L', pL, { grip: .03, pole: [1.1, .05, -.1] }); PO.fingers(a, 'L', .5, { thumb: .35 });
  const o = lat(a, 'R'), sh = at(a, 'upperArmR'), hR = at(a, 'handR');
  const tR = sh.clone().addScaledVector(o, .17 * k).addScaledVector(dirW(a, 0, 0, 1), .26 * k).add(V(0, (-.2 + .02 * Math.sin(t * 1.7)) * k, 0));
  PO.reach(a, 'R', hR.clone().lerp(tR, w), { grip: .02, pole: [-.9, -.1, -.15] }); PO.fingers(a, 'R', .2, { spread: .2 });
  PO.palmTo(a, 'R', .6 * w, V(0, 1, .3));
}
