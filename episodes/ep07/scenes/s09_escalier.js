// s09 the stairs. Night stairwell (escalier_nuit): Mohammed climbs calmly, step by step (b029, rim-lit from the landing
// above). b030-b032 he stops on the fourth step and listens up toward the lit doorway (women's voices off: Zoubida, the
// neighbour, Zoubida). b033 CU: he holds his breath, eyes up, frozen.
// Stairs: 0.20 m rise / 0.28 m going, fitted to the painted nosings; the axis runs away-left (its side edge stays at x 535).
import * as K from '../../../engine/core.js';
import * as PO from '../../../engine/poses.js';
import { shot, role } from './_3d.js';
import { beatScene, lines, put, idle, sm, V } from '../lib/beatscene.js';
import { walk } from '../lib/acts.js';
const { c } = K;

const L = lines('s09_escalier');
const RISE = .2, GO = .28, STOP = 4;   // he stops on tread 4 (0.8 m up)
const NOS = [900, 790, 690, 610, 545, 495];   // painted nosings 1..6, canvas y
const GLOW = [960, 300];   // the lit doorway up the flight (off the top landing), canvas px

const es = shot({
  plate: 'escalier_nuit',
  light: { keyI: .55 },
  async build(S3) {
    const mo = await role('mohammed');
    const O = S3.floorAt(535, 1060), dir = S3.floorAt(535, 620).sub(O).setY(0).normalize();
    const side = V(-dir.z, 0, dir.x);   // to the right of the climb
    const C = O.clone().addScaledVector(side, .45);   // stair centre line on the floor
    // fit the first riser's distance along the axis so nosing j (height .2 j) lands on the painted lines
    let r1 = 0, e = 1e9;
    for (let r = -1; r < 4; r += .005) {
      let s = 0; NOS.forEach((y, i) => { const p = C.clone().addScaledVector(dir, r + GO * i).setY(RISE * (i + 1)); s += (S3.project(p)[1] - y) ** 2; });
      if (s < e) { e = s; r1 = r; }
    }
    const tread = j => C.clone().addScaledVector(dir, r1 + GO * (j - 1) + GO / 2).setY(0);   // tread j centre (floor x/z)
    const p0 = C.clone().addScaledVector(dir, r1 - .9), p1 = tread(STOP);
    put(S3, mo, 700, 1060, p1); mo.group.position.copy(p0); mo.group.updateMatrixWorld(true);
    const top = C.clone().addScaledVector(dir, r1 + GO * 7).setY(RISE * 7 + 1.5);   // the doorway he listens toward
    return { actors: [mo], mo, C, dir, r1, p0, p1, top, faces: [[mo, null, 3, (lt, t) => ({ open: 0 })]] };
  },
  frame(lt, u, t, S, st, S3) {
    const { mo, C, dir, r1, p0, p1, top } = st;
    idle(mo, t, 3);
    // b029: a slow climb (one step per ~1.1 s); the body rides the stair slope, a little lift on each step
    const t0 = L[0][0] + .6, t1 = L[0][1] - .8;
    const w = walk(mo, p0, p1, t0, t1, t, { cps: 1.6, ease: false });
    const s = mo.group.position.clone().sub(C).dot(dir);   // distance along the axis
    const h = RISE * K.clamp((s - r1 + .12) / GO, 0, STOP) + (w > 0 && w < 1 ? .025 * Math.abs(Math.sin((t - t0) * 1.6 * Math.PI / 2)) : 0);
    mo.group.position.y = h; mo.group.updateMatrixWorld(true);
    S3.qa.supports.mohammed = RISE * Math.max(0, Math.min(STOP, Math.floor((s - r1) / GO) + 1));
    if (w > 0 && w < 1) { mo.B.thighL.rotation.x -= .25 * Math.max(0, Math.sin((t - t0) * 2.5)); mo.B.thighR.rotation.x -= .25 * Math.max(0, -Math.sin((t - t0) * 2.5)); }
    // b030-b032: stopped, he half-turns toward us (listening with his right ear), head tipped up to the doorway
    const turn = sm(L[1][0] - .4, L[1][0] + .6, t);
    if (w >= 1) { mo.group.rotation.y = Math.atan2(p1.x - p0.x, p1.z - p0.z) + .9 * turn; mo.group.updateMatrixWorld(true); }
    PO.look(mo, w < 1 ? top.clone().setY(1.2) : top, .5 + .45 * turn);
    if (turn > 0) { mo.B.head.rotation.z -= .15 * turn; mo.B.head.updateWorldMatrix(false, true); }
    // b033: holds his breath: chest up and still, shoulders raised a touch
    const hold = sm(L[4][0], L[4][0] + .8, t);
    if (hold > 0) { mo.B.chest.rotation.x -= .08 * hold; mo.B.chest.updateWorldMatrix(false, true); }
  },
  over(lt, u, t) {
    // the doorway's warm spill from the top of the flight (canvas px under the cover cam), breathing a little with the voices
    const k = .22 + .06 * Math.sin(t * 1.3) + .08 * sm(L[1][0], L[1][0] + 1, t) * (1 - sm(L[4][0], L[4][0] + 2, t));
    const g = c.createRadialGradient(GLOW[0], GLOW[1], 0, GLOW[0], GLOW[1], 820);
    g.addColorStop(0, `rgba(255,180,105,${k})`); g.addColorStop(.5, `rgba(255,160,90,${k * .35})`); g.addColorStop(1, 'rgba(255,160,90,0)');
    c.save(); c.globalCompositeOperation = 'screen'; c.fillStyle = g; c.fillRect(-1920, -1080, 5760, 3240); c.restore();
  },
});

export { es };
export default beatScene('s09_escalier', {
  shots: { es },
  plan: {
    b029: { shot: 'es', size: 'W', cover: [{ f: .55, size: 'M', on: 'mohammed' }] },
    b030: { shot: 'es', size: 'M', on: 'mohammed' },
    b031: { shot: 'es', size: 'M', on: 'mohammed' },
    b032: { shot: 'es', size: 'M', on: 'mohammed' },
    b033: { shot: 'es', size: 'CU', on: 'mohammed' },
  },
});
