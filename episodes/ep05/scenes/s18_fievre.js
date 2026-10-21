// s18: night, the fever. Mohammed lies on the back mattress; his father, home late, kneels and touches his forehead
// (line 0); "Je vais peut-être mourir, moi aussi..."; P10: his own imagined procession (line 2); "Non ! Je ne veux pas
// mourir !" (the head tosses); the father soothes him (hand on his forehead again), Zoubida at his feet, hands to her chest;
// he calms down, eyes closing.
// Plate chambre_penombre (cal: h 1.0, horizon 447; back mattress front foot y 700, top y 650, ~.8 m deep), lamp light.
// Contacts (st.M): body on the mattress top (lie: low/heels), pillow under the skull, the father's knees on the mattress
// (kneel) and his palm on the forehead.
import * as THREE from 'three';
import * as K from '../../../engine/core.js';
import { cast } from '../../../engine/stage3d.js';
import * as PR from '../../../engine/props3d.js';
import * as PO from '../../../engine/poses.js';
import * as IK from '../../../engine/ik.js';
import { make, ac, st } from './_pt.js';
import { shot, all, breathe, V, memoPose } from './_3d.js';
const { clamp, ease, key } = K;
const sm = (a, b, x) => ease((x - a) / (b - a));
const dirW = (a, x, y, z) => V(x, y, z).normalize().applyAxisAngle(V(0, 1, 0), a.group.rotation.y);
const yawTo = (from, to) => Math.atan2(to.x - from.x, to.z - from.z);
const LIGHT = { keyI: 1.1, fillI: .6, sky: 0x7a6a8a, ground: 0x4a3020, key: 0xffc080, dir: [1.5, 2, 1.5], rim: 0xffb060, rimI: .4, rimDir: [-3, 1, -1], shadow: .3, area: 4 };

const sh = shot({
  plate: 'chambre_penombre', light: LIGHT,
  async build(S3, cal) {
    const M = {}, hz = cal.horizon, foot = S3.floorAt(980, 700), mH = cal.h * (1 - (650 - hz) / (700 - hz));
    const mL = S3.floorAt(760, 700), mR = S3.floorAt(1200, 700), mD = .8;
    const mb = new THREE.Mesh(new THREE.BoxGeometry(mR.x - mL.x, mH, mD), new THREE.ShadowMaterial({ color: 0x1a0c23, opacity: .28 }));
    mb.castShadow = mb.receiveShadow = true; mb.position.set((mL.x + mR.x) / 2, mH / 2, foot.z - mD / 2); S3.scene.add(mb);
    const mo = await cast('mohammed', { seat: true, copy: 2 }), fa = await cast('father', { seat: true }), zou = await cast('zoubida', { seat: true });
    // lying along the mattress, head to the left (yaw pi/2: the actor's -z is world -x), rolled a little toward the camera
    const mAt = V(foot.x, 0, foot.z - .38);
    S3.add(mo, mAt.x, mAt.z, Math.PI / 2);
    const L = memoPose('s18mo', mo, [mAt, mH], () => { const r = PO.lie(mo, { top: mH, turn: -.35, pillow: .07 }); return { low: +(r.low - mH).toFixed(3), heel: r.heel, head: +(r.headLow - mH).toFixed(3), pil: r.pillowAt.toArray() }; });
    M.lie = L; const pil = S3.prop(PR.cushion({ w: .4, d: .3, h: .07, col: 0xd8c8a0 }), L.pil[0], mH, L.pil[2]);
    const moBase = PO.snap(mo), head = IK.wpos(mo.B.head);
    // the father kneels on the mattress beyond the head, Zoubida on it beyond the feet (the boy stays clear between them)
    const fAt = V(head.x - .38, 0, foot.z - .6), zAt = V(mAt.x + .85, 0, foot.z - .45), cam = S3.cam.position.clone().setY(0);
    S3.add(fa, fAt.x, fAt.z, yawTo(fAt, head) * .65 + yawTo(fAt, cam) * .35);
    S3.add(zou, zAt.x, zAt.z, yawTo(zAt, mAt) * .6 + yawTo(zAt, cam) * .4);
    M.fa = memoPose('s18fa', fa, [fAt, mH], () => PO.kneel(fa, { seat: mH, lean: .25 }) ?? 0);
    M.zou = memoPose('s18zou', zou, [zAt, mH], () => PO.kneel(zou, { seat: mH, lean: .2 }) ?? 0);
    return { actors: [mo, fa, zou], faces: [[mo, 'mohammed', 5, (lt, t) => ({ sad: .6 })], [fa, 'father', 3, { sad: .3 }], [zou, 'zoubida', 2, { sad: .5 }]],
      M, mo, fa, zou, moBase, faBase: PO.snap(fa), zBase: PO.snap(zou), mH, hp: S3.project(head), fp: S3.project(IK.wpos(fa.B.head)) };
  },
  frame(lt, u, t, S, st) {
    const { mo, fa, zou, M } = st, [a0] = S.L(0), [a3, b3] = S.L(3), [a4] = S.L(4), [a5] = S.L(5), [a6] = S.L(6);
    PO.apply(mo, st.moBase); PO.apply(fa, st.faBase); PO.apply(zou, st.zBase);
    // he tosses his head at "Non ! Je ne veux pas mourir !", calms down after
    const toss = clamp(sm(a3, a3 + .3, t) - sm(b3, b3 + 1, t));
    mo.B.head.rotation.y += Math.sin(t * 9) * .35 * toss; mo.group.updateMatrixWorld(true);
    breathe(mo, t, 1.5 + toss - sm(a6, a6 + 6, t), 0);
    // the father: palm on the forehead (line 0, and again to soothe from line 4)
    const touch = clamp(sm(a0 + 3, a0 + 4, t) - sm(a0 + 9, a0 + 10, t)) + clamp(sm(a4 - .5, a4 + .3, t) - sm(a6 + 4, a6 + 6, t));
    const brow = IK.wpos(mo.B.head).add(V(0, .085, 0)).add(V(-.04, 0, .02));
    if (touch > 0) { fa.B.spine.rotation.x += .45 * Math.min(1, touch); fa.group.updateMatrixWorld(true); M.brow = +PO.reach(fa, 'R', IK.wpos(fa.B.handR).lerp(brow, Math.min(1, touch)), { grip: .03 }).toFixed(3); }
    PO.look(fa, IK.wpos(mo.B.head), .7); breathe(fa, t, 1, 1);
    // Zoubida: both hands pressed to her chest at "Mon petit enfant"
    const z = clamp(sm(a5 - .3, a5 + .5, t));
    if (z > 0) { const c = IK.wpos(zou.B.chest).addScaledVector(dirW(zou, 0, 0, 1), .14).add(V(0, .06, 0)), sd = dirW(zou, 1, 0, 0);
      for (const [side, k] of [['L', 1], ['R', -1]]) PO.reach(zou, side, IK.wpos(zou.B['hand' + side]).lerp(c.clone().addScaledVector(sd, .03 * k), z), { grip: .04 }); }
    zou.B.head.rotation.x -= .35; zou.B.neck.rotation.x -= .15; zou.group.updateMatrixWorld(true); PO.look(zou, IK.wpos(mo.B.head), .2); breathe(zou, t, 1, 2);
  },
  view(lt, u, t) {
    const [hx, hy] = sh.st.hp, [fx, fy] = sh.st.fp, cx = (hx + fx) / 2 + 60;
    return [key(t, [[0, 960], [8, cx], [60, cx], [76, cx]]), key(t, [[0, 560], [8, (hy + fy) / 2 + 40]]), key(t, [[0, 1.15], [8, 1.7], [44, 1.8], [50, 2.1], [60, 1.75], [76, 1.6]])];
  },
});

window.__s18 = sh;
export default make({ preload: all(sh), plate: 'ep05/chambre_penombre', segs: [ac([0, 0], sh.fn), st('p10_cortege', [2, 0], 'pull'), ac([3, 0], sh.fn)] });
