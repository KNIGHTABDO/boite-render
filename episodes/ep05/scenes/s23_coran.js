// s23: seated on the back mattress, Mohammed recites the little Coran he knows, rocking like at the msid, softly then
// loudly (line 0); his memory dries up, he invents his own Coran, rocking harder (line 1); Zoubida, kneeling at his right:
// "Doucement, pas si fort... Tiens. Ajoute ceci à tes merveilles." and puts a small copper chain in his hand (line 2).
// Plate chambre_jour (s17 staging). Contacts (st.M): hips on the mattress, her knees on the floor, the chain hanging
// from her palm then from his (handover: both palms meet), his palm.
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
const A = [1, 10.2, 27.6];

const sh = shot({
  plate: 'chambre_jour', light: LIGHT_JOUR,
  async build(S3, cal) {
    const M = {}, hz = cal.horizon, tb = S3.floorAt(862, 747), mF = S3.floorAt(862, 685), mH = cal.h * (1 - (644 - hz) / (685 - hz));
    S3.prop(PR.tabla({ r: .25, h: cal.h * (1 - (676 - hz) / (747 - hz)) }), tb.x, 0, tb.z - .12);
    const mo = await cast('mohammed', { seat: true, copy: 1 }), zou = await cast('zoubida', { seat: true, copy: 1 });
    const cam = S3.cam.position.clone().setY(0), mAt = V(tb.x, 0, mF.z - .3);
    S3.add(mo, mAt.x, mAt.z, yawTo(mAt, cam) * .5);
    M.mo = memoPose('s17mo', mo, [mAt, mH], () => PO.crossLegged(mo, { seat: mH, lean: .25 }).map(e => +e.toFixed(3)));
    const moBase = PO.snap(mo); skirt(S3, mo, mH);
    const zAt = mAt.clone().add(V(.5, 0, .38)), yT = yawTo(zAt, mAt), yC = yawTo(zAt, cam), yd = Math.atan2(Math.sin(yC - yT), Math.cos(yC - yT));
    S3.add(zou, zAt.x, zAt.z, yT + yd * .6);
    M.zou = memoPose('s17zou', zou, [zAt], () => PO.kneel(zou, { lean: .2 }).map?.(e => +e.toFixed(3)));
    const ch = S3.prop(PR.chain([-.015, 0, 0], [.015, 0, 0], { sag: .12, links: 30 }), 0, 0, 0);
    return { actors: [mo, zou], faces: [[mo, 'mohammed', 5], [zou, 'zoubida', 2]], M, mo, zou, moBase, zBase: PO.snap(zou), ch,
      hp: S3.project(IK.wpos(mo.B.head)), zp: S3.project(IK.wpos(zou.B.head)) };
  },
  frame(lt, u, t, S, st) {
    const { mo, zou, M, ch } = st, [a2, b2] = S.L(2);
    PO.apply(mo, st.moBase); PO.apply(zou, st.zBase);
    // rocking: soft, then loud, then frantic while he invents; stops when she speaks
    const amp = (.05 + .07 * sm(A[0] + 4, A[0] + 6, t) + .05 * sm(A[1] + 5, A[1] + 7, t)) * (1 - sm(a2, a2 + 1, t));
    mo.B.spine.rotation.x += .08 + Math.sin(t * (3 + 2 * sm(A[1] + 5, A[1] + 7, t))) * amp; mo.group.updateMatrixWorld(true);
    breathe(mo, t, 1, 0);
    // the handover: she holds out her right hand with the chain ("Tiens", ~a2+4.5), his left hand meets it, he lifts it to look
    const out = clamp(sm(a2 + 3.5, a2 + 4.5, t) - sm(a2 + 6.5, a2 + 7.5, t)), took = t > a2 + 6;
    const meet = IK.wpos(mo.B.chest).lerp(IK.wpos(zou.B.chest), .5).add(V(0, -.17, 0)).addScaledVector(dirW(mo, 0, 0, 1), .14);
    if (out > 0) { zou.B.spine.rotation.x += .2 * out; zou.group.updateMatrixWorld(true); M.zH = +PO.reach(zou, 'R', IK.wpos(zou.B.handR).lerp(meet.clone().add(V(0, .05, 0)), out), { grip: .03 }).toFixed(3); }
    const his = clamp(sm(a2 + 4.5, a2 + 5.5, t)), look = sm(a2 + 7, a2 + 8, t);
    if (his > 0) { const up = IK.wpos(mo.B.head).addScaledVector(dirW(mo, 0, 0, 1), .3).add(V(0, -.2, 0)); M.mH = +PO.reach(mo, 'L', IK.wpos(mo.B.handL).lerp(meet.clone().lerp(up, look), his), { grip: .03 }).toFixed(3); }
    ch.visible = t > a2 + 2.5;
    if (ch.visible) ch.position.copy(PO.handPts(took ? mo : zou, took ? 'L' : 'R').palm);
    if (look > 0) PO.look(mo, ch.position, .7 * look);
    zou.B.head.rotation.x -= .3; zou.B.neck.rotation.x -= .12; zou.group.updateMatrixWorld(true);
    PO.look(zou, IK.wpos(mo.B.head), .2); breathe(zou, t, 1, 1);
  },
  view(lt, u, t) {
    const [hx, hy] = sh.st.hp, [zx, zy] = sh.st.zp, mx = (hx + zx) / 2, my = (hy + zy) / 2 + 60;
    return [key(t, [[0, hx], [9, hx], [12, hx], [26, hx], [28, mx]]), key(t, [[0, hy + 60], [26, hy + 60], [28, my]]),
      key(t, [[0, 1.6], [9, 2.3], [12, 2.0], [26, 2.4], [28, 1.9], [37, 2.1]])];
  },
});

window.__s23 = sh;
export default make({ preload: all(sh), plate: 'chambre_jour', segs: [ac([0, 0], sh.fn)] });
