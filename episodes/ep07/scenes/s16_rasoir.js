// s16 the razor. Inside (barbier), the cold-open staging in context: Mohammed on the painted stool facing us, the barber
// behind him drops the striped towel round his shoulders and tucks it to the chin (b056). b057 painting: the barber's
// hymn to the street. b058 Lamrani, on the platform edge, laughs "tu es un poète"; b059 CU the barber with the ebony
// razor (inserts: the oily stone, the edge tried on a thumbnail); b060 CU Mohammed: the lids grow heavy, he dozes;
// b061 his head tips sideways (inserts: the blade at the nape, a bead of sweat on his nose).
import * as K from '../../../engine/core.js';
import * as PO from '../../../engine/poses.js';
import { shot, role, memoPose, breathe } from './_3d.js';
import { beatScene, lines, idle, at, front, dirW, orient, sm, V } from '../lib/beatscene.js';
import { serviette, rasoir } from '../lib/props7.js';
import { shopIn, sitTop, sitStool } from '../lib/shop7.js';

const L = lines('s16_rasoir');
const lids = t => t < L[4][0] ? 0 : Math.min(1, sm(L[4][0] + 1.5, L[4][1], t) * .9 + .1 * Math.max(0, Math.sin(t * 1.1)) * sm(L[4][0], L[4][0] + 2, t));

const sh = shot({
  plate: 'barbier',
  async build(S3) {
    const P = shopIn(S3);
    const mo = await role('mohammed', { seat: true }), ba = await role('barber');
    const fa = await role('father', { seat: true }), la = await role('lamrani', { seat: true });
    // Mohammed on the stool facing us, feet on the rung (exactly the s01 pose)
    const seat = P.sh, rung = seat - .3;
    S3.add(mo, P.stool.x, P.stool.z, Math.atan2(P.cam.x - P.stool.x, P.cam.z - P.stool.z));
    memoPose('mo-stool', mo, [seat], () => PO.stool(mo, { seat, floor: rung, hands: false, fz: .26, ankle: .05, spread: .1 }));
    const R = { mo: PO.snap(mo) };
    S3.qa.supports.mohammed = rung;
    const bp = P.stool.clone().addScaledVector(dirW(mo, 0, 0, -1), .5).addScaledVector(dirW(mo, -1, 0, 0), -.28);
    S3.add(ba, bp.x, bp.z, Math.atan2(P.stool.x - bp.x, P.stool.z - bp.z) - .25);
    // the platform: the father cross-legged at the back, Lamrani on the front edge
    const edge = S3.floorAt(590, 822, P.ph).setY(0), inward = edge.clone().sub(P.cam).setY(0).normalize();
    const lp = edge.clone().addScaledVector(inward, .14);
    R.fa = sitTop(S3, fa, 's12-fa', P.seat(230, 700), P.ph, P.stool.clone().lerp(P.cam, .3));
    R.la = sitStool(S3, la, 's15-la', lp, P.ph, lp.clone().lerp(P.cam, .5).add(V(.4, 0, 0)), { lean: .1, fz: .4 });
    S3.qa.supports.lamrani = P.ph;
    const neck = at(mo, 'neck'), towel = S3.prop(serviette(.06, .21, neck.y - seat + .02), neck.x, neck.y + .03, neck.z);
    const raz = S3.prop(rasoir()); raz.userData.qa = { grip: true, hand: 'R', owner: 'barber' };
    return {
      actors: [mo, ba, fa, la], mo, ba, fa, la, R, towel, neck, raz, cam: P.cam,
      faces: [[mo, null, 1, (lt, t) => ({ lid: lids(t) })], [ba, 'barber', 5], [fa, null, 2], [la, 'lamrani', 12, (lt, t) => t > L[2][0] && t < L[2][1] + .8 ? { open: Math.max(.2, K.noise(t * 9, 2)) * .5 } : {}]],
    };
  },
  frame(lt, u, t, S, st) {
    const { mo, ba, fa, la, R, towel, neck, raz, cam } = st;
    PO.apply(mo, R.mo); breathe(mo, t, 1, 1); PO.apply(fa, R.fa); breathe(fa, t, 1, 2); PO.apply(la, R.la); breathe(la, t, 1, 12);
    idle(ba, t, 5);
    // b056: the towel falls round him (drops 0.25 m and spreads), the barber's hands tuck it at the chin
    const w = sm(L[0][0] + .8, L[0][0] + 1.6, t);
    towel.visible = w > 0; towel.position.set(neck.x, neck.y + .03 + .25 * (1 - w), neck.z); towel.scale.set(.6 + .4 * w, 1, .6 + .4 * w); towel.updateMatrixWorld(true);
    const tuck = sm(L[0][0] + .3, L[0][0] + .9, t) * (1 - sm(L[0][0] + 2.6, L[0][0] + 3.3, t));
    // b059 onwards: razor in hand, stropping beside his chest; b061 the edge to the nape
    const hasR = t >= L[3][0], nape = at(mo, 'neck').addScaledVector(dirW(mo, 0, 0, -1), .06).add(V(0, .03, 0));
    const toNape = sm(L[5][0] + .3, L[5][0] + 1, t);
    raz.visible = hasR;
    if (tuck > 0) for (const [s, x] of [['L', .08], ['R', -.08]]) PO.reach(ba, s, at(mo, 'neck').addScaledVector(dirW(mo, 1, 0, 0), x).add(V(0, -.02, 0)).addScaledVector(dirW(mo, 0, 0, 1), .02 * tuck), { grip: .03 });
    else if (hasR) {
      const strop = front(ba, 'chest', .32, .12, -.12 + .03 * Math.sin(t * 5));
      PO.reach(ba, 'R', strop.lerp(nape.clone().addScaledVector(dirW(mo, -1, 0, 0), .05), toNape), { grip: .02 });
      PO.reach(ba, 'L', at(mo, 'head').add(V(0, .12, 0)).addScaledVector(dirW(mo, 0, 0, -1), .02), { grip: .03 });
      const palm = PO.handPts(ba, 'R').palm;
      orient(raz, palm, V(0, 1, 0).lerp(nape.clone().sub(palm).normalize(), toNape).add(V(0, .001, 0)), dirW(ba, 0, 0, 1));
    }
    PO.look(ba, toNape > .5 || tuck > 0 ? nape : t > L[1][0] && t < L[3][0] ? at(la, 'head') : V(cam.x, 1.2, cam.z), .7);
    // Mohammed: eyes on us; dozes in b060, the head tips over in b061
    const tip = sm(L[5][0], L[5][0] + 1.2, t);
    PO.look(mo, V(cam.x, .95, cam.z), .5 * (1 - lids(t)));
    if (lids(t) > 0) { mo.B.head.rotation.x += .15 * lids(t); mo.B.head.rotation.z += .35 * tip; mo.B.head.updateWorldMatrix(false, true); }
    PO.look(fa, at(ba, 'head'), .5); PO.look(la, at(ba, 'head'), .6);
  },
});

export { sh };
export default beatScene('s16_rasoir', {
  shots: { sh },
  plan: {
    b056: { shot: 'sh', size: 'M', on: 'mohammed' },
    b057: { shot: 'p06_hymne_rue' },
    b058: { shot: 'sh', size: 'M', on: 'lamrani' },
    b059: { shot: 'sh', size: 'CU', on: 'barber', insAt: .05 },
    b060: { shot: 'sh', size: 'CU', on: 'mohammed' },
    b061: { shot: 'sh', size: 'CU', on: 'mohammed', insAt: .45 },
  },
});
