// s01 hook. b001 noon patio (patio_matin): the father's open hand holds the bracelets out to Zoubida; her eyes go from his
// hand to his face, a small laugh. b002 same evening, chambre_nuit: Zoubida kneels on the floor weeping, face in her hands,
// shoulders shaking; behind her Mohammed lies on the divan, awake, only blinking.
import * as PO from '../../../engine/poses.js';
import { staged } from '../lib/autostage.js';
import { beatScene, lines, sm, front, V } from '../lib/beatscene.js';

const ID = 's01_hook', L = lines(ID), B = i => L[i] || [0, 0];

const pa = staged('patio_matin', {
  father: { at: [620, 985], face: 'zoubida', seed: 5 },
  zoubida: { at: [900, 975], face: 'father', seed: 7,
    look: (t, st) => t < B(0)[0] + .45 * (B(0)[1] - B(0)[0]) ? st.offer : 'father' },
}, {
  act(lt, t, S, st) {
    const fa = st.A.father, zo = st.A.zoubida, k = fa.group.scale.y / 1.6;
    const u = sm(B(0)[0] - .2, B(0)[0] + .8, t);   // the hand comes forward, palm up, and stays there
    const p = front(fa, 'chest', .38 * k, .08 * k, -.2 * k).lerp(front(fa, 'root', .15 * k, .2 * k, 0), 1 - u);
    PO.reach(fa, 'R', p, { grip: 0 }); st.offer = p.clone().add(V(0, .03, 0));
    const laugh = sm(B(0)[0] + .55 * (B(0)[1] - B(0)[0]), B(0)[1], t);
    if (laugh > 0) { zo.B.chest.rotation.x += .05 * Math.sin(t * 14) * laugh; zo.B.chest.updateWorldMatrix(false, true); }
  },
});

const nu = staged('chambre_nuit', {
  zoubida: { at: [760, 1030], face: [1300, 1000], pose: 'kneel', seed: 7 },
  mohammed: { at: [1180, 845], face: Math.PI / 2, pose: 'lie', o: { top: .35, turn: .45 }, look: [800, 1000, .7], seed: 3 },
}, {
  act(lt, t, S, st) {
    const zo = st.A.zoubida, k = zo.group.scale.y / 1.6;
    for (const s of ['L', 'R']) PO.reach(zo, s, front(zo, 'head', .1 * k, (s === 'L' ? -.04 : .04) * k, -.04 * k), { grip: .03 });
    zo.B.neck.rotation.x += .35; zo.B.chest.rotation.x += .18 + .035 * Math.max(0, Math.sin(t * 9)) * (Math.sin(t * 1.3) > -.3 ? 1 : 0);   // sobs
    zo.B.chest.updateWorldMatrix(false, true);
  },
});

export default beatScene(ID, {
  shots: { pa, nu },
  plan: {
    b001: { shot: 'pa', size: 'CU', on: 'zoubida' },
    b002: { shot: 'nu', size: 'M', on: 'zoubida' },
  },
});
