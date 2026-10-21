// s17: Rahma's poor room (plate rahma_pauvre, ep06 new, cal SEED h 1.0 / horizon 464 / fov 50: scale checked on the door and the mattresses),
// then the gallery. L0 Rahma, Zoubida and Mohammed come in from the palier; L1-2 Zineb kneels in her corner holding a round
// mirror up to her grey cat (3D cat, Quaternius: Idle, Headbutt = the paw on the glass, Run = bolts out of frame) and laughs;
// L3-4 Rahma holds the cherry gilet against Mohammed (dim room, crimson glow); L5 the mothers whisper, grimace war;
// L6 Zineb screams; L7 Mohammed pleads; L8 he sobs, Zoubida seizes his hand and drags him out of the door (travel);
// L9 the gallery (galerie_jour): she drags him along it lamenting.
// Contacts (st.M): Zineb's knees/shins on the floor (kneel), mirror in her right palm, gilet between Rahma's two palms,
// hands joined between Zoubida and Mohammed (same point, both left hands), feet on the floor everywhere (travel).
import * as K from '../../../engine/core.js';
import * as PO from '../../../engine/poses.js';
import * as IK from '../../../engine/ik.js';
import * as THREE from 'three';
import * as PR from '../../../engine/props3d.js';
import { rest, idlePose, loadAnimal } from '../../../engine/rig3d.js';
import { travel } from '../../../engine/clips.js';
import { make, ac } from './_pt.js';
import { shot, all, breathe, V, role, memoPose, CAL } from './_3d.js';
const { clamp, ease, c, W, H, glow } = K;
const sm = (a, b, x) => ease(clamp((x - a) / (b - a)));
const yawTo = (from, to) => Math.atan2(to.x - from.x, to.z - from.z);
const dirW = (a, x, y, z) => V(x, y, z).normalize().applyAxisAngle(V(0, 1, 0), a.group.rotation.y);
const angLerp = (a, b, k) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * k;
const path = (t, ks) => { if (t <= ks[0][0]) return ks[0][1].clone(); for (let i = 1; i < ks.length; i++) if (t <= ks[i][0]) return ks[i - 1][1].clone().lerp(ks[i][1], ease((t - ks[i - 1][0]) / (ks[i][0] - ks[i - 1][0]))); return ks.at(-1)[1].clone(); };

const SC = (await (await fetch(new URL('../timing.json', import.meta.url))).json()).find(s => s.id === 's17_rahma');
const L = SC.lines.map(l => [l.start - SC.start, l.start - SC.start + l.dur]);
const [a0, a1, a2, a3, a4, a5, a6, a7, a8, a9] = L.map(l => l[0]);
const DUR = SC.end - SC.start;

// the galerie plate is ep05's (cal in ep05/cal.json): register it for _3d.js
CAL['ep05/galerie_jour'] = { h: 1.15, horizon: 471, fov: 45, light: { dir: [-2, 2.5, -1] } };

// ---- props local to this scene (toon look like _props.js)
function mirrorProp() {   // 12 cm round hand mirror, gold rim, pale glass, disc axis = local +z
  const g = new THREE.Group();
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(.062, .062, .014, 24).rotateX(Math.PI / 2), PR.toon(0xc8a040));
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(.052, .052, .016, 24).rotateX(Math.PI / 2), PR.toon(0xd8e8f0));
  g.add(rim, glass); g.traverse(o => { if (o.isMesh) o.castShadow = true; }); return g;
}
function gilet() {   // the s15 waistcoat: open cherry tube (30 cm tall, boy-sized), gold hems, buttons and braid down the front (+z)
  const g = new THREE.Group(), red = PR.toon(0xb3142c, { side: THREE.DoubleSide }), gold = PR.toon(0xd4a52a);
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(.15, .16, .3, 28, 1, true), red); tube.scale.set(.82, 1, .6); g.add(tube);
  for (const y of [-.15, .15]) { const r = new THREE.Mesh(new THREE.TorusGeometry(.155, .008, 6, 28).rotateX(Math.PI / 2).translate(0, y, 0), gold); r.scale.set(.82, 1, .6); g.add(r); }
  for (let i = 0; i < 7; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(.012, 8, 6), gold); b.position.set(0, .12 - i * .04, .096); g.add(b); }
  g.traverse(o => { if (o.isMesh) o.castShadow = true; }); return g;
}
const LIGHT = { key: 0xffd8a0, keyI: 1.5, dir: [3, 2.5, 1.2], sky: 0xc8a888, ground: 0x8a5a3a, fillI: 1.45, rim: 0xffc070, rimI: .5, rimDir: [-2, 2, -3], shadow: .3, area: 3 };

// a walker follows legs [{ t0, pts: [[x,z]..], speed, face, exit }]: stands at the end of a leg, turning to `face` after it
function walker(a, legs, t, seed) {
  let g = null; for (const l of legs) if (t >= l.t0) g = l;
  if (!g) { a.group.visible = false; return null; }
  const r = travel(a, g.pts, t, { t0: g.t0, speed: g.speed, exit: g.exit });
  if (r.done && !g.exit) {
    const last = g.pts.at(-1), prev = g.pts.at(-2) || last, walkYaw = Math.atan2(last[0] - prev[0], last[1] - prev[1]);
    const len = g.pts.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - g.pts[i][0], p[1] - g.pts[i][1]), 0), tDone = g.t0 + len / g.speed;
    rest(a.B); idlePose(a.B, t + seed, 1);
    a.group.rotation.y = angLerp(walkYaw, g.face, sm(tDone, tDone + .6, t)); a.group.updateMatrixWorld(true);
  }
  return r;
}

const sh = shot({
  plate: 'rahma_pauvre', light: LIGHT,
  async build(S3) {
    const M = {}, F = (x, y) => S3.floorAt(x, y), cam = S3.cam.position.clone().setY(0);
    const rah = await role('rahma'), zou = await role('zoubida'), mo = await role('mohammed'), zn = await role('zineb', { seat: true });
    const MO = F(1010, 880), R1 = MO.clone().add(V(.75, 0, -.1)), Z1 = R1.clone().add(V(.7, 0, .0)), ZN = F(700, 830), D = F(1480, 735);
    const toward = (p, q, k = .6) => angLerp(yawTo(p, q), yawTo(p, cam), 1 - k);
    S3.add(mo, MO.x, MO.z, toward(MO, R1)); S3.add(rah, R1.x, R1.z, toward(R1, MO)); S3.add(zou, Z1.x, Z1.z, toward(Z1, R1));
    // Zineb kneels in her corner facing the cat (screen right)
    S3.add(zn, ZN.x, ZN.z, Math.PI / 2);
    M.zn = memoPose('s17zn', zn, [ZN], () => PO.kneel(zn, { lean: .22 }).map?.(e => +e.toFixed(3)));
    const znBase = PO.snap(zn);
    const cat = await loadAnimal('/art/models/cat.glb', { height: .3, prefix: 'AnimalArmature|AnimalArmature|AnimalArmature|' });
    cat.root.traverse(o => { if (o.isMesh) o.castShadow = true; }); S3.scene.add(cat.root);
    const mirror = S3.prop(mirrorProp()), gil = S3.prop(gilet());
    const Mp = ZN.clone().add(V(.34, .3, 0)), cat0 = Mp.clone().add(V(.34, -.3, 0));
    return { actors: [rah, zou, mo, zn], M, rah, zou, mo, zn, cat, mirror, gil, MO, R1, Z1, ZN, D, Mp, cat0, znBase, cam,
      faces: [[rah, 'rahma', 1], [zou, 'zoubida', 2, { sad: .2 }], [mo, 'mohammed', 3, (lt, t) => ({ sad: t > a8 - .5 ? 1 : t > a6 ? .5 : 0, ...(t > a5 + 3.5 && t < a6 ? { lid: .7, open: .8 } : {}) })],
        [zn, 'zineb', 4, (lt, t) => ({ ...(t > a2 + 3.8 && t < a3 ? { open: .5 + .4 * Math.sin(t * 15), lid: .5 } : {}), ...(t > a5 + 3 && t < a6 ? { lid: .6, open: .7 } : {}) })]] };
  },
  cover: [{ t: 0, size: 'W' }, { t: a0 + 8, size: 'M', on: 'rahma', dx: -130 }, { t: a0 + 15, size: 'W' },
    { t: a1, size: 'M', on: 'zineb', dx: 110 }, { t: a1 + 8, size: 'CU', on: 'zineb', dx: 150 }, { t: a1 + 14, size: 'M', on: 'zineb', dx: 110 },
    { t: a2, size: 'M', on: 'zineb', dx: 190 }, { t: a3, size: 'M', on: 'rahma', dx: -110 },
    { t: a4, size: 'M', on: 'mohammed', dx: 80 }, { t: a4 + 7, size: 'CU', on: 'mohammed', dx: 40 }, { t: a4 + 13, size: 'M', on: 'rahma', dx: -80 },
    { t: a5, size: 'W' }, { t: a5 + 3.5, size: 'M', on: 'mohammed', dx: -150 }, { t: a5 + 8, size: 'M', on: 'zineb', dx: 140 },
    { t: a6, size: 'CU', on: 'zineb', dx: 60 }, { t: a7, size: 'CU', on: 'mohammed' }, { t: a8, size: 'M', on: 'mohammed' }, { t: a8 + 6, size: 'W' }],
  frame(lt, u, t, S, st, S3) {
    const { M, rah, zou, mo, zn, cat, mirror, gil, MO, R1, Z1, ZN, D, Mp, cat0, cam } = st;
    const toward = (p, q, k = .6) => angLerp(yawTo(p, q), yawTo(p, cam), 1 - k);
    const palm = (a, s) => PO.handPts(a, s).palm;
    // ---------------- entrances (L0): Rahma first, then Zoubida, then Mohammed
    walker(rah, [{ t0: a0 + 1, pts: [[D.x, D.z], [R1.x, R1.z]], speed: 1.3, face: toward(R1, MO) },
      { t0: a8 + 20, pts: [[R1.x, R1.z], [R1.x, R1.z]], speed: 1, face: 0 }], t, 1);
    walker(zou, [{ t0: a0 + 3, pts: [[D.x, D.z], [Z1.x, Z1.z]], speed: 1.3, face: toward(Z1, R1) }], t, 2);
    // the drag: Zoubida walks to him, takes his hand, leads him to the door and out (both on the same line, 65 cm apart)
    const out = D.clone().add(V(1.5, 0, -1.2)), dir = out.clone().sub(MO).setY(0).normalize(), Zg = MO.clone().addScaledVector(dir, .65);
    const TG = a8 + 5.8, TD = a8 + 8.4, dd = Math.hypot(out.x - Zg.x, out.z - Zg.z);
    const sp = dd / (a8 + 11.8 - TD);
    const zr = walker(zou, [{ t0: a0 + 3, pts: [[D.x, D.z], [Z1.x, Z1.z]], speed: 1.3, face: toward(Z1, R1) },
      { t0: TG, pts: [[Z1.x, Z1.z], [Zg.x, Zg.z]], speed: 1.3, face: yawTo(Zg, out) },
      { t0: TD, pts: [[Zg.x, Zg.z], [out.x, out.z]], speed: sp, face: 0, exit: true }], t, 2);
    walker(mo, [{ t0: a0 + 3.8, pts: [[D.x, D.z], [MO.x, MO.z]], speed: 1.3, face: toward(MO, R1) },
      { t0: TD, pts: [[MO.x, MO.z], [out.x - dir.x * .65, out.z - dir.z * .65]], speed: sp, face: 0, exit: true }], t, 3);
    const standing = t >= a0 + 5.5;
    // ---------------- Rahma
    if (t > a0 + 6.5 && t < a3 - 1.2) {   // inviting us in: right hand sweeps toward the painted shelf (screen left), then down
      const k = sm(a0 + 6.5, a0 + 7.5, t) * (1 - sm(a0 + 13, a0 + 14, t));
      if (k > 0) PO.reach(rah, 'R', IK.wpos(rah.B.chest).add(V(-.25 * k, .0 + .1 * k, .2 * k)).lerp(IK.wpos(rah.B.handR), 1 - k), { grip: .03 });
    }
    const f1 = t >= a3 - 1, f2 = t < a5 - .2;
    const Mch = IK.wpos(mo.B.chest), G = Mch.clone().add(V(0, -.13, 0));   // around his chest, over the djellaba
    gil.visible = f1 && f2;
    if (f1 && f2) {   // gilet held against his chest in both palms, facing the camera
      const w = sm(a3 - 1, a3 - .2, t), side = dirW(rah, 1, 0, 0);
      const sway = Math.sin(t * 1.2) * .01;
      for (const [s, k] of [['L', 1], ['R', -1]]) M['gil' + s] = +PO.reach(rah, s, IK.wpos(rah.B['hand' + s]).lerp(G.clone().addScaledVector(side, .13 * k).add(V(0, sway, 0)), w), { grip: .03 }).toFixed(3);
      gil.position.copy(G).lerp(IK.wpos(rah.B.chest).add(V(0, .05, .25)), 1 - w); gil.rotation.set(0, mo.group.rotation.y, 0); gil.scale.set(1.08, .9, 1.45);
    }
    if (t >= a5 - .2 && t < a6) {   // she leans to Zoubida: the mothers whisper, heads together
      const k = sm(a5, a5 + .8, t);
      rah.group.rotation.y = angLerp(rah.group.rotation.y, yawTo(R1, Z1) * .8 + yawTo(R1, cam) * .2, k); rah.B.spine.rotation.x += .16 * k; rah.group.updateMatrixWorld(true);
    }
    if (standing && t < a8 + 6) { PO.look(rah, IK.wpos((t > a5 && t < a8 ? zou : mo).B.head), .5); }
    breathe(rah, t, 1, 1);
    // ---------------- Zoubida (idle until she moves)
    if (t >= a5 - .2 && t < TG) {
      const k = sm(a5, a5 + .8, t); zou.group.rotation.y = angLerp(zou.group.rotation.y, yawTo(Z1, R1) * .8 + yawTo(Z1, cam) * .2, k); zou.B.spine.rotation.x += .16 * k; zou.group.updateMatrixWorld(true);
      PO.look(zou, IK.wpos(rah.B.head), .5);
    }
    // ---------------- Zineb: kneels, mirror, laughs, accuses
    PO.apply(zn, st.znBase);
    const d1 = L[1][1] - a1, present = a1 + .2 * d1, paw0 = a1 + .4 * d1, paw1 = a1 + .69 * d1;
    const lap = ZN.clone().add(V(.2, .2, .05));
    let mp = path(t, [[present - 1.2, lap], [present + .8, Mp], [a2 + 3, Mp], [a2 + 4, lap]]);
    // she turns toward Mohammed for the grimace war and the scream
    const face = sm(a5 - .3, a5 + .6, t);
    zn.group.rotation.y = angLerp(Math.PI / 2, yawTo(ZN, MO) * .55 + yawTo(ZN, cam) * .45, face); zn.group.updateMatrixWorld(true);
    zn.B.head.rotation.x += .18 * (1 - face);
    if (t < a3) {
      mp = mp.clone().setY(mp.y).add(V(0, Math.sin(t * 2) * .004, 0));
      M.mir = +PO.reach(zn, 'R', mp, { grip: .03 }).toFixed(3);
      mirror.position.copy(palm(zn, 'R')).add(V(.05, .0, 0)); mirror.rotation.set(0, Math.PI / 2, 0); mirror.visible = true;
      if (t > a2 + 3.8) { zn.B.head.rotation.x -= .3 * sm(a2 + 3.8, a2 + 4.4, t); zn.B.chest.rotation.x += Math.sin(t * 18) * .035; zn.group.updateMatrixWorld(true); }
      else PO.look(zn, t < paw1 + 1 ? cat0.clone().add(V(0, .1, 0)) : IK.wpos(mo.B.head), .6);
    } else {
      mirror.visible = true; mirror.rotation.set(0, Math.PI / 2, 0);
      mirror.position.copy(palm(zn, 'R')).add(V(.02, 0, 0));
      if (t < a5 - .3) { zn.B.head.rotation.x -= .15; PO.look(zn, IK.wpos(mo.B.head), .3); }
    }
    if (t >= a5 - .3 && t < a6) {   // grimace: head forward and jabbing, tongue-out mouth (face open + squint)
      PO.look(zn, IK.wpos(mo.B.head), .8); zn.B.head.rotation.z += Math.sin(t * 8) * .12; zn.B.head.rotation.x += .1;
    }
    if (t >= a6 && t < a7) {   // she screams for her mother: head turned to the mothers, right arm accusing Mohammed
      const k = sm(a6, a6 + .3, t), sp0 = IK.wpos(zn.B.upperArmR);
      PO.look(zn, IK.wpos(rah.B.head), .9); zn.B.head.rotation.x -= .15 * k;
      PO.reach(zn, 'R', sp0.clone().add(IK.wpos(mo.B.head).sub(sp0).setLength(.38)).lerp(IK.wpos(zn.B.handR), 1 - k), { grip: 0 });
    }
    if (t >= a7) { PO.look(zn, IK.wpos(mo.B.head), .4); zn.B.head.rotation.x -= .1; }
    zn.group.updateMatrixWorld(true); breathe(zn, t, 1, 4);
    // ---------------- the cat: idles, paws the mirror, peers behind it, spits, bolts
    cat.root.visible = t < a2 + 6;
    const RUN = a2 + 3.7;
    const cp = cat0.clone(); let yaw = -Math.PI / 2, clip = 'Idle', ct = t, sc = 1;
    if (t >= paw0 && t < paw1) { clip = 'Headbutt'; ct = (t - paw0) * .8; }
    else if (t >= paw1 && t < a2) { const k = sm(paw1, paw1 + 1.2, t); cp.add(V(-.02 * k, 0, .13 * k)); yaw = -Math.PI / 2 - .5 * k; }
    else if (t >= a2 && t < RUN) { const b = sm(a2, a2 + .3, t); cp.add(V(0, 0, .13)); yaw = -Math.PI / 2 - .5 + .5 * b; sc = 1 + .12 * b * (1 + Math.sin(t * 25) * .3); }
    if (t >= RUN) {
      const dst = S3.floorAt(1900, 800), p0 = cat0.clone().add(V(0, 0, .13));
      const dist = clamp((t - RUN) * 5, 0, Math.hypot(dst.x - p0.x, dst.z - p0.z)), fr = dist / Math.hypot(dst.x - p0.x, dst.z - p0.z);
      cp.set(p0.x + (dst.x - p0.x) * fr, 0, p0.z + (dst.z - p0.z) * fr); yaw = Math.atan2(dst.x - p0.x, dst.z - p0.z); clip = 'Run'; ct = t - RUN;
    }
    cat.play(clip); cat.at(ct);
    cat.root.position.set(cp.x, cp.y, cp.z); cat.root.rotation.y = yaw; cat.root.scale.setScalar(sc); cat.root.updateMatrixWorld(true);
    // ---------------- Mohammed
    if (t >= a0 + 5.5 && t < TD) {
      mo.B.head.rotation.x += t < a3 ? 0 : 0;
      if (t >= a4 && t < a5) { mo.B.chest.rotation.x -= .06 * sm(a4, a4 + 1, t); mo.B.head.rotation.x -= .1; }
      if (t >= a5 && t < a6) {   // grimace war: head jutting, jaw working
        PO.look(mo, IK.wpos(zn.B.head), .9); mo.B.head.rotation.z += Math.sin(t * 9 + 1) * .14; mo.B.head.rotation.x += .12 * sm(a5 + 3, a5 + 4, t);
      }
      if (t >= a6 && t < a7) PO.look(mo, IK.wpos(zn.B.head), .7);
      if (t >= a7 && t < a8) {   // "C'est elle !": arms out, palms up, desperate
        const k = sm(a7, a7 + .3, t), ch = IK.wpos(mo.B.chest), f = dirW(mo, 0, 0, 1), s = dirW(mo, 1, 0, 0);
        for (const [sd, g] of [['L', 1], ['R', -1]]) PO.reach(mo, sd, IK.wpos(mo.B['hand' + sd]).lerp(ch.clone().addScaledVector(f, .2).addScaledVector(s, .38 * g).add(V(0, -.05 + Math.sin(t * 9 + g) * .03, 0)), k), { grip: .0 });
        mo.B.head.rotation.x += .08; PO.look(mo, IK.wpos(rah.B.head), .5);
      }
      if (t >= a8) {   // sobbing: right hand at the eyes; left hand joins Zoubida's
        const hd = IK.wpos(mo.B.head), f = dirW(mo, 0, 0, 1), s = dirW(mo, 1, 0, 0);
        mo.B.head.rotation.x += .3; mo.B.chest.rotation.x += Math.abs(Math.sin(t * 7)) * .05 + .05; mo.group.updateMatrixWorld(true);
        const eye = (side, k) => PO.reach(mo, side, hd.clone().addScaledVector(f, .09).addScaledVector(s, .035 * k).add(V(0, -.01 + Math.sin(t * 6 + k) * .006, 0)), { grip: .02 });
        eye('R', -1);
        const w = sm(a8 + 6.4, a8 + 7.2, t);
        if (w < 1 && zr) { eye('L', 1); }
        M.eyeL = 0;
      }
    }
    if (t >= a8 && t < a8 + 6.4 && t < TD) { /* sobbing before Zoubida arrives */ }
    // the joined hands: both left hands to one point between them
    if (t >= a8 + 6.4 && zr && !zr.done || (t >= TD - 1.6 && t < TD + 3.5)) {
      const w = sm(a8 + 6.8, a8 + 7.6, t);
      if (w > 0 && zou.group.visible) {
        const zp = IK.wpos(zou.B.chest), mp2 = IK.wpos(mo.B.chest), T = zp.clone().lerp(mp2, .5).setY(.82), sd = dirW(zou, 1, 0, 0);
        T.addScaledVector(sd, .12);
        M.jz = +PO.reach(zou, 'L', IK.wpos(zou.B.handL).lerp(T, w), { grip: .03 }).toFixed(3);
        M.jm = +PO.reach(mo, 'L', IK.wpos(mo.B.handL).lerp(T, w), { grip: .03 }).toFixed(3);
        if (t > TD) { mo.B.chest.rotation.x -= .12; mo.group.updateMatrixWorld(true); }
        PO.look(zou, V(out.x, 1.2, out.z), .5);
      }
    }
    if (mo.group.visible) breathe(mo, t, 1, 3);
  },
  fx: { vignette: .6 },
  over(lt, u, t, S, st, S3) {
    const k = sm(a4, a4 + 1.2, t) * (1 - sm(a5 - 1.5, a5, t));
    if (k <= 0) return;
    c.save(); c.globalAlpha = .3 * k; c.fillStyle = '#180818'; c.fillRect(0, 0, W, H); c.restore();
    const [x, y] = S3.project(st.gil.position); glow(x, y, 300, '#d01838', .5 * k, 'screen');
    const [hx, hy] = S3.project(IK.wpos(st.mo.B.head)); glow(hx, hy, 190, '#ff7088', .25 * k, 'screen');
  },
});

// ---- the gallery: Zoubida drags him along the balustrade, lamenting aloud
const gal = shot({
  plate: 'ep05/galerie_jour',
  light: { key: 0xffe0b0, keyI: 1.3, dir: [1.5, 2.5, -2], sky: 0xd0c4b0, ground: 0xc88a58, fillI: 1.6, rim: 0xffd090, rimI: .7, rimDir: [1.5, 2, -2], shadow: .3, area: 3 },
  async build(S3) {
    const M = {}, F = (x, y) => S3.floorAt(x, y);
    const zou = await role('zoubida'), mo = await role('mohammed');
    const p0 = F(1760, 800), p1 = F(330, 1010), dir = p1.clone().sub(p0).setY(0).normalize(), len = p0.distanceTo(p1);
    S3.add(zou, p0.x, p0.z, yawTo(p0, p1)); S3.add(mo, p0.x, p0.z, yawTo(p0, p1));
    return { actors: [zou, mo], M, zou, mo, p0, p1, dir, len, faces: [[zou, 'zoubida', 2, { sad: .3 }], [mo, null, 3, { sad: 1 }]] };
  },
  cover: [{ t: a9, size: 'W' }],
  frame(lt, u, t, S, st) {
    const { zou, mo, p0, p1, dir, len, M } = st, sp = len / (DUR - a9 - .4), back = dir.clone().multiplyScalar(-.65);
    travel(zou, [[p0.x, p0.z], [p1.x, p1.z]], t, { t0: a9, speed: sp });
    travel(mo, [[p0.x + back.x, p0.z + back.z], [p1.x + back.x, p1.z + back.z]], t, { t0: a9, speed: sp });
    const zp = IK.wpos(zou.B.chest), mp = IK.wpos(mo.B.chest), T = zp.clone().lerp(mp, .5).setY(.85).addScaledVector(dirW(zou, 1, 0, 0), .12);
    M.jz = +PO.reach(zou, 'L', T, { grip: .03 }).toFixed(3); M.jm = +PO.reach(mo, 'L', T, { grip: .03 }).toFixed(3);
    // she laments: right arm thrown up and shaking, head back; he sobs, right hand at his eyes, leaning back
    const hd = IK.wpos(zou.B.head), sh0 = IK.wpos(zou.B.upperArmR);
    PO.reach(zou, 'R', sh0.clone().add(V(-.1 * Math.sin(t * 2), .45 + .06 * Math.sin(t * 6), .15)).addScaledVector(dirW(zou, -1, 0, 0), .1), { grip: 0 });
    zou.B.head.rotation.x -= .15; zou.group.updateMatrixWorld(true);
    const mh = IK.wpos(mo.B.head), f = dirW(mo, 0, 0, 1), s = dirW(mo, 1, 0, 0);
    mo.B.head.rotation.x += .3; mo.B.chest.rotation.x += .1 + Math.abs(Math.sin(t * 7)) * .04; mo.group.updateMatrixWorld(true);
    PO.reach(mo, 'R', mh.clone().addScaledVector(f, .09).addScaledVector(s, -.035).add(V(0, -.01, 0)), { grip: .02 });
    breathe(zou, t, 1, 1);
  },
});

window.__s17 = [sh, gal];
export default make({ preload: all(sh, gal), plate: 'ep06/rahma_pauvre', segs: [ac([0, 0], sh.fn), ac([9, 0], gal.fn)] });
