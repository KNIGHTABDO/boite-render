// s11 "Le tadeffi".
// b069: patio_matin threshold/corridor — Zoubida whispers with Fatma at the doorway.
// b070: patio_matin — Zoubida urges her neighbour inside toward the room.
// b071: chambre_jour (ch_lie + insert bol_tadeffi) — Fatma enters carrying a steaming bowl of tadeffi; Mohammed turns toward the wall.
// b072: chambre_jour (ch_lie) — Fatma smiles gently down at the boy.
// b073: chambre_jour (ch_lie) — Zoubida bribes Mohammed gently with a beignet.
// b074: chambre_jour (ch_sit) — Mohammed sits up on the bed and sniffs suspiciously.
// b075: chambre_jour (ch_sit) — Both women swear; Mohammed catches Zoubida in her lie and points at her.
// b076: chambre_jour (ch_sit) — Caught, Zoubida rolls her eyes to the ceiling and slips out toward the kitchen.
// b077: chambre_jour (ch_sit) — Fatma coaxes Mohammed warmly with sweet nicknames.
// b078: chambre_jour (ch_sit) — Unable to resist, Mohammed takes the bowl and drinks the tadeffi eagerly.
import * as PO from '../../../engine/poses.js';
import * as PR from '../../../engine/props3d.js';
import { staged } from '../lib/autostage.js';
import { lieOnBed, pillowUnder } from '../lib/fix8_lie.js';
import { walk } from '../lib/acts.js';
import { beatScene, lines, sm, at, front, dirW, V } from '../lib/beatscene.js';

const ID = 's11_tadeffi', L = lines(ID), B = i => L[i] || [0, 0];
const IN = (i, t) => t >= B(i)[0] - .15 && t < (B(i + 1)[0] || B(i)[1] + .3);
const win = (i, a, b, t) => { const [t0, t1] = B(i), D = t1 - t0; return sm(t0 + a * D, t0 + a * D + .4, t) * (1 - sm(t0 + b * D, t0 + b * D + .4, t)); };

const TOP = .26;
const MATTRESS = [[1188, 574], [1450, 574], [1455, 688], [1308, 690]];
const CHEST = [[1450, 580], [1830, 580], [1830, 850], [1450, 850]];
const PATIO_LT = { dir: [2, 3, 1], key: '#ffe6ba', keyI: 2.1, sky: '#cbd9ee', ground: '#8f7759', fillI: 1.15, shadow: .26 };
const ROOM_LT = { dir: [2, 3, 1], key: '#ffe8bc', keyI: 2.15, sky: '#d0def2', ground: '#91785a', fillI: 1.15, shadow: .28 };

function reach85(a, side, target, opt) {
  const sh = at(a, 'upperArm' + side);
  const len = sh.distanceTo(at(a, 'foreArm' + side)) + at(a, 'foreArm' + side).distanceTo(at(a, 'hand' + side));
  const maxR = len * .84, d = target.clone().sub(sh);
  if (d.length() > maxR) target = sh.clone().addScaledVector(d.normalize(), maxR);
  return PO.reach(a, side, target, opt);
}

function lapRest(a, t, seed = 0) {
  const k = a.group.scale.y / 1.6;
  for (const [s, sg] of [['L', 1], ['R', -1]]) {
    const bob = .01 * k * Math.sin(t * 1.1 + seed + (sg > 0 ? 0 : 1.6));
    const tg = PO.hipToWorld(a, sg * .17 * k, .09 * k + bob, .23 * k);
    reach85(a, s, tg, { grip: .02, pole: [sg * .4, .06, .15] });
    PO.fingers(a, s, .26 + .04 * Math.sin(t * .9 + sg), { thumb: .22, spread: .16 });
  }
}

function holdBowl(a, bowl, { fwd = .25, up = -.16, tilt = 0, gripSpread = .095 } = {}) {
  const k = a.group.scale.y / 1.6;
  const center = front(a, 'chest', fwd * k, 0, up * k);
  bowl.position.copy(center);
  bowl.rotation.order = 'YXZ';
  bowl.rotation.y = a.group.rotation.y;
  bowl.rotation.x = tilt;
  bowl.updateMatrixWorld(true);
  bowl.visible = true;
  for (const [s, sg] of [['L', 1], ['R', -1]]) {
    const sideV = dirW(a, sg, 0, 0);
    const tg = center.clone().addScaledVector(sideV, gripSpread * k).add(V(0, .02 * k, 0));
    reach85(a, s, tg, { grip: .015, pole: [sg * .48, .02, .22] });
    PO.fingers(a, s, .35, { thumb: .3, spread: .12 });
  }
}

function makeSoupBowl(S3, st) {
  st.bowl ||= S3.prop(PR.bowl({ r: .10, h: .065, glaze: 0x3b6e52, food: 0xe6d294 }), 0, 0, 0);
  return st.bowl;
}

function makeBedProps(S3, st, mo, seated) {
  pillowUnder(S3, st, mo, { top: TOP, h: .08, col: 0x3b4d6b });
  if (seated && st.pillow) {
    const back = dirW(mo, 0, 0, -1);
    const hp = mo.B.root.getWorldPosition(V(0, 0, 0));
    S3.prop(st.pillow, hp.x + back.x * .24, TOP + .04 - .004, hp.z + back.z * .24, mo.group.rotation.y);
  }
  st.cover ||= PR.blanket({ w: .42, l: .54, h: .055, col: 0xb23a2a });
  const hp = mo.B.root.getWorldPosition(V(0, 0, 0)), ry = mo.group.rotation.y;
  const off = seated ? .26 : .30;
  S3.prop(st.cover, hp.x + Math.sin(ry) * off, TOP + .028 - .004, hp.z + Math.cos(ry) * off, ry);
  st.cover.visible = true;
}

// Beats 1-2: patio_matin threshold / corridor
const pa = staged('patio_matin', {
  zoubida: { at: [1120, 895], face: 'cam', yaw: .08, walk: { to: [1240, 945], t0: B(0)[0] + 1.0, t1: B(0)[0] + 3.2 },
    seed: 7, look: 'fatma', lookMax: .38 },
  fatma: { at: [1550, 895], face: 'cam', yaw: -.25, walk: { to: [1430, 965], t0: B(0)[0] + .4, t1: B(0)[0] + 2.8 },
    seed: 11, look: 'zoubida', lookMax: .45 },
}, {
  light: PATIO_LT,
  act(lt, t, S, st, S3) {
    const { zoubida: zo, fatma: fa } = st.A;
    const kz = zo.group.scale.y / 1.6;
    const turnZ = sm(B(0)[0] + 3.0, B(0)[0] + 3.8, t);
    if (turnZ > 0) {
      const pZ = st.paZP ||= S3.floorAt(1240, 945);
      const tgtZ = Math.atan2(S3.cam.position.x - pZ.x, S3.cam.position.z - pZ.z) + .08;
      const dZ = Math.atan2(Math.sin(tgtZ - zo.group.rotation.y), Math.cos(tgtZ - zo.group.rotation.y));
      zo.group.rotation.y += dZ * turnZ;
      zo.group.updateMatrixWorld(true);
    }
    const turnF = sm(B(0)[0] + 2.6, B(0)[0] + 3.4, t);
    if (turnF > 0) {
      const pF = st.paFP ||= S3.floorAt(1430, 965);
      const tgtF = Math.atan2(S3.cam.position.x - pF.x, S3.cam.position.z - pF.z) - .25;
      const dF = Math.atan2(Math.sin(tgtF - fa.group.rotation.y), Math.cos(tgtF - fa.group.rotation.y));
      fa.group.rotation.y += dF * turnF;
      fa.group.updateMatrixWorld(true);
    }
    const bowl = makeSoupBowl(S3, st);
    holdBowl(fa, bowl, { fwd: .24, up: -.16 });

    // Whispering conciliabule in b069, then Zoubida beckons Fatma in during b070
    if (IN(0, t)) {
      const talk = sm(B(0)[0] + 3.2, B(0)[0] + 4.2, t);
      zo.B.chest.rotation.x += .06 * talk;
      fa.B.chest.rotation.x += .05 * talk;
    }
    if (IN(1, t)) {
      const beck = win(1, .05, .95, t);
      const sw = Math.sin(t * 5);
      reach85(zo, 'R', front(zo, 'chest', (.24 + .04 * sw) * kz, .16 * kz, -.06 * kz), { grip: 0, pole: [-.45, .05, .22] });
      PO.palmTo(zo, 'R', beck * .8, V(0, 1, .2));
      PO.fingers(zo, 'R', .14, { spread: .3 });
    }
  },
});

// chambre_jour, Mohammed lying turned to wall, Fatma enters with bowl
const ch_lie = staged('chambre_jour', {
  mohammed: { at: [1350, 694], face: [1336, 754], pose: 'lie',
    o: { top: TOP, turn: .12, hands: 'belly', headTurn: -.28, pillow: .08, mattress: MATTRESS, avoid: CHEST }, seed: 3, talk: 0 },
  fatma: { at: [640, 720], face: 'cam', yaw: .62, walk: { to: [840, 680], t0: B(2)[0], t1: B(2)[0] + 3.0 },
    seed: 11, look: 'mohammed', lookMax: .58 },
  zoubida: { at: [980, 655], face: 'cam', yaw: .68, pose: 'kneel',
    o: { grounded: true, lean: .08, avoid: CHEST }, hands: false, seed: 7, look: 'mohammed', lookMax: .62 },
}, {
  light: ROOM_LT,
  act(lt, t, S, st, S3) {
    const { mohammed: mo, fatma: fa, zoubida: zo } = st.A;
    const kz = zo.group.scale.y / 1.6;
    const sulk = sm(B(2)[0] + 4.5, B(2)[0] + 6.2, t);
    lieOnBed(mo, {
      top: TOP, feet: [.5, .87],
      origin: (st.mo0 ||= mo.group.position.clone()).clone().add(V(.04, 0, 0)),
      hands: 'belly', pillow: .08, tuck: .22, headTurn: -.10 - .22 * sulk,
    });
    makeBedProps(S3, st, mo, false);
    mo.B.chest.rotation.x += .01 * Math.sin(t * 1.5);

    const turnF = sm(B(2)[0] + 2.8, B(2)[0] + 3.6, t);
    if (turnF > 0) {
      const p1 = st.faP1 ||= S3.floorAt(840, 680);
      const tgtYaw = Math.atan2(S3.cam.position.x - p1.x, S3.cam.position.z - p1.z) + .62;
      const dYaw = Math.atan2(Math.sin(tgtYaw - fa.group.rotation.y), Math.cos(tgtYaw - fa.group.rotation.y));
      fa.group.rotation.y += dYaw * turnF;
      fa.group.updateMatrixWorld(true);
    }

    const bowl = makeSoupBowl(S3, st);
    holdBowl(fa, bowl, { fwd: .24, up: -.16 });
    lapRest(zo, t, 7);

    // b072: Fatma leans gently toward the boy
    if (IN(3, t)) {
      const q = win(3, .05, .95, t);
      fa.B.chest.rotation.x += .08 * q;
      fa.B.head.rotation.z += .06 * q;
      holdBowl(fa, bowl, { fwd: .26, up: -.14 });
    }

    // b073: Zoubida leans down coaxing ("Après, j'enverrai Zineb t'acheter un beignet")
    if (IN(4, t)) {
      const q = win(4, .05, .95, t);
      zo.B.chest.rotation.x += .08 * q;
      reach85(zo, 'R', front(zo, 'chest', .24 * kz, .14 * kz, -.14 * kz), { grip: 0, pole: [-.45, .05, .2] });
      PO.palmTo(zo, 'R', q * .7, V(0, 1, .2));
      PO.fingers(zo, 'R', .16, { spread: .25 });
    }
    fa.B.chest.updateWorldMatrix(false, true);
    zo.B.chest.updateWorldMatrix(false, true);
  },
});

// chambre_jour, Mohammed sits up, catches mother, Fatma coaxes, Mohammed drinks
const ch_sit = staged('chambre_jour', {
  mohammed: { at: [1350, 694], face: 'cam', yaw: -.85, pose: 'cross',
    o: { seat: TOP, floor: TOP, lean: .08, hands: false, mattress: MATTRESS, avoid: CHEST },
    hands: false, seed: 3, look: (t) => IN(6, t) ? 'zoubida' : 'fatma', lookMax: .65 },
  fatma: { at: [1010, 680], face: 'cam', yaw: .72, pose: 'cross',
    o: { seat: 0, floor: 0, lean: .08, avoid: CHEST }, hands: false, seed: 11, look: 'mohammed', lookMax: .7 },
  zoubida: { at: [770, 735], face: 'cam', yaw: .72, seed: 7,
    look: (t) => t >= B(7)[0] + 1.5 ? 'cam' : IN(7, t) ? [770, 735, 2.5] : 'mohammed', lookMax: .6 },
}, {
  light: ROOM_LT,
  act(lt, t, S, st, S3) {
    const { mohammed: mo, fatma: fa, zoubida: zo } = st.A;
    const km = mo.group.scale.y / 1.6, kz = zo.group.scale.y / 1.6;
    fa.B.root.position.y -= .002;
    fa.B.root.updateMatrixWorld(false, true);
    makeBedProps(S3, st, mo, true);
    lapRest(mo, t, 3);
    const bowl = makeSoupBowl(S3, st);

    // Zoubida's walk out in b076 ("s'enfuit dans la cuisine")
    const exitT0 = B(7)[0] + 1.5, exitT1 = B(7)[1] - .2;
    if (t >= exitT0) {
      st.zoStart ||= S3.floorAt(770, 735);
      st.zoEnd ||= S3.floorAt(380, 880);
      walk(zo, st.zoStart, st.zoEnd, exitT0, exitT1, t);
    }
    zo.group.visible = t < B(8)[0];

    // Default bowl held by Fatma until b078
    const drinkU = sm(B(9)[0], B(9)[0] + 1.1, t);
    if (t < B(9)[0] + .02) {
      const offer = IN(8, t) ? .06 * win(8, .05, .95, t) : 0;
      holdBowl(fa, bowl, { fwd: .25 + offer, up: -.15 });
    }

    // b074: Mohammed sniffs bowl suspiciously
    if (IN(5, t)) {
      const q = win(5, .05, .95, t);
      mo.B.neck.rotation.x -= .1 * q;
      mo.B.head.rotation.x -= .08 * q;
      mo.B.head.rotation.z += .07 * q;
      reach85(mo, 'R', front(mo, 'chest', .2 * km, .14 * km, -.15 * km), { grip: 0, pole: [-.45, .05, .2] });
      PO.fingers(mo, 'R', .22, { spread: .2 });
    }

    // b075: both women swear; Mohammed points accusingly at Zoubida
    if (IN(6, t)) {
      const q = win(6, .05, .95, t);
      const acc = sm(B(6)[0] + 3.8, B(6)[0] + 4.8, t) * (1 - sm(B(6)[1] - .5, B(6)[1], t));
      reach85(zo, 'R', front(zo, 'chest', .22 * kz, .15 * kz, -.05 * kz), { grip: 0, pole: [-.45, .05, .22] });
      PO.palmTo(zo, 'R', q * .7, V(0, 1, .2));
      if (acc > .05) {
        const zHead = at(zo, 'head');
        const dirTo = zHead.clone().sub(at(mo, 'upperArmR')).normalize();
        const ptTgt = at(mo, 'upperArmR').addScaledVector(dirTo, .34 * km);
        reach85(mo, 'R', ptTgt, { grip: 0, pole: [-.45, .05, .25] });
        PO.fingers(mo, 'R', .85, { each: [.8, 0, 1, 1, 1] });
      }
    }

    // b076: Zoubida looks up to ceiling beams then slips out
    if (IN(7, t) && zo.group.visible) {
      const roll = win(7, 0, .45, t);
      zo.B.neck.rotation.x -= .2 * roll;
      zo.B.head.rotation.x -= .16 * roll;
      if (t < exitT0) {
        reach85(zo, 'L', front(zo, 'chest', .22 * kz, -.16 * kz, -.16 * kz), { grip: 0, pole: [.52, .08, .25] });
      }
    }

    // b077: Fatma coaxes warmly
    if (IN(8, t)) {
      const q = win(8, .05, .95, t);
      fa.B.chest.rotation.x += .08 * q;
      fa.B.head.rotation.z -= .07 * q;
    }

    // b078: Mohammed takes the bowl and drinks eagerly
    if (t >= B(9)[0] + .02) {
      lapRest(fa, t, 11);
      const sip = Math.max(0, Math.sin((t - B(9)[0]) * 2.2));
      const chest = front(mo, 'chest', .24 * km, .10 * km, -.17 * km);
      const lowMouth = front(mo, 'chest', .24 * km, .10 * km, (-.15 + .015 * sip) * km);
      const bPos = chest.lerp(lowMouth, drinkU);
      bPos.y = Math.min(bPos.y, at(mo, 'head').y - .22 * km);
      bowl.position.copy(bPos);
      bowl.rotation.order = 'YXZ';
      bowl.rotation.y = mo.group.rotation.y;
      bowl.rotation.x = -(.22 + .24 * sip);
      bowl.updateMatrixWorld(true);
      bowl.visible = true;
      for (const [s, sg] of [['L', 1], ['R', -1]]) {
        const tg = bPos.clone().addScaledVector(dirW(mo, sg, 0, 0), .085 * km);
        reach85(mo, s, tg, { grip: .015, pole: [sg * .48, .02, .25] });
        PO.fingers(mo, s, .35, { thumb: .3, spread: .1 });
      }
      mo.B.neck.rotation.x -= (.10 + .08 * sip) * drinkU;
      mo.B.head.rotation.x -= (.08 + .08 * sip) * drinkU;
    }

    mo.B.chest.updateWorldMatrix(false, true);
    fa.B.chest.updateWorldMatrix(false, true);
    if (zo.group.visible) zo.B.chest.updateWorldMatrix(false, true);
  },
});

export default beatScene(ID, {
  shots: { pa, ch_lie, ch_sit },
  plan: {
    b069: { shot: 'pa', size: 'M', on: 'zoubida', z: 1.45, dx: 70, dy: 20 },
    b070: { shot: 'pa', size: 'CU', on: 'zoubida', z: 2.2, dx: 40, dy: 10 },
    b071: { shot: 'ch_lie', size: 'W', on: 'mohammed', insAt: .25 },
    b072: { shot: 'ch_lie', size: 'CU', on: 'fatma', pt: [840, 680], z: 1.85, dx: 55, dy: -30 },
    b073: { shot: 'ch_lie', size: 'W', on: 'zoubida' },
    b074: { shot: 'ch_sit', size: 'CU', on: 'mohammed', z: 2.25, dx: -15, dy: -15 },
    b075: { shot: 'ch_sit', size: 'W', on: 'zoubida' },
    b076: { shot: 'ch_sit', size: 'W', on: 'zoubida' },
    b077: { shot: 'ch_sit', size: 'M', on: 'fatma', z: 1.35, dx: 90, dy: -25 },
    b078: { shot: 'ch_sit', size: 'M', on: 'mohammed', z: 1.35, dx: -95, dy: -25 },
  },
});
