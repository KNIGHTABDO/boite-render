// s17: the cries start again, louder; the body leaves the house; Mohammed, on the back mattress, sobs (hands to the eyes,
// chest shaking). Zoubida, kneeling by the tabla, puts her hand on his shoulder ("Qu'est-ce que tu as ?"), then holds out
// the bowl of lentils with both hands; he turns his head away, she puts it back.
// Plate chambre_jour, same tabla/mattress staging as s07.
// Contacts (st.M): his hips on the mattress top, her knees on the floor, his hands at his eyes, her palm on his shoulder,
// both her hands on the bowl's rim (the bowl rides between them).
import * as K from '../../../engine/core.js';
import { cast } from '../../../engine/stage3d.js';
import * as PR from '../../../engine/props3d.js';
import * as PO from '../../../engine/poses.js';
import * as IK from '../../../engine/ik.js';
import { make, ac } from './_pt.js';
import { shot, all, breathe, V, memoPose, skirt } from './_3d.js';
import { LIGHT_JOUR } from './s07_khlii.js';
const { clamp, ease, key } = K;
const sm = (a, b, x) => ease((x - a) / (b - a));
const dirW = (a, x, y, z) => V(x, y, z).normalize().applyAxisAngle(V(0, 1, 0), a.group.rotation.y);
const yawTo = (from, to) => Math.atan2(to.x - from.x, to.z - from.z);
const path = (t, ks) => { if (t <= ks[0][0]) return ks[0][1].clone(); for (let i = 1; i < ks.length; i++) if (t <= ks[i][0]) return ks[i - 1][1].clone().lerp(ks[i][1], ease((t - ks[i - 1][0]) / (ks[i][0] - ks[i - 1][0]))); return ks.at(-1)[1].clone(); };

const sh = shot({
  plate: 'chambre_jour', light: { ...LIGHT_JOUR, keyI: 1.05, fillI: 1.25 },   // "le soleil se cacha derrière un nuage"
  async build(S3, cal) {
    const M = {}, hz = cal.horizon;
    const tb = S3.floorAt(862, 747), tH = cal.h * (1 - (676 - hz) / (747 - hz)), mF = S3.floorAt(862, 685), mH = cal.h * (1 - (644 - hz) / (685 - hz));
    S3.prop(PR.tabla({ r: .25, h: tH }), tb.x, 0, tb.z - .12);
    const bw = S3.prop(PR.bowl({ r: .13, h: .07, food: 0x6a4a1a, glaze: 0xe0a860 }), 0, 0, 0);
    const mo = await cast('mohammed', { seat: true, copy: 1 }), zou = await cast('zoubida', { seat: true, copy: 1 });
    const mAt = V(tb.x, 0, mF.z - .3);
    S3.add(mo, mAt.x, mAt.z, yawTo(mAt, S3.cam.position.clone().setY(0)) * .5);
    M.mo = memoPose('s17mo', mo, [mAt, mH], () => PO.crossLegged(mo, { seat: mH, lean: .25 }).map(e => +e.toFixed(3)));
    const moBase = PO.snap(mo); skirt(S3, mo, mH);
    // Zoubida kneels at the tabla's left, close enough to reach his shoulder
    const zAt = mAt.clone().add(V(.5, 0, .38));
    const yT = yawTo(zAt, mAt) , yC = yawTo(zAt, S3.cam.position.clone().setY(0)), yd = Math.atan2(Math.sin(yC - yT), Math.cos(yC - yT));
    S3.add(zou, zAt.x, zAt.z, yT + yd * .6);
    M.zou = memoPose('s17zou', zou, [zAt], () => PO.kneel(zou, { lean: .2 }).map?.(e => +e.toFixed(3)));
    const zBase = PO.snap(zou), zBaseChest = zou.B.chest, bw0 = zAt.clone().addScaledVector(dirW(zou, 0, 0, 1), .32).addScaledVector(dirW(zou, -1, 0, 0), .12); bw.position.copy(bw0);
    return { actors: [mo, zou], faces: [[zou, 'zoubida', 2, { sad: .4 }], [mo, null, 5, { sad: 1 }]], M, mo, zou, moBase, zBase, zBaseChest, bw, bw0, tH,
      hp: S3.project(IK.wpos(mo.B.head)), zp: S3.project(IK.wpos(zou.B.head)) };
  },
  frame(lt, u, t, S, st) {
    const { mo, zou, M, bw } = st, [a2] = S.L(2), [a3] = S.L(3);
    PO.apply(zou, st.zBase); PO.apply(mo, st.moBase);
    // Mohammed sobs: head down, hands at the eyes, chest jerking; turns his head away from the bowl
    const away = clamp(sm(a3 + 3, a3 + 3.8, t) - sm(a3 + 9, a3 + 10, t));
    mo.B.spine.rotation.x += .1; mo.B.chest.rotation.x += Math.abs(Math.sin(t * 7)) * .05 + .05;
    mo.B.head.rotation.x += .3; mo.B.head.rotation.y -= .6 * away; mo.group.updateMatrixWorld(true);
    const h = IK.wpos(mo.B.head), f = dirW(mo, 0, 0, 1), s = dirW(mo, 1, 0, 0);
    for (const [side, k] of [['L', 1], ['R', -1]]) M['eye' + side] = +PO.reach(mo, side, h.clone().addScaledVector(f, .09).addScaledVector(s, .035 * k).add(V(0, -.01 + Math.sin(t * 6 + k) * .006, 0)), { grip: .02 }).toFixed(3);
    breathe(mo, t, 2, 3);
    // Zoubida: hand on his shoulder while she asks (line 2), then the bowl with both hands, held out, put back
    const pat = clamp(sm(a2 - .5, a2 + .5, t) - sm(a3, a3 + 1, t));
    if (pat > 0) { zou.B.spine.rotation.x += .35 * pat; zou.group.updateMatrixWorld(true); const sh = IK.wpos(mo.B.upperArmL).add(V(0, .03, 0)); M.pat = +PO.reach(zou, 'R', IK.wpos(zou.B.handR).lerp(sh, pat), { grip: .04 }).toFixed(3); }
    const out = IK.wpos(mo.B.chest).lerp(IK.wpos(st.zBaseChest), .6).add(V(0, -.08, 0)).addScaledVector(dirW(zou, 1, 0, 0), .14);
    const bp = path(t, [[a3 + .5, st.bw0], [a3 + 1.5, st.bw0], [a3 + 3, out], [a3 + 9, out], [a3 + 10.5, st.bw0]]);
    bw.position.copy(bp);
    if (t > a3 + .5 && t < a3 + 11.5) {
      const w = clamp(sm(a3 + .5, a3 + 1.3, t) - sm(a3 + 10.5, a3 + 11.5, t)), sd = dirW(zou, 1, 0, 0);
      zou.B.spine.rotation.x += .25 * w; zou.group.updateMatrixWorld(true);
      for (const [side, k] of [['L', 1], ['R', -1]]) M['bowl' + side] = +PO.reach(zou, side, IK.wpos(zou.B['hand' + side]).lerp(bp.clone().add(V(0, .04, 0)).addScaledVector(sd, .13 * k), w), { grip: .02 }).toFixed(3);
    }
    zou.B.head.rotation.x -= .35; zou.B.neck.rotation.x -= .15; zou.group.updateMatrixWorld(true);
    PO.look(zou, IK.wpos(mo.B.head), .2); breathe(zou, t, 1, 1);
  },
  view(lt, u, t, S) {
    const [hx, hy] = sh.st.hp, [zx, zy] = sh.st.zp, mx = (hx + zx) / 2;
    return [key(t, [[0, 900], [10, hx], [26, hx], [30, mx]]), key(t, [[0, 560], [10, hy + 50], [26, hy + 50], [30, (hy + zy) / 2 + 60]]), key(t, [[0, 1.3], [10, 2.2], [26, 2.3], [30, 1.9], [56, 2.0]])];
  },
});

window.__s17 = sh;
export default make({ preload: all(sh), plate: 'chambre_jour', segs: [ac([0, 0], sh.fn)] });
