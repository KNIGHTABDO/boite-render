// s21 fever. b152 Mohammed in bed (chambre_jour right mattress, as s16/s19), eyes heavy, hands resting on his chest,
// shallow fast breathing; M then CU (the push). b153 painting; b154 Zoubida kneels by the bed, both palms to her temples,
// rocking: "Mon fils va mourir !"; b155 painting (drum).
import * as PO from '../../../engine/poses.js';
import { aim } from '../../../engine/ik.js';
import * as PR from '../../../engine/props3d.js';
import { staged } from '../lib/autostage.js';
import * as IK from '../../../engine/ik.js';
import { lieOnBed, pillowUnder } from '../lib/fix8_lie.js';
import { beatScene, lines, sm, at, V } from '../lib/beatscene.js';

const ID = 's21_fievre', L = lines(ID), B = i => L[i] || [0, 0];
const TOP = .26;
const MATTRESS = [[1188, 574], [1450, 574], [1455, 688], [1308, 690]];
const CHEST = [[1450, 580], [1830, 580], [1830, 850], [1450, 850]];
// Same right-bed axis as s16: head on the back cushions, hands on the chest, clear of the wooden chest.
const MO = { at: [1350, 694], face: [1336, 754], pose: 'lie', o: { top: TOP, turn: .12, headTurn: -.16, hands: 'chest', pillow: .2, mattress: MATTRESS, avoid: CHEST }, seed: 3, talk: 0,
  lids: t => .78 + .08 * (.5 + .5 * Math.sin(t * .6)) };
// r25: both hands resting ON the chest (above the robe, never in it), fingers loosely curled, one a little lower than the other
function handsOnChest(mo, t) {
  const B = mo.B, k = mo.group.scale.y / 1.6;
  mo.group.updateMatrixWorld(true);
  const c = at(mo, 'chest'), ax = at(mo, 'upperArmL').sub(at(mo, 'upperArmR')).setY(0).normalize(), fw = V(-ax.z, 0, ax.x);   // shoulder axis, and the horizontal axis across it
  if (fw.dot(at(mo, 'root').sub(c).setY(0)) < 0) fw.negate();                                                                    // fw points toward the feet
  const br = .004 * Math.sin(t * 5);
  for (const [s, sg, along] of [['L', 1, .12], ['R', -1, .2]]) {
    const tg = c.clone().addScaledVector(ax, sg * .055 * k).addScaledVector(fw, along * k); tg.y += .24 * k + br;
    PO.reach(mo, s, tg, { grip: 0, pole: [sg * .5, .5, 0] });
    PO.fingers(mo, s, .25, { thumb: .2, spread: .1 });
  }
}
function fever(mo, t, st, S3) {
  lieOnBed(mo, { top: TOP, feet: [.5, .87], hands: 'chest', pillow: .2, tuck: -.12, headTurn: -.12 });   // r15: flat on the cloth, straight legs, diagonal so the length reads
  pillowUnder(S3, st, mo, { top: TOP, h: .2 });
  mo.B.chest.rotation.x += .012 * Math.sin(t * 5); mo.B.chest.updateWorldMatrix(false, true);
  handsOnChest(mo, t);
}
// r25: palms flat on the temples, fingers up the side of the scarf; spot raised well above the jaw
function temples(a, { bow = .06 } = {}) {
  const B = a.B; a.B.chest.rotation.x += .05; B.neck.rotation.x += bow; a.group.updateMatrixWorld(true);
  for (const s of ['L', 'R']) {
    const sg = s === 'L' ? 1 : -1, skin = () => B.head.localToWorld(V(sg * .085, .07, .02));
    let wrist = skin();
    for (let i = 0; i < 4; i++) {
      const p = skin();
      PO.reach(a, s, wrist, { grip: 0, pole: [sg * .75, .1, -.1] });
      IK.aim(B['hand' + s], PO.handPts(a, s).end, B.head.localToWorld(V(sg * .05, .22, .0)));
      wrist.add(p.clone().sub(PO.handPts(a, s).palm));
    }
    PO.fingers(a, s, .05, { thumb: .05, spread: .35 });
  }
}
// b152: a medium view including chest/hands, pushing to a full-face close-up, with room below his chin.
const ch1 = staged('chambre_jour', { mohammed: MO }, { act(lt, t, S, st, S3) { fever(st.A.mohammed, t, st, S3); } });
// b154: adult-sized floor kneel on the near/left side of the right bed. Her head stays clear of his pillow.
const ch2 = staged('chambre_jour', {
  mohammed: MO,
  zoubida: { at: [1085, 790], face: 'cam', yaw: .6, pose: 'kneel', o: { grounded: true, lean: .16, hip: .30, spread: .065, hands: false, avoid: CHEST },
    seed: 7, hands: false, talk: 0, lids: .6 },
}, {
  act(lt, t, S, st, S3) {
    const { zoubida: zo, mohammed: mo } = st.A;
    st.G.apply = () => {};   // the temple contact has to survive the automatic gaze pass
    fever(mo, t, st, S3);
    const u = sm(B(2)[0] - .6, B(2)[0] + .3, t), r = Math.sin((t - B(2)[0]) * 2.2);
    zo.B.chest.rotation.z += .05 * r * u; zo.B.chest.rotation.x += .1 * r * u;
    temples(zo, { bow: .06 + .05 * r * u });
  },
});

export default beatScene(ID, {
  shots: { ch1, ch2 },
  plan: {
    b152: { shot: 'ch1', size: 'M', on: 'mohammed', z: 3.6, zTo: 6.8, dx: 20, dy: -95, push: B(0)[1] - B(0)[0] + 1.5 },
    b153: { move: 'faceLm' },   // r25: crop clear of the unpainted left strip
    b154: { shot: 'ch2', size: 'M', on: 'zoubida', z: 1.65, dx: 170, dy: -30 },
    b155: { shot: 'p40_tambour', move: 'pushL', segs: [[.5, 'p40_tambour', { move: 'rise' }]] },   // keep the drum painting, move down so the late crop retains his chin
  },
});
