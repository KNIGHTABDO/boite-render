// s07 petrol. Bedroom at dusk (chambre_nuit; the painted lamp is masked dark until it is lit): Zoubida shakes the empty
// petrol bottle by her ear, worried, and hurries out (b018). b019 Mohammed at the window, listening to the alley (the
// pedlar's voice off). b020 CU his proud face toward the fine lamp. b021 night falls hard (almost black); Zoubida comes back
// with Rahma's bottle, pours (inserts: candle stub, wick), the lamp is lit and the room blooms warm. b022/b023 CU
// Mohammed, solemn / Zoubida, tender, lamp-lit.
import * as K from '../../../engine/core.js';
import * as PO from '../../../engine/poses.js';
import { shot, role } from './_3d.js';
import { beatScene, lines, put, idle, at, front, dirW, heightAt, orient, sm, V } from '../lib/beatscene.js';
import { walk } from '../lib/acts.js';
import { bouteille } from '../lib/props7.js';
import { c } from '../../../engine/core.js';   // live binding

const L = lines('s07_petrole');
const D3 = L[3][1] - L[3][0], LIT = L[3][0] + .82 * D3;   // the lamp catches after the two inserts
const LAMP = [696, 585];   // painted flame, canvas px
/** 0 = dusk, 1 = black night (b021 start), lamp light after LIT */
const dark = t => t < L[3][0] ? .45 + .1 * sm(0, L[3][0], t) : t < LIT ? .55 + .35 * sm(L[3][0], L[3][0] + 1, t) : .9 * (1 - sm(LIT, LIT + .8, t));

const ch = shot({
  plate: 'chambre_nuit',
  async build(S3) {
    const cam = S3.cam.position.clone().setY(0);
    const zo = await role('zoubida'), mo = await role('mohammed');
    const tableH = heightAt(S3, 700, 790, 690), lamp = S3.floorAt(700, 790).add(V(0, tableH + .1, -.15));
    const zp = put(S3, zo, 900, 860, lamp.clone().setY(0));
    const mp = put(S3, mo, 1080, 930, cam.clone().lerp(lamp.clone().setY(0), .3));   // three-quarter to us: his CUs need the face
    const win = S3.floorAt(1430, 760).add(V(0, 1.4, 0)), wp = S3.floorAt(1300, 830);
    const exit = S3.floorAt(-150, 1000);
    const bt = S3.prop(bouteille(0)), bt2 = S3.prop(bouteille(.8));
    bt.userData.qa = { grip: true, hand: 'R', owner: 'zoubida' }; bt2.userData.qa = { grip: true, hand: 'R', owner: 'zoubida' };
    return { actors: [zo, mo], zo, mo, zp, mp, wp, win, exit, lamp, bt, bt2, cam, faces: [[zo, 'zoubida', 1], [mo, 'mohammed', 3]] };
  },
  frame(lt, u, t, S, st) {
    const { zo, mo, zp, mp, wp, win, exit, lamp, bt, bt2, cam } = st;
    idle(zo, t, 1); idle(mo, t, 3);
    // ---- Zoubida: b018 shakes the empty bottle by her ear, then hurries off left; b021 back from the left, pours
    const b18e = L[1][0] - .2, gone = t > b18e && t < L[3][0] + .6;
    zo.group.visible = !gone; bt.visible = t < b18e; bt2.visible = t >= L[3][0];
    const k = zo.group.scale.y / 1.6;
    if (t < b18e) {
      const sh = Math.sin(t * 18) * sm(L[0][0] + .5, L[0][0] + 1, t);
      const w = walk(zo, zp, exit, b18e - 1.6, b18e + .4, t, { cps: 2.6 });
      if (w > 0) { idle(zo, t, 1); walk(zo, zp, exit, b18e - 1.6, b18e + .4, t, { cps: 2.6 }); }
      const ear = at(zo, 'head').addScaledVector(dirW(zo, -1, 0, 0), .17 * k).addScaledVector(dirW(zo, 0, 0, -1), .03 * k);   // beside her right ear, not over the face
      const hand = w > 0 ? front(zo, 'chest', .18 * k, .12 * k, -.15 * k) : ear.clone().add(V(0, -.04 + .025 * sh, 0));
      PO.reach(zo, 'R', hand, { grip: .02 });
      orient(bt, PO.handPts(zo, 'R').palm, V(0, 1, 0).applyAxisAngle(dirW(zo, 0, 0, 1), .4 * sh).add(V(0, .001, 0)), dirW(zo, 0, 0, 1));
      PO.look(zo, w > 0 ? exit.clone().setY(1.5) : V(cam.x, 1.5, cam.z), .4);
    } else if (t >= L[3][0]) {
      walk(zo, exit, zp, L[3][0] + .4, L[3][0] + 2.2, t, { cps: 2.4 });
      if (t > L[3][0] + 2.2) {
        // b023 she turns from the lamp to him and to us, so her CU shows her face, not the back of her veil
        const a0 = Math.atan2(lamp.x - zp.x, lamp.z - zp.z), tg = cam.clone().lerp(at(mo, 'root').setY(0), .5), a1 = Math.atan2(tg.x - zp.x, tg.z - zp.z);
        const dA = Math.atan2(Math.sin(a1 - a0), Math.cos(a1 - a0));
        zo.group.rotation.y = a0 + dA * sm(L[5][0] - .6, L[5][0] + .2, t); zo.group.updateMatrixWorld(true);
      }
      // pours: the bottle tips over the lamp mouth, the left hand steadies the lamp
      const p = sm(L[3][0] + 2.4, L[3][0] + 3.2, t) * (1 - sm(LIT - 1.4, LIT - .9, t));
      const mouth = lamp.clone().add(V(0, .12, 0));
      const tip = front(zo, 'chest', .2 * k, .1 * k, -.2 * k).lerp(mouth.clone().add(V(0, .06, 0)).addScaledVector(dirW(zo, 0, 0, -1), .04), p);
      PO.reach(zo, 'R', tip, { grip: .02 });
      orient(bt2, PO.handPts(zo, 'R').palm, V(0, 1, 0).lerp(mouth.clone().sub(tip).normalize(), p).add(V(0, .001, 0)), dirW(zo, 0, 0, 1));
      if (t > L[3][0] + 2.2 && t < L[5][0] - .6) PO.reach(zo, 'L', lamp.clone().add(V(.06, -.02, 0)), { grip: .02 });
      PO.look(zo, t < L[5][0] ? lamp : at(mo, 'head'), .7);
    }
    // ---- Mohammed: b019 at the window (back to us, head up and turned to the grille); then by the table, eyes on the lamp
    const atWin = t >= L[1][0] - .1 && t < L[2][0] - .1;
    mo.group.position.copy(atWin ? wp : mp); mo.group.rotation.y = atWin ? Math.atan2(win.x - wp.x, win.z - wp.z) : mo.group.rotation.y; mo.group.updateMatrixWorld(true);
    if (atWin) { PO.look(mo, win, .9); mo.B.head.rotation.z += .2; mo.B.head.updateWorldMatrix(false, true); }
    else PO.look(mo, t >= L[5][0] ? at(zo, 'head') : lamp, .8);
  },
  over(lt, u, t) {
    // the painted lamp: masked dark until LIT, then its glow comes back with a warm bloom over the room
    const lit = sm(LIT, LIT + .5, t), d = dark(t);
    c.save();   // still under the cover camera: canvas px, so the mask follows the crop
    const sx = 1, R = [-1920, -1080, 5760, 3240];
    if (lit < 1) {
      const g = c.createRadialGradient(LAMP[0] * sx, LAMP[1] * sx, 0, LAMP[0] * sx, LAMP[1] * sx, 260 * sx);
      g.addColorStop(0, `rgba(30,32,52,${.85 * (1 - lit)})`); g.addColorStop(1, 'rgba(30,32,52,0)');
      c.globalCompositeOperation = 'multiply'; c.fillStyle = g; c.fillRect(...R);
    }
    if (d > 0) { c.globalCompositeOperation = 'multiply'; c.fillStyle = `rgba(${40 + 60 * (1 - d)},${44 + 60 * (1 - d)},${80 + 60 * (1 - d)},${d})`; c.fillRect(...R); }
    if (lit > 0) {
      const g = c.createRadialGradient(LAMP[0] * sx, LAMP[1] * sx, 0, LAMP[0] * sx, LAMP[1] * sx, 900 * sx);
      g.addColorStop(0, `rgba(255,190,110,${.35 * lit})`); g.addColorStop(1, 'rgba(255,190,110,0)');
      c.globalCompositeOperation = 'screen'; c.fillStyle = g; c.fillRect(...R);
    }
    c.restore();
  },
});

export { ch };
export default beatScene('s07_petrole', {
  shots: { ch },
  plan: {
    b018: { shot: 'ch', size: 'M', on: 'zoubida' },
    b019: { shot: 'ch', size: 'M', on: 'mohammed' },
    b020: { shot: 'ch', size: 'CU', on: 'mohammed' },
    b021: { shot: 'ch', size: 'W', insAt: .45, cover: [{ f: .9, size: 'M', on: 'zoubida' }] },
    b022: { shot: 'ch', size: 'CU', on: 'mohammed' },
    b023: { shot: 'ch', size: 'CU', on: 'zoubida' },
  },
});
