// s05 Hammoussa. b010 stairs (escalier): Mohammed on the bottom landing leans toward the dark corridor, listening to
// Zoubida off screen. b011 patio by morning (patio_matin): Mohammed shuffles in, his babouches slipping, toward tiny
// Hammoussa ("pois chiche", Azzouz Berrada) waiting by the well; the label is drawn by the exam layer. b012 CU Hammoussa
// waves him over with a sleeve that swallows his hand.
import * as PO from '../../../engine/poses.js';
import { shot, role } from './_3d.js';
import { beatScene, lines, put, idle, at, sm, V } from '../lib/beatscene.js';
import { walk, wave } from '../lib/acts.js';

const L = lines('s05_hammoussa');
const es = shot({
  plate: 'escalier',
  async build(S3) {
    const mo = await role('mohammed');
    const corr = S3.floorAt(250, 1000);
    put(S3, mo, 1030, 1055, corr);
    return { actors: [mo], mo, corr, faces: [[mo, null, 3, () => ({ open: 0 })]] };
  },
  frame(lt, u, t, S, st) {
    const { mo, corr } = st;
    idle(mo, t, 3, corr.clone().add(V(0, 1.3, 0)), .7);
    // leans in to listen: chest forward, head cocked
    const k = sm(L[0][0], L[0][0] + 1.2, t);
    mo.B.spine.rotation.x += .14 * k; mo.B.head.rotation.z += .18 * k; mo.B.spine.updateWorldMatrix(false, true);
  },
});

const pa = shot({
  plate: 'patio',
  async build(S3) {
    const cam = S3.cam.position.clone().setY(0);
    const mo = await role('mohammed'), ha = await role('hammoussa');
    const p0 = S3.floorAt(300, 1040), p1 = S3.floorAt(770, 1000), ph = S3.floorAt(1050, 960);
    put(S3, ha, 1050, 960, cam.clone().lerp(p1, .5));
    put(S3, mo, 300, 1040, p1);
    return { actors: [mo, ha], mo, ha, p0, p1, ph, cam, faces: [[mo, null, 3], [ha, 'hammoussa', 4]] };
  },
  frame(lt, u, t, S, st) {
    const { mo, ha, p0, p1, ph } = st;
    idle(ha, t, 4);
    // Mohammed shuffles in during b011 (short steps: the babouches slip at the heel), stops facing Hammoussa
    idle(mo, t, 3);
    const t0 = L[1][0] + .3, t1 = L[1][1] - .3;
    const w = walk(mo, p0, p1, t0, t1, t, { cps: 2.4 });
    if (w >= 1) { mo.group.rotation.y = Math.atan2(ph.x - p1.x, ph.z - p1.z); mo.group.updateMatrixWorld(true); }
    if (w > 0 && w < 1) { mo.B.footL.rotation.x += .25 * Math.max(0, Math.sin(t * 15)); mo.B.footR.rotation.x += .25 * Math.max(0, -Math.sin(t * 15)); }
    PO.look(mo, at(ha, 'head'), .5 * sm(t0, t1, t));
    PO.look(ha, at(mo, 'head'), .8);
    // b012: the sleeve waves him over
    const k = sm(L[2][0] - .2, L[2][0] + .3, t);
    if (k > 0) wave(ha, t, k, 'R');
  },
});

export { es, pa };
export default beatScene('s05_hammoussa', {
  shots: { es, pa },
  plan: {
    b010: { shot: 'es', size: 'M', on: 'mohammed' },
    b011: { shot: 'pa', size: 'W', cover: [{ f: .6, size: 'M', on: 'hammoussa' }] },
    b012: { shot: 'pa', size: 'CU', on: 'hammoussa' },
  },
});
