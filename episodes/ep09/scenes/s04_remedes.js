// s04_remedes: Neighbours' remedies — chambre_penombre -> patio_matin -> chambre_jour.
// b015 (chambre_penombre): The room settles after the vertigo; Zoubida sits kneeling on a low floor mat beside
// Mohammed's divan (lieOnBed), hands resting in her lap.
// b016 (patio_matin): Cutaway to the sunny courtyard — Rahma leans forward from the left arcade with one hand
// cupped near her mouth, calling kindly with warm advice (hot tea).
// b017 (patio_matin + insert i_citron_menthe): Across the courtyard, Fatma Bziouya leans from the right arcade
// holding mint sprigs (menthe) and lemon peel, gesturing warmly.
// b018 (chambre_jour): Back inside — Zoubida kneels beside Mohammed's bed, glancing softly upward in quiet
// resignation ("si Dieu ne soulage pas ses souffrances...").
import * as THREE from 'three';
import * as PO from '../../../engine/poses.js';
import * as PR from '../../../engine/props3d.js';
import { staged } from '../lib/autostage.js';
import { menthe } from '../lib/props7.js';
import { lieOnBed, pillowUnder } from '../lib/fix8_lie.js';
import { beatScene, lines, sm, at, dirW, orient, V } from '../lib/beatscene.js';

const ID = 's04_remedes', L = lines(ID), B = i => L[i] || [0, 0];
const MATTRESS = [[1188, 574], [1450, 574], [1455, 688], [1308, 690]];
const CHEST = [[1450, 580], [1830, 580], [1830, 850], [1450, 850]];
const BED = {
  at: [1350, 694], face: [1336, 754], pose: 'lie', height: 1.1, seed: 3, talk: 0,
  o: { top: .26, turn: .12, hands: 'belly', headTurn: -.18, pillow: .08, mattress: MATTRESS, avoid: CHEST },
};

const PEN_LIGHT = { key: '#ffd2a0', keyI: 1.05, sky: '#636888', ground: '#2e2522', fillI: .52, shadow: .25, dir: [-3, 1.2, 1] };
const PEN_FX = { grade: 'rgba(46, 50, 82, 0.36)', gradeOp: 'multiply', vignette: .68 };

function reachClamp(a, side, target, opt = {}) {
  const sh = at(a, 'upperArm' + side), el = at(a, 'foreArm' + side), hd = at(a, 'hand' + side);
  const len = sh.distanceTo(el) + el.distanceTo(hd), d = target.clone().sub(sh), max = len * .85;
  if (d.length() > max) target = sh.clone().addScaledVector(d.normalize(), max);
  return PO.reach(a, side, target, opt);
}

function bed(S3, st, t) {
  const mo = st.A.mohammed;
  lieOnBed(mo, {
    top: .26, feet: [.5, .87],
    origin: (st.mo0 ||= mo.group.position.clone()).clone().add(V(.04, 0, 0)),
    hands: 'belly', pillow: .08, tuck: .22, headTurn: -.18,
  });
  pillowUnder(S3, st, mo, { top: .26, h: .08, col: 0x4b5c74 });
  st.cover ||= PR.blanket({ w: .38, l: .54, h: .06, col: 0x8a3d34 });
  const hp = mo.B.root.getWorldPosition(V(0, 0, 0)), ry = mo.group.rotation.y;
  S3.prop(st.cover, hp.x + Math.sin(ry) * .28, .26 + .03 - .004, hp.z + Math.cos(ry) * .28, ry);
  st.cover.visible = true;
  mo.B.chest.rotation.x += .012 * Math.sin(t * 1.5);
  mo.B.chest.updateWorldMatrix(false, true);
}

function citronProp() {
  const g = new THREE.Group();
  const rind = new THREE.Mesh(new THREE.TorusGeometry(.032, .01, 6, 12, Math.PI * 1.3), PR.toon(0xe0bd36));
  const slice = new THREE.Mesh(new THREE.CylinderGeometry(.024, .024, .008, 12), PR.toon(0xf2db68));
  slice.position.set(.015, 0, 0);
  g.add(rind, slice);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return g;
}

// b015: Zoubida sits beside Mohammed on a low floor mat in chambre_penombre
const pe = staged('chambre_penombre', {
  mohammed: { ...BED, lids: .55 },
  zoubida: {
    height: 1.6, at: [1065, 785], face: 'cam', yaw: .28, pose: 'kneel',
    o: { grounded: true, lean: .08, avoid: CHEST }, seed: 7, talk: 0,
    look: (t, st) => at(st.A.mohammed, 'head').clone().setY(at(st.A.zoubida, 'head').y - .15),
    lookMax: .45,
  },
}, {
  light: PEN_LIGHT,
  fx: PEN_FX,
  act(lt, t, S, st, S3) {
    bed(S3, st, t);
    const zo = st.A.zoubida;
    st.mat ||= S3.prop(PR.mat({ w: .76, d: .58, col: 0x7c4632 }));
    S3.prop(st.mat, zo.group.position.x, 0, zo.group.position.z, zo.group.rotation.y);
    zo.B.chest.rotation.x += .015 * Math.sin(t * 1.4);
    zo.B.chest.rotation.z += .012 * Math.sin(t * .65);
    zo.B.head.rotation.z += .025 * Math.sin(t * .5);
    zo.B.chest.updateWorldMatrix(false, true);
  },
});

// b016–b017: Courtyard gallery — Rahma left arcade, Fatma right arcade
const pa = staged('patio_matin', {
  rahma: {
    height: 1.6, at: [440, 950], face: [960, 980], seed: 11,
    look: [960, 980, 1.3], lookMax: .55,
  },
  fatma: {
    height: 1.58, at: [1540, 940], face: [960, 980], seed: 13,
    look: [960, 980, 1.3], lookMax: .55,
  },
}, {
  light: { key: '#ffe4b4', keyI: 2.0, sky: '#cbd9ee', ground: '#8f7759', fillI: 1.15, shadow: .28, dir: [2, 3, 1] },
  addressee: { rahma: 'fatma', fatma: 'rahma' },
  act(lt, t, S, st, S3) {
    const { rahma: ra, fatma: ft } = st.A, kr = ra.group.scale.y / 1.6, kf = ft.group.scale.y / 1.6;
    // b016: Rahma leans slightly forward, right hand cupped near mouth calling kindly
    const call = sm(B(1)[0], B(1)[0] + .6, t) * (1 - sm(B(1)[1] - .4, B(1)[1], t));
    if (call > 0) {
      ra.B.spine.rotation.x += .1 * call;
      ra.B.chest.updateWorldMatrix(false, true);
      const restR = at(ra, 'root').addScaledVector(dirW(ra, -1, 0, 0), .2 * kr).addScaledVector(dirW(ra, 0, 0, 1), .14 * kr);
      const cup = at(ra, 'head').addScaledVector(dirW(ra, 0, 0, 1), .18 * kr).addScaledVector(dirW(ra, -1, 0, 0), .08 * kr).add(V(0, -.04 * kr, 0));
      reachClamp(ra, 'R', restR.lerp(cup, call), { grip: .01, pole: [-.45, -.05, .35] });
      PO.fingers(ra, 'R', .22, { spread: .15 });
    }
    // b017: Fatma holds mint in left hand and lemon peel while gesturing warmly with right hand
    const g = sm(B(2)[0] - .2, B(2)[0] + .5, t);
    st.mint ||= S3.prop(menthe());
    st.citron ||= S3.prop(citronProp());
    st.mint.visible = g > .02;
    st.citron.visible = g > .02;
    if (g > .02) {
      ft.B.spine.rotation.x += .07 * g;
      ft.B.chest.updateWorldMatrix(false, true);
      const restL = at(ft, 'root').addScaledVector(dirW(ft, 1, 0, 0), .2 * kf).addScaledVector(dirW(ft, 0, 0, 1), .1 * kf);
      const restR = at(ft, 'root').addScaledVector(dirW(ft, -1, 0, 0), .2 * kf).addScaledVector(dirW(ft, 0, 0, 1), .1 * kf);
      const lHold = at(ft, 'spine').addScaledVector(dirW(ft, 0, 0, 1), .22 * kf).addScaledVector(dirW(ft, 1, 0, 0), .24 * kf).add(V(0, (-.08 + .02 * Math.sin(t * 2.4)) * kf, 0));
      const rGest = at(ft, 'chest').addScaledVector(dirW(ft, 0, 0, 1), (.22 + .03 * Math.sin(t * 3.2)) * kf).addScaledVector(dirW(ft, -1, 0, 0), .22 * kf).add(V(0, (-.14 + .04 * Math.sin(t * 2.8)) * kf, 0));
      reachClamp(ft, 'L', restL.lerp(lHold, g), { grip: .02, pole: [.45, -.05, .25] });
      reachClamp(ft, 'R', restR.lerp(rGest, g), { grip: .01, pole: [-.45, -.05, .25] });
      PO.fingers(ft, 'L', .55); PO.fingers(ft, 'R', .18, { spread: .3 });
      ft.group.updateMatrixWorld(true);
      orient(st.mint, PO.handPts(ft, 'L').palm, dirW(ft, .25, .42, .88), V(0, 0, 1));
      orient(st.citron, PO.handPts(ft, 'R').palm, dirW(ft, 0, 1, .2), V(0, 0, 1));
    }
  },
});

// b018: Inside chambre_jour — Zoubida glances up softly in resignation
const ch = staged('chambre_jour', {
  mohammed: { ...BED, lids: .5 },
  zoubida: {
    height: 1.6, at: [1065, 785], face: 'cam', yaw: .5, pose: 'kneel',
    o: { grounded: true, lean: .08, avoid: CHEST }, seed: 7,
    look: (t, st) => {
      const up = sm(B(3)[0] + 1.8, B(3)[0] + 3.0, t);
      const h = at(st.A.zoubida, 'head');
      return h.clone().add(V(0, -.1 + .65 * up, 1.0));
    },
    lookMax: .75,
  },
}, {
  light: { key: '#ffe4b4', keyI: 1.65, sky: '#b8c8df', ground: '#7c664c', fillI: .9, shadow: .25, dir: [2, 3, 1] },
  act(lt, t, S, st, S3) {
    bed(S3, st, t);
    const zo = st.A.zoubida, kz = zo.group.scale.y / 1.6;
    const sigh = sm(B(3)[0] + 1.6, B(3)[0] + 2.8, t);
    zo.B.chest.rotation.x += .02 * Math.sin(t * 1.4) - .03 * sigh;
    zo.B.head.rotation.x += .04 * Math.sin(t * 1.1) - .06 * sigh;
    zo.B.chest.updateWorldMatrix(false, true);
    if (sigh > .05) {
      for (const [sd, sg] of [['L', 1], ['R', -1]]) {
        const tg = PO.hipToWorld(zo, sg * .19 * kz, (.1 + .05 * sigh) * kz, (.25 + .04 * sigh) * kz);
        reachClamp(zo, sd, tg, { grip: .02, pole: [sg * .35, .05, .1] });
        PO.fingers(zo, sd, .18 * (1 - .5 * sigh), { spread: .25 });
      }
    }
  },
});

export default beatScene(ID, {
  shots: { pe, pa, ch },
  plan: {
    b015: { shot: 'pe', size: 'M', on: 'zoubida', z: 1.38, dx: 50, dy: -20 },
    b016: { shot: 'pa', size: 'M', on: 'rahma', z: 2.8, dx: 40, dy: 20 },
    b017: { shot: 'pa', size: 'M', on: 'fatma', z: 2.8, dx: -40, dy: 20 },
    b018: { shot: 'ch', size: 'CU', on: 'zoubida', z: 1.75, dy: -15 },
  },
});
