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
