// s16 "Deux mondes".
// b099 painting p11_deux_mondes: sunlit Fès above, night below (passed in r01).
// b100 chambre_jour: Mohammed lies along the right divan and wakes into the morning beam.
// b101 painting p12_sentiers_nuit: wide hold so the father and the fqih keep their heads;
//      the r01 sink cropped them at the top of the frame.
import * as K from '../../../engine/core.js';
import { staged } from '../lib/autostage.js';
import { still, loadStill } from '../lib/stage.js';
import { lieTurn, lowerHands, DIVAN_AT, DIVAN_FEET, BED_TOP, BOY_H } from '../lib/fix9_D.js';
import { openFace, seatHead } from '../lib/fix9_B.js';
import { paintLids } from '../lib/fix9_M.js';
import { beatScene, lines, sm } from '../lib/beatscene.js';

const ID = 's16_deux_mondes', L = lines(ID), B = i => L[i] || [0, 0];

const MATTRESS = [[1188, 574], [1450, 574], [1455, 688], [1308, 690]];
const CHEST = [[1450, 580], [1830, 580], [1830, 850], [1450, 850]];
const TOP = BED_TOP;

// b100: morning on the right divan. No extra mat, no pillow disc — he lies on the painted bed.
const ch = staged('chambre_jour', {
  mohammed: {
    at: DIVAN_AT, face: Math.atan2(DIVAN_FEET[0], DIVAN_FEET[1]), pose: 'lie', height: BOY_H,
    o: { top: TOP, hands: 'chest', headTurn: .15, pillow: .04, mattress: MATTRESS, avoid: CHEST },
    seed: 3, talk: 0,
    lids: t => .85 * (1 - sm(B(1)[0] + .3, B(1)[0] + 3.2, t)),
  },
}, {
  light: { key: '#ffe8b8', keyI: 2.45, sky: '#d4e2f8', ground: '#9a7e5c', fillI: 1.25, shadow: .24, dir: [2, 3, 1] },
  fx: { vignette: .38 },
  over(lt, u, t, S, st, S3) {
    const c = K.c, warm = sm(B(1)[0], B(1)[0] + 1.6, t);
    c.save();
    c.globalCompositeOperation = 'screen';
    const g = c.createLinearGradient(1680, 0, 700, 980);
    g.addColorStop(0, `rgba(255, 236, 180, ${.34 * warm})`);
    g.addColorStop(.4, `rgba(255, 214, 140, ${.16 * warm})`);
    g.addColorStop(1, 'rgba(255, 210, 130, 0)');
    c.fillStyle = g;
    c.beginPath();
    c.moveTo(980, 0); c.lineTo(1920, 0); c.lineTo(1680, 1000); c.lineTo(720, 1000);
    c.closePath(); c.fill();
    for (let i = 0; i < 46; i++) {
      const mx = 900 + K.hash(i, 1) * 900 + Math.sin(t * .55 + i) * 36;
      const my = 80 + ((K.hash(i, 2) * 820 + t * (18 + (i % 5) * 6)) % 860);
      const r = 2.2 + K.hash(i, 3) * 2.8;
      const a = (.45 + .28 * Math.sin(t * 1.6 + i)) * warm;
      c.fillStyle = `rgba(255, 246, 214, ${a})`;
      c.beginPath(); c.arc(mx, my, r, 0, 7); c.fill();
    }
    c.restore();
    const mo = st?.A?.mohammed;
    if (mo) paintLids(S3, mo, .85 * (1 - sm(B(1)[0] + .3, B(1)[0] + 3.2, t)));
  },
  act(lt, t, S, st, S3) {
    st.G.apply = () => {};
    const mo = st.A.mohammed;
    const wake = sm(B(1)[0] + .4, B(1)[0] + 4.5, t);
    const home = (st.mo0 ||= mo.group.position.clone());
    lieTurn(mo, {
      top: TOP, feet: DIVAN_FEET, origin: home,
      hands: 'chest', pillow: .04, tuck: .14,
      headTurn: .1 + .28 * wake, turn: .04 + .06 * wake,
    });
    // No cloth through the hip: the orange cover was a sliver in the robe. He wakes uncovered into the beam.
    mo.B.chest.rotation.x += .02 * Math.sin(t * 1.3);
    mo.B.head.rotation.z += .03 * wake;
    // Glance toward the beam, then only as far as the face still reads to the lens. Skull stays on the pillow.
    openFace(mo, S3.cam.position);
    seatHead(mo, TOP + .04);
    lowerHands(mo, .05);
    mo.B.chest.updateWorldMatrix(false, true);
  },
});

// b101: stay almost full-frame. The shared `sink` move ended by cutting the father's head off.
const paths = {
  ownCover: true,
  async load() { await loadStill('p12_sentiers_nuit'); },
  fn(lt, u) {
    still('p12_sentiers_nuit', u, [.5, .38, 1, .5, .4, 1]);
    return { vignette: .5, paper: .2 };
  },
};

export default beatScene(ID, {
  shots: { ch, paths },
  plan: {
    b099: { move: 'push' },
    b100: { shot: 'ch', size: 'M', on: 'mohammed', z: 2.5, dx: 16, dy: 36 },
    b101: { shot: 'paths' },
  },
});
