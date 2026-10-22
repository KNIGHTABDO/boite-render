// s13: the souk. Painting p06_souk (crowd, donkeys) on line 0; 3D rue_foule: Mohammed barefoot, babouches bouncing in his hood,
// trails his mother up the street (1), she stops and turns on "Fais attention à tes babouches !" (2); painting p07_tresor (Kissaria as
// Solomon's treasure, 3); 3D kissaria: mother and son stroll in, merchant on his stall (4), then the merchant close (5).
// Cal: rue_foule (reused plate, no cal.json entry) and kissaria (seed horizon too high) are set here: horizon 720 / 617, h 1.1, fov 45.
import * as K from '../../../engine/core.js';
import * as PO from '../../../engine/poses.js';
import * as IK from '../../../engine/ik.js';
import { rest, idlePose } from '../../../engine/rig3d.js';
import { travel } from '../../../engine/clips.js';
import * as PR from '../../../engine/props3d.js';
import { make, ac, st } from './_pt.js';
import { shot, all, breathe, V, role, CAL } from './_3d.js';
const { clamp, ease } = K;
const sm = (a, b, x) => ease((x - a) / (b - a));
const yawTo = (from, to) => Math.atan2(to.x - from.x, to.z - from.z);
const dirW = (a, x, y, z) => V(x, y, z).normalize().applyAxisAngle(V(0, 1, 0), a.group.rotation.y);
const turn = (a, to, k) => { const y0 = a.group.rotation.y; a.group.rotation.y = y0 + (((to - y0 + Math.PI * 3) % (Math.PI * 2)) - Math.PI) * k; a.group.updateMatrixWorld(true); };

CAL.rue_foule = { h: 1.1, horizon: 720, fov: 45, check: 'set in s13: VP of the street floor' };
CAL.kissaria = { ...CAL.kissaria, h: 1.1, horizon: 617, fov: 45 };

const SC = (await (await fetch(new URL('../timing.json', import.meta.url))).json()).find(s => s.id === 's13_souk');
const L = SC.lines.map(l => [l.start - SC.start, l.start - SC.start + l.dur]);

// ---------------------------------------------------------------- rue_foule: walking up the street (shot 1), then the warning, nearer (shot 2)
const LIGHT = { key: 0xffe8c8, keyI: 1.6, dir: [-2, 3, 1.2], sky: 0xd8d4c8, ground: 0x8a6a48, fillI: 1.5, rim: 0xffe0a0, rimI: .5, rimDir: [2, 2, -3], shadow: .3 };
const rue = shot({
  plate: 'rue_foule', light: LIGHT,
  async build(S3) {
    const F = (x, y, h = 0) => S3.floorAt(x, y, h), cam = S3.cam.position.clone().setY(0);
    const zo = await role('zoubida', { costume: 'haik' }), mo = await role('mohammed');
    const A = F(1000, 1009), B = F(1090, 817), dir = B.clone().sub(A).setY(0).normalize(), side = V(dir.z, 0, -dir.x);
    const mA = A.clone().addScaledVector(dir, -1).addScaledVector(side, .45), mB = B.clone().addScaledVector(dir, -1).addScaledVector(side, .45);
    S3.add(zo, B.x, B.z, yawTo(B, cam)); S3.add(mo, mB.x, mB.z, yawTo(mB, B));
    const bab = S3.prop(PR.babouches()); bab.scale.setScalar(.55);
    return { actors: [zo, mo], zo, mo, A, B, mA, mB, bab, len: A.distanceTo(B), faces: [[zo, 'zoubida', 1], [mo, null, 2]] };
  },
  cover: [{ t: L[1][0], size: 'W' }, { t: L[1][0] + 4, size: 'M', on: 'mohammed' }],
  // follow Mohammed while he walks (cover would hold the arrival spot)
  view(lt, u, t) {
    const sh = rue; if (!sh.st || t < L[1][0] + 4) return null;
    const { mA, mB } = sh.st, k = clamp((t - L[1][0]) / (L[2][0] - L[1][0])), p = mA.clone().lerp(mB, k), h = sh.S3.project(V(p.x, 1.0, p.z));
    return [h[0], h[1] + .18 * K.H / 1.7, 1.7];
  },
  frame(lt, u, t, S, st) {
    const { zo, mo, A, B, mA, mB, bab, len } = st, t0 = L[1][0], T1 = L[2][0] - t0;
    travel(zo, [[A.x, A.z], [B.x, B.z]], t, { t0, speed: len / T1 });
    travel(mo, [[mA.x, mA.z], [mB.x, mB.z]], t, { t0, speed: mA.distanceTo(mB) / T1 });
    // babouches in the hood: hanging on his back between the shoulder blades, bouncing with each step
    const n = IK.wpos(mo.B.neck), back = dirW(mo, 0, 0, -1), bounce = .02 * Math.abs(Math.sin(t * Math.PI * 1.9));
    bab.position.copy(n).addScaledVector(back, .085).add(V(0, -.035 + bounce, 0));
    bab.rotation.set(1.1, mo.group.rotation.y + Math.PI, 0, 'YXZ'); bab.updateMatrixWorld(true);
    breathe(zo, t, 1, 1); breathe(mo, t, 1, 2);
  },
});
// shot 2: she has turned round and scolds him (reverse-style cut: nearer to the camera, same street)
const rue2 = shot({
  plate: 'rue_foule', light: LIGHT,
  async build(S3) {
    const F = (x, y, h = 0) => S3.floorAt(x, y, h), cam = S3.cam.position.clone().setY(0);
    const zo = await role('zoubida', { costume: 'haik' }), mo = await role('mohammed');
    const zp = F(1090, 985), mp = F(800, 1010);
    S3.add(zo, zp.x, zp.z, yawTo(zp, cam) + .5); S3.add(mo, mp.x, mp.z, yawTo(mp, zp) + .4);
    const bab = S3.prop(PR.babouches()); bab.scale.setScalar(.55);
    return { actors: [zo, mo], zo, mo, zp, mp, bab, faces: [[zo, 'zoubida', 1], [mo, null, 2]] };
  },
  cover: [{ t: L[2][0], size: 'CU', on: 'zoubida', dy: -30 }],
  frame(lt, u, t, S, st) {
    const { zo, mo, bab } = st;
    rest(zo.B); idlePose(zo.B, t, 1); rest(mo.B); idlePose(mo.B, t + 1, 1);
    PO.look(zo, IK.wpos(mo.B.head), .6); PO.look(mo, IK.wpos(zo.B.head), .5); zo.B.head.rotation.z += .06 * Math.sin(t * 7); zo.B.head.rotation.x += .05 * Math.abs(Math.sin(t * 7));   // scolding nods
    const n = IK.wpos(mo.B.neck), back = dirW(mo, 0, 0, -1);
    bab.position.copy(n).addScaledVector(back, .085).add(V(0, -.035, 0)); bab.rotation.set(1.1, mo.group.rotation.y + Math.PI, 0, 'YXZ'); bab.updateMatrixWorld(true);
    breathe(zo, t, 1, 1); breathe(mo, t, 1, 2);
  },
});

// ---------------------------------------------------------------- kissaria: the arcade, the merchant on his stall
const kis = shot({
  plate: 'kissaria',
  light: { key: 0xffe4c0, keyI: 1.5, dir: [-2, 3, 1.5], sky: 0xd8d0c8, ground: 0x8a6a48, fillI: 1.6, rim: 0xffe0a0, rimI: .5, rimDir: [2, 2, -3], shadow: .3 },
  async build(S3) {
    const F = (x, y, h = 0) => S3.floorAt(x, y, h), cam = S3.cam.position.clone().setY(0);
    const zo = await role('zoubida', { costume: 'haik' }), mo = await role('mohammed'), ma = await role('marchand');
    const A = F(-60, 925), B = F(1190, 985), dir = B.clone().sub(A).setY(0).normalize(), mA = A.clone().addScaledVector(dir, -1), mB = B.clone().addScaledVector(dir, -.95).addScaledVector(V(dir.z, 0, -dir.x), .35);
    const mp = F(1470, 745, .72);
    S3.add(zo, B.x, B.z, yawTo(B, mp)); S3.add(mo, mB.x, mB.z, yawTo(mB, mp)); S3.add(ma, mp.x, mp.z, yawTo(mp, cam)); rest(ma.B); ma.group.updateMatrixWorld(true); ma.group.position.y += .72 - Math.min(PO.lowestOf(ma, ['footL']), PO.lowestOf(ma, ['footR'])); ma.group.updateMatrixWorld(true);
    return { actors: [zo, mo, ma], zo, mo, ma, A, B, mA, mB, mp, cam, len: A.distanceTo(B), faces: [[zo, null, 1], [mo, null, 2], [ma, null, 3]] };
  },
  cover: [{ t: L[4][0], size: 'W' }, { t: L[4][0] + 10, size: 'M', on: 'zoubida', dx: 150, dy: -150 }, { t: L[5][0], size: 'M', on: 'marchand' }, { t: L[5][0] + 8, size: 'W' }],
  frame(lt, u, t, S, st) {
    const { zo, mo, ma, A, B, mA, mB, mp, len } = st, t0 = L[4][0], walkEnd = t0 + len / 1.0, arrived = t >= walkEnd;
    if (!arrived) {
      travel(zo, [[A.x, A.z], [B.x, B.z]], t, { t0, speed: 1.0 });
      travel(mo, [[mA.x, mA.z], [mB.x, mB.z]], t, { t0, speed: mA.distanceTo(mB) / (len / 1.0) });
    } else {
      rest(zo.B); idlePose(zo.B, t, 1); rest(mo.B); idlePose(mo.B, t + 1, 1);
      turn(zo, yawTo(B, mp), sm(walkEnd, walkEnd + .6, t)); turn(mo, yawTo(mB, mp), sm(walkEnd, walkEnd + .6, t));
      // she points up at the hanging stuffs, he gapes at them
      const ch = IK.wpos(zo.B.chest), f = dirW(zo, 0, 0, 1), s = dirW(zo, -1, 0, 0), p = sm(walkEnd + 1.5, walkEnd + 2.3, t) * (1 - sm(L[5][0] - 1, L[5][0], t));
      PO.reach(zo, 'R', IK.wpos(zo.B.handR).lerp(ch.clone().addScaledVector(f, .22).addScaledVector(s, -.1).add(V(0, -.05, 0)), p), { grip: .02 });
      PO.look(zo, IK.wpos(ma.B.head), .5); PO.look(mo, IK.wpos(ma.B.head).add(V(0, .6 + .1 * Math.sin(t), 0)), .8);
    }
    // the merchant: poised, hand to chest, a courteous nod
    rest(ma.B); idlePose(ma.B, t + 2, 1);
    const ch = IK.wpos(ma.B.chest), f = dirW(ma, 0, 0, 1), s = dirW(ma, 1, 0, 0), g = sm(L[5][0], L[5][0] + .6, t);
    PO.reach(ma, 'R', IK.wpos(ma.B.handR).lerp(ch.clone().addScaledVector(f, .12).addScaledVector(s, -.08).add(V(0, -.05, 0)), g), { grip: .02 });
    PO.look(ma, V(0, 1.2, 0).add(t < L[5][0] ? zo.group.position : st.cam), .5); ma.B.head.rotation.x += .05 * Math.sin(t * 1.3);
    breathe(zo, t, 1, 1); breathe(mo, t, 1, 2); breathe(ma, t, 1, 3);
  },
});

export { rue, rue2, kis };
export default make({
  preload: all(rue, rue2, kis), plate: 'ep06/kissaria',
  segs: [st('p06_souk', [0, 0], 'pushL'), ac([1, 0], rue.fn), ac([2, 0], rue2.fn), st('p07_tresor', [3, 0], 'push'), ac([4, 0], kis.fn)],
});
