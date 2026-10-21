// _3d.js: metric 3D shots for the ep06 scenes (not a scene; film.js never loads it by id).
// A shot = one calibrated plate + one Stage3D + actors/props built ONCE at preload:
//   const sh = shot({ plate: 'patio_poisson', build: async (S3, cal) => ({ actors: [...], faces: [[a, 'fatma', 1]], ...state }),
//                     frame: (lt, u, t, S, st, S3) => { ...per-frame: PO.apply(a, st.pose), small additive motion... },
//                     view: (lt, u) => [x, y, zoom] (optional plate-space camera, K.camera via kit.cam), fx: {finish options} });
//   make({ preload: all(sh, ...), segs: [ac([0, 0], sh.fn), ...] })
// Rules (user: every movement calculated and verified):
//  - every contact pose is solved in build() with engine/poses.js, its error numbers stored on st.M, and re-applied each
//    frame with PO.apply (solvers are 0.3-0.6 s: never call them per frame);
//  - per-frame motion is ADDITIVE and small on bones that carry no contact (head, neck), or it re-solves a cheap IK
//    (IK.arm) against a target computed from the scene;
//  - the plate camera (view) moves plate and 3D together, so scale never drifts.
import * as THREE from 'three';
import * as K from '../../../engine/core.js';
import { plate, drawPlate } from '../../../engine/plates.js';
import { stage, cast, heightOf } from '../../../engine/stage3d.js';
import { faceFX } from '../../../engine/actors.js';
import { autoBlink } from '../../../engine/characters.js';
import { cam, clampCam } from '../lib/kit.js';
import * as PO from '../../../engine/poses.js';
import * as PR from '../../../engine/props3d.js';
import * as IK from '../../../engine/ik.js';
const { c } = K;

export const CAL = await (await fetch(new URL('../cal.json', import.meta.url))).json();
const EP05 = new Set(['msid_menage', 'msid_soupente', 'kissaria', 'kissaria_rev', 'rue_mosquee', 'rue_epices', 'rahma_pauvre']);   // this episode's own plates (art/plates/ep06/...)
export const platePath = name => (EP05.has(name) ? 'ep06/' : '') + name;
/** calibration numbers only (cal.json also stores notes and painted anchor points) */
export const calOf = name => { const k = CAL[name]; if (!k) throw new Error('no calibration for ' + name); return { h: k.h, horizon: k.horizon, fov: k.fov, x: k.x ?? 0, z: k.z ?? 0, yaw: k.yaw ?? 0 }; };

const CAST = (await (await fetch(new URL('../cast.json', import.meta.url))).json()).characters;
/** a cast.json role as a rigged actor: its own model + scale, its own copy (kid1/kid2 share a model but not a skeleton).
 *  a.name = the role, so cover: [{on: 'kid1'}] and faces use cast.json names. o: { seat, costume, copy } */
export async function role(name, o = {}) {
  const r = CAST[name] || { model: name }, model = (o.costume && r.costumes?.[o.costume]) || r.model;
  const a = await cast(model, { seat: o.seat, copy: name + (o.copy ?? '') });
  a.name = name; a.group.scale.setScalar(heightOf(a.S) * (r.scale || 1));
  return a;
}

/** mouth openness: real lipsync when the line has a wav, else a speech-like flap so unvoiced previews still talk */
export const mouth = (S, who, t) => {
  for (const l of S.lines) if (l.who === who && t >= l.t0 && t < l.t1) {
    if (l.env.length) return l.env[Math.floor((t - l.t0) * 24)] ?? 0;
    const n = K.noise((t - l.t0) * 9, who.length);
    return Math.round(K.clamp((n - .25) * 1.6) * 3) / 3;
  }
  return 0;
};

/** gentle breathing on the head/neck only (no contact bones), ~3 mm at the crown */
export function breathe(a, t, k = 1, seed = 0) {
  a.B.neck.rotation.x += Math.sin(t * 1.6 + seed) * .012 * k;
  a.B.head.rotation.x += Math.sin(t * 1.6 + seed + .7) * .01 * k;
  a.B.neck.updateWorldMatrix(false, true);
}

/** memo(key, [deps], fn): cache a slow solve (pose fits, grid searches, skin raycasts) across reloads and hot reloads.
 *  fn returns JSON-able data; THREE Vector3/Quaternion (also inside PO.snap objects) round-trip. The cache key is
 *  plate + key + deps: pass as deps every input the result depends on (positions, params, upstream results), so a
 *  change re-solves only what it touches. Bench only (localStorage); a fresh browser just solves. ?nocache disables it. */
let memoPrefix = '';
const noCache = typeof location !== 'undefined' && /[?&]nocache/.test(location.search);
const enc = function (k, v) { const o = this[k];   // the raw value: THREE.Quaternion.toJSON() runs before a replacer sees v
  return o?.isVector3 ? { $v: o.toArray() } : o?.isQuaternion ? { $q: o.toArray() } : typeof v === 'number' ? +v.toFixed(6) : v; };
const dec = (k, v) => v?.$v ? new THREE.Vector3().fromArray(v.$v) : v?.$q ? new THREE.Quaternion().fromArray(v.$q) : v;
export function memo(key, deps, fn) {
  if (typeof deps === 'function') [fn, deps] = [deps, []];
  const k = 'memo:' + memoPrefix + ':' + key + ':' + JSON.stringify(deps, enc);
  if (!noCache) try { const v = localStorage.getItem(k); if (v) return JSON.parse(v, dec); } catch {}
  const v = fn();
  try { localStorage.setItem(k, JSON.stringify(v, enc)); } catch {}
  return JSON.parse(JSON.stringify(v, enc), dec);   // same rounding on a miss as on a hit: cold and cached runs match
}
/** memoPose(key, a, deps, solve): run a pose solve once, cache the bone snapshot (+ solve()'s return value), re-apply it */
export function memoPose(key, a, deps, solve) {
  const r = memo(key, deps, () => { const out = solve(); return { out: out ?? null, s: PO.snap(a) }; });
  PO.apply(a, r.s); return r.out;
}

/** auto coverage (WORKFLOW-V2 E2): cover = [{ t, size: 'W'|'M'|'CU', on: actor name, dx, dy }] in scene-local seconds
 *  (scene time, not segment time), or cover = S => [...] to key it on the line timings (S.L(i)), resolved on first draw.
 *  Each entry is a hard cut to a framing on that actor's head (as placed by build), held still until the next entry.
 *  W = the plate's own framing; M = waist-up; CU = head and shoulders. view() still wins when it returns a camera. */
const SIZES = { W: [1, .5], M: [1.7, .32], CU: [2.6, .4] };   // zoom, head height on screen (fraction of H)
function coverCam(sh, t) {
  let e = null; for (const x of sh.cover) if (t >= x.t) e = x;
  if (!e || e.size === 'W' || !SIZES[e.size]) return null;
  const i = sh.st.actors.findIndex(a => a.name === e.on), h = sh.heads[Math.max(0, i)];
  const [z, hy] = SIZES[e.size];
  return [h[0] + (e.dx || 0), h[1] + (.5 - hy) * K.H / z + (e.dy || 0), z];
}
export function shot({ plate: name, light = {}, build, frame, view, cover, fx = {}, ink = 2.2, grade, over, under }) {
  const sh = { st: null, S3: null, img: null };
  sh.load = async () => {
    if (sh.st) return;
    sh.img = await plate(platePath(name));
    const S3 = sh.S3 = stage().calibrate(calOf(name)), cl = CAL[name].light || {};
    S3.light({ ...cl, ...light });
    memoPrefix = name;
    sh.st = (await build(S3, CAL[name])) || {};
    sh.st.actors ||= []; sh.st.faces ||= [];
    sh.place = sh.st.actors.map(a => [a.group.position.clone(), a.group.rotation.clone()]);   // restored each frame (shared casts)
    sh.heads = sh.st.actors.map(a => S3.project(IK.wpos(a.B.head)));   // coverage framing targets (fixed per shot: deterministic in chunked renders)
    sh.cover = cover;
  };
  sh.fn = (lt, u, t, S) => {
    const { st, S3, img } = sh;
    c.save();
    if (typeof sh.cover === 'function') sh.cover = sh.cover(S);
    const v = sh.v = view?.(lt, u, t) || (sh.cover && coverCam(sh, t));   // sh.v: last camera, for bench checks
    if (v) cam(...v);
    drawPlate(img);
    under?.(lt, u, t, S, st, S3);
    st.actors.forEach((a, i) => {   // a cast() actor may be shared with another shot: re-parent and put it back where this build placed it
      if (a.group.parent !== S3.scene) S3.scene.add(a.group);
      a.group.position.copy(sh.place[i][0]); a.group.rotation.copy(sh.place[i][1]); a.group.visible = true; a.group.updateMatrixWorld(true);
    });
    frame?.(lt, u, t, S, st, S3);
    S3.draw({ ink, grade: typeof grade === 'function' ? grade(lt, u, t) : grade, view: v && clampCam(v[0], v[1], v[2]) });
    for (const [a, who, seed, o = {}] of st.faces) {
      let vis = true; for (let p = a.group; p; p = p.parent) if (!p.visible) vis = false;   // a hidden actor leaves no floating eyes
      if (!vis) continue;
      const an = S3.anchors(a);
      faceFX(an.face, { blink: autoBlink(t, seed ?? 1), open: who ? mouth(S, who, t) : 0, ...(typeof o === 'function' ? o(lt, t) : o) });
    }
    over?.(lt, u, t, S, st, S3);
    c.restore();
    return { vignette: .5, paper: .24, ...fx };
  };
  return sh;
}

/** preload for make(): loads every shot (and anything else async) once */
export const all = (...xs) => async () => { for (const x of xs) await (x.load ? x.load() : x()); };   // sequential: one GL stage at a time (7.7 GB RAM)

/** blend two solved snapshots (PO.snap) bone by bone: k = 0 -> s0, 1 -> s1 (both poses verified, the path in between is a slerp) */
export function blend(a, s0, s1, k) {
  if (k <= 0) return PO.apply(a, s0);
  if (k >= 1) return PO.apply(a, s1);
  for (const n in s0) { const b = a.B[n], [p0, q0, k0] = s0[n], [p1, q1, k1] = s1[n]; b.position.lerpVectors(p0, p1, k); b.quaternion.slerpQuaternions(q0, q1, k); b.scale.lerpVectors(k0, k1, k); }
  a.group.updateMatrixWorld(true);
}

/** the robe colour of an actor: average texel under its vertices below the hips (cached) */
export function robeColor(a) {
  if (a.robeCol !== undefined) return a.robeCol;
  let mesh = null; a.group.traverse(o => { if (!mesh && o.isSkinnedMesh && o.material.map) mesh = o; });
  const im = mesh?.material.map.image; if (!im) return a.robeCol = 0xe6dccb;
  const w = 64, h = 64, cv = new OffscreenCanvas(w, h), g = cv.getContext('2d', { willReadFrequently: true }); g.drawImage(im, 0, 0, w, h);
  const px = g.getImageData(0, 0, w, h).data, pos = mesh.geometry.attributes.position, uv = mesh.geometry.attributes.uv, rgb = [0, 0, 0]; let k = 0;
  for (let i = 0; i < pos.count; i += 3) if (pos.getY(i) < a.S.hip && pos.getY(i) > a.S.knee) {
    const x = Math.min(w - 1, Math.max(0, uv.getX(i) * w | 0)), y = Math.min(h - 1, Math.max(0, (mesh.material.map.flipY ? 1 - uv.getY(i) : uv.getY(i)) * h | 0)), o = (y * w + x) * 4;
    rgb[0] += px[o]; rgb[1] += px[o + 1]; rgb[2] += px[o + 2]; k++;
  }
  if (!k) return a.robeCol = 0xe6dccb;
  return a.robeCol = new THREE.Color().setRGB(...rgb.map(v => v / k / 255), THREE.SRGBColorSpace).getHex();
}
/** robe cloth over the folded legs of a floor-sitting actor (the rig's lap sheet leaves the robe's dark inside visible) */
export function skirt(S3, a, seat, col = robeColor(a)) {
  // one low cloth drape from the waist to the floor that covers knees + feet (v1 was a dome + hem "egg sack")
  a.group.updateMatrixWorld(true);
  const W = n => IK.wpos(a.B[n]), hip = W('root').setY(seat), pts = ['shinL', 'shinR', 'footL', 'footR'].map(W);
  const knee = Math.max(seat + .04, Math.max(pts[0].y, pts[1].y) + .03);
  const fwd = pts[2].clone().add(pts[3]).multiplyScalar(.5).sub(hip).setY(0), len = Math.max(.15, fwd.length()) + .16;
  const wide = Math.max(pts[0].distanceTo(pts[1]), pts[2].distanceTo(pts[3])) / 2 + .08;
  // lathe profile (r, y): pinched at the waist, sagging over the knees, flaring onto the floor
  const prof = [[0, knee - seat - .01], [.5, knee - seat - .02], [.78, (knee - seat) * .55], [.94, (knee - seat) * .15], [1, .004], [1.03, 0]].map(([r, y]) => new THREE.Vector2(r, y));
  const m = new THREE.Mesh(new THREE.LatheGeometry(prof, 28), PR.toon(col)); m.receiveShadow = m.castShadow = true;
  m.material.side = THREE.DoubleSide;
  m.scale.set(wide, 1, len / 2); m.rotation.y = Math.atan2(fwd.x, fwd.z);
  m.position.copy(hip).addScaledVector(fwd.normalize(), len / 2 - .06);
  S3.scene.add(m); return m;
}

/** world point helpers */
export const V = (x, y, z) => new THREE.Vector3(x, y, z);
