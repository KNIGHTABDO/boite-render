// ep09 group A: shared bed, lap and side-arm fixes. Scenes import this; lib/autostage.js stays untouched.
import * as PO from '../../../engine/poses.js';
import * as PR from '../../../engine/props3d.js';
import { lieOnBed, pillowUnder } from './fix8_lie.js';
import { at, dirW, V } from './beatscene.js';

export const BOY_H = 1.24;
/** On the right divan, clear of the wooden chest (plate px). */
export const BED_AT = [1296, 628];

/**
 * Mohammed along the divan: feet toward the back wall, head toward the room.
 * The blanket stays on the torso so it cannot slide onto the chest.
 */
export function boyBed(S3, st, t, headTurn = -.45, blanket = 0x8a3d34) {
  const mo = st.A.mohammed;
  lieOnBed(mo, {
    top: .28, feet: [.22, -.97],
    origin: (st.mo0 ||= mo.group.position.clone()),
    hands: 'belly', pillow: .1, tuck: .12, headTurn,
  });
  pillowUnder(S3, st, mo, { top: .28, h: .1, col: 0x4b5c74, w: .42, d: .3 });
  st.cover ||= PR.blanket({ w: .3, l: .34, h: .045, col: blanket });
  const hp = mo.B.chest.getWorldPosition(V(0, 0, 0)), ry = mo.group.rotation.y;
  S3.prop(st.cover, hp.x, .28 + .02, hp.z, ry);
  st.cover.visible = true;
  mo.B.chest.rotation.x += .012 * Math.sin(t * 1.5);
  mo.B.chest.updateWorldMatrix(false, true);
  return mo;
}

/** One hand on the belly — the pain / hunger tell, kept off the sash. */
export function handToBelly(a) {
  const k = a.group.scale.y / 1.6;
  const belly = at(a, 'chest').addScaledVector(dirW(a, 0, 0, 1), .06 * k).add(V(0, -.06 * k, 0));
  PO.reach(a, 'R', belly, { grip: .01, pole: [.35, .25, .2] });
  PO.fingers(a, 'R', .35, { spread: .12 });
}

/** Both palms up near the cheeks. Call after boyBed(). */
export function handsToFace(a, u = 1) {
  const k = a.group.scale.y / 1.6;
  for (const [s, sg] of [['L', 1], ['R', -1]]) {
    const cheek = at(a, 'head').addScaledVector(dirW(a, sg, 0, 0), .07 * k).add(V(0, -.02 * k, .06 * k));
    const park = at(a, 'chest').addScaledVector(dirW(a, sg, 0, 0), .12 * k).add(V(0, .02 * k, 0));
    PO.reach(a, s, park.lerp(cheek, u), { grip: .01, pole: [sg * .4, .2, .25] });
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

/** Arms down at the sides with a small opposite swing. Overrides the walk-cycle A-pose. */
export function sideArms(a, t, swing = .06) {
  const k = a.group.scale.y / 1.6, s = Math.sin(t * 6.5) * swing;
  for (const [side, sg, ph] of [['R', -1, s], ['L', 1, -s]]) {
    const sh = at(a, 'upperArm' + side);
    const tg = sh.clone()
      .addScaledVector(dirW(a, sg, 0, 0), .16 * k)
      .addScaledVector(dirW(a, 0, 0, 1), .04 * k)
      .add(V(0, -.48 * k + ph, 0));
    PO.reach(a, side, tg, { grip: .02, pole: [sg * .25, .08, -.25] });
  }
}
