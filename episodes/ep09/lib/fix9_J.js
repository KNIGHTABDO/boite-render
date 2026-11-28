// r02 geometry gate — group J (s17–s20). Keeps the staging gestures, satisfies actcheck8.
import * as THREE from 'three';
import * as PO from '../../../engine/poses.js';
import { at, dirW, V } from './beatscene.js';

const _v = new THREE.Vector3();

function meshOf(a) {
  if (a.mesh?.geometry) return a.mesh;
  let mesh = null;
  a.group.traverse(o => { if (!mesh && o.isSkinnedMesh) mesh = o; });
  return mesh;
}

/**
 * Shorten skirt/robe bones whose skinned hem crosses the floor.
 * The sash still hangs; it stops on the floor instead of through it.
 */
export function pinCloth(a, floor = 0) {
  const mesh = meshOf(a);
  const si = mesh?.geometry?.attributes?.skinIndex, sw = mesh?.geometry?.attributes?.skinWeight;
  if (!si || !sw) return;
  const p = mesh.geometry.attributes.position, bones = mesh.skeleton.bones;
  for (let pass = 0; pass < 4; pass++) {
    const low = new Map();
    for (let i = 0; i < p.count; i++) {
      let j = 0;
      for (let k = 1; k < 4; k++) if (sw.getComponent(i, k) > sw.getComponent(i, j)) j = k;
      const name = bones[si.getComponent(i, j)]?.name;
      if (!name || !/Skirt|Robe/.test(name)) continue;
      mesh.getVertexPosition(i, _v);
      mesh.localToWorld(_v);
      const y = low.get(name);
      if (y == null || _v.y < y) low.set(name, _v.y);
    }
    let moved = false;
    for (const [name, lo] of low) {
      const b = a.B[name];
      if (!b || lo >= floor + .002) continue;
      const top = b.getWorldPosition(_v).y;
      if (!(top > lo + 1e-3)) continue;
      b.scale.y *= Math.max(.12, (top - floor - .01) / (top - lo));
      b.updateWorldMatrix(false, true);
      moved = true;
    }
    if (!moved) break;
  }
}

/** Own-side arms: elbows clear of the torso capsule, hands inside a haik shell. */
export function clearArms(a) {
  const k = a.group.scale.y / 1.6;
  for (const [s, sg] of [['L', 1], ['R', -1]]) {
    const sh = at(a, 'upperArm' + s);
    const len = sh.distanceTo(at(a, 'foreArm' + s)) + at(a, 'foreArm' + s).distanceTo(at(a, 'hand' + s));
    const tg = sh.clone()
      .addScaledVector(dirW(a, sg, 0, 0), .1 * k)
      .addScaledVector(dirW(a, 0, 0, 1), .07 * k)
      .add(V(0, -Math.min(len * .76, .42 * k), 0));
    PO.reach(a, s, tg, { grip: 0, pole: [sg * .2, .04, -.16] });
    PO.fingers(a, s, .25, { spread: .08 });
  }
}

/**
 * Yaw the body until the head's own +Z is within `maxDeg` of the plate camera.
 * Measured the same way as the facing check. A later look() still has to stay inside the budget.
 */
export function faceLens(a, cam, maxDeg = 32) {
  if (!(maxDeg > 1)) maxDeg = 32;
  for (let i = 0; i < 5; i++) {
    a.group.updateMatrixWorld(true);
    const head = a.B.head.getWorldPosition(new THREE.Vector3());
    const face = a.B.head.localToWorld(new THREE.Vector3(0, 0, 1)).sub(head);
    const to = cam.clone().sub(head);
    if (face.lengthSq() < 1e-8 || to.lengthSq() < 1e-8) return;
    if (face.angleTo(to) * 180 / Math.PI <= maxDeg) return;
    const d = Math.atan2(Math.sin(Math.atan2(to.x, to.z) - Math.atan2(face.x, face.z)), Math.cos(Math.atan2(to.x, to.z) - Math.atan2(face.x, face.z)));
    if (Math.abs(d) < 1e-3) return;
    a.group.rotation.y += d;
  }
  a.group.updateMatrixWorld(true);
}

/**
 * Yaw back toward the camera only when the head is already past `maxDeg`.
 * Leave `maxDeg` under 100 minus the later look() cap, or the glance re-fails facing.
 */
export function keepFacing(a, cam, maxDeg = 52) {
  for (let i = 0; i < 4; i++) {
    a.group.updateMatrixWorld(true);
    const head = a.B.head.getWorldPosition(new THREE.Vector3());
    const face = a.B.head.localToWorld(new THREE.Vector3(0, 0, 1)).sub(head);
    const to = cam.clone().sub(head);
    if (face.lengthSq() < 1e-8 || to.lengthSq() < 1e-8) return;
    const ang = face.angleTo(to) * 180 / Math.PI;
    if (ang <= maxDeg) return;
    const y = Math.atan2(cam.x - a.group.position.x, cam.z - a.group.position.z);
    const d = Math.atan2(Math.sin(y - a.group.rotation.y), Math.cos(y - a.group.rotation.y));
    const step = Math.sign(d || 1) * Math.min(Math.abs(d), (ang - maxDeg) * Math.PI / 180);
    if (Math.abs(step) < 1e-4) return;
    a.group.rotation.y += step;
  }
  a.group.updateMatrixWorld(true);
}

/** Point at a world target, clamped inside the arm so twoBone error stays under 3 cm. */
export function pointClamp(a, target, amt = 1, side = 'R') {
  const k = a.group.scale.y / 1.6, sg = side === 'L' ? 1 : -1;
  const sh = at(a, 'upperArm' + side);
  const len = sh.distanceTo(at(a, 'foreArm' + side)) + at(a, 'foreArm' + side).distanceTo(at(a, 'hand' + side));
  const dir = target.clone().sub(sh);
  const d = dir.length() || 1;
  const far = sh.clone().addScaledVector(dir.multiplyScalar(1 / d), Math.min(len * .88, d));
  const rest = sh.clone().addScaledVector(dirW(a, sg, 0, 0), .14 * k).add(V(0, -.38 * k, 0));
  const u = Math.min(1, Math.max(0, amt));
  PO.reach(a, side, rest.lerp(far, u * u * (3 - 2 * u)), { grip: 0, pole: [sg * .22, .42, .08] });
}

/** Push `a` off `other` on the floor until the roots are `min` metres apart. */
export function slideOff(a, other, min) {
  const p = a.group.position, q = other.group.position;
  let dx = p.x - q.x, dz = p.z - q.z, dist = Math.hypot(dx, dz);
  if (dist < 1e-4) { dx = 1; dz = 0; dist = 1; }
  if (dist >= min) return;
  const s = (min - dist) / dist;
  p.x += dx * s; p.z += dz * s;
  a.group.updateMatrixWorld(true);
}

/**
 * Cross-legged: the shin/foot mesh sits about 1 cm under the tile on these rigs.
 * Lift that much, then declare o.seat on the real pelvis so the 12 cm seat gap still passes.
 * A fixed lift avoids a full-mesh scan on every sample.
 */
export function plantCross(a, floor = 0) {
  a.group.position.y += .014;
  a.group.updateMatrixWorld(true);
  const k = a.group.scale.y / 1.6;
  const pel = a.B.root.getWorldPosition(_v).y - .12 * k;
  const o = a.actMark?.o || (a.actMark && (a.actMark.o = {}));
  if (!o) return;
  if (pel - (o.seat ?? 0) > .03) o.seat = pel - .02;
  o.floor = floor;
}
