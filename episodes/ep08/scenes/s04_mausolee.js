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
import { beatScene, lines, sm, front, at, V, dirW } from '../lib/beatscene.js';
import { plate, drawPlate } from '../../../engine/plates.js';
import { c } from '../../../engine/core.js';
import { platePath } from './_3d.js';

const ID = 's04_mausolee', L = lines(ID);
const B = i => L[i] || [0, 0];
const k = a => a.group.scale.y / 1.6;
const upd = (a, ...bs) => { for (const b of bs) a.B[b]?.updateWorldMatrix(false, true); };
// seated palms back on the thighs after a slump (autostage only re-pins when act left every arm alone)
const repin = a => { for (const [s, p] of a.pins || []) PO.reach(a, s, a.B.root.localToWorld(p.clone()), { grip: .035, pole: s === 'L' ? [.35, .1, -.2] : [-.35, .1, -.2] }); };

// Standing casts are shared between shots. Apply shot-local sizes for drawing, then restore them; coverage uses
// the same sized head/sole measurements, so a later shot cannot inherit this shot's scale.
function sized(sh, factors) {
  const load = sh.load, draw = sh.fn; let scales;
  sh.load = async () => {
    await load(); if (scales) return;
    scales = sh.st.actors.map(a => a.group.scale.clone().multiplyScalar(factors[a.name] || 1));
    sh.st.actors.forEach((a, i) => {
      const base = a.group.scale.clone(); a.group.scale.copy(scales[i]); a.group.updateMatrixWorld(true);
      const h = at(a, 'head'), f = h.clone(); f.y -= .83 * a.group.scale.y;
      sh.heads[i] = sh.S3.project(h); sh.headOff[i] = h.clone().sub(a.group.position);
      sh.bodyPx[i] = sh.S3.project(f)[1] - sh.heads[i][1];
      a.group.scale.copy(base); a.group.updateMatrixWorld(true);
    });
  };
  sh.fn = (...args) => {
    const before = sh.st.actors.map(a => a.group.scale.clone());
    sh.st.actors.forEach((a, i) => { a.group.scale.copy(scales[i]); a.group.updateMatrixWorld(true); });
    try { return draw(...args); }
    finally { sh.st.actors.forEach((a, i) => { a.group.scale.copy(before[i]); a.group.updateMatrixWorld(true); }); }
  };
  return sh;
}

/** Soft elbows, hands hanging at the actor's own arm length; no below-root IK targets. */
function hangArms(a, t, sides = ['L', 'R']) {
  const ka = k(a);
  for (const s of sides) {
    const shoulder = at(a, 'upperArm' + s), elbow = at(a, 'foreArm' + s), wrist = at(a, 'hand' + s);
    const len = shoulder.distanceTo(elbow) + elbow.distanceTo(wrist);
    const hand = shoulder.clone().add(V(0, -.91 * len, 0))
      .addScaledVector(dirW(a, s === 'L' ? 1 : -1, 0, 0), .045 * ka)
      .addScaledVector(dirW(a, 0, 0, 1), (.04 + .008 * Math.sin(t + (s === 'L' ? 0 : 1))) * ka);
    PO.reach(a, s, hand, { grip: 0, pole: s === 'L' ? [.3, .05, -.25] : [-.3, .05, -.25] });
  }
}

/** a slate held flat against the chest with both hands (walking, standing) */
function chestLouha(a, lh) {
  const kk = k(a); lh.scale.setScalar(Math.min(1, kk * 1.1)); lh.position.copy(front(a, 'chest', .13 * kk, 0, -.36 * kk));
  lh.rotation.order = 'YXZ'; lh.rotation.set(-.12, a.group.rotation.y, 0); lh.updateMatrixWorld(true);
  PO.reach(a, 'L', lh.localToWorld(V(.14, .18, .025)), { grip: .02 }); PO.reach(a, 'R', lh.localToWorld(V(-.14, .18, .025)), { grip: .02 });
}
/** Fan beside the chest: the board's origin is its BOTTOM edge, so its whole arc stays below the chin. */
function fanLouha(a, lh, t, ph = 0, rate = 6.5, amp = .55) {
  const kk = k(a), wave = Math.sin(t * rate + ph), g = front(a, 'chest', .27 * kk, .3 * kk, -.38 * kk);
  lh.scale.setScalar(Math.min(1, kk * 1.1));
  lh.position.copy(g); lh.rotation.order = 'YXZ'; lh.rotation.set(-.4 + .12 * wave, a.group.rotation.y - .45 + amp * wave, -.18); lh.updateMatrixWorld(true);
  PO.reach(a, 'R', lh.localToWorld(V(-.09, .055, .025)), { grip: .015, pole: [-.35, -.2, -.1] });
  PO.fingers(a, 'R', .35, { thumb: .25 });
}

// ---------------------------------------------------------------- b010 the Msid in the heat
const ms = staged('ep03/msid_estrade', {
  fqih: { at: [1000, 795], face: 'cam', pose: 'cross', o: { seat: .34 }, seed: 9, lids: .35, talk: 0 },
  kid1: { at: [500, 925], face: [1000, 1060], pose: 'cross', seed: 2, look: 'fqih', lids: .3 },
  kid2: { at: [1460, 925], face: [1000, 1060], pose: 'cross', seed: 4, look: 'fqih', lids: .25 },
  mohammed: { at: [960, 950], face: [1100, 1060], pose: 'cross', seed: 3, look: 'fqih', lids: .45 },
}, {
  act(lt, t, S, st, S3) {
    const { fqih: fq, kid1, kid2, mohammed: mo } = st.A, kf = k(fq);
    // heavy heat: everybody slumps a little; the fqih's head lolls
    for (const a of [fq, kid1, kid2, mo]) { a.B.spine.rotation.x += .1; a.B.chest.rotation.x += .06; upd(a, 'spine'); repin(a); }
    st.lh ||= [kid1, kid2, mo].map(() => S3.prop(PR.louha({ col: 0x9a6a38 }), 0, 0, 0));
    fanLouha(kid1, st.lh[0], t, 0, 7); fanLouha(kid2, st.lh[1], t, 1.9, 6); fanLouha(mo, st.lh[2], t, .7, 4.2, .4);   // Mohammed fans slower, wearily
    // Start wiping during the pre-roll too; sweep across the brow, then briefly lower the open hand.
    const phase = (t % 3.6) / 3.6, w = 1 - sm(.82, 1, phase);
    if (w > 0) {
      fq.B.neck.rotation.x -= .12 * w; upd(fq, 'neck');
      const sweep = .11 * Math.sin(phase * Math.PI * 2 - Math.PI / 2);
      PO.reach(fq, 'R', front(fq, 'head', .17 * kf, sweep * kf, .17 * kf).lerp(front(fq, 'root', .25 * kf, .2 * kf, .08 * kf), 1 - w), { grip: .025, pole: [-.4, -.1, -.15] });
      PO.fingers(fq, 'R', .08, { thumb: .1, spread: .25 });
      PO.palmTo(fq, 'R', .8, dirW(fq, 0, 0, -1));
    }
  },
});

// ---------------------------------------------------------------- b011 the procession through the sanctuary door
const DOOR = [960, 750];   // interior tiles beyond the raised threshold
const T11 = (j, d = 4.4) => ({ t0: B(1)[0] - .7 + 1.0 * j, t1: B(1)[0] - .7 + 1.0 * j + d });
const pr = sized(staged('mausolee_rev', {
  fqih: { at: DOOR, face: 'cam', seed: 9, talk: 0, walk: { to: [630, 830], ...T11(0, 3.6) }, look: [720, 1000, 1] },
  kid1: { at: DOOR, face: 'cam', seed: 2, talk: 0, walk: { to: [860, 875], ...T11(1, 3.4) } },
  mohammed: { at: DOOR, face: 'cam', seed: 3, talk: 0, walk: { to: [1100, 900], ...T11(2, 3.4) }, look: [1150, 1030, 1.45], lookMax: .3 },
  kid3: { at: DOOR, face: 'cam', seed: 6, talk: 0, walk: { to: [1330, 860], ...T11(3, 3.4) } },
}, {
  act(lt, t, S, st, S3) {
    const { fqih: fq, kid1, mohammed: mo, kid3 } = st.A;
    // nobody stands in the doorway before his turn: each one steps in over the threshold on his own t0
    [[fq, 0], [kid1, 1], [mo, 2], [kid3, 3]].forEach(([a, j]) => { a.group.visible = t >= T11(j).t0 - .05; });
    // Keep Mohammed's torso and slate toward the room/camera even as he steps diagonally out of the doorway.
    mo.group.rotation.y = -.18; mo.group.updateMatrixWorld(true);
    hangArms(fq, t);   // only the students carry slates
    st.lh ||= [kid1, mo, kid3].map(() => S3.prop(PR.louha({ col: 0x9a6a38 }), 0, 0, 0));
    [kid1, mo, kid3].forEach((a, i) => { st.lh[i].visible = a.group.visible; chestLouha(a, st.lh[i]); });
  },
}), { fqih: 1.2, kid1: 1.2, mohammed: 1.2, kid3: 1.2 });

// ---------------------------------------------------------------- b012 memory: seven turns around the tomb
// Only the open half of the lap is visible. Keep a body's width to the RIGHT of the railing until below its
// nearest plinth (y≈935); the return behind the tomb is hidden, never drawn through the painted lattice.
const WARM = { grade: 'rgb(255,212,150)', gradeOp: 'multiply', vignette: .75 };
const GIRLS = [['woman1', 0], ['woman2', 2.3], ['fatma', 4.6]];   // spacing along the path (m)
const LAP = [[1650, 880], [1370, 805], [1030, 790], [840, 850], [800, 930], [650, 1000], [420, 1020], [260, 1025]];
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
      const a = st.A[n], d = (v * (t - B(2)[0]) + period * 10 - off) % period;
      a.group.visible = d < LL; if (!a.group.visible) continue;
      let i = 1; while (i < len.length - 1 && len[i] < d) i++;
      const u = (d - len[i - 1]) / (len[i] - len[i - 1] || 1), p = pts[i - 1].clone().lerp(pts[i], u), dir = pts[i].clone().sub(pts[i - 1]);
      a.group.position.set(p.x, 0, p.z); a.group.rotation.y = Math.atan2(dir.x, dir.z);
      walkPose(a.B, d / 1.05, 1, { stride: .32, arms: .2 }); a.group.updateMatrixWorld(true);
      // counting the turns on the fingers of the right hand held before her chest; head a little bowed, lips moving
      const ka = k(a), cnt = 1 + (Math.floor((v * (t - B(2)[0]) - off) / period + 10) % 5);
      a.B.neck.rotation.x += .14; upd(a, 'neck');
      PO.reach(a, 'R', front(a, 'chest', .28 * ka, .25 * ka, .04 * ka), { grip: .015, pole: [-.4, -.1, -.1] });
      PO.reach(a, 'L', front(a, 'chest', .2 * ka, -.2 * ka, -.22 * ka), { grip: .02 });
      PO.fingers(a, 'R', .95, { thumb: cnt === 5 ? 0 : .6, each: [1, 0, cnt >= 2 ? 0 : 1, cnt >= 3 ? 0 : 1, cnt >= 4 ? 0 : 1], spread: .6 });
      const index = a.B.RightHandIndex3;
      if (index) IK.aim(a.B.handR, IK.wpos(index), at(a, 'handR').add(V(0, .2 * ka, 0)));
    }
  },
});

// ---------------------------------------------------------------- b013 the coolness: eyes closed, one deep breath
const br = sized(staged('mausolee', {
  mohammed: { at: [1080, 900], face: 'cam', yaw: -.25, seed: 3, talk: 0, lids: 1, lookMax: .2,
    look: (t, st) => front(st.A.mohammed, 'head', 1, 0, .08) },
}, {
  act(lt, t, S, st, S3) {
    const mo = st.A.mohammed, km = k(mo), b = sm(B(3)[0], B(3)[0] + 1.6, t) * (1 - sm(B(3)[1] - .4, B(3)[1] + .8, t));
    mo.B.chest.rotation.x -= .14 * b; mo.B.spine.rotation.x -= .05 * b; upd(mo, 'spine');   // the chest swells, shoulders open
    hangArms(mo, t);
    // The slate stays tucked along his left flank while the right arm hangs loose.
    st.lh ||= S3.prop(PR.louha({ col: 0x9a6a38 }), 0, 0, 0);
    st.lh.scale.setScalar(Math.min(1, km * 1.1)); st.lh.position.copy(front(mo, 'root', .08 * km, -.25 * km, .02 * km));
    st.lh.rotation.order = 'YXZ'; st.lh.rotation.set(.08, mo.group.rotation.y + .2, .08); st.lh.updateMatrixWorld(true);
    PO.reach(mo, 'L', st.lh.localToWorld(V(.1, .045, .025)), { grip: .01, pole: [.25, -.1, -.2] });
  },
}), { mohammed: 1.28 });

// ---------------------------------------------------------------- b014 silence, then ablutions at the fountain
const ab = sized(staged('mausolee_rev', {
  fqih: { at: [760, 850], face: 'cam', yaw: -.2, seed: 9, talk: 0, lookMax: .18,
    look: (t, st) => t < B(4)[0] + .38 * (B(4)[1] - B(4)[0]) ? front(st.A.fqih, 'head', 1) : 'kid2' },
  kid2: { at: [200, 785], face: [220, 770], seed: 4, talk: 0, look: t => t < B(4)[0] + 2.2 ? 'fqih' : [220, 770, .38] },
  mohammed: { at: [345, 785], face: [275, 770], seed: 3, talk: 0, look: t => t < B(4)[0] + 2.5 ? 'fqih' : [275, 770, .38], lookMax: .55 },
}, {
  act(lt, t, S, st, S3) {
    const { fqih: fq, kid2, mohammed: mo } = st.A, kf = k(fq);
    // the finger to the lips (index straight, other fingers curled), held, then lowered
    const sh = 1 - sm(B(4)[0] + .3 * (B(4)[1] - B(4)[0]), B(4)[0] + .42 * (B(4)[1] - B(4)[0]), t);
    fq.group.rotation.y = -.2 - .4 * (1 - sh); fq.group.updateMatrixWorld(true);
    hangArms(fq, t);
    if (sh > 0) {
      const lips = at(fq, 'head', [0, .05, .12]);
      const palm = lips.clone().add(V(0, -.09 * kf, 0)).addScaledVector(dirW(fq, 0, 0, 1), .025 * kf);
      PO.reach(fq, 'R', at(fq, 'handR').lerp(palm, sh), { grip: 0, pole: [-.32, .05, -.12] });
      PO.fingers(fq, 'R', .95 * sh, { thumb: .6 * sh, each: [1, 0, 1, 1, 1] });
      const index = fq.B.RightHandIndex3;
      if (index) IK.aim(fq.B.handR, IK.wpos(index), lips);
    }
    // Fixed targets on the painted basin, not chest-relative reaches out into the empty room.
    st.water ||= [[220, 770], [275, 770]].map(p => S3.floorAt(...p).setY(.38));
    const wash = (a, d, ph, water) => {
      const ka = k(a), u = sm(B(4)[0] + d, B(4)[0] + d + .8, t);
      if (u <= 0) return;
      a.B.spine.rotation.x += 1.2 * u; a.B.chest.rotation.x += .12 * u;
      a.B.spine.position.applyAxisAngle(V(1, 0, 0), 1.2 * u); upd(a, 'spine');
      for (const [s, q] of [['L', 0], ['R', Math.PI]]) {
        const c = Math.cos(t * 5 + ph + q) * .015, e = Math.sin(t * 5 + ph + q) * .012;
        const target = water.clone().add(V((s === 'L' ? -.025 : .025) * ka + c, e, 0));
        PO.reach(a, s, at(a, 'hand' + s).lerp(target, u), { grip: .015 });
      }
    };
    wash(kid2, 2.2, 0, st.water[0]); wash(mo, 3.2, 1.3, st.water[1]);
  },
}), { fqih: 1.2, kid2: 1.2, mohammed: 1.2 });

// ---------------------------------------------------------------- b015 prayer rows behind the master
const ROW = [['kid1', 800, 2], ['kid2', 1010, 4], ['mohammed', 1350, 3], ['kid3', 1560, 6]];
const pray = sized(staged('mausolee', {
  fqih: { at: [1180, 790], face: Math.PI, seed: 9, talk: 0 },
  ...Object.fromEntries(ROW.map(([n, x, seed]) => [n, { at: [x, 905], face: Math.PI, seed, talk: 0 }])),
}, {
  act(lt, t, S, st) {
    const [t0, t1] = B(5), D = t1 - t0;
    const ruku = lag => sm(t0 + .2 * D + lag, t0 + .2 * D + lag + .75, t) * (1 - sm(t0 + .68 * D + lag, t0 + .68 * D + lag + .75, t));
    const all = [['fqih', 0], ...ROW.map(([n]) => [n, .12])];
    for (const [n, lag] of all) {
      const a = st.A[n], ka = k(a), r = ruku(lag);
      // The master is toward the front wall (smaller floor y), with the boys in a wider row behind him.
      // One deep hip/spine hinge gives a nearly horizontal back; all boys follow the same cue.
      const feet = ['L', 'R'].map(s => [s, at(a, 'foot' + s), front(a, 'shin' + s, .2 * ka)]);
      const hip = at(a, 'root').addScaledVector(dirW(a, 0, 0, -1), .12 * ka * r).add(V(0, -.06 * ka * r, 0));
      a.B.root.position.copy(a.B.root.parent.worldToLocal(hip)); upd(a, 'root');
      for (const [s, foot, pole] of feet) IK.leg(a, s, foot, pole);   // soften the knees without sliding/lifting the feet
      a.B.spine.rotation.set(1.2 * r, 0, 0); a.B.chest.rotation.set(.12 * r, 0, 0);
      a.B.spine.position.applyAxisAngle(V(1, 0, 0), 1.2 * r);   // hinge about the hips, below the spine's own pivot
      a.B.neck.rotation.set(.02 * r, 0, 0); a.B.head.rotation.set(0, 0, 0); upd(a, 'spine');
      for (const s of ['L', 'R']) {   // qiyam: right hand over left on the chest → ruku: palms on the knees
        const kn = front(a, 'shin' + s, .065 * ka, 0, .075 * ka);
        const fold = front(a, 'chest', .14 * ka, (s === 'L' ? -.02 : .03) * ka, (s === 'L' ? -.16 : -.13) * ka);
        PO.reach(a, s, fold.lerp(kn, r), { grip: .05 });
        PO.fingers(a, s, .08, { thumb: .12, spread: .2 });
      }
    }
  },
}), { fqih: 1.25, kid1: 1.08, kid2: 1.08, mohammed: 1.08, kid3: 1.08 });

export default beatScene(ID, {
  shots: { ms, pr, fl, br, ab, pray },
  plan: {
    b010: { shot: 'ms', size: 'W', on: 'fqih', cover: [{ f: .5, size: 'M', on: 'mohammed', z: 1.12, dx: 0, dy: 80 }] },
    b011: { shot: 'pr', size: 'W', on: 'mohammed' },   // walkers: covers frame build positions → wide only
    b012: { shot: 'fl', size: 'W', on: 'woman1' },
    b013: { shot: 'br', size: 'M', on: 'mohammed', z: 1.6, dx: 0, dy: 65, cover: [{ f: .35, size: 'M', on: 'mohammed', z: 2.6, dx: 0, dy: 40 }] },
    b014: { shot: 'ab', size: 'M', on: 'fqih', z: 2, dx: 0, dy: 40, cover: [{ f: .38, size: 'W', on: 'mohammed' }] },
    b015: { shot: 'pray', size: 'W', on: 'mohammed' },
  },
});
