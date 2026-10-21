// s04: Mohammed runs home with the news; Fatma Bziouya, standing in her doorway, stops him: his mother is out, Lalla
// Aïcha came for her. Joy turns to worry: he turns away from her toward us, head down, while the narrator lists his
// fears (Moulay Larbi, the pacha, the prévôt).
// Plate patio_vide = Fatma's doorway (curtain) on the ground-floor patio, calibrated for s06. Both actors stand on the
// floor (group y 0, feet checked with lowestOf in M); the run decelerates to a stop (stride amplitude -> 0).
import * as K from '../../../engine/core.js';
import { cast } from '../../../engine/stage3d.js';
import * as PO from '../../../engine/poses.js';
import * as IK from '../../../engine/ik.js';
import { rest, walkPose } from '../../../engine/rig3d.js';
import { make, ac } from './_pt.js';
import { shot, all, breathe, V } from './_3d.js';
const { clamp, ease, key } = K;
const sm = (a, b, x) => ease((x - a) / (b - a));
const yawTo = (from, to) => Math.atan2(to.x - from.x, to.z - from.z);
const dirW = (a, x, y, z) => V(x, y, z).normalize().applyAxisAngle(V(0, 1, 0), a.group.rotation.y);

const sh = shot({
  plate: 'patio_vide',
  light: { key: 0xffe4b8, keyI: 1.5, dir: [-1.5, 3, 1.5], sky: 0xd6c6b0, ground: 0xd09858, fillI: 1.6, rim: 0xffd090, rimI: .5, rimDir: [-2, 1.5, -2], shadow: .32, area: 4 },
  async build(S3, cal) {
    const fat = await cast('fatma'), mo = await cast('mohammed', { copy: 1 });
    const door = S3.floorAt(1120, 712), stop = S3.floorAt(820, 830), from = stop.clone().add(V(-2.4, 0, .5));
    S3.add(fat, door.x, door.z, yawTo(door, stop) * .6);
    S3.add(mo, from.x, from.z, yawTo(from, stop));
    const M = { door: door.toArray().map(v => +v.toFixed(2)), stop: stop.toArray().map(v => +v.toFixed(2)) };
    return { actors: [fat, mo], faces: [[fat, 'fatma', 3], [mo, null, 6, (lt, t) => ({ sad: clamp((t - 9) / 3) * .7 })]], M, fat, mo, door, stop, from, camPos: S3.cam.position.clone() };
  },
  frame(lt, u, t, S, st) {
    const { fat, mo, M } = st, [a0, b0] = S.L(0), [a1] = S.L(1);
    // Mohammed: runs in (2.2 m/s), slows over the last 0.6 m, stops facing Fatma; at the narrator's "inquiétude" he turns
    // three quarters toward the camera and lowers his head
    const len = st.from.distanceTo(st.stop), s = t * 2.2, x = clamp((s - len + .6) / 1.2);   // constant speed, then a braking parabola (same speed at the join)
    const d = s < len - .6 ? s : len - .6 + .6 * (1 - (1 - x) ** 2), k = 1 - x;
    const p = st.from.clone().lerp(st.stop, d / len), turn = sm(a1 + .5, a1 + 2, t);
    rest(mo.B); walkPose(mo.B, t * 1.9, Math.max(k, .02) * (1 - turn), { stride: .6, lift: 1, arms: .85 });
    mo.group.position.set(p.x, 0, p.z); mo.group.rotation.y = K.lerp(yawTo(st.from, st.stop), yawTo(st.stop, st.camPos) + .5, turn);
    mo.group.updateMatrixWorld(true);
    mo.B.spine.rotation.x += .15 * k;
    // out of breath, then the head sinks
    PO.look(mo, IK.wpos(fat.B.head), .7 * (1 - turn)); mo.B.head.rotation.x += .32 * turn; mo.B.neck.rotation.x += .12 * turn;
    mo.B.chest.rotation.x -= Math.sin(t * 5) * .03 * clamp(2 - t / 3);
    breathe(mo, t, 1, 2);
    // Fatma: standing in her doorway, arms down; on "Lalla Aïcha est venue la chercher" the right hand gestures out to
    // the street, then folds back; she watches the boy (sad) through the narration
    rest(fat.B); walkPose(fat.B, 0, 0); fat.group.updateMatrixWorld(true);
    const g = clamp(sm(a0 + 2.2, a0 + 3, t) - sm(b0 - .8, b0, t));
    if (g > 0) { const hp = IK.wpos(fat.B.chest).addScaledVector(dirW(fat, -1, 0, .5), .45).add(V(0, -.05, 0)); M.reachF = +PO.reach(fat, 'R', IK.wpos(fat.B.handR).lerp(hp, g), { grip: .05 }).toFixed(3); }
    PO.look(fat, IK.wpos(mo.B.head), .6);
    breathe(fat, t, 1, .7);
    M.feet = [+PO.lowestOf(fat, Object.keys(fat.B)).toFixed(3), +PO.lowestOf(mo, Object.keys(mo.B)).toFixed(3)];
  },
  // two-shot, then closer on the boy while he worries
  view: (lt, u, t) => [key(t, [[0, 960], [8, 960], [11, 860]]), key(t, [[0, 560], [8, 540], [11, 590]]), key(t, [[0, 1.08], [8, 1.15], [11, 1.45], [28, 1.6]])],
});

window.__s04 = sh;
export default make({ preload: all(sh), plate: 'ep05/patio_vide', segs: [ac([0, 0], sh.fn)] });
