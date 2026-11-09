// s21 fever. b152 CU Mohammed lying (chambre_jour), eyes heavy, slow push; b153 painting; b154 Zoubida kneels by him,
// both hands to her head: "Mon fils va mourir !"; b155 painting (drum).
import * as PO from '../../../engine/poses.js';
import { staged } from '../lib/autostage.js';
import { beatScene, lines, sm, front } from '../lib/beatscene.js';

const ID = 's21_fievre', L = lines(ID), B = i => L[i] || [0, 0];

const ch = staged('chambre_jour', {
  mohammed: { at: [900, 1000], face: Math.PI / 2, pose: 'lie', o: { turn: -.35 }, seed: 3, look: [900, 1000, 3] },
  zoubida: { at: [1220, 950], face: 'mohammed', pose: 'kneel', seed: 7, look: 'mohammed' },
}, {
  act(lt, t, S, st) {
    const zo = st.A.zoubida, k = zo.group.scale.y / 1.6, u = sm(B(2)[0] - .2, B(2)[0] + .5, t);
    if (u > 0) for (const s of ['L', 'R']) PO.reach(zo, s, front(zo, 'head', .06 * k, (s === 'L' ? -.1 : .1) * k, .02 * k).lerp(front(zo, 'root', .2 * k, (s === 'L' ? -.2 : .2) * k, 0), 1 - u), { grip: .03 });
  },
});

export default beatScene(ID, {
  shots: { ch },
  plan: {
    b152: { shot: 'ch', size: 'CU', on: 'mohammed' },
    b154: { shot: 'ch', size: 'CU', on: 'zoubida' },
  },
});
