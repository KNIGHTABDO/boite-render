// r02 group E — robe dye, haik belt, reaches. Scenes s17 and s18 only.
import * as THREE from 'three';
import * as PO from '../../../engine/poses.js';
import { hangSash } from './fix8_R31F.js';
import { at, dirW, V } from './beatscene.js';

export { hangSash };

function hsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
  if (mx === mn) return [0, 0, l];
  const d = mx - mn, s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn);
  let h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}
function fromHsl(h, s, l) {
  h = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s, hp = h / 60, x = c * (1 - Math.abs(hp % 2 - 1));
  let r = 0, g = 0, b = 0;
  if (hp < 1) [r, g, b] = [c, x, 0];
  else if (hp < 2) [r, g, b] = [x, c, 0];
  else if (hp < 3) [r, g, b] = [0, c, x];
  else if (hp < 4) [r, g, b] = [0, x, c];
  else if (hp < 5) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const m = l - c / 2;
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}
function hueNear(h, center, span) {
  const d = Math.abs(h - center) % 360;
  return Math.min(d, 360 - d) <= span;
}

function paintMap(a, key, fn) {
  if (a[key]) return;
  let mesh = a.mesh;
  if (!mesh) a.group.traverse(o => { if (!mesh && o.isSkinnedMesh && o.material?.map) mesh = o; });
  const map = mesh?.material?.map, img = map?.image;
  if (!img) return;
  a[key] = true;
  const cv = new OffscreenCanvas(img.width, img.height), g = cv.getContext('2d', { willReadFrequently: true });
  g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, cv.width, cv.height);
  fn(d.data, cv.width, cv.height);
  g.putImageData(d, 0, 0);
  const tex = new THREE.CanvasTexture(cv);
  tex.flipY = map.flipY; tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = map.wrapS; tex.wrapT = map.wrapT; tex.anisotropy = map.anisotropy || 1;
  const m = mesh.material.clone(); m.map = tex; m.needsUpdate = true; mesh.material = m;
}

/** Shift a garment hue (yellow robe, pink robe) onto another hue. Skin and low-sat cloth stay.
 *  `lit` scales lightness (1 keeps the old color; below 1 darkens, used for a plum robe). */
export function dyeGarment(a, { hue, span = 12, to, minS = .4, lit = 1 }) {
  paintMap(a, '_dye' + to + ':' + lit, px => {
    for (let i = 0; i < px.length; i += 4) {
      const [h, s, l] = hsl(px[i], px[i + 1], px[i + 2]);
      if (s < minS || l < .16 || l > .92 || !hueNear(h, hue, span)) continue;
      const nl = lit === 1 ? l : Math.min(.48, Math.max(.12, l * lit));
      const ns = lit === 1 ? Math.min(.72, Math.max(.4, s * .9)) : Math.min(.5, Math.max(.32, s * .65));
      const [r, g, b] = fromHsl(to, ns, nl);
      px[i] = r; px[i + 1] = g; px[i + 2] = b;
    }
  });
}

/** The haik's painted olive-gold belt reads as a strip through the white cloth. Recolor it to the haik cream. */
export function quietHaikBelt(a) {
  paintMap(a, '_belt', px => {
    for (let i = 0; i < px.length; i += 4) {
      const r = px[i], g = px[i + 1], b = px[i + 2];
      if (!(g > r * .75 && b < g * .65 && r > b + 25 && r + g + b > 150)) continue;
      const k = (r + g + b) / 3 / 210;
      px[i] = Math.min(255, 236 * k);
      px[i + 1] = Math.min(255, 224 * k);
      px[i + 2] = Math.min(255, 206 * k);
    }
  });
}

export function reachClamp(a, side, target, opt) {
  const sh = at(a, 'upperArm' + side);
  const len = sh.distanceTo(at(a, 'foreArm' + side)) + at(a, 'foreArm' + side).distanceTo(at(a, 'hand' + side));
  const d = target.clone().sub(sh), max = len * .86;
  const tgt = d.length() > max ? sh.clone().addScaledVector(d.normalize(), max) : target;
  return PO.reach(a, side, tgt, opt);
}

/** Hands beside the thighs, clear of a waist sash. `lift` raises the named side a little. */
export function armsSoft(a, t, { lift = null, seed = 0 } = {}) {
  a.group.updateMatrixWorld(true);
  const k = a.group.scale.y / 1.6;
  for (const s of ['L', 'R']) {
    const sg = s === 'L' ? 1 : -1;
    const sh = at(a, 'upperArm' + s);
    const len = sh.distanceTo(at(a, 'foreArm' + s)) + at(a, 'foreArm' + s).distanceTo(at(a, 'hand' + s));
    const up = lift === s ? .22 : 0;
    const sw = .01 * Math.sin(t * .9 + seed + sg);
    const tg = sh.clone()
      .addScaledVector(dirW(a, sg, 0, 0), (.1 + sw) * k)
      .addScaledVector(dirW(a, 0, 0, 1), (.06 + up * .35) * k)
      .add(V(0, -Math.min(len * .82, (.42 - up) * k), 0));
    reachClamp(a, s, tg, { grip: 0, pole: [sg * .28, .06, -.2] });
    PO.fingers(a, s, .3, { spread: .1 });
  }
}
