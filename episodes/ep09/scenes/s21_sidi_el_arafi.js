// s21 "Vers Sidi El Arafi".
// Room: aicha_pauvre (b131, b133–b137), painting p14_seffah_arafi (b132).
// Cast & placements:
//   - sh1 (aicha_pauvre, b131, b133–b136): aicha (default) kneeling at [1180, 855], zoubida (default) kneeling at [800, 855],
//     mohammed kneeling at [560, 875]; brass tray, teapot and two tea glasses on the floor between them.
//   - sh2 (aicha_pauvre, b137): zoubida (costume: 'haik') at [920, 855] and mohammed at [740, 875] stepping toward the right doorway [1580, 930];
//     aicha (default, never haik costume) rises heavily at [1180, 855] carrying a simple folded white cloth prop in her hands.
// Beat actions:
//   - b131: Heavy silence; all three sit still with lowered eyes before Aïcha speaks.
//   - b132: Painting p14_seffah_arafi (auto-picked via b.still) showing the narrow lane in Seffah.
//   - b133: Aïcha speaks quietly about blind Sidi El Arafi and her ruined nest, eyes glistening, gentle nod.
//   - b134: Zoubida nods solemnly; Mohammed sighs gravely like a grown-up.
//   - b135: Zoubida leans earnestly toward Aïcha with open palms ("Je tremble pour ma maison...").
//   - b136: Aïcha offers calm reassurance with a serene open palm ("Ayons confiance").
//   - b137: Aïcha pulls herself painfully upright holding her folded white cloth; Zoubida (in haik) and Mohammed turn out toward hope.
import * as THREE from 'three';
import * as PO from '../../../engine/poses.js';
import * as PR from '../../../engine/props3d.js';
import { staged } from '../lib/autostage.js';
import { castScale, sealHaik, stride } from '../lib/fix8c.js';
import { haikTuck } from '../lib/fix8_G4.js';
import { beatScene, lines, sm, at, front, dirW, V } from '../lib/beatscene.js';

const ID = 's21_sidi_el_arafi', L = lines(ID), B = i => L[i] || [0, 0];
const IN = (i, t) => t >= B(i)[0] - .15 && t < (B(i + 1)[0] || B(i)[1] + .3);

/** Clamp every IK reach target to <= 0.85 * armLen so IK error stays < 0.03. */
function reach85(a, side, target, o = {}) {
  const sh = at(a, 'upperArm' + side);
  const len = sh.distanceTo(at(a, 'foreArm' + side)) + at(a, 'foreArm' + side).distanceTo(at(a, 'hand' + side));
  const d = target.clone().sub(sh), max = len * .85;
  const tgt = d.length() > max ? sh.clone().addScaledVector(d.normalize(), max) : target;
  return PO.reach(a, side, tgt, o);
}

/** Relaxed lap hand for grounded kneeling actors. */
function lap85(a, side, k, drift = 0) {
  const sg = side === 'L' ? 1 : -1;
  const tg = PO.hipToWorld(a, sg * .18 * k, .08 * k + drift, .24 * k);
  reach85(a, side, tg, { grip: .02, pole: [sg * .9, .2, .5] });
  PO.fingers(a, side, .32, { spread: .12 });
}

/** Simple folded white cloth prop (Aïcha's folded haïk) held in her hands at b137. */
function foldedCloth() {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(.26, .055, .19), PR.toon(0xf2eee6));
  const fold = new THREE.Mesh(new THREE.BoxGeometry(.24, .025, .16), PR.toon(0xe6dfd2));
  fold.position.y = .038;
  base.castShadow = fold.castShadow = true;
  g.add(base, fold);
  return g;
}

// b131, b133–b136: seated conversation in aicha_pauvre
const sh1 = staged('aicha_pauvre', {
  aicha: {
    at: [1180, 855], face: 'cam', yaw: -.45, pose: 'kneel', o: { grounded: true, lean: .08 }, seed: 9,
    look: t => IN(0, t) ? [980, 880, .25] : 'zoubida', lookMax: .6,
  },
  zoubida: {
    at: [800, 855], face: 'cam', yaw: .45, pose: 'kneel', o: { grounded: true, lean: .08 }, seed: 7,
    look: t => IN(0, t) ? [980, 880, .25] : 'aicha', lookMax: .6,
  },
  mohammed: {
    height: 1.1, at: [560, 875], face: 'cam', yaw: .45, pose: 'kneel', o: { grounded: true, lean: .08, hip: .24, spread: .045 }, seed: 3,
    look: t => IN(0, t) ? [840, 880, .25] : IN(4, t) ? 'zoubida' : 'aicha', lookMax: .6,
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
      const p = ai.home.clone().lerp(zo.home, .34);
      st.tray = S3.prop(PR.tray({ r: .21, col: 0xc89a3a }), p.x, 0, p.z, 0);
      st.pot = S3.prop(PR.teapot({ col: 0xbeb7a6 }), p.x + .06, .03, p.z - .02, -.8);
      st.g1 = S3.prop(PR.teaGlass({ fill: .35 }), p.x - .07, .03, p.z + .04, 0);
      st.g2 = S3.prop(PR.teaGlass({ fill: .35 }), p.x - .03, .03, p.z - .06, 0);
      st.tea = true;
    }

    // Default relaxed lap hands
    for (const [a, k, sd] of [[ai, ka, 0], [zo, kz, 1.3], [mo, km, 2.6]]) {
      for (const s of ['L', 'R']) lap85(a, s, k, .005 * Math.sin(t * .9 + sd + (s === 'L' ? 0 : 1.5)));
      a.B.chest.rotation.x += .012 * Math.sin(t * 1.1 + sd);
      a.B.chest.updateWorldMatrix(false, true);
    }

    // b131: heavy silence, eyes lowered
    if (IN(0, t)) {
      for (const a of [ai, zo, mo]) {
        a.B.neck.rotation.x += .14;
        a.B.chest.updateWorldMatrix(false, true);
      }
    }

    // b133: Aïcha speaks quietly with gentle nod & soft hand
    if (IN(2, t)) {
      const w = sm(B(2)[0], B(2)[0] + .6, t);
      ai.B.neck.rotation.x += .05 * Math.sin(t * 1.8) * w;
      ai.B.chest.updateWorldMatrix(false, true);
      const palm = front(ai, 'chest', .2 * ka, -.14 * ka, -.15 * ka);
      const restL = PO.hipToWorld(ai, .15 * ka, .07 * ka, .22 * ka);
      reach85(ai, 'L', restL.lerp(palm, w), { grip: .015, pole: [.38, -.2, .16] });
      PO.palmTo(ai, 'L', w, V(0, 1, .25));
      PO.fingers(ai, 'L', .15, { spread: .28 });
    }

    // b134: Zoubida nods solemnly; Mohammed sighs gravely
    if (IN(3, t)) {
      const c3 = t - B(3)[0];
      zo.B.neck.rotation.x += .1 * Math.max(0, Math.sin(c3 * 2.2));
      const sigh = Math.sin(Math.min(1, Math.max(0, (c3 - 1.8) / 2.2)) * Math.PI);
      mo.B.chest.rotation.x -= .04 * sigh;
      mo.B.neck.rotation.x += .08 * sigh;
      zo.B.chest.updateWorldMatrix(false, true); mo.B.chest.updateWorldMatrix(false, true);
    }

    // b135: Zoubida leans earnestly toward Aïcha with open palms
    if (IN(4, t)) {
      const w = sm(B(4)[0], B(4)[0] + .6, t);
      zo.B.spine.rotation.x += .1 * w;
      zo.B.chest.updateWorldMatrix(false, true);
      for (const s of ['L', 'R']) {
        const sg = s === 'L' ? 1 : -1;
        const p = front(zo, 'chest', .22 * kz, -sg * .14 * kz, -.15 * kz);
        const rest = PO.hipToWorld(zo, sg * .15 * kz, .07 * kz, .22 * kz);
        reach85(zo, s, rest.lerp(p, w), { grip: .015, pole: [sg * .4, -.2, .16] });
        PO.palmTo(zo, s, w, V(0, 1, .3));
        PO.fingers(zo, s, .12, { spread: .35 });
      }
    }

    // b136: Aïcha calms her with a serene open palm
    if (IN(5, t)) {
      const w = sm(B(5)[0], B(5)[0] + .6, t);
      ai.B.neck.rotation.x += .05 * Math.sin(t * 1.5) * w;
      ai.B.chest.updateWorldMatrix(false, true);
      const p = front(ai, 'chest', .21 * ka, .12 * ka, -.15 * ka);
      const restR = PO.hipToWorld(ai, -.15 * ka, .07 * ka, .22 * ka);
      reach85(ai, 'R', restR.lerp(p, w), { grip: .015, pole: [-.38, -.2, .16] });
      PO.palmTo(ai, 'R', w, V(0, 1, .25));
      PO.fingers(ai, 'R', .1, { spread: .3 });
    }
  },
});

// b137: Aïcha rises heavily holding a folded white cloth; Zoubida (in haik) & Mohammed step toward the door
const W0 = B(6)[0] + 2.8, W1 = B(6)[1] - .4;
const sh2 = staged('aicha_pauvre', {
  aicha: {
    at: [1180, 855], face: 'cam', yaw: .55, seed: 9, lookMax: .5,
    walk: { to: [1310, 875], t0: W0 + .2, t1: W1 },
    look: [1580, 930, 1.35],
  },
  zoubida: {
    at: [920, 855], face: 'cam', yaw: .55, costume: 'haik', seed: 7, lookMax: .5,
    walk: { to: [1090, 875], t0: W0, t1: W1 },
    look: t => t < W0 ? 'aicha' : [1580, 930, 1.35],
  },
  mohammed: {
    at: [740, 875], face: 'cam', yaw: .55, seed: 3, lookMax: .5,
    walk: { to: [920, 885], t0: W0, t1: W1 },
    look: [1580, 930, 1.2],
  },
}, {
  addressee: { narrator: 'aicha' },
  act(lt, t, S, st, S3) {
    const { aicha: ai, zoubida: zo, mohammed: mo } = st.A;
    for (const a of [ai, zo, mo]) castScale(a);
    sealHaik(zo);
    st.actcheck = { exposed: { zoubida: ['handL', 'handR', 'foreArmL', 'foreArmR'] } };

    if (!st.tea) {
      const p = S3.floorAt(1010, 875);
      st.tray = S3.prop(PR.tray({ r: .21, col: 0xc89a3a }), p.x, 0, p.z, 0);
      st.pot = S3.prop(PR.teapot({ col: 0xbeb7a6 }), p.x + .06, .03, p.z - .02, -.8);
      st.cloth = S3.prop(foldedCloth(), 0, 0, 0);
      st.tea = true;
    }

    const rise = sm(B(6)[0], B(6)[0] + 2.2, t);
    if (t > W0 + .2 && t < W1) stride(ai, t, W0 + .2, 1.2, 1);
    if (t > W0 && t < W1) {
      stride(zo, t, W0, 1.5, 1);
      stride(mo, t, W0, 2.0, 1);
    }

    // Aïcha straightens slowly from a heavy stoop, cradling her folded white cloth in both hands
    ai.B.spine.rotation.x += .22 * (1 - rise);
    ai.B.chest.rotation.x += .1 * (1 - rise);
    ai.B.chest.updateWorldMatrix(false, true);
    const ka = ai.group.scale.y / 1.6;
    const bundle = front(ai, 'root', .26 * ka, 0, .06 * ka);
    for (const s of ['L', 'R']) {
      const sg = s === 'L' ? 1 : -1;
      reach85(ai, s, bundle.clone().addScaledVector(dirW(ai, sg, 0, 0), .15 * ka), { grip: .015, pole: [sg * .9, .2, .5] });
      PO.fingers(ai, s, .45);
    }
    S3.prop(st.cloth, bundle.x, bundle.y, bundle.z, ai.group.rotation.y);
    st.cloth.visible = true;

    // Zoubida in haik & Mohammed with relaxed arms
    haikTuck(zo);
    const km = mo.group.scale.y / 1.6;
    for (const s of ['L', 'R']) {
      const sg = s === 'L' ? 1 : -1;
      reach85(mo, s, PO.hipToWorld(mo, sg * .22 * km, .04 * km, .22 * km), { grip: .015, pole: [sg * .9, .2, .5] });
      PO.fingers(mo, s, .25);
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
