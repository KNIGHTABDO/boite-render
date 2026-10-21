// _props.js: ep06 props (metres, origin at the grip unless noted), same toon look as engine/props3d.js.
//   balayette: doum-palm hand broom, 50 cm (15 cm bound grip + 35 cm fan of fronds), along +y from the grip
//   rod: the fqih's quince rod, 80 cm, along +y from the grip
import * as THREE from 'three';
import * as PR from '../../../engine/props3d.js';

/** doum broom; wet = lime-wash on the frond tips (0..1). userData.tip = local tip point */
export function balayette({ wet = 0 } = {}) {
  const g = new THREE.Group();
  const grip = new THREE.Mesh(new THREE.CylinderGeometry(.018, .02, .15, 10).translate(0, .075, 0), PR.toon(0x9a7a48));
  const fan = new THREE.Mesh(new THREE.CylinderGeometry(.055, .025, .35, 14).translate(0, .15 + .175, 0), PR.toon(0x9c8450));
  fan.scale.z = .22;   // a flat fan, not a cone
  g.add(grip, fan);
  if (wet > 0) { const w = new THREE.Mesh(new THREE.CylinderGeometry(.056, .05, .06 * wet, 14).translate(0, .5 - .03 * wet, 0), PR.toon(0xd8d2c0)); w.scale.z = .24; g.add(w); }
  for (let i = 0; i < 3; i++) { const b = new THREE.Mesh(new THREE.TorusGeometry(.021, .004, 5, 12).rotateX(Math.PI / 2).translate(0, .03 + i * .05, 0), PR.toon(0x6a4a2a)); g.add(b); }
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  g.userData = { tip: new THREE.Vector3(0, .5, 0) };
  return g;
}

/** thin quince rod */
export function rod() {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(.005, .009, .8, 6).translate(0, .4, 0), PR.toon(0x6a4628)); m.castShadow = true;
  const g = new THREE.Group(); g.add(m); g.userData = { tip: new THREE.Vector3(0, .8, 0) }; return g;
}

const Y = new THREE.Vector3(0, 1, 0);
/** put a grip-origin prop in a hand: grip at the palm, +y along `dir` (world) */
export function inHand(o, palm, dir) { o.position.copy(palm); o.quaternion.setFromUnitVectors(Y, dir.clone().normalize()); o.updateMatrixWorld(true); }
