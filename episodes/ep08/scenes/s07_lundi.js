// s07 "Un lundi". b027 patio (patio_matin): against all habit the father walks in at noon, Mohammed (kneeling by the
// well, slate on his knees) looks up. b028–b037 bedroom lunch (chambre_jour): father kneels left, Zoubida right, Mohammed
// between them, nearer the lens. Acting beats: b030 Zoubida's hand to her chest at "bracelets", b031 painting (sun/moon,
// enumeration), b032 father lowers his eyes, b034 palms up at "miséricorde", b035 Mohammed sits up, b036 hand on his head.
import * as PO from '../../../engine/poses.js';
import * as PR from '../../../engine/props3d.js';
import * as IK from '../../../engine/ik.js';
import { staged } from '../lib/autostage.js';
import { LUNCH } from '../lib/lunch.js';
import { beatScene, lines, sm, at, front, V, dirW } from '../lib/beatscene.js';

const ID = 's07_lundi', L = lines(ID);
const B = i => L[i] || [0, 0];
const win = (i, a, b, t) => { const [t0, t1] = B(i), D = t1 - t0; return sm(t0 + a * D, t0 + a * D + .5, t) * (1 - sm(t0 + b * D, t0 + b * D + .5, t)); };

const pa = staged('patio_matin', {
  father: { at: [400, 965], face: [800, 960], walk: { to: [720, 968], t0: .3, t1: B(0)[0] + 3.2 } },   // Argon r4: the walk was never seen (stills before t0) → he is already moving as the shot opens
  // cross-legged by the well, three-quarter to the lens, the louha on his lap; he looks up as his father comes in
  mohammed: { at: [930, 1000], face: [560, 1060], pose: 'cross',   // Argon r5: lost off frame right → near the father's path, 3/4 turned to him
    look: t => t > 1.3 ? 'father' : [1000, 1040, .2], lookMax: .9 },
}, {
  addressee: { narrator: 'mohammed' },
  act(lt, t, S, st, S3) {
    holdLouha(st.A.mohammed, st.lh ||= S3.prop(PR.louha({ col: 0x9a6a38 }), 0, 0, 0));
    // Argon r5: stiff arms on the walk → relaxed hands swinging opposite to the stride, settling when he stops
    const fa = st.A.father, k = fa.group.scale.y / 1.6, go = 1 - sm(B(0)[0] + 2.9, B(0)[0] + 3.6, t);
    for (const [s, ph] of [['L', 0], ['R', Math.PI]]) { const w = Math.sin(t * 5.6 + ph) * go;
      PO.reach(fa, s, front(fa, 'root', (.06 + .11 * w) * k, (s === 'L' ? -.21 : .21) * k, (-.1 + .03 * Math.abs(w)) * k), { grip: .15 }); }
  },
});

/** louha held upright on the lap (as ep05 s03): bottom edge on the thighs, leaning back, palms on its side edges */
function holdLouha(a, lh) {
  const hip = IK.wpos(a.B.root), fw = dirW(a, 0, 0, 1).setY(0).normalize(), k = a.group.scale.y / 1.15;
  const p = hip.clone().addScaledVector(fw, .2 * k); p.y = hip.y + .02;
  lh.position.copy(p); lh.rotation.set(0, 0, 0); lh.rotation.order = 'YXZ'; lh.rotation.y = a.group.rotation.y; lh.rotation.x = -.35; lh.updateMatrixWorld(true);
  PO.reach(a, 'L', lh.localToWorld(V(.135, .2, 0)), { grip: .04 }); PO.reach(a, 'R', lh.localToWorld(V(-.135, .2, 0)), { grip: .04 });
}

// looks run after the gaze net: b032 the father lowers his eyes (his worker's mother), b036–b037 he looks down at his son;
// the boy looks up at him under the hand on his head
const ch = staged('chambre_jour', {
  ...LUNCH,
  // Argon r4: he looked at the lens on b033/b034 and b036/b037 → explicit eyelines, wider head cap
  father: { ...LUNCH.father, lookMax: 1.15, look: (t, st) => win(5, .05, .95, t) > .5 ? front(st.A.father, 'root', .9, 0, -.2) : t >= B(10)[0] - .2 ? [1020, 960, .75] : t >= B(9)[0] - .2 ? 'mohammed' : t >= B(6)[0] - .2 ? 'zoubida' : null },   // b037 (Argon r5): screen-right, to them both, not down into his collar
  // Argon r5: he drifted to the lens → he follows the talk: his mother on her reaction (b030) and her question (b033), else his father
  mohammed: { ...LUNCH.mohammed, yaw: .55, lookMax: 1, look: t => win(3, .3, 1, t) > .3 || win(6, 0, .9, t) > .3 ? 'zoubida' : t >= B(1)[0] - .3 ? 'father' : null },
}, {
  // the father talks to Zoubida until b036, then to his son (b036 "Ne te tourmente pas", b037 the jewels question)
  addressee: { father: l => l.t0 >= B(9)[0] - .2 ? 'mohammed' : 'zoubida', zoubida: 'father', mohammed: 'father' },
  act(lt, t, S, st) {
    const { father: fa, zoubida: zo, mohammed: mo } = st.A;
    const kz = zo.group.scale.y / 1.6, kf = fa.group.scale.y / 1.6, km = mo.group.scale.y / 1.6;
    // b030: breath stops, right hand to her chest from the word "bracelets" (≈ 45 % of the line) to the end
    const chest = win(3, .42, 1.05, t);
    if (chest > 0) PO.reach(zo, 'R', front(zo, 'neck', .1 * kz, .03 * kz, -.09 * kz).lerp(front(zo, 'root', .2 * kz, .15 * kz, 0), 1 - chest), { grip: .03, pole: [-.3, -.15, -.05] });   // palm flat on the breastbone, elbow down
    if (chest > 0) PO.palmTo(zo, 'R', chest, dirW(zo, 0, 0, -1));   // Argon r4: palm faced outward → turn it onto her chest
    // b032: father lowers his eyes (head pitch down on top of the gaze net, applied after it via fixed look below)
    // b034: palms up briefly at "miséricorde" (last third)
    const palms = win(7, .35, .98, t);
    if (palms > 0) for (const s of ['L', 'R']) { PO.reach(fa, s, front(fa, 'chest', .32 * kf, (s === 'L' ? -.22 : .22) * kf, -.04 * kf).lerp(front(fa, 'root', .2 * kf, (s === 'L' ? -.2 : .2) * kf, 0), 1 - palms), { grip: 0 }); PO.palmTo(fa, s, palms); PO.fingers(fa, s, .15, { spread: .3 }); }   // Argon r4: palms were not up → forearm roll
    // b035: Mohammed sits up straight, chest back
    const up = win(8, 0, .95, t);
    if (up > 0) {   // Argon r4: static on his outburst → chest up, chin lifts, head shakes "no", fists in front of his chest
      mo.B.spine.rotation.x -= .08 * up; mo.B.chest.rotation.x -= .14 * up; mo.B.neck.rotation.x -= .1 * up;
      mo.B.head.rotation.y += .18 * up * Math.sin(t * 5.2) * (1 - sm(B(8)[0] + 1.6, B(8)[0] + 2.4, t));
      mo.B.spine.updateWorldMatrix(false, true);
      // Argon r5: no pleading gesture → left fist tight at his chest, right hand open and thrust toward his father, palm up, pumping on the words
      PO.reach(mo, 'L', front(mo, 'chest', .18 * km, -.06 * km, -.04 * km).lerp(front(mo, 'root', .2 * km, -.15 * km, 0), 1 - up), { grip: .05 }); PO.fingers(mo, 'L', .3 + .6 * up, { thumb: .5 });
      const pump = .5 + .5 * Math.sin(t * 4.5), toFa = at(mo, 'chest').lerp(at(fa, 'head'), .3 + .06 * pump);
      PO.reach(mo, 'R', toFa.lerp(front(mo, 'root', .2 * km, .15 * km, 0), 1 - up), { grip: 0 }); PO.palmTo(mo, 'R', up); PO.fingers(mo, 'R', .12, { spread: .3 });
    }
    // b028–b029 (Argon r5 minor): a small open-handed welcome toward his family as he announces the outing, torso leaning in
    const wel = Math.max(win(1, .25, .85, t), win(2, .1, .8, t));
    if (wel > 0) { fa.B.spine.rotation.x += .08 * wel; fa.B.spine.updateWorldMatrix(false, true);
      PO.reach(fa, 'R', front(fa, 'chest', (.3 + .03 * Math.sin(t * 2.2)) * kf, .22 * kf, -.12 * kf).lerp(front(fa, 'root', .2 * kf, .2 * kf, 0), 1 - wel), { grip: 0 }); PO.palmTo(fa, 'R', wel); PO.fingers(fa, 'R', .1, { spread: .25 }); }
    // b033 (minor): Zoubida leans in with her question
    const ask = win(6, .05, .95, t);
    if (ask > 0) { zo.B.spine.rotation.x += .1 * ask; zo.B.head.rotation.z += .08 * ask; zo.B.spine.updateWorldMatrix(false, true); }
    // b036: the father's right hand comes to rest on the boy's head (reach clamps if too far; stills show it)
    const pat = win(9, .15, .9, t);
    if (pat > 0) {
      fa.B.spine.rotation.x += .3 * pat; fa.B.chest.rotation.x += .15 * pat; fa.B.neck.rotation.x += .2 * pat; fa.B.spine.updateWorldMatrix(false, true);   // Argon r5: too far for the palm, eyes not on the boy → he bends over him, head down
      const top = at(mo, 'head').add(V(0, .2 * km, 0)).addScaledVector(dirW(mo, 0, 0, 1), -.05 * km);   // Argon r4: missed the crown → palm a little lower and further back
      PO.reach(fa, 'R', front(fa, 'chest', .25 * kf, .1 * kf, -.15 * kf).lerp(top, pat), { grip: .01, pole: [-.45, .25, .1] }); PO.palmTo(fa, 'R', pat, V(0, -1, 0)); PO.fingers(fa, 'R', .35 * pat, { spread: .2 });
    }
  },
});

export default beatScene(ID, {
  shots: { pa, ch },
  plan: {
    b027: { shot: 'pa', size: 'M', on: 'mohammed', z: 1.5, dx: -230 },   // Argon r5: the boy in the foreground, the father crossing behind (hand-set: the M zoom of a seated child would lose the walk)   // recal h 1.75: actors are true size now, W shows the whole patio with tiny figures
    b028: { shot: 'ch', size: 'M', on: 'father', insAt: .55 },
    b029: { shot: 'ch', size: 'CU', on: 'father' },
    b030: { shot: 'ch', size: 'CU', on: 'zoubida' },
    b032: { shot: 'ch', size: 'M', on: 'father' },
    b033: { shot: 'ch', size: 'CU', on: 'zoubida' },
    b034: { shot: 'ch', size: 'M', on: 'father' },
    b035: { shot: 'ch', size: 'W', on: 'mohammed' },
    b036: { shot: 'ch', size: 'M', on: 'father' },
    b037: { shot: 'ch', size: 'CU', on: 'father' },
  },
});
