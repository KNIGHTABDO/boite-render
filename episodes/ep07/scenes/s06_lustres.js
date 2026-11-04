// s06 chandeliers. Msid, afternoon (msid_lustres): Mohammed, kid1 and kid2 cross-legged on the floor cutting wicks from an
// old white cloth (b013, insert: the scissors). b014 painted montage (wick on tin strip / glass of water and oil / powder),
// b015 the powder packets in the fqih's babouches (held gag). b016 reverse angle (msid_lustres_rev): the big boy on a
// wobbly step ladder under the painted chandelier, grand2 steadying it, Hammoussa by them (insert: the cut thumb, then
// he sucks it). b017 same angle at sunset: the fqih, cross-legged by the door, prays with open hands; four pupils chant.
import * as K from '../../../engine/core.js';
import * as PO from '../../../engine/poses.js';
import { shot, role, memoPose, breathe } from './_3d.js';
import { beatScene, lines, put, idle, at, front, dirW, hangAt, sm, V } from '../lib/beatscene.js';
import { mouthW } from '../lib/acts.js';
import { echelle } from '../lib/props7.js';

const L = lines('s06_lustres');
const chant = seed => (lt, t) => ({ open: t > L[4][0] + .3 ? K.clamp((K.noise(t * 5, seed) - .25) * 1.6) * .8 : 0 });

/** seat an actor cross-legged on floor px (x, y), facing a world point; returns the snapped pose */
function sitAt(S3, a, key, px, py, face) {
  const p = put(S3, a, px, py, face);
  memoPose(key, a, [px, py], () => PO.crossLegged(a, { seat: 0, lean: .12 }));
  return PO.snap(a);
}
/** small working hands over the lap (cutting cloth): both hands meet in front of the belly */
function work(a, t, seed) {
  const k = a.group.scale.y / 1.6, w = Math.sin(t * 6 + seed);
  PO.reach(a, 'L', front(a, 'root', .26 * k, -.06 * k, .12 * k), { grip: .02 });
  PO.reach(a, 'R', front(a, 'root', (.27 + .02 * w) * k, .05 * k, (.14 + .015 * w) * k), { grip: .01 });
  PO.look(a, front(a, 'root', .3 * k, 0, 0), .6);
}

const lu = shot({
  plate: 'msid_lustres',
  async build(S3) {
    const cam = S3.cam.position.clone().setY(0);
    const [mo, k1, k2] = [await role('mohammed', { seat: true }), await role('kid1', { seat: true }), await role('kid2', { seat: true })];
    const mid = S3.floorAt(1050, 920);
    const P = {
      mo: sitAt(S3, mo, 's06-mo', 800, 950, cam.clone().lerp(mid, .5)),
      k1: sitAt(S3, k1, 's06-k1', 1070, 860, cam.clone().lerp(mid, .1)),
      k2: sitAt(S3, k2, 's06-k2', 1330, 960, cam.clone().lerp(mid, .5)),
    };
    for (const a of [mo, k1, k2]) (S3.qa?.supports || {})[a.name] = 0;
    return { actors: [mo, k1, k2], mo, k1, k2, P, cam, faces: [[mo, null, 3], [k1, null, 6], [k2, null, 7]] };
  },
  frame(lt, u, t, S, st) {
    const { mo, k1, k2, P } = st;
    for (const [a, key, s] of [[mo, 'mo', 3], [k1, 'k1', 6], [k2, 'k2', 7]]) { PO.apply(a, P[key]); breathe(a, t, 1, s); work(a, t, s); }
    PO.look(mo, at(k1, 'head'), .3 * sm(L[0][0] + 3, L[0][0] + 4, t));
  },
});

const rv = shot({
  plate: 'msid_lustres_rev',
  async build(S3) {
    const cam = S3.cam.position.clone().setY(0);
    // b016: the ladder under the right chandelier (painted ring at canvas 1290, 300; hung 2.2 m up)
    const under = hangAt(S3, 1290, 300, 2.2);
    const lad = S3.prop(echelle(1.3)); const ly = Math.PI / 2;   // stepped side faces screen right (+x): the climber is seen in profile
    const lp = under.clone().add(V(.32, 0, 0)); lad.position.copy(lp); lad.rotation.y = ly; lad.updateMatrixWorld(true);
    const g1 = await role('grand1'), g2 = await role('grand2'), ha = await role('hammoussa');
    const sx = (i) => { const s = lad.userData.steps[i]; return lp.clone().add(V(s.z + .1, 0, 0)); };
    S3.add(g1, sx(0).x + .35, sx(0).z, -Math.PI / 2);
    const g2p = lp.clone().add(V(-.75, 0, .15)); S3.add(g2, g2p.x, g2p.z, Math.PI / 2 - .3);
    const hp = lp.clone().add(V(.9, 0, .9)); S3.add(ha, hp.x, hp.z, Math.atan2(lp.x - hp.x, lp.z - hp.z));
    // b017: the fqih by the door, the pupils facing him
    const fq = await role('fqih', { seat: true }), mo = await role('mohammed', { seat: true });
    const kids = [await role('kid1', { seat: true }), await role('kid2', { seat: true }), await role('kid3', { seat: true })];
    const fp = S3.floorAt(960, 800);
    const P = {
      fq: (() => { put(S3, fq, 960, 800, cam); memoPose('s06-fq', fq, [1], () => PO.crossLegged(fq, { seat: 0, lean: .08, hands: false })); return PO.snap(fq); })(),
    };
    const spots = [[620, 950, mo], [820, 1020, kids[0]], [1110, 1020, kids[1]], [1310, 950, kids[2]]];
    spots.forEach(([x, y, a], i) => { P[a.name] = sitAt(S3, a, 's06-r' + i, x, y, fp); });
    for (const a of [fq, mo, ...kids]) (S3.qa?.supports || {})[a.name] = 0;
    (S3.qa?.supports || {}).grand1 = lad.userData.steps[2].y;
    return {
      actors: [g1, g2, ha, fq, mo, ...kids], g1, g2, ha, fq, mo, kids, lad, lp, under, sx, P, cam,
      faces: [[g1, null, 8], [g2, null, 9], [ha, null, 4], [fq, null, 10, chant(10)], [mo, null, 3, chant(3)], ...kids.map((a, i) => [a, null, 6 + i, chant(6 + i)])],
    };
  },
  frame(lt, u, t, S, st) {
    const { g1, g2, ha, fq, mo, kids, lad, lp, under, sx, P, cam } = st, b17 = t >= L[4][0] - .1;
    for (const a of [g1, g2, ha]) a.group.visible = !b17; lad.visible = !b17;
    for (const a of [fq, mo, ...kids]) a.group.visible = b17;
    if (!b17) {
      // the climb (3 steps in 1.5 s), then both arms up at the ring while the ladder wobbles
      const c = K.clamp((t - L[3][0] - .2) / 1.5) * 3, i = Math.min(2, Math.floor(c)), f = sm(0, 1, c - Math.floor(c));
      const st0 = lad.userData.steps, y0 = c < 1 ? 0 : st0[Math.min(2, i - 1)]?.y ?? 0, y1 = st0[i].y;
      const wob = .035 * Math.sin(t * 7) * sm(L[3][0] + 1.2, L[3][0] + 2, t);
      lad.rotation.set(0, Math.PI / 2, wob); lad.updateMatrixWorld(true);
      idle(g1, t, 8);
      const p = sx(i).lerp(sx(Math.max(0, i - 1)), c >= 3 ? 0 : 1 - f);
      g1.group.position.set(p.x + .35 * (1 - Math.min(1, c)) + wob * 1.2, c >= 3 ? y1 : K.lerp(y0, y1, f), p.z); g1.group.updateMatrixWorld(true);
      const up = sm(L[3][0] + 1.6, L[3][0] + 2.4, t), k = g1.group.scale.y / 1.6;
      const ring = under.clone().add(V(.22, 2.2, 0));
      PO.reach(g1, 'L', front(g1, 'chest', .2 * k, -.15 * k, -.1 * k).lerp(ring.clone().add(V(0, 0, .12)), up), { grip: .02 });
      PO.reach(g1, 'R', front(g1, 'chest', .2 * k, .15 * k, -.1 * k).lerp(ring.clone().add(V(0, 0, -.12)), up), { grip: .02 });
      PO.look(g1, ring, .8 * up);
      // grand2 steadies the ladder (both hands on the back rails), looking up
      idle(g2, t, 9);
      PO.reach(g2, 'L', lad.localToWorld(V(-.2, .85, -.28)), { grip: .02 }); PO.reach(g2, 'R', lad.localToWorld(V(.2, .85, -.28)), { grip: .02 });
      PO.look(g2, at(g1, 'head'), .8);
      // Hammoussa: watches, then (after the insert) sucks his thumb
      idle(ha, t, 4, at(g1, 'head'), .7);
      const th = sm(L[3][0] + .62 * (L[3][1] - L[3][0]), L[3][0] + .7 * (L[3][1] - L[3][0]), t);
      if (th > 0) PO.reach(ha, 'R', front(ha, 'root', .15, .15, .25).lerp(mouthW(ha), th), { grip: .0 });
    } else {
      // the fqih prays, hands open palms up before his chest; the pupils chant, rocking
      PO.apply(fq, P.fq); breathe(fq, t, 1, 10);
      const k = fq.group.scale.y / 1.6;
      PO.reach(fq, 'L', front(fq, 'chest', .3 * k, -.14 * k, -.12 * k), { grip: .04 }); PO.reach(fq, 'R', front(fq, 'chest', .3 * k, .14 * k, -.12 * k), { grip: .04 });
      PO.look(fq, V(cam.x, 1.6, cam.z), .3);
      for (const [a, s] of [[mo, 3], ...kids.map((x, i) => [x, 6 + i])]) {
        PO.apply(a, P[a.name]); breathe(a, t, 1, s);
        a.B.spine.rotation.x += .1 * Math.sin(t * 3.2 + s); a.B.spine.updateWorldMatrix(false, true);   // rocking with the chant
        PO.look(a, at(fq, 'head'), .5);
      }
    }
  },
});

export { lu, rv };
export default beatScene('s06_lustres', {
  shots: { lu, rv },
  plan: {
    b013: { shot: 'lu', size: 'M', on: 'mohammed', insAt: .45 },
    b014: { shot: 'p01a_meche', segs: [[.34, 'p01b_verre'], [.67, 'p01c_poudre']] },
    b015: { shot: 'p02_babouches' },
    b016: { shot: 'rv', size: 'W', insAt: .55, cover: [{ f: .75, size: 'M', on: 'hammoussa' }] },
    b017: { shot: 'rv', size: 'W', cover: [{ f: .5, size: 'M', on: 'fqih' }] },
  },
});
