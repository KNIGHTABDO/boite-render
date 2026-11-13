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
  pillowUnder(S3, st, mo, { top: TOP, h: .12 });
  st.cover ||= PR.blanket({ w: .4, l: .56, h: .06, col: 0x9a4a38 });
  const hp = mo.B.root.getWorldPosition(V(0, 0, 0)), ry = mo.group.rotation.y;
  S3.prop(st.cover, hp.x + Math.sin(ry) * .3, TOP + .03 - .004, hp.z + Math.cos(ry) * .3, ry); st.cover.visible = true;
  mo.B.chest.rotation.x += .012 * Math.sin(t * 1.5); mo.B.chest.updateWorldMatrix(false, true);
}
// Zoubida: hands placed from the shoulder (handTo), so they stay clear of the headscarf. u = how much she gestures (0 = relaxed idle).
// near = the side toward the other person: it stays low, so her hand never crosses his raised hand.
function gest(a, t, kind, u, near = null) {
  const lerp = (r, g) => r + (g - r) * u, w = Math.sin(t * 4.2), v = Math.sin(t * 3.1 + 1.4), i1 = Math.sin(t * .8), i2 = Math.sin(t * .6 + 1.7);
  const sp = { L: kind === 'chop' ? 1 : -1, R: kind === 'chop' ? -1 : 1 };
  for (const sd of ['L', 'R']) {
    const lead = sd === (kind === 'chop' ? 'R' : 'L'), low = sd === near;
    const rest = { fwd: .03 + .03 * (sd === 'L' ? i1 : i2), out: .15 + .02 * i2, drop: .3 - .03 * (sd === 'L' ? i2 : i1), curl: .3, spread: .12 };
    let g;
    if (kind === 'wide') g = lead || !low ? { fwd: .2, out: .3 + .06 * w, drop: .02 + .1 * (.5 + .5 * v), curl: .08, spread: .5 } : { fwd: .0, out: .22, drop: .3 + .03 * w, curl: .2, spread: .3 };
    else if (kind === 'chop') g = lead ? { fwd: .26 + .07 * w, out: .12, drop: .16 + .1 * Math.max(0, v), curl: .1, spread: .35 } : { fwd: .1, out: .2, drop: .27 + .04 * v, curl: .25, spread: .2 };
    else g = lead ? { fwd: .24, out: .17 + .03 * w, drop: .15 + .05 * v, curl: .1, spread: .4 } : { fwd: .2, out: .22, drop: .2 + .04 * w, curl: .12, spread: .4 };
    const o = {}; for (const k of Object.keys(rest)) o[k] = lerp(rest[k], g[k]);
    handTo(a, sd, o);
    if (u > .05 && kind !== 'wide') PO.palmTo(a, sd, .75 * u, V(0, 1, .25)); else if (u > .05 && !low) PO.palmTo(a, sd, .5 * u, V(0, 1, .3));
  }
}
const ch1 = staged('chambre_jour', {
  mohammed: BED,
  // Beside the divan. The look target stays near his own eye height: aiming at the boy's low
  // skull spent the whole head turn on pitching down, so the face never came around.
  father: { height: 1.76, at: [1185, 658], face: 'cam', yaw: .7, pose: 'kneel', o: { grounded: true, lean: .16 }, seed: 5,
    look: (t, st) => {
      const who = (IN(0, t) || IN(1, t)) ? st.A.mohammed : st.A.zoubida;
      const p = at(who, 'head').clone(), eye = at(st.A.father, 'head').y;
      p.y = Math.max(p.y, eye - .2);
      return p;
    }, lookMax: 1.15 },
  zoubida: { at: [860, 760], face: [1130, 1010], seed: 7 },
}, {
  addressee: { father: 'zoubida', zoubida: 'father' },
  act(lt, t, S, st, S3) {
    bareHead(st.A.father);
    bed(S3, st, t);
    const { father: fa, zoubida: zo, mohammed: mo } = st.A, kf = fa.group.scale.y / 1.6;
    const km = mo.group.scale.y / 1.6;
    const side = at(mo, 'chest').x > at(fa, 'chest').x ? 'L' : 'R', other = side === 'L' ? 'R' : 'L', pole = side === 'L' ? [.45, .05, .35] : [-.45, .05, .35];
    const near = ['L', 'R'].sort((a, b) => at(mo, 'upperArm' + a).distanceTo(at(fa, 'chest')) - at(mo, 'upperArm' + b).distanceTo(at(fa, 'chest')))[0];
    const reach = (target, o) => {
      const sh = at(fa, 'upperArm' + side), len = sh.distanceTo(at(fa, 'foreArm' + side)) + at(fa, 'foreArm' + side).distanceTo(at(fa, 'hand' + side));
      const d = target.clone().sub(sh); if (d.length() > len * .97) target = sh.clone().addScaledVector(d.normalize(), len * .97);
      return PO.reach(fa, side, target, o);
    };
    for (const n of ['SkirtBack1', 'SkirtBack2']) { const b = fa.B[n]; if (b) b.scale.y *= .72; }   // idle sway was dropping the hem through the tiles
    const touching = IN(0, t) || IN(1, t);
    if (touching) { fa.B.chest.rotation.x += .1 * sm(B(0)[0] - .2, B(0)[0] + .5, t); fa.group.updateMatrixWorld(true); }
    // forehead: head-local spot between the brows and the hairline, palm flat on it
    const fh = () => { const F = mo.S.face, ey = (F.eyeL[1] - mo.S.head), ez = F.eyeL[2]; return mo.B.head.localToWorld(V(0, ey + .075, ez * .55 + .01)); };
    const outw = at(fa, 'upperArm' + side).sub(at(fa, 'chest')).setY(0).normalize(), rest = at(fa, 'thigh' + side).add(V(0, .1 * kf, .03)).addScaledVector(outw, .12 * kf).add(front(fa, 'root', .12 * kf).sub(at(fa, 'root')));
    // the other hand rests on its own thigh, with a little drift, so no arm ever sticks out stiff
    const lap = () => { const p = at(fa, 'thigh' + other).add(V(0, .1 * kf, .05 + .01 * Math.sin(t * .9))).addScaledVector(at(fa, 'upperArm' + other).sub(at(fa, 'chest')).setY(0).normalize(), .14 * kf); PO.reach(fa, other, p, { grip: .02, pole: other === 'L' ? [.4, .05, .2] : [-.4, .05, .2] }); PO.fingers(fa, other, .3, { spread: .12 }); };
    if (IN(0, t)) {   // hand ON the shoulder, shaking him awake
      const shk = .03 * Math.sin(t * 16) * sm(B(0)[0], B(0)[0] + .3, t);
      reach(at(mo, 'upperArm' + near).add(V(shk, .045 * km, .02)), { grip: .02, pole }); PO.fingers(fa, side, .35); lap();
    } else if (IN(1, t)) {   // feels the forehead (the line he tells it on), then draws back
      const u = sm(B(1)[0] + .6, B(1)[0] + 1.6, t) * (1 - sm(B(2)[0] - .2, B(2)[0] + .4, t));
      reach(at(mo, 'head').add(V(0, .12 * km, .1)).lerp(fh(), u), { grip: .01, pole }); PO.fingers(fa, side, .2); PO.palmTo(fa, side, u, V(0, -1, .15)); lap();
    } else if (IN(2, t)) {
      const u = 1 - sm(B(2)[0] - .2, B(2)[0] + .5, t);
      reach(rest.clone().lerp(fh(), u), { grip: .01, pole }); PO.fingers(fa, side, .3); PO.palmTo(fa, side, u, V(0, -1, .15)); lap();
    } else {
      reach(rest.clone().add(V(0, .015 * Math.sin(t * .7), 0)), { grip: .02, pole }); PO.fingers(fa, side, .3, { spread: .1 });
      if (IN(4, t)) { handTo(fa, other, { fwd: .2, out: .26, drop: .2 + .04 * Math.sin(t * 2), curl: .05, spread: .4 }); PO.palmTo(fa, other, .6, V(0, 1, .3)); }
      else lap();
      fa.B.chest.rotation.y += .05 * Math.sin(t * .6); fa.B.chest.rotation.x += .03 * Math.sin(t * .45 + 1);
    }
    const g = IN(3, t) ? sm(B(3)[0], B(3)[0] + .4, t) : IN(5, t) ? sm(B(5)[0], B(5)[0] + .5, t) : 0;
    gest(zo, t, IN(5, t) ? 'palms' : 'chop', g);
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
    const near = ['L', 'R'].sort((a, b) => at(zo, 'upperArm' + a).distanceTo(at(fa, 'chest')) - at(zo, 'upperArm' + b).distanceTo(at(fa, 'chest')))[0];
    const gu = (IN(6, t) || IN(7, t) || IN(9, t)) ? sm(B(6)[0], B(6)[0] + .5, t) : 0.25;
    gest(zo, t, 'wide', gu, near);
    if (IN(7, t)) { zo.B.neck.rotation.x -= .12; zo.B.neck.updateWorldMatrix(false, true); }   // chin up
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
    b133: { shot: 'ch1', size: 'M', on: 'mohammed', z: 1.18, dx: 10, dy: -110 },
    b134: { shot: 'ch1', size: 'M', on: 'father', z: 1.22, dy: -105 },
    b135: { shot: 'ch1', size: 'CU', on: 'father', z: 1.9, dy: -85 },
    b136: { shot: 'ch1', size: 'M', on: 'zoubida', z: 1.18, dx: -10, dy: -105 },
    b137: { shot: 'ch1', size: 'CU', on: 'father', z: 1.9, dy: -85 },
    b138: { shot: 'ch1', size: 'M', on: 'zoubida', z: 1.18, dy: -105 },
    b139: { shot: 'ch2', size: 'W', on: 'father' },
    b140: { shot: 'ch2', size: 'W', on: 'zoubida' },
    b141: { shot: 'pa', size: 'W', on: 'father' },
    b142: { shot: 'ch2', size: 'W', on: 'zoubida' },
  },
});
