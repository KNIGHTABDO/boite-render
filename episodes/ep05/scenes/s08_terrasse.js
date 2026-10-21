// s08: the terrace in the afternoon. Rahma sits cross-legged on the sheepskin in the shade of the left wall, combing her
// oiled black hair; Zoubida, cross-legged on the mat beside her, tells Lalla Aïcha's story (sold everything, the
// jewels, the Balance on Judgment Day), Rahma answers between two strokes; at the end Zoubida is sad and tired.
// Contacts (st.M): hips on the sheepskin / mat (crossLegged), the comb's grip in Rahma's right palm with its teeth on the
// hair (comb -> head distance), Zoubida's talking hand (reach error).
import * as K from '../../../engine/core.js';
import { cast } from '../../../engine/stage3d.js';
import * as PR from '../../../engine/props3d.js';
import * as PO from '../../../engine/poses.js';
import * as IK from '../../../engine/ik.js';
import { make, ac } from './_pt.js';
import { shot, all, breathe, V, memoPose, skirt } from './_3d.js';
const { clamp, ease, key, noise } = K;
const sm = (a, b, x) => ease((x - a) / (b - a));
const dirW = (a, x, y, z) => V(x, y, z).normalize().applyAxisAngle(V(0, 1, 0), a.group.rotation.y);
const yawTo = (from, to) => Math.atan2(to.x - from.x, to.z - from.z);
const RAHMA = [2, 4, 6], ZOUB = [1, 3, 5, 7];

const sh = shot({
  plate: 'terrasse_peau',
  light: { key: 0xfff0d0, keyI: 1.05, dir: [-1.2, 2.5, -2], sky: 0xb8c8e0, ground: 0xd8b080, fillI: 1.65, rim: 0xffe0a0, rimI: .75, rimDir: [-1.2, 2, -2], shadow: .3, area: 3 },
  async build(S3, cal) {
    const M = {};
    const rAt = S3.floorAt(380, 800), zAt = S3.floorAt(760, 760), mid = rAt.clone().lerp(zAt, .5).add(V(0, 0, 2.5));
    const rah = await cast('rahma', { seat: true }), zou = await cast('zoubida', { seat: true });
    S3.add(rah, rAt.x, rAt.z, yawTo(rAt, mid)); S3.add(zou, zAt.x, zAt.z, yawTo(zAt, mid));
    M.rah = memoPose('s08r', rah, [rAt], () => PO.crossLegged(rah, { seat: .03, lean: .08 }).map(e => +e.toFixed(3)));
    M.zou = memoPose('s08z', zou, [zAt], () => PO.crossLegged(zou, { seat: .012, lean: .12 }).map(e => +e.toFixed(3)));
    M.seat = [+(PO.lowestOf(rah, ['root', 'thighL', 'thighR']) - .03).toFixed(3), +(PO.lowestOf(zou, ['root', 'thighL', 'thighR']) - .012).toFixed(3)];
    skirt(S3, rah, .03, 0x7a2420); skirt(S3, zou, .012, 0x3e4a66);
    const rBase = PO.snap(rah), zBase = PO.snap(zou), comb = S3.prop(PR.comb({ col: 0xf0d8a0 }), 0, 0, 0); comb.scale.setScalar(1.3);
    const lapR = PO.handPts(rah, 'L').palm, lapZ = PO.handPts(zou, 'R').palm;
    return { actors: [rah, zou], faces: [[rah, 'rahma', 2], [zou, 'zoubida', 6, (lt, t) => ({ sad: sm(64, 67, t) * .6 })]], M, rah, zou, rBase, zBase, comb, lapR, lapZ,
      rp: S3.project(IK.wpos(rah.B.head)), zp: S3.project(IK.wpos(zou.B.head)) };
  },
  frame(lt, u, t, S, st) {
    const { rah, zou, M, comb } = st;
    PO.apply(rah, st.rBase); PO.apply(zou, st.zBase);
    const speaking = ids => ids.reduce((m, i) => { const [a, b] = S.L(i); return Math.max(m, clamp(sm(a - .3, a + .3, t) - sm(b - .2, b + .4, t))); }, 0);
    const rTalk = speaking(RAHMA), zTalk = speaking(ZOUB);
    // Rahma combs with her left hand, the side toward the camera (one stroke every 2.6 s: crown -> down the hair to the breast), stops while she talks
    const h = IK.wpos(rah.B.head), sd = dirW(rah, 1, 0, 0), fw = dirW(rah, 0, 0, 1), c = (t % 2.6) / 2.6, comb_ = 1 - rTalk;
    const crown = h.clone().add(V(0, .12, 0)).addScaledVector(sd, .09).addScaledVector(fw, .05);
    const ear = h.clone().addScaledVector(sd, .17).addScaledVector(fw, .06).add(V(0, -.02, 0)), low = h.clone().addScaledVector(sd, .17).addScaledVector(fw, .13).add(V(0, -.3, 0));
    let tgt = c < .45 ? crown.clone().lerp(ear, ease(c / .45)) : c < .8 ? ear.clone().lerp(low, ease((c - .45) / .35)) : low.clone().lerp(crown, ease((c - .8) / .2));
    tgt = st.lapR.clone().lerp(tgt, comb_);
    M.reachR = +PO.reach(rah, 'L', tgt, { grip: .03 }).toFixed(3);
    const palm = PO.handPts(rah, 'L').palm; comb.position.copy(palm); comb.quaternion.setFromUnitVectors(V(0, -1, 0), h.clone().sub(palm).normalize());
    M.combToHead = +palm.distanceTo(h).toFixed(3);
    PO.look(rah, zTalk > .5 ? IK.wpos(zou.B.head) : IK.wpos(zou.B.head).lerp(V(h.x, .2, h.z + 1), .5), .6);
    breathe(rah, t, 1, 1);
    // Zoubida: talking hand (beats in front of her chest) during her lines; hands drop to the lap at "triste et fatiguée"
    const c0 = IK.wpos(zou.B.chest), zf = dirW(zou, 0, 0, 1), zs = dirW(zou, -1, 0, 0), tired = sm(64, 67, t);
    const hz = c0.clone().addScaledVector(zf, .28).addScaledVector(zs, .14).add(V(noise(t * 1.2, 4) * .07, -.12 + Math.max(0, noise(t * 1.6, 5)) * .1, 0));
    if (zTalk * (1 - tired) > .01) M.reachZ = +PO.reach(zou, 'R', st.lapZ.clone().lerp(hz, zTalk * (1 - tired)), { grip: .05 }).toFixed(3);
    zou.B.spine.rotation.x += .12 * tired; zou.B.head.rotation.x += .2 * tired; zou.group.updateMatrixWorld(true);
    PO.look(zou, IK.wpos(rah.B.head), .6 * (1 - tired));
    breathe(zou, t, 1 + tired * .5, 4);
  },
  view(lt, u, t, S) {
    const [rx, ry] = sh.st.rp, [zx, zy] = sh.st.zp, mx = (rx + zx) / 2, my = (ry + zy) / 2;
    // wide (the city), push to Rahma combing for the narration, two-shot for the talk, closer on Zoubida at the end
    return [key(t, [[0, 960], [6, rx + 60], [14, rx + 60], [17, mx], [62, mx], [66, zx]]), key(t, [[0, 540], [6, ry + 120], [14, ry + 120], [17, my + 120], [62, my + 120], [66, zy + 100]]), key(t, [[0, 1], [6, 1.7], [14, 1.75], [17, 1.35], [62, 1.4], [66, 1.8]])];
  },
});

window.__s08 = sh;
export default make({ preload: all(sh), plate: 'ep05/terrasse_peau', segs: [ac([0, 0], sh.fn)] });
