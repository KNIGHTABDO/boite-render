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
  const B = a.B; if (!B.lap) return; if (B.SkirtBack1) return drapeRobe(a, floor); a.group.updateMatrixWorld(true);
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

/** real rig (art/rigged): the whole skirt is carried by 8 cloth bones. Front sheet over the knees then down to the floor,
 * back sheet down behind the seat and onto the floor, flanks out over each knee. Each end bone is shortened so its hem
 * stops on the floor instead of going through it. */
function hemStop(a, bone, name, floor, k) {
  bone.scale.y = 1; bone.updateWorldMatrix(false, true);
  const lo = lowestOf(a, [name]), top = IK.wpos(bone).y;
  if (lo < floor + .004 * k && top - lo > 1e-3) { bone.scale.y = Math.max(.15, (top - floor - .006 * k) / (top - lo)); bone.updateWorldMatrix(false, true); }
}
const ROBE = ['SkirtFront1', 'SkirtFront2', 'SkirtBack1', 'SkirtBack2', 'LeftRobe1', 'LeftRobe2', 'RightRobe1', 'RightRobe2'];
// The white haik is one closed sheet sharing the eight skirt bones. The seated solver below moves SkirtFront2
// onto the knees and aims each flank on its own; those shared triangles split into vertical holes and the dark
// inner garment shows through. Ep08 sets a.haikClosed so the scanned drape stays shut. Other robes are unchanged.
function drapeHaikClosed(a, floor) {
  const B = a.B;
  for (const n of ROBE) {
    const b = B[n]; if (!b?.userData?.rest) continue;
    b.quaternion.copy(b.userData.rest); b.scale.set(1, 1, 1);
    if (b.parent?.isBone && b.userData.abs && b.parent.userData.abs) b.position.copy(b.userData.abs).sub(b.parent.userData.abs);
  }
  a.group.updateMatrixWorld(true);
  pinHem(a, floor);
}
export function drapeRobe(a, floor = 0) {
  if (a?.haikClosed) return drapeHaikClosed(a, floor);
  const B = a.B; a.group.updateMatrixWorld(true);
  const k = a.group.scale.y / 1.6, D = new THREE.Vector3(0, -1, 0);
  const hq = new THREE.Quaternion(); B.Hips.getWorldQuaternion(hq);
  const fwd = new THREE.Vector3(0, 0, 1).applyQuaternion(hq).setY(0).normalize(), side = new THREE.Vector3(1, 0, 0).applyQuaternion(hq).setY(0).normalize();
  const kL = IK.wpos(B.LeftLeg), kR = IK.wpos(B.RightLeg), hip = IK.wpos(B.Hips), kn = kL.clone().add(kR).multiplyScalar(.5);
  const end = b => IK.wpos(b, [0, -1, 0]);
  // front: hip -> over the knees -> down to the floor in front of the shins
  const over = kn.clone().addScaledVector(UP, .05 * k).addScaledVector(fwd, .02 * k);
  IK.aim(B.SkirtFront1, B.SkirtFront2, over);
  B.SkirtFront2.position.copy(B.SkirtFront2.parent.worldToLocal(over.clone())); B.SkirtFront2.updateWorldMatrix(true, true);
  const fdrop = Math.max(.0, over.y - floor);
  IK.aim(B.SkirtFront2, end(B.SkirtFront2), over.clone().addScaledVector(fwd, Math.min(.06 * k, fdrop * .3)).setY(Math.min(over.y - .05 * k, floor)));
  hemStop(a, B.SkirtFront2, 'SkirtFront2', floor, k);
  // back: down behind the seat; if the seat is low (kneel, floor) the second half lies back on the floor
  const seatY = Math.max(floor, Math.min(kL.y, kR.y, hip.y - .12 * k) - .02 * k);
  const L1 = IK.wpos(B.SkirtBack2).distanceTo(IK.wpos(B.SkirtBack1));
  const dy = Math.min(L1 * .97, hip.y - seatY - .01 * k), back = fwd.clone().negate();
  const b1 = hip.clone().addScaledVector(D, dy).addScaledVector(back, Math.sqrt(Math.max(0, L1 * L1 - dy * dy)) * .9 + .03 * k);
  IK.aim(B.SkirtBack1, B.SkirtBack2, b1);
  const p2 = IK.wpos(B.SkirtBack2), low = p2.y - floor < .08 * k;
  IK.aim(B.SkirtBack2, end(B.SkirtBack2), low ? p2.clone().addScaledVector(back, .3 * k).setY(floor + .01 * k) : p2.clone().addScaledVector(back, .04 * k).setY(floor));
  hemStop(a, B.SkirtBack2, 'SkirtBack2', floor, k);
  // flanks: from the hip out over each knee, half way down to the floor beside it
  for (const [s, kp] of [['Left', kL], ['Right', kR]]) {
    const sg = s === 'Left' ? 1 : -1, b = B[s + 'Robe2'];
    const out = kp.clone().addScaledVector(side, sg * .05 * k).addScaledVector(UP, .02 * k);
    const t = out.clone().lerp(out.clone().setY(floor), out.y - floor > .15 * k ? .55 : .35);
    IK.aim(b, end(b), t); hemStop(a, b, s + 'Robe2', floor, k);
  }
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

/**
 * real-rig fingers: curl each finger toward the palm (0 = flat, 1 = fist). Works in world space, so it needs no
 * knowledge of the bone axes: each segment turns about cross(segment, palm-normal). `thumb` curls the thumb toward
 * the middle knuckle; `each` = [thumb, index, middle, ring, pinky] multipliers (e.g. a pointing hand [1,0,1,1,1]).
 * Returns false on the old rigs (no finger bones).
 */
const FING = ['Thumb', 'Index', 'Middle', 'Ring', 'Pinky'], _q = new THREE.Quaternion(), _pq = new THREE.Quaternion(), _bq = new THREE.Quaternion();
function turnWorld(b, axis, ang) {
  b.updateWorldMatrix(true, false); b.getWorldQuaternion(_bq); b.parent.getWorldQuaternion(_pq);
  _q.setFromAxisAngle(axis, ang).multiply(_bq); b.quaternion.copy(_pq.invert().multiply(_q)); b.updateWorldMatrix(false, true);
}
export function fingers(a, side, curl = .8, { thumb = curl * .7, each = [1, 1, 1, 1, 1], spread = 0 } = {}) {
  const B = a.B, S = (side === 'L' ? 'Left' : 'Right') + 'Hand'; if (!B[S + 'Index1']) return false;
  a.group.updateMatrixWorld(true);
  const P = n => IK.wpos(B[S + n]), hp = IK.wpos(B[S]);
  const along = P('Index1').sub(hp).normalize(), t = P('Thumb1').sub(hp); t.addScaledVector(along, -t.dot(along));
  const n = side === 'L' ? new THREE.Vector3().crossVectors(along, t) : new THREE.Vector3().crossVectors(t, along);
  n.normalize();                                                         // palm normal from handedness (fingers x thumb)
  const mid = B[S + 'Middle1'] ? P('Middle1') : P('Index1');
  FING.forEach((f, i) => {
    const amt = (f === 'Thumb' ? thumb : curl) * each[i]; if (!B[S + f + '1']) return;
    if (spread && f !== 'Thumb' && f !== 'Middle') turnWorld(B[S + f + '1'], n, spread * (i - 2) * .12 * (side === 'L' ? 1 : -1));
    for (let j = 1; j <= 3; j++) {
      const b = B[S + f + j], c = B[S + f + (j + 1)] || b.children.find(x => x.isBone); if (!b) continue;
      const d = c ? IK.wpos(c).sub(IK.wpos(b)) : IK.wpos(b).sub(IK.wpos(b.parent));
      const to = f === 'Thumb' ? mid.clone().addScaledVector(n, .015 * a.group.scale.y).sub(IK.wpos(b)) : n;
      const ax = new THREE.Vector3().crossVectors(d, to); if (ax.lengthSq() < 1e-12) continue;
      turnWorld(b, ax.normalize(), amt * (f === 'Thumb' ? [.35, .45, .4][j - 1] : [.95, 1.2, .8][j - 1]));
    }
  });
  return true;
}
/** natural relaxed hands (slight curl, a little different on each side so the hands never mirror) */
export function relaxHands(a, seed = 0) { fingers(a, 'L', .22 + .06 * Math.sin(seed * 7.1), { spread: .3 }); fingers(a, 'R', .28 + .06 * Math.cos(seed * 5.3), { spread: .2 }); }

/** turn the head (and part of the neck) so the face looks at a world point; amt < 1 keeps some of the old pose */
export function look(a, target, amt = .85, { max = .55 } = {}) {
  // neck + head turn toward target; each bone's turn is capped at `max` rad (≈32°) so a far/behind target never
  // twists or flips the head (the eyes of the face layer cover the rest)
  const B = a.B; a.group.updateMatrixWorld(true);
  for (const [b, w, m] of [[B.neck, amt * .35, max * .6], [B.head, amt, max]]) {
    const q0 = b.quaternion.clone();
    IK.aim(b, b.localToWorld(new THREE.Vector3(0, 0, .1)), target);
    const q1 = q0.clone().slerp(b.quaternion, w), ang = q0.angleTo(q1);
    b.quaternion.copy(ang > m ? q0.slerp(q1, m / ang) : q1); b.updateWorldMatrix(false, true);
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
export function kneel(a, { seat = 0, lean = .15, hands = true, spread = .09, hip = .30, pad = .13, hspread, grounded = false } = {}) {
  if (grounded) return groundedKneel(a, { seat, lean, hands, spread, hip });
  const k = a.group.scale.y / 1.6, B = a.B;
  rest(B); B.spine.rotation.x = lean; a.group.updateMatrixWorld(true);
  const Lt = IK.wpos(B.thighL).distanceTo(IK.wpos(B.shinL)) / k, Ls = IK.wpos(B.shinL).distanceTo(IK.wpos(B.footL)) / k;
  const kz = Math.sqrt(Math.max(.01, Lt * Lt - (hip - pad) ** 2));
  setHipY(a, seat + hip * k);
  let err;
  const legs = () => { const W = (x, y, z) => hipToWorld(a, x * k, y * k, z * k); err = [1, -1].map(s => {
    const side = s > 0 ? 'L' : 'R';
    const e = IK.leg(a, side, W(s * spread, -hip + pad - .01, kz - Math.sqrt(Ls * Ls - .0001)), W(s * spread, -hip + pad - .05, kz + .3));
    const f = B['foot' + side]; f.rotation.x = 0; f.updateWorldMatrix(false, true);
    IK.aim(f, IK.wpos(f, [0, 0, 1]), W(s * spread, -hip + pad - .03, -1));    // instep flat on the floor, toes pointing back
    return e;
  }); };
  // settle: the knees and insteps rest ON the mattress (measured skinned vertices), not at a guessed hip height
  for (let i = 0; i < 2; i++) { legs(); const lo = lowestOf(a, ['shinL', 'shinR', 'footL', 'footR']); if (Math.abs(lo - seat) < .004) break; setHipY(a, IK.wpos(B.root).y + seat + .003 - lo); }
  legs();
  drapeLap(a, seat);
  if (hands) err.push(lapHands(a, { fwd: kz * .8, lift: .1, ...(hspread ? { spread: hspread } : {}) }));
  return err;
}

// Opt-in floor-contact kneel for ep08. The legacy solve above remains unchanged.
function groundedKneel(a, { seat, lean, hands, spread, hip }) {
  const B=a.B, k=a.group.scale.y/1.6;
  rest(B); for(const b of new Set(Object.values(B))) b.scale.set(1,1,1);
  B.spine.rotation.x=lean; a.group.updateMatrixWorld(true);
  const Lt=IK.wpos(B.thighL).distanceTo(IK.wpos(B.shinL)), Ls=IK.wpos(B.shinL).distanceTo(IK.wpos(B.footL));
  setHipY(a,seat+hip*k);
  const kneeY={L:seat+.055*k,R:seat+.055*k}, ankleY={L:seat+.035*k,R:seat+.035*k};let errors=[];
  for(let i=0;i<14;i++) {
    errors=[];
    for(const [side,sign] of [['L',1],['R',-1]]) {
      const thigh=IK.wpos(B['thigh'+side]), hy=thigh.y, dx=sign*spread*k;
      const kz=Math.sqrt(Math.max(.0001,Lt*Lt-(hy-kneeY[side])**2-(dx-(thigh.clone().sub(IK.wpos(B.root)).applyAxisAngle(UP,-a.group.rotation.y).x))**2));
      const back=Math.sqrt(Math.max(.0001,Ls*Ls-(kneeY[side]-ankleY[side])**2));
      const W=(x,y,z)=>hipToWorld(a,x,y-IK.wpos(B.root).y,z);
      errors.push(IK.leg(a,side,W(dx,ankleY[side],kz-back),W(dx,kneeY[side],kz)));
      const foot=B['foot'+side], toe=B[(side==='L'?'Left':'Right')+'ToeBase'];
      if(toe) IK.aim(foot,toe,W(dx,seat+.012*k,kz-back-.25*k));
      else IK.aim(foot,IK.wpos(foot,[0,-.04,.15]),W(dx,seat+.012*k,kz-back-.25*k));
      drapeLap(a,seat);
      const kneeLow=regionLow(a,B['shin'+side].userData.abs,.065*(a.S.top-a.S.bottom));
      const footLow=lowestOf(a,['foot'+side]);
      kneeY[side]+=seat+.003-kneeLow; ankleY[side]+=seat+.003-footLow;
    }
  }
  drapeLap(a,seat);
  // Cloth panels are cut for a standing robe. Shorten their drop, keeping the leg skeleton untouched.
  for(let i=0;i<3;i++)for(const n of ['SkirtFront1','SkirtFront2','SkirtBack1','SkirtBack2','LeftRobe1','LeftRobe2','RightRobe1','RightRobe2']) {
    const b=B[n];if(!b)continue;const lo=lowestOf(a,[n]), y=IK.wpos(b).y;
    if(lo<seat+.015&&y>seat+.025) {b.scale.y*=Math.max(.1,(y-seat-.018)/(y-lo));b.updateWorldMatrix(false,true);}
  }
  setHipY(a,IK.wpos(B.root).y+.012);
  pinHem(a, seat);
  if(hands) lapHands(a,{fwd:.24,lift:.14,spread:.14});
  pinHem(a, seat);
  return errors;
}
// The robe hem is skinned across several bones. lowestOf misses a vertex whose strongest weight is still under .5,
// and that tail is what the gate measures under the floor. Shorten whichever cloth bone owns it.
function pinHem(a, floor) {
  const mesh = a.mesh; if (!mesh?.geometry?.attributes?.skinIndex) return;
  const p = mesh.geometry.attributes.position, si = mesh.geometry.attributes.skinIndex, sw = mesh.geometry.attributes.skinWeight, bones = mesh.skeleton.bones;
  const v = new THREE.Vector3();
  for (let pass = 0; pass < 4; pass++) {
    const low = new Map();
    for (let i = 0; i < p.count; i += 2) {
      let j = 0; for (let k = 1; k < 4; k++) if (sw.getComponent(i, k) > sw.getComponent(i, j)) j = k;
      const name = bones[si.getComponent(i, j)]?.name;
      if (!name || !/Skirt|Robe/.test(name)) continue;
      mesh.getVertexPosition(i, v); mesh.localToWorld(v);
      const y = low.get(name); if (y == null || v.y < y) low.set(name, v.y);
    }
    let moved = false;
    for (const [name, lo] of low) {
      const b = a.B[name]; if (!b || lo >= floor + .008) continue;
      const top = IK.wpos(b).y; if (!(top > lo + 1e-3)) continue;
      b.scale.y *= Math.max(.1, (top - floor - .04) / (top - lo));
      b.updateWorldMatrix(false, true);
      moved = true;
    }
    if (!moved) break;
  }
}
function regionLow(a, center, radius) {
  const mesh=a.mesh, p=mesh.geometry.attributes.position, v=new THREE.Vector3();let low=Infinity;
  a.group.updateMatrixWorld(true);
  const key=center.toArray().join(',')+':'+radius;
  a._contactRegions ||= new Map();
  if(!a._contactRegions.has(key)) {
    const ids=[...new Set(mesh.geometry.index?.array||Array.from({length:p.count},(_,i)=>i))];
    a._contactRegions.set(key,ids.filter(i=>Math.hypot(p.getX(i)-center.x,p.getY(i)-center.y,p.getZ(i)-center.z)<radius));
  }
  for(const i of a._contactRegions.get(key)){mesh.getVertexPosition(i,v);mesh.localToWorld(v);low=Math.min(low,v.y);}
  return low;
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
 * natural opts into a soft, asymmetric pose; hands = 'belly' | 'chest' | 'side', headTurn = radians about the neck.
 * Its default sink is 4 cm (legacy: 1 cm). Omit natural to retain the original solve exactly.
 * Returns { low, heel, headLow, pillowAt } — pillowAt is the world point under the skull where the caller puts the pillow.
 */
export function lie(a, { top = 0, turn = 0, pillow = .08, natural = false, sink = natural ? .015 : .01, hands = 'belly', headTurn = .16 } = {}) {
  if (natural) return naturalLie(a, { top, turn, pillow, sink, hands, headTurn });
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

function naturalLie(a, { top, turn, pillow, sink, hands, headTurn }) {
  const B = a.B, k = a.group.scale.y / 1.6, floor = top - sink;
  rest(B);
  B.root.rotation.set(-Math.PI / 2, 0, 0); B.root.rotateY(turn); B.root.rotateX(-.015);
  // A previous seated solve may have shortened the cloth hems. Restore their bind scale before reclining.
  for (const b of new Set(Object.values(B))) b.scale.set(1, 1, 1);
  B.spine.rotation.x = .075; B.chest.rotation.x = .045;
  // Keep the upper legs near bind: the robe is carried by separate skirt bones. The old heel search could swing a
  // thigh half a radian through that cloth. A small hip bend and a soft knee bend keep the heels low instead.
  for (const [s, sign, bend] of [['L', 1, .10], ['R', -1, .14]]) {
    B['thigh' + s].rotation.x = -bend; B['thigh' + s].rotation.z = sign * .025;
    B['shin' + s].rotation.x = bend * 2 + .23;
    B['foot' + s].rotation.x = .5; B['foot' + s].rotation.y = sign * .24;
  }
  const headBones = new Set(); B.neck.traverse(b => headBones.add(b));
  const body = Object.keys(B).filter(n => !headBones.has(B[n]));
  const back = ['root', 'spine', 'chest', 'SkirtBack1', 'SkirtBack2'].filter(n => B[n]);
  setHipY(a, IK.wpos(B.root).y + floor - lowestOf(a, back));
  for (const s of ['L', 'R']) {
    let lo = B['shin' + s].rotation.x, hi = lo + .55;
    for (let i = 0; i < 10; i++) {
      B['shin' + s].rotation.x = (lo + hi) / 2;
      if (lowestOf(a, ['shin' + s, 'foot' + s]) < top - .01) hi = B['shin' + s].rotation.x;
      else lo = B['shin' + s].rotation.x;
    }
  }
  // Use the reclining pelvis frame for elbow poles (reach()'s hip frame is deliberately upright).
  const q = B.root.getWorldQuaternion(new THREE.Quaternion()), hip = IK.wpos(B.root);
  const W = (x, y, z) => new THREE.Vector3(x * k, y * k, z * k).applyQuaternion(q).add(hip);
  for (const [s, sign] of [['L', 1], ['R', -1]]) {
    const target = hands === 'side' ? W(sign * .23, .17, -.04)
      : hands === 'chest' ? W(sign * .09, .36 + (sign > 0 ? .025 : 0), .23)
      : W(sign * .09, .20 + (sign > 0 ? .025 : 0), .23);
    let wrist = target.clone();
    for (let i = 0; i < 3; i++) {
      IK.arm(a, s, wrist, W(sign * .38, .16, .24));
      IK.aim(B['hand' + s], handPts(a, s).end, target.clone().addScaledVector(new THREE.Vector3(0, 1, 0).applyQuaternion(q), .1 * k));
      palmTo(a, s, 1, new THREE.Vector3(0, 0, -1).applyQuaternion(q));
      wrist.add(target.clone().sub(handPts(a, s).palm));
    }
    fingers(a, s, .12, { thumb: .08, spread: .3 });
  }
  // Include every body/cloth bone in the final clearance check, then fit the head independently to the pillow.
  // Translating the hip preserves the small thigh angles and never pushes a limb below top - sink.
  const low = lowestOf(a, body);
  if (low < floor) setHipY(a, IK.wpos(B.root).y + floor - low);
  B.neck.rotation.y = headTurn * .2; B.head.rotation.y = headTurn;
  let lo = -.3, hi = .8;
  const support = top + pillow;
  for (let i = 0; i < 12; i++) {
    const m = (lo + hi) / 2; B.neck.rotation.x = m * .6; B.head.rotation.x = m * .4;
    if (lowestOf(a, ['head']) < support) lo = m; else hi = m;
  }
  const allLow = lowestOf(a, Object.keys(B));
  if (allLow < floor) setHipY(a, IK.wpos(B.root).y + floor - allLow);
  return { low: lowestOf(a, body), heel: Object.fromEntries(['L', 'R'].map(s => [s, +lowestOf(a, ['shin' + s, 'foot' + s]).toFixed(3)])),
    headLow: lowestOf(a, ['head']), pillowAt: IK.wpos(B.head, [0, .1, 0]).setY(top) };
}

/** lift or lower the whole pose (via the hip) so its lowest skinned vertex sits at world height `y` */
export function settle(a, y) { setHipY(a, IK.wpos(a.B.root).y + y - lowestOf(a, Object.keys(a.B))); return y; }

/** lowest world y of the vertices carried mainly (weight > .5) by the named bones; index lists cached per actor */
export function lowestOf(a, names) {
  if (!a._vb) {
    a._vb = new Map(); const bones = new Set(Object.values(a.B));
    a.group.traverse(o => { if (!o.isSkinnedMesh) return; const si = o.geometry.attributes.skinIndex, sw = o.geometry.attributes.skinWeight;
      for (let i = 0; i < si.count; i += 2) for (let j = 0; j < 4; j++) if (sw.getComponent(i, j) > .5) {
        const n = o.skeleton.bones[si.getComponent(i, j)]; if (bones.has(n)) { const L = a._vb.get(n) || a._vb.set(n, new Map()).get(n); if (!L.has(o)) L.set(o, []); L.get(o).push(i); } break; } });
    for (const L of a._vb.values()) { let n = 0; for (const ids of L.values()) n += ids.length; const st = Math.ceil(n / 600);
      if (st > 1) for (const [o, ids] of L) L.set(o, ids.filter((_, j) => j % st === 0)); }
  }                                                     // ~600 samples per bone: ~2.5 ms a bone, ~1 cm accuracy
  const v = new THREE.Vector3(); let lo = Infinity; a.group.updateMatrixWorld(true);
  for (const n of names) for (const [o, ids] of a._vb.get(a.B[n]) || []) for (const i of ids) { o.getVertexPosition(i, v); o.localToWorld(v); if (v.y < lo) lo = v.y; }
  // real rigs (autorig): the robe takes the pelvis weights, so Hips may own no vertex > .5 -> Infinity sent the actor to -inf
  // (ep08 bench: empty stool tile). Fall back to the thighs (their underside is the seat when sitting).
  if (lo === Infinity && names.includes('root')) return lowestOf(a, ['thighL', 'thighR', ...names.filter(n => n !== 'root')]);
  return lo;
}

/** turn the forearm (60 %) and wrist (40 %) about the forearm axis so the palm faces `to` (default: up), weight amt 0..1.
 *  Uses the same palm normal as fingers(); real rigs only (needs the finger bones). */
export function palmTo(a, side, amt = 1, to = new THREE.Vector3(0, 1, 0)) {
  const B = a.B, S = (side === 'L' ? 'Left' : 'Right') + 'Hand'; if (!B[S + 'Index1'] || amt <= 0) return false;
  a.group.updateMatrixWorld(true);
  const P = n => IK.wpos(B[S + n]), hp = IK.wpos(B[S]);
  const along = P('Index1').sub(hp).normalize(), t = P('Thumb1').sub(hp); t.addScaledVector(along, -t.dot(along));
  const n = (side === 'L' ? new THREE.Vector3().crossVectors(along, t) : new THREE.Vector3().crossVectors(t, along)).normalize();
  const ax = hp.clone().sub(IK.wpos(B['foreArm' + side])).normalize();
  const proj = v => v.clone().addScaledVector(ax, -v.dot(ax));
  const a0 = proj(n), a1 = proj(to); if (a0.lengthSq() < 1e-6 || a1.lengthSq() < 1e-6) return false;
  a0.normalize(); a1.normalize();
  const ang = Math.atan2(new THREE.Vector3().crossVectors(a0, a1).dot(ax), a0.dot(a1)) * amt;
  turnWorld(B['foreArm' + side], ax, .6 * ang); turnWorld(B['hand' + side], ax, .4 * ang);
  return ang;
}
