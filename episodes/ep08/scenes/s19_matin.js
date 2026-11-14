// s19 the morning after. chambre_jour, Mohammed in bed (lying, centre-right). Shot ch1 (b133–b138): the father kneels at
// his side, shakes him awake (hand on his shoulder), feels his forehead; Zoubida stands on the left, chops the air, palms up.
// Shot ch2 (b139, b140, b142): the father standing by the door (left), calm, one raised hand; Zoubida all gesture.
// b141 patio cutaway: the father crosses toward the street door.
import * as PO from '../../../engine/poses.js';
import * as PR from '../../../engine/props3d.js';
import { staged } from '../lib/autostage.js';
import { bareHead } from '../lib/fix8_g5.js';
import { lieOnBed, pillowUnder } from '../lib/fix8_lie.js';
import { handTo } from '../lib/fix8b.js';
import { beatScene, lines, sm, at, front, V } from '../lib/beatscene.js';

const ID = 's19_matin', L = lines(ID), B = i => L[i] || [0, 0];
const IN = (i, t) => t >= B(i)[0] - .15 && t < (B(i + 1)[0] || B(i)[1] + .3);
const MATTRESS = [[1188, 574], [1450, 574], [1455, 688], [1308, 690]];
const CHEST = [[1450, 580], [1830, 580], [1830, 850], [1450, 850]];
const BED = { at: [1325, 636], face: [1430, 672], pose: 'lie', o: { top: .26, turn: .12, hands: 'belly', headTurn: .06, mattress: MATTRESS, avoid: CHEST }, seed: 3, height: 1.1 };   // right divan, head on the back cushions; cast scale like s16
const TOP = .26;
// r25N: the boy is re-solved flat on the cloth every frame (s16 recipe) with a pillow and a blanket over legs and hips, so the head, chest and covered body read as a child in bed in every shot
function bed(S3, st, t) {
  const mo = st.A.mohammed;
  lieOnBed(mo, { top: TOP, feet: [.45, .89], hands: 'belly', pillow: .095, tuck: .22, headTurn: .06 });
  pillowUnder(S3, st, mo, { top: TOP, h: .12, col: 0x2c3a56 });
  st.cover ||= PR.blanket({ w: .4, l: .56, h: .06, col: 0xb23a2a });
  const hp = mo.B.root.getWorldPosition(V(0, 0, 0)), ry = mo.group.rotation.y;
  S3.prop(st.cover, hp.x + Math.sin(ry) * .3, TOP + .03 - .004, hp.z + Math.cos(ry) * .3, ry); st.cover.visible = true;
  mo.B.chest.rotation.x += .012 * Math.sin(t * 1.5); mo.B.chest.updateWorldMatrix(false, true);
}
// Zoubida: hands placed from the shoulder (handTo), never default arms, so she is never frozen in the A-pose.
// Every kind is a handTo parameter set per side; kinds are blended by smooth weights so nothing pops between beats.
function kindPS(kind, sd, t) {
  const w = Math.sin(t * 4.2), v = Math.sin(t * 3.1 + 1.4), i1 = Math.sin(t * .8 + (sd === 'L' ? 0 : 2)), i2 = Math.sin(t * .6 + 1.7 + (sd === 'L' ? 1 : 0));
  const alt = Math.sin(t * 1.3 + (sd === 'L' ? 0 : Math.PI)) * .5 + .5;   // the two hands take turns leading
  switch (kind) {
    case 'chop': { const q = Math.sin(t * 3.4) * .5 + .5, q2 = 1 - q;   // R31P: both palms up, forearms rise and drop in alternating beats
      return sd === 'R' ? { fwd: .27 + .04 * q, out: .12, drop: .02 + .2 * q2, curl: .12, spread: .4, palm: .9 } : { fwd: .25 + .04 * q2, out: .16, drop: .02 + .2 * q, curl: .12, spread: .4, palm: .9 }; }
    case 'palms': return sd === 'R' ? { fwd: .26 + .04 * alt, out: .1 + .04 * w, drop: .08 + .1 * (1 - alt), curl: .1, spread: .4, palm: .8 } : { fwd: .2, out: .16 + .03 * v, drop: .2 + .08 * alt, curl: .15, spread: .4, palm: .7 };
    case 'chest': return sd === 'R' ? { fwd: .12, out: -.02, drop: .1 + .01 * i1, curl: .35, spread: .15, palm: .1 } : { fwd: .1, out: .1, drop: .27 + .02 * i2, curl: .4, spread: .1, palm: 0 };
    case 'wide': return sd === 'R' ? { fwd: .24 + .04 * alt, out: .32 + .04 * w, drop: .0 + .1 * alt, curl: .1, spread: .45, palm: .8 } : { fwd: .18, out: .14 + .03 * v, drop: .16 + .08 * alt, curl: .2, spread: .3, palm: .6 };
    case 'sash': return sd === 'R' ? { fwd: .14 + .02 * i1, out: .08, drop: .24, curl: .5, spread: .1, palm: 0 } : { fwd: .12 + .02 * i1, out: .2 + .02 * i2, drop: .3 + .03 * i2, curl: .5, spread: .1, palm: 0 };
    default: return sd === 'R' ? { fwd: .13 + .03 * i1, out: .07, drop: .27 + .03 * i2, curl: .4 + .1 * i1, spread: .1, palm: 0 } : { fwd: .16 + .02 * i2, out: .03, drop: .34 + .02 * i1, curl: .5, spread: .1, palm: 0 };   // relaxed: hands in front of the belly, small drift
  }
}
// sched: [[t0, kind], ...] in scene time; each kind fades in over .45 s from the previous one
function gestSched(a, t, sched) {
  let cur = 0; for (let k = 0; k < sched.length; k++) if (t >= sched[k][0]) cur = k;
  const prev = Math.max(0, cur - 1), u = cur === 0 ? 1 : sm(sched[cur][0], sched[cur][0] + .45, t);
  for (const sd of ['L', 'R']) {
    const A = kindPS(sched[prev][1], sd, t), Bq = kindPS(sched[cur][1], sd, t), o = {};
    for (const k of Object.keys(A)) o[k] = A[k] + (Bq[k] - A[k]) * u;
    handTo(a, sd, o);
    if (o.palm > .05) PO.palmTo(a, sd, o.palm, V(0, 1, .25));
  }
}
const ch1 = staged('chambre_jour', {
  mohammed: BED,
  // Beside the divan. The look target stays near his own eye height: aiming at the boy's low
  // skull spent the whole head turn on pitching down, so the face never came around.
  father: { height: 1.76, at: [1150, 748], face: 'cam', yaw: .75, pose: 'kneel', o: { grounded: true, lean: .28 }, seed: 5,
    look: (t, st) => {
      const who = (IN(0, t) || IN(1, t)) ? st.A.mohammed : st.A.zoubida;
      const p = at(who, 'head').clone(), eye = at(st.A.father, 'head').y;
      p.y = Math.max(p.y, eye - .2);
      return p;
    }, lookMax: .95 },
  zoubida: { at: [860, 735], face: [1130, 1010], seed: 7 },
}, {
  addressee: { father: 'zoubida', zoubida: 'father' },
  act(lt, t, S, st, S3) {
    bareHead(st.A.father);
    bed(S3, st, t);
    const { father: fa, zoubida: zo, mohammed: mo } = st.A, kf = fa.group.scale.y / 1.6;
    const km = mo.group.scale.y / 1.6;
    const side = at(mo, 'chest').x > at(fa, 'chest').x ? 'L' : 'R', other = side === 'L' ? 'R' : 'L', pole = side === 'L' ? [.5, .3, .6] : [-.5, .3, .6];
    const near = ['L', 'R'].sort((a, b) => at(mo, 'upperArm' + a).distanceTo(at(fa, 'chest')) - at(mo, 'upperArm' + b).distanceTo(at(fa, 'chest')))[0];
    const reach = (target, o) => {
      const sh = at(fa, 'upperArm' + side), len = sh.distanceTo(at(fa, 'foreArm' + side)) + at(fa, 'foreArm' + side).distanceTo(at(fa, 'hand' + side));
      const d = target.clone().sub(sh); if (d.length() > len * .97) target = sh.clone().addScaledVector(d.normalize(), len * .97);
      return PO.reach(fa, side, target, o);
    };
    for (const n of ['SkirtBack1', 'SkirtBack2']) { const b = fa.B[n]; if (b) b.scale.y *= .72; }   // idle sway was dropping the hem through the tiles
    const fwdv = front(fa, 'root', 1).sub(at(fa, 'root')).setY(0).normalize();
    const hold = IN(0, t) || (IN(1, t) && t > B(1)[0] + .4 && t < B(2)[0] + .2);
    const pts = []; for (const h of ['handL', 'handR', 'foreArmL', 'foreArmR']) for (const m of ['torso', 'head', 'upperArmL', 'upperArmR', 'foreArmL', 'foreArmR']) pts.push(h + ':' + m);
    st.actcheck = { contacts: hold ? [{ actors: ['father', 'mohammed'], parts: pts }] : [] };
    const touching = IN(0, t) || IN(1, t);
    if (touching) { fa.B.chest.rotation.x += .1 * sm(B(0)[0] - .2, B(0)[0] + .5, t); fa.group.updateMatrixWorld(true); }
    // forehead: head-local spot between the brows and the hairline, palm flat on it
    const fh = () => { const F = mo.S.face, ey = (F.eyeL[1] - mo.S.head), ez = F.eyeL[2]; return mo.B.head.localToWorld(V(0, ey + .075, ez * .55 + .01)); };
    const outw = at(fa, 'upperArm' + side).sub(at(fa, 'chest')).setY(0).normalize(), rest = at(fa, 'thigh' + side).add(V(0, .1 * kf, .03)).addScaledVector(outw, .12 * kf).add(front(fa, 'root', .12 * kf).sub(at(fa, 'root')));
    // the other hand rests on its own thigh, with a little drift, so no arm ever sticks out stiff
    const poleO = other === 'L' ? [.5, .3, .6] : [-.5, .3, .6];   // R31AJ: elbow forward/out (handTo's pole put it BEHIND the torso)
    const lap = () => { const rO = at(fa, 'thigh' + other).add(V(0, .1 * kf, .03)).addScaledVector(at(fa, 'upperArm' + other).sub(at(fa, 'chest')).setY(0).normalize(), .1 * kf).add(front(fa, 'root', .12 * kf).sub(at(fa, 'root')));
      const sh = at(fa, 'upperArm' + other), len = sh.distanceTo(at(fa, 'foreArm' + other)) + at(fa, 'foreArm' + other).distanceTo(at(fa, 'hand' + other)), d = rO.clone().sub(sh);
      if (d.length() > len * .97) rO.copy(sh).addScaledVector(d.normalize(), len * .97);
      PO.reach(fa, other, rO, { grip: .02, pole: poleO }); PO.fingers(fa, other, .3, { spread: .12 }); };
    if (IN(0, t)) {   // hand ON the shoulder, shaking him awake
      const shk = .03 * Math.sin(t * 16) * sm(B(0)[0], B(0)[0] + .3, t);
      reach(at(mo, 'upperArm' + near).add(V(shk, .085 * km, .02)).addScaledVector(at(mo, 'upperArm' + near).sub(at(mo, 'chest')).setY(0).normalize(), .04 * km).add(fwdv.clone().multiplyScalar(.05)), { grip: .02, pole }); PO.fingers(fa, side, .35); lap();
    } else if (IN(1, t)) {   // feels the forehead (the line he tells it on), then draws back
      const u = sm(B(1)[0] + 3.2, B(1)[0] + 4.2, t) * (1 - sm(B(2)[0] - .6, B(2)[0] - .1, t));
      reach(at(mo, 'upperArm' + near).add(V(0, .085 * km, .02)).add(fwdv.clone().multiplyScalar(.05)).lerp(fh(), u), { grip: .01, pole }); PO.fingers(fa, side, .2); PO.palmTo(fa, side, u, V(0, -1, .15)); lap();
    } else if (IN(2, t)) {
      const u = 1 - sm(B(2)[0] - .2, B(2)[0] + .5, t);
      reach(rest.clone().lerp(fh(), u), { grip: .01, pole }); PO.fingers(fa, side, .3); PO.palmTo(fa, side, u, V(0, -1, .15)); lap();
    } else {
      // R31P: relaxed rest on the thigh/knee, a small lift on his own lines (b137), so no arm is frozen out horizontally
      const gi = IN(4, t) ? .5 + .5 * Math.sin(t * 2.2) : .2 * (.5 + .5 * Math.sin(t * 1.1));
      reach(rest.clone().add(V(0, .09 * kf * gi, 0)).addScaledVector(fwdv, .1 * kf * gi), { grip: .02, pole }); PO.fingers(fa, side, .3 + .3 * (1 - gi), { spread: .15 });
      lap();
      fa.B.chest.rotation.y += .05 * Math.sin(t * .6); fa.B.chest.rotation.x += .03 * Math.sin(t * .45 + 1);
    }
    fa.B.chest.rotation.x += .012 * Math.sin(t * 1.6); fa.B.chest.rotation.z += .02 * Math.sin(t * .7); fa.B.chest.updateWorldMatrix(false, true);
    zo.B.chest.rotation.z += .05 * Math.sin(t * .55 + .5); zo.B.chest.rotation.y += .03 * Math.sin(t * .4); zo.B.chest.updateWorldMatrix(false, true);
    gestSched(zo, t, [[0, 'idle'], [B(0)[0] + 3.5, 'sash'], [B(1)[0] + 1, 'idle'], [B(3)[0] - 3, 'chop'], [B(3)[0] + 6, 'palms'], [B(4)[0], 'idle'], [B(4)[0] + 2.6, 'chest'], [B(5)[0] - .2, 'palms'], [B(5)[0] + 3.5, 'chop']]);
  },
});

const ch2 = staged('chambre_jour', {
  mohammed: BED,
  father: { height: 1.76, at: [560, 900], face: 'zoubida', yaw: .25, seed: 5, look: 'zoubida', lookMax: .7 },
  zoubida: { at: [990, 880], face: [720, 980], seed: 7, look: 'father', lookMax: .7 },
}, {
  addressee: { father: 'zoubida', zoubida: 'father' },
  act(lt, t, S, st, S3) {
    bareHead(st.A.father);
    bed(S3, st, t);
    const zo = st.A.zoubida, fa = st.A.father, k = fa.group.scale.y / 1.6;
    const talk = IN(6, t) ? 1 : 0;   // his own line (b139): the raised hand is up; while she talks it drops to a loose half-open hand
    const ph = .5 + .5 * Math.sin(t * 1.25), up = (talk ? .06 : -.22 + .3 * ph) + .04 * Math.sin(t * .7), fw = (.2 + .06 * ph);
    PO.reach(fa, 'R', front(fa, 'chest', fw * k, (.18 + .04 * Math.sin(t * .8 + 1)) * k, up * k), { grip: 0, pole: [-.35, .08, .2] }); PO.fingers(fa, 'R', talk ? 0 : .25, { spread: .45 });
    handTo(fa, 'L', { fwd: .08 + .03 * Math.sin(t * .9), out: .24, drop: .27 + .03 * Math.sin(t * .6), curl: .35, spread: .1 });
    fa.B.chest.rotation.y += .06 * Math.sin(t * .55); fa.B.chest.rotation.x += .025 * Math.sin(t * .4 + 1); fa.B.neck.rotation.y += .22 * (ph - .5) * (talk ? 0 : 1); fa.B.head.rotation.z += .03 * Math.sin(t * .5);
    gestSched(zo, t, [[0, 'idle'], [B(6)[0], 'chest'], [B(6)[0] + 3.2, 'idle'], [B(7)[0] - .2, 'chop'], [B(7)[0] + 2.6, 'palms'], [B(9)[0] - .2, 'wide'], [B(9)[0] + 3.2, 'palms'], [B(9)[0] + 6, 'chop']]);
    if (IN(7, t) || IN(9, t)) { zo.B.neck.rotation.x -= .12; zo.B.neck.updateWorldMatrix(false, true); }   // chin up
  },
});

const pa = staged('patio_matin', {
  father: { height: 1.76, at: [1100, 990], face: [300, 960], walk: { to: [330, 965], t0: B(8)[0], t1: B(8)[0] + 4.5 } },
}, { light: { key: 0xb8c4e8, keyI: 1.5, sky: 0x93a6d4, ground: 0x5a5a6a, fillI: 1.05, shadow: .3, dir: [1, 6, 1] },   // cool arcade shade: the robe no longer glows warm
  act(lt, t, S, st) { const fa = st.A.father; fa.group.rotation.y = -1.05;
    const B8 = fa.B, w = t >= B(8)[0] && t < B(8)[0] + 4.5;   // longer stride and a real arm swing while he crosses
    if (w) { for (const n of ['thighL', 'thighR']) B8[n].rotation.x *= 1.5; for (const n of ['upperArmL', 'upperArmR']) B8[n].rotation.x *= 2.4; for (const n of ['foreArmL', 'foreArmR']) B8[n].rotation.x *= 1.6; }
    fa.group.updateMatrixWorld(true); PO.settle(fa, 0); } });

export default beatScene(ID, {
  shots: { ch1, ch2, pa },
  plan: {
    b133: { shot: 'ch1', size: 'M', on: 'father', z: 1.68, dx: 70, dy: -25 },
    b134: { shot: 'ch1', size: 'M', on: 'father', z: 1.68, dx: 70, dy: -25 },
    b135: { shot: 'ch1', size: 'M', on: 'father', z: 1.68, dx: 80, dy: -25 },
    b136: { shot: 'ch1', size: 'M', on: 'father', z: 1.68, dx: 30, dy: -25 },
    b137: { shot: 'ch1', size: 'M', on: 'father', z: 1.68, dx: 80, dy: -25 },
    b138: { shot: 'ch1', size: 'M', on: 'father', z: 1.68, dx: 30, dy: -25 },
    b139: { shot: 'ch2', size: 'W', on: 'father' },
    b140: { shot: 'ch2', size: 'W', on: 'zoubida' },
    b141: { shot: 'pa', size: 'W', on: 'father' },
    b142: { shot: 'ch2', size: 'W', on: 'zoubida' },
  },
});
