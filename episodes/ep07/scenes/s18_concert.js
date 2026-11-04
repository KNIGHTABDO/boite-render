// s18 the concert. b065 the patio (patio_matin): Zineb beats her little four-sou drum without any rhythm. b066 the room
// (chambre_jour): Mohammed the one-man band, cross-legged on the floor, the drum standing on its rim in front of him, two
// sticks flying, the toy trumpet wedged at his mouth and resting between his knees; Zineb joins in. b067 the patio: Zoubida
// and Rahma, hands over their ears, laughing, look up at the din. b068 the room: the shirt fitting, the new shirt stiff
// with starch, down to the floor, the sleeves swallowing his hands (insert: the sleeves); his mother kneels at his side.
// b069 painting: the terrace concert at sunset.
import * as THREE from 'three';
import * as K from '../../../engine/core.js';
import * as IK from '../../../engine/ik.js';
import * as PO from '../../../engine/poses.js';
import { shot, role, memoPose, breathe } from './_3d.js';
import { beatScene, lines, idle, at, front, dirW, orient, sm, V, yawTo } from '../lib/beatscene.js';
import { strike, earCover, mouthW } from '../lib/acts.js';
import { tambourin, bendir, trompette, chemise, wearShirt } from '../lib/props7.js';
import * as PR from '../../../engine/props3d.js';

const L = lines('s18_concert');
const ZJ = L[1][0] + 2.5;   // Zineb joins in, in the room
const laugh = (t, s) => ({ open: .25 + .35 * Math.max(0, K.noise(t * 7, s)) });
const stick = () => { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.CylinderGeometry(.006, .006, .26, 6).translate(0, .13, 0), PR.toon(0x9a6a3a))); return g; };

const pa = shot({
  plate: 'patio_matin',
  async build(S3) {
    const zi = await role('zineb'), zo = await role('zoubida'), ra = await role('rahma');
    const cam = S3.cam.position.clone().setY(0), up = V(S3.cam.position.x, 4.5, S3.cam.position.z);   // the din comes from the room upstairs, over our heads
    const pz = S3.floorAt(760, 990), po = S3.floorAt(1000, 1035), pr = S3.floorAt(1210, 1030);
    S3.add(zi, pz.x, pz.z, yawTo(pz, cam) + .4); S3.add(zo, po.x, po.z, yawTo(po, cam) - .2); S3.add(ra, pr.x, pr.z, yawTo(pr, cam) - .5);
    const tb = S3.prop(tambourin()); tb.userData.qa = { grip: true, hand: 'L', owner: 'zineb' };
    return { actors: [zi, zo, ra], zi, zo, ra, tb, up, cam, faces: [[zi, null, 4, (lt, t) => laugh(t, 4)], [zo, 'femmes', 6, (lt, t) => t > L[2][0] - .3 ? laugh(t, 6) : {}], [ra, 'femmes', 8, (lt, t) => t > L[2][0] - .3 ? laugh(t, 8) : {}]] };
  },
  frame(lt, u, t, S, st) {
    const { zi, zo, ra, tb, up, cam } = st;
    idle(zi, t, 4); idle(zo, t, 6); idle(ra, t, 8);
    const z = t < L[1][1];   // Zineb is up in the room by b067
    zi.group.visible = z; tb.visible = z;
    if (z) { strike(zi, tb, t, { bpm: 150, pat: [1, .3, .8, .2, .6, 1, .1], wild: .9 }); PO.look(zi, V(cam.x, .9, cam.z), .5); }
    const e = sm(L[2][0] - .4, L[2][0] + .3, t);   // the din from upstairs: hands over the ears
    for (const [a, s] of [[zo, 6], [ra, 8]]) {
      if (e > 0) { earCover(a, 'L', e); earCover(a, 'R', e); }
      PO.look(a, e > 0 ? up : at(zi, 'head'), e > 0 ? .25 : .6);
      if (e > 0) { a.B.spine.rotation.x -= .06 * Math.sin(t * 6 + s) * e; a.B.spine.updateWorldMatrix(false, true); }   // shaking with laughter
    }
  },
});

const ch = shot({
  plate: 'chambre_jour',
  async build(S3) {
    const mo = await role('mohammed', { seat: true }), ms = await role('mohammed', { copy: '_s' });
    const zi = await role('zineb'), zo = await role('zoubida', { seat: true });
    const cam = S3.cam.position.clone().setY(0), p = S3.floorAt(1060, 1000);
    S3.add(mo, p.x, p.z, yawTo(p, cam));
    memoPose('s18-mo', mo, [p.x, p.z], () => PO.crossLegged(mo, { seat: 0, lean: .2, hands: false }));
    const R = { mo: PO.snap(mo) };
    S3.add(ms, p.x, p.z, yawTo(p, cam) - .25); ms.name = 'mohammed';
    // the drum standing on its rim 0.32 m in front of him, skin toward him
    const dr = S3.prop(bendir()), n = dirW(mo, 0, 0, -1), dc = p.clone().addScaledVector(dirW(mo, 0, 0, 1), .32).setY(.19);
    orient(dr, dc, V(0, 1, 0), n);
    const tr = S3.prop(trompette()), sk = [S3.prop(stick()), S3.prop(stick())];
    tr.userData.qa = { grip: false, owner: 'mohammed' };
    sk.forEach((s, i) => { s.userData.qa = { grip: true, hand: 'LR'[i], owner: 'mohammed' }; });
    // Zineb standing to his left with her drum
    const pz = S3.floorAt(1390, 985); S3.add(zi, pz.x, pz.z, yawTo(pz, cam) - .6);
    const tb = S3.prop(tambourin()); tb.userData.qa = { grip: true, hand: 'L', owner: 'zineb' };
    // the fitting: the mother kneels at the standing boy's left, facing him
    const pk = p.clone().addScaledVector(dirW(ms, 1, 0, 0), .52).addScaledVector(dirW(ms, 0, 0, 1), -.3);   // beside and a little behind him: her face, not her back
    S3.add(zo, pk.x, pk.z, yawTo(pk, p));
    memoPose('s18-zo', zo, [pk.x, pk.z], () => PO.kneel(zo, { lean: .2, hands: false }));
    R.zo = PO.snap(zo);
    const shirt = S3.prop(chemise());
    return { actors: [mo, ms, zi, zo], mo, ms, zi, zo, R, dr, dc, n, tr, sk, tb, shirt, cam, faces: [[mo, null, 1, { open: .35 }], [ms, null, 1], [zi, null, 4, (lt, t) => laugh(t, 4)], [zo, null, 6, { open: .15 }]] };
  },
  frame(lt, u, t, S, st) {
    const { mo, ms, zi, zo, R, dr, dc, n, tr, sk, tb, shirt, cam } = st;
    const fit = t >= L[3][0] - .1;
    mo.group.visible = !fit; ms.group.visible = fit; zo.group.visible = fit; shirt.visible = fit;
    sk.forEach(s => { s.visible = !fit; });
    idle(zi, t, 4);
    if (!fit) {
      // the one-man band: sticks alternate on the skin, ~4 hits/s, the trumpet at his mouth resting between the knees
      PO.apply(mo, R.mo); breathe(mo, t, 1.4, 1);
      const k = mo.group.scale.y / 1.6;
      ['L', 'R'].forEach((s, i) => {
        const ph = (t * 4 + i * .5) % 1, lift = Math.pow(Math.sin(Math.PI * ph), .7);
        const hit = dc.clone().addScaledVector(n, .19 + .03 * lift).addScaledVector(dirW(mo, i ? -1 : 1, 0, 0), .08).add(V(0, .1 + .12 * lift, 0));   // stick tip on the skin at the stroke
        PO.reach(mo, s, hit, { grip: .015 });
        const palm = PO.handPts(mo, s).palm;
        const tip = dc.clone().addScaledVector(n, .036).add(V(0, .03 * (i - .5), 0)).sub(palm);
        orient(sk[i], palm, tip.clone().normalize(), V(0, 1, 0)); sk[i].scale.set(1, K.clamp((tip.length() + .01) / .26, .85, 1.15), 1); sk[i].updateMatrixWorld(true);
      });
      mo.B.head.rotation.x += .1 + .03 * Math.sin(t * 8); mo.B.head.updateWorldMatrix(false, true);
      orient(tr, mouthW(mo), dirW(mo, 0, -.85, 1).normalize(), dirW(mo, 0, 0, 1));
      // Zineb joins: strikes along, out of time
      if (t > ZJ) strike(zi, tb, t, { bpm: 170, pat: [1, .2, .9, .4], wild: .7 });
      else { PO.reach(zi, 'L', front(zi, 'root', .1, -.18, .05), { grip: .02 }); orient(tb, PO.handPts(zi, 'L').palm, V(0, 1, 0), dirW(zi, 0, 0, 1)); }
      PO.look(zi, at(mo, 'head'), .6);
    } else {
      // the fitting: arms held out, sleeves past the hands; the drum and trumpet left on the floor
      idle(ms, t, 1); PO.apply(zo, R.zo); breathe(zo, t, 1, 6);
      const k = ms.group.scale.y / 1.6, out = sm(L[3][0], L[3][0] + .8, t);
      PO.reach(ms, 'L', front(ms, 'root', .1 * k, -.2 * k, -.1 * k).lerp(front(ms, 'chest', .12 * k, -.32 * k, -.12 * k), out), { grip: .03 });
      PO.reach(ms, 'R', front(ms, 'root', .1 * k, .2 * k, -.1 * k).lerp(front(ms, 'chest', .12 * k, .32 * k, -.12 * k), out), { grip: .03 });
      wearShirt(shirt, ms, { IK, handPts: PO.handPts });
      orient(tr, dc.clone().addScaledVector(dirW(ms, -1, 0, 0), .35).setY(.02), dirW(ms, 1, 0, .4).normalize(), V(0, 1, 0));
      // she tugs the hem straight, then the shoulders
      const hk = (Math.sin(t * 2.2) + 1) / 2, sp = at(ms, 'neck'), hem = at(ms, 'root').setY(.35);
      PO.reach(zo, 'R', hem.clone().lerp(sp.clone().add(V(0, -.08, 0)), hk * sm(L[3][0] + 2, L[3][0] + 3, t)).addScaledVector(dirW(zo, 0, 0, -1), .05), { grip: .03 });
      PO.reach(zo, 'L', hem.clone().add(V(0, -.1, 0)).addScaledVector(dirW(zo, 0, 0, -1), .06), { grip: .03 });
      PO.look(zo, at(ms, 'head'), .6); PO.look(ms, at(ms, 'head').addScaledVector(dirW(ms, 0, 0, 1), 1).add(V(0, -.6, 0)), .6);   // down at the shirt
      PO.reach(zi, 'L', front(zi, 'root', .1, -.18, .05), { grip: .02 }); orient(tb, PO.handPts(zi, 'L').palm, V(0, 1, 0), dirW(zi, 0, 0, 1));
      PO.look(zi, at(ms, 'head'), .6);
    }
  },
});

export { pa, ch };
export default beatScene('s18_concert', {
  shots: { pa, ch },
  plan: {
    b065: { shot: 'pa', size: 'W' },
    b066: { shot: 'ch', size: 'M', on: 'mohammed', cover: [{ f: .55, size: 'W' }] },
    b067: { shot: 'pa', size: 'M', on: 'zoubida' },
    b068: { shot: 'ch', size: 'M', on: 'zoubida', insAt: .5 },   // her kneeling head ~ his standing head (the seated copy's head would crop both)
    b069: { shot: 'p07_concert' },
  },
});
