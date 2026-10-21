// s14: three cubits of white cotton, the "Poisson" quality. 3D kissaria: the merchant on his stall measures the bolt along his arm,
// Zoubida fingers the cloth, Mohammed waits (line 0). Insert (line 1): the merchant holds the cloth up like a banner to the camera,
// a blue fish with all its scales stamped on it (3D cloth prop, canvas-printed; no fish image exists).
// Cal: kissaria horizon set to 617 (seed 432 was too high), same override as s13.
import * as THREE from 'three';
import * as K from '../../../engine/core.js';
import * as PO from '../../../engine/poses.js';
import * as IK from '../../../engine/ik.js';
import { rest, idlePose } from '../../../engine/rig3d.js';
import * as PR from '../../../engine/props3d.js';
import { make, ac } from './_pt.js';
import { shot, all, breathe, V, role, CAL } from './_3d.js';
import { inHand } from './_props.js';
const { clamp, ease } = K;
const sm = (a, b, x) => ease((x - a) / (b - a));
const yawTo = (from, to) => Math.atan2(to.x - from.x, to.z - from.z);
const dirW = (a, x, y, z) => V(x, y, z).normalize().applyAxisAngle(V(0, 1, 0), a.group.rotation.y);
CAL.kissaria = { ...CAL.kissaria, h: 1.1, horizon: 617, fov: 45 };

const SC = (await (await fetch(new URL('../timing.json', import.meta.url))).json()).find(s => s.id === 's14_poisson');
const L = SC.lines.map(l => [l.start - SC.start, l.start - SC.start + l.dur]);
const INS = L[1][0];   // the insert: cloth held up to the camera

/** white cotton bolt, 50 cm wide, centred on its origin, axis +y */
function bolt() {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(.065, .065, .5, 16), PR.toon(0xf2eee2)), new THREE.Mesh(new THREE.CylinderGeometry(.02, .02, .52, 8), PR.toon(0x9a7a48)));
  g.traverse(o => { if (o.isMesh) o.castShadow = true; }); return g;
}
/** a strip of cloth: origin at one end, runs along +z, scale.z = length (width 0.5 m) */
function strip() {
  const m = new THREE.Mesh(new THREE.BoxGeometry(.5, .004, 1).translate(0, 0, .5), PR.toon(0xf2eee2, { side: THREE.DoubleSide })); m.castShadow = true;
  return m;
}
/** the printed cloth: white cotton with a blue fish (body, tail, scales, eye) and a round blue stamp border */
function fishCloth() {
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 384; const x = cv.getContext('2d');
  x.fillStyle = '#f4f0e4'; x.fillRect(0, 0, 512, 384);
  x.strokeStyle = 'rgba(160,150,130,.25)'; x.lineWidth = 1;
  for (let i = 0; i < 512; i += 4) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 384); x.stroke(); }
  for (let j = 0; j < 384; j += 4) { x.beginPath(); x.moveTo(0, j); x.lineTo(512, j); x.stroke(); }
  x.strokeStyle = '#1f4f9a'; x.fillStyle = '#2a63b8'; x.lineWidth = 5;
  x.beginPath(); x.ellipse(256, 192, 170, 78, 0, 0, Math.PI * 2); x.stroke();   // stamp ring
  x.beginPath(); x.ellipse(236, 192, 100, 52, 0, 0, Math.PI * 2); x.fill();       // body
  x.beginPath(); x.moveTo(330, 192); x.lineTo(392, 140); x.lineTo(380, 192); x.lineTo(392, 244); x.closePath(); x.fill();   // tail
  x.beginPath(); x.moveTo(200, 142); x.quadraticCurveTo(236, 108, 276, 142); x.closePath(); x.fill();   // fin
  x.strokeStyle = '#f4f0e4'; x.lineWidth = 2.5;
  for (let r = 0; r < 4; r++) for (let q = 0; q < 6; q++) { x.beginPath(); x.arc(170 + q * 26 + (r % 2) * 13, 166 + r * 14, 11, .2, Math.PI - .2); x.stroke(); }   // scales
  x.fillStyle = '#f4f0e4'; x.beginPath(); x.arc(158, 182, 8, 0, Math.PI * 2); x.fill(); x.fillStyle = '#10305f'; x.beginPath(); x.arc(156, 182, 4, 0, Math.PI * 2); x.fill();
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(.72, .54), new THREE.MeshToonMaterial({ map: tex, side: THREE.DoubleSide })); m.castShadow = true;
  return m;
}

const sh = shot({
  plate: 'kissaria',
  light: { key: 0xffe4c0, keyI: 1.5, dir: [-2, 3, 1.5], sky: 0xd8d0c8, ground: 0x8a6a48, fillI: 1.6, rim: 0xffe0a0, rimI: .5, rimDir: [2, 2, -3], shadow: .3 },
  async build(S3) {
    const F = (x, y, h = 0) => S3.floorAt(x, y, h), cam = S3.cam.position.clone().setY(0);
    const zo = await role('zoubida', { costume: 'haik' }), mo = await role('mohammed'), ma = await role('marchand');
    const mp = F(1470, 717, .8), zp = F(1330, 965), mp2 = F(1180, 985);
    S3.add(zo, zp.x, zp.z, yawTo(zp, mp)); S3.add(mo, mp2.x, mp2.z, yawTo(mp2, mp)); S3.add(ma, mp.x, mp.z, yawTo(mp, cam)); ma.group.position.y = .8;
    const b = S3.prop(bolt()), s = S3.prop(strip()), cloth = S3.prop(fishCloth());
    return { actors: [zo, mo, ma], zo, mo, ma, mp, cam, zp, b, s, cloth, faces: [[zo, null, 1], [mo, null, 2], [ma, null, 3]] };
  },
  cover: [{ t: L[0][0], size: 'W' }, { t: L[0][0] + 5, size: 'M', on: 'marchand' }, { t: L[0][0] + 10, size: 'M', on: 'zoubida' }, { t: INS, size: 'CU', on: 'marchand' }],
  view(lt, u, t) {   // insert: tight on the banner of cloth, a slow push
    if (!sh.st || t < INS) return null;
    const { mp, cam } = sh.st, c = mp.clone().add(cam.clone().sub(mp).setY(0).normalize().multiplyScalar(.42)); c.y = .8 + 1.38; const p = sh.S3.project(c), z = 3.2 + .5 * clamp((t - INS) / (L[1][1] - INS));
    return [p[0], p[1], z];
  },
  frame(lt, u, t, S, st) {
    const { zo, mo, ma, b, s, cloth, cam } = st, ins = t >= INS;
    for (const a of [zo, mo, ma]) { rest(a.B); idlePose(a.B, t + (a === mo ? 1 : a === ma ? 2 : 0), 1); }
    const ch = IK.wpos(ma.B.chest), f = dirW(ma, 0, 0, 1), sd = dirW(ma, 1, 0, 0), palm = (a, q) => PO.handPts(a, q).palm;
    b.visible = s.visible = !ins; cloth.visible = ins;
    if (!ins) {   // measures a cubit of cloth off the bolt along his outstretched arm, twice
      const ext = .55 + .45 * Math.abs(Math.sin(t * .9)), rH = ch.clone().addScaledVector(f, .36).addScaledVector(sd, -.14).add(V(0, -.05, 0)), lH = ch.clone().addScaledVector(f, .4).addScaledVector(sd, .14 + ext * .5).add(V(0, -.02, 0));
      PO.reach(ma, 'R', rH, { grip: .02 }); PO.reach(ma, 'L', lH, { grip: .02 });
      inHand(b, palm(ma, 'R'), sd.clone().add(V(0, .001, 0)));
      s.position.copy(palm(ma, 'R')); s.lookAt(palm(ma, 'L')); s.scale.set(1, 1, palm(ma, 'R').distanceTo(palm(ma, 'L'))); s.updateMatrixWorld(true);
      // Zoubida fingers the cloth, then nods; Mohammed gapes at the stuffs
      const mid = palm(ma, 'R').lerp(palm(ma, 'L'), .6), k = sm(L[0][0] + 2, L[0][0] + 3, t);
      PO.look(zo, IK.wpos(ma.B.head).lerp(mid, .5), .6); PO.look(mo, IK.wpos(ma.B.head).add(V(0, .5 + .1 * Math.sin(t * .7), 0)), .8);
      PO.look(ma, IK.wpos(zo.B.head), .6);
    } else {   // the merchant holds the printed cloth up by its top corners, facing the camera, smiling
      const c0 = ch.clone().addScaledVector(f, .42).add(V(0, .12, 0)), tilt = -.04 * Math.sin(t * 1.3);
      cloth.position.copy(c0); cloth.rotation.set(0, ma.group.rotation.y, tilt); cloth.updateMatrixWorld(true);
      for (const [q, sg] of [['R', -1], ['L', 1]]) PO.reach(ma, q, c0.clone().addScaledVector(sd, sg * .33).add(V(0, .25, 0)), { grip: .02 });
      PO.look(ma, V(0, 1.4, 0).add(cam), .6); PO.look(zo, c0, .6); PO.look(mo, c0, .6);
    }
    breathe(zo, t, 1, 1); breathe(mo, t, 1, 2); breathe(ma, t, 1, 3);
  },
});

export { sh };
export default make({ preload: all(sh), plate: 'ep06/kissaria', segs: [ac([0, 0], sh.fn)] });
