// s14: back home. Fatma (at her doorway) and Kanza talk in the patio while the reciters are announced next door; Zoubida
// comes back over the wall and down, leading Mohammed by the hand; Fatma asks for news, Kanza: "Tous les êtres sont
// mortels"; the reciters' drone comes through the walls and Zoubida sighs.
// Plate patio_vide (calibrated for s04/s06: h .66, horizon 493). Everyone stands (feet checked with lowestOf).
// Contacts (st.M): Zoubida's left hand holding Mohammed's right (both reach the same point: hand gap), feet on the floor.
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
  light: { key: 0xffe4b8, keyI: 1.4, dir: [-1.5, 3, 1.5], sky: 0xd6c6b0, ground: 0xd09858, fillI: 1.6, rim: 0xffd090, rimI: .5, rimDir: [-2, 1.5, -2], shadow: .32, area: 4 },
  async build(S3) {
    const F = (x, y) => S3.floorAt(x, y);
    const fat = await cast('fatma'), kan = await cast('woman1'), zou = await cast('zoubida'), mo = await cast('mohammed');
    const door = F(1120, 712), kAt = F(930, 740), stopZ = F(760, 728), from = stopZ.clone().add(V(-2.6, 0, .3));
    S3.add(fat, door.x, door.z, yawTo(door, kAt) * .7); S3.add(kan, kAt.x, kAt.z, yawTo(kAt, door) + 1.1);
    S3.add(zou, from.x, from.z, yawTo(from, stopZ)); S3.add(mo, from.x, from.z, yawTo(from, stopZ));
    return { actors: [fat, kan, zou, mo], faces: [[fat, 'fatma', 3], [kan, 'kanza', 6], [zou, null, 2, { sad: .35 }], [mo, null, 8, { sad: .3 }]],
      M: {}, fat, kan, zou, mo, door, kAt, stopZ, from, mid: S3.project(stopZ.clone().lerp(door, .5).add(V(0, 1.3, 0))) };
  },
  frame(lt, u, t, S, st) {
    const { fat, kan, zou, mo, M } = st, [a1] = S.L(1), [a2] = S.L(2), [a3] = S.L(3), [a4] = S.L(4);
    // the walk in (from "me prit par la main"): 0.9 m/s, braking over the last half metre; the boy walks at her right
    const len = st.from.distanceTo(st.stopZ), s = Math.max(0, t - a1) * .9, x = clamp((s - len + .5) / 1);
    const d = s < len - .5 ? s : len - .5 + .5 * (1 - (1 - x) ** 2), k = s > 0 ? 1 - x : 0;
    const p = st.from.clone().lerp(st.stopZ, d / len), yaw = yawTo(st.from, st.stopZ), side = V(-Math.cos(yaw), 0, Math.sin(yaw));
    const face = sm(len / .9 + a1, len / .9 + a1 + 1.5, t);   // stopped: turn to the two women
    for (const [a, off, ph] of [[zou, 0, 0], [mo, .36, .5]]) {
      rest(a.B); walkPose(a.B, (t - a1) * 1.8 + ph, Math.max(k, .02), { stride: a === mo ? .42 : .55, arms: a === mo ? .2 : .3 });
      const q = p.clone().addScaledVector(side, off);
      a.group.position.set(q.x, 0, q.z); a.group.rotation.y = yaw + (yawTo(q, st.kAt) - yaw) * face * (a === mo ? .5 : 1);
      a.group.updateMatrixWorld(true);
    }
    zou.group.visible = mo.group.visible = t > a1 - .1;
    // hand in hand until she lets go to answer
    const hold = 1 - sm(a2 + 1, a2 + 2, t);
    if (hold > 0) {
      const hp = IK.wpos(zou.B.handL).lerp(IK.wpos(mo.B.handR), .5).add(V(0, .05, 0));
      PO.reach(zou, 'L', IK.wpos(zou.B.handL).lerp(hp, hold), { grip: .03 }); PO.reach(mo, 'R', IK.wpos(mo.B.handR).lerp(hp, hold), { grip: .03 });
      M.hands = +PO.handPts(zou, 'L').palm.distanceTo(PO.handPts(mo, 'R').palm).toFixed(3);
    }
    // at the reciters' drone she sighs: head down, shoulders drop
    const sigh = sm(a4 + 6, a4 + 8, t);
    zou.B.head.rotation.x += .2 * sigh; zou.B.chest.rotation.x += .06 * sigh; zou.group.updateMatrixWorld(true);
    PO.look(zou, IK.wpos(t < a3 ? fat.B.head : kan.B.head), .6 * face * (1 - sigh));
    PO.look(mo, IK.wpos(zou.B.head), .5 * face);
    breathe(zou, t, 1 + sigh, 1); breathe(mo, t, 1, 2);
    // Fatma and Kanza: talk to each other (hands), then turn to Zoubida for the news
    for (const a of [fat, kan]) { rest(a.B); walkPose(a.B, 0, 0); a.group.updateMatrixWorld(true); }
    const tz = sm(a1 + 3, a1 + 5, t);
    PO.look(fat, IK.wpos(tz > .5 ? zou.B.head : kan.B.head), .6); PO.look(kan, IK.wpos(tz > .5 && t < a3 ? zou.B.head : fat.B.head), .6);
    const g = clamp(sm(a2, a2 + .5, t) - sm(a2 + 4, a2 + 5, t));
    if (g > 0) PO.reach(fat, 'R', IK.wpos(fat.B.handR).lerp(IK.wpos(fat.B.chest).addScaledVector(dirW(fat, 0, 0, 1), .35).add(V(0, -.1, 0)), g), { grip: .06 });
    const g3 = clamp(sm(a3, a3 + .6, t) - sm(a3 + 5, a3 + 6, t));   // Kanza: palm up to the sky on "mortels"
    if (g3 > 0) PO.reach(kan, 'R', IK.wpos(kan.B.handR).lerp(IK.wpos(kan.B.chest).addScaledVector(dirW(kan, 0, 0, 1), .3).add(V(0, .3, 0)), g3), { grip: .07 });
    breathe(fat, t, 1, 3); breathe(kan, t, 1, 4);
    M.feet = [fat, kan, zou, mo].map(a => +PO.lowestOf(a, Object.keys(a.B)).toFixed(3));
  },
  view(lt, u, t, S) {
    const [cx, cy] = sh.st.mid;
    return [key(t, [[0, 1000], [16, 960], [24, cx], [52, cx]]), key(t, [[0, 520], [16, 540], [24, cy + 40]]), key(t, [[0, 1.2], [16, 1.08], [24, 1.25], [52, 1.35]])];
  },
});

window.__s14 = sh;
export default make({ preload: all(sh), plate: 'ep05/patio_vide', segs: [ac([0, 0], sh.fn)] });
