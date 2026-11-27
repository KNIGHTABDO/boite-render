// s08_solitude.js — La solitude.
// Rooms: chambre_nuit, painting p04_planetes_mortes, painting p05_aube_rossignols.
// Cast placements:
//   - ch (chambre_nuit): l'enfant lying on the right divan, head on the painted pillow [1230, 630]
//     (lieOnBed, feet along the mattress away from the chest); le père [730, 895] and la mère [995, 895]
//     kneeling on the floor.
// Beat-by-beat visual actions:
//   - b047 (chambre_nuit, CU): Mohammed lies wide-eyed in the thick, soot-black darkness.
//   - b048 (chambre_nuit, W): Father and Zoubida kneel frozen while the boy watches from bed.
//   - b049 (chambre_nuit, CU): Mohammed shuts his eyes and clasps both hands over his chest.
//   - b050 (painting p04_planetes_mortes): Cosmic solitude.
//   - b051 (painting p05_aube_rossignols): Dawn after winter.
import * as PO from '../../../engine/poses.js';
import { staged } from '../lib/autostage.js';
import { lieOnBed, pillowUnder } from '../lib/fix8_lie.js';
import { reachHand } from '../lib/fix9_B.js';
import { beatScene, allLines, sm, at, V } from '../lib/beatscene.js';

const ID = 's08_solitude', L = allLines(ID), B = i => L[i] || [0, 0];
const IN = (i, t) => t >= B(i)[0] - .15 && t < (B(i + 1)?.[0] ?? B(i)[1] + .3);

const MATTRESS = [[1188, 574], [1450, 574], [1455, 688], [1308, 690]];
const CHEST = [[1450, 580], [1830, 580], [1830, 850], [1450, 850]];
const TOP = .26;
const FEET = [.92, .18];   // along the divan, toward the foot, short of the chest

function lapStill(a, k) {
  for (const s of ['L', 'R']) {
    const sg = s === 'L' ? 1 : -1;
    reachHand(a, s, PO.hipToWorld(a, sg * .2 * k, .04 * k, .22 * k), { grip: .03, pole: [sg * .55, -.05, .25], max: .96 });
    PO.fingers(a, s, .28, { spread: .1 });
  }
}

const ch = staged('chambre_nuit', {
  mohammed: {
    at: [1230, 630], face: Math.atan2(FEET[0], FEET[1]), pose: 'lie', height: 1.32,
    o: { top: TOP, turn: .12, hands: 'belly', headTurn: .45, pillow: .04, mattress: MATTRESS, avoid: CHEST },
    seed: 3, talk: 0,
    lids: t => t >= B(2)[0] - .05 ? 1 : 0,
  },
  father: { height: 1.76, at: [730, 895], face: [900, 820], pose: 'kneel', o: { grounded: true, lean: .12, avoid: CHEST }, seed: 5, hands: false, talk: 0 },
  zoubida: { at: [995, 895], face: [820, 820], pose: 'kneel', o: { grounded: true, lean: .12, avoid: CHEST }, seed: 7, hands: false, talk: 0 },
}, {
  light: { keyI: .72, key: '#90a6d4', sky: '#2d395c', ground: '#1a1520', fillI: .32, shadow: .22 },
  act(lt, t, S, st, S3) {
    st.G.apply = () => {};
    const { mohammed: mo, father: fa, zoubida: zo } = st.A;
    const kf = fa.group.scale.y / 1.6, kz = zo.group.scale.y / 1.6;
    const praying = IN(2, t);
    const u = praying ? sm(B(2)[0], B(2)[0] + .28, t) : 0;

    lieOnBed(mo, {
      top: TOP, feet: FEET,
      origin: (st.mo0 ||= mo.group.position.clone()),
      hands: u > .5 ? 'chest' : 'belly', pillow: .04, tuck: praying ? .28 : .12, headTurn: praying ? .08 : .5,
    });
    // Pale, flat, sitting on the painted pillow — not a dark disc in the middle of the mattress.
    pillowUnder(S3, st, mo, { top: TOP, h: .035, col: 0xc5d4e4, w: .32, d: .22 });
    mo.B.chest.rotation.x += (praying ? .012 : .02) * Math.sin(t * 1.7);
    mo.B.chest.updateWorldMatrix(false, true);

    lapStill(fa, kf);
    lapStill(zo, kz);
    fa.B.neck.rotation.x += .1;
    zo.B.neck.rotation.x += .12;

    if (u > .02) {
      const mid = at(mo, 'chest').add(V(0, .07, .02));
      reachHand(mo, 'L', mid.clone().add(V(.02, .015, .02)), { grip: 0, pole: [.4, .75, .2], max: .99 });
      reachHand(mo, 'R', mid.clone().add(V(-.02, .015, .02)), { grip: 0, pole: [-.4, .75, .2], max: .99 });
      PO.fingers(mo, 'L', .75 * u, { thumb: .55 * u, spread: .04 });
      PO.fingers(mo, 'R', .75 * u, { thumb: .55 * u, spread: .04 });
    }
  },
});

export default beatScene(ID, {
  shots: { ch },
  plan: {
    // z overrides the auto cap (4.5), which still framed the whole right half of the room
    b047: { shot: 'ch', size: 'CU', on: 'mohammed', z: 12, dx: 0, dy: 0 },
    b048: { shot: 'ch', size: 'W', on: 'father' },
    b049: { shot: 'ch', size: 'CU', on: 'mohammed', z: 12, dx: 0, dy: 0 },
    b050: { move: 'pull' },
    b051: { move: 'rise' },
  },
});
