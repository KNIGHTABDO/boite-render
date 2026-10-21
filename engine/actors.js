// Actors: rigged 3D characters rendered as ink-outlined cutouts and composited onto the painted 2D sets.
// One shared WebGL renderer draws each actor into its own square frame; the frame is then placed
// on the 2D canvas at a ground point with a painted-perspective height.
import * as THREE from 'three';
import { loadRigged, rest, walkPose, idlePose } from './rig3d.js';
import { c, T, W, H, INK, clamp, noise, rgba, radial } from './core.js';
import { SPECS } from './specs.js';

const R = 768;                                  // actor frame size (px)
let gl, scene, cam, key, fill, rim;
function setup() {
  if (gl) return;
  gl = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  gl.setSize(R, R); gl.setClearColor(0, 0); gl.outputColorSpace = THREE.SRGBColorSpace;
  scene = new THREE.Scene(); cam = new THREE.PerspectiveCamera(20, 1, .05, 50);
  key = new THREE.DirectionalLight(0xfff0dc, 2.2); fill = new THREE.HemisphereLight(0xcfd8ff, 0x7a6450, 1.5); rim = new THREE.DirectionalLight(0xffd9a0, 0);
  scene.add(key, fill, rim);
}

const cache = {};
/** load (once) a rigged actor by cast name; clone = extra copies of the same model (kids at the msid...) */
export async function actor(name, copy = 0) {
  const id = name + '#' + copy;
  if (cache[id]) return cache[id];
  setup();
  const S = SPECS[name]; if (!S) throw new Error('no spec for ' + name);
  const a = await loadRigged(`/art/models/${S.file}`, S, { outline: 0, tint: S.tint });
  a.name = name; a.S = S; scene.add(a.group); a.group.visible = false;
  cache[id] = a; return a;
}
export async function preload(names) { for (const n of names) { const [a, k] = n.split('#'); await actor(a, +(k || 0)); } }

// ink silhouette buffer
const inkCv = new OffscreenCanvas(R, R), ik = inkCv.getContext('2d');
const tmp = new OffscreenCanvas(R, R), tk = tmp.getContext('2d');

/**
 * Pose + render + composite an actor.
 *  a      : actor from actor()
 *  X, Y   : ground point on the 2D canvas (current transform applies)
 *  hpx    : on-screen height in px (standing height; seated actors keep this scale)
 *  o      : { yaw, elev (camera height 0..1.2 = eye level..above), pose(B) callback, light:{key,fill,rim,dir}, ink, shadow, alpha, tint, flip }
 * Returns screen anchors { head:[x,y,r], mouth:[x,y], hand L/R:[x,y] } in the current 2D space.
 */
export function place(a, X, Y, hpx, o = {}) {
  for (const k in cache) cache[k].group.visible = false;
  a.group.visible = true;
  rest(a.B);
  if (o.pose) o.pose(a.B, a);
  a.group.rotation.y = o.yaw ?? 0;
  a.group.position.set(0, 0, 0);
  // camera frames a 1.4-unit tall window around the actor; elev raises the camera (looking down)
  const elev = o.elev ?? .55, dist = 4.2;
  cam.position.set(Math.sin(o.orbit ?? 0) * dist, elev + .1, Math.cos(o.orbit ?? 0) * dist); cam.lookAt(0, .55, 0);
  // light: default warm key from the upper left
  const L = o.light || {};
  key.color.set(L.key ?? 0xfff0dc); key.intensity = L.keyI ?? 2.2; key.position.set(...(L.dir ?? [-2, 3, 2.5]));
  fill.color.set(L.sky ?? 0xcfd8ff); fill.groundColor.set(L.ground ?? 0x7a6450); fill.intensity = L.fillI ?? 1.5;
  rim.color.set(L.rim ?? 0xffd9a0); rim.intensity = L.rimI ?? 0; rim.position.set(...(L.rimDir ?? [2, 2, -3]));
  a.group.updateMatrixWorld(true);
  gl.render(scene, cam);
  gl.getContext().finish();

  // where the feet and head top land in the frame
  const pr = v => { const p = v.clone().project(cam); return [(p.x + 1) / 2 * R, (1 - p.y) / 2 * R]; };
  const [fx, fy] = pr(new THREE.Vector3(0, 0, 0)), [, hy] = pr(new THREE.Vector3(0, 1, 0));
  const s = hpx / (fy - hy);
  const dx = X - fx * s, dy = Y - fy * s;

  // contact shadow
  if (o.shadow !== false) { c.save(); c.fillStyle = `rgba(25,12,35,${o.shadowA ?? .3})`; c.beginPath(); c.ellipse(X, Y, hpx * (o.shadowW ?? .2), hpx * .035, 0, 0, 7); c.fill(); c.restore(); }

  // ink silhouette (12 offset copies tinted with ink), then the actor itself
  const m = c.getTransform(), sx = Math.hypot(m.a, m.b);
  const px = (o.ink ?? 2.4) / Math.max(.3, s * sx) ;
  tk.clearRect(0, 0, R, R); tk.drawImage(gl.domElement, 0, 0);
  if (o.mul) { tk.globalCompositeOperation = 'multiply'; tk.fillStyle = o.mul; tk.fillRect(0, 0, R, R); tk.globalCompositeOperation = 'destination-in'; tk.drawImage(gl.domElement, 0, 0); }
  if (o.grade) { tk.globalCompositeOperation = 'source-atop'; tk.fillStyle = o.grade; tk.fillRect(0, 0, R, R); }
  tk.globalCompositeOperation = 'source-over';
  if (o.ink !== 0) {
    ik.globalCompositeOperation = 'source-over'; ik.clearRect(0, 0, R, R);
    for (let i = 0; i < 8; i++) { const an = i / 8 * Math.PI * 2; ik.drawImage(tmp, Math.cos(an) * px, Math.sin(an) * px); }
    ik.globalCompositeOperation = 'source-in'; ik.fillStyle = o.inkCol || INK; ik.fillRect(0, 0, R, R);
  }
  c.save(); if (o.alpha != null) c.globalAlpha *= o.alpha;
  if (o.ink !== 0) c.drawImage(inkCv, dx, dy, R * s, R * s);
  c.drawImage(tmp, dx, dy, R * s, R * s);
  c.restore();

  // anchors (world bone points -> frame px -> 2D canvas)
  const S = a.S, headAbs = [0, S.head, 0];
  const wp = (bone, off = [0, 0, 0]) => a.B[bone].localToWorld(new THREE.Vector3(...off));
  const toScr = v => { const [x, y] = pr(v); return [dx + x * s, dy + y * s]; };
  const rel = p => [p[0] - headAbs[0], p[1] - headAbs[1], p[2]];
  const hsz = (S.headR ?? .09) * (S.top - S.bottom);
  const out = { head: [...toScr(wp('head', [0, hsz * .8, 0])), hpx * (S.headR ?? .09)], s, feet: [X, Y],
    handL: toScr(wp('handL', [0, -(S.wrist[1] - S.hand[1]) * .6, 0])), handR: toScr(wp('handR', [0, -(S.wrist[1] - S.hand[1]) * .6, 0])) };
  if (S.face) {
    const F = S.face, eL = wp('head', rel(F.eyeL)), eR = wp('head', rel(F.eyeR)), mo = wp('head', rel(F.mouth));
    // facing: how much the face points at the camera (0 = profile/back)
    const fwd = wp('head', [0, 0, 1]).sub(wp('head', [0, 0, 0])).normalize(), toCam = cam.position.clone().sub(wp('head', [0, 0, 0])).normalize();
    const facing = fwd.dot(toCam);
    const eyePx = F.eyeR_ / (S.top - S.bottom) * s * R / (2 * Math.tan(10 * Math.PI / 180) * cam.position.distanceTo(eL));
    // sample the skin just below each eye in the actor frame (for eyelids)
    const skinAt = v => { const [x, y] = pr(v.clone().add(new THREE.Vector3(0, -F.eyeR_ * 2.2, 0))); const d = tk.getImageData(Math.max(0, Math.min(R - 1, x | 0)), Math.max(0, Math.min(R - 1, y | 0)), 1, 1).data; return `rgb(${d[0]},${d[1]},${d[2]})`; };
    out.face = { eyeL: toScr(eL), eyeR: toScr(eR), mouth: toScr(mo), eyePx: eyePx * .92, facing, beard: F.beard, veil: F.veil, skinL: skinAt(eL), skinR: skinAt(eR), roll: a.group.rotation.z + a.B.head.rotation.z };
  }
  return out;
}

/**
 * Animate the painted face: eyelids (blink 0..1, lid = resting droop) and a lip-sync mouth (open 0..1).
 * f = anchors.face returned by place()
 */
export function faceFX(f, { blink = 0, lid = 0, open = 0, sad = 0 } = {}) {
  if (!f || f.facing < .25) return;
  const vis = Math.min(1, (f.facing - .25) / .2), r = f.eyePx;
  c.save(); c.globalAlpha *= vis;
  const cl = Math.max(blink, lid);
  if (cl > .02) for (const [e, skin, sd] of [[f.eyeL, f.skinL, -1], [f.eyeR, f.skinR, 1]]) {
    const [x, y] = e, rx = r * 1.35, ry = r * 1.2, edge = y - ry + 2 * ry * cl;
    c.save(); c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, 7); c.clip();
    c.fillStyle = skin; c.fillRect(x - rx, y - ry - 2, rx * 2, edge - (y - ry) + 2);
    c.restore();
    c.strokeStyle = INK; c.lineCap = 'round'; c.lineWidth = Math.max(1.2, r * .22);
    c.beginPath(); c.moveTo(x - rx * .95, y + (cl > .9 ? ry * .1 : 0) - sd * sad * r * .2); c.quadraticCurveTo(x, edge + (cl > .9 ? ry * .35 : ry * .15), x + rx * .95, y + (cl > .9 ? ry * .1 : 0) + sd * sad * r * .2); c.stroke();
  }
  if (open > .06 && !f.beard && !f.veil) {
    const [x, y] = f.mouth, w = r * (1.0 + open * .35), h = r * (.25 + open * 1.0);
    c.fillStyle = '#4a1818'; c.beginPath(); c.ellipse(x, y + h * .25, w, h * .55, 0, 0, 7); c.fill();
    if (open > .45) { c.fillStyle = 'rgba(248,242,232,.95)'; c.beginPath(); c.ellipse(x, y - h * .12, w * .78, h * .16, 0, Math.PI, 0); c.fill(); }
    c.fillStyle = 'rgba(200,90,100,.9)'; c.beginPath(); c.ellipse(x, y + h * .55, w * .55, h * .2, 0, 0, 7); c.fill();
    c.strokeStyle = 'rgba(90,30,30,.7)'; c.lineWidth = Math.max(1, r * .12); c.beginPath(); c.ellipse(x, y + h * .25, w, h * .55, 0, 0, 7); c.stroke();
  } else if (open > .06 && f.beard && !f.veil) {
    const [x, y] = f.mouth; c.fillStyle = 'rgba(40,15,15,.85)'; c.beginPath(); c.ellipse(x, y + r * .2, r * .9, r * (.15 + open * .6), 0, 0, 7); c.fill();
  }
  c.restore();
}

/** 2D mouth overlay for lip-sync: draws an opening over the painted mouth */
export function mouthOverlay(at, r, open, yaw = 0, col = '#3a1414') {
  if (open < .05) return;
  const [x, y] = at, w = r * .34 * (1 - Math.abs(yaw) * .4), h = r * (.06 + .22 * open);
  c.save(); c.translate(x + Math.sin(yaw) * r * .25, y);
  c.fillStyle = col; c.beginPath(); c.ellipse(0, h * .35, w, h, 0, 0, 7); c.fill();
  if (open > .4) { c.fillStyle = 'rgba(245,238,226,.9)'; c.beginPath(); c.ellipse(0, -h * .3, w * .8, h * .22, 0, 0, Math.PI, true); c.fill(); }
  c.fillStyle = 'rgba(190,80,90,.85)'; c.beginPath(); c.ellipse(0, h * .9, w * .55, h * .35, 0, 0, 7); c.fill();
  c.restore();
}

export { walkPose, idlePose };
