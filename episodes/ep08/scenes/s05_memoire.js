// s05 "mémoire". b016 the cool mausoleum class (mausolee): CU on the fqih, for once a kind face (soft lids, head tilted,
// a slow nod). b017 M on Mohammed reciting from the slate on his lap, rocking (insert: ten lines → fifteen, cut on "dix").
// b018 the bedroom (chambre_jour, the s07 lunch places): the father, chest out, tells his wife what the teacher said.
// b019 CU on the father quoting, chin up, an open palm offered on "savant". b020 painting p05_savant. b021 CU Mohammed: a slow,
// firm head shake, leaning back from the idea.
import * as PO from '../../../engine/poses.js';
import * as PR from '../../../engine/props3d.js';
import { staged } from '../lib/fix8.js';
import { holdBoard, lapRest, plant, reachSafe } from '../lib/fix8a.js';
import { LUNCH } from '../lib/lunch.js';
import { beatScene, lines, sm, front, V } from '../lib/beatscene.js';

const ID = 's05_memoire', L = lines(ID), B = i => L[i] || [0, 0];
const k = a => a.group.scale.y / 1.6;
const win = (i, a, b, t) => { const [t0, t1] = B(i), D = t1 - t0; return sm(t0 + a * D - .3, t0 + a * D + .3, t) * (1 - sm(t0 + b * D, t0 + b * D + .5, t)); };

// the class layout in the cool room, shared with s06: the fqih cross-legged against the back wall, Mohammed in front of him
// toward the lens, 3/4 to camera (his face reads), his slate up on his lap
export const CLASS = {
  fqih: { at: [1150, 780], face: [1000, 1080], pose: 'cross', seed: 9, height: 1.74 },
  mohammed: { at: [790, 960], face: 'cam', yaw: .35, pose: 'cross', seed: 3, hands: false },
};
/** the slate flat on the crossed shins, below the chin, a hand on each side edge */
export function lapLouha(a, lh) {
  const kk = k(a);
  holdBoard(a, lh, front(a, 'root', .16 * kk, 0, .02 * kk), -1.2, Math.min(.5, kk * .7));
  reachSafe(a, 'L', lh.localToWorld(V(.09, .12, .01)), { grip: .03, pole: [.35, -.15, .12] });
  reachSafe(a, 'R', lh.localToWorld(V(-.09, .12, .01)), { grip: .03, pole: [-.35, -.15, .12] });
  return lh.localToWorld(V(0, .22, .02));
}
/** Msid recitation: the trunk rocks forward and back from the hips (rate = rocks per second · 2π) */
export function rock(a, t, amp = .1, rate = 3.4) { a.B.spine.rotation.x += amp * (.5 + .5 * Math.sin(t * rate)); a.B.spine.updateWorldMatrix(false, true); }

const cl = staged('mausolee', {
  fqih: { ...CLASS.fqih, lids: .22, talk: .4 },
  mohammed: { ...CLASS.mohammed, lids: .35, mutter: t => win(1, 0, 1, t), lookMax: .28,   /* stills15: .6 bowed the head to a bare skull; the eyes go down, the face stays readable */ look: (t, st) => st.slate },
}, {
  act(lt, t, S, st, S3) {
    const { fqih: fq, mohammed: mo } = st.A;
    // b016 the kind master: head tilted, a slow nod, shoulders easy (no heat slump here)
    const kind = win(0, 0, 1, t);
    fq.B.head.rotation.z += .1 * kind; fq.B.neck.rotation.x += (.06 + .05 * Math.sin(t * 1.4)) * kind; fq.B.chest.rotation.x -= .03 * kind;
    // b017 reciting from the slate, rocking; the rock quickens a little as the lines multiply
    rock(mo, t, .09 + .03 * win(1, .45, 1, t), 3.2 + .8 * win(1, .45, 1, t));
    st.lh ||= S3.prop(PR.louha({ col: 0xc9a46a }), 0, 0, 0);
    st.slate = lapLouha(mo, st.lh);
  },
});

const ch = staged('chambre_jour', {
  father: { ...LUNCH.father, height: 1.76, look: t => t < B(5)[0] ? 'zoubida' : 'mohammed', lookMax: .85 },
  zoubida: { ...LUNCH.zoubida, look: 'father' },
  mohammed: { ...LUNCH.mohammed, look: t => t < B(5)[0] - .2 ? 'father' : null },
}, {
  addressee: { father: 'zoubida' },
  act(lt, t, S, st) {
    const { father: fa, zoubida: zo, mohammed: mo } = st.A, kf = k(fa), km = k(mo);
    // b018–b019 pride: the chest swells, the chin lifts, the trunk sits up tall
    const proud = Math.max(win(2, .1, 1, t), win(3, 0, 1, t));
    fa.B.spine.rotation.x -= .1 * proud; fa.B.chest.rotation.x -= .12 * proud; fa.B.neck.rotation.x -= .08 * proud;
    // Zoubida, listening: a small proud smile-nod on "savant"
    zo.B.spine.rotation.z += .025 * win(2, 0, 1, t) * Math.sin(t * 1.8);
    zo.B.chest.rotation.x -= .035 * win(2, .15, 1, t);
    zo.B.neck.rotation.x += .07 * Math.max(win(2, .25, .9, t), win(3, .35, .7, t)) * Math.max(0, Math.sin((t - B(3)[0]) * 4));
    // b021 Mohammed: leans back from the idea and shakes his head, slow and firm (three swings, the last smaller)
    const no = win(5, 0, 1, t), u = Math.max(0, t - B(5)[0]);
    mo.B.spine.rotation.x -= .08 * no; mo.B.head.rotation.y += .32 * no * Math.sin(u * 5.2) * Math.exp(-u * .35); mo.B.neck.rotation.x += .06 * no;
    for (const a of [fa, zo, mo]) { a.B.spine.updateWorldMatrix(false, true); plant(a); }
    for (const a of [fa, zo, mo]) for (const s of ['L', 'R']) lapRest(a, s, t);
    // "il deviendra un savant": the right palm opens up and out toward her, held, then drops back to the knee
    const offer = win(3, .3, .9, t);
    if (offer > 0) {
      reachSafe(fa, 'R', front(fa, 'chest', .28 * kf, .18 * kf, .02 * kf).lerp(front(fa, 'root', .2 * kf, .16 * kf, .05 * kf), 1 - offer), { grip: .05, pole: [-.4, -.15, .12] });
      PO.palmTo(fa, 'R', offer); PO.fingers(fa, 'R', .05, { thumb: .05, spread: .15 });
    }
  },
});

export default beatScene(ID, {
  shots: { cl, ch },
  plan: {
    b016: { shot: 'cl', size: 'CU', on: 'fqih', z: 2.6 },
    b017: { shot: 'cl', size: 'M', on: 'mohammed', z: 2.3 },
    b018: { shot: 'ch', size: 'M', on: 'father', z: 1.6, dx: 170, dy: -25 },
    b019: { shot: 'ch', size: 'CU', on: 'father', z: 2.7 },
    b021: { shot: 'ch', size: 'CU', on: 'mohammed', z: 1.8, dy: -60 },
  },
});
