// fix8_lie.js (r15 group F): one robust "child lying on a divan" pose + clean palm contacts + floor kneel helpers.
import * as THREE from 'three';
import * as PO from '../../../engine/poses.js';
import { aim } from '../../../engine/ik.js';
import * as PR from '../../../engine/props3d.js';

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

/**
 * Re-pose actor `a` (already placed by staged() with pose 'lie') flat on its back on the mattress top (world y = top),
 * at the cast scale (never touched), legs straight, body diagonal to the divan so the camera sees its length,
 * head on a pillow, chin slightly tucked so the face reads. Call EVERY frame from act(): the solve runs once per actor
 * and key, later frames re-apply the snapshot. `feet` = [dx, dz] world direction head -> feet.
 */
export function lieOnBed(a, { top, feet = [.5, .87], hands = 'chest', pillow = .1, tuck = .22, headTurn = 0, sink = .012, origin } = {}) {
  if (origin) { a.group.position.x = origin.x; a.group.position.z = origin.z; }
  a.group.rotation.y = Math.atan2(feet[0], feet[1]);
  const key = [top, feet[0], feet[1], hands, pillow, tuck, headTurn, a.group.scale.y, a.group.position.x, a.group.position.z].join('|');
  if (a._f8lie?.key !== key) {
    const B = a.B;
    a.group.updateMatrixWorld(true);
    PO.lie(a, { top, turn: 0, pillow, natural: true, sink, hands, headTurn });
    for (const [s, sign] of [['L', 1], ['R', -1]]) {            // near-straight legs, heels resting on the cloth, feet falling slightly outward
      B['thigh' + s].rotation.x = -.03; B['thigh' + s].rotation.z = sign * .035; B['foot' + s].rotation.x = .3; B['foot' + s].rotation.y = sign * .2;
      let lo = -.15, hi = .6;
      for (let i = 0; i < 10; i++) { const m = (lo + hi) / 2; B['shin' + s].rotation.x = m; a.group.updateMatrixWorld(true); if (PO.lowestOf(a, ['shin' + s, 'foot' + s]) < top - .005) hi = m; else lo = m; }
    }
    a.group.updateMatrixWorld(true);
    PO.settle(a, top - sink);                                      // lowest skinned vertex (back, skirt, heels) rests on the cloth
    let lo = -.3, hi = .9;                                         // chin tucked, then the back of the skull on the pillow
    for (let i = 0; i < 12; i++) { const m = (lo + hi) / 2; B.neck.rotation.x = m * .6 + tuck * .6; B.head.rotation.x = m * .4 + tuck * .4; a.group.updateMatrixWorld(true); if (PO.lowestOf(a, ['head']) < top + pillow) lo = m; else hi = m; }
    B.head.rotation.y = headTurn; B.neck.rotation.y = headTurn * .2;
    a.group.updateMatrixWorld(true);
    a._f8lie = { key, snap: PO.snap(a) };
  } else PO.apply(a, a._f8lie.snap);
  return a;
}

/** idempotent pillow under the lying head (re-added whenever the shot reset detached it) */
export function pillowUnder(S3, st, a, { top, h = .1, col = 0x647c7c, w = .46, d = .34 } = {}) {
  st.pillow ||= PR.cushion({ w, d, h, col });
  const p = a.B.head.localToWorld(V(0, .02, -.02));
  S3.prop(st.pillow, p.x, top + h / 2 - .004, p.z, a.group.rotation.y);
  st.pillow.visible = true;
  return st.pillow;
}

/** shared contact solve: palm lands on a head-local spot, hand axis aimed at a head-local tip, wrist corrected */
function palmsAt(a, spot, tip, pole, fing) {
  const B = a.B;
  for (const s of ['L', 'R']) {
    const sign = s === 'L' ? 1 : -1, skin = () => B.head.localToWorld(V(sign * spot[0], spot[1], spot[2]));
    let wrist = skin();
    for (let i = 0; i < 4; i++) {
      const p = skin();
      PO.reach(a, s, wrist, { grip: 0, pole: [sign * pole[0], pole[1], pole[2]] });
      aim(B['hand' + s], PO.handPts(a, s).end, B.head.localToWorld(V(sign * tip[0], tip[1], tip[2])));
      wrist.add(p.clone().sub(PO.handPts(a, s).palm));
    }
    PO.fingers(a, s, fing[0], { thumb: fing[0], spread: fing[1] });
  }
}

/** both palms flat over the closed eyes (fingers up over the brow), wrists clear of the jaw */
export function palmsOverEyes(a, { bow = .3 } = {}) {
  a.B.chest.rotation.x += .07; a.B.neck.rotation.x += bow; a.group.updateMatrixWorld(true);
  palmsAt(a, [.088, .075, .065], [.03, .17, .04], [.9, .15, .1], [.02, .06]);
}

/** both palms on the temples/headscarf sides, fingers pointing up the sides of the head (not on the jaw) */
export function palmsAtTemples(a, { bow = .06 } = {}) {
  a.B.chest.rotation.x += .04; a.B.neck.rotation.x += bow; a.group.updateMatrixWorld(true);
  palmsAt(a, [.09, .085, .02], [.02, .15, .0], [.7, .2, -.05], [.03, .3]);
}

/**
 * r25L: hands cradling the face, placed from the rig's own eye coordinates (the old fixed head-local spots landed beside
 * the ears and pushed the fingers into the headscarf). mode 'cradle': L palm on the brow/temple-side of the eye, R palm
 * under the cheek, asymmetric, elbows in; mode 'eyes': both palms over the eyes. `u` (0..1 breathing/sob phase) moves
 * the hands a few mm; `out` is the standoff from the skin (m, head-local) so fingers stay off the scarf.
 */
export function cradleFace(a, { mode = 'cradle', bow = .12, u = 0, out = .02 } = {}) {
  const B = a.B, F = a.S.face, hy = a.S.head;
  a.B.chest.rotation.x += .05; B.neck.rotation.x += bow; a.group.updateMatrixWorld(true);
  const eye = { L: F.eyeL, R: F.eyeR };
  const spec = s => {
    const e = eye[s], sg = s === 'L' ? 1 : -1, ex = Math.abs(e[0]) * sg, ey = e[1] - hy, ez = e[2];
    if (mode === 'eyes') return { spot: [ex * .9, ey - .005, ez + out], tip: [ex * .8, ey + .1, ez + out * .6], pole: [sg * .35, -.05, .3], fing: [.04, .05] };
    if (s === 'L') return { spot: [ex * 1.05, .072 + .004 * u, .07 + out * .5], tip: [ex * .6, .2, ez * .9 + .03], pole: [sg * .3, -.1, .3], fing: [.1, .04] };   // cheek cupped, fingers up the cheekbone toward the eye
    return { spot: [ex * .8, .055 - .004 * u, .085 + out * .5], tip: [ex * .9, .17, ez * .8], pole: [sg * .7, -.05, .35], fing: [.18, .08] };   // chin/jaw cupped, lower than the other hand
  };
  for (const s of ['L', 'R']) {
    const sign = s === 'L' ? 1 : -1, sp = spec(s), skin = () => B.head.localToWorld(V(sp.spot[0], sp.spot[1], sp.spot[2]));
    let wrist = skin();
    for (let i = 0; i < 4; i++) {
      const p = skin();
      PO.reach(a, s, wrist, { grip: 0, pole: sp.pole });
      aim(B['hand' + s], PO.handPts(a, s).end, B.head.localToWorld(V(sp.tip[0], sp.tip[1], sp.tip[2])));
      wrist.add(p.clone().sub(PO.handPts(a, s).palm));
    }
    PO.fingers(a, s, sp.fing[0], { thumb: sp.fing[0], spread: sp.fing[1] });
  }
}
