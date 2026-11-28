// ep09 group A: shared bed, lap and side-arm fixes. Scenes import this; lib/autostage.js stays untouched.
import * as PO from '../../../engine/poses.js';
import * as PR from '../../../engine/props3d.js';
import { lieOnBed, pillowUnder } from './fix8_lie.js';
import { at, dirW, V } from './beatscene.js';

/** Cast height (m). The rig is normalised to 1, and autostage uses `height` as the group scale. */
export const BOY_H = 1.1;
/** On the right divan, clear of the wooden chest (plate px). */
export const BED_AT = [1296, 628];

/**
 * Mohammed along the divan: feet toward the back wall, head toward the room.
 * The blanket stays on the torso so it cannot slide onto the chest.
 */
export function boyBed(S3, st, t, headTurn = -.45, blanket = 0x8a3d34) {
  const mo = st.A.mohammed;
  // The heels land a few centimetres past the painted divan's back edge. A fixed
  // nudge toward the camera (+z) brings them onto the mattress without leaving the divan.
  if (!st.mo0) { st.mo0 = mo.group.position.clone(); st.mo0.z += .5; }
  lieOnBed(mo, {
    top: .28, feet: [-.97, .24],
    origin: st.mo0,
    hands: 'belly', pillow: .1, tuck: .12, headTurn,
  });
  pillowUnder(S3, st, mo, { top: .28, h: .1, col: 0x4b5c74, w: .42, d: .3 });
  st.pillow.userData.ambient = true;
  st.cover ||= PR.blanket({ w: .3, l: .34, h: .045, col: blanket });
  st.cover.userData.ambient = true;
  const hp = mo.B.chest.getWorldPosition(V(0, 0, 0)), ry = mo.group.rotation.y;
  S3.prop(st.cover, hp.x, .28 + .02, hp.z, ry);
  st.cover.visible = true;
  mo.B.chest.rotation.x += .012 * Math.sin(t * 1.5);
  mo.B.chest.updateWorldMatrix(false, true);
  return mo;
}

/** Right palm on the side of the belly, outside the torso capsule so the forearm does not pass through the chest. */
export function handToBelly(a) {
  const k = a.group.scale.y / 1.6;
  const sh = at(a, 'upperArmR');
  const belly = at(a, 'chest').addScaledVector(dirW(a, -1, 0, 0), .2 * k).add(V(0, .02 * k, 0));
  const reach = (sh.distanceTo(at(a, 'foreArmR')) + at(a, 'foreArmR').distanceTo(at(a, 'handR'))) * .86;
  const dir = belly.clone().sub(sh);
  if (dir.length() > reach) belly.copy(sh).addScaledVector(dir.normalize(), reach);
  PO.reach(a, 'R', belly, { grip: .03, pole: [-.55, .12, .28] });
  PO.fingers(a, 'R', .35, { spread: .12 });
}

/** Palms beside the cheeks, wide of the torso so the forearms do not pass through the chest. */
export function handsToFace(a, u = 1) {
  const k = a.group.scale.y / 1.6;
  for (const [s, sg] of [['L', 1], ['R', -1]]) {
    const sh = at(a, 'upperArm' + s);
    const cheek = at(a, 'head').addScaledVector(dirW(a, sg, 0, 0), .16 * k).add(V(0, .0, .07 * k));
    const park = at(a, 'chest').addScaledVector(dirW(a, sg, 0, 0), .24 * k).add(V(0, .04 * k, .05 * k));
    const tg = park.lerp(cheek, u);
    const reach = (sh.distanceTo(at(a, 'foreArm' + s)) + at(a, 'foreArm' + s).distanceTo(at(a, 'hand' + s))) * .86;
    const dir = tg.clone().sub(sh);
    if (dir.length() > reach) tg.copy(sh).addScaledVector(dir.normalize(), reach);
    PO.reach(a, s, tg, { grip: .03, pole: [sg * .6, .12, .28] });
    PO.fingers(a, s, .2, { spread: .08 });
  }
}

/** Palms on the thighs, below the sash, so a kneel does not hover at the waist. */
export function lapRest(a) {
  const k = a.group.scale.y / 1.6;
  for (const [s, sg] of [['L', 1], ['R', -1]]) {
    const tg = PO.hipToWorld(a, sg * .16 * k, .06 * k, .2 * k);
    PO.reach(a, s, tg, { grip: .02, pole: [sg * .28, .02, .12] });
    PO.fingers(a, s, .22, { spread: .1 });
  }
}

/** Arms down at the sides with a small opposite swing. Overrides the walk-cycle A-pose.
 *  The wrist target is pulled inside the two-bone reach so the gate's IK error stays under 3 cm. */
export function sideArms(a, t, swing = .06) {
  const k = a.group.scale.y / 1.6, s = Math.sin(t * 6.5) * swing;
  for (const [side, sg, ph] of [['R', -1, s], ['L', 1, -s]]) {
    const sh = at(a, 'upperArm' + side);
    const reach = (sh.distanceTo(at(a, 'foreArm' + side)) + at(a, 'foreArm' + side).distanceTo(at(a, 'hand' + side))) * .88;
    const tg = sh.clone()
      .addScaledVector(dirW(a, sg, 0, 0), .12 * k)
      .addScaledVector(dirW(a, 0, 0, 1), .03 * k)
      .add(V(0, -.36 * k + ph, 0));
    const dir = tg.clone().sub(sh);
    const d = dir.length();
    if (d > reach) tg.copy(sh).addScaledVector(dir.multiplyScalar(1 / d), reach);
    PO.reach(a, side, tg, { grip: .04, pole: [sg * .25, .08, -.25] });
  }
}
