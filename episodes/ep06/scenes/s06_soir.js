// s06: evening, lamp-lit room (plate ep03/chambre_nuit_lampe, same layout as chambre_jour so chambre_jour's calibration is reused).
// shotA (L0-L3): Mohammed walks in from the right, tired, then boasts arms wide between his father (cross-legged, right) and Zoubida
// (kneeling, left); the father congratulates him and turns to Zoubida. shotB (L4-L5): night, Mohammed on the back mattress sits up in
// his sleep shouting (eyes closed), Zoubida lays him back, he sits up again for "Frottez ! Plus vite !".
// Contacts (st.M): father/Zoubida seated on the floor, Mohammed's hips on the mattress top (lie/crossLegged), her palms on his chest/shoulder.
import * as K from '../../../engine/core.js';
import * as PR from '../../../engine/props3d.js';
import * as PO from '../../../engine/poses.js';
import * as IK from '../../../engine/ik.js';
import { rest, idlePose } from '../../../engine/rig3d.js';
import { travel } from '../../../engine/clips.js';
import { make, ac } from './_pt.js';
import { shot, all, breathe, V, role, memoPose, skirt, blend, CAL } from './_3d.js';
const { clamp, ease } = K;
const sm = (a, b, x) => ease(clamp((x - a) / (b - a)));
const dirW = (a, x, y, z) => V(x, y, z).normalize().applyAxisAngle(V(0, 1, 0), a.group.rotation.y);
const yawTo = (from, to) => Math.atan2(to.x - from.x, to.z - from.z);
const angMix = (a, b, k) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * k;

// the two chambre plates share a layout; ep06 cal.json has no entry for them: borrow ep05's
const CAL5 = await (await fetch(new URL('../../ep05/cal.json', import.meta.url))).json();
CAL['chambre_jour'] = CAL5.chambre_jour; CAL['ep03/chambre_nuit_lampe'] = CAL5.chambre_jour;

const SC = (await (await fetch(new URL('../timing.json', import.meta.url))).json()).find(s => s.id === 's06_soir');
const L = SC.lines.map(l => [l.start - SC.start, l.start - SC.start + l.dur]);
const LIGHT = { key: 0xffc880, keyI: 1.25, dir: [-.3, .7, 1], sky: 0x7a86a8, ground: 0x5a4a3c, fillI: 1.2, rim: 0x9ab0ff, rimI: .5, rimDir: [2, 2, -3], shadow: .3 };
const PLATE = 'ep03/chambre_nuit_lampe';

// ------------------------------------------------------------------------------------ shotA: the family
const shotA = shot({
  plate: PLATE, light: LIGHT,
  async build(S3) {
    const M = {}, F = (x, y) => S3.floorAt(x, y);
    const [mo, fa, zou] = await Promise.all([role('mohammed'), role('father', { seat: true }), role('zoubida', { seat: true })]);
    const cam = S3.cam.position.clone().setY(0);
    const spot = F(870, 950), start = F(1950, 930), faAt = F(1200, 860), zAt = F(540, 960);
    S3.add(mo, start.x, start.z, 0);
    S3.add(fa, faAt.x, faAt.z, angMix(yawTo(faAt, spot), yawTo(faAt, cam), .4));
    M.fa = memoPose('s06fa', fa, [faAt], () => PO.crossLegged(fa, { seat: 0, lean: .1 }).map(e => +e.toFixed(3)));
    const faBase = PO.snap(fa); skirt(S3, fa, 0);
    S3.add(zou, zAt.x, zAt.z, angMix(yawTo(zAt, spot), yawTo(zAt, cam), .4));
    M.zou = memoPose('s06zou', zou, [zAt], () => PO.kneel(zou, { lean: .1 }) ?? 0);
    const zBase = PO.snap(zou);
    // the boaster's final spot is used for coverage (he walks there in the first seconds)
    mo.group.position.set(spot.x, 0, spot.z); mo.group.updateMatrixWorld(true);
    return { actors: [mo, fa, zou], M, mo, fa, zou, spot, start, faBase, zBase,
      faces: [[mo, 'mohammed', 5], [fa, 'father', 2], [zou, 'zoubida', 3]] };
  },
  cover: [{ t: 0, size: 'W' }, { t: L[1][0], size: 'M', on: 'mohammed', dy: -60 }, { t: L[2][0], size: 'M', on: 'father', dy: -40 },
    { t: L[2][0] + 5, size: 'M', on: 'zoubida', dy: -40 }, { t: L[3][0], size: 'CU', on: 'father', dy: -20 }, { t: L[3][0] + 4.6, size: 'W' }],
  frame(lt, u, t, S, st, S3) {
    const { M, mo, fa, zou, spot, start, faBase, zBase } = st;
    PO.apply(fa, faBase); PO.apply(zou, zBase);
    rest(mo.B); idlePose(mo.B, t, 1);
    // ---- Mohammed walks in from the right, slumped, then straightens up proud
    const r = travel(mo, [[start.x, start.z], [spot.x, spot.z]], t, { t0: .8, speed: 1.0 });
    if (r.done) { mo.group.rotation.y = 0; rest(mo.B); idlePose(mo.B, t, 1); mo.group.updateMatrixWorld(true); }
    const tired = 1 - sm(L[1][0] - .5, L[1][0], t);
    if (r.done || t < .8) { mo.B.spine.rotation.x += .18 * tired; mo.B.head.rotation.x += .12 * tired; mo.group.updateMatrixWorld(true); }
    // ---- boast: arms wide, chest out, turning to father then Zoubida, ends at L1 end
    const w = sm(L[1][0] + .3, L[1][0] + 1.3, t) * (1 - sm(L[1][1] - .3, L[1][1] + .6, t)), k = mo.group.scale.y / 1.6;
    if (w > 0) {
      const c = IK.wpos(mo.B.chest), s = dirW(mo, 1, 0, 0), f = dirW(mo, 0, 0, 1), fl = Math.sin(t * 3);
      mo.B.chest.rotation.x -= .12 * w; mo.B.head.rotation.x -= .08 * w; mo.group.updateMatrixWorld(true);
      M.mL = +PO.reach(mo, 'L', c.clone().addScaledVector(s, .3 * k).addScaledVector(f, .3 * k).add(V(0, (.02 + .06 * fl) * k, 0)), { grip: .02 }).toFixed(3);
      M.mR = +PO.reach(mo, 'R', c.clone().addScaledVector(s, -.3 * k).addScaledVector(f, .3 * k).add(V(0, (.02 - .06 * fl) * k, 0)), { grip: .02 }).toFixed(3);
    }
    const toF = sm(L[1][0] + 2, L[1][0] + 3, t) * (1 - sm(L[1][0] + 4.5, L[1][0] + 5.5, t));
    const gaze = t < L[1][0] ? IK.wpos(fa.B.head) : (toF > .5 ? IK.wpos(fa.B.head) : IK.wpos(zou.B.head));
    if (r.done) PO.look(mo, t < L[1][0] + 1.5 || t > L[1][1] ? S3.cam.position : gaze, .55);
    // ---- father: listens amused, then congratulates (right hand opens toward Mohammed), turns to Zoubida
    const cg = sm(L[3][0] + .3, L[3][0] + 1, t) * (1 - sm(L[3][0] + 3.4, L[3][0] + 4.2, t));
    if (cg > 0) { const c = IK.wpos(fa.B.chest); M.faR = +PO.reach(fa, 'R', c.clone().addScaledVector(dirW(fa, 0, 0, 1), .32).addScaledVector(dirW(fa, -1, 0, 0), .15).add(V(0, .08 + .04 * Math.sin(t * 4), 0)), { grip: .02 }).toFixed(3); }
    PO.look(fa, t > L[3][0] + 3 ? IK.wpos(zou.B.head) : IK.wpos(mo.B.head), .6); breathe(fa, t, 1, 1);
    PO.look(zou, IK.wpos(mo.B.head), .6); breathe(zou, t, 1, 2);
  },
});

// ------------------------------------------------------------------------------------ shotB: the night
const shotB = shot({
  plate: PLATE, light: { ...LIGHT, keyI: .9, fillI: 1.0 },
  async build(S3, cal) {
    const M = {}, hz = cal.horizon;
    const tb = S3.floorAt(862, 747), mF = S3.floorAt(862, 685), mH = cal.h * (1 - (644 - hz) / (685 - hz));
    const [mo, zou] = await Promise.all([role('mohammed', { seat: true }), role('zoubida', { seat: true })]);
    const cam = S3.cam.position.clone().setY(0), mAt = V(tb.x, 0, mF.z - .36), ySit = yawTo(mAt, cam) * .5;
    S3.add(mo, mAt.x, mAt.z, ySit);
    M.sit = memoPose('s06sit', mo, [mAt, mH], () => PO.crossLegged(mo, { seat: mH, lean: .12 }).map(e => +e.toFixed(3)));
    const sitS = PO.snap(mo), sk = skirt(S3, mo, mH);
    mo.group.rotation.y = Math.PI / 2; mo.group.updateMatrixWorld(true);
    M.lie = memoPose('s06lie', mo, [mAt, mH], () => { const r = PO.lie(mo, { top: mH, turn: -.35, pillow: .07 }); return { low: +(r.low - mH).toFixed(3), heel: r.heel, pil: r.pillowAt.toArray() }; });
    const lieS = PO.snap(mo), pil = S3.prop(PR.cushion({ w: .4, d: .3, h: .07, col: 0xe0d0a8 }), M.lie.pil[0], mH, M.lie.pil[2]);
    const zAt = mAt.clone().add(V(.9, 0, .5));
    S3.add(zou, zAt.x, zAt.z, angMix(yawTo(zAt, mAt), yawTo(zAt, cam), .65))   // 3/4 to camera: in profile her front hair lock reads as a black blob;
    M.zou = memoPose('s06zou2', zou, [zAt], () => PO.kneel(zou, { lean: .1 }) ?? 0);
    // leave Mohammed seated for the coverage projection
    PO.apply(mo, sitS); mo.group.rotation.y = ySit; mo.group.updateMatrixWorld(true);
    return { actors: [mo, zou], M, mo, zou, sitS, lieS, sk, pil, ySit, zBase: PO.snap(zou), zAt, mAt, hp: 0,
      faces: [[mo, 'mohammed', 5, (lt, t) => ({ blink: 1, ...(t < L[5][0] - .1 && t > L[4][0] + 2 ? { open: Math.abs(Math.sin(t * 9)) > .4 ? .66 : .2 } : t < L[4][0] + 2 ? { open: 0 } : {}) })], [zou, 'zoubida', 3]] };
  },
  cover: [{ t: L[4][0], size: 'W' }, { t: L[4][0] + 3, size: 'M', on: 'mohammed', dy: -40 }, { t: L[4][0] + 8, size: 'M', on: 'zoubida', dy: -40 },
    { t: L[4][0] + 11, size: 'W' }, { t: L[5][0], size: 'CU', on: 'mohammed', dy: -10 }],
  frame(lt, u, t, S, st, S3) {
    const { M, mo, zou, sitS, lieS, sk, zBase, ySit } = st;
    PO.apply(zou, zBase);
    // up = how far he sits (0 lying .. 1 sitting): up on "Pendant mon sommeil", laid back at the end of L4, up again on L5
    const upA = sm(L[4][0] + 3, L[4][0] + 4.4, t) * (1 - sm(L[4][0] + 8.8, L[4][0] + 11, t)), upB = sm(L[5][0] - .5, L[5][0] + .5, t), up = Math.max(upA, upB);
    mo.group.rotation.y = Math.PI / 2 + (ySit - Math.PI / 2) * up; mo.group.updateMatrixWorld(true);
    blend(mo, lieS, sitS, up);
    sk.visible = up > .95; if (sk.userData.hem) sk.userData.hem.visible = up > .95; st.pil.visible = up < .5 ? true : true;
    if (up > .9) {   // shouting orders: right fist up and pumping, left hand pointing out, head thrown forward
      const c = IK.wpos(mo.B.chest), f = dirW(mo, 0, 0, 1), s = dirW(mo, 1, 0, 0), k = mo.group.scale.y / 1.6, sw = Math.sin(t * 6);
      M.mR = +PO.reach(mo, 'R', c.clone().addScaledVector(f, .3 * k).addScaledVector(s, -.28 * k).add(V(0, (.18 + .1 * sw) * k, 0)), { grip: .02 }).toFixed(3);
      M.mL = +PO.reach(mo, 'L', c.clone().addScaledVector(f, .35 * k).addScaledVector(s, .3 * k).add(V(0, .05 * k, 0)), { grip: .02 }).toFixed(3);
      mo.B.chest.rotation.x += .05 * sw; mo.group.updateMatrixWorld(true);
    }
    breathe(mo, t, 2, 3);
    // Zoubida leans in and lays him back: both palms on his chest/shoulder from L4+8 to L4+11.4
    const p = sm(L[4][0] + 8, L[4][0] + 8.8, t) * (1 - sm(L[4][0] + 11.2, L[4][0] + 12, t));
    if (p > 0) {
      zou.B.spine.rotation.x += .35 * p; zou.group.updateMatrixWorld(true);
      const c = IK.wpos(mo.B.chest), s = dirW(mo, 1, 0, 0);
      M.zR = +PO.reach(zou, 'R', IK.wpos(zou.B.handR).lerp(c.clone().addScaledVector(s, -.1), p), { grip: .04 }).toFixed(3);
      M.zL = +PO.reach(zou, 'L', IK.wpos(zou.B.handL).lerp(c.clone().addScaledVector(s, .12).add(V(0, .03, 0)), p), { grip: .04 }).toFixed(3);
    }
    PO.look(zou, IK.wpos(mo.B.head), .3); breathe(zou, t, 1, 2);
  },
});
window.__s06 = { shotA, shotB };
export default make({ preload: all(shotA, shotB), plate: PLATE, segs: [ac([0, 0], shotA.fn), ac([4, 0], shotB.fn)] });
