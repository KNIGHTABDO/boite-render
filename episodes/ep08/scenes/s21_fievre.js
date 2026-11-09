// s21 fever. b152 Mohammed in bed (chambre_jour right mattress, as s16/s19), eyes heavy, hands resting on his chest,
// shallow fast breathing; M then CU (the push). b153 painting; b154 Zoubida kneels by the bed, both palms to her temples,
// rocking: "Mon fils va mourir !"; b155 painting (drum).
import * as PO from '../../../engine/poses.js';
import { aim } from '../../../engine/ik.js';
import * as PR from '../../../engine/props3d.js';
import { staged } from '../lib/autostage.js';
import { beatScene, lines, sm, at, V } from '../lib/beatscene.js';

const ID = 's21_fievre', L = lines(ID), B = i => L[i] || [0, 0];
const TOP = .26;
// Same right-bed axis and mattress height as s16. A small roll leaves him supine; the head turn alone faces the room.
const MO = { at: [1320, 765], face: [1560, 900], pose: 'lie', o: { top: TOP, turn: .10, headTurn: -.16, hands: 'chest' }, seed: 3, talk: 0,
  lids: t => .65 + .2 * (.5 + .5 * Math.sin(t * .6)) };
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
  zoubida: { at: [1000, 900], face: [1320, 765], pose: 'kneel', o: { lean: 1.5, hip: .18, spread: .065, hands: false },
    seed: 7, hands: false, talk: 0, lids: .6 },
}, {
  act(lt, t, S, st, S3) {
    const { zoubida: zo, mohammed: mo } = st.A, k = zo.group.scale.y / 1.6;
    st.G.apply = () => {};   // apply the downward gaze before solving the palms, so it cannot break hand/temple contact
    fever(mo, t, st, S3);
    const u = sm(B(2)[0] - .6, B(2)[0] + .3, t), r = Math.sin((t - B(2)[0]) * 2.2);
    zo.B.chest.rotation.x += .25 + .018 * r * u; zo.B.neck.rotation.x -= .18;
    zo.B.chest.rotation.z += .012 * Math.sin(t * 13) * u; zo.B.chest.updateWorldMatrix(false, true);
    PO.look(zo, at(mo, 'head'), .4, { max: .2 });
    for (const s of ['L', 'R']) {
      const sign = s === 'L' ? 1 : -1;
      const knee = at(zo, 'shin' + s).add(V(0, .10 * k, 0));
      const pole = knee.sub(at(zo, 'root')).applyAxisAngle(V(0, 1, 0), -zo.group.rotation.y).multiplyScalar(1 / k).toArray();
      const p = at(zo, 'head', [sign * .14, .24, .18]), wrist = p.clone();
      for (let i = 0; i < 3; i++) {
        PO.reach(zo, s, wrist, { grip: 0, pole });
        aim(zo.B['hand' + s], PO.handPts(zo, s).end, at(zo, 'head', [sign * .14, .35, .18]));
        PO.palmTo(zo, s, 1, at(zo, 'head', [sign * .10, .24, 0]).sub(p).normalize());
        wrist.add(p.clone().sub(PO.handPts(zo, s).palm));
      }
      PO.fingers(zo, s, .015, { thumb: .02, spread: .85 });
    }
  },
});

export default beatScene(ID, {
  shots: { ch1, ch2 },
  plan: {
    b152: { shot: 'ch1', size: 'M', on: 'mohammed', z: 4.2, zTo: 5.6, dx: 25, dy: -25, push: B(0)[1] - B(0)[0] + 1.5 },
    b154: { shot: 'ch2', size: 'M', on: 'zoubida', z: 2.5, dx: 100, dy: -45 },
    b155: { shot: 'p40_tambour', move: 'sink' },   // keep the drum painting, move down so the late crop retains his chin
  },
});
