// ep09 group K: reach clamp and a three-quarter turn that keeps the face toward the lens.
import * as PO from '../../../engine/poses.js';
import { at, dirW, V } from './beatscene.js';

/** IK reach pulled inside the two-bone length so the gate error stays under 3 cm. */
export function reachClamp(a, side, target, opt = {}) {
  const sh = at(a, 'upperArm' + side), el = at(a, 'foreArm' + side), hd = at(a, 'hand' + side);
  const len = sh.distanceTo(el) + el.distanceTo(hd);
  const d = target.clone().sub(sh), max = len * .84;
  if (d.length() > max) target = sh.clone().addScaledVector(d.normalize(), max);
  return PO.reach(a, side, target, opt);
}

/**
 * Yaw the body toward a world point, but never more than `max` radians off the camera.
 * The head can then look the rest of the way without turning the back to the lens.
 */
export function turnToward(a, cam, world, max = .7) {
  const yCam = Math.atan2(cam.x - a.group.position.x, cam.z - a.group.position.z);
  const yTo = Math.atan2(world.x - a.group.position.x, world.z - a.group.position.z);
  let d = yTo - yCam;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  a.group.rotation.y = yCam + Math.max(-max, Math.min(max, d));
  a.group.updateMatrixWorld(true);
}

/**
 * Hand held out from the shoulder, inside a safe reach, so a carried prop clears the robe.
 * sideSign matches sideArms: -1 for the right arm, +1 for the left (dirW +x is the actor's left).
 */
export function carryHand(a, side, sideSign, { fwd = .1, out = .24, drop = .36 } = {}) {
  const k = a.group.scale.y / 1.6;
  const sh = at(a, 'upperArm' + side);
  const tg = sh.clone()
    .addScaledVector(dirW(a, sideSign, 0, 0), out * k)
    .addScaledVector(dirW(a, 0, 0, 1), fwd * k)
    .add(V(0, -drop * k, 0));
  return reachClamp(a, side, tg, { grip: .05, pole: [sideSign * .32, .02, .1] });
}
