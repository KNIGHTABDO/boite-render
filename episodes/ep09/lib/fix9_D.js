// ep09 r02 group D. Shared bed staging (s15, s16) and the stair haik veil (s13).
import * as THREE from 'three';
import * as PO from '../../../engine/poses.js';
import * as PR from '../../../engine/props3d.js';
import * as K from '../../../engine/core.js';
import { V } from './beatscene.js';

// Hip on the right divan. A mark on the pillow (1230) leaves the chest off the painted mattress.
// Feet run along the divan, short of the wooden chest. Scale is the cast height.
export const DIVAN_AT = [1310, 630];
export const DIVAN_FEET = [.92, .18];
export const BED_TOP = .26;
export const BOY_H = 1.1;

/** lieOnBed, but the roll (`turn`) is part of the solve so a toss or a bury-into-the-pillow sticks. */
export function lieTurn(a, { top, feet = DIVAN_FEET, hands = 'belly', pillow = .03, tuck = .16, headTurn = 0, turn = 0, sink = .012, origin } = {}) {
  if (origin) { a.group.position.x = origin.x; a.group.position.z = origin.z; }
  a.group.rotation.y = Math.atan2(feet[0], feet[1]);
  const key = [top, feet[0], feet[1], hands, pillow, tuck, headTurn.toFixed(3), turn.toFixed(3), sink, a.group.scale.y, a.group.position.x.toFixed(3), a.group.position.z.toFixed(3)].join('|');
  if (a._d9lie?.key !== key) {
    const B = a.B;
    a.group.updateMatrixWorld(true);
    PO.lie(a, { top, turn, pillow, natural: true, sink, hands, headTurn });
    for (const [s, sign] of [['L', 1], ['R', -1]]) {
      B['thigh' + s].rotation.x = -.04; B['thigh' + s].rotation.z = sign * .04;
      B['foot' + s].rotation.x = .35; B['foot' + s].rotation.y = sign * .22;
      let lo = -.15, hi = .6;
      for (let i = 0; i < 10; i++) {
        const m = (lo + hi) / 2; B['shin' + s].rotation.x = m; a.group.updateMatrixWorld(true);
        if (PO.lowestOf(a, ['shin' + s, 'foot' + s]) < top - .005) hi = m; else lo = m;
      }
    }
    a.group.updateMatrixWorld(true);
    PO.settle(a, top - sink);
    let lo = -.3, hi = .9;
    for (let i = 0; i < 12; i++) {
      const m = (lo + hi) / 2; B.neck.rotation.x = m * .6 + tuck * .6; B.head.rotation.x = m * .4 + tuck * .4;
      a.group.updateMatrixWorld(true);
      if (PO.lowestOf(a, ['head']) < top + pillow) lo = m; else hi = m;
    }
    B.head.rotation.y = headTurn; B.neck.rotation.y = headTurn * .2;
    a.group.updateMatrixWorld(true);
    a._d9lie = { key, snap: PO.snap(a) };
  } else PO.apply(a, a._d9lie.snap);
  return a;
}

/** Thin blanket on the body (not a slab under the feet). `along` 0 = head, 1 = hip. */
export function blanketOn(S3, st, a, { top = BED_TOP, col = 0x6e4038, along = .62, w = .34, l = .5, h = .045, lift = .1 } = {}) {
  const head = a.B.head.getWorldPosition(V(0, 0, 0));
  const hip = a.B.root.getWorldPosition(V(0, 0, 0));
  const p = head.clone().lerp(hip, along);
  if (!st.cover) st.cover = PR.blanket({ w, l, h, col });
  st.cover.userData.ambient = true;
  S3.prop(st.cover, p.x, top + lift, p.z, a.group.rotation.y);
  st.cover.visible = true;
  return p;
}

/** Hands may sit on the chest, but not above the skull, and not on the torso centreline. */
export function lowerHands(a, maxDy = .05) {
  const headY = a.B.head.getWorldPosition(V()).y;
  const k = a.group.scale.y / 1.6;
  for (const [s, sign] of [['L', 1], ['R', -1]]) {
    const h = a.B['hand' + s].getWorldPosition(V());
    if (h.y <= headY + maxDy) continue;
    const chest = a.B.chest.getWorldPosition(V());
    const away = h.clone().sub(chest);
    away.y = 0;
    if (away.lengthSq() < 1e-6) away.set(sign, 0, 0);
    const tgt = h.clone();
    tgt.y = headY + maxDy - .01;
    tgt.addScaledVector(away.normalize(), .05 * k);
    const sh = a.B['upperArm' + s].getWorldPosition(V());
    const elbow = a.B['foreArm' + s].getWorldPosition(V());
    const len = sh.distanceTo(elbow) + elbow.distanceTo(h);
    const d = tgt.clone().sub(sh);
    if (d.length() > len * .86) tgt.copy(sh).addScaledVector(d.normalize(), len * .86);
    PO.reach(a, s, tgt, { grip: .02, pole: [sign * .5, .02, .25] });
  }
}

/** White panel over the open haik, from the lower chest to the hips. Below the chin. */
export function haikVeil(S3, st, a) {
  if (!st.veil) {
    const g = new THREE.Group(), mat = PR.toon(0xf7f3ea);
    const top = new THREE.Mesh(new THREE.BoxGeometry(.32, .2, .03), mat);
    const low = new THREE.Mesh(new THREE.BoxGeometry(.28, .24, .028), mat);
    low.position.set(0, -.2, .006);
    g.add(top, low);
    g.userData.ambient = true;
    st.veil = g;
  }
  st.veil.userData.ambient = true;
  const chest = a.B.chest.getWorldPosition(V(0, 0, 0)), yaw = a.group.rotation.y;
  S3.prop(st.veil, chest.x + Math.sin(yaw) * .16, chest.y - .3, chest.z + Math.cos(yaw) * .16, yaw);
}
