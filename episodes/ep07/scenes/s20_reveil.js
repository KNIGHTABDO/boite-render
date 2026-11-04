// s20 the 3 a.m. wake-up (chambre_nuit). b073: red light full of sparks (his closed eyelids) under the card LA NUIT DE
// L'ACHOURA; the eyes open on his mother kneeling by the divan, leaning over him ("Réveille-toi !"); insert: the clothes
// laid out. b074 CU: sat up, whining; she wets her hand and passes it over his face (insert). b075 M: the father in his
// fine djellaba, smiling, "Du courage !" twice with a fist. b076 painting montage: shirt / gilet / satchel / djellaba.
// b077 M: Mohammed in his festival costume, chest out: "un autre homme".
import * as THREE from 'three';
import * as K from '../../../engine/core.js';
import * as PO from '../../../engine/poses.js';
import * as PR from '../../../engine/props3d.js';
import { shot, role, memoPose, breathe } from './_3d.js';
import { beatScene, lines, idle, at, front, dirW, sm, V, heightAt, yawTo } from '../lib/beatscene.js';
import { c } from '../../../engine/core.js';

const L = lines('s20_reveil');
const OPEN = 2.6;            // his eyes open: the red eyelid light gives way to the room
const SIT = L[1][0];         // cut to b074: sat up
const FETE = L[4][0];        // cut to b077: dressed

const nu = shot({
  plate: 'chambre_nuit',
  async build(S3) {
    const cam = S3.cam.position.clone().setY(0);
    const ml = await role('mohammed', { seat: true, copy: '_l' }), mo = await role('mohammed', { seat: true });
    const mf = await role('mohammed', { costume: 'fete', copy: '_f' });
    const zo = await role('zoubida', { seat: true }), fa = await role('father');
    // the left divan (foreground): front face foot y 945 / top edge y 800 at x 330; he lies along it, head by the back cushions
    const mh = heightAt(S3, 330, 945, 800);
    const H = S3.floorAt(270, 690, mh).setY(0), F = S3.floorAt(350, 860, mh).setY(0), mid = H.clone().lerp(F, .5);
    S3.add(ml, mid.x, mid.z, 0);
    memoPose('s20-lie', ml, [mh], () => { PO.lie(ml, { top: mh, turn: -.3, pillow: .08 }); });
    // turn the lying body so head -> feet runs along the divan, then centre it
    const hw = at(ml, 'head'), fw = at(ml, 'footL');
    ml.group.rotation.y += Math.atan2(F.x - H.x, F.z - H.z) - Math.atan2(fw.x - hw.x, fw.z - hw.z); ml.group.updateMatrixWorld(true);
    const m2 = at(ml, 'head').lerp(at(ml, 'footL'), .5).setY(0);
    ml.group.position.add(mid.clone().sub(m2)); ml.group.updateMatrixWorld(true);
    const R = { ml: PO.snap(ml) };
    // blanket from the chest to the feet
    const ch0 = at(ml, 'chest'), ft = at(ml, 'footL'), bl = S3.prop(PR.cushion({ w: .42, d: 1, h: .16, col: 0x6a3446 }));
    const bc = ch0.clone().lerp(ft, .5);
    bl.position.set(bc.x, mh - .01, bc.z); bl.rotation.y = Math.atan2(ft.x - ch0.x, ft.z - ch0.z); bl.scale.z = ch0.distanceTo(ft) + .12; bl.updateMatrixWorld(true);
    const pil = S3.prop(PR.cushion({ w: .4, d: .28, h: .08, col: 0xd8c8a0 }), H.x, mh, H.z);
    // sat up: cross-legged on the divan, facing the room
    const sp = H.clone().lerp(F, .55), toward = S3.floorAt(760, 930);
    S3.add(mo, sp.x, sp.z, yawTo(sp, cam.clone().lerp(toward, .5)));
    memoPose('s20-mo', mo, [mh], () => PO.crossLegged(mo, { seat: mh, lean: .12 }));
    R.mo = PO.snap(mo);
    const sup = S3.qa?.supports || {}; sup.mohammed = mh; sup.mohammed_l = mh;
    ml.name = 'mohammed_l'; mf.name = 'mohammed_f';   // coverage 'on' picks the first actor by name: keep each copy addressable
    // the mother kneels on the floor by the divan, facing him
    const zp = S3.floorAt(640, 930); S3.add(zo, zp.x, zp.z, yawTo(zp, sp));
    memoPose('s20-zo', zo, [zp.x, zp.z], () => PO.kneel(zo, { lean: .3, hands: false }));
    R.zo = PO.snap(zo);
    // the father stands back right; the dressed boy stands in the middle of the room
    const fp = S3.floorAt(1180, 880); S3.add(fa, fp.x, fp.z, yawTo(fp, cam.clone().lerp(sp, .6)));
    const dp = S3.floorAt(860, 960); S3.add(mf, dp.x, dp.z, yawTo(dp, cam) - .15);
    return {
      actors: [ml, mo, mf, zo, fa], ml, mo, mf, zo, fa, R, bl, pil, sp, cam,
      faces: [
        [ml, null, 1, (lt, t) => ({ lid: t < OPEN ? 1 : .55, blink: t > OPEN + .3 })],
        [mo, null, 1, (lt, t) => ({ sad: .6, lid: .45, open: t < L[1][0] + 3 ? .3 * Math.max(0, K.noise(t * 5, 1)) : 0 })],
        [mf, null, 1, { lid: .1 }],
        [zo, 'zoubida', 6], [fa, 'father', 2],
      ],
    };
  },
  frame(lt, u, t, S, st) {
    const { ml, mo, mf, zo, fa, R, bl, pil } = st;
    const sat = t >= SIT && t < FETE, fete = t >= FETE;
    ml.group.visible = t < SIT; bl.visible = t < SIT; pil.visible = t < SIT;
    mo.group.visible = sat; mf.group.visible = fete; zo.group.visible = !fete; fa.group.visible = t >= L[2][0] - .1;
    idle(fa, t, 2);
    if (t < SIT) { PO.apply(ml, R.ml); breathe(ml, t, .8, 1); }
    if (!fete) {
      PO.apply(zo, R.zo); breathe(zo, t, 1, 6);
      const kid = t < SIT ? ml : mo, k = zo.group.scale.y / 1.6;
      // b073 a hand on his shoulder, shaking him; b074 the wet hand passed down over his face
      const wipe = sm(L[1][0] + 3.6, L[1][0] + 4.1, t) * (1 - sm(L[1][0] + 5.4, L[1][0] + 6, t)), wp = (t - L[1][0] - 4.1) / 1.3;
      if (t < SIT) PO.reach(zo, 'R', at(kid, 'upperArmL').add(V(0, .04 + .015 * Math.sin(t * 9), 0)), { grip: .04 });
      else if (wipe > 0) PO.reach(zo, 'R', front(zo, 'chest', .3 * k, .1 * k, -.1 * k).lerp(at(kid, 'head', [0, .06 - .1 * K.clamp(wp, 0, 1), .1]), wipe), { grip: .05 });
      PO.look(zo, at(kid, 'head'), .7);
      if (sat) { PO.apply(mo, R.mo); breathe(mo, t, 1.2, 1); PO.look(mo, at(zo, 'head'), .4); mo.B.head.rotation.x += .1; mo.B.head.updateWorldMatrix(false, true); }
      else if (t > OPEN) PO.look(ml, at(zo, 'head'), .5);
    } else {
      // chest out, chin up, fists on the hips
      idle(mf, t, 1); const k = mf.group.scale.y / 1.6;
      mf.B.chest.rotation.x -= .14 * sm(FETE, FETE + .5, t); mf.B.chest.updateWorldMatrix(false, true);
      PO.reach(mf, 'L', front(mf, 'root', .02 * k, -.2 * k, .06 * k), { grip: .06 }); PO.reach(mf, 'R', front(mf, 'root', .02 * k, .2 * k, .06 * k), { grip: .06 });
      PO.look(mf, V(st.cam.x, 1.6, st.cam.z), .5);
    }
    // the father: "Du courage ! Du courage !": a fist raised twice, smiling down at his son
    if (fa.group.visible) {
      const k = fa.group.scale.y / 1.6, f1 = sm(L[2][0] + 2.4, L[2][0] + 2.8, t) * (1 - sm(L[2][0] + 4.6, L[2][0] + 5.2, t));
      if (f1 > 0) PO.reach(fa, 'R', front(fa, 'chest', .25 * k, .15 * k, -.15 * k).lerp(front(fa, 'chest', .3 * k, .18 * k, (.08 + .05 * Math.sin((t - L[2][0]) * 7)) * k), f1), { grip: .08 });
      PO.look(fa, at(fete ? mf : mo, 'head'), .6);
    }
  },
  over(lt, u, t) {
    // his closed eyelids: a deep red glow full of drifting sparks, opening onto the room
    const a = 1 - sm(OPEN - .3, OPEN + .5, t);
    if (a <= 0) return;
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
    const W = c.canvas.width, H = c.canvas.height, s = W / 1920;
    const g = c.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * .7);
    g.addColorStop(0, `rgba(205,48,30,${a})`); g.addColorStop(1, `rgba(70,6,10,${a})`);
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 46; i++) {
      const x = (K.noise(i * 1.7, 3) * .5 + .5) * W + 40 * s * Math.sin(t * .7 + i), y = ((K.noise(i * 2.3, 7) * .5 + .5 + t * .03 * (1 + i % 3)) % 1) * H;
      const r = (3 + 5 * (i % 4)) * s, f = a * (.35 + .35 * Math.sin(t * 3 + i));
      const sg = c.createRadialGradient(x, y, 0, x, y, r * 3); sg.addColorStop(0, `rgba(255,214,120,${f})`); sg.addColorStop(1, 'rgba(255,140,40,0)');
      c.fillStyle = sg; c.fillRect(x - r * 3, y - r * 3, r * 6, r * 6);
    }
    c.restore();
  },
});

export { nu };
export default beatScene('s20_reveil', {
  shots: { nu },
  plan: {
    b073: { shot: 'nu', size: 'CU', on: 'zoubida', insAt: .72 },
    b074: { shot: 'nu', size: 'CU', on: 'mohammed', insAt: .5 },
    b075: { shot: 'nu', size: 'M', on: 'father' },
    b076: { shot: 'p09a_chemise', segs: [[.5, 'p09b_gilet'], [.62, 'p09c_sacoche'], [.72, 'p09d_djellaba']] },
    b077: { shot: 'nu', size: 'M', on: 'mohammed_f' },
  },
});
