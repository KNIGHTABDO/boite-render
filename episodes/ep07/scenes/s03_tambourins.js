// s03 tambourines. Bedroom by day (chambre_jour): Zoubida tries her goatskin bendir on the open floor, Zineb waits by the
// balcony door with her cheap tambourine (b004 wide, b005 CU on the deep/dry strokes). b006 on the terrace edge
// (terrasse_rampe): Zineb bangs away, cut to Mohammed blowing his tin trumpet. b007 back in the bedroom: Zoubida, a hand
// over her ear, points him out to the stairs (the balcony door, screen left).
import * as PO from '../../../engine/poses.js';
import { shot, role } from './_3d.js';
import { beatScene, lines, put, idle, at, sm, V } from '../lib/beatscene.js';
import { strike, blow, holdDown, point, earCover } from '../lib/acts.js';
import { bendir, tambourin, trompette } from '../lib/props7.js';

const L = lines('s03_tambourins');
const ch = shot({
  plate: 'chambre',
  async build(S3) {
    const cam = S3.cam.position.clone().setY(0);
    const zo = await role('zoubida'), zn = await role('zineb'), mo = await role('mohammed');
    const door = S3.floorAt(150, 1000);
    put(S3, zo, 1120, 965, cam.clone().lerp(door, .25));
    put(S3, zn, 430, 1010, S3.floorAt(1120, 965));
    put(S3, mo, 760, 1040, S3.floorAt(1120, 965));
    const dr = S3.prop(bendir()), tb = S3.prop(tambourin()), tr = S3.prop(trompette());
    for (const [o, owner] of [[dr, 'zoubida'], [tb, 'zineb'], [tr, 'mohammed']]) o.userData.qa = { grip: true, hand: 'L', owner };
    return { actors: [zo, zn, mo], zo, zn, mo, dr, tb, tr, cam, door, faces: [[zo, 'zoubida', 1], [zn, null, 2], [mo, null, 3]] };
  },
  frame(lt, u, t, S, st) {
    const { zo, zn, mo, dr, tb, tr, cam, door } = st, b7 = t >= L[3][0] - .1;
    zn.group.visible = tb.visible = !b7; mo.group.visible = tr.visible = b7;
    idle(zo, t, 1); idle(zn, t, 2); idle(mo, t, 3);
    if (!b7) {
      // b004: she weighs it, taps it once, twice, then plays (b005: deep and dry strokes, eyes half shut toward the window)
      const play = sm(L[0][0] + 1.5, L[0][0] + 2.5, t);
      strike(zo, dr, t < L[0][0] + 2.5 ? 0 : t, { bpm: t < L[1][0] ? 80 : 132 });
      if (play < 1) { /* weighing: the drum rides a little low */ dr.position.y -= .05 * (1 - play); dr.updateMatrixWorld(true); }
      PO.look(zo, t < L[1][0] ? dr.position.clone() : V(cam.x + 1.2, 2.2, cam.z), .5);
      PO.reach(zn, 'L', at(zn, 'chest').add(V(0, .02, 0)).addScaledVector(zn.group.getWorldDirection(V(0, 0, 0)), .22), { grip: .02 });
      tb.position.copy(PO.handPts(zn, 'L').palm); tb.lookAt(at(zo, 'head')); tb.updateMatrixWorld(true);
      PO.look(zn, at(zo, 'head'), .7);
    } else {
      // b007: hand over the ear, the other arm flung at the door and the stairs beyond it
      const k = sm(L[3][0], L[3][0] + .5, t);
      dr.position.copy(V(0, -10, 0)); dr.updateMatrixWorld(true);
      earCover(zo, 'L', k); point(zo, door.clone().add(V(0, 1.2, 0)), k);
      PO.look(zo, at(mo, 'head'), .8);
      holdDown(mo, tr); PO.look(mo, at(zo, 'head'), .8);
    }
  },
});

const tr = shot({
  plate: 'terrasse_rampe',
  async build(S3) {
    const cam = S3.cam.position.clone().setY(0);
    const zn = await role('zineb'), mo = await role('mohammed');
    const pz = S3.floorAt(760, 960), pm = S3.floorAt(1180, 975);
    put(S3, zn, 760, 960, cam.clone().lerp(pm, .4)); put(S3, mo, 1180, 975, cam.clone().lerp(pz, .3));
    const tb = S3.prop(tambourin()), hn = S3.prop(trompette());
    tb.userData.qa = { grip: true, hand: 'L', owner: 'zineb' }; hn.userData.qa = { grip: true, hand: 'R', owner: 'mohammed' };
    return { actors: [zn, mo], zn, mo, tb, hn, cam, faces: [[zn, null, 2], [mo, null, 3, (lt, t) => ({ open: 0 })]] };
  },
  frame(lt, u, t, S, st) {
    const { zn, mo, tb, hn } = st, D = L[2][1] - L[2][0], blowAt = L[2][0] + .36 * D;
    idle(zn, t, 2); idle(mo, t, 3);
    strike(zn, tb, t, { bpm: 170, pat: [1, 1, .6, 1], fwd: .26, up: .04, wild: .6 });   // "comme une sourde"
    PO.look(zn, tb.position.clone(), .4);
    if (t < blowAt) { holdDown(mo, hn); PO.look(mo, at(zn, 'head'), .6); }
    else blow(mo, hn, t, .6 + .4 * Math.abs(Math.sin((t - blowAt) * 2.2)));
  },
});

export { ch, tr };
export default beatScene('s03_tambourins', {
  shots: { ch, tr },
  plan: {
    b004: { shot: 'ch', size: 'W', cover: [{ f: .55, size: 'M', on: 'zoubida' }] },
    b005: { shot: 'ch', size: 'CU', on: 'zoubida' },
    b006: { shot: 'tr', size: 'M', on: 'zineb', cover: [{ f: .34, size: 'M', on: 'mohammed' }] },
    b007: { shot: 'ch', size: 'W' },
  },
});
