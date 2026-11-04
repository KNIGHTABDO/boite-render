// s04 the cat. Terrace (terrasse): Mohammed puffs his cheeks and blows, the note chokes; the tabby (cat2) dozes on the
// party wall in the sun (b008). b009 wide: the cat leaps in terror along the wall, scrabbles at the edge and drops behind
// it into the gutter (the wall is a depth holdout, so it really goes behind the painted parapet); a hold; then a
// neighbour's worried head rises over the wall and sinks back.
import * as THREE from 'three';
import * as K from '../../../engine/core.js';
import * as PO from '../../../engine/poses.js';
import { loadAnimal } from '../../../engine/rig3d.js';
import { shot, role } from './_3d.js';
import { beatScene, lines, put, idle, at, heightAt, sm, V } from '../lib/beatscene.js';
import { blow, holdDown } from '../lib/acts.js';
import { trompette } from '../lib/props7.js';
const { clamp } = K;

const L = lines('s04_chat');
const J = L[1][0] + .35;   // the leap
const te = shot({
  plate: 'terrasse',
  async build(S3) {
    const cam = S3.cam.position.clone().setY(0);
    const mo = await role('mohammed'), ne = await role('rahma');
    // party wall: painted front face from x 940 to 1480, foot at y 770, top at y 552
    const wh = heightAt(S3, 1200, 770, 552), wl = S3.floorAt(940, 770), wr = S3.floorAt(1480, 770), wd = .25;
    const wc = wl.clone().lerp(wr, .5).add(V(0, 0, -wd / 2));
    const wall = S3.holdout(new THREE.BoxGeometry(wr.x - wl.x, wh, wd), wc.x, wh / 2, wc.z);
    const catAt = S3.floorAt(1060, 552, wh).add(V(0, 0, -.1));   // on the top, near its front edge
    put(S3, mo, 820, 950, cam.clone().lerp(catAt.clone().setY(0), .35));
    // the neighbour stands on her own (lower) roof behind the wall: only the head ever clears the top
    const np = S3.floorAt(1330, 770).add(V(0, 0, -1.1)); S3.add(ne, np.x, np.z, Math.atan2(cam.x - np.x, cam.z - np.z));
    const cat = await loadAnimal('/art/models/cat2__base_basic_pbr.glb', { height: .27 }), pv = new THREE.Group();
    const body = cat.root.children[0]; cat.root.remove(body); pv.add(body); body.position.z += .08; pv.position.z = -.08; cat.root.add(pv); cat.pv = pv;
    cat.root.traverse(o => { if (o.isMesh) o.castShadow = true; }); S3.scene.add(cat.root);
    const hn = S3.prop(trompette()); hn.userData.qa = { grip: true, hand: 'R', owner: 'mohammed' };
    (S3.qa?.supports || {}).rahma = wh - 1.6;
    return { actors: [mo, ne], mo, ne, cat, catAt, wh, wall, hn, cam, faces: [[mo, null, 3], [ne, null, 5]] };
  },
  frame(lt, u, t, S, st) {
    const { mo, ne, cat, catAt, wh, hn } = st;
    idle(mo, t, 3);
    // b008: blows (cheeks puffed: head back), the note chokes and he stops; b009: trumpet down, he gapes at the cat
    if (t < L[1][0]) blow(mo, hn, t, .4 + .6 * clamp((t - L[0][0] - 2) / 2) * (1 - sm(L[0][0] + 5, L[0][0] + 5.6, t) * .7));
    else { holdDown(mo, hn); PO.look(mo, cat.root.position.clone(), .8); }
    // cat: dozing (slow breath) -> startle (puffs up) -> leap 0.9 m right along the top -> scrabble at the end -> drop behind
    const p = catAt.clone(); let yaw = 1.5, sc = 1, br = 1 + .03 * Math.sin(t * 2.4), pitch = 0, vis = true;
    const a = clamp((t - J) / .25), f = clamp((t - J - .25) / .45), s2 = clamp((t - J - .7) / .6), d = clamp((t - J - 1.3) / .35);
    if (t >= J) {
      sc = 1 + .12 * Math.sin(Math.PI * a) ; br = 1.12 - .12 * f;
      p.x += .9 * f; p.y += Math.sin(Math.PI * f) * .35;
      pitch = -.3 * Math.sin(Math.PI * f) + .5 * Math.sin(s2 * Math.PI * 5) * (1 - s2) * (s2 > 0 ? 1 : 0);   // scrabbling at the edge
      p.z -= .22 * d; p.y -= .9 * d * d; pitch += 1.1 * d;   // tips over the back edge into the gutter
      vis = d < 1;
    }
    cat.root.visible = vis;
    cat.pv.rotation.x = -pitch; cat.root.position.copy(p); cat.root.rotation.y = yaw; cat.root.scale.set(sc, sc * br, sc); cat.root.updateMatrixWorld(true);
    // the neighbour's head: up at J+2.6 (after the hold), looks round, sinks at J+4.2
    const up = sm(J + 2.6, J + 3.0, t) * (1 - sm(J + 4.2, J + 4.6, t));
    ne.group.position.y = wh - 1.6 + .3 * up - .05; ne.group.updateMatrixWorld(true);
    idle(ne, t, 5); PO.look(ne, at(mo, 'head'), .9 * up);
  },
});

export { te };
export default beatScene('s04_chat', {
  shots: { te },
  plan: {
    b008: { shot: 'te', size: 'M', on: 'mohammed' },
    b009: { shot: 'te', size: 'W' },
  },
});
