// r03 group L — s06, s07, s11, s12. The boy lies along the divan so a wide shot
// reads his length instead of a foreshortened doll. feet / nudge live here, not in boyBed.
import { lieOnBed, pillowUnder } from './fix8_lie.js';

export function divanBoy(S3, st, t, { headTurn = -.25, top = .26 } = {}) {
  const mo = st.A.mohammed;
  if (!st.mo0) {
    st.mo0 = mo.group.position.clone();
    st.mo0.z += .5;
    st.mo0.x -= .18;
  }
  lieOnBed(mo, {
    top, feet: [-.97, .24],
    origin: st.mo0.clone(),
    hands: 'belly', pillow: .1, tuck: .1, headTurn,
  });
  pillowUnder(S3, st, mo, { top, h: .1, col: 0xd9c7a4, w: .42, d: .3 });
  mo.B.chest.rotation.x += .01 * Math.sin(t * 1.15);
  mo.B.chest.updateWorldMatrix(false, true);
  return mo;
}
