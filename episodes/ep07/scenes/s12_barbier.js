// s12 at the barber's. Inside (barbier): a stranger on the stool, back to us, cherry-red ears; Si Abderrahman behind him
// sets two tin cups on his nape (insert); father and Mohammed cross-legged on the waiting platform, Mohammed turns his
// eyes away (b040). b041 the barber turns to them, cheerful, counting the toys on his fingers; the stranger stays bent.
// b042 CU Mohammed, red with indignation while the men laugh (the barber and the client shake with laughter behind).
import * as PO from '../../../engine/poses.js';
import { shot, role, breathe } from './_3d.js';
import { beatScene, lines, idle, at, front, dirW, sm, V } from '../lib/beatscene.js';
import { shopIn, sitTop, sitStool } from '../lib/shop7.js';

const L = lines('s12_barbier');
const laugh = t => t > L[2][0] + .2 && t < L[2][0] + 4.5;

const sh = shot({
  plate: 'barbier',
  async build(S3) {
    const P = shopIn(S3);
    const ba = await role('barber'), cl = await role('client', { seat: true });
    const fa = await role('father', { seat: true }), mo = await role('mohammed', { seat: true });
    const away = P.stool.clone().add(P.stool.clone().sub(P.cam).setY(0).normalize());
    const R = {
      cl: sitStool(S3, cl, 's12-cl', P.stool, P.sh, away, { lean: .45 }),   // bent forward, nape offered
      fa: sitTop(S3, fa, 's12-fa', P.seat(230, 700), P.ph, P.stool.clone().lerp(P.cam, .3)),
      mo: sitTop(S3, mo, 's12-mo', P.seat(470, 770), P.ph, P.stool.clone().lerp(P.cam, .55)),
    };
    S3.qa.supports.client = P.sh;
    const bp = S3.floorAt(1250, 930); S3.add(ba, bp.x, bp.z, Math.atan2(P.stool.x - bp.x, P.stool.z - bp.z));
    return {
      actors: [ba, cl, fa, mo], ba, cl, fa, mo, R, P, bp,
      faces: [[ba, 'barber', 5, (lt, t) => laugh(t) ? { open: .5 + .3 * Math.sin(t * 14) } : {}], [cl, null, 6], [fa, null, 2, (lt, t) => laugh(t) ? { open: .3 + .2 * Math.sin(t * 11) } : {}],
        [mo, null, 3, (lt, t) => ({ sad: t > L[2][0] ? .6 : 0, lid: t > L[2][0] ? .25 : 0 })]],
    };
  },
  frame(lt, u, t, S, st) {
    const { ba, cl, fa, mo, R, P, bp } = st;
    for (const [a, s] of [[cl, 6], [fa, 2], [mo, 3]]) { PO.apply(a, R[a.name]); breathe(a, t, 1, s); }
    idle(ba, t, 5);
    const k = ba.group.scale.y / 1.6, nape = at(cl, 'neck');
    // b040: both hands at the stranger's nape (pressing the cups); b041: turns to the platform, counting on his fingers
    const turn = sm(L[1][0] - .3, L[1][0] + .6, t);
    ba.group.rotation.y = Math.atan2(P.stool.x - bp.x, P.stool.z - bp.z) * (1 - turn) + Math.atan2(at(fa, 'root').x - bp.x, at(fa, 'root').z - bp.z) * turn;
    ba.group.updateMatrixWorld(true);
    if (turn < .5) {
      PO.reach(ba, 'L', nape.clone().addScaledVector(dirW(cl, 1, 0, 0), .05).addScaledVector(dirW(cl, 0, 0, -1), .07), { grip: .04 });
      PO.reach(ba, 'R', nape.clone().addScaledVector(dirW(cl, -1, 0, 0), .05).addScaledVector(dirW(cl, 0, 0, -1), .07), { grip: .04 });
      PO.look(ba, nape, .8);
    } else {
      const n = Math.floor((t - L[1][0]) / 1.6) % 4, tick = Math.sin((t - L[1][0]) * Math.PI / .8);
      PO.reach(ba, 'L', front(ba, 'chest', .28 * k, -.05 * k, -.1 * k), { grip: .05 });
      PO.reach(ba, 'R', front(ba, 'chest', .3 * k, .04 * k + .02 * n, -.08 * k + .02 * Math.max(0, tick)), { grip: .02 });
      PO.look(ba, at(mo, 'head'), .7);
    }
    if (laugh(t)) { ba.B.spine.rotation.x += .06 * Math.sin(t * 13); ba.B.spine.updateWorldMatrix(false, true); fa.B.chest.rotation.x += .04 * Math.sin(t * 11); fa.B.chest.updateWorldMatrix(false, true); }
    PO.look(cl, front(cl, 'root', .6, 0, -.4), .5);
    PO.look(fa, at(ba, 'head'), .6);
    // Mohammed: watches, looks away when the cups go on (b040, after the insert); b042 chin up, offended
    const away = sm(L[0][0] + .62 * (L[0][1] - L[0][0]), L[0][0] + .7 * (L[0][1] - L[0][0]), t) * (1 - sm(L[1][0] + 1, L[1][0] + 1.6, t));
    PO.look(mo, away > .5 ? front(mo, 'head', .5, -.8, -.1) : t > L[2][0] ? front(mo, 'head', .6, .3, .25) : at(ba, 'head'), .8);
    if (t > L[2][0]) { mo.B.head.rotation.x -= .1 * sm(L[2][0], L[2][0] + .5, t); mo.B.head.updateWorldMatrix(false, true); }
  },
});

export { sh };
export default beatScene('s12_barbier', {
  shots: { sh },
  plan: {
    b040: { shot: 'sh', size: 'W', insAt: .45 },
    b041: { shot: 'sh', size: 'M', on: 'barber', cover: [{ f: .55, size: 'W' }] },
    b042: { shot: 'sh', size: 'CU', on: 'mohammed' },
  },
});
