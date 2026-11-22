// Extra contact repairs for s10 / s11 / s17. fix8.js stays shared and untouched.
import * as THREE from 'three';
import * as IK from '../../../engine/ik.js';
import * as PO from '../../../engine/poses.js';
import { rest } from '../../../engine/rig3d.js';
import { toon } from '../../../engine/props3d.js';
import { staged as staged8, approach } from './fix8.js';
import { at, front, orient, dirW, V } from './beatscene.js';

export { approach };

const _hp = new THREE.Vector3(), _fwd = new THREE.Vector3(), _to = new THREE.Vector3();

// Hands beside the hips, clear of the torso capsule. The thigh pins from fix8
// fold the forearms through the belly and sit a few centimetres out of reach.
export function sidePins(a) {
  const k = a.group.scale.y / 1.6;
  a.group.updateMatrixWorld(true);
  a.pins = ['L', 'R'].map(side => {
    const sign = side === 'L' ? 1 : -1;
    const p = PO.hipToWorld(a, sign * .30 * k, .04 * k, .12 * k);
    return [side, a.B.root.worldToLocal(p)];
  });
}

// Re-apply that same rest after a speech gesture has folded an arm back in.
export function sideHold(a, sides = ['L', 'R']) {
  const k = a.group.scale.y / 1.6;
  let err = 0;
  for (const side of sides) {
    const sign = side === 'L' ? 1 : -1;
    err = Math.max(err, PO.reach(a, side, PO.hipToWorld(a, sign * .30 * k, .04 * k, .12 * k), {
      grip: .02, pole: side === 'L' ? [.42, .05, .15] : [-.42, .05, .15],
    }));
  }
  return err;
}

const ROBE = ['SkirtFront1', 'SkirtFront2', 'SkirtBack1', 'SkirtBack2', 'LeftRobe1', 'LeftRobe2', 'RightRobe1', 'RightRobe2'];

function restoreCloth(a) {
  for (const n of ROBE) {
    const b = a.B[n]; if (!b?.userData?.rest) continue;
    b.quaternion.copy(b.userData.rest); b.scale.set(1, 1, 1);
    if (b.parent?.isBone && b.userData.abs && b.parent.userData.abs) b.position.copy(b.userData.abs).sub(b.parent.userData.abs);
  }
  a.group.updateMatrixWorld(true);
}

// Shorten a cloth end-bone so its hem sits on `floor`. The bone stays at its rest
// length origin: scaling a translated skirt bone is what tore the djellaba into spikes.
function hemBone(a, bone, name, floor) {
  if (!bone) return;
  bone.scale.y = 1; bone.updateWorldMatrix(false, true);
  const lo = PO.lowestOf(a, [name]), top = IK.wpos(bone).y;
  if (!(top - lo > 1e-3) || lo >= floor + .004) return;
  bone.scale.y = Math.max(.22, (top - floor - .008) / (top - lo));
  bone.updateWorldMatrix(false, true);
}

/**
 * Stair crouch: pelvis on `seat`, soles on the tread below (`floor`), knees forward
 * and narrow so they stay inside the robe. The skirt keeps its rest bone lengths
 * and only aims over the knees, then the hem is shortened onto the lower tread.
 * Solved once at load; the caller stores the snap.
 */
export function seatCrouch(a, { seat = .6, floor = .4 } = {}) {
  const k = a.group.scale.y / 1.6, B = a.B;
  rest(B);
  B.spine.rotation.x = .26; B.chest.rotation.x = .12;
  PO.setHipY(a, seat + .12 * k);
  const reach = side => {
    const thigh = IK.wpos(B['thigh' + side]).distanceTo(IK.wpos(B['shin' + side]));
    const shin = IK.wpos(B['shin' + side]).distanceTo(IK.wpos(B['foot' + side]));
    return (thigh + shin) * .96;
  };
  const len = { L: reach('L'), R: reach('R') };
  let ankleY = floor + .055 * k;
  const plant = () => {
    const hy = IK.wpos(B.root).y;
    for (const [side, sign] of [['L', 1], ['R', -1]]) {
      let ankle = PO.hipToWorld(a, sign * .035 * k, ankleY - hy, .30);
      const hip = IK.wpos(B['thigh' + side]), gap = ankle.distanceTo(hip);
      if (gap > len[side]) ankle = hip.clone().lerp(ankle, len[side] / gap);
      const pole = PO.hipToWorld(a, sign * .04 * k, -.04 * k, .18);
      IK.leg(a, side, ankle, pole);
      const f = B['foot' + side]; f.rotation.set(0, 0, 0); f.updateWorldMatrix(false, true);
      IK.aim(f, IK.wpos(f, [0, 0, 1]), PO.hipToWorld(a, sign * .035 * k, ankleY - hy - .01, .72));
    }
  };
  for (let i = 0; i < 6; i++) {
    plant();
    const sole = Math.min(PO.lowestOf(a, ['footL']), PO.lowestOf(a, ['footR']));
    if (!Number.isFinite(sole) || Math.abs(sole - (floor + .008)) < .004) break;
    ankleY += floor + .008 - sole;
  }
  plant();
  // Column drape: cover the knees, do not drag SkirtFront2 out to them (that stretch is the spike).
  restoreCloth(a);
  if (B.SkirtFront1 && B.SkirtFront2) {
    const kn = IK.wpos(B.shinL).add(IK.wpos(B.shinR)).multiplyScalar(.5);
    IK.aim(B.SkirtFront1, B.SkirtFront2, kn.clone().add(new THREE.Vector3(0, .03 * k, 0)));
  }
  hemBone(a, B.SkirtFront2, 'SkirtFront2', floor);
  hemBone(a, B.LeftRobe2, 'LeftRobe2', floor);
  hemBone(a, B.RightRobe2, 'RightRobe2', floor);
  hemBone(a, B.SkirtBack2, 'SkirtBack2', seat + .012);
  for (const [bone, name, y] of [[B.SkirtFront2, 'SkirtFront2', floor], [B.LeftRobe2, 'LeftRobe2', floor], [B.RightRobe2, 'RightRobe2', floor], [B.SkirtBack1, 'SkirtBack1', floor], [B.SkirtBack2, 'SkirtBack2', floor]]) {
    const lo = bone && PO.lowestOf(a, [name]);
    if (bone && lo < floor + .002) hemBone(a, bone, name, Math.max(y, floor));
  }
  PO.setHipY(a, seat + .12 * k);
  // On the lap, not the kneecaps: a child's arms cannot close the last 11 cm to the shins.
  a.pins = ['L', 'R'].map(side => {
    const sign = side === 'L' ? 1 : -1;
    return [side, B.root.worldToLocal(PO.hipToWorld(a, sign * .16 * k, .02 * k, .08 * k))];
  });
  a.group.updateMatrixWorld(true);
}

/** Fatma Bziouya's little hand broom. Origin is the grip at the top of the handle; the head hangs below the hand. */
export function littleBroom() {
  const g = new THREE.Group();
  const stick = new THREE.Mesh(new THREE.CylinderGeometry(.011, .013, .36, 6), toon(0x8a5a32));
  stick.position.y = -.18; stick.castShadow = true;
  const bristle = new THREE.Mesh(new THREE.CylinderGeometry(.05, .07, .12, 7), toon(0x6d5a38));
  bristle.position.y = -.4; bristle.castShadow = true;
  g.add(stick, bristle);
  return g;
}

// Outward from this shoulder, in the horizontal. Keeps a hand on its own side of the chest.
function shoulderOut(a, side) {
  const out = at(a, 'upperArm' + side).sub(at(a, 'chest')); out.y = 0;
  if (out.lengthSq() < 1e-8) out.copy(dirW(a, 1, 0, 0));
  return out.normalize();
}
function poleSign(a, out) {
  return out.clone().applyQuaternion(a.group.quaternion.clone().invert()).x >= 0 ? 1 : -1;
}

/**
 * Hand just outside its own shoulder. `drop` is metres down from the shoulder (negative raises it),
 * `fwd` / `out` are adult metres scaled by height. Short enough that a child's arm can reach it,
 * and outside the torso capsule.
 */
export function handTo(a, side, { fwd = .1, out = .1, drop = .2, curl = .25, spread = .15 } = {}) {
  const k = a.group.scale.y / 1.6, lateral = shoulderOut(a, side), sh = at(a, 'upperArm' + side);
  const grip = sh.clone().addScaledVector(lateral, out * k).addScaledVector(dirW(a, 0, 0, 1), fwd * k).add(V(0, -drop * k, 0));
  const err = PO.reach(a, side, grip, { grip: .012, pole: [poleSign(a, lateral) * .5, .02, -.32] });
  if (curl != null) PO.fingers(a, side, curl, { spread });
  return err;
}

/** Park the broom in one hand, bristles down beside that thigh, clear of the chest and the face. */
export function holdBroom(a, broom, side = 'R') {
  const k = a.group.scale.y / 1.6, lateral = shoulderOut(a, side), sh = at(a, 'upperArm' + side);
  const grip = sh.clone().addScaledVector(lateral, .12 * k).add(V(0, -.26 * k, 0));
  PO.reach(a, side, grip, { grip: .012, pole: [poleSign(a, lateral) * .52, -.04, -.3] });
  PO.fingers(a, side, .45);
  orient(broom, PO.handPts(a, side).palm, V(0, 1, 0), lateral);
  broom.visible = a.group.visible;
}

export function staged(plate, marks, options = {}) {
  const sh = staged8(plate, marks, options);
  const load = sh.load;
  sh.load = async () => {
    await load();
    for (const [n, a] of Object.entries(sh.st.A || {})) {
      if (marks[n]?.pose === 'kneel') sidePins(a);
      if (marks[n]?.pose === 'step' && marks[n]?.o?.crouch) {
        seatCrouch(a, marks[n].o || {});
        if (sh.st.snaps) sh.st.snaps[n] = PO.snap(a);
        const i = sh.st.actors?.indexOf(a) ?? -1;
        if (i >= 0 && sh.heads && sh.S3) {
          const h = at(a, 'head');
          sh.heads[i] = sh.S3.project(h);
          sh.headOff[i] = h.clone().sub(a.group.position);
          const sole = h.clone(); sole.y -= .83 * a.group.scale.y;
          if (sh.bodyPx) sh.bodyPx[i] = sh.S3.project(sole)[1] - sh.heads[i][1];
        }
      }
    }
  };
  return sh;
}

// Slide `a` away from `b` along the floor until their pelvises are `gap` metres apart.
export function apart(a, b, gap) {
  const d = at(a, 'root').sub(at(b, 'root')); d.y = 0;
  const dist = d.length();
  if (dist < gap) {
    a.group.position.addScaledVector(dist < 1e-4 ? _to.set(1, 0, 0) : d.multiplyScalar(1 / dist), gap - dist);
    a.group.updateMatrixWorld(true);
  }
}

// Yaw the body toward the plate camera until the horizontal face normal is within `limit` radians.
// Look clamps still apply afterwards, so `limit` stays under the 100° facing budget.
export function yawToward(a, cam, limit = 1.15) {
  if (!cam) return;
  a.group.updateMatrixWorld(true);
  a.B.head.getWorldPosition(_hp);
  _fwd.copy(a.B.head.localToWorld(new THREE.Vector3(0, 0, 1))).sub(_hp);
  _fwd.y = 0; if (_fwd.lengthSq() < 1e-8) return; _fwd.normalize();
  _to.copy(cam.position).sub(_hp); _to.y = 0; if (_to.lengthSq() < 1e-8) return; _to.normalize();
  const ang = Math.acos(Math.min(1, Math.max(-1, _fwd.dot(_to))));
  if (ang <= limit) return;
  const d = Math.atan2(_to.x, _to.z) - Math.atan2(_fwd.x, _fwd.z);
  const turn = Math.atan2(Math.sin(d), Math.cos(d));
  a.group.rotation.y += turn - Math.sign(turn) * limit;
  a.group.updateMatrixWorld(true);
}
