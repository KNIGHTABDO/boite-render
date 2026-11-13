// R31J: lift skirt/robe bones whose tips would sink below the floor (cross-legged seat lowered to satisfy the seat gap)
import * as IK from '../../../engine/ik.js';
export function liftCloth(a, y = .09) {
  for (let pass = 0; pass < 2; pass++) for (const n of ['SkirtBack1', 'SkirtBack2', 'SkirtFront1', 'SkirtFront2', 'LeftRobe1', 'LeftRobe2', 'RightRobe1', 'RightRobe2']) {
    const b = a.B[n]; if (!b) continue;
    b.updateWorldMatrix(true, false);
    const tip = IK.wpos(b, [0, -1, 0]);
    if (tip.y < y) IK.aim(b, tip, tip.clone().setY(y + .02));
  }
}
