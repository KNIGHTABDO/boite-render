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
const BED = { at: [1468, 800], face: [1560, 930], pose: 'lie', o: { top: .26, turn: .12, hands: 'belly', headTurn: -.16 }, seed: 3 };   // right divan, head toward the back cushions, heels still on the mattress
const arms = (a, t, kind, u) => {   // Zoubida's gestures: 'chop' (both forearms down in beats), 'palms' (up to the ceiling)
  const k = a.group.scale.y / 1.6;
  for (const s of ['L', 'R']) {
    const sx = (s === 'L' ? -1 : 1), ph = s === 'L' ? 0 : 1.3;
    const p = kind === 'chop' ? front(a, 'chest', .32 * k, sx * .26 * k, (-.12 + .07 * Math.abs(Math.sin(t * 4.5 + ph))) * k)
      : front(a, 'chest', .3 * k, sx * .30 * k, .10 * k);
    PO.reach(a, s, p.lerp(front(a, 'root', .12 * k, sx * .2 * k, 0), 1 - u), { grip: 0 });
  }
};

const ch1 = staged('chambre_jour', {
  mohammed: BED,
  // beside the pillow, screen-left of the boy, turned toward the lens so his back does not fill the shot
  father: { height: 1.76, at: [1240, 770], face: 'cam', yaw: .2, pose: 'kneel', o: { grounded: true, lean: .06 }, seed: 5, look: 'mohammed', lookMax: .5 },
  zoubida: { at: [860, 940], face: 'cam', yaw: .35, seed: 7 },
}, {
  addressee: { father: 'zoubida', zoubida: 'father' },
  act(lt, t, S, st, S3) {
    if(!st.pillow) { st.pillow=PR.cushion({w:.38,d:.3,h:.08,col:0x647c7c}); const p=at(st.A.mohammed,'head',[0,.1,0]).setY(.26);S3.prop(st.pillow,p.x,p.y,p.z,st.A.mohammed.group.rotation.y); }
    const { father: fa, zoubida: zo, mohammed: mo } = st.A, kf = fa.group.scale.y / 1.6;
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
    if (IN(4, t)) PO.reach(fa, 'L', front(fa, 'chest', .25 * kf, -.15 * kf, .15 * kf), { grip: 0 });
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
    const zo = st.A.zoubida;
    const fa=st.A.father, k=fa.group.scale.y/1.6; PO.reach(fa,'R',front(fa,'chest',.28*k,.18*k,-.12*k),{grip:0});
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
    b133: { shot: 'ch1', size: 'M', on: 'mohammed', z: 2.0, dx: -120, dy: -40 },
    b134: { shot: 'ch1', size: 'M', on: 'father', z: 2.0, dy: -35 },
    b135: { shot: 'ch1', size: 'CU', on: 'father', z: 2.0, dy: -35 },
    b136: { shot: 'ch1', size: 'M', on: 'zoubida', z: 2.0, dy: -35 },
    b137: { shot: 'ch1', size: 'CU', on: 'father', z: 2.0, dy: -35 },
    b138: { shot: 'ch1', size: 'M', on: 'zoubida', z: 2.0, dy: -35 },
    b139: { shot: 'ch2', size: 'M', on: 'father', z: 2.0, dy: -35 },
    b140: { shot: 'ch2', size: 'M', on: 'zoubida', z: 2.0, dy: -35 },
    b141: { shot: 'pa', size: 'W', on: 'father' },
    b142: { shot: 'ch2', size: 'W', on: 'zoubida' },
  },
});
