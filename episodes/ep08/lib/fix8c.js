// Repairs for s09, s12, s14, s15. fix8.js / fix8a.js / fix8b.js stay untouched.
import * as THREE from 'three';
import * as IK from '../../../engine/ik.js';
import * as PO from '../../../engine/poses.js';
import { walkPose } from '../../../engine/rig3d.js';
import { toon } from '../../../engine/props3d.js';

const CAST = (await (await fetch(new URL('../cast.json', import.meta.url))).json()).characters;

// heightOf() is 1.62 for every adult and 1.15 for every child. The gate compares the
// posed height with cast.json, and a child-scaled extra reads as a toddler beside the men.
export function castScale(a) {
  const h = CAST[a.name]?.height;
  if (!h || Math.abs(a.group.scale.y - h) < 1e-3) return;
  a.group.scale.setScalar(h);
  a.group.updateMatrixWorld(true);
  delete a.armLen;
}

// specs.js pins zoubida_haik neck/head at .48/.54 (the chest of the scanned mesh, whose real
// neck is ~.75). haikCloth welds every vertex above that to the head bone, so a bow turns the
// robe into a spiked hood and opens the front onto the dark skirt. Give this actor the bind
// neck before that cut runs. a.haikClosed keeps drapeRobe from pulling the same sheet apart.
export function sealHaik(a) {
  if (!a?.B?.head) return;
  a.haikClosed = true;
  if (a._haikSealed) return;
  const neck = a.B.neck?.userData?.abs?.y, head = a.B.head?.userData?.abs?.y;
  if (neck != null && neck > (a.S?.neck ?? 0) + .05) a.S = { ...a.S, neck, head: head ?? neck + .06 };
  a._haikSealed = true;
}

// Pelvis on a stair tread. PO.stool settles lowestOf('root'), and on this rig that falls
// through to the thigh, so the knee is planted on the seat and the pelvis floats a riser higher.
// The gate's capsule is root.y - 12 cm * height/1.6. Feet land on `floor` (the tread below).
export function sitStep(a, seat, floor) {
  const k = a.group.scale.y / 1.6, B = a.B;
  PO.setHipY(a, seat + .105 * k);
  a.group.updateMatrixWorld(true);
  const hipY = IK.wpos(B.root).y;
  const Lt = IK.wpos(B.thighL).distanceTo(IK.wpos(B.shinL));
  const Ls = IK.wpos(B.shinL).distanceTo(IK.wpos(B.footL));
  const drop = Math.max(.05, hipY - (floor + .025));
  const maxF = Math.sqrt(Math.max(.01, (Lt + Ls) ** 2 - Math.min(drop, Lt + Ls - .02) ** 2)) * .9;
  const fwd = Math.min(Lt * .92, maxF);
  const spread = .065 * k;
  for (const [side, sign] of [['L', 1], ['R', -1]]) {
    const ankle = PO.hipToWorld(a, sign * spread, floor + .028 - hipY, fwd);
    const pole = PO.hipToWorld(a, sign * spread * 1.1, .03 * k, fwd + .05);
    IK.leg(a, side, ankle, pole);
    const foot = B['foot' + side];
    foot.rotation.x = 0; foot.updateWorldMatrix(false, true);
    IK.aim(foot, IK.wpos(foot, [0, 0, 1]), PO.hipToWorld(a, sign * spread, floor + .02 - hipY, fwd + .18));
  }
  if (B.lap) PO.drapeLap(a, floor);
}

// Palms on the kneecaps, in front of the belly. `curl` 0..1 closes the fists (à mort).
export function pinKnees(a, curl = 0) {
  const k = a.group.scale.y / 1.6, B = a.B;
  a.group.updateMatrixWorld(true);
  const fwd = new THREE.Vector3(Math.sin(a.group.rotation.y), 0, Math.cos(a.group.rotation.y));
  for (const [side, sign] of [['L', 1], ['R', -1]]) {
    const kn = IK.wpos(B['shin' + side]), hip = IK.wpos(B.root);
    const tgt = kn.clone();
    tgt.y = Math.min(hip.y - .03, kn.y + .035 * k);
    tgt.addScaledVector(fwd, .025 * k);
    PO.reach(a, side, tgt, { grip: .015, pole: [sign * .32, .02, .16] });
    PO.fingers(a, side, .12 + .88 * curl, { thumb: .15 + .7 * curl });
  }
}

// Walk or run. walkPose replaces the leg and arm rotations, so call it after other reaches
// that should not survive into the cycle. `run` lengthens the stride and leans the chest.
export function stride(a, t, t0, cps, amt, run = false) {
  if (!(amt > 0)) return;
  walkPose(a.B, (t - t0) * cps / 2, Math.min(1, amt), run
    ? { stride: .78, lift: 1.15, arms: .85 }
    : { stride: .55, lift: .95, arms: .72 });
  a.B.spine.rotation.x += (run ? .18 : .08) * Math.min(1, amt);
  a.B.chest.rotation.x += (run ? .06 : .03) * Math.min(1, amt);
  a.group.updateMatrixWorld(true);
}

// Slide both actors on the floor until their pelvises are `gap` metres apart.
export function apart(a, b, gap) {
  if (!a?.group?.visible || !b?.group?.visible) return;
  const d = a.group.position.clone().sub(b.group.position); d.y = 0;
  const dist = d.length();
  if (dist >= gap) return;
  if (dist < 1e-4) d.set(1, 0, 0); else d.multiplyScalar(1 / dist);
  const push = (gap - dist) * .5;
  a.group.position.addScaledVector(d, push);
  b.group.position.addScaledVector(d, -push);
  a.group.updateMatrixWorld(true);
  b.group.updateMatrixWorld(true);
}

// One family jewel. The auction pair is a separate mesh; this must not be a second pair of bracelets.
export function jewel(S3) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(.02, 10, 8), toon(0xe0b040));
  m.castShadow = true;
  S3.scene.add(m);
  return m;
}
