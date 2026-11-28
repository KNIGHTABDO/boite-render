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
import * as K from '../../../engine/core.js';
import { staged } from '../lib/autostage.js';
import { still, loadStill } from '../lib/stage.js';
import { lieOnBed, pillowUnder } from '../lib/fix8_lie.js';
import { reachHand, holdGaze, openFace, seatHead } from '../lib/fix9_B.js';
import { beatScene, allLines, at, front, V } from '../lib/beatscene.js';

const ID = 's09_depart', L = allLines(ID), B = i => L[i] || [0, 0];
const IN = (i, t) => t >= B(i)[0] - .15 && t < (B(i + 1)?.[0] ?? B(i)[1] + .3);
const dur = i => Math.max(.1, B(i)[1] - B(i)[0]);

const MATTRESS = [[1188, 574], [1450, 574], [1455, 688], [1308, 690]];
const CHEST = [[1450, 580], [1830, 580], [1830, 850], [1450, 850]];
const TOP = .26;
const FEET = [.9, .16];
const BED = {
  // Near edge of the right divan. A mark at the back cushion made the cast-height boy a doll in the pillows.
  at: [1360, 672], face: Math.atan2(FEET[0], FEET[1]), pose: 'lie', height: 1.1,
  o: { top: TOP, turn: .1, hands: 'belly', headTurn: .2, pillow: .04, mattress: MATTRESS, avoid: CHEST },
  seed: 3, talk: 0, lids: .08,
};

function bed(S3, st, t, watch) {
  const mo = st.A.mohammed;
  lieOnBed(mo, {
    top: TOP, feet: FEET,
    origin: (st.mo0 ||= mo.group.position.clone()),
    hands: 'belly', pillow: .04, tuck: .2, headTurn: watch ? .35 : .12,
  });
  pillowUnder(S3, st, mo, { top: TOP, h: .035, col: 0xc5d4e4, w: .32, d: .22 });
  mo.B.chest.rotation.x += .008 * Math.sin(t * 1.5);
  mo.B.chest.updateWorldMatrix(false, true);
}

function makePackProps(S3) {
  const g = new THREE.Group();
  const mat = PR.mat({ w: .86, d: .62, col: 0xc8b07a });
  // Canvas sack: wide, low, open mouth. The old cushion was a closed white block.
  const sack = new THREE.Mesh(new THREE.SphereGeometry(.2, 14, 10), PR.toon(0xcbb892));
  sack.scale.set(1.2, .48, .9);
  sack.position.set(.02, .1, .02);
  const mouth = new THREE.Mesh(new THREE.CircleGeometry(.11, 14), PR.toon(0x4a3a28));
  mouth.rotation.x = -Math.PI / 2;
  mouth.position.set(.02, .2, .02);
  const b1 = PR.bread({ r: .1 }); b1.position.set(-.32, .05, .14);
  const b2 = PR.bread({ r: .09 }); b2.position.set(-.18, .07, .2);
  const bowl = PR.bowl({ r: .12, h: .065, food: 0x1a140e }); bowl.position.set(.32, .02, .1);
  g.add(mat, sack, mouth, b1, b2, bowl);
  g.scale.setScalar(1.2);
  S3.scene.add(g);
  return g;
}

/** Folded over her knees, palms on the cheeks. Wrists stay wide of the torso so the forearm does not pass through it. */
function buryFace(a, sob) {
  const B = a.B;
  // Three-quarter, not folded away from the lens. The face stays in both hands.
  B.spine.rotation.x += .46;
  B.chest.rotation.x += .16 + .02 * sob;
  B.neck.rotation.x += .26;
  a.group.updateMatrixWorld(true);
  for (const s of ['L', 'R']) {
    const sign = s === 'L' ? 1 : -1;
    const spot = () => B.head.localToWorld(new THREE.Vector3(sign * .09, -.005, .15));
    for (let i = 0; i < 3; i++) PO.reach(a, s, spot(), { grip: 0, pole: [sign * .95, -.1, .3] });
    PO.fingers(a, s, .2, { thumb: .12, spread: .06 });
    aim(B['hand' + s], PO.handPts(a, s).palm, B.head.localToWorld(new THREE.Vector3(sign * .02, .0, .04)));
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
  zoubida: { at: [850, 860], face: [980, 980], pose: 'kneel', o: { grounded: true, lean: .16, avoid: CHEST }, seed: 7, hands: false, lids: .1 },
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
    const sackMouth = pos.clone().add(V(.02, .22, .04));
    const loaf = pos.clone().add(V(-.28, .1, .12));
    const ph = .5 + .5 * Math.sin(t * 1.6);
    reachHand(zo, 'L', sackMouth.clone().add(V(.04, -.02, 0)), { grip: .01, pole: [.45, .15, .25] });
    reachHand(zo, 'R', sackMouth.clone().lerp(loaf, .25 + .55 * ph), { grip: .01, pole: [-.45, .12, .25] });
    PO.fingers(zo, 'L', .32, { thumb: .28 });
    PO.fingers(zo, 'R', .26, { thumb: .2 });
    PO.look(zo, sackMouth.clone().add(V(0, -k * .05, 0)), .9, { max: .95 });
  },
});

const ch2 = staged('chambre_jour', {
  zoubida: { at: [860, 900], face: [1100, 1020], pose: 'kneel', o: { grounded: true, lean: .12, avoid: CHEST }, seed: 7, hands: false, lids: .35 },
  mohammed: { ...BED, lids: .02 },
}, {
  act(lt, t, S, st, S3) {
    holdGaze(st);
    const zo = st.A.zoubida, mo = st.A.mohammed;
    bed(S3, st, t, zo);
    if (IN(2, t)) {
      buryFace(zo, .5 + .5 * Math.sin(t * 2.2));
      openFace(zo, S3.cam.position, 72);
    } else {
      slumped(zo);
      openFace(zo, S3.cam.position, 72);
    }
    PO.look(mo, at(zo, 'head'), .95, { max: 1.15 });
    seatHead(mo, TOP + .04);
  },
});

const pa = staged('patio_matin', {
  father: {
    height: 1.76, at: [860, 980], face: [460, 1060],
    walk: { to: [460, 1060], t0: B(3)[0] - .4, t1: B(3)[0] + 9 },
  },
}, {
  light: { key: 0xb8c4e8, keyI: 1.5, sky: 0x93a6d4, ground: 0x5a5a6a, fillI: 1.05, shadow: .3, dir: [1, 6, 1] },
  act(lt, t, S, st, S3) {
    const fa = st.A.father, B9 = fa.B, k = fa.group.scale.y / 1.6;
    const w = t >= B(3)[0] - .4 && t < B(3)[0] + 9;
    if (w) {
      B9.spine.rotation.x += .14;
      B9.chest.rotation.x += .06;
      for (const n of ['thighL', 'thighR']) B9[n].rotation.x *= 1.7;
      B9.upperArmR.rotation.z = -.55 + .35 * Math.sin(t * 7);
      B9.foreArmR.rotation.x = .4;
    }
    B9.chest.updateWorldMatrix(false, true);
    // Dark canvas sack held out from the hip so it reads against the pale wall.
    const carry = front(fa, 'chest', .04 * k, -.48 * k, -.42 * k);
    reachHand(fa, 'L', carry, { grip: .03, pole: [.6, -.15, .2] });
    PO.fingers(fa, 'L', .5, { thumb: .45 });
    PO.settle(fa, 0);
    const sack = st.sack ||= (() => {
      const s = new THREE.Mesh(new THREE.SphereGeometry(.16, 14, 10), PR.toon(0x6b4428));
      s.scale.set(1.05, .85, .75);
      return s;
    })();
    const palm = PO.handPts(fa, 'L').palm;
    S3.prop(sack, palm.x, palm.y - .1, palm.z, fa.group.rotation.y + .4);
    sack.visible = true;
  },
});

// The painted insert shows the palm bag and the sickle only. A canvas sack sits on the ledge with them.
const bags = {
  ownCover: true,
  async load() { await loadStill('i_sacoche_faucille'); },
  fn(lt, u) {
    still('i_sacoche_faucille', u, [.48, .5, 1.02, .5, .52, 1.06]);
    const c = K.c;
    c.save();
    // Soft canvas sack: shaded body, gathered neck, tied cord. No ink outline (it read as a placeholder).
    c.translate(1460, 850); c.rotate(-.12);
    const gr = c.createRadialGradient(-50, -30, 20, 0, 10, 190);
    gr.addColorStop(0, '#d8bf8e'); gr.addColorStop(.6, '#a98a5c'); gr.addColorStop(1, '#5e4a30');
    c.fillStyle = 'rgba(20,14,8,.35)';
    c.beginPath(); c.ellipse(10, 78, 175, 26, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = gr;
    c.beginPath();
    c.moveTo(-28, -70);
    c.bezierCurveTo(-120, -50, -175, 10, -160, 55);
    c.bezierCurveTo(-140, 92, 140, 98, 165, 55);
    c.bezierCurveTo(180, 10, 120, -52, 28, -70);
    c.closePath(); c.fill();
    c.fillStyle = '#b89a68';
    c.beginPath();
    c.moveTo(-28, -70); c.lineTo(-44, -112); c.quadraticCurveTo(0, -126, 44, -110); c.lineTo(28, -70); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(70,52,30,.55)'; c.lineWidth = 2.2;
    for (const [x0, x1] of [[-70, -100], [-20, -30], [40, 60], [90, 120]]) {
      c.beginPath(); c.moveTo(x0 * .3, -62); c.quadraticCurveTo(x0, 0, x1, 70); c.stroke();
    }
    c.strokeStyle = '#6b4a26'; c.lineWidth = 5;
    c.beginPath(); c.moveTo(-34, -78); c.quadraticCurveTo(0, -66, 34, -78); c.stroke();
    c.beginPath(); c.moveTo(10, -72); c.quadraticCurveTo(30, -40, 22, -18); c.stroke();
    c.restore();
    return { vignette: .35, paper: .15 };
  },
};

export default beatScene(ID, {
  shots: { ch1, ch2, pa, bags },
  plan: {
    // The 1.3s auto insert had already ended by the luggage line (local ~11.4). Hold the painting across that line.
    b052: { move: 'push', noIns: true, segs: [
      [7.0 / dur(0), 'bags', { move: 'face' }],
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
