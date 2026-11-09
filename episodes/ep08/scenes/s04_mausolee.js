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
import { beatScene, lines, sm, front, at, V, dirW, yawTo } from '../lib/beatscene.js';
import { plate, drawPlate } from '../../../engine/plates.js';
import { c } from '../../../engine/core.js';
import { platePath, skirt } from './_3d.js';

const ID = 's04_mausolee', L = lines(ID);
const B = i => L[i] || [0, 0];
const k = a => a.group.scale.y / 1.6;
// One standing scale per role, shared by the entrance, breath, fountain and prayer shots.
const STANDING = { fqih: 1.2, kid1: 1.2, kid2: 1.2, kid3: 1.2, mohammed: 1.2 };
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

/** Bottom-origin board, clear of the chest; wrists stay OUTSIDE its lower corners. */
function chestLouha(a, lh) {
  const kk = k(a); lh.scale.setScalar(Math.min(1, kk * 1.1));
  lh.position.copy(front(a, 'chest', .30 * kk, 0, -.32 * kk));
  lh.rotation.order = 'YXZ'; lh.rotation.set(-.06, a.group.rotation.y, 0); lh.updateMatrixWorld(true);
  for (const [s, sign] of [['L', 1], ['R', -1]]) {
    const edge = lh.localToWorld(V(sign * .18, .055, .035));
    PO.reach(a, s, edge, { grip: 0, pole: [sign * .42, .02, .08] });
    // Aim the fingers inward across the narrow edge, rather than folding the wrist over the board's face.
    IK.aim(a.B['hand' + s], PO.handPts(a, s).end, lh.localToWorld(V(sign * .12, .055, .015)));
    PO.fingers(a, s, .38, { thumb: .3 });
  }
}
/** Fan beside the chest: the board's origin is its BOTTOM edge, so its whole arc stays below the chin. */
function fanLouha(a, lh, t, ph = 0, rate = 6.5, amp = .55) {
  const kk = k(a), wave = Math.sin(t * rate + ph), g = front(a, 'chest', .27 * kk, .22 * kk, -.28 * kk);
  lh.scale.setScalar(Math.min(1, kk * 1.1));
  lh.position.copy(g); lh.rotation.order = 'YXZ'; lh.rotation.set(-.2 + .08 * wave, a.group.rotation.y - .25 + amp * .4 * wave, -.08); lh.updateMatrixWorld(true);
  PO.reach(a, 'R', lh.localToWorld(V(-.175, .045, .035)), { grip: 0, pole: [-.35, -.2, -.1] });
  IK.aim(a.B.handR, PO.handPts(a, 'R').end, lh.localToWorld(V(-.08, .11, .025)));
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
    st.hem ||= skirt(S3, mo, 0);   // a continuous low cloth drape over the folded legs
    st.lh ||= [kid1, kid2, mo].map(() => S3.prop(PR.louha({ col: 0x9a6a38 }), 0, 0, 0));
    fanLouha(kid1, st.lh[0], t, 0, 7); fanLouha(kid2, st.lh[1], t, 1.9, 6); fanLouha(mo, st.lh[2], t, .7, 4.2, .4);   // Mohammed fans slower, wearily
    // Start wiping during the pre-roll too; sweep across the brow, then briefly lower the open hand.
    const phase = (t % 3.6) / 3.6, w = 1 - sm(.82, 1, phase);
    if (w > 0) {
      fq.B.neck.rotation.x -= .12 * w; upd(fq, 'neck');
      const sweep = .19 + .025 * Math.sin(phase * Math.PI * 2 - Math.PI / 2);
      PO.reach(fq, 'R', front(fq, 'head', .1 * kf, sweep * kf, .21 * kf).lerp(front(fq, 'root', .25 * kf, .2 * kf, .08 * kf), 1 - w), { grip: .025, pole: [-.4, -.1, -.15] });
      PO.fingers(fq, 'R', .08, { thumb: .1, spread: .25 });
      PO.palmTo(fq, 'R', .8, dirW(fq, 0, 0, -1));
    }
  },
});

// ---------------------------------------------------------------- b011 the procession through the sanctuary door
const DOOR = [960, 750];   // interior tiles beyond the raised threshold
const T11 = (j, d = 4.4) => ({ t0: B(1)[0] - .7 + 1.0 * j, t1: B(1)[0] - .7 + 1.0 * j + d });
const pr = sized(staged('mausolee_rev', {
  fqih: { at: DOOR, face: 'cam', seed: 9, talk: 0, walk: { to: [630, 830], ...T11(0, 3.6) }, look: 'kid1', lookMax: .7 },
  kid1: { at: [1030, 750], face: 'cam', seed: 2, talk: 0, walk: { to: [860, 875], ...T11(1, 3.4) } },
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
    const lead = sm(T11(0, 3.6).t1 - .6, T11(0, 3.6).t1 + .3, t);
    const turn = yawTo(fq.group.position, kid1.group.position);
    fq.group.rotation.y += Math.atan2(Math.sin(turn - fq.group.rotation.y), Math.cos(turn - fq.group.rotation.y)) * lead;
    fq.group.updateMatrixWorld(true);
    PO.reach(fq, 'R', front(fq, 'chest', (.23 + .04 * Math.sin(t * 3)) * k(fq), .23 * k(fq), -.12 * k(fq)), { grip: 0 });
    PO.fingers(fq, 'R', .12, { thumb: .15, spread: .3 });
    PO.palmTo(fq, 'R', .8, V(0, 1, 0));
    st.lh ||= [kid1, mo, kid3].map(() => S3.prop(PR.louha({ col: 0x9a6a38 }), 0, 0, 0));
    [kid1, mo, kid3].forEach((a, i) => { st.lh[i].visible = a.group.visible; chestLouha(a, st.lh[i]); });
  },
}), STANDING);

// ---------------------------------------------------------------- b012 memory: seven turns around the tomb
// A CLOSED lap around the left-hand tomb: right flank, near plinth, left flank, far side.
// The return half is hidden by the tomb; it still advances along the same continuous floor path.
const WARM = { grade: 'rgb(255,212,150)', gradeOp: 'multiply', vignette: .75 };
const GIRLS = [['woman1', 0], ['woman2', 2.3], ['fatma', 4.6]];   // spacing along the path (m)
const LAP = [[800, 850], [800, 930], [650, 1000], [420, 1020], [260, 1025], [80, 1000], [80, 850], [420, 790], [650, 805]];
let PLATE; plate(platePath('mausolee')).then(i => { PLATE = i; });
const leaves = () => { if (!PLATE) return; for (const [x0, x1] of [[0, 128], [1812, 1920]]) { c.save(); c.beginPath(); c.rect(x0, 0, x1 - x0, 1080); c.clip(); drawPlate(PLATE); c.restore(); } };
const fl = staged('mausolee', Object.fromEntries(GIRLS.map(([n], i) => [n, { at: LAP[0], face: 'cam', seed: 11 + i * 2, talk: 0, mutter: () => .6 }])), {
  fx: WARM, over: leaves,
  act(lt, t, S, st, S3) {
    if (!st.lap) {   // the path as a dense polyline on the floor, with its arc length
      const P = LAP.map(q => S3.floorAt(...q)), pts = [];
      for (let i = 0; i < P.length; i++) for (let j = 0; j < 12; j++) {   // periodic Catmull-Rom, including the hidden return
        const p0 = P[(i + P.length - 1) % P.length], p1 = P[i], p2 = P[(i + 1) % P.length], p3 = P[(i + 2) % P.length], u = j / 12, u2 = u * u, u3 = u2 * u;
        pts.push(V(0, 0, 0).addScaledVector(p0, -.5 * u3 + u2 - .5 * u).addScaledVector(p1, 1.5 * u3 - 2.5 * u2 + 1).addScaledVector(p2, -1.5 * u3 + 2 * u2 + .5 * u).addScaledVector(p3, .5 * u3 - .5 * u2));
      }
      pts.push(P[0]); const len = [0]; for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + pts[i].distanceTo(pts[i - 1]));
      st.lap = { pts, len, L: len.at(-1), visibleL: len[5 * 12] };   // left return disappears behind the door leaf
    }
    const { pts, len, L: period, visibleL } = st.lap, v = .72, start = 2.5;   // open with two women on the near half
    st.G.apply = () => {};   // the ritual follows the path, with no sideways conversation gaze
    for (const [n, off] of GIRLS) {
      const a = st.A[n], d = (start + v * (t - B(2)[0]) + period * 10 - off) % period;
      a.group.visible = d < visibleL;
      let i = 1; while (i < len.length - 1 && len[i] < d) i++;
      const u = (d - len[i - 1]) / (len[i] - len[i - 1] || 1), p = pts[i - 1].clone().lerp(pts[i], u), dir = pts[i].clone().sub(pts[i - 1]);
      a.group.position.set(p.x, 0, p.z); a.group.rotation.y = Math.atan2(dir.x, dir.z);
      walkPose(a.B, d / 1.05, 1, { stride: .32, arms: .2 }); a.group.updateMatrixWorld(true);
      // counting the turns on the fingers of the right hand held before her chest; head a little bowed, lips moving
      const ka = k(a), cnt = 1 + (Math.floor((start + v * (t - B(2)[0]) - off) / period + 10) % 5);
      a.B.neck.rotation.set(.14, 0, 0); a.B.head.rotation.set(0, 0, 0); upd(a, 'neck');
      PO.reach(a, 'R', front(a, 'chest', .28 * ka, .25 * ka, .04 * ka), { grip: .015, pole: [-.4, -.1, -.1] });
      PO.reach(a, 'L', front(a, 'chest', (.24 + .04 * Math.sin(d / 1.05 * Math.PI * 2)) * ka, -.23 * ka, -.16 * ka), { grip: 0, pole: [.35, .05, .1] });
      PO.fingers(a, 'R', .95, { thumb: cnt === 5 ? 0 : .6, each: [1, 0, cnt >= 2 ? 0 : 1, cnt >= 3 ? 0 : 1, cnt >= 4 ? 0 : 1], spread: .6 });
      const index = a.B.RightHandIndex3;
      if (index) IK.aim(a.B.handR, IK.wpos(index), at(a, 'handR').add(V(0, .2 * ka, 0)));
    }
  },
});

// ---------------------------------------------------------------- b013 the coolness: eyes closed, one deep breath
const br = sized(staged('mausolee', {
  mohammed: { at: [1080, 900], face: 'cam', seed: 3, talk: 0, lids: 1, lookMax: 0 },
}, {
  act(lt, t, S, st, S3) {
    const mo = st.A.mohammed, b = sm(B(3)[0] - .4, B(3)[0] + 1.6, t) * (1 - sm(B(3)[1] - .4, B(3)[1] + .8, t));
    st.G.apply = () => {};
    st.faces[0][3] = { lid: 1, blink: 1, open: 0 };
    mo.B.neck.rotation.set(0, 0, 0); mo.B.head.rotation.set(0, 0, 0);
    mo.B.chest.rotation.x -= .14 * b; mo.B.spine.rotation.x -= .05 * b; upd(mo, 'spine');   // the chest swells, shoulders open
    mo.B.chest.position.y += .018 * b; upd(mo, 'chest');
    // Both hands keep the same clean lower-edge grip used on the way in.
    st.lh ||= S3.prop(PR.louha({ col: 0x9a6a38 }), 0, 0, 0);
    chestLouha(mo, st.lh);
  },
}), STANDING);

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
      // Stand within an arm's reach of the rim, measured in world metres, at the entrance shot's scale.
      a.group.position.copy(water).setY(0).addScaledVector(dirW(a, 0, 0, -1), .58 * ka);
      a.group.updateMatrixWorld(true);
      if (u <= 0) return;
      a.B.spine.rotation.set(1.15 * u, 0, 0); a.B.chest.rotation.set(0, 0, 0);
      a.B.spine.position.applyAxisAngle(V(1, 0, 0), 1.15 * u); upd(a, 'spine');
      for (const [s, q] of [['L', 0], ['R', Math.PI]]) {
        const c = Math.cos(t * 5 + ph + q) * .015, e = Math.sin(t * 5 + ph + q) * .012;
        const target = water.clone().add(V((s === 'L' ? -.025 : .025) * ka + c, e, 0));
        PO.reach(a, s, at(a, 'hand' + s).lerp(target, u ** 3), { grip: .015 });   // lower the torso before extending to the water
      }
    };
    wash(kid2, 2.2, 0, st.water[0]); wash(mo, 3.2, 1.3, st.water[1]);
  },
}), STANDING);

// ---------------------------------------------------------------- b015 prayer rows behind the master
const ROW = [['kid1', 820, 2], ['kid2', 1060, 4], ['mohammed', 1300, 3], ['kid3', 1540, 6]];
const pray = sized(staged('mausolee', {
  fqih: { at: [1180, 790], face: Math.PI, seed: 9, talk: 0 },
  ...Object.fromEntries(ROW.map(([n, x, seed]) => [n, { at: [x, 905], face: Math.PI, seed, talk: 0 }])),
}, {
  act(lt, t, S, st) {
    const [t0, t1] = B(5), D = t1 - t0;
    const ruku = lag => sm(t0 + .2 * D + lag, t0 + .2 * D + lag + .75, t) * (1 - sm(t0 + .68 * D + lag, t0 + .68 * D + lag + .75, t));
    const all = [['fqih', 0], ...ROW.map(([n]) => [n, .12])];
    st.G.apply = () => {};   // all five keep their heads aligned with the qibla
    for (const [n, lag] of all) {
      const a = st.A[n], ka = k(a), r = ruku(lag);
      // Leave the root, straight legs and feet in their standing pose throughout the bow.
      // Rotate BOTH the spine offset and its orientation about the hip, giving a level back at full ruku.
      const hinge = Math.PI / 2 * r;
      a.B.spine.rotation.set(hinge, 0, 0); a.B.chest.rotation.set(0, 0, 0);
      a.B.spine.position.applyAxisAngle(V(1, 0, 0), hinge);
      a.B.neck.rotation.set(0, 0, 0); a.B.head.rotation.set(0, 0, 0); upd(a, 'spine');
      // These child rigs have long torsos and short arms. Settle the torso back enough for actual knee
      // contact, keeping the back level and leaving the hips, legs, feet and actor scale untouched.
      const fw = dirW(a, 0, 0, 1); let settle = 0;
      for (const s of ['L', 'R']) {
        const shoulder = at(a, 'upperArm' + s), elbow = at(a, 'foreArm' + s), wrist = at(a, 'hand' + s);
        const len = shoulder.distanceTo(elbow) + elbow.distanceTo(wrist);
        const d = shoulder.sub(front(a, 'shin' + s, .045 * ka, 0, .025 * ka));
        const along = d.dot(fw), across = d.clone().addScaledVector(fw, -along);
        const reach = Math.sqrt(Math.max(0, (len * .97) ** 2 - across.lengthSq()));
        settle = Math.max(settle, along - reach);
      }
      const spine = at(a, 'spine').addScaledVector(fw, -settle * r);
      a.B.spine.position.copy(a.B.spine.parent.worldToLocal(spine)); upd(a, 'spine');
      for (const s of ['L', 'R']) {   // qiyam: right hand over left on the chest → ruku: palms on the knees
        const kn = front(a, 'shin' + s, .045 * ka, 0, .025 * ka);
        const fold = front(a, 'chest', .14 * ka, (s === 'L' ? -.02 : .03) * ka, (s === 'L' ? -.16 : -.13) * ka);
        PO.reach(a, s, fold.lerp(kn, r), { grip: 0, pole: [(s === 'L' ? .3 : -.3), .05, .25] });
        if (r > .95) PO.palmTo(a, s, r, V(0, -1, 0));
        PO.fingers(a, s, .08, { thumb: .12, spread: .2 });
      }
    }
  },
}), STANDING);

export default beatScene(ID, {
  shots: { ms, pr, fl, br, ab, pray },
  plan: {
    b010: { shot: 'ms', size: 'W', on: 'fqih', cover: [{ f: .5, size: 'M', on: 'mohammed', z: 1.12, dx: 0, dy: 80 }] },
    b011: { shot: 'pr', size: 'W', on: 'mohammed' },   // walkers: covers frame build positions → wide only
    b012: { shot: 'fl', size: 'W', on: 'woman1' },
    b013: { shot: 'br', size: 'M', on: 'mohammed', z: 1.6, dx: 0, dy: 0, cover: [{ f: .35, size: 'M', on: 'mohammed', z: 2.05, dx: 0, dy: -10 }] },
    b014: { shot: 'ab', size: 'M', on: 'fqih', z: 2, dx: 150, dy: -35, cover: [{ f: .38, size: 'W', on: 'mohammed' }] },
    b015: { shot: 'pray', size: 'W', on: 'mohammed' },
  },
});
