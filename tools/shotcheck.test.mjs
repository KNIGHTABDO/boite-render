import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { sample, segmentDistance } from './shotcheck-browser.mjs';
import { options, boundaries } from './shotcheck.mjs';
const V = (...p) => new THREE.Vector3(...p);
function fixture() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(40, 16 / 9, .05, 80);
  cam.position.set(0, 1, 5); cam.lookAt(0, .85, 0); cam.updateMatrixWorld(true);
  const q = { stage: { scene, cam, actors: new Set() }, props: [], covers: [], faces: new Set(), support: 0, supports: {}, alpha: 1,
    transform: { a: 1 / 6, b: 0, c: 0, d: 1 / 6, e: 0, f: 0 }, canvas: [320, 180] };
  globalThis.window = { __qa: { active: [q], props: [] } };
  function actor(name = 'boy', x = 0) {
    const B = {}, bone = (name, parent, x, y) => {
      const b = new THREE.Bone(); b.name = name; b.userData.abs = V(x, y, 0);
      b.position.copy(b.userData.abs); if (parent) { parent.add(b); b.position.sub(parent.userData.abs); }
      B[name] = b; return b;
    };
    bone('root', null, 0, .5); bone('spine', B.root, 0, .65); bone('neck', B.spine, 0, .85); bone('head', B.neck, 0, .93);
    for (const [s, x] of [['L', .18], ['R', -.18]]) {
      bone('thigh' + s, B.root, x / 2, .5); bone('shin' + s, B['thigh' + s], x / 2, .28); bone('foot' + s, B['shin' + s], x / 2, .05);
      bone('upperArm' + s, B.spine, x, .75); bone('foreArm' + s, B['upperArm' + s], x, .5); bone('hand' + s, B['foreArm' + s], x, .25);
    }
    const bones = Object.values(B), positions = [], indices = [], weights = [];
    for (const y of [0, .02, .86, 1]) for (const x of [-.09, .09]) for (const z of [-.08, .08]) {
      positions.push(x, y, z); indices.push(bones.indexOf(y < .1 ? B[x < 0 ? 'footR' : 'footL'] : B.head), 0, 0, 0); weights.push(1, 0, 0, 0);
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(indices, 4)); geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(weights, 4));
    const mesh = new THREE.SkinnedMesh(geo, new THREE.MeshBasicMaterial()); mesh.add(B.root); mesh.bind(new THREE.Skeleton(bones));
    const group = new THREE.Group(); group.add(mesh); group.scale.setScalar(1.62); group.position.x = x; scene.add(group);
    const a = { name, group, B, S: { top: 1, bottom: 0, ankle: .05, neck: .85, hand: [.18, .18], face: {} }, qa: { expectedHeight: 1.62 } };
    q.stage.actors.add(a); q.faces.add(a); return a;
  }
  function prop(a, offset = .02) {
    const o = new THREE.Mesh(new THREE.BoxGeometry(.02, .02, .02), new THREE.MeshBasicMaterial());
    o.name = 'cup'; a.B.handL.add(o); o.position.y = offset; q.props.push(o); return o;
  }
  const check = (previous = null, cut = false, extra = {}) => sample({ scene: 'fixture', t: 0, previous, cut, ...extra });
  return { q, actor, prop, check };
}
test('clean standing geometry passes all checks', () => {
  const f = fixture(), a = f.actor(); f.prop(a);
  f.q.stage.scene.add(new THREE.Mesh(new THREE.BoxGeometry(20, 20, 20), new THREE.MeshBasicMaterial()));
  assert.deepEqual(f.check().failures, []); // Unregistered paintings/objects have no effect.
});
test('feet: exact 3cm tolerance, float/sink, declared raised support', () => {
  const f = fixture(), a = f.actor(); a.group.position.y = .0299;
  assert.ok(!f.check().failures.some(x => x.check === 'feet'));
  a.group.position.y = .0301; assert.equal(f.check().failures.find(x => x.check === 'feet').value.kind, 'float');
  a.group.position.y = -.0301; assert.equal(f.check().failures.find(x => x.check === 'feet').value.kind, 'sink');
  a.group.position.y = .72; f.q.supports.boy = .72; assert.deepEqual(f.check().failures, []);
  delete f.q.supports.boy; f.q.supportAt = () => .72;
  assert.deepEqual(f.check().failures, []); // E1 discovers the painted box under the actor.
  f.q.supports.boy = 0; assert.ok(f.check().failures.some(x => x.check === 'feet')); // Explicit declarations still win.
  assert.deepEqual(f.check(null, false, { annotations: { stages: { 0: { actors: { boy: { support: .72 } } } } } }).failures, []);
});
test('capsules require both visible and actual segment penetration', () => {
  const f = fixture(); f.actor(); const b = f.actor('other', .1);
  assert.ok(f.check().failures.some(x => x.check === 'overlap'));
  b.group.visible = false; assert.ok(!f.check().failures.some(x => x.check === 'overlap'));
  assert.equal(segmentDistance(V(0, 0, 0), V(0, 1, 0), V(1, 0, 0), V(1, 1, 0)), 1);
  assert.equal(segmentDistance(V(0, 0, 0), V(1, 0, 0), V(.5, -1, 0), V(.5, 1, 0)), 0);
});
test('decal yaw: 55deg threshold, frustum and holdout cover', () => {
  const f = fixture(), a = f.actor(); a.B.head.rotation.y = 54 * Math.PI / 180;
  assert.ok(!f.check().failures.some(x => x.check === 'faceyaw'));
  a.B.head.rotation.y = 58 * Math.PI / 180; assert.ok(f.check().failures.some(x => x.check === 'faceyaw'));
  const cover = new THREE.Mesh(new THREE.BoxGeometry(1, 2, .1), new THREE.MeshBasicMaterial()); cover.position.set(0, 1, 1); f.q.stage.scene.add(cover); f.q.covers.push(cover);
  assert.ok(!f.check().failures.some(x => x.check === 'faceyaw'));
  a.group.position.x = 100; assert.equal(f.check().failures.length, 0);
});
test('head crossing edge fails; deliberate closeup is allowed', () => {
  const f = fixture(); f.actor();
  f.q.transform.f = -56;
  assert.ok(f.check().failures.some(x => x.check === 'headcut'));
  // The head centre stays in frame and the crown still crosses the top, but the head is now >35% tall.
  f.q.stage.cam.position.set(0, 1.5, .4); f.q.stage.cam.lookAt(0, 1.5, 0);
  assert.ok(!f.check().failures.some(x => x.check === 'headcut'));
});
test('robe arms: 45deg tolerance', () => {
  const f = fixture(), a = f.actor(); a.B.upperArmL.rotation.z = 44 * Math.PI / 180;
  assert.ok(!f.check().failures.some(x => x.check === 'arm'));
  a.B.upperArmL.rotation.z = 46 * Math.PI / 180; assert.ok(f.check().failures.some(x => x.check === 'arm'));
  a.S.capeHands = true; assert.ok(f.check().failures.some(x => x.check === 'arm'));
});
test('props: near hand passes, detached fails; wrong actor capsule fails', () => {
  const f = fixture(), a = f.actor(), o = f.prop(a);
  assert.ok(!f.check().failures.some(x => x.check === 'prop'));
  o.position.y = .1; assert.ok(f.check().failures.some(x => x.check === 'prop' && x.value.kind === 'detached'));
  a.B.handL.remove(o); f.q.stage.scene.add(o); o.position.set(1, 1.1, 0); f.actor('merchant', 1);
  assert.ok(f.check().failures.some(x => x.check === 'prop' && x.value.kind === 'inside' && x.value.actor === 'merchant'));
});
test('prop triangle interiors intersect capsules even when the vertices are outside', () => {
  const f = fixture(); f.actor();
  const o = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial());
  o.position.y = 1; f.q.stage.scene.add(o); f.q.props.push(o);
  assert.ok(f.check().failures.some(x => x.check === 'prop' && x.value.kind === 'inside'));
  o.userData.qa = { owner: 'boy' }; assert.ok(!f.check().failures.some(x => x.check === 'prop'));
});
test('height: explicit cast metric and model fallback, standing only', () => {
  const f = fixture(), a = f.actor(); a.group.scale.setScalar(1.62 * 1.049);
  assert.ok(!f.check().failures.some(x => x.check === 'height'));
  a.group.scale.setScalar(1.72);
  assert.ok(f.check().failures.some(x => x.check === 'height'));
  assert.ok(!f.check(null, false, { cast: { boy: { height: 1.72 } } }).failures.some(x => x.check === 'height'));
  a.B.head.rotation.x = .8; assert.ok(!f.check().failures.some(x => x.check === 'height'));
  a.B.thighL.rotation.x = 1; assert.ok(!f.check().failures.some(x => x.check === 'height'));
});
test('visibility pops fail; cuts, camera jumps and frustum exits pass', () => {
  const f = fixture(), a = f.actor(); const before = f.check(); a.group.visible = false;
  assert.ok(f.check(before).failures.some(x => x.check === 'pop'));
  assert.ok(!f.check(before, true).failures.some(x => x.check === 'pop'));
  f.q.stage.cam.position.x += 1; assert.ok(!f.check(before).failures.some(x => x.check === 'pop'));
  a.group.visible = true; const next = f.check(); a.group.position.x = 100;
  assert.ok(!f.check(next).failures.some(x => x.check === 'pop'));
});
test('registered actors/props added or removed within a shot also pop', () => {
  const f = fixture(), a = f.actor(), o = f.prop(a); const before = f.check();
  a.B.handL.remove(o); assert.ok(f.check(before).failures.some(x => x.check === 'pop' && x.who === 'cup'));
  const middle = f.check(); f.q.stage.actors.delete(a); f.q.stage.scene.remove(a.group);
  assert.ok(f.check(middle).failures.some(x => x.check === 'pop' && x.who === 'boy'));
  const empty = f.check(); f.actor('newcomer');
  assert.ok(f.check(empty).failures.some(x => x.check === 'pop' && x.who === 'newcomer'));
});
test('arguments and literal segment boundary mapping', () => {
  assert.throws(() => options(['ep06', '--fps', '0'])); assert.throws(() => options(['../ep06']));
  assert.deepEqual(options(['ep06', '--scenes', '']).scenes, []);
  assert.equal(options(['ep06']).fps, 4);
  assert.deepEqual(boundaries("segs: [ac([0, 0], sh.fn), st('paint', [1, .5]), ac([2, 0], sh.fn)]", { start: 10, lines: [{ start: 11, dur: 2 }, { start: 20, dur: 4 }, { start: 30, dur: 5 }] }), [0, 12, 20]);
});
