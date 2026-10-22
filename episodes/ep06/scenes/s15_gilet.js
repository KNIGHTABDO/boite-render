// s15: the cherry gilet. Two shots on two plates, cut line by line like a dialogue:
//   rev = kissaria_rev (camera on the street side, faces to camera: Zoubida + Mohammed; the merchant is behind the camera),
//   kis = kissaria (camera on the stall side: the merchant on his platform, mother and son in profile / from behind).
// 0 rev: she rummages the red pile, lifts the cherry gilet.  1 kis: gilet on Mohammed, buttoned to the neck, she steps back, he turns
// right then left, she rolls it into a ball and stuffs it into the merchant's hands.  2-8 haggling (merchant kis, Zoubida rev).
// 9 kis W: she turns her back, takes him by the wrist, drags him off.  10 rev: they come toward the camera.  11 kis: merchant calls them
// back, gilet held up.  12 rev CU: she unties the knotted rag.  13 kis: coins, parcel, she drags him off (exit).
// Cal: kissaria horizon 617 (seed 432), kissaria_rev 560 (seed 454): overridden here, same as the other kissaria scenes.
import * as THREE from 'three';
import * as K from '../../../engine/core.js';
import * as PO from '../../../engine/poses.js';
import * as IK from '../../../engine/ik.js';
import { rest, idlePose } from '../../../engine/rig3d.js';
import { travel } from '../../../engine/clips.js';
import * as PR from '../../../engine/props3d.js';
import { make, ac } from './_pt.js';
import { shot, all, breathe, V, role, CAL } from './_3d.js';
const { clamp, ease, key } = K;
const sm = (a, b, x) => ease((x - a) / (b - a));
const yawD = d => Math.atan2(d.x, d.z);
const dirW = (a, x, y, z) => V(x, y, z).normalize().applyAxisAngle(V(0, 1, 0), a.group.rotation.y);
const toYaw = (a, to) => Math.atan2(to.x - a.group.position.x, to.z - a.group.position.z);
CAL.kissaria = { ...CAL.kissaria, h: 1.1, horizon: 617, fov: 45 };
CAL.kissaria_rev = { ...CAL.kissaria_rev, h: 1.1, horizon: 560, fov: 45 };

const SC = (await (await fetch(new URL('../timing.json', import.meta.url))).json()).find(s => s.id === 's15_gilet');
const L = SC.lines.map(l => [l.start - SC.start, l.start - SC.start + l.dur]);
const T_BUTTON = L[1][0] + 4.6, T_BACK = L[1][0] + 8.6, T_RIGHT = L[1][0] + 9.8, T_LEFT = L[1][0] + 11.2, T_BALL = L[1][0] + 12.6, T_GIVE = L[1][0] + 14.0;
const T_TURN = L[9][0] + .3, T_REVWALK = L[10][0], T_CALL = L[11][0], T_PAY = L[13][0] + .8, T_PARCEL = L[13][0] + 4.0, T_EXIT = L[13][0] + 4.6;

const gold = PR.toon(0xd4a52a), red = PR.toon(0xb3142c, { side: THREE.DoubleSide });
/** cherry gilet #b3142c with gold braid, three looks (gl.look): worn = open elliptical tube (shoulder to waist, 30 cm, buttons down the front +z),
 *  flat = vest laid open and hanging from its shoulders (origin = mid shoulder line, 40 cm wide, 50 cm long, gold hem/neck/front braid),
 *  ball = folded bundle ~28 cm. One size in all three: gl.scale stays 1 except the worn fit. */
function gilet() {
  const g = new THREE.Group(), worn = new THREE.Group(), flat = new THREE.Group(), bun = new THREE.Group();
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(.15, .16, .3, 28, 1, true), red); tube.scale.z = .66; worn.add(tube);
  for (const y of [-.15, .15]) { const r = new THREE.Mesh(new THREE.TorusGeometry(.155, .008, 6, 28).rotateX(Math.PI / 2).translate(0, y, 0), gold); r.scale.z = .66; worn.add(r); }
  for (let i = 0; i < 7; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(.012, 8, 6), gold); b.position.set(0, .12 - i * .04, .105); worn.add(b); }
  for (const x of [-.045, .045]) worn.add(new THREE.Mesh(new THREE.BoxGeometry(.012, .27, .006).translate(x, 0, .102), gold));
  const sh = new THREE.Shape(); [[-.07, 0], [-.2, 0], [-.22, -.05], [-.15, -.16], [-.17, -.5], [.17, -.5], [.15, -.16], [.22, -.05], [.2, 0], [.07, 0], [0, -.11]].forEach(([x, y], i) => (i ? sh.lineTo(x, y) : sh.moveTo(x, y)));
  const front = new THREE.Mesh(new THREE.ShapeGeometry(sh), red), back = new THREE.Mesh(new THREE.ShapeGeometry(sh), PR.toon(0x8a1022, { side: THREE.DoubleSide })); back.position.z = -.012; flat.add(back, front);
  const bar = (w, h, x, y, rz = 0) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, .004), gold); m.position.set(x, y, .004); m.rotation.z = rz; flat.add(m); };
  bar(.34, .022, 0, -.49); bar(.012, .39, -.012, -.305); bar(.012, .39, .012, -.305); bar(.1, .012, -.035, -.055, .9); bar(.1, .012, .035, -.055, -.9);
  for (let i = 0; i < 6; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(.011, 8, 6), gold); b.position.set(-.04, -.15 - i * .06, .008); flat.add(b); }
  const lump = new THREE.Mesh(new THREE.SphereGeometry(.14, 14, 10), red); lump.scale.set(1, .8, .85); bun.add(lump);
  const band = new THREE.Mesh(new THREE.TorusGeometry(.12, .008, 6, 20), gold); band.scale.set(1, 1, .8); band.position.y = .02; band.rotation.x = Math.PI / 2; bun.add(band);
  g.add(worn, flat, bun); g.userData = { worn, flat, bun };
  g.traverse(o => { if (o.isMesh) o.castShadow = true; }); return g;
}
const look = (g, k) => { for (const n of ['worn', 'flat', 'bun']) g.userData[n].visible = n === k; };
/** a rag knotted many times: dark cloth ball, four knots */
function rag() {
  const g = new THREE.Group(), m = PR.toon(0x2a2a3a);
  g.add(new THREE.Mesh(new THREE.SphereGeometry(.04, 12, 8), m));
  for (const [x, y, z] of [[.05, .03, 0], [-.045, .04, .02], [0, .06, -.03], [.02, -.05, .04]]) { const k = new THREE.Mesh(new THREE.SphereGeometry(.016, 8, 6), m); k.position.set(x * .75, y * .75, z * .75); g.add(k); }
  g.traverse(o => { if (o.isMesh) o.castShadow = true; }); return g;
}
function coins() {
  const g = new THREE.Group();
  for (let i = 0; i < 5; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(.02, .02, .004, 16), PR.toon(0xd9b04a)); c.position.set((i - 2) * .03, 0, (i % 2) * .018 - .009); c.rotation.set(Math.PI / 2 + (i - 2) * .15, 0, i * .5); g.add(c); }
  return g;
}
function parcel() { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.BoxGeometry(.3, .07, .22), PR.toon(0xc8a878)), new THREE.Mesh(new THREE.BoxGeometry(.012, .075, .222), PR.toon(0x6a4a2a))); g.traverse(o => { if (o.isMesh) o.castShadow = true; }); return g; }

const LIGHT = { key: 0xffe4c0, keyI: 1.5, dir: [-2, 3, 1.5], sky: 0xd8d0c8, ground: 0x8a6a48, fillI: 1.6, rim: 0xffe0a0, rimI: .5, rimDir: [2, 2, -3], shadow: .3 };
const palm = (a, s) => PO.handPts(a, s).palm;
const stand = (a, t, seed) => { rest(a.B); idlePose(a.B, t + seed, 1); };
const put = (a, p, y) => { a.group.position.set(p.x, a.group.position.y, p.z); a.group.rotation.y = y; a.group.updateMatrixWorld(true); };
const hand = (a, s, p, k = 1, grip = .03) => PO.reach(a, s, IK.wpos(a.B['hand' + s]).lerp(p, k), { grip });
/** which hand of `a` is on the side of `p` */
const sideOf = (a, p) => (p.clone().sub(a.group.position).dot(dirW(a, 1, 0, 0)) > 0 ? 'L' : 'R');
const held = (g, p, yaw) => { g.position.copy(p); g.rotation.set(0, yaw, 0); g.scale.setScalar(1); g.updateMatrixWorld(true); };
const clothAt = (g, k, p, yaw, sx = 1, tilt = 0) => { look(g, k); g.position.copy(p); g.rotation.set(0, yaw, tilt); g.scale.set(sx, 1, 1); g.updateMatrixWorld(true); };
/** the flat gilet hung from both palms (its shoulder corners): width follows the hands */
const hold2 = (g, a, yaw, dy = 0) => { const r = palm(a, 'R'), l = palm(a, 'L'); clothAt(g, 'flat', r.clone().lerp(l, .5).add(V(0, dy, 0)), yaw, clamp(r.distanceTo(l) / .4, .5, 1.4), Math.atan2(l.y - r.y, r.distanceTo(l)) * .5); };
const wear = (g, a) => { clothAt(g, 'worn', IK.wpos(a.B.chest).add(V(0, -.14, 0)), a.group.rotation.y, 1); g.scale.set(1, .85, 1.2); };
const ball = (g, p) => { clothAt(g, 'bun', p, .7); g.rotation.set(.3, .7, .1); g.updateMatrixWorld(true); };

// ---------------------------------------------------------------- rev: the street side (kissaria_rev)
const rev = shot({
  plate: 'kissaria_rev', light: LIGHT,
  async build(S3) {
    const F = (x, y, h = 0) => S3.floorAt(x, y, h), cam = S3.cam.position.clone().setY(0);
    const zo = await role('zoubida', { costume: 'haik' }), mo = await role('mohammed');
    const Z0 = F(735, 838), toCam = cam.clone().sub(Z0).normalize(), right = V(-toCam.z, 0, toCam.x), M0 = Z0.clone().addScaledVector(right, .6);
    // `right` here is screen-right for a camera looking along -toCam; check: Mohammed must land right of Zoubida on screen
    if (S3.project(M0)[0] < S3.project(Z0)[0]) M0.copy(Z0).addScaledVector(right, -.6);
    const W1 = Z0.clone().addScaledVector(toCam, 1.3), M1 = M0.clone().addScaledVector(toCam, 1.3);
    S3.add(zo, Z0.x, Z0.z, yawD(toCam)); S3.add(mo, M0.x, M0.z, yawD(toCam));
    const ma = await role('marchand'), fw = Z0.clone().sub(cam).setY(0).normalize(), rt = V(-fw.z, 0, fw.x), MA = cam.clone().addScaledVector(fw, 2.1).addScaledVector(rt, 1.1);   // over-the-shoulder: the merchant's back, right foreground
    S3.add(ma, MA.x, MA.z, yawD(fw));
    const gl = S3.prop(gilet()), rg = S3.prop(rag());
    return { actors: [zo, mo, ma], zo, mo, ma, Z0, M0, W1, M1, cam, toCam, gl, rg, faces: [[zo, 'zoubida', 1], [mo, null, 2]] };
  },
  cover: [{ t: L[0][0], size: 'M', on: 'zoubida' }, { t: L[0][0] + 8, size: 'CU', on: 'zoubida' }, { t: L[3][0], size: 'CU', on: 'zoubida' }, { t: L[5][0], size: 'W' },
    { t: L[7][0], size: 'M', on: 'zoubida' }, { t: L[10][0], size: 'W' }, { t: L[12][0], size: 'CU', on: 'zoubida' }],
  frame(lt, u, t, S, st) {
    const { zo, mo, ma, Z0, M0, W1, M1, cam, toCam, gl, rg } = st, camY = yawD(toCam);
    gl.visible = rg.visible = false; stand(zo, t, 0); stand(mo, t, 1); stand(ma, t, 2); PO.look(ma, IK.wpos(zo.B.head), .5);
    put(zo, Z0, camY + .15); put(mo, M0, camY - .1);
    if (t >= T_REVWALK && t < L[11][0]) {   // line 10: she walks off, hauling him by the wrist, toward the camera, talking
      travel(zo, [[Z0.x, Z0.z], [W1.x, W1.z]], t, { t0: T_REVWALK, speed: 1.1 }); travel(mo, [[M0.x, M0.z], [M1.x, M1.z]], t, { t0: T_REVWALK, speed: 1.1 });
      const s = sideOf(zo, mo.group.position), ms = sideOf(mo, zo.group.position);
      PO.reach(zo, s, IK.wpos(mo.B['hand' + ms]).add(V(0, .02, 0)), { grip: .02 });
      PO.look(zo, cam.clone().setY(1.5), .5);
    } else if (t >= L[10][1] + 1.5 && t < L[11][0]) { /* between lines: keep walking pose off */ }
    const ch = IK.wpos(zo.B.chest), f = dirW(zo, 0, 0, 1);
    if (t < L[1][0]) {   // 0: rummages in the pile (forward and down), then lifts the cherry gilet, looking it over
      const dig = 1 - sm(8, 9, t), lift = sm(8.6, 10.4, t), p = ch.clone().addScaledVector(f, .35).add(V(0, -.3 + .05 * Math.sin(t * 3), 0));
      hand(zo, 'R', p, dig); hand(zo, 'L', ch.clone().addScaledVector(f, .3).addScaledVector(dirW(zo, 1, 0, 0), .12).add(V(0, -.28 + .04 * Math.sin(t * 3 + 1), 0)), dig * .8);
      if (t > 8.6) {
        const g = ch.clone().addScaledVector(f, .3).add(V(0, .02, 0)).lerp(ch.clone().addScaledVector(f, .3).add(V(0, .12, 0)), 0);
        PO.reach(zo, 'R', ch.clone().addScaledVector(f, .3).addScaledVector(dirW(zo, 1, 0, 0), -.16).add(V(0, .1 * lift, 0)), { grip: .03 });
        PO.reach(zo, 'L', ch.clone().addScaledVector(f, .3).addScaledVector(dirW(zo, 1, 0, 0), .16).add(V(0, .1 * lift, 0)), { grip: .03 });
        gl.visible = true; hold2(gl, zo, zo.group.rotation.y);
      }
      PO.look(zo, t < 9 ? ch.clone().addScaledVector(f, .5).add(V(0, -.3, 0)) : IK.wpos(zo.B.head).addScaledVector(f, 1).add(V(0, -.1, 0)), .6);
      PO.look(mo, IK.wpos(zo.B.head), .6);
    } else if (t >= L[12][0] && t < L[13][0]) {   // 12: unties the knotted rag, close on her face, hands busy at chest height
      const w = sm(L[12][0], L[12][0] + .8, t), mid = ch.clone().addScaledVector(f, .3).add(V(0, -.12, 0)), j = Math.sin(t * 7) * .02;
      PO.reach(zo, 'R', IK.wpos(zo.B.handR).lerp(mid.clone().add(V(-.05 + j, j, 0)), w), { grip: .02 }); PO.reach(zo, 'L', IK.wpos(zo.B.handL).lerp(mid.clone().add(V(.05 - j, -j, 0)), w), { grip: .02 });
      rg.visible = true; rg.position.copy(palm(zo, 'R').lerp(palm(zo, 'L'), .5)).addScaledVector(f, .05).add(V(0, .03, 0)); rg.rotation.set(t * 2, t, 0); rg.updateMatrixWorld(true);
      PO.look(zo, rg.position, .7); PO.look(mo, rg.position, .5);
    } else if (t >= L[7][0] && t < L[8][0]) {   // 7: plea, hand on the boy's shoulder
      const k = sm(L[7][0] + .3, L[7][0] + 1, t), sh = IK.wpos(mo.B[sideOf(mo, zo.group.position) === 'L' ? 'upperArmL' : 'upperArmR']).add(V(0, .05, 0));
      hand(zo, sideOf(zo, mo.group.position), sh, k, .02); PO.look(zo, cam.clone().setY(1.5), .4); PO.look(mo, IK.wpos(zo.B.head), .4);
    } else if (t < T_REVWALK || t >= L[11][0]) PO.look(zo, cam.clone().setY(1.6), .35);
    breathe(zo, t, 1, 1); breathe(mo, t, 1, 2); breathe(ma, t, 1, 3);
  },
});

// ---------------------------------------------------------------- kis: the stall side (kissaria)
const PLAT = .72;   // counter top under the merchant, measured on the plate: pixel y 745 at his depth (4.2 m) = 1.1 - 128 * 4.2 / 1424
const kis = shot({
  plate: 'kissaria', light: LIGHT,
  async build(S3) {
    const F = (x, y, h = 0) => S3.floorAt(x, y, h), cam = S3.cam.position.clone().setY(0);
    const zo = await role('zoubida', { costume: 'haik' }), mo = await role('mohammed'), ma = await role('marchand');
    const mw = F(1470, 745, PLAT), Z0 = F(1260, 1030), M0 = F(1030, 1030), fwd = mw.clone().sub(cam).setY(0).normalize(), away = V(-1, 0, .12).normalize();
    S3.add(zo, Z0.x, Z0.z, yawD(fwd)); S3.add(mo, M0.x, M0.z, yawD(fwd)); S3.add(ma, mw.x, mw.z, yawD(cam.clone().sub(mw)));
    rest(ma.B); ma.group.updateMatrixWorld(true); ma.group.position.y += PLAT - Math.min(PO.lowestOf(ma, ['footL']), PO.lowestOf(ma, ['footR'])); ma.group.updateMatrixWorld(true);
    mw.y = ma.group.position.y;
    const gl = S3.prop(gilet()), pc = S3.prop(parcel()), cn = S3.prop(coins());
    const P = IK.wpos(zo.B.chest).addScaledVector(dirW(zo, 0, 0, 1), .4).add(V(0, .3, 0));   // where the coins and the parcel change hands (view target of the pay close-up)
    return { actors: [zo, mo, ma], zo, mo, ma, mw, Z0, M0, fwd, away, cam, gl, pc, cn, P, faces: [[zo, null, 1], [mo, null, 2], [ma, 'marchand', 3]] };
  },
  cover: [{ t: L[1][0], size: 'W' }, { t: T_BUTTON, size: 'M', on: 'mohammed', dx: -30 }, { t: T_BACK, size: 'W' }, { t: T_RIGHT - .2, size: 'M', on: 'mohammed', dx: -30 }, { t: T_BALL, size: 'W' },
    { t: L[2][0], size: 'CU', on: 'marchand' }, { t: L[4][0], size: 'M', on: 'marchand' }, { t: L[6][0], size: 'CU', on: 'marchand' }, { t: L[8][0], size: 'M', on: 'marchand' }, { t: L[9][0], size: 'W' },
    { t: L[11][0], size: 'M', on: 'marchand' }, { t: L[11][0] + 5, size: 'CU', on: 'marchand', dy: 120 }, { t: L[11][0] + 9, size: 'W' }, { t: L[13][0], size: 'M', on: 'marchand' }, { t: T_PAY - .6, size: 'CU', on: 'marchand', dy: 190 }, { t: T_PARCEL, size: 'W' }],
  frame(lt, u, t, S, st) {
    const { zo, mo, ma, mw, Z0, M0, fwd, away, cam, gl, pc, cn, P } = st;
    gl.visible = pc.visible = cn.visible = false; for (const a of [zo, mo, ma]) stand(a, t, a === mo ? 1 : a === ma ? 2 : 0);
    const faceS = yawD(fwd), faceC = faceS + Math.PI, faceA = yawD(away), faceG = (yawD(mw.clone().sub(Z0)) + faceS) / 2, faceZM = (yawD(M0.clone().sub(Z0)) + faceC) / 2 + .15;
    // ---- positions and facing, by phase
    let zP = Z0.clone(), zY = faceS, mP = M0.clone(), mY = faceS, walking = false;
    if (t < L[2][0]) {   // she stands at his side (screen right), 3/4 to him; he faces the camera
      zY = key(t, [[L[1][0], faceZM], [T_BALL, faceZM], [T_GIVE - .5, faceG]]);
      zP = Z0.clone().addScaledVector(V(1, 0, 0), key(t, [[T_BACK - .5, 0], [T_BACK + .4, .4], [T_BALL - .8, .4], [T_BALL - .2, 0]]));
      mY = key(t, [[T_RIGHT - .3, faceC], [T_RIGHT + .5, faceC - .9], [T_LEFT - .1, faceC - .9], [T_LEFT + .7, faceC + .9], [T_BALL - .3, faceC + .9], [T_BALL + .3, faceC]]);
    } else if (t >= T_TURN) { walking = true; zY = key(t, [[T_TURN, faceS], [T_TURN + .5, faceA]]); }
    else mY = faceC;
    const mer = IK.wpos(ma.B.chest), mf = dirW(ma, 0, 0, 1), ms = dirW(ma, 1, 0, 0), mh = IK.wpos(ma.B.head);
    put(ma, mw, toYaw({ group: { position: mw } }, cam));
    if (!walking) { put(zo, zP, zY); put(mo, mP, mY); }
    const zc = IK.wpos(zo.B.chest), zf = dirW(zo, 0, 0, 1), zs = dirW(zo, 1, 0, 0);
    // ---- 1: gilet shown flat, buttoned on him to the neck, she steps back, he turns right / left, she pulls it off, rolls it into a ball and hands it up
    if (t >= L[1][0] && t < L[2][0]) {
      gl.visible = true;
      if (t < T_BUTTON) {   // both hands hold the flat gilet up against him
        PO.reach(zo, 'R', zc.clone().addScaledVector(zf, .28).addScaledVector(zs, -.16).add(V(0, -.05, 0)), { grip: .03 }); PO.reach(zo, 'L', zc.clone().addScaledVector(zf, .28).addScaledVector(zs, .16).add(V(0, -.05, 0)), { grip: .03 });
        hold2(gl, zo, yawD(fwd) + Math.PI + .3); PO.look(zo, IK.wpos(mo.B.head), .5);
      } else if (t < T_BALL - .5) {
        wear(gl, mo);
        if (t < T_BACK) {   // both hands busy on the buttons, up to his neck (she reaches from his side, elbows bent)
          const mc = IK.wpos(mo.B.chest), up = key(t, [[T_BUTTON, -.12], [T_BACK - .4, .12]]), j = Math.sin(t * 9) * .012, mfd = dirW(mo, 0, 0, 1), msd = dirW(mo, 1, 0, 0);
          PO.reach(zo, 'R', mc.clone().addScaledVector(mfd, .14).add(V(j, up, 0)).addScaledVector(msd, -.03), { grip: .02 });
          PO.reach(zo, 'L', mc.clone().addScaledVector(mfd, .14).add(V(-j, up - .05, 0)).addScaledVector(msd, .05), { grip: .02 });
          PO.look(zo, mc, .5);
        } else if (t < T_LEFT + .7) { PO.look(zo, IK.wpos(mo.B.head), .5); hand(zo, 'R', zc.clone().addScaledVector(zf, .2).add(V(0, .12, 0)).addScaledVector(zs, -.15), .8); }   // hand to chin: judging
        else { const mc = IK.wpos(mo.B.chest); PO.look(zo, mc, .5); PO.reach(zo, 'R', mc.clone().addScaledVector(dirW(mo, 0, 0, 1), .14).add(V(0, .02, 0)), { grip: .02 }); PO.reach(zo, 'L', mc.clone().addScaledVector(dirW(mo, 0, 0, 1), .14).add(V(0, -.04, 0)).addScaledVector(dirW(mo, 1, 0, 0), .06), { grip: .02 }); }
      } else if (t < T_GIVE) {   // pulled off and rolled into a ball between her hands
        const r = Math.sin(t * 12) * .02, c = zc.clone().addScaledVector(zf, .28).add(V(0, -.1, 0)), k = sm(T_BALL - .5, T_BALL, t);
        PO.reach(zo, 'R', c.clone().add(V(-.07 + r, 0, 0)), { grip: .02 }); PO.reach(zo, 'L', c.clone().add(V(.07 - r, r, 0)), { grip: .02 });
        const to = palm(zo, 'R').lerp(palm(zo, 'L'), .5).add(V(0, .03, 0));
        if (k < .5) { wear(gl, mo); gl.position.lerp(to, k); } else ball(gl, IK.wpos(mo.B.chest).add(V(0, -.1, 0)).lerp(to, k));
        PO.look(zo, mh, .3);
      } else {   // handed up to the merchant, who leans over the counter
        const k = sm(T_GIVE, T_GIVE + .4, t);
        PO.reach(zo, 'R', P.clone().addScaledVector(zs, -.06), { grip: .02 }); PO.reach(zo, 'L', P.clone().addScaledVector(zs, .06), { grip: .02 });
        ma.B.spine.rotation.x += .3 * k; PO.reach(ma, 'R', P.clone().addScaledVector(ms, -.05), { grip: .02 }); PO.reach(ma, 'L', P.clone().addScaledVector(ms, .05), { grip: .02 });
        ball(gl, P);
      }
      if (t >= T_LEFT + .7) PO.look(mo, cam.clone().setY(1), .4); else if (t >= L[1][0]) PO.look(mo, t < T_RIGHT ? cam.clone().setY(1) : IK.wpos(mo.B.head).addScaledVector(dirW(mo, 0, 0, 1), 1), .5);
    }
    // ---- 2..8, 11: the merchant works the gilet; he holds it all the way (visible only on his lines)
    const own = t >= L[2][0] && t < T_PAY - 1;
    if (own) {
      gl.visible = true; const fold = t < L[4][0], hold = t >= L[11][0];
      let c = mer.clone().addScaledVector(mf, .34).add(V(0, -.1, 0));
      if (t >= L[6][0] && t < L[7][0]) {   // hand on heart, theatrical oath
        hand(ma, 'R', mer.clone().addScaledVector(mf, .12).addScaledVector(ms, -.08).add(V(0, .06, 0)), 1, .02); hand(ma, 'L', c.clone().addScaledVector(ms, .2).add(V(0, -.1, 0)), 1);
        clothAt(gl, 'flat', palm(ma, 'L').addScaledVector(ms, -.12).add(V(0, .02, 0)), ma.group.rotation.y, .8, .12); ma.B.head.rotation.z += .08 * Math.sin(t * 3);
      } else if (t >= L[8][0] && t < L[9][0]) {   // holds out his hand to the boy, smiling
        hand(ma, 'R', mer.clone().addScaledVector(mf, .3).addScaledVector(ms, -.12).add(V(0, -.2, 0)), sm(L[8][0], L[8][0] + .6, t), .02); hand(ma, 'L', c.clone().addScaledVector(ms, .22).add(V(0, -.18, 0)), 1);
        clothAt(gl, 'flat', palm(ma, 'L').addScaledVector(ms, -.12).add(V(0, .02, 0)), ma.group.rotation.y, .8, .12);
      } else if (hold) {   // calls them back: open palms at chest height, gilet shown by its shoulders, seams and buttons to the camera
        const sw = Math.sin(t * 2) * .03;
        c = mer.clone().addScaledVector(mf, .36).add(V(0, -.2, 0));
        PO.reach(ma, 'R', c.clone().addScaledVector(ms, -.19).add(V(sw, 0, 0)), { grip: .02 }); PO.reach(ma, 'L', c.clone().addScaledVector(ms, .19).add(V(sw, 0, 0)), { grip: .02 });
        { const d = palm(ma, 'L').sub(palm(ma, 'R')); hold2(gl, ma, Math.atan2(-d.z, d.x)); }
      } else {   // folding / offering it
        const wv = Math.sin(t * 2.2) * .03;
        PO.reach(ma, 'R', c.clone().addScaledVector(ms, -.15).add(V(0, wv, 0)), { grip: .02 }); PO.reach(ma, 'L', c.clone().addScaledVector(ms, .15).add(V(0, -wv, 0)), { grip: .02 });
        if (fold && t < L[2][0] + 1.7) ball(gl, palm(ma, 'R').lerp(palm(ma, 'L'), .5).add(V(0, .08, 0))); else hold2(gl, ma, ma.group.rotation.y);
      }
      PO.look(ma, t >= L[8][0] && t < L[9][0] ? IK.wpos(mo.B.head) : cam.clone().add(V(0, 1.4, 0)), .5);
      PO.look(zo, mh, .5); PO.look(mo, mh.clone().add(V(0, .1 * Math.sin(t), 0)), .5);
    }
    // ---- 9: she turns her back, takes him by the wrist, drags him off to the left
    if (walking && t < T_PAY - 1) {
      const p0 = Z0.clone(), p1 = Z0.clone().addScaledVector(away, 4.2), sp = 1.25;
      if (t < T_TURN + .5) { put(zo, Z0, zY); put(mo, M0, faceS); }
      else {
        travel(zo, [[p0.x, p0.z], [p1.x, p1.z]], t, { t0: T_TURN + .5, speed: sp });
        travel(mo, [[M0.x, M0.z], [M0.x + (p1.x - p0.x), M0.z + (p1.z - p0.z)]], t, { t0: T_TURN + .5, speed: sp });
        const s = sideOf(zo, mo.group.position), ms2 = sideOf(mo, zo.group.position);
        PO.reach(zo, s, IK.wpos(mo.B['hand' + ms2]).add(V(0, .02, 0)), { grip: .02 });
      }
      if (t < L[9][1]) { gl.visible = true; PO.reach(ma, 'R', mer.clone().addScaledVector(mf, .34).addScaledVector(ms, -.15).add(V(0, -.1, 0)), { grip: .02 }); PO.reach(ma, 'L', mer.clone().addScaledVector(mf, .34).addScaledVector(ms, .15).add(V(0, -.1, 0)), { grip: .02 }); hold2(gl, ma, ma.group.rotation.y); }
      else if (t < L[11][0]) gl.visible = false;
    }
    // ---- 13: coins up to his palm, the parcel back, she takes it and hauls the boy off with it
    if (t >= L[13][0] - 1 && t >= T_PAY - 1) {   // 11-12 are on the other camera; here from line 13
      put(zo, Z0, faceS); put(mo, M0, faceS); stand(zo, t, 0); stand(mo, t, 1);
      const give = sm(T_PAY - 1, T_PAY, t), pass = sm(T_PAY + .2, T_PAY + 1.2, t), take = sm(T_PAY + 2, T_PAY + 3, t), lean = .3 * Math.min(give, 1 - sm(T_PAY + 3, T_PAY + 3.6, t));
      const counter = mw.clone().addScaledVector(mf, .3).add(V(0, .05, 0));
      if (t < T_PARCEL) {
        const mH = P.clone().addScaledVector(ms, -.05), up = sm(T_PAY + 1.5, T_PAY + 2.2, t), pcT = counter.clone().lerp(P.clone().addScaledVector(ms, .08), up);
        hand(zo, 'R', P, give, .02); hand(zo, 'L', P.clone().addScaledVector(zs, -.12).add(V(0, -.05, 0)), take, .03);
        ma.B.spine.rotation.x += lean; PO.reach(ma, 'R', mH, { grip: .02 }); PO.reach(ma, 'L', pcT.clone().addScaledVector(ms, .1), { grip: .02 });
        cn.visible = t < T_PAY + 1.7; cn.position.copy(palm(zo, 'R').lerp(palm(ma, 'R'), pass)).add(V(0, .01, 0)); cn.updateMatrixWorld(true);
        // the parcel lies on the counter, he lifts it to the same spot, she takes it from him
        pc.visible = true; held(pc, palm(ma, 'L').add(V(0, .03, 0)).lerp(palm(zo, 'L').add(V(0, .03, 0)), take), ma.group.rotation.y);
        PO.look(zo, mh, .5); PO.look(mo, mh, .4);
      } else {
        const p0 = Z0.clone(), p1 = Z0.clone().addScaledVector(away, 5);
        put(zo, Z0, faceS); travel(zo, [[p0.x, p0.z], [p1.x, p1.z]], t, { t0: T_EXIT, speed: 1.4, exit: true }); travel(mo, [[M0.x, M0.z], [M0.x + (p1.x - p0.x), M0.z + (p1.z - p0.z)]], t, { t0: T_EXIT, speed: 1.4, exit: true });
        pc.visible = true; const s = sideOf(zo, mo.group.position), ms2 = sideOf(mo, zo.group.position);
        PO.reach(zo, s, IK.wpos(mo.B['hand' + ms2]).add(V(0, .02, 0)), { grip: .02 });
        const o = s === 'L' ? 'R' : 'L'; PO.reach(zo, o, zc.clone().addScaledVector(zf, .15).add(V(0, -.3, 0)), { grip: .03 }); held(pc, palm(zo, o).add(V(0, -.04, 0)), zo.group.rotation.y);
        pc.visible = zo.group.visible;
      }
    }
    breathe(zo, t, 1, 1); breathe(mo, t, 1, 2); breathe(ma, t, 1, 3);
  },
});

export { rev, kis };
// line-by-line cut between the two cameras; 9 stays on kis (W) through the drag
export default make({
  preload: all(rev, kis), plate: 'ep06/kissaria',
  segs: [ac([0, 0], rev.fn), ac([1, 0], kis.fn), ac([3, 0], rev.fn), ac([4, 0], kis.fn), ac([5, 0], rev.fn), ac([6, 0], kis.fn), ac([7, 0], rev.fn), ac([8, 0], kis.fn),
    ac([10, 0], rev.fn), ac([11, 0], kis.fn), ac([12, 0], rev.fn), ac([13, 0], kis.fn)],
});
