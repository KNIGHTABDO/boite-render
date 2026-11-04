// s08 mint. Bedroom, lamp lit (chambre_nuit): Lalla Kanza's voice rises from below, Zoubida turns to the door (b024);
// she hands Mohammed a fresh bunch of mint, he takes it in both hands, proud (b025, insert). b026 his POV at child height,
// a slow dolly into the smoky patio (patio_nuit_pov, no actors). b027 from the gallery (patio_nuit): Lalla Kanza tips
// sesame into his palm (insert), he tastes it with the tip of his tongue, then eats; b028 CU: seeds on his nose (insert).
import * as K from '../../../engine/core.js';
import * as PO from '../../../engine/poses.js';
import { shot, role } from './_3d.js';
import { beatScene, lines, put, idle, at, front, dirW, orient, sm, V } from '../lib/beatscene.js';
import { mouthW } from '../lib/acts.js';
import { menthe } from '../lib/props7.js';

const L = lines('s08_menthe');
const ch = shot({
  plate: 'chambre_nuit',
  async build(S3) {
    const zo = await role('zoubida'), mo = await role('mohammed');
    const zp = S3.floorAt(900, 880), mp = S3.floorAt(1110, 930);
    put(S3, zo, 900, 880, mp); put(S3, mo, 1110, 930, zp);
    const door = S3.floorAt(-150, 1000).add(V(0, 1.4, 0));
    const mn = S3.prop(menthe()); mn.userData.qa = { grip: true, hand: 'R', owner: 'mohammed' };
    return { actors: [zo, mo], zo, mo, door, mn, faces: [[zo, 'zoubida', 1], [mo, null, 3]] };
  },
  frame(lt, u, t, S, st) {
    const { zo, mo, door, mn } = st;
    idle(zo, t, 1); idle(mo, t, 3);
    const kz = zo.group.scale.y / 1.6, km = mo.group.scale.y / 1.6;
    // b024: she turns her head to the door at the voice; b025: the hand-over between them, then he hugs the mint to his chest
    PO.look(zo, t < L[1][0] ? door : at(mo, 'head'), .8);
    const give = sm(L[1][0] + .2, L[1][0] + 1, t), take = sm(L[1][0] + 1.4, L[1][0] + 2.2, t);
    const mid = at(zo, 'chest').lerp(at(mo, 'chest'), .55).add(V(0, -.05, 0));
    const zh = front(zo, 'chest', .15 * kz, .12 * kz, -.15 * kz).lerp(mid, give * (1 - take));
    const mh = front(mo, 'chest', .12 * km, 0, -.02 * km);
    const hold = take < 1 ? mid.clone().lerp(mh, take) : mh;
    if (give > 0 && take < .5) { PO.reach(zo, 'R', zh, { grip: .02 }); orient(mn, PO.handPts(zo, 'R').palm, V(0, 1, 0).add(dirW(zo, 0, 0, 1).multiplyScalar(.3))); }
    else PO.reach(zo, 'R', front(zo, 'root', .1 * kz, .2 * kz, -.1 * kz), { grip: .02 });
    mn.visible = give > 0;
    if (take > 0) {
      PO.reach(mo, 'R', hold.clone().addScaledVector(dirW(mo, 1, 0, 0), -.03), { grip: .02 }); PO.reach(mo, 'L', hold.clone().addScaledVector(dirW(mo, 1, 0, 0), .03), { grip: .02 });
      if (take >= .5) orient(mn, PO.handPts(mo, 'R').palm, V(0, 1, 0).add(dirW(mo, 0, 0, 1).multiplyScalar(.2)));
      mo.B.chest.rotation.x -= .1 * take; mo.B.chest.updateWorldMatrix(false, true);   // proud: chest out
    }
    PO.look(mo, take > .5 ? mn.position.clone().add(V(0, .1, 0)) : at(zo, 'head'), .7);
  },
});

// b026: child-height POV dolly through the smoke (no actors): ≤ 12 % push, drifting a little left
const pov = shot({ plate: 'patio_nuit_pov', async build() { return {}; }, view: (lt, u) => [960 - 30 * u, 560, 1.06 + .1 * K.ease(u)] });

const pa = shot({
  plate: 'patio_nuit',
  async build(S3) {
    const ka = await role('kanza'), mo = await role('mohammed');
    const kp = S3.floorAt(1010, 760), mp = S3.floorAt(860, 790);
    put(S3, ka, 1010, 760, mp); put(S3, mo, 860, 790, kp);
    return { actors: [ka, mo], ka, mo, faces: [[ka, null, 11, { blink: .7 }], [mo, null, 3, (lt, t) => ({ open: t > L[3][0] + .45 * (L[3][1] - L[3][0]) && t < L[4][0] ? .3 : 0 })]] };
  },
  frame(lt, u, t, S, st) {
    const { ka, mo } = st, D = L[3][1] - L[3][0];
    idle(ka, t, 11); idle(mo, t, 3);
    const kk = ka.group.scale.y / 1.6, km = mo.group.scale.y / 1.6;
    // his right palm held out, cupped; her hand tips the seeds above it; after the insert he brings it to his mouth
    const palm = front(mo, 'chest', .25 * km, .03 * km, -.12 * km);
    const toMouth = sm(L[3][0] + .5 * D, L[3][0] + .62 * D, t) * (1 - sm(L[3][0] + .8 * D, L[3][0] + .9 * D, t)) + sm(L[4][0] - .2, L[4][0] + .3, t);
    PO.reach(mo, 'R', palm.clone().lerp(mouthW(mo).addScaledVector(dirW(mo, 0, 0, 1), .05), K.clamp(toMouth)), { grip: .03 });
    PO.look(mo, toMouth > .3 ? palm : at(ka, 'head'), .6);
    const tip = sm(L[3][0] + .1, L[3][0] + .5, t) * (1 - sm(L[3][0] + .45 * D, L[3][0] + .55 * D, t));
    PO.reach(ka, 'R', front(ka, 'root', .1 * kk, .2 * kk, -.1 * kk).lerp(palm.clone().add(V(0, .1, 0)), tip), { grip: .03 });
    PO.look(ka, at(mo, 'head'), .7);
  },
});

export { ch, pov, pa };
export default beatScene('s08_menthe', {
  shots: { ch, pov, pa },
  plan: {
    b024: { shot: 'ch', size: 'M', on: 'zoubida' },
    b025: { shot: 'ch', size: 'M', on: 'mohammed', insAt: .5 },
    b026: { shot: 'pov' },
    b027: { shot: 'pa', size: 'M', on: 'kanza', insAt: .35 },
    b028: { shot: 'pa', size: 'CU', on: 'mohammed', insAt: .3 },
  },
});
