// s20 Lalla Aïcha. chambre_jour: the boy in bed (lying, right, background), the two women kneeling face to face left of
// centre. b144 Zoubida counts the story on her fingers; b145 Aïcha taps her own cheek ×3; b147 face in her hands; b148
// takes Zoubida's hand; b149 bitter laugh in tears; b150 Zoubida's hands to her cheeks; b151 they lean into each other's
// arms (hands on the other's shoulders), the boy watches.
import * as PO from '../../../engine/poses.js';
import * as PR from '../../../engine/props3d.js';
import { staged, palmsOnFace } from '../lib/autostage.js';
import { handOnFace, armToward } from '../lib/fix8_R15E.js';
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
    // the women shuffle toward each other: touching hands at b148, in each other's arms at b151
    const base = st.base ||= [zo, ai].map(a => a.group.position.clone());
    const dir = base[1].clone().sub(base[0]).setY(0).normalize();
    const close = .1 * sm(B(5)[0] - .3, B(5)[0] + .6, t) + .09 * sm(B(8)[0] - .3, B(8)[0] + 1, t);
    const closeT = close * (1 - sm(B(8)[1] + .1, B(8)[1] + .4, t));
    zo.group.position.copy(base[0]).addScaledVector(dir, closeT); ai.group.position.copy(base[1]).addScaledVector(dir, -closeT);
    zo.group.updateMatrixWorld(true); ai.group.updateMatrixWorld(true);
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
      // three pats of the palm on the cheek: the whole hand taps, the head leans into it
      const tap = Math.max(0, Math.sin((t - B(2)[0]) * 9));
      handOnFace(ai, 'R', 'cheek', { pitch: .03 + .03 * tap }); lap(ai, 'L', ka);
    }
    if (IN(4, t)) { ai.B.chest.rotation.x += .02 * Math.sin(t * 7); palmsOnFace(ai, 'face', { bow: .12, hover: true }); }
    if (IN(5, t) || IN(6, t)) {
      // Zoubida holds one hand out between them; Aicha closes her palm over it (hand-to-hand contact at the midpoint)
      const zs = armToward(zo, ai), as = armToward(ai, zo), os = as === 'L' ? 'R' : 'L';
      const mid = at(zo, 'chest').lerp(at(ai, 'chest'), .5); mid.y -= .08 * kz; mid.z += .08 * kz;
      reach(zo, zs, mid, { grip: 0, pole: [(zs === 'L' ? 1 : -1) * .36, .1, .18] });
      PO.fingers(zo, zs, .06, { spread: .25 });
      lap(zo, zs === 'L' ? 'R' : 'L', kz);
      reach(ai, as, mid.clone().add(V(0, .075 * ka, 0)), { grip: .01, pole: [(as === 'L' ? 1 : -1) * .38, .12, .2] });
      PO.fingers(ai, as, .5, { thumb: .4 });
      if (IN(6, t)) { reach(ai, os, front(ai, 'head', .14 * ka, (os === 'L' ? -1 : 1) * .16 * ka, .05 * ka), { grip: 0, pole: [(os === 'L' ? 1 : -1) * .4, .14, .16] }); ai.B.chest.rotation.x += .02 * Math.sin(t * 8); }
      else lap(ai, os, ka);
    }
    if (IN(7, t)) { PO.look(zo, at(ai, 'head'), .8, { max: .35 }); palmsOnFace(zo, 'cheeks'); }
    if (IN(8, t)) {
      const u = sm(B(8)[0], B(8)[0] + 1.2, t);
      zo.B.chest.rotation.z += .16 * u; ai.B.chest.rotation.z -= .16 * u;
      zo.B.chest.updateWorldMatrix(false, true); ai.B.chest.updateWorldMatrix(false, true);
      const hug = (a, other, lift, dz) => {
        const ka2 = a.group.scale.y / 1.6, side = armToward(a, other), oside = armToward(other, a);
        const shoulder = at(other, 'upperArm' + oside).add(V(0, lift * ka2, dz * ka2));
        reach(a, side, shoulder, { grip: .02, pole: [(side === 'L' ? 1 : -1) * .3, .16, .22] });
        PO.fingers(a, side, .35);
        lap(a, side === 'L' ? 'R' : 'L', ka2);
      };
      hug(zo, ai, .08, .08); hug(ai, zo, -.04, -.05);
    }
    for (const a of [zo, ai]) a.B.chest.updateWorldMatrix(false, true);
    if (globalThis.process?.env?.DBG8&&t>38&&t<38.5) console.log('ELB',['foreArmR','upperArmR','handR','chest','root','neck'].map(n=>n+JSON.stringify(at(ai,n).toArray().map(v=>+v.toFixed(2)))).join(' '));
    if (globalThis.process?.env?.DBG8) { const d=(x,y)=>+x.distanceTo(y).toFixed(2), P=(a,s)=>PO.handPts(a,s).palm, zs=armToward(zo,ai), as=armToward(ai,zo); console.log('DBG',t.toFixed(1),'aiRpalm-headbone',d(P(ai,'R'),at(ai,'head')),'aiL',d(P(ai,'L'),at(ai,'head')),'zoArm-aiArm',d(P(zo,zs),P(ai,as)),'zoPalm-aiShoulder',d(P(zo,zs),at(ai,'upperArm'+armToward(ai,zo))),'aiPalm-zoSh',d(P(ai,as),at(zo,'upperArm'+armToward(zo,ai))),'roots',d(at(zo,'root'),at(ai,'root')),'zoPalmHead',d(P(zo,'L'),at(zo,'head')),d(P(zo,'R'),at(zo,'head'))); }
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
