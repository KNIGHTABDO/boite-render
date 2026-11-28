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
import { settleRobe } from '../lib/fix8g.js';
import { syncSeat } from '../lib/fix8a.js';
import { seatHead } from '../lib/fix9_B.js';
import { beatScene, lines, sm, at, V } from '../lib/beatscene.js';

const ID = 's14_cercueil', L = lines(ID), B = i => L[i] || [0, 0];

const MATTRESS = [[1188, 574], [1450, 574], [1455, 688], [1308, 690]];
const CHEST = [[1450, 580], [1830, 580], [1830, 850], [1450, 850]];
const TOP = .26;
// Open floor in front of the centre divan. He kneels on the left of the box, close enough to touch the lid.
const BOX = [1010, 925];
const BOY = [935, 890];

function clampReach(a, side, target, o) {
  const sh = at(a, 'upperArm' + side);
  const len = sh.distanceTo(at(a, 'foreArm' + side)) + at(a, 'foreArm' + side).distanceTo(at(a, 'hand' + side));
  const d = target.clone().sub(sh);
  if (d.length() > len * .92) target = sh.clone().addScaledVector(d.normalize(), len * .92);
  return PO.reach(a, side, target, o);
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

// Blanket on the torso (never under the feet, never onto the wooden chest).
// coverU 0 = folded over the hips, 1 = drawn up to the chest.
function layCover(S3, st, mo, col, coverU) {
  st.cover ||= PR.blanket({ w: .38, l: .42, h: .045, col });
  st.cover.userData.ambient = true;
  const hip = mo.B.root.getWorldPosition(V(0, 0, 0));
  const chest = mo.B.chest.getWorldPosition(V(0, 0, 0));
  const p = hip.clone().lerp(chest, .2 + .55 * coverU);
  S3.prop(st.cover, p.x, TOP + .05, p.z, mo.group.rotation.y);
  st.cover.visible = true;
}

function bed(S3, st, t, { col = 0x7c3e32, pillowCol = 0x4b5568, headTurn = -.16, tuck = .22, feet = [.5, .87], cover = false, coverU = 0 } = {}) {
  const mo = st.A.mohammed;
  lieOnBed(mo, {
    top: TOP, feet,
    origin: (st.mo0 ||= mo.group.position.clone()),
    hands: 'belly', pillow: .08, tuck, headTurn,
  });
  pillowUnder(S3, st, mo, { top: TOP, h: .08, col: pillowCol, w: .42, d: .3 });
  if (st.pillow) st.pillow.userData.ambient = true;
  if (cover) layCover(S3, st, mo, col, coverU);
  else if (st.cover) st.cover.visible = false;
  mo.B.chest.rotation.x += .012 * Math.sin(t * 1.7);
  mo.B.chest.updateWorldMatrix(false, true);
}

// b089: Mohammed kneeling beside his Wonder Box in the dim room.
// Legacy kneel (no grounded: the grounded solver straightens this child rig into a standing column).
const pe1 = staged('chambre_penombre', {
  mohammed: {
    at: BOY, face: BOX, yaw: .42, pose: 'kneel', hands: false,
    o: { lean: .42, hip: .24, spread: .1, hands: false },
    seed: 3, talk: 0, lids: .48,
    look: [BOX[0], BOX[1], .16], lookMax: .9,
  },
}, {
  light: { key: '#b8c4dc', keyI: 1.05, sky: '#6e7e9e', ground: '#3e322c', fillI: .55, shadow: .25, dir: [-3, 1.5, 1] },
  fx: { vignette: .65, grade: 'rgba(50,60,95,.18)' },
  act(lt, t, S, st, S3) {
    const mo = st.A.mohammed, k = mo.group.scale.y / 1.6;
    const bxP = S3.floorAt(BOX[0], BOX[1]);
    const box = st.box ||= wonderBox();
    const face = Math.atan2(mo.group.position.x - bxP.x, mo.group.position.z - bxP.z);
    S3.prop(box, bxP.x, 0, bxP.z, face + .15);
    box.visible = true;
    // Already on his knees at the first frame; a small breath, hand kept on the lid the whole beat.
    const sigh = .5 + .5 * Math.sin(t * .8);
    mo.B.spine.rotation.x += .16 + .03 * sigh;
    mo.B.chest.rotation.x += .12;
    mo.B.neck.rotation.x += .16;
    mo.B.head.rotation.z += .03 * Math.sin(t * .65);
    mo.B.spine.updateWorldMatrix(false, true);
    const knee = PO.hipToWorld(mo, .14 * k, .02 * k, .2 * k);
    clampReach(mo, 'L', knee, { grip: .01, pole: [.28, .04, .14] });
    PO.fingers(mo, 'L', .28, { spread: .12 });
    const lid = bxP.clone().add(V(.02, .18, .08));
    clampReach(mo, 'R', lid, { grip: .01, pole: [-.42, .28, .4] });
    PO.fingers(mo, 'R', .34, { spread: .16 });
    // Legacy kneel plants a shin vertex, not the knee the gate measures. Declare that knee as the seat.
    syncSeat(mo);
    // The staged mark and the actor mark are not the same object. The gate reads the staged one.
    const declared = S3.qa?.actMarks?.mohammed?.o;
    const seat = mo.actMark?.o?.seat;
    if (declared && seat != null) declared.seat = seat;
  },
});

// b092: Mohammed lies on the right divan, silently crying himself to sleep.
const pe2 = staged('chambre_penombre', {
  mohammed: {
    at: [1350, 694], face: [1336, 754], pose: 'lie',
    o: { top: TOP, turn: .12, hands: 'belly', headTurn: -.42, pillow: .08, mattress: MATTRESS, avoid: CHEST },
    seed: 3, talk: 0,
    lids: t => sm(B(3)[0] + .3, B(3)[0] + 3.8, t),
  },
}, {
  light: { key: '#b8c4dc', keyI: 1.0, sky: '#637394', ground: '#382c28', fillI: .5, shadow: .25, dir: [-3, 1.5, 1] },
  fx: { vignette: .74, grade: 'rgba(45,55,95,.25)' },
  over(lt, u, t, S, st, S3) {
    const sleep = sm(B(3)[0] + .3, B(3)[0] + 3.8, t);
    const a = (1 - sleep) * .85;
    if (a <= .02) return;
    const mo = st.A.mohammed, c = K.c;
    c.save(); c.strokeStyle = `rgba(185,215,235,${.35 * a})`; c.lineWidth = 1.1; c.lineCap = 'round';
    for (const sg of [-1, 1]) {
      const pts = [[sg * .04, .09, .15], [sg * .045, .04, .14], [sg * .035, -.01, .12]].map(p => S3.project(at(mo, 'head', p)).slice(0, 2));
      c.beginPath(); c.moveTo(...pts[0]); c.quadraticCurveTo(...pts[1], ...pts[2]); c.stroke();
    }
    c.restore();
  },
  act(lt, t, S, st, S3) {
    const sleep = sm(B(3)[0] + .4, B(3)[0] + 3.6, t);
    bed(S3, st, t, { col: 0x7c3e32, pillowCol: 0x4b5568, headTurn: -.36, tuck: .34, cover: false });
    const mo = st.A.mohammed;
    mo.B.head.rotation.x += .1 * sleep;
    mo.B.neck.rotation.x += .06 * sleep;
    mo.B.chest.rotation.x += .012 * Math.sin(t * 2.1) * (1 - .7 * sleep);
    seatHead(mo, TOP + .08);
    mo.B.chest.updateWorldMatrix(false, true);
  },
});

// b093: Night — Zoubida kneels by the bed, tucks him in warmly, rocks gently humming and weeping.
const nu = staged('chambre_nuit', {
  mohammed: {
    at: [1310, 630], face: Math.atan2(.92, .18), pose: 'lie', height: 1.1,
    o: { top: TOP, turn: .1, hands: 'belly', headTurn: -.16, pillow: .08, mattress: MATTRESS, avoid: CHEST },
    seed: 3, talk: 0, lids: .98,
  },
  zoubida: {
    at: [1125, 820], face: 'cam', yaw: -.28, pose: 'kneel', hands: false,
    o: { grounded: true, lean: .16, hip: .26, spread: .1, hands: false },
    seed: 7, talk: 0, lids: .74,
    look: (t, st) => at(st.A.mohammed, 'chest'),
    lookMax: .32,
  },
}, {
  light: { key: '#a9b8dc', keyI: .62, sky: '#3a4c78', ground: '#221c28', fillI: .85, shadow: .42, dir: [-2.2, 2.8, .35] },
  fx: { vignette: .7, grade: 'rgba(35,48,82,.14)' },
  over(lt, u, t, S, st, S3) {
    const zo = st.A.zoubida, c = K.c;
    c.save(); c.strokeStyle = 'rgba(185,215,235,.28)'; c.lineWidth = 1.1; c.lineCap = 'round';
    for (const sg of [-1, 1]) {
      const pts = [[sg * .045, .10, .17], [sg * .043, .035, .175], [sg * .025, -.025, .15]].map(p => S3.project(at(zo, 'head', p)).slice(0, 2));
      c.beginPath(); c.moveTo(...pts[0]); c.quadraticCurveTo(...pts[1], ...pts[2]); c.stroke();
    }
    c.restore();
  },
  act(lt, t, S, st, S3) {
    const t0 = B(4)[0];
    const tuck = sm(t0 + .2, t0 + 2.6, t);
    const rock = sm(t0 + 2.2, t0 + 3.8, t);
    bed(S3, st, t, { col: 0x8a3a2c, pillowCol: 0x3b485e, headTurn: -.16, tuck: .16, feet: [.92, .18], cover: true, coverU: tuck });
    const { zoubida: zo, mohammed: mo } = st.A, kz = zo.group.scale.y / 1.6;
    mo.B.chest.rotation.x += .012 * Math.sin(t * 2.4);
    const sway = Math.sin(t * 1.45);
    zo.B.spine.rotation.x += .06 + .03 * tuck;
    zo.B.chest.rotation.x += .04 * tuck;
    zo.B.chest.rotation.z += .11 * sway * rock;
    zo.B.head.rotation.z += .06 * Math.sin(t * 1.45 + .5) * rock;
    zo.B.chest.updateWorldMatrix(false, true);
    const thigh = PO.hipToWorld(zo, -.16 * kz, .03 * kz, .18 * kz);
    clampReach(zo, 'R', thigh, { grip: .01, pole: [-.22, .02, .12] });
    PO.fingers(zo, 'R', .24, { spread: .1 });
    const blanket = st.cover.getWorldPosition(V(0, 0, 0)).add(V(-.04, .04, .02));
    const park = PO.hipToWorld(zo, .14 * kz, .05 * kz, .16 * kz);
    clampReach(zo, 'L', park.clone().lerp(blanket, .25 + .75 * tuck), { grip: .01, pole: [.4, .12, .2] });
    PO.fingers(zo, 'L', .22 + .1 * tuck, { spread: .14 });
    // Lay the orange sash on the lap instead of letting the front panel tear through the skirt.
    settleRobe(zo, 0, { front: { scale: .7, fwd: .02, over: .03, s1: .92 } });
    seatHead(mo, TOP + .08);
    syncSeat(zo);
  },
});

export default beatScene(ID, {
  shots: { pe1, pe2, nu },
  plan: {
    b089: { shot: 'pe1', size: 'W', on: 'mohammed' },
    b090: { move: 'push' },
    b091: { move: 'panR' },
    b092: { shot: 'pe2', size: 'CU', on: 'mohammed', z: 3.1, dx: -55, dy: -40 },
    b093: { shot: 'nu', size: 'M', on: 'zoubida', z: 1.55, dx: 80, dy: -20 },
  },
});
