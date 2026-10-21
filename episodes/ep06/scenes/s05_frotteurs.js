// s05: next day, wet Msid floor (plate msid_menage). L0 the fqih hands Mohammed a broom, chief of the scrubbers; L1 painting p03_fontaine
// (water carriers); L2-3 Mohammed scrubs barefoot, straightens up hand on his back; L4-L9 quarrels (kid1 eye, kid2 soaked), Driss trips
// into a bucket (fallClip), laughing, "Frottez, paresseux !"; L10 everybody wipes.
// Contacts (st.M): brooms gripped in palms and tips on the floor, hand on the back, fqih holds the broom out to Mohammed's palm.
import * as K from '../../../engine/core.js';
import * as PO from '../../../engine/poses.js';
import * as IK from '../../../engine/ik.js';
import * as PR from '../../../engine/props3d.js';
import * as THREE from 'three';
import { rest, idlePose } from '../../../engine/rig3d.js';
import { fallClip } from '../../../engine/clips.js';
import { make, ac, st } from './_pt.js';
import { shot, all, breathe, V, role } from './_3d.js';
import { balayette, inHand } from './_props.js';
const { clamp, ease } = K;
const sm = (a, b, x) => ease(clamp((x - a) / (b - a)));
const yawTo = (from, to) => Math.atan2(to.x - from.x, to.z - from.z);
const dirW = (a, x, y, z) => V(x, y, z).normalize().applyAxisAngle(V(0, 1, 0), a.group.rotation.y);

const SC = (await (await fetch(new URL('../timing.json', import.meta.url))).json()).find(s => s.id === 's05_frotteurs');
const L = SC.lines.map(l => [l.start - SC.start, l.start - SC.start + l.dur]);
const LIGHT = { key: 0xffe8c8, keyI: 1.7, dir: [2.5, 3, .8], sky: 0xd8d4c8, ground: 0x8a6a48, fillI: 1.5, rim: 0xffe0a0, rimI: .6, rimDir: [-2, 2, -3], shadow: .3 };
const T_HIT = L[6][0] + .6;

/** bent-over scrubbing: broom tip on the floor sweeping in front, left hand on the knee. bend 0 = upright */
function scrub(a, br, t, bend = .8, ph = 0, M, key) {
  const B = a.B; B.spine.rotation.x += bend; B.chest.rotation.x += bend * .25; B.head.rotation.x -= bend * .75; a.group.updateMatrixWorld(true);
  const k = a.group.scale.y / 1.6, c = IK.wpos(B.chest), f = dirW(a, 0, 0, 1), l = dirW(a, 1, 0, 0), s = Math.sin(t * 4.2 + ph);
  const tgt = c.clone().addScaledVector(f, (.22 + .1 * s) * k).addScaledVector(l, -.1 * k).add(V(0, -.5 * k, 0));
  M[key + 'R'] = +PO.reach(a, 'R', tgt, { grip: .02 }).toFixed(3);
  const dn = V(f.x * (.5 + .3 * s), -.8, f.z * (.5 + .3 * s)); inHand(br, PO.handPts(a, 'R').palm, dn);
  B.upperArmL.rotation.x += .25 * s; a.group.updateMatrixWorld(true);
}

const shot1 = shot({
  plate: 'msid_menage', light: LIGHT,
  async build(S3) {
    const M = {}, F = (x, y, h = 0) => S3.floorAt(x, y, h);
    const [mo, k1, k2, k3, dr, fq] = await Promise.all(['mohammed', 'kid1', 'kid2', 'kid3', 'driss', 'fqih'].map(n => role(n)));
    const cam0 = S3.cam.position.clone().setY(0);
    const fqAt = F(1046, 613, .35); S3.add(fq, fqAt.x, fqAt.z, yawTo(fqAt, cam0) * .8); fq.group.position.y = .35;
    const sp = { mo: F(640, 890), k1: F(960, 905), k2: F(1700, 895), k3: F(330, 870) }, moE = fqAt.clone().add(V(-.95, 0, .5));
    S3.add(mo, sp.mo.x, sp.mo.z, .55); S3.add(k1, sp.k1.x, sp.k1.z, -.5); S3.add(k2, sp.k2.x, sp.k2.z, .5); S3.add(k3, sp.k3.x, sp.k3.z, -.4);
    // Driss walks nowhere: stands where he trips, falling toward screen right so the bucket catches his head
    const bAt = F(1480, 905);
    S3.add(dr, 0, 0, Math.PI / 2 - .2);
    const fall = fallClip(dr); fall.at(1); dr.group.updateMatrixWorld(true);
    const hd = IK.wpos(dr.B.head); fall.at(0);
    const off = V(bAt.x - hd.x, 0, bAt.z - hd.z); dr.group.position.set(off.x, 0, off.z); dr.group.updateMatrixWorld(true);
    const dBase = dr.group.position.clone();
    const brooms = [mo, k1, k2, k3, dr].map(() => S3.prop(balayette({ wet: 0 }))), fb = S3.prop(balayette({ wet: 0 }));
    const bucket = S3.prop(PR.bucket({ water: .8 })), bucket2 = S3.prop(PR.bucket({ water: .8 }));
    const puddle = S3.prop(new THREE.Mesh(new THREE.CircleGeometry(.55, 24).rotateX(-Math.PI / 2), PR.toon(0x7a9aa8, { opacity: .55 })));
    puddle.visible = false;
    return { moE, actors: [fq, mo, k1, k2, k3, dr], M, mo, k1, k2, k3, dr, fq, fqAt, sp, brooms, fb, bucket, bucket2, bAt, dBase, fall, puddle,
      b2: F(520, 830), faces: [[fq, 'fqih', 1], [mo, 'mohammed', 5], [k1, 'kid1', 2], [k2, 'kid2', 3], [k3, 'kid3', 4], [dr, 'driss', 8]] };
  },
  cover: [
    { t: 0, size: 'M', on: 'fqih', dy: -90 }, { t: 5.5, size: 'M', on: 'mohammed', dy: -140 }, { t: 9, size: 'W' },
    { t: L[2][0], size: 'W' }, { t: L[2][0] + 3.5, size: 'M', on: 'mohammed', dy: -130 },
    { t: L[3][0], size: 'M', on: 'mohammed', dy: -40 }, { t: L[3][0] + 7, size: 'W' }, { t: L[3][0] + 11, size: 'M', on: 'kid1', dy: -40 },
    { t: L[4][0], size: 'M', on: 'kid1', dy: -60 }, { t: L[5][0], size: 'M', on: 'kid2', dy: -60 }, { t: L[6][0], size: 'W' },
    { t: L[7][0], size: 'M', on: 'kid2', dy: -60 }, { t: L[8][0], size: 'M', on: 'mohammed', dy: -70 }, { t: L[9][0], size: 'M', on: 'kid2', dy: -60 },
    { t: L[10][0], size: 'W' }],
  frame(lt, u, t, S, s, S3) {
    const { M, moE, mo, k1, k2, k3, dr, fq, fqAt, sp, brooms, fb, bucket, bucket2, bAt, dBase, fall, puddle } = s, A = [mo, k1, k2, k3];
    for (const a of [mo, k1, k2, k3, dr, fq]) { rest(a.B); idlePose(a.B, t + a.name.length, 1); }
    const early = t < L[1][0];
    mo.group.position.set(early ? moE.x : sp.mo.x, 0, early ? moE.z : sp.mo.z); mo.group.rotation.y = early ? 1.15 : .55; mo.group.updateMatrixWorld(true);
    // ---- fqih: the broom goes from his hand to Mohammed's
    const fh = IK.wpos(fq.B.head), take = sm(3.2, 4.2, t), mch = IK.wpos(mo.B.chest);
    const fch = IK.wpos(fq.B.chest), ff = dirW(fq, 0, 0, 1);
    const hold = fch.clone().addScaledVector(ff, .3).add(V(0, -.2, 0)).lerp(mch.clone().addScaledVector(dirW(mo, 0, 0, 1), .2).add(V(0, -.3, 0)), 0);
    PO.look(fq, IK.wpos(mo.B.head), .6); breathe(fq, t, 1, 1);
    // Mohammed in the first beat: faces the fqih, takes the broom, puffs his chest
    brooms.forEach(b => b.visible = false); fb.visible = false;
    mo.group.position.set(sp.mo.x, 0, sp.mo.z); mo.group.rotation.y = .55;
    if (early) { mo.group.position.set(moE.x, 0, moE.z); mo.group.rotation.y = 1.15; }
    dr.group.position.copy(dBase); k3.group.visible = true;
    puddle.visible = false;
    bucket.position.set(bAt.x, 0, bAt.z); bucket.rotation.set(0, 0, 0); bucket2.position.set(s.b2.x, 0, s.b2.z);
    if (early) {
      rest(mo.B); idlePose(mo.B, t, 1); mo.group.updateMatrixWorld(true);
      const give = sm(1.5, 2.6, t) * (1 - sm(3.6, 4.4, t));
      // fqih right hand stretches the broom (grip toward Mohammed's reach), Mohammed's right hand meets it
      const meet = mch.clone().addScaledVector(dirW(mo, 0, 0, 1), .3).add(V(0, -.2, 0)), toward = meet.clone().sub(fch).setY(0).normalize();
      const rt = fch.clone().addScaledVector(ff, .12).add(V(0, -.35, 0)).lerp(fch.clone().addScaledVector(toward, .5).add(V(0, -.1, 0)), give);
      M.fq = +PO.reach(fq, 'R', rt, { grip: .02 }).toFixed(3);
      if (take < .5) { fb.visible = true; inHand(fb, PO.handPts(fq, 'R').palm, V(0, 1, 0).addScaledVector(toward, .3 * give)); }
      M.moR = +PO.reach(mo, 'R', meet.clone().lerp(mch.clone().addScaledVector(dirW(mo, 0, 0, 1), .2).add(V(0, -.55, 0)), sm(4.2, 5.2, t)), { grip: .02 }).toFixed(3);
      brooms[0].visible = take >= .5; if (take >= .5) inHand(brooms[0], PO.handPts(mo, 'R').palm, V(0, 1, 0).addScaledVector(dirW(mo, 0, 0, 1), .3).add(V(0, -.2, 0)).multiplyScalar(1));
      const puff = sm(5, 5.8, t) * (1 - sm(9, 9.8, t)); mo.B.chest.rotation.x -= .14 * puff; mo.B.head.rotation.x -= .1 * puff; mo.group.updateMatrixWorld(true);
      PO.look(mo, fh, .55);
      A.slice(1).forEach(a => a.group.visible = false); dr.group.visible = false; bucket.visible = false; bucket2.visible = false;
      return;
    }
    A.forEach(a => a.group.visible = true); dr.group.visible = true; bucket.visible = bucket2.visible = true;
    for (const a of [k1, k2, k3]) { const p = sp[a === k1 ? 'k1' : a === k2 ? 'k2' : 'k3']; a.group.position.set(p.x, 0, p.z); }
    // ---- scrubbing (everyone), Mohammed straightens up red with a hand on his back at L2+6..8.5
    const cmd = t >= L[8][0] && t < L[9][0];
    const ph = { 0: 0, 1: 1.7, 2: 3.1, 3: 4.4 };
    // Mohammed
    const str = (t > L[2][0] + 5.5 && t < L[2][0] + 8.5) ? sm(L[2][0] + 5.5, L[2][0] + 6.5, t) * (1 - sm(L[2][0] + 7.8, L[2][0] + 8.5, t)) : 0;
    const quarrel = t >= L[8][0];
    if (cmd) {   // chief: upright, broom like a sceptre, shouting at the camera
      mo.group.rotation.y = .2; mo.group.updateMatrixWorld(true);
      const c = IK.wpos(mo.B.chest), f = dirW(mo, 0, 0, 1);
      M.moR = +PO.reach(mo, 'R', c.clone().addScaledVector(f, .3).add(V(0, .12 + .06 * Math.sin(t * 7), 0)), { grip: .02 }).toFixed(3);
      inHand(brooms[0], PO.handPts(mo, 'R').palm, V(0, 1, 0).addScaledVector(f, .25)); PO.look(mo, S3.cam.position, .6);
    } else if (t >= L[4][0] && t < L[8][0]) {   // lull: he keeps scrubbing, glancing at the commotion
      mo.group.rotation.y = .55; scrub(mo, brooms[0], t, .75, ph[0], M, 'mo');
    } else {
      mo.group.rotation.y = .55; scrub(mo, brooms[0], t, .7 * (1 - str), ph[0], M, 'mo');
      if (str > 0) {
        const c = IK.wpos(mo.B.root), f = dirW(mo, 0, 0, 1);
        M.moBack = +PO.reach(mo, 'L', c.clone().addScaledVector(f, -.12).addScaledVector(dirW(mo, 1, 0, 0), .08).add(V(0, .12, 0)), { grip: .02 }).toFixed(3);
        mo.B.chest.rotation.x -= .1 * str; mo.B.head.rotation.x -= .05 * str; mo.group.updateMatrixWorld(true);
      }
      if (t > L[3][0] + 3) PO.look(mo, S3.cam.position, .35);
    }
    brooms[0].visible = true;
    // kids: scrubbing; kid1 hit in the eye (L4), kid2 shouts soaked (L5), laughing/pointing at Driss (L6-7), kid2 retorts (L9)
    const sc = (a, i, b, k) => { a.group.rotation.y = i === 1 ? -.5 : i === 2 ? .5 : -.4; scrub(a, brooms[i], t, b, ph[i], M, k); };
    const k1Eye = t >= L[4][0] && t < L[4][1] + .5, k2Soak = t >= L[5][0] && t < L[5][1] + .4, laugh = t >= T_HIT - .8 && t < L[8][0] - .3, ret = t >= L[9][0] && t < L[9][1];
    // kid1
    if (k1Eye) {
      k1.group.rotation.y = -.35; rest(k1.B); idlePose(k1.B, t, 1); k1.B.spine.rotation.x += .15; k1.B.head.rotation.z += .15; k1.group.updateMatrixWorld(true);
      brooms[1].visible = true; inHand(brooms[1], PO.handPts(k1, 'L').palm, V(0, 1, 0).addScaledVector(dirW(k1, 0, 0, 1), .2).add(V(0, -.3, 0)));
      M.k1L = +PO.reach(k1, 'L', IK.wpos(k1.B.chest).addScaledVector(dirW(k1, 0, 0, 1), .15).add(V(0, -.5, 0)), { grip: .02 }).toFixed(3);
      inHand(brooms[1], PO.handPts(k1, 'L').palm, V(0, 1, 0).addScaledVector(dirW(k1, 0, 0, 1), .15).add(V(0, -.8, 0)));
      M.k1R = +PO.reach(k1, 'R', IK.wpos(k1.B.head).addScaledVector(dirW(k1, 0, 0, 1), .08).addScaledVector(dirW(k1, -1, 0, 0), .02).add(V(0, -.02, 0)), { grip: .02 }).toFixed(3);
      PO.look(k1, IK.wpos(k2.B.head), .5);
    } else if (laugh || (t >= L[10][0] - .5 && false)) {
      k1.group.rotation.y = -.45; rest(k1.B); idlePose(k1.B, t, 1); k1.group.updateMatrixWorld(true);
      brooms[1].visible = true; inHand(brooms[1], PO.handPts(k1, 'L').palm, V(0, 1, 0).add(V(0, -1.4, 0)));
      M.k1L = +PO.reach(k1, 'L', IK.wpos(k1.B.chest).addScaledVector(dirW(k1, 0, 0, 1), .2).add(V(0, -.45, 0)), { grip: .02 }).toFixed(3);
      inHand(brooms[1], PO.handPts(k1, 'L').palm, V(0, -1, 0));
      const pt = IK.wpos(dr.B.head); M.k1R = +PO.reach(k1, 'R', IK.wpos(k1.B.chest).addScaledVector(pt.clone().sub(IK.wpos(k1.B.chest)).setY(0).normalize(), .4).add(V(0, .08, 0)), { grip: .02 }).toFixed(3);
      PO.look(k1, V(pt.x, .5, pt.z), .5); k1.B.spine.rotation.x += .1 * Math.sin(t * 14); k1.group.updateMatrixWorld(true);
    } else sc(k1, 1, .65, 'k1');
    // kid2
    if (k2Soak || laugh || ret) {
      k2.group.rotation.y = ret ? .35 : .5; rest(k2.B); idlePose(k2.B, t, 1); k2.group.updateMatrixWorld(true);
      brooms[2].visible = true; inHand(brooms[2], PO.handPts(k2, 'L').palm, V(0, -1, .1));
      M.k2L = +PO.reach(k2, 'L', IK.wpos(k2.B.chest).addScaledVector(dirW(k2, 0, 0, 1), .15).add(V(0, -.5, 0)), { grip: .02 }).toFixed(3);
      inHand(brooms[2], PO.handPts(k2, 'L').palm, V(0, -1, .1));
      const tgtp = ret ? IK.wpos(k2.B.chest).addScaledVector(dirW(k2, 1, 0, 0), .3).addScaledVector(dirW(k2, 0, 0, 1), .2).add(V(0, -.15, 0)) :
        laugh ? IK.wpos(k2.B.chest).addScaledVector(IK.wpos(dr.B.head).sub(IK.wpos(k2.B.chest)).setY(0).normalize(), .4).add(V(0, .06, 0)) :
        IK.wpos(k2.B.chest).addScaledVector(dirW(k2, 0, 0, 1), .3 + .06 * Math.sin(t * 9)).addScaledVector(dirW(k2, -1, 0, 0), .15).add(V(0, .12 + .06 * Math.sin(t * 8), 0));
      M.k2R = +PO.reach(k2, 'R', tgtp, { grip: .02 }).toFixed(3);
      PO.look(k2, laugh ? V(IK.wpos(dr.B.head).x, .5, IK.wpos(dr.B.head).z) : k2Soak ? S3.cam.position : IK.wpos(mo.B.head), .7);
      if (laugh) { k2.B.spine.rotation.x += .1 * Math.sin(t * 13 + 1); k2.group.updateMatrixWorld(true); }
    } else sc(k2, 2, .65, 'k2');
    // kid3
    if (laugh) { k3.group.rotation.y = -.4; rest(k3.B); idlePose(k3.B, t, 1); k3.group.updateMatrixWorld(true);
      brooms[3].visible = true; inHand(brooms[3], PO.handPts(k3, 'L').palm, V(0, -1, 0));
      M.k3L = +PO.reach(k3, 'L', IK.wpos(k3.B.chest).addScaledVector(dirW(k3, 0, 0, 1), .15).add(V(0, -.5, 0)), { grip: .02 }).toFixed(3);
      inHand(brooms[3], PO.handPts(k3, 'L').palm, V(0, -1, 0));
      const pt = IK.wpos(dr.B.head); M.k3R = +PO.reach(k3, 'R', IK.wpos(k3.B.chest).addScaledVector(pt.clone().sub(IK.wpos(k3.B.chest)).setY(0).normalize(), .4).add(V(0, .08, 0)), { grip: .02 }).toFixed(3);
      PO.look(k3, V(pt.x, .5, pt.z), .5); k3.B.spine.rotation.x += .1 * Math.sin(t * 12 + 2); k3.group.updateMatrixWorld(true);
    } else sc(k3, 3, .65, 'k3');
    // ---- Driss trips into the bucket at T_HIT (he stands scrubbing before), stays kicking, gets up at the end
    const k = (t - T_HIT) / .9;
    if (k > 0 && t < L[9][0] + 1) {
      fall.at(Math.min(1, k));
      if (k > 1) { const ks = Math.sin(t * 14) * .5 * (1 - sm(L[8][0], L[9][0], t)); dr.B.shinL.rotation.x += .4 + ks * .5; dr.B.shinR.rotation.x += .4 - ks * .5; dr.B.thighL.rotation.x += ks * .2; dr.B.thighR.rotation.x -= ks * .2; dr.group.updateMatrixWorld(true); }
      bucket.rotation.set(0, 0, Math.PI / 2); bucket.position.set(bAt.x + .1, .14, bAt.z); puddle.visible = true; puddle.position.set(bAt.x - .1, .004, bAt.z);
      // the bucket tips toward the fall and the head goes into its mouth
      const hd = IK.wpos(dr.B.head); bucket.position.set(hd.x + .12, Math.max(.14, hd.y), hd.z); bucket.rotation.set(0, 0, -Math.PI / 2);
    } else if (t >= L[9][0] + 1) {   // after the gag he is back on his feet wiping
      dr.group.position.set(bAt.x - 1.2, 0, bAt.z + .3); dr.group.rotation.y = .3; scrub(dr, brooms[4], t, .8, 5.2, M, 'dr'); brooms[4].visible = true; puddle.visible = true; puddle.position.set(bAt.x - .1, .004, bAt.z);
    } else {
      rest(dr.B); idlePose(dr.B, t, 1); PO.look(dr, IK.wpos(mo.B.head), .4);
    }
    // ---- L10: everybody wipes with rags (same scrub)
  },
});
window.__s05 = { shot1 };
export default make({ preload: all(shot1), plate: 'ep06/msid_menage', segs: [ac([0, 0], shot1.fn), st('p03_fontaine', [1, 0], 'pushL'), ac([2, 0], shot1.fn)] });
