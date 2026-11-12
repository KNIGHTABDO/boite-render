// s05 "mémoire". b016 the cool mausoleum class (mausolee): CU on the fqih, for once a kind face (soft lids, head tilted,
// a slow nod). b017 M on Mohammed reciting from the slate on his lap, rocking (insert: ten lines → fifteen, cut on "dix").
// b018 the bedroom (chambre_jour, the s07 lunch places): the father, chest out, tells his wife what the teacher said.
// b019 CU on the father quoting, chin up, an open palm offered on "savant". b020 painting p05_savant. b021 CU Mohammed: a slow,
// firm head shake, leaning back from the idea.
import * as THREE from 'three';
import * as PO from '../../../engine/poses.js';
import * as PR from '../../../engine/props3d.js';
import { hideHem, holdBoard, lapRest, plantKneel, reachSafe, staged, syncSeat } from '../lib/fix8a.js';
import { LUNCH } from '../lib/lunch.js';
import { still, loadStill } from '../lib/stage.js';
import { beatScene, lines, sm, front, at, V, dirW } from '../lib/beatscene.js';

const ID = 's05_memoire', L = lines(ID), B = i => L[i] || [0, 0];
const k = a => a.group.scale.y / 1.6;
const win = (i, a, b, t) => { const [t0, t1] = B(i), D = t1 - t0; return sm(t0 + a * D - .3, t0 + a * D + .3, t) * (1 - sm(t0 + b * D, t0 + b * D + .5, t)); };

// the class layout in the cool room, shared with s06: the fqih cross-legged against the back wall, Mohammed in front of him
// toward the lens, 3/4 to camera (his face reads), his slate up on his lap
export const CLASS = {
  fqih: { at: [1150, 830], face: [1000, 1080], pose: 'cross', seed: 9, height: 1.74 },
  mohammed: { at: [840, 965], face: 'cam', yaw: .22, pose: 'cross', seed: 3, hands: false },
};
/** the slate flat on the crossed shins, a hand on each side edge (clear of the thighs) */
export function lapLouha(a, lh, off = null) {   // off: optional {f,x,y} slate bob in metres (s06 recitation)
  const kk = k(a);
  const sc = Math.min(1.15, Math.max(.95, kk * 1.5));   // r16: bigger so it reads as a board
  holdBoard(a, lh, front(a, 'root', .36 * kk + (off ? off.f * kk : 0), off ? off.x * kk : 0, .13 * kk + (off ? off.y * kk : 0)), -1.05 + (off && off.tilt || 0), sc);   // G1: raised and tipped toward the lens, it was hidden behind the hem puddle
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
  a.B.spine.rotation.z += .018 * Math.sin(t * .5 + seed * 1.4);
  a.B.chest.rotation.x += .05 * br;
  a.B.chest.rotation.z += .035 * Math.sin(t * .8 + seed);
  a.B.spine.updateWorldMatrix(false, true);
}

const cl = staged('mausolee', {
  fqih: { ...CLASS.fqih, lids: .34, talk: .4 },
  mohammed: { ...CLASS.mohammed, lids: .35, mutter: t => win(1, 0, 1, t), lookMax: .28,
    look: (t, st, S3) => { hideHem(S3, st.A.mohammed, st); if (st.hem) st.hem.visible = false; return st.slate; } },
}, {
  act(lt, t, S, st, S3) {
    const { fqih: fq, mohammed: mo } = st.A;
    life(fq, t, 2); life(mo, t, 5);
    // b016 the kind master, including the pre-roll: head tilted, a slow nod, shoulders uneven, a forward lean
    const kind = t < B(1)[0] ? 1 : 0;
    fq.B.head.rotation.z += (.17 + .035 * Math.sin(t * .7)) * kind;
    fq.B.neck.rotation.z += (.1 + .02 * Math.sin(t * .55)) * kind;   // r18: clear lateral roll (~15 deg total) that survives the gaze pass
    fq.B.chest.rotation.z += (.07 + .02 * Math.sin(t * .6)) * kind;   // shoulder drop, one side lower
    fq.B.upperArmR.rotation.z -= .05 * kind;
    fq.B.neck.rotation.x += .03 * Math.sin(t * .9 + 1) * kind;
    fq.B.neck.rotation.x += (.12 + .06 * Math.sin(t * 1.3)) * kind;
    fq.B.chest.rotation.x += .07 * kind;
    fq.B.upperArmL.rotation.z += .1 * kind;
    fq.B.upperArmR.rotation.z -= .16 * kind;
    fq.B.foreArmR.rotation.x += .12 * Math.sin(t * 1.1) * Math.max(kind, .35);
    fq.B.spine.updateWorldMatrix(false, true);
    // b017 reciting from the slate, rocking; the rock quickens a little as the lines multiply
    rock(mo, t, .09 + .03 * win(1, .45, 1, t), 3.2 + .8 * win(1, .45, 1, t));
    if (!st.lh) {
      st.lh = S3.prop(PR.louha({ col: 0xc99a58 }), 0, 0, 0);   // r17: pale wood board with dark lines of writing so it reads as a slate
      // r18: fine calligraphy-like strokes, several thin broken lines per row instead of solid bars
      const ink = PR.toon(0x2a1a10);
      for (let row = 0; row < 7; row++) {
        let x = .105;
        for (let j = 0; x > -.1; j++) {
          const w = .018 + .014 * ((row * 5 + j * 3) % 4) / 3, g = .006 + .004 * ((row + j) % 3);
          const st1 = new THREE.Mesh(new THREE.BoxGeometry(w, .0028, .003), ink);
          st1.position.set(x - w / 2, .075 + row * .036 + .004 * Math.sin(j * 1.7 + row), .0095); st1.rotation.z = .12 * Math.sin(j + row * 2);
          st.lh.add(st1); x -= w + g;
        }
      }
    }
    st.slate = lapLouha(mo, st.lh);
  },
});

const ch = staged('chambre_jour', {
  father: { ...LUNCH.father, height: 1.76, o: { ...LUNCH.father.o, skipFit: true },
    lookMax: t => t >= B(3)[0] && t < B(4)[0] ? 1.1 : .75,
    look: (t, st) => {
      // gaze and the robe lift run after act(); this is the last pose pass the gate samples
      if (st) for (const a of Object.values(st.A)) if (a.actMark?.pose === 'kneel') syncSeat(a);
      if (t >= B(3)[0] && t < B(4)[0] && st?.A) return st.A.zoubida.B.head.getWorldPosition(V()).add(V(0, .4, 0));
      return t < B(5)[0] ? 'zoubida' : 'mohammed';
    } },
  // floor in front of the right divan, deep enough that she is not between the lens and the boy
  zoubida: { ...LUNCH.zoubida, at: [1300, 925], face: [800, 940], o: { ...LUNCH.zoubida.o, skipFit: true },
    look: (t, st) => st?.A ? st.A.father.B.head.getWorldPosition(V()).add(V(0, .03, 0)) : 'father', lookMax: 1.2 },   // G1: she looked at the floor
  // foreground, left of centre, 3/4 to the lens — the wide shot can leave him out, the CU finds his face
  // r19: x 920→965 so the plate's lamp table is clear of his head and the same place holds for b018, b019 and b021
  mohammed: { ...LUNCH.mohammed, at: [965, 965], face: 'cam', yaw: .45, lookMax: t => t >= B(5)[0] - .2 ? 1.15 : 1.25, o: { ...LUNCH.mohammed.o, skipFit: true },
    look: (t, st, S3) => t >= B(5)[0] - .2 ? (st?.A && S3?.cam ? st.A.father.B.head.getWorldPosition(V()).lerp(S3.cam.position, .15).add(V(1, 0, 0).applyQuaternion(S3.cam.quaternion).multiplyScalar(1.3 * Math.sin(Math.max(0, t - B(5)[0]) * 5.2) * sm(B(5)[0] - .2, B(5)[0] + .2, t))) : 'father') : st?.A ? st.A.father.B.head.getWorldPosition(V()).add(V(0, .03, 0)) : 'father' },   // r18: eyes up to the father's face; on b021 the gaze goes to the lens so his face reads   // G1: eyes on his face, not the ceiling above the turban
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
    mo.B.spine.rotation.x -= .36 * no; mo.B.chest.rotation.x -= .2 * no;
    mo.B.head.rotation.y += .045 * Math.sin(t * .8 + 2) * (1 - no); mo.B.neck.rotation.x -= .04 * (.5 + .5 * Math.sin(t * .6)) * (1 - no);   // r18: idle so a held beat is not frozen
    mo.B.spine.rotation.z += .03 * Math.sin(t * .45 + 1);   // weight shift
    mo.B.head.rotation.y += .4 * no * Math.sin(u * 5.2);
    fa.group.visible = zo.group.visible = !no;   // R23B: no cropped father/mother wedges in the b021 CU corners
    mo.B.neck.rotation.x += .05 * no;
    mo.group.rotation.y -= .8 * sm(B(5)[0] - .5, B(5)[0] - .1, t);   // r20: turn from the father to 3/4 front so the face reads in the b021 CU
    mo.group.updateMatrixWorld(true);
    mo.B.spine.updateWorldMatrix(false, true);
    const quote = t >= B(3)[0] && t < B(4)[0] ? sm(B(3)[0], B(3)[0] + .35, t) : 0;
    const tell = win(2, .08, 1, t) * (1 - quote);
    if (quote > .05) {
      // R23B b019: chin rises with pride, nod/tilt, the hand opens palm-up toward screen right and rises between the two lines
      const q = Math.min(1, Math.max(0, (t - B(3)[0]) / Math.max(.1, B(3)[1] - B(3)[0])));
      fa.B.neck.rotation.x -= (.1 + .22 * q) * quote; fa.B.head.rotation.x -= .1 * q * quote;
      fa.B.head.rotation.z += (.1 * Math.sin(q * 6.3) + .07) * quote; fa.B.neck.rotation.y += .12 * Math.sin(q * 5) * quote;
      fa.B.spine.updateWorldMatrix(false, true);
      reachSafe(fa, 'R', front(fa, 'chest', (.36 + .12 * q) * kf, (.12 + .2 * q) * kf, (-.08 + .3 * q) * kf), { grip: .04, pole: [-.5, -.02, .3] });
      PO.palmTo(fa, 'R', quote, dirW(fa, .5 * q, .2 + 1.1 * q, .6));
      PO.fingers(fa, 'R', .02, { thumb: .04, spread: .45 });
      reachSafe(fa, 'L', front(fa, 'chest', .26 * kf, -.24 * kf, -.24 * kf), { grip: .04, pole: [.4, -.4, .2] });   // G1: off the beard, down by the thigh
      PO.fingers(fa, 'L', .04, { spread: .3 });
    } else if (tell > .05) {
      for (const s of ['L', 'R']) {
        const right = s === 'R' ? 1 : -1, bob = .035 * Math.sin(t * 1.5 + right);
        reachSafe(fa, s, front(fa, 'chest', .34 * kf, right * .22 * kf, (-.1 + bob) * kf), { grip: .04, pole: [-right * .45, -.1, .22] });
        PO.palmTo(fa, s, .75 * tell, dirW(fa, 0, .3, 1));
        PO.fingers(fa, s, .02, { thumb: .03, spread: .4 });
      }
    } else lapRest(fa, 'L', t), lapRest(fa, 'R', t);
    for (const s of ['L', 'R']) {
      lapRest(zo, s, t + 1.2);
      // r18: Mohammed standing: forearms bent, hands loosely together in front of the belt (no hanging mannequin arms)
      const km = k(mo), sg = s === 'R' ? 1 : -1;
      reachSafe(mo, s, front(mo, 'chest', .24 * km, sg * .055 * km, (-.33 + .012 * Math.sin(t * 1.1 + sg)) * km), { grip: .03, pole: [-sg * .5, -.2, .3] });
      PO.fingers(mo, s, .15, { thumb: .1, spread: .1 });
    }
    for (const a of [fa, zo, mo]) syncSeat(a);
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

const p05 = { async load() { await loadStill('p05_savant'); }, fn(lt, u) { still('p05_savant', u, [.5, .46, 1, .5, .46, 1.03]); return { vignette: .5, paper: .2 }; } };
const scene = beatScene(ID, {
  shots: { cl, ch, p05 },
  plan: {
    // hand-set z only where the automatic crop is the wrong size; a CU stays tight enough that a second bust cannot sit in frame
    b016: { shot: 'cl', size: 'CU', on: 'fqih', z: 4.2, dx: 70 },
    b017: { shot: 'cl', size: 'M', on: 'mohammed', z: 2.3, dx: -230, dy: 25 },   // r19: fqih fully in (head 3% clear of the top), Mohammed full head + lap,
    b018: { shot: 'ch', size: 'M', on: 'father', z: 1.38, dx: 240, dy: -30 },
    b019: { shot: 'ch', size: 'CU', on: 'father', z: 3.7, dx: -70, dy: -25 },   // r19: head+shoulders, Mohammed's head fully out right,
    b021: { shot: 'ch', size: 'CU', on: 'mohammed', z: 3.9, dx: -33, dy: -15 },   // r19: father (left) and the mother (right) both fully out,
    b020: { shot: 'p05' },
  },
});
const draw = scene.draw;
scene.draw = (t, S) => {
  const fin = draw(t, S);
  const [a, b] = B(1);
  scene.noExam = t >= a - .2 && t < b + 1;
  return fin;
};
export default scene;
