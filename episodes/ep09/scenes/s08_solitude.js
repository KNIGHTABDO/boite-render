// s08_solitude.js — La solitude.
// Rooms: chambre_nuit, painting p04_planetes_mortes, painting p05_aube_rossignols.
// Cast placements:
//   - ch (chambre_nuit): l'enfant lying on the right divan. Hip mark [1310, 630] so the head
//     and chest stay on the painted mattress (a mark at the pillow [1230, 630] left the chest
//     off the left edge). Feet run along the divan, short of the chest. le père [730, 895]
//     and la mère [995, 895] kneel on the floor, backs to the camera.
// Beat-by-beat visual actions:
//   - b047 (chambre_nuit, CU): Mohammed lies wide-eyed in the thick, soot-black darkness.
//   - b048 (chambre_nuit, W): Father and Zoubida kneel frozen, back to the camera, while the boy watches from bed.
//   - b049 (chambre_nuit, CU): Mohammed shuts his eyes and clasps both hands over his chest.
//   - b050 (painting p04_planetes_mortes): Cosmic solitude.
//   - b051 (painting p05_aube_rossignols): Dawn after winter.
import * as PO from '../../../engine/poses.js';
import { staged } from '../lib/autostage.js';
import { lieOnBed, pillowUnder } from '../lib/fix8_lie.js';
import { reachHand, openFace, seatChest, seatHead } from '../lib/fix9_B.js';
import { claspChest, paintLids, pillowToSkull } from '../lib/fix9_M.js';
import { beatScene, allLines, sm, dirW, V } from '../lib/beatscene.js';

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
    at: [1310, 630], face: Math.atan2(FEET[0], FEET[1]), pose: 'lie', height: 1.1,
    o: { top: TOP, turn: .12, hands: 'belly', headTurn: .45, pillow: .04, mattress: MATTRESS, avoid: CHEST },
    seed: 3, talk: 0,
    lids: t => t >= B(2)[0] - .05 ? 1 : 0,
  },
  // Wide master is from behind the parents (the boy watches them). backOk is the facing exemption for that shot.
  father: { height: 1.76, at: [730, 895], face: [900, 820], pose: 'kneel', backOk: true, o: { grounded: true, lean: .12, avoid: CHEST }, seed: 5, hands: false, talk: 0 },
  zoubida: { at: [995, 895], face: [820, 820], pose: 'kneel', o: { grounded: true, lean: .12, avoid: CHEST }, seed: 7, hands: false, talk: 0 },
}, {
  light: { keyI: .36, key: '#5c6e92', sky: '#161c30', ground: '#100e14', fillI: .14, shadow: .4 },
  over(lt, u, t, S, st, S3) {
    const mo = st.A?.mohammed;
    if (!mo) return;
    const shut = t >= B(2)[0] - .05 ? 1 : 0;
    if (shut > .2) paintLids(S3, mo, shut);
  },
  act(lt, t, S, st, S3) {
    st.G.apply = () => {};
    const { mohammed: mo, father: fa, zoubida: zo } = st.A;
    const kf = fa.group.scale.y / 1.6, kz = zo.group.scale.y / 1.6;
    const praying = IN(2, t);
    const u = praying ? sm(B(2)[0], B(2)[0] + .28, t) : 0;

    lieOnBed(mo, {
      top: TOP, feet: FEET, sink: .02,
      origin: (st.mo0 ||= mo.group.position.clone()),
      hands: 'belly', pillow: .06, tuck: praying ? .42 : .22, headTurn: praying ? .12 : .22,
    });
    // Pale, flat, under the skull — not a disc under the jaw with the head hanging off it.
    pillowUnder(S3, st, mo, { top: TOP, h: .04, col: 0xc5d4e4, w: .38, d: .26 });
    if (st.pillow) st.pillow.userData.ambient = true;
    pillowToSkull(mo, st.pillow, .04);
    mo.B.chest.rotation.x += (praying ? .006 : .008) * Math.sin(t * 1.7);
    // A small chin tuck drops the ear off the crown. The skull is seated on the declared pillow after it.
    mo.B.head.rotation.x += praying ? .12 : .06;
    seatChest(mo, TOP);
    openFace(mo, S3.cam.position, 82);
    seatHead(mo, TOP + .04);

    lapStill(fa, kf);
    lapStill(zo, kz);
    fa.B.neck.rotation.x += .1;
    zo.B.neck.rotation.x += .12;

    // Both hands on the chest, wide of the ribs. The lie pose's chest targets hid one hand in the sleeve.
    if (u > .35) claspChest(mo);
    else {
      const k = mo.group.scale.y / 1.6, chest = mo.B.chest.getWorldPosition(V());
      for (const [s, sg] of [['L', 1], ['R', -1]]) {
        const tgt = chest.clone().addScaledVector(dirW(mo, sg, 0, 0), .16 * k).add(V(0, -.02 * k, 0));
        reachHand(mo, s, tgt, { grip: .02, pole: [sg * .5, .08, .22], max: .9 });
        PO.fingers(mo, s, .28, { spread: .18 });
      }
    }
  },
});

export default beatScene(ID, {
  shots: { ch },
  plan: {
    // z overrides the auto cap (4.5), which still framed the whole right half of the room
    b047: { shot: 'ch', size: 'CU', on: 'mohammed', z: 5.2, dx: 12, dy: 18 },
    b048: { shot: 'ch', size: 'W', on: 'father' },
    b049: { shot: 'ch', size: 'CU', on: 'mohammed', z: 5.2, dx: 12, dy: 18 },
    b050: { move: 'pull' },
    b051: { move: 'rise' },
  },
});
