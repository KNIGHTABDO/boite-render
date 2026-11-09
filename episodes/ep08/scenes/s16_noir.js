// s16 back home, the dark. Bedroom by day (chambre_jour): b103 Zoubida sits on the mattress edge (kneel on the floor in
// front of it), head in both hands; b104 CU, only breathing; b105 Mohammed cries then lies down, eyes on the ceiling;
// b106 two-shot, no gaze between them. b107 patio at night (patio_nuit), empty: slow push up to their dark window.
// b108 painting (green sparks).
import * as PO from '../../../engine/poses.js';
import { shot } from './_3d.js';
import { staged } from '../lib/autostage.js';
import { beatScene, lines, sm, front } from '../lib/beatscene.js';
import * as K from '../../../engine/core.js';

const ID = 's16_noir', L = lines(ID), B = i => L[i] || [0, 0];

const ch = staged('chambre_jour', {
  zoubida: { at: [720, 960], face: 'cam', pose: 'kneel', seed: 7, look: [720, 1060, 0] },
  mohammed: { at: [1260, 975], face: 0.9, pose: 'lie', o: { turn: 0 }, look: t => [1260, 975, 3] },
}, {
  addressee: {},
  act(lt, t, S, st) {
    const zo = st.A.zoubida, k = zo.group.scale.y / 1.6;
    for (const s of ['L', 'R']) PO.reach(zo, s, front(zo, 'head', .1 * k, (s === 'L' ? -.06 : .06) * k, -.03 * k), { grip: .03 });
    zo.B.neck.rotation.x += .3; zo.B.chest.rotation.x += .2; zo.B.chest.updateWorldMatrix(false, true);
  },
});

const win = shot({ plate: 'patio_nuit', async build() { return {}; }, view: (lt, u) => [1100, 420, 1.04 + .16 * K.ease(u)] });

export default beatScene(ID, {
  shots: { ch, win },
  plan: {
    b103: { shot: 'ch', size: 'M', on: 'zoubida' },
    b104: { shot: 'ch', size: 'CU', on: 'zoubida' },
    b105: { shot: 'ch', size: 'M', on: 'mohammed' },
    b106: { shot: 'ch', size: 'W', on: 'zoubida' },
    b107: { shot: 'win' },
  },
});
