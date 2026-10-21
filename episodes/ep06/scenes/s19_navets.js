// s19: supper. L0 Zoubida kneels, sets the bowl of meat and turnips on the low round table: "Voudrais-tu te mettre sur ton
// séant ?"; he lies, then sits up (lie blended into cross-legged, ep05 s20 trick). L1 he grimaces at the turnips, then eats
// with hunger: right hand tabla bowl -> mouth cycles (ep05 s07 loop). Plate chambre_jour.
// Contacts (st.M): seated on the mattress top (crossLegged), Zoubida's knees on the floor, bowl on the tabla, hand in the bowl and at the mouth.
import * as K from '../../../engine/core.js';
import * as PO from '../../../engine/poses.js';
import * as IK from '../../../engine/ik.js';
import * as PR from '../../../engine/props3d.js';
import { make, ac } from './_pt.js';
import { shot, all, breathe, V, role, memoPose, skirt, blend, CAL } from './_3d.js';
const { clamp, ease } = K;
const sm = (a, b, x) => ease(clamp((x - a) / (b - a)));
const yawTo = (from, to) => Math.atan2(to.x - from.x, to.z - from.z);
const dirW = (a, x, y, z) => V(x, y, z).normalize().applyAxisAngle(V(0, 1, 0), a.group.rotation.y);
const fp = (a, p) => a.B.head.localToWorld(V(p[0], p[1] - a.S.head, p[2]));
const path = (t, ks) => { if (t <= ks[0][0]) return ks[0][1].clone(); for (let i = 1; i < ks.length; i++) if (t <= ks[i][0]) return ks[i - 1][1].clone().lerp(ks[i][1], ease((t - ks[i - 1][0]) / (ks[i][0] - ks[i - 1][0]))); return ks.at(-1)[1].clone(); };

const SC = (await (await fetch(new URL('../timing.json', import.meta.url))).json()).find(s => s.id === 's19_navets');
const L = SC.lines.map(l => [l.start - SC.start, l.start - SC.start + l.dur]);
const [a0, a1] = L.map(l => l[0]);
CAL.chambre_jour = CAL.chambre_jour || { h: 1.1, horizon: 425, fov: 50 };
const LIGHT_JOUR = { key: 0xffe0b0, keyI: 1.3, dir: [1.6, 3, 1], sky: 0xd8c0a0, ground: 0xc08850, fillI: 1.35, rim: 0xffd090, rimI: .45, rimDir: [2, 1.5, -2], shadow: .3, area: 3 };

const sh = shot({
  plate: 'chambre_jour', light: { ...LIGHT_JOUR, keyI: 1.4 },
  async build(S3, cal) {
    const M = {}, hz = cal.horizon, tb = S3.floorAt(862, 747), tH = cal.h * (1 - (676 - hz) / (747 - hz)), mF = S3.floorAt(862, 685), mH = cal.h * (1 - (644 - hz) / (685 - hz));
    S3.prop(PR.tabla({ r: .25, h: tH }), tb.x, 0, tb.z - .12);
    S3.prop(PR.oilLamp(), tb.x + .03, tH, tb.z - .17);
    const bw = S3.prop(PR.bowl({ r: .1, h: .06, food: 0x8a4a20, glaze: 0xb06a32 }), tb.x - .09, tH, tb.z - .04);
    const mo = await role('mohammed', { seat: true }), zou = await role('zoubida', { seat: true }), cam = S3.cam.position.clone().setY(0);
    const mAt = V(tb.x, 0, mF.z - .36), ySit = yawTo(mAt, cam) * .5;
    S3.add(mo, mAt.x, mAt.z, ySit);
    M.sit = memoPose('s19sit', mo, [mAt, mH], () => PO.crossLegged(mo, { seat: mH, lean: .16 }).map(e => +e.toFixed(3)));
    const sitS = PO.snap(mo), sk = skirt(S3, mo, mH);
    mo.group.rotation.y = Math.PI / 2; mo.group.updateMatrixWorld(true);
    M.lie = memoPose('s19lie', mo, [mAt, mH], () => { const r = PO.lie(mo, { top: mH, turn: -.35, pillow: .07 }); return { pil: r.pillowAt.toArray() }; });
    const lieS = PO.snap(mo), pil = S3.prop(PR.cushion({ w: .4, d: .3, h: .07, col: 0xe0d0a8 }), M.lie.pil[0], mH, M.lie.pil[2]);
    const zAt = V(tb.x - .95, 0, tb.z - .22), yT = yawTo(zAt, tb), yC = yawTo(zAt, cam), yd = Math.atan2(Math.sin(yC - yT), Math.cos(yC - yT));
    S3.add(zou, zAt.x, zAt.z, yT + yd * .8);   // near 3/4 to camera: in profile her front hair lock reads as a black bar
    M.zou = memoPose('s19zou', zou, [zAt], () => PO.kneel(zou, { lean: .2 }).map?.(e => +e.toFixed(3)));
    const zBase = PO.snap(zou);
    const bowlIn = bw.localToWorld(bw.userData.inside.clone()).add(V(0, .03, 0));
    mo.group.rotation.y = ySit; mo.group.updateMatrixWorld(true);
    const lapM = IK.wpos(mo.B.thighR).add(V(0, .04, .14)), tbV = V(tb.x, tH, tb.z);
    return { pil, actors: [mo, zou], faces: [[zou, 'zoubida', 2, { sad: .2 }], [mo, null, 5, (lt, t) => t < a1 + 4 ? { sad: .9, lid: .15 } : (Math.sin(t * 3) > .5 ? { open: .5 } : {})]], M, mo, zou, sitS, lieS, sk, zBase, ySit, bw, bowlIn, lapM, tbV, tb, zAt };
  },
  cover: [{ t: 0, size: 'W' }, { t: .5, size: 'M', on: 'zoubida', dx: 80 }, { t: a0 + 3.5, size: 'W' }, { t: a1, size: 'M', on: 'mohammed', dx: -40 },
    { t: a1 + 3.5, size: 'CU', on: 'mohammed' }, { t: a1 + 9, size: 'M', on: 'mohammed' }, { t: a1 + 14, size: 'CU', on: 'mohammed' }],
  frame(lt, u, t, S, s) {
    const { mo, zou, M } = s;
    // he sits up as the bowl comes down
    const up = sm(a0 + 1.6, a0 + 3.2, t);
    mo.group.rotation.y = Math.PI / 2 + (s.ySit - Math.PI / 2) * up; mo.group.updateMatrixWorld(true);
    blend(mo, s.lieS, s.sitS, up);
    s.sk.visible = up > .95; if (s.sk.userData.hem) s.sk.userData.hem.visible = up > .95;
    // bowl on the tabla from the moment Zoubida sets it down
    s.bw.visible = t > a0 + .8; s.pil.visible = up < .5;
    // Zoubida: kneeling; leans over and sets the bowl down at the start, then watches him
    PO.apply(zou, s.zBase);
    const lean = Math.sin(Math.PI * clamp((t - .2) / 1.4)) * .3 * (t < 2 ? 1 : 0);
    zou.B.spine.rotation.x += lean; zou.B.head.rotation.x -= .3; zou.B.neck.rotation.x -= .12; zou.group.updateMatrixWorld(true);
    if (t < a0 + 1.2) M.zr = +PO.reach(zou, 'R', path(t, [[0, IK.wpos(zou.B.handR)], [.6, s.bowlIn.clone().add(V(0, .05, 0))], [1.2, s.bowlIn.clone().add(V(0, .05, 0))]]), { grip: .03 }).toFixed(3);
    PO.look(zou, IK.wpos(mo.B.head), .4); breathe(zou, t, 1, 1);
    // Mohammed eats: bowl -> mouth cycles after a grimace at the turnips (cycles of 4.5 s from a1+4)
    if (up > .95) {
      const m = fp(mo, mo.S.face.mouth).addScaledVector(dirW(mo, 0, 0, 1), .05).add(V(0, -.02, 0)), e0 = a1 + 3.5;
      if (t > e0) {
        const c = ((t - e0) * (t - e0 > 8 ? 1.25 : 1)) % 4.5;
        const hp = path(c, [[0, s.lapM], [1, s.bowlIn], [1.5, s.bowlIn], [2.5, m], [3.1, m], [4.2, s.lapM]]);
        mo.B.spine.rotation.x += .12 * Math.sin(Math.PI * clamp(c / 2)); mo.group.updateMatrixWorld(true);
        M.reachM = +PO.reach(mo, 'R', hp, { grip: .03 }).toFixed(3);
      } else if (t > a1 + 1) { mo.B.head.rotation.z += Math.sin(t * 9) * .05; mo.B.head.rotation.x -= .1; mo.group.updateMatrixWorld(true); }   // grimace: head back
      PO.look(mo, s.bowlIn.clone().add(V(0, .05, 0)), .6);
    }
    breathe(mo, t, 1, 0);
  },
});

window.__s19 = sh;
export default make({ preload: all(sh), plate: 'chambre_jour', segs: [ac([0, 0], sh.fn)] });
