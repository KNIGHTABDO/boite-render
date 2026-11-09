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

// mattresses on chambre_jour (1920 px): left one's front edge y≈855 (x 400–720), right one's floor centre ≈ (1320, 705), ~.2 m high
const ch = staged('chambre_jour', {
  zoubida: { at: [560, 845], face: 'cam', pose: 'step', o: { seat: .2, floor: 0 }, seed: 7, look: [600, 1000, 0], lookMax: .9 },
  mohammed: { at: [1000, 668], face: [650, 668], pose: 'lie', o: { top: .26, turn: .25 }, seed: 3, look: t => [1000, 668, 3] },
}, {
  addressee: {},
  act(lt, t, S, st) {
    const { zoubida: zo, mohammed: mo } = st.A, k = zo.group.scale.y / 1.6;
    // palms on her cheeks, fingers up to the temples: head bowed but the face stays readable between the hands
    for (const s of ['L', 'R']) PO.reach(zo, s, front(zo, 'head', .07 * k, (s === 'L' ? -.085 : .085) * k, -.06 * k), { grip: .02, pole: s === 'L' ? [.2, -.3, -.1] : [-.2, -.3, -.1] });
    const sob = .5 + .5 * Math.sin(t * 1.7);   // slow breathing, a catch every few seconds
    zo.B.neck.rotation.x += .16; zo.B.chest.rotation.x += .14 + .03 * sob; zo.B.chest.updateWorldMatrix(false, true);
    const cry = sm(B(2)[0], B(2)[0] + .4, t) * (1 - sm(B(2)[0] + .55 * (B(2)[1] - B(2)[0]), B(2)[0] + .55 * (B(2)[1] - B(2)[0]) + .8, t));   // b105: he cries first
    if (cry > 0) { mo.B.chest.rotation.x += .06 * Math.sin(t * 9) * cry; mo.B.neck.rotation.y += .25 * cry; mo.B.chest.updateWorldMatrix(false, true); }
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
