// s19: supper. L0 Zoubida kneels on the floor, sets the dish of meat and turnips (plus bread) on the low round table: "Voudrais-tu
// te mettre sur ton séant ?"; he straightens up (hard cut from the painted dream: no lie-to-sit pop). L1 he grimaces at the turnips,
// then eats with hunger from the common dish with his right hand (Moroccan custom, no spoon): dish -> mouth cycles. Plate chambre_jour.
// Contacts (st.M): both kneel on the floor beside the table (kneel), dish and bread on the tabla, hand in the dish and at the mouth.
import * as K from '../../../engine/core.js';
import * as PO from '../../../engine/poses.js';
import * as IK from '../../../engine/ik.js';
import * as PR from '../../../engine/props3d.js';
import { make, ac } from './_pt.js';
import * as THREE from 'three';
import { shot, all, breathe, V, role, memoPose, CAL } from './_3d.js';
const { clamp, ease } = K;
const sm = (a, b, x) => ease(clamp((x - a) / (b - a)));
const yawTo = (from, to) => Math.atan2(to.x - from.x, to.z - from.z);
const dirW = (a, x, y, z) => V(x, y, z).normalize().applyAxisAngle(V(0, 1, 0), a.group.rotation.y);
const angLerp = (a, b, k) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * k;
const fp = (a, p) => a.B.head.localToWorld(V(p[0], p[1] - a.S.head, p[2]));
const path = (t, ks) => { if (t <= ks[0][0]) return ks[0][1].clone(); for (let i = 1; i < ks.length; i++) if (t <= ks[i][0]) return ks[i - 1][1].clone().lerp(ks[i][1], ease((t - ks[i - 1][0]) / (ks[i][0] - ks[i - 1][0]))); return ks.at(-1)[1].clone(); };

const SC = (await (await fetch(new URL('../timing.json', import.meta.url))).json()).find(s => s.id === 's19_navets');
const L = SC.lines.map(l => [l.start - SC.start, l.start - SC.start + l.dur]);
const [a0, a1] = L.map(l => l[0]);
CAL.chambre_jour = CAL.chambre_jour || { h: 1.1, horizon: 425, fov: 50 };
const LIGHT_JOUR = { key: 0xffe0b0, keyI: 1.3, dir: [1.6, 3, 1], sky: 0xd8c0a0, ground: 0xc08850, fillI: 1.35, rim: 0xffd090, rimI: .45, rimDir: [2, 1.5, -2], shadow: .3, area: 3 };

// the common dish: shallow earthenware plate, brown meat pieces and white turnip quarters, heaped in the middle (r 17 cm)
function dish() {
  const g = PR.bowl({ r: .17, h: .045, glaze: 0xd8c49a }), meat = PR.toon(0x6a3016), tur = PR.toon(0xf1ecd6), tur2 = PR.toon(0xd9c3d0);
  g.userData.inside = V(0, .05, 0);
  for (let i = 0; i < 12; i++) {
    const a = i * 2.4, r = .02 + .085 * Math.sqrt((i + .5) / 12), isM = i % 2 === 0;
    const geo = isM ? new THREE.SphereGeometry(.03, 10, 8) : new THREE.SphereGeometry(.028, 10, 8, 0, Math.PI * 2, 0, Math.PI * .8);
    const m = new THREE.Mesh(geo, isM ? meat : (i % 4 === 1 ? tur : tur2)); m.scale.set(1, isM ? .7 : .8, isM ? .9 : 1);
    m.position.set(Math.cos(a) * r, .035 + (i % 3) * .008, Math.sin(a) * r); m.rotation.y = a; m.castShadow = true; g.add(m);
  }
  return g;
}

const sh = shot({
  plate: 'chambre_jour', light: { ...LIGHT_JOUR, keyI: 1.4 },
  async build(S3, cal) {
    const M = {}, hz = cal.horizon, tb = S3.floorAt(862, 747), tH = cal.h * (1 - (676 - hz) / (747 - hz)), c0 = V(tb.x, 0, tb.z - .12);
    S3.prop(PR.tabla({ r: .25, h: tH }), c0.x, 0, c0.z);
    S3.prop(PR.oilLamp(), tb.x + .03, tH, tb.z - .19);
    const bw = S3.prop(dish(), c0.x - .03, tH, c0.z + .05);
    const br = [0, 1].map(i => S3.prop(PR.bread({ r: .07 }), c0.x + .14 + i * .012, tH + i * .028, c0.z - .02 + i * .01));
    const mo = await role('mohammed', { seat: true }), zou = await role('zoubida', { seat: true }), cam = S3.cam.position.clone().setY(0);
    const face3q = (p, k) => { const yT = yawTo(p, tb), yC = yawTo(p, cam); return yT + Math.atan2(Math.sin(yC - yT), Math.cos(yC - yT)) * k; };
    const mAt = V(tb.x + .55, 0, tb.z + .04), zAt = V(tb.x - .3, 0, tb.z - .62);   // right of the table / far side, on the floor
    S3.add(mo, mAt.x, mAt.z, face3q(mAt, .45)); S3.add(zou, zAt.x, zAt.z, face3q(zAt, .35));   // near 3/4 to camera (in profile Zoubida's front hair lock reads as a black bar)
    M.mo = memoPose('s19mo3', mo, [mAt, tb], () => PO.kneel(mo, { lean: .12 }).map?.(e => +e.toFixed(3)));
    const mBase = PO.snap(mo);
    M.zou = memoPose('s19zou5', zou, [zAt, tb], () => PO.kneel(zou, { lean: .2 }).map?.(e => +e.toFixed(3)));
    const zBase = PO.snap(zou);
    const bowlIn = bw.localToWorld(bw.userData.inside.clone()).add(V(0, .03, 0));
    const lapM = IK.wpos(mo.B.thighR).add(V(0, .06, 0)).add(V(0, 0, .16).applyAxisAngle(V(0, 1, 0), mo.group.rotation.y));
    return { actors: [mo, zou], faces: [[zou, 'zoubida', 2, { sad: .2 }], [mo, null, 5, (lt, t) => t < a1 + 4 ? { sad: .9, lid: .15 } : (Math.sin(t * 3) > .5 ? { open: .5 } : {})]], M, mo, zou, mBase, zBase, bw, br, bowlIn, lapM, tb, zAt };
  },
  cover: [{ t: 0, size: 'W' }, { t: .5, size: 'M', on: 'zoubida', dx: 80 }, { t: a0 + 3.5, size: 'W' }, { t: a1, size: 'M', on: 'mohammed', dx: -40 },
    { t: a1 + 3.5, size: 'CU', on: 'mohammed' }, { t: a1 + 9, size: 'M', on: 'mohammed' }, { t: a1 + 14, size: 'CU', on: 'mohammed' }],
  frame(lt, u, t, S, s) {
    const { mo, zou, M } = s;
    // he is slumped, then sits up straight as the dish comes down
    const up = sm(a0 + 1.6, a0 + 3.2, t);
    PO.apply(mo, s.mBase); mo.B.spine.rotation.x += .16 * (1 - up); mo.B.head.rotation.x += .18 * (1 - up); mo.group.updateMatrixWorld(true);
    // dish on the tabla from the moment Zoubida sets it down
    s.bw.visible = t > a0 + .8;
    // Zoubida: kneeling; leans over and sets the dish down at the start, then watches him
    PO.apply(zou, s.zBase);
    const lean = Math.sin(Math.PI * clamp((t - .2) / 1.4)) * .3 * (t < 2 ? 1 : 0);
    zou.B.spine.rotation.x += lean; zou.B.head.rotation.x -= .15; zou.B.neck.rotation.x -= .05; zou.group.updateMatrixWorld(true);
    if (t < a0 + 1.2) M.zr = +PO.reach(zou, 'R', path(t, [[0, IK.wpos(zou.B.handR)], [.6, s.bowlIn.clone().add(V(0, .05, 0))], [1.2, s.bowlIn.clone().add(V(0, .05, 0))]]), { grip: .03 }).toFixed(3);
    PO.look(zou, IK.wpos(mo.B.head), .4);
    zou.B.head.rotation.x = Math.max(-.3, zou.B.head.rotation.x); breathe(zou, t, 1, 1);
    // Mohammed grimaces at the turnips, then eats by hand: dish -> mouth cycles of 4.5 s from a1+3.5
    {
      const m = fp(mo, mo.S.face.mouth).addScaledVector(dirW(mo, 0, 0, 1), .04).add(V(0, -.03, 0)), e0 = a1 + 3.5;
      if (t > e0) {
        const c = ((t - e0) * (t - e0 > 8 ? 1.25 : 1)) % 4.5;
        const hp = path(c, [[0, s.lapM], [1, s.bowlIn], [1.5, s.bowlIn], [2.5, m], [3.1, m], [4.2, s.lapM]]);
        mo.B.spine.rotation.x += .14 * Math.sin(Math.PI * clamp(c / 2)); mo.group.updateMatrixWorld(true);
        M.reachM = +PO.reach(mo, 'R', hp, { grip: .03 }).toFixed(3);
      } else if (t > a1 + 1) { mo.B.head.rotation.z += Math.sin(t * 9) * .05; mo.B.head.rotation.x -= .1; mo.group.updateMatrixWorld(true); }   // grimace: head back
      PO.look(mo, s.bowlIn.clone().add(V(0, .05, 0)), .5);
    }
    breathe(mo, t, 1, 0);
  },
});

window.__s19 = sh;
export default make({ preload: all(sh), plate: 'chambre_jour', segs: [ac([0, 0], sh.fn)] });
