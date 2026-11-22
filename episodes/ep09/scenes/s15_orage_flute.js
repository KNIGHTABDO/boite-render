// s15 "L'orage et la flûte".
// b094 chambre_nuit (fadeIn 0.7): Mohammed lies alone in the dark bedroom, tossing and turning restlessly under the blanket.
// b095 patio_nuit (cast: []): empty storm-lashed courtyard with flickering lightning flashes, wind gusts, and slanted rain.
// b096 painting p10_orage_djinn: unearthly flute melody forged underwater by a mad djinn above the storm roofs.
// b097 chambre_nuit: Mohammed pulls the blanket up toward his chin in terror, eyes wide as lightning flickers through the shutters.
// b098 chambre_nuit: trembling, he murmurs the Sourate de l'Unité three times, drops his face into the cushion, and falls asleep.
import * as PO from '../../../engine/poses.js';
import * as PR from '../../../engine/props3d.js';
import * as K from '../../../engine/core.js';
import { staged } from '../lib/autostage.js';
import { lieOnBed, pillowUnder } from '../lib/fix8_lie.js';
import { beatScene, lines, sm, at, front, V } from '../lib/beatscene.js';

const ID = 's15_orage_flute', L = lines(ID), B = i => L[i] || [0, 0];

const MATTRESS = [[1188, 574], [1450, 574], [1455, 688], [1308, 690]];
const CHEST = [[1450, 580], [1830, 580], [1830, 850], [1450, 850]];
const TOP = .26;

function clampReach(a, side, target, o) {
  const sh = at(a, 'upperArm' + side);
  const len = sh.distanceTo(at(a, 'foreArm' + side)) + at(a, 'foreArm' + side).distanceTo(at(a, 'hand' + side));
  const d = target.clone().sub(sh);
  if (d.length() > len * .85) target = sh.clone().addScaledVector(d.normalize(), len * .85);
  return PO.reach(a, side, target, o);
}

function lightningPulse(t) {
  const f1 = Math.max(0, Math.sin(t * 7.3)) ** 10 * Math.max(0, Math.sin(t * 2.1 + .4));
  const f2 = Math.max(0, Math.sin(t * 13.7 + 1.8)) ** 14 * Math.max(0, Math.cos(t * 1.7));
  return K.clamp(f1 * 1.1 + f2 * .9, 0, 1);
}

// b094, b097, b098: Mohammed in bed (chambre_nuit)
const nu1 = staged('chambre_nuit', {
  mohammed: {
    at: [1350, 694], face: [1336, 754], pose: 'lie',
    o: { top: TOP, turn: .12, hands: 'belly', headTurn: -.16, mattress: MATTRESS, avoid: CHEST },
    seed: 3, talk: 0,
    lids: t => {
      if (t >= B(4)[0] + 3.0) return .25 + .72 * sm(B(4)[0] + 3.4, B(4)[1] - 1.0, t);
      if (t >= B(3)[0]) return .05;
      return .5 + .22 * Math.sin(t * 1.4);
    },
    mutter: t => (t >= B(4)[0] && t < B(4)[0] + 3.8) ? .7 : 0,
  },
}, {
  light: { key: '#90a6d4', keyI: .85, sky: '#36446b', ground: '#211c26', fillI: .42, shadow: .25 },
  fx: { vignette: .74 },
  over(lt, u, t) {
    if (t < B(3)[0] || t >= B(4)[0] + 4.5) return;
    const fl = lightningPulse(t) * (t < B(4)[0] ? 1 : .45);
    if (fl <= .04) return;
    const c = K.c;
    c.save(); c.globalCompositeOperation = 'screen';
    c.fillStyle = `rgba(195,218,255,${.22 * fl})`;
    c.fillRect(0, 0, K.W, K.H);
    c.restore();
  },
  act(lt, t, S, st, S3) {
    const mo = st.A.mohammed, km = mo.group.scale.y / 1.6;
    const restl = t < B(1)[0];
    const fear = t >= B(3)[0] && t < B(4)[0];
    const sleep = t >= B(4)[0] ? sm(B(4)[0] + 3.2, B(4)[0] + 5.8, t) : 0;
    const fl = fear ? lightningPulse(t) : 0;
    S3.key.intensity = .85 + 1.3 * fl;
    lieOnBed(mo, {
      top: TOP, feet: [.5, .87],
      origin: (st.mo0 ||= mo.group.position.clone()).clone().add(V(.04, 0, 0)),
      hands: 'belly', pillow: .085, tuck: .22, headTurn: -.14,
    });
    pillowUnder(S3, st, mo, { top: TOP, h: .09, col: 0x3b485e });
    st.cover ||= PR.blanket({ w: .42, l: .58, h: .065, col: 0x8a3a2c });
    const pullUp = fear ? sm(B(3)[0], B(3)[0] + .8, t) : (t >= B(4)[0] ? 1 - .35 * sleep : 0);
    const hp = mo.B.root.getWorldPosition(V(0, 0, 0)), ry = mo.group.rotation.y;
    const along = .28 - .11 * pullUp;
    S3.prop(st.cover, hp.x + Math.sin(ry) * along, TOP + .032 - .004, hp.z + Math.cos(ry) * along, ry);
    st.cover.visible = true;

    if (restl) {
      mo.B.chest.rotation.z += .07 * Math.sin(t * 1.6);
      mo.B.head.rotation.y += .22 * Math.sin(t * 1.9);
      mo.B.chest.rotation.x += .016 * Math.sin(t * 2.2);
    } else if (fear) {
      const shiv = Math.sin(t * 15) * .018;
      mo.B.chest.rotation.z += shiv;
      mo.B.head.rotation.y += .12 * Math.sin(t * 1.3) + shiv * .5;
      mo.B.chest.rotation.x += .02 * Math.sin(t * 3.1);
      const hy = at(mo, 'head').y;
      for (const [sd, sg] of [['L', 1], ['R', -1]]) {
        const tg = front(mo, 'chest', .12 * km, sg * .11 * km, .12 * km);
        tg.y = Math.min(tg.y, hy + .04);
        clampReach(mo, sd, tg, { grip: .02, pole: [sg * .6, -.2, -.2] });
        PO.fingers(mo, sd, .45, { spread: .1 });
      }
    } else {
      const shiv = (1 - sleep) * Math.sin(t * 12) * .014;
      mo.B.chest.rotation.z += shiv;
      mo.B.head.rotation.y -= .32 * sleep;
      mo.B.neck.rotation.x += .14 * sleep;
      mo.B.head.rotation.x += .10 * sleep;
      mo.B.chest.rotation.x += .012 * Math.sin(t * 1.5);
    }
    mo.B.chest.updateWorldMatrix(false, true);
  },
});

// b095: Empty courtyard at night during violent storm (plate-only shot with lightning & rain)
const storm = staged('patio_nuit', {}, {
  fx: { vignette: .78, grade: 'rgba(18,28,62,.24)' },
  view: (lt, u, t) => {
    const a = sm(B(1)[0], B(1)[1], t);
    const jolt = Math.sin(t * 26) * 4 * (Math.max(0, Math.sin(t * 3.8)) ** 6);
    return [960 + jolt, 540 - 38 * a + jolt * .5, 1.07 + .09 * a];
  },
  over(lt, u, t) {
    const c = K.c, fl = lightningPulse(t);
    c.save();
    if (fl > .03) {
      c.globalCompositeOperation = 'screen';
      const g = c.createRadialGradient(960, 220, 40, 960, 420, 1100);
      g.addColorStop(0, `rgba(220,235,255,${.65 * fl})`);
      g.addColorStop(1, 'rgba(110,150,230,0)');
      c.fillStyle = g;
      c.fillRect(0, 0, K.W, K.H);
    }
    c.globalCompositeOperation = 'screen';
    c.strokeStyle = `rgba(180,205,240,${.26 + .24 * fl})`;
    c.lineWidth = 1.6;
    c.beginPath();
    for (let i = 0; i < 90; i++) {
      const rx = ((K.hash(i, 1) * 2100 + t * (480 + (i % 5) * 60)) % 2100) - 90;
      const ry = ((K.hash(i, 2) * 1200 + t * (1350 + (i % 4) * 180)) % 1200) - 60;
      c.moveTo(rx, ry);
      c.lineTo(rx - 22, ry + 78);
    }
    c.stroke();
    c.restore();
  },
});

export default beatScene(ID, {
  shots: { nu1, storm },
  fadeIn: .7,
  plan: {
    b094: { shot: 'nu1', size: 'M', on: 'mohammed', z: 2.2, dx: -50, dy: -35 },
    b095: { shot: 'storm' },
    b096: { move: 'rise' },
    b097: { shot: 'nu1', size: 'CU', on: 'mohammed', z: 3.4, dx: -65, dy: -45 },
    b098: { shot: 'nu1', size: 'CU', on: 'mohammed', z: 3.6, dx: -55, dy: -40 },
  },
});
