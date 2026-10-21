// s03: preparations. L0 wide Msid (plate msid_menage): Mohammed, kid1, kid2 walk in from the right to the fqih on his estrade;
// L1 the loft (msid_soupente): the fqih pats the glazed jar, grand1 holds the oil bottle, two kids carry an old mat roll up;
// L2 painting p01_ane (donkey of lime); L3 back in the Msid: two pairs carry rolled mats across and out left, the fqih names
// the team leaders with his rod (Mohammed, then kid1).
// Contacts (st.M): hands on the roll at its two ends (both carriers), fqih's palm on the jar, rod in his palm, bottle in grand1's palm.
import * as K from '../../../engine/core.js';
import * as PO from '../../../engine/poses.js';
import * as IK from '../../../engine/ik.js';
import * as PR from '../../../engine/props3d.js';
import * as THREE from 'three';
import { rest, idlePose } from '../../../engine/rig3d.js';
import { travel } from '../../../engine/clips.js';
import { make, ac, st } from './_pt.js';
import { shot, all, breathe, V, role } from './_3d.js';
import { rod, inHand } from './_props.js';
const { clamp, ease } = K;
const sm = (a, b, x) => ease(clamp((x - a) / (b - a)));
const yawTo = (from, to) => Math.atan2(to.x - from.x, to.z - from.z);
const dirW = (a, x, y, z) => V(x, y, z).normalize().applyAxisAngle(V(0, 1, 0), a.group.rotation.y);

const SC = (await (await fetch(new URL('../timing.json', import.meta.url))).json()).find(s => s.id === 's03_preparatifs');
const L = SC.lines.map(l => [l.start - SC.start, l.start - SC.start + l.dur]);
const LIGHT_M = { key: 0xffe8c8, keyI: 1.7, dir: [2.5, 3, .8], sky: 0xd8d4c8, ground: 0x8a6a48, fillI: 1.5, rim: 0xffe0a0, rimI: .6, rimDir: [-2, 2, -3], shadow: .3 };
const LIGHT_L = { key: 0xffe0b0, keyI: 1.6, dir: [2, 3, -.4], sky: 0xd8c0a0, ground: 0xb08850, fillI: 1.5, rim: 0xffd090, rimI: .5, rimDir: [-2, 2, -3], shadow: .3, area: 5 };

/** rolled straw mat, centred, axis along +y */
function rollMat(len, r) {
  const g = new THREE.Group(), tn = PR.toon;
  const body = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 16), tn(0xb89a58)); body.castShadow = true; g.add(body);
  for (const y of [-.38, 0, .38]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.04, r * 1.04, .035, 16), tn(0x6a4a2a)); b.position.y = y * len; g.add(b); }
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.CircleGeometry(r * .96, 16), tn(0x8a6a38)); e.position.y = s * len / 2 * 1.002; e.rotation.x = s * -Math.PI / 2; g.add(e); }
  return g;
}
/** small glazed oil bottle, origin at the grip (mid body), upright along +y */
function bottle() {
  const g = new THREE.Group(), tn = PR.toon;
  const b = new THREE.Mesh(new THREE.CylinderGeometry(.04, .045, .18, 12).translate(0, 0, 0), tn(0x5a7a3a)), n = new THREE.Mesh(new THREE.CylinderGeometry(.016, .022, .1, 10).translate(0, .14, 0), tn(0x5a7a3a));
  b.castShadow = n.castShadow = true; g.add(b, n); return g;
}

/** two carriers hold a roll between them (A in front, B behind along p0->p1); exit hides them at the end */
function carry(roll, A, B, p0, p1, t, t0, speed, d, exit = false, y = .72) {
  const f = p1.clone().sub(p0).setY(0).normalize(), left = V(f.z, 0, -f.x);
  const ra = travel(A, [[p0.x, p0.z], [p1.x, p1.z]], t, { t0, speed, exit }), rb = travel(B, [[p0.x - f.x * d, p0.z - f.z * d], [p1.x - f.x * d, p1.z - f.z * d]], t, { t0, speed, exit });
  const yaw = Math.atan2(f.x, f.z); A.group.rotation.y = B.group.rotation.y = yaw; A.group.updateMatrixWorld(true); B.group.updateMatrixWorld(true);
  const pa = A.group.position, pb = B.group.position, M = {};
  for (const [a, p] of [[A, pa], [B, pb]]) for (const [side, sg] of [['L', 1], ['R', -1]])
    M[a.name + side] = +PO.reach(a, side, V(p.x, y, p.z).addScaledVector(f, .3).addScaledVector(left, .13 * sg), { grip: .02 }).toFixed(3);
  roll.position.set((pa.x + pb.x) / 2 + f.x * .3, y + .015 * Math.sin(t * 6), (pa.z + pb.z) / 2 + f.z * .3);
  roll.quaternion.setFromUnitVectors(V(0, 1, 0), V(f.x, .05, f.z).normalize()); roll.updateMatrixWorld(true);
  roll.visible = !(exit && ra.done) && rb.pos !== null;
  return M;
}

// ------------------------------------------------------------------------------------ the Msid (L0 and L3)
const shM = shot({
  plate: 'msid_menage', light: LIGHT_M,
  async build(S3) {
    const M = {}, F = (x, y, h = 0) => S3.floorAt(x, y, h);
    const [mo, k1, k2, k3, g1, g2, fq] = await Promise.all(['mohammed', 'kid1', 'kid2', 'kid3', 'grand1', 'grand2', 'fqih'].map(n => role(n)));
    const fqAt = F(1046, 613, .35), cam0 = S3.cam.position.clone().setY(0);
    S3.add(fq, fqAt.x, fqAt.z, yawTo(fqAt, cam0) * .8); fq.group.position.y = .35;
    const spot = { mo: F(760, 870), k1: F(1330, 860), k2: F(1560, 880) };
    S3.add(mo, spot.mo.x, spot.mo.z, 0); S3.add(k1, spot.k1.x, spot.k1.z, 0); S3.add(k2, spot.k2.x, spot.k2.z, 0);
    for (const a of [k3, g1, g2]) S3.add(a, 9, 9, 0);
    const start = { mo: F(2250, 880), k1: F(2250, 850), k2: F(2250, 860) };
    const rolls = [rollMat(1.6, .09), rollMat(1.2, .08)].map(r => S3.prop(r)), rd = S3.prop(rod());
    // cross-room line for the carriers (same screen row = same depth), right to left, off-screen both sides
    const cr0 = F(2300, 940), cr1 = F(-500, 940), cr2 = F(2300, 905), cr3 = F(-500, 905);
    return { actors: [fq, mo, k1, k2, k3, g1, g2], M, mo, k1, k2, k3, g1, g2, fq, spot, start, rolls, rd, cr: [cr0, cr1, cr2, cr3], fqAt,
      faces: [[fq, null, 1], [mo, null, 5], [k1, null, 2], [k2, null, 3], [k3, null, 4], [g1, null, 6], [g2, null, 7]] };
  },
  cover: [{ t: 0, size: 'W' }, { t: L[0][0] + 5, size: 'M', on: 'mohammed', dy: -70 }, { t: L[0][0] + 8.2, size: 'W' },
    { t: L[3][0], size: 'W' }, { t: L[3][0] + 6.5, size: 'M', on: 'fqih', dy: -90 }, { t: L[3][0] + 10, size: 'M', on: 'mohammed', dy: -90 }, { t: L[3][0] + 13, size: 'M', on: 'kid1', dy: -90 }, { t: L[3][0] + 16, size: 'W' }],
  frame(lt, u, t, S, st) {
    const { M, mo, k1, k2, k3, g1, g2, fq, spot, start, rolls, rd, cr } = st, C = t >= L[3][0] - .5;
    for (const a of [mo, k1, k2, k3, g1, g2, fq]) { rest(a.B); idlePose(a.B, t + a.name.length, 1); }
    const fh = IK.wpos(fq.B.head);
    // ---- the fqih on his estrade, rod at his side, pointing with it when he names the chiefs
    const fch = IK.wpos(fq.B.chest), ff = dirW(fq, 0, 0, 1), fs = dirW(fq, -1, 0, 0);
    const pM = sm(L[3][0] + 7, L[3][0] + 7.6, t) * (1 - sm(L[3][0] + 10, L[3][0] + 10.6, t)), pK = sm(L[3][0] + 10.8, L[3][0] + 11.4, t) * (1 - sm(L[3][0] + 14, L[3][0] + 14.6, t));
    const aimAt = IK.wpos(mo.B.chest).setY(1.0), aimK = IK.wpos(k1.B.chest);
    const dm = aimAt.clone().sub(fch).setY(0).normalize(), dk = aimK.clone().sub(fch).setY(0).normalize();
    let hand = fch.clone().addScaledVector(ff, .18).addScaledVector(fs, .2).add(V(0, -.35, 0));
    hand.lerp(fch.clone().addScaledVector(dm, .5).addScaledVector(fs, .1).add(V(0, .05, 0)), pM).lerp(fch.clone().addScaledVector(dk, .5).addScaledVector(fs, .1).add(V(0, .05, 0)), pK);
    M.fq = +PO.reach(fq, 'R', hand, { grip: .02 }).toFixed(3);
    const rdir = pK > .5 ? dk.clone().add(V(0, .08, 0)) : pM > .5 ? dm.clone().add(V(0, .08, 0)) : ff.clone().add(V(0, -.6, 0));
    inHand(rd, PO.handPts(fq, 'R').palm, rdir);
    PO.look(fq, IK.wpos((pK > .5 || (C && t > L[3][0] + 11) ? k1 : mo).B.head), .5); breathe(fq, t, 1, 1);
    if (!C) {
      rolls.forEach(r => r.visible = false); [k3, g1, g2].forEach(a => a.group.visible = false);
      // L0: the three walk in one after another from the right and settle facing the master
      for (const [a, key, t0] of [[mo, 'mo', .3], [k1, 'k1', .9], [k2, 'k2', 1.5]]) {
        const p0 = start[key], p1 = spot[key];
        const r = travel(a, [[p0.x, p0.z], [p1.x, p1.z]], t, { t0, speed: 1.1 });
        if (r.done) { a.group.rotation.y = key === 'k1' ? -.55 : .55; rest(a.B); idlePose(a.B, t + a.name.length, 1); a.group.updateMatrixWorld(true); PO.look(a, fh, .9); }
        else PO.look(a, fh, .3);
      }
    } else {
      // L3: Mohammed and kid1 wait facing the master; grand1+2 then kid2+3 carry a roll across and out on the left
      for (const [a, key] of [[mo, 'mo'], [k1, 'k1']]) { const p = spot[key]; a.group.position.set(p.x, 0, p.z); a.group.rotation.y = key === 'k1' ? -.55 : .55; a.group.updateMatrixWorld(true); PO.look(a, fh, .9); }
      const puff = sm(L[3][0] + 7.2, L[3][0] + 8, t) * (1 - sm(L[3][0] + 10, L[3][0] + 10.8, t));
      mo.B.chest.rotation.x -= .12 * puff; mo.B.head.rotation.x -= .08 * puff; mo.group.updateMatrixWorld(true);
      rolls[0].visible = rolls[1].visible = true;
      const dist1 = cr[0].distanceTo(cr[1]);
      Object.assign(M, carry(rolls[0], g1, g2, cr[0], cr[1], t, L[3][0] + .4, dist1 / 7.5, 1.3, true));
      Object.assign(M, carry(rolls[1], k2, k3, cr[2], cr[3], t, L[3][0] + 4.2, dist1 / 7.5, 1.0, true, .62));
      for (const a of [g1, g2, k2, k3]) a.group.visible = a.group.visible && true;
      PO.look(mo, IK.wpos(fq.B.head), .9);
    }
  },
});

// ------------------------------------------------------------------------------------ the loft (L1)
const shL = shot({
  plate: 'msid_soupente', light: LIGHT_L,
  async build(S3) {
    const M = {}, F = (x, y, h = 0) => S3.floorAt(x, y, h);
    const [k1, k2, g1, fq] = await Promise.all(['kid1', 'kid2', 'grand1', 'fqih'].map(n => role(n)));
    const cam0 = S3.cam.position.clone().setY(0), jar = F(1504, 677), toCam = cam0.clone().sub(jar).normalize();
    const fqAt = jar.clone().addScaledVector(toCam, .3).add(V(-.95, 0, 0)), g1At = fqAt.clone().add(V(-.75, 0, .15));
    S3.add(fq, fqAt.x, fqAt.z, yawTo(fqAt, jar) * .8 + yawTo(fqAt, cam0) * .2); S3.add(g1, g1At.x, g1At.z, yawTo(g1At, fqAt) * .6 + yawTo(g1At, cam0) * .4);
    const p0 = F(-150, 940), p1 = F(1050, 720); S3.add(k1, p1.x, p1.z, 0); S3.add(k2, p1.x - 1, p1.z, 0);
    const roll = S3.prop(rollMat(1.3, .08)), bt = S3.prop(bottle()), rd = S3.prop(rod());
    return { actors: [fq, g1, k1, k2], M, k1, k2, g1, fq, jar, toCam, p0, p1, roll, bt, rd, faces: [[fq, null, 1], [g1, null, 6], [k1, null, 2], [k2, null, 3]] };
  },
  cover: [{ t: L[1][0], size: 'M', on: 'fqih', dy: -90 }, { t: L[1][0] + 4.5, size: 'W' }, { t: L[1][0] + 7, size: 'M', on: 'kid1', dy: -60 }],
  frame(lt, u, t, S, st) {
    const { M, k1, k2, g1, fq, jar, toCam, p0, p1, roll, bt, rd } = st, T = L[1][0];
    for (const a of [k1, k2, g1, fq]) { rest(a.B); idlePose(a.B, t + a.name.length, 1); }
    // fqih: right hand pats the shoulder of the left jar (1.0 m up, 30 cm out from its axis), rod in the left hand, looking at the jar then at grand1
    const pat = sm(T + .8, T + 1.8, t) * (1 - sm(T + 8.5, T + 9.5, t)), shoulder = jar.clone().setY(.85).addScaledVector(toCam, .3).add(V(-.4, 0, 0));
    const fch = IK.wpos(fq.B.chest), rest0 = fch.clone().addScaledVector(dirW(fq, 0, 0, 1), .18).addScaledVector(dirW(fq, -1, 0, 0), .2).add(V(0, -.35, 0));
    const tgt = rest0.lerp(shoulder.clone().add(V(Math.sin(t * 3) * .02 * pat, Math.sin(t * 5) * .03 * pat, 0)), pat);
    M.fqR = +PO.reach(fq, 'R', tgt, { grip: .02 }).toFixed(3);
    const fs = dirW(fq, 1, 0, 0); inHand(rd, PO.handPts(fq, 'L').palm, V(0, -.6, .1)); M.fqL = +PO.reach(fq, 'L', fch.clone().addScaledVector(dirW(fq, 0, 0, 1), .2).addScaledVector(fs, .22).add(V(0, -.35, 0)), { grip: .02 }).toFixed(3);
    inHand(rd, PO.handPts(fq, 'L').palm, dirW(fq, 0, -.5, .5));
    PO.look(fq, pat > .5 ? shoulder : IK.wpos(g1.B.head), .5); breathe(fq, t, 1, 1);
    // grand1: holds the oil bottle at his chest, lifts it toward the master when he brings it
    const off = sm(T + 3, T + 4, t) * (1 - sm(T + 6.5, T + 7.5, t)), gch = IK.wpos(g1.B.chest), gf = dirW(g1, 0, 0, 1);
    const gh = gch.clone().addScaledVector(gf, .24 + .12 * off).addScaledVector(dirW(g1, -1, 0, 0), .06).add(V(0, -.12 + .08 * off, 0));
    M.g1 = +PO.reach(g1, 'R', gh, { grip: .02 }).toFixed(3); inHand(bt, PO.handPts(g1, 'R').palm, V(0, 1, 0).addScaledVector(gf, .15 + .3 * off));
    PO.reach(g1, 'L', gh.clone().addScaledVector(dirW(g1, 1, 0, 0), .16).add(V(0, -.05, 0)), { grip: .02 });
    PO.look(g1, IK.wpos(fq.B.head), .6);
    // kid1 + kid2 bring an old roll from the left, stopping near the mat stack
    const dist = p0.distanceTo(p1);
    Object.assign(M, carry(roll, k1, k2, p0, p1, t, T + .3, dist / 6.5, 1.0, false, .62));
  },
});

window.__s03 = { shM, shL };
export default make({ preload: all(shM, shL), plate: 'ep06/msid_menage', segs: [ac([0, 0], shM.fn), ac([1, 0], shL.fn), st('p01_ane', [2, 0], 'pushL'), ac([3, 0], shM.fn)] });
