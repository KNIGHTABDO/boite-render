// s05: the key left in the door; Mohammed comes into the dim room alone and the objects no longer know him (shot 1: he
// walks in from the door ajar and stops, looking round). They turn into monsters (P2a/b, hallucination paintings).
// Shot 2: sitting cross-legged on the back mattress, throat dry, he doesn't dare move (only breathing, eyes darting);
// centuries pass; his mother's dragging steps and her cough come up from below (sound), the room is a room again and a
// sunbeam brings the old mosaics back to life (grade warms, a beam brightens).
// Plate chambre_penombre (cal.json: h 1.0, horizon 447). Back mattress: foot of its front face y 700, top 650 -> .20 m.
import * as THREE from 'three';
import * as K from '../../../engine/core.js';
import { cast } from '../../../engine/stage3d.js';
import * as PO from '../../../engine/poses.js';
import * as IK from '../../../engine/ik.js';
import { rest, walkPose } from '../../../engine/rig3d.js';
import { make, ac, st } from './_pt.js';
import { shot, all, breathe, V, skirt } from './_3d.js';
const { clamp, ease, key, glow, W, H } = K;
const sm = (a, b, x) => ease((x - a) / (b - a));
const yawTo = (from, to) => Math.atan2(to.x - from.x, to.z - from.z);
const LIGHT = { keyI: 1.2, fillI: .65, sky: 0x8a7a9a, ground: 0x4a3020, key: 0xffc890, rim: 0xffb060, rimI: .4, rimDir: [-3, 1, -1], shadow: .28, area: 4 };

// shot 1: in through the door, a few steps, stop, look round
const enter = shot({
  plate: 'chambre_penombre', light: LIGHT,
  async build(S3) {
    const mo = await cast('mohammed', { copy: 2 });
    const from = S3.floorAt(150, 925), to = S3.floorAt(820, 790);
    S3.add(mo, from.x, from.z, yawTo(from, to));
    return { actors: [mo], faces: [[mo, null, 4]], mo, from, to, camPos: S3.cam.position.clone(), M: { walk: +from.distanceTo(to).toFixed(2) } };
  },
  frame(lt, u, t, S, st) {
    const { mo } = st, len = st.from.distanceTo(st.to), s = Math.max(0, t - 2.2) * .8, d = Math.min(len, s), k = clamp((len - s) / .3 + .02);
    const p = st.from.clone().lerp(st.to, d / len);
    rest(mo.B); walkPose(mo.B, s / .8 * .9, Math.min(1, k), { stride: .32, arms: .35 });
    mo.group.position.set(p.x, 0, p.z); mo.group.updateMatrixWorld(true);
    // stopped: slow look left (the niche, the teapot), right (the chest, the window), at the camera (us: the room)
    const lk = Math.max(0, t - (2.2 + len / .8));
    const tg = V(key(lk, [[0, 0], [1.2, -2.5], [3, -2.5], [4.2, 2.5], [6, 2.5], [7, 0]]), 1.1, -1 + key(lk, [[0, -3], [7, 1]]));
    PO.look(mo, mo.group.position.clone().add(tg), .65 * clamp(lk));
    breathe(mo, t, 1, 1);
  },
  view: (lt, u, t) => [key(t, [[0, 700], [10, 900]]), key(t, [[0, 600], [10, 640]]), key(t, [[0, 1.12], [10, 1.35]])],
});

// shot 2: seated cross-legged on the back mattress, frozen
const sit = shot({
  plate: 'chambre_penombre', light: LIGHT,
  async build(S3, cal) {
    const hz = cal.horizon, foot = S3.floorAt(980, 700), mH = cal.h * (1 - (650 - hz) / (700 - hz));
    // invisible shadow catcher shaped like the painted mattress (his shadow goes on its top and front)
    const mL = S3.floorAt(760, 700), mR = S3.floorAt(1200, 700), mD = .8;
    const mb = new THREE.Mesh(new THREE.BoxGeometry(mR.x - mL.x, mH, mD), new THREE.ShadowMaterial({ color: 0x1a0c23, opacity: .28 }));
    mb.castShadow = mb.receiveShadow = true; mb.position.set((mL.x + mR.x) / 2, mH / 2, foot.z - mD / 2); S3.scene.add(mb);
    const mo = await cast('mohammed', { seat: true }), at = V(foot.x, 0, foot.z - .32);
    S3.add(mo, at.x, at.z, yawTo(at, S3.cam.position.clone().setY(0)) * .7);
    const M = { mattress: +mH.toFixed(3), legs: PO.crossLegged(mo, { seat: mH, lean: .04 }).map(e => +e.toFixed(3)) };
    M.seat = +(PO.lowestOf(mo, ['root', 'thighL', 'thighR']) - mH).toFixed(3);
    skirt(S3, mo, mH); const base = PO.snap(mo), hp = S3.project(IK.wpos(mo.B.head));
    return { actors: [mo], faces: [[mo, null, 9, (lt, t) => ({ sad: .5 })]], mo, base, hp, M, camPos: S3.cam.position.clone() };
  },
  frame(lt, u, t, S, st) {
    const { mo } = st, [a3, b3] = S.L(3);
    PO.apply(mo, st.base);
    // frozen: the eyes dart, the head barely moves; at the steps from below the head turns to the door, the body relaxes
    const steps = sm(a3 + 1, a3 + 3, t);
    PO.look(mo, IK.wpos(mo.B.head).add(V(-3 * steps + Math.sin(t * .7) * .25 * (1 - steps), -.2, 1)), .5);
    mo.B.spine.rotation.x -= .06 * (1 - steps);   // stiff, upright
    breathe(mo, t, 1.6 - steps, 0);   // shallow fast breathing, calming down
    mo.B.chest.rotation.x += Math.sin(t * 3.4) * .012 * (1 - steps); mo.B.chest.updateWorldMatrix(false, true);
  },
  over(lt, u, t, S) {   // "un rayon de soleil ranima les vieilles mosaïques": the window beam brightens on the floor
    const [a3, b3] = S.L(3), sun = sm(b3 - 5, b3 - 2, t);
    if (sun > 0) { glow(1050, 830, 520, '#ffb860', .35 * sun, 'screen'); glow(1480, 360, 260, '#ffd8a0', .3 * sun, 'screen'); }
  },
  grade: (lt, u, t) => null,
  view(lt, u, t) {
    const [hx, hy] = sit.st.hp;
    return [key(t, [[22, 980], [30, hx], [44, hx], [47, 980]]), key(t, [[22, 600], [30, hy + 60], [44, hy + 60], [47, 600]]), key(t, [[22, 1.2], [30, 1.6], [42, 1.65], [47, 1.25]])];
  },
});

window.__s05 = sit; window.__s05e = enter;
export default make({
  preload: all(enter, sit), plate: 'ep05/chambre_penombre',
  segs: [ac([0, 0], enter.fn), st('p02a_monstres', [1, 0], 'push'), st('p02b_monstres', [1, .5], 'pullR'), ac([2, 0], sit.fn)],
});
