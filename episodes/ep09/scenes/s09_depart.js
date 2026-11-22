// s09_depart.js — Le départ à l'aube.
// Rooms: painting p06_pere_aube + ins i_sacoche_faucille (b052), chambre_jour (b053, b054, b056), patio_matin (b055).
// Cast placements:
//   - ch1 (chambre_jour, b053): Zoubida kneeling on the floor [860, 885] (pose: 'kneel', grounded: true, lean: .08) packing a canvas provisions sack + loaves + bowl of olives/figs placed at [860, 935]; Mohammed lying on the right divan [1350, 694] (lieOnBed + pillowUnder).
//   - ch2 (chambre_jour, b054, b056): Zoubida kneeling beside the left divan [840, 875] (pose: 'kneel', grounded: true, lean: .08); Mohammed lying awake on the right divan [1350, 694] (lieOnBed + pillowUnder, watching her).
//   - pa (patio_matin, b055): Father standing at [1120, 960] walking steadily across the sunlit courtyard toward the street exit [420, 995].
// Beat-by-beat visual actions:
//   - b052 (painting p06_pere_aube + ins i_sacoche_faucille, card LE SURLENDEMAIN, À L'AUBE): Father walks down the blue dawn lane with shepherd bag, new sickle, and provisions sack.
//   - b053 (chambre_jour, M + ins i_provisions_olives, i_qarchalas): Zoubida kneels packing olives, figs, roasted flour, anise bread, and qarchalas into the sewn canvas sack.
//   - b054 (chambre_jour, M): Father has just crossed the doorway; Zoubida collapses prostrate/bowed with her face buried in both hands (cradleFace) while Mohammed watches silently from his bed.
//   - b055 (patio_matin, W): Cutaway to the sunlit patio — the father walks calmly and steadily toward the street door as the household's unseen shield.
//   - b056 (chambre_jour, CU): Zoubida lowers her hands to her lap and sits slumped in morning light; Mohammed gazes gently at her.
import * as THREE from 'three';
import * as PO from '../../../engine/poses.js';
import * as PR from '../../../engine/props3d.js';
import { staged } from '../lib/autostage.js';
import { lieOnBed, pillowUnder, cradleFace } from '../lib/fix8_lie.js';
import { beatScene, allLines, sm, at, front, V } from '../lib/beatscene.js';

const ID = 's09_depart', L = allLines(ID), B = i => L[i] || [0, 0];
const IN = (i, t) => t >= B(i)[0] - .15 && t < (B(i + 1)?.[0] ?? B(i)[1] + .3);

const MATTRESS = [[1188, 574], [1450, 574], [1455, 688], [1308, 690]];
const CHEST = [[1450, 580], [1830, 580], [1830, 850], [1450, 850]];
const TOP = .26;
const BED = {
  at: [1350, 694], face: [1336, 754], pose: 'lie',
  o: { top: TOP, turn: .12, hands: 'belly', headTurn: -.16, mattress: MATTRESS, avoid: CHEST },
  seed: 3, talk: 0, lids: .12,
};

function reachClamped(a, side, target, opt) {
  const sh = at(a, 'upperArm' + side);
  const len = (a.armLen ||= {})[side] ||= sh.distanceTo(at(a, 'foreArm' + side)) + at(a, 'foreArm' + side).distanceTo(at(a, 'hand' + side));
  const d = target.clone().sub(sh), maxR = len * .85;
  const tgt = d.length() > maxR ? sh.clone().addScaledVector(d.normalize(), maxR) : target;
  return PO.reach(a, side, tgt, opt);
}

function bed(S3, st, t) {
  const mo = st.A.mohammed;
  st.s0 ||= mo.group.scale.clone();
  mo.group.scale.copy(st.s0).multiplyScalar(1);
  lieOnBed(mo, {
    top: TOP, feet: [.5, .87],
    origin: (st.mo0 ||= mo.group.position.clone()).clone().add(V(.04, 0, 0)),
    hands: 'belly', pillow: .08, tuck: .22, headTurn: -.12,
  });
  pillowUnder(S3, st, mo, { top: TOP, h: .08 });
  mo.B.chest.rotation.x += .01 * Math.sin(t * 1.5);
  mo.B.chest.updateWorldMatrix(false, true);
}

function makePackProps(S3) {
  const g = new THREE.Group();
  const mat = PR.mat({ w: .75, d: .55, col: 0xc8b07a });
  const sack = PR.cushion({ w: .28, d: .22, h: .16, col: 0xd8ccb4 });
  sack.position.set(-.06, .012, 0);
  const b1 = PR.bread({ r: .085 }); b1.position.set(.16, .012, .05);
  const b2 = PR.bread({ r: .085 }); b2.position.set(.14, .05, .03);
  const bowl = PR.bowl({ r: .10, h: .055, food: 0x1e1a16 }); bowl.position.set(.15, .012, -.12);
  g.add(mat, sack, b1, b2, bowl);
  S3.scene.add(g);
  return { g, sack };
}

// b053: chambre_jour — Zoubida kneeling, packing the canvas provisions sack
const ch1 = staged('chambre_jour', {
  zoubida: { at: [860, 885], face: 'cam', yaw: .25, pose: 'kneel', o: { grounded: true, lean: .08, avoid: CHEST }, seed: 7, hands: false },
  mohammed: BED,
}, {
  act(lt, t, S, st, S3) {
    bed(S3, st, t);
    const zo = st.A.zoubida, kz = zo.group.scale.y / 1.6;
    const pk = st.pack ||= makePackProps(S3);
    const pos = S3.floorAt(860, 935);
    S3.prop(pk.g, pos.x, 0, pos.z, .15); pk.g.visible = true;

    const ph = .5 + .5 * Math.sin(t * 2.1);
    zo.B.chest.rotation.x += .10 + .02 * ph;
    zo.B.neck.rotation.x += .16;
    zo.B.chest.updateWorldMatrix(false, true);

    const sackTop = pos.clone().add(V(-.04, .16, 0));
    const breadSpot = pos.clone().add(V(.12, .08, .02));
    reachClamped(zo, 'L', sackTop.clone().add(V(-.08, 0, .03)), { grip: .01, pole: [.38, -.2, .18] });
    PO.fingers(zo, 'L', .35, { thumb: .3 });
    reachClamped(zo, 'R', sackTop.clone().lerp(breadSpot, ph * .6), { grip: .01, pole: [-.38, -.2, .18] });
    PO.fingers(zo, 'R', .3 + .15 * (1 - ph), { thumb: .25 });
  },
});

// b054 & b056: chambre_jour — Zoubida prostrate/bowed with face in hands, then slumped in morning light; boy watches from bed
const ch2 = staged('chambre_jour', {
  zoubida: { at: [840, 875], face: 'cam', yaw: .35, pose: 'kneel', o: { grounded: true, lean: .08, avoid: CHEST }, seed: 7, hands: false, lids: .75 },
  mohammed: BED,
}, {
  act(lt, t, S, st, S3) {
    bed(S3, st, t);
    const zo = st.A.zoubida, kz = zo.group.scale.y / 1.6;
    st.G.apply = () => {};   // b054/b056: she grieves bowed into her hands/lap, never snapping toward the lens

    if (IN(2, t)) {
      // b054: prostrate/bowed over her knees, face buried in both hands, shoulders shaking gently
      const sob = .5 + .5 * Math.sin(t * 2.0);
      zo.B.spine.rotation.x += .12;
      zo.B.chest.rotation.x += .16 + .02 * Math.sin(t * 7);
      zo.B.chest.updateWorldMatrix(false, true);
      cradleFace(zo, { mode: 'eyes', bow: .24, u: sob });
    } else {
      // b056: lowers hands to lap, sits slumped in morning stillness
      const u = sm(B(4)[0], B(4)[0] + 1.0, t);
      zo.B.spine.rotation.x += .08;
      zo.B.chest.rotation.x += .12 - .04 * u;
      zo.B.neck.rotation.x += .18;
      zo.B.chest.updateWorldMatrix(false, true);
      for (const s of ['L', 'R']) {
        const sg = s === 'L' ? 1 : -1;
        const lapPt = PO.hipToWorld(zo, sg * .15 * kz, .07 * kz, .22 * kz);
        const eyePt = zo.B.head.localToWorld(V(sg * .045, .07, .10));
        reachClamped(zo, s, eyePt.lerp(lapPt, u), { grip: .02, pole: [sg * .36, -.12, .18] });
        PO.fingers(zo, s, .25, { spread: .12 });
      }
    }
  },
});

// b055: patio_matin cutaway — father walks steadily out toward the street doorway
const pa = staged('patio_matin', {
  father: {
    height: 1.76, at: [1120, 960], face: [420, 995],
    walk: { to: [420, 995], t0: B(3)[0], t1: B(3)[1] - .4 },
  },
}, {
  light: { key: 0xb8c4e8, keyI: 1.5, sky: 0x93a6d4, ground: 0x5a5a6a, fillI: 1.05, shadow: .3, dir: [1, 6, 1] },
  act(lt, t, S, st) {
    const fa = st.A.father, B9 = fa.B;
    const w = t >= B(3)[0] && t < B(3)[1] - .4;
    if (w) {
      for (const n of ['thighL', 'thighR']) B9[n].rotation.x *= 1.4;
      for (const n of ['upperArmL', 'upperArmR']) B9[n].rotation.x *= 2.0;
      for (const n of ['foreArmL', 'foreArmR']) B9[n].rotation.x *= 1.4;
    }
    fa.group.updateMatrixWorld(true);
    PO.settle(fa, 0);
  },
});

export default beatScene(ID, {
  shots: { ch1, ch2, pa },
  plan: {
    b052: { move: 'push', insMove: 'push' },   // painting p06_pere_aube + i_sacoche_faucille
    b053: { shot: 'ch1', size: 'M', on: 'zoubida', insMove: 'push' },
    b054: { shot: 'ch2', size: 'M', on: 'zoubida' },
    b055: { shot: 'pa', size: 'W', on: 'father' },
    b056: { shot: 'ch2', size: 'CU', on: 'zoubida' },
  },
});
