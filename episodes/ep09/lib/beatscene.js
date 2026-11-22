// beatscene.js: builds an ep08 scene module from beats.json + timing.json, so a scene file only stages its shots.
//   export default beatScene('s03_tambourins', { shots: { ch: sh1, tr: sh2 }, plan: { b004: { shot: 'ch' }, ... } })
// Per beat j (= line j of the scene; title beats with no line skipped):
//   - the beat's shot from the start of line j (plan.shot: a shot key, 'black', or a still id),
//   - its inserts (beats.json `ins` [[name, seconds]]) back to back from plan.insAt (fraction of the line, default .12),
//     then back to the shot (or plan.after: 'black' / another key),
//   - coverage (E2 cover crops): a cut to the beat's size on plan.on (default: the speaker if on screen, else cast[0])
//     at the line start, plus plan.cover [{ f (fraction of the line), size, on }] for cuts inside the beat.
// pre: what fills the time before the first line ('black' or a shot key; default the first beat's shot).
import * as THREE from 'three';
import * as K from '../../../engine/core.js';
import * as IK from '../../../engine/ik.js';
import * as PO from '../../../engine/poses.js';
import { rest, idlePose } from '../../../engine/rig3d.js';
import { make, ac, st } from '../scenes/_pt.js';
import { all, breathe } from '../scenes/_3d.js';
const { c, W, H } = K;

export const BEATS = (await (await fetch(new URL('../beats.json', import.meta.url))).json()).beats;
export const TIMING = await (await fetch(new URL('../timing.json', import.meta.url))).json();
export const ENUM = await fetch(new URL('../enum.json', import.meta.url)).then(r => r.ok ? r.json() : {}).catch(() => ({}));
const INS = { flash_facade_feerie: 'flash_facade' };
export const insId = n => 'i_' + (INS[n] || n);

/** scene-local line spans [[t0, t1], ...] of ALL the scene's lines (v2 order) */
export function allLines(id) { const s = TIMING.find(x => x.id === id); return s.lines.map(l => [l.start - s.start, l.start - s.start + l.dur]); }
/** the v1 lines only (beats without new: true): scene code written for v1 keeps indexing L[j] by its v1 line number */
export function lines(id) { const bs = beatsOf(id); return allLines(id).filter((_, j) => !bs[j]?.new); }
export const sceneDur = id => { const s = TIMING.find(x => x.id === id); return s.end - s.start; };
export const beatsOf = id => { const n = TIMING.find(x => x.id === id).lines.length; return BEATS.filter(b => b.scene === id && !(b.mode === 'title' && !n)); };

/** a black frame (smash cuts, the silence after "la plus belle nuit") */
export const black = () => { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#000'; c.fillRect(0, 0, c.canvas.width, c.canvas.height); c.restore(); return { vignette: 0, paper: 0, grain: 0 }; };

const SZ = { W: 'W', M: 'M', CU: 'CU' };
export function beatScene(id, { shots = {}, plan = {}, pre, fadeIn, fadeOut, plate, extra = [] }) {
  const bs = beatsOf(id), L = allLines(id), segs = [], covers = {};
  let cur = null;   // key of the segment on screen (a new beat on the same shot/still adds no cut: stills would restart their move)
  const segFor = (key, at, o = {}) => key === 'black' ? ac(at, black, o) : shots[key] ? ac(at, shots[key].fn, { ...o, at }) : { ...st(key, at, o.move, {}, o.fx), ...(o.dissolve ? { dissolve: true } : {}) };
  const cut = (key, t, size, on, o = {}) => { if (shots[key]) (covers[key] ||= []).push({ t, size: SZ[size] || 'M', on, ...(o.z != null ? { z: o.z } : {}), ...(o.dx != null ? { dx: o.dx } : {}), ...(o.dy != null ? { dy: o.dy } : {}), ...(o.pt ? { pt: o.pt } : {}), ...(o.zTo != null ? { zTo: o.zTo, push: o.push || 4 } : {}) }); };   // zTo/push: slow push-in over push seconds   // plan z/dx/dy: hand-set framing
  const who = b => { const p = plan[b.id] || {}; return p.on || (b.cast?.includes(b.speaker) && !b.speaker_off ? b.speaker : b.cast?.[0]); };
  // v2: a new beat with no plan stays on its still (paintings) or the previous beat's shot (the next one's at a scene start)
  const keyOf = (b, j) => plan[b.id]?.shot ?? b.still ?? (b.new ? (j > 0 ? keyOf(bs[j - 1], j - 1) : keyOf(bs.find(x => !x.new) || {}, 1)) : Object.keys(shots)[0]);
  if (pre !== undefined || (L[0] && L[0][0] > .3)) {
    const k = pre ?? keyOf(bs[0], 0); segs.push(segFor(k, [0, 0])); cur = k;
    cut(k, 0, plan[bs[0]?.id]?.preSize || plan[bs[0]?.id]?.size || bs[0]?.size, who(bs[0]), plan[bs[0]?.id] || {});   // stills11/13: the pre-roll used beats.json's size, not the plan's
  }
  bs.forEach((b, j) => {
    const p = plan[b.id] || {}, key = keyOf(b, j), [t0, t1] = L[j] || [0, 0], D = Math.max(.1, t1 - t0);
    let a = p.insAt ?? .12;
    const same = key === cur && ((b.new && !plan[b.id]) || (!shots[key] && key !== 'black' && !p.move && !p.at));   // no re-push of the still already on screen
    if (!(b.ins?.length && !p.noIns && a < .02) && !same) { segs.push(segFor(key, [j, p.at ?? 0], p)); cur = key; }   // an insert right on the line start replaces the opening shot
    cut(key, t0, p.size || b.size, who(b), p);
    for (const x of p.cover || []) cut(x.shot || key, t0 + x.f * D, x.size, x.on, x);
    if (b.ins?.length && !p.noIns) {
      const en = ENUM[b.id];   // enumeration: insert k cuts in ON item k's word (needs as many inserts as items, or fewer)
      b.ins.forEach(([n, d], k) => {
        if (en?.[k] && !p.insAt) a = Math.max(a, (en[k][0] - .08) / D);
        segs.push(st(insId(n), [j, a], p.insMove || 'push')); a += d / D; cur = null;
      });
      if (en && b.ins.length < en.length && !p.insAt) a = Math.max(a, (en[b.ins.length][0] - .08) / D);   // back to the shot on the next item
      if (a < .97) { segs.push(segFor(p.after || key, [j, a], p)); cur = p.after || key; }
    }
    for (const [f, k, o] of p.segs || []) { segs.push(segFor(k, [j, f], o)); cur = k; }   // extra cuts inside the beat: [fraction, key|'black'|still, opts]
  });
  segs.push(...extra);
  return make({
    preload: async () => {
      await all(...Object.values(shots))();
      for (const [k, sh] of Object.entries(shots)) if (!sh.ownCover && covers[k]) sh.cover = covers[k].sort((x, y) => x.t - y.t);
    },
    segs, plate, fadeIn, fadeOut,
  });
}

// ---------------------------------------------------------------- staging helpers
export const V = (x, y, z) => new THREE.Vector3(x, y, z);
export const yawTo = (from, to) => Math.atan2(to.x - from.x, to.z - from.z);
export const sm = (a, b, x) => K.ease(K.clamp((x - a) / (b - a)));
/** the world height of a painted vertical feature standing on floor px (fx, fy) whose top is painted at canvas y = topPy */
export function heightAt(S3, fx, fy, topPy) {
  const f = S3.floorAt(fx, fy); let lo = 0, hi = 6;
  for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; (S3.project(V(f.x, m, f.z))[1] > topPy ? lo = m : hi = m); }
  return (lo + hi) / 2;
}
/** floor point straight under a painted overhead feature at canvas (px, py) hanging H metres up (a chandelier ring) */
export function hangAt(S3, px, py, H) {
  let best = null, e = 1e9;   // scan the floor rows: the one whose point H metres up lands on py
  for (let m = 0; m <= 1080; m += 1) { const f = S3.floorAt(px, m); if (!f) continue; const d = Math.abs(S3.project(V(f.x, H, f.z))[1] - py); if (d < e) { e = d; best = f; } }
  return best;
}
/** add an actor standing on floor px (x, y), facing a world point (or a yaw in radians) */
export function put(S3, a, px, py, face) {
  const p = S3.floorAt(px, py), yaw = typeof face === 'number' ? face : yawTo(p, face);
  S3.add(a, p.x, p.z, yaw); a.home = p; return p;
}
/** standing idle: rest pose + idle sway + breathing (contact-free bones only), and an optional look target */
export function idle(a, t, seed = 0, target, amt = .8) {
  rest(a.B); idlePose(a.B, t + seed * 1.7, 1); breathe(a, t, 1, seed);
  if (target) PO.look(a, target, amt);
}
/** world point of a bone (+ a local offset in model units) */
export const at = (a, bone, off) => IK.wpos(a.B[bone], off);
/** actor-frame direction (x right, z forward) to world */
export const dirW = (a, x, y, z) => V(x, y, z).normalize().applyAxisAngle(V(0, 1, 0), a.group.rotation.y);
/** point in front of an actor: from bone, fwd/right/up metres in the actor's frame */
export const front = (a, bone, f = 0, r = 0, u = 0) => at(a, bone).addScaledVector(dirW(a, 0, 0, 1), f).addScaledVector(dirW(a, -1, 0, 0), r).add(V(0, u, 0));
/** orient a grip-origin prop: origin at p, local +y along dir, local +z as close as possible to up2 */
export function orient(o, p, dir, up2 = V(0, 0, 1)) {
  const y = dir.clone().normalize(), x = y.clone().cross(up2).normalize(), z = x.clone().cross(y);   // right-handed (det +1)
  o.position.copy(p); o.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z)); o.updateMatrixWorld(true);
}
