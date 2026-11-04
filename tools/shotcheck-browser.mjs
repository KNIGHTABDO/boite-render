// Browser half of shotcheck. CPU geometry only; no pixel reads or WebGL context.
import * as THREE from 'three';
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const clamp = x => Math.max(-1, Math.min(1, x));
const deg = x => x * 180 / Math.PI;
const models = new WeakMap(), attachments = new WeakMap();
const world = b => b.getWorldPosition(V());
function shown(o) { for (; o; o = o.parent) if (!o.visible) return false; return true; }
function onStage(o, scene) { for (; o; o = o.parent) if (o === scene) return true; return false; }
function corners(b) {
  if (b.isEmpty()) return [];
  return [0, 1, 2, 3, 4, 5, 6, 7].map(i => V(i & 1 ? b.max.x : b.min.x, i & 2 ? b.max.y : b.min.y, i & 4 ? b.max.z : b.min.z));
}
function model(a) {
  if (models.has(a)) return models.get(a);
  // Exclude the inverted hull and any patch: the first skinned mesh is the body.
  let mesh; a.group.traverse(o => { if (!mesh && o.isSkinnedMesh) mesh = o; });
  if (!mesh) throw new Error(`No skinned body for ${a.name}`);
  const p = mesh.geometry.attributes.position, feet = [], head = [];
  const box = new THREE.Box3();
  for (let i = 0; i < p.count; i++) {
    const v = V().fromBufferAttribute(p, i); box.expandByPoint(v);
    if (v.y <= a.S.ankle + .035) feet.push(i);
    if (v.y >= a.S.neck) head.push(i);
  }
  if (!feet.length || !head.length) throw new Error(`Missing foot/head geometry for ${a.name}`);
  // Width across horizontal directions: the circumscribed XZ box diameter keeps the
  // capsule valid when a robe is deeper than it is wide. This is deliberately conservative.
  const m = { mesh, feet, head, width: Math.hypot(box.max.x - box.min.x, box.max.z - box.min.z) };
  models.set(a, m); return m;
}
function skinPoints(mesh, ids) {
  return ids.map(i => { const v = V(); mesh.getVertexPosition(i, v); return v.applyMatrix4(mesh.matrixWorld); });
}
function project(p, q) {
  const v = p.clone().project(q.stage.cam), x = (v.x + 1) * 960, y = (1 - v.y) * 540;
  const m = q.transform, [w, h] = q.canvas;
  return V((m.a * x + m.c * y + m.e) / w * 2 - 1, 1 - (m.b * x + m.d * y + m.f) / h * 2, v.z);
}
const inside = p => Math.abs(p.x) <= 1 && Math.abs(p.y) <= 1 && Math.abs(p.z) <= 1;
function inFrame(points, q) {
  const b = new THREE.Box3().setFromPoints(points.map(p => project(p, q)));
  return b.max.x >= -1 && b.min.x <= 1 && b.max.y >= -1 && b.min.y <= 1 && b.max.z >= -1 && b.min.z <= 1;
}
function propPoints(o) {
  const pts = [];
  o.traverse(m => {
    if (!m.isMesh || !shown(m) || m.material?.colorWrite === false || m.material?.opacity === 0) return;
    m.geometry.computeBoundingBox();
    pts.push(...corners(m.geometry.boundingBox).map(p => p.applyMatrix4(m.matrixWorld)));
  });
  return pts;
}
function nearest(p, a, b) {
  const d = b.clone().sub(a), t = Math.max(0, Math.min(1, p.clone().sub(a).dot(d) / (d.lengthSq() || 1)));
  return a.clone().addScaledVector(d, t);
}
// Closest points of two finite segments, including parallel and degenerate cases.
export function segmentDistance(a, b, c, d) {
  const u = b.clone().sub(a), v = d.clone().sub(c), w = a.clone().sub(c);
  const A = u.dot(u), B = u.dot(v), C = v.dot(v), D = u.dot(w), E = v.dot(w), den = A * C - B * B;
  if (A < 1e-12) return a.distanceTo(nearest(a, c, d));
  if (C < 1e-12) return c.distanceTo(nearest(c, a, b));
  let s = den > 1e-12 ? Math.max(0, Math.min(1, (B * E - C * D) / den)) : 0;
  let t = (B * s + E) / C;
  if (t < 0) { t = 0; s = Math.max(0, Math.min(1, -D / A)); }
  if (t > 1) { t = 1; s = Math.max(0, Math.min(1, (B - D) / A)); }
  return a.clone().addScaledVector(u, s).distanceTo(c.clone().addScaledVector(v, t));
}
function triangleDistance(a, b, tri) {
  if (tri.getArea() < 1e-12) return Math.min(segmentDistance(a, b, tri.a, tri.b), segmentDistance(a, b, tri.b, tri.c), segmentDistance(a, b, tri.c, tri.a));
  const hit = tri.getPlane(new THREE.Plane()).intersectLine(new THREE.Line3(a, b), V());
  if (hit && tri.containsPoint(hit)) return 0;
  return Math.min(a.distanceTo(tri.closestPointToPoint(a, V())), b.distanceTo(tri.closestPointToPoint(b, V())),
    segmentDistance(a, b, tri.a, tri.b), segmentDistance(a, b, tri.b, tri.c), segmentDistance(a, b, tri.c, tri.a));
}
function covered(p, q) {
  const from = world(q.stage.cam), dist = from.distanceTo(p);
  const ray = new THREE.Raycaster(from, p.clone().sub(from).normalize(), 0, dist - .001);
  return q.covers.some(o => shown(o) && ray.intersectObject(o, true).length > 0);
}
function hand(a, side) {
  const bone = a.B['hand' + side], start = world(bone), s = side === 'L' ? 1 : -1;
  const tip = V(s * a.S.hand[0], a.S.hand[1], 0).sub(bone.userData.abs);
  return { a, side, bone, start, end: bone.localToWorld(tip.clone()), palm: bone.localToWorld(tip.clone().multiplyScalar(.45)) };
}
function standing(a) {
  // Do not compare a seated, crouched, leaning or lying silhouette with standing height.
  const up = V(0, 1, 0);
  for (const [x, y] of [['root', 'spine'], ['neck', 'head'], ['thighL', 'shinL'], ['thighR', 'shinR'], ['shinL', 'footL'], ['shinR', 'footR']]) {
    if (!a.B[x] || !a.B[y]) return false;
    const dir = world(a.B[y]).sub(world(a.B[x])).normalize().multiplyScalar(x === 'root' || x === 'neck' ? 1 : -1);
    if (dir.dot(up) < Math.cos(Math.PI / 9)) return false;
  }
  // A tilted skull can lower the crown by >5% without changing the model's metric scale.
  return a.B.head.localToWorld(V(0, 1, 0)).sub(world(a.B.head)).normalize().dot(up) >= Math.cos(Math.PI / 9);
}
export const limits = Object.freeze({ feet: .03, overlap: .02, faceyaw: 55, headcut: .35, arm: 45, prop: .04, height: .05, pop: 0 });
export function sample({ scene, t, cast = {}, annotations = {}, cut = false, previous = null }) {
  const qa = window.__qa, failures = [], states = {}, active = [...new Set(qa?.active || [])];
  const fail = (check, who, value, limit = limits[check]) => failures.push({ scene, t: +t.toFixed(4), check, who, value, limit });
  const round = n => +n.toFixed(5);
  const cameras = [];
  for (const q of active) {
    const { stage } = q; stage.scene.updateMatrixWorld(true); stage.cam.updateMatrixWorld(true);
    const stageNotes = annotations.stages?.[qa.stages?.indexOf(q) ?? 0] || {};
    cameras.push([stage.scene.uuid, ...stage.cam.matrixWorld.elements, ...stage.cam.projectionMatrix.elements,
      q.transform.a / q.canvas[0], q.transform.b / q.canvas[1], q.transform.c / q.canvas[0], q.transform.d / q.canvas[1], q.transform.e / q.canvas[0], q.transform.f / q.canvas[1]]);
    const actors = [], hands = [];
    for (const a of stage.actors) {
      if (a.group.parent !== stage.scene) continue;
      const m = model(a), head = world(a.B.head), root = world(a.B.root || a.B.spine);
      const foot = skinPoints(m.mesh, m.feet), skull = skinPoints(m.mesh, m.head);
      const low = Math.min(...foot.map(p => p.y)), top = Math.max(...skull.map(p => p.y));
      const scale = a.group.getWorldScale(V());
      const radius = m.width * Math.max(Math.abs(scale.x), Math.abs(scale.z)) / (a.S.top - a.S.bottom) / 2;
      const bounds = corners(new THREE.Box3().setFromPoints([...foot, ...skull, root])).map(p => p);
      const visible = shown(a.group) && q.alpha > .001 && inFrame(bounds, q);
      // Keep the last on-screen position even when hidden: visibility toggles must not erase their own evidence.
      states[a.group.uuid] = { who: a.name, visible: shown(a.group), onScreen: inFrame(bounds, q) };
      const d = { a, root, head, radius, visible }; actors.push(d);
      hands.push(hand(a, 'L'), hand(a, 'R'));
      // Discover actual hand children (props may be added directly to a bone).
      for (const side of ['L', 'R']) for (const o of a.B['hand' + side].children) {
        if (!o.isBone && !q.props.includes(o)) { q.props.push(o); qa.props.push(o); }
      }
      if (!visible) continue;
      const meta = { ...(a.group.userData.qa || {}), ...(annotations.actors?.[a.name] || {}), ...(stageNotes.actors?.[a.name] || {}) };
      const support = meta.support ?? q.supports[a.name] ?? q.supportAt?.(a) ?? q.support;
      if (typeof support !== 'number' || !Number.isFinite(support)) throw new Error(`Invalid support: ${a.name}`);
      const delta = low - support;
      if (Math.abs(delta) > limits.feet) fail('feet', a.name, { kind: delta > 0 ? 'float' : 'sink', metres: round(delta), support });
      const hp = project(head, q), projectedHead = skull.map(p => project(p, q));
      if (inside(hp) && !covered(head, q)) {
        if (q.faces.has(a) && a.S.face) {
          const fwd = a.B.head.localToWorld(V(0, 0, 1)).sub(head).normalize();
          const angle = deg(Math.acos(clamp(fwd.dot(world(stage.cam).sub(head).normalize()))));
          if (angle > limits.faceyaw) fail('faceyaw', a.name, round(angle));
        }
        const y = projectedHead.map(p => p.y), x = projectedHead.map(p => p.x);
        const height = (Math.max(...y) - Math.min(...y)) / 2;
        const edge = Math.min(...y) < -1 || Math.max(...y) > 1 || Math.min(...x) < -1 || Math.max(...x) > 1;
        if (edge && height <= limits.headcut) fail('headcut', a.name, { fraction: round(height), bounds: [Math.min(...x), Math.min(...y), Math.max(...x), Math.max(...y)].map(round) });
      }
      // Every loadRigged body is one robe mesh; flag all raised upper arms, including capes.
      if (meta.robe !== false) for (const side of ['L', 'R']) {
        const upper = world(a.B['foreArm' + side]).sub(world(a.B['upperArm' + side])).normalize();
        const angle = deg(Math.acos(clamp(upper.dot(V(0, -1, 0)))));
        if (angle > limits.arm) fail('arm', `${a.name}.${side}`, round(angle));
      }
      if (standing(a)) {
        const role = cast[a.name] || {}, expected = role.height ?? role.height_m ?? a.qa.expectedHeight * (role.scale ?? 1);
        const actual = top - low, error = Math.abs(actual / expected - 1);
        if (error > limits.height) fail('height', a.name, { metres: round(actual), expected, relative: round(error) });
      }
    }
    for (let i = 0; i < actors.length; i++) for (let j = i + 1; j < actors.length; j++) {
      const a = actors[i], b = actors[j]; if (!a.visible || !b.visible) continue;
      const depth = a.radius + b.radius - segmentDistance(a.root, a.head, b.root, b.head);
      if (depth > limits.overlap) fail('overlap', [a.a.name, b.a.name], round(depth));
    }
    for (const [i, o] of q.props.entries()) {
      o.updateWorldMatrix(true, true);
      const pts = propPoints(o), onScreen = pts.length > 0 && inFrame(pts, q);
      const name = o.userData.qa?.name || o.name || `prop${i + 1}`;
      const visible = shown(o) && onStage(o, stage.scene);
      states[o.uuid] = { who: name, visible, onScreen };
      // Hidden props still need bounds for disappearance detection.
      if (!visible || q.alpha <= .001 || !onScreen) continue;
      const meta = { ...(o.userData.qa || {}), ...(annotations.props?.[name] || {}), ...(stageNotes.props?.[name] || {}) };
      const anchor = [meta.grip, o.userData.grip, o.userData.handle].find(v => v?.isVector3 || Array.isArray(v)) ?? [0, 0, 0];   // ep07 marks held props qa.grip:true
      const grip = o.localToWorld(anchor.isVector3 ? anchor.clone() : V(...anchor));
      let h = hands.find(h => { for (let p = o.parent; p; p = p.parent) if (p === h.bone) return true; return false; });
      if (!h && meta.hand) h = hands.find(h => `${h.a.name}.${h.side}` === meta.hand);
      // Legacy shots place props in world space. Infer only when a grip is actually within 4 cm of a hand,
      // then retain that association while it moves. A new close contact permits a hand-off.
      const close = hands.filter(h => shown(h.a.group)).map(h => ({ h, d: grip.distanceTo(nearest(grip, h.start, h.end)) })).sort((a, b) => a.d - b.d)[0];
      if (!h && close?.d <= limits.prop) { h = close.h; attachments.set(o, { actor: h.a, side: h.side }); }
      if (!h) { const old = attachments.get(o); if (old) h = hands.find(h => h.a === old.actor && h.side === old.side); }
      if (h) {
        const distance = grip.distanceTo(nearest(grip, h.start, h.end));
        if (distance > limits.prop) fail('prop', name, { kind: 'detached', hand: `${h.a.name}.${h.side}`, metres: round(distance) });
      }
      // Only an explicit owner declaration permits clothing to occupy that body. A nearest-hand
      // guess must not excuse a held vest clipping into the merchant's own torso.
      const owner = meta.owner;
      // Intersect actual visible triangles: a large face can cross a capsule even with all its vertices outside.
      const triangles = [];
      o.traverse(m => { if (!m.isMesh || !shown(m)) return; const p = m.geometry.attributes.position;
        const ix = m.geometry.index, count = ix?.count ?? p.count;
        for (let k = 0; k + 2 < count; k += 3) triangles.push(new THREE.Triangle(...[0, 1, 2].map(j => {
          const v = V(); if (m.isSkinnedMesh) m.getVertexPosition(ix ? ix.getX(k + j) : k + j, v);
          else v.fromBufferAttribute(p, ix ? ix.getX(k + j) : k + j);
          return v.applyMatrix4(m.matrixWorld);
        }))); });
      const propBox = new THREE.Box3().setFromPoints(pts), centre = propBox.getCenter(V()), reach = propBox.getSize(V()).length() / 2;
      for (const a of actors) {
        if (!a.visible || owner === a.a.name) continue;
        if (centre.distanceTo(nearest(centre, a.root, a.head)) > a.radius + reach) continue;
        let penetration = 0;
        for (const tri of triangles) penetration = Math.max(penetration, a.radius - triangleDistance(a.root, a.head, tri));
        if (penetration > 0) fail('prop', name, { kind: 'inside', actor: a.a.name, metres: round(penetration) }, 0);
      }
    }
  }
  // Stage changes are cuts. For runtimes without timeline metadata, any camera discontinuity is a fallback cut.
  const jump = previous && (cameras.length !== previous.cameras.length || cameras.some((c, i) => c.some((v, j) => typeof v === 'string' ? v !== previous.cameras[i]?.[j] : Math.abs(v - previous.cameras[i]?.[j]) > (j < 33 ? .1 : .04))));
  const isCut = cut || jump;
  if (previous && !isCut) for (const id of new Set([...Object.keys(previous.states), ...Object.keys(states)])) {
    const a = previous.states[id], b = states[id];
    // Frustum exits do not count as pops; an explicit visibility toggle while either position is on screen does.
    if (Boolean(a?.visible) !== Boolean(b?.visible) && (a?.onScreen || b?.onScreen)) fail('pop', (b || a).who, { from: !!a?.visible, to: !!b?.visible }, 0);
  }
  return { failures, states, cameras, cut: !!isCut };
}
