// s24: the copper chain. Kneeling on the floor of the room (staged on chambre_jour instead of the palier), Mohammed
// contemplates the green-crusted chain (line 0), has his tin of fine sand by the bucket (line 1), rubs and rubs, rinses
// it in the bucket of dark water: it turns to gold (line 2, close-up); he lays it on his wrist, his chest, his forehead,
// then over his treasures spread on a blanket (line 3).
// Contacts (st.M): his knees on the floor, both hands on the chain (rub), the chain in the water (rinse), the bucket on
// the floor.
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
const dirW = (a, x, y, z) => V(x, y, z).normalize().applyAxisAngle(V(0, 1, 0), a.group.rotation.y);
const yawTo = (from, to) => Math.atan2(to.x - from.x, to.z - from.z);
const A = [1, 10.7, 24.9, 39.1];
const COPPER = new THREE.Color(0x5a8a6a), GOLD = new THREE.Color(0xf0c040);

const sh = shot({
  plate: 'chambre_jour', light: LIGHT_JOUR,
  async build(S3, cal) {
    const M = {}, hz = cal.horizon, tb = S3.floorAt(862, 747), mF = S3.floorAt(862, 685);
    S3.prop(PR.tabla({ r: .25, h: cal.h * (1 - (676 - hz) / (747 - hz)) }), tb.x, 0, tb.z - .12);
    const mo = await cast('mohammed', { seat: true, copy: 1 }), cam = S3.cam.position.clone().setY(0);
    // he kneels on the floor right of the tabla, three-quarter to the camera, the bucket in front of him
    const mAt = V(tb.x + .9, 0, mF.z + .35), fwd = V(-.5, 0, 1).normalize();
    S3.add(mo, mAt.x, mAt.z, yawTo(mAt, mAt.clone().add(fwd)));
    M.kneel = memoPose('s24mo', mo, [mAt], () => PO.kneel(mo, { lean: .3 }) ?? 0);
    const bk = mAt.clone().addScaledVector(fwd, .27).addScaledVector(V(fwd.z, 0, -fwd.x), .1);
    S3.prop(PR.bucket({ water: .92, col: 0x7a8488 }), bk.x, 0, bk.z); M.bucket = 0;
    const can = mAt.clone().addScaledVector(fwd, .35).addScaledVector(V(fwd.z, 0, -fwd.x), -.15);
    const cn = new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, .09, 14), new THREE.MeshToonMaterial({ color: 0x9a9a8a })); cn.position.set(can.x, .045, can.z); S3.scene.add(cn);
    // the blanket of treasures, left of him
    const bl = mAt.clone().addScaledVector(fwd, .6).add(V(-.1, 0, 0));
    S3.prop(PR.mat({ w: .7, d: .45, col: 0x8a3a3a }), bl.x, 0, bl.z);
    [[0, 0], [.12, .06], [-.15, .1], [.2, -.08], [-.05, -.12]].forEach(([x, z], i) => { const g = PR.cabochon({ col: [0xd04060, 0x40a0d0, 0xe0c040, 0x60c060, 0xc070d0][i] }); g.position.set(bl.x + x, .02, bl.z + z); S3.scene.add(g); });
    const ch = S3.prop(PR.chain([-.02, 0, 0], [.02, 0, 0], { sag: .1, links: 30, col: 0x5a8a6a }), 0, 0, 0);
    return { actors: [mo], faces: [[mo, null, 5]], M, mo, base: PO.snap(mo), ch, bk, fwd,
      hp: S3.project(IK.wpos(mo.B.head)), cp: S3.project(bk.clone().setY(.35)) };
  },
  frame(lt, u, t, S, st) {
    const { mo, M, ch } = st, [a2, b2] = S.L(2), [a3] = S.L(3);
    PO.apply(mo, st.base);
    const f = dirW(mo, 0, 0, 1), s = dirW(mo, 1, 0, 0), chest = IK.wpos(mo.B.chest), head = IK.wpos(mo.B.head), rim = st.bk.clone().setY(.3);
    // where the chain is, by phase: held up to look / rubbed over the bucket / dipped / on the wrist, chest, forehead
    const look = chest.clone().addScaledVector(f, .25).add(V(0, .02, 0));
    const rub = rim.clone().add(V(0, .08, 0)), dip = st.bk.clone().setY(.21);
    const rinse = clamp(sm(a2 + 8, a2 + 9, t) - sm(a2 + 10.5, a2 + 11.5, t));
    let c = look, lo = sm(a2 - 1, a2, t);
    c = c.clone().lerp(rub, lo).lerp(dip, rinse).lerp(look, sm(a2 + 11.5, a2 + 12.5, t));
    if (t > a2 && t < a2 + 8) c.addScaledVector(s, Math.sin(t * 9) * .03);
    const wr = sm(a3, a3 + 1, t), ch_ = sm(a3 + 3, a3 + 4, t), fr = sm(a3 + 6, a3 + 7, t), down = sm(a3 + 9, a3 + 10.5, t);
    if (t > a3) {
      c = look.clone().lerp(chest.clone().addScaledVector(f, .1), ch_).lerp(head.clone().addScaledVector(f, .09).add(V(0, .05, 0)), fr)
        .lerp(st.bk.clone().addScaledVector(s, -.5).addScaledVector(f, .15).setY(.12), down);
    }
    { const v = c.clone().sub(chest); if (v.length() > .3) c = chest.clone().add(v.setLength(.3)); }
    // both hands on the chain (the left one wears it on its wrist during "à mon poignet")
    const wear = wr * (1 - ch_);
    M.R = +PO.reach(mo, 'R', c, { grip: .03 }).toFixed(3);
    M.L = +PO.reach(mo, 'L', wear > .5 ? c.clone().addScaledVector(s, .08).add(V(0, -.04, 0)) : c.clone().addScaledVector(s, .04), { grip: .03 }).toFixed(3);
    ch.position.copy(PO.handPts(mo, 'R').palm);
    ch.children[0].material.color.copy(COPPER).lerp(GOLD, sm(a2 + 9.5, a2 + 12, t));
    M.rinse = rinse > .9 ? +Math.max(0, ch.position.y - .239).toFixed(3) : 0;
    PO.look(mo, ch.position, .7); breathe(mo, t, 1, 0);
  },
  view(lt, u, t) {
    const [hx, hy] = sh.st.hp, [cx, cy] = sh.st.cp;
    return [key(t, [[0, hx], [10, hx], [12, (hx + cx) / 2], [A[2] + 8, cx], [A[2] + 13, cx], [A[3] + 1, hx], [A[3] + 9, hx], [A[3] + 11, (hx + cx) / 2]]),
      key(t, [[0, hy + 60], [10, hy + 60], [12, (hy + cy) / 2], [A[2] + 8, cy], [A[2] + 13, cy - 40], [A[3] + 1, hy + 60], [A[3] + 9, hy + 60], [A[3] + 11, (hy + cy) / 2 + 40]]),
      key(t, [[0, 2.3], [10, 2.3], [12, 1.8], [A[2] + 8, 2.6], [A[2] + 13, 3.0], [A[3] + 1, 2.3], [A[3] + 9, 2.2], [A[3] + 11, 1.6]])];
  },
});

window.__s24 = sh;
export default make({ preload: all(sh), plate: 'chambre_jour', segs: [ac([0, 0], sh.fn)] });
