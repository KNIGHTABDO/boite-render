// s22: lying on the back mattress, Mohammed listens to the muezzin (line 0); a fat black bumblebee falls in, hits the
// wall, darts at the glass chimney of the petrol lamp on the tabla (line 1); the glass rings, the bee flies off; he laughs
// and claps his hands (line 2). Plate chambre_jour, same mattress/tabla staging as s20.
// Contacts (st.M): lying on the mattress top (lie), pillow under the head, the lamp on the tabla top (lamp), the clap.
import * as THREE from 'three';
import * as K from '../../../engine/core.js';
import { cast } from '../../../engine/stage3d.js';
import * as PR from '../../../engine/props3d.js';
import * as PO from '../../../engine/poses.js';
import * as IK from '../../../engine/ik.js';
import { make, ac } from './_pt.js';
import { shot, all, breathe, V, memoPose } from './_3d.js';
import { LIGHT_JOUR } from './s07_khlii.js';
const { clamp, ease, key } = K;
const sm = (a, b, x) => ease((x - a) / (b - a));
const yawTo = (from, to) => Math.atan2(to.x - from.x, to.z - from.z);
const path = (t, ks) => { if (t <= ks[0][0]) return ks[0][1].clone(); for (let i = 1; i < ks.length; i++) if (t <= ks[i][0]) return ks[i - 1][1].clone().lerp(ks[i][1], ease((t - ks[i - 1][0]) / (ks[i][0] - ks[i - 1][0]))); return ks.at(-1)[1].clone(); };
const A = [1, 16.4, 30.8];

/** petrol lamp: brass foot + tank, glass chimney (userData.glass = chimney centre, local) */
function petrolLamp() {
  const g = new THREE.Group(), brass = new THREE.MeshToonMaterial({ color: 0xc8a040 });
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(.035, .055, .03, 16), brass); foot.position.y = .015;
  const tank = new THREE.Mesh(new THREE.SphereGeometry(.05, 16, 10).scale(1, .7, 1), brass); tank.position.y = .06;
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(.025, .032, .15, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0xe8f4ff, transparent: true, opacity: .35, side: THREE.DoubleSide }));
  glass.position.y = .17; g.add(foot, tank, glass); g.userData = { glass: V(0, .17, 0) }; return g;
}

const sh = shot({
  plate: 'chambre_jour', light: LIGHT_JOUR,
  async build(S3, cal) {
    const M = {}, hz = cal.horizon, tb = S3.floorAt(862, 747), mF = S3.floorAt(862, 685), mH = cal.h * (1 - (644 - hz) / (685 - hz)), tH = cal.h * (1 - (676 - hz) / (747 - hz));
    S3.prop(PR.tabla({ r: .25, h: tH }), tb.x, 0, tb.z - .12);
    const lamp = S3.prop(petrolLamp(), tb.x + .08, tH, tb.z - .14); M.lamp = 0;
    const mo = await cast('mohammed', { seat: true, copy: 1 });
    const mAt = V(tb.x, 0, mF.z - .36);
    S3.add(mo, mAt.x, mAt.z, Math.PI / 2);
    M.lie = memoPose('s20lie', mo, [mAt, mH], () => { const r = PO.lie(mo, { top: mH, turn: -.35, pillow: .07 }); return { low: +(r.low - mH).toFixed(3), heel: r.heel, pil: r.pillowAt.toArray() }; });
    S3.prop(PR.cushion({ w: .4, d: .3, h: .07, col: 0xe0d0a8 }), M.lie.pil[0], mH, M.lie.pil[2]);
    const bee = PR.bee(); bee.scale.setScalar(2.2); S3.scene.add(bee);
    const gl = lamp.localToWorld(lamp.userData.glass.clone()), head = IK.wpos(mo.B.head);
    const bk = [[17, gl.clone().add(V(2.6, 1.7, -1.2))], [20.5, gl.clone().add(V(1.4, 1.3, -2.2))], [21, gl.clone().add(V(1.3, 1.1, -2.1))],
      [24, gl.clone().add(V(1.9, .9, .2))], [27, gl.clone().add(V(.9, .5, .4))], [30.8, gl.clone().add(V(.035, .02, .01))],
      [31.3, gl.clone().add(V(.35, .3, .25))], [33.5, gl.clone().add(V(3, 1.9, -.4))]];
    return { actors: [mo], faces: [[mo, 'mohammed', 5]], M, mo, base: PO.snap(mo), lamp, bee, bk, gl,
      hp: S3.project(head), lp: S3.project(gl), ep: S3.project(gl.clone().add(V(1.5, 1, -1))) };
  },
  frame(lt, u, t, S, st) {
    const { mo, M, bee } = st, [a2] = S.L(2);
    PO.apply(mo, st.base);
    // the bee: wobbling flight, a ring on the glass (lamp shakes), off
    const p = path(t, st.bk), on = t > 17 && t < 33.5;
    bee.visible = on;
    if (on) { p.add(V(Math.sin(t * 13) * .03, Math.sin(t * 17) * .025, Math.cos(t * 11) * .03)); bee.lookAt(path(t + .1, st.bk)); bee.position.copy(p); bee.userData.flap(t); }
    const ring = Math.exp(-Math.max(0, t - 30.8) * 4) * (t > 30.8 ? 1 : 0);
    st.lamp.rotation.z = Math.sin(t * 40) * .05 * ring;
    // he follows it with his eyes; laughs and claps on line 2
    if (on) PO.look(mo, bee.position, .5);
    const clap = clamp(sm(a2 + 3, a2 + 3.6, t) - sm(a2 + 10, a2 + 11, t));
    if (clap > 0) {
      const c = IK.wpos(mo.B.chest).add(V(0, .16, .14)), gap = .02 + .07 * Math.abs(Math.sin(t * 5.5));
      for (const [side, k] of [['L', -1], ['R', 1]]) M['clap' + side] = +PO.reach(mo, side, IK.wpos(mo.B['hand' + side]).lerp(c.clone().add(V(0, 0, k * gap)), clap), { grip: .03 }).toFixed(3);
      mo.B.chest.rotation.x += Math.sin(t * 11) * .03; mo.group.updateMatrixWorld(true);
    }
    breathe(mo, t, 1, 0);
  },
  view(lt, u, t) {
    const [hx, hy] = sh.st.hp, [lx, ly] = sh.st.lp, [ex, ey] = sh.st.ep, m = (hx + lx) / 2;
    return [key(t, [[0, hx + 30], [15, hx + 30], [18, ex], [24, (ex + lx) / 2], [29, lx], [32, m], [44, m]]),
      key(t, [[0, hy + 30], [15, hy + 30], [18, ey], [24, (ey + ly) / 2], [29, ly - 20], [32, (hy + ly) / 2 + 20], [44, (hy + ly) / 2 + 20]]),
      key(t, [[0, 2.4], [15, 2.2], [18, 1.3], [24, 1.5], [29, 2.4], [31, 2.6], [33, 1.9], [44, 1.8]])];
  },
});

window.__s22 = sh;
export default make({ preload: all(sh), plate: 'chambre_jour', segs: [ac([0, 0], sh.fn)] });
