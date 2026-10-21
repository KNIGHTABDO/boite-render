// s15: leaning on the gallery balustrade, Mohammed dreams of the barber's funeral procession: the turbans, the chant
// (P8a), the dead man sewn in white sailing on a sea of heads (P8b, the lonely bier he once saw); back to him for
// "Pour me consoler, mon père m'avait raconté une histoire."
// Plate galerie_jour (cal: h 1.15, horizon 471, rail top .9 at z -4.72). Seen from behind, palms on the rail top.
// Contacts (st.M): palms on the rail (PO.rail err), feet on the floor.
import * as K from '../../../engine/core.js';
import { cast } from '../../../engine/stage3d.js';
import * as PO from '../../../engine/poses.js';
import * as IK from '../../../engine/ik.js';
import { make, ac, st } from './_pt.js';
import { shot, all, breathe, V } from './_3d.js';
const { key } = K;
const RZ = -4.72, TOP = .9;

const sh = shot({
  plate: 'galerie_jour',
  light: { key: 0xffe0b0, keyI: 1.3, dir: [1.5, 2.5, -2], sky: 0xd0c4b0, ground: 0xc88a58, fillI: 1.6, rim: 0xffd090, rimI: .7, rimDir: [1.5, 2, -2], shadow: .3, area: 3 },
  async build(S3) {
    const M = {};
    const at = S3.floorAt(831, 809), mo = await cast('mohammed');
    S3.add(mo, at.x, RZ + .22, Math.PI);
    const r = PO.rail(mo, { top: TOP, gap: .2, spread: .17 });
    M.rail = r.err.map(e => +e.toFixed(3)); M.palmY = r.palms.map(p => +(p.y - TOP).toFixed(3));
    M.feet = +PO.lowestOf(mo, Object.keys(mo.B)).toFixed(3);
    return { actors: [mo], faces: [[mo, null, 4, { sad: .4 }]], M, mo, base: PO.snap(mo), hp: S3.project(IK.wpos(mo.B.head)) };
  },
  frame(lt, u, t, S, st) {
    const { mo } = st;
    PO.apply(mo, st.base);
    // dreaming: the head drifts slowly, tilted toward the far side of the patio (where the procession would pass)
    mo.B.head.rotation.y += Math.sin(t * .25) * .12; mo.B.head.rotation.z += .06 + Math.sin(t * .17) * .03;
    mo.group.updateMatrixWorld(true);
    breathe(mo, t, .8, 1);
  },
  view(lt, u, t) {
    const [hx, hy] = sh.st.hp;
    return [key(t, [[0, 960], [18, hx], [60, hx]]), key(t, [[0, 520], [18, hy + 60], [60, hy + 60]]), key(t, [[0, 1.05], [18, 1.6], [43, 1.5], [50, 1.75]])];
  },
});

window.__s15 = sh;
export default make({
  preload: all(sh), plate: 'ep05/galerie_jour',
  segs: [ac([0, 0], sh.fn), st('p08a_turbans', [1, 0], 'pushL'), st('p08b_civiere', [2, 0], 'rise'), ac([3, 0], sh.fn)],
});
