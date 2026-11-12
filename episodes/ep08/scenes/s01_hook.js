// s01 hook. b001 noon patio (patio_matin): the father's open hand holds the bracelets out to Zoubida; her eyes go from his
// hand to his face, a small laugh. b002 same evening, chambre_nuit: Zoubida kneels on the floor weeping, face in her hands,
// shoulders shaking; behind her Mohammed lies on the divan, awake, only blinking.
import * as PO from '../../../engine/poses.js';
import { aim } from '../../../engine/ik.js';
import * as PR from '../../../engine/props3d.js';
import { staged, THREE } from '../lib/autostage.js';
import { beatScene, lines, sm, front, at, V } from '../lib/beatscene.js';
import { bangles } from '../lib/fix8_R17A.js';
import { faceCam } from '../lib/fix8c.js';
import { lieOnBed, pillowUnder, palmsOverEyes } from '../lib/fix8_lie.js';

// G1: both palms flat in front of the face (fingers over the eyes), wrists clear of the cheeks; palmsOnFace put them on the ears/jaw
function palmsCover(a) {
  const B = a.B;
  B.chest.rotation.x += .06; B.neck.rotation.x += .26; a.group.updateMatrixWorld(true);
  for (const s of ['L', 'R']) {
    const sign = s === 'L' ? 1 : -1, spot = () => B.head.localToWorld(new THREE.Vector3(sign * (s === 'L' ? .03 : .05), s === 'L' ? .05 : .04, .15));
    const pole = [sign * .95, -.1, .15];   // r16: elbows down and in (not flared out beside the cheeks)
    for (let i = 0; i < 3; i++) {
      PO.reach(a, s, spot(), { grip: 0, pole });
      aim(B['hand' + s], PO.handPts(a, s).end, B.head.localToWorld(new THREE.Vector3(sign * .01, .09, .1)));
    }
    PO.fingers(a, s, .02, { thumb: .02, spread: .1 });
  }
}
const ID = 's01_hook', L = lines(ID), B = i => L[i] || [0, 0];

const pa = staged('patio_matin', {
  father: { height: 1.76, at: [700, 985], face: 'zoubida', seed: 5, look: 'zoubida', lookMax: .85 },   // Argon r6: his level gaze passed over her scarf → head pitched down to her face
  zoubida: { at: [850, 975], face: 'father', seed: 7,
    look: (t, st) => t < B(0)[0] + .45 * (B(0)[1] - B(0)[0]) ? st.offer : 'father' },
}, {
  act(lt, t, S, st, S3) {
    const fa = st.A.father, zo = st.A.zoubida, k = fa.group.scale.y / 1.6;
    const u = 1;   // Argon r6: the hand was empty at the open → he already holds the bracelets out, waist height, elbow bent and down, palm up
    const p = front(fa, 'chest', .3 * k, .1 * k, -.26 * k).lerp(front(fa, 'root', .15 * k, .2 * k, 0), 1 - u);
    PO.reach(fa, 'R', p, { grip: .08, pole: [-.25, -.5, -.15] }); st.offer = p.clone().add(V(0, .03, 0));
    fa.B.foreArmR.rotation.y -= 1.2 * u; fa.B.foreArmR.updateWorldMatrix(false, true);   // supinate: the palm turns to the sky
    PO.fingers(fa, 'R', 0, { thumb: 0, spread: .15 });   // Argon r6: bracelets clipped the curled thumb/fingers → flat open palm
    // r17: the father is alive: weight shift, a slight torso turn toward the lens, head nods, far arm gesturing/resting at his belt
    {
      const w = Math.sin(t * .9), n = Math.sin(t * 1.7 + 1);
      fa.B.chest.rotation.y += .22 + .05 * w; fa.B.chest.rotation.z += .025 * w; fa.B.spine.rotation.z -= .02 * w;
      fa.B.head.rotation.x += .03 * n; fa.B.head.rotation.z += .03 * w; fa.B.chest.updateWorldMatrix(false, true);
      PO.reach(fa, 'L', front(fa, 'chest', .2 * k, -.22 * k, -.12 * k + .02 * k * Math.sin(t * 1.3)), { grip: .25, pole: [.5, -.6, -.2] });
      PO.reach(fa, 'R', p.clone(), { grip: .08, pole: [-.25, -.5, -.15] });
      fa.B.foreArmR.rotation.y -= 1.2 * u; fa.B.foreArmR.updateWorldMatrix(false, true); PO.fingers(fa, 'R', 0, { thumb: 0, spread: .15 });
      st.offer = p.clone().add(V(0, .03, 0));
    }
    {   // r18: bangles are placed LAST (after every reach/torso move) from the hand's palm point, so they ride the hand; gate checks contact
      const br = st.br ||= bangles(S3);
      fa.group.updateMatrixWorld(true); br.visible = true;
      br.position.copy(PO.handPts(fa, 'R').palm.add(V(0, .03 * k, 0))); br.scale.setScalar(1.15 * Math.max(.75, k)); br.updateMatrixWorld(true);
      st.actcheck = { held: { actor: 'father', side: 'R', prop: br, max: .08, required: true } };
    }
    if (globalThis.DBG19 && Math.abs(t-1.9)<.06) { const r=n=>fa.B[n]?.rotation.toArray().slice(0,3).map(x=>+x.toFixed(2)).join(","); globalThis.__w19(["DBG19",t.toFixed(2),Object.keys(fa.B).join(" "),"spine",r("spine"),"chest",r("chest"),"neck",r("neck"),"head",r("head"),"LS",r("LeftShoulder"),"RS",r("RightShoulder")].join(" ")+"\n"); }
    const laugh = sm(B(0)[0] + .55 * (B(0)[1] - B(0)[0]), B(0)[1], t);
    if (laugh > 0) { zo.B.chest.rotation.x += .07 * Math.sin(t * 14) * laugh; zo.B.neck.rotation.x -= .12 * laugh; zo.B.chest.updateWorldMatrix(false, true); }
    // Argon r5: she stood in a stiff A-pose → her hands meet in front of her waist, then rise to her breastbone as she laughs
    const kz = zo.group.scale.y / 1.6, see = sm(B(0)[0] + .2 * (B(0)[1] - B(0)[0]), B(0)[0] + .45 * (B(0)[1] - B(0)[0]), t);
    zo.B.chest.rotation.z += .02 * Math.sin(t * 1.1); zo.B.head.rotation.z += .05 * (.4 + laugh); zo.B.head.rotation.y += .06 * Math.sin(t * .8); zo.B.chest.updateWorldMatrix(false, true);
    for (const s of ['L', 'R']) {
      const early = sm(.3, B(0)[0] + .65, t) * (1 - see);   // b001: a small response before the laugh, preserving the opening offer
      PO.reach(zo, s, front(zo, 'root', (.27 + .025 * early) * kz, (s === 'L' ? -.09 : .09) * kz, (.08 + .035 * early) * kz).lerp(front(zo, 'neck', .22 * kz, (s === 'L' ? -.045 : .045) * kz, -.17 * kz), Math.max(.0, see * .8 + .2 * laugh)), { grip: .1 });
      if (early > 0) PO.fingers(zo, s, .08 * early, { spread: .3 });
    }
  },
});

// Right divan top, clockwise from the back-left corner. The chest beside it is off limits.
const MATTRESS = [[1055, 588], [1412, 588], [1420, 772], [1148, 748]];
const CHEST = [[1418, 585], [1830, 585], [1830, 890], [1418, 890]];
// b002: floor kneel, head bowed into her hands. Mohammed lies along the right divan, skull on the back cushions.
const nu = staged('chambre_nuit', {
  zoubida: { at: [820, 880], face: 'cam', yaw: 1.15, pose: 'kneel', o: { grounded: true, lean: .22, hip: .30, spread: .065, hands: false },
    seed: 7, hands: false, talk: 0, lids: .95 },
  mohammed: { at: [1301, 764], face: [1384, 841], pose: 'lie', o: { top: .35, turn: .12, headTurn: -.22, hands: 'belly', pillow: .1, mattress: MATTRESS, avoid: CHEST }, seed: 3, talk: 0 },
}, {
  act(lt, t, S, st, S3) {
    const { zoubida: zo, mohammed: mo } = st.A;
    faceCam(zo, S3.cam, .6);   // r18: 3/4 front toward the lens, face and hands readable
    st.G.apply = () => {};   // contact hands and the boy's pillow turn must survive the automatic gaze pass
    lieOnBed(mo, { top: .35, feet: [.5, .87], hands: 'chest', pillow: .08, tuck: .06, headTurn: -.1 });   // r15: flat on the cloth at cast scale
    {   // r16: a low cushion under the back of the skull (further behind the head so the chin never meets it)
      st.pillow2 ||= PR.cushion({ w: .4, d: .3, h: .07, col: 0x586b8c });
      const q = mo.B.head.localToWorld(new THREE.Vector3(0, .0, -.09));
      S3.prop(st.pillow2, q.x, .35 + .035 - .004, q.z, mo.group.rotation.y); st.pillow2.visible = true; }
    mo.B.head.scale.setScalar(.86); mo.B.head.updateWorldMatrix(false, true);   // r17: child head proportion
    for (const [sd, sg] of [['L', 1], ['R', -1]]) { mo.B['upperArm' + sd]?.rotation && (mo.B['upperArm' + sd].rotation.z += sg * .12); }
    mo.group.updateMatrixWorld(true);
    const sob = .02 * Math.max(0, Math.sin(t * 9)) * (Math.sin(t * 1.3) > -.3 ? 1 : 0);
    zo.B.chest.rotation.x += sob; zo.B.chest.rotation.z += .012 * Math.sin(t * 1.3);
    mo.B.chest.rotation.x += .012 * Math.sin(t * 1.7);
    palmsCover(zo);   // r16: both palms over the face, head bowed into them
    zo.B.spine.rotation.x += .05; zo.B.chest.rotation.z += .03; zo.group.updateMatrixWorld(true); palmsCover(zo);
  },
});

export default beatScene(ID, {
  shots: { pa, nu },
  plan: {
    b001: { shot: 'pa', size: 'CU', on: 'zoubida' },
    b002: { shot: 'nu', size: 'M', on: 'zoubida', z: 1.55, dx: 140, dy: -55 },   // her full head, and the boy on the divan behind her
  },
});
