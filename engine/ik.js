// Inverse kinematics for the procedural rig (engine/rig3d.js).
// Everything works in WORLD space, so targets can be given in metres on the 3D stage
// (a cushion top, the rim of a tea glass, the floor...). Bone lengths come from the rest pose.
import * as THREE from 'three';

const _q = new THREE.Quaternion(), _qp = new THREE.Quaternion(), _qw = new THREE.Quaternion();
const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3();

export const wpos = (bone, off) => { bone.updateWorldMatrix(true, false); return off ? bone.localToWorld(new THREE.Vector3(...off)) : new THREE.Vector3().setFromMatrixPosition(bone.matrixWorld); };

/** rotate `bone` (minimal rotation) so that the world point `tip` (a child joint, or a point on the bone) points at `target` */
export function aim(bone, tip, target) {
  const p = wpos(bone), cur = (tip.isBone ? wpos(tip) : tip.clone()).sub(p).normalize(), want = target.clone().sub(p).normalize();
  if (cur.lengthSq() < 1e-9 || want.lengthSq() < 1e-9) return;
  _q.setFromUnitVectors(cur, want);
  bone.getWorldQuaternion(_qw); _qw.premultiply(_q);
  if (bone.parent) { bone.parent.getWorldQuaternion(_qp); _qw.premultiply(_qp.invert()); }
  bone.quaternion.copy(_qw); bone.updateWorldMatrix(false, true);
}

/**
 * Two-bone IK: upper -> lower -> end joint reaches `target`, the middle joint bends toward `pole` (a world point).
 * Returns the reach error in world units (0 when the target was reachable).
 */
export function twoBone(upper, lower, end, target, pole) {
  upper.updateWorldMatrix(true, true);
  const A = wpos(upper), Bp = wpos(lower), C = wpos(end);
  const l1 = A.distanceTo(Bp), l2 = Bp.distanceTo(C);
  const dir = target.clone().sub(A); let d = dir.length();
  const err = Math.max(0, d - (l1 + l2) * .999); d = Math.min(Math.max(d, Math.abs(l1 - l2) + 1e-4), (l1 + l2) * .999);
  const u = dir.normalize(), pv = pole.clone().sub(A); const v = pv.sub(u.clone().multiplyScalar(pv.dot(u))).normalize();
  const x = (l1 * l1 - l2 * l2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, l1 * l1 - x * x));
  const K = A.clone().addScaledVector(u, x).addScaledVector(v, h), T = A.clone().addScaledVector(u, d);
  aim(upper, lower, K); aim(lower, end, T);
  return err;
}

/** convenience: limbs of an actor. side 'L'|'R' */
export function leg(a, side, ankle, knee) { const B = a.B; return twoBone(B['thigh' + side], B['shin' + side], B['foot' + side], ankle, knee); }
export function arm(a, side, wrist, elbow) { const B = a.B; return twoBone(B['upperArm' + side], B['foreArm' + side], B['hand' + side], wrist, elbow); }
