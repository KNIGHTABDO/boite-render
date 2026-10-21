// s21: the house noises. Zoubida, kneeling at the brazier in the room (staged on chambre_jour, not the uncalibrated
// cuisine_palier), works the old bellows; Mohammed, seated on the back mattress, gives it its three words ("Des mouches !")
// and Rahma's longer repertoire ("J'ai chaud !..."), bobbing to the puffs; then sparks rise from the coals (line 5).
// Contacts (st.M): his hips on the mattress top, her knees on the floor, both her hands on the bellows handles.
import * as THREE from 'three';
import * as K from '../../../engine/core.js';
import { cast } from '../../../engine/stage3d.js';
import * as PR from '../../../engine/props3d.js';
import * as PO from '../../../engine/poses.js';
import * as IK from '../../../engine/ik.js';
import { make, ac } from './_pt.js';
import { shot, all, breathe, V, memoPose, skirt } from './_3d.js';
import { LIGHT_JOUR } from './s07_khlii.js';
const { clamp, ease, key, hash } = K;
const sm = (a, b, x) => ease((x - a) / (b - a));
const yawTo = (from, to) => Math.atan2(to.x - from.x, to.z - from.z);
const A = [1, 11.8, 17.7, 22, 25.3, 33.6];   // line starts (local)

const sh = shot({
  plate: 'chambre_jour', light: LIGHT_JOUR,
  async build(S3, cal) {
    const M = {}, hz = cal.horizon, tb = S3.floorAt(862, 747), mF = S3.floorAt(862, 685), mH = cal.h * (1 - (644 - hz) / (685 - hz));
    S3.prop(PR.tabla({ r: .25, h: cal.h * (1 - (676 - hz) / (747 - hz)) }), tb.x, 0, tb.z - .12);
    const mo = await cast('mohammed', { seat: true, copy: 1 }), zou = await cast('zoubida', { seat: true, copy: 1 });
    const cam = S3.cam.position.clone().setY(0), mAt = V(tb.x, 0, mF.z - .36);
    S3.add(mo, mAt.x, mAt.z, yawTo(mAt, cam) * .5);
    M.sit = memoPose('s21sit', mo, [mAt, mH], () => PO.crossLegged(mo, { seat: mH, lean: .12 }).map(e => +e.toFixed(3)));
    const moBase = PO.snap(mo); skirt(S3, mo, mH);
    // brazier in front-right of the tabla; Zoubida kneels behind it, the bellows between them, nozzle at the coals
    const zAt = mAt.clone().add(V(1.05, 0, .5)), d = V(-.41, 0, .69).normalize(), br = zAt.clone().addScaledVector(d, .8);
    S3.prop(PR.brazier(), br.x, 0, br.z);
    S3.add(zou, zAt.x, zAt.z, yawTo(zAt, br));
    M.zou = memoPose('s21zou', zou, [zAt], () => PO.kneel(zou, { lean: .25 }) ?? 0);
    const bl = PR.bellows(), bc = br.clone().addScaledVector(d, -.11).setY(.3);
    bl.rotation.order = 'YZX'; bl.rotation.set(0, Math.atan2(d.z, -d.x), .25); bl.position.copy(bc); S3.scene.add(bl);
    // sparks
    const sp = [...Array(14)].map(() => { const m = new THREE.Mesh(new THREE.SphereGeometry(.012, 6, 4), new THREE.MeshBasicMaterial({ color: 0xffb040 })); S3.scene.add(m); return m; });
    return { actors: [mo, zou], faces: [[mo, 'mohammed', 5], [zou, 'zoubida', 2]], M, mo, zou, moBase, zBase: PO.snap(zou), bl, br, sp,
      hp: S3.project(IK.wpos(mo.B.head)), zp: S3.project(br.clone().lerp(IK.wpos(zou.B.head), .5)), bp: S3.project(br.clone().setY(.4)) };
  },
  frame(lt, u, t, S, st) {
    const { mo, zou, M, bl } = st, [a2, b2] = S.L(2), [a4, b4] = S.L(4), [a5] = S.L(5);
    // the bellows: a steady puff through the narration, three quick ones on each "Des mouches !"
    const fast = (t > a2 && t < b2) || (t > a4 && t < b4), o = .5 + .5 * Math.sin(t * (fast ? 5 : 2.6));
    bl.updateMatrixWorld(true); bl.userData.set(o);
    PO.apply(zou, st.zBase);
    zou.B.spine.rotation.x += .2; zou.group.updateMatrixWorld(true);
    const [gt, gb] = bl.userData.grips;
    M.hR = +PO.reach(zou, 'R', gt, { grip: .02 }).toFixed(3); M.hL = +PO.reach(zou, 'L', gb, { grip: .02 }).toFixed(3);
    zou.B.head.rotation.x -= .3; zou.B.neck.rotation.x -= .12; zou.group.updateMatrixWorld(true);
    PO.look(zou, st.br, .2); breathe(zou, t, 1, 1);
    // Mohammed bobs to the puffs while he speaks for the bellows
    PO.apply(mo, st.moBase);
    const talk = fast ? 1 : 0;
    mo.B.head.rotation.x += Math.sin(t * 5) * .08 * talk; mo.B.chest.rotation.z += Math.sin(t * 2.5) * .05 * talk; mo.group.updateMatrixWorld(true);
    PO.look(mo, t > a5 ? st.br : bl.position, .6); breathe(mo, t, 1, 0);
    // sparks rolling up from the coals (line 5)
    st.sp.forEach((m, i) => {
      const life = 2.2, k = ((t - a5) / life + hash(i) ) % 1, on = t > a5 + hash(i) * 2 && t < a5 + 18;
      m.visible = on; if (!on) return;
      m.position.copy(st.br).add(V((hash(i + 7) - .5) * .2 + Math.sin(t * 3 + i) * .03 * k, .17 + k * .9, (hash(i + 3) - .5) * .2));
      m.scale.setScalar(1 - k * .7);
    });
  },
  view(lt, u, t) {
    const [hx, hy] = sh.st.hp, [zx, zy] = sh.st.zp, [bx, by] = sh.st.bp, mx = (hx + zx) / 2, my = (hy + zy) / 2 + 30;
    return [key(t, [[0, zx], [10, zx], [A[2] - 1, mx], [A[2] + 1, hx], [A[3], mx], [A[4], hx], [A[5] - 1, hx], [A[5] + 1, bx]]),
      key(t, [[0, zy], [10, zy], [A[2] - 1, my], [A[2] + 1, hy + 40], [A[3], my], [A[4], hy + 40], [A[5] - 1, hy + 40], [A[5] + 1, by - 60]]),
      key(t, [[0, 2.0], [10, 1.6], [A[2] + 1, 2.2], [A[3], 1.6], [A[4], 2.2], [A[5] - 1, 2.2], [A[5] + 1, 1.8], [54, 1.5]])];
  },
});

window.__s21 = sh;
export default make({ preload: all(sh), plate: 'chambre_jour', segs: [ac([0, 0], sh.fn)] });
