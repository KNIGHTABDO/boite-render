// s20 "La misère de Lalla Aïcha".
// Room: aicha_pauvre (b127–b130). All three cross-legged on the open tiles.
//   Aïcha welcomes with an open right palm, Zoubida looks across the bare room,
//   then Aïcha leans in and pours tea on the brass tray between them.
import * as PO from '../../../engine/poses.js';
import * as PR from '../../../engine/props3d.js';
import { staged } from '../lib/autostage.js';
import { castScale } from '../lib/fix8c.js';
import { beatScene, lines, sm, at, V } from '../lib/beatscene.js';
import { contact, easeClose, yawTo, lapHands, hemOnce } from '../lib/fix9_F.js';
import { plantCross, slideOff } from '../lib/fix9_J.js';

const ID = 's20_aicha_misere', L = lines(ID), B = i => L[i] || [0, 0];

const ap = staged('aicha_pauvre', {
  aicha: {
    at: [1180, 850], face: 'zoubida', pose: 'cross', hands: false, o: { lean: .04, hands: false }, seed: 9,
    look: (t, st) => t >= B(3)[0] && st.trayPos ? st.trayPos.clone().setY(.16) : 'zoubida', lookMax: .55,
  },
  zoubida: {
    at: [800, 855], face: 'aicha', pose: 'cross', hands: false, o: { lean: .04, hands: false }, seed: 7,
    look: (t, st) => {
      if (t >= B(1)[0] && t < B(2)[0]) {
        const u = Math.min(1, (t - B(1)[0]) / 9);
        return [360 + u * 280, 740 - u * 40, .45 + u * .35];
      }
      if (t >= B(3)[0] && st.trayPos) return st.trayPos.clone().setY(.18);
      return 'aicha';
    },
    lookMax: t => (t >= B(1)[0] && t < B(2)[0]) ? .7 : .5,
  },
  mohammed: {
    height: 1.1, at: [460, 920], face: 'aicha', pose: 'cross', hands: false,
    o: { lean: .04, hands: false }, seed: 3,
    look: (t, st) => {
      if (t >= B(1)[0] && t < B(2)[0]) return [340, 780, .38];
      if (t >= B(3)[0] && st.trayPos) return st.trayPos.clone().setY(.16);
      return 'aicha';
    },
    lookMax: t => (t >= B(1)[0] && t < B(2)[0]) ? .4 : .5,
  },
}, {
  addressee: { narrator: 'aicha' },
  act(lt, t, S, st, S3) {
    const { aicha: ai, zoubida: zo, mohammed: mo } = st.A;
    for (const a of [ai, zo, mo]) castScale(a);
    for (const a of [ai, zo, mo]) plantCross(a, 0);
    for (const a of [ai, zo, mo]) hemOnce(S3, st, a);

    if (!st.tea) {
      const p = ai.home.clone().lerp(zo.home, .5);
      p.z += .34;   // open floor in front of the crossed knees, centered between them
      st.trayPos = p.clone();
      st.tray = S3.prop(PR.tray({ r: .27, col: 0xc89a3a }), p.x, .01, p.z, .2);
      st.pot = S3.prop(PR.teapot({ col: 0xc9b48a }), p.x + .02, .05, p.z + .02, .5);
      st.g1 = S3.prop(PR.teaGlass({ fill: .35 }), p.x - .12, .05, p.z + .05, 0);
      st.g2 = S3.prop(PR.teaGlass({ fill: .2 }), p.x + .11, .05, p.z - .08, 0);
      for (const m of [st.pot, st.g1, st.g2]) m.scale.setScalar(1.7);
      st.jet = S3.prop(PR.stream(), 0, 0, 0);
      st.jet.visible = false;
      st.tea = true;
    }

    lapHands(ai); lapHands(zo); lapHands(mo);
    for (const [a, sd] of [[ai, 0], [zo, 1.3], [mo, 2.4]]) {
      a.B.chest.rotation.x += .02 * Math.sin(t * 1.05 + sd);
      a.B.chest.updateWorldMatrix(false, true);
    }

    // b127: open right palm toward the guests, beside the tray. Left hand stays on the lap.
    if (t >= B(0)[0] - .15 && t < B(1)[0] - .2) {
      const w = sm(B(0)[0] - .25, B(0)[0] + .3, t);
      const sh = at(ai, 'upperArmR'), guest = at(zo, 'chest');
      const dir = guest.sub(sh);
      dir.y = Math.min(dir.y, -.04);
      const len = dir.length() || 1;
      const reach = Math.min(.52 * (ai.group.scale.y / 1.6), len);
      const tgt = sh.clone().addScaledVector(dir.multiplyScalar(1 / len), reach);
      contact(ai, 'R', tgt, { grip: 0, pole: [-.4, .02, .18] });
      PO.palmTo(ai, 'R', w, V(0, .7, .55));
      PO.fingers(ai, 'R', .05, { spread: .48 });
    }

    // b128: Zoubida turns her shoulders to scan the stripped room. Mohammed looks across, not up at the ceiling.
    if (t >= B(1)[0] && t < B(2)[0]) {
      const u = sm(B(1)[0], B(1)[0] + 1.1, t);
      yawTo(zo, S3.floorAt(380, 750), .6 * u);
      yawTo(mo, S3.floorAt(360, 780), .35 * u);
      zo.B.spine.rotation.y -= .08 * u;
      mo.B.spine.rotation.y -= .05 * u;
      zo.B.chest.updateWorldMatrix(false, true);
      mo.B.chest.updateWorldMatrix(false, true);
    }

    // b130: she is already leaned in as the line starts, then the pot tilts into the near glass.
    if (t >= B(3)[0] - .6) {
      const approach = sm(B(3)[0] - .6, B(3)[0] - .05, t);
      easeClose(ai, st.trayPos, .4, approach);
      slideOff(ai, zo, .7);
      yawTo(ai, st.trayPos, .85);
      ai.B.spine.rotation.x += .26 * approach;
      ai.B.chest.rotation.x += .08 * approach;
      ai.B.chest.updateWorldMatrix(false, true);
      zo.B.spine.rotation.x += .05 * approach;
      mo.B.spine.rotation.x += .06 * approach;
      const sh = at(ai, 'upperArmR');
      const arm = sh.distanceTo(at(ai, 'foreArmR')) + at(ai, 'foreArmR').distanceTo(at(ai, 'handR'));
      const handleNow = st.pot.localToWorld(st.pot.userData.handle.clone());
      const pouring = t >= B(3)[0] - .02 && sh.distanceTo(handleNow) < arm * .92;
      if (!pouring) {
        contact(ai, 'R', handleNow, { grip: .02, pole: [-.32, .1, .12], frac: .86 });
        PO.fingers(ai, 'R', .55);
        st.jet.visible = false;
      } else {
        const tilt = .18 + .62 * sm(B(3)[0] - .02, B(3)[0] + .7, t);
        const r = PO.pour(ai, st.pot, st.g1, { side: 'R', lift: .11, tilt, yaw: 1.05, gaze: true });
        PR.stream(st.jet, r.spout, r.land, { r: .0045, col: 0xa8641e });
        st.jet.visible = tilt > .4;
      }
    } else {
      const p = st.trayPos;
      S3.prop(st.pot, p.x + .02, .05, p.z + .02, .5);
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
