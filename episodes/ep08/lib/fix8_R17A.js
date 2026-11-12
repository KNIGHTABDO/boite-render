// r17 group A helpers: thin gold + silver bangles (metal, not a white ring), reused by s01_hook.
import * as THREE from 'three';
import { toon } from '../../../engine/props3d.js';

export function bangles(S3) {
  const g = new THREE.Group();
  const mk = (col, R, r, pos, rot) => {
    const m = new THREE.Mesh(new THREE.TorusGeometry(R, r, 8, 40), toon(col));
    m.material.emissive?.setHex(col); if (m.material.emissiveIntensity != null) m.material.emissiveIntensity = .12;
    m.position.set(...pos); m.rotation.set(...rot); g.add(m);
  };
  mk(0xd29a14, .036, .0042, [-.012, .004, -.01], [1.15, .25, 0]);    // gold, lying tilted on the palm
  mk(0x8d98a6, .033, .0036, [.014, .016, .012], [.75, -.5, .3]);     // silver, resting on the gold and leaning toward the fingers
  S3.scene.add(g); return g;
}
