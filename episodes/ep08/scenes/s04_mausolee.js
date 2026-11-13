import { checkedStage } from './s13_attente.js';
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
import { beatScene, lines, sm, front, at, V, dirW, yawTo } from '../lib/beatscene.js';
import { plate, drawPlate } from '../../../engine/plates.js';
import { c } from '../../../engine/core.js';
import { THREE } from '../lib/autostage.js';
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
    finally { sh.st.actors.forEach((a, i) => { a.group.scale.copy(before[i]); delete a.armLen; a.group.updateMatrixWorld(true); }); }
  };
  return sh;
}

/** Soft elbows, hands hanging at the actor's own arm length; no below-root IK targets. */
function hangArms(a, t, sides = ['L', 'R'], swing = 0, rate = 2.4) {
  const ka = k(a);
  for (const s of sides) {
    const shoulder = at(a, 'upperArm' + s), elbow = at(a, 'foreArm' + s), wrist = at(a, 'hand' + s);
    const len = shoulder.distanceTo(elbow) + elbow.distanceTo(wrist);
    const hand = shoulder.clone().add(V(0, -.91 * len, 0))
      .addScaledVector(dirW(a, s === 'L' ? 1 : -1, 0, 0), .07 * ka)
      .addScaledVector(dirW(a, 0, 0, 1), (.04 + .008 * Math.sin(t + (s === 'L' ? 0 : 1)) + swing * Math.sin(t * rate + (s === 'L' ? 0 : Math.PI))) * ka)
      .addScaledVector(dirW(a, 0, 1, 0), swing * .25 * Math.abs(Math.sin(t * rate + (s === 'L' ? 0 : Math.PI))) * ka);
    PO.reach(a, s, hand, { grip: 0, pole: s === 'L' ? [.3, .05, -.25] : [-.3, .05, -.25] });
  }
}

/** Relaxed hands folded low in front of the belly, with a slow breath (calm waiting pose). */
function foldHands(a, t, ph = 0, w = 1) {
  const ka = k(a), br = .008 * Math.sin(t * 1.3 + ph);
  for (const [s, sg] of [['L', -1], ['R', 1]]) {
    const hand = front(a, 'chest', (.34 + (s === 'R' ? .02 : 0)) * ka, sg * .06 * ka, (-.28 + br + (s === 'R' ? .015 : 0)) * ka);
    PO.reach(a, s, w >= 1 ? hand : at(a, 'hand' + s).lerp(hand, w), { grip: 0, pole: [-sg * .6, -.25, .05] });   // R23A: elbows OUT and forward (were pushed inward through the torso)
    PO.fingers(a, s, .3, { thumb: .25 });
  }
}

/** Bottom-origin board, clear of the chest; wrists stay OUTSIDE its lower corners. */
function chestLouha(a, lh) {
  const kk = k(a); lh.scale.setScalar(Math.min(.72, kk * .8));
  lh.position.copy(front(a, 'chest', .20 * kk, 0, -.38 * kk));
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
  const kk = k(a), wave = Math.sin(t * rate + ph), g = front(a, 'chest', .20 * kk, .44 * kk, -.34 * kk);
  lh.scale.setScalar(Math.min(.72, kk * .8));
  lh.position.copy(g).addScaledVector(dirW(a, 1, 0, 0), .07 * kk * wave).add(V(0, .05 * kk, 0)); lh.rotation.order = 'YXZ'; lh.rotation.set(-.35 + .2 * wave, a.group.rotation.y - .25 + amp * .6 * wave, -.08 + .45 * wave);   // R28: raised near the face, wide wave lh.updateMatrixWorld(true);
  PO.reach(a, 'R', lh.localToWorld(V(-.175, .045, .035)), { grip: 0, pole: [-.35, -.2, -.1] });
  IK.aim(a.B.handR, PO.handPts(a, 'R').end, lh.localToWorld(V(-.08, .11, .025)));
  PO.fingers(a, 'R', .35, { thumb: .25 });
}

// ---------------------------------------------------------------- b010 the Msid in the heat
const ms = checkedStage('ep03/msid_estrade', {
  fqih: { at: [1000, 795], face: 'cam', pose: 'cross', o: { seat: .34, floor: .34 }, seed: 9, lids: .35, talk: 0 },
  kid1: { at: [500, 925], face: [1000, 1060], pose: 'cross', hands:false, seed: 2, look: 'fqih', lids: .3 },
  kid2: { at: [1460, 925], face: [1000, 1060], pose: 'cross', hands:false, seed: 4, look: 'fqih', lids: .25 },
  mohammed: { at: [700, 830], face: [1000, 1060], pose: 'cross', hands:false, seed: 3, look: 'fqih', lookMax: .6, lids: .45 },   // beside the master, 3/4 to the lens: he can look at him without turning his back to us
}, {
  act(lt, t, S, st, S3) {
    const { fqih: fq, kid1, kid2, mohammed: mo } = st.A, kf = k(fq);
    // The fqih sits on the estrade (seat .34): sink the pelvis onto it, keeping both soles planted on the platform.
    { const feet = ['L', 'R'].map(s => at(fq, 'foot' + s)), knees = ['L', 'R'].map(s => at(fq, 'shin' + s));
      PO.setHipY(fq, at(fq, 'root').y - .05 * kf); ['L', 'R'].forEach((s, i) => IK.leg(fq, s, feet[i], knees[i])); }
    for(const a of [kid1,kid2,mo])PO.setHipY(a,at(a,'root').y+.006);
    // heavy heat: everybody slumps a little; the fqih's head lolls
    for (const a of [fq, kid1, kid2, mo]) { a.B.spine.rotation.x += .1; a.B.chest.rotation.x += .06; upd(a, 'spine'); if(a===fq)repin(a); else PO.reach(a,'L',front(a,'root',.18*k(a),-.12*k(a),.16*k(a)),{grip:.035}); }
    for(const a of [kid1,kid2,mo])for(const side of ['L','R']){
      const low=PO.lowestOf(a,['foot'+side,'shin'+side]);
      if(low<0){const ankle=at(a,'foot'+side).add(V(0,-low+.002,0));IK.leg(a,side,ankle,at(a,'shin'+side));}
    }
    for(const a of [kid1,kid2,mo])for(const n of ['RightRobe2','LeftRobe2','SkirtFront2','SkirtBack2'])if(a.B[n]){const bone=a.B[n];bone.scale.y*=.70;bone.position.copy(bone.parent.worldToLocal(at(a,n).add(V(0,.026,0))));bone.updateWorldMatrix(false,true);}
    st.hems ||= [kid1,kid2,mo].map(a=>skirt(S3,a,0));   // a continuous low cloth drape over the folded legs
    st.lh ||= [kid1, kid2, mo].map(() => S3.prop(PR.louha({ col: 0x9a6a38 }), 0, 0, 0));
    fanLouha(kid1, st.lh[0], t, 0, 7); fanLouha(kid2, st.lh[1], t, 1.9, 6); fanLouha(mo, st.lh[2], t, .7, 4.2, .4);   // Mohammed fans slower, wearily
    // Start wiping during the pre-roll too; sweep across the brow, then briefly lower the open hand.
    const phase = ((t + 1.2) % 3.6) / 3.6, w = 1 - sm(.88, 1, phase);   // R28: already wiping at t=0
    if (w > 0) {
      fq.B.neck.rotation.x -= .12 * w; upd(fq, 'neck');
      const sweep = .19 + .025 * Math.sin(phase * Math.PI * 2 - Math.PI / 2);
      PO.reach(fq, 'R', front(fq, 'head', .17 * kf, (sweep - .12) * kf, .16 * kf).lerp(front(fq, 'root', .25 * kf, .2 * kf, .08 * kf), 1 - w), { grip: .025, pole: [-.4, -.1, -.15] });
      PO.fingers(fq, 'R', .08, { thumb: .1, spread: .25 });
      PO.palmTo(fq, 'R', .8, dirW(fq, 0, 0, -1));
    }
  },
});

// ---------------------------------------------------------------- b011 the procession through the sanctuary door
const DOOR = [960, 750];   // interior tiles beyond the raised threshold
// The file is already through the door when the beat opens: all four named walkers are in frame from its first sample.
const T11 = (j, d = 4.4) => ({ t0: B(1)[0] - 2.2 + .55 * j, t1: B(1)[0] - 2.2 + .55 * j + d });
const pr = sized(checkedStage('mausolee_rev', {
  fqih: { at: DOOR, face: 'cam', seed: 9, talk: 0, walk: { to: [800, 805], ...T11(0, 3.6) }, lookMax: .7,   // right of the lower-left exam label (x<~750, y 762-836)
    // he looks back at the boys only once he has turned to them (a leader walking away cannot face the file behind him)
    look: t => t > T11(0, 3.6).t1 - .3 ? 'kid1' : null },
  // start order == end order left to right (no crossing), staggered in depth so the file reads as a walking procession
  mohammed: { at: [930, 748], face: 'cam', seed: 3, talk: 0, walk: { to: [975, 890], ...T11(1, 3.4) }, look: [1150, 1030, 1.45], lookMax: .3 },
  kid1: { at: [1010, 750], face: 'cam', seed: 2, talk: 0, walk: { to: [1050, 822], ...T11(2.0, 3.4) } },
  kid2: { at: [1085, 752], face: 'cam', seed: 4, talk: 0, walk: { to: [1360, 852], ...T11(3.0, 3.4) } },
  kid3: { at: [1215, 756], face: 'cam', seed: 6, talk: 0, walk: { to: [1610, 820], ...T11(3.95, 3.4) } },
}, {
  act(lt, t, S, st, S3) {
    const { fqih: fq, kid1, kid2, mohammed: mo, kid3 } = st.A;
    // nobody stands in the doorway before his turn: each one steps in over the threshold on his own t0
    [[fq, 0], [kid1, 2.0], [mo, 1], [kid2, 3.0], [kid3, 3.95]].forEach(([a, j]) => { a.group.visible = t >= T11(j).t0 - .05; });
    // Keep Mohammed's torso and slate toward the room/camera even as he steps diagonally out of the doorway.
    mo.group.rotation.y = -.18; mo.group.updateMatrixWorld(true);
    { const sh = sm(T11(1, 3.4).t1 - .2, T11(1, 3.4).t1 + .8, t); mo.B.spine.rotation.z += .045 * sh; mo.B.chest.rotation.z -= .06 * sh; mo.B.spine.updateWorldMatrix(false, true);
      const km = k(mo), fR = at(mo, 'footR').addScaledVector(dirW(mo, 0, 0, 1), .07 * km * sh).addScaledVector(dirW(mo, 1, 0, 0), .025 * km * sh);   // R28: weight on the left leg, right foot a step forward
      IK.leg(mo, 'R', fR, at(mo, 'shinR')); }
    const t1f = T11(0, 3.6).t1;
    hangArms(fq, t, ['L', 'R'], .13 * (1 - sm(t1f - .5, t1f + .1, t)));   // only the students carry slates; the leader's arms swing while he walks
    const lead = sm(T11(0, 3.6).t1 - .6, T11(0, 3.6).t1 + .3, t);
    const turn = yawTo(fq.group.position, kid1.group.position);
    fq.group.rotation.y += Math.atan2(Math.sin(turn - fq.group.rotation.y), Math.cos(turn - fq.group.rotation.y)) * lead;
    fq.group.updateMatrixWorld(true);
    // once he has turned he gestures to the boys, then the room: open right hand, left hand relaxed
    // R28: arms stay relaxed (hangArms above); the raised gesture arm reached the red-cap boy's chin
    // after stopping, each boy settles into his own stance (varied yaw)
    [[kid1, 2.0, -.3], [kid2, 3.0, .12], [kid3, 3.95, -.14]].forEach(([a, j, off]) => { a.group.rotation.y += off * sm(T11(j).t1 - .3, T11(j).t1 + .5, t); a.group.updateMatrixWorld(true); });
    st.lh ||= [kid1, mo, kid2, kid3].map(() => S3.prop(PR.louha({ col: 0x9a6a38 }), 0, 0, 0));
    [kid1, mo, kid2, kid3].forEach((a, i) => { st.lh[i].visible = a.group.visible; chestLouha(a, st.lh[i]); });
  },
}), { ...STANDING, kid1: 1.1, kid2: 1.08, kid3: 1.06 });   // R25C: boys nearer the lens had grown past the fqih; child proportions

// ---------------------------------------------------------------- b012 memory: seven turns around the tomb
// A CLOSED lap around the left-hand tomb: right flank, near plinth, left flank, far side.
// The return half is hidden by the tomb; it still advances along the same continuous floor path.
const WARM = { grade: 'rgb(255,212,150)', gradeOp: 'multiply', vignette: .75 };
const GIRLS = [['woman1', 0, 0], ['woman2', 1.0, 0], ['fatma', 2.0, 0]];   // R25C: bunched so 2-3 circle together   // spacing along the path (m)
// The far half runs along the wall BEHIND the tomb: the women stay real, posed actors the whole lap, and the tomb is a depth
// holdout (below), so the renderer hides them behind its painted body and only heads above the rail show.
const LAP = [[800, 850], [800, 930], [650, 1000], [420, 1020], [300, 1025], [120, 1000], [100, 850], [130, 722], [420, 705], [650, 712]];
const TOMB = { top: 1.25, front: [[124, 886], [430, 932]], back: [[150, 729], [663, 735]] };   // R23A: plinth reaches the rail's painted left end (a woman on the left flank was drawn in front of the rail)   // plate-px footprint of the plinth
let PLATE; plate(platePath('mausolee')).then(i => { PLATE = i; });
const leaves = () => { if (!PLATE) return; for (const [x0, x1] of [[0, 196], [1812, 1920]]) { c.save(); c.beginPath(); c.rect(x0, 0, x1 - x0, 1080); c.clip(); drawPlate(PLATE); c.restore(); } };
const fl = sized(checkedStage('mausolee', Object.fromEntries(GIRLS.map(([n], i) => [n, { at: LAP[0], face: 'cam', seed: 11 + i * 2, talk: 0, mutter: () => .6 }])), {
  fx: WARM, over: leaves,
  act(lt, t, S, st, S3) {
    if (!st.lap) {   // the path as a dense polyline on the floor, with its arc length
      const P = LAP.map(q => S3.floorAt(...q)), pts = [];
      for (let i = 0; i < P.length; i++) for (let j = 0; j < 12; j++) {   // periodic Catmull-Rom, including the hidden return
        const p0 = P[(i + P.length - 1) % P.length], p1 = P[i], p2 = P[(i + 1) % P.length], p3 = P[(i + 2) % P.length], u = j / 12, u2 = u * u, u3 = u2 * u;
        pts.push(V(0, 0, 0).addScaledVector(p0, -.5 * u3 + u2 - .5 * u).addScaledVector(p1, 1.5 * u3 - 2.5 * u2 + 1).addScaledVector(p2, -1.5 * u3 + 2 * u2 + .5 * u).addScaledVector(p3, .5 * u3 - .5 * u2));
      }
      pts.push(P[0]); const len = [0]; for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + pts[i].distanceTo(pts[i - 1]));
      st.lap = { pts, len, L: len.at(-1) };   // the left turn passes under the redrawn door leaf
      const q = [...TOMB.front, ...TOMB.back].map(p => S3.floorAt(...p)), xs = q.map(v => v.x), zs = q.map(v => v.z);
      const x0 = Math.min(...xs), x1 = Math.max(...xs), z0 = Math.min(...zs), z1 = Math.max(...zs);
      S3.holdout(new THREE.BoxGeometry(x1 - x0, TOMB.top, z1 - z0), (x0 + x1) / 2, TOMB.top / 2, (z0 + z1) / 2);
    }
    const { pts, len, L: period } = st.lap, v = .50, start = 2.5;   // open with two women on the near half
    st.G.apply = () => {};   // the ritual follows the path, with no sideways conversation gaze
    let underLeaf = false;
    for (const [n, off, side] of GIRLS) {
      const a = st.A[n], d = (start + v * (t - B(2)[0]) + period * 10 - off/4.8*period) % period;
      // Stay behind the tomb only on the far side; at least one of the three phases is always near.
      // A second woman stays on the near half while the leader passes behind the tomb.
      let i = 1; while (i < len.length - 1 && len[i] < d) i++;
      const u = (d - len[i - 1]) / (len[i] - len[i - 1] || 1), p = pts[i - 1].clone().lerp(pts[i], u), dir = pts[i].clone().sub(pts[i - 1]);
      if (side) { const o = V(dir.z, 0, -dir.x).normalize(), cen = st.tombC || (st.tombC = S3.floorAt(...[(TOMB.front[0][0] + TOMB.back[1][0]) / 2, (TOMB.front[0][1] + TOMB.back[1][1]) / 2])); if (o.dot(p.clone().sub(cen)) < 0) o.negate(); p.addScaledVector(o, side); }   // R25C: walk abreast, outside the tomb, so the three read as a group
      a.group.position.set(p.x, 0, p.z); a.group.rotation.y = Math.atan2(dir.x, dir.z);
      walkPose(a.B, d / 1.05, 1, { stride: .32, arms: .2 }); a.group.updateMatrixWorld(true);
      // counting the turns on the fingers of the right hand held before her chest; head a little bowed, lips moving
      const ka = k(a), cnt = 1 + (Math.floor((start + v * (t - B(2)[0]) - off) / period + 10) % 5);
      a.B.neck.rotation.set(.5, 0, 0); a.B.head.rotation.set(.2, 0, 0);
      { // R25C: on the stretch walking away from the lens she looks back over her shoulder (twist torso + neck)
        const fw = dirW(a, 0, 0, 1), tc = S3.cam.position.clone().sub(a.group.position); fw.y = tc.y = 0; fw.normalize(); tc.normalize();
        const ang = Math.acos(Math.max(-1, Math.min(1, fw.dot(tc)))), w = sm(1.3, 2.3, ang), sg = Math.sign(fw.z * tc.x - fw.x * tc.z) || 1;
        a.B.spine.rotation.y += sg * .3 * w; a.B.chest.rotation.y += sg * .4 * w; a.B.neck.rotation.y += sg * .45 * w; a.B.head.rotation.y += sg * .45 * w; }
      upd(a, 'spine', 'chest', 'neck');
      if (S3.project(at(a, 'head'))[0] < 235) underLeaf = true;   // R25C: this stretch is drawn under the redrawn door leaf
      PO.reach(a, 'R', front(a, 'chest', .27 * ka, .08 * ka, .05 * ka), { grip: .015, pole: [-.4, -.1, -.1] });
      PO.reach(a, 'L', front(a, 'chest', (.25 + .02 * Math.sin(d / 1.05 * Math.PI * 2)) * ka, .0 * ka, -.04 * ka), { grip: 0, pole: [.35, .05, .1] });
      PO.fingers(a, 'R', .95, { thumb: cnt === 5 ? 0 : .6, each: [1, 0, cnt >= 2 ? 0 : 1, cnt >= 3 ? 0 : 1, cnt >= 4 ? 0 : 1], spread: .6 });
      const index = a.B.RightHandIndex3;
      if (index) IK.aim(a.B.handR, IK.wpos(index), at(a, 'handR').add(V(0, .2 * ka, 0)));
    }
    st.actcheck = { insert: underLeaf };   // R25C: a woman passing under the redrawn door leaf is hidden by it; the framing gates skip that instant
  },
}), { woman1: 1.22, woman2: 1.22, fatma: 1.22 });   // r16: adult height against the 1.25 m rail

// ---------------------------------------------------------------- b013 the coolness: eyes closed, one deep breath
const br = sized(checkedStage('mausolee', {
  mohammed: { at: [1080, 900], face: 'cam', seed: 3, talk: 0, lids: 1, lookMax: 0 },
}, {
  act(lt, t, S, st, S3) {
    const mo = st.A.mohammed, b = sm(B(3)[0] - .4, B(3)[0] + 1.6, t) * (1 - sm(B(3)[1] - .4, B(3)[1] + .8, t));
    st.G.apply = () => {};
    st.faces[0][3] = { lid: 1, blink: 1, open: 0 };
    mo.B.neck.rotation.set(0, 0, 0); mo.B.head.rotation.set(0, 0, 0);
    // relaxed asymmetric stance: three-quarter turn, right foot a step forward, weight on the left leg, slow idle breath
    const km = k(mo), idle = Math.sin(t * 1.4);
    mo.group.rotation.y = .16; mo.group.updateMatrixWorld(true);
    { const fL = at(mo, 'footL'), fR = at(mo, 'footR').addScaledVector(dirW(mo, 0, 0, 1), .07 * km).addScaledVector(dirW(mo, 1, 0, 0), .02 * km);
      IK.leg(mo, 'L', fL, at(mo, 'shinL')); IK.leg(mo, 'R', fR, at(mo, 'shinR')); }
    mo.B.spine.rotation.z += .035; mo.B.chest.rotation.z -= .05;
    mo.B.chest.rotation.x -= .24 * b + .02 * idle; mo.B.spine.rotation.x -= .07 * b; upd(mo, 'spine');   // the chest swells, shoulders open
    mo.B.chest.position.y += .035 * b + .004 * idle; upd(mo, 'chest');
    // Both hands keep the same clean lower-edge grip used on the way in.
    st.lh ||= S3.prop(PR.louha({ col: 0x9a6a38 }), 0, 0, 0);
    chestLouha(mo, st.lh);
  },
}), STANDING);

// ---------------------------------------------------------------- b014 silence, then ablutions at the fountain
// Once he bends to wash, the eyes rest on the water just ahead of the rim (a point straight below the head would flip the face).
const basinGaze = (st, i) => st?.water ? st.water[i].clone().add(V(-.3, -.12, .14)) : null;
const ab = sized(checkedStage('mausolee_rev', {
  fqih: { at: [760, 850], face: 'cam', yaw: -.2, seed: 9, talk: 0, lookMax: .75,
    look: (t, st) => t < B(4)[0] + .38 * (B(4)[1] - B(4)[0]) ? front(st.A.fqih, 'head', 1) : 'kid2' },
  kid2: { at: [200, 785], face: [220, 770], seed: 4, talk: 0, look: (t, st) => t < B(4)[0] + 2.2 ? 'fqih' : basinGaze(st, 0) },
  mohammed: { at: [345, 785], face: [275, 770], seed: 3, talk: 0, look: (t, st) => t < B(4)[0] + 2.5 ? 'fqih' : basinGaze(st, 1), lookMax: .55 },
  // the two other boys wait their turn behind, listening to the master (they stay in the room for the whole beat)
  kid1: { at: [520, 765], face: [760, 850], seed: 2, talk: 0, look: 'fqih', lookMax: .6 },
  kid3: { at: [640, 775], face: [760, 850], seed: 6, talk: 0, look: 'fqih', lookMax: .6 },
}, {
  act(lt, t, S, st, S3) {
    const { fqih: fq, kid2, mohammed: mo, kid1, kid3 } = st.A, kf = k(fq);
    // the finger to the lips (index straight, other fingers curled), held, then lowered
    const sh = 1 - sm(B(4)[0] + .3 * (B(4)[1] - B(4)[0]), B(4)[0] + .42 * (B(4)[1] - B(4)[0]), t);
    fq.group.rotation.y = -.2 - .3 * (1 - sh); fq.group.updateMatrixWorld(true);   // after the gesture he turns 3/4 toward the boys at the fountain
    // not stiff: hands folded low, a slow breath and a small weight shift once the finger comes down
    foldHands(fq, t, 0, 1);
    fq.B.spine.rotation.z += .02 * Math.sin(t * .9); upd(fq, 'spine');
    for (const [a, ph] of [[kid1, 1.1], [kid3, 2.3]]) { foldHands(a, t, ph); a.B.spine.rotation.z += .03 * Math.sin(t * .8 + ph); upd(a, 'spine'); }
    if (sh > 0) {
      const lips = at(fq, 'head', [-.04, .0, .17]);
      const palm = lips.clone().add(V(0, -.09 * kf, 0)).addScaledVector(dirW(fq, 0, 0, 1), .025 * kf);
      PO.reach(fq, 'R', at(fq, 'handR').lerp(palm, sh), { grip: 0, pole: [-.32, .05, -.12] });
      PO.fingers(fq, 'R', .95 * sh, { thumb: .6 * sh, each: [1, 0, 1, 1, 1] });
      const index = fq.B.RightHandIndex3;
      if (index) IK.aim(fq.B.handR, IK.wpos(index), lips);
    }
    // Fixed targets on the painted basin, not chest-relative reaches out into the empty room.
    st.water ||= [[180, 785], [320, 790]].map(p => S3.floorAt(...p).setY(.43));
    const wash = (a, d, ph, water, dur) => {
      const ka = k(a), u = sm(B(4)[0] + d, B(4)[0] + d + .8, t) * (1 - sm(B(4)[0] + d + dur, B(4)[0] + d + dur + .6, t));   // r16: one boy at the basin at a time
      // Stand within an arm's reach of the rim, measured in world metres, at the entrance shot's scale.
      // He stands BESIDE the basin, three-quarters to the lens: before the wash he faces the master (the look target), then
      // turns to the water as he starts, so neither his back nor a 150 degree head twist is ever toward us.
      const yaw1 = yawTo(a.group.position, fq.group.position), yaw2 = -1.15, turn = sm(B(4)[0] + d - .1, B(4)[0] + d + .6, t);
      const yawW = yaw1 + Math.atan2(Math.sin(yaw2 - yaw1), Math.cos(yaw2 - yaw1)) * turn;
      a.group.rotation.y = yaw2; a.group.updateMatrixWorld(true);
      a.group.position.copy(water).setY(0).addScaledVector(dirW(a, 0, 0, -1), .8 * ka);
      a.group.rotation.y = yawW; a.group.updateMatrixWorld(true);
      if (u <= 0) { foldHands(a, t, ph); return; }
      a.B.spine.rotation.set(1.15 * u, 0, 0); a.B.chest.rotation.set(0, 0, 0);
      a.B.spine.position.applyAxisAngle(V(1, 0, 0), 1.15 * u); upd(a, 'spine');
      for (const [s, q] of [['L', 0], ['R', Math.PI]]) {
        const c = Math.cos(t * 4.2 + ph + q) * .035, e = Math.sin(t * 4.2 + ph + q) * .04;
        const target = water.clone().add(V((s === 'L' ? -.025 : .025) * ka + c, e, 0));
        PO.reach(a, s, at(a, 'hand' + s).lerp(target, u ** 3), { grip: .015, pole: [s === 'L' ? .5 : -.5, 0, .1] });   // R23A elbows out of the torso   // lower the torso before extending to the water
      }
    };
    wash(kid2, 1.9, 0, st.water[0], 5.2); wash(mo, 8.2, 1.3, st.water[1], 4.8);   // R28: one boy at the basin at a time (they clipped)   // both are at the basin through the middle of the beat (39.4 s)
  },
}), STANDING);

// ---------------------------------------------------------------- b015 prayer rows behind the master
const ROW = [['kid1', 820, 2], ['kid2', 1060, 4], ['mohammed', 1300, 3], ['kid3', 1540, 6]];
// The qibla is the left-hand wall: rows seen from behind and three-quarters, so every face stays within reach of the lens.
const QIBLA = Math.PI;   // straight away from the lens: a row of backs behind the leading fqih
const pray = sized(checkedStage('mausolee', {
  fqih: { at: [1180, 730], face: QIBLA, seed: 9, talk: 0, backOk: true },
  ...Object.fromEntries(ROW.map(([n, x, seed]) => [n, { at: [x, 915], face: QIBLA, seed, talk: 0, backOk: true }])),
}, {
  act(lt, t, S, st, S3) {
    const [t0, t1] = B(5), D = t1 - t0;
    const ruku = lag => sm(t0 + .2 * D + lag, t0 + .2 * D + lag + .75, t) * (1 - sm(t0 + .68 * D + lag, t0 + .68 * D + lag + .75, t));
    const all = [['fqih', 0], ...ROW.map(([n]) => [n, .12])];
    st.G.apply = () => {};   // all five keep their heads aligned with the qibla
    // r16: backs to the lens whatever the camera yaw is (the reviewer wants a row of backs behind the fqih)
    for (const n of ['fqih', ...ROW.map(r => r[0])]) { const a = st.A[n]; a.group.rotation.y = yawTo(a.group.position, S3.cam.position) + Math.PI + (({ kid1: .06, kid2: -.05, mohammed: .04, kid3: -.07 })[n] || 0); a.group.updateMatrixWorld(true); }
    for (const [n, lag] of all) {
      const a = st.A[n], ka = k(a), r = ruku(lag);
      // Leave the root, straight legs and feet in their standing pose throughout the bow.
      // Rotate BOTH the spine offset and its orientation about the hip, giving a level back at full ruku.
      const hinge = 1.42 * r;
      a.B.spine.rotation.set(hinge, 0, 0); a.B.chest.rotation.set(0, 0, 0);
      a.B.spine.position.applyAxisAngle(V(1, 0, 0), hinge);
      a.B.neck.rotation.set(-.3 * r, 0, 0); a.B.head.rotation.set(-.35 * r, 0, 0); upd(a, 'spine');   // r16: head straight ahead (back to the lens)
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
        const fold = front(a, 'chest', .17 * ka, (s === 'L' ? -.02 : .03) * ka, (s === 'L' ? -.16 : -.13) * ka);
        PO.reach(a, s, fold.lerp(kn, r), { grip: 0, pole: [(s === 'L' ? 1 : -1) * (.3 - .1 * (1 - r)), .05, .25] });   // qiyam: a little less flared than before
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
    b012: { shot: 'fl', size: 'W', on: 'woman2', cover: [{ f: .06, size: 'W', on: 'fatma' }, { f: .41, size: 'W', on: 'woman2' }, { f: .57, size: 'W', on: 'fatma' }] },   // whoever is on the near half of the lap leads the frame
    b013: { shot: 'br', size: 'M', on: 'mohammed', z: 1.6, dx: 0, dy: 0, cover: [{ f: .35, size: 'M', on: 'mohammed', z: 2.05, dx: 0, dy: -10 }] },
    b014: { shot: 'ab', size: 'M', on: 'fqih', z: 1.25, dx: 70, dy: -90, cover: [{ f: .38, size: 'W', on: 'mohammed' }] },
    b015: { shot: 'pray', size: 'W', on: 'mohammed' },
  },
});
