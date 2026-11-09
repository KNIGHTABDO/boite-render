// s21 fever. b152 Mohammed in bed (chambre_jour right mattress, as s16/s19), eyes heavy, hands resting on his chest,
// shallow fast breathing; M then CU (the push). b153 painting; b154 Zoubida kneels by the bed, both palms to her temples,
// rocking: "Mon fils va mourir !"; b155 painting (drum).
import * as PO from '../../../engine/poses.js';
import { aim } from '../../../engine/ik.js';
import * as PR from '../../../engine/props3d.js';
import { staged, palmsOnFace } from '../lib/autostage.js';
import { beatScene, lines, sm, at, V } from '../lib/beatscene.js';

const ID = 's21_fievre', L = lines(ID), B = i => L[i] || [0, 0];
const TOP = .26;
const MATTRESS = [[1188, 574], [1450, 574], [1455, 688], [1308, 690]];
const CHEST = [[1450, 580], [1830, 580], [1830, 850], [1450, 850]];
// Same right-bed axis as s16: head on the back cushions, hands on the chest, clear of the wooden chest.
const MO = { at: [1350, 694], face: [1336, 754], pose: 'lie', o: { top: TOP, turn: .12, headTurn: -.16, hands: 'chest', mattress: MATTRESS, avoid: CHEST }, seed: 3, talk: 0,
  lids: t => .45 + .12 * (.5 + .5 * Math.sin(t * .6)) };
function fever(mo, t, st, S3) {
  if (!st.pillow) {
    st.pillow = PR.cushion({ w: .38, d: .3, h: .08, col: 0x647c7c });
    const p = at(mo, 'head', [0, .1, 0]).setY(TOP);   // lie().pillowAt: place the prop under the solved skull
    S3.prop(st.pillow, p.x, p.y, p.z, mo.group.rotation.y);
  }
  // The lying solve already puts open hands on the chest. Both arms inherit this tiny breath from the chest bone.
  // The old thick blanket block obscured his hands and looked like brown skin breaking through the white robe.
  mo.B.chest.rotation.x += .012 * Math.sin(t * 5); mo.B.chest.updateWorldMatrix(false, true);
}
// b152: a medium view including chest/hands, pushing to a full-face close-up, with room below his chin.
const ch1 = staged('chambre_jour', { mohammed: MO }, { act(lt, t, S, st, S3) { fever(st.A.mohammed, t, st, S3); } });
// b154: adult-sized floor kneel on the near/left side of the right bed. Her head stays clear of his pillow.
const ch2 = staged('chambre_jour', {
  mohammed: MO,
  zoubida: { at: [1100, 800], face: [1300, 980], pose: 'kneel', o: { grounded: true, lean: .16, hip: .30, spread: .065, hands: false, avoid: CHEST },
    seed: 7, hands: false, talk: 0, lids: .6 },
}, {
  act(lt, t, S, st, S3) {
    const { zoubida: zo, mohammed: mo } = st.A;
    st.G.apply = () => {};   // the temple contact has to survive the automatic gaze pass
    fever(mo, t, st, S3);
    const u = sm(B(2)[0] - .6, B(2)[0] + .3, t), r = Math.sin((t - B(2)[0]) * 2.2);
    zo.B.chest.rotation.z += .04 * r * u;
    palmsOnFace(zo, 'temples', { bow: .1 + .05 * r * u });
  },
});

export default beatScene(ID, {
  shots: { ch1, ch2 },
  plan: {
    b152: { shot: 'ch1', size: 'M', on: 'mohammed', z: 2.3, zTo: 3.8, dx: 10, dy: -55, push: B(0)[1] - B(0)[0] + 1.5 },
    b154: { shot: 'ch2', size: 'M', on: 'zoubida', z: 1.65, dx: 40, dy: -60 },
    b155: { shot: 'p40_tambour', move: 'sink' },   // keep the drum painting, move down so the late crop retains his chin
  },
});
