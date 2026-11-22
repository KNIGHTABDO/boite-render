// s06_ruine.js — La ruine.
// Rooms: patio_nuit, chambre_nuit.
// Cast placements:
//   - pa (patio_nuit): Zoubida standing on the central courtyard floor [915, 725] walking toward [1100, 825] carrying the brass tea tray, teapot, and two glasses.
//   - nu1 (chambre_nuit): le père standing grave near the left wall [520, 870]; Zoubida standing right-centre [960, 895] facing him across a low tabla [835, 910]; l'enfant lying on the right divan [1350, 694].
//   - nu2 (chambre_nuit): le père kneeling left-centre [730, 895] and Zoubida kneeling beside him [995, 895] (grounded: true, lean: .08); tabla + tea service parked aside [1120, 935]; l'enfant lying on the right divan [1350, 694].
// Beat-by-beat visual actions:
//   - b027 (patio_nuit, M): Zoubida walks softly across the dark courtyard carrying the brass tea tray with teapot and glasses.
//   - b028 (chambre_nuit, W): Zoubida looks up puzzled holding the tray ("Tu ne prends pas de thé ?") toward the father standing grave by the wall.
//   - b029 (chambre_nuit, CU): Father still and grave by the wall ("Non. Ne gaspille plus ton sucre...").
//   - b030 (chambre_nuit, W): Zoubida turns pale, slowly sets the tea tray down on the low tabla, and straightens to face the father squarely.
//   - b031 (chambre_nuit, CU): Zoubida trembles ("Je pressens un grand malheur"), hand rising near her chest.
//   - b032 (chambre_nuit, W): Zoubida drops to kneel on the floor, beating her cheeks and tearing at her hair/temples in silent despair while Mohammed watches from bed.
//   - b033 (chambre_nuit, W): Father kneels beside Zoubida and catches/holds both of her wrists gently until she collapses forward face toward her hands/floor.
//   - b034 (chambre_nuit, W): Father kneels gently beside bowed Zoubida, explaining softly he lost their working capital at the haïk auctions.
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
    const sw = .008 * Math.sin(t * .9 + seed + sg);
    const p = PO.hipToWorld(a, sg * .18 * k, (.07 + sw) * k, .25 * k);
    reachClamped(a, s, p, { grip: .03, pole: [sg * .9, .2, .5] });
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
  lieOnBed(mo, {
    top: TOP, feet: [.5, .87],
    origin: (st.mo0 ||= mo.group.position.clone()).clone().add(V(.04, 0, 0)),
    hands: 'belly', pillow: .08, tuck: .22, headTurn: -.12,
  });
  pillowUnder(S3, st, mo, { top: TOP, h: .08, col: 0x2c3a56 });
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

// chambre_nuit standing — Zoubida brings tray, father refuses grave by wall, she sets tray down
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

    // Low tabla between them for setting the tray down at the third beat
    const tbl = st.tbl ||= (() => { const m = PR.tabla({ r: .26, h: .26 }); S3.scene.add(m); return m; })();
    const tblP = S3.floorAt(800, 900);
    S3.prop(tbl, tblP.x, 0, tblP.z, 0); tbl.visible = true;

    const tray = st.tea ||= makeTeaSet(S3);
    const heldPos = front(zo, 'root', .29 * kz, 0, .20 * kz);
    const restPos = tblP.clone().add(V(0, tbl.userData.top, 0));
    const setDown = IN(3, t) ? sm(B(3)[0] + .3, B(3)[0] + 2.6, t) : (t >= B(4)[0] ? 1 : 0);

    const trayPos = heldPos.clone().lerp(restPos, setDown);
    tray.position.copy(trayPos);
    tray.rotation.set(0, zo.group.rotation.y * (1 - setDown), 0);
    tray.visible = true;
    tray.updateMatrixWorld(true);

    // Zoubida arms: lean chest BEFORE IK so arms never swing into torso, then hold/set tray
    if (setDown < .85) {
      if (setDown > .05) {
        zo.B.spine.rotation.x += .10 * Math.sin(setDown * Math.PI);
        zo.B.chest.rotation.x += .16 * Math.sin(setDown * Math.PI);
        zo.B.chest.updateWorldMatrix(false, true);
      }
      for (const s of ['L', 'R']) {
        const sg = s === 'L' ? 1 : -1;
        const rim = trayPos.clone().addScaledVector(dirW(zo, sg, 0, 0), .19 * kz).add(V(0, .025 * kz, 0));
        reachClamped(zo, s, rim, { grip: .01, pole: [sg * .9, .2, .5] });
        PO.fingers(zo, s, .32, { thumb: .25, spread: .15 });
      }
    } else if (IN(4, t)) {
      // "Je pressens un grand malheur." — trembling breath, right hand raised forward near chest
      const trm = .008 * Math.sin(t * 14);
      zo.B.chest.rotation.x += .04 + trm;
      reachClamped(zo, 'R', front(zo, 'chest', .24 * kz, .15 * kz, -.08 * kz), { grip: 0, pole: [-.9, .2, .5] });
      PO.fingers(zo, 'R', .2, { spread: .25 });
      reachClamped(zo, 'L', front(zo, 'root', .22 * kz, -.20 * kz, -.08 * kz), { grip: 0, pole: [.9, .2, .5] });
    } else {
      // Straightened, pale, staring squarely at him
      for (const s of ['L', 'R']) {
        const sg = s === 'L' ? 1 : -1;
        reachClamped(zo, s, front(zo, 'root', .22 * kz, -sg * .20 * kz, -.08 * kz), { grip: 0, pole: [sg * .9, .2, .5] });
      }
    }

    // Father: grave, quiet stillness by the wall
    for (const s of ['L', 'R']) {
      const sg = s === 'L' ? 1 : -1;
      const talkLift = (s === 'R' && IN(2, t)) ? .04 * Math.sin(t * 2.1) : 0;
      reachClamped(fa, s, front(fa, 'root', .22 * kf, -sg * .20 * kf, (-.07 + talkLift) * kf), { grip: 0, pole: [sg * .9, .2, .5] });
      PO.fingers(fa, s, .25, { spread: .12 });
    }
    if (IN(2, t)) { fa.B.head.rotation.x += .05 * Math.sin(t * 1.3); fa.B.chest.updateWorldMatrix(false, true); }
  },
});

// chambre_nuit kneeling — Zoubida beats cheeks/pulls hair, father catches her wrists, she collapses, he explains
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
      // Zoubida drops to kneel, beating cheeks and pulling hair/temples silently (clamped IK <= 0.85*armLen)
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
        const cheekPt = zo.B.head.localToWorld(V(sg * (.105 + .03 * (1 - tap)), .055, .105));
        const templePt = zo.B.head.localToWorld(V(sg * .11, .095 + .015 * Math.sin(phase * 12 + sg), .065));
        const tg = cheekPt.lerp(templePt, hair);
        reachClamped(zo, s, tg, { grip: 0, pole: [sg * .9, .2, .5] });
        PO.fingers(zo, s, .15 + .35 * hair, { spread: .35 * (1 - hair) });
      }

      // Father leans forward in alarm near the end of the beat
      const react = sm(b5[1] - 1.8, b5[1], t);
      if (react > 0) {
        fa.B.chest.rotation.x += .10 * react;
        for (const s of ['L', 'R']) {
          const sg = s === 'L' ? 1 : -1;
          reachClamped(fa, s, front(fa, 'chest', .25 * kf, -sg * .18 * kf, -.14 * kf), { grip: .02, pole: [sg * .9, .2, .5] });
        }
      }
    } else if (IN(6, t) && !collapse) {
      // Struggle part 1: father kneels close beside her holding both wrists gently without crossing arms
      st.G.apply = () => {};
      const str = Math.sin((t - b6[0]) * 8);
      zo.B.chest.rotation.x += .10;
      zo.B.neck.rotation.x += .18;
      zo.B.head.rotation.y += .12 * str;
      zo.B.chest.updateWorldMatrix(false, true);
      for (const s of ['L', 'R']) {
        const sg = s === 'L' ? 1 : -1;
        const zoWristTgt = front(zo, 'chest', .24 * kz, -sg * (.15 + .03 * str) * kz, (-.06 + .04 * Math.abs(str)) * kz);
        reachClamped(zo, s, zoWristTgt, { grip: 0, pole: [sg * .9, .2, .5] });
        PO.fingers(zo, s, .55, { spread: .1 });
      }
      zo.group.updateMatrixWorld(true);
      fa.B.spine.rotation.x += .08;
      fa.B.chest.rotation.x += .14;
      fa.B.chest.updateWorldMatrix(false, true);
      for (const s of ['L', 'R']) {
        const sg = s === 'L' ? 1 : -1;
        const zs = s === 'L' ? 'R' : 'L';
        const wr = PO.handPts(zo, zs).wrist;
        reachClamped(fa, s, wr, { grip: .04, pole: [sg * .9, .2, .5] });
        PO.fingers(fa, s, .45, { thumb: .4 });
      }
      st.actcheck = {
        contacts: [{
          actors: ['father', 'zoubida'],
          parts: ['foreArmL:foreArmR', 'foreArmL:upperArmR', 'handL:foreArmR', 'handL:upperArmR', 'handL:handR', 'foreArmR:foreArmL', 'handR:foreArmL', 'handR:handL'],
        }],
      };
    } else if (collapse || postCollapse) {
      st.actcheck = {};
      // Zoubida collapsed forward face in hands, father kneeling beside her
      st.G.apply = () => {};
      const sob = .5 + .5 * Math.sin(t * 1.9);
      zo.B.spine.rotation.x += .14;
      zo.B.chest.rotation.x += .18 + .02 * sob;   // keeps pelvis-to-neck pitch < 35° while visibly collapsed forward
      zo.B.chest.updateWorldMatrix(false, true);
      cradleFace(zo, { mode: 'eyes', bow: .24, u: sob });

      if (IN(6, t)) {
        // Father still steadying near shoulder/arm gently
        fa.B.chest.rotation.x += .10; fa.B.chest.updateWorldMatrix(false, true);
        reachClamped(fa, 'R', at(zo, 'upperArmL').add(V(-.04, .02, .05)), { grip: .02, pole: [-.9, .2, .5] });
        PO.fingers(fa, 'R', .2, { spread: .2 });
      } else if (IN(7, t)) {
        // Father speaks softly, one calming palm toward her
        PO.look(fa, at(zo, 'head'), .85, { max: .75 });
        reachClamped(fa, 'R', front(fa, 'chest', .26 * kf, .18 * kf, -.14 * kf), { grip: 0, pole: [-.9, .2, .5] });
        PO.palmTo(fa, 'R', .7, V(0, 1, .3));
        PO.fingers(fa, 'R', .12, { spread: .25 });
      } else if (IN(8, t)) {
        // Open empty hands ("J'ai dû le laisser tomber...")
        PO.look(fa, at(zo, 'head'), .85, { max: .75 });
        for (const s of ['L', 'R']) {
          const sg = s === 'L' ? 1 : -1;
          reachClamped(fa, s, front(fa, 'chest', .26 * kf, -sg * .18 * kf, -.15 * kf), { grip: 0, pole: [sg * .9, .2, .5] });
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
    b028: { shot: 'nu1', size: 'W', on: 'zoubida' },
    b029: { shot: 'nu1', size: 'CU', on: 'father', z: 1.3, dy: -70 },
    b030: { shot: 'nu1', size: 'W', on: 'zoubida' },
    b031: { shot: 'nu1', size: 'CU', on: 'zoubida', z: 1.5, dy: -65 },
    b032: { shot: 'nu2', size: 'W', on: 'zoubida' },
    b033: { shot: 'nu2', size: 'W', on: 'father' },
    b034: { shot: 'nu2', size: 'W', on: 'father' },
    b035: { shot: 'nu2', size: 'CU', on: 'father', z: 2.1, dy: -75, insMove: 'push' },
  },
});
