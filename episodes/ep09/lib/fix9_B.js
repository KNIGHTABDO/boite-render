// fix9_B.js — r02 staging helpers for group B (s08, s09, s10).
// Gaze and the look-mark both run after act() and erase head cues; a .84 arm clamp
// was stopping wrists at the sash, so fingers never reached a cheek or the lips.
import * as PO from '../../../engine/poses.js';
import { at, front, V } from './beatscene.js';

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

/** Pull an authored head yaw back toward the camera until the face is within `max` degrees. */
export function openFace(a, cam, max = 94) {
  const head = a.B.head, y0 = head.rotation.y;
  const ang = (y) => {
    head.rotation.y = y;
    head.updateWorldMatrix(true, false);
    const hp = head.getWorldPosition(V());
    return head.localToWorld(V(0, 0, 1)).sub(hp).normalize().angleTo(cam.clone().sub(hp).normalize()) * 180 / Math.PI;
  };
  if (ang(y0) <= max) { head.rotation.y = y0; return; }
  let pick = y0, found = false, best = y0, bestA = ang(y0);
  for (let d = 0.02; d <= 1.8; d += 0.03) {
    for (const y of [y0 - d, y0 + d]) {
      const a1 = ang(y);
      if (a1 < bestA) { bestA = a1; best = y; }
      if (a1 <= max) { pick = y; found = true; break; }
    }
    if (found) break;
  }
  head.rotation.y = found ? pick : best;
  head.updateWorldMatrix(true, true);
}

/** Tuck the skull back onto a pillow after a look(), keeping the yaw that look set. */
export function seatHead(a, surface) {
  const gap = () => Math.abs(PO.lowestOf(a, ['head']) - surface);
  const fit = (bone) => {
    const x0 = bone.rotation.x;
    let best = x0, bestG = gap();
    if (bestG <= .018) return;
    for (let i = -16; i <= 16; i++) {
      bone.rotation.x = x0 + i * .03;
      bone.updateWorldMatrix(true, true);
      const g = gap();
      if (g < bestG) { bestG = g; best = bone.rotation.x; }
    }
    bone.rotation.x = best;
    bone.updateWorldMatrix(true, true);
  };
  fit(a.B.neck);
  fit(a.B.head);
}

/** Nudge chest pitch so the lowest chest vertex stays within 2cm of the mattress top. */
export function seatChest(a, top) {
  const B = a.B, x0 = B.chest.rotation.x;
  const gap = () => Math.abs(PO.lowestOf(a, ['chest']) - top);
  let best = x0, bestG = gap();
  if (bestG <= .018) return;
  for (let i = -10; i <= 10; i++) {
    B.chest.rotation.x = x0 + i * .012;
    B.chest.updateWorldMatrix(true, true);
    const g = gap();
    if (g < bestG) { bestG = g; best = B.chest.rotation.x; }
  }
  B.chest.rotation.x = best;
  B.chest.updateWorldMatrix(true, true);
}

/** Index finger laid on the lips, the other fingers curled. */
export function fingerLips(a, side = 'R') {
  const k = a.group.scale.y / 1.6, sg = side === 'R' ? 1 : -1;
  const lips = front(a, 'head', .15 * k, sg * .01 * k, -.015 * k);
  reachHand(a, side, lips, { grip: 0, pole: [side === 'R' ? -.35 : .35, .48, .36], max: .99 });
  PO.fingers(a, side, .92, { each: [.3, 0, 1, 1, 1] });
}
