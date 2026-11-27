// s09_depart.js — Le départ à l'aube.
// Rooms: painting p06_pere_aube + ins i_sacoche_faucille, chambre_jour, patio_matin.
// Cast placements:
//   - ch1 (chambre_jour): Zoubida kneeling [860, 885] packing a canvas sack, loaves and a bowl
//     set just in front of her knees; l'enfant lying on the right divan.
//   - ch2 (chambre_jour): Zoubida kneeling [840, 875], first bowed with her face in her hands,
//     then slumped with her hands on her thighs; l'enfant awake on the right divan, watching her.
//   - pa (patio_matin): le père walks the open courtyard [980, 870] → [500, 890], sack in hand.
// Beat-by-beat visual actions:
//   - b052 (painting + i_sacoche_faucille): the three pieces of luggage, held on the listing line.
//   - b053 (chambre_jour + i_provisions_olives, i_qarchalas): Zoubida packs, then the inserts.
//   - b054: Zoubida collapses, face buried in both hands; Mohammed watches from the bed.
//   - b055: the father walks the sunlit patio with the provisions sack.
//   - b056: Zoubida sits slumped, hands in her lap; Mohammed gazes at her.
import * as THREE from 'three';
import * as PO from '../../../engine/poses.js';
import * as PR from '../../../engine/props3d.js';
import { aim } from '../../../engine/ik.js';
import { staged } from '../lib/autostage.js';
import { lieOnBed, pillowUnder } from '../lib/fix8_lie.js';
import { reachHand, holdGaze } from '../lib/fix9_B.js';
import { beatScene, allLines, at, front, V } from '../lib/beatscene.js';

const ID = 's09_depart', L = allLines(ID), B = i => L[i] || [0, 0];
const IN = (i, t) => t >= B(i)[0] - .15 && t < (B(i + 1)?.[0] ?? B(i)[1] + .3);
const dur = i => Math.max(.1, B(i)[1] - B(i)[0]);

const MATTRESS = [[1188, 574], [1450, 574], [1455, 688], [1308, 690]];
const CHEST = [[1450, 580], [1830, 580], [1830, 850], [1450, 850]];
const TOP = .26;
const FEET = [.9, .16];
const BED = {
  at: [1240, 640], face: Math.atan2(FEET[0], FEET[1]), pose: 'lie', height: 1.28,
  o: { top: TOP, turn: .1, hands: 'belly', headTurn: 0, pillow: .04, mattress: MATTRESS, avoid: CHEST },
  seed: 3, talk: 0, lids: .08,
};

function bed(S3, st, t, watch) {
  const mo = st.A.mohammed;
  lieOnBed(mo, {
    top: TOP, feet: FEET,
    origin: (st.mo0 ||= mo.group.position.clone()),
    hands: 'belly', pillow: .04, tuck: .16, headTurn: watch ? 0 : -.08,
  });
  pillowUnder(S3, st, mo, { top: TOP, h: .035, col: 0xc5d4e4, w: .32, d: .22 });
  mo.B.chest.rotation.x += .012 * Math.sin(t * 1.5);
  mo.B.chest.updateWorldMatrix(false, true);
}

function makePackProps(S3) {
  const g = new THREE.Group();
  const mat = PR.mat({ w: .7, d: .5, col: 0xc8b07a });
  const sack = PR.cushion({ w: .42, d: .3, h: .26, col: 0xe4d7be });
  sack.position.set(.02, .02, 0);
  const b1 = PR.bread({ r: .11 }); b1.position.set(-.22, .02, .08);
  const b2 = PR.bread({ r: .1 }); b2.position.set(-.2, .1, .02);
  const bowl = PR.bowl({ r: .13, h: .07, food: 0x1a140e }); bowl.position.set(.2, .02, -.06);
  g.add(mat, sack, b1, b2, bowl);
  g.scale.setScalar(1.35);
  S3.scene.add(g);
  return g;
}

/** Folded over her knees, both palms on the eyes, elbows dropped in. */
function buryFace(a, sob) {
  const B = a.B;
  B.spine.rotation.x += .85;
  B.chest.rotation.x += .42 + .04 * sob;
  B.neck.rotation.x += .48;
  a.group.updateMatrixWorld(true);
  for (const s of ['L', 'R']) {
    const sign = s === 'L' ? 1 : -1;
    const spot = () => B.head.localToWorld(new THREE.Vector3(sign * .04, .055, .15));
    for (let i = 0; i < 4; i++) {
      PO.reach(a, s, spot(), { grip: 0, pole: [sign * .48, -.3, .22] });
      aim(B['hand' + s], PO.handPts(a, s).end, B.head.localToWorld(new THREE.Vector3(sign * .012, .1, .06)));
    }
    PO.fingers(a, s, .06, { thumb: .05, spread: .05 });
  }
}

/** Slumped, hands on the outer thighs so they sit clear of the orange sash. */
function slumped(a) {
  const k = a.group.scale.y / 1.6, B = a.B;
  B.spine.rotation.x += .48;
  B.chest.rotation.x += .22;
  B.neck.rotation.x += .28;
  a.group.updateMatrixWorld(true);
  for (const [s, sg] of [['L', 1], ['R', -1]]) {
    reachHand(a, s, PO.hipToWorld(a, sg * .26 * k, .015 * k, .14 * k), { grip: .02, pole: [sg * .45, -.2, .18] });
    PO.fingers(a, s, .22, { spread: .1 });
  }
}

const ch1 = staged('chambre_jour', {
  zoubida: { at: [850, 830], face: 'cam', yaw: .18, pose: 'kneel', o: { grounded: true, lean: .22, avoid: CHEST }, seed: 7, hands: false, lids: .1 },
  mohammed: BED,
}, {
  act(lt, t, S, st, S3) {
    holdGaze(st);
    bed(S3, st, t, null);
    const zo = st.A.zoubida, k = zo.group.scale.y / 1.6;
    const g = st.pack ||= makePackProps(S3);
    const pos = S3.floorAt(860, 900);
    S3.prop(g, pos.x, 0, pos.z, .15); g.visible = true;

    zo.B.spine.rotation.x += .28;
    zo.B.chest.rotation.x += .34;
    zo.B.chest.updateWorldMatrix(false, true);
    const sackTop = pos.clone().add(V(.02, .32, .04));
    const loaf = pos.clone().add(V(-.2, .18, .06));
    const ph = .5 + .5 * Math.sin(t * 1.6);
    reachHand(zo, 'L', sackTop.clone().add(V(.06, .02, 0)), { grip: .01, pole: [.5, .1, .3] });
    reachHand(zo, 'R', sackTop.clone().lerp(loaf, .35 + .4 * ph), { grip: .01, pole: [-.5, .1, .3] });
    PO.fingers(zo, 'L', .32, { thumb: .28 });
    PO.fingers(zo, 'R', .26, { thumb: .2 });
    PO.look(zo, sackTop.clone().add(V(0, -k * .05, 0)), .9, { max: .95 });
  },
});

const ch2 = staged('chambre_jour', {
  zoubida: { at: [840, 875], face: [700, 820], pose: 'kneel', o: { grounded: true, lean: .16, avoid: CHEST }, seed: 7, hands: false, lids: .35 },
  mohammed: { ...BED, lids: .02 },
}, {
  act(lt, t, S, st, S3) {
    holdGaze(st);
    const zo = st.A.zoubida, mo = st.A.mohammed;
    bed(S3, st, t, zo);
    if (IN(2, t)) buryFace(zo, .5 + .5 * Math.sin(t * 2.2));
    else slumped(zo);
    PO.look(mo, at(zo, 'head'), .95, { max: 1.15 });
  },
});

const pa = staged('patio_matin', {
  father: {
    height: 1.76, at: [980, 870], face: [500, 890],
    walk: { to: [500, 890], t0: B(3)[0] - 2.8, t1: B(3)[1] - .25 },
  },
}, {
  light: { key: 0xb8c4e8, keyI: 1.5, sky: 0x93a6d4, ground: 0x5a5a6a, fillI: 1.05, shadow: .3, dir: [1, 6, 1] },
  act(lt, t, S, st, S3) {
    const fa = st.A.father, B9 = fa.B, k = fa.group.scale.y / 1.6;
    const w = t >= B(3)[0] - 2.8 && t < B(3)[1] - .25;
    if (w) {
      B9.spine.rotation.x += .12;
      B9.chest.rotation.x += .06;
      for (const n of ['thighL', 'thighR']) B9[n].rotation.x *= 1.45;
      B9.upperArmR.rotation.x *= 1.5;
    }
    B9.chest.updateWorldMatrix(false, true);
    // Canvas provisions sack in the left hand; the right arm keeps the walk swing.
    const carry = front(fa, 'chest', .16 * k, -.24 * k, -.2 * k);
    reachHand(fa, 'L', carry, { grip: .03, pole: [.5, -.05, .22] });
    PO.fingers(fa, 'L', .4, { thumb: .35 });
    PO.settle(fa, 0);
    const sack = st.sack ||= PR.cushion({ w: .36, d: .24, h: .3, col: 0xe6d8bc });
    const palm = PO.handPts(fa, 'L').palm;
    S3.prop(sack, palm.x, palm.y - .02, palm.z, fa.group.rotation.y + .4);
    sack.visible = true;
  },
});

export default beatScene(ID, {
  shots: { ch1, ch2, pa },
  plan: {
    // The 1.3s auto insert had already ended by the luggage line (local ~11.4). Hold the painting across that line.
    b052: { move: 'push', noIns: true, segs: [
      [7.0 / dur(0), 'i_sacoche_faucille', { move: 'face' }],
      [11.3 / dur(0), 'p06_pere_aube', { move: 'push' }],
    ] },
    // Provisions insert covers the olives/figs/flour clause (the 28s tile); qarchalas follows its own word.
    b053: { shot: 'ch1', size: 'W', on: 'zoubida', noIns: true, segs: [
      [5.2 / dur(1), 'i_provisions_olives', { move: 'push' }],
      [12.5 / dur(1), 'i_qarchalas', { move: 'push' }],
      [15.4 / dur(1), 'ch1'],
    ] },
    b054: { shot: 'ch2', size: 'W', on: 'zoubida' },
    b055: { shot: 'pa', size: 'W', on: 'father' },
    b056: { shot: 'ch2', size: 'W', on: 'zoubida' },
  },
});
