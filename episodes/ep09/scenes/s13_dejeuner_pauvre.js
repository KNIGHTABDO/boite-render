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
import { sealHaik } from '../lib/fix8c.js';
import { ESCALIER } from '../lib/stairs.js';
import { beatScene, lines, sm, at, front, dirW, V } from '../lib/beatscene.js';

const ID = 's13_dejeuner_pauvre', L = lines(ID), B = i => L[i] || [0, 0];
const IN = (i, t) => t >= B(i)[0] - .15 && t < (B(i + 1)[0] || B(i)[1] + .3);
const win = (i, a, b, t) => { const [t0, t1] = B(i), D = t1 - t0; return sm(t0 + a * D, t0 + a * D + .4, t) * (1 - sm(t0 + b * D, t0 + b * D + .4, t)); };

const TOP = .26;
const MATTRESS = [[1188, 574], [1450, 574], [1455, 688], [1308, 690]];
const CHEST = [[1450, 580], [1830, 580], [1830, 850], [1450, 850]];
const DIM_DAY = { dir: [2, 3, 1], key: '#e5d4b6', keyI: 1.75, sky: '#aebed4', ground: '#78634a', fillI: .95, shadow: .3 };
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
    const tg = PO.hipToWorld(a, sg * .17 * k, .09 * k + bob, .23 * k);
    reach85(a, s, tg, { grip: .02, pole: [sg * .4, .06, .15] });
    PO.fingers(a, s, .26 + .04 * Math.sin(t * .9 + sg), { thumb: .22, spread: .16 });
  }
}

function makeBedProps(S3, st, mo) {
  pillowUnder(S3, st, mo, { top: TOP, h: .11, col: 0x3b4d6b });
  if (st.pillow) {
    const back = dirW(mo, 0, 0, -1), hp = mo.B.root.getWorldPosition(V(0, 0, 0));
    S3.prop(st.pillow, hp.x + back.x * .24, TOP + .055 - .004, hp.z + back.z * .24, mo.group.rotation.y);
  }
  st.cover ||= PR.blanket({ w: .42, l: .54, h: .055, col: 0xb23a2a });
  const hp = mo.B.root.getWorldPosition(V(0, 0, 0)), ry = mo.group.rotation.y;
  S3.prop(st.cover, hp.x + Math.sin(ry) * .26, TOP + .028 - .004, hp.z + Math.cos(ry) * .26, ry);
  st.cover.visible = true;
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

const ch = staged('chambre_jour', {
  mohammed: { at: [1345, 690], face: [1080, 790], pose: 'kneel',
    o: { grounded: true, seat: TOP, lean: .08, spread: .045, hands: false, mattress: MATTRESS, avoid: CHEST },
    hands: false, seed: 3, look: (t) => IN(0, t) ? [1140, 790, .4] : 'zoubida', lookMax: .75,
    mutter: t => IN(1, t) ? 1.8 * Math.max(0, Math.sin(t * 4.5)) : 0 },
  zoubida: { at: [980, 820], face: [1200, 750], pose: 'kneel',
    o: { grounded: true, lean: .08, avoid: CHEST }, hands: false, seed: 7,
    look: (t) => IN(2, t) ? [1140, 790, .3] : 'mohammed', lookMax: .75 },
}, {
  light: DIM_DAY,
  addressee: { zoubida: 'mohammed' },
  act(lt, t, S, st, S3) {
    const { mohammed: mo, zoubida: zo } = st.A;
    const km = mo.group.scale.y / 1.6, kz = zo.group.scale.y / 1.6;
    makeBedProps(S3, st, mo);
    lapRest(mo, t, 3);
    lapRest(zo, t, 7);

    // Low tabla on floor between them
    const tp = S3.floorAt(1140, 790);
    st.tabla ||= S3.prop(PR.tabla({ r: .26, h: .23 }), tp.x, 0, tp.z);
    const tblTop = .23;

    // Lunch props (b085-b086)
    st.lunch ||= S3.prop(buildLunchGroup(), tp.x, tblTop, tp.z);
    const isTea = t >= B(2)[0] - .1;
    st.lunch.visible = !isTea;

    // Hand-held beignet when Mohammed eats in b086
    st.beignet ||= S3.prop(new THREE.Mesh(new THREE.TorusGeometry(.026, .011, 10, 18), PR.toon(0xd49a4a)), 0, 0, 0);
    st.beignet.visible = false;

    // Tea props (b087): chipped enamel teapot + 2 glasses directly on bare wood (no tray, no kettle)
    st.pot ||= S3.prop(PR.teapot({ col: 0x8da4b0 }), tp.x - .04, tblTop, tp.z);
    st.g1 ||= S3.prop(PR.teaGlass({ fill: .45 }), tp.x + .09, tblTop, tp.z + .05);
    st.g2 ||= S3.prop(PR.teaGlass({ fill: .45 }), tp.x + .09, tblTop, tp.z - .06);
    st.pot.visible = st.g1.visible = st.g2.visible = isTea;

    // b085: glum on the mattress, chin lowered
    if (IN(0, t)) {
      const q = win(0, .05, .95, t);
      mo.B.spine.rotation.x += .08 * q;
      mo.B.neck.rotation.x += .15 * q;
      mo.B.head.rotation.x += .1 * q;
    }

    // b086: chews joylessly on a bland beignet
    if (IN(1, t)) {
      const eat = win(1, .15, .85, t);
      const chew = .5 + .5 * Math.sin(t * 2.1);
      const rest = PO.hipToWorld(mo, -.17 * km, .09 * km, .23 * km);
      const mouth = at(mo, 'head', [-.02, .01, .12]);
      const handP = rest.lerp(mouth.clone().add(V(0, -.04 * km, .03 * km)), eat * (.55 + .35 * chew));
      reach85(mo, 'R', handP, { grip: .015, pole: [-.36, -.12, .22] });
      PO.fingers(mo, 'R', .55, { thumb: .45 });
      if (eat > .2) {
        st.beignet.position.copy(PO.handPts(mo, 'R').palm);
        st.beignet.rotation.set(Math.PI / 2, mo.group.rotation.y, 0);
        st.beignet.visible = true;
      }
      mo.B.chest.rotation.x += .06 * eat;
    }

    // b087: Zoubida silently sets the enamel teapot on the bare wood, then sits back quiet
    if (IN(2, t)) {
      const place = win(2, .05, .42, t);
      if (place > .02) {
        zo.B.chest.rotation.x += .08 * place;
        const potTop = V(tp.x - .04, tblTop + .15, tp.z);
        const rest = PO.hipToWorld(zo, -.17 * kz, .09 * kz, .23 * kz);
        reach85(zo, 'R', rest.lerp(potTop, place), { grip: .02, pole: [-.4, -.05, .25] });
        PO.fingers(zo, 'R', .4, { thumb: .3 });
      }
      zo.B.neck.rotation.x += .1 * win(2, .4, .95, t);
    }

    mo.B.chest.updateWorldMatrix(false, true);
    zo.B.chest.updateWorldMatrix(false, true);
  },
});

// b088: escalier, Zoubida in her white haik descending alone
const esc = staged('escalier', {
  zoubida: { tread: 5, off: 0, face: 'down', costume: 'haik', seed: 7,
    climb: { to: 1, t0: B(3)[0] + .3, t1: B(3)[1] - .2 }, look: 'cam', lookMax: .45 },
}, {
  stairs: ESCALIER,
  light: STAIR_LT,
  act(lt, t, S, st) {
    const zo = st.A.zoubida, kz = zo.group.scale.y / 1.6;
    sealHaik(zo);
    for (const [side, sign] of [['L', 1], ['R', -1]]) {
      reach85(zo, side, PO.hipToWorld(zo, sign * .26 * kz, .06 * kz, .03 * kz), { grip: .01, pole: [sign * .9, .05, -.05] });
      PO.fingers(zo, side, .3);
    }
    st.actcheck = { supports: { zoubida: zo.group.position.y } };
  },
});

export default beatScene(ID, {
  shots: { ch, esc },
  plan: {
    b085: { shot: 'ch', size: 'CU', on: 'mohammed', z: 2.25, dx: -15, dy: -15 },
    b086: { shot: 'ch', size: 'M', on: 'mohammed', z: 1.4, dx: -75, dy: 15 },
    b087: { shot: 'ch', size: 'CU', on: 'zoubida', z: 1.9, dx: 70, dy: 30, insAt: .35 },
    b088: { shot: 'esc', size: 'W', on: 'zoubida' },
  },
});
