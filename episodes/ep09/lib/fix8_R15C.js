// R15C: s09 seat. Same as fix8c.sitStep but the shins reach far enough forward to drop over the riser onto the tread below.
import * as IK from '../../../engine/ik.js';
import * as PO from '../../../engine/poses.js';

export function sitStepDrop(a, seat, floor, reach = .95) {
  const k = a.group.scale.y / 1.6, B = a.B;
  PO.setHipY(a, seat + .105 * k);
  a.group.updateMatrixWorld(true);
  const hipY = IK.wpos(B.root).y;
  const Lt = IK.wpos(B.thighL).distanceTo(IK.wpos(B.shinL));
  const Ls = IK.wpos(B.shinL).distanceTo(IK.wpos(B.footL));
  const drop = Math.max(.05, hipY - (floor + .025));
  const maxF = Math.sqrt(Math.max(.01, (Lt + Ls) ** 2 - Math.min(drop, Lt + Ls - .02) ** 2)) * .9;
  const fwd = Math.min(Lt * reach, maxF);
  const spread = .075 * k;
  for (const [side, sign] of [['L', 1], ['R', -1]]) {
    const ankle = PO.hipToWorld(a, sign * spread, floor + .08 - hipY, fwd);
    const pole = PO.hipToWorld(a, sign * spread * 1.1, .12 * k, fwd * .4);
    IK.leg(a, side, ankle, pole);
    const foot = B['foot' + side];
    foot.rotation.x = 0; foot.updateWorldMatrix(false, true);
    IK.aim(foot, IK.wpos(foot, [0, 0, 1]), PO.hipToWorld(a, sign * spread, floor + .07 - hipY, fwd + .12));
  }
  if (B.lap) PO.drapeLap(a, floor);
}
