// s18 "Driss et le départ".
// Rooms: chambre_jour (b110, b112, b113), patio_matin (b111, b114, b115).
// Cast & placements:
//   - ch1 (chambre_jour, b110): zoubida stands at [1010, 795], turns to the street door, then packs on the tabla [855, 765].
//   - pa1 (patio_matin, b111): zoubida starts by the well [1180, 945] and walks to [880, 985] carrying a bucket.
//   - ch2 (chambre_jour, b112): zoubida (haik) at [680, 885], mohammed at [1240, 830] by the right divan.
//   - pa2 (patio_matin, b114–b115): zoubida (haik) at [1120, 960], fatma at [1720, 740] in the right arcade.
// Beat actions:
//   - b110: Driss calls from the street door; Zoubida looks toward the left door, then packs bread, butter and olives into paper on the tabla (ins: pain_olives).
//   - b111: Zoubida lifts the bucket beside the well and carries water across the patio (ins: jarre_eau).
//   - b112: Zoubida wrapped in her haik tucks the fold and tells Mohammed to blow his nose.
//   - b113: Mohammed hunts his crumpled handkerchief near the cushion, blows loudly, and wipes his fingers on his djellaba.
//   - b114: Fatma leans from the doorway asking eagerly where Zoubida is going and about Sidi Larbi.
//   - b115: Zoubida lifts her chin proudly and gestures from her haik opening to share the gossip.
import * as THREE from 'three';
import * as PO from '../../../engine/poses.js';
import * as PR from '../../../engine/props3d.js';
import { staged } from '../lib/autostage.js';
import { castScale, sealHaik, stride } from '../lib/fix8c.js';
import { haikOut } from '../lib/fix8_G4.js';
import { armsSoft, quietHaikBelt, reachClamp } from '../lib/fix9_E.js';
import { faceLens } from '../lib/fix9_J.js';
import { beatScene, lines, sm, at, front, dirW, yawTo, V } from '../lib/beatscene.js';

const ID = 's18_driss_depart', L = lines(ID), B = i => L[i] || [0, 0];
const IN = (i, t) => t >= B(i)[0] - .15 && t < (B(i + 1)[0] || B(i)[1] + .3);

/** Clamp every IK reach target to <= 0.85 * armLen so IK error stays < 0.03. */
function reach85(a, side, target, o = {}) {
  const sh = at(a, 'upperArm' + side);
  const len = sh.distanceTo(at(a, 'foreArm' + side)) + at(a, 'foreArm' + side).distanceTo(at(a, 'hand' + side));
  const d = target.clone().sub(sh), max = len * .85;
  const tgt = d.length() > max ? sh.clone().addScaledVector(d.normalize(), max) : target;
  return PO.reach(a, side, tgt, o);
}

/** Gentle shoulder-relative reach clamped to <= 0.85 * armLen (never >60 deg above shoulder). */
function hand85(a, side, { fwd = .16, out = .08, drop = .18, curl = .25, spread = .15 } = {}) {
  const k = a.group.scale.y / 1.6, sg = side === 'L' ? 1 : -1;
  const sh = at(a, 'upperArm' + side);
  const lat = sh.clone().sub(at(a, 'chest')).setY(0);
  if (lat.lengthSq() < 1e-8) lat.copy(dirW(a, sg, 0, 0)); else lat.normalize();
  const tg = sh.clone().addScaledVector(lat, out * k).addScaledVector(dirW(a, 0, 0, 1), fwd * k).add(V(0, -drop * k, 0));
  reach85(a, side, tg, { grip: .015, pole: [sg * .32, .08, .22] });
  if (curl != null) PO.fingers(a, side, curl, { spread });
}

// b110: Zoubida in chambre_jour packing bread & olives on the low tabla
const ch1 = staged('chambre_jour', {
  zoubida: {
    at: [1010, 795], face: 'cam', seed: 7, lookMax: .4,
    look: t => t < B(0)[0] + 3.2 ? [200, 680, 1.45] : [855, 765, .48],
  },
}, {
  addressee: { narrator: 'zoubida' },
  act(lt, t, S, st, S3) {
    const zo = st.A.zoubida;
    castScale(zo);
    if (!st.parcel) {
      const tb = S3.floorAt(855, 765);
      st.loaf = S3.prop(PR.bread({ r: .085 }), tb.x - .05, .3, tb.z + .04, .3);
      st.paper = S3.prop(new THREE.Mesh(new THREE.BoxGeometry(.16, .045, .13), PR.toon(0xdac79c)), tb.x + .03, .323, tb.z - .02, -.2);
      st.parcel = true;
    }
    const alert = sm(B(0)[0] - .2, B(0)[0] + .45, t) * (1 - sm(B(0)[0] + 2.5, B(0)[0] + 3.3, t));
    const door = S3.floorAt(200, 680);
    const want = yawTo(zo.group.position, door);
    const turn = Math.atan2(Math.sin(want - zo.group.rotation.y), Math.cos(want - zo.group.rotation.y));
    zo.group.rotation.y += turn * alert;
    zo.group.updateMatrixWorld(true);
    // The door turn leaves her face past the lens. Pull back; the head still glances that way.
    faceLens(zo, S3.cam.position, 42);
    const wrap = sm(B(0)[0] + 3.4, B(0)[0] + 4.4, t);
    zo.B.spine.rotation.y += .35 * alert;
    zo.B.chest.rotation.x += .08 * wrap;
    zo.B.spine.rotation.x += .14 * wrap;
    zo.B.head.rotation.z += .04 * alert;
    zo.B.chest.updateWorldMatrix(false, true);
    if (wrap < .15) armsSoft(zo, t, { lift: alert > .4 ? 'L' : null, seed: 7 });
    else {
      const p = front(zo, 'root', .28, 0, -.18);
      const r1 = .03 * Math.sin(t * 5.2), r2 = .03 * Math.cos(t * 5.2);
      for (const s of ['L', 'R']) {
        const sg = s === 'L' ? 1 : -1;
        const idle = at(zo, 'upperArm' + s).clone().addScaledVector(dirW(zo, sg, 0, 0), .1).add(V(0, -.42, 0));
        const tgt = p.clone().addScaledVector(dirW(zo, sg, 0, 0), .16).add(V(s === 'R' ? r1 : r2, .03 * Math.abs(Math.sin(t * 4)), s === 'R' ? r2 : -r1));
        reach85(zo, s, idle.lerp(tgt, wrap), { grip: .02, pole: [sg * .4, .1, .2] });
        PO.fingers(zo, s, .3 + .3 * wrap, { spread: .12 });
      }
    }
  },
});

// b111: Zoubida in patio_matin at the well, carrying a water bucket
const WALK_T0 = B(1)[0] + 1.4, WALK_T1 = B(1)[1] - 1.1;
const pa1 = staged('patio_matin', {
  zoubida: {
    at: [1180, 945], face: 'cam', yaw: -.5, seed: 7, lookMax: .55,
    walk: { to: [880, 985], t0: WALK_T0, t1: WALK_T1 },
    look: t => t < WALK_T0 ? [1230, 980, .85] : [820, 1005, 1.3],
  },
}, {
  addressee: { narrator: 'zoubida' },
  act(lt, t, S, st, S3) {
    const zo = st.A.zoubida, kz = zo.group.scale.y / 1.6;
    castScale(zo);
    st.bucket ||= S3.prop(PR.bucket({ water: .85 }), 0, 0, 0);
    st.bucket.scale.setScalar(1.35);
    const walking = t > WALK_T0 && t < WALK_T1;
    if (walking) {
      const am = Math.min(1, Math.min(t - WALK_T0, WALK_T1 - t) * 3);
      stride(zo, t, WALK_T0, 1.6, am);
    }
    const lift = sm(B(1)[0] - .35, B(1)[0] + .7, t);
    const sw = walking ? .05 * Math.sin((t - WALK_T0) * 5.0) : 0;
    zo.B.spine.rotation.x += .16 * Math.max(lift, walking ? .7 : 0);
    zo.B.spine.rotation.z += walking ? -.05 * Math.sin((t - WALK_T0) * 5) : .04 * lift;
    zo.B.chest.updateWorldMatrix(false, true);
    // Bucket bail in the right hand, held out from the skirt so it reads beside the well.
    hand85(zo, 'R', { fwd: .16 + sw, out: .22, drop: .28 - .06 * lift, curl: .7, spread: .04 });
    hand85(zo, 'L', { fwd: .1 - sw, out: .16, drop: .38, curl: .2, spread: .12 });
    const hR = PO.handPts(zo, 'R').palm;
    const side = dirW(zo, -1, 0, 0);
    S3.prop(st.bucket, hR.x + side.x * .06, Math.max(.04, hR.y - .28 * kz), hR.z + side.z * .06, zo.group.rotation.y);
    st.bucket.visible = true;
  },
});

// b112–b113: Zoubida in haik instructs Mohammed; Mohammed finds crumpled handkerchief & blows nose
const ch2 = staged('chambre_jour', {
  zoubida: { at: [680, 885], face: 'mohammed', costume: 'haik', seed: 7, look: 'mohammed', lookMax: .7 },
  mohammed: {
    at: [1240, 830], face: [1360, 960], seed: 3, lookMax: .75,
    look: t => IN(3, t) ? [1400, 680, .42] : 'zoubida',
  },
}, {
  addressee: { zoubida: 'mohammed', narrator: 'mohammed' },
  act(lt, t, S, st, S3) {
    const { zoubida: zo, mohammed: mo } = st.A;
    castScale(zo); castScale(mo);
    sealHaik(zo);
    quietHaikBelt(zo);
    zo.group.visible = !IN(3, t);   // clean frame on Mohammed for b113
    st.actcheck = { exposed: { zoubida: ['handL', 'handR', 'foreArmL', 'foreArmR'] } };
    st.hanky ||= S3.prop(new THREE.Mesh(new THREE.SphereGeometry(.038, 10, 8).scale(1.3, .5, 1.1), PR.toon(0xf2ede0)), 0, 0, 0);

    // Zoubida (b112): tuck the front cheek fold, then a speaking gesture toward Mohammed
    if (IN(2, t)) {
      const tuck = sm(B(2)[0], B(2)[0] + .5, t) * (1 - sm(B(2)[0] + 1.6, B(2)[0] + 2.4, t));
      const talk = sm(B(2)[0] + 1.5, B(2)[0] + 2.3, t);
      const kz = zo.group.scale.y / 1.6;
      zo.B.chest.rotation.y += .06 * Math.sin(t * 1.8) * talk;
      zo.B.head.rotation.z += .05 * Math.sin(t * 2.2);
      zo.B.chest.updateWorldMatrix(false, true);
      const cheek = at(zo, 'head').addScaledVector(dirW(zo, 1, 0, 0), .14 * kz).addScaledVector(dirW(zo, 0, 0, 1), .12 * kz).add(V(0, -.04 * kz, 0));
      const shL = at(zo, 'upperArmL');
      const park = shL.clone().addScaledVector(dirW(zo, 1, 0, 0), .16 * kz).addScaledVector(dirW(zo, 0, 0, 1), .08 * kz).add(V(0, -.38 * kz, 0));
      reachClamp(zo, 'L', park.clone().lerp(cheek, tuck), { grip: .01, pole: [.45, .08, -.2] });
      PO.fingers(zo, 'L', .2, { spread: .12 });
      haikOut(zo, 'R', -.04 + .05 * Math.sin(t * 3.4) * talk, .06, .22 + .04 * talk, .18);
    }

    // Mohammed (b112 listen -> b113 hunt under cushion, blow nose, wipe on djellaba)
    if (IN(2, t)) {
      armsSoft(mo, t, { lift: 'L', seed: 3 });
      mo.B.spine.rotation.z += .045 * Math.sin(t * 1.3);
      mo.B.chest.updateWorldMatrix(false, true);
      st.hanky.visible = false;
    } else {
      const c3 = t - B(3)[0], km = mo.group.scale.y / 1.6;
      const hunt = sm(-.3, .45, c3) * (1 - sm(2.6, 3.4, c3));
      const blow = sm(3.4, 4.1, c3) * (1 - sm(6.4, 7.1, c3));
      const wipe = sm(6.9, 7.6, c3);
      mo.B.spine.rotation.x += .16 * hunt + .06 * blow;
      mo.B.chest.rotation.x += .08 * hunt + .04 * Math.sin(t * 10) * blow;
      mo.B.head.rotation.y += .09 * Math.sin(t * 14) * blow;
      mo.B.chest.updateWorldMatrix(false, true);

      const cushion = S3.floorAt(1390, 690).setY(.42);
      // Beside the cheek and below the chin, so the cloth reads as the blow without covering the face.
      const noseSpot = at(mo, 'head')
        .addScaledVector(dirW(mo, -1, 0, 0), .2 * km)
        .addScaledVector(dirW(mo, 0, 0, 1), .04 * km)
        .add(V(0, -.2 * km, 0));
      const wipeSpot = at(mo, 'upperArmR').clone().addScaledVector(dirW(mo, -1, 0, 0), .16 * km).addScaledVector(dirW(mo, 0, 0, 1), .08 * km).add(V(0, -.28 * km + .05 * Math.sin(t * 6) * wipe, 0));
      const downR = at(mo, 'upperArmR').clone().addScaledVector(dirW(mo, -1, 0, 0), .12 * km).add(V(0, -.4 * km, 0));
      let tgR = downR.clone();
      if (hunt > 0) tgR.lerp(cushion, hunt);
      if (blow > 0) tgR.lerp(noseSpot, blow);
      if (wipe > 0) tgR.lerp(wipeSpot, wipe);
      reachClamp(mo, 'R', tgR, { grip: .02, pole: [-.35, .15, .15] });
      PO.fingers(mo, 'R', hunt > .5 ? .55 : .25, { spread: .1 });
      const downL = at(mo, 'upperArmL').clone().addScaledVector(dirW(mo, 1, 0, 0), .12 * km).add(V(0, -.42 * km, 0));
      reachClamp(mo, 'L', downL, { grip: 0, pole: [.25, .05, -.2] });
      PO.fingers(mo, 'L', .28, { spread: .1 });

      const palmR = PO.handPts(mo, 'R').palm;
      S3.prop(st.hanky, palmR.x, palmR.y, palmR.z, t);
      st.hanky.visible = c3 > 1.8 && c3 < 7.0;
    }
  },
});

// b114–b115: Fatma leans from the right arcade; Zoubida answers with her chin up
const pa2 = staged('patio_matin', {
  zoubida: {
    at: [1120, 960], face: 'cam', costume: 'haik', seed: 7, lookMax: .32,
    // A full look at Fatma puts the face past the lens. Glance between her and the camera.
    look: (t, st, S3) => st.A.fatma.B.head.getWorldPosition(V()).lerp(S3.cam.position, .62),
  },
  fatma: { at: [1720, 740], face: [1200, 1000], seed: 11, look: 'zoubida', lookMax: .7 },
}, {
  addressee: { fatma: 'zoubida', zoubida: 'fatma' },
  act(lt, t, S, st, S3) {
    const { zoubida: zo, fatma: fa } = st.A;
    castScale(zo); castScale(fa);
    sealHaik(zo);
    quietHaikBelt(zo);
    st.actcheck = { exposed: { zoubida: ['handL', 'handR', 'foreArmL', 'foreArmR'] } };

    const eager = sm(B(4)[0] - .6, B(4)[0] + .3, t);
    const listen = IN(5, t) ? .65 + .2 * Math.sin(t * 2.2) : eager;
    fa.B.spine.rotation.x += .28 * listen;
    fa.B.chest.rotation.z += .04 * Math.sin(t * 2.4) * listen;
    fa.B.head.rotation.z += .05 * Math.sin(t * 1.7);
    fa.B.chest.updateWorldMatrix(false, true);
    hand85(fa, 'L', { fwd: .28 + .08 * listen, out: .18, drop: .06, curl: .1, spread: .32 });
    hand85(fa, 'R', { fwd: .14, out: .16, drop: .32, curl: .22, spread: .12 });

    const chat = IN(5, t) ? sm(B(5)[0] - .2, B(5)[0] + .4, t) : 0;
    // The build yaw faces Fatma, which leaves the face past the lens for the whole patio shot.
    // Body stays on the camera; look() still turns the head toward her, inside lookMax.
    faceLens(zo, S3.cam.position, 1);
    zo.B.neck.rotation.x -= .16 * chat;
    zo.B.head.rotation.x -= .1 * chat;
    zo.B.head.rotation.z += .06 * Math.sin(t * 2.3) * Math.max(chat, .25);
    zo.B.chest.rotation.y += .06 * Math.sin(t * 1.8) * chat;
    zo.B.chest.updateWorldMatrix(false, true);
    const bob = .05 * Math.sin(t * 3.6);
    haikOut(zo, 'R', -.02 + bob, .08, .24, .16);
    haikOut(zo, 'L', -.16, -.04, .16, .35);
  },
});

export default beatScene(ID, {
  shots: { ch1, pa1, ch2, pa2 },
  plan: {
    b110: { shot: 'ch1', size: 'M', on: 'zoubida', z: 1.85, dy: 8, insAt: .56 },
    b111: { shot: 'pa1', size: 'M', on: 'zoubida', z: 1.75, dy: 55, insAt: .68, cover: [{ f: .32, size: 'M', on: 'zoubida', z: 1.75, dy: 55, pt: [960, 980] }] },
    b112: { shot: 'ch2', size: 'M', on: 'zoubida', z: 1.42, dx: 170, dy: 24 },
    b113: { shot: 'ch2', size: 'M', on: 'mohammed', z: 1.7, dy: 36 },
    b114: { shot: 'pa2', size: 'M', on: 'fatma', z: 1.7, dx: -240, dy: 28 },
    b115: { shot: 'pa2', size: 'CU', on: 'zoubida', z: 2.55, dx: 30, dy: 18 },
  },
});
