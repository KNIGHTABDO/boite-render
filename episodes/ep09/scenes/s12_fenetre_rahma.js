// s12 "La fenêtre de Rahma".
// b079 (ch1 chambre_jour): washed and dressed in his clean djellaba, Mohammed stretches happily for holiday days.
// b080 (pa patio_matin): Rahma greets Mohammed warmly from across the sunlit courtyard and waves.
// b081 (ch1 CU zoubida): Zoubida replies courteously with blessings from inside the room.
// b082 (pa M rahma): Rahma sighs piously about hard times ("sachons louer Dieu dans l'adversité").
// b083 (pa CU mohammed + insert trompette_ramadan): downstairs triple sneeze and trumpet nose blow; Mohammed bursts laughing.
// b084 (ch2 chambre_jour): Zoubida steers him gently back to the mattress to recite the Quran for his father.
import * as PO from '../../../engine/poses.js';
import * as PR from '../../../engine/props3d.js';
import { staged } from '../lib/autostage.js';
import { pillowUnder } from '../lib/fix8_lie.js';
import { beatScene, lines, sm, at, front, dirW, V } from '../lib/beatscene.js';

const ID = 's12_fenetre_rahma', L = lines(ID), B = i => L[i] || [0, 0];
const IN = (i, t) => t >= B(i)[0] - .15 && t < (B(i + 1)[0] || B(i)[1] + .3);
const win = (i, a, b, t) => { const [t0, t1] = B(i), D = t1 - t0; return sm(t0 + a * D, t0 + a * D + .4, t) * (1 - sm(t0 + b * D, t0 + b * D + .4, t)); };

const TOP = .26;
const MATTRESS = [[1188, 574], [1450, 574], [1455, 688], [1308, 690]];
const CHEST = [[1450, 580], [1830, 580], [1830, 850], [1450, 850]];
const ROOM_LT = { dir: [2, 3, 1], key: '#ffe8bc', keyI: 2.15, sky: '#d0def2', ground: '#91785a', fillI: 1.15, shadow: .28 };
const PATIO_LT = { dir: [2, 3, 1], key: '#ffe6ba', keyI: 2.15, sky: '#cbd9ee', ground: '#8f7759', fillI: 1.15, shadow: .26 };

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

function makeBedProps(S3, st, mo) {
  pillowUnder(S3, st, mo, { top: TOP, h: .11, col: 0x3b4d6b });
  if (st.pillow) {
    const back = dirW(mo, 0, 0, -1), hp = mo.B.root.getWorldPosition(V(0, 0, 0));
    S3.prop(st.pillow, hp.x + back.x * .24, TOP + .055 - .004, hp.z + back.z * .24, mo.group.rotation.y);
  }
  st.cover ||= PR.blanket({ w: .42, l: .54, h: .055, col: 0xb23a2a });
  const hp = mo.B.root.getWorldPosition(V(0, 0, 0)), ry = mo.group.rotation.y;
  S3.prop(st.cover, hp.x + Math.sin(ry) * .26, TOP + .028 - .004, hp.z + Math.cos(ry) * .26, ry);
  st.cover.visible = true;
}

// b079 & b081: chambre_jour standing
const ch1 = staged('chambre_jour', {
  mohammed: { at: [930, 860], face: 'cam', yaw: .18, seed: 3, look: 'cam', lookMax: .55 },
  zoubida: { at: [640, 845], face: [1040, 840], seed: 7, look: [1120, 820, 1.3], lookMax: .6 },
}, {
  light: ROOM_LT,
  addressee: { zoubida: 'mohammed' },
  act(lt, t, S, st) {
    const { mohammed: mo, zoubida: zo } = st.A;
    const km = mo.group.scale.y / 1.6, kz = zo.group.scale.y / 1.6;

    // b079: happy morning stretch (arms forward-out below shoulder +45 deg, never >60 deg)
    if (IN(0, t)) {
      const str = win(0, .18, .82, t);
      if (str > .02) {
        mo.B.chest.rotation.x -= .07 * str;
        for (const [s, sg] of [['L', 1], ['R', -1]]) {
          const rest = front(mo, 'root', .1 * km, -sg * .16 * km, -.06 * km);
          const up = front(mo, 'chest', .24 * km, -sg * .2 * km, .06 * km);
          reach85(mo, s, rest.lerp(up, str), { grip: 0, pole: [sg * .45, -.1, .1] });
          PO.fingers(mo, s, .18, { spread: .25 });
        }
      }
    }

    // b081: Zoubida replies courteously with hand at chest
    if (IN(2, t)) {
      const q = win(2, .05, .95, t);
      zo.B.head.rotation.x += .08 * q;
      reach85(zo, 'R', front(zo, 'chest', .15 * kz, -.02 * kz, -.08 * kz), { grip: .02, pole: [-.35, -.15, .15] });
      PO.fingers(zo, 'R', .22, { spread: .18 });
    }
    mo.B.chest.updateWorldMatrix(false, true);
    zo.B.chest.updateWorldMatrix(false, true);
  },
});

// b080, b082, b083: patio_matin
const pa = staged('patio_matin', {
  mohammed: { at: [830, 990], face: 'rahma', seed: 3, look: 'rahma', lookMax: .8 },
  rahma: { at: [1300, 845], face: 'mohammed', seed: 9, look: 'mohammed', lookMax: .8 },
}, {
  light: PATIO_LT,
  addressee: { rahma: 'mohammed', mohammed: 'rahma' },
  act(lt, t, S, st) {
    const { mohammed: mo, rahma: ra } = st.A;
    const km = mo.group.scale.y / 1.6, kr = ra.group.scale.y / 1.6;

    // b080: Rahma waves warmly at shoulder/chin height (<= 60 deg above shoulder)
    if (IN(1, t)) {
      const q = win(1, .05, .95, t), sw = Math.sin(t * 6.5);
      ra.B.chest.rotation.x += .06 * q;
      reach85(ra, 'R', front(ra, 'chest', (.22 + .03 * sw) * kr, (-.18 + .04 * sw) * kr, .04 * kr), { grip: 0, pole: [-.45, -.15, .15] });
      PO.palmTo(ra, 'R', q * .7, dirW(ra, 0, 0, 1));
      PO.fingers(ra, 'R', .12, { spread: .3 });
    }

    // b082: Rahma sighs piously, palms modestly lifted
    if (IN(3, t)) {
      const q = win(3, .05, .95, t);
      ra.B.chest.rotation.x += .06 * q;
      ra.B.head.rotation.z += .07 * q;
      for (const [s, sg] of [['L', 1], ['R', -1]]) {
        reach85(ra, s, front(ra, 'chest', .22 * kr, -sg * .16 * kr, -.12 * kr), { grip: 0, pole: [sg * .42, -.12, .18] });
        PO.palmTo(ra, s, q * .8, V(0, 1, .2));
        PO.fingers(ra, s, .14, { spread: .28 });
      }
    }

    // b083: Mohammed bursts out laughing after the giant sneeze
    if (IN(4, t)) {
      const lgh = sm(B(4)[0] + 4.8, B(4)[0] + 5.6, t);
      if (lgh > .02) {
        mo.B.chest.rotation.x += .06 * Math.sin(t * 14) * lgh;
        mo.B.neck.rotation.x -= .16 * lgh;
        mo.B.head.rotation.x -= .14 * lgh;
        for (const [s, sg] of [['L', 1], ['R', -1]]) {
          reach85(mo, s, front(mo, 'chest', .16 * km, -sg * .08 * km, -.22 * km), { grip: .02, pole: [sg * .4, -.15, .2] });
          PO.fingers(mo, s, .25, { spread: .15 });
        }
      }
    }
    mo.B.chest.updateWorldMatrix(false, true);
    ra.B.chest.updateWorldMatrix(false, true);
  },
});

// b084: chambre_jour, back on the mattress reciting the Quran
const ch2 = staged('chambre_jour', {
  mohammed: { at: [1350, 694], face: [1100, 780], pose: 'kneel',
    o: { grounded: true, seat: TOP, lean: .08, spread: .045, hands: false, mattress: MATTRESS, avoid: CHEST },
    hands: false, seed: 3, look: 'zoubida', lookMax: .7,
    mutter: t => 2.8 * sm(B(5)[0] + 4.0, B(5)[0] + 5.0, t) },
  zoubida: { at: [1085, 785], face: 'cam', yaw: .52, pose: 'kneel',
    o: { grounded: true, lean: .08, avoid: CHEST }, hands: false, seed: 7, look: 'mohammed', lookMax: .75 },
}, {
  light: ROOM_LT,
  addressee: { zoubida: 'mohammed' },
  act(lt, t, S, st, S3) {
    const { mohammed: mo, zoubida: zo } = st.A;
    const km = mo.group.scale.y / 1.6, kz = zo.group.scale.y / 1.6;
    makeBedProps(S3, st, mo);
    lapRest(mo, t, 3);
    lapRest(zo, t, 7);

    // First half: Zoubida keeps one hand firmly on Mohammed's near shoulder; second half: Mohammed rocks gently reciting
    const steer = 1 - sm(B(5)[0] + 3.8, B(5)[0] + 4.8, t);
    const recite = sm(B(5)[0] + 4.0, B(5)[0] + 5.2, t);

    if (steer > .05) {
      zo.B.chest.rotation.x += .07 * steer;
      const shM = at(mo, 'upperArmL').add(V(0, .06 * km, .03));
      const rest = PO.hipToWorld(zo, -.17 * kz, .09 * kz, .23 * kz);
      reach85(zo, 'R', rest.lerp(shM, steer), { grip: .02, pole: [-.4, -.05, .25] });
      PO.fingers(zo, 'R', .2, { spread: .18 });
    }
    if (recite > .05) {
      mo.B.spine.rotation.x += .04 * Math.sin(t * 2.4) * recite;
      mo.B.chest.rotation.x += .03 * Math.sin(t * 2.4 + .4) * recite;
      for (const [s, sg] of [['L', 1], ['R', -1]]) {
        reach85(mo, s, front(mo, 'chest', .21 * km, -sg * .11 * km, -.17 * km), { grip: 0, pole: [sg * .36, -.12, .18] });
        PO.palmTo(mo, s, recite * .85, V(0, 1, .15));
        PO.fingers(mo, s, .12, { spread: .12 });
      }
    }
    st.actcheck = {
      contacts: steer > .3 ? [{ actors: ['zoubida', 'mohammed'], parts: ['handR:upperArmL', 'handR:torso', 'foreArmR:upperArmL'] }] : [],
    };
    mo.B.chest.updateWorldMatrix(false, true);
    zo.B.chest.updateWorldMatrix(false, true);
  },
});

export default beatScene(ID, {
  shots: { ch1, pa, ch2 },
  plan: {
    b079: { shot: 'ch1', size: 'M', on: 'mohammed', z: 1.55, dy: -20 },
    b080: { shot: 'pa', size: 'M', on: 'rahma', z: 1.5, dx: -110, dy: 25 },
    b081: { shot: 'ch1', size: 'CU', on: 'zoubida', z: 2.3, dx: 20, dy: -15 },
    b082: { shot: 'pa', size: 'M', on: 'rahma', z: 1.75, dx: -15, dy: 20 },
    b083: { shot: 'pa', size: 'CU', on: 'mohammed', z: 2.35, dy: 10, insAt: .46 },
    b084: { shot: 'ch2', size: 'M', on: 'mohammed', z: 1.38, dx: -65, dy: -15 },
  },
});
