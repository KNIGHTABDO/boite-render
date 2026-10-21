// Painted background plates. A plate occupies world space [0,1920]x[0,1080] (its torn paper border is cropped),
// so scenes move over it with K.camera() and place actors in the same coordinates.
import { c, W, H } from './core.js';
const cache = {};
export async function plate(name) {
  if (cache[name]) return cache[name];
  const img = new Image(); await new Promise((ok, no) => { img.onload = ok; img.onerror = () => no(new Error('plate ' + name)); img.src = `/art/plates/${name}.png`; });   // onload, not decode(): decode() stalls in hidden tabs
  return cache[name] = img;
}
/** draw a plate in world space. crop = fraction trimmed from each edge (hides the paper border) */
const fcache = new Map();
/** the plate pre-rendered through a CSS filter once (blur/grades are expensive per frame) */
function filtered(img, filter, crop) {
  const k = img.src + '|' + filter + '|' + crop;
  let cv = fcache.get(k);
  if (!cv) {
    const sw = img.naturalWidth, sh = img.naturalHeight, cx = sw * crop, cy = sh * crop, S = 1.4;   // 2688x1512: enough for zoomed shots
    cv = new OffscreenCanvas(Math.round(W * S), Math.round(H * S)); const g = cv.getContext('2d');
    g.filter = filter.replace(/blur\(([\d.]+)px\)/, (m, v) => `blur(${(+v * S).toFixed(2)}px)`);
    g.drawImage(img, cx, cy, sw - 2 * cx, sh - 2 * cy, 0, 0, cv.width, cv.height);
    if (fcache.size > 40) fcache.delete(fcache.keys().next().value);
    fcache.set(k, cv);
  }
  return cv;
}
export function drawPlate(img, { crop = .035, alpha = 1, filter } = {}) {
  const sw = img.naturalWidth, sh = img.naturalHeight, cx = sw * crop, cy = sh * crop;
  c.save(); if (alpha < 1) c.globalAlpha *= alpha;
  if (filter && filter !== 'none') { const cv = filtered(img, filter, crop); c.drawImage(cv, 0, 0, cv.width, cv.height, 0, 0, W, H); }
  else c.drawImage(img, cx, cy, sw - 2 * cx, sh - 2 * cy, 0, 0, W, H);
  c.restore();
}
/** perspective helper: ground Y -> standing height in px, from two reference points on the plate floor */
export const persp = (y0, h0, y1, h1) => y => h0 + (h1 - h0) * (y - y0) / (y1 - y0);
