// G4 helpers (s12, s14, s15): haik women keep their arms inside the cloth unless a beat needs an exposed hand.
import * as PO from '../../../engine/poses.js';
import { at, front, V } from './beatscene.js';

const kk = a => a.group.scale.y / 1.6;

// Both hands tucked INSIDE the mantle (cloth radius ~.235 across, ~.2 front/back): hanging at the hips, nothing near the front surface.
export function haikTuck(a) {
  const k = kk(a);
  for (const [side, sign] of [['L', 1], ['R', -1]]) {
    PO.reach(a, side, PO.hipToWorld(a, sign * .26 * k, .06 * k, .03 * k), { grip: .01, pole: [sign * .9, .05, -.05] });
    PO.fingers(a, side, .3);
  }
}

// One hand comes OUT at the front opening, on the cloth surface at chest height (never through the body of the cloth).
// up/across in metres (up from the chest bone, across: + = her left side), out = how far past the surface it sits.
export function haikOut(a, side, up = -.12, across = .05, out = .215, curl = .3) {
  const k = kk(a), s = side === 'L' ? 1 : -1;
  PO.reach(a, side, front(a, 'chest', out * k, -s * across * k, up * k), { grip: .01, pole: [s * .35, .0, .1] });
  PO.fingers(a, side, curl);
}

// Lower body bends / look-back targets: a world point behind and to the side of an actor, at head height.
export function behind(a, side = 1, back = .8, wide = .6) {
  return front(a, 'head', -back, -side * wide, 0);
}
export { V };
