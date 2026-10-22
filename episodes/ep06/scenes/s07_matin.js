// s07: morning, plate chambre_jour (calibration borrowed from ep05 when ep06's cal.json has none). Mohammed, slate in hand, walks toward
// the door; Zoubida (standing, right) stops him with a raised palm; Q/A about the clothes (he claps, hopes; she answers); he glances at the
// chest for his djellaba; then he draws himself up, puffs his chest, stomps a small barbarian dance on the spot, and Zoubida calls for dignity.
// Contacts (st.M): feet on the floor, slate in his left palm, hands clapping at the chest, her palm raised in front of him.
import * as K from '../../../engine/core.js';
import * as PR from '../../../engine/props3d.js';
import * as PO from '../../../engine/poses.js';
import * as IK from '../../../engine/ik.js';
import { rest, idlePose, walkPose } from '../../../engine/rig3d.js';
import { travel } from '../../../engine/clips.js';
import { make, ac } from './_pt.js';
import { shot, all, breathe, V, role, CAL } from './_3d.js';
import { inHand } from './_props.js';
const { clamp, ease } = K;
const sm = (a, b, x) => ease(clamp((x - a) / (b - a)));
const dirW = (a, x, y, z) => V(x, y, z).normalize().applyAxisAngle(V(0, 1, 0), a.group.rotation.y);
const yawTo = (from, to) => Math.atan2(to.x - from.x, to.z - from.z);
const angMix = (a, b, k) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * k;

const CAL5 = await (await fetch(new URL('../../ep05/cal.json', import.meta.url))).json();
CAL['chambre_jour'] = CAL5.chambre_jour;
const SC = (await (await fetch(new URL('../timing.json', import.meta.url))).json()).find(s => s.id === 's07_matin');
const L = SC.lines.map(l => [l.start - SC.start, l.start - SC.start + l.dur]);
const LIGHT = { key: 0xffe0b0, keyI: 1.3, dir: [1.6, 3, 1], sky: 0xd8c0a0, ground: 0xc08850, fillI: 1.35, rim: 0xffd090, rimI: .45, rimDir: [2, 1.5, -2], shadow: .3, area: 3 };

const sh = shot({
  plate: 'chambre_jour', light: LIGHT,
  async build(S3) {
    const M = {}, F = (x, y) => S3.floorAt(x, y);
    const [mo, zou] = await Promise.all([role('mohammed'), role('zoubida')]);
    const cam = S3.cam.position.clone().setY(0);
    const p0 = F(560, 960), p1 = F(960, 930), zAt = F(1260, 900), chest = F(1500, 780);
    S3.add(mo, p0.x, p0.z, 0); S3.add(zou, zAt.x, zAt.z, angMix(yawTo(zAt, p1), yawTo(zAt, cam), .45));
    const slate = S3.prop(PR.louha());
    mo.group.position.set(p1.x, 0, p1.z); mo.group.updateMatrixWorld(true);   // final spot for the coverage projection
    return { actors: [mo, zou], M, mo, zou, p0, p1, zAt, chest, slate, faces: [[mo, 'mohammed', 5], [zou, 'zoubida', 3]] };
  },
  cover: [{ t: 0, size: 'W' }, { t: L[1][0], size: 'M', on: 'zoubida', dy: -120 }, { t: L[2][0], size: 'M', on: 'mohammed', dy: -60 },
    { t: L[3][0], size: 'CU', on: 'mohammed', dy: -20 }, { t: L[4][0], size: 'M', on: 'zoubida', dy: -120 }, { t: L[5][0], size: 'CU', on: 'mohammed', dy: -20 },
    { t: L[6][0], size: 'M', on: 'zoubida', dy: -120 }, { t: L[7][0], size: 'CU', on: 'mohammed', dy: -20 }, { t: L[8][0], size: 'M', on: 'zoubida', dy: -120 },
    { t: L[8][0] + 6, size: 'M', on: 'mohammed', dy: -60 }, { t: L[9][0], size: 'W' }, { t: L[9][0] + 7, size: 'M', on: 'mohammed', dy: -60 },
    { t: L[10][0], size: 'CU', on: 'zoubida', dy: -20 }],
  frame(lt, u, t, S, st, S3) {
    const { M, mo, zou, p0, p1, zAt, chest, slate } = st, k = mo.group.scale.y / 1.6;
    rest(zou.B); idlePose(zou.B, t + 1, 1); rest(mo.B); idlePose(mo.B, t, 1);
    // ---- Mohammed walks to her, stopped at p1
    const r = travel(mo, [[p0.x, p0.z], [p1.x, p1.z]], t, { t0: .5, speed: 1.0 });
    const dance = sm(L[9][0] + 5, L[9][0] + 6, t) * (1 - sm(L[9][0] + 10.5, L[9][0] + 11.2, t));
    const toZ = angMix(0, yawTo(p1, zAt), .5);
    if (r.done) mo.group.rotation.y = toZ;
    const pf = r.done ? 1 : 0;
    // zoubida: raised palm, stopping him (L0), explaining (L1)
    zou.group.updateMatrixWorld(true);
    const zc = IK.wpos(zou.B.chest), zf = dirW(zou, 0, 0, 1), zs = dirW(zou, -1, 0, 0);
    const stop = sm(L[0][0] + 2.8, L[0][0] + 3.6, t), talk = (t > L[1][0] && t < L[1][1]) || (t > L[4][0] && t < L[4][1]) || (t > L[6][0] && t < L[6][1]) || (t > L[8][0] && t < L[8][1]) || (t > L[10][0] && t < L[10][1]);
    const gest = stop * (1 - sm(L[1][0] - .2, L[1][0] + .4, t));
    const rh = zc.clone().addScaledVector(zf, .3).addScaledVector(zs, .08).add(V(0, .12 + (talk ? .05 * Math.sin(t * 4) : 0), 0));
    if (gest > 0 || talk) M.zR = +PO.reach(zou, 'R', IK.wpos(zou.B.handR).lerp(rh, Math.max(gest, talk ? .7 : 0)), { grip: .03 }).toFixed(3);
    PO.look(zou, IK.wpos(mo.B.head), .55); breathe(zou, t, 1, 2);
    // ---- Mohammed: slate in his left hand until the dance; claps; hopeful questions; glances at the chest
    if (t < L[2][0] - .5) {
      const c = IK.wpos(mo.B.chest);
      M.slate = +PO.reach(mo, 'L', c.clone().addScaledVector(dirW(mo, 1, 0, 0), .18 * k).addScaledVector(dirW(mo, 0, 0, 1), .08 * k).add(V(0, -.3 * k, 0)), { grip: .02 }).toFixed(3);
      slate.visible = true; inHand(slate, PO.handPts(mo, 'L').palm, V(0, 1, .1));
    } else slate.visible = false;
    const clap = sm(L[2][0] - .2, L[2][0] + .3, t) * (1 - sm(L[2][1] + 1, L[2][1] + 1.6, t));
    if (clap > 0) {
      const c = IK.wpos(mo.B.chest), f = dirW(mo, 0, 0, 1), s = dirW(mo, 1, 0, 0), g = (.04 + .1 * Math.abs(Math.cos(t * 9))) * k;
      M.cL = +PO.reach(mo, 'L', c.clone().addScaledVector(f, .34 * k).addScaledVector(s, g + .08 * k).add(V(0, .0, 0)), { grip: .02, pole: [.4, -.05, .05] }).toFixed(3);
      M.cR = +PO.reach(mo, 'R', c.clone().addScaledVector(f, .34 * k).addScaledVector(s, -g - .08 * k).add(V(0, .0, 0)), { grip: .02, pole: [-.4, -.05, .05] }).toFixed(3);
      mo.B.chest.rotation.x -= .06; mo.group.updateMatrixWorld(true);
    }
    const asking = [3, 5, 7].some(i => t > L[i][0] - .2 && t < L[i][1] + .3);
    if (asking && t > L[3][0]) {
      const c = IK.wpos(mo.B.chest), f = dirW(mo, 0, 0, 1), s = dirW(mo, 1, 0, 0);
      M.hL = +PO.reach(mo, 'L', c.clone().addScaledVector(f, .36 * k).addScaledVector(s, .12 * k).add(V(0, .02 * k, 0)), { grip: .02, pole: [.4, -.05, .05] }).toFixed(3);
      M.hR = +PO.reach(mo, 'R', c.clone().addScaledVector(f, .36 * k).addScaledVector(s, -.12 * k).add(V(0, .02 * k, 0)), { grip: .02, pole: [-.4, -.05, .05] }).toFixed(3);
    }
    // ---- the big moment: stands tall, chest out, stomps on the spot, arms up swaying
    if (t >= L[9][0]) {
      const tall = sm(L[9][0] + .3, L[9][0] + 1.4, t);
      mo.B.chest.rotation.x -= .16 * tall; mo.B.head.rotation.x -= .08 * tall; mo.group.updateMatrixWorld(true);
      if (dance > 0) {
        const ph = (t - L[9][0] - 5) * 1.6; walkPose(mo.B, ph, dance, { stride: .38, lift: .9, arms: 0 }); mo.group.updateMatrixWorld(true);
        mo.B.chest.rotation.x -= .16 * tall; mo.B.chest.rotation.z += Math.sin(ph * 6.28) * .08 * dance; mo.group.updateMatrixWorld(true);
        const c = IK.wpos(mo.B.chest), s = dirW(mo, 1, 0, 0), f = dirW(mo, 0, 0, 1), sw = Math.sin(ph * 6.28);
        M.dL = +PO.reach(mo, 'L', c.clone().addScaledVector(s, .3 * k).addScaledVector(f, .22 * k).add(V(0, (-.1 + .06 * sw) * k, 0)), { grip: .02, pole: [.4, -.05, .05] }).toFixed(3);
        M.dR = +PO.reach(mo, 'R', c.clone().addScaledVector(s, -.3 * k).addScaledVector(f, .22 * k).add(V(0, (-.1 - .06 * sw) * k, 0)), { grip: .02, pole: [-.4, -.05, .05] }).toFixed(3);
      }
    }
    const gl = t > L[7][0] - .3 && t < L[7][1] + .6;
    PO.look(mo, gl ? V(chest.x, 1.0, chest.z) : t > L[9][0] && t < L[10][0] ? S3.cam.position : IK.wpos(zou.B.head), .5);
    breathe(mo, t, 1, 3);
  },
});
window.__s07 = { sh };
export default make({ preload: all(sh), plate: 'chambre_jour', segs: [ac([0, 0], sh.fn)] });
