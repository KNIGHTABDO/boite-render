// s11 "Le tadeffi".
// b069: patio_matin left-arch threshold — Zoubida and Fatma whisper together, clear of the well.
// b070: patio_matin — Zoubida beckons Fatma toward the room; Fatma already holds the bowl.
// b071: chambre_jour — Fatma walks in on the stone floor with a steaming bowl; Mohammed turns his face to the wall.
// b072: chambre_jour — Fatma, on the floor beside the bed, looks down at the boy.
// b073: chambre_jour — Zoubida leans in and coaxes him with a beignet.
// b074: chambre_jour — Mohammed sits up and sniffs the bowl.
// b075: chambre_jour — both women swear; Mohammed points at his mother.
// b076: chambre_jour — Zoubida looks up, then walks out the door.
// b077: chambre_jour — Fatma, close on the banquette, holds the bowl out.
// b078: chambre_jour — Mohammed tips the bowl to his mouth and drinks.
import * as PO from '../../../engine/poses.js';
import * as PR from '../../../engine/props3d.js';
import { staged } from '../lib/autostage.js';
import { lieOnBed, pillowUnder } from '../lib/fix8_lie.js';
import { walk } from '../lib/acts.js';
import { reachClamp, lapHands, steamAt } from '../lib/fix9_C.js';
import { beatScene, lines, sm, at, front, dirW, V } from '../lib/beatscene.js';

const ID = 's11_tadeffi', L = lines(ID), B = i => L[i] || [0, 0];
const IN = (i, t) => t >= B(i)[0] - .15 && t < (B(i + 1)[0] || B(i)[1] + .3);

const TOP = .26;
const MATTRESS = [[1188, 574], [1450, 574], [1455, 688], [1308, 690]];
const CHEST = [[1450, 580], [1830, 580], [1830, 850], [1450, 850]];
const PATIO_LT = { dir: [2, 3, 1], key: '#ffe6ba', keyI: 2.1, sky: '#cbd9ee', ground: '#8f7759', fillI: 1.15, shadow: .26 };
const ROOM_LT = { dir: [2, 3, 1], key: '#ffe8bc', keyI: 2.15, sky: '#d0def2', ground: '#91785a', fillI: 1.15, shadow: .28 };

function reach85(a, side, target, opt) { return reachClamp(a, side, target, opt); }

function holdBowl(a, bowl, { fwd = .36, up = -.16, side = .14, tilt = .15, gripSpread = .11 } = {}) {
  const k = a.group.scale.y / 1.6;
  const center = front(a, 'chest', fwd * k, side * k, up * k);
  bowl.position.copy(center);
  bowl.rotation.order = 'YXZ';
  bowl.rotation.y = a.group.rotation.y;
  bowl.rotation.x = tilt;
  bowl.updateMatrixWorld(true);
  bowl.visible = true;
  for (const [s, sg] of [['L', 1], ['R', -1]]) {
    const sideV = dirW(a, sg, 0, 0);
    const tg = center.clone().addScaledVector(sideV, gripSpread * k).add(V(0, .01 * k, 0));
    reach85(a, s, tg, { grip: .015, pole: [sg * .28, -.02, .12] });
    PO.fingers(a, s, .42, { thumb: .35, spread: .1 });
  }
  return center;
}

function makeSoupBowl(S3, st) {
  st.bowl ||= S3.prop(PR.bowl({ r: .11, h: .07, glaze: 0x8fbf7a, food: 0xf0d78a }), 0, 0, 0);
  return st.bowl;
}

function makeBedProps(S3, st, mo, seated) {
  pillowUnder(S3, st, mo, { top: TOP, h: .1, col: 0xd9c7a4, w: .42, d: .32 });
  if (seated && st.pillow) {
    const back = dirW(mo, 0, 0, -1);
    const hp = mo.B.root.getWorldPosition(V(0, 0, 0));
    S3.prop(st.pillow, hp.x + back.x * .24, TOP + .05 - .004, hp.z + back.z * .24, mo.group.rotation.y);
  }
  st.cover ||= PR.blanket({ w: .42, l: .54, h: .055, col: 0xb23a2a });
  const hp = mo.B.root.getWorldPosition(V(0, 0, 0)), ry = mo.group.rotation.y;
  const off = seated ? .26 : .30;
  S3.prop(st.cover, hp.x + Math.sin(ry) * off, TOP + .028 - .004, hp.z + Math.cos(ry) * off, ry);
  st.cover.visible = true;
}

function faceToward(a, world) {
  const p = a.group.position;
  a.group.rotation.y = Math.atan2(world.x - p.x, world.z - p.z);
  a.group.updateMatrixWorld(true);
}

// Left arcade threshold. Both women stay on the tiles, left of the well and the bucket.
const pa = staged('patio_matin', {
  // Fatma stands camera-side of Zoubida so a look at her is also toward the lens, and close enough for the medium.
  zoubida: { height: 1.6, at: [640, 960], face: [560, 1040], seed: 7, look: 'fatma', lookMax: 1.2,
    walk: { to: [690, 1005], t0: B(0)[0] + 4.6, t1: B(0)[0] + 7.4 } },
  fatma: { height: 1.58, at: [540, 1030], face: [640, 960], seed: 11, look: 'zoubida', lookMax: 1.15,
    walk: { to: [590, 1040], t0: .15, t1: 2.7 } },
}, {
  light: PATIO_LT,
  addressee: { zoubida: 'fatma', fatma: 'zoubida' },
  act(lt, t, S, st, S3) {
    const { zoubida: zo, fatma: fa } = st.A;
    const kz = zo.group.scale.y / 1.6;
    const bowl = makeSoupBowl(S3, st);
    const ctr = holdBowl(fa, bowl, { fwd: .3, up: -.2, side: .16, tilt: .2 });
    steamAt(S3, st, 'pa', ctr, t);

    const urge = sm(B(0)[0] + 4.4, B(0)[0] + 5.2, t);
    const whisper = 1 - urge;
    if (whisper > .05) {
      zo.B.chest.rotation.x += .16 * whisper;
      fa.B.chest.rotation.x += .14 * whisper;
      zo.B.head.rotation.z += .06 * whisper;
      zo.B.chest.updateWorldMatrix(false, true);
      reach85(zo, 'R', front(zo, 'head', .16 * kz, .1 * kz, -.02 * kz), { grip: 0, pole: [-.2, .04, .1] });
      PO.fingers(zo, 'R', .32, { spread: .16 });
      reach85(zo, 'L', front(zo, 'root', .12 * kz, -.18 * kz, -.3 * kz), { grip: .02, pole: [.16, -.04, .04] });
    }
    if (urge > .05) {
      zo.B.chest.rotation.x += .08 * urge;
      zo.B.chest.updateWorldMatrix(false, true);
      const sw = Math.sin(t * 5);
      reach85(zo, 'R', front(zo, 'chest', (.38 + .05 * sw) * kz, .26 * kz, .08 * kz), { grip: 0, pole: [-.25, .02, .12] });
      PO.palmTo(zo, 'R', urge * .9, V(.15, .55, .8));
      PO.fingers(zo, 'R', .06, { spread: .48 });
      reach85(zo, 'L', front(zo, 'root', .14 * kz, -.2 * kz, -.28 * kz), { grip: .02, pole: [.2, -.05, .05] });
    }
    zo.B.chest.updateWorldMatrix(false, true);
    fa.B.chest.updateWorldMatrix(false, true);
  },
});

// Fatma stays on the open floor. Mohammed's face is turned toward the back wall.
const ch_lie = staged('chambre_jour', {
  mohammed: { at: [1320, 640], face: [1330, 760], pose: 'lie',
    o: { top: TOP, turn: 0, hands: 'belly', headTurn: .4, pillow: .1, mattress: MATTRESS, avoid: CHEST }, seed: 3, talk: 0 },
  fatma: { height: 1.58, at: [700, 1000], face: [700, 1080], walk: { to: [760, 980], t0: B(2)[0], t1: B(2)[0] + 3.4 },
    seed: 11, look: (t, st, S3) => IN(3, t) ? S3.cam.position.clone() : 'mohammed', lookMax: 1.15 },
  zoubida: { height: 1.6, at: [980, 655], face: 'mohammed', pose: 'kneel',
    o: { grounded: true, lean: .16, avoid: CHEST }, hands: false, seed: 7,
    look: (t, st, S3) => IN(4, t) ? S3.cam.position.clone() : 'mohammed', lookMax: 1.05 },
}, {
  light: ROOM_LT,
  addressee: { fatma: 'mohammed', zoubida: 'mohammed' },
  act(lt, t, S, st, S3) {
    const { mohammed: mo, fatma: fa, zoubida: zo } = st.A;
    const kz = zo.group.scale.y / 1.6;
    const listen = IN(4, t) ? sm(B(4)[0], B(4)[0] + .6, t) : 0;
    lieOnBed(mo, {
      top: TOP, feet: [.18, .9],
      origin: (st.mo0 ||= mo.group.position.clone()),
      hands: 'belly', pillow: .1, tuck: .18, headTurn: .4 - .22 * listen,
    });
    makeBedProps(S3, st, mo, false);
    mo.B.chest.rotation.x += .012 * Math.sin(t * 1.4);

    if (t >= B(2)[0] + 3.4) faceToward(fa, IN(3, t) ? S3.cam.position : at(mo, 'head'));

    const bowl = makeSoupBowl(S3, st);
    const ctr = holdBowl(fa, bowl, { fwd: IN(3, t) ? .34 : .3, up: -.18, side: .12, tilt: .3 });
    steamAt(S3, st, 'lie', ctr, t);
    lapHands(zo, t, 7);

    if (IN(3, t)) {
      fa.B.chest.rotation.x += .16;
      fa.B.chest.updateWorldMatrix(false, true);
    }
    if (IN(4, t)) {
      const q = sm(B(4)[0], B(4)[0] + .45, t);
      zo.B.spine.rotation.x += .2 * q;
      zo.B.chest.rotation.x += .16 * q;
      zo.B.chest.updateWorldMatrix(false, true);
      const sw = .04 * Math.sin(t * 3);
      reach85(zo, 'R', front(zo, 'chest', (.34 + sw) * kz, .22 * kz, .06 * kz), { grip: 0, pole: [-.22, .02, .1] });
      PO.palmTo(zo, 'R', q * .9, V(.1, .6, .75));
      PO.fingers(zo, 'R', .08, { spread: .42 });
      reach85(zo, 'L', PO.hipToWorld(zo, .14 * kz, .04 * kz, .3 * kz), { grip: .02, pole: [.18, -.04, .06] });
    }
    fa.B.chest.updateWorldMatrix(false, true);
    zo.B.chest.updateWorldMatrix(false, true);
  },
});

const ch_sit = staged('chambre_jour', {
  mohammed: { at: [1340, 700], face: 'fatma', yaw: -.35, pose: 'cross',
    o: { seat: TOP, floor: TOP, lean: .1, hands: false, mattress: MATTRESS, avoid: CHEST },
    hands: false, seed: 3, look: (t) => IN(6, t) ? 'zoubida' : 'fatma', lookMax: .8 },
  fatma: { height: 1.58, at: [1160, 725], face: 'cam', pose: 'cross',
    o: { seat: TOP, floor: TOP, lean: .14, avoid: CHEST }, hands: false, seed: 11,
    look: (t, st, S3) => IN(8, t) ? S3.cam.position.clone() : 'mohammed', lookMax: 1.75 },
  zoubida: { height: 1.6, at: [860, 910], face: 'cam', seed: 7,
    // While she is the shot, the face stays toward the lens. A ceiling plate point is above the horizon.
    look: (t, st, S3) => {
      if (IN(6, t) || IN(7, t) || t >= B(7)[0] + 1.3) {
        const c = S3.cam.position.clone();
        if (IN(7, t) && t < B(7)[0] + 1.3) c.y += .35;
        return c;
      }
      return 'mohammed';
    }, lookMax: 1.6 },
}, {
  light: ROOM_LT,
  addressee: { fatma: 'mohammed', zoubida: 'mohammed', mohammed: 'fatma' },
  act(lt, t, S, st, S3) {
    const { mohammed: mo, fatma: fa, zoubida: zo } = st.A;
    const km = mo.group.scale.y / 1.6, kz = zo.group.scale.y / 1.6;
    makeBedProps(S3, st, mo, true);

    const exitT0 = B(7)[0] + 1.3, exitT1 = B(7)[1] - .15;
    const leaving = t >= exitT0 && zo.group.visible;
    if (leaving) {
      st.zoStart ||= S3.floorAt(860, 910);
      st.zoEnd ||= S3.floorAt(400, 1000);
      walk(zo, st.zoStart, st.zoEnd, exitT0, exitT1, t);
    }
    zo.group.visible = t < B(8)[0];

    const drinking = t >= B(9)[0] + .15;
    const bowl = makeSoupBowl(S3, st);
    if (!drinking) {
      const offer = IN(8, t) ? .1 : IN(5, t) ? .06 : 0;
      const ctr = holdBowl(fa, bowl, { fwd: .3 + offer * .4, up: -.22, side: .18, tilt: .25 });
      steamAt(S3, st, 'sit', ctr, t);
      if (IN(8, t)) {
        fa.B.spine.rotation.x += .14;
        fa.B.chest.rotation.x += .12;
      }
    } else {
      lapHands(fa, t, 11);
      fa.B.chest.rotation.x += .1;
      fa.B.head.rotation.z -= .06;
    }

    const pointing = IN(6, t) && t >= B(6)[0] + 3.2;
    if (!drinking && !pointing) lapHands(mo, t, 3);

    if (IN(5, t) && !pointing) {
      mo.B.neck.rotation.x -= .16;
      mo.B.head.rotation.x -= .1;
      mo.B.chest.rotation.x += .08;
    }

    if (IN(6, t) && !leaving) {
      zo.B.chest.rotation.x += .1;
      zo.B.chest.updateWorldMatrix(false, true);
      reach85(zo, 'R', front(zo, 'chest', .2 * kz, .1 * kz, .08 * kz), { grip: 0, pole: [-.2, .04, .1] });
      PO.palmTo(zo, 'R', .85, dirW(zo, 0, .3, 1));
      PO.fingers(zo, 'R', .12, { spread: .28 });
      reach85(zo, 'L', front(zo, 'root', .12 * kz, -.18 * kz, -.32 * kz), { grip: .02, pole: [.18, -.04, .04] });
      // Fatma swears with the free hand; the other stays on the bowl via a second reach after holdBowl
      reach85(fa, 'R', front(fa, 'chest', .28 * (fa.group.scale.y / 1.6), .16 * (fa.group.scale.y / 1.6), .1 * (fa.group.scale.y / 1.6)), { grip: 0, pole: [-.2, .02, .1] });
      PO.palmTo(fa, 'R', .8, V(0, .7, .6));
      PO.fingers(fa, 'R', .1, { spread: .35 });
    }
    if (pointing) {
      mo.B.spine.rotation.x += .12;
      mo.B.chest.rotation.x += .1;
      mo.B.chest.updateWorldMatrix(false, true);
      reach85(mo, 'R', at(zo, 'chest'), { grip: 0, pole: [-.15, .12, .25] });
      PO.fingers(mo, 'R', .95, { each: [1, 0, 1, 1, 1] });
      lapHands(mo, t, 3);
      reach85(mo, 'R', at(zo, 'chest'), { grip: 0, pole: [-.15, .12, .25] });
      PO.fingers(mo, 'R', .95, { each: [1, 0, 1, 1, 1] });
    }

    if (IN(7, t) && !leaving && zo.group.visible) zo.B.chest.rotation.z += .05;

    if (drinking) {
      const sip = Math.max(0, Math.sin((t - B(9)[0]) * 2.4));
      mo.B.spine.rotation.x += .06;
      mo.B.chest.updateWorldMatrix(false, true);
      const lip = front(mo, 'root', .2 * km, .16 * km, .12 * km);
      bowl.position.copy(lip);
      bowl.rotation.order = 'YXZ';
      bowl.rotation.y = mo.group.rotation.y + .15;
      bowl.rotation.x = .85 + .2 * sip;
      bowl.updateMatrixWorld(true);
      bowl.visible = true;
      steamAt(S3, st, 'sit', lip, t);
      for (const [s, sg] of [['L', 1], ['R', -1]]) {
        const tg = lip.clone().addScaledVector(dirW(mo, sg, 0, 0), .12 * km).add(V(0, .02 * km, 0));
        reach85(mo, s, tg, { grip: .02, pole: [sg * .62, .22, .4] });
        PO.fingers(mo, s, .45, { thumb: .4, spread: .08 });
      }
    }

    mo.B.chest.updateWorldMatrix(false, true);
    fa.B.chest.updateWorldMatrix(false, true);
    if (zo.group.visible && !leaving) zo.B.chest.updateWorldMatrix(false, true);
  },
});

export default beatScene(ID, {
  shots: { pa, ch_lie, ch_sit },
  plan: {
    b069: { shot: 'pa', size: 'M', on: 'zoubida', pt: [660, 980], z: 1.35 },
    b070: { shot: 'pa', size: 'CU', on: 'zoubida', pt: [690, 1005] },
    b071: { shot: 'ch_lie', size: 'W', on: 'mohammed', insAt: .25 },
    b072: { shot: 'ch_lie', size: 'M', on: 'fatma', pt: [760, 980], z: 1.35 },
    b073: { shot: 'ch_lie', size: 'W', on: 'zoubida' },
    b074: { shot: 'ch_sit', size: 'CU', on: 'mohammed' },
    b075: { shot: 'ch_sit', size: 'W', on: 'zoubida' },
    b076: { shot: 'ch_sit', size: 'W', on: 'zoubida' },
    b077: { shot: 'ch_sit', size: 'W', on: 'fatma' },
    b078: { shot: 'ch_sit', size: 'M', on: 'mohammed' },
  },
});
