// s19 "À travers la médina".
// Rooms: rue_tijani (b116–b118, b122–b126), rue_legumes (b119–b121).
// Cast & placements:
//   - tj1 (rue_tijani, b116–b118): mohammed walks [960, 760] -> [1150, 875], zoubida (costume: 'haik') walks [1220, 730] -> [1440, 875] beside the right zellige wall & bronze offering grille.
//   - lg  (rue_legumes, b119–b121): marchand on the right near the vegetable crates at [1340, 855] facing 3/4 toward zoubida (costume: 'haik') at [1040, 860] and mohammed at [820, 880].
//   - tj2 (rue_tijani, b122–b125): zoubida (costume: 'haik') at [1040, 855] and mohammed at [830, 860] facing 3/4 toward camera and the monumental bronze portal on the left wall [490, 760].
// Beat actions:
//   - b116: Mohammed walks eagerly ahead; Zoubida reaches her right hand into the bronze offering hole on the right wall (ins: tronc_tijani).
//   - b117: Zoubida leans her cheek toward the carved woodwork; Mohammed leans to kiss the cool mosaic dado below.
//   - b118: Zoubida looks down tenderly at Mohammed and calls him along.
//   - b119: Zoubida pokes toward the pepper and tomato crates; marchand steps/leans forward angrily.
//   - b120: Furious marchand waves his hands at Zoubida ("Cette marchandise n'est pas à vendre !").
//   - b121: Dignified Zoubida turns away while Mohammed tugs her sleeve/haik toward screen-left.
//   - b122: Both pause gazing up at the towering bronze-studded portal on the left wall (ins: portail_bronze).
//   - b123: Mohammed points up toward the portal asking who owns the great house.
//   - b124: Zoubida glances cautiously left explaining it is an office of the Christians.
//   - b125: Mohammed asks innocently if he will speak their language when grown.
//   - b126: Zoubida gives a quick protective tug toward l'enfant ("Dieu te préserve !").
import * as PO from '../../../engine/poses.js';
import { staged } from '../lib/autostage.js';
import { castScale, faceCam, sealHaik, stride } from '../lib/fix8c.js';
import { haikTuck } from '../lib/fix8_G4.js';
import { beatScene, lines, sm, at, front, dirW, V } from '../lib/beatscene.js';

const ID = 's19_medina', L = lines(ID), B = i => L[i] || [0, 0];
const IN = (i, t) => t >= B(i)[0] - .15 && t < (B(i + 1)[0] || B(i)[1] + .3);

/** Clamp every IK reach target to <= 0.85 * armLen so IK error stays < 0.03. */
function reach85(a, side, target, o = {}) {
  const sh = at(a, 'upperArm' + side);
  const len = sh.distanceTo(at(a, 'foreArm' + side)) + at(a, 'foreArm' + side).distanceTo(at(a, 'hand' + side));
  const d = target.clone().sub(sh), max = len * .85;
  const tgt = d.length() > max ? sh.clone().addScaledVector(d.normalize(), max) : target;
  return PO.reach(a, side, tgt, o);
}

function hand85(a, side, { fwd = .16, out = .08, drop = .18, curl = .25, spread = .15 } = {}) {
  const k = a.group.scale.y / 1.6, sg = side === 'L' ? 1 : -1;
  const sh = at(a, 'upperArm' + side);
  const lat = sh.clone().sub(at(a, 'chest')).setY(0);
  if (lat.lengthSq() < 1e-8) lat.copy(dirW(a, sg, 0, 0)); else lat.normalize();
  const tg = sh.clone().addScaledVector(lat, out * k).addScaledVector(dirW(a, 0, 0, 1), fwd * k).add(V(0, -drop * k, 0));
  reach85(a, side, tg, { grip: .015, pole: [sg * .45, .02, -.28] });
  if (curl != null) PO.fingers(a, side, curl, { spread });
}

// b116–b118: rue_tijani right zellige wall & bronze offering grille
const tj1 = staged('rue_tijani', {
  mohammed: {
    at: [960, 760], face: [1150, 880], seed: 3, lookMax: .55,
    walk: { to: [1150, 875], t0: B(0)[0] + .2, t1: B(0)[0] + 4.8 },
    look: t => IN(0, t) && t < B(0)[0] + 5.0 ? [1120 + 200 * Math.sin(t * 1.7), 860, 1.1]
      : IN(1, t) ? [1480, 935, .85] : 'zoubida',
  },
  zoubida: {
    at: [1220, 730], face: [1440, 875], costume: 'haik', seed: 7, lookMax: .55,
    walk: { to: [1440, 875], t0: B(0)[0] + .4, t1: B(0)[0] + 5.4 },
    look: t => IN(2, t) ? 'mohammed' : [1520, 950, 1.25],
  },
}, {
  addressee: { zoubida: 'mohammed', narrator: 'zoubida' },
  act(lt, t, S, st, S3) {
    const { mohammed: mo, zoubida: zo } = st.A;
    castScale(mo); castScale(zo);
    sealHaik(zo);
    st.actcheck = { exposed: { zoubida: ['handL', 'handR', 'foreArmL', 'foreArmR'] } };

    if (t > B(0)[0] + .2 && t < B(0)[0] + 4.8) stride(mo, t, B(0)[0] + .2, 2.2, 1);
    if (t > B(0)[0] + .4 && t < B(0)[0] + 5.4) stride(zo, t, B(0)[0] + .4, 1.5, 1);

    // Turn 3/4 toward the right zellige wall + camera once they arrive
    const turnW = sm(B(0)[0] + 5.0, B(0)[0] + 6.0, t);
    if (turnW > 0) {
      const wall = S3.floorAt(1560, 960);
      const yZ = Math.atan2(wall.x - zo.group.position.x, wall.z - zo.group.position.z);
      const yM = Math.atan2(wall.x - mo.group.position.x, wall.z - mo.group.position.z);
      zo.group.rotation.y += Math.atan2(Math.sin(yZ - zo.group.rotation.y), Math.cos(yZ - zo.group.rotation.y)) * turnW;
      mo.group.rotation.y += Math.atan2(Math.sin(yM - mo.group.rotation.y), Math.cos(yM - mo.group.rotation.y)) * turnW;
      zo.group.updateMatrixWorld(true); mo.group.updateMatrixWorld(true);
    }

    haikTuck(zo);
    hand85(mo, 'L', { fwd: .22, out: .15, drop: .26, curl: .2 });
    hand85(mo, 'R', { fwd: .22, out: .15, drop: .24, curl: .2 });

    // b116: Zoubida slips her right hand out toward the offering grille
    const offer = sm(B(0)[0] + 6.2, B(0)[0] + 7.2, t) * (1 - sm(B(1)[0] - .2, B(1)[0] + .4, t));
    if (offer > 0) {
      const grille = S3.floorAt(1560, 875).setY(1.15);
      reach85(zo, 'R', front(zo, 'chest', .22, 0, -.12).lerp(grille, offer), { grip: .015, pole: [-.9, .2, .5] });
      PO.fingers(zo, 'R', .18, { spread: .2 });
    }
    // b117: Zoubida leans cheek toward woodwork; Mohammed leans to kiss the cool mosaic
    if (IN(1, t)) {
      const pray = sm(B(1)[0], B(1)[0] + .7, t);
      zo.B.spine.rotation.x += .08 * pray;
      zo.B.head.rotation.z -= .14 * pray;
      mo.B.spine.rotation.x += .14 * pray;
      mo.B.neck.rotation.x -= .08 * pray;
      zo.B.chest.updateWorldMatrix(false, true); mo.B.chest.updateWorldMatrix(false, true);
      hand85(zo, 'R', { fwd: .20, out: .04, drop: .12, curl: .15 });
    }
    // b118: Zoubida turns gently back to Mohammed
    if (IN(2, t)) {
      faceCam(zo, S3.cam, .65);
      hand85(zo, 'L', { fwd: .22, out: .05, drop: .14, curl: .12, spread: .3 });
    }
  },
});

// b119–b121: rue_legumes vegetable stall confrontation
const lg = staged('rue_legumes', {
  marchand: { at: [1340, 855], face: 'cam', yaw: -.72, seed: 13, look: 'zoubida', lookMax: .55 },
  zoubida: {
    at: [1040, 860], face: 'cam', yaw: .72, costume: 'haik', seed: 7, lookMax: .55,
    look: t => IN(3, t) ? [1380, 880, .85] : 'marchand',
  },
  mohammed: {
    at: [820, 880], face: 'cam', yaw: .65, seed: 3, lookMax: .6,
    look: t => IN(4, t) ? 'marchand' : 'zoubida',
  },
}, {
  addressee: { marchand: 'zoubida', zoubida: 'marchand', narrator: 'zoubida' },
  act(lt, t, S, st, S3) {
    const { marchand: ma, zoubida: zo, mohammed: mo } = st.A;
    castScale(ma); castScale(zo); castScale(mo);
    sealHaik(zo);
    st.actcheck = { exposed: { zoubida: ['handL', 'handR', 'foreArmL', 'foreArmR'] } };
    haikTuck(zo);

    const poke = IN(3, t) ? sm(B(3)[0] + 1.5, B(3)[0] + 2.4, t) : 0;
    const anger = IN(4, t) ? sm(B(4)[0], B(4)[0] + .4, t) : IN(3, t) ? .35 * poke : .45;
    const tug = IN(5, t) ? sm(B(5)[0] + 1.6, B(5)[0] + 2.4, t) : 0;

    // Marchand angry reaction near the crates
    ma.B.spine.rotation.x += .08 * anger;
    ma.B.head.rotation.y += .07 * Math.sin(t * 7.5) * (IN(4, t) ? 1 : .2);
    ma.B.chest.updateWorldMatrix(false, true);
    const waveL = .06 * Math.sin(t * 6.2), waveR = .06 * Math.cos(t * 6.2);
    hand85(ma, 'L', { fwd: .22 + .06 * anger, out: .12, drop: .12 - .08 * anger + waveL, curl: .15, spread: .35 });
    hand85(ma, 'R', { fwd: .24 + .06 * anger, out: .12, drop: .10 - .08 * anger + waveR, curl: .15, spread: .35 });

    // Zoubida pokes toward crates (b119), stands dignified (b120-b121), shifts slightly left when tugged
    if (poke > 0) {
      const crate = S3.floorAt(1430, 825).setY(.85);
      const bob = V(0, .03 * Math.sin(t * 5.4), .03 * Math.cos(t * 4.5));
      reach85(zo, 'R', front(zo, 'chest', .22, 0, -.12).lerp(crate.add(bob), poke), { grip: .015, pole: [-.9, .2, .5] });
      PO.fingers(zo, 'R', .22, { spread: .25 });
    } else if (IN(5, t)) {
      zo.B.neck.rotation.x -= .08;
      zo.B.chest.updateWorldMatrix(false, true);
      faceCam(zo, S3.cam, .65);
    }

    // Mohammed watches, then tugs Zoubida's left sleeve/haik away in b121
    if (tug > 0) {
      zo.group.position.x -= .08 * tug;
      zo.group.updateMatrixWorld(true);
      const sleeve = at(zo, 'root').add(V(-.14, .82, .08));
      reach85(mo, 'R', front(mo, 'chest', .18, 0, -.12).lerp(sleeve, tug), { grip: .02, pole: [-.9, .2, .5] });
      PO.fingers(mo, 'R', .75);
      hand85(mo, 'L', { fwd: .22, out: .15, drop: .22, curl: .25 });
      mo.B.spine.rotation.z += .07 * tug;
      mo.B.chest.updateWorldMatrix(false, true);
    } else {
      hand85(mo, 'L', { fwd: .22, out: .15, drop: .26, curl: .2 });
      hand85(mo, 'R', { fwd: .22, out: .15, drop: .26, curl: .2 });
    }
  },
});

// b122–b126: rue_tijani monumental bronze portal on left wall
const tj2 = staged('rue_tijani', {
  zoubida: {
    at: [1040, 855], face: 'cam', yaw: -.35, costume: 'haik', seed: 7, lookMax: .55,
    look: t => IN(6, t) || IN(8, t) ? [520, 910, 1.7] : 'mohammed',
  },
  mohammed: {
    at: [830, 860], face: 'cam', yaw: -.22, seed: 3, lookMax: .58,
    look: t => IN(6, t) || IN(7, t) ? [490, 910, 1.85] : 'zoubida',
  },
}, {
  addressee: { mohammed: 'zoubida', zoubida: 'mohammed', narrator: 'mohammed' },
  act(lt, t, S, st, S3) {
    const { zoubida: zo, mohammed: mo } = st.A;
    castScale(zo); castScale(mo);
    sealHaik(zo);
    st.actcheck = { exposed: { zoubida: ['handL', 'handR', 'foreArmL', 'foreArmR'] } };
    haikTuck(zo);

    // Base relaxed arms on Mohammed (outward/forward, zero torso intersection)
    const km = mo.group.scale.y / 1.6;
    reach85(mo, 'L', PO.hipToWorld(mo, .18 * km, .04 * km, .22 * km), { grip: .015, pole: [.9, .2, .5] });
    PO.fingers(mo, 'L', .2);
    reach85(mo, 'R', PO.hipToWorld(mo, -.18 * km, .04 * km, .22 * km), { grip: .015, pole: [-.9, .2, .5] });
    PO.fingers(mo, 'R', .2);

    // b122: awe gazing up at the bronze portal
    if (IN(6, t)) {
      mo.B.neck.rotation.x -= .14;
      mo.B.head.rotation.x -= .10;
      mo.B.chest.updateWorldMatrix(false, true);
    }
    // b123: Mohammed points up toward the portal (outward/forward, kept well clear of torso)
    if (IN(7, t)) {
      const p = sm(B(7)[0], B(7)[0] + .45, t);
      const sh = at(mo, 'upperArmL');
      const startL = PO.hipToWorld(mo, .18 * km, .06 * km, .22 * km);
      const pt = sh.clone().addScaledVector(dirW(mo, .35, .24, .88), .36 * km);
      reach85(mo, 'L', startL.lerp(pt, p), { grip: .01, pole: [.9, .2, .5] });
      PO.fingers(mo, 'L', .75, { each: [.7, 0, 1, 1, 1] });
    }
    // b124: Zoubida glances cautiously toward portal/alley
    if (IN(8, t)) {
      zo.B.head.rotation.y -= .08 * Math.sin((t - B(8)[0]) * 1.4);
      zo.B.chest.updateWorldMatrix(false, true);
      hand85(zo, 'R', { fwd: .22, out: .15, drop: .16, curl: .22 });
    }
    // b125: Mohammed tilts head curiously up at mother
    if (IN(9, t)) {
      mo.B.head.rotation.z += .07;
      mo.B.neck.rotation.x -= .08;
      mo.B.chest.updateWorldMatrix(false, true);
    }
    // b126: Zoubida quick protective tug toward Mohammed
    if (IN(10, t)) {
      const p = sm(B(10)[0], B(10)[0] + .4, t);
      const tgt = at(mo, 'upperArmR').add(V(0, -.04, .04));
      reach85(zo, 'L', front(zo, 'chest', .22, .15, -.12).lerp(tgt, p), { grip: .02, pole: [.9, .2, .5] });
      PO.fingers(zo, 'L', .35);
    }
  },
});

export default beatScene(ID, {
  shots: { tj1, lg, tj2 },
  plan: {
    b116: { shot: 'tj1', size: 'W', on: 'zoubida', insAt: .62 },
    b117: { shot: 'tj1', size: 'W', on: 'zoubida' },
    b118: { shot: 'tj1', size: 'W', on: 'zoubida' },
    b119: { shot: 'lg', size: 'W', on: 'zoubida' },
    b120: { shot: 'lg', size: 'M', on: 'marchand', z: 1.45, dy: -85 },
    b121: { shot: 'lg', size: 'W', on: 'zoubida' },
    b122: { shot: 'tj2', size: 'W', on: 'mohammed', insAt: .45 },
    b123: { shot: 'tj2', size: 'CU', on: 'mohammed' },
    b124: { shot: 'tj2', size: 'CU', on: 'zoubida' },
    b125: { shot: 'tj2', size: 'CU', on: 'mohammed' },
    b126: { shot: 'tj2', size: 'CU', on: 'zoubida' },
  },
});
