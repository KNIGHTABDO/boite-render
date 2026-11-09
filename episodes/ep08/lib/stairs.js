// stairs.js: fit a straight painted flight (ep07 s09 method): 0.20 m rise / 0.28 m going, nosings fitted to the painted
// lines. fitStairs(S3, { NOS: canvas y of nosings 1..n, EDGE: canvas x of the newel edge, MIDX: tread middle at nosing 1 })
// → { tread(j) floor point (x/z) of tread j's centre, y(j) its height, up: unit vector up the flight, RISE, GO }.
import * as THREE from 'three';
export const RISE = .2, GO = .28;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
export function fitStairs(S3, { NOS, EDGE, MIDX }) {
  const O = S3.floorAt(EDGE, 1060), dir = S3.floorAt(EDGE, 620).sub(O).setY(0).normalize();
  let side = V(-dir.z, 0, dir.x);
  if (S3.project(O.clone().addScaledVector(side, .3))[0] < S3.project(O)[0]) side.negate();
  const fitR = C => { let r1 = 0, e = 1e9; for (let r = -1; r < 4; r += .005) { let s = 0; NOS.forEach((y, i) => { s += (S3.project(C.clone().addScaledVector(dir, r + GO * i).setY(RISE * (i + 1)))[1] - y) ** 2; }); if (s < e) { e = s; r1 = r; } } return r1; };
  let C = O.clone().addScaledVector(side, .7), r1 = fitR(C), lat = .7, le = 1e9;
  for (let l = .1; l < 3; l += .01) { const q = O.clone().addScaledVector(side, l).addScaledVector(dir, r1).setY(RISE); const d = Math.abs(S3.project(q)[0] - MIDX); if (d < le) { le = d; lat = l; } }
  C = O.clone().addScaledVector(side, lat); r1 = fitR(C);
  const tread = (j, off = 0) => C.clone().addScaledVector(dir, r1 + GO * (j - 1) + GO / 2).addScaledVector(side, off).setY(0);
  // invisible treads that catch the actors' shadows (Argon s09: a shadow on the patio floor two steps below read as a
  // floating boy). renderOrder -1 + depth write: they also hide the floor catcher's shadow wherever the flight is in front.
  const catchers = (n = NOS.length + 1, W = 1.6) => {
    const g = new THREE.Group(), mat = S3.catcher.material, yaw = Math.atan2(dir.x, dir.z);
    for (let j = 1; j <= n; j++) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(W, RISE * j, GO), mat), c = tread(j);
      m.position.set(c.x, RISE * j / 2, c.z); m.rotation.y = yaw; m.receiveShadow = true; m.renderOrder = -1; g.add(m);
    }
    S3.scene.add(g); return g;
  };
  return { tread, catchers, y: j => RISE * j, up: dir, side, RISE, GO };
}
// day plate art/plates/escalier.png: same layout as ep07's escalier_nuit (checked side by side 2026-11-09)
export const ESCALIER = { NOS: [900, 790, 690, 610, 545, 495], EDGE: 1070, MIDX: 1400 };
