// s13 "Le déjeuner pauvre".
// b085-b087 (ch chambre_jour): Mohammed sits sulking cross-legged/kneeling on the mattress; Zoubida kneels on the floor
// beside a low wooden tabla.
// b085 (ch CU mohammed): glum on the mattress, chin lowered, even the sunlight feels dim.
// b086 (ch M): sparse lunch on the tabla (two beignets, black olives, radishes); Mohammed chews joylessly.
// b087 (ch CU zoubida + insert theiere_email): table cleared; Zoubida sets a chipped enamel teapot and two glasses
// directly on bare wood (no tray, no kettle).
// b088 (esc escalier): Zoubida wrapped in her white haïk walks down the stairs alone to visit Lalla Aïcha.
import * as THREE from 'three';
import * as PO from '../../../engine/poses.js';
import * as PR from '../../../engine/props3d.js';
import { staged } from '../lib/autostage.js';
import { pillowUnder } from '../lib/fix8_lie.js';
import { sealHaik, stride } from '../lib/fix8c.js';
import { ESCALIER } from '../lib/stairs.js';
import { beatScene, lines, sm, at, front, dirW, V } from '../lib/beatscene.js';

const ID = 's13_dejeuner_pauvre', L = lines(ID), B = i => L[i] || [0, 0];
const IN = (i, t) => t >= B(i)[0] - .15 && t < (B(i + 1)[0] || B(i)[1] + .3);
const win = (i, a, b, t) => { const [t0, t1] = B(i), D = t1 - t0; return sm(t0 + a * D, t0 + a * D + .4, t) * (1 - sm(t0 + b * D, t0 + b * D + .4, t)); };

const TOP = .26;
const MATTRESS = [[1188, 574], [1450, 574], [1455, 688], [1308, 690]];
const CHEST = [[1450, 580], [1830, 580], [1830, 850], [1450, 850]];
const DIM_DAY = { dir: [2, 3, 1], key: '#cbb892', keyI: 1.15, sky: '#8a9bb4', ground: '#5c4a38', fillI: .62, shadow: .38 };
const STAIR_LT = { dir: [2, 3, 1], key: '#ffe4b4', keyI: 2.0, sky: '#cbd9ee', ground: '#8f7759', fillI: 1.15, shadow: .24 };

function reach85(a, side, target, opt) {
  const sh = at(a, 'upperArm' + side);
  const len = sh.distanceTo(at(a, 'foreArm' + side)) + at(a, 'foreArm' + side).distanceTo(at(a, 'hand' + side));
  const maxR = len * .84, d = target.clone().sub(sh);
  if (d.length() > maxR) target = sh.clone().addScaledVector(d.normalize(), maxR);
  return PO.reach(a, side, target, opt);
}

function lapRest(a, t, seed = 0) {
  const k = a.group.scale.y / 1.6;
  for (const [s, sg] of [['L', 1], ['R', -1]]) {
    const bob = .01 * k * Math.sin(t * 1.1 + seed + (sg > 0 ? 0 : 1.6));
    const tg = PO.hipToWorld(a, sg * .18 * k, .02 * k + bob, .2 * k);
    reach85(a, s, tg, { grip: .02, pole: [sg * .35, -.04, .12] });
    PO.fingers(a, s, .16 + .03 * Math.sin(t * .9 + sg), { thumb: .12, spread: .2 });
  }
}

function makeBedProps(S3, st, mo) {
  pillowUnder(S3, st, mo, { top: TOP, h: .11, col: 0x3b4d6b });
  if (st.pillow) {
    const back = dirW(mo, 0, 0, -1), hp = mo.B.root.getWorldPosition(V(0, 0, 0));
    S3.prop(st.pillow, hp.x + back.x * .24, TOP + .055 - .004, hp.z + back.z * .24, mo.group.rotation.y);
  }
  if (st.cover) st.cover.visible = false;
}

function buildLunchGroup() {
  const g = new THREE.Group();
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(.11, .09, .014, 24), PR.toon(0xd8ceb8));
  plate.position.y = .007; plate.castShadow = true;
  g.add(plate);
  for (const [dx, dz] of [[-.035, .01], [.035, -.015]]) {
    const b = new THREE.Mesh(new THREE.TorusGeometry(.026, .011, 10, 18), PR.toon(0xd49a4a));
    b.rotation.x = Math.PI / 2; b.position.set(dx, .022, dz); b.castShadow = true;
    g.add(b);
  }
  const oliveDish = PR.bowl({ r: .055, h: .035, glaze: 0x6a4a2a });
  oliveDish.position.set(-.12, 0, .06);
  for (let i = 0; i < 6; i++) {
    const ol = new THREE.Mesh(new THREE.SphereGeometry(.009, 8, 6), PR.toon(0x1f1b24));
    ol.position.set(Math.cos(i * 1.1) * .02, .018, Math.sin(i * 1.1) * .02);
    oliveDish.add(ol);
  }
  g.add(oliveDish);
  for (let i = 0; i < 3; i++) {
    const rad = new THREE.Mesh(new THREE.SphereGeometry(.014, 8, 6), PR.toon(0xc83a44));
    rad.position.set(.1 + i * .022, .014, .05 + (i % 2) * .02);
    g.add(rad);
  }
  return g;
}

const TEA = [1090, 748];
const ch = staged('chambre_jour', {
  mohammed: { at: [1345, 690], face: 'zoubida', yaw: -.35, pose: 'cross',
    o: { seat: TOP, floor: TOP, lean: .08, hands: false, mattress: MATTRESS, avoid: CHEST },
    hands: false, seed: 3, look: (t) => IN(2, t) ? [...TEA, .45] : (IN(0, t) ? [...TEA, .4] : 'zoubida'), lookMax: .62,
    mutter: t => IN(1, t) ? 1.8 * Math.max(0, Math.sin(t * 4.5)) : 0 },
  zoubida: { at: [960, 740], face: TEA, pose: 'kneel',
    o: { grounded: true, lean: .1, avoid: CHEST }, hands: false, seed: 7,
    look: (t) => IN(2, t) ? [...TEA, .48] : 'mohammed', lookMax: .7 },
}, {
  light: DIM_DAY,
  act(lt, t, S, st, S3) {
    const { mohammed: mo, zoubida: zo } = st.A;
    zo.noDarkLid = true;
    const km = mo.group.scale.y / 1.6, kz = zo.group.scale.y / 1.6;
    makeBedProps(S3, st, mo);
    lapRest(mo, t, 3);
    lapRest(zo, t, 7);

    // Low bare-wood tabla in front of Zoubida (lighter top so it doesn't vanish into the rug).
    const tp = S3.floorAt(...TEA);
    st.tabla ||= S3.prop(PR.tabla({ r: .3, h: .28, col: 0xc4a06a, rimCol: 0x8a5a32 }), tp.x, 0, tp.z);
    const tblTop = st.tabla.userData.top;

    // Lunch props (b085-b086)
    st.lunch ||= S3.prop(buildLunchGroup(), tp.x, tblTop, tp.z);
    const isTea = t >= B(2)[0] - .1;
    st.lunch.visible = !isTea;

    // Hand-held beignet when Mohammed eats in b086
    st.beignet ||= S3.prop(new THREE.Mesh(new THREE.TorusGeometry(.04, .016, 10, 18), PR.toon(0xd49a4a)), 0, 0, 0);
    st.beignet.visible = false;

    // Tea props (b087): chipped enamel teapot + 2 glasses directly on bare wood (no tray, no kettle)
    st.pot ||= S3.prop(PR.teapot({ col: 0x8da4b0 }), tp.x - .04, tblTop, tp.z);
    st.g1 ||= S3.prop(PR.teaGlass({ fill: .45 }), tp.x + .09, tblTop, tp.z + .05);
    st.g2 ||= S3.prop(PR.teaGlass({ fill: .45 }), tp.x + .09, tblTop, tp.z - .06);
    st.pot.visible = st.g1.visible = st.g2.visible = isTea;

    // b085: glum on the mattress, chin lowered
    if (IN(0, t)) {
      const q = win(0, .05, .95, t);
      mo.B.spine.rotation.x += .14 * q;
      mo.B.neck.rotation.x += .22 * q;
      mo.B.head.rotation.x += .16 * q;
    }

    // b086: chews joylessly on a bland beignet
    if (IN(1, t)) {
      const eat = win(1, .15, .85, t);
      const chew = .5 + .5 * Math.sin(t * 2.1);
      const rest = PO.hipToWorld(mo, -.17 * km, .09 * km, .23 * km);
      const eatEnd = front(mo, 'chest', .22 * km, .10 * km, -.04 * km);
      eatEnd.y = Math.min(eatEnd.y, at(mo, 'head').y - .11 * km);
      const handP = rest.lerp(eatEnd, eat * (.55 + .35 * chew));
      reach85(mo, 'R', handP, { grip: .015, pole: [-.45, .02, .24] });
      PO.fingers(mo, 'R', .55, { thumb: .45 });
      if (eat > .2) {
        st.beignet.position.copy(PO.handPts(mo, 'R').palm);
        st.beignet.rotation.set(Math.PI / 2, mo.group.rotation.y, 0);
        st.beignet.visible = true;
      }
      mo.B.chest.rotation.x += .06 * eat;
    }

    // b087: from the first frames her hand is on the teapot, eyes on the wood, not back in her lap.
    if (IN(2, t)) {
      const place = sm(B(2)[0] - .05, B(2)[0] + .25, t);
      zo.B.chest.rotation.x += .16 * place;
      zo.B.spine.rotation.x += .08 * place;
      st.pot.updateMatrixWorld(true);
      const grip = st.pot.localToWorld(st.pot.userData.handle.clone());
      grip.y = Math.max(grip.y, tblTop + .08);
      const rest = PO.hipToWorld(zo, -.12 * kz, .16 * kz, .2 * kz);
      reach85(zo, 'R', rest.lerp(grip, place), { grip: .02, pole: [-.4, .2, .3] });
      PO.fingers(zo, 'R', .35 + .25 * place, { thumb: .3 });
      const glass = V(tp.x + .09, tblTop + .06, tp.z + .05);
      reach85(zo, 'L', PO.hipToWorld(zo, .14 * kz, .12 * kz, .18 * kz).lerp(glass, place * .85), { grip: .02, pole: [.4, .12, .25] });
      PO.fingers(zo, 'L', .3, { thumb: .22 });
    }

    mo.B.chest.updateWorldMatrix(false, true);
    zo.B.chest.updateWorldMatrix(false, true);
  },
});

// b088: escalier. She starts lower than the landing (tread 4 cropped her head) and walks down.
const esc = staged('escalier', {
  zoubida: { tread: 2, off: .05, face: 'down', costume: 'haik', height: 1.6, seed: 7,
    climb: { to: 0, t0: B(3)[0] + .15, t1: B(3)[1] - .15 },
    look: [980, 1000, .45], lookMax: .7 },
}, {
  stairs: ESCALIER,
  light: STAIR_LT,
  // Keep the top of the plate in frame, then follow her down the right flight.
  view(lt, u, t) {
    const [t0, t1] = B(3), k = sm(t0, t1, t), z = 1.16;
    return [1260 + 40 * k, 540 / z + 8 + 210 * k, z];
  },
  act(lt, t, S, st, S3) {
    const zo = st.A.zoubida, kz = zo.group.scale.y / 1.6;
    const [t0, t1] = B(3);
    zo.noDarkLid = true;
    sealHaik(zo);
    if (t > t0 && t < t1) stride(zo, t, t0, 1.7, 1);
    zo.B.spine.rotation.x += .1;
    zo.B.chest.rotation.x += .04;
    // Hands hold the wrap in at the ribs. The flat chest panel read as a white rectangle.
    reach85(zo, 'R', PO.hipToWorld(zo, -.08 * kz, .18 * kz, .14 * kz), { grip: .02, pole: [-.3, .08, .14] });
    reach85(zo, 'L', PO.hipToWorld(zo, .098 * kz, .2 * kz, .132 * kz), { grip: .02, pole: [.32, .1, .12] });
    PO.fingers(zo, 'R', .35, { thumb: .25 });
    PO.fingers(zo, 'L', .3, { thumb: .2 });
    PO.drapeRobe(zo, zo.group.position.y + .2);
    if (st.veil) st.veil.visible = false;
    zo.B.head.rotation.x += .08;
    st.actcheck = { supports: { zoubida: zo.group.position.y } };
  },
});

export default beatScene(ID, {
  shots: { ch, esc },
  plan: {
    b085: { shot: 'ch', size: 'CU', on: 'mohammed', z: 3.4, dx: 80, dy: -8 },
    b086: { shot: 'ch', size: 'M', on: 'mohammed', z: 2.2, dx: -50, dy: 28, segs: [[.3, 'i_pain_olives', { move: 'push' }]] },
    // Wide enough that the bare tabla, the chipped pot and both glasses stay in frame.
    b087: { shot: 'ch', size: 'M', on: 'zoubida', z: 2.25, dx: 20, dy: 70, insAt: .54 },
    b088: { shot: 'esc', size: 'W', on: 'zoubida', segs: [[.45, 'i_portail_bronze', { move: 'push' }]] },
  },
});
