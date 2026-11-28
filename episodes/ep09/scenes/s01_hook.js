// s01_hook: Hook — the father's dawn departure and the Wonder Box turned coffin.
// b001 (chambre_jour, dawn gloom): Maâlem Abdeslem walks quietly toward the left doorway carrying his shepherd
// leather bag (sacoche), new crescent sickle (faucille) in his right hand, and provisions sack (sac) in his left;
// at the threshold he pauses and looks back once toward the bed. Mohammed lies on the right divan (lieOnBed),
// watching silently.
// b002 (chambre_nuit, moonlight): Mohammed lies motionless on the dark mattress staring into the shadows; beside the
// divan sits the open Wonder Box (boite), dim and lifeless like a small coffin.
import * as THREE from 'three';
import * as K from '../../../engine/core.js';
import * as PO from '../../../engine/poses.js';
import * as PR from '../../../engine/props3d.js';
import { staged } from '../lib/autostage.js';
import { glow as lift } from '../lib/fix8_R31AE.js';
import { boyBed, BOY_H, BED_AT } from '../lib/fix9_A.js';
import { carryHand } from '../lib/fix9_K.js';
import { beatScene, lines, at, dirW, orient, V } from '../lib/beatscene.js';

const ID = 's01_hook', L = lines(ID), B = i => L[i] || [0, 0];
/** Painted right-divan top (plate px). Same quad the other chambre scenes use. */
const MATTRESS = [[1188, 574], [1450, 574], [1455, 688], [1308, 690]];
const BED = {
  at: BED_AT, face: [1180, 700], pose: 'lie', height: BOY_H, seed: 3, talk: 0,
  o: { top: .28, hands: 'belly', headTurn: .5, pillow: .1, mattress: MATTRESS },
};

/** Crescent iron sickle with wooden grip; origin at handle, blade rises along +y. */
function faucilleProp() {
  const g = new THREE.Group();
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(.014, .016, .14, 8), PR.toon(0x6e4726));
  handle.position.y = .05;
  const blade = new THREE.Mesh(new THREE.TorusGeometry(.11, .009, 6, 18, Math.PI * 1.05), PR.toon(0xbec6cf));
  blade.position.set(-.08, .19, 0); blade.rotation.z = -.65;
  g.add(handle, blade);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return g;
}

/** Woven burlap provisions sack; origin near tie-neck grip, body hangs along -y. */
function sacProp() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(.14, 14, 10), PR.toon(0xa38760));
  body.scale.set(.7, 1.05, .58); body.position.set(.05, -.2, 0);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(.032, .05, .06, 10), PR.toon(0x8e724d));
  neck.position.y = -.02;
  const cord = new THREE.Mesh(new THREE.TorusGeometry(.036, .006, 6, 14), PR.toon(0x4b3826));
  cord.rotation.x = Math.PI / 2; cord.position.y = -.03;
  g.add(body, neck, cord);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return g;
}

/** Leather shepherd bag worn on the hip, with a shoulder strap. */
function sacocheProp() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(.16, .18, .06), PR.toon(0x5e3b22));
  const flap = new THREE.Mesh(new THREE.BoxGeometry(.166, .08, .066), PR.toon(0x4b2e19));
  flap.position.set(0, .05, .004);
  const buckle = new THREE.Mesh(new THREE.BoxGeometry(.025, .022, .012), PR.toon(0xc8a040));
  buckle.position.set(0, .01, .038);
  // Short tab on the bag. A long cylinder read as a rod floating behind the shoulder.
  const strap = new THREE.Mesh(new THREE.BoxGeometry(.014, .15, .02), PR.toon(0x3a2414));
  strap.position.set(.01, .11, -.02);
  strap.rotation.x = -.45;
  strap.rotation.z = .18;
  g.add(body, flap, buckle, strap);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return g;
}

/** Open Wonder Box (cedar chest with brass clasp, lid ajar, dim trinkets inside). */
function boiteProp() {
  const g = new THREE.Group(), wood = PR.toon(0x8a5a32), brass = PR.toon(0xe0b85a);
  const base = new THREE.Mesh(new THREE.BoxGeometry(.34, .13, .22), wood);
  base.position.y = .065;
  const interior = new THREE.Mesh(new THREE.BoxGeometry(.28, .03, .16), PR.toon(0x6a4a28));
  interior.position.y = .102;
  const lid = new THREE.Group();
  lid.position.set(0, .11, -.095);
  lid.rotation.x = -.78;
  const lidBox = new THREE.Mesh(new THREE.BoxGeometry(.284, .032, .192), wood);
  lidBox.position.set(0, .016, .095);
  const clasp = new THREE.Mesh(new THREE.BoxGeometry(.032, .024, .012), brass);
  clasp.position.set(0, 0, .192);
  lid.add(lidBox, clasp);
  const marble = new THREE.Mesh(new THREE.SphereGeometry(.016, 10, 8), PR.toon(0x7ca2b8));
  marble.position.set(-.05, .12, .01);
  const button = new THREE.Mesh(new THREE.CylinderGeometry(.018, .018, .006, 12), PR.toon(0xd8cfc0));
  button.position.set(.04, .116, -.02);
  g.add(base, interior, lid, marble, button);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return g;
}

// b001: Dawn gloom in chambre_jour
const dawn = staged('chambre_jour', {
  // headTurn in boyBed carries the glance toward the room. A look: target after the lie
  // solve lifts the skull off the pillow, so the gaze stays inside the lie pose.
  mohammed: { ...BED, lids: .2 },
  father: {
    height: 1.76, at: [1000, 760], face: [240, 900], seed: 5, talk: 0,
    // Stop inside the doorway, not on the lens, so the wide keeps his feet in frame.
    walk: { to: [240, 900], t0: .08, t1: B(0)[0] + 5.4 },
    lookMax: .7,
    look: (t, st) => t >= B(0)[0] + 5.2 ? at(st.A.mohammed, 'head') : null,
  },
}, {
  light: { key: '#d4c4a4', keyI: 1.15, sky: '#8a94b0', ground: '#3a342c', fillI: .72, shadow: .16, dir: [1.2, 3.2, .6] },
  fx: { grade: 'rgba(90, 100, 140, 0.28)', gradeOp: 'multiply', vignette: .55 },
  act(lt, t, S, st, S3) {
    const mo = boyBed(S3, st, t, 1.15, 0x6b3a3a);
    lift(mo, .16);
    const fa = st.A.father, k = fa.group.scale.y / 1.6;
    const back = t >= B(0)[0] + 5.2;
    // Walk faces the door. At the threshold, shoulders turn back toward the bed; the body stays upright.
    if (back) {
      const head = at(mo, 'head');
      const yCam = Math.atan2(S3.cam.position.x - fa.group.position.x, S3.cam.position.z - fa.group.position.z);
      const yBed = Math.atan2(head.x - fa.group.position.x, head.z - fa.group.position.z);
      let d = yBed - yCam; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2;
      fa.group.rotation.y = yCam + Math.max(-.5, Math.min(.5, d));
      fa.group.updateMatrixWorld(true);
      fa.B.chest.rotation.y += .22;
      fa.B.chest.updateWorldMatrix(false, true);
    }
    // Right hand clear of the hip with the sickle; left hand out so the sack hangs beside the leg.
    carryHand(fa, 'R', -1, { fwd: .08, out: .22, drop: .52 });
    carryHand(fa, 'L', 1, { fwd: .02, out: .26, drop: .6 });
    PO.fingers(fa, 'R', .72);
    PO.fingers(fa, 'L', .62);
    fa.group.updateMatrixWorld(true);
    st.faucille ||= S3.prop(faucilleProp());
    st.sac ||= S3.prop(sacProp());
    st.sacoche ||= S3.prop(sacocheProp());
    const pR = PO.handPts(fa, 'R').palm, pL = PO.handPts(fa, 'L').palm;
    orient(st.faucille, pR, dirW(fa, .35, .92, .2), V(0, 0, 1));
    orient(st.sac, pL.clone().add(V(0, -.02, 0)), dirW(fa, -.1, -1, .05), V(1, 0, 0));
    const hip = at(fa, 'root').addScaledVector(dirW(fa, 0, 0, -1), .14 * k).add(V(0, .06 * k, 0));
    S3.prop(st.sacoche, hip.x, hip.y, hip.z, fa.group.rotation.y + .4);
  },
});

// b002: Night in chambre_nuit — Mohammed staring into the shadows beside the open Wonder Box
const nuit = staged('chambre_nuit', {
  mohammed: {
    ...BED,
    lids: t => .12 + .5 * (Math.max(0, Math.sin(t * .7 + .4)) ** 12),
  },
}, {
  light: { key: '#c5d4f0', keyI: 1.05, sky: '#3a4468', ground: '#241e28', fillI: .55, shadow: .12, dir: [2.2, 2.8, -.4] },
  fx: { grade: 'rgba(40, 48, 80, 0.22)', gradeOp: 'multiply', vignette: .62 },
  act(lt, t, S, st, S3) {
    // Night plate: the head overhung the right mattress edge, so slide the boy toward the divan centre.
    if (!st.mo0) { st.mo0 = st.A.mohammed.group.position.clone(); st.mo0.z += 1.0; st.mo0.x -= .38; }
    const mo = boyBed(S3, st, t, 1.15, 0x5a3038);
    lift(mo, .2);
    st.boite ||= S3.prop(boiteProp());
    // Tiles in front of the divan, clear of the mattress edge.
    const bp = st.boitePos ||= S3.floorAt(1300, 830);
    S3.prop(st.boite, bp.x, 0, bp.z, -.4);
    st.boite.visible = true;
  },
  over(lt, u, t, S, st, S3) {
    if (st.boite) {
      const [bx, by] = S3.project(st.boite.position.clone().add(V(0, .1, 0)));
      K.glow(bx, by, 280, '#d0def8', .42, 'screen');
    }
  },
});

export default beatScene(ID, {
  shots: { dawn, nuit },
  plan: {
    b001: { shot: 'dawn', size: 'W', on: 'father' },
    b002: { shot: 'nuit', size: 'M', on: 'mohammed', z: 2.1, dx: 10, dy: 60 },
  },
});
