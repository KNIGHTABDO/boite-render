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
  // On the carpet between the divans, close enough that an embrace is an arm's length, not a lunge across the room.
  zoubida: { at: [860, 860], face: 'aicha', yaw: .15, pose: 'kneel', o: { grounded: true, lean: .08, avoid: CHEST }, seed: 7 },
  aicha: { at: [1080, 860], face: 'zoubida', yaw: -.15, pose: 'kneel', o: { grounded: true, lean: .08, avoid: CHEST }, seed: 9 },
  mohammed: { at: [1350, 694], face: [1336, 754], pose: 'lie', o: { top: .26, turn: .12, hands: 'belly', headTurn: -.16, mattress: MATTRESS, avoid: CHEST }, seed: 3, talk: 0 },
}, {
  addressee: { zoubida: 'aicha', aicha: 'zoubida', narrator: 'zoubida' },
  act(lt, t, S, st, S3) {
    if(!st.pillow) { st.pillow=PR.cushion({w:.38,d:.3,h:.08,col:0x647c7c});const p=at(st.A.mohammed,'head',[0,.1,0]).setY(.26);S3.prop(st.pillow,p.x,p.y,p.z,st.A.mohammed.group.rotation.y); }
    const { zoubida: zo, aicha: ai } = st.A, kz = zo.group.scale.y / 1.6, ka = ai.group.scale.y / 1.6;
    const lap = (a, s, k) => PO.reach(a, s, PO.hipToWorld(a, (s === 'L' ? .14 : -.14) * k, .05 * k, .2 * k), { grip: .03, pole: s === 'L' ? [.3, .05, .1] : [-.3, .05, .1] });
    if (IN(1, t)) {
      const n = Math.min(3, Math.floor(Math.max(0, t - B(1)[0]) / 1.1));
      const palm = front(zo, 'chest', .26 * kz, -.04 * kz, .02 * kz);
      PO.reach(zo, 'L', palm, { grip: 0, pole: [.32, .08, .12] });
      PO.fingers(zo, 'L', .02, { spread: .7 });
      PO.reach(zo, 'R', palm.clone().add(V(.045, .015 + .01 * n, .02)), { grip: 0, pole: [-.32, .1, .12] });
      PO.fingers(zo, 'R', .35, { spread: .15 });
    }
    if (IN(2, t)) { palmsOnFace(ai, 'cheek', { sides: ['R'], bow: .02 }); lap(ai, 'L', ka); }
    if (IN(4, t)) { ai.B.chest.rotation.x += .02 * Math.sin(t * 7); palmsOnFace(ai, 'face', { bow: .48 }); }
    if (IN(5, t)) {
      // Aïcha's two hands close around Zoubida's offered hand, a few centimetres apart so the meshes don't fuse.
      const offered = front(zo, 'chest', .3 * kz, .02 * kz, .04 * kz);
      PO.reach(zo, 'L', offered, { grip: 0, pole: [.34, .08, .16] });
      PO.fingers(zo, 'L', .08, { spread: .2 });
      lap(zo, 'R', kz);
      PO.reach(ai, 'R', offered.clone().add(V(.0, .035, .02)), { grip: .02, pole: [-.34, .1, .18] });
      PO.reach(ai, 'L', offered.clone().add(V(-.02, -.02, .045)), { grip: .02, pole: [.28, .08, .16] });
    }
    if (IN(6, t)) {
      const offered = front(zo, 'chest', .3 * kz, .02 * kz, .04 * kz);
      PO.reach(zo, 'L', offered, { grip: 0, pole: [.34, .08, .16] });
      lap(zo, 'R', kz);
      PO.reach(ai, 'R', offered.clone().add(V(0, .04, .02)), { grip: .02, pole: [-.34, .1, .18] });
      palmsOnFace(ai, 'cheek', { sides: ['L'], bow: -.12 });   // head tips back; the free hand comes up to the cheek
    }
    if (IN(7, t)) palmsOnFace(zo, 'cheeks');
    if (IN(8, t)) {
      const u = sm(B(8)[0], B(8)[0] + 1.2, t);
      const apart = at(ai, 'root').sub(at(zo, 'root')); apart.y = 0;
      const gap = apart.length();
      if (gap > .48 && gap < 4) {
        const pull = Math.min(.16, (gap - .46) / 2) * u, dir = apart.multiplyScalar(1 / gap);
        zo.group.position.addScaledVector(dir, pull); ai.group.position.addScaledVector(dir, -pull);
        zo.group.updateMatrixWorld(true); ai.group.updateMatrixWorld(true);
      }
      zo.B.chest.rotation.x += .08 * u; ai.B.chest.rotation.x += .08 * u;
      zo.B.chest.rotation.z += .12 * u; ai.B.chest.rotation.z -= .12 * u;
      zo.B.chest.updateWorldMatrix(false, true); ai.B.chest.updateWorldMatrix(false, true);
      const hug = (a, other, k) => {
        const side = at(other, 'chest').x > at(a, 'chest').x ? 'L' : 'R';
        const shoulder = at(other, 'upperArm' + (side === 'L' ? 'R' : 'L')).add(V(0, .04 * k, .05 * k));
        PO.reach(a, side, shoulder, { grip: .02, pole: side === 'L' ? [.32, .08, .22] : [-.32, .08, .22] });
        const otherSide = side === 'L' ? 'R' : 'L';
        PO.reach(a, otherSide, at(other, 'upperArm' + side).add(V(0, .02 * k, .06 * k)), { grip: .02, pole: otherSide === 'L' ? [.28, .06, .18] : [-.28, .06, .18] });
      };
      hug(zo, ai, kz); hug(ai, zo, ka);
      st.actcheck = { contacts: [{ actors: ['zoubida', 'aicha'], parts: ['foreArmR:foreArmL', 'foreArmL:foreArmR', 'foreArmR:upperArmL', 'foreArmL:upperArmR', 'handR:upperArmL', 'handL:upperArmR', 'handR:foreArmL', 'handL:foreArmR', 'handR:upperArmR', 'handL:upperArmL', 'torso:foreArmR', 'torso:foreArmL', 'torso:handR', 'torso:handL', 'foreArmL:upperArmL', 'foreArmR:upperArmR'] }] };
    }
    for (const a of [zo, ai]) a.B.chest.updateWorldMatrix(false, true);
  },
});

export default beatScene(ID, {
  shots: { ch },
  plan: {
    b143: { shot: 'ch', size: 'M', on: 'mohammed', z: 1.35, dx: -40, dy: -40 },
    b144: { shot: 'ch', size: 'M', on: 'zoubida', z: 1.55, dx: 40, dy: -55 },
    b145: { shot: 'ch', size: 'CU', on: 'aicha', z: 2.5, dx: 90, dy: -45 },
    b146: { shot: 'ch', size: 'CU', on: 'zoubida', z: 2.5, dx: -70, dy: -45 },
    b147: { shot: 'ch', size: 'CU', on: 'aicha', z: 2.6, dx: 110, dy: -50 },
    b148: { shot: 'ch', size: 'CU', on: 'aicha', z: 2.15, dx: 20, dy: -40 },
    b149: { shot: 'ch', size: 'CU', on: 'aicha', z: 2.15, dx: 20, dy: -40 },
    b150: { shot: 'ch', size: 'CU', on: 'zoubida', z: 2.5, dx: -60, dy: -45 },
    b151: { shot: 'ch', size: 'W', on: 'zoubida', dy: -20 },
  },
});
