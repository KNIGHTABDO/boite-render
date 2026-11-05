// s13 oncle Hammad. Reverse angle (barbier_rev, the vine through the door): a dry man with a goat beard and a monumental
// turban stumbles in from the alley and collapses on the stool in the foreground (b043); CU "je vais mourir" (b044);
// the barber, by the shelf, lays a hand on his shoulder (b045) and rattles off the remedy, counting on his fingers
// (b046, seven fast inserts); b047 Hammad heaves himself up, both palms raised, and shuffles back out.
import * as THREE from 'three';
import * as K from '../../../engine/core.js';
import * as PO from '../../../engine/poses.js';
import { shot, role, breathe } from './_3d.js';
import { beatScene, lines, idle, at, front, sm, V } from '../lib/beatscene.js';
import { walk } from '../lib/acts.js';
import { shopRev, sitStool } from '../lib/shop7.js';

const L = lines('s13_hammad');
const SIT = L[0][0] + 3.2, UP = L[4][0] + .3;   // collapses / heaves himself up

const rv = shot({
  plate: 'barbier_rev',
  async build(S3) {
    const P = shopRev(S3);
    const ha = await role('hammad', { seat: true }), hw = await role('hammad', { copy: '_w' }), ba = await role('barber');
    const R = sitStool(S3, ha, 's13-ha', P.stool, P.sh, P.cam, { lean: .25 });
    (S3.qa?.supports || {}).hammad = P.sh;
    const bp = S3.floorAt(640, 960); S3.add(ba, bp.x, bp.z, Math.atan2(P.stool.x - bp.x, P.stool.z - bp.z));
    const near = P.stool.clone().add(P.stool.clone().sub(P.door).setY(0).normalize().multiplyScalar(-.25));
    S3.add(hw, P.door.x, P.door.z, 0); hw.name = 'hammad';
    // v2 QA: the painted foreground stool stands between the camera and his walk (door -> stool): a depth-only holdout
    // so it hides his legs instead of him being drawn on top of it ("standing on the seat"); off while he sits on it
    const a = S3.floorAt(870, 1030), b = S3.floorAt(1110, 1030), sw = Math.hypot(a.x - b.x, a.z - b.z);
    const hold = S3.holdout(new THREE.BoxGeometry(sw, P.sh, .36), P.stool.x, P.sh / 2, P.stool.z);
    hold.rotation.y = Math.atan2(P.cam.x - P.stool.x, P.cam.z - P.stool.z); hold.updateMatrixWorld(true);
    return {
      actors: [ha, hw, ba], ha, hw, ba, R, P, near, hold,
      faces: [[ha, 'hammad', 7, { lid: .35 }], [hw, 'hammad', 7, { lid: .3 }], [ba, 'barber', 5]],
    };
  },
  frame(lt, u, t, S, st) {
    const { ha, hw, ba, R, P, near, hold } = st;
    // the standing copy walks in / out; the seated copy holds the stool between SIT and UP
    const seated = t >= SIT && t < UP;
    ha.group.visible = seated; hw.group.visible = !seated; hold.visible = !seated;
    if (!seated) {
      idle(hw, t, 7);
      if (t < SIT) {
        walk(hw, P.door, near, L[0][0] + .2, SIT - .25, t, { cps: 1.5 });
        hw.B.spine.rotation.x += .25; hw.B.spine.updateWorldMatrix(false, true);   // stooped, spent
        PO.reach(hw, 'R', front(hw, 'chest', .12, .05, .05), { grip: .03 });       // hand pressed to the chest
      } else {
        walk(hw, near, P.door, UP + 1.4, L[4][1] + .4, t, { cps: 1.5 });
        if (t < UP + 1.4) { hw.group.rotation.y = Math.atan2(P.cam.x - near.x, P.cam.z - near.z); hw.group.updateMatrixWorld(true); }
        const pr = sm(UP, UP + .5, t) * (1 - sm(UP + 1.2, UP + 1.6, t));   // "Dieu te récompensera": both palms up
        if (pr > 0) for (const s of ['L', 'R']) PO.reach(hw, s, front(hw, 'chest', .25, s === 'L' ? -.2 : .2, .2 * pr), { grip: .04 });
        PO.look(hw, t < UP + 1.4 ? at(ba, 'head') : P.alley.clone().setY(1.5), .6);
      }
    } else {
      PO.apply(ha, R); breathe(ha, t, 1.6, 7);   // heavy breathing
      const drop = 1 - sm(SIT, SIT + .25, t); ha.group.position.y = .12 * drop; ha.group.updateMatrixWorld(true);
      PO.look(ha, t < L[2][0] ? at(ha, 'head').add(V(0, .5, 0)).add(P.cam.clone().sub(P.stool).setY(0).normalize()) : at(ba, 'head'), .6);
    }
    // the barber: watches, then a hand on Hammad's shoulder (b045), then counts on his fingers (b046)
    idle(ba, t, 5);
    const sh = sm(L[2][0] + .3, L[2][0] + 1, t) * (1 - sm(L[3][0] - .2, L[3][0] + .3, t));
    const k = ba.group.scale.y / 1.6;
    if (sh > 0 && seated) PO.reach(ba, 'R', front(ba, 'chest', .3 * k, .1 * k, -.2 * k).lerp(at(ha, 'upperArmL').add(V(0, .04, 0)), sh), { grip: .04 });
    if (t >= L[3][0] && t < L[3][1]) {
      const n = Math.floor((t - L[3][0]) / 1.2) % 5, tick = Math.max(0, Math.sin((t - L[3][0]) * Math.PI / .6));
      PO.reach(ba, 'L', front(ba, 'chest', .28 * k, -.06 * k, -.08 * k), { grip: .05 });
      PO.reach(ba, 'R', front(ba, 'chest', .3 * k, .02 * k + .015 * n, (-.06 + .03 * tick) * k), { grip: .02 });
    }
    PO.look(ba, seated ? at(ha, 'head') : at(hw, 'head'), .7);
  },
});

export { rv };
export default beatScene('s13_hammad', {
  shots: { rv },
  plan: {
    b043: { shot: 'rv', size: 'W', cover: [{ f: .55, size: 'M', on: 'hammad' }] },
    b044: { shot: 'rv', size: 'CU', on: 'hammad' },
    b045: { shot: 'rv', size: 'M', on: 'barber' },
    b046: { shot: 'rv', size: 'M', on: 'barber', insAt: .22 },
    b047: { shot: 'rv', size: 'W' },
  },
});
