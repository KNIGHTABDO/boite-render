// s17 "L'omelette et la histoire de Tante Kanza".
// b102 chambre_jour (fadeIn 0.7): Zoubida kneels beside the right divan and taps Mohammed awake; he yawns in the morning sun.
// b103 chambre_jour: Mohammed sits up eagerly on the divan ("œufs à l'huile, piment rouge et persil"); auto-insert omelette_epices.
// b104 chambre_jour: Zoubida smiles indulgently ("une pincée de cumin").
// b105 patio_matin: Rahma laughs merrily in the sunlit courtyard calling up vers la fenêtre d'en face ("une omelette juive !").
// b106 chambre_jour: Zoubida chuckles warmly back toward the window ("envies comme une femme enceinte").
// b107 patio_matin: two distinct courtyard neighbours (woman1 taller terracotta, woman2 shorter sage-teal) laugh together au fil du récit.
// b108 painting p13_laitier_fromage: the stingy milkman and the baby marked with white cheese.
// b109 patio_matin: voisine (en robe prune) delivers her deadpan serious nod and quip.
import * as PO from '../../../engine/poses.js';
import * as PR from '../../../engine/props3d.js';
import { staged } from '../lib/autostage.js';
import { lieOnBed, pillowUnder } from '../lib/fix8_lie.js';
import { dyeGarment, hangSash, reachClamp } from '../lib/fix9_E.js';
import { faceLens, pinCloth } from '../lib/fix9_J.js';
import { beatScene, lines, sm, at, front, dirW, V } from '../lib/beatscene.js';

const ID = 's17_omelette_kanza', L = lines(ID), B = i => L[i] || [0, 0];
const IN = (i, t) => t >= B(i)[0] - .15 && t < (B(i + 1)[0] || B(i)[1] + .3);

const MATTRESS = [[1188, 574], [1450, 574], [1455, 688], [1308, 690]];
const CHEST = [[1450, 580], [1830, 580], [1830, 850], [1450, 850]];
const TOP = .26;

function clampReach(a, side, target, o) {
  const sh = at(a, 'upperArm' + side);
  const len = sh.distanceTo(at(a, 'foreArm' + side)) + at(a, 'foreArm' + side).distanceTo(at(a, 'hand' + side));
  const d = target.clone().sub(sh);
  if (d.length() > len * .85) target = sh.clone().addScaledVector(d.normalize(), len * .85);
  return PO.reach(a, side, target, o);
}

function lap(a, side, k, drift = 0) {
  const sg = side === 'L' ? 1 : -1;
  const tg = PO.hipToWorld(a, sg * .15 * k, (.05 + drift) * k, .21 * k);
  clampReach(a, side, tg, { grip: .02, pole: [sg * .32, .05, .1] });
  PO.fingers(a, side, .28, { spread: .12 });
}

// b102: Zoubida kneels on the floor beside the right divan and taps Mohammed awake; he yawns.
const ch1 = staged('chambre_jour', {
  mohammed: {
    at: [1340, 648], face: [1200, 820], pose: 'lie',
    o: { top: TOP, turn: .1, hands: 'belly', headTurn: -.2, pillow: .08, mattress: MATTRESS, avoid: CHEST },
    seed: 3, talk: 0,
    lids: t => {
      const wake = sm(B(0)[0] + 1.4, B(0)[0] + 3.4, t);
      const yawn = sm(B(0)[0] + 2.6, B(0)[0] + 3.5, t) * (1 - sm(B(0)[0] + 5.0, B(0)[0] + 5.8, t));
      return .9 * (1 - wake) + .25 * yawn;
    },
    mutter: t => sm(B(0)[0] + 2.6, B(0)[0] + 3.4, t) * (1 - sm(B(0)[0] + 4.8, B(0)[0] + 5.6, t)),
  },
  zoubida: {
    at: [1210, 760], face: 'mohammed', pose: 'kneel', hands: false,
    o: { grounded: true, lean: .16, avoid: CHEST },
    seed: 7,
    look: (t, st) => at(st.A.mohammed, 'head'),
    lookMax: .75,
  },
}, {
  act(lt, t, S, st, S3) {
    const { mohammed: mo, zoubida: zo } = st.A, kz = zo.group.scale.y / 1.6, km = mo.group.scale.y / 1.6;
    lieOnBed(mo, {
      top: TOP, feet: [.18, -.98],
      origin: (st.mo0 ||= mo.group.position.clone()),
      hands: 'belly', pillow: .08, tuck: .16, headTurn: -.22, sink: 0,
    });
    pillowUnder(S3, st, mo, { top: TOP, h: .08, col: 0x3b5875 });
    // Blanket stays on the chest so the feet sit on the mattress, not under the red cloth.
    st.cover ||= PR.blanket({ w: .32, l: .3, h: .045, col: 0xb24a34 });
    const chest = mo.B.chest.getWorldPosition(V(0, 0, 0));
    S3.prop(st.cover, chest.x, TOP + .03, chest.z, mo.group.rotation.y);
    st.cover.visible = true;
    st.cover.userData.ambient = true;
    st.pillow.userData.ambient = true;
    for (const n of ['SkirtFront2', 'SkirtBack2']) if (mo.B[n]) mo.B[n].scale.y *= .78;
    for (const [s, sg] of [['L', 1], ['R', -1]]) {
      mo.B['foot' + s].rotation.x = -.15;
      mo.B['foot' + s].rotation.z = sg * .08;
    }

    const yawn = sm(B(0)[0] + 2.4, B(0)[0] + 3.4, t) * (1 - sm(B(0)[0] + 4.8, B(0)[0] + 5.8, t));
    // A full head-throw lifts the skull off the pillow. The mouth still opens; the tilt stays small.
    mo.B.neck.rotation.x -= .04 * yawn;
    mo.B.head.rotation.x -= .025 * yawn;
    mo.B.head.rotation.z += .04 * Math.sin(t * 1.4) * yawn;
    mo.B.chest.updateWorldMatrix(false, true);
    // Hands stay beside the ribs, low, so the forearm clears the torso and the chest band stays on the mattress.
    const sideL = dirW(mo, 1, 0, 0), sideR = dirW(mo, -1, 0, 0);
    const bellyL = at(mo, 'chest').addScaledVector(sideL, .14 * km).add(V(0, .01 * km, .04));
    const stretch = at(mo, 'upperArmL').clone().addScaledVector(sideL, .16 * km).add(V(0, .05 * km, .03));
    const bellyR = at(mo, 'chest').addScaledVector(sideR, .14 * km).add(V(0, .01 * km, .04));
    reachClamp(mo, 'L', bellyL.clone().lerp(stretch, yawn), { grip: .02, pole: [.35, .04, .08] });
    PO.fingers(mo, 'L', .15, { spread: .2 });
    reachClamp(mo, 'R', bellyR, { grip: .02, pole: [-.32, .04, .08] });
    PO.fingers(mo, 'R', .2, { spread: .12 });
    // The chest band sits ~3.8cm off the mattress. A 1.1cm drop brings it inside 3cm
    // and leaves the back, head and heels inside their own contact band.
    mo.group.position.y -= .011;
    mo.group.updateMatrixWorld(true);

    // Body toward the lens; the head still turns toward him within lookMax.
    faceLens(zo, S3.cam.position, 1);
    hangSash(zo);
    const tap = sm(B(0)[0] - .5, B(0)[0] + .35, t) * (1 - sm(B(0)[0] + 2.2, B(0)[0] + 3.1, t));
    const pat = .03 * Math.sin(t * 9) * tap;
    zo.B.spine.rotation.x += .2 * tap;
    zo.B.chest.rotation.x += .08 * tap;
    zo.B.chest.updateWorldMatrix(false, true);
    const shoulder = at(mo, 'upperArmL').clone().add(V(0, .06 + pat, .02));
    const thigh = PO.hipToWorld(zo, -.2 * kz, .02 * kz, .16 * kz);
    reachClamp(zo, 'R', thigh.clone().lerp(shoulder, tap), { grip: .015, pole: [-.35, .15, .2] });
    PO.fingers(zo, 'R', .18 + .1 * tap, { spread: .16 });
    const park = PO.hipToWorld(zo, .22 * kz, .0 * kz, .12 * kz);
    reachClamp(zo, 'L', park, { grip: .02, pole: [.3, .02, .05] });
    PO.fingers(zo, 'L', .25, { spread: .1 });
    pinCloth(zo, 0);
  },
});

// b103, b104, b106: Mohammed seated eagerly on the divan, Zoubida smiling & chuckling warmly
const ch2 = staged('chambre_jour', {
  mohammed: {
    at: [1350, 694], face: 'cam', yaw: -.65, pose: 'cross',
    o: { seat: TOP, floor: TOP, lean: .08, mattress: MATTRESS, avoid: CHEST },
    seed: 3, look: 'zoubida', lookMax: .55,
  },
  zoubida: {
    at: [1005, 690], face: 'cam', yaw: .62, pose: 'kneel',
    o: { grounded: true, lean: .08, avoid: CHEST },
    seed: 7,
    look: t => IN(4, t) ? [650, 740, 1.35] : 'mohammed',
    lookMax: .54,
  },
}, {
  act(lt, t, S, st, S3) {
    const { mohammed: mo, zoubida: zo } = st.A;
    const km = mo.group.scale.y / 1.6, kz = zo.group.scale.y / 1.6;
    pillowUnder(S3, st, mo, { top: TOP, h: .08, col: 0x3b5875 });
    st.pillow.visible = false;

    const eager = IN(1, t) ? 1 : 0;
    const grin = IN(2, t) ? 1 : 0;
    const chuckle = IN(4, t) ? 1 : 0;

    if (eager) {
      const bob = Math.sin(t * 3.4);
      mo.B.chest.rotation.x -= .04 * (.5 + .5 * bob);
      mo.B.head.rotation.z += .05 * Math.sin(t * 2.1);
      for (const [sd, sg] of [['L', 1], ['R', -1]]) {
        const tg = front(mo, 'chest', .22 * km, -sg * .15 * km, (-.06 + .04 * (sg > 0 ? bob : -bob)) * km);
        clampReach(mo, sd, tg, { grip: .02, pole: [sg * .45, .05, .25] });
        PO.fingers(mo, sd, .18, { spread: .25 });
      }
    } else {
      mo.B.head.rotation.x += .04 * Math.sin(t * 1.4);
      lap(mo, 'L', km, .01 * Math.sin(t * .9));
      lap(mo, 'R', km, .01 * Math.sin(t * .9 + 1.4));
    }
    mo.B.chest.updateWorldMatrix(false, true);

    if (chuckle) {
      const sh = Math.sin(t * 11);
      zo.B.chest.rotation.x += .04 * sh;
      zo.B.chest.rotation.z += .03 * Math.sin(t * 2.2);
      zo.B.head.rotation.x -= .06;
      const waveR = front(zo, 'chest', .24 * kz, .16 * kz, -.02 * kz + .03 * Math.sin(t * 3.2) * kz);
      clampReach(zo, 'R', waveR, { grip: .02, pole: [-.48, .05, .25] });
      PO.palmTo(zo, 'R', .7, V(0, 1, .2));
      PO.fingers(zo, 'R', .14, { spread: .3 });
      lap(zo, 'L', kz, .01 * Math.sin(t * 1.3));
    } else if (grin) {
      zo.B.head.rotation.z += .06 * Math.sin(t * 1.6);
      zo.B.chest.rotation.x += .02 * Math.sin(t * 1.2);
      const gestL = front(zo, 'chest', .22 * kz, -.15 * kz, -.06 * kz + .02 * Math.sin(t * 2.6) * kz);
      clampReach(zo, 'L', gestL, { grip: .02, pole: [.48, .05, .25] });
      PO.fingers(zo, 'L', .2, { spread: .25 });
      lap(zo, 'R', kz, .01 * Math.sin(t * 1.1));
    } else {
      zo.B.chest.rotation.z += .025 * Math.sin(t * .9);
      lap(zo, 'L', kz, .01 * Math.sin(t * 1.1));
      lap(zo, 'R', kz, .01 * Math.sin(t * 1.1 + 1.5));
    }
    zo.B.chest.updateWorldMatrix(false, true);
  },
});

// b105: Rahma in the sunlit courtyard calling up toward the opposite window
const pa1 = staged('patio_matin', {
  rahma: {
    at: [1100, 960], face: 'cam', yaw: -.22, seed: 9,
    look: [760, 820, 2.05], lookMax: .7,
  },
}, {
  act(lt, t, S, st) {
    const ra = st.A.rahma, k = ra.group.scale.y / 1.6;
    const sh = Math.sin(t * 10);
    ra.B.spine.rotation.x += .06;
    ra.B.chest.rotation.x += .04 * sh;
    ra.B.head.rotation.x -= .08;
    ra.B.head.rotation.z += .05 * Math.sin(t * 2.4);
    ra.B.chest.updateWorldMatrix(false, true);
    const tgR = front(ra, 'chest', .26 * k, .16 * k, (-.04 + .03 * Math.sin(t * 3.1)) * k);
    const tgL = front(ra, 'chest', .24 * k, -.16 * k, (-.08 + .02 * Math.cos(t * 2.6)) * k);
    clampReach(ra, 'R', tgR, { grip: .02, pole: [-.48, .05, .24] });
    clampReach(ra, 'L', tgL, { grip: .02, pole: [.48, .05, .24] });
    PO.palmTo(ra, 'R', .7, V(0, 1, .2));
    PO.fingers(ra, 'R', .12, { spread: .3 });
    PO.fingers(ra, 'L', .2, { spread: .2 });
  },
});

// b107: taller terracotta woman1 and shorter sage woman2, three-quarter toward camera, laughing
const pa2 = staged('patio_matin', {
  woman1: {
    at: [880, 1005], face: [1080, 1160], height: 1.67, seed: 11, talk: 0,
    look: 'woman2', lookMax: .7,
  },
  woman2: {
    at: [1140, 1012], face: [940, 1160], height: 1.53, seed: 13, talk: 0,
    look: 'woman1', lookMax: .7,
  },
}, {
  act(lt, t, S, st) {
    const { woman1: w1, woman2: w2 } = st.A;
    dyeGarment(w1, { hue: 40, span: 14, to: 10, minS: .38 });
    dyeGarment(w2, { hue: 348, span: 16, to: 168, minS: .36 });
    for (const [a, ph, f, sd] of [[w1, 0, 9, 'R'], [w2, 1.6, 11, 'L']]) {
      const k = a.group.scale.y / 1.6, osd = sd === 'L' ? 'R' : 'L';
      const sg = sd === 'L' ? 1 : -1, osg = -sg;
      const sh = Math.sin(t * f + ph);
      a.B.spine.rotation.x -= .06;
      a.B.chest.rotation.x += .07 * sh;
      a.B.chest.rotation.z += .05 * Math.sin(t * 2.2 + ph);
      a.B.neck.rotation.x -= .12;
      a.B.head.rotation.z += sg * .1 * Math.sin(t * 2.4 + ph);
      a.B.chest.updateWorldMatrix(false, true);
      const hi = front(a, 'chest', .28 * k, -sg * .2 * k, (.08 + .04 * sh) * k);
      const lo = front(a, 'chest', .22 * k, -osg * .22 * k, (-.06 + .02 * Math.cos(t * 2.6 + ph)) * k);
      reachClamp(a, sd, hi, { grip: .02, pole: [sg * .4, .12, .2] });
      reachClamp(a, osd, lo, { grip: .02, pole: [osg * .35, .08, .15] });
      PO.fingers(a, sd, .16, { spread: .28 });
      PO.fingers(a, osd, .22, { spread: .18 });
    }
  },
});

// b109: voisine in a plum robe, turned toward the other neighbours, nodding at her cheek
const pa3 = staged('patio_matin', {
  voisine: {
    at: [1020, 990], face: [760, 1120], height: 1.58, seed: 19, lids: .15,
    look: [740, 1000, 1.45], lookMax: .65,
  },
}, {
  act(lt, t, S, st) {
    const vo = st.A.voisine, k = vo.group.scale.y / 1.6;
    dyeGarment(vo, { hue: 40, span: 14, to: 322, minS: .38 });
    const c = t - B(7)[0];
    const nod = Math.max(0, Math.sin(c * 2.3));
    vo.B.spine.rotation.z += .04;
    vo.B.neck.rotation.x += .22 * nod;
    vo.B.head.rotation.x += .2 * nod;
    vo.B.head.rotation.z += .05;
    vo.B.chest.updateWorldMatrix(false, true);
    const cheek = at(vo, 'head').addScaledVector(dirW(vo, -1, 0, 0), .1 * k).addScaledVector(dirW(vo, 0, 0, 1), .06 * k).add(V(0, .03 * k, 0));
    reachClamp(vo, 'R', cheek, { grip: .01, pole: [-.35, .2, .15] });
    PO.fingers(vo, 'R', .35, { spread: .08 });
    const down = at(vo, 'upperArmL');
    const len = down.distanceTo(at(vo, 'foreArmL')) + at(vo, 'foreArmL').distanceTo(at(vo, 'handL'));
    reachClamp(vo, 'L', down.clone().addScaledVector(dirW(vo, 1, 0, 0), .08 * k).add(V(0, -.78 * len, 0)), { grip: 0, pole: [.25, .04, -.25] });
    PO.fingers(vo, 'L', .32, { spread: .1 });
  },
});

export default beatScene(ID, {
  shots: { ch1, ch2, pa1, pa2, pa3 },
  fadeIn: .7,
  plan: {
    b102: { shot: 'ch1', size: 'M', on: 'zoubida', z: 2.05, dx: 70, dy: 10 },
    b103: { shot: 'ch2', size: 'CU', on: 'mohammed', z: 3.1, dx: 20, dy: -20 },
    b104: { shot: 'ch2', size: 'CU', on: 'zoubida', z: 2.5, dx: 40, dy: -30 },
    b105: { shot: 'pa1', size: 'M', on: 'rahma', z: 1.75, dy: -20 },
    b106: { shot: 'ch2', size: 'M', on: 'zoubida', z: 1.65, dx: 70, dy: -25 },
    b107: { shot: 'pa2', size: 'M', on: 'woman1', z: 2.05, dx: 140, dy: 16 },
    b108: { move: 'push' },
    b109: { shot: 'pa3', size: 'CU', on: 'voisine', z: 2.9, dy: 12 },
  },
});
