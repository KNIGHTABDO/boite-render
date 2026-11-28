// s21 "Vers Sidi El Arafi".
// Room: aicha_pauvre (b131, b133–b137), painting p14_seffah_arafi (b132).
// Cast & placements:
//   - sh1 (aicha_pauvre, b131, b133–b136): aicha kneeling at [1180, 855], zoubida kneeling at [800, 855],
//     mohammed kneeling at [560, 920] opened 3/4 toward camera so his face clears Zoubida.
//     Brass tray, teapot and two glasses sit on the open floor in front of the gap between the women.
//   - sh2 (aicha_pauvre, b137): aicha rises from a deep stoop at [1160, 850] and leads toward the right doorway;
//     zoubida (haik, held shut) follows from [900, 860]; mohammed from [640, 900]. The tea tray is parked
//     at the back of the room, off the exit lane. Aïcha carries a folded white cloth, never the haik costume.
// Beat actions:
//   - b131: Heavy silence; all three sit still with lowered eyes before Aïcha speaks.
//   - b132: Painting p14_seffah_arafi (auto-picked via b.still) showing the narrow lane in Seffah.
//   - b133: Aïcha speaks quietly about blind Sidi El Arafi and her ruined nest, eyes glistening, gentle nod.
//   - b134: Zoubida nods solemnly; Mohammed sighs gravely like a grown-up.
//   - b135: Zoubida leans earnestly toward Aïcha with open palms ("Je tremble pour ma maison...").
//   - b136: Aïcha offers calm reassurance with a serene open palm ("Ayons confiance").
//   - b137: Aïcha pulls herself painfully upright holding her folded white cloth; Zoubida (in haik) and Mohammed turn out toward hope.
import * as THREE from 'three';
import * as IK from '../../../engine/ik.js';
import * as PO from '../../../engine/poses.js';
import * as PR from '../../../engine/props3d.js';
import { staged } from '../lib/autostage.js';
import { castScale, sealHaik, stride } from '../lib/fix8c.js';
import { settleRobe } from '../lib/fix8g.js';
import { beatScene, lines, sm, at, front, dirW, V } from '../lib/beatscene.js';

const ID = 's21_sidi_el_arafi', L = lines(ID), B = i => L[i] || [0, 0];
const IN = (i, t) => t >= B(i)[0] - .15 && t < (B(i + 1)[0] || B(i)[1] + .3);
const DOWN = t => t < B(1)[0];

/** Clamp every IK reach target to <= 0.85 * armLen so IK error stays < 0.03. */
function reach85(a, side, target, o = {}) {
  const sh = at(a, 'upperArm' + side);
  const len = sh.distanceTo(at(a, 'foreArm' + side)) + at(a, 'foreArm' + side).distanceTo(at(a, 'hand' + side));
  const d = target.clone().sub(sh), max = len * .85;
  const tgt = d.length() > max ? sh.clone().addScaledVector(d.normalize(), max) : target;
  return PO.reach(a, side, tgt, o);
}

/** Hands on the thighs, below the sash, for grounded kneeling actors. */
function lap85(a, side, k, drift = 0) {
  const sg = side === 'L' ? 1 : -1;
  const tg = PO.hipToWorld(a, sg * .16 * k, -.02 * k + drift, .15 * k);
  reach85(a, side, tg, { grip: .02, pole: [sg * .9, .2, .5] });
  PO.fingers(a, side, .28, { spread: .14 });
}

/** Folded white cloth (Aïcha's haïk) — thin stacked folds and a hanging flap, not a box. */
function foldedCloth() {
  const g = new THREE.Group();
  const cloth = PR.toon(0xf4f0e6), hem = PR.toon(0xe4dccb);
  const bits = [
    { s: [.22, .014, .15], p: [0, .016, 0], r: [.05, .12, .03] },
    { s: [.20, .012, .14], p: [.01, .03, .006], r: [-.1, -.25, .08] },
    { s: [.18, .01, .13], p: [-.012, .042, -.004], r: [.14, .35, -.06] },
    { s: [.13, .01, .16], p: [.015, .008, .09], r: [.85, .05, .04] },
  ];
  for (const { s, p, r } of bits) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(...s), cloth);
    m.position.set(...p); m.rotation.set(...r); m.castShadow = true;
    g.add(m);
  }
  const edge = new THREE.Mesh(new THREE.BoxGeometry(.2, .007, .016), hem);
  edge.position.set(0, .018, .07); edge.castShadow = true;
  g.add(edge);
  return g;
}

/** Both hands meet at the front opening so the haik sheet stays shut over the inner dress. */
function holdHaikShut(a) {
  const k = a.group.scale.y / 1.6;
  sealHaik(a);
  for (const [side, sg] of [['L', 1], ['R', -1]]) {
    reach85(a, side, front(a, 'chest', .15 * k, -sg * .04 * k, -.22 * k), { grip: .01, pole: [sg * .32, .04, .12] });
    PO.fingers(a, side, .4);
  }
  a.group.updateMatrixWorld(true);
  PO.drapeRobe(a, 0);
}

/** Deep stoop that straightens as `rise` goes 0 → 1. Robe hem stays on the floor so the body is not lifted back upright. */
function plantRise(a, rise) {
  const k = a.group.scale.y / 1.6, bend = 1 - rise;
  PO.setHipY(a, (0.38 + 0.48 * rise) * k);
  a.group.updateMatrixWorld(true);
  const hy = IK.wpos(a.B.root).y;
  for (const [side, sign] of [['L', 1], ['R', -1]]) {
    const ankle = PO.hipToWorld(a, sign * .08 * k, 0.04 - hy, .18 + .05 * rise);
    const pole = PO.hipToWorld(a, sign * .09 * k, .06 * k, .26);
    IK.leg(a, side, ankle, pole);
  }
  a.B.spine.rotation.x += .72 * bend;
  a.B.chest.rotation.x += .32 * bend;
  a.B.chest.updateWorldMatrix(false, true);
  PO.drapeRobe(a, 0);
}

function cradle(ai, ka, lift) {
  const bundle = front(ai, 'root', (.16 + .06 * lift) * ka, 0, (.02 + .16 * lift) * ka);
  for (const s of ['L', 'R']) {
    const sg = s === 'L' ? 1 : -1;
    reach85(ai, s, bundle.clone().addScaledVector(dirW(ai, sg, 0, 0), .07 * ka), { grip: .012, pole: [sg * .55, .15, .35] });
    PO.fingers(ai, s, .62, { spread: .04 });
  }
  const mid = PO.handPts(ai, 'L').palm.clone().add(PO.handPts(ai, 'R').palm).multiplyScalar(.5);
  return mid;
}

// b131, b133–b136: seated conversation in aicha_pauvre
const sh1 = staged('aicha_pauvre', {
  aicha: {
    at: [1180, 855], face: 'zoubida', yaw: .22, pose: 'kneel', o: { grounded: true, lean: .08, spread: .04 }, seed: 9,
    look: t => DOWN(t) ? [1080, 990, .04] : 'zoubida',
    lookMax: t => DOWN(t) ? 1.2 : .6,
  },
  zoubida: {
    at: [800, 855], face: 'aicha', yaw: -.22, pose: 'kneel', o: { grounded: true, lean: .1, spread: .04 }, seed: 7,
    look: t => {
      if (DOWN(t)) return [860, 990, .04];
      if (IN(3, t)) {
        const nod = Math.sin(Math.min(Math.PI, Math.max(0, t - B(3)[0]) * 2.8));
        return [1100, 870, .92 - .5 * nod];
      }
      return 'aicha';
    },
    lookMax: t => DOWN(t) || IN(3, t) ? 1.15 : .6,
  },
  mohammed: {
    height: 1.1, at: [560, 920], face: 'cam', yaw: .16, pose: 'kneel', o: { grounded: true, lean: .06, hip: .24, spread: .045 }, seed: 3,
    look: t => {
      if (DOWN(t)) return [620, 1020, .03];
      if (IN(3, t)) {
        const sigh = sm(B(3)[0] + .15, B(3)[0] + 1.0, t);
        return [640, 1000, .5 - .42 * sigh];
      }
      return [1000, 900, .55];
    },
    lookMax: t => DOWN(t) || IN(3, t) ? 1.2 : .48,
  },
}, {
  addressee: { aicha: 'zoubida', zoubida: 'aicha', narrator: 'aicha' },
  act(lt, t, S, st, S3) {
    const { aicha: ai, zoubida: zo, mohammed: mo } = st.A;
    for (const a of [ai, zo, mo]) castScale(a);
    mo.group.position.y -= .01;
    mo.group.updateMatrixWorld(true);
    const ka = ai.group.scale.y / 1.6, kz = zo.group.scale.y / 1.6, km = mo.group.scale.y / 1.6;

    if (!st.tea) {
      const mid = zo.home.clone().lerp(ai.home, .48);
      const toCam = S3.cam.position.clone().sub(mid); toCam.y = 0;
      if (toCam.lengthSq() < 1e-6) toCam.set(0, 0, 1); else toCam.normalize();
      const side = V(-toCam.z, 0, toCam.x);
      const c = mid.addScaledVector(toCam, .46);
      const yaw = Math.atan2(side.x, side.z);
      st.tray = S3.prop(PR.tray({ r: .2, col: 0xc89a3a }), c.x, 0, c.z, yaw);
      const put = (mesh, s, f) => {
        const p = c.clone().addScaledVector(side, s).addScaledVector(toCam, f);
        return S3.prop(mesh, p.x, .034, p.z, yaw);
      };
      st.pot = put(PR.teapot({ col: 0xbeb7a6 }), 0, -.02);
      st.g1 = put(PR.teaGlass({ fill: .55 }), -.1, .04);
      st.g2 = put(PR.teaGlass({ fill: .4 }), .1, .015);
      st.tea = true;
    }

    for (const [a, k, sd] of [[ai, ka, 0], [zo, kz, 1.3], [mo, km, 2.6]]) {
      for (const s of ['L', 'R']) lap85(a, s, k, .004 * Math.sin(t * .9 + sd + (s === 'L' ? 0 : 1.5)));
      a.B.chest.rotation.x += .012 * Math.sin(t * 1.1 + sd);
      a.B.chest.updateWorldMatrix(false, true);
    }

    // b133: Aïcha speaks quietly; Zoubida listens, leaning in a little
    if (IN(2, t)) {
      const w = sm(B(2)[0], B(2)[0] + .6, t);
      ai.B.neck.rotation.x += .05 * Math.sin(t * 1.8) * w;
      zo.B.spine.rotation.x += .14;
      zo.B.chest.rotation.x += .05 * Math.sin(t * 1.3);
      ai.B.chest.updateWorldMatrix(false, true);
      zo.B.chest.updateWorldMatrix(false, true);
      const palm = front(ai, 'chest', .22 * ka, -.12 * ka, -.08 * ka);
      const restL = PO.hipToWorld(ai, .15 * ka, -.02 * ka, .14 * ka);
      reach85(ai, 'L', restL.lerp(palm, w), { grip: .015, pole: [.38, -.2, .16] });
      PO.palmTo(ai, 'L', w, V(0, 1, .25));
      PO.fingers(ai, 'L', .15, { spread: .28 });
    }

    // b134: Zoubida nods with her whole trunk; Mohammed slumps into a grave sigh
    if (IN(3, t)) {
      const c3 = t - B(3)[0];
      const nod = Math.sin(Math.min(Math.PI, Math.max(0, c3) * 2.8));
      zo.B.spine.rotation.x += .2 * nod;
      zo.B.chest.rotation.x += .12 * nod;
      zo.B.neck.rotation.x += .16 * nod;
      const sigh = sm(B(3)[0] + .15, B(3)[0] + 1.0, t);
      mo.B.spine.rotation.x += .3 * sigh;
      mo.B.chest.rotation.x += .22 * sigh;
      mo.B.neck.rotation.x += .2 * sigh;
      zo.B.chest.updateWorldMatrix(false, true);
      mo.B.chest.updateWorldMatrix(false, true);
    }

    // b135: Zoubida leans earnestly toward Aïcha, both palms open in the space between them
    if (IN(4, t)) {
      const w = sm(B(4)[0], B(4)[0] + .45, t);
      zo.B.spine.rotation.x += .4 * w;
      zo.B.chest.rotation.x += .16 * w;
      zo.B.chest.updateWorldMatrix(false, true);
      for (const s of ['L', 'R']) {
        const sg = s === 'L' ? 1 : -1;
        const p = front(zo, 'chest', .48 * kz, -sg * .2 * kz, .05 * kz);
        reach85(zo, s, p, { grip: .01, pole: [sg * .42, -.12, .22] });
        PO.palmTo(zo, s, w, V(0, .45, 1));
        PO.fingers(zo, s, .04, { spread: .55 });
      }
    }

    // b136: Aïcha's right palm opens out toward Zoubida, high enough to read in the wide shot
    if (IN(5, t)) {
      const w = sm(B(5)[0], B(5)[0] + .25, t);
      ai.B.spine.rotation.x += .08 * w;
      ai.B.neck.rotation.x += .04 * Math.sin(t * 1.5) * w;
      ai.B.chest.updateWorldMatrix(false, true);
      const p = front(ai, 'chest', .5 * ka, .08 * ka, .1 * ka);
      reach85(ai, 'R', p, { grip: .01, pole: [-.4, -.1, .2] });
      PO.palmTo(ai, 'R', w, V(0, .55, 1));
      PO.fingers(ai, 'R', .04, { spread: .6 });
    }

    settleRobe(ai, 0);
    settleRobe(zo, 0);
  },
});

// b137: Aïcha rises heavily holding a folded white cloth; Zoubida (in haik) & Mohammed step toward the door
const W0 = B(6)[0] + 2.8, W1 = B(6)[1] - .4;
const DOOR = [1580, 930];
const sh2 = staged('aicha_pauvre', {
  aicha: {
    at: [1160, 850], face: DOOR, seed: 9, lookMax: .45,
    walk: { to: [1480, 910], t0: W0, t1: W1 },
    look: [1580, 900, 1.05],
  },
  zoubida: {
    at: [900, 860], face: DOOR, costume: 'haik', seed: 7, lookMax: .45,
    walk: { to: [1240, 890], t0: W0, t1: W1 },
    look: [1580, 900, 1.05],
  },
  mohammed: {
    at: [640, 910], face: DOOR, seed: 3, lookMax: .4,
    walk: { to: [980, 930], t0: W0, t1: W1 },
    look: [1580, 900, .72],
  },
}, {
  addressee: { narrator: 'aicha' },
  act(lt, t, S, st, S3) {
    const { aicha: ai, zoubida: zo, mohammed: mo } = st.A;
    for (const a of [ai, zo, mo]) castScale(a);

    if (!st.tea) {
      const p = S3.floorAt(900, 680);
      st.tray = S3.prop(PR.tray({ r: .2, col: 0xc89a3a }), p.x, 0, p.z, .4);
      st.pot = S3.prop(PR.teapot({ col: 0xbeb7a6 }), p.x + .05, .034, p.z - .02, -.6);
      st.cloth = S3.prop(foldedCloth(), 0, 0, 0);
      st.tea = true;
    }

    const rise = sm(B(6)[0], W0 - .1, t);
    const walking = t >= W0 && t < W1;
    if (walking) {
      stride(ai, t, W0, 1.15, 1);
      stride(zo, t, W0, 1.35, 1);
      stride(mo, t, W0, 1.7, 1);
    } else if (t < W0) plantRise(ai, rise);

    holdHaikShut(zo);
    const ka = ai.group.scale.y / 1.6;
    const mid = cradle(ai, ka, walking ? 1 : rise);
    S3.prop(st.cloth, mid.x, mid.y, mid.z, ai.group.rotation.y);
    st.cloth.rotation.x = -.55 * (1 - (walking ? 1 : rise));
    st.cloth.rotation.z = .08;
    st.cloth.visible = true;

    const km = mo.group.scale.y / 1.6;
    for (const s of ['L', 'R']) {
      const sg = s === 'L' ? 1 : -1;
      reach85(mo, s, PO.hipToWorld(mo, sg * .2 * km, -.02 * km, .16 * km), { grip: .015, pole: [sg * .7, .15, .35] });
      PO.fingers(mo, s, .22);
    }
  },
});

export default beatScene(ID, {
  shots: { sh1, sh2 },
  plan: {
    b131: { shot: 'sh1', size: 'W', on: 'aicha' },
    b132: { move: 'push' },   // painting p14_seffah_arafi auto-picked via b.still
    b133: { shot: 'sh1', size: 'W', on: 'aicha' },
    b134: { shot: 'sh1', size: 'W', on: 'mohammed' },
    b135: { shot: 'sh1', size: 'W', on: 'zoubida' },
    b136: { shot: 'sh1', size: 'W', on: 'aicha' },
    b137: { shot: 'sh2', size: 'W', on: 'aicha' },
  },
});
