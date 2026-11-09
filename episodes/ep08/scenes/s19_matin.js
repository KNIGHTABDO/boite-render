// s19 the morning after. chambre_jour, Mohammed in bed (lying, centre-right). Shot ch1 (b133–b138): the father kneels at
// his side, shakes him awake (hand on his shoulder), feels his forehead; Zoubida stands on the left, chops the air, palms up.
// Shot ch2 (b139, b140, b142): the father standing by the door (left), calm, one raised hand; Zoubida all gesture.
// b141 patio cutaway: the father crosses toward the street door.
import * as PO from '../../../engine/poses.js';
import * as PR from '../../../engine/props3d.js';
import { staged } from '../lib/autostage.js';
import { beatScene, lines, sm, at, front, V } from '../lib/beatscene.js';

const ID = 's19_matin', L = lines(ID), B = i => L[i] || [0, 0];
const IN = (i, t) => t >= B(i)[0] - .15 && t < (B(i + 1)[0] || B(i)[1] + .3);
const MATTRESS = [[1188, 574], [1450, 574], [1455, 688], [1308, 690]];
const CHEST = [[1450, 580], [1830, 580], [1830, 850], [1450, 850]];
const BED = { at: [1350, 694], face: [1336, 754], pose: 'lie', o: { top: .26, turn: .12, hands: 'belly', headTurn: -.16, mattress: MATTRESS, avoid: CHEST }, seed: 3 };   // right divan, head on the back cushions
const arms = (a, t, kind, u) => {   // asymmetric: one arm leads, the other stays lower, so she never holds a matched zombie pose
  const k = a.group.scale.y / 1.6;
  const lead = kind === 'chop' ? front(a, 'chest', .36 * k, -.2 * k, (-.18 + .05 * Math.sin(t * 4.5)) * k)
    : front(a, 'chest', .28 * k, -.16 * k, .22 * k);
  const off = kind === 'chop' ? front(a, 'chest', .2 * k, .14 * k, .02 * k) : front(a, 'chest', .22 * k, .2 * k, .18 * k);
  PO.reach(a, 'L', lead.lerp(front(a, 'root', .14 * k, -.16 * k, 0), 1 - u), { grip: 0, pole: [.35, .05, .15] });
  PO.reach(a, 'R', off.lerp(front(a, 'root', .12 * k, .16 * k, 0), 1 - u), { grip: 0, pole: [-.3, .05, .12] });
  PO.fingers(a, 'L', .04, { spread: .4 }); PO.fingers(a, 'R', .04, { spread: .35 });
};

const ch1 = staged('chambre_jour', {
  mohammed: BED,
  // beside the near edge of the divan, three-quarter toward the boy so the look can actually land on him
  father: { height: 1.76, at: [1160, 780], face: [1358, 640], pose: 'kneel', o: { grounded: true, lean: .1 }, seed: 5,
    look: t => (IN(0, t) || IN(1, t)) ? 'mohammed' : 'zoubida', lookMax: 1.05 },
  zoubida: { at: [860, 900], face: 'father', yaw: .15, seed: 7, look: 'father', lookMax: .9 },
}, {
  addressee: { father: 'zoubida', zoubida: 'father' },
  act(lt, t, S, st, S3) {
    if(!st.pillow) { st.pillow=PR.cushion({w:.38,d:.3,h:.08,col:0x647c7c}); const p=at(st.A.mohammed,'head',[0,.1,0]).setY(.26);S3.prop(st.pillow,p.x,p.y,p.z,st.A.mohammed.group.rotation.y); }
    const { father: fa, zoubida: zo, mohammed: mo } = st.A, kf = fa.group.scale.y / 1.6;
    mo.B.chest.rotation.x += .01 * Math.sin(t * 1.5);
    const km = mo.group.scale.y / 1.6;
    // the near shoulder is the one closer to the kneeling father; the hand stops inside his arm length
    // the boy lies to the father's left when he faces the lens: use that arm so it does not fold through his chest
    const side = at(mo, 'chest').x > at(fa, 'chest').x ? 'L' : 'R', pole = side === 'L' ? [.45, .05, .35] : [-.45, .05, .35];
    const near = ['L', 'R'].sort((a, b) => at(mo, 'upperArm' + a).distanceTo(at(fa, 'chest')) - at(mo, 'upperArm' + b).distanceTo(at(fa, 'chest')))[0];
    const reach = (target, o) => {
      const sh = at(fa, 'upperArm' + side), len = sh.distanceTo(at(fa, 'foreArm' + side)) + at(fa, 'foreArm' + side).distanceTo(at(fa, 'hand' + side));
      const d = target.clone().sub(sh); if (d.length() > len * .88) target = sh.clone().addScaledVector(d.normalize(), len * .88);
      return PO.reach(fa, side, target, o);
    };
    for (const n of ['SkirtBack1', 'SkirtBack2']) { const b = fa.B[n]; if (b) b.scale.y *= .72; }   // idle sway was dropping the hem through the tiles
    if (IN(0, t)) { const shk = .03 * Math.sin(t * 16) * sm(B(0)[0], B(0)[0] + .3, t); reach(at(mo, 'upperArm' + near).add(V(shk, .1 * km, .06)), { grip: .02, pole }); }
    if (IN(1, t) || IN(2, t)) reach(at(mo, 'head').add(V(side === 'L' ? .04 : -.04, .1 * km, .08)), { grip: 0, pole });
    if (IN(3, t)) arms(zo, t, 'chop', sm(B(3)[0], B(3)[0] + .4, t));
    if (IN(4, t)) { PO.reach(fa, 'L', front(fa, 'chest', .28 * kf, -.12 * kf, .12 * kf), { grip: 0, pole: [.4, .08, .2] }); PO.fingers(fa, 'L', 0, { spread: .4 }); }
    if (IN(5, t)) arms(zo, t, 'palms', sm(B(5)[0], B(5)[0] + .5, t));
  },
});

const ch2 = staged('chambre_jour', {
  mohammed: BED,
  father: { height: 1.76, at: [470, 965], face: 'zoubida', seed: 5 },
  zoubida: { at: [1080, 950], face: 'father', seed: 7 },
}, {
  addressee: { father: 'zoubida', zoubida: 'father' },
  act(lt, t, S, st, S3) {
    if(!st.pillow) { st.pillow=PR.cushion({w:.38,d:.3,h:.08,col:0x647c7c}); const p=at(st.A.mohammed,'head',[0,.1,0]).setY(.26);S3.prop(st.pillow,p.x,p.y,p.z,st.A.mohammed.group.rotation.y); }
    st.A.mohammed.B.chest.rotation.x += .01 * Math.sin(t * 1.5);
    const zo = st.A.zoubida;
    const fa=st.A.father, k=fa.group.scale.y/1.6;
    PO.reach(fa,'R',front(fa,'chest',.3*k,.16*k,-.06*k),{grip:0,pole:[-.35,.08,.2]}); PO.fingers(fa,'R',0,{spread:.45});
    if (IN(7, t) || IN(9, t)) arms(zo, t, 'chop', .8);
    if (IN(7, t)) { zo.B.neck.rotation.x -= .12; zo.B.neck.updateWorldMatrix(false, true); }   // chin up
  },
});

const pa = staged('patio_matin', {
  father: { height: 1.76, at: [1100, 990], face: [300, 960], walk: { to: [330, 965], t0: B(8)[0], t1: B(8)[0] + 4.5 } },
}, { act(lt,t,S,st) { const fa=st.A.father; fa.group.rotation.y=-1.05;fa.group.updateMatrixWorld(true);PO.settle(fa,0); } });

export default beatScene(ID, {
  shots: { ch1, ch2, pa },
  plan: {
    b133: { shot: 'ch1', size: 'M', on: 'mohammed', z: 1.42, dx: -30, dy: -85 },
    b134: { shot: 'ch1', size: 'M', on: 'father', z: 1.42, dy: -90 },
    b135: { shot: 'ch1', size: 'CU', on: 'father', z: 2.05, dy: -75 },
    b136: { shot: 'ch1', size: 'M', on: 'zoubida', z: 1.42, dx: -20, dy: -80 },
    b137: { shot: 'ch1', size: 'CU', on: 'father', z: 2.05, dy: -75 },
    b138: { shot: 'ch1', size: 'M', on: 'zoubida', z: 1.42, dy: -80 },
    b139: { shot: 'ch2', size: 'M', on: 'father', z: 1.45, dy: -70 },
    b140: { shot: 'ch2', size: 'M', on: 'zoubida', z: 1.45, dy: -70 },
    b141: { shot: 'pa', size: 'W', on: 'father' },
    b142: { shot: 'ch2', size: 'W', on: 'zoubida' },
  },
});
