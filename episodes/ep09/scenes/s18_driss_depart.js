// s18 "Driss et le départ".
// Rooms: chambre_jour (b110, b112, b113), patio_matin (b111, b114, b115).
// Cast & placements:
//   - ch1 (chambre_jour, b110): zoubida (house kaftan) stands at [1040, 825] facing 3/4 cam toward the low tabla [855, 765].
//   - pa1 (patio_matin, b111): zoubida (house kaftan) starts by the courtyard well [1180, 945] and walks to [880, 985] with a water bucket.
//   - ch2 (chambre_jour, b112): zoubida (costume: 'haik') at [680, 885] and mohammed at [1140, 875] by the right divan.
//   - pa2 (patio_matin, b114–b115): zoubida (costume: 'haik') at [980, 955] and fatma [1560, 955] at the right arcade doorway.
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
import { haikTuck } from '../lib/fix8_G4.js';
import { beatScene, lines, sm, at, front, dirW, V } from '../lib/beatscene.js';

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
  reach85(a, side, tg, { grip: .015, pole: [sg * .45, .02, -.28] });
  if (curl != null) PO.fingers(a, side, curl, { spread });
}

// b110: Zoubida in chambre_jour packing bread & olives on the low tabla
const ch1 = staged('chambre_jour', {
  zoubida: {
    at: [1010, 795], face: 'cam', yaw: -.62, seed: 7, lookMax: .55,
    look: t => t < B(0)[0] + 3.2 ? [520, 930, 1.45] : [855, 815, .45],
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
    const wrap = sm(B(0)[0] + 3.4, B(0)[0] + 4.4, t);
    zo.B.spine.rotation.x += .14 * wrap;
    zo.B.chest.rotation.x += .08 * wrap;
    zo.B.chest.updateWorldMatrix(false, true);
    const tb = S3.floorAt(855, 765);
    const p = front(zo, 'root', .28, 0, -.18);
    const r1 = .03 * Math.sin(t * 5.2), r2 = .03 * Math.cos(t * 5.2);
    for (const s of ['L', 'R']) {
      const sg = s === 'L' ? 1 : -1;
      const idle = front(zo, 'root', .22, -sg * .16, .04);
      const tgt = p.clone().addScaledVector(dirW(zo, sg, 0, 0), .18).add(V(s === 'R' ? r1 : r2, .03 * Math.abs(Math.sin(t * 4)), s === 'R' ? r2 : -r1));
      reach85(zo, s, idle.lerp(tgt, wrap), { grip: .02, pole: [sg * .9, .2, .5] });
      PO.fingers(zo, s, .35 + .25 * wrap, { spread: .15 });
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
    const walking = t > WALK_T0 && t < WALK_T1;
    if (walking) {
      const am = Math.min(1, Math.min(t - WALK_T0, WALK_T1 - t) * 3);
      stride(zo, t, WALK_T0, 1.6, am);
    }
    const lift = sm(B(1)[0] + .3, WALK_T0 + .2, t);
    const sw = walking ? .04 * Math.sin((t - WALK_T0) * 5.0) : 0;
    // Right hand holds the bail handle low beside her hip; left arm balances softly
    hand85(zo, 'R', { fwd: .08 + sw, out: .14, drop: .46 - .05 * lift, curl: .65, spread: .05 });
    hand85(zo, 'L', { fwd: .12 - sw, out: .10, drop: .36, curl: .2, spread: .15 });
    const hR = PO.handPts(zo, 'R').palm;
    S3.prop(st.bucket, hR.x, Math.max(.02, hR.y - .38 * kz), hR.z, zo.group.rotation.y);
    st.bucket.visible = true;
  },
});

// b112–b113: Zoubida in haik instructs Mohammed; Mohammed finds crumpled handkerchief & blows nose
const ch2 = staged('chambre_jour', {
  zoubida: { at: [680, 885], face: 'cam', yaw: .65, costume: 'haik', seed: 7, look: 'mohammed', lookMax: .65 },
  mohammed: {
    at: [1140, 875], face: 'cam', yaw: -.35, seed: 3, lookMax: .65,
    look: t => IN(3, t) ? (t < B(3)[0] + 3.2 ? [1060, 905, .48] : 'cam') : 'zoubida',
  },
}, {
  addressee: { zoubida: 'mohammed', narrator: 'mohammed' },
  act(lt, t, S, st, S3) {
    const { zoubida: zo, mohammed: mo } = st.A;
    castScale(zo); castScale(mo);
    sealHaik(zo);
    zo.group.visible = !IN(3, t);   // clean frame on Mohammed for b113
    st.actcheck = { exposed: { zoubida: ['handL', 'handR', 'foreArmL', 'foreArmR'] } };
    st.hanky ||= S3.prop(new THREE.Mesh(new THREE.SphereGeometry(.038, 10, 8).scale(1.3, .5, 1.1), PR.toon(0xf2ede0)), 0, 0, 0);

    // Zoubida (b112): tucks haik fold with L, gestures briskly at Mohammed with R
    haikTuck(zo);
    if (IN(2, t)) {
      const g = sm(B(2)[0] + .4, B(2)[0] + 1.0, t);
      const wave = Math.sin(t * 4.2) * .04;
      hand85(zo, 'R', { fwd: .22 + .06 * g + wave, out: .15, drop: .14 - .06 * g, curl: .15, spread: .3 });
      zo.B.head.rotation.z += .05 * Math.sin(t * 2.1);
      zo.B.chest.updateWorldMatrix(false, true);
    }

    // Mohammed (b112 listen -> b113 hunt under cushion, blow nose, wipe on djellaba)
    if (IN(2, t)) {
      hand85(mo, 'L', { fwd: .22, out: .15, drop: .26, curl: .25 });
      hand85(mo, 'R', { fwd: .22, out: .15, drop: .28, curl: .25 });
      st.hanky.visible = false;
    } else {
      const c3 = t - B(3)[0], km = mo.group.scale.y / 1.6;
      const hunt = sm(0, 1.2, c3) * (1 - sm(2.8, 3.6, c3));
      const blow = sm(3.4, 4.1, c3) * (1 - sm(6.4, 7.1, c3));
      const wipe = sm(6.9, 7.6, c3);
      mo.B.spine.rotation.x += .16 * hunt + .06 * blow;
      mo.B.chest.rotation.x += .08 * hunt + .04 * Math.sin(t * 10) * blow;
      mo.B.head.rotation.y += .09 * Math.sin(t * 14) * blow;
      mo.B.chest.updateWorldMatrix(false, true);

      const divanSpot = PO.hipToWorld(mo, -.24 * km, -.12 * km, .24 * km);
      const noseSpot = at(mo, 'head')
        .addScaledVector(dirW(mo, -1, 0, 0), .14 * km)
        .addScaledVector(dirW(mo, 0, 0, 1), .08 * km)
        .add(V(0, -.14 * km, 0));
      const wipeSpot = PO.hipToWorld(mo, -.20 * km, .02 * km + .06 * Math.sin(t * 6) * wipe, .22 * km);
      const restR = PO.hipToWorld(mo, -.20 * km, .04 * km, .22 * km);
      let tgR = restR.clone();
      if (hunt > 0) tgR.lerp(divanSpot, hunt);
      if (blow > 0) tgR.lerp(noseSpot, blow);
      if (wipe > 0) tgR.lerp(wipeSpot, wipe);
      reach85(mo, 'R', tgR, { grip: .015, pole: [-.9, .2, .5] });
      PO.fingers(mo, 'R', .45, { spread: .1 });
      reach85(mo, 'L', PO.hipToWorld(mo, .18 * km, .04 * km, .22 * km), { grip: .015, pole: [.9, .2, .5] });
      PO.fingers(mo, 'L', .3, { spread: .15 });

      const palmR = PO.handPts(mo, 'R').palm;
      S3.prop(st.hanky, palmR.x, palmR.y, palmR.z, t);
      st.hanky.visible = c3 > 1.8 && c3 < 7.0;
    }
  },
});

// b114–b115: Fatma & Zoubida in patio_matin
const pa2 = staged('patio_matin', {
  zoubida: { at: [980, 955], face: 'cam', yaw: .72, costume: 'haik', seed: 7, look: 'fatma', lookMax: .55 },
  fatma: { at: [1560, 955], face: 'cam', yaw: -.72, seed: 11, look: 'zoubida', lookMax: .55 },
}, {
  addressee: { fatma: 'zoubida', zoubida: 'fatma' },
  act(lt, t, S, st) {
    const { zoubida: zo, fatma: fa } = st.A;
    castScale(zo); castScale(fa);
    sealHaik(zo);
    st.actcheck = { exposed: { zoubida: ['handL', 'handR', 'foreArmL', 'foreArmR'] } };
    haikTuck(zo);

    const eager = IN(4, t) ? sm(B(4)[0], B(4)[0] + .6, t) : .35;
    fa.B.spine.rotation.x += .18 * eager;
    fa.B.chest.rotation.y += .06 * Math.sin(t * 2.1) * eager;
    fa.B.chest.updateWorldMatrix(false, true);
    hand85(fa, 'L', { fwd: .22 + .06 * eager, out: .15, drop: .12 - .04 * eager, curl: .12, spread: .3 });
    hand85(fa, 'R', { fwd: .22, out: .15, drop: .24, curl: .25 });

    if (IN(5, t)) {
      const chat = sm(B(5)[0], B(5)[0] + .5, t);
      zo.B.neck.rotation.x -= .08 * chat;
      zo.B.head.rotation.z += .05 * Math.sin(t * 2.4) * chat;
      zo.B.chest.rotation.y += .05 * Math.sin(t * 1.9) * chat;
      zo.B.chest.updateWorldMatrix(false, true);
      const bob = .04 * Math.sin(t * 4.5);
      hand85(zo, 'R', { fwd: .22, out: .15, drop: .13 + bob, curl: .14, spread: .32 });
    }
  },
});

export default beatScene(ID, {
  shots: { ch1, pa1, ch2, pa2 },
  plan: {
    b110: { shot: 'ch1', size: 'W', on: 'zoubida', insAt: .56 },
    b111: { shot: 'pa1', size: 'W', on: 'zoubida', insAt: .68 },
    b112: { shot: 'ch2', size: 'W', on: 'zoubida' },
    b113: { shot: 'ch2', size: 'M', on: 'mohammed', z: 1.35, dy: -90 },
    b114: { shot: 'pa2', size: 'W', on: 'fatma' },
    b115: { shot: 'pa2', size: 'W', on: 'zoubida' },
  },
});
