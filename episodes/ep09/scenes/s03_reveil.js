// s03_reveil: Fever awakening in chambre_penombre and hallucination paintings.
// b004 (chambre_penombre, card LA FIÈVRE): Mohammed lies on the right divan (lieOnBed); Zoubida stands near the left
// doorway whispering toward a motionless dark silhouette figure.
// b005 (chambre_penombre): Zoubida and the dark shadow drift away out the doorway, leaving Mohammed alone in dimness.
// b006 (painting p01_cendres_etincelles): Fever hallucination — red ash embers and cold sparks swirling.
// b007 (chambre_penombre): Zoubida steals silently back across the room on tiptoe and bends close over Mohammed.
// b008–b012 (chambre_penombre): Mohammed wakes in pain ("Je suis réveillé..."), asks why it is dark, Zoubida sits
// kneeling beside the mattress wiping a tear, Mohammed whispers "J'ai faim."
// b013 (chambre_penombre + insert i_bol_bouillon): Zoubida brightens and hurries out toward the kitchen for broth.
// b014 (painting p02_chambre_tournante): Vertigo — the room tilts and spins like stars and meteors.
import * as THREE from 'three';
import * as K from '../../../engine/core.js';
import * as PO from '../../../engine/poses.js';
import * as PR from '../../../engine/props3d.js';
import { staged } from '../lib/autostage.js';
import { still, loadStill } from '../lib/stage.js';
import { dim } from '../lib/fix8_R31AE.js';
import { lieOnBed, pillowUnder } from '../lib/fix8_lie.js';
import { beatScene, lines, sm, at, dirW, V } from '../lib/beatscene.js';

const { c, W, H, hash, glow } = K;
const ID = 's03_reveil', L = lines(ID), B = i => L[i] || [0, 0];
const IN = (i, t) => t >= B(i)[0] - .15 && t < (B(i + 1)[0] || B(i)[1] + .3);

const MATTRESS = [[1188, 574], [1450, 574], [1455, 688], [1308, 690]];
const CHEST = [[1450, 580], [1830, 580], [1830, 850], [1450, 850]];
const BED = {
  at: [1350, 694], face: [1336, 754], pose: 'lie', height: 1.1, seed: 3, talk: 0,
  o: { top: .26, turn: .12, hands: 'belly', headTurn: -.14, pillow: .08, mattress: MATTRESS, avoid: CHEST },
};

const PEN_LIGHT = { key: '#ffd2a0', keyI: 1.0, sky: '#5a5e80', ground: '#2a2220', fillI: .5, shadow: .25, dir: [-3, 1.2, 1] };
const PEN_FX = { grade: 'rgba(42, 46, 78, 0.42)', gradeOp: 'multiply', vignette: .72 };

function reachClamp(a, side, target, opt = {}) {
  const sh = at(a, 'upperArm' + side), el = at(a, 'foreArm' + side), hd = at(a, 'hand' + side);
  const len = sh.distanceTo(el) + el.distanceTo(hd), d = target.clone().sub(sh), max = len * .85;
  if (d.length() > max) target = sh.clone().addScaledVector(d.normalize(), max);
  return PO.reach(a, side, target, opt);
}

function bed(S3, st, t, headTurn = -.14) {
  const mo = st.A.mohammed;
  lieOnBed(mo, {
    top: .26, feet: [.5, .87],
    origin: (st.mo0 ||= mo.group.position.clone()).clone().add(V(.04, 0, 0)),
    hands: 'belly', pillow: .08, tuck: .22, headTurn,
  });
  pillowUnder(S3, st, mo, { top: .26, h: .08, col: 0x4b5c74 });
  st.cover ||= PR.blanket({ w: .38, l: .54, h: .06, col: 0x8a3d34 });
  const hp = mo.B.root.getWorldPosition(V(0, 0, 0)), ry = mo.group.rotation.y;
  S3.prop(st.cover, hp.x + Math.sin(ry) * .28, .26 + .03 - .004, hp.z + Math.cos(ry) * .28, ry);
  st.cover.visible = true;
  mo.B.chest.rotation.x += .012 * Math.sin(t * 1.8);
  mo.B.chest.updateWorldMatrix(false, true);
}

// b004–b005: Zoubida whispers to a dark motionless shadow near the doorway, then both step back toward the threshold
const pe1 = staged('chambre_penombre', {
  mohammed: { ...BED, lids: t => t < B(0)[0] + 4 ? .85 : .55 },
  zoubida: {
    height: 1.6, at: [620, 880], face: 'cam', yaw: -.35, seed: 7, talk: 0,
    walk: { to: [510, 915], t0: B(1)[0] + 5.5, t1: B(1)[0] + 10.5 },
    look: [360, 955, 1.35], lookMax: .35,
  },
  woman1: {
    height: 1.6, at: [310, 895], face: [620, 880], seed: 11, talk: 0,
    walk: { to: [275, 915], t0: B(1)[0] + 4.8, t1: B(1)[0] + 9.2 },
    lookMax: .4,
  },
}, {
  light: PEN_LIGHT,
  fx: PEN_FX,
  addressee: { zoubida: 'woman1', woman1: 'zoubida' },
  act(lt, t, S, st, S3) {
    bed(S3, st, t, -.18);
    const { zoubida: zo, woman1: sh } = st.A, kz = zo.group.scale.y / 1.6;
    dim(sh, .12);
    // b004 & early b005: Zoubida leans slightly toward the shadow with a hand near her mouth whispering
    const wh = 1 - sm(B(1)[0] + 4.8, B(1)[0] + 5.5, t);
    if (wh > 0 && zo.group.visible) {
      zo.B.spine.rotation.x += .08 * wh;
      zo.B.chest.updateWorldMatrix(false, true);
      const mouthTgt = at(zo, 'head').addScaledVector(dirW(zo, 0, 0, 1), .16 * kz).addScaledVector(dirW(zo, -1, 0, 0), .05 * kz).add(V(0, -.03 * kz, 0));
      reachClamp(zo, 'R', mouthTgt, { grip: .01, pole: [-.4, -.05, .35] });
      PO.fingers(zo, 'R', .15, { spread: .2 });
    }
  },
});

// b006: Fever hallucination painting (swirling embers & cold sparks)
const p01 = {
  load: () => loadStill('p01_cendres_etincelles'),
  fn(lt, u, t) {
    c.save();
    c.translate(W / 2, H / 2);
    c.rotate(.035 * Math.sin(t * .7));
    c.translate(-W / 2, -H / 2);
    still('p01_cendres_etincelles', u, [.5, .5, 1.08, .5, .48, 1.22]);
    c.restore();
    for (let i = 0; i < 24; i++) {
      const a = t * (.4 + .3 * hash(i, 3)) + i * 1.9, r = 120 + ((t * 90 + hash(i, 7) * 700) % 760);
      const x = W / 2 + Math.cos(a) * r, y = H / 2 + Math.sin(a) * r * .7;
      glow(x, y, 22 + 18 * hash(i, 11), i % 3 ? '#ff5828' : '#a8d4ff', .32 * Math.sin((t * 2 + i) % Math.PI), 'lighter');
    }
    return { vignette: .74, paper: .2 };
  },
};

// b007: Zoubida steals silently back on tiptoe and bends close over Mohammed
const pe2 = staged('chambre_penombre', {
  mohammed: { ...BED, lids: .75 },
  zoubida: {
    height: 1.6, at: [600, 720], face: [1060, 775], seed: 7, talk: 0,
    walk: { to: [1060, 775], t0: B(3)[0] + .3, t1: B(3)[0] + 5.6 },
    look: (t, st) => t >= B(3)[0] + 5.8 ? at(st.A.mohammed, 'head').clone().setY(at(st.A.zoubida, 'head').y - .15) : [1150, 860, 1.35],
    lookMax: .4,
  },
}, {
  light: PEN_LIGHT,
  fx: PEN_FX,
  act(lt, t, S, st, S3) {
    bed(S3, st, t, -.12);
    const zo = st.A.zoubida, kz = zo.group.scale.y / 1.6;
    const turnU = sm(B(3)[0] + 4.5, B(3)[0] + 5.9, t);
    const bend = sm(B(3)[0] + 5.6, B(3)[0] + 7.2, t);
    if (turnU > 0) {
      const y0 = zo.group.rotation.y;
      zo.group.rotation.y = y0 + (.35 - y0) * turnU;
      zo.group.updateMatrixWorld(true);
    }
    if (bend > 0) {
      zo.B.spine.rotation.x += .14 * bend;
      zo.B.chest.rotation.x += .06 * bend;
      zo.B.chest.updateWorldMatrix(false, true);
      const rTgt = at(zo, 'root').addScaledVector(dirW(zo, -1, 0, 0), .18 * kz).addScaledVector(dirW(zo, 0, 0, 1), .16 * kz).add(V(0, -.04 * kz, 0));
      const lTgt = at(zo, 'root').addScaledVector(dirW(zo, 1, 0, 0), .18 * kz).addScaledVector(dirW(zo, 0, 0, 1), .16 * kz).add(V(0, -.04 * kz, 0));
      reachClamp(zo, 'R', rTgt, { grip: .02, pole: [-.35, .05, .2] });
      reachClamp(zo, 'L', lTgt, { grip: .02, pole: [.35, .05, .2] });
    }
  },
});

// b008–b012: Zoubida kneels close beside the mattress; Mohammed wakes, speaks, she wipes a tear
const pe3 = staged('chambre_penombre', {
  mohammed: {
    ...BED,
    lids: t => IN(4, t) ? .6 : IN(6, t) ? .45 : IN(8, t) ? .4 : .5,
  },
  zoubida: {
    height: 1.6, at: [1090, 770], face: 'cam', yaw: .28, pose: 'kneel',
    o: { grounded: true, lean: .08, avoid: CHEST }, seed: 7,
    look: (t, st) => IN(7, t)
      ? at(st.A.mohammed, 'head').clone().lerp(at(st.A.zoubida, 'root'), .2)
      : at(st.A.mohammed, 'head').clone().setY(at(st.A.zoubida, 'head').y - .18),
    lookMax: .45,
  },
}, {
  light: PEN_LIGHT,
  fx: PEN_FX,
  act(lt, t, S, st, S3) {
    const moTurn = IN(4, t) ? -.26 : IN(6, t) ? -.04 : IN(8, t) ? -.22 : -.16;
    bed(S3, st, t, moTurn);
    const { zoubida: zo, mohammed: mo } = st.A, kz = zo.group.scale.y / 1.6;
    zo.B.chest.rotation.x += .015 * Math.sin(t * 1.4);
    zo.B.chest.rotation.z += .015 * Math.sin(t * .7);
    zo.B.chest.updateWorldMatrix(false, true);
    if (IN(5, t)) {
      // Zoubida softens with relief, leaning gently closer, right hand lowering slightly toward edge of bed
      const u = sm(B(5)[0], B(5)[0] + .8, t);
      zo.B.spine.rotation.x += .08 * u;
      zo.B.chest.updateWorldMatrix(false, true);
      const bedHand = at(zo, 'chest').addScaledVector(dirW(zo, 0, 0, 1), .28 * kz).addScaledVector(dirW(zo, -1, 0, 0), .12 * kz).add(V(0, -.26 * kz, 0));
      reachClamp(zo, 'R', bedHand, { grip: .02, pole: [-.35, .05, .25] });
      PO.fingers(zo, 'R', .15, { spread: .2 });
    } else if (IN(7, t)) {
      // Zoubida bows head slightly and gently wipes a tear with the back of her hand
      const wipe = sm(B(7)[0] + 1.4, B(7)[0] + 2.4, t) * (1 - sm(B(7)[1] - 1.2, B(7)[1] - .2, t));
      zo.B.neck.rotation.x += .14;
      zo.B.head.rotation.x += .1;
      zo.B.chest.updateWorldMatrix(false, true);
      if (wipe > .02) {
        const cheek = at(zo, 'head').addScaledVector(dirW(zo, 0, 0, 1), .15 * kz).addScaledVector(dirW(zo, -1, 0, 0), .09 * kz).add(V(0, -.01 * kz, 0));
        const restR = PO.hipToWorld(zo, -.18 * kz, .1 * kz, .25 * kz);
        reachClamp(zo, 'R', restR.lerp(cheek, wipe), { grip: .01, pole: [-.48, -.05, .35] });
        PO.fingers(zo, 'R', .2, { spread: .15 });
      }
    }
    if (IN(8, t)) {
      mo.B.neck.rotation.x -= .08;
      mo.B.neck.updateWorldMatrix(false, true);
    }
  },
});

// b013: Zoubida brightens and hurries out toward the kitchen for broth
const pe4 = staged('chambre_penombre', {
  mohammed: { ...BED, lids: .4 },
  zoubida: {
    height: 1.6, at: [1060, 775], face: 'cam', yaw: -.2, seed: 7, talk: 1,
    walk: { to: [640, 915], t0: B(9)[0] + .9, t1: B(9)[0] + 3.4 },
    look: (t, st) => t < B(9)[0] + .9 ? at(st.A.mohammed, 'head').clone().setY(at(st.A.zoubida, 'head').y - .15) : [640, 960, 1.35],
    lookMax: .45,
  },
}, {
  light: PEN_LIGHT,
  fx: PEN_FX,
  act(lt, t, S, st, S3) {
    bed(S3, st, t, -.2);
    const fz = st.faces.find(x => x[0] === st.A.zoubida);
    if (fz) fz[3] = { smile: .4 };
  },
});

// b014: Vertigo painting — room rolls and spins in cosmic darkness
const p02 = {
  load: () => loadStill('p02_chambre_tournante'),
  fn(lt, u, t) {
    c.save();
    c.translate(W / 2, H / 2);
    c.rotate(.08 * Math.sin(u * Math.PI * 1.4 - .5));
    c.translate(-W / 2, -H / 2);
    still('p02_chambre_tournante', u, [.5, .5, 1.24, .5, .5, 1.09]);
    c.restore();
    for (let i = 0; i < 18; i++) {
      const x = hash(i, 19) * W, y = hash(i, 23) * H, f = Math.max(0, Math.sin(t * 2.1 + i)) ** 4;
      if (f > .05) glow(x, y, 14, '#e6eeff', .35 * f, 'lighter');
    }
    return { vignette: .75, paper: .2 };
  },
};

export default beatScene(ID, {
  shots: { pe1, p01, pe2, pe3, pe4, p02 },
  plan: {
    b004: { shot: 'pe1', size: 'W', on: 'zoubida' },
    b005: { shot: 'pe1', size: 'W', on: 'zoubida' },
    b006: { shot: 'p01', dissolve: true },
    b007: { shot: 'pe2', size: 'M', on: 'zoubida', pt: [960, 780], z: 1.42, dx: 40, dy: -20 },
    b008: { shot: 'pe3', size: 'CU', on: 'mohammed', z: 1.55, dx: -40, dy: -20 },
    b009: { shot: 'pe3', size: 'CU', on: 'zoubida', z: 1.85, dy: -15 },
    b010: { shot: 'pe3', size: 'CU', on: 'mohammed', z: 1.55, dx: -40, dy: -20 },
    b011: { shot: 'pe3', size: 'M', on: 'zoubida', z: 1.45, dx: 40, dy: -20 },
    b012: { shot: 'pe3', size: 'CU', on: 'mohammed', z: 1.55, dx: -40, dy: -20 },
    b013: { shot: 'pe4', size: 'M', on: 'zoubida', pt: [780, 830], z: 1.38, dx: -30, dy: -20 },
    b014: { shot: 'p02', dissolve: true },
  },
});
