// s09: on the terrace, Zoubida, Rahma and Mohammed walk to the stair door; cries tear the air: they stop, turn back and
// hurry to the wall over the neighbour's house (3D). P1: the women on the walls ("Qui est mort ?"); P4: the old slave,
// only her head and shining arms over the wall, palms up. Back to the three at the wall, looking up, for the questions
// and when the head and then the hands disappear.
// Plate terrasse_peau (cal: h 1.3, horizon 378). Stair door at right (foot ~ (1750,760)), back wall foot y ~665.
// Contacts (st.M): feet on the floor (walkPose from rest, lowestOf), nothing held.
import * as K from '../../../engine/core.js';
import { cast } from '../../../engine/stage3d.js';
import * as PO from '../../../engine/poses.js';
import * as IK from '../../../engine/ik.js';
import { rest, walkPose } from '../../../engine/rig3d.js';
import { make, ac, st } from './_pt.js';
import { shot, all, breathe, V } from './_3d.js';
const { clamp, ease, key } = K;
const sm = (a, b, x) => ease((x - a) / (b - a));
const yawTo = (from, to) => Math.atan2(to.x - from.x, to.z - from.z);
const lerpA = (a, b, k) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * k;
/** position on a keyed path [[t, Vector3]...], eased between keys */
const path = (t, ks) => { if (t <= ks[0][0]) return ks[0][1].clone(); for (let i = 1; i < ks.length; i++) if (t <= ks[i][0]) return ks[i - 1][1].clone().lerp(ks[i][1], ease((t - ks[i - 1][0]) / (ks[i][0] - ks[i - 1][0]))); return ks.at(-1)[1].clone(); };

const sh = shot({
  plate: 'terrasse_peau',
  light: { key: 0xfff0d0, keyI: 1.05, dir: [-1.2, 2.5, -2], sky: 0xb8c8e0, ground: 0xd8b080, fillI: 1.65, rim: 0xffe0a0, rimI: .75, rimDir: [-1.2, 2, -2], shadow: .3, area: 3 },
  async build(S3) {
    const F = (x, y) => S3.floorAt(x, y);
    const zou = await cast('zoubida'), rah = await cast('rahma'), mo = await cast('mohammed');
    // walk to the door, stop at the cries (t 4.5), run back to the wall at "remontâmes en courant" (t 11.5 -> 14)
    const P = {
      zou: [[0, F(760, 770)], [4.5, F(1200, 750)], [11.5, F(1200, 750)], [14, F(1020, 690)]],
      rah: [[0, F(600, 790)], [4.5, F(1040, 770)], [11.5, F(1040, 770)], [14.2, F(800, 692)]],
      mo: [[0, F(680, 810)], [4.5, F(1120, 790)], [11.5, F(1120, 790)], [13.6, F(910, 705)]],
    };
    const A = { zou, rah, mo };
    for (const k in A) S3.add(A[k], P[k][0][1].x, P[k][0][1].z, yawTo(P[k][0][1], P[k][1][1]));
    const wallTop = F(880, 665).add(V(0, 2.4, 0)), cry = F(500, 665).add(V(0, 2.6, 0));
    return { actors: [zou, rah, mo], faces: [[zou, null, 2], [rah, null, 5], [mo, null, 8, (lt, t) => ({ sad: sm(80, 84, t) * .4 })]], A, P, wallTop, cry, M: {}, ph: { zou: 0, rah: 0, mo: 0 }, last: -1 };
  },
  frame(lt, u, t, S, st) {
    const { A, P, M } = st;
    const dt = st.last < 0 || t < st.last ? 0 : t - st.last; st.last = t;
    for (const k in A) {
      const a = A[k], p = path(t, P[k]), q = path(t + .1, P[k]), sp = p.distanceTo(q) / .1;
      st.ph[k] += dt * (1.6 + sp * .9);
      rest(a.B); walkPose(a.B, st.ph[k] + (k === 'mo' ? .5 : 0), clamp(sp / 1.2), { stride: k === 'mo' ? .45 : .55, arms: .6 });
      a.group.position.set(p.x, 0, p.z);
      // facing: the way they walk; stopped, toward the cries (the wall at left), at the wall, to the wall top
      const look = t < 14.5 ? st.cry : st.wallTop;
      const yMove = sp > .05 ? yawTo(p, q) : null, yLook = yawTo(p, look);
      a.group.rotation.y = yMove != null ? lerpA(yLook, yMove, clamp(sp / .3)) : yLook;
      a.group.updateMatrixWorld(true);
      const lk = t < 4.5 ? 0 : 1;
      if (lk) PO.look(a, t < 14.5 ? st.cry : st.wallTop.clone().add(V(0, -.6 * sm(81.5, 84, t), 0)), .7);
      breathe(a, t, sp > .5 ? 1.6 : 1, k === 'zou' ? 1 : k === 'rah' ? 2 : 3);
    }
    if (t > 14.5) M.feet = Object.values(A).map(a => +PO.lowestOf(a, Object.keys(a.B)).toFixed(3));
  },
  view(lt, u, t) {
    // wide on the walk, then the three from behind at the wall, a bit closer and lower, looking up with them
    return [key(t, [[0, 960], [14, 1000], [60, 950]]), key(t, [[0, 600], [14, 560], [60, 520]]), key(t, [[0, 1.05], [14, 1.3], [60, 1.4], [90, 1.5]])];
  },
});

window.__s09 = sh;
export default make({
  preload: all(sh), plate: 'ep05/terrasse_peau',
  segs: [ac([0, 0], sh.fn), st('p01_cris', [1, 0], 'push'), st('p01_cris', [2, .3], 'panL'), st('p04_esclave', [3, 0], 'rise'),
    ac([5, 0], sh.fn), st('p04_esclave', [6, 0], 'face'), ac([7, 0], sh.fn)],
});
