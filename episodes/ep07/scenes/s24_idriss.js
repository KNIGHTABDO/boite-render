// s24 Achoura morning. b092 the room by day (chambre_jour): Zoubida in her fine mansouria with yellow satin stripes
// holds out a tray of square flaky galettes (insert: butter and honey); Mohammed, in his new clothes, looks up at her
// and takes one. b093 painting: Moulay Idriss, the place des notaires, the blue dish.
import * as THREE from 'three';
import * as PO from '../../../engine/poses.js';
import * as PR from '../../../engine/props3d.js';
import { shot, role } from './_3d.js';
import { beatScene, lines, put, idle, at, front, dirW, orient, sm, V } from '../lib/beatscene.js';

const L = lines('s24_idriss');
const D0 = L[0][1] - L[0][0], TAKE = [L[0][0] + .6 * D0, L[0][0] + .78 * D0];

function galettes() {
  const g = PR.tray({ r: .2, col: 0xc89a3a }), m = PR.toon(0xd8a050);
  for (let i = 0; i < 5; i++) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(.08, .012, .08), m);
    b.position.set(.06 * Math.cos(i * 1.26), .036 + .012 * (i % 2), .06 * Math.sin(i * 1.26)); b.rotation.y = i * .7; g.add(b);
  }
  return g;
}

const ch = shot({
  plate: 'chambre_jour',
  async build(S3) {
    const cam = S3.cam.position.clone().setY(0);
    const zo = await role('zoubida', { costume: 'fete' }), mo = await role('mohammed', { costume: 'fete' });
    const pz = S3.floorAt(860, 900), pm = S3.floorAt(1110, 960);
    put(S3, zo, 860, 900, cam.clone().lerp(pm, .55));
    put(S3, mo, 1110, 960, cam.clone().lerp(pz, .6));
    const tr = S3.prop(galettes()); tr.userData.qa = { grip: true, hand: 'LR', owner: 'zoubida' };
    const gl = S3.prop(new THREE.Mesh(new THREE.BoxGeometry(.08, .012, .08), PR.toon(0xd8a050))); gl.userData.qa = { grip: true, hand: 'R', owner: 'mohammed' };
    return { actors: [zo, mo], zo, mo, tr, gl, cam, faces: [[zo, null, 1], [mo, null, 3, (lt, t) => t > TAKE[1] ? { open: .2 } : {}]] };
  },
  frame(lt, u, t, S, st) {
    const { zo, mo, tr, gl, cam } = st;
    idle(zo, t, 1); idle(mo, t, 3);
    const kz = zo.group.scale.y / 1.6, km = mo.group.scale.y / 1.1;
    // she holds the tray out toward him, both hands under the rim
    const off = sm(L[0][0] - .5, L[0][0] + .8, t);
    const tp = front(zo, 'chest', (.22 + .1 * off) * kz, 0, -.2 * kz).lerp(at(mo, 'head').add(V(0, -.25, 0)), .25 * off);
    orient(tr, tp, V(0, 1, 0), dirW(zo, 0, 0, 1));
    PO.reach(zo, 'L', tp.clone().addScaledVector(dirW(zo, 1, 0, 0), .19).add(V(0, .01, 0)), { grip: .03 });
    PO.reach(zo, 'R', tp.clone().addScaledVector(dirW(zo, -1, 0, 0), .19).add(V(0, .01, 0)), { grip: .03 });
    PO.look(zo, at(mo, 'head'), .6);
    // he reaches up and takes a galette, then holds it to his chest
    const r = sm(TAKE[0] - .6, TAKE[0], t), back = sm(TAKE[0], TAKE[1], t);
    const top = tp.clone().add(V(0, .05, 0)).addScaledVector(dirW(zo, 0, 0, -1), .06);
    if (r > 0) PO.reach(mo, 'R', front(mo, 'chest', .1 * km, .15 * km, -.15 * km).lerp(top, r * (1 - back)).lerp(front(mo, 'chest', .14 * km, .05 * km, -.05 * km), back), { grip: .02 });
    gl.visible = t > TAKE[0]; if (gl.visible) orient(gl, PO.handPts(mo, 'R').palm, V(0, 1, 0), dirW(mo, 0, 0, 1));
    PO.look(mo, back > .5 ? gl.position : at(zo, 'head'), .7);
  },
});

export { ch };
export default beatScene('s24_idriss', {
  shots: { ch },
  plan: {
    b092: { shot: 'ch', size: 'M', on: 'zoubida', insAt: .25, cover: [{ f: .6, size: 'M', on: 'mohammed' }] },
    b093: { shot: 'p10_idriss' },
  },
});
