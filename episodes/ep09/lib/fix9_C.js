// r02 group C — shared posing for s06, s07, s11, s12. Scene files only.
import * as THREE from 'three';
import * as PO from '../../../engine/poses.js';
import * as PR from '../../../engine/props3d.js';
import { at, dirW, V } from './beatscene.js';

export function reachClamp(a, side, target, opt) {
  const sh = at(a, 'upperArm' + side);
  const len = (a.armLen ||= {})[side] ||= sh.distanceTo(at(a, 'foreArm' + side)) + at(a, 'foreArm' + side).distanceTo(at(a, 'hand' + side));
  const d = target.clone().sub(sh), maxR = len * .92;
  const tgt = d.length() > maxR ? sh.clone().addScaledVector(d.normalize(), maxR) : target;
  return PO.reach(a, side, tgt, opt);
}

// Hands beside the thighs, elbows soft. Replaces the flared waist-hover the talk layer leaves behind.
export function armsDown(a, t, seed = 0) {
  const k = a.group.scale.y / 1.6;
  for (const s of ['L', 'R']) {
    const sg = s === 'L' ? 1 : -1;
    const sh = at(a, 'upperArm' + s);
    const len = sh.distanceTo(at(a, 'foreArm' + s)) + at(a, 'foreArm' + s).distanceTo(at(a, 'hand' + s));
    const sw = .012 * Math.sin(t * .85 + seed + sg);
    const tg = sh.clone()
      .addScaledVector(dirW(a, sg, 0, 0), .09 * k)
      .addScaledVector(dirW(a, 0, 0, 1), (.05 + sw) * k)
      .add(V(0, -.9 * len, 0));
    PO.reach(a, s, tg, { grip: 0, pole: [sg * .22, .04, -.35] });
    PO.fingers(a, s, .34, { spread: .08 });
  }
}

// Palms on the thighs, forward of the sash, elbows tucked. Kneel / cross.
export function lapHands(a, t, seed = 0) {
  const k = a.group.scale.y / 1.6;
  for (const [s, sg] of [['L', 1], ['R', -1]]) {
    const bob = .008 * k * Math.sin(t * .9 + seed + sg);
    const tg = PO.hipToWorld(a, sg * .15 * k, .035 * k + bob, .32 * k);
    reachClamp(a, s, tg, { grip: .02, pole: [sg * .18, -.06, .06] });
    PO.fingers(a, s, .2, { thumb: .18, spread: .14 });
  }
}

// A few pale puffs rising off a bowl. key keeps one group per shot.
export function steamAt(S3, st, key, origin, t) {
  const bag = st._steam ||= {};
  if (!bag[key]) {
    const g = new THREE.Group(), puffs = [];
    for (let i = 0; i < 5; i++) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(.02, 6, 4), PR.toon(0xf6f3ec));
      g.add(m); puffs.push(m);
    }
    S3.scene.add(g);
    bag[key] = puffs;
  }
  bag[key].forEach((m, i) => {
    const u = ((t * .42 + i * .2) % 1);
    m.position.set(
      origin.x + Math.sin(t * 1.7 + i * 1.6) * .04,
      origin.y + .02 + u * .34,
      origin.z + Math.cos(t * 1.3 + i) * .04,
    );
    m.scale.setScalar(.5 + u * 1.7);
    m.visible = true;
  });
}
