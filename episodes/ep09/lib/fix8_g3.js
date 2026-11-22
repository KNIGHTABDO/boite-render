// G3 helpers: body yaw toward the camera judged from the GROUP facing (not the head bone, which leans back when
// an actor looks up and then reads as "facing away"), so a sky-gazing actor is still turned to the lens.
import * as THREE from 'three';
export function yawBody(a, cam, limit = .5) {
  if (!cam) return;
  const r = a.group.rotation.y, fx = Math.sin(r), fz = Math.cos(r);
  const dx = cam.position.x - a.group.position.x, dz = cam.position.z - a.group.position.z;
  const d = Math.atan2(Math.sin(Math.atan2(dx, dz) - Math.atan2(fx, fz)), Math.cos(Math.atan2(dx, dz) - Math.atan2(fx, fz)));
  if (Math.abs(d) <= limit) return;
  a.group.rotation.y += d - Math.sign(d) * limit;
  a.group.updateMatrixWorld(true);
}
export { THREE };
