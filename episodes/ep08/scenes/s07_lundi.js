// s07 "Un lundi". b027 patio (patio_matin): against all habit the father walks in at noon, Mohammed (kneeling by the
// well, slate on his knees) looks up. b028–b037 bedroom lunch (chambre_jour): father kneels left, Zoubida right, Mohammed
// between them, nearer the lens. Acting beats: b030 Zoubida's hand to her chest at "bracelets", b031 painting (sun/moon,
// enumeration), b032 father lowers his eyes, b034 palms up at "miséricorde", b035 Mohammed sits up, b036 hand on his head.
import * as PO from '../../../engine/poses.js';
import * as PR from '../../../engine/props3d.js';
import { staged, approach } from '../lib/fix8.js';
import { holdBoard, lapRest, plant, reachSafe } from '../lib/fix8a.js';
import { LUNCH } from '../lib/lunch.js';
import { beatScene, lines, sm, at, front, V, dirW } from '../lib/beatscene.js';

const ID = 's07_lundi', L = lines(ID);
const B = i => L[i] || [0, 0];
const win = (i, a, b, t) => { const [t0, t1] = B(i), D = t1 - t0; return sm(t0 + a * D, t0 + a * D + .5, t) * (1 - sm(t0 + b * D, t0 + b * D + .5, t)); };

const pa = staged('patio_matin', {
  father: { at: [400, 965], face: [800, 960], height: 1.76, walk: { to: [720, 968], t0: .3, t1: B(0)[0] + 3.2 } },   // Argon r4: the walk was never seen (stills before t0) → he is already moving as the shot opens
  // cross-legged by the well, three-quarter to the lens, the louha on his lap; he looks up as his father comes in
  mohammed: { at: [930, 1000], face: 'cam', yaw: .25, pose: 'cross',   // Argon r5: lost off frame right → near the father's path, 3/4 turned to him
    look: t => t > 1.3 ? 'father' : [1000, 1040, .2], lookMax: .9 },
}, {
  addressee: { narrator: 'mohammed' },
  act(lt, t, S, st, S3) {
    holdLouha(st.A.mohammed, st.lh ||= S3.prop(PR.louha({ col: 0x9a6a38 }), 0, 0, 0));
    // Argon r5: stiff arms on the walk → relaxed hands swinging opposite to the stride, settling when he stops
    const fa = st.A.father, k = fa.group.scale.y / 1.6, go = 1 - sm(B(0)[0] + 2.9, B(0)[0] + 3.6, t);
    for (const [s, ph] of [['L', 0], ['R', Math.PI]]) { const w = Math.sin(t * 5.6 + ph) * go;
      const sh = at(fa, 'upperArm' + s), len = sh.distanceTo(at(fa, 'foreArm' + s)) + at(fa, 'foreArm' + s).distanceTo(at(fa, 'hand' + s));
      PO.reach(fa, s, sh.add(V(0, -.88 * len, 0)).addScaledVector(dirW(fa, 0, 0, 1), (.04 + .09 * w) * k), { grip: .15 }); }
  },
});

/** louha on the knees, tilted back so its top stays under the chin, palms on the lower side edges */
function holdLouha(a, lh) {
  const kk = a.group.scale.y / 1.6;
  holdBoard(a, lh, front(a, 'root', .16 * kk, 0, .03 * kk), -1.15, Math.min(.48, kk * .65));
  reachSafe(a, 'L', lh.localToWorld(V(.08, .12, .01)), { grip: .03, pole: [.3, -.12, .1] });
  reachSafe(a, 'R', lh.localToWorld(V(-.08, .12, .01)), { grip: .03, pole: [-.3, -.12, .1] });
}

// looks run after the gaze net: b032 the father lowers his eyes (his worker's mother), b036–b037 he looks down at his son;
// the boy looks up at him under the hand on his head
const ch = staged('chambre_jour', {
  ...LUNCH,
  // Argon r4: he looked at the lens on b033/b034 and b036/b037 → explicit eyelines, wider head cap
  father: { ...LUNCH.father, height: 1.76, lookMax: 1.15, look: (t, st) => win(5, .05, .95, t) > .5 ? front(st.A.father, 'chest', .9, 0, -.5) : t >= B(10)[0] - .2 ? [1020, 960, .75] : t >= B(9)[0] - .2 ? 'mohammed' : t >= B(6)[0] - .2 ? 'zoubida' : null },   // b037 (Argon r5): screen-right, to them both, not down into his collar
  // Argon r5: he drifted to the lens → he follows the talk: his mother on her reaction (b030) and her question (b033), else his father.
  // b035 the head-shake stays toward the lens: a look at his father on top of the body yaw turned the face past the camera.
  mohammed: { ...LUNCH.mohammed, yaw: .3, lookMax: t => win(8, 0, .95, t) > .15 ? 1.2 : .55, look: (t, st, S3) => win(8, 0, .95, t) > .15 ? S3.cam.position.clone() : win(3, .3, 1, t) > .3 || win(6, 0, .9, t) > .3 ? 'zoubida' : t >= B(1)[0] - .3 ? 'father' : null },
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
    if (wel > 0) fa.B.spine.rotation.x += .08 * wel;
    if (ask > 0) { zo.B.spine.rotation.x += .1 * ask; zo.B.head.rotation.z += .08 * ask; }
    if (pat > 0) { fa.B.spine.rotation.x += .22 * pat; fa.B.chest.rotation.x += .1 * pat; fa.B.neck.rotation.x += .12 * pat; }   // over the boy, still upright enough that the forearm stays outside the ribs
    for (const a of [fa, zo, mo]) { a.B.spine.updateWorldMatrix(false, true); plant(a); }
    for (const a of [fa, zo, mo]) for (const s of ['L', 'R']) lapRest(a, s, t);
    // b030: right hand to her chest from "bracelets", palm turned onto the breastbone
    if (chest > 0) {
      reachSafe(zo, 'R', front(zo, 'chest', .2 * kz, .04 * kz, .04 * kz).lerp(front(zo, 'root', .18 * kz, .14 * kz, .05 * kz), 1 - chest), { grip: .03, pole: [-.35, -.1, .15] });
      PO.palmTo(zo, 'R', chest, dirW(zo, 0, 0, -1));
    }
    // b034: palms up briefly at "miséricorde"
    if (palms > 0) for (const s of ['L', 'R']) {
      const sign = s === 'L' ? 1 : -1;
      reachSafe(fa, s, front(fa, 'chest', .26 * kf, sign * .2 * kf, .02 * kf).lerp(front(fa, 'root', .18 * kf, sign * .16 * kf, .05 * kf), 1 - palms), { grip: 0, pole: [sign * .4, -.1, .12] });
      PO.palmTo(fa, s, palms); PO.fingers(fa, s, .15, { spread: .3 });
    }
    // b035: left fist at his chest, right hand open toward his father
    if (up > 0) {
      reachSafe(mo, 'L', front(mo, 'chest', .16 * km, .08 * km, .02 * km), { grip: .04, pole: [.3, -.1, .1] });
      PO.fingers(mo, 'L', .3 + .6 * up, { thumb: .5 });
      const pump = .5 + .5 * Math.sin(t * 4.5);
      reachSafe(mo, 'R', front(mo, 'chest', (.22 + .03 * pump) * km, -.12 * km, .02 * km), { grip: 0, pole: [-.3, -.05, .12] });
      PO.palmTo(mo, 'R', up); PO.fingers(mo, 'R', .12, { spread: .3 });
    }
    // b028–b029: a small open-handed welcome as he announces the outing
    if (wel > 0) {
      reachSafe(fa, 'R', front(fa, 'chest', (.24 + .02 * Math.sin(t * 2.2)) * kf, -.16 * kf, .02 * kf), { grip: 0, pole: [-.35, -.1, .12] });
      PO.palmTo(fa, 'R', wel); PO.fingers(fa, 'R', .1, { spread: .25 });
    }
    // b036: he shifts closer, then the right palm rests on his son's crown. The left hand stays on the lap.
    if (pat > 0) {
      const top = at(mo, 'head').add(V(0, .06 * km, 0));
      approach(fa, 'R', top, .05);
      PO.reach(fa, 'R', top, { grip: .01, pole: [-.4, .15, .15] });
      PO.palmTo(fa, 'R', pat, V(0, -1, 0)); PO.fingers(fa, 'R', .35 * pat, { spread: .2 });
    }
  },
});

export default beatScene(ID, {
  shots: { pa, ch },
  plan: {
    b027: { shot: 'pa', size: 'M', on: 'mohammed', z: 1.5, dx: -230 },   // Argon r5: the boy in the foreground, the father crossing behind (hand-set: the M zoom of a seated child would lose the walk)   // recal h 1.75: actors are true size now, W shows the whole patio with tiny figures
    b028: { shot: 'ch', size: 'M', on: 'father', z: 1.6, dx: 170, dy: -25, insAt: .55 },
    b029: { shot: 'ch', size: 'CU', on: 'father', z: 1.9, dy: -50 },
    b030: { shot: 'ch', size: 'CU', on: 'zoubida', z: 1.6, dx: -150, dy: -40 },
    b032: { shot: 'ch', size: 'M', on: 'father', z: 1.45, dx: 220, dy: -55 },   // both of them in the master, crown inside the frame
    b033: { shot: 'ch', size: 'CU', on: 'zoubida', z: 1.9, dy: -50 },
    b034: { shot: 'ch', size: 'M', on: 'father', z: 1.8, dy: -40 },
    b035: { shot: 'ch', size: 'W', on: 'mohammed' },
    b036: { shot: 'ch', size: 'M', on: 'father' },
    b037: { shot: 'ch', size: 'CU', on: 'father' },
  },
});
