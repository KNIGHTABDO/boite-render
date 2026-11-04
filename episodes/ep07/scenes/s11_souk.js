// s11 the souk. b037 painting: the toy-souk crowd. b038 the toy alley (souk_jouets, low camera): father and son walk
// toward us hand in hand (0.6 m apart), stop at the drum stall, the father points (insert: the hourglass drum). b039 wide:
// they turn and walk away up the alley toward the candle stall at its end (insert: the one-pound candle), then cut to the
// barber's alley (barbier_ext): the pair arrives under the old vine and stops before Si Abderrahman's shop.
import * as PO from '../../../engine/poses.js';
import { shot, role } from './_3d.js';
import { beatScene, lines, idle, at, front, sm, V } from '../lib/beatscene.js';
import { walk } from '../lib/acts.js';

const L = lines('s11_souk');
const GAP = .6;

/** the pair walks p0 -> p1 side by side (kid on the path's left), then links hands at kid hip height */
function pair(fa, mo, p0, p1, t0, t1, t, { cf = 1.7, cm = 2.5 } = {}) {
  const d = p1.clone().sub(p0).setY(0).normalize(), left = V(d.z, 0, -d.x);
  const off = (p, s) => p.clone().addScaledVector(left, s * GAP / 2);
  const w = walk(fa, off(p0, -1), off(p1, -1), t0, t1, t, { cps: cf });
  walk(mo, off(p0, 1), off(p1, 1), t0, t1, t, { cps: cm });
  return w;
}
function hold(fa, mo, t) {
  const g = at(fa, 'root').lerp(at(mo, 'root'), .5); g.y = .68 * mo.group.scale.y / 1.3 + .02 * Math.sin(t * 3);
  PO.reach(fa, 'R', g.clone().addScaledVector(at(fa, 'root').sub(at(mo, 'root')).setY(0).normalize(), .02), { grip: .03 });
  PO.reach(mo, 'L', g.clone().addScaledVector(at(mo, 'root').sub(at(fa, 'root')).setY(0).normalize(), .02), { grip: .03 });
}

const so = shot({
  plate: 'souk_jouets',
  async build(S3) {
    const fa = await role('father'), mo = await role('mohammed');
    const a0 = S3.floorAt(960, 690), a1 = S3.floorAt(840, 930), far = S3.floorAt(960, 640);
    const drums = S3.floorAt(1500, 760).add(V(0, 1.3, 0));
    S3.add(fa, a0.x, a0.z, 0); S3.add(mo, a0.x, a0.z, 0);
    return { actors: [fa, mo], fa, mo, a0, a1, far, drums, faces: [[fa, null, 2], [mo, null, 3]] };
  },
  frame(lt, u, t, S, st) {
    const { fa, mo, a0, a1, far, drums } = st;
    idle(fa, t, 2); idle(mo, t, 3);
    const b38 = t < L[2][0];
    if (b38) {
      // b038: toward us, then a stop at the drums (the father turns his head and points)
      const w = pair(fa, mo, a0, a1, L[1][0] - .5, L[1][1] - 1.6, t);
      hold(fa, mo, t);
      const pt = sm(L[1][1] - 1.6, L[1][1] - 1, t);
      PO.look(fa, w < 1 ? at(mo, 'head') : drums, .5 + .3 * pt); PO.look(mo, drums, .3 + .6 * pt);
      if (pt > 0) { const k = fa.group.scale.y / 1.6; PO.reach(fa, 'L', front(fa, 'chest', .2 * k, -.05 * k, -.1 * k).lerp(drums, .25 * pt), { grip: .0 }); }
    } else {
      // b039: they turn round and walk away up the alley toward the candle stall
      const c = a1.clone();
      pair(fa, mo, c, far, L[2][0] - .05, L[2][0] + 5.2, t);
      hold(fa, mo, t);
      PO.look(mo, at(fa, 'head'), .4);
    }
  },
});

const ex = shot({
  plate: 'barbier_ext',
  async build(S3) {
    const fa = await role('father'), mo = await role('mohammed');
    const b0 = S3.floorAt(470, 900), b1 = S3.floorAt(980, 1050), shop = S3.floorAt(1140, 950).add(V(0, 1.3, 0));
    S3.add(fa, b0.x, b0.z, 0); S3.add(mo, b0.x, b0.z, 0);
    return { actors: [fa, mo], fa, mo, b0, b1, shop, faces: [[fa, null, 2], [mo, null, 3]] };
  },
  frame(lt, u, t, S, st) {
    const { fa, mo, b0, b1, shop } = st;
    idle(fa, t, 2); idle(mo, t, 3);
    const t0 = L[2][0] + .6 * (L[2][1] - L[2][0]) - .3;
    const w = pair(fa, mo, b0, b1, t0, L[2][1] - .3, t);
    if (w >= 1) for (const a of [fa, mo]) { a.group.rotation.y = Math.atan2(shop.x - a.group.position.x, shop.z - a.group.position.z); a.group.updateMatrixWorld(true); }
    hold(fa, mo, t);
    PO.look(fa, shop, .5); PO.look(mo, shop.clone().add(V(0, -.3, 0)), .6);
  },
});

export { so, ex };
export default beatScene('s11_souk', {
  shots: { so, ex },
  plan: {
    b037: { shot: 'p04_souk_foule' },
    b038: { shot: 'so', size: 'M', on: 'father', insAt: .9 },
    b039: { shot: 'so', size: 'W', insAt: .28, segs: [[.6, 'ex']], cover: [{ f: .6, size: 'W', shot: 'ex' }] },
  },
});
