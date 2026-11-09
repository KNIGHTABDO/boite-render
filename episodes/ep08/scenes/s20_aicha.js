// s20 Lalla Aïcha. chambre_jour: the boy in bed (lying, right, background), the two women kneeling face to face left of
// centre. b144 Zoubida counts the story on her fingers; b145 Aïcha taps her own cheek ×3; b147 face in her hands; b148
// takes Zoubida's hand; b149 bitter laugh in tears; b150 Zoubida's hands to her cheeks; b151 they lean into each other's
// arms (hands on the other's shoulders), the boy watches.
import * as PO from '../../../engine/poses.js';
import { staged } from '../lib/autostage.js';
import { beatScene, lines, sm, at, front, V } from '../lib/beatscene.js';

const ID = 's20_aicha', L = lines(ID), B = i => L[i] || [0, 0];
const IN = (i, t) => t >= B(i)[0] - .15 && t < (B(i + 1)[0] || B(i)[1] + .3);

const ch = staged('chambre_jour', {
  zoubida: { at: [640, 950], face: 'aicha', pose: 'kneel', seed: 7 },
  aicha: { at: [1000, 935], face: 'zoubida', pose: 'kneel', seed: 9 },
  mohammed: { at: [1400, 1010], face: Math.PI / 2, pose: 'lie', o: { turn: .6 }, seed: 3, look: t => t > B(0)[1] ? 'aicha' : null },
}, {
  addressee: { zoubida: 'aicha', aicha: 'zoubida', narrator: 'zoubida' },
  act(lt, t, S, st) {
    const { zoubida: zo, aicha: ai } = st.A, kz = zo.group.scale.y / 1.6, ka = ai.group.scale.y / 1.6;
    if (IN(1, t)) { const n = Math.floor((t - B(1)[0]) / 1.1) % 4; PO.reach(zo, 'R', front(zo, 'chest', .3 * kz, .02 * kz, (-.05 + .02 * n) * kz), { grip: .02 }); PO.reach(zo, 'L', front(zo, 'chest', .3 * kz, -.04 * kz, -.06 * kz), { grip: 0 }); }
    if (IN(2, t)) { const tap = Math.max(0, Math.sin((t - B(2)[0]) * 6)) * (t - B(2)[0] < 3.2 ? 1 : 0); PO.reach(ai, 'R', front(ai, 'head', (.1 + .03 * tap) * ka, .08 * ka, -.06 * ka), { grip: .02 }); }
    if (IN(4, t)) { for (const s of ['L', 'R']) PO.reach(ai, s, front(ai, 'head', .1 * ka, (s === 'L' ? -.04 : .04) * ka, -.04 * ka), { grip: .03 }); ai.B.neck.rotation.x += .3; }
    if (IN(5, t) || IN(6, t)) { const mid = at(zo, 'chest').lerp(at(ai, 'chest'), .5).add(V(0, -.18, 0)); PO.reach(ai, 'R', mid, { grip: .02 }); PO.reach(zo, 'L', mid.clone().add(V(0, -.02, 0)), { grip: .02 }); }
    if (IN(7, t)) for (const s of ['L', 'R']) PO.reach(zo, s, front(zo, 'head', .08 * kz, (s === 'L' ? -.09 : .09) * kz, -.02 * kz), { grip: 0 });
    if (IN(8, t)) {
      const u = sm(B(8)[0], B(8)[0] + 1.2, t);
      zo.B.chest.rotation.x += .3 * u; ai.B.chest.rotation.x += .3 * u;
      PO.reach(zo, 'R', at(ai, 'chest').add(V(0, .12, 0)).lerp(front(zo, 'root', .2 * kz, .2 * kz, 0), 1 - u), { grip: .02 });
      PO.reach(ai, 'L', at(zo, 'chest').add(V(0, .12, 0)).lerp(front(ai, 'root', .2 * ka, -.2 * ka, 0), 1 - u), { grip: .02 });
    }
    for (const a of [zo, ai]) a.B.chest.updateWorldMatrix(false, true);
  },
});

export default beatScene(ID, {
  shots: { ch },
  plan: {
    b143: { shot: 'ch', size: 'M', on: 'mohammed' },
    b144: { shot: 'ch', size: 'M', on: 'zoubida' },
    b145: { shot: 'ch', size: 'CU', on: 'aicha' },
    b146: { shot: 'ch', size: 'CU', on: 'zoubida' },
    b147: { shot: 'ch', size: 'CU', on: 'aicha' },
    b148: { shot: 'ch', size: 'CU', on: 'aicha' },
    b149: { shot: 'ch', size: 'CU', on: 'aicha' },
    b150: { shot: 'ch', size: 'CU', on: 'zoubida' },
    b151: { shot: 'ch', size: 'W', on: 'zoubida' },
  },
});
