// R31F s08 helper: let the mother's sash ends (skinned to the flank robe bones) hang straight down instead of jutting off the knees.
import * as THREE from 'three';
import * as IK from '../../../engine/ik.js';
import { dirW, V } from './beatscene.js';

export function hangSash(a) {
  const B = a.B, down = V(0, -1, 0), fwd = dirW(a, 0, 0, 1);
  for (const [s, sign] of [['Left', 1], ['Right', -1]]) {
    const lower = B[s + 'Robe2'], upper = B[s + 'Robe1'];
    if (!lower || !upper) continue;
    const side = dirW(a, sign, 0, 0);
    // upper keeps its aim at the knee; the lower part (sash ends) falls plumb, a touch back and inward
    IK.aim(lower, IK.wpos(lower, [0, -1, 0]), IK.wpos(lower).addScaledVector(down.clone().addScaledVector(fwd, -0.12).addScaledVector(side, -0.08).normalize(), 1));
    lower.updateWorldMatrix(false, true);
  }
}

// R31N: the mother's painted sash tail is real skirt geometry (orange atlas island on SkirtFront1/LeftRobe1) that juts
// out in the kneel, and her dark slipper (atlas verts on the Foot/Leg bones) pokes up through the skirt. Repaint the tail
// island with the skirt blue (same silhouette, no yellow flap) and collapse the feet under the hem.
const done = new WeakSet();
export function tuckMother(a) {
  for (const n of ['LeftFoot', 'RightFoot']) if (a.B[n]) { a.B[n].scale.setScalar(0.001); a.B[n].updateWorldMatrix(false, true); }
  const mesh = a.mesh; if (!mesh || done.has(mesh)) return; done.add(mesh);
  try {
    const g = mesh.geometry, pos = g.attributes.position, uv = g.attributes.uv, si = g.attributes.skinIndex, sw = g.attributes.skinWeight;
    const map = mesh.material.map, img = map && map.image; if (!img || !uv || !si) return;
    const W = img.width, H = img.height, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d', { willReadFrequently: true }); ctx.drawImage(img, 0, 0);
    const id = ctx.getImageData(0, 0, W, H), d = id.data, bones = mesh.skeleton.bones;
    g.computeBoundingBox(); const y0 = g.boundingBox.min.y, y1 = g.boundingBox.max.y, tail = new Uint8Array(W * H);
    const ok = new Set(['SkirtFront1', 'LeftRobe1', 'LeftRobe2']);
    const isOr = o => d[o] > 190 && d[o + 1] > 100 && d[o + 1] < 200 && d[o + 2] < 90;
    let n = 0;
    for (let k = 0; k < pos.count; k++) {
      let b = 0, bw = -1; for (let c = 0; c < 4; c++) if (sw.getComponent(k, c) > bw) { bw = sw.getComponent(k, c); b = si.getComponent(k, c); }
      if (!ok.has(bones[b].name)) continue;
      const t = (pos.getY(k) - y0) / (y1 - y0); if (t > 0.54 || t < 0.2) continue;
      const px = Math.round(uv.getX(k) * (W - 1)), py = Math.round(uv.getY(k) * (H - 1));
      for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
        const x = px + dx, y = py + dy; if (x < 0 || y < 0 || x >= W || y >= H) continue;
        const o = (y * W + x) * 4; if (isOr(o)) { tail[y * W + x] = 1; n++; }
      }
    }
    for (let i = 0; i < W * H; i++) if (tail[i]) { const o = i * 4; d[o] = 96; d[o + 1] = 102; d[o + 2] = 158; }
    ctx.putImageData(id, 0, 0);
    const tex = new THREE.CanvasTexture(cv); tex.flipY = false; tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = map.anisotropy || 1;
    mesh.material.map = tex; mesh.material.needsUpdate = true;
    console.log('R31N tail px', n);
  } catch (e) { console.warn('R31N tuck failed', e); }
}

// R31S: collapse the father's slippers under his robe hem (they protrude and clip through it).
export function tuckFeet(a) { for (const n of ['LeftFoot', 'RightFoot']) if (a.B[n]) { a.B[n].scale.setScalar(0.001); a.B[n].updateWorldMatrix(false, true); } }
