// s21 fever. b152 Mohammed in bed (chambre_jour right mattress, as s16/s19), eyes heavy, hands resting on his chest,
// shallow fast breathing; M then CU (the push). b153 painting; b154 Zoubida kneels by the bed, both palms to her temples,
// rocking: "Mon fils va mourir !"; b155 painting (drum).
import * as PO from '../../../engine/poses.js';
import { staged } from '../lib/autostage.js';
import { beatScene, lines, sm, at, front, V } from '../lib/beatscene.js';

const ID = 's21_fievre', L = lines(ID), B = i => L[i] || [0, 0];

const MO = { at: [1330, 665], face: 0, pose: 'lie', o: { top: .3, turn: .35 }, seed: 3, talk: 0,
  look: (t, st, S3) => S3.cam.position.clone(), lookMax: .7,   // Argon r5: read face-down / doll-like → head rolled on the pillow toward the lens
  lids: t => .6 + .2 * (.5 + .5 * Math.sin(t * .6)) };
function fever(mo, t) {
  const km = mo.group.scale.y / 1.6;
  mo.B.chest.rotation.x += .02 * Math.sin(t * 5); mo.B.chest.updateWorldMatrix(false, true);   // body first, then the hands (no drift)
  for (const s of ['L', 'R']) {   // his hands rest on his chest, rising with a shallow fever breath
    const p = at(mo, 'upperArm' + s).lerp(at(mo, 'chest'), .65).add(V(0, (.09 + .008 * Math.sin(t * 5)) * km, 0));
    PO.reach(mo, s, p, { grip: .03 });
  }
}
// b152: the boy alone, M then the push to CU
const ch1 = staged('chambre_jour', { mohammed: MO }, { act(lt, t, S, st) { fever(st.A.mohammed, t); } });
// b154: Argon r5 — her back was to the lens and a forearm spiked through her head (look 'mohammed' at lookMax 1 + reach before
// the chest rock). She now kneels on the floor between the lens and the bed, facing us, the sick boy behind her.
const ch2 = staged('chambre_jour', { mohammed: MO, zoubida: { at: [1200, 900], face: 'cam', pose: 'kneel', seed: 7 } }, {
  act(lt, t, S, st) {
    const { zoubida: zo, mohammed: mo } = st.A, k = zo.group.scale.y / 1.6;
    fever(mo, t);
    const u = sm(B(2)[0] - .2, B(2)[0] + .5, t);   // palms to her temples, elbows out and down, then a slow rock
    if (u > 0) {
      const r = u * Math.sin((t - B(2)[0]) * 2.4);
      zo.B.chest.rotation.x += (.12 + .06 * r) * u; zo.B.chest.rotation.z += .05 * r; zo.B.neck.rotation.x += .1 * u; zo.B.chest.updateWorldMatrix(false, true);
      for (const s of ['L', 'R']) PO.reach(zo, s, front(zo, 'head', .05 * k, (s === 'L' ? -.085 : .085) * k, .02 * k).lerp(front(zo, 'root', .2 * k, (s === 'L' ? -.2 : .2) * k, 0), 1 - u),
        { grip: .02, pole: s === 'L' ? [.35, -.35, .1] : [-.35, -.35, .1] });
    }
  },
});

export default beatScene(ID, {
  shots: { ch1, ch2 },
  plan: {
    b152: { shot: 'ch1', size: 'M', on: 'mohammed', cover: [{ f: .5, size: 'CU', on: 'mohammed' }] },
    b154: { shot: 'ch2', size: 'M', on: 'zoubida' },
  },
});
