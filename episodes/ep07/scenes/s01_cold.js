// s01 cold open: 2.2 s of black (only the razor on the stone), the razor insert, then a CU of Mohammed wrapped to the chin in
// the striped towel on the barber's painted stool (POV of the mirror: he faces us), Si Abderrahman behind him talking and
// stropping. b002: the blade comes to the nape, insert, SMASH to the façade ablaze, black on "la plus belle nuit".
import * as PO from '../../../engine/poses.js';
import { rest, idlePose } from '../../../engine/rig3d.js';
import { shot, role, memoPose, breathe } from './_3d.js';
import { beatScene, lines, heightAt, put, at, front, dirW, orient, sm, V } from '../lib/beatscene.js';
import { serviette, rasoir } from '../lib/props7.js';
import * as K from '../../../engine/core.js';

const L = lines('s01_cold');
const ba = shot({
  plate: 'barbier',
  async build(S3) {
    const cam = S3.cam.position.clone().setY(0);
    const mo = await role('mohammed', { seat: true }), br = await role('barber');
    const seat = heightAt(S3, 1005, 930, 738), p = put(S3, mo, 1005, 930, cam);   // the painted stool: centre of its four feet, top edge
    const rung = seat - .3;   // a child's feet rest on the stool rung, not the floor
    memoPose('mo-stool', mo, [seat], () => PO.stool(mo, { seat, floor: rung, hands: false, fz: .26, ankle: .05, spread: .1 }));
    const sit = PO.snap(mo);
    // the barber stands behind him, a little to his left (screen right), turned to the nape
    const bp = p.clone().addScaledVector(dirW(mo, 0, 0, -1), .5).addScaledVector(dirW(mo, -1, 0, 0), -.28);
    S3.add(br, bp.x, bp.z, Math.atan2(p.x - bp.x, p.z - bp.z) - .25);
    const neck = at(mo, 'neck'), towel = S3.prop(serviette(.06, .21, neck.y - seat + .02), neck.x, neck.y + .03, neck.z);
    const raz = S3.prop(rasoir());
    S3.qa.supports.mohammed = rung;
    raz.userData.qa = { grip: true, hand: 'R', owner: 'barber' };
    return { actors: [mo, br], mo, br, sit, towel, raz, cam, faces: [[mo, 'mohammed', 1], [br, null, 2, (lt, t) => ({ open: t < L[1][0] ? K.clamp((K.noise(t * 8, 3) - .3) * 1.8) * .7 : 0 })]] };
  },
  frame(lt, u, t, S, st) {
    const { mo, br, sit, raz, cam } = st;
    PO.apply(mo, sit); breathe(mo, t * 1.6, 1.3, 1);   // short, scared breaths
    PO.look(mo, V(cam.x, .95, cam.z), .5);
    rest(br.B); idlePose(br.B, t, 1); breathe(br, t, 1, 2);
    // b001: stropping in the air beside his chest while he talks; b002: the edge comes down to the nape
    const k = sm(L[1][0] + .2, L[1][0] + 1.1, t);
    const nape = at(mo, 'neck').addScaledVector(dirW(mo, 0, 0, -1), .06).add(V(0, .03, 0));
    const strop = front(br, 'chest', .32, .12, -.12 + .03 * Math.sin(t * 5));
    PO.reach(br, 'R', strop.lerp(nape.clone().addScaledVector(dirW(mo, -1, 0, 0), .05), k), { grip: .02 });
    PO.reach(br, 'L', at(mo, 'head').add(V(0, .12, 0)).addScaledVector(dirW(mo, 0, 0, -1), .02), { grip: .03 });   // his hand on the boy's crown
    const palm = PO.handPts(br, 'R').palm;
    orient(raz, palm, V(0, 1, 0).lerp(nape.clone().sub(palm).normalize(), k).add(V(0, .001, 0)), dirW(br, 0, 0, 1));
    PO.look(br, k > .5 ? nape : V(cam.x, 1.2, cam.z), .7);
  },
});

export { ba };
export default beatScene('s01_cold', {
  shots: { ba }, pre: 'black',
  plan: {
    b001: { shot: 'ba', insAt: 0 },
    b002: { shot: 'ba', insAt: .2, after: 'black' },
  },
});
