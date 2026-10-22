// Stage3D: one metric three.js scene per shot, locked to a painted plate.
//  - units are metres; the floor is y = 0; +z comes toward the camera of a frontal plate
//  - the camera is calibrated to the plate (camera height, horizon line in plate px, vertical FOV)
//  - actors and props share one depth buffer, so a body behind a tabla is hidden by the tabla itself (no cut lines)
//  - the floor is a shadow catcher: real contact shadows under bodies, glasses, trays
//  - the 3D layer is drawn in plate space [0,1920]x[0,1080], so K.camera() pans/zooms move plate and 3D together
// Replaces ep04's place() cutouts and sitting() clipping (episodes/ep04/lib/kit.js).
import * as THREE from 'three';
import { loadRigged, rest } from './rig3d.js';
import { SPECS } from './specs.js';
import { c, W, H, INK } from './core.js';

const D2R = Math.PI / 180;
let gl;
const lay = new OffscreenCanvas(W, H), lk = lay.getContext('2d');
const inkC = new OffscreenCanvas(W, H), ik = inkC.getContext('2d');

function renderer() {
  if (gl) return gl;
  gl = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  gl.setSize(W, H, false); gl.setClearColor(0, 0); gl.outputColorSpace = THREE.SRGBColorSpace;
  gl.shadowMap.enabled = true; gl.shadowMap.type = THREE.PCFSoftShadowMap;
  return gl;
}

// ---------------------------------------------------------------- actors (metric)
/** standing heights in metres (overridable per spec with S.height) */
export const heightOf = S => S.height ?? (S.child ? 1.15 : 1.62);
const cache = {};
/** a rigged actor at real height. seat:true = robe weights that fold for floor sitting (use a separate copy for walking) */
export async function cast(name, { seat = false, copy = 0, outline = .0035 } = {}) {
  const id = `${name}#${copy}${seat ? 's' : ''}`;
  if (cache[id]) return cache[id];
  const S = SPECS[name]; if (!S) throw new Error('no spec for ' + name);
  const a = await loadRigged(`/art/models/${S.file}`, S, { outline, tint: S.tint, seat });
  a.name = name; a.S = S; a.seat = seat; a.group.scale.setScalar(heightOf(S));
  a.group.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = false; } });
  return cache[id] = a;
}

// ---------------------------------------------------------------- the stage
export function stage() {
  renderer();
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(40, W / H, .05, 80);
  const key = new THREE.DirectionalLight(0xfff0dc, 2.2), fill = new THREE.HemisphereLight(0xcfd8ff, 0x7a6450, 1.4), rim = new THREE.DirectionalLight(0xffd9a0, 0);
  key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -.0006; key.shadow.normalBias = .02;
  scene.add(key, key.target, fill, rim);
  const catcher = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ color: 0x1a0c23, opacity: .32 }));
  catcher.rotation.x = -Math.PI / 2; catcher.receiveShadow = true; scene.add(catcher);
  const S = { scene, cam, key, fill, rim, catcher, actors: new Set(), cal: null };

  /**
   * calibrate the camera to a plate.
   * cal = { h: camera height (m), horizon: horizon line y in plate px (0..1080), fov: vertical FOV of the painting (deg),
   *         x, z: camera ground position (default 0, 0), yaw: turn left/right (deg, + = look left), crop: plate crop (.035) }
   * The plate prompt states h / horizon / fov; we read the same numbers here.
   */
  S.calibrate = cal => {
    S.cal = cal = { x: 0, z: 0, yaw: 0, crop: .035, ...cal };
    const fov = 2 * Math.atan(Math.tan(cal.fov * D2R / 2) * (1 - 2 * cal.crop));      // the cropped border narrows the view
    const f = (H / 2) / Math.tan(fov / 2), pitch = Math.atan((cal.horizon - H / 2) / f); // horizon above centre = looking down
    cam.fov = fov / D2R; cam.aspect = W / H; cam.updateProjectionMatrix();
    cam.position.set(cal.x, cal.h, cal.z); cam.rotation.set(0, 0, 0, 'YXZ'); cam.rotation.order = 'YXZ';
    cam.rotation.y = cal.yaw * D2R; cam.rotation.x = pitch; cam.updateMatrixWorld(true);
    return S;
  };
  /** free camera (for shots without a plate, or a 3D move between plates) */
  S.lookAt = (pos, at, fovDeg = cam.fov) => { cam.fov = fovDeg; cam.updateProjectionMatrix(); cam.position.set(...pos); cam.lookAt(...at); cam.updateMatrixWorld(true); return S; };

  /** plate px -> world point on the floor (or on a plane y = height): place things where the painting shows them */
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  S.floorAt = (px, py, y = 0) => {
    ndc.set(px / W * 2 - 1, 1 - py / H * 2); ray.setFromCamera(ndc, cam);
    const t = (y - ray.ray.origin.y) / ray.ray.direction.y; return t > 0 ? ray.ray.origin.clone().addScaledVector(ray.ray.direction, t) : null;
  };
  /** world -> plate px */
  S.project = v => { const p = (v.isVector3 ? v.clone() : new THREE.Vector3(...v)).project(cam); return [(p.x + 1) / 2 * W, (1 - p.y) / 2 * H, p.z]; };

  /**
   * light rig from the plate prompt.
   * L = { key: hex, keyI, dir: [x,y,z] (direction the light COMES FROM), sky, ground, fillI, rim, rimI, rimDir,
   *       shadow: opacity of floor shadows (0..1), soft: shadow blur radius, area: [half-size of the shadow box] }
   */
  S.light = (L = {}) => {
    key.color.set(L.key ?? 0xfff0dc); key.intensity = L.keyI ?? 2.2;
    const d = new THREE.Vector3(...(L.dir ?? [-2, 3, 2.5])).normalize().multiplyScalar(12), ctr = new THREE.Vector3(...(L.center ?? [0, 0, 0]));
    key.position.copy(ctr).add(d); key.target.position.copy(ctr); key.target.updateMatrixWorld();
    const A = L.area ?? 4, sc = key.shadow.camera; sc.left = sc.bottom = -A; sc.right = sc.top = A; sc.near = .5; sc.far = 30; sc.updateProjectionMatrix();
    key.shadow.radius = L.soft ?? 4; catcher.material.opacity = L.shadow ?? .32;
    fill.color.set(L.sky ?? 0xcfd8ff); fill.groundColor.set(L.ground ?? 0x7a6450); fill.intensity = L.fillI ?? 1.4;
    rim.color.set(L.rim ?? 0xffd9a0); rim.intensity = L.rimI ?? 0; rim.position.set(...(L.rimDir ?? [2, 2, -3]));
    return S;
  };

  /** put an actor on stage at world (x, z), facing yaw (rad, 0 = toward +z / the camera of a frontal plate) */
  S.add = (a, x = 0, z = 0, yaw = 0) => { if (!S.actors.has(a)) { S.actors.add(a); scene.add(a.group); } a.group.position.set(x, 0, z); a.group.rotation.set(0, yaw, 0); rest(a.B); return a; };
  S.remove = a => { S.actors.delete(a); scene.remove(a.group); };
  /** a prop (Object3D from props3d.js) */
  S.prop = (o, x = 0, y = 0, z = 0, yaw = 0) => { if (!o.parent) scene.add(o); o.position.set(x, y, z); o.rotation.y = yaw; return o; };
  /** invisible depth-only blocker for something painted in the plate that stands in front of the 3D (a pillar, a door jamb) */
  S.holdout = (geo, x, y, z) => { const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ colorWrite: false })); m.position.set(x, y, z); m.renderOrder = -1; scene.add(m); return m; };

  /**
   * render the 3D layer and draw it over what is already on the 2D canvas (the plate), in plate space.
   * o = { ink: px of the silhouette ink around the whole layer (0 = only the 3D hull lines), alpha, grade: css colour laid source-atop }
   */
  // o.view = { x, y, z }: the 2D camera crop of this frame (what K.camera shows). The GL pass then renders only that
  // rectangle at full resolution (setViewOffset) instead of the whole plate upscaled by the 2D zoom (soft close-ups).
  S.draw = (o = {}) => {
    scene.updateMatrixWorld(true);
    const v = o.view && o.view.z > 1.01 ? o.view : null, pad = 8;   // pad: K.camera's handheld drift moves the frame a few px
    const rx = v ? v.x - W / 2 / v.z - pad : 0, ry = v ? v.y - H / 2 / v.z - pad : 0, rw = v ? W / v.z + 2 * pad : W, rh = v ? H / v.z + 2 * pad : H;
    if (v) cam.setViewOffset(W, H, rx, ry, rw, rh);
    gl.render(scene, cam); gl.getContext().finish();
    if (v) cam.clearViewOffset();
    lk.clearRect(0, 0, W, H); lk.drawImage(gl.domElement, 0, 0, W, H);
    if (o.grade) { lk.globalCompositeOperation = 'source-atop'; lk.fillStyle = o.grade; lk.fillRect(0, 0, W, H); lk.globalCompositeOperation = 'source-over'; }
    c.save(); if (o.alpha != null) c.globalAlpha *= o.alpha;
    const px = (o.ink ?? 2.2) * (v ? v.z : 1);   // ink width in screen px: the crop is drawn back at 1/z
    if (px > 0) {
      ik.globalCompositeOperation = 'source-over'; ik.clearRect(0, 0, W, H);
      for (let i = 0; i < 8; i++) { const an = i / 8 * Math.PI * 2; ik.drawImage(lay, Math.cos(an) * px, Math.sin(an) * px); }
      ik.globalCompositeOperation = 'source-in'; ik.fillStyle = o.inkCol || INK; ik.fillRect(0, 0, W, H);
      c.drawImage(inkC, rx, ry, rw, rh);
    }
    c.drawImage(lay, rx, ry, rw, rh);
    c.restore();
  };

  /** screen anchors of an actor (plate px) for faceFX / speech / FX, same shape as actors.place() */
  S.anchors = a => {
    const Sp = a.S, wp = (bone, off = [0, 0, 0]) => a.B[bone].localToWorld(new THREE.Vector3(...off));
    const pr = v => S.project(v).slice(0, 2), headAbs = [0, Sp.head, 0], rel = p => [p[0] - headAbs[0], p[1] - headAbs[1], p[2]];
    const hsz = (Sp.headR ?? .09) * (Sp.top - Sp.bottom);
    const top = pr(wp('head', [0, hsz * .8, 0])), base = pr(wp('head', [0, 0, 0]));
    const out = { head: [...top, Math.abs(base[1] - top[1]) * 1.2], handL: pr(wp('handL')), handR: pr(wp('handR')) };
    if (Sp.face) {
      const m = Sp.face.eyeR_ * a.group.scale.y / (Sp.top - Sp.bottom);   // eye radius in metres
      // skin just below each eye, sampled from the last rendered layer (for the painted eyelids)
      const skinAt = v => { const [x, y] = pr(v.clone().add(new THREE.Vector3(0, -m * 2.2, 0))); const d = lk.getImageData(Math.max(0, Math.min(W - 1, x | 0)), Math.max(0, Math.min(H - 1, y | 0)), 1, 1).data; return `rgb(${d[0]},${d[1]},${d[2]})`; };
      const F = Sp.face, eL = wp('head', rel(F.eyeL)), eR = wp('head', rel(F.eyeR)), mo = wp('head', rel(F.mouth));
      const fwd = wp('head', [0, 0, 1]).sub(wp('head')).normalize(), toCam = cam.position.clone().sub(wp('head')).normalize();
      const dist = cam.position.distanceTo(eL), fpx = (H / 2) / Math.tan(cam.fov * D2R / 2);
      // per eye: hidden once the head turns that eye away (> ~45°), so a far-eye lid decal never lands off the face in profile
      const mid = eL.clone().add(eR).multiplyScalar(.5), side = e => e.clone().sub(mid).normalize().dot(toCam), fc = fwd.dot(toCam);
      out.face = { eyeL: pr(eL), eyeR: pr(eR), mouth: pr(mo), eyePx: m * fpx / dist * .92, facing: fc, eyeVis: [fc + side(eL) > .05, fc + side(eR) > .05], beard: F.beard, veil: F.veil, skinL: skinAt(eL), skinR: skinAt(eR), roll: a.B.head.rotation.z };
    }
    return out;
  };
  return S;
}
