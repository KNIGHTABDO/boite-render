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
import { faceLens, keepFacing } from '../lib/fix9_J.js';
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
    at: [1380, 930], face: [900, 1020], seed: 7, lookMax: .55,
    walk: { to: [900, 1010], t0: WALK_T0, t1: WALK_T1 },
    look: t => t < WALK_T0 ? [1480, 860, .7] : [860, 1040, 1.15],
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
    // The bail hangs from a lowered hand so the full bucket reads as heavy, beside the skirt.
    hand85(zo, 'R', { fwd: .06 + sw, out: .14, drop: .56 - .04 * lift, curl: .78, spread: .02 });
    hand85(zo, 'L', { fwd: .08 - sw * .4, out: .12, drop: .46, curl: .22, spread: .1 });
    const hR = PO.handPts(zo, 'R').palm;
    const side = dirW(zo, -1, 0, 0);
    S3.prop(st.bucket, hR.x + side.x * .04, Math.max(.02, hR.y - .2 * kz), hR.z + side.z * .04, zo.group.rotation.y);
    st.bucket.visible = true;
  },
});

// b112–b113: Zoubida in haik instructs Mohammed; Mohammed finds crumpled handkerchief & blows nose
const ch2 = staged('chambre_jour', {
  zoubida: { at: [720, 960], face: 'mohammed', costume: 'haik', seed: 7, look: 'mohammed', lookMax: .55 },
  mohammed: {
    at: [1280, 960], face: 'cam', yaw: .4, seed: 3, lookMax: .4,
    look: t => IN(3, t) ? [1400, 680, .55] : 'zoubida',
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
    st.hanky ||= S3.prop(new THREE.Mesh(new THREE.SphereGeometry(.032, 8, 6).scale(1.4, .5, 1.1), PR.toon(0xf7f1e4)), 0, 0, 0);

    // Zoubida (b112): tuck the front cheek fold, then a speaking gesture toward Mohammed
    if (IN(2, t)) {
      const tuck = sm(B(2)[0], B(2)[0] + .5, t) * (1 - sm(B(2)[0] + 1.6, B(2)[0] + 2.4, t));
      const talk = sm(B(2)[0] + 1.5, B(2)[0] + 2.3, t);
      const kz = zo.group.scale.y / 1.6;
      zo.B.chest.rotation.y += .05 * Math.sin(t * 1.8) * talk;
      zo.B.neck.rotation.x -= .06 * talk;
      zo.B.head.rotation.z += .04 * Math.sin(t * 2.2);
      zo.B.chest.updateWorldMatrix(false, true);
      // Fold stays at the chest opening. A reach to the cheek pulled the haik over her eyes.
      // Both hands stay in the front opening. A reach across the chest put the forearm through the torso.
      haikOut(zo, 'L', -.16 + .04 * tuck, .08, .15, .28);
      haikOut(zo, 'R', -.14, .06, .16 + .02 * talk, .2);
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
      mo.B.spine.rotation.x += .42 * hunt + .1 * blow;
      mo.B.chest.rotation.x += .16 * hunt + .06 * Math.sin(t * 10) * blow;
      mo.B.head.rotation.x += .12 * blow;
      mo.B.head.rotation.y += .06 * Math.sin(t * 14) * blow;
      mo.B.chest.updateWorldMatrix(false, true);

      keepFacing(mo, S3.cam.position, 48);
      const cushion = S3.floorAt(1390, 680).setY(.5);
      // In front of the chest, under the chin: high enough to read as the blow, clear of the torso capsule.
      const noseSpot = PO.hipToWorld(mo, -.26 * km, .12 * km, .08 * km);
      const wipeSpot = at(mo, 'upperArmR').clone().addScaledVector(dirW(mo, -1, 0, 0), .16 * km).addScaledVector(dirW(mo, 0, 0, 1), .08 * km).add(V(0, -.28 * km + .05 * Math.sin(t * 6) * wipe, 0));
      const downR = at(mo, 'upperArmR').clone().addScaledVector(dirW(mo, -1, 0, 0), .12 * km).add(V(0, -.4 * km, 0));
      let tgR = downR.clone();
      if (hunt > 0) tgR.lerp(cushion, hunt);
      if (blow > 0) tgR.lerp(noseSpot, blow);
      if (wipe > 0) tgR.lerp(wipeSpot, wipe);
      reachClamp(mo, 'R', tgR, { grip: .02, pole: [-.65, .35, .4] });
      PO.fingers(mo, 'R', hunt > .5 ? .55 : .25, { spread: .1 });
      const downL = at(mo, 'upperArmL').clone().addScaledVector(dirW(mo, 1, 0, 0), .12 * km).add(V(0, -.42 * km, 0));
      reachClamp(mo, 'L', downL, { grip: 0, pole: [.25, .05, -.2] });
      PO.fingers(mo, 'L', .28, { spread: .1 });

      const palmR = PO.handPts(mo, 'R').palm;
      S3.prop(st.hanky, palmR.x, palmR.y, palmR.z, t);
      st.hanky.visible = c3 > .6 && c3 < 8.2;
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
  fatma: { at: [1360, 780], face: [1100, 980], seed: 11, look: 'zoubida', lookMax: .7 },
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
    fa.B.spine.rotation.x += .42 * listen;
    fa.B.chest.rotation.z += .04 * Math.sin(t * 2.4) * listen;
    fa.B.head.rotation.z += .05 * Math.sin(t * 1.7);
    fa.B.chest.updateWorldMatrix(false, true);
    hand85(fa, 'L', { fwd: .28 + .08 * listen, out: .18, drop: .06, curl: .1, spread: .32 });
    hand85(fa, 'R', { fwd: .14, out: .16, drop: .32, curl: .22, spread: .12 });

    const chat = IN(5, t) ? sm(B(5)[0] - .2, B(5)[0] + .4, t) : 0;
    // The build yaw faces Fatma, which leaves the face past the lens for the whole patio shot.
    // Body stays on the camera; look() still turns the head toward her, inside lookMax.
    faceLens(zo, S3.cam.position, 1);
    zo.B.neck.rotation.x -= .28 * chat;
    zo.B.head.rotation.x -= .16 * chat;
    zo.B.head.rotation.z += .06 * Math.sin(t * 2.3) * Math.max(chat, .25);
    zo.B.chest.rotation.y += .06 * Math.sin(t * 1.8) * chat;
    zo.B.chest.updateWorldMatrix(false, true);
    const bob = .04 * Math.sin(t * 3.6) * chat;
    haikOut(zo, 'R', -.06 + bob, .1, .2, .12);
    haikOut(zo, 'L', -.08, .14, .2, .25);
  },
});

export default beatScene(ID, {
  shots: { ch1, pa1, ch2, pa2 },
  plan: {
    b110: { shot: 'ch1', size: 'M', on: 'zoubida', z: 1.85, dy: 8, insAt: .56 },
    b111: { shot: 'pa1', size: 'M', on: 'zoubida', z: 1.85, dy: 36, insAt: .68 },
    b112: { shot: 'ch2', size: 'M', on: 'zoubida', z: 1.28, dx: 120, dy: 48 },
    b113: { shot: 'ch2', size: 'M', on: 'mohammed', z: 2.05, dy: 20 },
    b114: { shot: 'pa2', size: 'M', on: 'fatma', z: 1.85, dx: -200, dy: 16 },
    b115: { shot: 'pa2', size: 'CU', on: 'zoubida', z: 3.45, dx: 8, dy: -12 },
  },
});
