// s03: the Msid on a Wednesday. The fqih, cross-legged on his estrade, smiles and turns the quince switch between his
// fingers like a toy; Mohammed and two pupils sit cross-legged on the mats with their louhas. "C'est bien, mon fils"
// (to Mohammed), "Silence !" (raised index), the Achoura speech, "congé !" (both hands open). Then Mohammed runs out
// through the Msid door (second plate, msid_face, seen from behind).
// Contacts (numbers in sh.st.M): the fqih's hips on the estrade top, the pupils on the mat (crossLegged), the louha held
// by both palms at its sides (reach errors), the switch in the fqih's right palm.
import * as THREE from 'three';
import * as K from '../../../engine/core.js';
import { cast } from '../../../engine/stage3d.js';
import * as PR from '../../../engine/props3d.js';
import * as PO from '../../../engine/poses.js';
import * as IK from '../../../engine/ik.js';
import { rest, walkPose } from '../../../engine/rig3d.js';
import { make, ac } from './_pt.js';
import { shot, all, breathe, V } from './_3d.js';
const { clamp, ease, key, noise } = K;
const sm = (a, b, x) => ease((x - a) / (b - a));
const dirW = (a, x, y, z) => V(x, y, z).normalize().applyAxisAngle(V(0, 1, 0), a.group.rotation.y);
const yawTo = (from, to) => Math.atan2(to.x - from.x, to.z - from.z);

function stick() {   // the quince switch: 45 cm, origin at the grip, +z toward the tip
  const g = new THREE.Mesh(new THREE.CylinderGeometry(.0035, .006, .45, 6), PR.toon(0x7a5a2a)); g.rotation.x = Math.PI / 2; g.position.z = .15;
  const o = new THREE.Group(); o.add(g); g.castShadow = true; return o;
}
/** a louha held upright on the lap: bottom edge on the thighs, leaning back 0.35 rad, both palms on its side edges */
function holdLouha(a, lh) {
  const hip = IK.wpos(a.B.root), fw = dirW(a, 0, 0, 1).setY(0).normalize(), k = a.group.scale.y / 1.15;
  const at = hip.clone().addScaledVector(fw, .2 * k); at.y = hip.y + .02;
  lh.position.copy(at); lh.rotation.set(0, 0, 0); lh.rotation.order = 'YXZ'; lh.rotation.y = a.group.rotation.y; lh.rotation.x = -.35; lh.updateMatrixWorld(true);
  const L = lh.localToWorld(V(.135, .2, 0)), R = lh.localToWorld(V(-.135, .2, 0));
  return [PO.reach(a, 'L', L, { grip: .04 }), PO.reach(a, 'R', R, { grip: .04 })].map(e => +e.toFixed(3));
}

const msid = shot({
  plate: 'ep03/msid_estrade',
  async build(S3, cal) {
    const M = {}, E = cal.estrade;
    // estrade height from its painted front face: foot on the floor, top edge straight above it
    const foot = S3.floorAt(...E.front), hz = cal.horizon, estH = cal.h * (1 - (E.top[1] - hz) / (E.front[1] - hz));
    M.estrade = { z: +foot.z.toFixed(2), h: +estH.toFixed(3) };
    // invisible shadow catcher shaped like the painted estrade (top + front face): the fqih's shadow lands on it, not the floor
    const eL = S3.floorAt(380, E.front[1]), eR = S3.floorAt(1600, E.front[1]), eD = .9;
    const eb = new THREE.Mesh(new THREE.BoxGeometry(eR.x - eL.x, estH, eD), new THREE.ShadowMaterial({ color: 0x1a0c23, opacity: S3.catcher.material.opacity }));
    eb.castShadow = eb.receiveShadow = true; eb.position.set((eL.x + eR.x) / 2, estH / 2, foot.z - eD / 2); S3.scene.add(eb);
    const fq = await cast('fqih', { seat: true }), mo = await cast('mohammed', { seat: true });
    const p1 = await cast('mohammed_gris', { seat: true }), p2 = await cast('mohammed_gris', { seat: true, copy: 1 });
    const fqAt = V(foot.x - .15, 0, foot.z - .45);
    const kids = [[mo, V(fqAt.x + 1.25, 0, fqAt.z + 1.55)], [p1, V(fqAt.x - 1.1, 0, fqAt.z + 1.25)], [p2, V(fqAt.x - .25, 0, fqAt.z + 1.95)]];
    S3.add(fq, fqAt.x, fqAt.z, yawTo(fqAt, V(fqAt.x + .6, 0, fqAt.z + 2)));
    M.fqih = PO.crossLegged(fq, { seat: estH, lean: .06 }).map(e => +e.toFixed(3));
    M.fqihSeat = +(PO.lowestOf(fq, ['root', 'thighL', 'thighR']) - estH).toFixed(3);
    const fqBase = PO.snap(fq), lhs = [];
    for (const [a, p] of kids) {
      S3.add(a, p.x, p.z, yawTo(p, fqAt)); PO.crossLegged(a, { seat: 0, lean: .12, hands: false });
      const lh = S3.prop(PR.louha(), 0, 0, 0); M['louha_' + a.name + (lhs.length)] = holdLouha(a, lh); lhs.push(lh);
      a.base = PO.snap(a);
    }
    const sw = S3.prop(stick(), 0, 0, 0);
    const head = IK.wpos(fq.B.head), hp = S3.project(head), mp = S3.project(IK.wpos(mo.B.head));
    return { actors: [fq, mo, p1, p2], faces: [[fq, 'fqih', 2], [mo, null, 5], [p1, null, 8], [p2, null, 11]], M, fq, mo, kids, fqBase, sw, hp, mp, camPos: S3.cam.position.clone() };
  },
  frame(lt, u, t, S, st) {
    const { fq, mo, M } = st, [a1, b1] = S.L(1), [a2, b2] = S.L(2), [a3, b3] = S.L(3);
    PO.apply(fq, st.fqBase);
    // right hand: the switch turned between the fingers in front of the chest; L2 "Silence !" index up; L3 "congé" hands open
    const c0 = IK.wpos(fq.B.chest), fw = dirW(fq, 0, 0, 1).setY(0).normalize(), sd = V(0, 1, 0).cross(fw).normalize();
    let hr = c0.clone().addScaledVector(fw, .3).addScaledVector(sd, -.12).add(V(0, -.2, 0)), hl = null;
    const sil = clamp(sm(a2 - .3, a2 + .3, t) - sm(a2 + 2.2, a2 + 3, t));
    hr.lerp(IK.wpos(fq.B.head).addScaledVector(fw, .28).addScaledVector(sd, -.1).add(V(0, .06, 0)), sil);
    const open = clamp(sm(b3 - 4.2, b3 - 3.4, t) - sm(b3 + .3, b3 + 1, t));
    if (open > 0) { hr.lerp(c0.clone().addScaledVector(fw, .32).addScaledVector(sd, -.38).add(V(0, .05, 0)), open); hl = c0.clone().addScaledVector(fw, .32).addScaledVector(sd, .38).add(V(0, .05, 0)); }
    // the Achoura speech: small counting/explaining beats of the right hand
    const talk = clamp(sm(a2 + 3, a2 + 4, t) - sm(b2 - 1, b2, t));
    hr.add(V(noise(t * 1.3, 2) * .06, Math.max(0, noise(t * 1.7, 3)) * .08, 0).multiplyScalar(talk));
    M.reachFq = +PO.reach(fq, 'R', hr, { grip: .05 }).toFixed(3);
    if (hl) PO.reach(fq, 'L', IK.wpos(fq.B.chest).lerp(hl, open), { grip: .05 });
    // the switch: in the right palm, spinning slowly about the fingers (a toy), held still for "Silence !"
    const pr = PO.handPts(fq, 'R').palm, sp = t * 1.6 * (1 - sil), d = fw.clone().multiplyScalar(Math.cos(sp)).addScaledVector(sd, Math.sin(sp)).add(V(0, .35 + sil * 1.5, 0)).normalize();
    st.sw.position.copy(pr); st.sw.quaternion.setFromUnitVectors(V(0, 0, 1), d);
    // gaze: the fqih looks over the class, at Mohammed for "C'est bien, mon fils"
    const atMo = clamp(sm(a1 - .5, a1 + .3, t) - sm(b1 - .5, b1 + .3, t));
    PO.look(fq, IK.wpos(mo.B.head).lerp(st.camPos.clone().setY(1), 1 - atMo), .5);
    breathe(fq, t, 1, .4);
    // pupils: rocking slightly over the louhas (reciting); Mohammed looks up at the master when spoken to
    for (const [a, , i] of st.kids.map((k, i) => [...k, i])) {
      PO.apply(a, a.base); a.B.spine.rotation.x += Math.sin(t * 2.6 + i * 1.9) * .05 * (1 - atMo * (a === mo)); a.group.updateMatrixWorld(true);
      PO.look(a, IK.wpos(fq.B.head), a === mo ? .3 + .5 * atMo : .3); breathe(a, t, 1, i * 2.1);
    }
  },
  view(lt, u, t) {
    const [hx, hy] = msid.st.hp, [mx, my] = msid.st.mp, mid = [(hx + mx) / 2, (hy + my) / 2];
    // wide on the class, push to the fqih and his switch, two-shot for "mon fils", closer on him for the speech, wide for "congé"
    return [key(t, [[0, 960], [8, hx], [17, mid[0]], [29, hx], [57, hx], [66, 960]]), key(t, [[0, 560], [8, hy + 40], [17, mid[1] + 20], [29, hy + 60], [57, hy + 60], [66, 560]]), key(t, [[0, 1.05], [8, 1.6], [17, 1.3], [29, 1.55], [45, 1.75], [57, 1.5], [66, 1.12]])];
  },
});

// the run: Mohammed (standing copy) runs away from the camera across the Msid and out of the door
const run = shot({
  plate: 'ep03/msid_face',
  async build(S3, cal) {
    const mo = await cast('mohammed');
    const door = S3.floorAt(...cal.door), from = V(door.x + .5, 0, -1.6);
    S3.add(mo, from.x, from.z, yawTo(from, door));
    return { actors: [mo], faces: [], mo, door, from, M: { door: door.toArray().map(v => +v.toFixed(2)) } };
  },
  frame(lt, u, t, S, st) {
    const { mo } = st, [a4] = S.L(4), r = Math.max(0, t - a4 - .4);
    const len = st.from.distanceTo(st.door), d = Math.min(len + .4, r * 2.4), p = st.from.clone().lerp(st.door, d / len);
    rest(mo.B); walkPose(mo.B, r * 1.9, 1, { stride: .62, lift: 1, arms: .9 }); mo.B.spine.rotation.x += .12;
    mo.group.position.set(p.x, 0, p.z); mo.group.updateMatrixWorld(true);
    mo.group.visible = d < len + .05;   // gone through the doorway (the jamb would otherwise be drawn behind him)
  },
  view: (lt, u, t) => [key(lt, [[0, 900], [3, 820]]), key(lt, [[0, 600], [3, 520]]), key(lt, [[0, 1.12], [3, 1.3]])],
});
window.__s03 = msid; window.__s03run = run;
export default make({ preload: all(msid, run), plate: 'ep03/msid_estrade', segs: [ac([0, 0], msid.fn), ac([4, 0], run.fn)] });
