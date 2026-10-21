// s23: everyone laughing and complimenting Rahma on the patio (0); night, Mohammed in bed smiling in his sleep, dreaming of the
// gilet (1). Bed = the chambre mattress (lie solve copied from ep05 s20), blanket over the lower body, night light, fade out.
import * as PO from '../../../engine/poses.js';
import * as IK from '../../../engine/ik.js';
import * as PR from '../../../engine/props3d.js';
import { make, ac } from './_pt.js';
import { shot, all, breathe, V, role, memoPose, CAL } from './_3d.js';
import { patioShot, timing } from './s20_chant.js';
const { L } = await timing('s23_fin');
const B0 = L[0][0], B1 = L[1][0];
const patio = patioShot([{ t: 0, v: [1230, 520, 1.4] }, { t: 4.2, on: 'rahma', z: 2.3, hy: .33, dy: 10 }], (t) => {
  const lg = .65 + .2 * Math.sin(t * 2);
  return { zoubida: { laugh: lg, look: 'rahma' }, mohammed: { laugh: lg, bounce: .04 * Math.abs(Math.sin(t * 7)) }, fatma: { laugh: lg, look: 'rahma' },
    rahma: { laugh: .35, talk: 0, look: 'zoubida' }, kanza: { done: true, laugh: lg, look: 'rahma' } };
});
const NIGHT = { key: 0x8898e0, keyI: 1.0, dir: [1, 3, 1.5], sky: 0x303a80, ground: 0x2a2030, fillI: 1.1, rim: 0xffc890, rimI: .5, rimDir: [-1, 2, -3], shadow: .3, area: 3 };
const bed = shot({
  plate: 'chambre_nuit', light: NIGHT,
  async build(S3, cal) {
    const M = {}, hz = cal.horizon, tb = S3.floorAt(862, 747), mF = S3.floorAt(862, 685), mH = cal.h * (1 - (644 - hz) / (685 - hz));
    const mo = await role('mohammed', { seat: true }), mAt = V(tb.x, 0, mF.z - .36);
    S3.add(mo, mAt.x, mAt.z, 0);
    memoPose('s23sit', mo, [mAt, mH], () => PO.crossLegged(mo, { seat: mH, lean: .12 }).map(e => +e.toFixed(3)));
    mo.group.rotation.y = Math.PI / 2; mo.group.updateMatrixWorld(true);
    M.lie = memoPose('s23lie', mo, [mAt, mH], () => { const r = PO.lie(mo, { top: mH, turn: -.35, pillow: .07 }); return { low: +(r.low - mH).toFixed(3), heel: r.heel, pil: r.pillowAt.toArray() }; });
    const lieS = PO.snap(mo);
    S3.prop(PR.cushion({ w: .4, d: .3, h: .07, col: 0xd0c098 }), M.lie.pil[0], mH, M.lie.pil[2]);
    const hd = IK.wpos(mo.B.head), fx = IK.wpos(mo.B.chest);
    const blk = S3.prop(PR.mattress({ w: 1.0, d: .7, h: .1, col: 0x4a5a98 }), fx.x, mH + .1, fx.z + .02, Math.PI / 2);
    return { actors: [mo], mo, lieS, M, faces: [[mo, 'mohammed', 5, (lt, t) => ({ lid: 1, open: 0, sad: -.35 })]], blk };
  },
  frame(lt, u, t, S, st) { PO.apply(st.mo, st.lieS); breathe(st.mo, t, .6, 0); },
  cover: [{ t: B1, size: 'M', on: 'mohammed' }],
});
export default make({ preload: all(patio, bed), plate: 'patio_matin', fadeOut: 1.2, segs: [ac([0, 0], patio.fn), ac([1, 0], bed.fn)] });
