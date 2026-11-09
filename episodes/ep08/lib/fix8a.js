// Shared repairs for s05–s08. fix8.js owns seating and cloth; this file only
// places hands inside a real arm span and keeps the kneel thigh off the floor.
import * as PO from '../../../engine/poses.js';
import * as IK from '../../../engine/ik.js';
import { staged as base } from './fix8.js';
import { skirt } from '../scenes/_3d.js';
import { at, V, dirW } from './beatscene.js';

const shinOf = new WeakMap();
function legIds(a) {
  let ids = shinOf.get(a);
  if (ids) return ids;
  const m = a.mesh, si = m.geometry.attributes.skinIndex, sw = m.geometry.attributes.skinWeight;
  const want = new Set([a.B.shinL, a.B.shinR, a.B.thighL, a.B.thighR, a.B.footL, a.B.footR].filter(Boolean).map(b => b.name));
  const bones = m.skeleton.bones, index = m.geometry.index?.array, n = index ? index.length : si.count;
  ids = [];
  for (let ii = 0; ii < n; ii += 8) {
    const i = index ? index[ii] : ii;
    let j = 0; for (let k = 1; k < 4; k++) if (sw.getComponent(i, k) > sw.getComponent(i, j)) j = k;
    const b = bones[si.getComponent(i, j)]; if (b && want.has(b.name)) ids.push(i);
  }
  shinOf.set(a, ids); return ids;
}
function shinUnder(a) {
  const m = a.mesh, v = V(0, 0, 0); let low = Infinity;
  a.group.updateMatrixWorld(true);
  for (const i of legIds(a)) { m.getVertexPosition(i, v); m.localToWorld(v); if (v.y < low) low = v.y; }
  return low;
}

// The calf hangs below the shin bone. Pitch the ankle up around the knee until that meat clears the floor.
export function fitKneel(a) {
  const k = a.group.scale.y / 1.6;
  for (let i = 0; i < 3; i++) {
    const low = shinUnder(a);
    if (low >= -0.002) break;
    const lift = Math.min(0.01, -0.002 - low);
    for (const side of ['L', 'R']) {
      const ankle = at(a, 'foot' + side), knee = at(a, 'shin' + side);
      ankle.y = Math.min(0.032, Math.max(0.008, ankle.y) + lift);
      knee.y = Math.max(0.01 * k, knee.y);
      IK.leg(a, side, ankle, knee.clone().addScaledVector(dirW(a, 0, 0, 1), 0.08 * k));
    }
  }
  const low = shinUnder(a);
  if (low < -0.002) { a.group.position.y += -0.002 - low; a.group.updateMatrixWorld(true); }
  // Knee contact is the mesh around the joint, which sits below the bone once the calf clears the floor.
  if (a.actMark) {
    const ks = kneeLows(a);
    a.actMark.o ||= {};
    a.actMark.o.seat = (ks[0] + ks[1]) / 2;
  }
}
const kneeOf = new WeakMap();
function kneeLows(a) {
  let ids = kneeOf.get(a);
  if (!ids) {
    const m = a.mesh, p = m.geometry.attributes.position, si = m.geometry.attributes.skinIndex;
    const index = m.geometry.index?.array, n = index ? index.length : p.count, unit = a.S.top - a.S.bottom || 1.6;
    ids = { L: [], R: [] };
    for (const side of ['L', 'R']) {
      const b = a.B['shin' + side]?.userData?.abs; if (!b) continue;
      for (let ii = 0; ii < n; ii++) {
        const i = index ? index[ii] : ii;
        if (Math.hypot(p.getX(i) - b.x, p.getY(i) - b.y, p.getZ(i) - b.z) < 0.065 * unit) ids[side].push(i);
      }
    }
    kneeOf.set(a, ids);
  }
  const m = a.mesh, v = V(0, 0, 0), out = [];
  a.group.updateMatrixWorld(true);
  for (const side of ['L', 'R']) {
    let low = at(a, 'shin' + side).y;
    for (const i of ids[side]) { m.getVertexPosition(i, v); m.localToWorld(v); if (v.y < low) low = v.y; }
    out.push(low);
  }
  return out;
}

function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }

/** Palm to a world point the arm can actually reach, kept outside the torso capsule. */
export function reachSafe(a, side, want, opt = {}) {
  const k = a.group.scale.y / 1.6, grip = opt.grip ?? 0.04;
  const sh = at(a, 'upperArm' + side);
  const len = sh.distanceTo(at(a, 'foreArm' + side)) + at(a, 'foreArm' + side).distanceTo(at(a, 'hand' + side));
  const maxD = Math.max(.08, len * 0.96 + grip * k);
  const minClear = (0.13 + 0.035) * k - 0.02;
  const root = at(a, 'root'), axis = at(a, 'neck').sub(root), axisL = axis.lengthSq() || 1;
  const outward = dirW(a, side === 'L' ? -1 : 1, 0, 0);
  let t = want.clone();
  for (let i = 0; i < 6; i++) {
    const d = t.clone().sub(sh);
    if (d.length() > maxD) t.copy(sh).addScaledVector(d.normalize(), maxD);
    const rel = t.clone().sub(root), u = clamp01(rel.dot(axis) / axisL);
    const away = t.clone().sub(root.clone().addScaledVector(axis, u));
    const dist = away.length();
    if (dist < minClear) t.addScaledVector(dist < 1e-4 ? outward : away.normalize(), minClear - dist + 0.01);
  }
  let d = t.clone().sub(sh);
  if (d.length() > maxD) t.copy(sh).addScaledVector(d.normalize(), maxD);
  const rel2 = t.clone().sub(root), u2 = clamp01(rel2.dot(axis) / axisL);
  const away2 = t.clone().sub(root.clone().addScaledVector(axis, u2));
  if (away2.length() < minClear) t.addScaledVector(away2.length() < 1e-4 ? outward : away2.normalize(), minClear - away2.length() + 0.008);
  return PO.reach(a, side, t, opt);
}

/** Resting hand just in front of its own knee, elbow wide, so the forearm stays outside the ribs. */
export function lapRest(a, side, t = 0) {
  const k = a.group.scale.y / 1.6, sign = side === 'L' ? 1 : -1;
  const bob = 0.01 * k * Math.sin(t * 1.7 + (side === 'L' ? 0 : 1.3));
  const knee = at(a, 'shin' + side);
  const target = knee.clone()
    .addScaledVector(dirW(a, 0, 0, 1), 0.09 * k)
    .addScaledVector(dirW(a, -sign, 0, 0), 0.08 * k)
    .add(V(0, 0.055 * k + bob, 0));
  return reachSafe(a, side, target, { grip: 0.02, pole: [sign * 0.55, 0.15, 0.4] });
}

function seatPins(a) {
  lapRest(a, 'L', 0); lapRest(a, 'R', 0);
  // Pin where the hand already landed, so the pre-act solve is not an over-reach.
  a.pins = ['L', 'R'].map(side => [side, a.B.root.worldToLocal(at(a, 'hand' + side).clone())]);
}

/** Replace a kneel that fitKneel twisted: heels and knees on the floor, pelvis settled above them. */
export function plantKneel(a, opt = {}) {
  PO.kneel(a, { grounded: true, lean: .06, hip: .22, hands: false, spread: .1, ...opt });
  PO.drapeLap(a, 0);
  const ks = kneeLows(a);
  const seat = ks.length ? (ks[0] + ks[1]) / 2 : 0;
  if (a.actMark) { a.actMark.o ||= {}; a.actMark.o.seat = seat; }
  seatPins(a);
  return seat;
}
const gateKneeIds = new WeakMap();
function gateKnees(a) {
  // Same subsample the acting gate uses for kneeL/kneeR, so the declared seat is the height it will measure.
  let sample = gateKneeIds.get(a);
  if (!sample) {
    const m = a.mesh, p = m.geometry.attributes.position, si = m.geometry.attributes.skinIndex, sw = m.geometry.attributes.skinWeight;
    const unit = a.S.top - a.S.bottom || 1.6;
    const ids = [...new Set(m.geometry.index?.array || Array.from({ length: p.count }, (_, i) => i))];
    const parts = { L: [], R: [] };
    for (const i of ids) {
      const py = p.getY(i);
      for (const side of ['L', 'R']) {
        const b = a.B['shin' + side]?.userData?.abs; if (!b) continue;
        if (Math.hypot(p.getX(i) - b.x, py - b.y, p.getZ(i) - b.z) < 0.065 * unit) parts[side].push(i);
      }
    }
    const extremes = new Map();
    for (const i of ids) {
      let best = 0, jj = 0;
      for (let j = 0; j < 4; j++) if (sw.getComponent(i, j) > best) { best = sw.getComponent(i, j); jj = si.getComponent(i, j); }
      let e = extremes.get(jj); if (!e) extremes.set(jj, e = Array(6).fill(i));
      for (let d = 0; d < 3; d++) {
        if (p.getComponent(i, d) < p.getComponent(e[d * 2], d)) e[d * 2] = i;
        if (p.getComponent(i, d) > p.getComponent(e[d * 2 + 1], d)) e[d * 2 + 1] = i;
      }
    }
    const extra = [...new Set([...extremes.values()].flat())];
    sample = {};
    for (const side of ['L', 'R']) {
      const list = parts[side], member = new Set(list), stride = Math.max(1, Math.ceil(list.length / 350));
      sample[side] = [...new Set([...list.filter((_, i) => i % stride === 0), ...extra.filter(i => member.has(i))])];
    }
    gateKneeIds.set(a, sample);
  }
  const m = a.mesh, v = V(0, 0, 0), out = [];
  a.group.updateMatrixWorld(true);
  for (const side of ['L', 'R']) {
    let low = Infinity;
    for (const i of sample[side]) { m.getVertexPosition(i, v); m.localToWorld(v); if (v.y < low) low = v.y; }
    out.push(Number.isFinite(low) ? low : at(a, 'shin' + side).y);
  }
  return out;
}
/** The knee the gate measures moves a little with the breath; keep the declared seat on it. */
export function syncSeat(a) {
  const ks = gateKnees(a);
  if (a.actMark && ks.length) { a.actMark.o ||= {}; a.actMark.o.seat = (ks[0] + ks[1]) / 2; }
}

/** After the robe drape: pull a split hem up and lay one cloth over the crossed feet. */
export function hideHem(S3, a, bag) {
  if (!a?.B) return;
  for (const n of ['SkirtFront2', 'SkirtBack2', 'LeftRobe2', 'RightRobe2']) {
    const b = a.B[n]; if (!b) continue;
    b.scale.y *= .68;
    b.position.copy(b.parent.worldToLocal(at(a, n).add(V(0, .03, 0))));
    b.updateWorldMatrix(false, true);
  }
  if (bag && !bag.hem) {
    bag.hem = skirt(S3, a, 0, 0xe6dccb);
    bag.hem.scale.x *= 1.25;
    bag.hem.scale.z *= 1.4;
  }
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

export function staged(plate, marks, options = {}) {
  const userOver = options.over;
  const sh = base(plate, marks, {
    ...options,
    // clothFloor and the gaze pass run inside the frame, after act(); the seat has to follow them
    over(lt, u, t, S, st, S3) {
      userOver?.(lt, u, t, S, st, S3);
      for (const [n, a] of Object.entries(st?.A || {})) {
        if (marks[n]?.pose === 'kneel' && marks[n]?.o?.skipFit) syncSeat(a);
      }
    },
  });
  const load = sh.load;
  sh.load = async () => {
    await load();
    for (const [n, a] of Object.entries(sh.st.A || {})) {
      if (marks[n]?.pose !== 'kneel' || marks[n]?.o?.skipFit) continue;
      fitKneel(a);
      PO.drapeLap(a, 0);
      seatPins(a);
      if (sh.st.snaps) sh.st.snaps[n] = PO.snap(a);
    }
  };
  return sh;
}
