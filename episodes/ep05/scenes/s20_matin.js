// s20: morning. A sunbeam burns his eyelids; he lies on the back mattress and opens his eyes; Zoubida, kneeling at his
// feet: "Que ta matinée soit bénie... tu avais un peu de fièvre"; "Je ne suis pas malade !" and he sits up (lying pose
// blended into the cross-legged one, turning to the camera); Fatma comes in with a bunch of mauve: "Déjà de la mauve !"
// Plate chambre_jour (same back mattress as s07). Contacts (st.M): lying on the mattress top (lie), seated on it
// (crossLegged), Zoubida's knees on the floor, the mauve in Fatma's hand (grip point at the palm).
import * as K from '../../../engine/core.js';
import { cast } from '../../../engine/stage3d.js';
import * as PR from '../../../engine/props3d.js';
import * as PO from '../../../engine/poses.js';
import * as IK from '../../../engine/ik.js';
import { rest, walkPose } from '../../../engine/rig3d.js';
import { make, ac } from './_pt.js';
import { shot, all, breathe, V, memoPose, skirt, blend } from './_3d.js';
import { LIGHT_JOUR } from './s07_khlii.js';
const { clamp, ease, key } = K;
const sm = (a, b, x) => ease((x - a) / (b - a));
const dirW = (a, x, y, z) => V(x, y, z).normalize().applyAxisAngle(V(0, 1, 0), a.group.rotation.y);
const yawTo = (from, to) => Math.atan2(to.x - from.x, to.z - from.z);

const sh = shot({
  plate: 'chambre_jour', light: { ...LIGHT_JOUR, keyI: 1.45 },
  async build(S3, cal) {
    const M = {}, hz = cal.horizon, tb = S3.floorAt(862, 747), mF = S3.floorAt(862, 685), mH = cal.h * (1 - (644 - hz) / (685 - hz));
    S3.prop(PR.tabla({ r: .25, h: cal.h * (1 - (676 - hz) / (747 - hz)) }), tb.x, 0, tb.z - .12);
    const mo = await cast('mohammed', { seat: true, copy: 1 }), zou = await cast('zoubida', { seat: true, copy: 1 }), fat = await cast('fatma');
    const cam = S3.cam.position.clone().setY(0), mAt = V(tb.x, 0, mF.z - .36), ySit = yawTo(mAt, cam) * .5;
    S3.add(mo, mAt.x, mAt.z, ySit);
    M.sit = memoPose('s20sit', mo, [mAt, mH], () => PO.crossLegged(mo, { seat: mH, lean: .12 }).map(e => +e.toFixed(3)));
    const sitS = PO.snap(mo), sk = skirt(S3, mo, mH);
    mo.group.rotation.y = Math.PI / 2; mo.group.updateMatrixWorld(true);
    M.lie = memoPose('s20lie', mo, [mAt, mH], () => { const r = PO.lie(mo, { top: mH, turn: -.35, pillow: .07 }); return { low: +(r.low - mH).toFixed(3), heel: r.heel, pil: r.pillowAt.toArray() }; });
    const lieS = PO.snap(mo), pil = S3.prop(PR.cushion({ w: .4, d: .3, h: .07, col: 0xe0d0a8 }), M.lie.pil[0], mH, M.lie.pil[2]);
    const head = IK.wpos(mo.B.head);
    const zAt = mAt.clone().add(V(.9, 0, .5));
    S3.add(zou, zAt.x, zAt.z, yawTo(zAt, mAt) * .6 + yawTo(zAt, cam) * .4);
    M.zou = memoPose('s20zou', zou, [zAt], () => PO.kneel(zou, { lean: .1 }) ?? 0);
    const door = S3.floorAt(1450, 760), fAt = S3.floorAt(1250, 740);
    S3.add(fat, door.x, door.z, yawTo(door, fAt));
    const mv = S3.prop(PR.mauve(), 0, 0, 0);
    return { actors: [mo, zou, fat], faces: [[mo, 'mohammed', 5], [zou, 'zoubida', 2], [fat, 'fatma', 3]], M, mo, zou, fat, sitS, lieS, sk, pil, mv,
      zBase: PO.snap(zou), door, fAt, mAt, ySit, hp: S3.project(head), zp: S3.project(IK.wpos(zou.B.head)), fp: S3.project(fAt.clone().add(V(0, 1.4, 0))) };
  },
  frame(lt, u, t, S, st) {
    const { mo, zou, fat, M } = st, [a2] = S.L(2), [a3] = S.L(3), [a4] = S.L(4);
    // lying -> sitting up on "Je ne suis pas malade !", turning to the camera
    const up = sm(a2 - .4, a2 + 1.2, t);
    mo.group.rotation.y = Math.PI / 2 + (st.ySit - Math.PI / 2) * up; mo.group.updateMatrixWorld(true);
    blend(mo, st.lieS, st.sitS, up);
    st.sk.visible = up > .95; if (st.sk.userData.hem) st.sk.userData.hem.visible = up > .95;
    if (up < .05) { mo.B.head.rotation.y -= .25 * sm(2, 5, t); mo.group.updateMatrixWorld(true); }   // turns his face out of the beam
    breathe(mo, t, 1, 0);
    // Zoubida, kneeling at his feet
    PO.apply(zou, st.zBase);
    zou.B.head.rotation.x -= .3; zou.B.neck.rotation.x -= .12; zou.group.updateMatrixWorld(true);
    PO.look(zou, IK.wpos(t > a4 ? fat.B.head : mo.B.head), .2); breathe(zou, t, 1, 1);
    // Fatma walks in from the right with the mauve held up
    const w = clamp((t - (a4 - 2.5)) / 2.2), p = st.door.clone().lerp(st.fAt, ease(w));
    fat.group.visible = t > a4 - 2.6;
    rest(fat.B); walkPose(fat.B, t * 1.8, w > 0 && w < 1 ? 1 : 0, { stride: .5, arms: .2 });
    fat.group.position.set(p.x, 0, p.z); fat.group.rotation.y = yawTo(st.door, st.fAt) + (yawTo(st.fAt, st.mAt) - yawTo(st.door, st.fAt)) * sm(a4 - .4, a4 + .4, t);
    fat.group.updateMatrixWorld(true);
    const hold = IK.wpos(fat.B.chest).addScaledVector(dirW(fat, 0, 0, 1), .3).addScaledVector(dirW(fat, -1, 0, 0), .12).add(V(0, .05, 0));
    M.mauve = +PO.reach(fat, 'R', hold, { grip: .02 }).toFixed(3);
    st.mv.visible = fat.group.visible; st.mv.position.copy(PO.handPts(fat, 'R').palm.sub(st.mv.userData.grip));
    PO.look(fat, IK.wpos(mo.B.head), .5); breathe(fat, t, 1, 3);
  },
  view(lt, u, t, S) {
    const [hx, hy] = sh.st.hp, [zx, zy] = sh.st.zp, [fx, fy] = sh.st.fp, a4 = 36, cx = (hx + zx) / 2;
    return [key(t, [[0, hx + 40], [12, hx + 40], [15, cx], [a4 - 3, cx], [a4, (cx + fx) / 2]]), key(t, [[0, hy + 40], [12, hy + 40], [15, (hy + zy) / 2 + 40], [a4, (hy + fy) / 2 + 40]]),
      key(t, [[0, 2.6], [12, 2.4], [15, 1.8], [a4 - 3, 1.8], [a4, 1.35]])];
  },
});

window.__s20 = sh;
export default make({ preload: all(sh), plate: 'chambre_jour', segs: [ac([0, 0], sh.fn)] });
