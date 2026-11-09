// s20 Lalla Aïcha. chambre_jour: the boy in bed (lying, right, background), the two women kneeling face to face left of
// centre. b144 Zoubida counts the story on her fingers; b145 Aïcha taps her own cheek ×3; b147 face in her hands; b148
// takes Zoubida's hand; b149 bitter laugh in tears; b150 Zoubida's hands to her cheeks; b151 they lean into each other's
// arms (hands on the other's shoulders), the boy watches.
import * as PO from '../../../engine/poses.js';
import * as PR from '../../../engine/props3d.js';
import { staged } from '../lib/autostage.js';
import { beatScene, lines, sm, at, front, V } from '../lib/beatscene.js';

const ID = 's20_aicha', L = lines(ID), B = i => L[i] || [0, 0];
const IN = (i, t) => t >= B(i)[0] - .15 && t < (B(i + 1)[0] || B(i)[1] + .3);

const ch = staged('chambre_jour', {
  zoubida: { at: [770, 970], face: 'cam', yaw: .5, pose: 'kneel', o: { grounded: true, lean: .1 }, seed: 7 },
  aicha: { at: [1130, 970], face: 'cam', yaw: -.5, pose: 'kneel', o: { grounded: true, lean: .1 }, seed: 9 },
  mohammed: { at: [1468, 800], face: [1560, 930], pose: 'lie', o: { top: .26, turn: .12, hands: 'belly', headTurn: -.16 }, seed: 3, talk: 0 },
}, {
  addressee: { zoubida: 'aicha', aicha: 'zoubida', narrator: 'zoubida' },
  act(lt, t, S, st, S3) {
    if(!st.pillow) { st.pillow=PR.cushion({w:.38,d:.3,h:.08,col:0x647c7c});const p=at(st.A.mohammed,'head',[0,.1,0]).setY(.26);S3.prop(st.pillow,p.x,p.y,p.z,st.A.mohammed.group.rotation.y); }
    const { zoubida: zo, aicha: ai } = st.A, kz = zo.group.scale.y / 1.6, ka = ai.group.scale.y / 1.6;
    if (IN(1, t)) { const n = Math.floor((t - B(1)[0]) / 1.1) % 4; PO.reach(zo, 'R', front(zo, 'chest', .3 * kz, .02 * kz, (-.05 + .02 * n) * kz), { grip: .02 }); PO.reach(zo, 'L', front(zo, 'chest', .3 * kz, -.04 * kz, -.06 * kz), { grip: 0 }); }
    if (IN(2, t)) { const tap = Math.max(0, Math.sin((t - B(2)[0]) * 6)) * (t - B(2)[0] < 3.2 ? 1 : 0); PO.reach(ai, 'R', front(ai, 'head', (.16 + .02 * tap) * ka, .12 * ka, -.02 * ka), { grip: .02, pole: [-.42, .18, .28] }); }
    if (IN(4, t)) { for (const s of ['L', 'R']) PO.reach(ai, s, front(ai, 'head', .18 * ka, (s === 'L' ? -.14 : .14) * ka, .01 * ka), { grip: .03 }); ai.B.neck.rotation.x += .3; }
    if (IN(5, t) || IN(6, t)) { const mid = at(zo, 'chest').lerp(at(ai, 'chest'), .5).add(V(0, -.1, .05)); PO.reach(ai, 'R', mid.clone().add(V(.02, .03, 0)), { grip: .02, pole: [-.4, .12, .25] }); PO.reach(zo, 'L', mid.clone().add(V(-.02, -.01, .02)), { grip: .02, pole: [.4, .12, .25] }); }
    if (IN(7, t)) for (const s of ['L', 'R']) PO.reach(zo, s, front(zo, 'head', .17 * kz, (s === 'L' ? -.14 : .14) * kz, .01 * kz), { grip: 0 });
    if (IN(8, t)) {
      const u = sm(B(8)[0], B(8)[0] + 1.2, t);
      zo.group.position.x += .12 * u; ai.group.position.x -= .12 * u; zo.group.updateMatrixWorld(true); ai.group.updateMatrixWorld(true);
      zo.B.chest.rotation.x += .05 * u; ai.B.chest.rotation.x += .05 * u; zo.B.chest.updateWorldMatrix(false, true); ai.B.chest.updateWorldMatrix(false, true);
      const near = (from, other) => ['L', 'R'].sort((a, b) => at(other, 'upperArm' + a).distanceTo(at(from, 'chest')) - at(other, 'upperArm' + b).distanceTo(at(from, 'chest')))[0];
      const hug = (a, other, k) => {
        const side = at(other, 'chest').x > at(a, 'chest').x ? 'L' : 'R';
        const sh = at(a, 'upperArm' + side), len = sh.distanceTo(at(a, 'foreArm' + side)) + at(a, 'foreArm' + side).distanceTo(at(a, 'hand' + side));
        let target = at(other, 'upperArm' + near(a, other)).add(V(0, .03, .06));
        const d = target.clone().sub(sh); if (d.length() > len * .9) target = sh.clone().addScaledVector(d.normalize(), len * .9);
        const home = front(a, 'chest', .2 * k, (side === 'L' ? -.14 : .14) * k, -.02 * k);
        PO.reach(a, side, target.lerp(home, 1 - u), { grip: .02, pole: side === 'L' ? [.4, .1, .3] : [-.4, .1, .3] });
      };
      hug(zo, ai, kz); hug(ai, zo, ka);
      st.actcheck = { contacts: [{ actors: ['zoubida', 'aicha'], parts: ['foreArmR:foreArmL', 'foreArmL:foreArmR', 'foreArmR:upperArmL', 'foreArmL:upperArmR', 'handR:upperArmL', 'handL:upperArmR', 'handR:foreArmL', 'handL:foreArmR', 'torso:foreArmR', 'torso:foreArmL', 'torso:handR', 'torso:handL'] }] };
    }
    for (const a of [zo, ai]) a.B.chest.updateWorldMatrix(false, true);
  },
});

export default beatScene(ID, {
  shots: { ch },
  plan: {
    b143: { shot: 'ch', size: 'M', on: 'mohammed', z: 1.35, dx: -260, dy: 20 },
    b144: { shot: 'ch', size: 'M', on: 'zoubida', z: 1.6, dx: 100, dy: -10 },
    b145: { shot: 'ch', size: 'CU', on: 'aicha', z: 2.3, dy: -30 },
    b146: { shot: 'ch', size: 'CU', on: 'zoubida', z: 2.3, dy: -30 },
    b147: { shot: 'ch', size: 'CU', on: 'aicha', z: 2.3, dy: -30 },
    b148: { shot: 'ch', size: 'CU', on: 'aicha', z: 2.3, dy: -30 },
    b149: { shot: 'ch', size: 'CU', on: 'aicha', z: 2.3, dy: -30 },
    b150: { shot: 'ch', size: 'CU', on: 'zoubida', z: 2.3, dy: -30 },
    b151: { shot: 'ch', size: 'W', on: 'zoubida' },
  },
});
