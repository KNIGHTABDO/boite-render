// s26: "Zineb ! C'était elle !": seated on the back mattress, Mohammed understands; fists clenched, shaking (line 0);
// P12a: the fight in the patio, nails, hair, kicks, the women pulling them apart (lines 1-2); P12b: his mother dunks his
// head in the bucket (line 3); back in the room, he lies on the mattress, chest still shaken by sobs, and falls asleep
// (line 4). Plate chambre_jour (s20 staging: same seated and lying poses).
// Contacts (st.M): seated / lying on the mattress top, pillow under the head.
import * as K from '../../../engine/core.js';
import { cast } from '../../../engine/stage3d.js';
import * as PR from '../../../engine/props3d.js';
import * as PO from '../../../engine/poses.js';
import * as IK from '../../../engine/ik.js';
import { make, ac, st } from './_pt.js';
import { shot, all, breathe, V, memoPose, skirt } from './_3d.js';
import { LIGHT_JOUR } from './s07_khlii.js';
const { clamp, ease, key } = K;
const sm = (a, b, x) => ease((x - a) / (b - a));
const dirW = (a, x, y, z) => V(x, y, z).normalize().applyAxisAngle(V(0, 1, 0), a.group.rotation.y);
const yawTo = (from, to) => Math.atan2(to.x - from.x, to.z - from.z);
const A4 = 43;

const sh = shot({
  plate: 'chambre_jour', light: { ...LIGHT_JOUR, keyI: 1.2 },
  async build(S3, cal) {
    const M = {}, hz = cal.horizon, tb = S3.floorAt(862, 747), mF = S3.floorAt(862, 685), mH = cal.h * (1 - (644 - hz) / (685 - hz));
    S3.prop(PR.tabla({ r: .25, h: cal.h * (1 - (676 - hz) / (747 - hz)) }), tb.x, 0, tb.z - .12);
    const mo = await cast('mohammed', { seat: true, copy: 1 });
    const cam = S3.cam.position.clone().setY(0), mAt = V(tb.x, 0, mF.z - .36), ySit = yawTo(mAt, cam) * .5;
    S3.add(mo, mAt.x, mAt.z, ySit);
    M.sit = memoPose('s20sit', mo, [mAt, mH], () => PO.crossLegged(mo, { seat: mH, lean: .12 }).map(e => +e.toFixed(3)));
    const sitS = PO.snap(mo), sk = skirt(S3, mo, mH);
    mo.group.rotation.y = Math.PI / 2; mo.group.updateMatrixWorld(true);
    M.lie = memoPose('s20lie', mo, [mAt, mH], () => { const r = PO.lie(mo, { top: mH, turn: -.35, pillow: .07 }); return { low: +(r.low - mH).toFixed(3), heel: r.heel, pil: r.pillowAt.toArray() }; });
    const lieS = PO.snap(mo), pil = S3.prop(PR.cushion({ w: .4, d: .3, h: .07, col: 0xe0d0a8 }), M.lie.pil[0], mH, M.lie.pil[2]);
    const lh = S3.project(IK.wpos(mo.B.head));
    mo.group.rotation.y = ySit; mo.group.updateMatrixWorld(true); PO.apply(mo, sitS);
    return { actors: [mo], faces: [[mo, 'mohammed', 5, (lt, t) => ({ sad: t > A4 - 1 ? 1 : 0, blink: t > A4 + 3 ? 1 : 0 })]], M, mo, sitS, lieS, sk, pil, ySit,
      hp: S3.project(IK.wpos(mo.B.head)), lh };
  },
  frame(lt, u, t, S, st) {
    const { mo, M } = st, [a1] = S.L(1), lying = t > a1;
    mo.group.rotation.y = lying ? Math.PI / 2 : st.ySit; mo.group.updateMatrixWorld(true);
    PO.apply(mo, lying ? st.lieS : st.sitS);
    st.sk.visible = !lying; if (st.sk.userData.hem) st.sk.userData.hem.visible = !lying;
    if (!lying) {
      // fists clenched on his knees, trembling with rage
      const f = dirW(mo, 0, 0, 1), s = dirW(mo, 1, 0, 0), h = IK.wpos(mo.B.chest).addScaledVector(f, .16).add(V(0, -.2, 0)), r = sm(3, 5, t);
      for (const [side, k] of [['L', 1], ['R', -1]]) M['fist' + side] = +PO.reach(mo, side, h.clone().addScaledVector(s, .13 * k).add(V(0, Math.sin(t * 23 + k) * .006 * r, 0)), { grip: .03 }).toFixed(3);
      mo.B.head.rotation.x -= .1 * r; mo.group.updateMatrixWorld(true);
      breathe(mo, t, 1 + 1.5 * r, 0);
    } else {
      // sobs that slow down into sleep
      const sob = 1 - sm(A4 + 1, A4 + 5, t);
      mo.B.chest.rotation.x += Math.abs(Math.sin(t * 6)) * .06 * sob; mo.group.updateMatrixWorld(true);
      breathe(mo, t, 1 + sob, 0);
    }
  },
  view(lt, u, t) {
    const [hx, hy] = sh.st.hp, [lx, ly] = sh.st.lh;
    if (t < A4 - 2) return [key(t, [[0, hx], [9, hx]]), key(t, [[0, hy + 70], [9, hy + 40]]), key(t, [[0, 1.7], [9, 2.5]])];
    return [lx + 60, ly + 30, key(t, [[A4 - 2, 2.0], [A4 + 6, 2.5]])];
  },
});

window.__s26 = sh;
export default make({ preload: all(sh), plate: 'chambre_jour', segs: [ac([0, 0], sh.fn), st('p12a_bagarre', [1, 0], 'pushL'), st('p12b_seau', [3, 0], 'face'), ac([4, 0], sh.fn)] });
