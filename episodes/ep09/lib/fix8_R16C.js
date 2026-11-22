// R16C helpers: a readable broom for Fatma (bigger, lighter than the door) and a forward-held grip.
import * as THREE from 'three';
import * as PO from '../../../engine/poses.js';
import { toon } from '../../../engine/props3d.js';
import { at, orient, dirW, V } from './beatscene.js';

export function brightBroom() {
  const g = new THREE.Group();
  const stick = new THREE.Mesh(new THREE.CylinderGeometry(.016, .018, .5, 6), toon(0xd8b27a));
  stick.position.y = -.25;
  const bristle = new THREE.Mesh(new THREE.CylinderGeometry(.06, .1, .2, 8), toon(0xe8c84a));
  bristle.position.y = -.58;
  const band = new THREE.Mesh(new THREE.CylinderGeometry(.062, .062, .03, 8), toon(0xb33a2a));
  band.position.y = -.49;
  g.add(stick, bristle, band);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return g;
}

/** idempotent: broom in the hand, forward of the hip and out from the dress so it reads against the door */
export function holdBroomFwd(a, broom, scene, side = 'R') {
  if (!broom.parent) scene.add(broom);
  const k = a.group.scale.y / 1.6, sh = at(a, 'upperArm' + side);
  const lat = sh.clone().sub(at(a, 'chest')); lat.y = 0; lat.normalize();
  const grip = sh.clone().addScaledVector(lat, .2 * k).addScaledVector(dirW(a, 0, 0, 1), .2 * k).add(V(0, -.2 * k, 0));
  PO.reach(a, side, grip, { grip: .012, pole: [(lat.clone().applyQuaternion(a.group.quaternion.clone().invert()).x >= 0 ? 1 : -1) * .5, .02, -.32] });
  PO.fingers(a, side, .45);
  const dir = V(0, 1, 0).addScaledVector(lat, .12).addScaledVector(dirW(a, 0, 0, 1), -.12);
  orient(broom, PO.handPts(a, side).palm, dir, lat);
  broom.visible = a.group.visible;
}
