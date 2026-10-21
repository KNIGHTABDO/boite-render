// s25: Zineb's cat. Seated on the back mattress, the gold chain in his hands, Mohammed talks to the cat purring against
// him (lines 0-1; the 2D cat of ep04 on the mattress); P11a: the cat with the chain caught round its neck, the boy
// pulling (line 2); "Reviens ! Ma chaîne ! Reviens, sale chat !": he lunges after it, arm out, the cat gone (line 3);
// P11b: the cat on the stairs with the chain, the women laughing in the galerie (lines 4-5).
// Plate chambre_jour (s17 staging). Contacts (st.M): hips on the mattress, both hands on the chain, the cat on the
// mattress top (drawn at the projected point).
import * as K from '../../../engine/core.js';
import { cast } from '../../../engine/stage3d.js';
import * as PR from '../../../engine/props3d.js';
import * as PO from '../../../engine/poses.js';
import * as IK from '../../../engine/ik.js';
import { cat } from '../../../engine/creatures.js';
import { make, ac, st } from './_pt.js';
import { shot, all, breathe, V, memoPose, skirt } from './_3d.js';
import { LIGHT_JOUR } from './s07_khlii.js';
const { c, clamp, ease, key } = K;
const sm = (a, b, x) => ease((x - a) / (b - a));
const dirW = (a, x, y, z) => V(x, y, z).normalize().applyAxisAngle(V(0, 1, 0), a.group.rotation.y);
const yawTo = (from, to) => Math.atan2(to.x - from.x, to.z - from.z);

const sh = shot({
  plate: 'chambre_jour', light: LIGHT_JOUR,
  async build(S3, cal) {
    const M = {}, hz = cal.horizon, tb = S3.floorAt(862, 747), mF = S3.floorAt(862, 685), mH = cal.h * (1 - (644 - hz) / (685 - hz));
    S3.prop(PR.tabla({ r: .25, h: cal.h * (1 - (676 - hz) / (747 - hz)) }), tb.x, 0, tb.z - .12);
    const mo = await cast('mohammed', { seat: true, copy: 1 }), cam = S3.cam.position.clone().setY(0);
    const mAt = V(tb.x, 0, mF.z - .3);
    S3.add(mo, mAt.x, mAt.z, yawTo(mAt, cam) * .5);
    M.mo = memoPose('s17mo', mo, [mAt, mH], () => PO.crossLegged(mo, { seat: mH, lean: .25 }).map(e => +e.toFixed(3)));
    const moBase = PO.snap(mo); skirt(S3, mo, mH);
    const ch = S3.prop(PR.chain([-.02, 0, 0], [.02, 0, 0], { sag: .1, links: 30, col: 0xf0c040 }), 0, 0, 0);
    // the cat lies on the mattress top at his left (screen right), 45 cm long
    const cp = mAt.clone().add(V(.42, mH, .12)), [x0, y0] = S3.project(cp), [x1] = S3.project(cp.clone().add(V(.45, 0, 0))); M.cat = 0;
    return { actors: [mo], faces: [[mo, 'mohammed', 5]], M, mo, moBase, ch, cat: [x0, y0, Math.abs(x1 - x0) / 80],
      hp: S3.project(IK.wpos(mo.B.head)) };
  },
  frame(lt, u, t, S, st) {
    const { mo, M, ch } = st, [a3] = S.L(3);
    PO.apply(mo, st.moBase);
    const f = dirW(mo, 0, 0, 1), s = dirW(mo, 1, 0, 0);
    if (t < a3) {
      // the chain in both hands over his lap, turned toward the cat as he talks to it
      const c0 = IK.wpos(mo.B.chest).addScaledVector(f, .2).add(V(0, -.12, 0)).addScaledVector(s, Math.sin(t * .8) * .02);
      M.R = +PO.reach(mo, 'R', c0, { grip: .03 }).toFixed(3); M.L = +PO.reach(mo, 'L', c0.clone().addScaledVector(s, .05), { grip: .03 }).toFixed(3);
      ch.visible = true; ch.position.copy(PO.handPts(mo, 'R').palm);
      mo.B.head.rotation.y -= .35; mo.B.head.rotation.x += .15; mo.group.updateMatrixWorld(true);
    } else {
      // "Reviens !": he lunges toward screen right, right arm flung out after the cat
      ch.visible = false;
      const l = sm(a3, a3 + .5, t);
      mo.B.spine.rotation.z += .25 * l; mo.B.spine.rotation.x += .2 * l; mo.group.updateMatrixWorld(true);
      M.reach = +PO.reach(mo, 'L', IK.wpos(mo.B.chest).addScaledVector(s, .3).addScaledVector(f, .18).add(V(0, .05, 0)), { grip: .02 }).toFixed(3);
      mo.B.head.rotation.y += .5 * l; mo.group.updateMatrixWorld(true);
    }
    breathe(mo, t, t < a3 ? 1 : 2.5, 0);
  },
  over(lt, u, t, S, st) {
    const [a2] = S.L(2);
    if (t > a2) return;
    const [x, y, k] = st.cat;
    c.save(); c.translate(x, y + Math.sin(t * 4) * .6); c.scale(-1, 1); cat(0, 0, k, t, '#5a4a3e'); c.restore();
  },
  view(lt, u, t) {
    const [hx, hy] = sh.st.hp, [cx, cy] = sh.st.cat;
    return [key(t, [[0, (hx + cx) / 2], [22, (hx + cx) / 2], [39, hx + 40]]), key(t, [[0, hy + 70], [22, hy + 70], [39, hy + 60]]), key(t, [[0, 1.8], [12, 2.1], [22, 2.2], [39, 1.9], [43, 2.1]])];
  },
});

window.__s25 = sh;
export default make({ preload: all(sh), plate: 'chambre_jour', segs: [ac([0, 0], sh.fn), st('p11a_vol', [2, 0], 'push'), ac([3, 0], sh.fn), st('p11b_escalier', [4, 0], 'rise')] });
