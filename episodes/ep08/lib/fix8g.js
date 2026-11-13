// s08 cloth repair. drapeRobe (engine/poses.js) does two things that read as broken cloth
// on a floor kneel:
//   1. It copies SkirtFront2 onto the kneecaps. That translation stretches the hip
//      panel into the inflated roll around the mother's waist.
//   2. When the back hem lands near the floor it aims SkirtBack2 ~0.3 m straight
//      behind the hips, then hemStop scales that bone. The scaled, rearward panel
//      is the triangular spike on the father's lower back.
// Both run again every frame from fix8.js, after the scene act. settleRobe() is
// applied later in the same frame (from the gaze hook) and replaces that drape:
// bones stay on their rest origins, they only rotate, then the hems shrink in
// place (uniform scale, plus a vertical lift) so nothing is dragged out behind the hips.
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

const owned = new WeakMap();
const _v = V(0, 0, 0);

// Dominant-bone vertices. lowestOf() ignores weights under 0.5, and the gate's
// extrema are exactly the ones that were still 18 cm through the floor.
function vertsFor(a, name) {
  let map = owned.get(a);
  if (!map) {
    map = new Map();
    const m = a.mesh, si = m.geometry.attributes.skinIndex, sw = m.geometry.attributes.skinWeight;
    const index = m.geometry.index?.array, n = index ? index.length : si.count, seen = new Set();
    for (let ii = 0; ii < n; ii++) {
      const i = index ? index[ii] : ii;
      if (seen.has(i)) continue;
      seen.add(i);
      let j = 0;
      for (let k = 1; k < 4; k++) if (sw.getComponent(i, k) > sw.getComponent(i, j)) j = k;
      const b = m.skeleton.bones[si.getComponent(i, j)];
      if (!b) continue;
      let list = map.get(b.name);
      if (!list) map.set(b.name, list = []);
      list.push(i);
    }
    owned.set(a, map);
  }
  return map.get(name) || [];
}

function lowY(a, name) {
  const ids = vertsFor(a, name), m = a.mesh;
  let lo = Infinity;
  for (let n = 0; n < ids.length; n++) {
    m.getVertexPosition(ids[n], _v);
    m.localToWorld(_v);
    if (_v.y < lo) lo = _v.y;
  }
  return lo;
}

// Uniform scale keeps the panel's direction (a Y-only scale on a flared offset
// swings the hem out into a fin). A leftover vertical lift clears cloth the
// scale cannot reach; it does not drag the joint sideways.
function seatHem(a, bone, name, floor) {
  if (!bone) return;
  bone.scale.set(1, 1, 1);
  bone.updateWorldMatrix(false, true);
  let lo = lowY(a, name);
  if (!(lo < floor + 0.008)) return;
  const top = IK.wpos(bone).y, span = top - lo;
  if (span > 0.02) {
    bone.scale.setScalar(Math.max(0.22, Math.min(0.94, (top - floor - 0.016) / span)));
    bone.updateWorldMatrix(false, true);
    lo = lowY(a, name);
  }
  for (let i = 0; i < 4 && lo < floor + 0.006; i++) {
    const before = lo;
    const p = bone.getWorldPosition(V(0, 0, 0));
    const dy = (floor + 0.012 - lo) / 0.7;
    p.y += dy;
    bone.position.copy(bone.parent.worldToLocal(p));
    bone.updateWorldMatrix(false, true);
    lo = lowY(a, name);
    if (before - lo < dy * 0.15) break;
  }
}

export function settleRobe(a, floor = 0, opt = {}) {
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
    const fo = opt.front ? opt.front.fwd : 0.08, fo1 = opt.front ? opt.front.over : 0.04;
    const over = kn.clone().addScaledVector(fwd, fo1 * k).add(V(0, 0.05 * k, 0));
    IK.aim(B.SkirtFront1, B.SkirtFront2, over);
    aimFar(B.SkirtFront2, IK.wpos(B.SkirtFront2, [0, -1, 0]), down.clone().addScaledVector(fwd, fo).normalize());
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
  // Shorten the upper back panel first, then aim the hem straight down again.
  seatHem(a, B.SkirtBack1, 'SkirtBack1', floor);
  aimFar(B.SkirtBack2, IK.wpos(B.SkirtBack2, [0, -1, 0]), hang);
  seatHem(a, B.SkirtBack2, 'SkirtBack2', floor);
  seatHem(a, B.SkirtFront2, 'SkirtFront2', floor);
  // opt-in (s08 mother): shrink the front panel so its fringed hem tucks against the knees instead of poking out onto the floor.
  if (opt.front && B.SkirtFront2) { B.SkirtFront2.scale.multiplyScalar(opt.front.scale); B.SkirtFront2.updateWorldMatrix(false, true); }
  seatHem(a, B.LeftRobe2, 'LeftRobe2', floor);
  seatHem(a, B.RightRobe2, 'RightRobe2', floor);
  if (opt.flank) for (const n of ['LeftRobe2', 'RightRobe2']) if (B[n]) { B[n].scale.multiplyScalar(opt.flank); B[n].updateWorldMatrix(false, true); }
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
