// clips.js: action clips for rigged actors (WORKFLOW-V2 E3): run cycle, travel along a floor path (no foot sliding,
// proper exits instead of pops) and a fall that blends verified pose snapshots (stand -> knees -> lying).
// Everything is a pure function of time, so chunked renders stay deterministic.
import * as THREE from 'three';
import * as PO from './poses.js';
import { rest, walkPose } from './rig3d.js';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/** run cycle (ph 0..1 per stride pair): longer stride, knees high, forward lean, bent arms pumping */
export function runPose(B, ph, amt = 1) {
  const a = ph * Math.PI * 2, k = amt;
  B.thighL.rotation.x = -Math.sin(a) * .75 * k; B.thighR.rotation.x = Math.sin(a) * .75 * k;
  B.shinL.rotation.x = (.25 + Math.max(0, Math.sin(a - 1.1)) * 1.3) * k; B.shinR.rotation.x = (.25 + Math.max(0, -Math.sin(a - 1.1)) * 1.3) * k;
  B.footL.rotation.x = -Math.sin(a) * .3 * k; B.footR.rotation.x = Math.sin(a) * .3 * k;
  // flight phase: the body rises twice per cycle, lowest at foot strike
  B.root.position.y = B.root.userData.abs.y + (Math.abs(Math.sin(a)) * .05 - .03) * k;
  B.root.rotation.y = Math.sin(a) * .1 * k; B.root.rotation.z = 0;
  B.spine.rotation.x = .18 * k; B.chest.rotation.x = .06 * k; B.spine.rotation.y = -Math.sin(a) * .12 * k;
  B.head.rotation.x = -.12 * k;   // eyes stay level over the lean
  B.upperArmL.rotation.x = Math.sin(a) * .9 * k; B.upperArmR.rotation.x = -Math.sin(a) * .9 * k;
  B.foreArmL.rotation.x = -1.3 * k; B.foreArmR.rotation.x = -1.3 * k;
}

/**
 * move an actor along floor points [[x,z], ...] (metres) from t0 at `speed` m/s, facing the way it goes, legs cycling
 * by distance (stride = metres per cycle, so feet don't slide). gait: 'walk' | 'run'. Before t0 it stands at the first
 * point; after the end it stands at the last one, or is hidden when exit: true (it walked out of the frame).
 * It owns the pose: rest() + gait each call, so layer look()/reach() after it.
 * Returns { pos, done, moving }.
 */
export function travel(a, pts, t, { t0 = 0, speed = 1.1, gait = 'walk', exit = false, y = 0 } = {}) {
  const P = pts.map(([x, z]) => new THREE.Vector3(x, y, z)), seg = [], k = a.group.scale.y / 1.6;
  let total = 0; for (let i = 1; i < P.length; i++) { const d = P[i].distanceTo(P[i - 1]); seg.push(d); total += d; }
  const dist = clamp((t - t0) * speed, 0, total), moving = t > t0 && dist < total;
  let i = 0, acc = 0; while (i < seg.length - 1 && acc + seg[i] < dist) acc += seg[i++];
  const u = seg[i] ? (dist - acc) / seg[i] : 0, pos = P[i].clone().lerp(P[i + 1] || P[i], u), dir = (P[i + 1] || P[i]).clone().sub(P[i]);
  a.group.position.set(pos.x, a.group.position.y, pos.z);
  if (dir.lengthSq() > 1e-6) a.group.rotation.y = Math.atan2(dir.x, dir.z);
  // ease in/out over the first/last half metre so the cycle doesn't start at full amplitude
  const amt = moving ? Math.min(1, dist / .5, (total - dist) / .5 + .3) : 0;
  const stride = (gait === 'run' ? 1.5 : .9) * k;
  rest(a.B); (gait === 'run' ? runPose : walkPose)(a.B, dist / stride, amt);
  const done = t > t0 && dist >= total;
  a.group.visible = !(exit && done);
  a.group.updateMatrixWorld(true);
  return { pos, done, moving };
}

/**
 * fall: solve the key poses once (call in build, after placing the actor standing), then play with fall.at(k).
 * Keys: stand (as placed) -> stumble (lean, arms out) -> knees (PO.kneel) -> lying. dir 'front' (a trip, default): face down,
 * head forward of the hips, arms ahead, face turned to the side; dir 'back': PO.lie (on the back, head behind; `turn` rolls it).
 * at(k): k = 0..1 over the clip; typical length .9 s (k = (t - tHit) / .9).
 */
export function fallClip(a, { floor = 0, turn = 0, dir = 'front' } = {}) {
  const stand = PO.snap(a);
  a.B.spine.rotation.x += .45; a.B.head.rotation.x -= .25;
  a.B.upperArmL.rotation.x -= 1.2; a.B.upperArmR.rotation.x -= 1.2; a.B.upperArmL.rotation.z += .5; a.B.upperArmR.rotation.z -= .5;
  a.group.updateMatrixWorld(true);
  const stumble = PO.snap(a);
  PO.apply(a, stand); PO.kneel(a, { seat: floor, lean: .5, hands: false }); const knees = PO.snap(a);
  PO.apply(a, stand);
  if (dir === 'back') PO.lie(a, { top: floor, turn });
  else {
    rest(a.B); a.B.root.rotation.set(Math.PI / 2, 0, 0);
    a.B.upperArmL.rotation.x = a.B.upperArmR.rotation.x = -1.1; a.B.upperArmL.rotation.z = .35; a.B.upperArmR.rotation.z = -.35;
    a.B.foreArmL.rotation.x = a.B.foreArmR.rotation.x = -.5; a.B.head.rotation.y = .9; a.B.neck.rotation.x = -.25;
    a.B.thighL.rotation.x = .1; a.B.shinL.rotation.x = .5; a.group.updateMatrixWorld(true); PO.settle(a, floor);
  }
  const lying = PO.snap(a);
  PO.apply(a, stand);
  const keys = [[0, stand], [.25, stumble], [.55, knees], [1, lying]];
  const blendSnap = (s0, s1, w) => {
    for (const n in s0) { const b = a.B[n], [p0, q0, k0] = s0[n], [p1, q1, k1] = s1[n]; b.position.lerpVectors(p0, p1, w); b.quaternion.slerpQuaternions(q0, q1, w); b.scale.lerpVectors(k0, k1, w); }
    a.group.updateMatrixWorld(true);
  };
  return {
    keys,
    at(k) {
      k = clamp(k); let i = 1; while (i < keys.length - 1 && k > keys[i][0]) i++;
      const [ka, sa] = keys[i - 1], [kb, sb] = keys[i];
      // gravity: each segment accelerates (ease-in), the last one lands with a small bounce
      const w = clamp((k - ka) / (kb - ka)), wi = i === keys.length - 1 ? Math.min(1, w * w * 1.08) - Math.max(0, w - .92) * .9 : w * w;
      blendSnap(sa, sb, clamp(wi));
    },
  };
}
