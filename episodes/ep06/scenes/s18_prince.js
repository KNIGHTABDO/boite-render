// s18: left alone. L0 he sits on the floor in a corner of the room sniffling (hand at his eyes, hiccuping chest);
// L1 hard cut: he lies on his back on the back mattress, hands on his chest, dreaming (lie pose, like ep05 s20);
// L2 painting p08_prince (the dream). Plate chambre_jour (cal copied from ep05/cal.json).
// Contacts (st.M): floor seat in the corner (crossLegged seat 0), lying on the mattress top (lie), hand at the eyes (reach).
import * as K from '../../../engine/core.js';
import * as PO from '../../../engine/poses.js';
import * as IK from '../../../engine/ik.js';
import * as PR from '../../../engine/props3d.js';
import { make, ac, st } from './_pt.js';
import { shot, all, breathe, V, role, memoPose, skirt, CAL } from './_3d.js';
const { clamp, ease } = K;
const sm = (a, b, x) => ease(clamp((x - a) / (b - a)));
const yawTo = (from, to) => Math.atan2(to.x - from.x, to.z - from.z);
const dirW = (a, x, y, z) => V(x, y, z).normalize().applyAxisAngle(V(0, 1, 0), a.group.rotation.y);

const SC = (await (await fetch(new URL('../timing.json', import.meta.url))).json()).find(s => s.id === 's18_prince');
const L = SC.lines.map(l => [l.start - SC.start, l.start - SC.start + l.dur]);
const [a0, a1, a2] = L.map(l => l[0]);
CAL.chambre_jour = CAL.chambre_jour || { h: 1.1, horizon: 425, fov: 50 };
const LIGHT_JOUR = { key: 0xffe0b0, keyI: 1.3, dir: [1.6, 3, 1], sky: 0xd8c0a0, ground: 0xc08850, fillI: 1.35, rim: 0xffd090, rimI: .45, rimDir: [2, 1.5, -2], shadow: .3, area: 3 };

// ---- shot A: the corner
const shA = shot({
  plate: 'chambre_jour', light: { ...LIGHT_JOUR, keyI: 1.1, fillI: 1.2 },
  async build(S3, cal) {
    const M = {}, mo = await role('mohammed', { seat: true }), cam = S3.cam.position.clone().setY(0), at = S3.floorAt(1400, 800);
    S3.add(mo, at.x, at.z, yawTo(at, cam) * .75 - .35);
    M.sit = memoPose('s18corner2', mo, [at], () => PO.kneel(mo, { lean: .3 }).map?.(e => +e.toFixed(3)));
    const base = PO.snap(mo);
    return { actors: [mo], faces: [[mo, null, 5, (lt, t) => ({ sad: 1, lid: .35, open: 0 })]], M, mo, base };
  },
  cover: [{ t: 0, size: 'W' }, { t: a0 + 2.5, size: 'M', on: 'mohammed', dy: 40 }, { t: a0 + 6.5, size: 'CU', on: 'mohammed' }],
  frame(lt, u, t, S, s) {
    const { mo, M, base } = s;
    PO.apply(mo, base);
    const hic = Math.max(0, Math.sin(t * 3.1)) ** 6;   // sniffle hiccups
    mo.B.chest.rotation.x += .03 + .04 * hic; mo.B.head.rotation.x += .22 + .06 * hic; mo.group.updateMatrixWorld(true);
    const hd = IK.wpos(mo.B.head), f = dirW(mo, 0, 0, 1), sd = dirW(mo, 1, 0, 0);
    M.eye = +PO.reach(mo, 'R', hd.clone().addScaledVector(f, .09).addScaledVector(sd, -.035).add(V(0, -.015 + .008 * Math.sin(t * 5), 0)), { grip: .02 }).toFixed(3);
    breathe(mo, t, 1.4, 0);
  },
});

// ---- shot B: lying on the mattress
const shB = shot({
  plate: 'chambre_jour', light: { ...LIGHT_JOUR, keyI: 1.0, fillI: 1.15 },
  async build(S3, cal) {
    const M = {}, hz = cal.horizon, tb = S3.floorAt(862, 747), mF = S3.floorAt(862, 677), mH = cal.h * (1 - (590 - hz) / (677 - hz));   // the back divan: painted top edge y 590, floor line y 677 (.38 m)
    S3.prop(PR.tabla({ r: .25, h: cal.h * (1 - (676 - hz) / (747 - hz)) }), tb.x, 0, tb.z - .12);
    const mo = await role('mohammed', { seat: true }), mAt = V(tb.x, 0, mF.z - .42);
    S3.add(mo, mAt.x, mAt.z, 0); mo.group.rotation.y = Math.PI / 2; mo.group.updateMatrixWorld(true);
    M.lie = memoPose('s18lie2', mo, [mAt, mH], () => { const r = PO.lie(mo, { top: mH, turn: -.35, pillow: .07 }); return { low: +(r.low - mH).toFixed(3), pil: r.pillowAt.toArray() }; });
    const base = PO.snap(mo); S3.prop(PR.cushion({ w: .4, d: .3, h: .07, col: 0xe0d0a8 }), M.lie.pil[0], mH, M.lie.pil[2]);
    return { actors: [mo], faces: [[mo, null, 5, (lt, t) => ({ lid: .55 + .3 * sm(a1 + 8, a1 + 10, t), sad: .3 })]], M, mo, base };
  },
  cover: [{ t: a1, size: 'W' }, { t: a1 + 4, size: 'CU', on: 'mohammed', dx: 30 }, { t: a1 + 10, size: 'M', on: 'mohammed' }],
  frame(lt, u, t, S, s) {
    const { mo, base } = s; PO.apply(mo, base);
    mo.B.head.rotation.y -= .2 * sm(a1, a1 + 3, t); mo.group.updateMatrixWorld(true);
    breathe(mo, t, .8, 0);
  },
});

window.__s18 = [shA, shB];
export default make({ preload: all(shA, shB), plate: 'chambre_jour', segs: [ac([0, 0], shA.fn), ac([1, 0], shB.fn), st('p08_prince', [2, 0], 'push')] });
