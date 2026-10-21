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
/** cherry gilet #b3142c with gold braid: an open elliptical tube (shoulder to waist, 30 cm), buttons down the front (+z), braid at hem and neck. */
function gilet() {
  const g = new THREE.Group(), tube = new THREE.Mesh(new THREE.CylinderGeometry(.15, .16, .3, 28, 1, true), red); tube.scale.z = .66; g.add(tube);
  for (const y of [-.15, .15]) { const r = new THREE.Mesh(new THREE.TorusGeometry(.155, .008, 6, 28).rotateX(Math.PI / 2).translate(0, y, 0), gold); r.scale.z = .66; g.add(r); }
  for (let i = 0; i < 7; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(.012, 8, 6), gold); b.position.set(0, .12 - i * .04, .105); g.add(b); }
  for (const x of [-.045, .045]) g.add(new THREE.Mesh(new THREE.BoxGeometry(.012, .27, .006).translate(x, 0, .102), gold));
  g.traverse(o => { if (o.isMesh) o.castShadow = true; }); return g;
}
/** a rag knotted many times: dark cloth ball, four knots */
function rag() {
  const g = new THREE.Group(), m = PR.toon(0x2a2a3a);
  g.add(new THREE.Mesh(new THREE.SphereGeometry(.055, 12, 8), m));
  for (const [x, y, z] of [[.05, .03, 0], [-.045, .04, .02], [0, .06, -.03], [.02, -.05, .04]]) { const k = new THREE.Mesh(new THREE.SphereGeometry(.022, 8, 6), m); k.position.set(x, y, z); g.add(k); }
  g.traverse(o => { if (o.isMesh) o.castShadow = true; }); return g;
}
function coins() {
  const g = new THREE.Group();
  for (let i = 0; i < 3; i++) g.add(new THREE.Mesh(new THREE.CylinderGeometry(.016, .016, .003, 12).translate(i * .006, i * .004, 0), PR.toon(0xc8c8c0)));
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
const wear = (gl, a) => { gl.position.copy(IK.wpos(a.B.chest)).add(V(0, -.1, 0)); gl.rotation.set(0, a.group.rotation.y, 0); gl.scale.set(.82, 1, .9); gl.updateMatrixWorld(true); };
const held = (g, p, yaw, s = .8) => { g.position.copy(p); g.rotation.set(0, yaw, 0); g.scale.setScalar(s); g.updateMatrixWorld(true); };
const ball = (g, p) => { g.position.copy(p); g.rotation.set(.4, .7, .2); g.scale.set(.36, .26, .36); g.updateMatrixWorld(true); };

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
    const gl = S3.prop(gilet()), rg = S3.prop(rag());
    return { actors: [zo, mo], zo, mo, Z0, M0, W1, M1, cam, toCam, gl, rg, faces: [[zo, 'zoubida', 1], [mo, null, 2]] };
  },
  cover: [{ t: L[0][0], size: 'M', on: 'zoubida' }, { t: L[0][0] + 8, size: 'CU', on: 'zoubida' }, { t: L[3][0], size: 'CU', on: 'zoubida' }, { t: L[5][0], size: 'M', on: 'zoubida' },
    { t: L[7][0], size: 'M', on: 'zoubida' }, { t: L[10][0], size: 'M', on: 'zoubida', dy: -40 }, { t: L[12][0], size: 'CU', on: 'zoubida' }],
  frame(lt, u, t, S, st) {
    const { zo, mo, Z0, M0, W1, M1, cam, toCam, gl, rg } = st, camY = yawD(toCam);
    gl.visible = rg.visible = false; stand(zo, t, 0); stand(mo, t, 1);
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
        gl.visible = true; held(gl, palm(zo, 'R').lerp(palm(zo, 'L'), .5).add(V(0, -.1, 0)), zo.group.rotation.y, 1);
      }
      PO.look(zo, t < 9 ? ch.clone().addScaledVector(f, .5).add(V(0, -.3, 0)) : IK.wpos(zo.B.head).addScaledVector(f, 1).add(V(0, -.1, 0)), .6);
      PO.look(mo, IK.wpos(zo.B.head), .6);
    } else if (t >= L[12][0] && t < L[13][0]) {   // 12: unties the knotted rag, close on her face, hands busy at chest height
      const w = sm(L[12][0], L[12][0] + .8, t), mid = ch.clone().addScaledVector(f, .3).add(V(0, -.12, 0)), j = Math.sin(t * 7) * .02;
      PO.reach(zo, 'R', IK.wpos(zo.B.handR).lerp(mid.clone().add(V(-.05 + j, j, 0)), w), { grip: .02 }); PO.reach(zo, 'L', IK.wpos(zo.B.handL).lerp(mid.clone().add(V(.05 - j, -j, 0)), w), { grip: .02 });
      rg.visible = true; rg.position.copy(palm(zo, 'R').lerp(palm(zo, 'L'), .5)); rg.rotation.set(t * 2, t, 0); rg.updateMatrixWorld(true);
      PO.look(zo, rg.position, .7); PO.look(mo, rg.position, .5);
    } else if (t >= L[7][0] && t < L[8][0]) {   // 7: plea, hand on the boy's shoulder
      const k = sm(L[7][0] + .3, L[7][0] + 1, t), sh = IK.wpos(mo.B[sideOf(mo, zo.group.position) === 'L' ? 'upperArmL' : 'upperArmR']).add(V(0, .05, 0));
      hand(zo, sideOf(zo, mo.group.position), sh, k, .02); PO.look(zo, cam.clone().setY(1.5), .4); PO.look(mo, IK.wpos(zo.B.head), .4);
    } else if (t < T_REVWALK || t >= L[11][0]) PO.look(zo, cam.clone().setY(1.6), .35);
    breathe(zo, t, 1, 1); breathe(mo, t, 1, 2);
  },
});

// ---------------------------------------------------------------- kis: the stall side (kissaria)
const kis = shot({
  plate: 'kissaria', light: LIGHT,
  async build(S3) {
    const F = (x, y, h = 0) => S3.floorAt(x, y, h), cam = S3.cam.position.clone().setY(0);
    const zo = await role('zoubida', { costume: 'haik' }), mo = await role('mohammed'), ma = await role('marchand');
    const mw = F(1470, 717, .8), Z0 = F(1330, 965), fwd = mw.clone().sub(cam).setY(0).normalize(), right = V(fwd.z, 0, -fwd.x);
    const M0 = Z0.clone().addScaledVector(right, -.6);
    S3.add(zo, Z0.x, Z0.z, yawD(fwd)); S3.add(mo, M0.x, M0.z, yawD(fwd)); S3.add(ma, mw.x, mw.z, yawD(cam.clone().sub(mw))); ma.group.position.y = .8;
    const gl = S3.prop(gilet()), pc = S3.prop(parcel()), cn = S3.prop(coins());
    return { actors: [zo, mo, ma], zo, mo, ma, mw, Z0, M0, fwd, right, cam, gl, pc, cn, faces: [[zo, null, 1], [mo, null, 2], [ma, 'marchand', 3]] };
  },
  cover: [{ t: L[1][0], size: 'W' }, { t: L[1][0] + 10, size: 'W' }, { t: L[2][0], size: 'CU', on: 'marchand' },
    { t: L[4][0], size: 'M', on: 'marchand' }, { t: L[6][0], size: 'CU', on: 'marchand' }, { t: L[8][0], size: 'M', on: 'marchand' }, { t: L[9][0], size: 'W' },
    { t: L[11][0], size: 'M', on: 'marchand' }, { t: L[11][0] + 6, size: 'CU', on: 'marchand' }, { t: L[13][0], size: 'M', on: 'marchand' }, { t: L[13][0] + 3.6, size: 'W' }],
  frame(lt, u, t, S, st) {
    const { zo, mo, ma, mw, Z0, M0, fwd, right, cam, gl, pc, cn } = st;
    gl.visible = pc.visible = cn.visible = false; for (const a of [zo, mo, ma]) stand(a, t, a === mo ? 1 : a === ma ? 2 : 0);
    const toL = right.clone().negate(), faceM = yawD(toL), faceMo = yawD(right), faceS = yawD(fwd);
    // ---- positions and facing, by phase
    let zP = Z0.clone(), zY = faceS, mP = M0.clone(), mY = faceS, walking = false;
    if (t < L[2][0]) {
      zY = key(t, [[L[1][0] + 3.6, faceS], [L[1][0] + 4.3, faceM], [T_GIVE - .6, faceM], [T_GIVE, faceS]]);
      zP = Z0.clone().addScaledVector(right, key(t, [[T_BACK - .5, 0], [T_BACK + .3, .6], [T_GIVE - .8, .6], [T_GIVE - .1, 0]]));
      mY = key(t, [[L[1][0] + 3.6, faceS], [L[1][0] + 4.3, faceMo], [T_RIGHT, faceMo], [T_RIGHT + .6, faceMo + 1.1], [T_LEFT, faceMo + 1.1], [T_LEFT + .8, faceMo - 1.1], [T_BALL - .2, faceMo - 1.1], [T_BALL + .3, faceMo]]);
    } else if (t >= T_TURN) {
      walking = true; const p0 = Z0.clone(), p1 = Z0.clone().addScaledVector(toL, 4.2).addScaledVector(fwd, -.9);
      zY = key(t, [[T_TURN, faceS], [T_TURN + .5, faceM]]);
    }
    const mer = IK.wpos(ma.B.chest), mf = dirW(ma, 0, 0, 1), ms = dirW(ma, 1, 0, 0), mh = IK.wpos(ma.B.head);
    put(ma, mw, toYaw({ group: { position: mw } }, cam));
    if (!walking) { put(zo, zP, zY); put(mo, mP, mY); }
    const zc = IK.wpos(zo.B.chest), zf = dirW(zo, 0, 0, 1), zs = dirW(zo, 1, 0, 0);
    // ---- 1: djellaba off, gilet buttoned to the neck, step back, turn right/left, ball it up
    if (t >= L[1][0] && t < L[2][0]) {
      gl.visible = true;
      if (t < T_BUTTON) { PO.reach(zo, 'R', zc.clone().addScaledVector(zf, .22).add(V(0, -.25, 0)), { grip: .03 }); held(gl, palm(zo, 'R').add(V(0, -.12, 0)), zo.group.rotation.y, .8); }
      else if (t < T_BALL) {
        wear(gl, mo);
        if (t < T_BACK) {   // both hands busy on the buttons, up to his neck
          const mc = IK.wpos(mo.B.chest), up = key(t, [[T_BUTTON, -.12], [T_BACK - .4, .12]]), j = Math.sin(t * 9) * .012;
          PO.reach(zo, 'R', mc.clone().addScaledVector(dirW(mo, 0, 0, 1), .13).add(V(.0 + j, up, 0)).addScaledVector(dirW(mo, 1, 0, 0), -.03), { grip: .02 });
          PO.reach(zo, 'L', mc.clone().addScaledVector(dirW(mo, 0, 0, 1), .13).add(V(.0 - j, up - .05, 0)).addScaledVector(dirW(mo, 1, 0, 0), .04), { grip: .02 });
          PO.look(zo, mc, .6);
        } else { PO.look(zo, IK.wpos(mo.B.head), .5); hand(zo, 'R', zc.clone().addScaledVector(zf, .2).add(V(0, .12, 0)).addScaledVector(zs, -.15), .8); }   // hand to chin: judging
      } else if (t < T_GIVE) {   // rolled into a ball between her hands
        const r = Math.sin(t * 12) * .02, c = zc.clone().addScaledVector(zf, .28).add(V(0, -.1, 0));
        PO.reach(zo, 'R', c.clone().add(V(-.07 + r, 0, 0)), { grip: .02 }); PO.reach(zo, 'L', c.clone().add(V(.07 - r, r, 0)), { grip: .02 }); ball(gl, palm(zo, 'R').lerp(palm(zo, 'L'), .5).add(V(0, .03, 0)));
      } else {   // stuffed into the merchant's hands
        const k = sm(T_GIVE, T_GIVE + .4, t), P = zc.clone().addScaledVector(zf, .45).add(V(0, .05, 0));
        PO.reach(zo, 'R', P.clone().addScaledVector(zs, -.06), { grip: .02 }); PO.reach(zo, 'L', P.clone().addScaledVector(zs, .06), { grip: .02 });
        ball(gl, P); PO.reach(ma, 'R', P.clone().addScaledVector(ms, -.05), { grip: .02 }); PO.reach(ma, 'L', P.clone().addScaledVector(ms, .05), { grip: .02 });
        ma.B.spine.rotation.x += .18 * k;
      }
    }
    // ---- 2..8, 11: the merchant works the gilet; he holds it all the way (visible only on his lines)
    const own = t >= L[2][0] && t < T_PAY - 1;
    if (own) {
      gl.visible = true; const fold = t < L[4][0], hold = t >= L[11][0];
      let c = mer.clone().addScaledVector(mf, .34).add(V(0, -.05, 0));
      if (t >= L[6][0] && t < L[7][0]) {   // hand on heart, theatrical oath
        hand(ma, 'R', mer.clone().addScaledVector(mf, .12).addScaledVector(ms, -.08).add(V(0, .06, 0)), 1, .02); hand(ma, 'L', c.clone().addScaledVector(ms, .2).add(V(0, -.1, 0)), 1);
        held(gl, palm(ma, 'L').add(V(0, -.1, 0)), ma.group.rotation.y, .7); ma.B.head.rotation.z += .08 * Math.sin(t * 3);
      } else if (t >= L[8][0] && t < L[9][0]) {   // holds out his hand to the boy, smiling
        hand(ma, 'R', mer.clone().addScaledVector(mf, .4).addScaledVector(ms, .15).add(V(0, -.1, 0)), sm(L[8][0], L[8][0] + .6, t), .02); hand(ma, 'L', c.clone().addScaledVector(ms, .22).add(V(0, -.18, 0)), 1);
        held(gl, palm(ma, 'L').add(V(0, -.1, 0)), ma.group.rotation.y, .7);
      } else if (hold) {   // calls them back: seams and buttons shown, gilet held up in both hands
        const lift = sm(L[11][0] + 1, L[11][0] + 2, t), sw = Math.sin(t * 2) * .04;
        c = mer.clone().addScaledVector(mf, .38).add(V(0, .08 * lift, 0));
        PO.reach(ma, 'R', c.clone().addScaledVector(ms, -.18).add(V(sw, .12, 0)), { grip: .02 }); PO.reach(ma, 'L', c.clone().addScaledVector(ms, .18).add(V(sw, .12, 0)), { grip: .02 });
        held(gl, palm(ma, 'R').lerp(palm(ma, 'L'), .5).add(V(0, -.1, 0)), ma.group.rotation.y, 1); gl.rotation.z = sw;
      } else {   // folding / offering it
        const wv = Math.sin(t * 2.2) * .03;
        PO.reach(ma, 'R', c.clone().addScaledVector(ms, -.12).add(V(0, wv, 0)), { grip: .02 }); PO.reach(ma, 'L', c.clone().addScaledVector(ms, .12).add(V(0, -wv, 0)), { grip: .02 });
        if (fold && t < L[2][0] + 1.7) ball(gl, c); else held(gl, palm(ma, 'R').lerp(palm(ma, 'L'), .5).add(V(0, -.05, 0)), ma.group.rotation.y, .55);
      }
      PO.look(ma, t >= L[8][0] && t < L[9][0] ? IK.wpos(mo.B.head) : cam.clone().add(V(0, 1.4, 0)), .5);
      PO.look(zo, mh, .5); PO.look(mo, mh.clone().add(V(0, .1 * Math.sin(t), 0)), .5);
    }
    // ---- 9: she turns her back, takes him by the wrist, drags him off to the left
    if (walking && t < T_PAY - 1) {
      const p0 = Z0.clone(), p1 = Z0.clone().addScaledVector(toL, 4.2).addScaledVector(fwd, -.9);
      const k = clamp((t - (T_TURN + .5)) / 1), sp = 1.25;
      if (t < T_TURN + .5) { put(zo, Z0, zY); put(mo, M0, faceS); }
      else {
        travel(zo, [[p0.x, p0.z], [p1.x, p1.z]], t, { t0: T_TURN + .5, speed: sp });
        travel(mo, [[M0.x, M0.z], [M0.x + (p1.x - p0.x), M0.z + (p1.z - p0.z) - .0]], t, { t0: T_TURN + .5, speed: sp });
        const s = sideOf(zo, mo.group.position), ms2 = sideOf(mo, zo.group.position);
        PO.reach(zo, s, IK.wpos(mo.B['hand' + ms2]).add(V(0, .02, 0)), { grip: .02 });
        gl.visible = false;
      }
      if (t < L[9][1]) { gl.visible = true; held(gl, mer.clone().addScaledVector(mf, .35).add(V(0, -.1, 0)), ma.group.rotation.y, .55); PO.reach(ma, 'R', mer.clone().addScaledVector(mf, .3).addScaledVector(ms, -.1), { grip: .02 }); PO.reach(ma, 'L', mer.clone().addScaledVector(mf, .3).addScaledVector(ms, .12).add(V(0, -.05, 0)), { grip: .02 }); }   // both hands on the gilet, no A-pose arm
    }
    // ---- 13: coins into his palm, the parcel back, she grabs it and hauls the boy off
    if (t >= L[13][0] - 1 && t >= T_PAY - 1) {   // 11-12 are on the other camera; here from line 13
      const k = sm(T_PAY - 1, T_PAY, t);
      put(zo, Z0, faceS); put(mo, M0, faceS); stand(zo, t, 0); stand(mo, t, 1);
      const P = zc.clone().addScaledVector(zf, .4).add(V(0, .06, 0));
      if (t < T_PARCEL) {
        const give = sm(T_PAY - 1, T_PAY, t), take = sm(T_PAY + 1.2, T_PAY + 2, t);
        hand(zo, 'R', P, give, .02); cn.visible = t < T_PAY + 1.4; cn.position.copy(palm(zo, 'R')).add(V(0, .01, 0)); cn.updateMatrixWorld(true);
        PO.reach(ma, 'R', P.clone().addScaledVector(ms, -.04), { grip: .02 }); ma.B.spine.rotation.x += .15 * give;
        pc.visible = t > T_PAY + 1.4; held(pc, mer.clone().addScaledVector(mf, .36).add(V(0, -.18, 0)), ma.group.rotation.y, 1); PO.reach(ma, 'L', pc.position.clone().addScaledVector(ms, .1), { grip: .02 });
        if (take > 0) hand(zo, 'L', pc.position.clone().addScaledVector(ms, -.1), take, .03);
        PO.look(zo, mh, .5); PO.look(mo, mh, .4);
      }
      if (t >= T_PARCEL) {
        const p0 = Z0.clone(), p1 = Z0.clone().addScaledVector(toL, 5).addScaledVector(fwd, -.9);
        put(zo, Z0, faceS); travel(zo, [[p0.x, p0.z], [p1.x, p1.z]], t, { t0: T_EXIT, speed: 1.4, exit: true }); travel(mo, [[M0.x, M0.z], [M0.x + (p1.x - p0.x), M0.z + (p1.z - p0.z)]], t, { t0: T_EXIT, speed: 1.4, exit: true });
        pc.visible = true; const s = sideOf(zo, mo.group.position), ms2 = sideOf(mo, zo.group.position);
        PO.reach(zo, s, IK.wpos(mo.B['hand' + ms2]).add(V(0, .02, 0)), { grip: .02 });
        const o = s === 'L' ? 'R' : 'L'; PO.reach(zo, o, zc.clone().addScaledVector(zf, .15).add(V(0, -.3, 0)), { grip: .03 }); held(pc, palm(zo, o).add(V(0, -.04, 0)), zo.group.rotation.y, 1);
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
