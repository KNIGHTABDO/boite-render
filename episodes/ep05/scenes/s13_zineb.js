// s13: in a corner of the barber's patio, children whimper; among them Zineb, rubbing her eyes like the grown-ups but
// dry-eyed. Mohammed, standing over her, watches a moment, then punches her on the nose; torrents of tears, she screams
// ("Aïïïe ! Mmmaaa !") and he runs off (to the terrace stairs, out at the right).
// Plate maison_coiffeur (cal: h 1.46, horizon 228); the children sit on the foreground-left mat.
// Contacts (st.M): hips on the mat (crossLegged), her hands at her eyes / nose, his fist on her nose at the punch, feet
// on the floor while he runs.
import * as K from '../../../engine/core.js';
import { cast } from '../../../engine/stage3d.js';
import * as PO from '../../../engine/poses.js';
import * as IK from '../../../engine/ik.js';
import { rest, walkPose } from '../../../engine/rig3d.js';
import { make, ac } from './_pt.js';
import { shot, all, breathe, V, memoPose, skirt } from './_3d.js';
import { travel, fallClip } from '../../../engine/clips.js';
const Q = location.search;   // E3 pilot: ?clips = run-off with clips.travel, ?fall = he trips instead
const { clamp, ease, key } = K;
const sm = (a, b, x) => ease((x - a) / (b - a));
const dirW = (a, x, y, z) => V(x, y, z).normalize().applyAxisAngle(V(0, 1, 0), a.group.rotation.y);
const yawTo = (from, to) => Math.atan2(to.x - from.x, to.z - from.z);
const path = (t, ks) => { if (t <= ks[0][0]) return ks[0][1].clone(); for (let i = 1; i < ks.length; i++) if (t <= ks[i][0]) return ks[i - 1][1].clone().lerp(ks[i][1], ease((t - ks[i - 1][0]) / (ks[i][0] - ks[i - 1][0]))); return ks.at(-1)[1].clone(); };
const TC = 29.4;   // the punch (end of "un coup de poing sur le nez")

const sh = shot({
  plate: 'maison_coiffeur',
  light: { key: 0xf0f0ff, keyI: 1.1, dir: [1.5, 2.5, 1.5], sky: 0xc8ccd8, ground: 0xa89880, fillI: 1.6, rim: 0xe8e8f0, rimI: .4, rimDir: [-2, 1.5, -2], shadow: .28, area: 4 },
  async build(S3) {
    const M = {};
    const F = (x, y) => S3.floorAt(x, y), cam0 = S3.cam.position.clone().setY(0);
    const zAt = F(600, 820), k1At = F(380, 790), k2At = F(450, 870), mAt = zAt.clone().add(F(820, 830).sub(zAt).setLength(.42));
    const zin = await cast('zineb', { seat: true }), k1 = await cast('mohammed_gris', { seat: true }), k2 = await cast('mohammed_gris', { seat: true, copy: 1 }), mo = await cast('mohammed');
    S3.add(zin, zAt.x, zAt.z, yawTo(zAt, cam0) + .5); S3.add(k1, k1At.x, k1At.z, yawTo(k1At, cam0) + .3); S3.add(k2, k2At.x, k2At.z, yawTo(k2At, cam0) - .2);
    S3.add(mo, mAt.x, mAt.z, yawTo(mAt, zAt));
    M.zin = memoPose('s13z', zin, [zAt], () => PO.crossLegged(zin, { seat: .015, lean: .12 }).map(e => +e.toFixed(3)));
    M.k1 = memoPose('s13k1', k1, [k1At], () => PO.crossLegged(k1, { seat: .015, lean: .15 }).map(e => +e.toFixed(3)));
    M.k2 = memoPose('s13k2', k2, [k2At], () => PO.crossLegged(k2, { seat: .015, lean: .15 }).map(e => +e.toFixed(3)));
    for (const a of [zin, k1, k2]) skirt(S3, a, .015);
    const exit = F(1500, 700);
    return { actors: [zin, k1, k2, mo], faces: [[zin, 'zineb', 2, (lt, t) => ({ sad: .3 + .7 * sm(TC, TC + .4, t) })], [k1, null, 5, { sad: .7 }], [k2, null, 8, { sad: .6 }], [mo, null, 4]],
      M, zin, k1, k2, mo, mAt, exit, fall: Q.includes('fall') ? fallClip(mo) : null, base: [zin, k1, k2].map(a => PO.snap(a)), zp: S3.project(IK.wpos(zin.B.head)), mp: S3.project(IK.wpos(mo.B.head)) };
  },
  cover: [{ t: 0, size: 'W' }, { t: 7, size: 'M', on: 'zineb' }, { t: 20, size: 'W' }, { t: TC - .3, size: 'CU', on: 'zineb', dx: 60 }, { t: TC + 3, size: 'W' }],
  frame(lt, u, t, S, st) {
    const { zin, k1, k2, mo, M } = st;
    [zin, k1, k2].forEach((a, i) => PO.apply(a, st.base[i]));
    const eyes = (a, k, w, nose) => {   // both hands to the eyes (rubbing) or to the nose
      const h = IK.wpos(a.B.head), f = dirW(a, 0, 0, 1), s = dirW(a, 1, 0, 0);
      for (const [side, sg] of [['L', 1], ['R', -1]]) {
        const p = h.clone().addScaledVector(f, .09).addScaledVector(s, (nose ? .015 : .035) * sg).add(V(0, nose ? -.03 : .005, 0)).addScaledVector(s, Math.sin(t * 7 + sg) * .012 * w);
        M[k + side] = +PO.reach(a, side, IK.wpos(a.B['hand' + side]).lerp(p, w), { grip: .02 }).toFixed(3);
      }
    };
    // the two other children whimper, hands to their eyes now and then
    eyes(k1, 'k1', clamp(Math.sin(t * .5) * 2), false); eyes(k2, 'k2', clamp(Math.sin(t * .4 + 2) * 2), false);
    breathe(k1, t, 1.3, 5); breathe(k2, t, 1.3, 6);
    // Zineb: rubs her eyes (line 1), drops her hands to look at him, the punch snaps her head back, hands on the nose, sobs
    const [a1, b1] = S.L(1), rub = clamp(sm(a1, a1 + .8, t) - sm(TC - 4, TC - 3, t)), hit = t > TC ? Math.exp(-(t - TC) * 4) : 0, cry = sm(TC + .2, TC + .8, t);
    if (rub > 0) eyes(zin, 'zr', rub, false);
    if (cry > 0) eyes(zin, 'zn', cry, true);
    zin.B.head.rotation.x -= .35 * hit; zin.B.spine.rotation.x -= .12 * hit;
    zin.B.chest.rotation.x += Math.sin(t * 8) * .03 * cry; zin.group.updateMatrixWorld(true);
    PO.look(zin, IK.wpos(mo.B.head), .5 * (1 - rub) * (1 - hit));
    breathe(zin, t, 1 + cry, 2);
    // Mohammed: stands watching her; wind-up and the fist to her nose; then runs off to the right
    const run = Math.max(0, t - (TC + 1.8)), toExit = st.exit.clone().sub(st.mAt), len = toExit.length(), d = Math.min(len, run * run * 1.2 + run * 1.5);
    const p = st.mAt.clone().addScaledVector(toExit.normalize(), d);
    rest(mo.B); walkPose(mo.B, t * 2.4, clamp(run * 2) * (d < len ? 1 : 0), { stride: .55, arms: .9 });
    mo.group.position.set(p.x, 0, p.z); mo.group.rotation.y = run > 0 ? yawTo(st.mAt, st.exit) : yawTo(st.mAt, zin.group.position);
    mo.group.visible = d < len - .05;
    mo.group.updateMatrixWorld(true);
    if (Q.includes('clips') && t > TC + 1.8) travel(mo, [[st.mAt.x, st.mAt.z], [st.exit.x, st.exit.z]], t, { t0: TC + 1.8, speed: 3.2, gait: 'run', exit: true });
    if (st.fall && t > TC + 1.8) { mo.group.visible = true; mo.group.position.set(st.mAt.x, 0, st.mAt.z); mo.group.rotation.y = yawTo(st.mAt, st.exit); st.fall.at((t - TC - 1.8) / .9); }
    if (t > TC - .9 && t < TC + 1.2) {
      const nose = IK.wpos(zin.B.head).addScaledVector(dirW(zin, 0, 0, 1), .1).add(V(0, -.02, 0)), sR = IK.wpos(mo.B.upperArmR);
      const back = sR.clone().addScaledVector(dirW(mo, 0, 0, -1), .12).add(V(0, -.05, 0)), down = IK.wpos(mo.B.handR);
      mo.B.spine.rotation.x += .6 * Math.sin(Math.PI * clamp((t - TC + .9) / 2.1)); mo.group.updateMatrixWorld(true);
      const tg = path(t, [[TC - .9, down], [TC - .25, back], [TC, nose], [TC + .15, nose], [TC + 1.2, down]]);
      M.punch = +PO.reach(mo, 'R', tg, { grip: .0 }).toFixed(3);
      if (Math.abs(t - TC) < .02) M.fistNose = +PO.handPts(mo, 'R').palm.distanceTo(nose).toFixed(3);
    }
    if (run <= 0 && !(st.fall && t > TC + 1.8)) PO.look(mo, IK.wpos(zin.B.head), .7);
    breathe(mo, t, 1, 3);
    M.moFeet = +PO.lowestOf(mo, Object.keys(mo.B)).toFixed(3);
  },
  view(lt, u, t) {
    if (location.search.includes('cover')) return null;   // E2 pilot: auto coverage instead of the hand-keyed push
    const [zx, zy] = sh.st.zp, [mx, my] = sh.st.mp, cx = (zx + mx) / 2;
    // the children's corner, push to Zineb's dry eyes, the two for the punch, wider as he runs off
    return [key(t, [[0, 640], [7, zx + 60], [20, zx + 60], [24, cx], [TC + 2, cx], [TC + 4, 900]]), key(t, [[0, 700], [7, zy + 60], [20, zy + 60], [24, (zy + my) / 2 + 80], [TC + 2, (zy + my) / 2 + 80], [TC + 4, 620]]),
      key(t, [[0, 1.3], [7, 1.9], [20, 2], [24, 1.6], [TC + 2, 1.65], [TC + 4, 1.15]])];
  },
});

window.__s13 = sh;
export default make({ preload: all(sh), plate: 'ep05/maison_coiffeur', segs: [ac([0, 0], sh.fn)] });
