// s21 fever. b152 Mohammed in bed (chambre_jour right mattress, as s16/s19), eyes heavy, hands resting on his chest,
// shallow fast breathing; M then CU (the push). b153 painting; b154 Zoubida kneels by the bed, both palms to her temples,
// rocking: "Mon fils va mourir !"; b155 painting (drum).
import * as PO from '../../../engine/poses.js';
import * as PR from '../../../engine/props3d.js';
import { staged } from '../lib/autostage.js';
import { beatScene, lines, sm, at, front, V } from '../lib/beatscene.js';

const ID = 's21_fievre', L = lines(ID), B = i => L[i] || [0, 0];

// Argon r6: face 0 sent the feet at the lens (a "fetal sack"). r7 (stills14): the right mattress recedes into depth, so any
// lie there foreshortens into a sitting doll. Now the back mattress, parallel to the lens: a clean side view, head at its right
// end, feet toward the lamp table, a thin blanket to the chest, hands on the belly.
const MO = { at: [1000, 668], face: [650, 668], pose: 'lie', o: { top: .26, turn: .35 }, seed: 3, talk: 0,
  look: (t, st, S3) => S3.cam.position.clone(), lookMax: .7,   // head rolled on the pillow toward the lens
  lids: t => .6 + .2 * (.5 + .5 * Math.sin(t * .6)) };
function fever(mo, t, st, S3) {
  const km = mo.group.scale.y / 1.6;
  if (!st.bk) {   // the blanket: from the belly to past the feet, bottom on the mattress, top just over the hips (built once, from the lying pose)
    const hip = at(mo, 'root'), ft = at(mo, 'footL').lerp(at(mo, 'footR'), .5), d = ft.clone().sub(hip).setY(0); d.normalize();
    const a = hip.clone().addScaledVector(d, -.16 * km), b = ft.clone().addScaledVector(d, .1 * km), top = hip.y + .06 * km, bot = .29;
    st.bk = PR.blanket({ w: .46 * km, l: a.distanceTo(b), h: top - bot });
    const m = a.lerp(b, .5); S3.prop(st.bk, m.x, bot, m.z, Math.atan2(d.x, d.z));
  }
  mo.B.chest.rotation.x += .02 * Math.sin(t * 5); mo.B.chest.updateWorldMatrix(false, true);   // body first, then the hands (no drift)
  for (const s of ['L', 'R']) {   // hands rest on the blanket's edge over his belly, rising with a shallow fever breath (low: away from the chin)
    const p = at(mo, 'spine').lerp(at(mo, 'root'), .45).lerp(at(mo, 'upperArm' + s), .22).add(V(0, (.09 + .008 * Math.sin(t * 5)) * km, 0));
    PO.reach(mo, s, p, { grip: .05 });
  }
}
// b152: the boy alone, a slow push from M to CU on his heavy eyes
const ch1 = staged('chambre_jour', { mohammed: MO }, { act(lt, t, S, st, S3) { fever(st.A.mohammed, t, st, S3); } });
// b154: Argon r6 — she stood in the foreground facing us, far from the bed, palms clamped to her jaw (fingers through the face).
// Now she kneels on the floor by his head (front-right of the back mattress), body 3/4 to the lens, head turned to him; hands clasped at her
// breastbone (nothing near the face), rocking; on "Ô mes sœurs" the head lifts and turns out toward the room.
const ch2 = staged('chambre_jour', { mohammed: MO, zoubida: { at: [1235, 765], face: [1000, 1000], pose: 'kneel', seed: 7, hands: false,
  look: t => t < B(2)[0] + .45 * (B(2)[1] - B(2)[0]) ? 'mohammed' : null, lookMax: .75 } }, {
  addressee: { zoubida: 'mohammed' },
  act(lt, t, S, st, S3) {
    const { zoubida: zo, mohammed: mo } = st.A, k = zo.group.scale.y / 1.6;
    fever(mo, t, st, S3);
    const u = sm(B(2)[0] - .6, B(2)[0] + .3, t), r = Math.sin((t - B(2)[0]) * 2.2);
    zo.B.spine.rotation.x += (.16 + .07 * r) * u; zo.B.chest.rotation.x += (.06 + .03 * r) * u; zo.B.chest.rotation.z += .015 * Math.sin(t * 13) * u;   // bent toward him, rocking, sobbing shoulders
    zo.B.chest.updateWorldMatrix(false, true);
      // stills14: the chest-height target sat inside the bent trunk and the IK threw the elbows up to her head → clasp lower,
    // in front of the belly, clear of the trunk, default elbow poles (elbows down)
    for (const s of ['L', 'R']) PO.reach(zo, s, front(zo, 'spine', .26 * k, (s === 'L' ? -.03 : .03) * k, .02 * k), { grip: .2 });   // held from the cut (the root→chest blend flipped the elbows up to her face)
  },
});

export default beatScene(ID, {
  shots: { ch1, ch2 },
  plan: {
    b152: { shot: 'ch1', size: 'M', on: 'mohammed', z: 2.1, zTo: 3.6, push: B(0)[1] - B(0)[0] + 1.5 },   // one continuous push (Argon r6)
    b154: { shot: 'ch2', size: 'M', on: 'zoubida', z: 1.8 },   // two-shot: her and the boy behind her
  },
});
