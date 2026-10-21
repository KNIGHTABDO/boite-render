// s16: the satinette. 3D rue_epices (lines 0-2): Mohammed tugs her haik near the Attarine medersa; she curses the chouafas and pats her pockets
// at a shop corner; close on her face, the money found deep in a pocket, the black satinette bought. 3D escalier (line 3): she hands the satinette
// to the chouafa (kanza) and climbs away groaning (the stair steps are not modelled: she walks up the plate toward the door, bent and slow).
// Cal: rue_epices horizon 677 (seed 486 too high, estimate), escalier self-seeded like s10 (1.65 m / 440 / 55).
import * as THREE from 'three';
import * as K from '../../../engine/core.js';
import * as PO from '../../../engine/poses.js';
import * as IK from '../../../engine/ik.js';
import { rest, idlePose } from '../../../engine/rig3d.js';
import { travel } from '../../../engine/clips.js';
import * as PR from '../../../engine/props3d.js';
import { make, ac } from './_pt.js';
import { shot, all, breathe, V, role, CAL } from './_3d.js';
import { inHand } from './_props.js';
const { clamp, ease } = K;
const sm = (a, b, x) => ease((x - a) / (b - a));
const yawTo = (from, to) => Math.atan2(to.x - from.x, to.z - from.z);
const dirW = (a, x, y, z) => V(x, y, z).normalize().applyAxisAngle(V(0, 1, 0), a.group.rotation.y);
const palm = (a, s) => PO.handPts(a, s).palm;
CAL.rue_epices = { ...CAL.rue_epices, h: 1.1, horizon: 677, fov: 45 };
CAL.escalier = { h: 1.65, horizon: 440, fov: 55 };

const SC = (await (await fetch(new URL('../timing.json', import.meta.url))).json()).find(s => s.id === 's16_satinette');
const L = SC.lines.map(l => [l.start - SC.start, l.start - SC.start + l.dur]);
const T_FIND = L[2][0] + 5.5, T_PAY = L[2][0] + 9.5, T_GIVE = L[3][0] + 4.2;

/** the black satinette: a rolled bolt of black glossy cloth, axis +y, 40 cm long */
function satinette() {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, .4, 14), PR.toon(0x17171c)), new THREE.Mesh(new THREE.CylinderGeometry(.062, .062, .02, 14).translate(0, .1, 0), PR.toon(0x6a6a74)));
  g.traverse(o => { if (o.isMesh) o.castShadow = true; }); return g;
}
function coins() {
  const g = new THREE.Group();
  for (let i = 0; i < 4; i++) g.add(new THREE.Mesh(new THREE.CylinderGeometry(.017, .017, .003, 12).translate(i * .006, i * .004, 0), PR.toon(0xcfcfc4)));
  return g;
}

const LIGHT = { key: 0xffe8c8, keyI: 1.6, dir: [-2, 3, 1.2], sky: 0xd8d4c8, ground: 0x8a6a48, fillI: 1.5, rim: 0xffe0a0, rimI: .5, rimDir: [2, 2, -3], shadow: .3 };

// ---------------------------------------------------------------- rue_epices, lines 0-2
const ep = shot({
  plate: 'rue_epices', light: LIGHT,
  async build(S3) {
    const F = (x, y, h = 0) => S3.floorAt(x, y, h), cam = S3.cam.position.clone().setY(0);
    const zo = await role('zoubida', { costume: 'haik' }), mo = await role('mohammed');
    const A = F(150, 995), B = F(1000, 995), mA = F(60, 1010), mB = F(1190, 1005);
    S3.add(zo, B.x, B.z, yawTo(B, cam) + .4); S3.add(mo, mB.x, mB.z, yawTo(mB, B));
    const sat = S3.prop(satinette()), cn = S3.prop(coins());
    return { actors: [zo, mo], zo, mo, A, B, mA, mB, cam, sat, cn, faces: [[zo, 'zoubida', 1], [mo, null, 2]] };
  },
  cover: [{ t: 1, size: 'W' }, { t: 5, size: 'M', on: 'mohammed' }, { t: L[1][0], size: 'M', on: 'zoubida' }, { t: L[2][0], size: 'CU', on: 'zoubida', dy: -30 }],
  frame(lt, u, t, S, st) {
    const { zo, mo, A, B, mA, mB, cam, sat, cn } = st, t0 = 1, T1 = 5.2;
    sat.visible = cn.visible = false;
    if (t < t0 + T1) {
      travel(zo, [[A.x, A.z], [B.x, B.z]], t, { t0, speed: A.distanceTo(B) / T1 });
      travel(mo, [[mA.x, mA.z], [mB.x, mB.z]], t, { t0, speed: mA.distanceTo(mB) / T1 });
    } else {
      rest(zo.B); idlePose(zo.B, t, 1); rest(mo.B); idlePose(mo.B, t + 1, 1);
      zo.group.rotation.y = yawTo(B, cam) + .4; mo.group.rotation.y = yawTo(mB, B); zo.group.updateMatrixWorld(true); mo.group.updateMatrixWorld(true);
      const zc = IK.wpos(zo.B.chest), zf = dirW(zo, 0, 0, 1), zs = dirW(zo, 1, 0, 0), zh = IK.wpos(zo.B.hips || zo.B.chest).add(V(0, -.15, 0));
      // 0: he tugs her haik (small, at hip height), she half looks down
      if (t < L[1][0]) {
        const tug = sm(5.9, 6.2, t) * (1 - sm(6.9, 7.2, t)), j = Math.sin(t * 14) * .03 * tug;
        PO.reach(mo, 'R', IK.wpos(mo.B.handR).lerp(zh.clone().addScaledVector(zs, -.28).addScaledVector(zf, .06).add(V(0, j, 0)), tug), { grip: .03 });
        PO.look(zo, IK.wpos(mo.B.head), .4 * tug); PO.look(mo, IK.wpos(zo.B.head), .6);
      } else if (t < L[2][0]) {   // 1: cursing, patting her pockets (hands low at the hips, quick), head shakes
        const pat = Math.abs(Math.sin(t * 5));
        PO.reach(zo, 'R', zh.clone().addScaledVector(zs, -.24).addScaledVector(zf, .14).add(V(0, .08 * pat, 0)), { grip: .03 });
        PO.reach(zo, 'L', zh.clone().addScaledVector(zs, .24).addScaledVector(zf, .14).add(V(0, .08 * (1 - pat), 0)), { grip: .03 });
        zo.B.head.rotation.y += .25 * Math.sin(t * 4); PO.look(mo, IK.wpos(zo.B.head), .5);
      } else {   // 2: digs deeper, finds the coins, pays, takes the satinette
        const dig = sm(L[2][0], L[2][0] + .5, t) * (1 - sm(T_FIND - .3, T_FIND, t)), j = Math.sin(t * 9) * .03 * dig;
        const pk = zh.clone().addScaledVector(zs, -.24).addScaledVector(zf, .1);
        if (t < T_FIND) PO.reach(zo, 'R', IK.wpos(zo.B.handR).lerp(pk.clone().add(V(0, -.04 + j, j)), dig), { grip: .03 });
        else {   // the coins in her palm, held out low
          const out = sm(T_FIND, T_FIND + .6, t) * (1 - sm(T_PAY + 1, T_PAY + 1.6, t));
          PO.reach(zo, 'R', pk.clone().lerp(zc.clone().addScaledVector(zf, .3).addScaledVector(zs, -.08).add(V(0, -.32, 0)), out), { grip: .02 });
          cn.visible = true; cn.position.copy(palm(zo, 'R')).add(V(0, .015, 0)); cn.updateMatrixWorld(true);
          if (t > T_PAY + .6) { cn.visible = false; }
        }
        if (t >= T_PAY) {   // the satinette arrives in her left arm
          sat.visible = true; PO.reach(zo, 'L', zc.clone().addScaledVector(zf, .22).addScaledVector(zs, .12).add(V(0, -.32, 0)), { grip: .03 });
          inHand(sat, palm(zo, 'L'), dirW(zo, .5, .15, .7));
        }
        PO.look(zo, t < T_FIND ? zc.clone().addScaledVector(zf, .3).add(V(0, -.4, 0)) : cam.clone().add(V(0, 1.5, 0)), .55);
        PO.look(mo, IK.wpos(zo.B.head), .5);
      }
    }
    breathe(zo, t, 1, 1); breathe(mo, t, 1, 2);
  },
});

// ---------------------------------------------------------------- escalier, line 3
const esc = shot({
  plate: 'escalier', light: { ...LIGHT, keyI: 1.4, shadow: .2 },
  async build(S3) {
    const F = (x, y, h = 0) => S3.floorAt(x, y, h), cam = S3.cam.position.clone().setY(0);
    const zo = await role('zoubida', { costume: 'haik' }), ka = await role('kanza');
    const from = F(1750, 1050), meet = F(1020, 1000), kp = F(900, 1000), door = F(640, 800);
    S3.add(zo, from.x, from.z, yawTo(from, meet)); S3.add(ka, kp.x, kp.z, yawTo(kp, meet));
    const sat = S3.prop(satinette());
    return { actors: [zo, ka], zo, ka, from, meet, kp, door, cam, sat, faces: [[zo, null, 1], [ka, null, 2]] };
  },
  cover: [{ t: L[3][0], size: 'W' }, { t: L[3][0] + 3, size: 'M', on: 'kanza', dy: 40 }, { t: T_GIVE + 2, size: 'W' }],
  frame(lt, u, t, S, st) {
    const { zo, ka, from, meet, kp, door, cam, sat } = st, t0 = L[3][0], len = from.distanceTo(meet), wk = (T_GIVE - .3) - t0 - .2, T2 = T_GIVE + 2.2;
    rest(ka.B); idlePose(ka.B, t + 2, 1); ka.group.rotation.y = yawTo(kp, meet); ka.group.updateMatrixWorld(true);
    sat.visible = true;
    if (t < T2) {   // arrives with the satinette in her left arm, holds it out; the chouafa takes it
      travel(zo, [[from.x, from.z], [meet.x, meet.z]], t, { t0: t0 + .2, speed: len / wk });
      const zc = IK.wpos(zo.B.chest), zf = dirW(zo, 0, 0, 1), zs = dirW(zo, 1, 0, 0), arr = t >= T_GIVE - .3;
      if (!arr) { PO.reach(zo, 'L', zc.clone().addScaledVector(zf, .2).addScaledVector(zs, .12).add(V(0, -.32, 0)), { grip: .03 }); inHand(sat, palm(zo, 'L'), dirW(zo, .5, .15, .7)); }
      else {
        const k = sm(T_GIVE - .3, T_GIVE + .3, t), take = sm(T_GIVE + .3, T_GIVE + 1, t);
        rest(zo.B); idlePose(zo.B, t, 1); zo.group.rotation.y = yawTo(meet, kp); zo.group.updateMatrixWorld(true);
        const P = zc.clone().addScaledVector(zf, .42).add(V(0, -.05, 0));
        PO.reach(zo, 'L', IK.wpos(zo.B.handL).lerp(P.clone().addScaledVector(zs, .04), k), { grip: .03 });
        const kc = IK.wpos(ka.B.chest), kf = dirW(ka, 0, 0, 1);
        PO.reach(ka, 'R', IK.wpos(ka.B.handR).lerp(P.clone().addScaledVector(zs, -.02), take), { grip: .03 });
        if (take < 1) inHand(sat, palm(zo, 'L'), dirW(zo, .5, .15, .7)); else inHand(sat, palm(ka, 'R'), dirW(ka, .4, .15, .8));
        PO.look(zo, IK.wpos(ka.B.head), .5); PO.look(ka, IK.wpos(zo.B.head), .6);
      }
    } else {   // she climbs away, bent and slow, one hand at her lower back, groaning at each step (head drops with the beat)
      const step = Math.PI * 1.1, ph = (t - T2) * step * 1.0, r = door.clone(), len2 = meet.distanceTo(r);
      travel(zo, [[meet.x, meet.z], [r.x, r.z]], t, { t0: T2, speed: .38 });
      const zs = dirW(zo, 1, 0, 0), zc = IK.wpos(zo.B.chest), zf = dirW(zo, 0, 0, 1);
      PO.reach(zo, 'L', zc.clone().addScaledVector(zs, .22).addScaledVector(zf, -.1).add(V(0, -.35, 0)), { grip: .03 });
      zo.B.spine.rotation.x += .18 + .06 * Math.abs(Math.sin(ph)); zo.B.head.rotation.x += .12 * Math.abs(Math.sin(ph));
      inHand(sat, palm(ka, 'R'), dirW(ka, .4, .15, .8)); PO.look(ka, IK.wpos(zo.B.head), .6);
      PO.reach(ka, 'R', IK.wpos(ka.B.chest).addScaledVector(dirW(ka, 0, 0, 1), .25).addScaledVector(dirW(ka, 1, 0, 0), -.1).add(V(0, -.2, 0)), { grip: .03 });
    }
    breathe(zo, t, 1, 1); breathe(ka, t, 1, 2);
  },
});

export { ep, esc };
export default make({ preload: all(ep, esc), plate: 'ep06/rue_epices', segs: [ac([0, 0], ep.fn), ac([3, 0], esc.fn)] });
