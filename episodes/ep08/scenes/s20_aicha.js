// s20 Lalla Aïcha. chambre_jour: the boy in bed (lying, right, background), the two women kneeling face to face left of
// centre. b144 Zoubida counts the story on her fingers; b145 Aïcha taps her own cheek ×3; b147 face in her hands; b148
// takes Zoubida's hand; b149 bitter laugh in tears; b150 Zoubida's hands to her cheeks; b151 they lean into each other's
// arms (hands on the other's shoulders), the boy watches.
import * as PO from '../../../engine/poses.js';
import * as PR from '../../../engine/props3d.js';
import { staged, palmsOnFace } from '../lib/autostage.js';
import { beatScene, lines, sm, at, front, V } from '../lib/beatscene.js';

const ID = 's20_aicha', L = lines(ID), B = i => L[i] || [0, 0];
const IN = (i, t) => t >= B(i)[0] - .15 && t < (B(i + 1)[0] || B(i)[1] + .3);

const MATTRESS = [[1188, 574], [1450, 574], [1455, 688], [1308, 690]];
const CHEST = [[1450, 580], [1830, 580], [1830, 850], [1450, 850]];
const ch = staged('chambre_jour', {
  // Side by side on the carpet, knees toward the lens so the thighs don't meet. A small yaw turns each face toward the other.
  zoubida: { at: [750, 905], face: 'cam', yaw: .45, pose: 'kneel', o: { grounded: true, lean: .08, avoid: CHEST }, seed: 7 },
  aicha: { at: [1120, 905], face: 'cam', yaw: -.45, pose: 'kneel', o: { grounded: true, lean: .08, avoid: CHEST }, seed: 9 },
  mohammed: { at: [1350, 694], face: [1336, 754], pose: 'lie', o: { top: .26, turn: .12, hands: 'belly', headTurn: -.16, mattress: MATTRESS, avoid: CHEST }, seed: 3, talk: 0 },
}, {
  addressee: { zoubida: 'aicha', aicha: 'zoubida', narrator: 'zoubida' },
  act(lt, t, S, st, S3) {
    if(!st.pillow) { st.pillow=PR.cushion({w:.38,d:.3,h:.08,col:0x647c7c});const p=at(st.A.mohammed,'head',[0,.1,0]).setY(.26);S3.prop(st.pillow,p.x,p.y,p.z,st.A.mohammed.group.rotation.y); }
    st.A.mohammed.B.chest.rotation.x += .01 * Math.sin(t * 1.5);
    const { zoubida: zo, aicha: ai } = st.A, kz = zo.group.scale.y / 1.6, ka = ai.group.scale.y / 1.6;
    if (!st.gaze) st.gaze = st.G.apply;
    const cover = IN(2, t) || IN(4, t) || IN(7, t);
    st.G.apply = cover ? () => {} : st.gaze;
    const lap = (a, s, k) => PO.reach(a, s, PO.hipToWorld(a, (s === 'L' ? .14 : -.14) * k, .05 * k, .2 * k), { grip: .03, pole: s === 'L' ? [.3, .05, .1] : [-.3, .05, .1] });
    const reach = (a, side, target, o) => {
      const sh = at(a, 'upperArm' + side), len = sh.distanceTo(at(a, 'foreArm' + side)) + at(a, 'foreArm' + side).distanceTo(at(a, 'hand' + side));
      const d = target.clone().sub(sh); if (d.length() > len * .88) target = sh.clone().addScaledVector(d.normalize(), len * .88);
      return PO.reach(a, side, target, o);
    };
    if (IN(1, t)) {
      const n = Math.min(3, Math.floor(Math.max(0, t - B(1)[0]) / 1.1));
      const palm = front(zo, 'chest', .26 * kz, -.1 * kz, .04 * kz);
      PO.reach(zo, 'L', palm, { grip: 0, pole: [.34, .1, .14] });
      PO.fingers(zo, 'L', .02, { spread: .7 });
      PO.reach(zo, 'R', palm.clone().add(V(.08, .02 + .012 * n, .03)), { grip: 0, pole: [-.34, .12, .14] });
      PO.fingers(zo, 'R', .3, { spread: .2 });
    }
    if (IN(2, t)) {
      palmsOnFace(ai, 'cheek', { sides: ['R'], bow: .02 }); lap(ai, 'L', ka);
      const tap = Math.max(0, Math.sin((t - B(2)[0]) * 9)) * .22;   // three taps: the forearm pats the cheek
      ai.B.foreArmR.rotation.x += tap; ai.B.foreArmR.updateWorldMatrix(false, true);
    }
    if (IN(4, t)) { ai.B.chest.rotation.x += .02 * Math.sin(t * 7); palmsOnFace(ai, 'face', { bow: .12, hover: true }); }
    if (IN(5, t)) {
      // One offered hand, Aïcha's hands a palm-width apart around it. Not the same point twice.
      const offered = front(zo, 'chest', .32 * kz, .06 * kz, .06 * kz);
      reach(zo, 'L', offered, { grip: 0, pole: [.36, .1, .18] });
      PO.fingers(zo, 'L', .06, { spread: .25 });
      lap(zo, 'R', kz);
      reach(ai, 'R', offered.clone().add(V(.02, .08, .03)), { grip: .02, pole: [-.38, .12, .2] });
      reach(ai, 'L', offered.clone().add(V(-.06, -.02, .08)), { grip: .02, pole: [.32, .1, .18] });
    }
    if (IN(6, t)) {
      const offered = front(zo, 'chest', .32 * kz, .06 * kz, .06 * kz);
      reach(zo, 'L', offered, { grip: 0, pole: [.36, .1, .18] });
      lap(zo, 'R', kz);
      reach(ai, 'R', offered.clone().add(V(.02, .08, .03)), { grip: .02, pole: [-.38, .12, .2] });
      reach(ai, 'L', front(ai, 'head', .14 * ka, .16 * ka, .05 * ka), { grip: 0, pole: [.4, .14, .16] });
      ai.B.chest.rotation.x += .02 * Math.sin(t * 8);
    }
    if (IN(7, t)) palmsOnFace(zo, 'cheeks');
    if (IN(8, t)) {
      const u = sm(B(8)[0], B(8)[0] + 1.2, t);
      const apart = at(ai, 'root').clone().sub(at(zo, 'root')); apart.y = 0;
      const gap = apart.length();
      if (gap > .7 && gap < 4) {
        const pull = Math.min(.12, (gap - .68) / 2) * u, dir = apart.multiplyScalar(1 / gap);
        zo.group.position.addScaledVector(dir, pull); ai.group.position.addScaledVector(dir, -pull);
        zo.group.updateMatrixWorld(true); ai.group.updateMatrixWorld(true);
      }
      zo.B.chest.rotation.z += .1 * u; ai.B.chest.rotation.z -= .1 * u;
      zo.B.chest.updateWorldMatrix(false, true); ai.B.chest.updateWorldMatrix(false, true);
      const hug = (a, other, lift) => {
        const side = at(other, 'chest').x > at(a, 'chest').x ? 'R' : 'L';
        const shoulder = at(other, 'upperArm' + side).add(V(0, lift, .08));
        reach(a, side, shoulder, { grip: .02, pole: side === 'L' ? [.3, .16, .22] : [-.3, .16, .22] });
      };
      hug(zo, ai, .1); hug(ai, zo, -.02);
    }
    for (const a of [zo, ai]) a.B.chest.updateWorldMatrix(false, true);
  },
});

export default beatScene(ID, {
  shots: { ch },
  plan: {
    b143: { shot: 'ch', size: 'M', on: 'mohammed', z: 1.35, dx: -40, dy: -40 },
    b144: { shot: 'ch', size: 'M', on: 'zoubida', z: 1.25, dx: 20, dy: -95 },
    b145: { shot: 'ch', size: 'CU', on: 'aicha', z: 2.4, dx: 200, dy: -50 },
    b146: { shot: 'ch', size: 'CU', on: 'zoubida', z: 2.4, dx: -180, dy: -50 },
    b147: { shot: 'ch', size: 'CU', on: 'aicha', z: 2.5, dx: 220, dy: -55 },
    b148: { shot: 'ch', size: 'M', on: 'aicha', z: 1.35, dx: 40, dy: -70 },
    b149: { shot: 'ch', size: 'M', on: 'aicha', z: 1.35, dx: 40, dy: -70 },
    b150: { shot: 'ch', size: 'CU', on: 'zoubida', z: 2.4, dx: -180, dy: -50 },
    b151: { shot: 'ch', size: 'W', on: 'zoubida', dy: -20 },
  },
});
