// s26 the end of the feast. Bedroom at night, the lamp lit (chambre_nuit): nobody has any spirit left. The father
// cross-legged on the back banquette (as in s10), Zoubida kneeling by the lamp table, Mohammed back in his old djellaba,
// cross-legged on the rug; the drum and the tin trumpet lie on a mattress beside him (b104). b105 CU: his hand on his
// chest, on the new shirt he kept, gone soft with his warmth. b106 CU: the little carved box in his lap, the lid lifts
// (insert: the open box); far drums; his eyes close and the lamp goes down to BLACK by the end of the line.
import * as THREE from 'three';
import * as K from '../../../engine/core.js';
import * as PO from '../../../engine/poses.js';
import * as PR from '../../../engine/props3d.js';
import { shot, role, memoPose, breathe } from './_3d.js';
import { beatScene, lines, put, at, front, dirW, orient, heightAt, sm, V, yawTo } from '../lib/beatscene.js';
import { bendir, trompette } from '../lib/props7.js';
import { c } from '../../../engine/core.js';

const L = lines('s26_fin');
const D2 = L[2][1] - L[2][0];
const OPEN = [L[2][0] + .12 * D2, L[2][0] + .32 * D2];   // the lid lifts before the insert (.35)
const SLEEP = [L[2][0] + .6 * D2, L[2][0] + .9 * D2];    // "n'avaient plus la force": the eyes close
const OUT = [L[2][0] + .55 * D2, L[2][1] - .15];         // the wick goes down: full black just before the cut
const LAMP = [696, 585];

/** the box of wonders: carved walnut, a brass band; origin at the bottom centre, hinge on the far (+z) edge */
function boite() {
  const W = .2, H = .085, D = .14, g = new THREE.Group(), wood = PR.toon(0x7a4a28), dark = PR.toon(0x3a2010), brass = PR.toon(0xd9a441);
  const base = new THREE.Mesh(new THREE.BoxGeometry(W, H, D).translate(0, H / 2, 0), wood);
  const inside = new THREE.Mesh(new THREE.BoxGeometry(W - .016, .004, D - .016).translate(0, H - .012, 0), dark);
  const band = new THREE.Mesh(new THREE.BoxGeometry(W + .004, .012, D + .004).translate(0, H * .55, 0), brass);
  const lid = new THREE.Group(); lid.position.set(0, H, D / 2);
  lid.add(new THREE.Mesh(new THREE.BoxGeometry(W + .006, .016, D + .006).translate(0, .008, -D / 2), wood));
  const star = new THREE.Mesh(new THREE.CylinderGeometry(.022, .022, .003, 8).translate(0, .0175, -D / 2), brass); lid.add(star);
  g.add(base, inside, band, lid); g.userData = { lid, H, D, W };
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return g;
}

const ch = shot({
  plate: 'chambre_nuit',
  light: { keyI: .55 },
  async build(S3) {
    const cam = S3.cam.position.clone().setY(0);
    const fa = await role('father', { seat: true }), mo = await role('mohammed', { seat: true }), zo = await role('zoubida');
    // the father on the back banquette, 0.35 m in from its front edge (same spot as s10)
    const mh = heightAt(S3, 900, 700, 650), edge = S3.floorAt(900, 700);
    const fp = edge.clone().add(edge.clone().sub(cam).setY(0).normalize().multiplyScalar(.35));
    const mp = S3.floorAt(1150, 900);
    S3.add(fa, fp.x, fp.z, yawTo(fp, cam.clone().lerp(mp, .5)));
    memoPose('s26-fa', fa, [mh], () => PO.crossLegged(fa, { seat: mh, lean: .22 }));
    put(S3, mo, 1150, 900, cam.clone().lerp(fp, .3));
    memoPose('s26-mo', mo, [3], () => PO.crossLegged(mo, { seat: 0, lean: .2 }));
    // Zoubida kneeling by the lamp table, turned to her son
    const zp = S3.floorAt(520, 880);
    S3.add(zo, zp.x, zp.z, yawTo(zp, mp.clone().lerp(cam, .4)));
    memoPose('s26-zo', zo, [zp.x, zp.z], () => PO.kneel(zo, { lean: .25, hands: false }));
    const P = { fa: PO.snap(fa), mo: PO.snap(mo), zo: PO.snap(zo) };
    const sup = S3.qa?.supports || {}; sup.father = mh; sup.mohammed = 0;
    // the mattress at his right, the drum and the trumpet lying on it
    const mpos = S3.floorAt(1500, 1000), mat = S3.prop(PR.mattress({ w: 1.3, d: .62, h: .12, col: 0x7a2a2a }));
    mat.position.copy(mpos); mat.rotation.y = yawTo(mpos, cam); mat.updateMatrixWorld(true);
    const top = mat.userData?.top ?? .12, side = V(Math.cos(mat.rotation.y), 0, -Math.sin(mat.rotation.y));
    const dr = S3.prop(bendir()); orient(dr, mpos.clone().addScaledVector(side, -.25).setY(top + .036), side, V(0, 1, 0));
    const tr = S3.prop(trompette()); orient(tr, mpos.clone().addScaledVector(side, .2).setY(top + .03), side.clone().lerp(V(Math.sin(mat.rotation.y), 0, Math.cos(mat.rotation.y)), .4).normalize(), V(0, 1, 0));
    dr.userData.qa = { grip: false, owner: 'mohammed' }; tr.userData.qa = { grip: false, owner: 'mohammed' };
    const bx = S3.prop(boite()); bx.userData.qa = { grip: true, hand: 'LR', owner: 'mohammed' };
    const tired = (lt, t) => ({ sad: .55, lid: .3 + .7 * sm(SLEEP[0], SLEEP[1], t) });
    return {
      actors: [mo, fa, zo], fa, mo, zo, P, bx, cam,
      faces: [[mo, null, 3, tired], [fa, 'father', 2, { sad: .4, lid: .35 }], [zo, null, 1, { sad: .45, lid: .25 }]],
    };
  },
  frame(lt, u, t, S, st) {
    const { fa, mo, zo, P, bx } = st;
    PO.apply(fa, P.fa); breathe(fa, t, .7, 2); PO.apply(mo, P.mo); breathe(mo, t, .8, 3); PO.apply(zo, P.zo); breathe(zo, t, .7, 1);
    const km = mo.group.scale.y / 1.1, kz = zo.group.scale.y / 1.6;
    // low spirits: the father's head hangs toward the floor before him; Zoubida's hands rest in her lap, eyes on the boy
    PO.look(fa, front(fa, 'root', 1.2, 0, -.6), .5);
    for (const [s, r] of [['L', -1], ['R', 1]]) PO.reach(zo, s, front(zo, 'root', .2 * kz, .06 * r * kz, .02 * kz), { grip: .04 });
    PO.look(zo, at(mo, 'head'), .5);
    // Mohammed: b104 slumped, eyes on the mattress; b105 the right hand on his chest, thumb rubbing the soft shirt
    const b5 = sm(L[1][0] - .2, L[1][0] + .6, t) * (1 - sm(L[2][0] - .5, L[2][0], t));
    if (b5 > 0) PO.reach(mo, 'R', front(mo, 'chest', .11 * km, .03 * km + .012 * Math.sin(t * 2.4), -.02 * km).lerp(front(mo, 'root', .22 * km, .1 * km, .05 * km), 1 - b5), { grip: .04 });
    // b106: the box in his lap, both hands on its sides; the right hand lifts the lid
    const box = t >= L[2][0] - .4;
    bx.visible = box;
    if (box) {
      const lap = front(mo, 'root', .2 * km, 0, .07 * km), o = K.ease(sm(OPEN[0], OPEN[1], t));
      orient(bx, lap, V(0, 1, 0), dirW(mo, 0, 0, 1));
      const { lid, H, D, W } = bx.userData;
      lid.rotation.x = 1.75 * o; bx.updateMatrixWorld(true);
      const edge = lid.localToWorld(V(0, .016, -D));
      const sideL = lap.clone().addScaledVector(dirW(mo, 1, 0, 0), W / 2 + .01).add(V(0, H * .6, 0));
      PO.reach(mo, 'L', sideL, { grip: .02 });
      const lift = sm(OPEN[0] - .5, OPEN[0], t) * (1 - sm(OPEN[1] + .2, OPEN[1] + .8, t));
      const rest = lap.clone().addScaledVector(dirW(mo, -1, 0, 0), W / 2 + .01).add(V(0, H * .6, 0));
      PO.reach(mo, 'R', rest.lerp(edge, lift), { grip: .02 });
    }
    // head: down at the mattress, then into the box, then it nods as sleep takes him
    const sl = sm(SLEEP[0], SLEEP[1], t);
    mo.B.spine.rotation.x += .06 + .1 * sl; mo.B.spine.updateWorldMatrix(false, true);
    PO.look(mo, box ? bx.position.clone().add(V(0, .05, 0)) : front(mo, 'root', .9, -.5, -.5), .6 + .2 * sl);
  },
  over(lt, u, t) {
    // the lamp's warm bloom, which shrinks with the wick in b106 and leaves the room black
    const out = K.ease(sm(OUT[0], OUT[1], t)), R = [-1920, -1080, 5760, 3240];
    c.save();
    if (out < 1) {
      const fl = .9 + .1 * K.noise(t * 7, 3);
      const g = c.createRadialGradient(LAMP[0], LAMP[1], 0, LAMP[0], LAMP[1], 900 * (1 - .7 * out));
      g.addColorStop(0, `rgba(255,190,110,${.3 * fl * (1 - out)})`); g.addColorStop(1, 'rgba(255,190,110,0)');
      c.globalCompositeOperation = 'screen'; c.fillStyle = g; c.fillRect(...R);
    }
    if (out > 0) {
      // darkness closes in from the edges toward the lamp, then over it
      const g = c.createRadialGradient(LAMP[0], LAMP[1], 0, LAMP[0], LAMP[1], 2400);
      g.addColorStop(0, `rgba(6,4,8,${Math.min(1, out * 1.1)})`); g.addColorStop(Math.max(.01, .35 * (1 - out)), `rgba(6,4,8,${Math.min(1, out * 1.6)})`); g.addColorStop(1, `rgba(6,4,8,${Math.min(1, out * 2)})`);
      c.globalCompositeOperation = 'source-over'; c.fillStyle = g; c.fillRect(...R);
    }
    c.restore();
  },
});

export { ch };
export default beatScene('s26_fin', {
  shots: { ch },
  plan: {
    b104: { shot: 'ch', size: 'W', cover: [{ f: .55, size: 'M', on: 'mohammed' }] },
    b105: { shot: 'ch', size: 'CU', on: 'mohammed' },
    b106: { shot: 'ch', size: 'CU', on: 'mohammed', insAt: .35 },
  },
});
