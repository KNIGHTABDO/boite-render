// fix9_B.js — r02 staging helpers for group B (s08, s09, s10).
// Gaze and the look-mark both run after act() and erase head cues; a .84 arm clamp
// was stopping wrists at the sash, so fingers never reached a cheek or the lips.
import * as PO from '../../../engine/poses.js';
import { at, front } from './beatscene.js';

/** Wrist reach. max is a fraction of shoulder-to-wrist length (default .98, enough to touch the face). */
export function reachHand(a, side, target, opt = {}) {
  const sh = at(a, 'upperArm' + side);
  const len = sh.distanceTo(at(a, 'foreArm' + side)) + at(a, 'foreArm' + side).distanceTo(at(a, 'hand' + side));
  const maxR = len * (opt.max ?? .98);
  const d = target.clone().sub(sh);
  const tgt = d.length() > maxR ? sh.clone().addScaledVector(d.normalize(), maxR) : target;
  return PO.reach(a, side, tgt, opt);
}

/** Stop the gaze net (call inside act). Pair with look: () => null so the mark does not restamp the head. */
export function holdGaze(st) { if (st.G) st.G.apply = () => {}; }

/** Look at a world point, then add a head cue on top (x chin, y yaw, z tilt, radians). */
export function aimHead(a, target, { x = 0, y = 0, z = 0, max = .8 } = {}) {
  if (target) PO.look(a, target, .92, { max });
  a.B.head.rotation.x += x;
  a.B.head.rotation.y += y;
  a.B.head.rotation.z += z;
  a.B.head.updateWorldMatrix(false, true);
}

/** Index finger laid on the lips, the other fingers curled. */
export function fingerLips(a, side = 'R') {
  const k = a.group.scale.y / 1.6, sg = side === 'R' ? 1 : -1;
  const lips = front(a, 'head', .15 * k, sg * .01 * k, -.015 * k);
  reachHand(a, side, lips, { grip: 0, pole: [side === 'R' ? -.35 : .35, .48, .36], max: .99 });
  PO.fingers(a, side, .92, { each: [.3, 0, 1, 1, 1] });
}
