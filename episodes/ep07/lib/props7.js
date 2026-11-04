// props7.js: ep07 hand props (metres, same toon look as engine/props3d.js). Origins are at the grip unless noted.
//   bendir     : goatskin frame drum, Ø 38 cm, 7 cm deep; origin at the centre, skin facing +z (userData.face)
//   tambourin  : cheap little tambourine with jingles, Ø 18 cm; same frame as the bendir
//   trompette  : painted tin toy trumpet, 30 cm; origin at the mouthpiece, bell along +y (userData.bell)
//   rasoir     : the barber's ebony straight razor, open; origin at the grip, blade along +y (userData.edge)
//   serviette  : the red-and-yellow striped towel wrapped to the chin; origin at the neck, hangs along -y
import * as THREE from 'three';
import * as PR from '../../../engine/props3d.js';

const shade = g => { g.traverse(o => { if (o.isMesh) o.castShadow = true; }); return g; };
function stripes(cols, n, w = 256, h = 256, vertical = false) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const x = cv.getContext('2d');
  for (let i = 0; i < n; i++) { x.fillStyle = cols[i % cols.length]; vertical ? x.fillRect(i * w / n, 0, w / n + 1, h) : x.fillRect(0, i * h / n, w, h / n + 1); }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
}
/** a disc of goatskin: pale centre, darker rim, a few hair-thin veins */
function skinTex(base = '#e6d2a6') {
  const cv = document.createElement('canvas'); cv.width = cv.height = 128; const x = cv.getContext('2d');
  const g = x.createRadialGradient(64, 64, 8, 64, 64, 64); g.addColorStop(0, base); g.addColorStop(.8, '#cdb27e'); g.addColorStop(1, '#9a7a4c');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  x.strokeStyle = 'rgba(120,90,50,.25)'; for (let i = 0; i < 6; i++) { x.beginPath(); x.moveTo(20 + i * 17, 30); x.quadraticCurveTo(64, 64 + i * 5, 30 + i * 13, 108); x.stroke(); }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
}

function frameDrum(r, d, skin, rim, jingles = 0) {
  const g = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d, 32, 1, true).rotateX(Math.PI / 2), PR.toon(rim, { side: THREE.DoubleSide }));
  const face = new THREE.Mesh(new THREE.CircleGeometry(r * .99, 32).translate(0, 0, d / 2), new THREE.MeshToonMaterial({ map: skinTex(skin), side: THREE.DoubleSide }));
  g.add(ring, face);
  for (let i = 0; i < jingles; i++) {   // pairs of tin zills in slots round the rim
    const a = i / jingles * Math.PI * 2, j = new THREE.Mesh(new THREE.CylinderGeometry(r * .17, r * .17, .006, 12).rotateZ(Math.PI / 2), PR.toon(0xc8c0a8));
    j.position.set(Math.cos(a) * r, Math.sin(a) * r, 0); j.rotation.z = a; g.add(j);
  }
  g.userData = { face: new THREE.Vector3(0, 0, d / 2), r };
  return shade(g);
}
export const bendir = () => frameDrum(.19, .07, '#ead8ae', 0x8a6238);
export const tambourin = () => frameDrum(.09, .045, '#f0e2c0', 0xc0503a, 5);

export function trompette() {
  const g = new THREE.Group(), tex = stripes(['#c8322a', '#e8c040', '#2a5aa8', '#e8c040'], 12, 64, 256);
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(.009, .007, .2, 10, 1, true).translate(0, .1, 0), new THREE.MeshToonMaterial({ map: tex, side: THREE.DoubleSide }));
  const bell = new THREE.Mesh(new THREE.CylinderGeometry(.045, .01, .1, 18, 1, true).translate(0, .25, 0), PR.toon(0xd8d4c8, { side: THREE.DoubleSide }));
  const mp = new THREE.Mesh(new THREE.SphereGeometry(.012, 8, 6), PR.toon(0xb8b0a0));
  g.add(tube, bell, mp); g.userData = { bell: new THREE.Vector3(0, .3, 0) };
  return shade(g);
}

export function rasoir() {
  const g = new THREE.Group();
  const handle = new THREE.Mesh(new THREE.BoxGeometry(.016, .11, .008).translate(0, .02, 0), PR.toon(0x2a1a14));
  const blade = new THREE.Mesh(new THREE.BoxGeometry(.02, .08, .002).translate(.004, .115, 0), PR.toon(0xd8dde4));
  g.add(handle, blade); g.userData = { edge: new THREE.Vector3(.014, .14, 0) };
  return shade(g);
}

/** towel wrapped round a seated child to the chin: a lathe cone, narrow at the neck, flaring over the shoulders and lap */
export function serviette(r0 = .055, r1 = .3, h = .5) {
  const prof = [[r0, 0], [r0 + .03, -.02], [r1 * .8, -.1], [r1, -.22], [r1 * 1.02, -h]].map(([r, y]) => new THREE.Vector2(r, y));
  const m = new THREE.Mesh(new THREE.LatheGeometry(prof, 32), new THREE.MeshToonMaterial({ map: stripes(['#c42c22', '#e9b83a', '#c42c22', '#f3e6c4'], 16, 256, 64, true), side: THREE.DoubleSide }));
  m.castShadow = true; return m;
}

/** wooden A-frame step ladder, h tall: origin on the floor at the centre, the stepped side faces +z.
 *  userData.steps = world-local step top heights (with their z), userData.top = h */
export function echelle(h = 1.3, w = .42, n = 4) {
  const g = new THREE.Group(), wood = PR.toon(0x8a6a44), sp = h * .32, tilt = Math.atan2(sp / 2, h), L = Math.hypot(h, sp / 2);
  const steps = [];
  for (const s of [1, -1]) {   // front (+z, stepped) and back frames
    const f = new THREE.Group(); f.position.z = s * sp / 2; f.rotation.x = -s * tilt;
    for (const x of [-w / 2, w / 2]) { const r = new THREE.Mesh(new THREE.BoxGeometry(.045, L, .03), wood); r.position.set(x, L / 2, 0); f.add(r); }
    for (let i = 1; i <= n; i++) {
      const y = i * L / (n + 1), r = new THREE.Mesh(s > 0 ? new THREE.BoxGeometry(w, .025, .1) : new THREE.BoxGeometry(w, .03, .025), wood);
      r.position.set(0, y, s > 0 ? -.04 : 0); f.add(r);
      if (s > 0) steps.push({ y: y * Math.cos(tilt) + .0125, z: sp / 2 - y * Math.sin(tilt) - .04 });
    }
    g.add(f);
  }
  const top = new THREE.Mesh(new THREE.BoxGeometry(w + .04, .04, .16), wood); top.position.y = h; g.add(top);
  g.userData = { steps, top: h };
  return shade(g);
}

/** petrol bottle (thick green glass, cork): origin at the grip (mid body), neck along +y; userData.mouth */
export function bouteille(fill = 0) {
  const g = new THREE.Group(), glass = new THREE.MeshToonMaterial({ color: 0x3e6a4a, transparent: true, opacity: .8 });
  const body = new THREE.Mesh(new THREE.LatheGeometry([[0, -.12], [.045, -.12], [.048, -.1], [.048, .04], [.02, .09], [.014, .13], [.016, .14], [0, .14]].map(([x, y]) => new THREE.Vector2(x, y)), 20), glass);
  g.add(body);
  const cork = new THREE.Mesh(new THREE.CylinderGeometry(.012, .011, .025, 10), PR.toon(0xb08a5a)); cork.position.y = .15; g.add(cork);
  if (fill) { const f = new THREE.Mesh(new THREE.CylinderGeometry(.044, .044, .16 * fill, 16), PR.toon(0xc8a050)); f.position.y = -.118 + .08 * fill; g.add(f); }
  g.userData = { mouth: new THREE.Vector3(0, .14, 0), cork };
  return shade(g);
}

/** a bunch of fresh mint: origin at the grip (stems), leaves along +y */
export function menthe() {
  const g = new THREE.Group(), stem = PR.toon(0x5a7a3a), leaf = PR.toon(0x4f9a46);
  for (let i = 0; i < 9; i++) {
    const a = i * 2.4, r = .012 + .01 * (i % 3), l = .16 + .03 * ((i * 7) % 3);
    const s = new THREE.Mesh(new THREE.CylinderGeometry(.002, .002, l, 4), stem); s.position.set(Math.cos(a) * r, l / 2 - .03, Math.sin(a) * r); s.rotation.z = Math.cos(a) * .15; s.rotation.x = Math.sin(a) * .15; g.add(s);
    for (let j = 0; j < 3; j++) { const lf = new THREE.Mesh(new THREE.SphereGeometry(.022, 6, 4).scale(1, .45, .7), leaf); lf.position.set(Math.cos(a + j) * (r + .02 + j * .006), l - .07 + j * .03, Math.sin(a + j) * (r + .02)); g.add(lf); }
  }
  g.userData = { top: .2 };
  return shade(g);
}

/** chemise: the new shirt, stiff with starch, falling to the floor, sleeves past the hands. A collar-to-floor flared tube
 *  and two flared sleeves (unit sizes), fitted every frame to the wearer by wearShirt(). */
export function chemise() {
  const m = PR.toon(0xf4f0e2, { side: THREE.DoubleSide }), g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.5, 1, 20, 1, true).translate(0, -.5, 0), m);   // origin at the collar
  const sl = [0, 1].map(() => new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1, 1, 12, 1, true).translate(0, .5, 0), m));   // origin at the shoulder
  g.add(body, ...sl); g.userData = { body, sl }; return shade(g);
}
/** fit the shirt on actor a this frame: body from the collar to the floor, each sleeve from the shoulder to past the palm */
export function wearShirt(ch, a, { IK, handPts }) {
  const w = v => IK.wpos(a.B[v]), sL = w('upperArmL'), sR = w('upperArmR'), neck = w('neck');
  const r = sL.distanceTo(sR) / 2 + .03, { body, sl } = ch.userData;
  body.position.set((sL.x + sR.x) / 2, neck.y - .02, (sL.z + sR.z) / 2);
  body.rotation.set(0, a.group.rotation.y, 0); body.scale.set(r, neck.y - .02, r * .78);
  ['L', 'R'].forEach((s, i) => {
    const S = s === 'L' ? sL : sR, d = handPts(a, s).palm.sub(S), len = d.length() + .07;
    const y = d.normalize(), x = y.clone().cross(new THREE.Vector3(0, 1, 0)).normalize(), z = x.clone().cross(y);
    sl[i].position.copy(S); sl[i].quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z)); sl[i].scale.set(.042, len, .042);
  });
  ch.updateMatrixWorld(true);
}
