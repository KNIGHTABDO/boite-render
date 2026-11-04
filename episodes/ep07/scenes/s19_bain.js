// s19 the bath (cuisine_auge, steam). b070 M: by the oil lamp, his mother tips a bucket of cold water into the trough
// of boiling water while Mohammed waits beside it; cut, and he is in it up to the shoulders, she kneels at the trough's
// end. b071 CU "Aïe ! Arrête de frotter si fort !": he squirms and splashes, she scrubs his back with the cork ring.
// b072 painting: the black full of teasing little girls and chattering barbers.
// The painted trough's front is redrawn over him (over hook), so he sits IN it; steam drifts over the rim.
import * as THREE from 'three';
import * as K from '../../../engine/core.js';
import * as PO from '../../../engine/poses.js';
import { drawPlate } from '../../../engine/plates.js';
import { shot, role, memoPose, breathe } from './_3d.js';
import { beatScene, lines, idle, at, front, dirW, orient, sm, V, yawTo } from '../lib/beatscene.js';
import * as PR from '../../../engine/props3d.js';
import { c } from '../../../engine/core.js';

const L = lines('s19_bain');
const PLUNGE = L[0][0] + .62 * (L[0][1] - L[0][0]);   // the cover cut in b070
const POUR = [L[0][0] + .8, L[0][0] + 4];
const SEAT = -.04;   // he sits on the trough's floor, shoulders at the rim
// the trough's front wall in canvas px: the inner edge of the front rim on top, the base at the bottom
const FRONT = [[562, 766], [600, 779], [700, 790], [800, 795], [900, 797], [1000, 797], [1100, 793], [1200, 785], [1260, 772], [1302, 758],
  [1302, 800], [1272, 880], [1200, 935], [900, 952], [650, 942], [598, 920], [566, 840]];

const bt = shot({
  plate: 'cuisine_auge',
  async build(S3) {
    const mo = await role('mohammed', { seat: true }), mw = await role('mohammed', { copy: '_w' });
    const zw = await role('zoubida'), zk = await role('zoubida', { seat: true, copy: '_k' });
    const cam = S3.cam.position.clone().setY(0), tc = S3.floorAt(930, 905);
    // in the bath he sits toward the trough's right end, his back to her (she kneels just past the end)
    const tm = S3.floorAt(1130, 895), pk = S3.floorAt(1345, 915);
    S3.add(mo, tm.x, tm.z, yawTo(tm, tm.clone().add(tm.clone().sub(pk).setY(0).normalize()).add(cam.clone().sub(tm).setY(0).normalize().multiplyScalar(.6))));
    memoPose('s19-mo', mo, [SEAT], () => PO.crossLegged(mo, { seat: SEAT, lean: .05, hands: false }));
    const R = { mo: PO.snap(mo) };
    (S3.qa?.supports || {}).mohammed = SEAT;
    const pw = S3.floorAt(1290, 1040); S3.add(mw, pw.x, pw.z, yawTo(pw, tc) + .5); mw.name = 'mohammed';
    // pouring from the left end of the trough; kneeling at the right end afterwards
    const pz = S3.floorAt(640, 1035); S3.add(zw, pz.x, pz.z, yawTo(pz, tc) - .3);
    S3.add(zk, pk.x, pk.z, yawTo(pk, tm)); zk.name = 'zoubida';
    memoPose('s19-zk', zk, [pk.x, pk.z], () => PO.kneel(zk, { lean: .3, hands: false }));
    R.zk = PO.snap(zk);
    const bk = S3.prop(PR.bucket({ water: .6, col: 0xb8743a })); bk.userData.qa = { grip: true, hand: 'R', owner: 'zoubida' };
    const wt = S3.prop(PR.stream(null, null, null, { r: .022, col: 0xa8c4d0 }));
    const cork = S3.prop(new THREE.Mesh(new THREE.TorusGeometry(.045, .018, 8, 16), PR.toon(0xb07a46))); cork.userData.qa = { grip: true, hand: 'R', owner: 'zoubida' };
    return {
      actors: [mo, mw, zw, zk], mo, mw, zw, zk, R, bk, wt, cork, tc, cam,
      faces: [[mo, 'mohammed', 1, (lt, t) => t > L[1][0] - .2 && t < L[1][1] + .5 ? { sad: .5 } : { lid: .2 }], [mw, null, 1], [zw, null, 6], [zk, null, 6]],
    };
  },
  frame(lt, u, t, S, st) {
    const { mo, mw, zw, zk, R, bk, wt, cork, tc, cam } = st;
    const inn = t >= PLUNGE;
    mo.group.visible = inn; mw.group.visible = !inn; zw.group.visible = !inn; zk.group.visible = inn; cork.visible = inn;
    if (!inn) {
      idle(mw, t, 1); idle(zw, t, 6);
      // the bucket held low in both hands, tipped over the trough rim while she pours
      const tip = sm(POUR[0], POUR[0] + .7, t) * (1 - sm(POUR[1] - .5, POUR[1], t)), k = zw.group.scale.y / 1.6;
      const toward = tc.clone().sub(at(zw, 'root')).setY(0).normalize();
      const bp = front(zw, 'chest', (.28 + .1 * tip) * k, 0, (-.4 + .12 * tip) * k);
      orient(bk, bp, V(0, 1, 0).lerp(toward, .85 * tip).normalize(), dirW(zw, 1, 0, 0));   // local z = her left
      PO.reach(zw, 'R', bk.localToWorld(V(0, .2, -.14)), { grip: .02 });
      PO.reach(zw, 'L', bk.localToWorld(V(0, .2, .14)), { grip: .02 });
      const lip = bk.localToWorld(V(0, .26, 0)).addScaledVector(toward, .14);
      wt.visible = tip > .6;
      if (wt.visible) PR.stream(wt, lip, lip.clone().add(toward.clone().multiplyScalar(.12)).setY(.3), { r: .022 });
      PO.look(zw, tc.clone().setY(.3), .6); PO.look(mw, at(zw, 'head'), .5);
      bk.visible = true;
    } else {
      wt.visible = false; bk.visible = false;
      PO.apply(mo, R.mo); breathe(mo, t, 1.5, 1);
      PO.apply(zk, R.zk); breathe(zk, t, 1, 6);
      // he squirms (b071 the most): shoulders twist, head shakes, a hand flails up out of the water
      const sq = .3 + .7 * sm(L[1][0] - .3, L[1][0] + .2, t) * (1 - sm(L[1][1], L[1][1] + .8, t));
      mo.B.spine.rotation.y += .25 * sq * Math.sin(t * 7); mo.B.spine.updateWorldMatrix(false, true);
      mo.B.head.rotation.y += .3 * sq * Math.sin(t * 9 + 1); mo.B.head.updateWorldMatrix(false, true);
      const k = mo.group.scale.y / 1.6;
      PO.reach(mo, 'R', front(mo, 'chest', .25 * k, .25 * k, (.1 + .25 * sq * Math.max(0, Math.sin(t * 6))) * k), { grip: .05 });
      PO.reach(mo, 'L', front(mo, 'chest', .2 * k, -.22 * k, -.05 * k), { grip: .05 });
      // she scrubs his back hard with the cork ring
      const back = at(mo, 'chest').addScaledVector(dirW(mo, 0, 0, -1), .09).add(V(0, .03 * Math.sin(t * 11), 0)).addScaledVector(dirW(mo, 1, 0, 0), .05 * Math.sin(t * 5.5));
      PO.reach(zk, 'R', back, { grip: .02 }); PO.reach(zk, 'L', at(mo, 'upperArmL').add(V(0, .03, 0)), { grip: .03 });
      orient(cork, PO.handPts(zk, 'R').palm, dirW(zk, 0, 0, 1), V(0, 1, 0));
      PO.look(zk, at(mo, 'head'), .6); PO.look(mo, at(zk, 'head'), .5 * sq);
    }
  },
  over(lt, u, t, S, st) {
    // the trough front wall in front of him, then the steam
    if (st.mo.group.visible) {
      c.save(); c.beginPath(); FRONT.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.clip(); drawPlate(bt.img); c.restore();
    }
    c.save(); c.globalCompositeOperation = 'screen';
    for (let i = 0; i < 7; i++) {
      const ph = (t * .08 + i / 7) % 1, x = 620 + 640 * K.noise(i * 3.1, 1) + 60 * Math.sin(t * .5 + i), y = 760 - 520 * ph, r = 120 + 160 * ph;
      const a = .16 * Math.sin(Math.PI * ph);
      const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(235,225,210,${a})`); g.addColorStop(1, 'rgba(235,225,210,0)');
      c.fillStyle = g; c.fillRect(x - r, y - r, 2 * r, 2 * r);
    }
    c.restore();
  },
});

export { bt };
export default beatScene('s19_bain', {
  shots: { bt },
  plan: {
    b070: { shot: 'bt', size: 'W', cover: [{ f: .62, size: 'M', on: 'mohammed' }] },
    b071: { shot: 'bt', size: 'CU', on: 'mohammed' },
    b072: { shot: 'bt', size: 'CU', on: 'mohammed', segs: [[.25, 'p08_noir_reve']] },   // the cork scrub, then the black
  },
});
