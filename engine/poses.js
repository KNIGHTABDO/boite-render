// Calculated poses built on engine/ik.js. Targets are in metres, relative to the hip,
// in the actor's own frame (x = actor's left, y = up, z = forward), measured on a 1.6 m adult
// and scaled by the actor's height. Verified in test/proto/seat.html (front, side, 3/4).
import * as THREE from 'three';
import { rest } from './rig3d.js';
import * as IK from './ik.js';

const _v = new THREE.Vector3(), _s = new THREE.Vector3(), UP = new THREE.Vector3(0, 1, 0);

/** move the root bone so the hip sits at world height `y` (metres) */
export function setHipY(a, y) {
  const r = a.B.root; a.group.updateMatrixWorld(true);
  const cur = _v.setFromMatrixPosition(r.matrixWorld).y; r.parent.getWorldScale(_s);
  r.position.y += (y - cur) / _s.y; a.group.updateMatrixWorld(true);
}

/** hip-relative local metres (already scaled) -> world */
export function hipToWorld(a, x, y, z) {
  const h = new THREE.Vector3().setFromMatrixPosition(a.B.root.matrixWorld);
  return new THREE.Vector3(x, y, z).applyAxisAngle(UP, a.group.rotation.y).add(h);
}

/**
 * Cross-legged on the floor (or on a cushion: pass seat = cushion top height in metres).
 * Reached targets on Zoubida 1.6 m: hip .16 m, knees .11-.12 m, ankles .07-.08 m, toes ~1 cm above the floor,
 * wrists on the lap at .27 m. `hands: false` leaves the arms for the caller (pouring, reaching...).
 * Returns the IK reach errors in metres (all 0 when the pose is exact).
 */
export function crossLegged(a, { seat = 0, lean = .1, hands = true, cross = 'L' } = {}) {
  const k = a.group.scale.y / 1.6, B = a.B, s = cross === 'L' ? 1 : -1;
  rest(B); B.spine.rotation.x = lean;
  setHipY(a, seat + .16 * k);
  const W = (x, y, z) => hipToWorld(a, x * k, y * k, z * k);
  const err = [
    IK.leg(a, 'L', W(-.05 * s, -.09 + (s > 0 ? 0 : .01), s > 0 ? .30 : .36), W(.30, -.04, .22)),
    IK.leg(a, 'R', W(.05 * s, -.09 + (s > 0 ? .01 : 0), s > 0 ? .36 : .30), W(-.30, -.03, .22)),
  ];
  drapeLap(a, seat);
  if (hands) err.push(lapHands(a));
  return err;
}

/** lap sheet of a robe (rig loaded with seat:true): stretched from the hip over the knees, then falling to the floor */
export function drapeLap(a, floor = 0) {
  const B = a.B; if (!B.lap) return; a.group.updateMatrixWorld(true);
  const k = a.group.scale.y / 1.6, kn = IK.wpos(B.shinL).add(IK.wpos(B.shinR)).multiplyScalar(.5);
  const fwd = new THREE.Vector3(0, 0, 1).applyAxisAngle(UP, a.group.rotation.y);
  const over = kn.clone().addScaledVector(UP, .05 * k).addScaledVector(fwd, .02 * k);
  IK.aim(B.lap, B.lapD, over);
  B.lapD.position.copy(B.lapD.parent.worldToLocal(over.clone()));
  B.lapD.updateWorldMatrix(true, false);
  B.lapD.scale.y = 1; B.lapD.updateWorldMatrix(false, true);
  IK.aim(B.lapD, IK.wpos(B.lapD, [0, -1, 0]), over.clone().addScaledVector(fwd, .03 * k).setY(floor));
  // the sheet is cut for a standing robe: shorten it so its hem just reaches the floor instead of going through it
  const lo = lapLowest(a), drop = over.y - floor;
  if (lo < floor && over.y - lo > 1e-3) { B.lapD.scale.y = Math.max(.2, (drop - .005 * k) / (over.y - lo)); B.lapD.updateWorldMatrix(false, true); }
}

/** lowest world y of the fabric carried by the lap sheet */
const lapLowest = a => lowestOf(a, ['lapD']);

/** solved poses are costly (0.3-0.6 s): solve once per shot, keep the bone state, re-apply it each frame */
export function snap(a) { const s = {}; for (const [n, b] of Object.entries(a.B)) s[n] = [b.position.clone(), b.quaternion.clone(), b.scale.clone()]; return s; }
export function apply(a, s) { for (const [n, [p, q, k]] of Object.entries(s)) { const b = a.B[n]; b.position.copy(p); b.quaternion.copy(q); b.scale.copy(k); } a.group.updateMatrixWorld(true); }

/** both wrists resting on the lap, elbows out and slightly back */
export function lapHands(a, { spread = .11, fwd = .22, lift = .15 } = {}) {
  const k = a.group.scale.y / 1.6, W = (x, y, z) => hipToWorld(a, x * k, y * k, z * k);
  return Math.max(IK.arm(a, 'L', W(spread, lift, fwd), W(.24, .25, -.05)), IK.arm(a, 'R', W(-spread, lift, fwd), W(-.24, .25, -.05)));
}

/**
 * one hand to a world point (a teapot handle, a glass): the PALM lands on `target` (the wrist stops `grip` metres short,
 * along the shoulder->target line). Elbow pole in hip-relative metres. Returns the reach error (m).
 */
export function reach(a, side, target, { pole = side === 'L' ? [.3, .2, -.1] : [-.3, .2, -.1], grip = .07 } = {}) {
  const k = a.group.scale.y / 1.6, sh = IK.wpos(a.B['upperArm' + side]);
  const wrist = target.clone().addScaledVector(sh.clone().sub(target).normalize(), grip * k);
  return IK.arm(a, side, wrist, hipToWorld(a, pole[0] * k, pole[1] * k, pole[2] * k));
}

/** world points of a hand: wrist, palm centre, finger end (from the rig's rest hand segment) */
export function handPts(a, side) {
  const B = a.B, h = B['hand' + side], k = side === 'L' ? 1 : -1, S = a.S;
  const tip = new THREE.Vector3(k * S.hand[0], S.hand[1], 0).sub(h.userData.abs);
  a.group.updateMatrixWorld(true);
  return { wrist: IK.wpos(h), palm: h.localToWorld(tip.clone().multiplyScalar(.45)), end: h.localToWorld(tip.clone()) };
}

/**
 * close a hand round a handle: the palm sits on the handle bar, the fingers point through the loop toward `inside`
 * (the vessel's centre), the wrist stays outside the loop. Elbow out and down. Returns the palm-to-handle error (m).
 */
export function grip(a, side, handle, inside, { pole = side === 'L' ? [.38, .05, -.12] : [-.38, .05, -.12] } = {}) {
  const k = a.group.scale.y / 1.6, out = handle.clone().sub(inside).setY(0).normalize();
  let wrist = handle.clone().addScaledVector(out, .045 * k);
  for (let i = 0; i < 4; i++) {                       // wrist -> aim -> measure palm, nudge the wrist by the miss
    IK.arm(a, side, wrist, hipToWorld(a, pole[0] * k, pole[1] * k, pole[2] * k));
    const h = a.B['hand' + side]; IK.aim(h, handPts(a, side).end, inside);
    wrist.add(handle.clone().sub(handPts(a, side).palm));
  }
  return handPts(a, side).palm.distanceTo(handle);
}

/** turn the head (and part of the neck) so the face looks at a world point; amt < 1 keeps some of the old pose */
export function look(a, target, amt = .85) {
  const B = a.B; a.group.updateMatrixWorld(true);
  for (const [b, w] of [[B.neck, amt * .35], [B.head, amt]]) {
    const q0 = b.quaternion.clone();
    IK.aim(b, b.localToWorld(new THREE.Vector3(0, 0, .1)), target);
    b.quaternion.copy(q0.slerp(b.quaternion, w)); b.updateWorldMatrix(false, true);
  }
}

/**
 * pour tea: the pot is placed so its spout tip is `lift` m above the glass rim, turned `yaw` (rad, actor frame;
 * ~1.1 = spout forward-across, handle back toward the pouring hand) and tipped `tilt`; the hand grips the handle,
 * the eyes follow the glass. Verified in test/proto/stage.html (palm on handle 1 mm, stream lands in the glass).
 * Returns { err, spout, land } (world) for PR.stream().
 */
export function pour(a, pot, glass, { side = 'R', lift = .15, tilt = .75, yaw = 1.1, gaze = true } = {}) {
  const rim = glass.localToWorld(glass.userData.rim.clone());
  pot.rotation.set(0, 0, 0); pot.rotation.order = 'YXZ'; pot.rotation.y = a.group.rotation.y + (side === 'R' ? yaw : -yaw); pot.rotation.x = tilt; pot.updateMatrixWorld(true);
  const spout = rim.clone().add(new THREE.Vector3(0, lift, 0));
  pot.position.copy(spout).sub(pot.userData.spout.clone().applyQuaternion(pot.quaternion));
  if (pot.parent) pot.position.sub(pot.parent.getWorldPosition(new THREE.Vector3()));
  pot.updateMatrixWorld(true);
  const err = grip(a, side, pot.localToWorld(pot.userData.handle.clone()), pot.localToWorld(new THREE.Vector3(0, .09, 0)));
  if (gaze) look(a, rim);
  return { err, spout, land: rim.clone().add(new THREE.Vector3(0, -glass.userData.h * .7, 0)) };
}

/**
 * kneeling, sitting back on the heels (at the brazier, by a bed): knees on the floor in front, shins flat back under the hips.
 * Solved from the rig's own bone lengths: knee joint `pad` m above the seat (the robe round the shin is ~.13 m thick below
 * the bone), ankle 1 cm lower, shin level and pointing back, thigh from the hip down to the knee. On Zoubida 1.6 m
 * (thigh = shin = .34 m) the hip lands at .30 m, the heels under it, and no robe vertex goes more than ~1 cm into the seat.
 * Returns the leg IK errors (m).
 */
export function kneel(a, { seat = 0, lean = .15, hands = true, spread = .09, hip = .30, pad = .13 } = {}) {
  const k = a.group.scale.y / 1.6, B = a.B;
  rest(B); B.spine.rotation.x = lean; a.group.updateMatrixWorld(true);
  const Lt = IK.wpos(B.thighL).distanceTo(IK.wpos(B.shinL)) / k, Ls = IK.wpos(B.shinL).distanceTo(IK.wpos(B.footL)) / k;
  const kz = Math.sqrt(Math.max(.01, Lt * Lt - (hip - pad) ** 2));
  setHipY(a, seat + hip * k);
  const W = (x, y, z) => hipToWorld(a, x * k, y * k, z * k);
  const err = [1, -1].map(s => {
    const side = s > 0 ? 'L' : 'R';
    const e = IK.leg(a, side, W(s * spread, -hip + pad - .01, kz - Math.sqrt(Ls * Ls - .0001)), W(s * spread, -hip + pad - .05, kz + .3));
    const f = B['foot' + side]; f.rotation.x = 0; f.updateWorldMatrix(false, true);
    IK.aim(f, IK.wpos(f, [0, 0, 1]), W(s * spread, -hip + pad - .03, -1));    // instep flat on the floor, toes pointing back
    return e;
  });
  drapeLap(a, seat);
  if (hands) err.push(lapHands(a, { fwd: kz * .8, lift: .1 }));
  return err;
}

/**
 * sitting on a low stool (seat = stool top, m): buttocks on the seat, knees up and apart, feet flat on the floor in front.
 * The hip is solved by settling the pelvis's own vertices onto the seat (twice, the legs re-solved each time); ankles sit
 * `ankle` m above the floor at `fz` m in front of the hip, the soles are aimed level, toes forward.
 * Returns { err, seatLow, footLow }: leg IK errors (m), lowest pelvis vertex, lowest foot vertex.
 */
export function stool(a, { seat = .26, lean = .2, hands = true, spread = .14, fz = .36, ankle = .07, floor = 0 } = {}) {
  const k = a.group.scale.y / 1.6, B = a.B;
  rest(B); B.spine.rotation.x = lean; setHipY(a, seat + .1 * k);
  let err;
  const legs = () => {
    const hy = IK.wpos(B.root).y, W = (x, y, z) => hipToWorld(a, x * k, y * k, z * k);
    err = [1, -1].map(s => {
      const side = s > 0 ? 'L' : 'R', y = (floor + ankle * k - hy) / k;
      const e = IK.leg(a, side, W(s * spread * 1.1, y, fz), W(s * spread * 1.6, .2, fz + .4));
      const f = B['foot' + side]; f.rotation.x = 0; f.updateWorldMatrix(false, true);
      IK.aim(f, IK.wpos(f, [0, 0, 1]), W(s * spread * 1.3, y - .02, fz + 1));   // sole level, toes forward
      return e;
    });
  };
  for (let i = 0; i < 2; i++) { legs(); setHipY(a, IK.wpos(B.root).y + seat - lowestOf(a, ['root'])); }
  legs();
  drapeLap(a, floor);
  if (hands) err.push(lapHands(a, { fwd: .3, lift: .2 }));
  return { err, seatLow: lowestOf(a, ['root']), footLow: Math.min(lowestOf(a, ['footL']), lowestOf(a, ['footR'])) };
}

/**
 * standing at a balustrade, leaning on it: `top` = rail top height (m), `gap` = hip-to-rail distance (m, actor frame, forward).
 * The spine bends forward until the chest is `chest` m behind the rail's back face (bisection on measured vertices
 * would be overkill: the chest point is the spine bone tip), both palms come down on the rail top `spread` m apart.
 * Returns { err, palms } — palm world points, to check against the rail top.
 */
export function rail(a, { top = .9, gap = .2, spread = .17, lean = null, look: tgt = null } = {}) {
  const k = a.group.scale.y / 1.6, B = a.B;
  rest(B); a.group.updateMatrixWorld(true);
  // lean only as much as the rail is below the chest: an adult bends over a .9 m rail, a child barely leans on it
  if (lean == null) lean = Math.max(0, Math.min(.3, (IK.wpos(B.chest).y - top) * .9));
  B.spine.rotation.x = lean; B.chest.rotation.x = lean * .4; a.group.updateMatrixWorld(true);
  const hy = IK.wpos(B.root).y, W = (x, z) => hipToWorld(a, x, top - hy, z);
  const err = [1, -1].map(s => {
    const side = s > 0 ? 'L' : 'R', tg = W(s * spread, gap), pole = [s * .35, -.1, -.15];
    let wrist = tg.clone().add(new THREE.Vector3(0, .03 * k, 0));
    for (let i = 0; i < 4; i++) {                    // palm (not wrist) down on the rail top, fingers forward over it
      IK.arm(a, side, wrist, hipToWorld(a, pole[0] * k, pole[1] * k, pole[2] * k));
      IK.aim(B['hand' + side], handPts(a, side).end, tg.clone().add(hipToWorld(a, 0, 0, 1).sub(hipToWorld(a, 0, 0, 0)).multiplyScalar(.1)).setY(top));
      wrist.add(tg.clone().sub(handPts(a, side).palm));
    }
    return handPts(a, side).palm.distanceTo(tg);
  });
  if (tgt) look(a, tgt);
  return { err, palms: [handPts(a, 'L').palm, handPts(a, 'R').palm] };
}

/**
 * lying on the back on a bed/mattress top (y = top), head toward -z of the actor (away from a frontal camera when yaw = 0).
 * The body (head excluded) is settled so its lowest point presses `sink` m into the mattress, each leg swings down until its
 * heel rests on it, and with `pillow` (m, pillow height) the neck flexes (bisection) until the back of the head rests on
 * the pillow top. turn: roll toward a side (rad, + = onto the actor's left). Arms along the body.
 * Returns { low, heel, headLow, pillowAt } — pillowAt is the world point under the skull where the caller puts the pillow.
 */
export function lie(a, { top = 0, turn = 0, pillow = .08, sink = .01 } = {}) {
  const B = a.B, floor = top - sink;
  rest(B); B.root.rotation.set(-Math.PI / 2, 0, 0); B.root.rotateY(turn);
  for (const s of ['L', 'R']) { B['upperArm' + s].rotation.z = (s === 'L' ? 1 : -1) * .12; }
  const body = Object.keys(B).filter(n => n !== 'head' && n !== 'neck');
  setHipY(a, IK.wpos(B.root).y + floor - lowestOf(a, body));
  const heel = {};
  for (const s of ['L', 'R']) {                            // heels down on the mattress (the robe's back holds the hips up)
    let lo = -.3, hi = .5;                                  // + swings the leg down toward the mattress
    for (let i = 0; i < 9; i++) { const m = (lo + hi) / 2; B['thigh' + s].rotation.x = m; if (lowestOf(a, ['shin' + s, 'foot' + s]) < floor) hi = m; else lo = m; }
    heel[s] = +lowestOf(a, ['shin' + s, 'foot' + s]).toFixed(3);
  }
  let lo = 0, hi = 1.2, hl = lowestOf(a, ['head']);
  if (pillow > 0) for (let i = 0; i < 10; i++) {          // neck flexion that puts the back of the skull on the pillow
    const m = (lo + hi) / 2; B.neck.rotation.x = m * .6; B.head.rotation.x = m * .4;
    hl = lowestOf(a, ['head']); if (hl < floor + pillow) lo = m; else hi = m;
  }
  return { low: lowestOf(a, body), heel, headLow: hl, pillowAt: IK.wpos(B.head, [0, .1, 0]).setY(top) };
}

/** lift or lower the whole pose (via the hip) so its lowest skinned vertex sits at world height `y` */
export function settle(a, y) { setHipY(a, IK.wpos(a.B.root).y + y - lowestOf(a, Object.keys(a.B))); return y; }

/** lowest world y of the vertices carried mainly (weight > .5) by the named bones; index lists cached per actor */
export function lowestOf(a, names) {
  if (!a._vb) {
    a._vb = {}; const byBone = new Map(Object.entries(a.B).map(([n, b]) => [b, n]));
    a.group.traverse(o => { if (!o.isSkinnedMesh) return; const si = o.geometry.attributes.skinIndex, sw = o.geometry.attributes.skinWeight;
      for (let i = 0; i < si.count; i += 2) for (let j = 0; j < 4; j++) if (sw.getComponent(i, j) > .5) {
        const n = byBone.get(o.skeleton.bones[si.getComponent(i, j)]); if (n) { const L = a._vb[n] ||= new Map(); if (!L.has(o)) L.set(o, []); L.get(o).push(i); } break; } });
    for (const L of Object.values(a._vb)) { let n = 0; for (const ids of L.values()) n += ids.length; const st = Math.ceil(n / 600);
      if (st > 1) for (const [o, ids] of L) L.set(o, ids.filter((_, j) => j % st === 0)); }
  }                                                     // ~600 samples per bone: ~2.5 ms a bone, ~1 cm accuracy
  const v = new THREE.Vector3(); let lo = Infinity; a.group.updateMatrixWorld(true);
  for (const n of names) for (const [o, ids] of a._vb[n] || []) for (const i of ids) { o.getVertexPosition(i, v); o.localToWorld(v); if (v.y < lo) lo = v.y; }
  return lo;
}
