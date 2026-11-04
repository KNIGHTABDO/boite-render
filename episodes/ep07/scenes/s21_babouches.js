// s21 the babouches. Night alley (rue_nuit), 3 a.m.: father and son walk toward us hand in hand; twice an oversized
// yellow babouche flies off Mohammed's right foot, lands ahead and he steps back into it (b078, a stumble each time).
// b079 they have stopped: both turn to a dark doorway on the left (a beggar's call and a cane, never shown); the boy
// presses to his father. b080 the father turns to him, slips the five-franc coin into his right hand (insert) and lays
// the big candle in his arms; the boy hugs it to his chest.
import * as THREE from 'three';
import * as K from '../../../engine/core.js';
import * as PO from '../../../engine/poses.js';
import * as PR from '../../../engine/props3d.js';
import { shot, role } from './_3d.js';
import { beatScene, lines, idle, at, front, dirW, orient, sm, V, yawTo } from '../lib/beatscene.js';
import { pair, hold } from '../lib/acts.js';

const L = lines('s21_babouches');
const W0 = .2, W1 = L[1][0] + .2;   // the walk
const KICKS = [L[0][0] + .5, L[0][0] + 2.2];
const D2 = L[2][1] - L[2][0], COIN = [L[2][0] + .12 * D2, L[2][0] + .3 * D2], CAND = [L[2][0] + .58 * D2, L[2][0] + .72 * D2];

/** the big festive candle: cream wax, a gold band, the wick; origin at the grip (0.2 m up) */
export function cierge() {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(.028, .032, .5, 14).translate(0, .05, 0), PR.toon(0xf2e6c8)));
  const band = new THREE.Mesh(new THREE.TorusGeometry(.031, .006, 6, 18), PR.toon(0xd8a840)); band.rotation.x = Math.PI / 2; band.position.y = .16; g.add(band);
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(.003, .003, .03, 5).translate(0, .315, 0), PR.toon(0x2a2018)));
  return g;
}
const coin = () => { const m = new THREE.Mesh(new THREE.CylinderGeometry(.013, .013, .003, 16), PR.toon(0xd0d4d8)); const g = new THREE.Group(); g.add(m); return g; };

const ru = shot({
  plate: 'rue_nuit',
  light: { keyI: .5, shade: 0x040814 },
  async build(S3) {
    const fa = await role('father'), mo = await role('mohammed', { costume: 'fete' });
    const p0 = S3.floorAt(1120, 700), p1 = S3.floorAt(1010, 930);
    const d = p1.clone().sub(p0).setY(0).normalize(), left = V(d.z, 0, -d.x);
    const off = (p, s) => p.clone().addScaledVector(left, s * .3);
    const cam = S3.cam.position.clone().setY(0);
    S3.add(fa, off(p1, -1).x, off(p1, -1).z, yawTo(p1, cam)); S3.add(mo, off(p1, 1).x, off(p1, 1).z, yawTo(p1, cam));   // built at the stop: the M crops frame them there
    const door = S3.floorAt(120, 1060).lerp(cam, .3).add(V(0, 1.4, 0));   // front-left, toward us: the doorway behind them gave two backs (dl10 b079)   // half toward us: the dark doorway is deep left, a full turn showed only their backs
    const bb = S3.prop(PR.babouche({ col: 0xe8b830 })); bb.scale.setScalar(1.25);
    const cd = S3.prop(cierge()), cn = S3.prop(coin());
    cd.userData.qa = { grip: true, hand: 'L', owner: 'father' }; cn.userData.qa = { grip: true, hand: 'R', owner: 'father' };
    return { actors: [fa, mo], fa, mo, p0, p1, d, off, door, cam, bb, cd, cn, faces: [[fa, null, 2], [mo, null, 3]] };
  },
  frame(lt, u, t, S, st) {
    const { fa, mo, p0, p1, d, off, door, cam, bb, cd, cn } = st;
    idle(fa, t, 2); idle(mo, t, 3);
    const k = fa.group.scale.y / 1.6, km = mo.group.scale.y / 1.1;
    const w = pair(fa, mo, p0, p1, W0, W1, t);
    // ---- the babouche gag: off the right foot, a 0.45 m arc ahead, it lies there until he steps back into it
    bb.visible = false;
    const along = mo.group.position.clone().sub(off(p0, 1)).dot(d);
    for (const kt of KICKS) {
      if (t < kt) continue;
      const uk = K.ease(K.clamp((kt - W0) / (W1 - W0))), s0 = off(p0, 1).lerp(off(p1, 1), uk).addScaledVector(dirW(mo, -1, 0, 0), .06);
      const land = s0.clone().addScaledVector(d, .45), sland = land.clone().sub(off(p0, 1)).dot(d);
      if (along > sland - .04) continue;   // back on his foot
      const f = K.clamp((t - kt) / .35), q = s0.clone().lerp(land, f); q.y = .2 * f * (1 - f) * 4 * .6;
      bb.position.copy(q); bb.rotation.set(-.6 * Math.sin(Math.PI * f) - (f >= 1 ? .1 : 0), Math.atan2(d.x, d.z) + 2.5 * f, f >= 1 ? .5 : 0); bb.updateMatrixWorld(true);
      bb.visible = true;
      // the kick and the stumble
      const e = Math.max(0, 1 - Math.abs(t - kt - .15) / .4);
      mo.B.thighR.rotation.x -= .5 * e; mo.B.spine.rotation.x += .22 * e; mo.B.spine.rotation.z += .1 * e; mo.B.spine.updateWorldMatrix(false, true);
    }
    // ---- b079/b080: stopped; both turn to the dark doorway, then the father turns to his son
    const turn = sm(L[1][0] - .3, L[1][0] + .6, t), face = sm(L[2][0] - .2, L[2][0] + .7, t);
    if (w >= 1) {
      const yd = yawTo(fa.group.position, door) * turn + Math.atan2(d.x, d.z) * (1 - turn);
      const ym = yawTo(fa.group.position, mo.group.position), yc = yawTo(mo.group.position, cam.clone().lerp(fa.group.position, .5));
      fa.group.rotation.y = yd + Math.atan2(Math.sin(ym - yd), Math.cos(ym - yd)) * face; fa.group.updateMatrixWorld(true);
      const yb = yawTo(mo.group.position, door) * turn + Math.atan2(d.x, d.z) * (1 - turn);
      mo.group.rotation.y = yb + Math.atan2(Math.sin(yc - yb), Math.cos(yc - yb)) * face;
      mo.group.position.addScaledVector(mo.group.position.clone().sub(fa.group.position).setY(0).normalize(), -.12 * turn * (1 - face)); mo.group.updateMatrixWorld(true);   // presses to his father
    }
    if (t < L[2][0]) hold(fa, mo, t);
    PO.look(fa, t < L[1][0] - .3 ? at(mo, 'head') : face > .5 ? at(mo, 'head') : door, .6);
    PO.look(mo, t < L[1][0] - .3 ? p1.clone().setY(1) : face > .5 ? at(fa, 'head') : door, .7);
    // ---- the candle: at the father's left side the whole walk, then into the boy's arms
    const side = front(fa, 'root', .1 * k, -.22 * k, -.02 * k);
    const give = sm(CAND[0], CAND[1], t);
    const chest = front(mo, 'chest', .14 * km, 0, -.1 * km);
    if (give < 1) PO.reach(fa, 'L', side.clone().lerp(chest.clone().add(V(0, -.05, 0)), sm(CAND[0] - .6, CAND[0], t)), { grip: .02 });
    const cp = give > 0 ? PO.handPts(fa, 'L').palm.lerp(chest, give) : PO.handPts(fa, 'L').palm;
    orient(cd, give >= 1 ? chest : cp, V(0, 1, 0).lerp(dirW(mo, 0, .2, -.06), .3 * give).normalize(), dirW(fa, 0, 0, 1));
    if (give > 0) { PO.reach(mo, 'L', chest.clone().addScaledVector(dirW(mo, 1, 0, 0), .04).add(V(0, .03, 0)), { grip: .02 }); }
    // ---- the coin: father's right hand into the boy's right hand, which then closes against the candle
    const cg = sm(COIN[0], COIN[1], t) * (1 - sm(CAND[0] - .4, CAND[0], t));
    const meet = front(mo, 'chest', .25 * km, .08 * km, -.22 * km);
    if (cg > 0) { PO.reach(mo, 'R', meet, { grip: .03 }); PO.reach(fa, 'R', meet.clone().add(V(0, .04, 0)), { grip: .03 }); }
    if (give > 0) PO.reach(mo, 'R', chest.clone().addScaledVector(dirW(mo, -1, 0, 0), .04).add(V(0, -.04, 0)), { grip: .02 });
    cn.visible = t > COIN[0] - .5 && t < CAND[0];
    if (cn.visible) orient(cn, PO.handPts(t < COIN[1] - .3 ? fa : mo, 'R').palm, V(0, 1, 0), V(0, 0, 1));
  },
});

export { ru };
export default beatScene('s21_babouches', {
  shots: { ru },
  plan: {
    b078: { shot: 'ru', size: 'W', cover: [{ f: .7, size: 'M', on: 'mohammed' }] },
    b079: { shot: 'ru', size: 'M', on: 'mohammed' },
    b080: { shot: 'ru', size: 'M', on: 'father', insAt: .4 },
  },
});
