// s10 "Quarante chats". chambre_jour (morning sunlight). Mohammed recovers from his fever and sits up in his bed;
// Zoubida kneels beside the right divan on the floor.
// b057 (ch_lie -> ch): sunlight fills the room, fever broken, Mohammed lies briefly then sits up on the mattress.
// b058 (ch CU mohammed): curious head tilt asking if a month is long.
// b059 (ch CU zoubida): startles from her daze with a tired smile ("ce mois sera une éternité").
// b060 (ch CU mohammed): solemn chin lift ("J'attends d'être un homme").
// b061 (ch M zoubida): Zoubida stares in astonishment, hand raised near her cheek.
// b062 (painting p07_quarante_chats + insert beignets_miel): child's dream of white djellabas, honey beignets, 40 cats, orange tree.
// b063 (ch CU zoubida): warm broad smile teasing about his future wife.
// b064 (ch CU mohammed): firm proud nod ("Je ne me marie pas !").
// b065 (ch M): Zoubida laughs, Mohammed claps his hands, then she presses a finger to her lips.
// b066 (ch CU zoubida): finger stays gently at her lips ("Chut !").
// b067 (ch CU mohammed): beaming hopeful nod ("Mon père reviendra bientôt").
// b068 (ch CU zoubida): reaches tenderly toward him ("tu n'auras jamais faim").
import * as PO from '../../../engine/poses.js';
import * as PR from '../../../engine/props3d.js';
import { staged } from '../lib/autostage.js';
import { lieOnBed, pillowUnder } from '../lib/fix8_lie.js';
import { beatScene, lines, sm, at, front, dirW, V } from '../lib/beatscene.js';

const ID = 's10_quarante_chats', L = lines(ID), B = i => L[i] || [0, 0];
const IN = (i, t) => t >= B(i)[0] - .15 && t < (B(i + 1)[0] || B(i)[1] + .3);
const win = (i, a, b, t) => { const [t0, t1] = B(i), D = t1 - t0; return sm(t0 + a * D, t0 + a * D + .4, t) * (1 - sm(t0 + b * D, t0 + b * D + .4, t)); };

const TOP = .26;
const MATTRESS = [[1188, 574], [1450, 574], [1455, 688], [1308, 690]];
const CHEST = [[1450, 580], [1830, 580], [1830, 850], [1450, 850]];
const MORNING = { dir: [2, 3, 1], key: '#ffe8bc', keyI: 2.25, sky: '#d4e2f5', ground: '#947b5c', fillI: 1.2, shadow: .26 };

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

const ch_lie = staged('chambre_jour', {
  mohammed: { at: [1350, 694], face: [1336, 754], pose: 'lie',
    o: { top: TOP, turn: .12, hands: 'belly', headTurn: -.08, pillow: .08, mattress: MATTRESS, avoid: CHEST }, seed: 3, talk: 0 },
  zoubida: { at: [1000, 685], face: 'cam', yaw: .65, pose: 'kneel',
    o: { grounded: true, lean: .08, avoid: CHEST }, hands: false, seed: 7, look: 'mohammed', lookMax: .56 },
}, {
  light: MORNING,
  act(lt, t, S, st, S3) {
    const { mohammed: mo, zoubida: zo } = st.A;
    lieOnBed(mo, {
      top: TOP, feet: [.5, .87],
      origin: (st.mo0 ||= mo.group.position.clone()).clone().add(V(.04, 0, 0)),
      hands: 'belly', pillow: .08, tuck: .22, headTurn: -.08,
    });
    makeBedProps(S3, st, mo, false);
    mo.B.chest.rotation.x += .012 * Math.sin(t * 1.5);
    mo.B.chest.updateWorldMatrix(false, true);
    lapRest(zo, t, 7);
    zo.B.chest.rotation.x += .015 * Math.sin(t * 1.1);
  },
});

const ch = staged('chambre_jour', {
  mohammed: { at: [1350, 694], face: 'cam', yaw: -.65, pose: 'cross',
    o: { seat: TOP, floor: TOP, lean: .08, hands: false, mattress: MATTRESS, avoid: CHEST },
    hands: false, seed: 3, look: 'zoubida', lookMax: .55 },
  zoubida: { at: [1000, 685], face: 'cam', yaw: .65, pose: 'kneel',
    o: { grounded: true, lean: .08, avoid: CHEST }, hands: false, seed: 7, look: 'mohammed', lookMax: .56 },
}, {
  light: MORNING,
  act(lt, t, S, st, S3) {
    const { mohammed: mo, zoubida: zo } = st.A;
    const km = mo.group.scale.y / 1.6, kz = zo.group.scale.y / 1.6;
    makeBedProps(S3, st, mo, true);

    lapRest(mo, t, 3);
    lapRest(zo, t, 7);
    mo.B.chest.rotation.x += .015 * Math.sin(t * 1.4);
    zo.B.chest.rotation.x += .015 * Math.sin(t * 1.2 + 1);

    // b057: sits up relieved
    if (IN(0, t)) {
      const u = sm(B(0)[0] + 2.5, B(0)[1], t);
      mo.B.spine.rotation.x -= .06 * u;
      mo.B.chest.rotation.x -= .04 * u;
    }

    // b058: curious head tilt + small open hand
    if (IN(1, t)) {
      const q = win(1, .05, .95, t);
      mo.B.head.rotation.z += .14 * q;
      mo.B.neck.rotation.x -= .05 * q;
      reach85(mo, 'R', front(mo, 'chest', .22 * km, .14 * km, -.14 * km), { grip: 0, pole: [-.45, .05, .2] });
      PO.palmTo(mo, 'R', q * .7, V(0, 1, .2));
      PO.fingers(mo, 'R', .2, { spread: .25 });
    }

    // b059: Zoubida startles out of daze, tired smile, gentle open palm
    if (IN(2, t)) {
      const q = win(2, .05, .95, t);
      zo.B.spine.rotation.x -= .04 * q;
      zo.B.head.rotation.z -= .06 * q;
      reach85(zo, 'R', front(zo, 'chest', .24 * kz, .15 * kz, -.16 * kz), { grip: 0, pole: [-.45, .05, .2] });
      PO.palmTo(zo, 'R', q * .6, V(0, 1, .25));
      PO.fingers(zo, 'R', .18, { spread: .3 });
    }

    // b060: Mohammed solemn chin lift + firm little gesture
    if (IN(3, t)) {
      const q = win(3, .05, .95, t);
      mo.B.neck.rotation.x -= .1 * q;
      mo.B.head.rotation.x -= .08 * q;
      reach85(mo, 'L', front(mo, 'chest', .22 * km, -.14 * km, -.12 * km), { grip: 0, pole: [.45, .05, .2] });
      PO.fingers(mo, 'L', .22, { spread: .18 });
    }

    // b061: Zoubida astonished, right hand raised gently near cheek/chin
    if (IN(4, t)) {
      const q = win(4, .08, .92, t);
      zo.B.spine.rotation.x -= .05 * q;
      const cheek = zo.B.head.localToWorld(V(-.13, .03, .13));
      const rest = PO.hipToWorld(zo, -.17 * kz, .09 * kz, .23 * kz);
      reach85(zo, 'R', rest.lerp(cheek, q), { grip: .01, pole: [-.5, .22, .2] });
      PO.fingers(zo, 'R', .18, { spread: .25 });
    }

    // b063: Zoubida warm broad smile + teasing hand
    if (IN(6, t)) {
      const q = win(6, .05, .95, t);
      zo.B.head.rotation.z += .08 * q;
      zo.B.chest.rotation.x += .04 * q;
      reach85(zo, 'L', front(zo, 'chest', .25 * kz, -.15 * kz, -.15 * kz), { grip: 0, pole: [.45, .05, .2] });
      PO.palmTo(zo, 'L', q * .65, V(0, 1, .25));
      PO.fingers(zo, 'L', .15, { spread: .3 });
    }

    // b064: Mohammed firm proud nod
    if (IN(7, t)) {
      const q = win(7, .05, .95, t);
      mo.B.head.rotation.x += .1 * Math.max(0, Math.sin((t - B(7)[0]) * 3.5)) * q;
      mo.B.chest.rotation.x -= .05 * q;
      reach85(mo, 'R', front(mo, 'chest', .22 * km, .15 * km, -.16 * km), { grip: 0, pole: [-.45, .05, .2] });
      PO.fingers(mo, 'R', .45, { thumb: .3 });
    }

    // b065: bursts out laughing, boy claps hands, then finger to lips
    if (IN(8, t)) {
      const c8 = t - B(8)[0], D8 = B(8)[1] - B(8)[0];
      const laughW = sm(0, .35, c8) * (1 - sm(D8 * .6, D8 * .72, c8));
      const hushW = sm(D8 * .64, D8 * .78, c8);
      if (laughW > .01) {
        zo.B.chest.rotation.x += .04 * Math.sin(t * 12) * laughW;
        zo.B.neck.rotation.x -= .12 * laughW;
        zo.B.head.rotation.x -= .1 * laughW;
        mo.B.chest.rotation.x += .03 * Math.sin(t * 14) * laughW;
        const clap = .03 * Math.abs(Math.sin(t * 11));
        for (const [s, sg] of [['L', 1], ['R', -1]]) {
          reach85(mo, s, front(mo, 'chest', .24 * km, -sg * (.05 + clap) * km, -.12 * km), { grip: 0, pole: [sg * .45, .05, .2] });
          PO.fingers(mo, s, .08, { spread: .15 });
        }
      }
      if (hushW > .01) {
        const lips = zo.B.head.localToWorld(V(-.06, .03, .19));
        const rest = PO.hipToWorld(zo, -.17 * kz, .09 * kz, .23 * kz);
        reach85(zo, 'R', rest.lerp(lips, hushW), { grip: .01, pole: [-.52, .18, .32] });
        PO.fingers(zo, 'R', .85, { each: [.75, 0, 1, 1, 1] });
      }
    }

    // b066: finger stays gently on lips
    if (IN(9, t)) {
      const q = win(9, 0, .95, t);
      const lips = zo.B.head.localToWorld(V(-.06, .03, .19));
      const rest = PO.hipToWorld(zo, -.17 * kz, .09 * kz, .23 * kz);
      reach85(zo, 'R', rest.lerp(lips, q), { grip: .01, pole: [-.52, .18, .32] });
      PO.fingers(zo, 'R', .85, { each: [.75, 0, 1, 1, 1] });
      zo.B.head.rotation.z += .05 * q;
    }

    // b067: Mohammed beaming hopeful nod
    if (IN(10, t)) {
      const q = win(10, .05, .95, t);
      mo.B.head.rotation.x += .08 * Math.sin((t - B(10)[0]) * 3) * q;
      mo.B.neck.rotation.x -= .06 * q;
      reach85(mo, 'R', front(mo, 'chest', .23 * km, .14 * km, -.15 * km), { grip: 0, pole: [-.45, .05, .2] });
      PO.palmTo(mo, 'R', q * .6, V(0, 1, .2));
    }

    // b068: Zoubida reaches tenderly toward him
    if (IN(11, t)) {
      const q = win(11, .08, .92, t);
      zo.B.chest.rotation.x += .07 * q;
      const shM = at(mo, 'upperArmR').add(V(0, .05 * km, .03));
      const rest = PO.hipToWorld(zo, .17 * kz, .09 * kz, .23 * kz);
      reach85(zo, 'L', rest.lerp(shM, q), { grip: .02, pole: [.55, .15, .35] });
      PO.fingers(zo, 'L', .16, { spread: .2 });
      st.actcheck = {
        contacts: q > .25 ? [{ actors: ['zoubida', 'mohammed'], parts: ['handL:upperArmR', 'handL:upperArmL', 'handL:torso', 'foreArmL:upperArmR', 'foreArmL:upperArmL'] }] : [],
      };
    }

    mo.B.chest.updateWorldMatrix(false, true);
    zo.B.chest.updateWorldMatrix(false, true);
  },
});

const insAtB062 = (6.18 - .08) / Math.max(.1, B(5)[1] - B(5)[0]);

export default beatScene(ID, {
  shots: { ch_lie, ch },
  plan: {
    b057: { shot: 'ch_lie', size: 'W', on: 'mohammed', segs: [[.55, 'ch']],
      cover: [{ f: .55, shot: 'ch', size: 'M', on: 'mohammed', z: 1.45, dx: -30, dy: -30 }] },
    b058: { shot: 'ch', size: 'CU', on: 'mohammed', z: 2.3, dy: -20 },
    b059: { shot: 'ch', size: 'CU', on: 'zoubida', z: 2.3, dx: 20, dy: -20 },
    b060: { shot: 'ch', size: 'CU', on: 'mohammed', z: 2.35, dy: -20 },
    b061: { shot: 'ch', size: 'M', on: 'zoubida', z: 1.55, dx: 75, dy: -20 },
    b062: { move: 'panR', insAt: insAtB062 },
    b063: { shot: 'ch', size: 'CU', on: 'zoubida', z: 2.3, dx: 20, dy: -20 },
    b064: { shot: 'ch', size: 'CU', on: 'mohammed', z: 2.35, dy: -20 },
    b065: { shot: 'ch', size: 'M', on: 'zoubida', z: 1.5, dx: 85, dy: -20 },
    b066: { shot: 'ch', size: 'CU', on: 'zoubida', z: 2.4, dx: 15, dy: -20 },
    b067: { shot: 'ch', size: 'CU', on: 'mohammed', z: 2.35, dy: -20 },
    b068: { shot: 'ch', size: 'CU', on: 'zoubida', z: 2.2, dx: 35, dy: -20 },
  },
});
