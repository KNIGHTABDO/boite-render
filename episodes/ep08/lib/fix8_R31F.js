// R31F s08 helper: let the mother's sash ends (skinned to the flank robe bones) hang straight down instead of jutting off the knees.
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
