// s20 Lalla Aïcha. chambre_jour: the boy in bed (lying, right, background), the two women kneeling face to face left of
// centre. b144 Zoubida counts the story on her fingers; b145 Aïcha taps her own cheek ×3; b147 face in her hands; b148
// takes Zoubida's hand; b149 bitter laugh in tears; b150 Zoubida's hands to her cheeks; b151 they lean into each other's
// arms (hands on the other's shoulders), the boy watches.
import * as PO from '../../../engine/poses.js';
import * as PR from '../../../engine/props3d.js';
import { staged, palmsOnFace } from '../lib/autostage.js';
import { faceLocal, armToward } from '../lib/fix8_R15E.js';
import { lieOnBed, pillowUnder, cradleFace } from '../lib/fix8_lie.js';
import * as IK from '../../../engine/ik.js';
import { beatScene, lines, sm, at, front, V } from '../lib/beatscene.js';

const ID = 's20_aicha', L = lines(ID), B = i => L[i] || [0, 0];
const IN = (i, t) => t >= B(i)[0] - .15 && t < (B(i + 1)[0] || B(i)[1] + .3);

// r25: palm on the cheek with the elbow DOWN and out (handOnFace raised it behind the head); `u` 0..1 = the tap.
function cheekTap(a, side, { pitch = 0, u = 0 } = {}) {
  const B = a.B, sg = side === 'L' ? 1 : -1;
  if (pitch) { B.neck.rotation.x += pitch * .5; B.head.rotation.x += pitch * .5; B.neck.updateWorldMatrix(false, true); }
  a.group.updateMatrixWorld(true);
  const loc = faceLocal(a, side, 'cheek'), skin = () => B.head.localToWorld(loc.clone().add(V(sg * .012 * (1 - u), 0, .006)));
  const pole = [sg * .55, -.7, .25];
  for (let i = 0; i < 3; i++) PO.reach(a, side, skin(), { grip: 0, pole });
  const c = B.head.localToWorld(V(0, loc.y, 0));
  IK.aim(B['hand' + side], PO.handPts(a, side).end, B.head.localToWorld(V(loc.x * .3, loc.y + .09, .02)));
  const into = c.clone().sub(PO.handPts(a, side).palm);
  if (into.lengthSq() > 1e-6) PO.palmTo(a, side, 1, into.normalize());
  PO.fingers(a, side, .03, { thumb: .03, spread: .4 });
}
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
    { const mo = st.A.mohammed; st.s0 ||= mo.group.scale.clone(); mo.group.scale.copy(st.s0).multiplyScalar(1.22);   // r25: doll-sized, faced away, legs in the mattress
      lieOnBed(mo, { top: .26, feet: [.5, .87], hands: 'belly', pillow: .08, tuck: .22, headTurn: -.12 }); pillowUnder(S3, st, mo, { top: .26, h: .08 });
      mo.B.chest.rotation.x += .01 * Math.sin(t * 1.5); mo.B.chest.updateWorldMatrix(false, true); }
    const { zoubida: zo, aicha: ai } = st.A, kz = zo.group.scale.y / 1.6, ka = ai.group.scale.y / 1.6;
    if (!st.gaze) st.gaze = st.G.apply;
    // the women shuffle toward each other: touching hands at b148, in each other's arms at b151
    const base = st.base ||= [zo, ai].map(a => a.group.position.clone());
    const yaw0 = st.yaw0 ||= [zo, ai].map(a => a.group.rotation.y);
    const turn = .18 * sm(B(5)[0] - .3, B(5)[0] + .6, t) + .3 * sm(B(8)[0] - .3, B(8)[0] + .9, t);
    zo.group.rotation.y = yaw0[0] + turn; ai.group.rotation.y = yaw0[1] - turn;
    const dir = base[1].clone().sub(base[0]).setY(0).normalize();
    const close = .1 * sm(B(5)[0] - .3, B(5)[0] + .6, t) + .13 * sm(B(8)[0] - .3, B(8)[0] + 1, t);
    const closeT = close * (1 - sm(B(8)[1] + .1, B(8)[1] + .4, t));
    zo.group.position.copy(base[0]).addScaledVector(dir, closeT); ai.group.position.copy(base[1]).addScaledVector(dir, -closeT);
    zo.group.updateMatrixWorld(true); ai.group.updateMatrixWorld(true);
    // default arms (never hanging stiff): hands resting in the lap with a slow breath; the beats below override them
    for (const [a, k, sd] of [[zo, kz, 0], [ai, ka, 2]]) for (const s of ['L', 'R']) lap(a, s, k * (1 + .06 * Math.sin(t * .8 + sd + (s === 'L' ? 0 : 1.5))));
    zo.B.chest.rotation.z += .018 * Math.sin(t * .7); ai.B.chest.rotation.z -= .018 * Math.sin(t * .6 + 1);
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
      const tip = PO.handPts(zo, 'L').end;   // the right index touches the left fingertips, one more finger each time
      PO.reach(zo, 'R', tip.clone().add(V(-.03 * kz, -.025 * n * kz, .03 * kz)), { grip: 0, pole: [-.4, -.1, .14] });
      PO.fingers(zo, 'R', .5, { spread: .1 });
    }
    if (IN(2, t)) {
      // three pats of the palm on the cheek: the whole hand taps, the head leans into it
      const tap = Math.max(0, Math.sin((t - B(2)[0]) * 9));
      PO.look(ai, at(zo, 'head'), .9, { max: .55 });   // she talks to Zoubida, on her left
      cheekTap(ai, 'L', { pitch: .03 + .03 * tap, u: tap }); lap(ai, 'R', ka);
    }
    if (IN(4, t)) { ai.B.chest.rotation.x += .02 * Math.sin(t * 7); cradleFace(ai, { mode: 'eyes', bow: .28, u: Math.sin(t * 7) }); }
    if (IN(5, t) || IN(6, t)) {
      // Zoubida holds one hand out between them; Aicha closes her palm over it (hand-to-hand contact at the midpoint)
      const zs = armToward(zo, ai), as = armToward(ai, zo), os = as === 'L' ? 'R' : 'L';
      const mid = at(zo, 'chest').lerp(at(ai, 'chest'), .5); mid.y -= .27 * kz; mid.z += .08 * kz;
      reach(zo, zs, mid, { grip: 0, pole: [(zs === 'L' ? 1 : -1) * .36, .1, .18] });
      PO.fingers(zo, zs, .06, { spread: .25 });
      lap(zo, zs === 'L' ? 'R' : 'L', kz);
      reach(ai, as, mid.clone().add(V(0, .05 * ka, 0)), { grip: .01, pole: [(as === 'L' ? 1 : -1) * .38, .12, .2] });
      PO.fingers(ai, as, .5, { thumb: .4 });
      if (IN(6, t)) {
        // bitter laugh in tears: the free hand wipes a cheek, comes back to cover Zoubida's hand, shoulders shake; both sway
        const w = Math.sin((t - B(6)[0]) * 1.3), wipe = sm(.15, .5, w);
        ai.B.chest.rotation.x += .025 * Math.sin(t * 8); ai.B.chest.rotation.z += .05 * Math.sin(t * 1.4); zo.B.chest.rotation.z -= .04 * Math.sin(t * 1.1 + 1); zo.B.head.rotation.x += .05 * Math.sin(t * .9);
        if (wipe > .02) cheekTap(ai, os, { pitch: .04, u: .5 + .5 * Math.sin(t * 9) });
        else reach(ai, os, mid.clone().add(V(0, -.02 * ka, .03 * ka)), { grip: .01, pole: [(os === 'L' ? 1 : -1) * .4, -.1, .2] });
      } else reach(ai, os, mid.clone().add(V(0, -.02 * ka, .03 * ka)), { grip: .01, pole: [(os === 'L' ? 1 : -1) * .4, -.1, .2] });
    }
    if (IN(7, t)) { PO.look(zo, at(ai, 'head'), .8, { max: .35 }); const sw = Math.sin(t * 1.6);
      zo.B.chest.rotation.z += .05 * sw; zo.B.chest.rotation.x += .03;
      cheekTap(zo, 'L', { pitch: .05 }); cheekTap(zo, 'R', { pitch: 0 }); }
    if (IN(8, t)) {
      const u = sm(B(8)[0], B(8)[0] + 1.2, t);
      zo.B.chest.rotation.z += .16 * u; ai.B.chest.rotation.z -= .16 * u;
      zo.B.chest.updateWorldMatrix(false, true); ai.B.chest.updateWorldMatrix(false, true);
      const hug = (a, other, lift, dz) => {
        const ka2 = a.group.scale.y / 1.6, side = armToward(a, other), oside = armToward(other, a) === 'L' ? 'R' : 'L';   // the arm goes round the back to her far shoulder
        const shoulder = at(other, 'upperArm' + oside).add(V(0, lift * ka2, dz * ka2));
        reach(a, side, shoulder, { grip: .02, pole: [(side === 'L' ? 1 : -1) * .3, .16, .22] });
        PO.fingers(a, side, .35);
        lap(a, side === 'L' ? 'R' : 'L', ka2);
      };
      hug(zo, ai, .06, -.07); hug(ai, zo, -.03, -.07);
      zo.B.head.rotation.z += .12 * u; ai.B.head.rotation.z -= .12 * u;
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
    b148: { shot: 'ch', size: 'M', on: 'aicha', z: 1.3, dx: -130, dy: 100 },
    b149: { shot: 'ch', size: 'M', on: 'aicha', z: 1.3, dx: -130, dy: 100 },
    b150: { shot: 'ch', size: 'CU', on: 'zoubida', z: 2.0, dx: 0, dy: -30 },
    b151: { shot: 'ch', size: 'M', on: 'zoubida', z: 1.4, dx: 150, dy: 100 },
  },
});
