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
import { lieOnBed, pillowUnder } from '../lib/fix8_lie.js';
import { beatScene, lines, sm, at, dirW, orient, V } from '../lib/beatscene.js';

const ID = 's01_hook', L = lines(ID), B = i => L[i] || [0, 0];
const MATTRESS = [[1188, 574], [1450, 574], [1455, 688], [1308, 690]];
const CHEST = [[1450, 580], [1830, 580], [1830, 850], [1450, 850]];
const BED = {
  at: [1350, 694], face: [1336, 754], pose: 'lie', height: 1.1, seed: 3, talk: 0,
  o: { top: .26, turn: .12, hands: 'belly', headTurn: -.2, pillow: .08, mattress: MATTRESS, avoid: CHEST },
};

function reachClamp(a, side, target, opt = {}) {
  const sh = at(a, 'upperArm' + side), el = at(a, 'foreArm' + side), hd = at(a, 'hand' + side);
  const len = sh.distanceTo(el) + el.distanceTo(hd), d = target.clone().sub(sh), max = len * .85;
  if (d.length() > max) target = sh.clone().addScaledVector(d.normalize(), max);
  return PO.reach(a, side, target, opt);
}

function bed(S3, st, t, headTurn = -.2) {
  const mo = st.A.mohammed;
  lieOnBed(mo, {
    top: .26, feet: [.5, .87],
    origin: (st.mo0 ||= mo.group.position.clone()).clone().add(V(.04, 0, 0)),
    hands: 'belly', pillow: .08, tuck: .22, headTurn,
  });
  pillowUnder(S3, st, mo, { top: .26, h: .08, col: 0x3b4860 });
  st.cover ||= PR.blanket({ w: .38, l: .54, h: .06, col: 0x6b3a3a });
  const hp = mo.B.root.getWorldPosition(V(0, 0, 0)), ry = mo.group.rotation.y;
  S3.prop(st.cover, hp.x + Math.sin(ry) * .28, .26 + .03 - .004, hp.z + Math.cos(ry) * .28, ry);
  st.cover.visible = true;
  mo.B.chest.rotation.x += .01 * Math.sin(t * 1.4);
  mo.B.chest.updateWorldMatrix(false, true);
}

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
  body.scale.set(.85, 1.3, .72); body.position.y = -.18;
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(.032, .05, .06, 10), PR.toon(0x8e724d));
  neck.position.y = -.02;
  const cord = new THREE.Mesh(new THREE.TorusGeometry(.036, .006, 6, 14), PR.toon(0x4b3826));
  cord.rotation.x = Math.PI / 2; cord.position.y = -.03;
  g.add(body, neck, cord);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return g;
}

/** Leather shepherd bag (sacoche) worn at the hip. */
function sacocheProp() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(.18, .2, .07), PR.toon(0x5e3b22));
  const flap = new THREE.Mesh(new THREE.BoxGeometry(.186, .09, .076), PR.toon(0x4b2e19));
  flap.position.set(0, .055, .003);
  const buckle = new THREE.Mesh(new THREE.BoxGeometry(.025, .025, .012), PR.toon(0xc8a040));
  buckle.position.set(0, .01, .04);
  g.add(body, flap, buckle);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return g;
}

/** Open Wonder Box (cedar chest with brass clasp, lid ajar, dim trinkets inside). */
function boiteProp() {
  const g = new THREE.Group(), wood = PR.toon(0x4a2c1c), brass = PR.toon(0xb89040);
  const base = new THREE.Mesh(new THREE.BoxGeometry(.28, .11, .19), wood);
  base.position.y = .055;
  const interior = new THREE.Mesh(new THREE.BoxGeometry(.24, .02, .15), PR.toon(0x1f1410));
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
  mohammed: { ...BED, lids: .28 },
  father: {
    height: 1.76, at: [700, 830], face: [410, 895], seed: 5, talk: 0,
    walk: { to: [410, 895], t0: B(0)[0] + .4, t1: B(0)[0] + 6.2 },
    lookMax: .95,
    look: (t, st) => t >= B(0)[0] + 6.4 ? at(st.A.mohammed, 'head').clone().setY(at(st.A.father, 'head').y - .15) : null,
  },
}, {
  light: { key: '#9cb0dc', keyI: .85, sky: '#586894', ground: '#2d2838', fillI: .48, shadow: .24, dir: [2, 2.6, 1] },
  fx: { grade: 'rgba(65, 78, 128, 0.52)', gradeOp: 'multiply', vignette: .68 },
  act(lt, t, S, st, S3) {
    bed(S3, st, t, -.24);
    const fa = st.A.father, k = fa.group.scale.y / 1.6;
    const stopU = sm(B(0)[0] + 6.2, B(0)[0] + 7.4, t);
    // At the threshold, turn 3/4 back toward Mohammed and camera so his look-back reads clearly
    if (stopU > 0) {
      const y0 = fa.group.rotation.y;
      fa.group.rotation.y = y0 + (.85 - y0) * stopU;
      fa.group.updateMatrixWorld(true);
      fa.B.chest.rotation.y += .22 * stopU;
      fa.B.chest.updateWorldMatrix(false, true);
      const rTgt = at(fa, 'root').addScaledVector(dirW(fa, -1, 0, 0), .2 * k).addScaledVector(dirW(fa, 0, 0, 1), .1 * k).add(V(0, -.04 * k, 0));
      const lTgt = at(fa, 'root').addScaledVector(dirW(fa, 1, 0, 0), .2 * k).addScaledVector(dirW(fa, 0, 0, 1), .12 * k).add(V(0, -.03 * k, 0));
      reachClamp(fa, 'R', rTgt, { grip: .02, pole: [-.35, .05, -.25] });
      reachClamp(fa, 'L', lTgt, { grip: .02, pole: [.35, .05, -.25] });
      PO.fingers(fa, 'R', .7); PO.fingers(fa, 'L', .7);
    }
    fa.group.updateMatrixWorld(true);
    st.faucille ||= S3.prop(faucilleProp());
    st.sac ||= S3.prop(sacProp());
    st.sacoche ||= S3.prop(sacocheProp());
    const pR = PO.handPts(fa, 'R').palm, pL = PO.handPts(fa, 'L').palm;
    orient(st.faucille, pR, dirW(fa, .2, -.85, .5), V(0, 1, 0));
    orient(st.sac, pL, dirW(fa, 0, .95, .2), V(0, 0, 1));
    const hip = at(fa, 'root').addScaledVector(dirW(fa, 1, 0, 0), .18 * k).addScaledVector(dirW(fa, 0, 0, 1), .05 * k);
    S3.prop(st.sacoche, hip.x, hip.y - .04 * k, hip.z, fa.group.rotation.y + Math.PI / 2);
  },
});

// b002: Night in chambre_nuit — Mohammed staring into the shadows beside the open Wonder Box
const nuit = staged('chambre_nuit', {
  mohammed: {
    ...BED,
    lids: t => .22 + .55 * (Math.max(0, Math.sin(t * 1.1 + .8)) ** 10),
  },
}, {
  light: { key: '#6e84b8', keyI: .65, sky: '#2d3756', ground: '#1c1824', fillI: .35, shadow: .22, dir: [-2, 2.2, 1] },
  fx: { grade: 'rgba(32, 40, 72, 0.45)', gradeOp: 'multiply', vignette: .78 },
  act(lt, t, S, st, S3) {
    bed(S3, st, t, -.2);
    st.boite ||= S3.prop(boiteProp());
    const bp = st.boitePos ||= S3.floorAt(1060, 765);
    S3.prop(st.boite, bp.x, 0, bp.z, -.45);
    st.boite.visible = true;
  },
  over(lt, u, t, S, st, S3) {
    if (st.boite) {
      const [bx, by] = S3.project(st.boite.position.clone().add(V(0, .1, 0)));
      K.glow(bx, by, 340, '#8ba8e0', .18, 'screen');
    }
  },
});

export default beatScene(ID, {
  shots: { dawn, nuit },
  plan: {
    b001: {
      shot: 'dawn', size: 'W', on: 'father',
      cover: [
        { f: .58, size: 'M', pt: [410, 895], on: 'father', z: 1.38, dx: 90, dy: -65 },
        { f: .82, size: 'CU', on: 'mohammed', z: 1.55, dx: -40, dy: -20 },
      ],
    },
    b002: { shot: 'nuit', size: 'CU', on: 'mohammed', z: 1.42, dx: -75, dy: 15 },
  },
});
