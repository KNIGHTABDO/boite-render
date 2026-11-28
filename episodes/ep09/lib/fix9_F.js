// ep09 group F (s19, s20): contacts that actually land, and a seated hem over bare shins.
import * as PO from '../../../engine/poses.js';
import { skirt } from '../scenes/_3d.js';
import { at, dirW, V } from './beatscene.js';

function armLen(a, side) {
  const sh = at(a, 'upperArm' + side);
  return sh.distanceTo(at(a, 'foreArm' + side)) + at(a, 'foreArm' + side).distanceTo(at(a, 'hand' + side));
}

/** Palm toward a world point. Clamps only past 96% of the arm, so a target within reach is actually touched. */
export function contact(a, side, target, { grip = .01, pole, frac = .96 } = {}) {
  const sh = at(a, 'upperArm' + side);
  const d = target.clone().sub(sh), max = armLen(a, side) * frac;
  const tgt = d.length() > max ? sh.clone().addScaledVector(d.normalize(), max) : target;
  return PO.reach(a, side, tgt, { grip, pole });
}

/** Slide on the floor until the pelvis is `gap` metres from a world point. */
export function closeTo(a, world, gap) {
  const p = a.group.position, dx = world.x - p.x, dz = world.z - p.z, dist = Math.hypot(dx, dz);
  if (dist < 1e-4 || dist <= gap) return;
  const s = (dist - gap) / dist;
  p.x += dx * s; p.z += dz * s;
  a.group.updateMatrixWorld(true);
}

/** Same slide, eased in. u = 0 stays put, u = 1 is fully closed up. */
export function easeClose(a, world, gap, u) {
  const home = a.group.position.clone();
  closeTo(a, world, gap);
  if (u < 1) {
    a.group.position.lerpVectors(home, a.group.position, Math.min(1, Math.max(0, u)));
    a.group.updateMatrixWorld(true);
  }
}

/** Turn toward a world point. amt 1 = face it, less = a partial shoulder turn. */
export function yawTo(a, world, amt = 1) {
  const p = a.group.position;
  const y = Math.atan2(world.x - p.x, world.z - p.z);
  const d = Math.atan2(Math.sin(y - a.group.rotation.y), Math.cos(y - a.group.rotation.y));
  a.group.rotation.y += d * amt;
  a.group.updateMatrixWorld(true);
}

/** Arms hanging, a hand-width off the thigh — not the bind A-pose. */
export function armsDown(a) {
  const k = a.group.scale.y / 1.6;
  for (const [s, sg] of [['L', 1], ['R', -1]]) {
    const sh = at(a, 'upperArm' + s);
    const tg = sh.clone()
      .addScaledVector(dirW(a, sg, 0, 0), .05 * k)
      .addScaledVector(dirW(a, 0, 0, 1), .035 * k)
      .add(V(0, -.48 * k, 0));
    PO.reach(a, s, tg, { grip: .01, pole: [sg * .28, .05, -.22] });
    PO.fingers(a, s, .22, { spread: .1 });
  }
}

/** Palms on the thighs, below a sash. */
export function lapHands(a) {
  const k = a.group.scale.y / 1.6;
  for (const [s, sg] of [['L', 1], ['R', -1]]) {
    contact(a, s, PO.hipToWorld(a, sg * .15 * k, .015 * k, .2 * k), { grip: .02, pole: [sg * .32, .02, .1] });
    PO.fingers(a, s, .24, { spread: .1 });
  }
}

/** One cloth drape over a cross-legged lap so the robe hem covers the shins. Built once, then carried with the hip. */
export function hemOnce(S3, st, a) {
  st.hems ||= {};
  if (!st.hems[a.name]) st.hems[a.name] = skirt(S3, a, 0);
  const m = st.hems[a.name], hip = at(a, 'root');
  const fwd = at(a, 'footL').add(at(a, 'footR')).multiplyScalar(.5).sub(hip);
  fwd.y = 0;
  m.position.set(hip.x, .002, hip.z);
  if (fwd.lengthSq() > 1e-4) {
    const len = fwd.length();
    fwd.multiplyScalar(1 / len);
    m.position.addScaledVector(fwd, Math.max(.04, len * .2));
    m.rotation.y = Math.atan2(fwd.x, fwd.z);
  }
}
