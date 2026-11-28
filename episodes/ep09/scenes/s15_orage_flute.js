// s15 "L'orage et la flûte".
// b094 chambre_nuit (fadeIn 0.7): Mohammed lies lengthwise on the right divan, head on the painted pillow, tossing under a blanket.
// b095 patio_nuit (cast: []): the ritual plate is graded into a dark storm — candles and the open door covered, hard rain, lightning.
// b096 painting p10_orage_djinn: unearthly flute melody (unchanged; the r01 note on it was a minor).
// b097 chambre_nuit: he pulls the blanket up to his chin, eyes wide.
// b098 chambre_nuit: he murmurs, then turns his face into the pillow and sleeps.
import * as K from '../../../engine/core.js';
import { staged } from '../lib/autostage.js';
import { lieTurn, blanketOn, lowerHands, DIVAN_AT, DIVAN_FEET, BED_TOP, BOY_H } from '../lib/fix9_D.js';
import { openFace, seatHead } from '../lib/fix9_B.js';
import { paintLids } from '../lib/fix9_M.js';
import { beatScene, lines, sm } from '../lib/beatscene.js';

const ID = 's15_orage_flute', L = lines(ID), B = i => L[i] || [0, 0];

const MATTRESS = [[1188, 574], [1450, 574], [1455, 688], [1308, 690]];
const CHEST = [[1450, 580], [1830, 580], [1830, 850], [1450, 850]];
const TOP = BED_TOP;

function bolt(t, peaks) {
  let f = 0;
  for (const p of peaks) { const d = t - p; f = Math.max(f, Math.exp(-d * d * 14)); }
  return K.clamp(f, 0, 1);
}

// Plate patio_nuit is 2752×1536, drawn with a 3.5% crop into 1920×1080. Door and candle
// bboxes were measured on the warm pixels of that plate.
function platePx(px, py) {
  const pw = 2752, ph = 1536, crop = .035;
  return [
    (px - pw * crop) / (pw * (1 - 2 * crop)) * K.W,
    (py - ph * crop) / (ph * (1 - 2 * crop)) * K.H,
  ];
}

// b094, b097, b098: Mohammed lengthwise on the painted divan.
const nu1 = staged('chambre_nuit', {
  mohammed: {
    at: DIVAN_AT, face: Math.atan2(DIVAN_FEET[0], DIVAN_FEET[1]), pose: 'lie', height: BOY_H,
    o: { top: TOP, hands: 'belly', headTurn: 0, pillow: .03, mattress: MATTRESS, avoid: CHEST },
    seed: 3, talk: 0,
    lids: t => {
      if (t >= B(4)[0] + 4.2) return .2 + .78 * sm(B(4)[0] + 4.4, B(4)[0] + 6.2, t);
      if (t >= B(3)[0]) return 0;
      return .35 + .2 * Math.sin(t * 1.1);
    },
    mutter: t => (t >= B(4)[0] && t < B(4)[0] + 4.0) ? .85 : 0,
  },
}, {
  light: { key: '#90a6d4', keyI: .85, sky: '#36446b', ground: '#211c26', fillI: .42, shadow: .25 },
  fx: { vignette: .74 },
  over(lt, u, t, S, st, S3) {
    const mo = st?.A?.mohammed;
    if (mo && t >= B(4)[0] + 4.2) paintLids(S3, mo, sm(B(4)[0] + 4.4, B(4)[0] + 6.2, t));
    if (t < B(3)[0] || t >= B(4)[0] + 4.2) return;
    const fl = bolt(t, [B(3)[0] + .4, B(3)[0] + 4.8, B(3)[0] + 6.5]);
    if (fl <= .05) return;
    const c = K.c;
    c.save(); c.globalCompositeOperation = 'screen';
    c.fillStyle = `rgba(200, 220, 255, ${.28 * fl})`;
    c.fillRect(-40, -40, K.W + 80, K.H + 80);
    c.restore();
  },
  act(lt, t, S, st, S3) {
    st.G.apply = () => {};
    const mo = st.A.mohammed;
    const restl = t < B(1)[0];
    const fear = t >= B(3)[0] && t < B(4)[0];
    const bury = t >= B(4)[0] ? sm(B(4)[0] + 4.0, B(4)[0] + 6.2, t) : 0;
    const pull = fear ? sm(B(3)[0], B(3)[0] + 2.4, t) : (t >= B(4)[0] ? 1 - .2 * bury : 0);
    const fl = fear ? bolt(t, [B(3)[0] + .4, B(3)[0] + 4.8]) : 0;
    S3.key.intensity = .85 + 1.6 * fl;

    const home = (st.mo0 ||= mo.group.position.clone());
    // A full side-roll lifts the upper foot off the mattress and turns the face away from the lens.
    const roll = restl ? Math.sin(t * .7) * .08 : bury * .06;
    const headTurn = restl ? Math.sin(t * .85 + .6) * .4 : (fear ? -.05 + .12 * Math.sin(t * 2.2) : .08 + bury * .55);
    lieTurn(mo, {
      top: TOP, feet: DIVAN_FEET, origin: home,
      hands: bury > .6 ? 'side' : (pull > .35 ? 'chest' : 'belly'),
      pillow: .03, tuck: .1 + bury * .16, headTurn, turn: roll,
    });
    blanketOn(S3, st, mo, {
      top: TOP, col: 0x6e4038, along: .7 - .38 * pull, w: .5, l: .64, h: .055, lift: .13 + .03 * pull,
    });
    mo.B.chest.rotation.z += restl ? Math.sin(t * .7) * .05 : 0;
    mo.B.chest.rotation.x += fear ? .04 * pull : (bury > .2 ? .06 * bury : 0);
    if (bury > .2) mo.B.head.rotation.x += .1 * bury;
    openFace(mo, S3.cam.position);
    seatHead(mo, TOP + .03);
    lowerHands(mo, .05);
    mo.B.chest.updateWorldMatrix(false, true);
  },
});

// b095: storm over the night courtyard. The plate is the ritual court; the overlay kills the candles,
// the incense glow and the open door, and puts a hard rain plus lightning on top.
const storm = staged('patio_nuit', {}, {
  fx: { vignette: .62, grade: 'rgba(12, 18, 40, .18)' },
  view: (lt, u, t) => {
    const a = sm(B(1)[0], B(1)[1], t);
    const jolt = Math.sin(t * 26) * 6 * (Math.max(0, Math.sin(t * 3.2)) ** 4);
    return [960 + jolt, 520 - 20 * a + jolt * .4, 1.08 + .06 * a];
  },
  over(lt, u, t) {
    const c = K.c, fl = bolt(t, [11.85, 14.4, 16.25, 18.6]);
    const door0 = platePx(1300, 540), door1 = platePx(1620, 840);
    const floor = platePx(1400, 1040);
    c.save();
    c.globalAlpha = .32;
    c.globalCompositeOperation = 'multiply';
    c.fillStyle = 'rgb(90, 110, 150)';
    c.fillRect(-300, -300, K.W + 600, K.H + 600);
    c.globalAlpha = 1;
    c.globalCompositeOperation = 'source-over';
    c.fillStyle = 'rgba(20, 16, 24, .94)';
    c.fillRect(door0[0], door0[1], door1[0] - door0[0], door1[1] - door0[1]);
    c.strokeStyle = 'rgba(6, 4, 8, .95)';
    c.lineWidth = 5;
    const mx = (door0[0] + door1[0]) / 2;
    c.beginPath(); c.moveTo(mx, door0[1]); c.lineTo(mx, door1[1]); c.stroke();
    c.fillStyle = 'rgba(12, 16, 32, .84)';
    c.beginPath(); c.ellipse(floor[0], floor[1], 520, 230, 0, 0, Math.PI * 2); c.fill();
    c.globalCompositeOperation = 'screen';
    c.strokeStyle = `rgba(220, 232, 255, ${.72 + .2 * fl})`;
    c.lineWidth = 2.4;
    c.beginPath();
    for (let i = 0; i < 420; i++) {
      const rx = ((K.hash(i, 1) * 2600 + t * (900 + (i % 5) * 120)) % 2600) - 300;
      const ry = ((K.hash(i, 2) * 1600 + t * (1900 + (i % 4) * 260)) % 1600) - 240;
      c.moveTo(rx, ry);
      c.lineTo(rx - 70, ry + 130);
    }
    c.stroke();
    if (fl > .04) {
      const g = c.createRadialGradient(980, 180, 30, 960, 480, 1200);
      g.addColorStop(0, `rgba(230, 240, 255, ${.75 * fl})`);
      g.addColorStop(1, 'rgba(120, 160, 230, 0)');
      c.fillStyle = g;
      c.fillRect(-200, -200, K.W + 400, K.H + 400);
    }
    c.restore();
  },
});

export default beatScene(ID, {
  shots: { nu1, storm },
  fadeIn: .7,
  plan: {
    b094: { shot: 'nu1', size: 'M', on: 'mohammed', z: 2.6, dx: 20, dy: 40 },
    b095: { shot: 'storm' },
    b096: { move: 'rise' },
    b097: { shot: 'nu1', size: 'CU', on: 'mohammed', z: 5.6, dx: 0, dy: 18 },
    b098: { shot: 'nu1', size: 'CU', on: 'mohammed', z: 5.0, dx: 0, dy: 10 },
  },
});
