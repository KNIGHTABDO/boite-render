// s11 "Le tadeffi".
// Beats 1-2 (b069-b070) in patio_matin (threshold/corridor): Zoubida whispers with Fatma at the doorway, then urges her in.
// Beats 3-5 (b071-b073) in chambre_jour (ch_lie): Fatma enters carrying a steaming bowl of tadeffi; Mohammed sulks turned
// toward the wall; Zoubida bribes him with a beignet; insert bol_tadeffi during b071.
// Beats 6-10 (b074-b078) in chambre_jour (ch_sit): Mohammed sits up on the bed, sniffs suspiciously, catches Zoubida in
// her lie (b075), Zoubida looks up and flees to the kitchen (b076), Fatma coaxes him (b077), and Mohammed drinks the soup (b078).
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
    const sideV = dirW(a, -sg, 0, 0);
    const tg = center.clone().addScaledVector(sideV, gripSpread * k).add(V(0, .02 * k, 0));
    reach85(a, s, tg, { grip: .015, pole: [sg * .42, -.05, .2] });
    PO.fingers(a, s, .35, { thumb: .3, spread: .12 });
  }
}

function makeSoupBowl(S3, st) {
  st.bowl ||= S3.prop(PR.bowl({ r: .10, h: .065, glaze: 0x3b6e52, food: 0xe6d294 }), 0, 0, 0);
  return st.bowl;
}

function makeBedProps(S3, st, mo, seated) {
  pillowUnder(S3, st, mo, { top: TOP, h: .11, col: 0x3b4d6b });
  if (seated && st.pillow) {
    const back = dirW(mo, 0, 0, -1);
    const hp = mo.B.root.getWorldPosition(V(0, 0, 0));
    S3.prop(st.pillow, hp.x + back.x * .24, TOP + .055 - .004, hp.z + back.z * .24, mo.group.rotation.y);
  }
  st.cover ||= PR.blanket({ w: .42, l: .54, h: .055, col: 0xb23a2a });
  const hp = mo.B.root.getWorldPosition(V(0, 0, 0)), ry = mo.group.rotation.y;
  const off = seated ? .26 : .30;
  S3.prop(st.cover, hp.x + Math.sin(ry) * off, TOP + .028 - .004, hp.z + Math.cos(ry) * off, ry);
  st.cover.visible = true;
}

// Beats 1-2: patio_matin threshold / corridor
const pa = staged('patio_matin', {
  zoubida: { at: [1120, 935], face: [1520, 905], walk: { to: [1250, 925], t0: B(0)[0] + 1.0, t1: B(0)[0] + 3.2 },
    seed: 7, look: 'fatma', lookMax: .7 },
  fatma: { at: [1560, 905], face: [1120, 935], walk: { to: [1420, 915], t0: B(0)[0] + .4, t1: B(0)[0] + 2.8 },
    seed: 11, look: 'zoubida', lookMax: .7 },
}, {
  light: PATIO_LT,
  addressee: { zoubida: 'fatma', fatma: 'zoubida' },
  act(lt, t, S, st, S3) {
    const { zoubida: zo, fatma: fa } = st.A;
    const kz = zo.group.scale.y / 1.6;
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
      reach85(zo, 'R', front(zo, 'chest', (.24 + .04 * sw) * kz, -.16 * kz, -.06 * kz), { grip: 0, pole: [-.38, -.05, .2] });
      PO.palmTo(zo, 'R', beck * .8, V(0, 1, .2));
      PO.fingers(zo, 'R', .14, { spread: .3 });
    }
  },
});

// Beats 3-5: chambre_jour, Mohammed lying turned to wall, Fatma enters with bowl
const ch_lie = staged('chambre_jour', {
  mohammed: { at: [1325, 636], face: [1430, 672], pose: 'lie',
    o: { top: TOP, turn: .12, hands: 'belly', headTurn: -.35, mattress: MATTRESS, avoid: CHEST }, seed: 3, talk: 0 },
  fatma: { at: [520, 880], face: [1250, 720], walk: { to: [980, 815], t0: B(2)[0], t1: B(2)[0] + 3.2 },
    seed: 11, look: 'mohammed', lookMax: .75 },
  zoubida: { at: [780, 860], face: [1250, 730], pose: 'kneel',
    o: { grounded: true, lean: .08, avoid: CHEST }, hands: false, seed: 7, look: 'mohammed', lookMax: .75 },
}, {
  light: ROOM_LT,
  addressee: { fatma: 'mohammed', zoubida: 'mohammed' },
  act(lt, t, S, st, S3) {
    const { mohammed: mo, fatma: fa, zoubida: zo } = st.A;
    const kf = fa.group.scale.y / 1.6, kz = zo.group.scale.y / 1.6;
    const sulk = sm(B(2)[0] + 4.5, B(2)[0] + 6.2, t);
    lieOnBed(mo, { top: TOP, feet: [.45, .89], hands: 'belly', pillow: .095, tuck: .22, headTurn: -.12 - .28 * sulk });
    makeBedProps(S3, st, mo, false);
    mo.B.chest.rotation.x += .01 * Math.sin(t * 1.5);

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
      reach85(zo, 'R', front(zo, 'chest', .24 * kz, -.14 * kz, -.14 * kz), { grip: 0, pole: [-.36, -.08, .2] });
      PO.palmTo(zo, 'R', q * .7, V(0, 1, .2));
      PO.fingers(zo, 'R', .16, { spread: .25 });
    }
    fa.B.chest.updateWorldMatrix(false, true);
    zo.B.chest.updateWorldMatrix(false, true);
  },
});

// Beats 6-10: chambre_jour, Mohammed sits up, catches mother, Fatma coaxes, Mohammed drinks
const ch_sit = staged('chambre_jour', {
  mohammed: { at: [1350, 694], face: [1060, 790], pose: 'kneel',
    o: { grounded: true, seat: TOP, lean: .08, spread: .045, hands: false, mattress: MATTRESS, avoid: CHEST },
    hands: false, seed: 3, look: (t) => IN(6, t) ? 'zoubida' : 'fatma', lookMax: .75 },
  fatma: { at: [1060, 790], face: [1350, 694], pose: 'kneel',
    o: { grounded: true, lean: .08, avoid: CHEST }, hands: false, seed: 11, look: 'mohammed', lookMax: .75 },
  zoubida: { at: [770, 845], face: [1250, 720], seed: 7,
    look: (t) => IN(7, t) ? [770, 845, 2.6] : 'mohammed', lookMax: .75 },
}, {
  light: ROOM_LT,
  addressee: { mohammed: 'zoubida', fatma: 'mohammed', zoubida: 'mohammed' },
  act(lt, t, S, st, S3) {
    const { mohammed: mo, fatma: fa, zoubida: zo } = st.A;
    const km = mo.group.scale.y / 1.6, kf = fa.group.scale.y / 1.6, kz = zo.group.scale.y / 1.6;
    makeBedProps(S3, st, mo, true);
    lapRest(mo, t, 3);
    const bowl = makeSoupBowl(S3, st);

    // Zoubida's walk out in b076 ("s'enfuit dans la cuisine")
    const exitT0 = B(7)[0] + 1.5, exitT1 = B(7)[1] - .2;
    if (t >= exitT0) {
      st.zoStart ||= S3.floorAt(770, 845);
      st.zoEnd ||= S3.floorAt(340, 910);
      walk(zo, st.zoStart, st.zoEnd, exitT0, exitT1, t);
    }
    zo.group.visible = t < exitT1 + .15;

    // Default bowl held by Fatma until b078
    const drinkU = sm(B(9)[0], B(9)[0] + 1.1, t);
    if (drinkU < .98) {
      const offer = IN(8, t) ? .06 * win(8, .05, .95, t) : 0;
      holdBowl(fa, bowl, { fwd: .25 + offer, up: -.15 });
    }

    // b074: Mohammed sniffs bowl suspiciously
    if (IN(5, t)) {
      const q = win(5, .05, .95, t);
      mo.B.neck.rotation.x -= .1 * q;
      mo.B.head.rotation.x -= .08 * q;
      mo.B.head.rotation.z += .07 * q;
      reach85(mo, 'R', front(mo, 'chest', .2 * km, -.12 * km, -.15 * km), { grip: 0, pole: [-.35, -.1, .18] });
      PO.fingers(mo, 'R', .22, { spread: .2 });
    }

    // b075: both women swear; Mohammed points accusingly at Zoubida
    if (IN(6, t)) {
      const q = win(6, .05, .95, t);
      const acc = sm(B(6)[0] + 3.8, B(6)[0] + 4.8, t) * (1 - sm(B(6)[1] - .5, B(6)[1], t));
      reach85(zo, 'R', front(zo, 'chest', .22 * kz, -.14 * kz, -.05 * kz), { grip: 0, pole: [-.38, -.08, .2] });
      PO.palmTo(zo, 'R', q * .7, V(0, 1, .2));
      if (acc > .05) {
        const zHead = at(zo, 'head');
        const dirTo = zHead.clone().sub(at(mo, 'upperArmR')).normalize();
        const ptTgt = at(mo, 'upperArmR').addScaledVector(dirTo, .34 * km);
        reach85(mo, 'R', ptTgt, { grip: 0, pole: [-.4, -.05, .2] });
        PO.fingers(mo, 'R', .85, { each: [.8, 0, 1, 1, 1] });
      }
    }

    // b076: Zoubida looks up to ceiling beams then slips out
    if (IN(7, t) && zo.group.visible) {
      const roll = win(7, 0, .45, t);
      zo.B.neck.rotation.x -= .2 * roll;
      zo.B.head.rotation.x -= .16 * roll;
      if (t < exitT0) {
        reach85(zo, 'L', front(zo, 'chest', .16 * kz, .14 * kz, -.16 * kz), { grip: 0, pole: [.35, -.1, .18] });
      }
    }

    // b077: Fatma coaxes warmly
    if (IN(8, t)) {
      const q = win(8, .05, .95, t);
      fa.B.chest.rotation.x += .08 * q;
      fa.B.head.rotation.z -= .07 * q;
    }

    // b078: Mohammed takes the bowl and drinks eagerly
    if (IN(9, t)) {
      lapRest(fa, t, 11);
      const sip = Math.max(0, Math.sin((t - B(9)[0]) * 2.2));
      const mouth = at(mo, 'head', [0, .02, .11]);
      const chest = front(mo, 'chest', .23 * km, 0, -.12 * km);
      const bPos = chest.lerp(mouth.clone().add(V(0, -.06 * km, .06 * km)), .45 + .35 * sip);
      bowl.position.copy(bPos);
      bowl.rotation.order = 'YXZ';
      bowl.rotation.y = mo.group.rotation.y;
      bowl.rotation.x = -(.22 + .28 * sip);
      bowl.updateMatrixWorld(true);
      bowl.visible = true;
      for (const [s, sg] of [['L', 1], ['R', -1]]) {
        const tg = bPos.clone().addScaledVector(dirW(mo, -sg, 0, 0), .085 * km);
        reach85(mo, s, tg, { grip: .015, pole: [sg * .4, -.08, .22] });
        PO.fingers(mo, s, .35, { thumb: .3, spread: .1 });
      }
      mo.B.neck.rotation.x -= (.12 + .1 * sip) * drinkU;
      mo.B.head.rotation.x -= (.1 + .1 * sip) * drinkU;
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
    b071: { shot: 'ch_lie', size: 'M', on: 'mohammed', z: 1.4, dx: -90, dy: 15, insAt: .25 },
    b072: { shot: 'ch_lie', size: 'CU', on: 'fatma', z: 2.2, dx: 15, dy: -15 },
    b073: { shot: 'ch_lie', size: 'M', on: 'zoubida', z: 1.5, dx: 75, dy: -10 },
    b074: { shot: 'ch_sit', size: 'CU', on: 'mohammed', z: 2.25, dx: -15, dy: -15 },
    b075: { shot: 'ch_sit', size: 'M', on: 'zoubida', z: 1.35, dx: 120, dy: -15 },
    b076: { shot: 'ch_sit', size: 'W', on: 'zoubida' },
    b077: { shot: 'ch_sit', size: 'CU', on: 'fatma', z: 2.15, dx: 35, dy: -15 },
    b078: { shot: 'ch_sit', size: 'M', on: 'mohammed', z: 1.65, dx: -40, dy: -15 },
  },
});
