// s08: "I forgave everything". Line 0: Fatma Bziouya laughs heartily at her window (3D, fenetre_fatma); line 1: painting P4
// (the things he forgives, dream); line 2: Mohammed beaming and magnanimous in the morning patio (3D, patio_matin).
// Plates have no ep06 cal: seeded here from the old 2D persp() numbers (patio: adult 230 px at y880 / 480 px at y1060).
// Contacts: Fatma on the sill step (.35 m), hands on her belly (reach); Mohammed's hands on his hips, then open arm sweep.
import * as K from '../../../engine/core.js';
import * as PO from '../../../engine/poses.js';
import * as IK from '../../../engine/ik.js';
import { rest, idlePose } from '../../../engine/rig3d.js';
import { make, st, ac } from './_pt.js';
import { shot, all, breathe, V, role, CAL } from './_3d.js';
const { clamp, ease } = K;
const sm = (a, b, x) => ease((x - a) / (b - a));
const dirW = (a, x, y, z) => V(x, y, z).normalize().applyAxisAngle(V(0, 1, 0), a.group.rotation.y);

CAL['ep04/fenetre_fatma'] = { h: 1.0, horizon: 540, fov: 50 };
CAL.patio_matin = { h: 1.19, horizon: 714, fov: 50 };
const SC = (await (await fetch(new URL('../timing.json', import.meta.url))).json()).find(s => s.id === 's08_pardon');
const L = SC.lines.map(l => [l.start - SC.start, l.start - SC.start + l.dur]);

const win = shot({
  plate: 'ep04/fenetre_fatma',
  light: { key: 0xffe8c8, keyI: 1.6, dir: [-1.5, 2.5, 3], sky: 0xc8d4f0, ground: 0x9a7a58, fillI: 1.5, rim: 0xffe0a0, rimI: .7, rimDir: [2, 2, -3], shadow: 0 },
  async build(S3) {
    const f = await role('fatma'), at = S3.floorAt(1050, 800, .35);
    S3.add(f, at.x, at.z, 0); f.group.position.y = .35;
    return { actors: [f], f, faces: [[f, null, 3, (lt, t) => { const k = sm(.6, 1.2, t); return { open: k * (.55 + .4 * Math.sin(t * 11)), lid: k * .55 }; }]] };
  },
  cover: [{ t: 0, size: 'W' }, { t: 1.2, size: 'M', on: 'fatma' }, { t: 6.5, size: 'CU', on: 'fatma' }],
  frame(lt, u, t, S, { f }) {
    rest(f.B); idlePose(f.B, t, 1);
    const k = sm(.6, 1.2, t) * (1 - sm(L[0][1] - .5, L[0][1] + .3, t));
    const sh = Math.sin(t * 12) * k, ch = IK.wpos(f.B.chest), fw = dirW(f, 0, 0, 1), sd = dirW(f, 1, 0, 0);
    f.B.head.rotation.x += -.3 * k + sh * .04; f.B.head.rotation.z += Math.sin(t * 2.1) * .06 * k;
    f.B.chest.rotation.x += -.1 * k + sh * .035; f.B.spine.rotation.x += sh * .02;
    f.group.updateMatrixWorld(true);
    const bel = ch.clone().addScaledVector(fw, .2).add(V(0, -.28 + sh * .015, 0));
    PO.reach(f, 'R', bel.clone().addScaledVector(sd, -.1), { grip: .03 }); PO.reach(f, 'L', bel.clone().addScaledVector(sd, .12).add(V(0, .08 * (1 - k), 0)), { grip: .03 });
    breathe(f, t, 1, 2);
  },
});

const pat = shot({
  plate: 'patio_matin',
  light: { key: 0xffe0b0, keyI: 1.7, dir: [-2.5, 3, 1.5], sky: 0xc0c8f0, ground: 0x8a6a50, fillI: 1.5, rim: 0xffe0a0, rimI: .7, rimDir: [2, 2, -3], shadow: .3 },
  async build(S3) {
    const m = await role('mohammed'), at = S3.floorAt(960, 1030);
    S3.add(m, at.x, at.z, 0);
    return { actors: [m], m, faces: [[m, null, 5, (lt, t) => ({ lid: .25 })]] };
  },
  cover: [{ t: L[2][0] - .1, size: 'M', on: 'mohammed', dy: -40 }, { t: L[2][0] + 3.5, size: 'CU', on: 'mohammed' }],
  frame(lt, u, t, S, { m }) {
    rest(m.B); idlePose(m.B, t, 1);
    m.B.head.rotation.x += -.12; m.B.chest.rotation.x += -.06;      // chin up, chest out
    m.group.updateMatrixWorld(true);
    const sw = sm(L[2][0] + 1, L[2][0] + 2.2, t) * (1 - sm(L[2][0] + 4.5, L[2][0] + 5.5, t)), ch = IK.wpos(m.B.chest), hp = IK.wpos(m.B.root);
    const fw = dirW(m, 0, 0, 1), sd = dirW(m, 1, 0, 0);
    PO.reach(m, 'L', hp.clone().addScaledVector(sd, .21).addScaledVector(fw, .02).add(V(0, .04, 0)), { grip: .03 });   // left fist on the hip
    const out = ch.clone().addScaledVector(sd, -.3).addScaledVector(fw, .3).add(V(0, -.1 + .06 * Math.sin(t * 2), 0));   // right arm sweeps over the world
    PO.reach(m, 'R', hp.clone().addScaledVector(sd, -.21).addScaledVector(fw, .02).add(V(0, .04, 0)).lerp(out, sw), { grip: .03 });
    breathe(m, t, 1, 1);
  },
});

export default make({ preload: all(win, pat), plate: 'ep04/fenetre_fatma', segs: [ac([0, 0], win.fn), st('p04_pardon', [1, 0], 'pushL'), ac([2, 0], pat.fn)] });
