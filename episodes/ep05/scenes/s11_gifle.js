// s11: the terrace. Zoubida will climb over the wall to go and cry a little; Mohammed begs to come and cry too, tugging
// her robe; she says no, he insists, she slaps him ("Tiens ! Attrape, et pleure pour de bon !") and he sobs. Rahma, on
// her sheepskin, watches (and then takes his side: P6, the two women passing him over the wall).
// Contacts (st.M): Rahma's hips on the sheepskin (crossLegged), Mohammed's hand on Zoubida's robe (reach error), the
// slap: her palm on his cheek at the contact time (reach error + palm->cheek distance), his hands on his eyes (sobbing).
import * as K from '../../../engine/core.js';
import { cast } from '../../../engine/stage3d.js';
import * as PO from '../../../engine/poses.js';
import * as IK from '../../../engine/ik.js';
import { rest, walkPose } from '../../../engine/rig3d.js';
import { make, ac, st } from './_pt.js';
import { shot, all, breathe, V, memoPose, skirt } from './_3d.js';
const { clamp, ease, key } = K;
const sm = (a, b, x) => ease((x - a) / (b - a));
const dirW = (a, x, y, z) => V(x, y, z).normalize().applyAxisAngle(V(0, 1, 0), a.group.rotation.y);
const yawTo = (from, to) => Math.atan2(to.x - from.x, to.z - from.z);
const path = (t, ks) => { if (t <= ks[0][0]) return ks[0][1].clone(); for (let i = 1; i < ks.length; i++) if (t <= ks[i][0]) return ks[i - 1][1].clone().lerp(ks[i][1], ease((t - ks[i - 1][0]) / (ks[i][0] - ks[i - 1][0]))); return ks.at(-1)[1].clone(); };
const TC = 28.4;   // the slap (on "Attrape")

const sh = shot({
  plate: 'terrasse_peau',
  light: { key: 0xfff0d0, keyI: 1.05, dir: [-1.2, 2.5, -2], sky: 0xb8c8e0, ground: 0xd8b080, fillI: 1.65, rim: 0xffe0a0, rimI: .75, rimDir: [-1.2, 2, -2], shadow: .3, area: 3 },
  async build(S3) {
    const M = {};
    const zAt = S3.floorAt(1060, 730), rAt = S3.floorAt(380, 800), mAt = zAt.clone().add(S3.floorAt(860, 745).sub(zAt).setLength(.5));
    const zou = await cast('zoubida'), mo = await cast('mohammed'), rah = await cast('rahma', { seat: true });
    // face each other, opened a little to the camera
    S3.add(zou, zAt.x, zAt.z, yawTo(zAt, mAt) + .35); S3.add(mo, mAt.x, mAt.z, yawTo(mAt, zAt) - .35);
    S3.add(rah, rAt.x, rAt.z, yawTo(rAt, zAt));
    M.rah = memoPose('s11r', rah, [rAt], () => PO.crossLegged(rah, { seat: .03, lean: .08 }).map(e => +e.toFixed(3)));
    skirt(S3, rah, .03, 0x7a2420);
    const rBase = PO.snap(rah);
    return { actors: [zou, mo, rah], faces: [[zou, 'zoubida', 2, (lt, t) => ({ sad: .25 })], [mo, 'mohammed', 4, (lt, t) => ({ sad: Math.max(.3, sm(TC, TC + .6, t)) })], [rah, null, 7]],
      M, zou, mo, rah, rBase, zp: S3.project(IK.wpos(zou.B.head)), mp: S3.project(IK.wpos(mo.B.head)) };
  },
  frame(lt, u, t, S, st) {
    const { zou, mo, rah, M } = st;
    const speaking = ids => ids.reduce((m, i) => { const [a, b] = S.L(i); return Math.max(m, clamp(sm(a - .3, a + .3, t) - sm(b - .2, b + .4, t))); }, 0);
    for (const a of [zou, mo]) { rest(a.B); walkPose(a.B, 0, 0); a.group.updateMatrixWorld(true); }
    PO.apply(rah, st.rBase);
    const hit = t > TC ? Math.exp(-(t - TC) * 3) : 0, sob = sm(TC + .8, TC + 2, t);
    // Mohammed: tugs her robe while he begs (lines 1, 3); after the slap the head snaps away, then hands to the eyes, sobbing
    const beg = speaking([1, 3]);
    if (beg > .01) { const robe = IK.wpos(zou.B.root).add(V(0, .05, 0)).addScaledVector(dirW(zou, 0, 0, 1), .14); M.tug = +PO.reach(mo, 'R', IK.wpos(mo.B.handR).lerp(robe, beg), { grip: .04 }).toFixed(3); }
    if (sob > 0) {
      const h = IK.wpos(mo.B.head), f = dirW(mo, 0, 0, 1), s = dirW(mo, 1, 0, 0);
      for (const [side, k] of [['L', 1], ['R', -1]]) M['eye' + side] = +PO.reach(mo, side, IK.wpos(mo.B['hand' + side]).lerp(h.clone().addScaledVector(f, .1).addScaledVector(s, .035 * k).add(V(0, -.01, 0)), sob), { grip: .02 }).toFixed(3);
      mo.B.chest.rotation.x += Math.sin(t * 9) * .03 * sob; mo.B.spine.rotation.x += .12 * sob;
    }
    mo.B.head.rotation.y -= .55 * hit; mo.B.head.rotation.z += .2 * hit; mo.B.spine.rotation.z += .08 * hit;
    mo.group.updateMatrixWorld(true);
    PO.look(mo, IK.wpos(zou.B.head), .7 * (1 - sob) * (1 - hit));
    if (sob > 0) mo.B.head.rotation.x += .25 * sob;
    breathe(mo, t, 1 + sob, 3);
    // Zoubida: points to the wall on "passer par-dessus le mur"; the slap: wind-up, palm to his left cheek, follow-through
    const [a0] = S.L(0), pt = clamp(sm(a0 + .6, a0 + 1.2, t) - sm(a0 + 3.5, a0 + 4.3, t));
    if (pt > 0) { const wall = IK.wpos(zou.B.chest).add(V(0, .25, 0)).addScaledVector(dirW(zou, 1, 0, .3), .5); PO.reach(zou, 'L', IK.wpos(zou.B.handL).lerp(wall, pt), { grip: .06 }); }
    const sw = t > TC - .7 && t < TC + 1;
    if (sw) {
      const sR = IK.wpos(zou.B.upperArmR), cheek = IK.wpos(mo.B.head).addScaledVector(dirW(mo, 1, 0, 0), .075).addScaledVector(dirW(mo, 0, 0, 1), .02).add(V(0, -.03, 0));
      const wind = sR.clone().add(V(0, .18, 0)).addScaledVector(dirW(zou, -1, 0, 0), .22).addScaledVector(dirW(zou, 0, 0, -1), .05);
      const follow = cheek.clone().addScaledVector(dirW(zou, 1, 0, 0), .25).add(V(0, -.05, 0)), down = IK.wpos(zou.B.handR);
      const tg = path(t, [[TC - .7, down], [TC - .15, wind], [TC, cheek], [TC + .12, follow], [TC + 1, down]]);
      M.slap = +PO.reach(zou, 'R', tg, { grip: .05 }).toFixed(3);
      if (Math.abs(t - TC) < .02) M.palmCheek = +PO.handPts(zou, 'R').palm.distanceTo(cheek).toFixed(3);
      zou.B.spine.rotation.y += .25 * Math.sin(Math.PI * clamp((t - TC + .7) / 1.7)); zou.group.updateMatrixWorld(true);
    }
    PO.look(zou, IK.wpos(mo.B.head), .6);
    breathe(zou, t, 1, 1);
    PO.look(rah, IK.wpos(t > TC ? mo.B.head : zou.B.head), .6); breathe(rah, t, 1, 2);
  },
  view(lt, u, t) {
    const [zx, zy] = sh.st.zp, [mx, my] = sh.st.mp, cx = (zx + mx) / 2;
    return [key(t, [[0, 900], [6, cx], [TC - 2, cx], [TC + 1, mx + 40]]), key(t, [[0, 560], [6, (zy + my) / 2 + 80], [TC - 2, (zy + my) / 2 + 80], [TC + 1, my + 60]]), key(t, [[0, 1.15], [6, 1.6], [TC - 2, 1.65], [TC + 1, 1.95], [40, 2.05]])];
  },
});

window.__s11 = sh;
export default make({ preload: all(sh), plate: 'ep05/terrasse_peau', segs: [ac([0, 0], sh.fn), st('p06_mur', [6, 0], 'rise')] });
