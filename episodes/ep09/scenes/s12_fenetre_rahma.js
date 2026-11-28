// s12 "La fenêtre de Rahma".
// b079: Mohammed stretches, arms high and wide, in his clean djellaba.
// b080: Rahma stands on the courtyard tiles left of the well and waves across to him.
// b081: CU on Zoubida — an open-palm blessing, the boy stays outside this crop.
// b082: medium on Rahma, a pious sigh, off the well post.
// b083: CU on Mohammed laughing, plus the Ramadan-trumpet insert.
// b084: Zoubida kneels on the floor beside the mattress, both hands on his shoulders, then he recites.
import * as PO from '../../../engine/poses.js';
import * as PR from '../../../engine/props3d.js';
import { staged } from '../lib/autostage.js';
import { pillowUnder } from '../lib/fix8_lie.js';
import { reachClamp, lapHands } from '../lib/fix9_C.js';
import { beatScene, lines, sm, at, front, dirW, V } from '../lib/beatscene.js';

const ID = 's12_fenetre_rahma', L = lines(ID), B = i => L[i] || [0, 0];
const IN = (i, t) => t >= B(i)[0] - .15 && t < (B(i + 1)[0] || B(i)[1] + .3);
const win = (i, a, b, t) => { const [t0, t1] = B(i), D = t1 - t0; return sm(t0 + a * D, t0 + a * D + .35, t) * (1 - sm(t0 + b * D, t0 + b * D + .35, t)); };

const TOP = .26;
const MATTRESS = [[1188, 574], [1450, 574], [1455, 688], [1308, 690]];
const CHEST = [[1450, 580], [1830, 580], [1830, 850], [1450, 850]];
const ROOM_LT = { dir: [2, 3, 1], key: '#ffe8bc', keyI: 2.15, sky: '#d0def2', ground: '#91785a', fillI: 1.15, shadow: .28 };
const PATIO_LT = { dir: [2, 3, 1], key: '#ffe6ba', keyI: 2.15, sky: '#cbd9ee', ground: '#8f7759', fillI: 1.15, shadow: .26 };

function reach85(a, side, target, opt) { return reachClamp(a, side, target, opt); }

function makeBedProps(S3, st, mo) {
  pillowUnder(S3, st, mo, { top: TOP, h: .11, col: 0xd9c7a4, w: .42, d: .32 });
  if (st.pillow) {
    const back = dirW(mo, 0, 0, -1), hp = mo.B.root.getWorldPosition(V(0, 0, 0));
    S3.prop(st.pillow, hp.x + back.x * .24, TOP + .055 - .004, hp.z + back.z * .24, mo.group.rotation.y);
  }
  st.cover ||= PR.blanket({ w: .42, l: .54, h: .055, col: 0xb23a2a });
  const hp = mo.B.root.getWorldPosition(V(0, 0, 0)), ry = mo.group.rotation.y;
  S3.prop(st.cover, hp.x + Math.sin(ry) * .26, TOP + .028 - .004, hp.z + Math.cos(ry) * .26, ry);
  st.cover.visible = true;
}

const ch1 = staged('chambre_jour', {
  mohammed: { at: [1120, 900], face: 'cam', seed: 3 },
  zoubida: { height: 1.6, at: [740, 740], face: 'mohammed', yaw: -.35, seed: 7,
    look: (t, st) => {
      if (!IN(2, t)) return 'mohammed';
      const p = st.A.zoubida.B.head.getWorldPosition(V(0, 0, 0));
      p.x -= .55; p.y += .25; p.z += .4;
      return p;
    }, lookMax: 1.15 },
}, {
  light: ROOM_LT,
  addressee: { zoubida: 'mohammed' },
  act(lt, t, S, st) {
    const { mohammed: mo, zoubida: zo } = st.A;
    const km = mo.group.scale.y / 1.6, kz = zo.group.scale.y / 1.6;

    if (IN(0, t)) {
      const str = win(0, .1, .88, t);
      if (str > .02) {
        mo.B.spine.rotation.x -= .04 * str;
        mo.B.chest.rotation.x -= .06 * str;
        mo.B.chest.updateWorldMatrix(false, true);
        for (const [s, sg] of [['L', 1], ['R', -1]]) {
          const up = front(mo, 'head', .02 * km, -sg * .42 * km, .38 * km);
          reach85(mo, s, up, { grip: 0, pole: [sg * .15, -.35, .02] });
          PO.fingers(mo, s, .04, { spread: .45 });
        }
      }
    }

    if (!IN(2, t)) {
      zo.B.chest.rotation.z += .03 * Math.sin(t * .8);
      reach85(zo, 'R', front(zo, 'root', .18 * kz, .16 * kz, .02 * kz), { grip: .02, pole: [-.18, -.02, .08] });
      PO.fingers(zo, 'R', .28, { spread: .12 });
      reach85(zo, 'L', front(zo, 'root', .12 * kz, -.18 * kz, -.34 * kz), { grip: .02, pole: [.16, -.04, .04] });
    }

    if (IN(2, t)) {
      const q = sm(B(2)[0], B(2)[0] + .35, t);
      zo.B.chest.rotation.x -= .04 * q;
      zo.B.head.rotation.x -= .06 * q;
      zo.B.chest.updateWorldMatrix(false, true);
      // Open palm out in front of the chest, clear of the eye.
      reach85(zo, 'R', front(zo, 'chest', .4 * kz, .34 * kz, -.12 * kz), { grip: 0, pole: [-.15, -.04, .12] });
      PO.palmTo(zo, 'R', .95, V(.45, .2, .85));
      PO.fingers(zo, 'R', .04, { spread: .5 });
      reach85(zo, 'L', front(zo, 'root', .08 * kz, -.28 * kz, -.16 * kz), { grip: .02, pole: [.4, .1, .2] });
      PO.fingers(zo, 'L', .28, { spread: .12 });
    }
    mo.B.chest.updateWorldMatrix(false, true);
    zo.B.chest.updateWorldMatrix(false, true);
  },
});

// Rahma on the sunlit tiles in front of the well, not on the masonry. Mohammed answers from the left arch.
const pa = staged('patio_matin', {
  mohammed: { at: [560, 1045], face: 'rahma', yaw: .55, seed: 3,
    look: (t, st, S3) => {
      const p = st.A.rahma.B.head.getWorldPosition(V(0, 0, 0));
      return IN(4, t) ? p.lerp(S3.cam.position, .6) : p;
    }, lookMax: t => IN(4, t) ? 1.7 : 1.1,
    mutter: t => IN(4, t) && t > B(4)[0] + 2.0 ? 1.7 : 0 },
  rahma: { height: 1.6, at: [1080, 960], face: 'mohammed', seed: 9, look: 'mohammed', lookMax: .9 },
}, {
  light: PATIO_LT,
  addressee: { rahma: 'mohammed', mohammed: 'rahma' },
  act(lt, t, S, st) {
    const { mohammed: mo, rahma: ra } = st.A;
    const km = mo.group.scale.y / 1.6, kr = ra.group.scale.y / 1.6;

    if (IN(1, t)) {
      const q = win(1, .04, .96, t), sw = Math.sin(t * 6.2);
      ra.B.chest.rotation.x += .04 * q;
      ra.B.chest.updateWorldMatrix(false, true);
      reach85(ra, 'R', front(ra, 'head', .06 * kr, .46 * kr, (.22 + .06 * sw) * kr), { grip: 0, pole: [-.15, -.2, .05] });
      PO.palmTo(ra, 'R', q * .85, dirW(ra, .2, .35, .9));
      PO.fingers(ra, 'R', .05, { spread: .5 });
      reach85(ra, 'L', front(ra, 'root', .06 * kr, -.3 * kr, -.12 * kr), { grip: .02, pole: [.5, .14, .22] });
      mo.B.chest.rotation.x += .06 * q;
      mo.B.chest.updateWorldMatrix(false, true);
      reach85(mo, 'R', front(mo, 'head', .04 * km, .22 * km, (.1 + .05 * sw) * km), { grip: 0, pole: [-.15, -.15, .05] });
      PO.palmTo(mo, 'R', q * .7, dirW(mo, 0, .4, 1));
      PO.fingers(mo, 'R', .08, { spread: .4 });
    }

    if (IN(3, t)) {
      const q = sm(B(3)[0] + .4, B(3)[0] + 1.4, t);
      ra.B.spine.rotation.x -= .04 * q;
      ra.B.chest.rotation.x -= .08 * q;
      ra.B.head.rotation.x -= .14 * q;
      ra.B.chest.updateWorldMatrix(false, true);
      for (const [s, sg] of [['L', 1], ['R', -1]]) {
        reach85(ra, s, front(ra, 'chest', .26 * kr, -sg * .16 * kr, .02 * kr), { grip: 0, pole: [sg * .2, -.02, .1] });
        PO.palmTo(ra, s, q * .85, V(0, .85, .35));
        PO.fingers(ra, s, .08, { spread: .4 });
      }
    }

    if (IN(4, t)) {
      const lgh = sm(B(4)[0] + .6, B(4)[0] + 1.6, t);
      if (lgh > .02) {
        const bob = Math.sin(t * 11);
        mo.B.spine.rotation.x -= .06 * lgh;
        mo.B.chest.rotation.x -= (.08 + .05 * bob) * lgh;
        mo.B.head.rotation.x += .28 * lgh;
        mo.B.head.rotation.z += .08 * bob * lgh;
        mo.B.chest.updateWorldMatrix(false, true);
        for (const [s, sg] of [['L', 1], ['R', -1]]) {
          reach85(mo, s, front(mo, 'chest', .16 * km, -sg * .22 * km, .02 * km), { grip: 0, pole: [sg * .2, -.04, .1] });
          PO.fingers(mo, s, .15, { spread: .35 });
        }
      }
    }
    mo.B.chest.updateWorldMatrix(false, true);
    ra.B.chest.updateWorldMatrix(false, true);
  },
});

// Zoubida kneels on the stone beside the mattress, clear of the round table.
const ch2 = staged('chambre_jour', {
  mohammed: { at: [1380, 680], face: 'zoubida', yaw: .45, pose: 'cross',
    o: { seat: TOP, floor: TOP, lean: .06, hands: false, mattress: MATTRESS, avoid: CHEST },
    hands: false, seed: 3, look: 'zoubida', lookMax: .7,
    mutter: t => 2.8 * sm(B(5)[0] + 4.2, B(5)[0] + 5.2, t) },
  zoubida: { height: 1.6, at: [1220, 790], face: 'mohammed', yaw: -.7, pose: 'kneel',
    o: { grounded: true, lean: .12, avoid: CHEST }, hands: false, seed: 7, look: 'mohammed', lookMax: .8 },
}, {
  light: ROOM_LT,
  addressee: { zoubida: 'mohammed' },
  act(lt, t, S, st, S3) {
    const { mohammed: mo, zoubida: zo } = st.A;
    const km = mo.group.scale.y / 1.6, kz = zo.group.scale.y / 1.6;
    makeBedProps(S3, st, mo);

    const steer = 1 - sm(B(5)[0] + 3.6, B(5)[0] + 4.6, t);
    const recite = sm(B(5)[0] + 4.2, B(5)[0] + 5.2, t);

    if (steer > .05) {
      zo.B.spine.rotation.x += .12 * steer;
      zo.B.chest.rotation.x += .1 * steer;
      zo.B.chest.updateWorldMatrix(false, true);
      mo.group.updateMatrixWorld(true);
      for (const [s, sg] of [['L', 1], ['R', -1]]) {
        const shM = at(mo, s === 'L' ? 'upperArmR' : 'upperArmL').add(V(0, .06 * km, 0));
        reach85(zo, s, shM, { grip: .03, pole: [sg * .35, .12, .2] });
        PO.fingers(zo, s, .25, { spread: .12 });
      }
    } else {
      lapHands(zo, t, 7);
      PO.look(zo, at(mo, 'head'), .9, { max: .8 });
    }
    if (recite > .05) {
      mo.B.spine.rotation.x += .06 * Math.sin(t * 2.2) * recite;
      mo.B.chest.rotation.x += .04 * Math.sin(t * 2.2 + .4) * recite;
      mo.B.chest.updateWorldMatrix(false, true);
      for (const [s, sg] of [['L', 1], ['R', -1]]) {
        reach85(mo, s, front(mo, 'chest', .24 * km, -sg * .12 * km, .02 * km), { grip: 0, pole: [sg * .2, .02, .1] });
        PO.palmTo(mo, s, recite * .9, V(0, .9, .2));
        PO.fingers(mo, s, .08, { spread: .2 });
      }
    } else lapHands(mo, t, 3);

    st.actcheck = {
      contacts: steer > .25 ? [{ actors: ['zoubida', 'mohammed'], parts: ['handL:upperArmR', 'handR:upperArmL', 'handL:torso', 'handR:torso', 'foreArmL:upperArmR', 'foreArmR:upperArmL'] }] : [],
    };
    mo.B.chest.updateWorldMatrix(false, true);
    zo.B.chest.updateWorldMatrix(false, true);
  },
});

export default beatScene(ID, {
  shots: { ch1, pa, ch2 },
  plan: {
    b079: { shot: 'ch1', size: 'W', on: 'mohammed' },
    b080: { shot: 'pa', size: 'W', on: 'rahma' },
    b081: { shot: 'ch1', size: 'CU', on: 'zoubida', z: 6.2, dx: 24, dy: -50 },
    b082: { shot: 'pa', size: 'M', on: 'rahma', pt: [1080, 960], z: 2.35, dy: -20 },
    b083: { shot: 'pa', size: 'CU', on: 'mohammed', pt: [560, 1045], z: 3.4, dy: -28, insAt: 0, segs: [[.52, 'i_trompette_ramadan', { move: 'push' }], [.7, 'pa', {}]] },
    b084: { shot: 'ch2', size: 'M', on: 'mohammed', z: 1.65, dx: -20 },
  },
});
