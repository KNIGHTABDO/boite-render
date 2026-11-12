// R15E helpers: hands on a face using the actor's own measured face (S.face), and which arm points at someone.
import * as PO from '../../../engine/poses.js';
import * as IK from '../../../engine/ik.js';
import { THREE } from './autostage.js';

/** head-local skin point for a palm: kind 'cheek' (outer cheek of `side`) or 'eyes' (palm over the eye of `side`) */
export function faceLocal(a, side, kind) {
  const S = a.S, f = S.face, sg = side === 'L' ? 1 : -1;
  const eyeY = (f.eyeL[1] + f.eyeR[1]) / 2 - S.head, mouthY = f.mouth[1] - S.head, ex = Math.abs(f.eyeL[0] - f.eyeR[0]) / 2;
  // 'cover': palms on the mouth/chin with the fingers up over the eyes ('hands-face' gate keeps palms within .12 m of the head bone)
  if (kind === 'eyes') return new THREE.Vector3(sg * .03, .055, .095);
  if (kind === 'cheeks') return new THREE.Vector3(sg * .09, .045, .05);
  return new THREE.Vector3(sg * (ex + .035), (eyeY + mouthY) / 2 - .01, .055);
}

/** palm on the face; the head is turned/bowed first, then the hand is solved against the head's final pose */
export function handOnFace(a, side, kind, { pitch = 0 } = {}) {
  const B = a.B;
  if (pitch) { B.neck.rotation.x += pitch * .5; B.head.rotation.x += pitch * .5; B.neck.updateWorldMatrix(false, true); }
  a.group.updateMatrixWorld(true);
  const loc = faceLocal(a, side, kind), sg = side === 'L' ? 1 : -1, k = a.group.scale.y / 1.6;
  const skin = () => B.head.localToWorld(loc.clone()), pole = [sg * .95, .9, .05];
  for (let i = 0; i < 3; i++) PO.reach(a, side, skin(), { grip: 0, pole });
  const c = B.head.localToWorld(new THREE.Vector3(0, loc.y, 0));
  IK.aim(B['hand' + side], PO.handPts(a, side).end, B.head.localToWorld(new THREE.Vector3(loc.x * .3, loc.y + .09, .02)));
  const into = c.clone().sub(PO.handPts(a, side).palm);
  if (into.lengthSq() > 1e-6) PO.palmTo(a, side, 1, into.normalize());
  PO.fingers(a, side, .03, { thumb: .03, spread: .4 });
  return k;
}

/** the arm ('L'|'R') of `a` that points toward `other` (world x/z) */
export function armToward(a, other) {
  const l = IK.wpos(a.B.upperArmL), r = IK.wpos(a.B.upperArmR), ax = l.sub(r).setY(0);
  const d = IK.wpos(other.B.chest).sub(IK.wpos(a.B.chest)).setY(0);
  return ax.dot(d) >= 0 ? 'L' : 'R';
}
