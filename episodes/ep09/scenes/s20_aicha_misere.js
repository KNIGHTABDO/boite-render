// s20 "La misère de Lalla Aïcha".
// Room: aicha_pauvre (b127–b130).
// Cast & placements:
//   - ap (aicha_pauvre, b127–b130): aicha (default) cross-legged at [1180, 855] near the right mattress & kettle;
//     zoubida kneeling at [800, 845] facing aicha; mohammed cross-legged at [560, 880] near the left mattress.
//     Brass tea tray with teapot and two tea glasses sits on the bare floor between aicha and zoubida.
// Beat actions:
//   - b127: Lalla Aïcha welcomes them gently from the floor with an open palm beside her tray and kettle.
//   - b128: Quiet stillness as Mohammed and Zoubida look slowly across the stripped, bare room.
//   - b129: Mohammed glances up toward the pale clock mark on the back wall, then listens as a kitten cries outside (ins: tache_horloge).
//   - b130: With quiet dignity, Aïcha leans forward, lifts the teapot, and pours tea into a glass on the brass tray.
import * as THREE from 'three';
import * as PO from '../../../engine/poses.js';
import * as PR from '../../../engine/props3d.js';
import { staged } from '../lib/autostage.js';
import { castScale } from '../lib/fix8c.js';
import { beatScene, lines, sm, at, front, dirW, V } from '../lib/beatscene.js';

const ID = 's20_aicha_misere', L = lines(ID), B = i => L[i] || [0, 0];
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

const ap = staged('aicha_pauvre', {
  aicha: {
    at: [1180, 855], face: 'cam', yaw: -.45, pose: 'kneel', o: { grounded: true, lean: .08 }, seed: 9,
    look: t => IN(3, t) ? 'zoubida' : IN(1, t) ? [920, 845, 1.05] : 'zoubida', lookMax: .6,
  },
  zoubida: {
    at: [800, 855], face: 'cam', yaw: .45, pose: 'kneel', o: { grounded: true, lean: .08 }, seed: 7,
    look: t => IN(1, t) ? [1150, 845, .85] : IN(2, t) ? [940, 845, 1.35] : 'aicha', lookMax: .6,
  },
  mohammed: {
    height: 1.1, at: [560, 875], face: 'cam', yaw: .45, pose: 'kneel', o: { grounded: true, lean: .08, hip: .24, spread: .045 }, seed: 3,
    look: t => IN(1, t) ? [720, 855, 1.05] : IN(2, t) ? (t < B(2)[0] + 6.5 ? [920, 845, 1.55] : [450, 880, 1.35]) : 'aicha', lookMax: .6,
  },
}, {
  addressee: { narrator: 'aicha' },
  act(lt, t, S, st, S3) {
    const { aicha: ai, zoubida: zo, mohammed: mo } = st.A;
    for (const a of [ai, zo, mo]) castScale(a);
    mo.group.position.y -= .01;
    mo.group.updateMatrixWorld(true);
    const ka = ai.group.scale.y / 1.6, kz = zo.group.scale.y / 1.6, km = mo.group.scale.y / 1.6;

    // Tea service on the bare floor just in front of Aïcha
    if (!st.tea) {
      const p = ai.home.clone().lerp(zo.home, .34);
      st.trayPos = p.clone();
      st.tray = S3.prop(PR.tray({ r: .21, col: 0xc89a3a }), p.x, 0, p.z, 0);
      st.pot = S3.prop(PR.teapot({ col: 0xbeb7a6 }), p.x + .06, .03, p.z - .02, -.8);
      st.g1 = S3.prop(PR.teaGlass({ fill: .45 }), p.x - .07, .03, p.z + .04, 0);
      st.g2 = S3.prop(PR.teaGlass({ fill: .45 }), p.x - .03, .03, p.z - .06, 0);
      st.jet = S3.prop(PR.stream(), 0, 0, 0);
      st.tea = true;
    }

    // Default relaxed lap hands + subtle breathing
    for (const [a, k, sd] of [[ai, ka, 0], [zo, kz, 1.4], [mo, km, 2.7]]) {
      for (const s of ['L', 'R']) lap85(a, s, k, .006 * Math.sin(t * .9 + sd + (s === 'L' ? 0 : 1.5)));
      a.B.chest.rotation.x += .015 * Math.sin(t * 1.1 + sd);
      a.B.chest.updateWorldMatrix(false, true);
    }

    // b127: Aïcha welcomes them gently from the floor
    if (IN(0, t)) {
      const w = sm(B(0)[0], B(0)[0] + .7, t) * (1 - sm(B(0)[1] - .6, B(0)[1], t));
      const palm = front(ai, 'chest', .22 * ka, -.16 * ka, -.14 * ka);
      const restL = PO.hipToWorld(ai, .15 * ka, .07 * ka, .22 * ka);
      reach85(ai, 'L', restL.lerp(palm, w), { grip: .015, pole: [.38, -.2, .16] });
      PO.palmTo(ai, 'L', w, V(0, 1, .3));
      PO.fingers(ai, 'L', .12, { spread: .35 });
      ai.B.neck.rotation.x += .04 * Math.sin(t * 1.6) * w;
      ai.B.chest.updateWorldMatrix(false, true);
    }

    // b128–b129: quiet contemplation of the bare walls and the pale clock mark
    if (IN(1, t) || IN(2, t)) {
      mo.B.head.rotation.z += .05 * Math.sin(t * .7);
      zo.B.head.rotation.z -= .04 * Math.sin(t * .6 + 1);
      mo.B.chest.updateWorldMatrix(false, true);
      zo.B.chest.updateWorldMatrix(false, true);
    }

    // b130: Aïcha leans gently forward, lifts the teapot, and pours tea onto the brass tray
    const pour = IN(3, t) ? sm(B(3)[0] + .5, B(3)[0] + 1.5, t) * (1 - sm(B(3)[1] - .5, B(3)[1], t)) : 0;
    const p = st.trayPos;
    if (pour > .05) {
      ai.B.spine.rotation.x += .1 * pour;
      ai.B.chest.rotation.x += .06 * pour;
      ai.B.chest.updateWorldMatrix(false, true);
      const restPos = V(p.x + .06, .03, p.z - .02);
      const pourPos = V(p.x - .01, .21, p.z + .01);
      const cur = restPos.clone().lerp(pourPos, pour);
      S3.prop(st.pot, cur.x, cur.y, cur.z, -1.35);
      st.pot.rotation.x = .38 * pour;
      st.pot.updateMatrixWorld(true);
      const handle = st.pot.localToWorld(st.pot.userData.handle.clone());
      reach85(ai, 'R', handle, { grip: .015, pole: [-.45, -.1, .2] });
      PO.fingers(ai, 'R', .7);
      const spout = st.pot.localToWorld(st.pot.userData.spout.clone());
      const rim = st.g1.localToWorld(st.g1.userData.rim.clone());
      PR.stream(st.jet, spout, rim, { r: .0025, col: 0xa8641e });
      st.jet.visible = pour > .45;
    } else {
      S3.prop(st.pot, p.x + .06, .03, p.z - .02, -.8);
      st.pot.rotation.x = 0;
      st.jet.visible = false;
    }
  },
});

export default beatScene(ID, {
  shots: { ap },
  plan: {
    b127: { shot: 'ap', size: 'W', on: 'aicha' },
    b128: { shot: 'ap', size: 'W', on: 'aicha' },
    b129: { shot: 'ap', size: 'W', on: 'mohammed', insAt: .14 },
    b130: { shot: 'ap', size: 'W', on: 'aicha' },
  },
});
