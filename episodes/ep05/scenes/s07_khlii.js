// s07: the room by day. "Ah, tu es là, toi ? Viens..." Mohammed sits on the back mattress at the tabla; Zoubida, kneeling
// at its left, plunges her forearm into the khlii jar, pulls out a strip of meat and drops it into the bowl (P3: close-up
// of the khlii in its fat). Then she is gone ("Ma mère avait disparu") and he eats alone, hand from the bowl to the mouth.
// Contacts (st.M): the 3D tabla on the painted one (it also hides his legs, as the painted one would), his hips on the
// mattress top, her knees/heels on the floor (kneel), the hand inside the jar mouth, the hand in the bowl and at the mouth.
import * as K from '../../../engine/core.js';
import { cast } from '../../../engine/stage3d.js';
import * as PR from '../../../engine/props3d.js';
import * as PO from '../../../engine/poses.js';
import * as IK from '../../../engine/ik.js';
import { make, ac, st } from './_pt.js';
import { shot, all, breathe, V, memoPose, skirt } from './_3d.js';
const { clamp, ease, key } = K;
const sm = (a, b, x) => ease((x - a) / (b - a));
const dirW = (a, x, y, z) => V(x, y, z).normalize().applyAxisAngle(V(0, 1, 0), a.group.rotation.y);
const yawTo = (from, to) => Math.atan2(to.x - from.x, to.z - from.z);
const fp = (a, p) => a.B.head.localToWorld(V(p[0], p[1] - a.S.head, p[2]));   // face point (spec units) -> world
/** piecewise path through points at times: [[t, Vector3], ...] (eased between keys) */
const path = (t, ks) => { if (t <= ks[0][0]) return ks[0][1].clone(); for (let i = 1; i < ks.length; i++) if (t <= ks[i][0]) return ks[i - 1][1].clone().lerp(ks[i][1], ease((t - ks[i - 1][0]) / (ks[i][0] - ks[i - 1][0]))); return ks.at(-1)[1].clone(); };
export const LIGHT_JOUR = { key: 0xffe0b0, keyI: 1.3, dir: [1.6, 3, 1], sky: 0xd8c0a0, ground: 0xc08850, fillI: 1.35, rim: 0xffd090, rimI: .45, rimDir: [2, 1.5, -2], shadow: .3, area: 3 };

const sh = shot({
  plate: 'chambre_jour', light: LIGHT_JOUR,
  async build(S3, cal) {
    const M = {}, hz = cal.horizon;
    // painted tabla: top centre (862,676), foot (862,747); back mattress front face foot y 685, top 644
    const tb = S3.floorAt(862, 747), tH = cal.h * (1 - (676 - hz) / (747 - hz)), mF = S3.floorAt(862, 685), mH = cal.h * (1 - (644 - hz) / (685 - hz));
    const tabla = S3.prop(PR.tabla({ r: .25, h: tH }), tb.x, 0, tb.z - .12);
    S3.prop(PR.oilLamp(), tb.x + .03, tH, tb.z - .17);
    const bw = S3.prop(PR.bowl({ r: .1, h: .06, food: 0x8a4a20, glaze: 0xb06a32 }), tb.x - .09, tH, tb.z - .04);
    S3.prop(PR.bread(), tb.x + .12, tH, tb.z - .02);
    M.tabla = +tH.toFixed(3); M.mattress = +mH.toFixed(3);
    const mo = await cast('mohammed', { seat: true, copy: 1 }), zou = await cast('zoubida', { seat: true, copy: 1 });
    const mAt = V(tb.x, 0, mF.z - .3);
    S3.add(mo, mAt.x, mAt.z, yawTo(mAt, S3.cam.position.clone().setY(0)) * .5);
    M.mo = memoPose('s07mo', mo, [mAt, mH], () => PO.crossLegged(mo, { seat: mH, lean: .18 }).map(e => +e.toFixed(3)));
    M.moSeat = +(PO.lowestOf(mo, ['root', 'thighL', 'thighR']) - mH).toFixed(3);
    const moBase = PO.snap(mo), sk = skirt(S3, mo, mH); M.skirt = [...sk.scale.toArray(), ...sk.position.toArray()].map(v => +v.toFixed(3));
    // Zoubida kneels at the tabla's left, turned toward it and a bit to the camera; the jar at her right-front
    const zAt = V(tb.x - .62, 0, tb.z + .05);
    // half toward the tabla, half toward the camera (her face reads in 3/4, not her scarf from behind)
    const yT = yawTo(zAt, tb), yC = yawTo(zAt, S3.cam.position.clone().setY(0)), yd = Math.atan2(Math.sin(yC - yT), Math.cos(yC - yT));
    S3.add(zou, zAt.x, zAt.z, yT + yd * .6);
    M.zou = memoPose('s07zou', zou, [zAt], () => PO.kneel(zou, { lean: .2 }).map?.(e => +e.toFixed(3)));
    M.zouLow = +PO.lowestOf(zou, Object.keys(zou.B)).toFixed(3);
    const zBase = PO.snap(zou), jp = IK.wpos(zou.B.upperArmR).setY(0).addScaledVector(dirW(zou, 0, 0, 1), .3).addScaledVector(dirW(zou, -1, 0, 0), .1);
    const jar = S3.prop(PR.jar(), jp.x, 0, jp.z), mouthJ = jar.localToWorld(jar.userData.mouth.clone());
    const bowlIn = bw.localToWorld(bw.userData.inside.clone()).add(V(0, .03, 0));
    const lapZ = PO.handPts(zou, 'R').palm, lapM = PO.handPts(mo, 'R').palm;
    return { actors: [mo, zou], faces: [[zou, 'zoubida', 2], [mo, null, 5]], M, mo, zou, moBase, zBase, mouthJ, bowlIn, lapZ, lapM, tabla, hp: S3.project(IK.wpos(mo.B.head)), zp: S3.project(IK.wpos(zou.B.head)) };
  },
  frame(lt, u, t, S, st) {
    const { mo, zou, M } = st, [a1] = S.L(1), [a3] = S.L(3);
    PO.apply(zou, st.zBase); PO.apply(mo, st.moBase);
    zou.group.visible = t < a3 - .5;
    // Zoubida: to the jar, forearm in (13 cm below the mouth), out with the strip, over the bowl, back to the lap
    const j = st.mouthJ, b = st.bowlIn, a = a1 + 2;
    const hz = path(t, [[a, st.lapZ], [a + 1.4, j.clone().add(V(0, .08, 0))], [a + 2.6, j.clone().add(V(0, -.08, 0))], [a + 4.6, j.clone().add(V(0, -.08, 0))], [a + 6, j.clone().add(V(0, .3, 0))], [a + 7.6, b.clone().add(V(0, .08, 0))], [a + 8.6, b], [a + 10, st.lapZ]]);
    if (t > a && t < a + 10) { zou.B.spine.rotation.x += .35 * clamp(sm(a, a + 1.4, t) - sm(a + 8.6, a + 10, t)); zou.group.updateMatrixWorld(true); M.reachZ = +PO.reach(zou, 'R', hz, { grip: .03 }).toFixed(3); }
    zou.B.head.rotation.x -= .3; zou.B.neck.rotation.x -= .12; zou.group.updateMatrixWorld(true);
    PO.look(zou, t < a || t > a + 10 ? IK.wpos(mo.B.head) : hz.clone().lerp(IK.wpos(mo.B.head), .5), .2);
    breathe(zou, t, 1, 1);
    // Mohammed: watches the jar, then eats (cycles of 4 s from the end of her serving: bowl, mouth, lap)
    const m = fp(mo, mo.S.face.mouth).addScaledVector(dirW(mo, 0, 0, 1), .05).add(V(0, -.02, 0)), e0 = a + 10.5;
    if (t > e0) {
      const c = (t - e0) % 4.5;
      const hp = path(c, [[0, st.lapM], [1, st.bowlIn], [1.5, st.bowlIn], [2.5, m], [3.1, m], [4.2, st.lapM]]);
      mo.B.spine.rotation.x += .12 * Math.sin(Math.PI * clamp(c / 2)); mo.group.updateMatrixWorld(true);
      M.reachM = +PO.reach(mo, 'R', hp, { grip: .03 }).toFixed(3);
    }
    PO.look(mo, t > e0 ? st.bowlIn.clone().add(V(0, .05, 0)) : t > a ? st.mouthJ : IK.wpos(zou.B.head), .6);
    breathe(mo, t, 1, 3);
  },
  view(lt, u, t) {
    const [hx, hy] = sh.st.hp, [zx, zy] = sh.st.zp, mx = (hx + zx) / 2;
    return [key(t, [[0, 900], [6, mx], [20, mx], [33, hx], [48, hx]]), key(t, [[0, 600], [6, (hy + zy) / 2 + 60], [20, (hy + zy) / 2 + 60], [33, hy + 50]]), key(t, [[0, 1.2], [6, 2.1], [20, 2.2], [33, 2.6], [48, 2.8]])];
  },
});

window.__s07 = sh;
export default make({ preload: all(sh), plate: 'chambre_jour', segs: [ac([0, 0], sh.fn), st('p03_khlii', [2, 0], 'push'), ac([3, 0], sh.fn)] });
