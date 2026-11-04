// s10 the plans. Bedroom, lamp lit (chambre_nuit): the father, cross-legged on the back banquette beside the lamp, tells
// tomorrow's plan (souk, the toys, a candle for the fqih at Bab Moulay Idriss), one hand opening toward the door; Mohammed
// on the rug before him glows (b034). b035 CU Mohammed: happy, then the smile drains at "le coiffeur" (lids drop, brows
// sad). b036 painting: the dream of candles.
import * as PO from '../../../engine/poses.js';
import { shot, role, memoPose, breathe } from './_3d.js';
import { beatScene, lines, put, at, front, heightAt, sm, V } from '../lib/beatscene.js';

const L = lines('s10_plans');
const D1 = L[1][1] - L[1][0];
const fade = t => sm(L[1][0] + .17 * D1, L[1][0] + .3 * D1, t) * .6 + sm(L[1][0] + .33 * D1, L[1][0] + .45 * D1, t) * .4;   // "m'ennuyait" -> "coiffeur"

const ch = shot({
  plate: 'chambre_nuit',
  async build(S3) {
    const cam = S3.cam.position.clone().setY(0);
    const fa = await role('father', { seat: true }), mo = await role('mohammed', { seat: true });
    // the back banquette: front face foot y 700, top y 650 at x 900; he sits 0.35 m in from the front edge
    const mh = heightAt(S3, 900, 700, 650), edge = S3.floorAt(900, 700);
    const fp = edge.clone().add(edge.clone().sub(cam).setY(0).normalize().multiplyScalar(.35));
    const mp = S3.floorAt(1150, 900);
    S3.add(fa, fp.x, fp.z, Math.atan2(cam.x * .5 + mp.x * .5 - fp.x, cam.z * .5 + mp.z * .5 - fp.z));
    memoPose('s10-fa', fa, [mh], () => PO.crossLegged(fa, { seat: mh, lean: .1 }));
    put(S3, mo, 1150, 900, cam.clone().lerp(fp, .7));
    memoPose('s10-mo', mo, [1], () => PO.crossLegged(mo, { seat: 0, lean: .15 }));
    const P = { fa: PO.snap(fa), mo: PO.snap(mo) };
    S3.qa.supports.father = mh; S3.qa.supports.mohammed = 0;
    const door = S3.floorAt(-150, 1000).add(V(0, 1.2, 0));
    return {
      actors: [fa, mo], fa, mo, P, door, cam,
      faces: [[fa, 'father', 2], [mo, null, 3, (lt, t) => ({ sad: .8 * fade(t), lid: .35 * fade(t) })]],
    };
  },
  frame(lt, u, t, S, st) {
    const { fa, mo, P, door, cam } = st;
    PO.apply(fa, P.fa); breathe(fa, t, 1, 2); PO.apply(mo, P.mo); breathe(mo, t, 1, 3);
    // the father: right hand opens toward the door on "au souk", back to the knee; eyes on his son
    const k = fa.group.scale.y / 1.6, g = sm(L[0][0] + 1.2, L[0][0] + 2, t) * (1 - sm(L[0][0] + 4.2, L[0][0] + 5, t));
    if (g > 0) PO.reach(fa, 'R', front(fa, 'chest', .3 * k, .12 * k, -.1 * k).lerp(front(fa, 'chest', .35 * k, .32 * k, .05 * k), g), { grip: .05 });
    PO.look(fa, g > .5 ? door : at(mo, 'head'), .6);
    // Mohammed: looks up at his father, leaning in; in b035 his gaze drops to his lap as the smile drains
    const f = fade(t);
    PO.look(mo, f > .3 ? front(mo, 'root', .5, 0, 0) : at(fa, 'head'), .7);
    mo.B.spine.rotation.x += .08 * (1 - f) - .04 * f; mo.B.spine.updateWorldMatrix(false, true);
  },
});

export { ch };
export default beatScene('s10_plans', {
  shots: { ch },
  plan: {
    b034: { shot: 'ch', size: 'M', on: 'father', cover: [{ f: .62, size: 'M', on: 'mohammed' }] },
    b035: { shot: 'ch', size: 'CU', on: 'mohammed' },
    b036: { shot: 'p03_reve_cierges' },
  },
});
