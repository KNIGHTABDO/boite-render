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
import { cradleFace } from '../lib/fix8_lie.js';
import { armsDown } from '../lib/fix9_C.js';
import { divanBoy } from '../lib/fix9_L.js';
import { beatScene, allLines, sm, at, front, dirW, V } from '../lib/beatscene.js';

const ID = 's06_ruine', L = allLines(ID), B = i => L[i] || [0, 0];
const IN = (i, t) => t >= B(i)[0] - .15 && t < (B(i + 1)?.[0] ?? B(i)[1] + .3);

const MATTRESS = [[1188, 574], [1450, 574], [1455, 688], [1308, 690]];
const CHEST = [[1450, 580], [1830, 580], [1830, 850], [1450, 850]];
const TOP = .26;
const BED = {
  at: [1320, 640], face: [1330, 720], pose: 'lie',
  o: { top: TOP, turn: 0, hands: 'belly', headTurn: -.15, pillow: .1, mattress: MATTRESS, avoid: CHEST },
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
  const g1 = PR.teaGlass({ fill: .75 }); g1.position.set(.12, tr.userData.top, .07); g1.scale.setScalar(1.25);
  const g2 = PR.teaGlass({ fill: .75 }); g2.position.set(-.02, tr.userData.top, .1); g2.scale.setScalar(1.25);
  g.add(tr, pot, g1, g2);
  S3.scene.add(g);
  return g;
}

function bed(S3, st, t) { divanBoy(S3, st, t, { headTurn: -.2, top: TOP }); }

// b027: patio_nuit — Zoubida walks across the central courtyard carrying the tea tray
const pa = staged('patio_nuit', {
  zoubida: {
    height: 1.6, at: [620, 820], face: [780, 760], seed: 7,
    walk: { to: [760, 780], t0: .35, t1: B(0)[0] + 4.8 },
    look: (t, st, S3) => S3.floorAt(700, 1020).setY(1.45), lookMax: 1.35,
  },
}, {
  act(lt, t, S, st, S3) {
    const zo = st.A.zoubida, kz = zo.group.scale.y / 1.6;
    const tray = st.tea ||= makeTeaSet(S3);
    const ctr = front(zo, 'root', .27 * kz, 0, .20 * kz);
    tray.position.copy(ctr);
    tray.rotation.set(0, zo.group.rotation.y, 0);
    tray.rotation.x = 0; tray.rotation.z = 0;
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
  father: { height: 1.76, at: [520, 760], face: 'zoubida', yaw: .25, seed: 5, talk: 0, look: 'zoubida', lookMax: .8 },
  zoubida: { height: 1.6, at: [960, 850], face: 'father', yaw: 1.05, seed: 7, talk: .35,
    look: (t, st, S3) => {
      const f = st.A.father.B.head.getWorldPosition(V(0, 0, 0));
      if (t >= B(3)[0] - .45 && t < B(3)[0] + 1.7) { const p = S3.floorAt(835, 910); p.y = .35; return p.lerp(S3.cam.position, .4); }
      return f.lerp(S3.cam.position, .45);
    }, lookMax: 1.15 },
  mohammed: BED,
}, {
  addressee: { father: 'zoubida', zoubida: 'father' },
  act(lt, t, S, st, S3) {
    bed(S3, st, t);
    const { father: fa, zoubida: zo } = st.A;
    const kz = zo.group.scale.y / 1.6;

    // Tabla on the open floor, clear of the painted lamp table and of her shins.
    const tbl = st.tbl ||= (() => { const m = PR.tabla({ r: .24, h: .28 }); S3.scene.add(m); return m; })();
    const tblP = S3.floorAt(835, 910);
    S3.prop(tbl, tblP.x, 0, tblP.z, 0); tbl.visible = true;

    const tray = st.tea ||= makeTeaSet(S3);
    const heldPos = front(zo, 'root', .36 * kz, .02 * kz, -.04 * kz);
    const restPos = tblP.clone().add(V(0, tbl.userData.top, 0));
    const setDown = t >= B(4)[0] ? 1 : t >= B(3)[0] - .4 ? sm(B(3)[0] - .4, B(3)[0] + 1.5, t) : 0;

    const trayPos = heldPos.clone().lerp(restPos, setDown);
    tray.position.copy(trayPos);
    tray.rotation.set(0, zo.group.rotation.y * (1 - setDown), 0);
    tray.visible = true;
    tray.updateMatrixWorld(true);

    if (setDown < .92) {
      if (setDown > .04) {
        zo.B.spine.rotation.x -= .24 * Math.sin(setDown * Math.PI);
        zo.B.chest.rotation.x -= .16 * Math.sin(setDown * Math.PI);
        zo.B.chest.updateWorldMatrix(false, true);
      }
      for (const s of ['L', 'R']) {
        const sg = s === 'L' ? 1 : -1;
        const rim = trayPos.clone().addScaledVector(dirW(zo, sg, 0, 0), .2 * kz).add(V(0, .03 * kz, 0));
        reachClamped(zo, s, rim, { grip: .01, pole: [sg * .62, .22, .38] });
        PO.fingers(zo, s, .38, { thumb: .3, spread: .12 });
      }
    } else if (IN(4, t)) {
      const trm = .01 * Math.sin(t * 14);
      zo.B.spine.rotation.x += .1;
      zo.B.chest.rotation.x += .12 + trm;
      zo.B.chest.updateWorldMatrix(false, true);
      reachClamped(zo, 'R', front(zo, 'chest', .2 * kz, .1 * kz, -.08 * kz), { grip: 0, pole: [-.16, .04, .1] });
      PO.palmTo(zo, 'R', .75, dirW(zo, 0, .25, 1));
      PO.fingers(zo, 'R', .16, { spread: .22 });
      reachClamped(zo, 'L', front(zo, 'root', .06 * kz, -.32 * kz, -.1 * kz), { grip: .02, pole: [.55, .16, .28] });
    } else {
      armsDown(zo, t, 7);
      zo.B.chest.rotation.x += .04;
    }

    armsDown(fa, t, 5);
    fa.B.chest.rotation.z += .03 * Math.sin(t * .5);
    fa.B.head.rotation.z += .045 * Math.sin(t * .62 + .8);
    fa.B.head.rotation.x += .05 * Math.sin(t * .74);
    if (IN(2, t)) fa.B.head.rotation.x += .1 * Math.sin((t - B(2)[0]) * 1.15);
    fa.B.chest.updateWorldMatrix(false, true);
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
      zo.B.spine.rotation.x -= .1;
      zo.B.chest.rotation.x -= .08 + .04 * Math.abs(beat);
      zo.B.neck.rotation.x -= .06;
      zo.B.head.rotation.z += .08 * Math.sin(phase * 7);
      zo.B.head.rotation.y += .07 * Math.sin(phase * 5);
      zo.B.chest.updateWorldMatrix(false, true);
      zo.B.neck.updateWorldMatrix(false, true);

      for (const s of ['L', 'R']) {
        const sg = s === 'L' ? 1 : -1;
        const tap = s === 'L' ? Math.max(0, beat) : Math.max(0, -beat);
        const cheekPt = zo.B.head.localToWorld(V(sg * .1, .09, .08));
        const templePt = zo.B.head.localToWorld(V(sg * .12, .14 + .02 * Math.sin(phase * 12 + sg), .04));
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
      zo.B.spine.rotation.x -= .16;
      zo.B.chest.rotation.x -= .14 + .02 * sob;
      zo.B.neck.rotation.x -= .1;
      zo.B.head.rotation.x -= .08;
      zo.B.chest.updateWorldMatrix(false, true);
      cradleFace(zo, { mode: 'eyes', bow: .12, u: sob });

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
          reachClamped(fa, s, front(fa, 'chest', .22 * kf, -sg * .16 * kf, .02 * kf), { grip: 0, pole: [sg * .4, .08, .2] });
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
    b027: { shot: 'pa', size: 'M', on: 'zoubida', pt: [690, 800], segs: [[.48, 'nu1', {}]], cover: [{ f: .48, shot: 'nu1', size: 'W', on: 'zoubida' }] },
    b028: { shot: 'nu1', size: 'W', on: 'zoubida' },
    b029: { shot: 'nu1', size: 'CU', on: 'father', z: 2.8, dy: -48 },
    b030: { shot: 'nu1', size: 'W', on: 'zoubida' },
    b031: { shot: 'nu1', size: 'CU', on: 'zoubida', z: 3.4, dx: -16, dy: 6 },
    b032: { shot: 'nu2', size: 'W', on: 'zoubida' },
    b033: { shot: 'nu2', size: 'W', on: 'father' },
    b034: { shot: 'nu2', size: 'W', on: 'father' },
    b035: { shot: 'nu2', size: 'CU', on: 'father', z: 2.55, dy: -18, insAt: 0, insMove: 'push', segs: [[.55, 'i_mouchoir_argent', { move: 'push' }], [.72, 'nu2', {}]] },
  },
});
