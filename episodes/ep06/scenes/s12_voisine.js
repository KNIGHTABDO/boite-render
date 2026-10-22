// s12: rue_mosquee (ep06 plate). l0 Zoubida and the boy arrive by the mosque door; the neighbour runs out and hugs Zoubida, then bends
// to press her rough veil against the boy's cheek; l1 the two women lean on the wall talking, Mohammed waits; l2 the neighbour speaks
// (venomous at the end); l3 Zoubida, sententious (CU, finger raised).
// Calibration re-solved from the 0.40 m bench (front face ~60 display px at the near end): h 1.3 with horizon 626 (canvas px).
import * as K from '../../../engine/core.js';
import * as PO from '../../../engine/poses.js';
import * as IK from '../../../engine/ik.js';
import { rest, idlePose } from '../../../engine/rig3d.js';
import { travel } from '../../../engine/clips.js';
import { make, ac } from './_pt.js';
import { shot, all, breathe, V, role, CAL, faceCloth } from './_3d.js';
const { clamp, ease } = K;
const sm = (a, b, x) => ease(clamp((x - a) / (b - a)));
const dirW = (a, x, y, z) => V(x, y, z).normalize().applyAxisAngle(V(0, 1, 0), a.group.rotation.y);
const yawTo = (f, to) => Math.atan2(to.x - f.x, to.z - f.z);

CAL.rue_mosquee = { ...CAL.rue_mosquee, h: 1.3, horizon: 626, fov: 45 };
const SC = (await (await fetch(new URL('../timing.json', import.meta.url))).json()).find(s => s.id === 's12_voisine');
const L = SC.lines.map(l => [l.start - SC.start, l.start - SC.start + l.dur]);
const T_N = 3.6, T_HUG = 5.8, T_KISS = 8.8, T_END = 12.8;   // neighbour appears / hugs Zoubida / turns to the boy / lets go

const sh = shot({
  plate: 'rue_mosquee',
  light: { key: 0xfff0d0, keyI: 1.9, dir: [-1.5, 3, 2], sky: 0xc0d0f0, ground: 0xd8b080, fillI: 1.5, rim: 0xffe0a0, rimI: .7, rimDir: [2, 2, -3], shadow: .3, area: 4 },
  async build(S3) {
    const F = (x, y) => S3.floorAt(x, y);
    const zo = await role('zoubida', { costume: 'haik' }), vo = await role('voisine'), mo = await role('mohammed'); faceCloth(vo);
    const zp = F(840, 870), np = zp.clone().add(V(.62, 0, .03)), mp = zp.clone().add(V(.5, 0, .78)), from = F(330, 1000), door = F(850, 770);
    S3.add(zo, zp.x, zp.z, .85); S3.add(vo, np.x, np.z, -.85); S3.add(mo, mp.x, mp.z, .5);
    return { actors: [zo, vo, mo], zo, vo, mo, zp, np, mp, from, door,
      faces: [[zo, 'zoubida', 1], [vo, 'voisine', 2, (lt, t) => ({ sad: t > L[2][1] - 4 ? -.4 : 0 })], [mo, null, 3, (lt, t) => ({ sad: t > T_KISS && t < T_END ? .6 : 0 })]] };
  },
  cover: [{ t: 0, size: 'W' }, { t: T_HUG - .5, size: 'M', on: 'zoubida', dy: 30 }, { t: T_END, size: 'W' }, { t: L[1][0] + 6, size: 'M', on: 'voisine' },
    { t: L[2][0], size: 'M', on: 'voisine' }, { t: L[2][1] - 4.8, size: 'CU', on: 'voisine' }, { t: L[3][0], size: 'CU', on: 'zoubida', dy: -110 }],
  frame(lt, u, t, S, s) {
    const { zo, vo, mo } = s, up = V(0, 1, 0);
    const lean = (a, yaw, ph) => { a.group.rotation.y = yaw; };
    // --- arrival (Zoubida + boy walk in from the lower left)
    const ARRV = 3.0;
    if (t < ARRV) {
      travel(zo, [[s.from.x, s.from.z], [s.zp.x, s.zp.z]], t, { t0: 0, speed: s.from.distanceTo(s.zp) / ARRV, gait: 'walk' });
      travel(mo, [[s.from.x - .4, s.from.z + .1], [s.mp.x, s.mp.z]], t, { t0: 0, speed: s.from.distanceTo(s.mp) / ARRV, gait: 'walk' });
    } else {
      zo.group.position.copy(s.zp); zo.group.rotation.y = .85; rest(zo.B); idlePose(zo.B, t, .8);
      mo.group.position.copy(s.mp); mo.group.rotation.y = .5; rest(mo.B); idlePose(mo.B, t, .8);
    }
    zo.group.updateMatrixWorld(true); mo.group.updateMatrixWorld(true);
    // --- neighbour: runs out of the door, hugs, kisses the boy, then stands beside Zoubida
    if (t < T_N) vo.group.visible = false;
    else {
      vo.group.visible = true;
      const run = T_HUG - .3 - T_N;
      if (t < T_HUG - .3) travel(vo, [[s.door.x, s.door.z], [s.np.x, s.np.z]], t, { t0: T_N, speed: s.door.distanceTo(s.np) / run, gait: 'run' });
      else { vo.group.position.copy(s.np); vo.group.rotation.y = -.85; rest(vo.B); idlePose(vo.B, t, .8); }
      vo.group.updateMatrixWorld(true);
    }
    const talk = t >= T_END;
    if (t >= T_HUG - .3) {
      const hug = sm(T_HUG - .3, T_HUG + .4, t) * (1 - sm(T_KISS - .5, T_KISS, t));
      const kiss = sm(T_KISS - .3, T_KISS + .5, t) * (1 - sm(T_END - .6, T_END, t));
      vo.group.rotation.y = -.85 + (yawTo(s.np, s.mp) + .85) * kiss; vo.group.updateMatrixWorld(true);
      const zc = IK.wpos(zo.B.chest), nc = IK.wpos(vo.B.chest), zr = dirW(zo, -1, 0, 0), nr = dirW(vo, -1, 0, 0);
      // neighbour: arms around Zoubida's back (hug), then both hands on the boy's head, body bent, her cheek against his
      const around = n => zc.clone().add(V(0, .12, 0)).addScaledVector(zr, n * .3).addScaledVector(dirW(zo, 0, 0, 1), .08);
      const rest_hand = (side) => nc.clone().addScaledVector(dirW(vo, 0, 0, 1), .12).addScaledVector(nr, side * .28).add(V(0, -.2, 0));
      const mh = IK.wpos(mo.B.head);
      if (hug > 0 && kiss < .05) {
        PO.reach(vo, 'L', rest_hand(-1).lerp(around(-1), hug)); PO.reach(vo, 'R', rest_hand(1).lerp(around(1), hug));
        PO.reach(zo, 'L', zc.clone().addScaledVector(zr, -.25).addScaledVector(dirW(zo, 0, 0, 1), .1).add(V(0, -.2, 0)).lerp(nc.clone().addScaledVector(nr, .3).add(V(0, .1, 0)), hug));
        PO.look(vo, IK.wpos(zo.B.head), .6);
      }
      if (kiss > 0) {
        vo.B.spine.rotation.x += .5 * kiss; vo.B.chest.rotation.x += .25 * kiss; vo.group.updateMatrixWorld(true);
        mo.B.head.rotation.z += .3 * kiss; mo.B.head.rotation.y -= .2 * kiss; mo.group.updateMatrixWorld(true);
        const mh2 = IK.wpos(mo.B.head), off = mo.group.position.clone().sub(vo.group.position).setY(0).normalize();
        PO.reach(vo, 'L', mh2.clone().addScaledVector(nr, -.1).addScaledVector(off, -.04).add(V(0, -.04, 0)));
        PO.reach(vo, 'R', mh2.clone().addScaledVector(nr, .1).addScaledVector(off, -.04).add(V(0, -.04, 0)));
        PO.look(vo, mh2, .7);
        PO.look(mo, IK.wpos(vo.B.head), .3);
      }
    }
    if (talk) {   // leaning on the wall, talking: little hand gestures, nods
      const k = Math.sin(t * 2.7), k2 = Math.sin(t * 3.6 + 1.3), spk = t >= L[2][0] && t < L[2][1], zspk = t >= L[3][0];
      for (const [a, ph, on] of [[zo, 0, zspk || !spk && Math.sin(t * .7) > .4], [vo, 1, spk]]) {
        a.B.spine.rotation.x -= .06; a.B.chest.rotation.z += .05;
        a.group.updateMatrixWorld(true);
        const ch = IK.wpos(a.B.chest), fw = dirW(a, 0, 0, 1), rt = dirW(a, -1, 0, 0), kk = Math.sin(t * (2.4 + ph) + ph * 2);
        PO.reach(a, 'L', ch.clone().addScaledVector(fw, .1).addScaledVector(rt, -.3).add(V(0, -.2, 0)));
        if (a === zo && zspk) PO.reach(a, 'R', ch.clone().addScaledVector(fw, .2).addScaledVector(rt, .08).add(V(0, .38 + .03 * k, 0)));   // finger to the sky
        else PO.reach(a, 'R', ch.clone().addScaledVector(fw, .25).addScaledVector(rt, .2).add(V(0, on ? .02 + .12 * kk : -.15, 0)));
        if (a === zo && zspk) PO.look(a, V(0, 1.45, 0), .85); else PO.look(a, IK.wpos(a === zo ? vo.B.head : zo.B.head), .45);
      }
      mo.group.updateMatrixWorld(true);
      // the boy waits: shifts, looks away at the wall, then up at the women
      PO.look(mo, IK.wpos(mo.B.head).add(V(-1.5 * Math.sin(t * .5), -.1 + .3 * k2, 1)), .6);
      mo.B.spine.rotation.z += .05 * Math.sin(t * .9); mo.B.thighR.rotation.x += .1 * Math.max(0, Math.sin(t * 1.3));
    }
    for (const a of [zo, vo, mo]) breathe(a, t, .6, 1);
  },
});

export default make({ preload: all(sh), plate: 'rue_mosquee', segs: [ac([0, 0], sh.fn)] });
