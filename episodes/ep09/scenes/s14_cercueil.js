// s14 "Un cercueil".
// b089 chambre_penombre: Mohammed kneels on the rug beside his open wooden Wonder Box (boite), reaching softly to its lid in dismay.
// b090 painting p08_boite_cercueil: the Wonder Box as a dark coffin holding dead dreams.
// b091 painting p09_taches_murs: damp wall spots frozen and sickening.
// b092 chambre_penombre: Mohammed lies on the right divan, exhausted and weeping silently as his eyes close in sleep.
// b093 chambre_nuit: Mohammed feverish in bed (right divan); Zoubida kneels beside him, tucks the blanket warmly, and rocks gently humming in tears.
import * as PO from '../../../engine/poses.js';
import * as PR from '../../../engine/props3d.js';
import * as K from '../../../engine/core.js';
import { staged, THREE } from '../lib/autostage.js';
import { lieOnBed, pillowUnder } from '../lib/fix8_lie.js';
import { beatScene, lines, sm, at, front, V } from '../lib/beatscene.js';

const ID = 's14_cercueil', L = lines(ID), B = i => L[i] || [0, 0];

const MATTRESS = [[1188, 574], [1450, 574], [1455, 688], [1308, 690]];
const CHEST = [[1450, 580], [1830, 580], [1830, 850], [1450, 850]];
const TOP = .26;

function clampReach(a, side, target, o) {
  const sh = at(a, 'upperArm' + side);
  const len = sh.distanceTo(at(a, 'foreArm' + side)) + at(a, 'foreArm' + side).distanceTo(at(a, 'hand' + side));
  const d = target.clone().sub(sh);
  if (d.length() > len * .85) target = sh.clone().addScaledVector(d.normalize(), len * .85);
  return PO.reach(a, side, target, o);
}

function lap(a, side, k, drift = 0) {
  const sg = side === 'L' ? 1 : -1;
  const tg = PO.hipToWorld(a, sg * .15 * k, (.05 + drift) * k, .21 * k);
  clampReach(a, side, tg, { grip: .02, pole: [sg * .32, .05, .1] });
  PO.fingers(a, side, .28, { spread: .12 });
}

function wonderBox() {
  const g = new THREE.Group();
  const wood = PR.toon(0x5c3620), dark = PR.toon(0x23140e), brass = PR.toon(0xc89a3c);
  const base = new THREE.Mesh(new THREE.BoxGeometry(.34, .14, .24), wood);
  base.position.y = .07; base.castShadow = base.receiveShadow = true;
  const well = new THREE.Mesh(new THREE.PlaneGeometry(.30, .20), dark);
  well.rotation.x = -Math.PI / 2; well.position.y = .142;
  const hinge = new THREE.Group();
  hinge.position.set(0, .14, -.12); hinge.rotation.x = -.72;
  const lid = new THREE.Mesh(new THREE.BoxGeometry(.34, .028, .24), wood);
  lid.position.set(0, .014, .12); lid.castShadow = true;
  const clasp = new THREE.Mesh(new THREE.BoxGeometry(.04, .035, .015), brass);
  clasp.position.set(0, .12, .125);
  hinge.add(lid); g.add(base, well, clasp, hinge);
  g.userData.rim = new THREE.Vector3(.08, .16, .08);
  return g;
}

function bed(S3, st, t, col = 0x7c3e32, pillowCol = 0x4b5568) {
  const mo = st.A.mohammed;
  lieOnBed(mo, {
    top: TOP, feet: [.5, .87],
    origin: (st.mo0 ||= mo.group.position.clone()).clone().add(V(.04, 0, 0)),
    hands: 'belly', pillow: .08, tuck: .22, headTurn: -.14,
  });
  pillowUnder(S3, st, mo, { top: TOP, h: .08, col: pillowCol });
  st.cover ||= PR.blanket({ w: .4, l: .56, h: .06, col });
  const hp = mo.B.root.getWorldPosition(V(0, 0, 0)), ry = mo.group.rotation.y;
  S3.prop(st.cover, hp.x + Math.sin(ry) * .28, TOP + .03 - .004, hp.z + Math.cos(ry) * .28, ry);
  st.cover.visible = true;
  mo.B.chest.rotation.x += .012 * Math.sin(t * 1.7);
  mo.B.chest.updateWorldMatrix(false, true);
}

// b089: Mohammed kneeling beside his Wonder Box in the dim room
const pe1 = staged('chambre_penombre', {
  mohammed: {
    at: [820, 790], face: 'cam', yaw: .38, pose: 'kneel',
    o: { grounded: true, lean: .08, avoid: CHEST },
    seed: 3, talk: 0, lids: .35, look: [960, 825, .18], lookMax: .65,
  },
}, {
  light: { key: '#b8c4dc', keyI: 1.05, sky: '#6e7e9e', ground: '#3e322c', fillI: .55, shadow: .25, dir: [-3, 1.5, 1] },
  fx: { vignette: .65, grade: 'rgba(50,60,95,.18)' },
  act(lt, t, S, st, S3) {
    const mo = st.A.mohammed, k = mo.group.scale.y / 1.6;
    const bxP = S3.floorAt(960, 825);
    const box = st.box ||= wonderBox();
    S3.prop(box, bxP.x, 0, bxP.z, Math.atan2(S3.cam.position.x - bxP.x, S3.cam.position.z - bxP.z) - .25);
    box.visible = true;
    const open = sm(B(0)[0], B(0)[0] + 2.0, t), sag = sm(B(0)[0] + 4.4, B(0)[1] - .8, t);
    mo.B.spine.rotation.x += .07 * open + .015 * Math.sin(t * .9);
    mo.B.chest.rotation.x += .07 * open + .03 * sag;
    mo.B.head.rotation.z += .04 * Math.sin(t * .65);
    mo.B.spine.updateWorldMatrix(false, true);
    lap(mo, 'L', k, .01 * Math.sin(t * 1.1));
    const rimW = bxP.clone().add(V(-.04, .18, .04));
    const restR = PO.hipToWorld(mo, -.15 * k, .06 * k, .2 * k);
    const reachW = restR.clone().lerp(rimW, open * (1 - .65 * sag));
    clampReach(mo, 'R', reachW, { grip: .02, pole: [-.35, .05, .15] });
    PO.fingers(mo, 'R', .22 + .15 * sag, { spread: .15 });
  },
});

// b092: Mohammed lies on the right divan, silently crying himself to sleep
const pe2 = staged('chambre_penombre', {
  mohammed: {
    at: [1350, 694], face: [1336, 754], pose: 'lie',
    o: { top: TOP, turn: .12, hands: 'belly', headTurn: -.16, mattress: MATTRESS, avoid: CHEST },
    seed: 3, talk: 0,
    lids: t => .35 + .6 * sm(B(3)[0] + 3.5, B(3)[1] - 1.0, t),
  },
}, {
  light: { key: '#b8c4dc', keyI: 1.0, sky: '#637394', ground: '#382c28', fillI: .5, shadow: .25, dir: [-3, 1.5, 1] },
  fx: { vignette: .74, grade: 'rgba(45,55,95,.25)' },
  over(lt, u, t, S, st, S3) {
    const a = 1 - sm(B(3)[0] + 4.5, B(3)[1] - 1.2, t);
    if (a <= .02) return;
    const mo = st.A.mohammed, c = K.c;
    c.save(); c.strokeStyle = `rgba(185,215,235,${.3 * a})`; c.lineWidth = 1.1; c.lineCap = 'round';
    for (const sg of [-1, 1]) {
      const pts = [[sg * .04, .09, .15], [sg * .045, .04, .14], [sg * .035, -.01, .12]].map(p => S3.project(at(mo, 'head', p)).slice(0, 2));
      c.beginPath(); c.moveTo(...pts[0]); c.quadraticCurveTo(...pts[1], ...pts[2]); c.stroke();
    }
    c.restore();
  },
  act(lt, t, S, st, S3) {
    bed(S3, st, t, 0x7c3e32, 0x4b5568);
    const mo = st.A.mohammed;
    const settle = sm(B(3)[0] + 2.8, B(3)[1] - 1.0, t);
    mo.B.chest.rotation.x += .015 * Math.sin(t * 2.1) * (1 - .5 * settle);
    mo.B.head.rotation.y += -.08 * settle;
    mo.B.chest.updateWorldMatrix(false, true);
  },
});

// b093: Night — Zoubida kneels by the bed, tucks him in warmly, rocks gently humming and weeping
const nu = staged('chambre_nuit', {
  mohammed: {
    at: [1350, 694], face: [1336, 754], pose: 'lie',
    o: { top: TOP, turn: .12, hands: 'belly', headTurn: -.16, mattress: MATTRESS, avoid: CHEST },
    seed: 3, talk: 0, lids: .92,
  },
  zoubida: {
    at: [1085, 790], face: 'cam', yaw: .55, pose: 'kneel',
    o: { grounded: true, lean: .08, avoid: CHEST },
    seed: 7, talk: 0, lids: .74,
    look: (t, st) => {
      const p = at(st.A.mohammed, 'head').clone();
      p.y = Math.max(p.y, at(st.A.zoubida, 'head').y - .22);
      return p;
    },
    lookMax: .7,
  },
}, {
  light: { key: '#ffbe78', keyI: 1.3, sky: '#43527d', ground: '#2a1f28', fillI: .55, shadow: .25 },
  fx: { vignette: .7 },
  over(lt, u, t, S, st, S3) {
    const zo = st.A.zoubida, c = K.c;
    c.save(); c.strokeStyle = 'rgba(185,215,235,.3)'; c.lineWidth = 1.1; c.lineCap = 'round';
    for (const sg of [-1, 1]) {
      const pts = [[sg * .045, .10, .17], [sg * .043, .035, .175], [sg * .025, -.025, .15]].map(p => S3.project(at(zo, 'head', p)).slice(0, 2));
      c.beginPath(); c.moveTo(...pts[0]); c.quadraticCurveTo(...pts[1], ...pts[2]); c.stroke();
    }
    c.restore();
  },
  act(lt, t, S, st, S3) {
    bed(S3, st, t, 0x943c2e, 0x3b485e);
    const { zoubida: zo, mohammed: mo } = st.A, kz = zo.group.scale.y / 1.6;
    mo.B.chest.rotation.x += .014 * Math.sin(t * 2.4);
    const t0 = B(4)[0];
    const tuck = sm(t0 + .2, t0 + 1.5, t) * (1 - sm(t0 + 3.6, t0 + 5.0, t));
    const rock = sm(t0 + 4.2, t0 + 5.5, t);
    zo.B.chest.rotation.x += .08 * tuck + .02 * Math.sin(t * 1.1) * rock;
    zo.B.chest.rotation.z += .045 * Math.sin(t * 1.45) * rock;
    zo.B.head.rotation.z += .04 * Math.sin(t * 1.45 + .5) * rock;
    zo.B.chest.updateWorldMatrix(false, true);
    lap(zo, 'R', kz, .01 * Math.sin(t * 1.2));
    const tuckTg = at(mo, 'chest').clone().add(V(-.06, .12, .06));
    const restL = PO.hipToWorld(zo, .15 * kz, .06 * kz, .21 * kz);
    clampReach(zo, 'L', restL.clone().lerp(tuckTg, tuck), { grip: .02, pole: [.45, .08, .22] });
    PO.fingers(zo, 'L', .22, { spread: .15 });
  },
});

export default beatScene(ID, {
  shots: { pe1, pe2, nu },
  plan: {
    b089: { shot: 'pe1', size: 'W', on: 'mohammed' },
    b090: { move: 'push' },
    b091: { move: 'panR' },
    b092: { shot: 'pe2', size: 'CU', on: 'mohammed', z: 3.1, dx: -55, dy: -40 },
    b093: { shot: 'nu', size: 'M', on: 'zoubida', z: 1.55, dx: 120, dy: -25 },
  },
});
