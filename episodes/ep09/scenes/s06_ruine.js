// s06_ruine.js — La ruine.
// Rooms: patio_nuit (b027), chambre_nuit (b028–b035).
// Cast placements:
//   - pa (patio_nuit): Zoubida standing on the central courtyard floor [915, 725] walking toward [1100, 825] carrying the brass tea tray, teapot, and two glasses.
//   - nu1 (chambre_nuit, b028–b031): Father standing grave near the left wall [520, 870]; Zoubida standing right-centre [960, 895] facing him across a low tabla [835, 910]; Mohammed lying on the right divan [1260, 710].
//   - nu2 (chambre_nuit, b032–b035): Father kneeling left-centre [730, 895] and Zoubida kneeling beside him [995, 895] (grounded: true, lean: .08); tabla + tea service parked aside [1120, 935]; Mohammed lying on the right divan [1260, 710].
// Beat-by-beat visual actions:
//   - b027 (patio_nuit, M): Zoubida walks softly across the dark courtyard carrying the brass tea tray with teapot and glasses.
//   - b028 (chambre_nuit, CU): Zoubida looks up puzzled holding the tray ("Tu ne prends pas de thé ?") toward the father standing grave by the wall.
//   - b029 (chambre_nuit, CU): Father still and grave by the wall ("Non. Ne gaspille plus ton sucre...").
//   - b030 (chambre_nuit, M): Zoubida turns pale, slowly sets the tea tray down on the low tabla, and straightens to face him squarely.
//   - b031 (chambre_nuit, CU): Zoubida trembles ("Je pressens un grand malheur"), hand rising near her chest.
//   - b032 (chambre_nuit, M): Zoubida drops to kneel on the floor, beating her cheeks and tearing at her hair/temples in silent despair while Mohammed watches from bed.
//   - b033 (chambre_nuit, M): Father kneels beside her and catches/holds both of her wrists gently until she collapses forward face toward her hands/floor.
//   - b034 (chambre_nuit, CU): Father kneels gently beside bowed Zoubida, explaining softly he lost their working capital at the haïk auctions.
//   - b035 (chambre_nuit, CU + ins i_mouchoir_argent): Father opens empty palms explaining the knotted handkerchief slipped when reaching for his pouch.
import * as THREE from 'three';
import * as PO from '../../../engine/poses.js';
import * as PR from '../../../engine/props3d.js';
import { staged } from '../lib/autostage.js';
import { lieOnBed, pillowUnder, cradleFace } from '../lib/fix8_lie.js';
import { beatScene, allLines, sm, at, front, dirW, V } from '../lib/beatscene.js';

const ID = 's06_ruine', L = allLines(ID), B = i => L[i] || [0, 0];
const IN = (i, t) => t >= B(i)[0] - .15 && t < (B(i + 1)?.[0] ?? B(i)[1] + .3);

const MATTRESS = [[1188, 574], [1450, 574], [1455, 688], [1308, 690]];
const CHEST = [[1450, 580], [1830, 580], [1830, 850], [1450, 850]];
const TOP = .35;
const BED = {
  at: [1260, 710], face: [1350, 745], pose: 'lie',
  o: { top: TOP, turn: .12, hands: 'belly', headTurn: -.14, pillow: .09, mattress: MATTRESS, avoid: CHEST },
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
    const sw = .008 * Math.sin(t * .9 + seed + sg);
    const p = PO.hipToWorld(a, sg * .15 * k, (.07 + sw) * k, .22 * k);
    reachClamped(a, s, p, { grip: .03, pole: [sg * .32, .04, .12] });
    PO.fingers(a, s, .28, { spread: .12 });
  }
}

function makeTeaSet(S3) {
  const g = new THREE.Group();
  const tr = PR.tray({ r: .21 });
  const pot = PR.teapot();
  pot.position.set(-.04, tr.userData.top, -.02);
  const g1 = PR.teaGlass({ fill: .75 }); g1.position.set(.09, tr.userData.top, .04);
  const g2 = PR.teaGlass({ fill: .75 }); g2.position.set(.05, tr.userData.top, -.08);
  g.add(tr, pot, g1, g2);
  S3.scene.add(g);
  return g;
}

function bed(S3, st, t) {
  const mo = st.A.mohammed;
  lieOnBed(mo, { top: TOP, feet: [.5, .87], hands: 'belly', pillow: .09, tuck: .22, headTurn: -.14 });
  pillowUnder(S3, st, mo, { top: TOP, h: .09, col: 0x2c3a56 });
  mo.B.chest.rotation.x += .01 * Math.sin(t * 1.4);
  mo.B.chest.updateWorldMatrix(false, true);
}

// b027: patio_nuit — Zoubida walks across the central courtyard carrying the tea tray
const pa = staged('patio_nuit', {
  zoubida: {
    at: [915, 725], face: [1100, 825], seed: 7,
    walk: { to: [1100, 825], t0: B(0)[0], t1: Math.max(B(0)[0] + 2, B(0)[1] - .4) },
  },
}, {
  act(lt, t, S, st, S3) {
    const zo = st.A.zoubida, kz = zo.group.scale.y / 1.6;
    const tray = st.tea ||= makeTeaSet(S3);
    const ctr = front(zo, 'root', .27 * kz, 0, .20 * kz);
    tray.position.copy(ctr);
    tray.rotation.set(0, zo.group.rotation.y, 0);
    tray.visible = true;
    tray.updateMatrixWorld(true);
    for (const s of ['L', 'R']) {
      const sg = s === 'L' ? 1 : -1;
      const rim = ctr.clone().addScaledVector(dirW(zo, sg, 0, 0), .19 * kz).add(V(0, .025 * kz, 0));
      reachClamped(zo, s, rim, { grip: .01, pole: [sg * .42, -.18, .12] });
      PO.fingers(zo, s, .35, { thumb: .3, spread: .15 });
    }
  },
});

// b028..b031: chambre_nuit standing — Zoubida brings tray, father refuses grave by wall, she sets tray down
const nu1 = staged('chambre_nuit', {
  father: { height: 1.76, at: [520, 870], face: 'zoubida', seed: 5, talk: .6, look: 'zoubida', lookMax: .75 },
  zoubida: { at: [960, 895], face: 'father', yaw: -.22, seed: 7, talk: .6, look: 'father', lookMax: .75 },
  mohammed: BED,
}, {
  addressee: { father: 'zoubida', zoubida: 'father' },
  act(lt, t, S, st, S3) {
    bed(S3, st, t);
    const { father: fa, zoubida: zo } = st.A;
    const kf = fa.group.scale.y / 1.6, kz = zo.group.scale.y / 1.6;

    // Low tabla between them for setting the tray down at b030
    const tbl = st.tbl ||= (() => { const m = PR.tabla({ r: .26, h: .22 }); S3.scene.add(m); return m; })();
    const tblP = S3.floorAt(835, 910);
    S3.prop(tbl, tblP.x, 0, tblP.z, 0); tbl.visible = true;

    const tray = st.tea ||= makeTeaSet(S3);
    const heldPos = front(zo, 'root', .27 * kz, 0, .20 * kz);
    const restPos = tblP.clone().add(V(0, tbl.userData.top, 0));
    const setDown = IN(3, t) ? sm(B(3)[0] + .3, B(3)[0] + 2.6, t) : (t >= B(4)[0] ? 1 : 0);

    const trayPos = heldPos.clone().lerp(restPos, setDown);
    tray.position.copy(trayPos);
    tray.rotation.set(0, zo.group.rotation.y * (1 - setDown), 0);
    tray.visible = true;
    tray.updateMatrixWorld(true);

    // Zoubida arms: hold tray until set down, then relax/tremble toward chest on b031
    if (setDown < .85) {
      for (const s of ['L', 'R']) {
        const sg = s === 'L' ? 1 : -1;
        const rim = trayPos.clone().addScaledVector(dirW(zo, sg, 0, 0), .19 * kz).add(V(0, .025 * kz, 0));
        reachClamped(zo, s, rim, { grip: .01, pole: [sg * .42, -.18, .12] });
        PO.fingers(zo, s, .32, { thumb: .25, spread: .15 });
      }
      if (setDown > .05) { zo.B.chest.rotation.x += .16 * Math.sin(setDown * Math.PI); zo.B.chest.updateWorldMatrix(false, true); }
    } else if (IN(4, t)) {
      // b031: "Je pressens un grand malheur." — trembling breath, right hand near chest
      const trm = .008 * Math.sin(t * 14);
      zo.B.chest.rotation.x += .04 + trm;
      reachClamped(zo, 'R', front(zo, 'chest', .16 * kz, -.04 * kz, -.10 * kz), { grip: 0, pole: [-.36, -.22, .18] });
      PO.fingers(zo, 'R', .2, { spread: .25 });
      reachClamped(zo, 'L', front(zo, 'root', .10 * kz, -.18 * kz, -.06 * kz), { grip: 0, pole: [.3, -.2, -.1] });
    } else {
      // Straightened, pale, staring squarely at him
      for (const s of ['L', 'R']) {
        const sg = s === 'L' ? 1 : -1;
        reachClamped(zo, s, front(zo, 'root', .09 * kz, -sg * .17 * kz, -.06 * kz), { grip: 0, pole: [sg * .3, -.2, -.1] });
      }
    }

    // Father: grave, quiet stillness by the wall
    for (const s of ['L', 'R']) {
      const sg = s === 'L' ? 1 : -1;
      const talkLift = (s === 'R' && IN(2, t)) ? .04 * Math.sin(t * 2.1) : 0;
      reachClamped(fa, s, front(fa, 'root', .10 * kf, -sg * .18 * kf, (-.05 + talkLift) * kf), { grip: 0, pole: [sg * .3, -.22, -.1] });
      PO.fingers(fa, s, .25, { spread: .12 });
    }
    if (IN(2, t)) { fa.B.head.rotation.x += .05 * Math.sin(t * 1.3); fa.B.chest.updateWorldMatrix(false, true); }
  },
});

// b032..b035: chambre_nuit kneeling — Zoubida beats cheeks/pulls hair, father catches her wrists, she collapses, he explains
const nu2 = staged('chambre_nuit', {
  father: { height: 1.76, at: [730, 895], face: 'cam', yaw: .55, pose: 'kneel', o: { grounded: true, lean: .08, avoid: CHEST }, seed: 5, hands: false, look: 'zoubida', lookMax: .75 },
  zoubida: { at: [995, 895], face: 'cam', yaw: -.45, pose: 'kneel', o: { grounded: true, lean: .08, avoid: CHEST }, seed: 7, hands: false },
  mohammed: BED,
}, {
  addressee: { father: 'zoubida', zoubida: 'father' },
  act(lt, t, S, st, S3) {
    bed(S3, st, t);
    const { father: fa, zoubida: zo } = st.A;
    const kf = fa.group.scale.y / 1.6, kz = zo.group.scale.y / 1.6;
    if (!st.gaze) st.gaze = st.G.apply;

    // Keep tabla + tea service visible aside for continuity
    const tbl = st.tbl ||= (() => { const m = PR.tabla({ r: .26, h: .22 }); S3.scene.add(m); return m; })();
    const tblP = S3.floorAt(1135, 935);
    S3.prop(tbl, tblP.x, 0, tblP.z, 0); tbl.visible = true;
    const tray = st.tea ||= makeTeaSet(S3);
    tray.position.copy(tblP).add(V(0, tbl.userData.top, 0));
    tray.rotation.set(0, 0, 0); tray.visible = true; tray.updateMatrixWorld(true);

    // Default relaxed lap rest
    lapRest(fa, kf, t, 5);
    lapRest(zo, kz, t, 7);

    const b5 = B(5), b6 = B(6), u6 = b6[1] > b6[0] ? Math.min(1, Math.max(0, (t - b6[0]) / (b6[1] - b6[0]))) : 0;
    const collapse = IN(6, t) && u6 >= .52;
    const postCollapse = t >= B(7)[0] - .15;

    if (IN(5, t)) {
      // b032: Zoubida drops to kneel, beating cheeks and pulling hair/temples silently (clamped IK <= 0.85*armLen)
      st.G.apply = () => {};
      const phase = Math.max(0, t - b5[0]);
      const beat = Math.sin(phase * 10);
      const hair = sm(b5[0] + 4.5, b5[0] + 6.5, t);
      zo.B.chest.rotation.x += .08 + .04 * Math.abs(beat);
      zo.B.neck.rotation.x += .14;
      zo.B.head.rotation.z += .08 * Math.sin(phase * 7);
      zo.B.head.rotation.y += .07 * Math.sin(phase * 5);
      zo.B.chest.updateWorldMatrix(false, true);
      zo.B.neck.updateWorldMatrix(false, true);

      for (const s of ['L', 'R']) {
        const sg = s === 'L' ? 1 : -1;
        const tap = s === 'L' ? Math.max(0, beat) : Math.max(0, -beat);
        const cheekPt = zo.B.head.localToWorld(V(sg * (.085 + .035 * (1 - tap)), .025, .075));
        const templePt = zo.B.head.localToWorld(V(sg * .092, .085 + .018 * Math.sin(phase * 12 + sg), .025));
        const tg = cheekPt.lerp(templePt, hair);
        reachClamped(zo, s, tg, { grip: 0, pole: [sg * .42, -.28, .22] });
        PO.fingers(zo, s, .15 + .35 * hair, { spread: .35 * (1 - hair) });
      }

      // Father leans forward in alarm near the end of b032
      const react = sm(b5[1] - 1.8, b5[1], t);
      if (react > 0) {
        fa.B.chest.rotation.x += .10 * react;
        for (const s of ['L', 'R']) {
          const sg = s === 'L' ? 1 : -1;
          reachClamped(fa, s, front(fa, 'chest', .24 * kf, -sg * .14 * kf, -.14 * kf), { grip: .02, pole: [sg * .38, -.15, .2] });
        }
      }
    } else if (IN(6, t) && !collapse) {
      // b033 part 1: father kneels close beside her holding both wrists gently as she struggles
      st.G.apply = () => {};
      const str = Math.sin((t - b6[0]) * 8);
      zo.B.chest.rotation.x += .10;
      zo.B.neck.rotation.x += .18;
      zo.B.head.rotation.y += .12 * str;
      zo.B.chest.updateWorldMatrix(false, true);
      for (const s of ['L', 'R']) {
        const sg = s === 'L' ? 1 : -1;
        const zoWristTgt = front(zo, 'chest', .22 * kz, -sg * (.12 + .03 * str) * kz, (-.06 + .04 * Math.abs(str)) * kz);
        reachClamped(zo, s, zoWristTgt, { grip: 0, pole: [sg * .38, -.25, .2] });
        PO.fingers(zo, s, .55, { spread: .1 });
      }
      zo.group.updateMatrixWorld(true);
      fa.B.spine.rotation.x += .08;
      fa.B.chest.rotation.x += .14;
      fa.B.chest.updateWorldMatrix(false, true);
      for (const s of ['L', 'R']) {
        const sg = s === 'L' ? 1 : -1;
        const wr = PO.handPts(zo, s).wrist;
        reachClamped(fa, s, wr, { grip: .02, pole: [sg * .42, -.15, .2] });
        PO.fingers(fa, s, .45, { thumb: .4 });
      }
    } else if (collapse || postCollapse) {
      // b033 part 2 & b034–b035: Zoubida collapsed forward face in hands, father kneeling beside her
      st.G.apply = () => {};
      const sob = .5 + .5 * Math.sin(t * 1.9);
      zo.B.spine.rotation.x += .14;
      zo.B.chest.rotation.x += .18 + .02 * sob;   // keeps pelvis-to-neck pitch < 35° while visibly collapsed forward
      zo.B.chest.updateWorldMatrix(false, true);
      cradleFace(zo, { mode: 'eyes', bow: .24, u: sob });

      if (IN(6, t)) {
        // Father still steadying her near shoulder/wrist gently
        fa.B.chest.rotation.x += .10; fa.B.chest.updateWorldMatrix(false, true);
        reachClamped(fa, 'R', at(zo, 'upperArmL').add(V(-.04, .02, .05)), { grip: .02, pole: [-.4, -.12, .2] });
        PO.fingers(fa, 'R', .2, { spread: .2 });
      } else if (IN(7, t)) {
        // b034: father speaks softly, one calming palm toward her
        PO.look(fa, at(zo, 'head'), .85, { max: .75 });
        reachClamped(fa, 'R', front(fa, 'chest', .22 * kf, -.12 * kf, -.14 * kf), { grip: 0, pole: [-.38, -.18, .18] });
        PO.palmTo(fa, 'R', .7, V(0, 1, .3));
        PO.fingers(fa, 'R', .12, { spread: .25 });
      } else if (IN(8, t)) {
        // b035: open empty hands ("J'ai dû le laisser tomber...")
        PO.look(fa, at(zo, 'head'), .85, { max: .75 });
        for (const s of ['L', 'R']) {
          const sg = s === 'L' ? 1 : -1;
          reachClamped(fa, s, front(fa, 'chest', .24 * kf, -sg * .16 * kf, -.16 * kf), { grip: 0, pole: [sg * .4, -.22, .15] });
          PO.palmTo(fa, s, .85, V(0, 1, .2));
          PO.fingers(fa, s, .05, { spread: .3 });
        }
      }
    } else {
      st.G.apply = st.gaze;
    }
  },
});

export default beatScene(ID, {
  shots: { pa, nu1, nu2 },
  plan: {
    b027: { shot: 'pa', size: 'M', on: 'zoubida', pt: [1010, 775], z: 1.65 },
    b028: { shot: 'nu1', size: 'CU', on: 'zoubida' },
    b029: { shot: 'nu1', size: 'CU', on: 'father' },
    b030: { shot: 'nu1', size: 'M', on: 'zoubida' },
    b031: { shot: 'nu1', size: 'CU', on: 'zoubida' },
    b032: { shot: 'nu2', size: 'M', on: 'zoubida' },
    b033: { shot: 'nu2', size: 'M', on: 'father' },
    b034: { shot: 'nu2', size: 'CU', on: 'father' },
    b035: { shot: 'nu2', size: 'CU', on: 'father', insMove: 'push' },
  },
});
