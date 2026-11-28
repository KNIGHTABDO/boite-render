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
import { aimHead, fingerLips, holdGaze, openFace, reachHand } from '../lib/fix9_B.js';
import { beatScene, lines, sm, at, front, dirW, V } from '../lib/beatscene.js';

const ID = 's10_quarante_chats', L = lines(ID), B = i => L[i] || [0, 0];
const IN = (i, t) => t >= B(i)[0] - .15 && t < (B(i + 1)[0] || B(i)[1] + .3);
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
  zoubida: { at: [1140, 820], face: 'mohammed', height: 1.6, pose: 'kneel',
    o: { grounded: true, lean: .06, avoid: CHEST }, hands: false, seed: 7, look: 'mohammed', lookMax: .56 },
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
  mohammed: { at: [1400, 670], face: 'zoubida', pose: 'cross',
    o: { seat: TOP, floor: TOP, lean: .06, hands: false, mattress: MATTRESS, avoid: CHEST },
    hands: false, seed: 3, look: () => null },
  // A step left of his shoulder. Dead in front of him, her back covered 29% of his chest.
  zoubida: { at: [1160, 860], face: 'mohammed', height: 1.6, pose: 'kneel',
    o: { grounded: true, lean: .08, avoid: CHEST }, hands: false, seed: 7, look: () => null },
}, {
  light: MORNING,
  act(lt, t, S, st, S3) {
    holdGaze(st);
    const { mohammed: mo, zoubida: zo } = st.A;
    const km = mo.group.scale.y / 1.6, kz = zo.group.scale.y / 1.6;
    makeBedProps(S3, st, mo, true);

    lapRest(mo, t, 3);
    lapRest(zo, t, 7);
    const full = (i) => sm(B(i)[0] - .05, B(i)[0] + .22, t);
    let moAim = {}, zoAim = {};

    if (IN(0, t)) {
      const u = sm(B(0)[0] + 2.2, B(0)[1], t);
      mo.B.spine.rotation.x -= .08 * u;
    }

    // b058: curious head tilt. Hands stay in the lap — a chest reach read as a fist in the eye.
    if (IN(1, t)) {
      const q = full(1);
      moAim = { z: .18 * q, x: -.04 * q };
    }

    // b059: she startles upright out of the daze. Both hands leave the cheek.
    if (IN(2, t)) {
      const q = full(2);
      zo.B.spine.rotation.x -= .32 * q;
      zo.B.chest.rotation.x -= .14 * q;
      zoAim = { x: -.28 * q, z: -.06 * q };
    }

    // b060: solemn chin lift
    if (IN(3, t)) {
      const q = full(3);
      mo.B.spine.rotation.x -= .16 * q;
      mo.B.chest.rotation.x -= .1 * q;
      moAim = { x: -.42 * q };
    }

    // b061: astonishment, hand all the way up beside the cheek
    if (IN(4, t)) {
      const q = full(4);
      zo.B.spine.rotation.x -= .2 * q;
      zo.B.chest.rotation.x -= .08 * q;
      zoAim = { x: -.16 * q, z: .08 * q };
      const cheek = front(zo, 'head', .1 * kz, .08 * kz, .02 * kz);
      reachHand(zo, 'R', cheek, { grip: 0, pole: [-.3, .5, .35], max: .99 });
      PO.fingers(zo, 'R', .15, { spread: .3 });
    }

    // b063: warm teasing, a broader smile in the lean
    if (IN(6, t)) {
      const q = full(6);
      zo.B.chest.rotation.y += .12 * q;
      zo.B.spine.rotation.x += .06 * q;
      zoAim = { z: .16 * q, x: .05 * q };
      reachHand(zo, 'L', front(zo, 'chest', .22 * kz, -.14 * kz, .06 * kz), { grip: 0, pole: [.4, .15, .25] });
      PO.palmTo(zo, 'L', q * .8, V(0, 1, .2));
      PO.fingers(zo, 'L', .1, { spread: .32 });
    }

    // b064: firm proud nod, hands in the lap. A forward reach put the fist on his nose.
    if (IN(7, t)) {
      const q = full(7);
      const nod = Math.max(0, Math.sin((t - B(7)[0]) * 4.2));
      mo.B.spine.rotation.x -= .2 * q;
      mo.B.chest.rotation.x -= .12 * q;
      moAim = { x: -.36 * q + .24 * nod * q };
    }

    // b065: she laughs (first two clauses), he claps through the middle, then her finger goes to her lips
    if (IN(8, t)) {
      const c8 = t - B(8)[0], D8 = B(8)[1] - B(8)[0];
      const laughW = sm(0, .18, c8) * (1 - sm(D8 * .7, D8 * .8, c8));
      const clapW = sm(D8 * .26, D8 * .38, c8) * (1 - sm(D8 * .7, D8 * .8, c8));
      const hushW = sm(D8 * .74, D8 * .84, c8);
      if (laughW > .01) {
        zo.B.spine.rotation.x -= .2 * laughW;
        zo.B.chest.rotation.z = .08 * Math.sin(t * 11) * laughW;
        zo.B.chest.rotation.x -= .06 * laughW;
        zoAim = { x: -.28 * laughW, z: .06 * Math.sin(t * 9) * laughW };
        for (const [s, sg] of [['L', 1], ['R', -1]]) {
          reachHand(zo, s, front(zo, 'chest', .16 * kz, sg * .14 * kz, .08 * kz), { grip: 0, pole: [sg * .35, .3, .25] });
          PO.fingers(zo, s, .15, { spread: .25 });
        }
      }
      if (clapW > .01) {
        mo.B.chest.rotation.x += .04 * Math.sin(t * 14) * clapW;
        const sep = (.05 + .16 * Math.abs(Math.sin(t * 12))) * clapW;
        for (const [s, sg] of [['L', 1], ['R', -1]]) {
          const clap = at(mo, 'chest').add(V(0, -.04 * km, 0)).addScaledVector(dirW(mo, 0, 0, 1), .16 * km).addScaledVector(dirW(mo, sg, 0, 0), -sep * km);
          reachHand(mo, s, clap, { grip: 0, pole: [sg * .45, .15, .3] });
          PO.fingers(mo, s, .12, { spread: .08 });
        }
      }
      if (hushW > .01) fingerLips(zo, 'R');
    }

    // b066: the finger stays on the lips for the whole "Chut"
    if (IN(9, t)) {
      fingerLips(zo, 'R');
      zo.B.spine.rotation.x += .08;
      zoAim = { x: .06, z: .05 };
    }

    // b067: hopeful nod, hands down. The open palm was landing beside his eye.
    if (IN(10, t)) {
      const q = full(10);
      const nod = Math.sin((t - B(10)[0]) * 3.4);
      mo.B.spine.rotation.x -= .12 * q;
      moAim = { x: -.22 * q + .22 * nod * q, z: .06 * q };
    }

    // b068: she is beside the bed now, so the reach lands on him instead of empty air
    if (IN(11, t)) {
      const q = full(11);
      zo.B.spine.rotation.x += .08 * q;
      zo.B.chest.rotation.x += .06 * q;
      zoAim = { x: .1 * q };
      const arm = at(mo, 'upperArmL').add(V(0, .04 * km, 0));
      reachHand(zo, 'L', arm, { grip: .02, pole: [.4, .2, .35], max: .99 });
      PO.fingers(zo, 'L', .12, { spread: .22 });
      st.actcheck = {
        contacts: q > .2 ? [{ actors: ['zoubida', 'mohammed'], parts: ['handL:upperArmL', 'handL:upperArmR', 'handL:torso', 'foreArmL:upperArmL', 'foreArmL:upperArmR'] }] : [],
      };
    }

    mo.B.chest.updateWorldMatrix(false, true);
    zo.B.chest.updateWorldMatrix(false, true);
    aimHead(mo, at(zo, 'head'), moAim);
    aimHead(zo, at(mo, 'head'), zoAim);
    // She looks at him, which on this plate is away from the lens. Yaw the face back on every beat.
    openFace(zo, S3.cam.position, 62);
    // Head cues land after the gaze, so any finger/cheek target is solved on the head the camera sees.
    if (IN(4, t)) {
      reachHand(zo, 'R', front(zo, 'head', .1 * kz, .08 * kz, .02 * kz), { grip: 0, pole: [-.3, .5, .35], max: .99 });
      PO.fingers(zo, 'R', .15, { spread: .3 });
    }
    if (IN(8, t)) {
      const c8 = t - B(8)[0], D8 = B(8)[1] - B(8)[0];
      if (sm(D8 * .74, D8 * .84, c8) > .01) fingerLips(zo, 'R');
    }
    if (IN(9, t)) fingerLips(zo, 'R');
  },
});

const d062 = Math.max(.1, B(5)[1] - B(5)[0]);

export default beatScene(ID, {
  shots: { ch_lie, ch },
  plan: {
    b057: { shot: 'ch_lie', size: 'W', on: 'mohammed', segs: [[.55, 'ch']],
      cover: [{ f: .55, shot: 'ch', size: 'M', on: 'mohammed', z: 1.45, dx: -30, dy: -30 }] },
    b058: { shot: 'ch', size: 'M', on: 'mohammed', z: 2.1, dx: 60, dy: 10 },
    b059: { shot: 'ch', size: 'CU', on: 'zoubida', z: 3.6, dx: -80, dy: -28 },
    b060: { shot: 'ch', size: 'CU', on: 'mohammed', z: 4.2, dx: 130, dy: -10 },
    b061: { shot: 'ch', size: 'M', on: 'zoubida', z: 2.45 },
    // Hold the beignets insert through the honey line (the 40.9s tile fell after the 1.2s cut).
    b062: { move: 'panR', noIns: true, segs: [
      [6.05 / d062, 'i_beignets_miel', { move: 'push' }],
      [9.35 / d062, 'p07_quarante_chats', { move: 'panR' }],
    ] },
    b063: { shot: 'ch', size: 'CU', on: 'zoubida', z: 3.6, dx: -90, dy: -24 },
    b064: { shot: 'ch', size: 'CU', on: 'mohammed', z: 4.2, dx: 130, dy: -10 },
    b065: { shot: 'ch', size: 'M', on: 'zoubida', z: 2.05, dx: 20, dy: 16 },
    // Same close framing as the other hush shots, shifted so the boy's head centre falls outside the frame.
    b066: { shot: 'ch', size: 'CU', on: 'zoubida', z: 3.6, dx: -90, dy: -24 },
    b067: { shot: 'ch', size: 'CU', on: 'mohammed', z: 4.2, dx: 130, dy: -10 },
    b068: { shot: 'ch', size: 'CU', on: 'zoubida', z: 3.6, dx: -80, dy: -24 },
  },
});
