// s17 back to the street. b062 CU (barbier): the towel off, Mohammed pale and light-headed on the stool, eyes searching
// for his father. b063 M: the father, already down from the platform, walks over and lays a hand on his shoulder ("Viens.
// L'air frais te fera du bien"); the boy slides off the stool. b064 W (barbier_ext_rev): from the shop doorstep, the two
// walk away hand in hand into the dazzling street, the light flooding the frame.
import * as PO from '../../../engine/poses.js';
import { shot, role, memoPose, breathe } from './_3d.js';
import { beatScene, lines, idle, at, front, dirW, sm, V } from '../lib/beatscene.js';
import { walk, pair, hold } from '../lib/acts.js';
import { shopIn } from '../lib/shop7.js';
import { c } from '../../../engine/core.js';

const L = lines('s17_rue');
const OFF = L[1][1] - .2;   // the boy slides off the stool at the end of the father's line

const sh = shot({
  plate: 'barbier',
  async build(S3) {
    const P = shopIn(S3);
    const mo = await role('mohammed', { seat: true }), ms = await role('mohammed', { copy: '_s' });
    const fw = await role('father'), ba = await role('barber');
    const seat = P.sh, rung = seat - .3;
    S3.add(mo, P.stool.x, P.stool.z, Math.atan2(P.cam.x - P.stool.x, P.cam.z - P.stool.z));
    memoPose('mo-stool', mo, [seat], () => PO.stool(mo, { seat, floor: rung, hands: false, fz: .26, ankle: .05, spread: .1 }));
    const R = PO.snap(mo);
    S3.qa.supports.mohammed = rung;
    // the standing copy, just in front of the stool, for the slide-off
    const down = P.stool.clone().addScaledVector(dirW(mo, 0, 0, 1), .32);
    S3.add(ms, down.x, down.z, mo.group.rotation.y); ms.name = 'mohammed';
    // the father: down from the platform at its front corner, walks to the boy's side
    const f0 = S3.floorAt(640, 1070), f1 = P.stool.clone().add(f0.clone().sub(P.stool).setY(0).normalize().multiplyScalar(.5));
    S3.add(fw, f0.x, f0.z, 0);
    const bp = S3.floorAt(1300, 900); S3.add(ba, bp.x, bp.z, Math.atan2(P.cam.x - bp.x, P.cam.z - bp.z) - .4);
    return {
      actors: [mo, ms, fw, ba], mo, ms, fw, ba, R, f0, f1, cam: P.cam,
      faces: [[mo, null, 1, { lid: .3, sad: .3 }], [ms, null, 1, { lid: .2 }], [fw, 'father', 2], [ba, null, 5]],
    };
  },
  frame(lt, u, t, S, st) {
    const { mo, ms, fw, ba, R, f0, f1, cam } = st;
    const off = t >= OFF;
    mo.group.visible = !off; ms.group.visible = off;
    idle(fw, t, 2); idle(ba, t, 5);
    const w = walk(fw, f0, f1, L[1][0] - .4, L[1][0] + 1.6, t, { cps: 1.6 });
    if (w >= 1) { fw.group.rotation.y = Math.atan2(at(mo, 'root').x - f1.x, at(mo, 'root').z - f1.z); fw.group.updateMatrixWorld(true); }
    const kid = off ? ms : mo;
    if (!off) {
      PO.apply(mo, R); breathe(mo, t, 1, 1);
      // light-headed: a slow sway; eyes search left (the platform) then find the father
      mo.B.head.rotation.z += .05 * Math.sin(t * 1.3); mo.B.head.updateWorldMatrix(false, true);
      PO.look(mo, w > 0 ? at(fw, 'head') : at(mo, 'head').addScaledVector(dirW(mo, 0, 0, 1), 1).addScaledVector(dirW(mo, 1, 0, 0), .8 * Math.sin(t * .7)), .6);
    } else { idle(ms, t, 1); PO.look(ms, at(fw, 'head'), .6); }
    // the father's hand on the boy's shoulder once he is there
    const hand = sm(L[1][0] + 1.5, L[1][0] + 2.1, t), k = fw.group.scale.y / 1.6;
    if (hand > 0) PO.reach(fw, 'R', front(fw, 'chest', .2 * k, .1 * k, -.25 * k).lerp(at(kid, 'upperArmL').add(V(0, .04, 0)), hand), { grip: .04 });
    PO.look(fw, w > 0 ? at(kid, 'head') : V(cam.x, 1.4, cam.z), .6);
    PO.look(ba, at(kid, 'head'), .5);
  },
});

const ru = shot({
  plate: 'barbier_ext_rev',
  light: { keyI: 2.5, fillI: 1.3, sky: '#fff1d8' },
  async build(S3) {
    const fa = await role('father'), mo = await role('mohammed');
    const p0 = S3.floorAt(980, 1150), p1 = S3.floorAt(760, 720);
    S3.add(fa, p0.x, p0.z, 0); S3.add(mo, p0.x, p0.z, 0);
    return { actors: [fa, mo], fa, mo, p0, p1, faces: [[fa, null, 2], [mo, null, 3]] };
  },
  frame(lt, u, t, S, st) {
    const { fa, mo, p0, p1 } = st;
    idle(fa, t, 2); idle(mo, t, 3);
    pair(fa, mo, p0, p1, L[2][0] - .3, L[2][0] + 7.5, t);
    hold(fa, mo, t);
    PO.look(mo, at(mo, 'head').addScaledVector(dirW(mo, 0, 0, 1), 1).add(V(0, .35, 0)), .5);   // eyes up: the vine, the light
  },
  over(lt, u, t) {   // the overexposure: the white of the street floods in, then settles
    const k = .55 * (1 - sm(.2, 2.2, lt)) + .12;
    c.save(); c.globalCompositeOperation = 'screen'; c.fillStyle = `rgba(255,248,225,${k})`; c.fillRect(-1920, -1080, 5760, 3240); c.restore();
  },
});

export { sh, ru };
export default beatScene('s17_rue', {
  shots: { sh, ru },
  plan: {
    b062: { shot: 'sh', size: 'CU', on: 'mohammed' },
    b063: { shot: 'sh', size: 'M', on: 'father' },
    b064: { shot: 'ru', size: 'W' },
  },
});
