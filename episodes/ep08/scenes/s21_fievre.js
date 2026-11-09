// s21 fever. b152 Mohammed in bed (chambre_jour right mattress, as s16/s19), eyes heavy, hands resting on his chest,
// shallow fast breathing; M then CU (the push). b153 painting; b154 Zoubida kneels by the bed, both palms to her temples,
// rocking: "Mon fils va mourir !"; b155 painting (drum).
import * as PO from '../../../engine/poses.js';
import { staged } from '../lib/autostage.js';
import { beatScene, lines, sm, at, front, V } from '../lib/beatscene.js';

const ID = 's21_fievre', L = lines(ID), B = i => L[i] || [0, 0];

const ch = staged('chambre_jour', {
  mohammed: { at: [1320, 705], face: Math.PI / 2, pose: 'lie', o: { top: .2, turn: .45 }, seed: 3, look: [1320, 705, 3], talk: 0,
    lids: t => .6 + .2 * (.5 + .5 * Math.sin(t * .6)) },
  zoubida: { at: [1250, 830], face: 'mohammed', pose: 'kneel', seed: 7, look: 'mohammed', lookMax: .9 },
}, {
  act(lt, t, S, st) {
    const { zoubida: zo, mohammed: mo } = st.A, k = zo.group.scale.y / 1.6, km = mo.group.scale.y / 1.6;
    for (const s of ['L', 'R']) {   // his hands rest on his chest, rising with a shallow fever breath
      const p = at(mo, 'upperArm' + s).lerp(at(mo, 'chest'), .65).add(V(0, (.09 + .008 * Math.sin(t * 5)) * km, 0));
      PO.reach(mo, s, p, { grip: .03 });
    }
    mo.B.chest.rotation.x += .02 * Math.sin(t * 5); mo.B.chest.updateWorldMatrix(false, true);
    const u = sm(B(2)[0] - .2, B(2)[0] + .5, t);   // b154: palms to her temples, elbows out and down, then a slow rock
    if (u > 0) {
      for (const s of ['L', 'R']) PO.reach(zo, s, front(zo, 'head', .07 * k, (s === 'L' ? -.09 : .09) * k, .0 * k).lerp(front(zo, 'root', .2 * k, (s === 'L' ? -.2 : .2) * k, 0), 1 - u),
        { grip: .02, pole: s === 'L' ? [.3, -.4, .05] : [-.3, -.4, .05] });
      const r = u * Math.sin((t - B(2)[0]) * 2.4);
      zo.B.chest.rotation.x += (.12 + .06 * r) * u; zo.B.chest.rotation.z += .05 * r; zo.B.chest.updateWorldMatrix(false, true);
    }
  },
});

export default beatScene(ID, {
  shots: { ch },
  plan: {
    b152: { shot: 'ch', size: 'M', on: 'mohammed', cover: [{ f: .5, size: 'CU', on: 'mohammed' }] },
    b154: { shot: 'ch', size: 'M', on: 'zoubida' },
  },
});
