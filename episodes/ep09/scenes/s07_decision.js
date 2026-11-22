// s07_decision.js — La décision.
// Rooms: chambre_nuit, painting p03_moissonneurs.
// Cast placements:
//   - ch (chambre_nuit): le père kneeling left-centre [730, 895] (pose: 'kneel', grounded: true, lean: .08) and la mère kneeling right-centre [1010, 895] (pose: 'kneel', grounded: true, lean: .08), facing 3/4 toward each other and the camera; l'enfant lying on the right divan [1350, 694] (lieOnBed + pillowUnder).
// Beat-by-beat visual actions:
//   - b036 (chambre_nuit, CU): Zoubida bowed slightly forward from the floor, lifting her head weakly ("Qu'allons-nous faire ?").
//   - b037 (chambre_nuit, CU): Father calm and unshaken ("Je vais travailler."), steady nod, palms on thighs.
//   - b038 (chambre_nuit, CU): Zoubida looks up anxiously ("Combien as-tu perdu ?").
//   - b039 (chambre_nuit, W): Father sits steadily on the mat, palms resting on knees/thighs with a measured open-hand beat ("Tout mon fonds de roulement...").
//   - b040 (chambre_nuit, CU): Zoubida leans forward hopefully, open palms raised slightly from lap ("Les marchands te connaissent...").
//   - b041 (painting p03_moissonneurs): Sunlit wheatfields outside Fès — mountain harvesters at the golden grain.
//   - b042 (chambre_nuit, CU): Zoubida clasps both hands to her chest ("Tu oserais m'abandonner avec un enfant malade ?").
//   - b043 (chambre_nuit, W): Father makes a steady calming hand gesture ("Aimerais-tu devenir un objet de pitié...").
//   - b044 (chambre_nuit, CU): Zoubida points/presses toward her chest & wrists ("Ces maudits bracelets !").
//   - b045 (chambre_nuit, W + ins i_bracelets_vente): Father calmly answers he will sell the bracelets and Driss will bring groceries.
//   - b046 (chambre_nuit, CU): Father quiet and resolved ("Je vous laisse seuls pendant un mois...").
import * as PO from '../../../engine/poses.js';
import { staged } from '../lib/autostage.js';
import { lieOnBed, pillowUnder } from '../lib/fix8_lie.js';
import { beatScene, allLines, sm, at, front, V } from '../lib/beatscene.js';

const ID = 's07_decision', L = allLines(ID), B = i => L[i] || [0, 0];
const IN = (i, t) => t >= B(i)[0] - .15 && t < (B(i + 1)?.[0] ?? B(i)[1] + .3);

const MATTRESS = [[1188, 574], [1450, 574], [1455, 688], [1308, 690]];
const CHEST = [[1450, 580], [1830, 580], [1830, 850], [1450, 850]];
const TOP = .26;
const BED = {
  at: [1350, 694], face: [1336, 754], pose: 'lie', height: 1.1,
  o: { top: TOP, turn: .12, hands: 'belly', headTurn: -.18, pillow: .08, mattress: MATTRESS, avoid: CHEST },
  seed: 3, talk: 0,
};

function reachClamped(a, side, target, opt) {
  const sh = at(a, 'upperArm' + side);
  const len = (a.armLen ||= {})[side] ||= sh.distanceTo(at(a, 'foreArm' + side)) + at(a, 'foreArm' + side).distanceTo(at(a, 'hand' + side));
  const d = target.clone().sub(sh), maxR = len * .85;
  const tgt = d.length() > maxR ? sh.clone().addScaledVector(d.normalize(), maxR) : target;
  return PO.reach(a, side, tgt, opt);
}

function lapRest(a, k, t, seed = 0) {
  for (const s of ['L', 'R']) {
    const sg = s === 'L' ? 1 : -1;
    const sw = .008 * Math.sin(t * .85 + seed + sg);
    reachClamped(a, s, PO.hipToWorld(a, sg * .18 * k, (.07 + sw) * k, .25 * k), { grip: .03, pole: [sg * .9, .2, .5] });
    PO.fingers(a, s, .28, { spread: .12 });
  }
}

const ch = staged('chambre_nuit', {
  father: { height: 1.76, at: [730, 895], face: 'cam', yaw: .5, pose: 'kneel', o: { grounded: true, lean: .08, avoid: CHEST }, seed: 5, hands: false, look: 'zoubida', lookMax: .75 },
  zoubida: { at: [1010, 895], face: 'cam', yaw: -.45, pose: 'kneel', o: { grounded: true, lean: .08, avoid: CHEST }, seed: 7, hands: false, look: 'father', lookMax: .75 },
  mohammed: BED,
}, {
  addressee: { father: 'zoubida', zoubida: 'father' },
  act(lt, t, S, st, S3) {
    const mo = st.A.mohammed;
    lieOnBed(mo, {
      top: TOP, feet: [.5, .87],
      origin: (st.mo0 ||= mo.group.position.clone()).clone().add(V(.04, 0, 0)),
      hands: 'belly', pillow: .08, tuck: .22, headTurn: -.12,
    });
    pillowUnder(S3, st, mo, { top: TOP, h: .08, col: 0x2c3a56 });
    mo.B.chest.rotation.x += .01 * Math.sin(t * 1.4);
    mo.B.chest.updateWorldMatrix(false, true);

    const { father: fa, zoubida: zo } = st.A;
    const kf = fa.group.scale.y / 1.6, kz = zo.group.scale.y / 1.6;

    // Default relaxed lap hands + subtle breathing
    lapRest(fa, kf, t, 5);
    lapRest(zo, kz, t, 7);
    fa.B.chest.rotation.x += .015 * Math.sin(t * .6);
    zo.B.chest.rotation.x += .018 * Math.sin(t * .75 + 1);

    if (IN(0, t)) {
      // Zoubida lifts head slightly from sorrow, quiet question
      const u = sm(B(0)[0], B(0)[0] + .8, t);
      zo.B.spine.rotation.x += .10 * (1 - .5 * u);
      zo.B.neck.rotation.x += .16 * (1 - u);
      zo.B.chest.updateWorldMatrix(false, true);
    } else if (IN(1, t)) {
      // Father calm, firm nod
      fa.B.head.rotation.x += .06 * Math.max(0, Math.sin((t - B(1)[0]) * 3.5));
    } else if (IN(2, t)) {
      // Zoubida leans slightly toward him asking how much was lost
      zo.B.chest.rotation.x += .05;
      reachClamped(zo, 'L', front(zo, 'chest', .24 * kz, -.18 * kz, -.18 * kz), { grip: 0, pole: [.9, .2, .5] });
      PO.palmTo(zo, 'L', .6, V(0, 1, .3)); PO.fingers(zo, 'L', .15, { spread: .2 });
    } else if (IN(3, t)) {
      // Father palms resting on knees, gentle open-hand gesture on "ni le mois de loyer"
      const g = sm(B(3)[0] + 2.5, B(3)[0] + 3.5, t) * (1 - sm(B(3)[1] - 1.2, B(3)[1], t));
      if (g > .02) {
        reachClamped(fa, 'R', front(fa, 'chest', .26 * kf, .18 * kf, -.16 * kf), { grip: 0, pole: [-.9, .2, .5] });
        PO.palmTo(fa, 'R', .75 * g, V(0, 1, .25));
        PO.fingers(fa, 'R', .12, { spread: .22 });
      }
    } else if (IN(4, t)) {
      // Zoubida leans forward hopefully, open pleading palms
      const u = sm(B(4)[0], B(4)[0] + .7, t);
      zo.B.chest.rotation.x += .08 * u;
      for (const s of ['L', 'R']) {
        const sg = s === 'L' ? 1 : -1;
        reachClamped(zo, s, front(zo, 'chest', .26 * kz, -sg * .18 * kz, -.15 * kz), { grip: 0, pole: [sg * .9, .2, .5] });
        PO.palmTo(zo, s, .8, V(0, 1, .25));
        PO.fingers(zo, s, .1, { spread: .28 });
      }
    } else if (IN(6, t)) {
      // Zoubida clasps both hands forward near her chest ("Tu oserais m'abandonner...")
      const w = .012 * Math.sin(t * 7);
      zo.B.chest.rotation.x += .05;
      for (const s of ['L', 'R']) {
        const sg = s === 'L' ? 1 : -1;
        reachClamped(zo, s, front(zo, 'chest', .23 * kz, -sg * .08 * kz, (-.08 + w) * kz), { grip: 0, pole: [sg * .9, .2, .5] });
        PO.fingers(zo, s, .35, { spread: .12 });
      }
    } else if (IN(7, t)) {
      // Father steady calming hand gesture
      const ph = .5 + .5 * Math.sin(t * 2.2);
      reachClamped(fa, 'R', front(fa, 'chest', .26 * kf, .18 * kf, (-.14 + .04 * ph) * kf), { grip: 0, pole: [-.9, .2, .5] });
      PO.palmTo(fa, 'R', .8, V(0, -1, .3));
      PO.fingers(fa, 'R', .12, { spread: .2 });
    } else if (IN(8, t)) {
      // Zoubida gestures sharply toward her chest / wrists ("ces maudits bracelets")
      const ph = Math.sin((t - B(8)[0]) * 4.5) * .5 + .5;
      zo.B.chest.rotation.x += .05;
      reachClamped(zo, 'R', front(zo, 'chest', (.24 + .04 * ph) * kz, .12 * kz, -.10 * kz), { grip: 0, pole: [-.9, .2, .5] });
      PO.fingers(zo, 'R', .22, { spread: .25 });
      reachClamped(zo, 'L', front(zo, 'chest', .24 * kz, -.18 * kz, -.15 * kz), { grip: 0, pole: [.9, .2, .5] });
      PO.palmTo(zo, 'L', .7, V(0, 1, .2)); PO.fingers(zo, 'L', .15, { spread: .3 });
    } else if (IN(9, t)) {
      // Father open palm calm explanation ("Je compte les vendre pour vous nourrir...")
      reachClamped(fa, 'R', front(fa, 'chest', .26 * kf, .18 * kf, -.14 * kf), { grip: 0, pole: [-.9, .2, .5] });
      PO.palmTo(fa, 'R', .75, V(0, 1, .3));
      PO.fingers(fa, 'R', .1, { spread: .22 });
    } else if (IN(10, t)) {
      // Father quiet resolved gaze, hands resting steadily on thighs
      fa.B.head.rotation.x += .03 * Math.sin((t - B(10)[0]) * 1.4);
    }
  },
});

export default beatScene(ID, {
  shots: { ch },
  plan: {
    b036: { shot: 'ch', size: 'CU', on: 'zoubida', z: 1.75, dy: -85 },
    b037: { shot: 'ch', size: 'CU', on: 'father', z: 2.1, dy: -75 },
    b038: { shot: 'ch', size: 'CU', on: 'zoubida', z: 1.75, dy: -85 },
    b039: { shot: 'ch', size: 'W', on: 'father' },
    b040: { shot: 'ch', size: 'CU', on: 'zoubida', z: 1.75, dy: -85 },
    b041: { move: 'panR' },   // painting p03_moissonneurs
    b042: { shot: 'ch', size: 'CU', on: 'zoubida', z: 1.75, dy: -85 },
    b043: { shot: 'ch', size: 'W', on: 'father' },
    b044: { shot: 'ch', size: 'CU', on: 'zoubida', z: 1.75, dy: -85 },
    b045: { shot: 'ch', size: 'W', on: 'father', insMove: 'push' },
    b046: { shot: 'ch', size: 'CU', on: 'father', z: 2.1, dy: -75 },
  },
});
