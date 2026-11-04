// Si Abderrahman's shop, shared staging for s12-s14.
// barbier (looking in): the waiting platform on the left (front face foot y 1030, top edge y 820; top surface y 640-820),
//   the painted stool at foot (1010, 960), seat top y 740. barbier_rev (looking out to the vine): the painted stool in the
//   foreground at foot (980, 1030), seat top y 810; the doorway sill y ~800, the alley beyond.
import * as PO from '../../../engine/poses.js';
import { memoPose } from '../scenes/_3d.js';
import { put, heightAt, yawTo, V } from './beatscene.js';

export function shopIn(S3) {
  const cam = S3.cam.position.clone().setY(0);
  const ph = heightAt(S3, 300, 1030, 820), sh = heightAt(S3, 1005, 930, 738);   // same stool point as s01_cold
  const stool = S3.floorAt(1005, 930);
  const seat = (px, py) => S3.floorAt(px, py, ph).setY(0);   // floor x/z under a point on the platform top
  return { cam, ph, sh, stool, seat, nape: stool.clone().setY(sh + .62) };
}
export function shopRev(S3) {
  const cam = S3.cam.position.clone().setY(0);
  const sh = heightAt(S3, 980, 1030, 810), stool = S3.floorAt(980, 1030).add(V(0, 0, -.06));
  return { cam, sh, stool, door: S3.floorAt(1000, 805), alley: S3.floorAt(1060, 700) };
}
/** cross-legged on a raised top at height h, floor point p, facing a world point */
export function sitTop(S3, a, key, p, h, face) {
  S3.add(a, p.x, p.z, yawTo(p, face));
  memoPose(key, a, [h, p.x, p.z], () => PO.crossLegged(a, { seat: h, lean: .1 }));
  S3.qa.supports[a.name] = h;
  return PO.snap(a);
}
/** on a stool of seat height h at floor p, facing a world point */
export function sitStool(S3, a, key, p, h, face, o = {}) {
  S3.add(a, p.x, p.z, yawTo(p, face));
  memoPose(key, a, [h, p.x, p.z], () => PO.stool(a, { seat: h, lean: .15, ...o }));
  return PO.snap(a);
}
export { put };
