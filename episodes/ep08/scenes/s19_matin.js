// s19 the morning after. chambre_jour, Mohammed in bed (lying, centre-right). Shot ch1 (b133–b138): the father kneels at
// his side, shakes him awake (hand on his shoulder), feels his forehead; Zoubida stands right, chops the air, palms up.
// Shot ch2 (b139, b140, b142): the father standing by the door (left), calm, one raised hand; Zoubida all gesture.
// b141 patio cutaway: the father crosses toward the street door.
import * as PO from '../../../engine/poses.js';
import { staged } from '../lib/autostage.js';
import { beatScene, lines, sm, at, front, V } from '../lib/beatscene.js';

const ID = 's19_matin', L = lines(ID), B = i => L[i] || [0, 0];
const IN = (i, t) => t >= B(i)[0] - .15 && t < (B(i + 1)[0] || B(i)[1] + .3);
const BED = { at: [1000, 1005], face: Math.PI / 2, pose: 'lie', o: { turn: .3 }, seed: 3 };
const arms = (a, t, kind, u) => {   // Zoubida's gestures: 'chop' (both forearms down in beats), 'palms' (up to the ceiling)
  const k = a.group.scale.y / 1.6;
  for (const s of ['L', 'R']) {
    const sx = (s === 'L' ? -1 : 1), ph = s === 'L' ? 0 : 1.3;
    const p = kind === 'chop' ? front(a, 'chest', .32 * k, sx * .22 * k, (.02 + .1 * Math.abs(Math.sin(t * 4.5 + ph))) * k)
      : front(a, 'chest', .3 * k, sx * .25 * k, .28 * k);
    PO.reach(a, s, p.lerp(front(a, 'root', .12 * k, sx * .2 * k, 0), 1 - u), { grip: 0 });
  }
};

const ch1 = staged('chambre_jour', {
  mohammed: { ...BED, look: t => t < B(0)[0] + 1 ? null : 'father' },
  father: { at: [760, 935], face: 'mohammed', pose: 'kneel', seed: 5, look: 'mohammed' },
  zoubida: { at: [1380, 935], face: 'father', seed: 7 },
}, {
  addressee: { father: 'zoubida', zoubida: 'father' },
  act(lt, t, S, st) {
    const { father: fa, zoubida: zo, mohammed: mo } = st.A, kf = fa.group.scale.y / 1.6;
    if (IN(0, t)) { const sh = .025 * Math.sin(t * 16) * sm(B(0)[0], B(0)[0] + .3, t); PO.reach(fa, 'R', at(mo, 'chest').add(V(0, .08 + sh, sh)), { grip: .02 }); }
    if (IN(1, t) || IN(2, t)) PO.reach(fa, 'R', at(mo, 'head').add(V(0, .1, 0)), { grip: 0 });
    if (IN(3, t)) arms(zo, t, 'chop', sm(B(3)[0], B(3)[0] + .4, t));
    if (IN(4, t)) PO.reach(fa, 'L', front(fa, 'chest', .25 * kf, -.15 * kf, .15 * kf), { grip: 0 });
    if (IN(5, t)) arms(zo, t, 'palms', sm(B(5)[0], B(5)[0] + .5, t));
  },
});

const ch2 = staged('chambre_jour', {
  mohammed: { ...BED, look: 'father' },
  father: { at: [470, 965], face: 'zoubida', seed: 5 },
  zoubida: { at: [1080, 950], face: 'father', seed: 7 },
}, {
  addressee: { father: 'zoubida', zoubida: 'father' },
  act(lt, t, S, st) {
    const zo = st.A.zoubida;
    if (IN(7, t) || IN(9, t)) arms(zo, t, 'chop', .8);
    if (IN(7, t)) { zo.B.neck.rotation.x -= .12; zo.B.neck.updateWorldMatrix(false, true); }   // chin up
  },
});

const pa = staged('patio_matin', {
  father: { at: [1100, 990], face: [300, 960], walk: { to: [330, 965], t0: B(8)[0], t1: B(8)[0] + 4.5 } },
});

export default beatScene(ID, {
  shots: { ch1, ch2, pa },
  plan: {
    b133: { shot: 'ch1', size: 'CU', on: 'mohammed' },
    b134: { shot: 'ch1', size: 'M', on: 'father' },
    b135: { shot: 'ch1', size: 'CU', on: 'father' },
    b136: { shot: 'ch1', size: 'CU', on: 'zoubida' },
    b137: { shot: 'ch1', size: 'CU', on: 'father' },
    b138: { shot: 'ch1', size: 'CU', on: 'zoubida' },
    b139: { shot: 'ch2', size: 'M', on: 'father' },
    b140: { shot: 'ch2', size: 'CU', on: 'zoubida' },
    b141: { shot: 'pa', size: 'W', on: 'father' },
    b142: { shot: 'ch2', size: 'W', on: 'zoubida' },
  },
});
