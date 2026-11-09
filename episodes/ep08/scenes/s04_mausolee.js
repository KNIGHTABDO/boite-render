// s04 "Le mausolée". b010 the cramped Msid in the heat (ep03/msid_estrade): boys fan themselves with their slates, the fqih
// wipes his brow. b011 the procession: the fqih then the boys come in through the sanctuary door (mausolee_rev), slates held
// to their chests. b012 memory (warm grade, mausolee): young women circle the railed tomb seven times, counting on their
// fingers; the far half of the lap is hidden behind the tomb. b013 the cool room: Mohammed alone, eyes closed, a deep breath.
// b014 (mausolee_rev) the fqih's finger to his lips — silence — the boys wash their hands at the little fountain (left).
// b015 (mausolee) prayer rows, backs to the lens behind the master: qiyam, ruku (the fqih leads, the boys follow), qiyam.
import * as PO from '../../../engine/poses.js';
import * as PR from '../../../engine/props3d.js';
import * as IK from '../../../engine/ik.js';
import { walkPose } from '../../../engine/rig3d.js';
import { staged } from '../lib/autostage.js';
import { beatScene, lines, sm, front, V, dirW } from '../lib/beatscene.js';
import { plate, drawPlate } from '../../../engine/plates.js';
import { c } from '../../../engine/core.js';
import { platePath } from './_3d.js';

const ID = 's04_mausolee', L = lines(ID);
const B = i => L[i] || [0, 0];
const win = (i, a, b, t) => { const [t0, t1] = B(i), D = t1 - t0; return sm(t0 + a * D, t0 + a * D + .5, t) * (1 - sm(t0 + b * D, t0 + b * D + .5, t)); };
const k = a => a.group.scale.y / 1.6;
const upd = (a, ...bs) => { for (const b of bs) a.B[b]?.updateWorldMatrix(false, true); };
// seated palms back on the thighs after a slump (autostage only re-pins when act left every arm alone)
const repin = a => { for (const [s, p] of a.pins || []) PO.reach(a, s, a.B.root.localToWorld(p.clone()), { grip: .035, pole: s === 'L' ? [.35, .1, -.2] : [-.35, .1, -.2] }); };

/** a slate held flat against the chest with both hands (walking, standing) */
function chestLouha(a, lh) {
  const kk = k(a); lh.scale.setScalar(Math.min(1, kk * 1.1)); lh.position.copy(front(a, 'chest', .13 * kk, 0, -.36 * kk));
  lh.rotation.order = 'YXZ'; lh.rotation.set(-.12, a.group.rotation.y, 0); lh.updateMatrixWorld(true);
  PO.reach(a, 'L', lh.localToWorld(V(.135, .22, 0)), { grip: .04 }); PO.reach(a, 'R', lh.localToWorld(V(-.135, .22, 0)), { grip: .04 });
}
/** fanning the face with the slate: gripped at its bottom edge at chin height, flapping about the wrist */
function fanLouha(a, lh, t, ph = 0, rate = 6.5, amp = .55) {
  const kk = k(a), g = front(a, 'head', .26 * kk, .1 * kk, -.2 * kk); lh.scale.setScalar(Math.min(1, kk * 1.1));
  lh.position.copy(g); lh.rotation.order = 'YXZ'; lh.rotation.set(-.25, a.group.rotation.y - .6 + amp * Math.sin(t * rate + ph), 0); lh.updateMatrixWorld(true);
  PO.reach(a, 'R', lh.localToWorld(V(0, .03, 0)), { grip: .06, pole: [-.3, -.4, -.1] });
}

// ---------------------------------------------------------------- b010 the Msid in the heat
const ms = staged('ep03/msid_estrade', {
  fqih: { at: [1000, 800], face: 'cam', pose: 'cross', seed: 9, lids: .35 },
  kid1: { at: [560, 930], face: [1000, 1080], pose: 'cross', seed: 2, look: 'fqih', lids: .3 },
  kid2: { at: [1420, 940], face: [1000, 1080], pose: 'cross', seed: 4, lids: .25 },
  mohammed: { at: [760, 995], face: [1100, 1080], pose: 'cross', seed: 3, look: 'fqih', lids: .45 },
}, {
  act(lt, t, S, st, S3) {
    const { fqih: fq, kid1, kid2, mohammed: mo } = st.A, kf = k(fq);
    // heavy heat: everybody slumps a little; the fqih's head lolls
    for (const a of [fq, kid1, kid2, mo]) { a.B.spine.rotation.x += .1; a.B.chest.rotation.x += .06; upd(a, 'spine'); repin(a); }
    st.lh ||= [kid1, kid2, mo].map(() => S3.prop(PR.louha({ col: 0x9a6a38 }), 0, 0, 0));
    fanLouha(kid1, st.lh[0], t, 0, 7); fanLouha(kid2, st.lh[1], t, 1.9, 6); fanLouha(mo, st.lh[2], t, .7, 4.2, .4);   // Mohammed fans slower, wearily
    // the fqih wipes his brow with the back of his fingers, twice, sweeping across the forehead
    const w = Math.max(win(0, .05, .4, t), win(0, .55, .9, t));
    if (w > 0) {
      const s = Math.sin(t * 3.2);
      PO.reach(fq, 'R', front(fq, 'head', .14 * kf, .07 * kf * s, .2 * kf).lerp(front(fq, 'root', .25 * kf, .15 * kf, .05 * kf), 1 - w), { grip: .15, pole: [-.3, -.5, -.1] });
      fq.B.neck.rotation.x -= .12 * w; upd(fq, 'neck');
    }
  },
});

// ---------------------------------------------------------------- b011 the procession through the sanctuary door
const DOOR = [960, 712];
const T11 = (j, d = 4.4) => ({ t0: B(1)[0] - .7 + 1.0 * j, t1: B(1)[0] - .7 + 1.0 * j + d });
const pr = staged('mausolee_rev', {
  fqih: { at: DOOR, face: 'cam', seed: 9, walk: { to: [720, 800], ...T11(0, 3.6) } },
  kid1: { at: DOOR, face: 'cam', seed: 2, walk: { to: [870, 850], ...T11(1, 3.4) } },
  mohammed: { at: DOOR, face: 'cam', seed: 3, walk: { to: [1050, 865], ...T11(2, 3.4) }, look: (t, st) => t > T11(2).t0 + 1 ? [1500, 760, 1.6] : null, lookMax: .9 },   // he looks up at the green dome lamps
  kid3: { at: DOOR, face: 'cam', seed: 6, walk: { to: [1210, 835], ...T11(3, 3.4) } },
}, {
  act(lt, t, S, st, S3) {
    const { fqih: fq, kid1, mohammed: mo, kid3 } = st.A;
    // nobody stands in the doorway before his turn: each one steps in over the threshold on his own t0
    [[fq, 0], [kid1, 1], [mo, 2], [kid3, 3]].forEach(([a, j]) => { a.group.visible = t >= T11(j).t0 - .05; });
    st.lh ||= [kid1, mo, kid3].map(() => S3.prop(PR.louha({ col: 0x9a6a38 }), 0, 0, 0));
    [kid1, mo, kid3].forEach((a, i) => { st.lh[i].visible = a.group.visible; chestLouha(a, st.lh[i]); });
  },
});

// ---------------------------------------------------------------- b012 memory: seven turns around the tomb
// stills13 (by eye): the painted tomb hides nothing, so a full ellipse drew the women over the railing. They now walk the
// visible half of the lap: in from behind the right door leaf, deep along the room to the railing's far corner, down along the
// railing's front, out behind the left leaf; the plate's two door leaves are redrawn over the actors (nearest objects).
const WARM = { grade: 'rgb(255,212,150)', gradeOp: 'multiply', vignette: .75 };
const GIRLS = [['woman1', 0], ['woman2', 2.3], ['fatma', 4.6]];   // spacing along the path (m)
const LAP = [[1990, 1000], [1450, 850], [960, 775], [700, 770], [520, 860], [300, 975], [-90, 1070]];
let PLATE; plate(platePath('mausolee')).then(i => { PLATE = i; });
const leaves = () => { if (!PLATE) return; for (const [x0, x1] of [[0, 128], [1812, 1920]]) { c.save(); c.beginPath(); c.rect(x0, 0, x1 - x0, 1080); c.clip(); drawPlate(PLATE); c.restore(); } };
const fl = staged('mausolee', Object.fromEntries(GIRLS.map(([n], i) => [n, { at: [1500, 900], face: 'cam', seed: 11 + i * 2, talk: 0, mutter: () => .6 }])), {
  fx: WARM, over: leaves,
  act(lt, t, S, st, S3) {
    if (!st.lap) {   // the path as a dense polyline on the floor, with its arc length
      const P = LAP.map(q => S3.floorAt(...q)), pts = [];
      for (let i = 0; i < P.length - 1; i++) for (let j = 0; j < 12; j++) {   // Catmull-Rom between P[i] and P[i+1]
        const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)], u = j / 12, u2 = u * u, u3 = u2 * u;
        pts.push(V(0, 0, 0).addScaledVector(p0, -.5 * u3 + u2 - .5 * u).addScaledVector(p1, 1.5 * u3 - 2.5 * u2 + 1).addScaledVector(p2, -1.5 * u3 + 2 * u2 + .5 * u).addScaledVector(p3, .5 * u3 - .5 * u2));
      }
      pts.push(P.at(-1)); const len = [0]; for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + pts[i].distanceTo(pts[i - 1]));
      st.lap = { pts, len, L: len.at(-1) };
    }
    const { pts, len, L: LL } = st.lap, v = .72, period = LL + 2.5;   // slow ritual pace; 2.5 m of the lap are behind the tomb
    for (const [n, off] of GIRLS) {
      const a = st.A[n], d = (v * t + period - off) % period;
      a.group.visible = d < LL; if (!a.group.visible) continue;
      let i = 1; while (i < len.length - 1 && len[i] < d) i++;
      const u = (d - len[i - 1]) / (len[i] - len[i - 1] || 1), p = pts[i - 1].clone().lerp(pts[i], u), dir = pts[i].clone().sub(pts[i - 1]);
      a.group.position.set(p.x, 0, p.z); a.group.rotation.y = Math.atan2(dir.x, dir.z);
      walkPose(a.B, d / 1.05, 1, { stride: .32, arms: .2 }); a.group.updateMatrixWorld(true);
      // counting the turns on the fingers of the right hand held before her chest; head a little bowed, lips moving
      const ka = k(a), cnt = (Math.floor((v * t - off) / period + 10) % 5) / 4;
      a.B.neck.rotation.x += .14; upd(a, 'neck');
      PO.reach(a, 'R', front(a, 'chest', .24 * ka, .06 * ka, -.06 * ka), { grip: .1, pole: [-.3, -.5, -.1] });
      PO.fingers(a, 'R', .95, { thumb: .5, each: [1, cnt > .1 ? 0 : 1, cnt > .35 ? 0 : 1, cnt > .6 ? 0 : 1, cnt > .85 ? 0 : 1] });
    }
  },
});

// ---------------------------------------------------------------- b013 the coolness: eyes closed, one deep breath
const br = staged('mausolee', {
  mohammed: { at: [1080, 900], face: 'cam', yaw: -.25, seed: 3, lids: t => sm(B(3)[0] - .2, B(3)[0] + .6, t), lookMax: .9,
    look: (t, st) => front(st.A.mohammed, 'head', 1, 0, .55) },   // chin lifted to the dome
}, {
  act(lt, t, S, st) {
    const mo = st.A.mohammed, km = k(mo), b = sm(B(3)[0], B(3)[0] + 1.6, t) * (1 - sm(B(3)[1] - .4, B(3)[1] + .8, t));
    mo.B.chest.rotation.x -= .14 * b; mo.B.spine.rotation.x -= .05 * b; upd(mo, 'spine');   // the chest swells, shoulders open
    // palms turn out a little at his sides, feeling the cool air
    for (const s of ['L', 'R']) PO.reach(mo, s, front(mo, 'root', .12 * km, (s === 'L' ? -.3 : .3) * km, .02 * km).lerp(front(mo, 'root', .02 * km, (s === 'L' ? -.2 : .2) * km, -.05 * km), 1 - b), { grip: .02 });
  },
});

// ---------------------------------------------------------------- b014 silence, then ablutions at the fountain
const ab = staged('mausolee_rev', {
  fqih: { at: [780, 880], face: 'cam', yaw: -.35, seed: 9, look: t => t < B(4)[0] + .45 * (B(4)[1] - B(4)[0]) ? 'mohammed' : 'kid2' },
  kid2: { at: [380, 805], face: [235, 765], seed: 4, look: t => t < B(4)[0] + 2.2 ? 'fqih' : [250, 770, .6] },
  mohammed: { at: [500, 860], face: [250, 790], seed: 3, look: t => t < B(4)[0] + 2.5 ? 'fqih' : [250, 780, .6], lookMax: .9 },
}, {
  act(lt, t, S, st) {
    const { fqih: fq, kid2, mohammed: mo } = st.A, kf = k(fq);
    // the finger to the lips (index straight, other fingers curled), held, then lowered
    const sh = win(4, 0, .3, t);
    if (sh > 0) {
      PO.reach(fq, 'R', front(fq, 'head', .17 * kf, .0, .1 * kf).lerp(front(fq, 'root', .2 * kf, .16 * kf, 0), 1 - sh), { grip: .1, pole: [-.3, -.6, -.1] });
      PO.fingers(fq, 'R', .95 * sh, { thumb: .6 * sh, each: [1, 0, 1, 1, 1] });
    }
    // washing: bent over the basin, hands rubbing each other in small opposite circles
    const wash = (a, d, ph) => {
      const ka = k(a), u = sm(B(4)[0] + d, B(4)[0] + d + .8, t);
      if (u <= 0) return;
      a.B.spine.rotation.x += .32 * u; a.B.chest.rotation.x += .12 * u; upd(a, 'spine');
      for (const [s, q] of [['L', 0], ['R', Math.PI]]) {
        const c = Math.cos(t * 5 + ph + q) * .03, e = Math.sin(t * 5 + ph + q) * .02;
        PO.reach(a, s, front(a, 'chest', (.34 + c) * ka, (s === 'L' ? -.035 : .035) * ka, (-.22 + e) * ka).lerp(front(a, 'root', .1 * ka, (s === 'L' ? -.2 : .2) * ka, 0), 1 - u), { grip: .12 });
      }
    };
    wash(kid2, 2.2, 0); wash(mo, 3.2, 1.3);
  },
});

// ---------------------------------------------------------------- b015 prayer rows behind the master
const ROW = [['kid1', 880, 2], ['kid2', 1040, 4], ['mohammed', 1200, 3], ['kid3', 1360, 6]];
const pray = staged('mausolee', {
  fqih: { at: [1120, 765], face: [1120, 560], seed: 9, talk: 0 },
  ...Object.fromEntries(ROW.map(([n, x, seed]) => [n, { at: [x, 880], face: [x, 560], seed, talk: 0 }])),
}, {
  act(lt, t, S, st) {
    const [t0, t1] = B(5), D = t1 - t0;
    const ruku = (lag) => sm(t0 + .22 * D + lag, t0 + .22 * D + lag + .9, t) * (1 - sm(t0 + .58 * D + lag, t0 + .58 * D + lag + .9, t));
    const all = [['fqih', 0], ...ROW.map(([n], i) => [n, .25 + .08 * i])];
    for (const [n, lag] of all) {
      const a = st.A[n], ka = k(a), r = ruku(lag);
      // bow from the hips with a flat back (≈ 80°), the head in line with the spine
      a.B.spine.rotation.x += .78 * r; a.B.chest.rotation.x += .42 * r; a.B.neck.rotation.x += .12 * r; upd(a, 'spine');
      for (const s of ['L', 'R']) {   // qiyam: right hand over left on the chest → ruku: palms on the knees
        const kn = IK.wpos(a.B['shin' + s]).addScaledVector(dirW(a, 0, 0, 1), .05 * ka).add(V(0, .04 * ka, 0));
        const fold = front(a, 'chest', .14 * ka, (s === 'L' ? -.02 : .03) * ka, (s === 'L' ? -.16 : -.13) * ka);
        PO.reach(a, s, fold.lerp(kn, r), { grip: .05 });
      }
    }
  },
});

export default beatScene(ID, {
  shots: { ms, pr, fl, br, ab, pray },
  plan: {
    b010: { shot: 'ms', size: 'W', on: 'fqih', cover: [{ f: .5, size: 'M', on: 'fqih', z: 2.2 }] },
    b011: { shot: 'pr', size: 'W', on: 'mohammed' },   // walkers: covers frame build positions → wide only
    b012: { shot: 'fl', size: 'W', on: 'woman1' },
    b013: { shot: 'br', size: 'W', on: 'mohammed', cover: [{ f: .35, size: 'M', on: 'mohammed', z: 2.4 }] },
    b014: { shot: 'ab', size: 'M', on: 'fqih', z: 2.2, cover: [{ f: .38, size: 'W', on: 'mohammed' }] },
    b015: { shot: 'pray', size: 'W', on: 'mohammed' },
  },
});
