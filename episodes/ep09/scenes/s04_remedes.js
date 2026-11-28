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
import { boyBed, BOY_H, BED_AT, lapRest } from '../lib/fix9_A.js';
import { reachClamp, turnToward } from '../lib/fix9_K.js';
import { beatScene, lines, sm, at, front, dirW, orient, V } from '../lib/beatscene.js';

const ID = 's04_remedes', L = lines(ID), B = i => L[i] || [0, 0];
const MATTRESS = [[1188, 574], [1450, 574], [1455, 688], [1308, 690]];
const BED = {
  at: BED_AT, face: [1180, 700], pose: 'lie', height: BOY_H, seed: 3, talk: 0,
  o: { top: .28, hands: 'belly', headTurn: .45, pillow: .1, mattress: MATTRESS },
};

const PEN_LIGHT = { key: '#ffd8b0', keyI: 1.05, sky: '#636888', ground: '#2e2522', fillI: .62, shadow: .08, dir: [.5, 4.2, .35] };
const PEN_FX = { grade: 'rgba(46, 50, 82, 0.28)', gradeOp: 'multiply', vignette: .58 };

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
  mohammed: { ...BED, lids: .4 },
  zoubida: {
    height: 1.58, at: [1165, 770], face: [1500, 980], pose: 'kneel', hands: false,
    o: { grounded: true, lean: .2, seat: .016 }, seed: 7, talk: 0,
    look: (t, st) => at(st.A.mohammed, 'head'),
    lookMax: .45,
  },
}, {
  light: PEN_LIGHT,
  fx: PEN_FX,
  act(lt, t, S, st, S3) {
    const mo = boyBed(S3, st, t, 1.15);
    const zo = st.A.zoubida;
    turnToward(zo, S3.cam.position, mo.group.position, .32);
    st.mat ||= S3.prop(PR.mat({ w: 1.15, d: .9, col: 0x6a4630 }));
    st.mat.userData.ambient = true;
    S3.prop(st.mat, zo.group.position.x, 0, zo.group.position.z, zo.group.rotation.y);
    zo.B.chest.rotation.x += .012 * Math.sin(t * 1.3);
    zo.B.chest.updateWorldMatrix(false, true);
    lapRest(zo);
  },
});

// b016–b017: Courtyard gallery — Rahma left arcade, Fatma right arcade
const pa = staged('patio_matin', {
  rahma: {
    // Foreground of the left arcade so a medium reads at adult scale.
    height: 1.6, at: [475, 930], face: [1625, 937], seed: 11,
    look: [1625, 937, 1.35], lookMax: .7,
  },
  fatma: {
    height: 1.58, at: [1625, 937], face: [475, 930], seed: 13,
    look: [475, 930, 1.35], lookMax: .65,
  },
}, {
  light: { key: '#ffe4b4', keyI: 2.0, sky: '#cbd9ee', ground: '#8f7759', fillI: 1.15, shadow: .28, dir: [2, 3, 1] },
  addressee: { rahma: 'fatma', fatma: 'rahma' },
  act(lt, t, S, st, S3) {
    const { rahma: ra, fatma: ft } = st.A, kr = ra.group.scale.y / 1.6, kf = ft.group.scale.y / 1.6;
    // b016: Rahma leans slightly forward, right hand cupped near mouth calling kindly
    const call = sm(B(1)[0] - 1.4, B(1)[0] - .15, t) * (1 - sm(B(1)[1] - .2, B(1)[1] + .2, t));
    ra.B.spine.rotation.x += .42 * call;
    ra.B.chest.rotation.x += .08 * call;
    ra.B.chest.updateWorldMatrix(false, true);
    const cup = front(ra, 'head', .14 * kr, .18 * kr, -.08 * kr);
    const restR = front(ra, 'root', .08 * kr, .22 * kr, -.34 * kr);
    reachClamp(ra, 'R', restR.lerp(cup, call), { grip: .01, pole: [-.35, .02, .1] });
    PO.fingers(ra, 'R', .22, { spread: .4 });
    // One cupped hand only: the left arm hangs relaxed at her side.
    const warm = front(ra, 'root', .06 * kr, -.24 * kr, -.36 * kr);
    reachClamp(ra, 'L', warm, { grip: 0, pole: [.2, .02, .1] });
    // b017: Fatma holds mint in left hand and lemon peel out in the right, leaning from the arcade
    const g = sm(B(2)[0] - 1.2, B(2)[0] + .1, t);
    st.mint ||= S3.prop(menthe());
    st.citron ||= S3.prop(citronProp());
    st.mint.visible = g > .02;
    st.citron.visible = g > .02;
    if (g > .02) {
      ft.B.spine.rotation.x += .3 * g;
      ft.B.chest.rotation.x += .06 * g;
      ft.B.chest.updateWorldMatrix(false, true);
      const restL = front(ft, 'root', .08 * kf, -.22 * kf, -.34 * kf);
      const restR = front(ft, 'root', .08 * kf, .24 * kf, -.34 * kf);
      // Wide of the face: +r is her right, so the right hand stays on that side.
      const lHold = front(ft, 'chest', .14 * kf, -.28 * kf, -.16 * kf);
      const rGest = front(ft, 'chest', .14 * kf, .28 * kf, -.12 * kf);
      reachClamp(ft, 'L', restL.lerp(lHold, g), { grip: .04, pole: [.32, .02, .08] });
      reachClamp(ft, 'R', restR.lerp(rGest, g), { grip: .03, pole: [-.32, .02, .08] });
      PO.fingers(ft, 'L', .55); PO.fingers(ft, 'R', .18, { spread: .3 });
      ft.group.updateMatrixWorld(true);
      orient(st.mint, PO.handPts(ft, 'L').palm, dirW(ft, 1, -.45, .1), V(0, 0, 1));
      orient(st.citron, PO.handPts(ft, 'R').palm, dirW(ft, 0, 1, .2), V(0, 0, 1));
    }
  },
});

// b018: Inside chambre_jour — Zoubida glances up softly in resignation
const ch = staged('chambre_jour', {
  mohammed: { ...BED, lids: .5 },
  zoubida: {
    height: 1.58, at: [1165, 770], face: [1500, 980], pose: 'kneel', hands: false,
    o: { grounded: true, lean: .18, seat: .016 }, seed: 7,
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
    const mo = boyBed(S3, st, t, 1.15);
    const zo = st.A.zoubida, kz = zo.group.scale.y / 1.6;
    turnToward(zo, S3.cam.position, mo.group.position, .45);
    lapRest(zo);
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
    b015: { shot: 'pe', size: 'M', on: 'zoubida', z: 1.55, dy: 48 },
    b016: { shot: 'pa', size: 'M', on: 'rahma', pt: [475, 930], z: 2.15, dy: 20 },
    b017: { shot: 'pa', size: 'M', on: 'fatma', pt: [1625, 937], z: 2.2, dy: 16, segs: [[.4, 'i_citron_menthe', { move: 'push' }]] },
    b018: { shot: 'ch', size: 'CU', on: 'zoubida', z: 2.7, dy: 8 },
  },
});
