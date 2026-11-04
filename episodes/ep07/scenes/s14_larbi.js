// s14 Moulay Larbi. b048 painting: the dignified babouche-maker (sepia flashback). b049 CU the barber by his shelf
// (barbier_rev) hones a razor on the leather strop in his left hand while he gossips, sly eyes up on "une nouvelle
// épouse ?". b050 inside (barbier): the father on the platform, indifferent, Mohammed beside him; the barber still honing
// in the background.
import * as THREE from 'three';
import * as PO from '../../../engine/poses.js';
import { shot, role, breathe } from './_3d.js';
import { beatScene, lines, idle, at, front, dirW, orient, sm, V } from '../lib/beatscene.js';
import { rasoir } from '../lib/props7.js';
import { shopIn, shopRev, sitTop } from '../lib/shop7.js';
import * as PR from '../../../engine/props3d.js';

const L = lines('s14_larbi');

function strop() {   // a leather strop: a flat brown strip, origin at the held end, running along +y
  const m = new THREE.Mesh(new THREE.BoxGeometry(.05, .32, .006).translate(0, .16, 0), PR.toon(0x6a3d22));
  const g = new THREE.Group(); g.add(m); return g;
}
/** honing: the left hand holds the strop out flat, the right draws the razor along it, flipping each pass */
function hone(S3, ba, raz, sp, t, eyesUp = 0) {
  const k = ba.group.scale.y / 1.6, f = dirW(ba, 0, 0, 1), r = dirW(ba, -1, 0, 0);
  const lh = front(ba, 'chest', .3 * k, -.1 * k, -.2 * k);
  PO.reach(ba, 'L', lh, { grip: .02 });
  orient(sp, PO.handPts(ba, 'L').palm, r.clone().multiplyScalar(1).add(V(0, .001, 0)), V(0, 1, 0));
  const s = (Math.sin(t * 5) + 1) / 2;   // one pass every ~0.6 s
  const rh = lh.clone().addScaledVector(r, .06 + .22 * s).add(V(0, .03, 0)).addScaledVector(f, .01);
  PO.reach(ba, 'R', rh, { grip: .02 });
  orient(raz, PO.handPts(ba, 'R').palm, f.clone().add(V(0, .3, 0)), V(0, 1, 0).applyAxisAngle(f, Math.sign(Math.cos(t * 5)) * 1.2));
  PO.look(ba, eyesUp > 0 ? at(ba, 'head').addScaledVector(f, 1).addScaledVector(r, -.4).add(V(0, .05, 0)) : rh, .7);
}

const rv = shot({
  plate: 'barbier_rev',
  async build(S3) {
    const P = shopRev(S3), ba = await role('barber');
    const bp = S3.floorAt(640, 960); S3.add(ba, bp.x, bp.z, Math.atan2(P.cam.x - bp.x, P.cam.z - bp.z) - .5);
    const raz = S3.prop(rasoir()), sp = S3.prop(strop());
    raz.userData.qa = { grip: true, hand: 'R', owner: 'barber' }; sp.userData.qa = { grip: true, hand: 'L', owner: 'barber' };
    return { actors: [ba], ba, raz, sp, faces: [[ba, 'barber', 5]] };
  },
  frame(lt, u, t, S, st, S3) {
    const { ba, raz, sp } = st;
    idle(ba, t, 5);
    hone(S3, ba, raz, sp, t, t > L[1][0] + .7 * (L[1][1] - L[1][0]) ? 1 : 0);
  },
});

const sh = shot({
  plate: 'barbier',
  async build(S3) {
    const P = shopIn(S3);
    const fa = await role('father', { seat: true }), mo = await role('mohammed', { seat: true }), ba = await role('barber');
    const R = {
      fa: sitTop(S3, fa, 's12-fa', P.seat(230, 700), P.ph, P.stool.clone().lerp(P.cam, .3)),
      mo: sitTop(S3, mo, 's12-mo', P.seat(470, 770), P.ph, P.stool.clone().lerp(P.cam, .55)),
    };
    const bp = S3.floorAt(1250, 930); S3.add(ba, bp.x, bp.z, Math.atan2(P.cam.x - bp.x, P.cam.z - bp.z) + .6);
    const raz = S3.prop(rasoir()), sp = S3.prop(strop());
    raz.userData.qa = { grip: true, hand: 'R', owner: 'barber' }; sp.userData.qa = { grip: true, hand: 'L', owner: 'barber' };
    return { actors: [fa, mo, ba], fa, mo, ba, R, raz, sp, faces: [[fa, null, 2, { lid: .45 }], [mo, null, 3], [ba, 'barber', 5]] };
  },
  frame(lt, u, t, S, st, S3) {
    const { fa, mo, ba, R, raz, sp } = st;
    PO.apply(fa, R.fa); breathe(fa, t, 1, 2); PO.apply(mo, R.mo); breathe(mo, t, 1, 3);
    idle(ba, t, 5); hone(S3, ba, raz, sp, t);
    PO.look(fa, front(fa, 'head', .8, 0, -.15), .6);   // indifferent: eyes down and away
    PO.look(mo, at(fa, 'head'), .6 * sm(L[2][0] + .4, L[2][0] + 1, t));
  },
});

export { rv, sh };
export default beatScene('s14_larbi', {
  shots: { rv, sh },
  plan: {
    b048: { shot: 'p05_larbi' },
    b049: { shot: 'rv', size: 'CU', on: 'barber' },
    b050: { shot: 'sh', size: 'M', on: 'father' },
  },
});
