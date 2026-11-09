// autostage.js: data-driven 3D shots for ep08. A shot = one plate + a table of marks; every contact pose is solved once
// in build (memoPose), the acting layer (engine/acting.js) runs per frame on top of it.
//   const sh = staged('chambre_jour', {
//     mohammed: { at: [820, 900], face: 'zoubida', pose: 'kneel' },
//     zoubida:  { at: [1150, 880], face: [900, 900], pose: 'stand', costume: 'haik' },
//   }, { addressee: { zoubida: 'mohammed' }, act(lt, t, S, st) { ...extra per-frame action... } });
// marks: at = floor px on the plate; face = another role name | [px, py] floor px | 'cam' | yaw (radians);
// pose = 'stand' | 'kneel' | 'cross' | 'lie' (lie: o.turn, o.top) ; o = extra pose options; seed = acting seed;
// walk = { to: [px, py], t0, t1 } (scene-local seconds, standing only); look = role name | [px, py, h] fixed gaze.
// Rules kept from _3d.js: solves at build only; per-frame motion is additive on contact-free bones (acting.idle/speak/look).
import * as THREE from 'three';
import * as PO from '../../../engine/poses.js';
import * as AC from '../../../engine/acting.js';
import { rest } from '../../../engine/rig3d.js';
import { shot, role, memoPose } from '../scenes/_3d.js';
import { walk } from './acts.js';
import { V, yawTo } from './beatscene.js';
import { fitStairs } from './stairs.js';

const SEATED = new Set(['kneel', 'cross', 'lie', 'step']);
const POSES = {
  kneel: (a, o) => PO.kneel(a, o),
  cross: (a, o) => PO.crossLegged(a, o),
  lie: (a, o) => PO.lie(a, o),
  step: (a, o) => PO.stool(a, { lean: .15, fz: .3, ...o }),   // sitting on a stair tread (o.seat / o.floor set from the tread)
};

export function staged(plate, marks, { addressee = {}, act, light, cover, view, fx, over, under, stairs } = {}) {
  const names = Object.keys(marks);
  return shot({
    plate, light, cover, view, fx, over, under,
    async build(S3) {
      const camP = S3.cam.position.clone().setY(0), A = {}, P = {};
      for (const n of names) A[n] = await role(n, { seat: SEATED.has(marks[n].pose), costume: marks[n].costume });
      const ST = stairs && fitStairs(S3, stairs), Y = {};
      for (const n of names) {   // tread: j stands on tread j / sits on it (pose 'step', feet one tread lower)
        const m = marks[n];
        if (m.tread != null) { P[n] = ST.tread(m.tread, m.off || 0); Y[n] = ST.y(m.pose === 'step' ? m.tread - 1 : m.tread); if (m.pose === 'step') m.o = { seat: ST.y(m.tread), floor: Y[n], ...(m.o || {}) }; }
        else { P[n] = S3.floorAt(...m.at); Y[n] = 0; }
      }
      const down = ST ? Math.atan2(-ST.up.x, -ST.up.z) : 0;
      const aim = (n, f) => f === 'down' ? down : f === 'up' ? down + Math.PI : f === 'cam' || f == null ? yawTo(P[n], camP) : typeof f === 'number' ? f
        : typeof f === 'string' ? yawTo(P[n], P[f]) : yawTo(P[n], S3.floorAt(...f));
      const snaps = {};
      for (const n of names) {
        const m = marks[n], a = A[n];
        S3.add(a, P[n].x, P[n].z, aim(n, m.face)); a.home = P[n];
        if (Y[n]) { a.group.position.y = Y[n]; a.group.updateMatrixWorld(true); }
        if (POSES[m.pose]) memoPose(`${n}:${m.pose}`, a, [P[n].x, P[n].z, m.o || {}], () => POSES[m.pose](a, m.o || {}));
        snaps[n] = POSES[m.pose] ? PO.snap(a) : null;
        if (m.walk) m.walk.p0 = P[n].clone(), m.walk.p1 = S3.floorAt(...m.walk.to);
      }
      const fixed = {};
      for (const n of names) { const l = marks[n].look; if (Array.isArray(l)) fixed[n] = S3.floorAt(l[0], l[1]).setY(l[2] ?? 1.2); }
      const faces = names.map((n, i) => [A[n], n, i * 3 + 1]);
      return { actors: names.map(n => A[n]), A, P, snaps, fixed, faces, S3 };
    },
    frame(lt, u, t, S, st, S3) {
      const { A, snaps } = st;
      st.G ||= AC.gazeNet(S.lines, A, { addressee });
      for (const [i, n] of names.entries()) {
        const a = A[n], m = marks[n], seed = m.seed ?? i * 2 + 1;
        if (snaps[n]) PO.apply(a, snaps[n]);
        else if (m.walk && t >= m.walk.t0) { rest(a.B); walk(a, m.walk.p0, m.walk.p1, m.walk.t0, m.walk.t1, t); }
        else rest(a.B);
        AC.idle(a, t, seed, { seated: !!snaps[n] });
        AC.speak(a, t, S.lines, n);
      }
      act?.(lt, t, S, st, S3);
      st.G.apply(t);
      for (const n of names) {   // fixed gazes win over the net (a prop, a window, another role)
        const l = marks[n].look;
        if (Array.isArray(l)) PO.look(A[n], st.fixed[n], .85);
        else if (typeof l === 'string' && A[l]) PO.look(A[n], A[l].B.head.getWorldPosition(V(0, 0, 0)), .85);
        else if (typeof l === 'function') {   // (t, st, S3) → null (keep the net) | role name | [px, py, h] | Vector3
          const g = l(t, st, S3);
          if (typeof g === 'string' && A[g]) PO.look(A[n], A[g].B.head.getWorldPosition(V(0, 0, 0)), .85);
          else if (Array.isArray(g)) PO.look(A[n], S3.floorAt(g[0], g[1]).setY(g[2] ?? 1.2), .85);
          else if (g?.isVector3) PO.look(A[n], g, .85);
        }
      }
      for (const a of Object.values(A)) a.group.updateMatrixWorld(true);
      if (globalThis.DBG8 ?? true) for (const n of names) { const a = A[n], h = a.B.head.getWorldPosition(V(0, 0, 0)); console.error('DBG', plate, n, marks[n].pose || 'stand', 't=' + t.toFixed(2), 'walk=' + (marks[n].walk ? marks[n].walk.t0.toFixed(2) : '-'), 'pos=' + a.group.position.x.toFixed(2) + ',' + a.group.position.z.toFixed(2), 'headY=' + h.y.toFixed(2), 'scale=' + a.group.scale.y.toFixed(2)); }
    },
  });
}
export const isSeated = p => SEATED.has(p);
export { THREE };
