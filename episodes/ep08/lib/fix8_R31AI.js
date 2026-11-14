// R31AI: relaxed standing arms with a clear elbow bend (one hand at the belt, one loose and a little out), hip-frame targets.
import * as PO from '../../../engine/poses.js';
export function relaxArm(a, side, kind = 'free') {
  const k = a.group.scale.y / 1.6, sg = side === 'L' ? 1 : -1; a.group.updateMatrixWorld(true);
  if (kind === 'belt') PO.reach(a, side, PO.hipToWorld(a, sg * .2 * k, .08 * k, .09 * k), { grip: 0, pole: [sg * .9, 0, -.6] });
  else PO.reach(a, side, PO.hipToWorld(a, sg * .31 * k, .0, .17 * k), { grip: 0, pole: [sg * .8, -.1, -.5] });
  PO.fingers(a, side, kind === 'belt' ? .3 : .22, { thumb: .2 });
}
