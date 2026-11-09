// s03 flies and bedbugs. b004 painting (summer heat). b005–b009 one bedroom shot (chambre_jour), Zoubida alone at war:
// b005 squints up at the cedar beams (insert: bedbugs), b006 the enumeration "chaux vive, soufre, pétrole" = three inserts
// cut on the words (enum.json), b007 talisman over the door (reach up toward the door, left) then a pinch of powder blown
// (inserts on "talismans" / "poudres"), b008 peering up at the beams (insert: survivors), b009 whipping a dish cloth, flies out.
import * as PO from '../../../engine/poses.js';
import { staged } from '../lib/autostage.js';
import { beatScene, lines, sm, front, V } from '../lib/beatscene.js';

const ID = 's03_mouches', L = lines(ID), B = i => L[i] || [0, 0];
const IN = (i, t) => t >= B(i)[0] - .2 && t < B(i)[1] + .2;
const beams = [980, 930, 2.9];

const ch = staged('chambre_jour', {
  zoubida: { at: [960, 985], face: [700, 940], seed: 7,
    look: t => IN(1, t) || IN(4, t) ? beams : IN(3, t) && t < B(3)[0] + .5 * (B(3)[1] - B(3)[0]) ? [380, 960, 1.9] : null },
}, {
  act(lt, t, S, st) {
    const zo = st.A.zoubida, k = zo.group.scale.y / 1.6;
    if (IN(1, t) || IN(4, t)) { zo.B.chest.rotation.x -= .1; zo.B.chest.updateWorldMatrix(false, true); }   // leaning back to look up
    if (IN(3, t)) {   // talisman: right hand up toward the door frame, then the pinch of powder to the lips
      const D = B(3)[1] - B(3)[0], up = sm(B(3)[0], B(3)[0] + .6, t) * (1 - sm(B(3)[0] + .5 * D, B(3)[0] + .5 * D + .5, t));
      const blow = sm(B(3)[0] + .5 * D, B(3)[0] + .5 * D + .5, t);
      const hand = front(zo, 'chest', .3 * k, .05 * k, .25 * k).lerp(front(zo, 'head', .12 * k, 0, -.06 * k), blow);
      if (up + blow > 0) PO.reach(zo, 'R', front(zo, 'root', .15 * k, .2 * k, 0).lerp(hand, Math.max(up, blow)), { grip: .02 });
    }
    if (IN(5, t)) {   // whipping the cloth: fast arcs of the right arm
      const w = Math.sin(t * 7), a = sm(B(5)[0], B(5)[0] + .4, t);
      PO.reach(zo, 'R', front(zo, 'chest', .35 * k, (.05 + .3 * w) * k, (.1 + .12 * Math.abs(w)) * k).lerp(front(zo, 'root', .15 * k, .2 * k, 0), 1 - a), { grip: .04 });
    }
  },
});

export default beatScene(ID, {
  shots: { ch },
  plan: {
    b005: { shot: 'ch', size: 'CU', on: 'zoubida', insAt: .45 },
    b006: { shot: 'ch', size: 'M', on: 'zoubida' },
    b007: { shot: 'ch', size: 'M', on: 'zoubida' },
    b008: { shot: 'ch', size: 'M', on: 'zoubida', insAt: .55 },
    b009: { shot: 'ch', size: 'W', on: 'zoubida' },
  },
});
