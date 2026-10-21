// s11: impasse_jour. l0 Rahma at her door (right) calls after Zoubida and the boy walking away down the alley (they stop near the arch);
// l1 W: they are almost at the corner, Kanza comes out of the same door; l2 Kanza lists her needs (M then CU);
// l3 Zoubida answers from afar and, l4, pushes the boy back toward the house; Kanza puts the money (3 coins) in his hand.
// Plate calibration self-seeded (horizon 763 from the alley vanishing point, camera .62 m from the door height).
import * as K from '../../../engine/core.js';
import * as PO from '../../../engine/poses.js';
import * as IK from '../../../engine/ik.js';
import { rest, idlePose } from '../../../engine/rig3d.js';
import { travel } from '../../../engine/clips.js';
import * as THREE from 'three';
import * as PR from '../../../engine/props3d.js';
import { make, ac } from './_pt.js';
import { shot, all, breathe, V, role, CAL } from './_3d.js';
const { clamp, ease } = K;
const sm = (a, b, x) => ease(clamp((x - a) / (b - a)));
const dirW = (a, x, y, z) => V(x, y, z).normalize().applyAxisAngle(V(0, 1, 0), a.group.rotation.y);
const yawTo = (f, to) => Math.atan2(to.x - f.x, to.z - f.z);

CAL.impasse_jour = { h: .62, horizon: 763, fov: 50 };
const SC = (await (await fetch(new URL('../timing.json', import.meta.url))).json()).find(s => s.id === 's11_kanza');
const L = SC.lines.map(l => [l.start - SC.start, l.start - SC.start + l.dur]);
const TSTOP = L[1][0] + 4.2, KOUT = L[1][0] + 4.6, PUSH = L[4][0] + .2, WALK = L[4][0] + 1.2, ARR = L[4][0] + 5.0, GIVE = ARR + .3;

function coins() {   // three gold coins on a flat palm (origin at the palm)
  const g = new THREE.Group();
  for (let i = 0; i < 3; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(.014, .014, .003, 12).translate(0, .004 + i * .004, 0), PR.toon(0xe0b030)); c.castShadow = true; g.add(c); }
  return g;
}

const sh = shot({
  plate: 'impasse_jour',
  light: { key: 0xfff0d0, keyI: 1.2, dir: [-1.5, 3, 2], sky: 0xa0b8e8, ground: 0x9aa0b0, fillI: 1.8, rim: 0xffd890, rimI: .6, rimDir: [2, 2, -3], shadow: .25, area: 4 },
  async build(S3) {
    const F = (x, y) => S3.floorAt(x, y);
    const rh = await role('rahma'), ka = await role('kanza'), zo = await role('zoubida', { costume: 'haik' }), mo = await role('mohammed');
    const coin = S3.prop(coins());
    const door = F(1450, 955), rp = F(1370, 968), kp = F(1255, 992), z0 = F(1010, 905), zp = F(775, 835), mp0 = F(1010, 912);
    const toK = kp.clone().sub(zp).setY(0).normalize(), mp = zp.clone().addScaledVector(toK, .55).addScaledVector(V(-toK.z, 0, toK.x), -.12);
    const arrP = kp.clone().add(V(-.7, 0, .12));
    S3.add(rh, rp.x, rp.z, -1.0); S3.add(ka, kp.x, kp.z, -1.0); S3.add(zo, zp.x, zp.z, yawTo(zp, kp)); S3.add(mo, mp.x, mp.z, yawTo(mp, kp));
    return { actors: [rh, ka, zo, mo], rh, ka, zo, mo, coin, door, rp, kp, zp, mp, z0, mp0, arrP, toK,
      faces: [[rh, 'rahma', 1], [ka, 'kanza', 2], [zo, 'zoubida', 3], [mo, null, 4, (lt, t) => ({ sad: t > PUSH ? .5 : 0 })]] };
  },
  cover: [{ t: 0, size: 'M', on: 'rahma' }, { t: L[0][1] + .2, size: 'W' }, { t: L[2][0], size: 'M', on: 'kanza' }, { t: L[2][0] + 7.5, size: 'CU', on: 'kanza' },
    { t: L[3][0], size: 'CU', on: 'zoubida', dy: 40 }, { t: L[4][0], size: 'W' }, { t: ARR - .8, size: 'M', on: 'kanza', dy: 0 }],
  frame(lt, u, t, S, s) {
    const { rh, ka, zo, mo, coin } = s, up = V(0, 1, 0);
    // --- Zoubida + Mohammed: walk to the arch, stop, turn back
    const zwalk = (a, from, to, off) => {
      const d = from.distanceTo(to);
      return travel(a, [[from.x, from.z], [to.x, to.z]], t, { t0: 0, speed: d / (TSTOP - off), gait: 'walk' });
    };
    if (t < TSTOP) { zwalk(zo, s.z0, s.zp, 0); zwalk(mo, s.mp0, s.mp, .3); }
    else {
      for (const [a, p] of [[zo, s.zp], [mo, s.mp]]) { a.group.position.copy(p); rest(a.B); idlePose(a.B, t, .8); }
      zo.group.rotation.y = yawTo(s.zp, s.kp) + .1; mo.group.rotation.y = yawTo(s.mp, s.kp);
    }
    zo.group.updateMatrixWorld(true); mo.group.updateMatrixWorld(true);
    if (t >= TSTOP) {   // Zoubida: answers (l3) with an open hand toward the house, then pushes the boy (l4)
      const ch = IK.wpos(zo.B.chest), fw = dirW(zo, 0, 0, 1), rt = dirW(zo, -1, 0, 0);
      const mch = IK.wpos(mo.B.chest), mfw = dirW(mo, 0, 0, 1);
      if (t >= L[3][0] && t < PUSH) PO.reach(zo, 'R', ch.clone().addScaledVector(fw, .3).addScaledVector(rt, .2).add(V(0, .08 + .04 * Math.sin(t * 6), 0)));
      if (t >= PUSH && t < WALK + 1.2) PO.reach(zo, 'R', mo.group.position.clone().add(V(0, .9, 0)).addScaledVector(mfw, -.12), { grip: .02 });
      else if (t >= WALK + 1.2) PO.reach(zo, 'R', ch.clone().addScaledVector(fw, .2).addScaledVector(rt, .2).add(V(0, -.2, 0)));
    }
    // --- Mohammed: pushed to the house
    if (t >= WALK) {
      const d = s.mp.distanceTo(s.arrP);
      travel(mo, [[s.mp.x, s.mp.z], [s.arrP.x, s.arrP.z]], t, { t0: WALK, speed: d / (ARR - WALK), gait: 'walk' });
      if (t >= ARR) { mo.group.position.copy(s.arrP); mo.group.rotation.y = yawTo(s.arrP, s.kp); rest(mo.B); idlePose(mo.B, t, .8); mo.group.updateMatrixWorld(true); }
    }
    // --- Rahma: calls from the door, then goes in
    const rgo = L[0][1] + .1;
    if (t < rgo) {
      rh.group.position.copy(s.rp); rh.group.rotation.y = -1.0; rh.group.visible = true; rest(rh.B); idlePose(rh.B, t, .8); rh.group.updateMatrixWorld(true);
      const ch = IK.wpos(rh.B.chest), fw = dirW(rh, 0, 0, 1), rt = dirW(rh, -1, 0, 0), k = Math.sin(t * 4.5);
      PO.reach(rh, 'L', ch.clone().addScaledVector(fw, .25).addScaledVector(rt, -.18).add(V(0, .3 + .08 * k, 0)));   // waves after them
      PO.reach(rh, 'R', ch.clone().addScaledVector(fw, .2).addScaledVector(rt, .22).add(V(0, -.18, 0)));
      PO.look(rh, IK.wpos(rh.B.head).add(V(-3, .3, -2)), .5);
    } else {
      travel(rh, [[s.rp.x, s.rp.z], [s.door.x, s.door.z]], t, { t0: rgo, speed: 1.3, gait: 'walk', exit: true });
    }
    // --- Kanza: comes out of the door, calls, lists, gives the money
    const kin = KOUT;
    if (t < kin) ka.group.visible = false;
    else {
      ka.group.visible = true;
      if (t < kin + 1.8) travel(ka, [[s.door.x, s.door.z], [s.kp.x, s.kp.z]], t, { t0: kin, speed: s.door.distanceTo(s.kp) / 1.6, gait: 'walk' });
      else { ka.group.position.copy(s.kp); ka.group.rotation.y = -1.0; rest(ka.B); idlePose(ka.B, t, .8); }
      ka.group.updateMatrixWorld(true);
      if (t >= kin + 1.8) {
        const ch = IK.wpos(ka.B.chest), fw = dirW(ka, 0, 0, 1), rt = dirW(ka, -1, 0, 0), k = Math.sin(t * 3.1), k2 = Math.sin(t * 2.3 + 1);
        if (t < L[4][0]) {   // listing her needs: hand raised counting, other hand on the hip
          PO.reach(ka, 'L', ch.clone().addScaledVector(fw, .28).addScaledVector(rt, -.2).add(V(0, .16 + .12 * k, 0)));
          PO.reach(ka, 'R', ch.clone().addScaledVector(fw, .1).addScaledVector(rt, .3).add(V(0, -.22, 0)));
          PO.look(ka, IK.wpos(ka.B.head).add(V(-3, .2 * k2, -1)), .35);
        } else {
          const mid = s.kp.clone().lerp(s.arrP, .55).add(V(0, .85, 0)), giv = sm(ARR - 1.2, ARR - .2, t);
          PO.reach(ka, 'R', ch.clone().addScaledVector(fw, .1).addScaledVector(rt, .2).add(V(0, -.2, 0)).lerp(mid, giv), { grip: .03 });
          PO.reach(ka, 'L', ch.clone().addScaledVector(rt, -.3).addScaledVector(fw, .05).add(V(0, -.22, 0)));
          PO.look(ka, IK.wpos(mo.B.head), .5);
        }
      }
    }
    // --- Mohammed receives the money
    if (t >= ARR - .3) {
      mo.group.updateMatrixWorld(true);
      const mid = s.kp.clone().lerp(s.arrP, .55).add(V(0, .85, 0)), rcv = sm(ARR - .5, ARR + .3, t) * (1 - sm(GIVE + 1.5, GIVE + 2.5, t));
      const mch = IK.wpos(mo.B.chest), mfw = dirW(mo, 0, 0, 1);
      PO.reach(mo, 'L', mch.clone().addScaledVector(mfw, .2).add(V(0, -.2, 0)).lerp(mid.clone().add(V(0, -.04, 0)), rcv), { grip: .03 });
      PO.look(mo, IK.wpos(ka.B.head), .5);
    }
    // coins: in Kanza's palm until she gives, then in Mohammed's
    if (t < ARR - .2) coin.visible = false;
    else {
      coin.visible = true;
      const kp = PO.handPts(ka, 'R').palm, mpm = PO.handPts(mo, 'L').palm;
      coin.position.copy(t < GIVE ? kp : mpm); coin.quaternion.identity(); coin.updateMatrixWorld(true);
    }
    for (const a of [rh, ka, zo, mo]) breathe(a, t, .6, 1);
  },
});

export default make({ preload: all(sh), plate: 'impasse_jour', segs: [ac([0, 0], sh.fn)] });
