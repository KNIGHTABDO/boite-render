// s05 "mémoire". b016 the cool mausoleum class (mausolee): CU on the fqih, for once a kind face (soft lids, head tilted,
// a slow nod). b017 M on Mohammed reciting from the slate on his lap, rocking (insert: ten lines → fifteen, cut on "dix").
// b018 the bedroom (chambre_jour, the s07 lunch places): the father, chest out, tells his wife what the teacher said.
// b019 CU on the father quoting, chin up, an open palm offered on "savant". b020 painting p05_savant. b021 CU Mohammed: a slow,
// firm head shake, leaning back from the idea.
import * as PO from '../../../engine/poses.js';
import * as PR from '../../../engine/props3d.js';
import { hideHem, holdBoard, lapRest, plantKneel, reachSafe, staged } from '../lib/fix8a.js';
import { LUNCH } from '../lib/lunch.js';
import { beatScene, lines, sm, front, at, V, dirW } from '../lib/beatscene.js';

const ID = 's05_memoire', L = lines(ID), B = i => L[i] || [0, 0];
const k = a => a.group.scale.y / 1.6;
const win = (i, a, b, t) => { const [t0, t1] = B(i), D = t1 - t0; return sm(t0 + a * D - .3, t0 + a * D + .3, t) * (1 - sm(t0 + b * D, t0 + b * D + .5, t)); };

// the class layout in the cool room, shared with s06: the fqih cross-legged against the back wall, Mohammed in front of him
// toward the lens, 3/4 to camera (his face reads), his slate up on his lap
export const CLASS = {
  fqih: { at: [1150, 780], face: [1000, 1080], pose: 'cross', seed: 9, height: 1.74 },
  mohammed: { at: [840, 890], face: 'cam', yaw: .22, pose: 'cross', seed: 3, hands: false },
};
/** the slate flat on the crossed shins, a hand on each side edge (clear of the thighs) */
export function lapLouha(a, lh) {
  const kk = k(a);
  const sc = Math.min(.78, Math.max(.58, kk * 1.05));
  holdBoard(a, lh, front(a, 'root', .22 * kk, 0, .06 * kk), -1.2, sc);
  reachSafe(a, 'L', lh.localToWorld(V(.125, .14, .02)), { grip: .02, pole: [.42, -.05, .28] });
  reachSafe(a, 'R', lh.localToWorld(V(-.125, .14, .02)), { grip: .02, pole: [-.42, -.05, .28] });
  PO.fingers(a, 'L', .32, { thumb: .35, spread: .15 });
  PO.fingers(a, 'R', .32, { thumb: .35, spread: .15 });
  return lh.localToWorld(V(0, .3, .02));
}
/** Msid recitation: the trunk rocks forward and back from the hips (rate = rocks per second · 2π) */
export function rock(a, t, amp = .1, rate = 3.4) { a.B.spine.rotation.x += amp * (.5 + .5 * Math.sin(t * rate)); a.B.spine.updateWorldMatrix(false, true); }

function life(a, t, seed = 0) {
  const br = Math.sin(t * 1.55 + seed);
  a.B.spine.rotation.x += .03 * Math.sin(t * .65 + seed);
  a.B.spine.rotation.z += .055 * Math.sin(t * .5 + seed * 1.4);
  a.B.chest.rotation.x += .05 * br;
  a.B.chest.rotation.z += .035 * Math.sin(t * .8 + seed);
  a.B.spine.updateWorldMatrix(false, true);
}

const cl = staged('mausolee', {
  fqih: { ...CLASS.fqih, lids: .22, talk: .4 },
  mohammed: { ...CLASS.mohammed, lids: .35, mutter: t => win(1, 0, 1, t), lookMax: .28,
    look: (t, st, S3) => { hideHem(S3, st.A.mohammed, st); return st.slate; } },
}, {
  act(lt, t, S, st, S3) {
    const { fqih: fq, mohammed: mo } = st.A;
    life(fq, t, 2); life(mo, t, 5);
    // b016 the kind master, including the pre-roll: head tilted, a slow nod, shoulders uneven, a forward lean
    const kind = t < B(1)[0] ? 1 : 0;
    fq.B.head.rotation.z += (.1 + .035 * Math.sin(t * .7)) * kind;
    fq.B.neck.rotation.x += (.08 + .05 * Math.sin(t * 1.3)) * kind;
    fq.B.chest.rotation.x += .07 * kind;
    fq.B.upperArmL.rotation.z += .1 * kind;
    fq.B.upperArmR.rotation.z -= .16 * kind;
    fq.B.foreArmR.rotation.x += .12 * Math.sin(t * 1.1) * Math.max(kind, .35);
    fq.B.spine.updateWorldMatrix(false, true);
    // b017 reciting from the slate, rocking; the rock quickens a little as the lines multiply
    rock(mo, t, .09 + .03 * win(1, .45, 1, t), 3.2 + .8 * win(1, .45, 1, t));
    st.lh ||= S3.prop(PR.louha({ col: 0xc9a46a }), 0, 0, 0);
    st.slate = lapLouha(mo, st.lh);
  },
});

const ch = staged('chambre_jour', {
  father: { ...LUNCH.father, height: 1.76, o: { ...LUNCH.father.o, skipFit: true },
    lookMax: t => t >= B(3)[0] && t < B(4)[0] ? 1.1 : .75,
    look: (t, st) => {
      if (t >= B(3)[0] && t < B(4)[0]) return st.A.zoubida.B.head.getWorldPosition(V()).add(V(0, .4, 0));
      return t < B(5)[0] ? 'zoubida' : 'mohammed';
    } },
  // floor in front of the right divan, deep enough that she is not between the lens and the boy
  zoubida: { ...LUNCH.zoubida, at: [1340, 860], face: [800, 940], o: { ...LUNCH.zoubida.o, skipFit: true }, look: 'father' },
  // foreground, left of centre, 3/4 to the lens — the wide shot can leave him out, the CU finds his face
  mohammed: { ...LUNCH.mohammed, at: [820, 1000], face: 'cam', yaw: .48, lookMax: .4, o: { ...LUNCH.mohammed.o, skipFit: true },
    look: (t, st, S3) => t >= B(5)[0] - .2 ? S3.cam.position.clone() : 'father' },
}, {
  addressee: { father: 'zoubida' },
  act(lt, t, S, st) {
    const { father: fa, zoubida: zo, mohammed: mo } = st.A, kf = k(fa);
    life(fa, t, 1); life(zo, t, 4); life(mo, t, 6);
    // b018–b019 pride: the chest swells, the chin is carried by the look (above her head on the quote)
    const proud = Math.max(win(2, .05, 1, t), t >= B(3)[0] && t < B(4)[0] ? 1 : 0);
    fa.B.spine.rotation.x -= .06 * proud; fa.B.chest.rotation.x -= .14 * proud;
    zo.B.neck.rotation.x += .05 * Math.sin(t * 1.3);
    zo.B.head.rotation.z += .045 * Math.sin(t * .85);
    zo.B.spine.updateWorldMatrix(false, true);
    // b021 Mohammed: leans back from the idea and shakes his head, slow and firm
    const no = t >= B(5)[0] - .15 ? 1 : 0, u = Math.max(0, t - B(5)[0]);
    mo.B.spine.rotation.x -= .16 * no; mo.B.chest.rotation.x -= .1 * no;
    mo.B.head.rotation.y += .34 * no * Math.sin(u * 5.2) * Math.exp(-u * .35);
    mo.B.neck.rotation.x += .05 * no;
    mo.B.spine.updateWorldMatrix(false, true);
    const quote = t >= B(3)[0] && t < B(4)[0] ? sm(B(3)[0], B(3)[0] + .35, t) : 0;
    const tell = win(2, .08, 1, t) * (1 - quote);
    if (quote > .05) {
      reachSafe(fa, 'R', front(fa, 'chest', .44 * kf, .26 * kf, .08 * kf), { grip: .04, pole: [-.5, -.02, .3] });
      PO.palmTo(fa, 'R', quote, dirW(fa, -.15, .25, 1));
      PO.fingers(fa, 'R', .02, { thumb: .04, spread: .45 });
      reachSafe(fa, 'L', front(fa, 'chest', .2 * kf, -.2 * kf, 0), { grip: .04, pole: [.4, -.1, .2] });
      PO.fingers(fa, 'L', .12, { spread: .2 });
    } else if (tell > .05) {
      for (const s of ['L', 'R']) {
        const right = s === 'R' ? 1 : -1, bob = .035 * Math.sin(t * 1.5 + right);
        reachSafe(fa, s, front(fa, 'chest', .3 * kf, right * .24 * kf, (.04 + bob) * kf), { grip: .04, pole: [-right * .45, -.1, .22] });
        PO.palmTo(fa, s, .75 * tell, dirW(fa, 0, .3, 1));
        PO.fingers(fa, s, .05, { thumb: .06, spread: .32 });
      }
    } else lapRest(fa, 'L', t), lapRest(fa, 'R', t);
    for (const s of ['L', 'R']) { lapRest(zo, s, t + 1.2); if (no < .5) lapRest(mo, s, t + .4); }
  },
});

const loadCh = ch.load;
ch.load = async () => {
  await loadCh();
  ch.st.actors.forEach((a, i) => { a.group.position.copy(ch.place[i][0]); a.group.rotation.copy(ch.place[i][1]); a.group.updateMatrixWorld(true); });
  for (const [n, opt] of [['father', { lean: .02, hip: .21 }], ['zoubida', { lean: .1, hip: .2, spread: .12 }], ['mohammed', { lean: .08, hip: .2 }]]) {
    const a = ch.st.A[n];
    plantKneel(a, opt);
    ch.st.snaps[n] = PO.snap(a);
  }
  ch.st.actors.forEach((a, i) => {
    ch.place[i][0].copy(a.group.position);
    const h = at(a, 'head'), f = h.clone(); f.y -= .83 * a.group.scale.y;
    ch.heads[i] = ch.S3.project(h); ch.headOff[i] = h.clone().sub(a.group.position);
    ch.bodyPx[i] = ch.S3.project(f)[1] - ch.heads[i][1];
  });
};

const scene = beatScene(ID, {
  shots: { cl, ch },
  plan: {
    // hand-set z only where the automatic crop is the wrong size; a CU stays tight enough that a second bust cannot sit in frame
    b016: { shot: 'cl', size: 'CU', on: 'fqih', z: 4.2, dx: 70 },
    b017: { shot: 'cl', size: 'M', on: 'mohammed', z: 1.85, dy: 55 },
    b018: { shot: 'ch', size: 'M', on: 'father', z: 1.55, dx: 200, dy: -30 },
    b019: { shot: 'ch', size: 'CU', on: 'father', z: 2.7, dy: 8 },
    b021: { shot: 'ch', size: 'CU', on: 'mohammed', z: 3.3, dy: -8 },
  },
});
const draw = scene.draw;
scene.draw = (t, S) => {
  const fin = draw(t, S);
  const [a, b] = B(1);
  scene.noExam = t >= a - .2 && t < b + 1;
  if (process.env.FRAME8 && ch.v) {
    const scr = (sh, p) => { const q = sh.S3.project(p), v = sh.v; return [Math.round((q[0] - v[0]) * v[2] + 960), Math.round((q[1] - v[1]) * v[2] + 540)]; };
    for (const [n, sh] of [['cl', cl], ['ch', ch]]) if (sh.v) console.error('FRAME', t.toFixed(2), n, sh.v.map(x => +x.toFixed(1)).join(','), sh.st.actors.map(ac => ac.name + scr(sh, ac.B.head.getWorldPosition(V())).join(',')).join(' '));
  }
  return fin;
};
export default scene;
