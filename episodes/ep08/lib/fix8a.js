// Shared repairs for s05–s08. fix8.js owns seating and cloth; this file only
// places hands inside a real arm span and keeps posed flesh off the floor.
import * as PO from '../../../engine/poses.js';
import { at, V, dirW, front } from './beatscene.js';

const idsOf = new WeakMap();
function bodyIds(a) {
  let ids = idsOf.get(a);
  if (ids) return ids;
  const m = a.mesh, p = m.geometry.attributes.position, si = m.geometry.attributes.skinIndex, sw = m.geometry.attributes.skinWeight;
  const index = m.geometry.index?.array, n = index ? index.length : p.count, ex = new Map(), get = i => index ? index[i] : i;
  const body = [], stride = Math.max(1, Math.ceil(n / 900));
  for (let ii = 0; ii < n; ii++) {
    const i = get(ii);
    if (ii % stride === 0) body.push(i);
    let j = 0; for (let k = 1; k < 4; k++) if (sw.getComponent(i, k) > sw.getComponent(i, j)) j = k;
    const bone = si.getComponent(i, j); let e = ex.get(bone); if (!e) ex.set(bone, e = Array(6).fill(i));
    for (let d = 0; d < 3; d++) {
      if (p.getComponent(i, d) < p.getComponent(e[d * 2], d)) e[d * 2] = i;
      if (p.getComponent(i, d) > p.getComponent(e[d * 2 + 1], d)) e[d * 2 + 1] = i;
    }
  }
  ids = [...new Set([...body, ...[...ex.values()].flat()])];
  idsOf.set(a, ids); return ids;
}

/** Lift a posed actor until the sampled skin clears the support. Knees stay within the seat tolerance. */
export function plant(a, floor = 0) {
  const m = a.mesh, v = V(0, 0, 0); let low = Infinity;
  a.group.updateMatrixWorld(true);
  for (const i of bodyIds(a)) { m.getVertexPosition(i, v); m.localToWorld(v); if (v.y < low) low = v.y; }
  const limit = floor - 0.003;
  if (low < limit) { a.group.position.y += limit - low; a.group.updateMatrixWorld(true); }
}

function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }

/** Palm to a world point the arm can actually reach, kept outside the torso capsule. */
export function reachSafe(a, side, want, opt = {}) {
  const k = a.group.scale.y / 1.6, grip = opt.grip ?? 0.04;
  const sh = at(a, 'upperArm' + side);
  const len = sh.distanceTo(at(a, 'foreArm' + side)) + at(a, 'foreArm' + side).distanceTo(at(a, 'hand' + side));
  const maxD = Math.max(.08, len * 0.96 + grip * k);
  const minClear = (0.13 + 0.035) * k - 0.018;
  const root = at(a, 'root'), axis = at(a, 'neck').sub(root), axisL = axis.lengthSq() || 1;
  const outward = dirW(a, side === 'L' ? 1 : -1, 0, 0);
  let t = want.clone();
  for (let i = 0; i < 6; i++) {
    const d = t.clone().sub(sh);
    if (d.length() > maxD) t.copy(sh).addScaledVector(d.normalize(), maxD);
    const rel = t.clone().sub(root), u = clamp01(rel.dot(axis) / axisL);
    const away = t.clone().sub(root.clone().addScaledVector(axis, u));
    const dist = away.length();
    if (dist < minClear) t.addScaledVector(dist < 1e-4 ? outward : away.normalize(), minClear - dist + 0.012);
  }
  const d = t.clone().sub(sh);
  if (d.length() > maxD) t.copy(sh).addScaledVector(d.normalize(), maxD);
  const err = PO.reach(a, side, t, opt);
  if (err > 0.03 && !globalThis.__rsLog) { globalThis.__rsLog = 1; console.error('RS', a.name, side, 'len', +len.toFixed(3), 'maxD', +maxD.toFixed(3), 'dist', +t.distanceTo(at(a, 'upperArm' + side)).toFixed(3), 'want', +want.distanceTo(sh).toFixed(3), 'err', +err.toFixed(3), 'k', +k.toFixed(3)); }
  return err;
}

/** Resting lap hand: forward of the belly, on the thigh, elbow out. */
export function lapRest(a, side, t = 0) {
  const k = a.group.scale.y / 1.6, sign = side === 'L' ? 1 : -1;
  const breathe = 1 + 0.035 * Math.sin(t * 1.6 + (side === 'L' ? 0 : 1.4));
  return reachSafe(a, side, front(a, 'root', 0.2 * k * breathe, sign * 0.16 * k, 0.05 * k), {
    grip: 0.03, pole: [sign * 0.4, -0.15, 0.12],
  });
}

/** Parent a lap board to the actor so a later floor-fit cannot pull the hands off it. */
export function holdBoard(a, lh, worldPos, tilt, scale) {
  if (lh.parent !== a.group) a.group.attach(lh);
  a.group.updateMatrixWorld(true);
  lh.scale.setScalar(scale);
  lh.position.copy(a.group.worldToLocal(worldPos));
  lh.rotation.order = 'YXZ';
  lh.rotation.set(tilt, 0, 0);
  lh.updateMatrixWorld(true);
}
