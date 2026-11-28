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
import * as PR from '../../../engine/props3d.js';
import { staged } from '../lib/autostage.js';
import { lapHands, reachClamp } from '../lib/fix9_C.js';
import { divanBoy } from '../lib/fix9_L.js';
import { beatScene, allLines, sm, at, front, V } from '../lib/beatscene.js';

const ID = 's07_decision', L = allLines(ID), B = i => L[i] || [0, 0];
const IN = (i, t) => t >= B(i)[0] - .15 && t < (B(i + 1)?.[0] ?? B(i)[1] + .3);

const MATTRESS = [[1188, 574], [1450, 574], [1455, 688], [1308, 690]];
const CHEST = [[1450, 580], [1830, 580], [1830, 850], [1450, 850]];
const TOP = .26;
const BED = {
  at: [1320, 640], face: [1330, 720], pose: 'lie',
  o: { top: TOP, turn: 0, hands: 'belly', headTurn: -.15, pillow: .1, mattress: MATTRESS, avoid: CHEST },
  seed: 3, talk: 0,
};

function reachClamped(a, side, target, opt) { return reachClamp(a, side, target, opt); }

const ch = staged('chambre_nuit', {
  father: { height: 1.76, at: [760, 910], face: 'zoubida', yaw: .85, pose: 'kneel', o: { grounded: true, lean: .1, avoid: CHEST }, seed: 5, hands: false, look: 'zoubida', lookMax: .9 },
  zoubida: { height: 1.6, at: [1040, 910], face: 'father', yaw: -.85, pose: 'kneel', o: { grounded: true, lean: .12, avoid: CHEST }, seed: 7, hands: false,
    look: (t, st) => {
      const p = st.A.father.B.head.getWorldPosition(V(0, 0, 0));
      const lift = sm(.15, B(0)[0] + .85, t);
      if (t < B(1)[0] - .05) p.y -= .28 * (1 - lift);
      else if (IN(2, t)) p.y += .45;
      return p;
    }, lookMax: 1.15 },
  mohammed: BED,
}, {
  addressee: { father: 'zoubida', zoubida: 'father' },
  act(lt, t, S, st, S3) {
    divanBoy(S3, st, t, { headTurn: -.15, top: TOP });

    const { father: fa, zoubida: zo } = st.A;
    const kf = fa.group.scale.y / 1.6, kz = zo.group.scale.y / 1.6;

    st.mat ||= S3.prop(PR.mat({ w: 1.7, d: 1.15, col: 0x6b4a32 }));
    const matP = S3.floorAt(900, 940);
    S3.prop(st.mat, matP.x, 0.002, matP.z, .15);

    lapHands(fa, t, 5);
    lapHands(zo, t, 7);
    // Bow from the pre-roll. Negative spine pitch folds the chest forward.
    zo.B.spine.rotation.x -= .18;
    zo.B.chest.rotation.x -= .1;
    fa.B.spine.rotation.x -= .06;
    fa.B.chest.rotation.x += .012 * Math.sin(t * .6);

    if (IN(0, t) || t < B(0)[0]) {
      zo.B.chest.updateWorldMatrix(false, true);
    } else if (IN(1, t)) {
      fa.B.head.rotation.x += .26 * Math.max(0, Math.sin((t - B(1)[0]) * 3.2));
      fa.B.chest.updateWorldMatrix(false, true);
    } else if (IN(2, t)) {
      zo.B.chest.updateWorldMatrix(false, true);
    } else if (IN(3, t)) {
      const g = sm(B(3)[0] + .4, B(3)[0] + 1.3, t) * (1 - sm(B(3)[1] - 1.2, B(3)[1], t));
      if (g > .02) {
        reachClamped(fa, 'L', front(fa, 'root', .22 * kf, -.16 * kf, .06 * kf), { grip: 0, pole: [.16, -.02, .08] });
        PO.palmTo(fa, 'L', .8 * g, V(0, .85, .35));
        PO.fingers(fa, 'L', .1, { spread: .26 });
      }
    } else if (IN(4, t)) {
      const u = sm(B(4)[0], B(4)[0] + .45, t);
      zo.B.spine.rotation.x -= .12 * u;
      zo.B.chest.rotation.x -= .1 * u;
      zo.B.chest.updateWorldMatrix(false, true);
      for (const s of ['L', 'R']) {
        const sg = s === 'L' ? 1 : -1;
        reachClamped(zo, s, front(zo, 'root', .3 * kz, -sg * .12 * kz, .06 * kz), { grip: 0, pole: [sg * .16, -.04, .08] });
        PO.palmTo(zo, s, .85, V(0, .8, .4));
        PO.fingers(zo, s, .08, { spread: .32 });
      }
    } else if (IN(6, t)) {
      // Zoubida clasps both hands forward near her chest ("Tu oserais m'abandonner...")
      const w = .012 * Math.sin(t * 7);
      zo.B.chest.rotation.x += .05;
      for (const s of ['L', 'R']) {
        const sg = s === 'L' ? 1 : -1;
        reachClamped(zo, s, front(zo, 'chest', .26 * kz, -sg * .11 * kz, (-.08 + w) * kz), { grip: 0, pole: [sg * .45, -.1, .18] });
        PO.fingers(zo, s, .35, { spread: .12 });
      }
    } else if (IN(7, t)) {
      // Father steady calming hand gesture
      const ph = .5 + .5 * Math.sin(t * 2.2);
      reachClamped(fa, 'R', front(fa, 'root', .24 * kf, .16 * kf, (.04 + .03 * ph) * kf), { grip: 0, pole: [-.18, -.02, .08] });
      PO.palmTo(fa, 'R', .8, V(0, -1, .3));
      PO.fingers(fa, 'R', .12, { spread: .2 });
    } else if (IN(8, t)) {
      // Zoubida gestures sharply toward her chest / wrists ("ces maudits bracelets")
      const ph = Math.sin((t - B(8)[0]) * 4.5) * .5 + .5;
      zo.B.chest.rotation.x += .05;
      reachClamped(zo, 'R', front(zo, 'chest', .22 * kz, .22 * kz, -.06 * kz), { grip: 0, pole: [-.2, -.04, .12] });
      PO.fingers(zo, 'R', .22, { spread: .25 });
      reachClamped(zo, 'L', front(zo, 'root', .16 * kz, -.28 * kz, .02 * kz), { grip: 0, pole: [.22, -.04, .1] });
      PO.palmTo(zo, 'L', .7, V(0, 1, .2)); PO.fingers(zo, 'L', .15, { spread: .3 });
    } else if (IN(9, t)) {
      // Father open palm calm explanation ("Je compte les vendre pour vous nourrir...")
      reachClamped(fa, 'R', front(fa, 'chest', .26 * kf, .18 * kf, -.14 * kf), { grip: 0, pole: [-.18, -.02, .08] });
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
    b036: { shot: 'ch', size: 'CU', on: 'zoubida', z: 3.3, dx: -70, dy: -42 },
    b037: { shot: 'ch', size: 'CU', on: 'father', z: 4.4, dx: -70, dy: -40 },
    b038: { shot: 'ch', size: 'CU', on: 'zoubida', z: 3.3, dx: -70, dy: -42 },
    b039: { shot: 'ch', size: 'W', on: 'father' },
    b040: { shot: 'ch', size: 'CU', on: 'zoubida', z: 3.2, dx: -55, dy: -36 },
    b041: { move: 'sink' },   // painting p03_moissonneurs — headroom above the turban
    b042: { shot: 'ch', size: 'CU', on: 'zoubida', z: 3.3, dx: -60, dy: -48 },
    b043: { shot: 'ch', size: 'W', on: 'father' },
    b044: { shot: 'ch', size: 'CU', on: 'zoubida', z: 3.3, dx: -60, dy: -48 },
    b045: { shot: 'ch', size: 'W', on: 'father', insAt: 0, insMove: 'push', segs: [[.55, 'i_bracelets_vente', { move: 'push' }], [.7, 'ch', {}]] },
    b046: { shot: 'ch', size: 'CU', on: 'father', z: 3.6, dx: -80, dy: -55 },
  },
});
