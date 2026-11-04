// s22 the féerie. b081 the Msid façade ablaze (msid_facade, slow push ≤ 1.4 m): father and son come round the corner
// from the right foreground toward the lit door; the boy, the big candle hugged in both arms, nearly drops it (it tips,
// he catches it). b082 inside (msid_feerie, push ≤ 0.5 m): the fqih in his festive clothes cross-legged on the estrade,
// the pupils cross-legged on the mat before him in a fan, rocking as they chant; the chandeliers flicker with the chant.
// b083 Mohammed (standing copy) hands the fqih his candle (insert: the pile of candles). b084 the heat: he pushes back
// his hood, kid1 beside him (insert: the nosebleed). b085 CU: he stops chanting and looks up at the dancing flames.
import * as THREE from 'three';
import * as K from '../../../engine/core.js';
import * as PO from '../../../engine/poses.js';
import { shot, role, memoPose, breathe } from './_3d.js';
import { beatScene, lines, idle, at, front, dirW, orient, heightAt, sm, V, yawTo } from '../lib/beatscene.js';
import { walk } from '../lib/acts.js';
import { cierge } from './s21_babouches.js';
import { c } from '../../../engine/core.js';

const L = lines('s22_feerie');
const D2 = L[2][1] - L[2][0], GIVE = [L[2][0] + .55 * D2, L[2][0] + .7 * D2];
export const CHAND = [[560, 500], [960, 470], [1310, 500]];   // painted chandeliers, canvas px
export const chant = (t, s) => ({ open: .12 + .22 * Math.max(0, K.noise(t * 5, s)) });

/** the Msid room: the fqih on the estrade, five pupils + Mohammed cross-legged on the mat in a fan facing him (three-quarter to us) */
export async function msidCast(S3, { fqih = 'fete', moCostume = 'fete' } = {}) {
  const cam = S3.cam.position.clone().setY(0);
  const fq = await role('fqih', { seat: true, costume: fqih });
  const eh = heightAt(S3, 960, 710, 630), edge = S3.floorAt(960, 710);
  const fp = edge.clone().add(edge.clone().sub(cam).setY(0).normalize().multiplyScalar(.4));
  S3.add(fq, fp.x, fp.z, yawTo(fp, cam));
  memoPose('msid-fq', fq, [eh], () => PO.crossLegged(fq, { seat: eh, lean: .08 }));
  const SEATS = [['grand1', 640, 790], ['grand2', 1260, 790], ['kid2', 560, 900], ['kid3', 1380, 900], ['kid1', 1060, 960], ['mohammed', 850, 960]];
  const kids = [];
  for (const [n, x, y] of SEATS) {
    const a = await role(n, { seat: true, ...(n === 'mohammed' ? { costume: moCostume } : {}) });
    const p = S3.floorAt(x, y); S3.add(a, p.x, p.z, yawTo(p, fp.clone().lerp(cam, n === 'mohammed' ? .75 : .45)));
    memoPose('msid-' + n, a, [x, y], () => PO.crossLegged(a, { seat: 0, lean: .12 }));
    kids.push(a);
  }
  const P = { fq: PO.snap(fq) }; kids.forEach(a => { P[a.name] = PO.snap(a); });
  const sup = S3.qa?.supports || {}; sup.fqih = eh; kids.forEach(a => { sup[a.name] = 0; });
  return { fq, kids, mo: kids.find(a => a.name === 'mohammed'), k1: kids.find(a => a.name === 'kid1'), P, eh, fp, cam };
}
/** pose the room: everyone back in his seat, breathing, the pupils rocking with the chant (amt 0 = still) */
export function msidPose(st, t, amt = 1) {
  const { fq, kids, P } = st;
  PO.apply(fq, P.fq); breathe(fq, t, 1, 5);
  kids.forEach((a, i) => {
    PO.apply(a, P[a.name]); breathe(a, t, 1, i);
    const r = amt * .09 * Math.sin(t * 3.4 + i * .5);
    a.B.spine.rotation.x += r; a.B.spine.updateWorldMatrix(false, true);
  });
}
/** the chandeliers breathe with the chant */
export function flicker(t, k = 1) {
  c.save(); c.globalCompositeOperation = 'screen';
  CHAND.forEach(([x, y], i) => {
    const a = k * (.14 + .08 * K.noise(t * 6, i * 7) + .04 * Math.sin(t * 3.4 + i));
    const g = c.createRadialGradient(x, y, 0, x, y, 380); g.addColorStop(0, `rgba(255,200,120,${a})`); g.addColorStop(1, 'rgba(255,200,120,0)');
    c.fillStyle = g; c.fillRect(x - 380, y - 380, 760, 760);
  });
  c.restore();
}

const fa = shot({
  plate: 'msid_facade',
  light: { keyI: .7 },
  move: (lt, u, t) => ({ dolly: 1.4 * K.ease(sm(L[0][0] - .5, L[0][1] + .5, t)) }),
  async build(S3) {
    const pf = await role('father'), mo = await role('mohammed', { costume: 'fete' });
    const door = S3.floorAt(915, 800);
    const a0 = S3.floorAt(1560, 1070), a1 = S3.floorAt(1040, 880);
    const d = a1.clone().sub(a0).setY(0).normalize(), left = V(d.z, 0, -d.x);
    S3.add(pf, a1.x - left.x * .35, a1.z - left.z * .35, yawTo(a1, door)); S3.add(mo, a1.x + left.x * .35, a1.z + left.z * .35, yawTo(a1, door));
    const cd = S3.prop(cierge()); cd.userData.qa = { grip: true, hand: 'LR', owner: 'mohammed' };
    return { actors: [mo, pf], mo, pf, a0, a1, left, door, cd, faces: [[mo, null, 3], [pf, null, 2]] };
  },
  frame(lt, u, t, S, st) {
    const { mo, pf, a0, a1, left, door, cd } = st;
    idle(mo, t, 3); idle(pf, t, 2);
    const t0 = L[0][0] - .6, t1 = L[0][1] - 1.2;
    walk(pf, a0.clone().addScaledVector(left, -.35), a1.clone().addScaledVector(left, -.35), t0, t1, t, { cps: 1.7 });
    walk(mo, a0.clone().addScaledVector(left, .35), a1.clone().addScaledVector(left, .35), t0, t1, t, { cps: 2.5 });
    const km = mo.group.scale.y / 1.1;
    // the candle hugged upright; at ~45 % it tips out of his arms and he catches it
    const tp = Math.max(0, Math.sin(Math.PI * K.clamp((t - (L[0][0] + .45 * (L[0][1] - L[0][0]))) / .9)));
    const chest = front(mo, 'chest', (.14 + .1 * tp) * km, .04 * tp, (-.1 - .08 * tp) * km);
    orient(cd, chest, V(0, 1, 0).lerp(dirW(mo, 0, 0, 1), .9 * tp).normalize(), dirW(mo, 0, 0, 1));
    PO.reach(mo, 'L', chest.clone().addScaledVector(dirW(mo, 1, 0, 0), .04).add(V(0, .03 - .05 * tp, 0)), { grip: .02 });
    PO.reach(mo, 'R', chest.clone().addScaledVector(dirW(mo, -1, 0, 0), .04).addScaledVector(dirW(mo, 0, 0, 1), .08 * tp), { grip: .02 });
    if (tp > 0) { mo.B.spine.rotation.x += .25 * tp; mo.B.spine.updateWorldMatrix(false, true); }
    PO.look(mo, tp > .1 ? cd.position.clone() : door.clone().setY(2), .7); PO.look(pf, tp > .3 ? at(mo, 'head') : door.clone().setY(1.6), .5);
  },
});

const fe = shot({
  plate: 'msid_feerie',
  light: { keyI: .9 },
  move: (lt, u, t) => ({ dolly: .45 * K.ease(sm(L[1][0] - .3, L[1][1], t)) }),
  async build(S3) {
    const st = await msidCast(S3);
    // b083: the boy standing before the estrade, the candle up to the fqih
    const ms = await role('mohammed', { costume: 'fete', copy: '_s' }); ms.name = 'mohammed_s';
    const pm = st.fp.clone().add(st.cam.clone().sub(st.fp).setY(0).normalize().multiplyScalar(.95)).add(V(.25, 0, 0));
    S3.add(ms, pm.x, pm.z, yawTo(pm, st.fp.clone().lerp(st.cam, .25)));
    const cd = S3.prop(cierge()); cd.userData.qa = { grip: true, hand: 'LR', owner: 'mohammed_s' };
    const up = S3.floorAt(CHAND[1][0], 760).add(V(0, 2.4, 0));
    return { ...st, ms, cd, up, actors: [st.fq, ...st.kids, ms], faces: [[st.fq, null, 5, (lt, t) => chant(t, 5)], ...st.kids.map((a, i) => [a, null, i, (lt, t) => a.name === 'mohammed' && t > L[4][0] ? { open: 0 } : chant(t, i)]), [ms, null, 3]] };
  },
  frame(lt, u, t, S, st) {
    const { fq, mo, k1, ms, cd, up } = st;
    const b83 = t >= L[2][0] - .1 && t < L[3][0] - .1;
    msidPose(st, t, b83 ? .4 : 1);
    mo.group.visible = !b83; ms.group.visible = b83; cd.visible = b83;
    if (b83) {
      idle(ms, t, 3);
      const g = sm(GIVE[0], GIVE[1], t), k = ms.group.scale.y / 1.1, kf = fq.group.scale.y / 1.6;
      const held = front(ms, 'chest', .16 * k, 0, -.08 * k), fqh = front(fq, 'chest', .3 * kf, 0, -.12 * kf);
      const p = held.clone().lerp(fqh, sm(GIVE[0] - .8, GIVE[0], t) * .45 + .55 * g);
      orient(cd, p, V(0, 1, 0), dirW(ms, 0, 0, 1));
      if (g < 1) { PO.reach(ms, 'L', p.clone().addScaledVector(dirW(ms, 1, 0, 0), .04), { grip: .02 }); PO.reach(ms, 'R', p.clone().addScaledVector(dirW(ms, -1, 0, 0), .04), { grip: .02 }); }
      if (g > 0) PO.reach(fq, 'R', p.clone().addScaledVector(dirW(fq, -1, 0, 0), .04), { grip: .02 });
      PO.look(ms, at(fq, 'head'), .7); PO.look(fq, at(ms, 'head'), .6);
    } else {
      // b084 the heat: his right hand pushes the hood back off his head, then wipes his brow
      const h = sm(L[3][0] + .3, L[3][0] + 1.1, t) * (1 - sm(L[3][1] - .6, L[3][1], t));
      if (h > 0) { const k = mo.group.scale.y / 1.1; PO.reach(mo, 'R', front(mo, 'head', .06 * k, .02, .02 * k).lerp(front(mo, 'head', -.06 * k, .03, .1 * k), .5 + .5 * Math.sin(t * 2)), { grip: .04 }); }
      // b085: he stops chanting and lifts his eyes to the flames
      const lk = sm(L[4][0] - .2, L[4][0] + 1, t);
      if (lk > 0) { mo.B.spine.rotation.x -= .1 * lk; mo.B.spine.updateWorldMatrix(false, true); }
      PO.look(mo, at(fq, 'head').lerp(up, lk), .5 + .4 * lk);
      PO.look(k1, t > L[3][0] && t < L[4][0] ? at(mo, 'head') : at(fq, 'head'), .5);
    }
  },
  over(lt, u, t) { flicker(t); },
});

export { fa, fe };
export default beatScene('s22_feerie', {
  shots: { fa, fe },
  plan: {
    b081: { shot: 'fa', size: 'W' },
    b082: { shot: 'fe', size: 'W' },
    b083: { shot: 'fe', size: 'M', on: 'mohammed_s', insAt: .78 },
    b084: { shot: 'fe', size: 'M', on: 'mohammed', insAt: .55 },
    b085: { shot: 'fe', size: 'CU', on: 'mohammed' },
  },
});
