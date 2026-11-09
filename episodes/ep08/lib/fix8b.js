// Extra contact repairs for s10 / s11 / s17. fix8.js stays shared and untouched.
import * as THREE from 'three';
import * as PO from '../../../engine/poses.js';
import { staged as staged8, approach } from './fix8.js';
import { at } from './beatscene.js';

export { approach };

const _hp = new THREE.Vector3(), _fwd = new THREE.Vector3(), _to = new THREE.Vector3();

// Hands beside the hips, clear of the torso capsule. The thigh pins from fix8
// fold the forearms through the belly and sit a few centimetres out of reach.
export function sidePins(a) {
  const k = a.group.scale.y / 1.6;
  a.group.updateMatrixWorld(true);
  a.pins = ['L', 'R'].map(side => {
    const sign = side === 'L' ? 1 : -1;
    const p = PO.hipToWorld(a, sign * .30 * k, .04 * k, .12 * k);
    return [side, a.B.root.worldToLocal(p)];
  });
}

// Re-apply that same rest after a speech gesture has folded an arm back in.
export function sideHold(a, sides = ['L', 'R']) {
  const k = a.group.scale.y / 1.6;
  let err = 0;
  for (const side of sides) {
    const sign = side === 'L' ? 1 : -1;
    err = Math.max(err, PO.reach(a, side, PO.hipToWorld(a, sign * .30 * k, .04 * k, .12 * k), {
      grip: .02, pole: side === 'L' ? [.42, .05, .15] : [-.42, .05, .15],
    }));
  }
  return err;
}

export function staged(plate, marks, options = {}) {
  const sh = staged8(plate, marks, options);
  const load = sh.load;
  sh.load = async () => {
    await load();
    for (const [n, a] of Object.entries(sh.st.A || {})) if (marks[n]?.pose === 'kneel') sidePins(a);
  };
  return sh;
}

// Slide `a` away from `b` along the floor until their pelvises are `gap` metres apart.
export function apart(a, b, gap) {
  const d = at(a, 'root').sub(at(b, 'root')); d.y = 0;
  const dist = d.length();
  if (dist < gap) {
    a.group.position.addScaledVector(dist < 1e-4 ? _to.set(1, 0, 0) : d.multiplyScalar(1 / dist), gap - dist);
    a.group.updateMatrixWorld(true);
  }
}

// Yaw the body toward the plate camera until the horizontal face normal is within `limit` radians.
// Look clamps still apply afterwards, so `limit` stays under the 100° facing budget.
export function yawToward(a, cam, limit = 1.15) {
  if (!cam) return;
  a.group.updateMatrixWorld(true);
  a.B.head.getWorldPosition(_hp);
  _fwd.copy(a.B.head.localToWorld(new THREE.Vector3(0, 0, 1))).sub(_hp);
  _fwd.y = 0; if (_fwd.lengthSq() < 1e-8) return; _fwd.normalize();
  _to.copy(cam.position).sub(_hp); _to.y = 0; if (_to.lengthSq() < 1e-8) return; _to.normalize();
  const ang = Math.acos(Math.min(1, Math.max(-1, _fwd.dot(_to))));
  if (ang <= limit) return;
  const d = Math.atan2(_to.x, _to.z) - Math.atan2(_fwd.x, _fwd.z);
  const turn = Math.atan2(Math.sin(d), Math.cos(d));
  a.group.rotation.y += turn - Math.sign(turn) * limit;
  a.group.updateMatrixWorld(true);
}
