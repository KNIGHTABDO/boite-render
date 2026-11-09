// s08 cloth repair. drapeRobe (engine/poses.js) does two things that read as broken cloth
// on a floor kneel:
//   1. It copies SkirtFront2 onto the kneecaps. That translation stretches the hip
//      panel into the inflated roll around the mother's waist.
//   2. When the back hem lands near the floor it aims SkirtBack2 ~0.3 m straight
//      behind the hips, then hemStop scales that bone. The scaled, rearward panel
//      is the triangular spike on the father's lower back.
// Both run again every frame from fix8.js, after the scene act. settleRobe() is
// applied later in the same frame (from the gaze hook) and replaces that drape:
// bones stay on their rest origins, they only rotate, and the end bones shorten
// along their own axis so the hem meets the floor without a sideways fin.
import * as PO from '../../../engine/poses.js';
import * as IK from '../../../engine/ik.js';
import { reachSafe } from './fix8a.js';
import { at, V, dirW } from './beatscene.js';

const ROBE = ['SkirtFront1', 'SkirtFront2', 'SkirtBack1', 'SkirtBack2', 'LeftRobe1', 'LeftRobe2', 'RightRobe1', 'RightRobe2'];

function restoreCloth(a) {
  for (const n of ROBE) {
    const b = a.B[n];
    if (!b?.userData?.rest) continue;
    b.quaternion.copy(b.userData.rest);
    b.scale.set(1, 1, 1);
    if (b.parent?.isBone && b.userData.abs && b.parent.userData.abs) b.position.copy(b.userData.abs).sub(b.parent.userData.abs);
  }
  a.group.updateMatrixWorld(true);
}

// Shorten an end bone along its own axis. The origin stays put: scaling a bone
// that has been moved off its rest joint is what tore the hem into a spike.
function hemBone(a, bone, name, floor) {
  if (!bone) return;
  bone.scale.set(1, 1, 1);
  bone.updateWorldMatrix(false, true);
  const lo = PO.lowestOf(a, [name]), top = IK.wpos(bone).y;
  if (!(top - lo > 1e-3) || lo >= floor + 0.008) return;
  bone.scale.y = Math.max(0.28, (top - floor - 0.012) / (top - lo));
  bone.updateWorldMatrix(false, true);
}

export function settleRobe(a, floor = 0) {
  const B = a.B;
  if (!B.SkirtBack1 || !B.SkirtBack2) return;
  restoreCloth(a);
  const k = a.group.scale.y / 1.6;
  const hip = IK.wpos(B.root);
  const fwd = dirW(a, 0, 0, 1), back = fwd.clone().negate();
  const down = V(0, -1, 0);
  const aimFar = (bone, tip, dir) => IK.aim(bone, tip, IK.wpos(bone).addScaledVector(dir, 1));
  // Front and flanks rotate toward the lap. SkirtFront2 is not dragged out to the knees.
  if (B.SkirtFront1 && B.SkirtFront2) {
    const kn = IK.wpos(B.shinL).add(IK.wpos(B.shinR)).multiplyScalar(0.5);
    const over = kn.clone().addScaledVector(fwd, 0.04 * k).add(V(0, 0.05 * k, 0));
    IK.aim(B.SkirtFront1, B.SkirtFront2, over);
    aimFar(B.SkirtFront2, IK.wpos(B.SkirtFront2, [0, -1, 0]), down.clone().addScaledVector(fwd, 0.08).normalize());
  }
  for (const [s, sign, shin] of [['Left', 1, 'shinL'], ['Right', -1, 'shinR']]) {
    const upper = B[s + 'Robe1'], lower = B[s + 'Robe2'];
    if (!upper || !lower) continue;
    const side = dirW(a, sign, 0, 0);
    const knee = IK.wpos(B[shin]);
    IK.aim(upper, lower, knee.clone().addScaledVector(side, 0.03 * k).add(V(0, 0.04 * k, 0)));
    aimFar(lower, IK.wpos(lower, [0, -1, 0]), down.clone().addScaledVector(side, 0.05).addScaledVector(fwd, 0.04).normalize());
  }
  // Back panel hangs almost straight down, a few centimetres behind the hips.
  const hang = down.clone().addScaledVector(back, 0.06).normalize();
  IK.aim(B.SkirtBack1, B.SkirtBack2, hip.clone().addScaledVector(hang, 0.5));
  aimFar(B.SkirtBack2, IK.wpos(B.SkirtBack2, [0, -1, 0]), hang);
  for (let pass = 0; pass < 2; pass++) {
    hemBone(a, B.SkirtFront2, 'SkirtFront2', floor);
    hemBone(a, B.LeftRobe2, 'LeftRobe2', floor);
    hemBone(a, B.RightRobe2, 'RightRobe2', floor);
    hemBone(a, B.SkirtBack2, 'SkirtBack2', floor);
  }
}

/** Push a palm target forward until it clears the head, so a raised hand stops short of the cheek. */
export function clearFace(a, p, gap = 0.11) {
  const head = at(a, 'head'), fwd = dirW(a, 0, 0, 1);
  const rel = p.clone().sub(head), along = rel.dot(fwd);
  const lateral = rel.addScaledVector(fwd, -along);
  if (lateral.length() < 0.18 * (a.group.scale.y / 1.6) + 0.06 && along < gap) p.addScaledVector(fwd, gap - along + 0.01);
  return p;
}

export function palm(a, side, point, opt = {}) {
  return reachSafe(a, side, clearFace(a, point, opt.gap), opt);
}
