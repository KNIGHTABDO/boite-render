// s07 "Un lundi". b027 patio (patio_matin): against all habit the father walks in at noon, Mohammed (kneeling by the
// well, slate on his knees) looks up. b028 to b036 bedroom lunch (chambre_jour): the parents and the boy, nearer the lens.
// Acting beats: b030 her hand to her chest at "bracelets", b031 painting (sun/moon,
// enumeration), b032 the father lowers his eyes, b034 palms up at "miséricorde", b035 the boy sits up, b036 hand on his head.
// b037 CU on the father, eyebrows up, the question about the jewels.
import * as PO from '../../../engine/poses.js';
import * as PR from '../../../engine/props3d.js';
import { approach } from '../lib/fix8.js';
import { fitKneel, lapRest, reachSafe, staged } from '../lib/fix8a.js';
import { THREE } from '../lib/autostage.js';
import { lapLouha } from './s05_memoire.js';
import { LUNCH } from '../lib/lunch.js';
import { beatScene, lines, sm, at, front, V, dirW } from '../lib/beatscene.js';

const ZS = 1;
const ID = 's07_lundi', L = lines(ID);
const B = i => L[i] || [0, 0];
const win = (i, a, b, t) => { const [t0, t1] = B(i), D = t1 - t0; return sm(t0 + a * D, t0 + a * D + .5, t) * (1 - sm(t0 + b * D, t0 + b * D + .5, t)); };

// the boy follows Zoubida (b030 bracelets, then b033 her question and b034 the answer about the dead mother), shoulders and gaze together
const zwin = t => Math.max(win(3, .3, 1, t), sm(B(6)[0], B(6)[0] + .5, t) * (1 - sm(B(8)[0] - .9, B(8)[0] - .4, t)));

const pa = staged('patio_matin', {
  father: { at: [400, 965], face: [800, 960], height: 1.76, walk: { to: [720, 968], t0: 0, t1: B(0)[0] + 3.2 } },   // Argon r4: the walk was never seen (stills before t0) → he is already moving as the shot opens
  // cross-legged by the well, three-quarter to the lens, the louha on his lap; he looks up as his father comes in
  mohammed: { at: [1230, 992], face: 'cam', yaw: .4, pose: 'cross',   // Argon r5: lost off frame right → near the father's path, 3/4 turned to him
    look: () => 'father', lookMax: () => 1.3 },   // R25B: eyes on the father from the first frame
}, {
  addressee: { narrator: 'mohammed' },
  act(lt, t, S, st, S3) {
    if (!st.lh) {   // r19: same pale board with writing bars as s05/s06, laid on the knees with lapLouha
      st.lh = S3.prop(PR.louha({ col: 0xc99a58 }), 0, 0, 0);
      for (let i = 0; i < 6; i++) {
        const bar = new THREE.Mesh(new THREE.BoxGeometry(i % 2 ? .15 : .19, .012, .004), PR.toon(0x2a1a10));
        bar.position.set(0, .06 + i * .045, .0095); st.lh.add(bar);
      }
    }
    lapLouha(st.A.mohammed, st.lh, { f: 0, x: 0, y: -.02, sc: 1.2, tilt: -.3 });   // R25B: bigger, flatter slate on the knees
    // r16: idempotent re-attach is in holdBoard; the slate is drawn larger so it reads in the wide patio master
    // Argon r5: stiff arms on the walk → relaxed hands swinging opposite to the stride, settling when he stops
    const fa = st.A.father, go = 1 - sm(B(0)[0] + 2.9, B(0)[0] + 3.6, t);
    // r17: mid-stride legs while he walks in (thighs/shins/feet as in rig3d.walkPose), settling when he stops
    { const a = t * 5.6, k = go * .9, B = fa.B;
      B.thighL.rotation.x = -Math.sin(a) * .42 * k; B.thighR.rotation.x = Math.sin(a) * .42 * k;
      B.shinL.rotation.x = Math.max(0, Math.sin(a - 1.4)) * .7 * k; B.shinR.rotation.x = Math.max(0, -Math.sin(a - 1.4)) * .7 * k; }
    { const mo = st.A.mohammed; mo.B.neck.rotation.x -= .12; mo.B.head.rotation.x -= .08;
      const up = .5 + .5 * Math.sin(t * 1.3); mo.B.neck.rotation.x -= .14; mo.B.head.rotation.x -= .26 + .03 * up; mo.B.head.rotation.y += .12; }   // R25B: chin up toward the father, slight turn + idle   // r17: head not so far down by the well
    for (const [s, ph] of [['L', 0], ['R', Math.PI]]) {
      const w = Math.sin(t * 5.6 + ph) * go, outZ = s === 'L' ? 1 : -1;
      const ua = fa.B['upperArm' + s], eb = fa.B['foreArm' + s], ha = fa.B['hand' + s];
      ua.quaternion.copy(ua.userData.rest); ua.rotateZ(outZ * .45); ua.rotateX(.28 * w);
      eb.quaternion.copy(eb.userData.rest); eb.rotateX(-.62); eb.rotateZ(outZ * .12);
      ha.quaternion.copy(ha.userData.rest);
      ua.updateWorldMatrix(true, true);
    }
  },
});

// looks run after the gaze net: b032 the father lowers his eyes (his worker's mother), b036–b037 he looks down at his son;
// the boy looks up at him under the hand on his head
const ch = staged('chambre_jour', {
  ...LUNCH,
  // Argon r4: he looked at the lens on b033/b034 and b036/b037 → explicit eyelines, wider head cap
  father: { ...LUNCH.father, height: 1.76, lookMax: 1.15, look: (t, st) => win(5, .05, .95, t) > .5 ? front(st.A.father, 'chest', .9, 0, -.5) : t >= B(9)[0] - .2 ? 'mohammed' : t >= B(6)[0] - .2 ? 'zoubida' : null },   // b037 (Argon r5): screen-right, to them both, not down into his collar
  // Argon r5: he drifted to the lens → he follows the talk: his mother on her reaction (b030) and her question (b033), else his father.
  // b035 the head-shake stays toward the lens: a look at his father on top of the body yaw turned the face past the camera.
  mohammed: { ...LUNCH.mohammed, at: [930, 1000], yaw: .2, lookMax: t => win(8, 0, .95, t) > .15 || (t > B(8)[0] - .4 && t < B(8)[0] + .4) ? .55 : .95, look: (t, st, S3) => win(8, 0, .95, t) > .15 || (t > B(8)[0] - .4 && t < B(8)[0] + .4) ? 'father' : win(3, .3, 1, t) > .3 || zwin(t) > .3 ? 'zoubida' : t >= B(1)[0] - .3 ? 'father' : null },
}, {
  // the father talks to Zoubida until b036, then to his son (b036 "Ne te tourmente pas", b037 the jewels question)
  addressee: { father: l => l.t0 >= B(9)[0] - .2 ? 'mohammed' : 'zoubida', zoubida: 'father', mohammed: 'father' },
  act(lt, t, S, st) {
    const { father: fa, zoubida: zo, mohammed: mo } = st.A;
    const kz = zo.group.scale.y / 1.6, kf = fa.group.scale.y / 1.6, km = mo.group.scale.y / 1.6;
    const chest = win(3, .42, 1.05, t);
    const palms = win(7, .35, .98, t);
    const up = win(8, 0, .95, t);
    const wel = Math.max(win(1, .25, .85, t), win(2, .1, .8, t));
    const ask = win(6, .05, .95, t);
    const pat = win(9, .15, .9, t);
    if (up > 0) {   // Argon r4: static on his outburst → chest up, chin lifts, head shakes "no"
      mo.B.spine.rotation.x -= .08 * up; mo.B.chest.rotation.x -= .14 * up; mo.B.neck.rotation.x -= .1 * up;
      mo.B.head.rotation.y += .12 * up * Math.sin(t * 5.2) * (1 - sm(B(8)[0] + 1.6, B(8)[0] + 2.4, t));
    }
    // he turns his shoulders toward Zoubida when she speaks (b030, b033, b034) so head + body reach her
    const zw = zwin(t);
    if (zw > 0) { mo.B.spine.rotation.y += ZS * .35 * zw; mo.B.chest.rotation.y += ZS * .3 * zw; }
    if (wel > 0) fa.B.spine.rotation.x += .08 * wel;
    if (ask > 0) { zo.B.spine.rotation.x += .1 * ask; zo.B.head.rotation.z += .08 * ask; }
    if (pat > 0) { fa.B.spine.rotation.x += .22 * pat; fa.B.chest.rotation.x += .1 * pat; fa.B.neck.rotation.x += .12 * pat; }   // over the boy, still upright enough that the forearm stays outside the ribs
    for (const a of [fa, zo, mo]) { a.B.spine.updateWorldMatrix(false, true); fitKneel(a); }
    for (const a of [fa, zo, mo]) for (const s of ['L', 'R']) lapRest(a, s, t);
    // b030: right hand to her chest from "bracelets", palm turned onto the breastbone
    if (chest > 0) {
      reachSafe(zo, 'R', front(zo, 'chest', .12 * kz, .03 * kz, -.1 * kz).lerp(front(zo, 'root', .18 * kz, .14 * kz, .05 * kz), 1 - chest), { grip: .03, pole: [-.35, -.1, .15] });
      PO.palmTo(zo, 'R', chest, dirW(zo, 0, 0, -1));
    }
    // b033: an open questioning hand toward the father, clear of her face
    if (ask > 0) {
      reachSafe(zo, 'R', front(zo, 'root', .18 * kz, .14 * kz, .05 * kz).lerp(front(zo, 'root', .3 * kz, .1 * kz, .2 * kz), ask), { grip: 0, pole: [-.35, -.1, .15] });
      PO.palmTo(zo, 'R', ask); PO.fingers(zo, 'R', .1, { spread: .3 });
    }
    // b034: palms up briefly at "miséricorde"
    if (palms > 0) for (const s of ['L', 'R']) {
      const sign = s === 'L' ? 1 : -1;
      reachSafe(fa, s, front(fa, 'chest', .24 * kf, sign * .25 * kf, -.15 * kf).lerp(front(fa, 'root', .18 * kf, sign * .16 * kf, .05 * kf), 1 - palms), { grip: 0, pole: [sign * 1, -.2, .15] });
      PO.palmTo(fa, s, palms, V(0, 1, 0)); PO.fingers(fa, s, .15, { spread: .3 });
    }
    // b035: left fist at his chest, right hand open toward his father
    if (up > 0) {
      reachSafe(mo, 'L', front(mo, 'chest', .16 * km, .04 * km, .02 * km), { grip: .04, pole: [.12, -.1, .1] });
      PO.fingers(mo, 'L', .3 + .6 * up, { thumb: .5 });
      const pump = .5 + .5 * Math.sin(t * 4.5);
      reachSafe(mo, 'R', front(mo, 'chest', (.22 + .03 * pump) * km, -.07 * km, .02 * km), { grip: 0, pole: [-.12, -.05, .12] });
      PO.palmTo(mo, 'R', up); PO.fingers(mo, 'R', .12, { spread: .3 });
    }
    // b028–b029: a small open-handed welcome as he announces the outing
    if (wel > 0) {
      reachSafe(fa, 'R', front(fa, 'chest', (.24 + .02 * Math.sin(t * 2.2)) * kf, -.16 * kf, -.1 * kf), { grip: 0, pole: [-.35, -.1, .12] });
      PO.palmTo(fa, 'R', wel); PO.fingers(fa, 'R', .1, { spread: .25 });
    }
    // b036: he shifts closer, then the right palm rests on his son's crown. The left hand stays on the lap.
    if (pat > 0) {
      const top = at(mo, 'head').add(V(0, .2 * km, 0)).addScaledVector(dirW(fa, 1, 0, 0), .03 * kf);
      approach(fa, 'R', top, .08);
      PO.reach(fa, 'R', top, { grip: .01, pole: [-.3, .5, .05] });
      PO.palmTo(fa, 'R', pat, V(0, -1, 0)); PO.fingers(fa, 'R', .35 * pat, { spread: .2 });
    }
  },
});

export default beatScene(ID, {
  shots: { pa, ch },
  plan: {
    b027: { shot: 'pa', size: 'M', on: 'mohammed', z: 1.5, dx: -230 },   // Argon r5: the boy in the foreground, the father crossing behind (hand-set: the M zoom of a seated child would lose the walk)   // recal h 1.75: actors are true size now, W shows the whole patio with tiny figures
    b028: { shot: 'ch', size: 'M', on: 'father', z: 1.6, dx: 170, dy: -25, insAt: .55 },
    b029: { shot: 'ch', size: 'CU', on: 'father', z: 1.7, dx: 200, dy: -50 },   // r18: the view cannot pan left of the plate (x>=960/z), so push-out failed; all three heads fully IN instead (father left third, hand still in frame)
    b030: { shot: 'ch', size: 'CU', on: 'zoubida', z: 1.6, dx: -150, dy: -40 },
    b032: { shot: 'ch', size: 'M', on: 'father', z: 1.45, dx: 220, dy: -55 },   // both of them in the master, crown inside the frame
    b033: { shot: 'ch', size: 'CU', on: 'zoubida', z: 1.9, dx: 70, dy: -50 },   // r18: father's head fully off the left edge, boy's head fully in
    b034: { shot: 'ch', size: 'M', on: 'father', z: 1.8, dx: -60, dy: -40 },   // r18: mother clear of the right edge
    b035: { shot: 'ch', size: 'M', on: 'mohammed', z: 1.35, dy: -40 },   // r16: the W master read as a scale pop with floating actors → same M grammar as its neighbours
    b036: { shot: 'ch', size: 'M', on: 'father', z: 1.4, dx: 140, dy: -80 },
    b037: { shot: 'ch', size: 'CU', on: 'father', z: 2.4, dy: -45, dx: 80 },   // r18: real CU, father head+shoulders centre-left and dominant, boy fully in lower right, mother fully out
  },
});
