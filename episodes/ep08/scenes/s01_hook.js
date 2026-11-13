// s01 hook. b001 noon patio (patio_matin): the father's open hand holds the bracelets out to Zoubida; her eyes go from his
// hand to his face, a small laugh. b002 same evening, chambre_nuit: Zoubida kneels on the floor weeping, face in her hands,
// shoulders shaking; behind her Mohammed lies on the divan, awake, only blinking.
import * as PO from '../../../engine/poses.js';
import { aim } from '../../../engine/ik.js';
import * as PR from '../../../engine/props3d.js';
const toon = PR.toon;
import { staged, THREE } from '../lib/autostage.js';
import { beatScene, lines, sm, front, at, V } from '../lib/beatscene.js';
import { still, loadStill } from '../lib/stage.js';
function bangles2(S3) {   // R25A: bigger, thicker gold + silver bangles (world-placed children)
  const g = new THREE.Group(), mk = (col, R, r) => { const m = new THREE.Mesh(new THREE.TorusGeometry(R, r, 10, 48), toon(col)); m.material.emissive?.setHex(col); if (m.material.emissiveIntensity != null) m.material.emissiveIntensity = .15; g.add(m); };
  mk(0xe0a820, .024, .0035); mk(0xc9d3de, .022, .003); S3.scene.add(g); return g;   // R31H: thin small bangles seated in the palm
}
import { faceCam } from '../lib/fix8c.js';
import { lieOnBed, pillowUnder, palmsOverEyes } from '../lib/fix8_lie.js';

// G1: both palms flat in front of the face (fingers over the eyes), wrists clear of the cheeks; palmsOnFace put them on the ears/jaw
function palmsCover(a) {
  const B = a.B;
  B.chest.rotation.x += .06; B.neck.rotation.x += .26; a.group.updateMatrixWorld(true);
  for (const s of ['L', 'R']) {
    const sign = s === 'L' ? 1 : -1, spot = () => B.head.localToWorld(new THREE.Vector3(sign * (s === 'L' ? .03 : .05), s === "L" ? .08 : .07, .16));
    const pole = [sign * .95, -.1, .15];   // r16: elbows down and in (not flared out beside the cheeks)
    for (let i = 0; i < 3; i++) {
      PO.reach(a, s, spot(), { grip: 0, pole });
      aim(B['hand' + s], PO.handPts(a, s).end, B.head.localToWorld(new THREE.Vector3(sign * .01, .09, .1)));
    }
    PO.fingers(a, s, .02, { thumb: .02, spread: .1 });
  }
}
const ID = 's01_hook', L = lines(ID), B = i => L[i] || [0, 0];
const INS = [1.9, 7.6];   // R25A: bracelet insert window (scene seconds)

const pa = staged('patio_matin', {
  father: { height: 1.76, at: [700, 985], face: 'zoubida', seed: 5, 
    // r19: head pitch kicks the neck-weighted hood rim backwards into a spike; aim half way between his own eye line and her head
    look: (t, st) => { const f = st.A.father.B.head.getWorldPosition(V(0, 0, 0)), z = st.A.zoubida.B.head.getWorldPosition(V(0, 0, 0)); return z.setY(f.y * .6 + z.y * .4); }, lookMax: .85 },   // Argon r6: his level gaze passed over her scarf → head pitched down to her face
  zoubida: { at: [850, 975], face: 'father', seed: 7,
    look: (t, st) => t < B(0)[0] + .45 * (B(0)[1] - B(0)[0]) ? st.offer : 'father' },
}, {
  // R25A: insert close-up on the father's upturned palm with the two bangles (his hand sits near plate (690, 674); her hands enter the frame below)
  view: (lt, u, t) => {
    if (t < INS[0] || t >= INS[1] || !pa.hp) return null;
    const e = sm(INS[0], INS[1], t);
    return [pa.hp[0], pa.hp[1] - 30 + 4 * e, 7.4 + .4 * e];   // tight: the characters are small in the plate, so the palm needs a high zoom
  },
  act(lt, t, S, st, S3) {
    const fa = st.A.father, zo = st.A.zoubida, k = fa.group.scale.y / 1.6;
    const u = 1;   // Argon r6: the hand was empty at the open → he already holds the bracelets out, waist height, elbow bent and down, palm up
    const p = front(fa, 'chest', .42 * k, .2 * k, -.2 * k).add(V(0, .015 * k * Math.sin(t * 1.1), 0)).lerp(front(fa, 'root', .15 * k, .2 * k, 0), 1 - u);
    PO.reach(fa, 'R', p, { grip: 0, pole: [-.95, -.25, -.1] }); st.offer = p.clone().add(V(0, .03, 0));
    fa.B.foreArmR.rotation.y -= 1.2 * u; fa.B.foreArmR.updateWorldMatrix(false, true);   // supinate: the palm turns to the sky
    PO.fingers(fa, 'R', 0, { thumb: 0, spread: .15 });   // Argon r6: bracelets clipped the curled thumb/fingers → flat open palm
    // r17: the father is alive: weight shift, a slight torso turn toward the lens, head nods, far arm gesturing/resting at his belt
    {
      const w = Math.sin(t * .9), n = Math.sin(t * 1.6 + 1);
      fa.B.chest.rotation.y += .3 + .05 * w; fa.B.chest.rotation.z += .025 * w; fa.B.spine.rotation.z -= .02 * w;
      fa.B.head.rotation.x += .03 * n; fa.B.head.rotation.z += .03 * w; fa.B.chest.updateWorldMatrix(false, true);
      PO.reach(fa, 'L', front(fa, 'chest', .24 * k, -.25 * k, -.16 * k + .02 * k * Math.sin(t * 1.3)), { grip: .25, pole: [.55, -1, .3] });
      // R23D: life motion over the beat: lean + head tilt toward Zoubida, the hand drifts forward as she laughs
      const ramp = sm(B(0)[0], B(0)[1], t), lg = sm(B(0)[0] + .55 * (B(0)[1] - B(0)[0]), B(0)[1], t);
      fa.B.chest.rotation.x += .07 * ramp; fa.B.chest.rotation.y += .06 * ramp; fa.B.head.rotation.z += .10 * ramp; fa.B.head.rotation.x += .03 * lg; fa.B.chest.updateWorldMatrix(false, true);
      const p2 = p.clone().add(front(fa, 'chest', .05 * k * ramp + .035 * k * lg, 0, 0).sub(front(fa, 'chest', 0, 0, 0)));
      p2.y += .03 * k * sm(INS[0], INS[1] - 1, t);   // R25A: the hand rises slightly as he offers
      PO.reach(fa, 'R', p2, { grip: 0, pole: [-.95, -.25, -.1] });
      // R23D: true supination: turn the forearm about its own axis until the palm normal points up (sign-checked), palm open
      const Bn = fa.B, W = n => Bn[n].getWorldPosition(V(0, 0, 0));
      const palmN = () => { fa.group.updateMatrixWorld(true); const hp = W('RightHand'), al = W('RightHandIndex1').sub(hp).normalize(), tt = W('RightHandThumb1').sub(hp); tt.addScaledVector(al, -tt.dot(al)); return V(0, 0, 0).crossVectors(tt, al).normalize(); };
      if (Bn.RightHand && Bn.RightHandIndex1) for (let i = 0; i < 6; i++) {
        const ax = W('RightHand').sub(Bn.foreArmR.getWorldPosition(V(0, 0, 0))).normalize(), n = palmN();
        const a1 = n.clone().addScaledVector(ax, -n.dot(ax)).normalize(), up = (u0 => u0.addScaledVector(ax, -u0.dot(ax)).normalize())(V(0, 1, 0).addScaledVector(fa.camDir ||= S3.cam.position.clone().sub(fa.group.position).setY(0).normalize(), .45));
        const ang = Math.atan2(V(0, 0, 0).crossVectors(a1, up).dot(ax), a1.dot(up)), b = Bn.foreArmR, q0 = b.quaternion.clone();
        const turn = g => { const pq = new THREE.Quaternion(), bq = new THREE.Quaternion(); b.getWorldQuaternion(bq); b.parent.getWorldQuaternion(pq); b.quaternion.copy(pq.invert().multiply(new THREE.Quaternion().setFromAxisAngle(ax, g).multiply(bq))); b.updateWorldMatrix(false, true); };
        const before = n.y; turn(ang); if (palmN().y < before) { b.quaternion.copy(q0); turn(-ang); }
      }
      PO.fingers(fa, 'R', 0, { thumb: 0, spread: .2 });   // R25A r26: open flat palm, fingers extended, slight cup
      st.offer = p2.clone().add(V(0, .03, 0)); if (Bn.RightHandIndex1) st.palmN = palmN();
    }
    {   // r18: bangles are placed LAST (after every reach/torso move) from the hand's palm point, so they ride the hand; gate checks contact
      const br = st.br ||= bangles2(S3);
      fa.group.updateMatrixWorld(true); br.visible = true;
      const pp = PO.handPts(fa, 'R'), pal = pp.palm.clone(), arm = pp.palm.clone().sub(fa.B.foreArmR.getWorldPosition(V(0, 0, 0))).setY(0).normalize();
      const dc = S3.cam.position.clone().sub(pal).setY(0).normalize();
      // gold flat on the palm toward the wrist, silver beside it toward the fingertips; both leaning a little toward the lens so the rings read
      const place = (m, along, lift, tilt, roll) => {
        m.position.copy(arm).multiplyScalar(along).add(V(0, lift, 0));
        const n = V(0, 1, 0).multiplyScalar(Math.cos(tilt)).addScaledVector(dc, Math.sin(tilt)).normalize();
        m.quaternion.setFromUnitVectors(V(0, 0, 1), n); m.rotateZ(roll); m.updateMatrixWorld(true); };
      const w = .08 * Math.sin(t * 1.3);
      place(br.children[0], -.004 * k, .016 * k, .12 + .02 * w, w);
      place(br.children[1], .012 * k, .022 * k, .16 - .02 * w, -w);   // R31H: both on the palm centre, stacked, clear of cuff and fingertips
      br.position.copy(pal); br.quaternion.identity(); br.scale.setScalar(1); br.updateMatrixWorld(true);
      st.actcheck = { insert: t >= INS[0] && t < INS[1], held: { actor: 'father', side: 'R', prop: br, max: .08, required: true } };
    }
    const laugh = sm(B(0)[0] + .55 * (B(0)[1] - B(0)[0]), B(0)[1], t);
    if (laugh > 0) { zo.B.chest.rotation.x += .07 * Math.sin(t * 14) * laugh; zo.B.neck.rotation.x -= .12 * laugh; zo.B.chest.updateWorldMatrix(false, true); }
    // Argon r5: she stood in a stiff A-pose → her hands meet in front of her waist, then rise to her breastbone as she laughs
    const kz = zo.group.scale.y / 1.6, see = sm(B(0)[0] + .2 * (B(0)[1] - B(0)[0]), B(0)[0] + .45 * (B(0)[1] - B(0)[0]), t);
    zo.B.chest.rotation.z += .02 * Math.sin(t * 1.1); zo.B.head.rotation.z += .05 * (.4 + laugh); zo.B.head.rotation.y += .06 * Math.sin(t * .8); zo.B.chest.updateWorldMatrix(false, true);
    {   // R28: relaxed arms: the left hand rests low at her belly, the right reaches gently toward the rings (soft wrists, small drift)
      const reachU = sm(.3, 3.2, t) * (1 - .3 * laugh), dr = (ph) => Math.sin(t * 1.2 + ph);
      PO.reach(zo, 'L', front(zo, 'root', (.2 + .02 * dr(0)) * kz, -.12 * kz, (.02 + .02 * dr(1)) * kz), { grip: .3, pole: [.5, -1, -.3] });
      const base = front(zo, 'root', .26 * kz, .1 * kz, .05 * kz).lerp(front(zo, 'neck', .22 * kz, .07 * kz, -.2 * kz), .3 * see + .1 * laugh);
      const tgt = base.lerp(st.offer.clone().add(V(0, .15 * kz, 0)), .42 * reachU);   // R31H: stop ~3-4 cm short of his palm, above the rings
      tgt.add(V(0, .012 * kz * dr(2), 0));
      PO.reach(zo, 'R', tgt, { grip: .1, pole: [-.5, -1, .3] });
      PO.fingers(zo, 'L', .32, { thumb: .25, spread: .14 }); PO.fingers(zo, 'R', .3 + .08 * reachU, { thumb: .2, spread: .14 });
      const fz = st.faces.find(x => x[0] === zo); if (fz) fz[3] = { smile: .55 + .3 * reachU };   // warm expression
    }
  },
});

{   // R25A: the hand's plate point, projected ONCE at load with the stage's default view (project() depends on the current camera, so never per frame)
  const ld = pa.load;
  pa.load = async () => { const had = !!pa.st; await ld(); if (had || pa.hp) return;
    // hand ~ .55 m in front of and .5 m below the father's head, in plate px from the load-time head projection and body span
    const h = pa.heads[0], pxm = pa.bodyPx[0] / (.83 * pa.st.A.father.group.scale.y);
    pa.hp = [h[0] + .55 * pxm, h[1] + .5 * pxm - 53];   /* -53: calibrated on run 43392907960 */ if (!pa.hp.every(Number.isFinite)) pa.hp = null; };
}

// Right divan top, clockwise from the back-left corner. The chest beside it is off limits.
const MATTRESS = [[1055, 588], [1412, 588], [1420, 772], [1148, 748]];
const CHEST = [[1418, 585], [1830, 585], [1830, 890], [1418, 890]];
// b002: floor kneel, head bowed into her hands. Mohammed lies along the right divan, skull on the back cushions.
const nu = staged('chambre_nuit', {
  zoubida: { at: [820, 880], face: 'cam', yaw: 1.15, pose: 'kneel', o: { grounded: true, lean: .3, hip: .26, spread: .09, hands: false },
    seed: 7, hands: false, talk: 0, lids: .95 },
  mohammed: { at: [1301, 764], face: [1384, 841], pose: 'lie', o: { top: .35, turn: .12, headTurn: -.22, hands: 'belly', pillow: .1, mattress: MATTRESS, avoid: CHEST }, seed: 3, talk: 0 },
}, {
  act(lt, t, S, st, S3) {
    const { zoubida: zo, mohammed: mo } = st.A;
    faceCam(zo, S3.cam, .6);   // r18: 3/4 front toward the lens, face and hands readable
    st.G.apply = () => {};   // contact hands and the boy's pillow turn must survive the automatic gaze pass
    lieOnBed(mo, { top: .35, feet: [.5, .87], hands: 'chest', pillow: .08, tuck: .06, headTurn: -.5 });   // r15: flat on the cloth at cast scale
    {   // r16: a low cushion under the back of the skull (further behind the head so the chin never meets it)
      st.pillow2 ||= PR.cushion({ w: .4, d: .3, h: .07, col: 0x586b8c });
      const q = mo.B.head.localToWorld(new THREE.Vector3(0, .0, -.09));
      S3.prop(st.pillow2, q.x, .35 + .035 - .004, q.z, mo.group.rotation.y); st.pillow2.visible = true; }
    mo.B.head.scale.setScalar(.95); mo.B.head.updateWorldMatrix(false, true);   // r17: child head proportion
    for (const [sd, sg] of [['L', 1], ['R', -1]]) { mo.B['upperArm' + sd]?.rotation && (mo.B['upperArm' + sd].rotation.z += sg * .12); }
    mo.group.updateMatrixWorld(true);
    {   // r19: a blanket over his legs hides the tan blob and the stubby legs; smaller head reads as a sleeping child
      st.cover ||= PR.blanket({ w: .36, l: .5, h: .06, col: 0x9a4a38 });
      const hp = mo.B.root.getWorldPosition(V(0, 0, 0)), ry = mo.group.rotation.y, fx = Math.sin(ry), fz = Math.cos(ry);
      S3.prop(st.cover, hp.x + fx * .27, .35 + .03 - .004, hp.z + fz * .27, ry); st.cover.visible = true; }
    const sob = .02 * Math.max(0, Math.sin(t * 9)) * (Math.sin(t * 1.3) > -.3 ? 1 : 0);
    zo.B.chest.rotation.x += sob; zo.B.chest.rotation.z += .012 * Math.sin(t * 1.3);
    mo.B.chest.rotation.x += .012 * Math.sin(t * 1.6);
    palmsCover(zo);   // r16: both palms over the face, head bowed into them
    zo.B.spine.rotation.x += .05; zo.B.chest.rotation.z += .03; zo.group.updateMatrixWorld(true); palmsCover(zo);
  },
});

// r23 stop rule: b002 recut as painting p41_pleurs_nuit (3D night kneel failed 3+ rounds); slow push toward the mother.
const p41 = { async load() { await loadStill('p41_pleurs_nuit'); }, fn(lt, u) { still('p41_pleurs_nuit', u, [.5, .5, 1.07, .42, .48, 1.15]); return { vignette: .55, paper: .2 }; } };

export default beatScene(ID, {
  shots: { pa, nu, p41 },
  plan: {
    b001: { shot: 'pa', size: 'CU', on: 'zoubida' },
    b002: { shot: 'p41' },   // r23: painting (was 3D nu shot)
  },
});
