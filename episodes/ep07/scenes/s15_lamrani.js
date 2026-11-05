// s15 Sidi Ahmed Lamrani. Inside (barbier): a young man, waxy-white, crow-black beard, walks in from the right and sits
// on the front edge of the waiting platform, legs down (b051); father and Mohammed stay cross-legged behind him. b052 the
// barber, by the stool, greets him and answers his own questions, hands busy; b053 CU the barber (insert: the gag);
// b054 CU Lamrani, modest, hand on his chest; b055 CU the barber, sly, on his daughter of marrying age.
import * as PO from '../../../engine/poses.js';
import { shot, role, breathe } from './_3d.js';
import { beatScene, lines, idle, at, front, sm, V } from '../lib/beatscene.js';
import { walk } from '../lib/acts.js';
import { shopIn, sitTop, sitStool } from '../lib/shop7.js';

const L = lines('s15_lamrani');
const SIT = L[0][0] + 4.2;

const sh = shot({
  plate: 'barbier',
  async build(S3) {
    const P = shopIn(S3);
    const fa = await role('father', { seat: true }), mo = await role('mohammed', { seat: true }), ba = await role('barber');
    const la = await role('lamrani', { seat: true }), lw = await role('lamrani', { copy: '_w' });
    // the platform's front top edge runs at y ~822; x 720 keeps a hand's width from Mohammed (590 cut into his shoulder); he sits 0.14 m in from it, feet on the floor in front of the face
    const edge = S3.floorAt(720, 822, P.ph).setY(0), inward = edge.clone().sub(P.cam).setY(0).normalize();
    const lp = edge.clone().addScaledVector(inward, .14), face = lp.clone().lerp(P.cam, .5).add(V(.4, 0, 0));
    const R = {
      fa: sitTop(S3, fa, 's12-fa', P.seat(230, 700), P.ph, P.stool.clone().lerp(P.cam, .3)),
      mo: sitTop(S3, mo, 's12-mo', P.seat(470, 770), P.ph, P.stool.clone().lerp(P.cam, .55)),
      la: sitStool(S3, la, 's15-la', lp, P.ph, face, { lean: .1, fz: .4 }),
    };
    (S3.qa?.supports || {}).lamrani = P.ph;
    const bp = S3.floorAt(1250, 930); S3.add(ba, bp.x, bp.z, Math.atan2(lp.x - bp.x, lp.z - bp.z));
    const w0 = S3.floorAt(1750, 1060), w1 = edge.clone().addScaledVector(inward, -.45);
    S3.add(lw, w0.x, w0.z, 0);
    return {
      actors: [fa, mo, ba, la, lw], fa, mo, ba, la, lw, R, w0, w1, lp,
      faces: [[fa, null, 2], [mo, null, 3], [ba, 'barber', 5], [la, 'lamrani', 12], [lw, null, 12]],
    };
  },
  frame(lt, u, t, S, st) {
    const { fa, mo, ba, la, lw, R, w0, w1, lp } = st;
    PO.apply(fa, R.fa); breathe(fa, t, 1, 2); PO.apply(mo, R.mo); breathe(mo, t, 1, 3);
    const seated = t >= SIT;
    la.group.visible = seated; lw.group.visible = !seated;
    if (!seated) {
      idle(lw, t, 12);
      walk(lw, w0, w1, L[0][0] + .3, SIT - .5, t, { cps: 1.7 });
      if (t > SIT - .5) { lw.group.rotation.y = Math.atan2(w1.x - lp.x, w1.z - lp.z); lw.group.updateMatrixWorld(true); }
      PO.look(lw, at(ba, 'head'), .5);
    } else {
      PO.apply(la, R.la); breathe(la, t, 1, 12);
      la.group.position.y = .06 * (1 - sm(SIT, SIT + .3, t)); la.group.updateMatrixWorld(true);
      const k = la.group.scale.y / 1.6, modest = sm(L[3][0] - .1, L[3][0] + .4, t) * (1 - sm(L[4][0], L[4][0] + .5, t));
      if (modest > 0) PO.reach(la, 'R', front(la, 'chest', .08 * k, 0, 0).lerp(front(la, 'chest', .2 * k, .1 * k, -.2 * k), 1 - modest), { grip: .05 });
      PO.look(la, at(ba, 'head'), .6);
      if (modest > 0) { la.B.head.rotation.x += .12 * modest; la.B.head.updateWorldMatrix(false, true); }
    }
    // the barber: busy hands while he talks (wipes them on his apron), both palms up on the questions
    idle(ba, t, 5);
    const k = ba.group.scale.y / 1.6, q = t > L[1][0] && t < L[1][1] ? Math.max(0, Math.sin((t - L[1][0]) * 1.3)) : 0;
    PO.reach(ba, 'L', front(ba, 'chest', .25 * k, -.12 * k, (-.15 + .1 * q) * k), { grip: .05 });
    PO.reach(ba, 'R', front(ba, 'chest', .25 * k, .12 * k, (-.15 + .1 * q) * k), { grip: .05 });
    PO.look(ba, seated ? at(la, 'head') : at(lw, 'head'), .7);
    PO.look(fa, seated ? at(la, 'head') : at(lw, 'head'), .5); PO.look(mo, at(ba, 'head'), .5);
  },
});

export { sh };
export default beatScene('s15_lamrani', {
  shots: { sh },
  plan: {
    b051: { shot: 'sh', size: 'W', cover: [{ f: .6, size: 'M', on: 'lamrani' }] },
    b052: { shot: 'sh', size: 'M', on: 'barber', cover: [{ f: .5, size: 'M', on: 'lamrani' }] },
    b053: { shot: 'sh', size: 'CU', on: 'barber', noIns: true },   // v2 QA: the cup-sucking insert read as random over 'Que deviennent tes études'
    b054: { shot: 'sh', size: 'CU', on: 'lamrani' },
    b055: { shot: 'sh', size: 'CU', on: 'barber' },
  },
});
