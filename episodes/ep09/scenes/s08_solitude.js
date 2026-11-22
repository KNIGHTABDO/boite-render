// s08_solitude.js — La solitude.
// Rooms: chambre_nuit, painting p04_planetes_mortes, painting p05_aube_rossignols.
// Cast placements:
//   - ch (chambre_nuit): l'enfant lying on the right divan [1350, 694] (lieOnBed + pillowUnder, top: .26); le père [730, 895] and la mère [995, 895] kneeling motionless on the left/centre floor (pose: 'kneel', grounded: true, lean: .08, talk: 0).
// Beat-by-beat visual actions:
//   - b047 (chambre_nuit, CU): Mohammed lies wide-eyed in the thick, soot-black darkness, chest rising softly as he feels suffocated.
//   - b048 (chambre_nuit, W): Father and Zoubida kneel completely frozen like dark statues on the floor while the feverish boy watches from bed.
//   - b049 (chambre_nuit, CU): Mohammed shuts his eyes tight and clasps both hands gently over his chest in silent prayer.
//   - b050 (painting p04_planetes_mortes): Cosmic solitude — tiny figure on the rim of vast dead planets where sound dies without an echo.
//   - b051 (painting p05_aube_rossignols): Dawn after winter — warm morning light breaking over spring wildflowers and singing nightingales.
import * as PO from '../../../engine/poses.js';
import { staged } from '../lib/autostage.js';
import { lieOnBed, pillowUnder } from '../lib/fix8_lie.js';
import { beatScene, allLines, sm, at, dirW, V } from '../lib/beatscene.js';

const ID = 's08_solitude', L = allLines(ID), B = i => L[i] || [0, 0];
const IN = (i, t) => t >= B(i)[0] - .15 && t < (B(i + 1)?.[0] ?? B(i)[1] + .3);

const MATTRESS = [[1188, 574], [1450, 574], [1455, 688], [1308, 690]];
const CHEST = [[1450, 580], [1830, 580], [1830, 850], [1450, 850]];
const TOP = .26;

function reachClamped(a, side, target, opt) {
  const sh = at(a, 'upperArm' + side);
  const len = (a.armLen ||= {})[side] ||= sh.distanceTo(at(a, 'foreArm' + side)) + at(a, 'foreArm' + side).distanceTo(at(a, 'hand' + side));
  const d = target.clone().sub(sh), maxR = len * .85;
  const tgt = d.length() > maxR ? sh.clone().addScaledVector(d.normalize(), maxR) : target;
  return PO.reach(a, side, tgt, opt);
}

function lapStill(a, k) {
  for (const s of ['L', 'R']) {
    const sg = s === 'L' ? 1 : -1;
    reachClamped(a, s, PO.hipToWorld(a, sg * .18 * k, .07 * k, .25 * k), { grip: .03, pole: [sg * .9, .2, .5] });
    PO.fingers(a, s, .32, { spread: .1 });
  }
}

const ch = staged('chambre_nuit', {
  mohammed: {
    at: [1350, 694], face: [1336, 754], pose: 'lie', height: 1.1,
    o: { top: TOP, turn: .12, hands: 'belly', headTurn: -.18, pillow: .08, mattress: MATTRESS, avoid: CHEST },
    seed: 3, talk: 0,
    lids: t => t >= B(2)[0] + .5 ? 1 : .05,
  },
  father: { height: 1.76, at: [730, 895], face: 'cam', yaw: .5, pose: 'kneel', o: { grounded: true, lean: .08, avoid: CHEST }, seed: 5, hands: false, talk: 0 },
  zoubida: { at: [995, 895], face: 'cam', yaw: -.45, pose: 'kneel', o: { grounded: true, lean: .08, avoid: CHEST }, seed: 7, hands: false, talk: 0 },
}, {
  light: { keyI: .72, key: '#90a6d4', sky: '#2d395c', ground: '#1a1520', fillI: .32, shadow: .22 },
  act(lt, t, S, st, S3) {
    st.G.apply = () => {};   // parents remain frozen like statues; boy looks into the dark / prays
    const { mohammed: mo, father: fa, zoubida: zo } = st.A;
    const kf = fa.group.scale.y / 1.6, kz = zo.group.scale.y / 1.6;

    lieOnBed(mo, {
      top: TOP, feet: [.5, .87],
      origin: (st.mo0 ||= mo.group.position.clone()).clone().add(V(.04, 0, 0)),
      hands: 'belly', pillow: .08, tuck: .22, headTurn: -.12,
    });
    pillowUnder(S3, st, mo, { top: TOP, h: .08, col: 0x2c3a56 });
    mo.B.chest.rotation.x += (IN(0, t) ? .018 : .01) * Math.sin(t * 1.7);
    mo.B.chest.updateWorldMatrix(false, true);

    // Parents completely still in the dim lamp shadow
    lapStill(fa, kf);
    lapStill(zo, kz);
    fa.B.neck.rotation.x += .08;
    zo.B.neck.rotation.x += .14;

    // Boy closes eyes and clasps hands forward off chest in prayer (clear of torso capsule, hand.y - head.y <= 0.08)
    if (IN(2, t)) {
      const pray = sm(B(2)[0] + .3, B(2)[0] + 1.2, t);
      if (pray > .02) {
        const hy = at(mo, 'head').y;
        const prayMid = at(mo, 'chest').add(V(0, .145, 0)).addScaledVector(dirW(mo, 0, 0, 1), .05);
        if (prayMid.y > hy + .065) prayMid.y = hy + .065;
        for (const s of ['L', 'R']) {
          const sg = s === 'L' ? 1 : -1;
          const restPos = at(mo, 'hand' + s);
          const tg = prayMid.clone().addScaledVector(dirW(mo, sg, 0, 0), .035);
          reachClamped(mo, s, restPos.lerp(tg, pray), { grip: .01, pole: [sg * .9, .6, .2] });
          PO.fingers(mo, s, .45 * pray, { thumb: .4 * pray, spread: .08 });
        }
      }
    }
  },
});

export default beatScene(ID, {
  shots: { ch },
  plan: {
    b047: { shot: 'ch', size: 'CU', on: 'mohammed', z: 2.0, dy: -25 },
    b048: { shot: 'ch', size: 'W', on: 'father' },
    b049: { shot: 'ch', size: 'CU', on: 'mohammed', z: 2.0, dy: -25 },
    b050: { move: 'pull' },   // painting p04_planetes_mortes
    b051: { move: 'rise' },   // painting p05_aube_rossignols
  },
});
