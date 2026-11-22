// s16 "Deux mondes".
// b099 painting p11_deux_mondes: sunlit Fès of morning sparrows above, bottomless night abysses below.
// b100 chambre_jour: Mohammed lies in bed (right divan), waking peacefully as warm morning sunbeams and dust motes stream across the room.
// b101 painting p12_sentiers_nuit: dark starless night trails where the boy curls tightly.
import * as PR from '../../../engine/props3d.js';
import * as K from '../../../engine/core.js';
import { staged } from '../lib/autostage.js';
import { lieOnBed, pillowUnder } from '../lib/fix8_lie.js';
import { beatScene, lines, sm, V } from '../lib/beatscene.js';

const ID = 's16_deux_mondes', L = lines(ID), B = i => L[i] || [0, 0];

const MATTRESS = [[1188, 574], [1450, 574], [1455, 688], [1308, 690]];
const CHEST = [[1450, 580], [1830, 580], [1830, 850], [1450, 850]];
const TOP = .26;

// b100: Morning rebirth in chambre_jour
const ch = staged('chambre_jour', {
  mohammed: {
    at: [1350, 694], face: [1336, 754], pose: 'lie',
    o: { top: TOP, turn: .12, hands: 'belly', headTurn: -.16, mattress: MATTRESS, avoid: CHEST },
    seed: 3, talk: 0,
    lids: t => .9 * (1 - sm(B(1)[0] + .5, B(1)[0] + 2.8, t)),
  },
}, {
  light: { key: '#ffe8b8', keyI: 2.35, sky: '#d4e2f8', ground: '#9a7e5c', fillI: 1.25, shadow: .24, dir: [2, 3, 1] },
  fx: { vignette: .42 },
  over(lt, u, t) {
    const c = K.c, warm = sm(B(1)[0], B(1)[0] + 2.5, t);
    c.save();
    c.globalCompositeOperation = 'screen';
    const g = c.createLinearGradient(420, 0, 1520, 920);
    g.addColorStop(0, `rgba(255,236,180,${.18 * warm})`);
    g.addColorStop(.6, `rgba(255,222,150,${.08 * warm})`);
    g.addColorStop(1, 'rgba(255,220,140,0)');
    c.fillStyle = g;
    c.beginPath();
    c.moveTo(460, 0); c.lineTo(940, 0); c.lineTo(1760, 940); c.lineTo(1060, 940);
    c.closePath(); c.fill();
    for (let i = 0; i < 24; i++) {
      const mx = 680 + K.hash(i, 1) * 920 + Math.sin(t * .45 + i) * 28;
      const my = 180 + K.hash(i, 2) * 580 + Math.cos(t * .35 + i * 1.3) * 18;
      const r = 1.6 + K.hash(i, 3) * 2.4;
      const a = (.22 + .2 * Math.sin(t * 1.4 + i * 2)) * warm;
      c.fillStyle = `rgba(255,244,205,${a})`;
      c.beginPath(); c.arc(mx, my, r, 0, 7); c.fill();
    }
    c.restore();
  },
  act(lt, t, S, st, S3) {
    const mo = st.A.mohammed;
    lieOnBed(mo, {
      top: TOP, feet: [.5, .87],
      origin: (st.mo0 ||= mo.group.position.clone()).clone().add(V(.04, 0, 0)),
      hands: 'belly', pillow: .085, tuck: .22, headTurn: -.14,
    });
    pillowUnder(S3, st, mo, { top: TOP, h: .085, col: 0x3b5875 });
    st.cover ||= PR.blanket({ w: .4, l: .56, h: .06, col: 0xb24a34 });
    const hp = mo.B.root.getWorldPosition(V(0, 0, 0)), ry = mo.group.rotation.y;
    S3.prop(st.cover, hp.x + Math.sin(ry) * .28, TOP + .03 - .004, hp.z + Math.cos(ry) * .28, ry);
    st.cover.visible = true;
    const wake = sm(B(1)[0] + 1.0, B(1)[0] + 4.2, t);
    mo.B.chest.rotation.x += .015 * Math.sin(t * 1.4);
    mo.B.head.rotation.y += .18 * wake;
    mo.B.neck.rotation.y += .08 * wake;
    mo.B.chest.updateWorldMatrix(false, true);
  },
});

export default beatScene(ID, {
  shots: { ch },
  plan: {
    b099: { move: 'push' },
    b100: { shot: 'ch', size: 'M', on: 'mohammed', z: 2.4, dx: -55, dy: -35 },
    b101: { move: 'sink' },
  },
});
