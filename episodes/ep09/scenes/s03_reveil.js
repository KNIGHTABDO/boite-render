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
import * as K from '../../../engine/core.js';
import * as PO from '../../../engine/poses.js';
import { staged } from '../lib/autostage.js';
import { still, loadStill } from '../lib/stage.js';
import { dim } from '../lib/fix8_R31AE.js';
import { boyBed, BOY_H, BED_AT, lapRest, sideArms, handToBelly } from '../lib/fix9_A.js';
import { beatScene, lines, sm, at, dirW, V } from '../lib/beatscene.js';

const { c, W, H, hash, glow } = K;
const ID = 's03_reveil', L = lines(ID), B = i => L[i] || [0, 0];
const IN = (i, t) => t >= B(i)[0] - .15 && t < (B(i + 1)[0] || B(i)[1] + .3);

const BED = {
  at: BED_AT, face: [1180, 700], pose: 'lie', height: BOY_H, seed: 3, talk: 0,
  o: { top: .28, hands: 'belly', headTurn: .4, pillow: .1 },
};

const PEN_LIGHT = { key: '#ffd8b0', keyI: 1.05, sky: '#5a5e80', ground: '#2a2220', fillI: .62, shadow: .08, dir: [.4, 4.2, .3] };
const PEN_FX = { grade: 'rgba(42, 46, 78, 0.32)', gradeOp: 'multiply', vignette: .62 };

function reachClamp(a, side, target, opt = {}) {
  const sh = at(a, 'upperArm' + side), el = at(a, 'foreArm' + side), hd = at(a, 'hand' + side);
  const len = sh.distanceTo(el) + el.distanceTo(hd), d = target.clone().sub(sh), max = len * .85;
  if (d.length() > max) target = sh.clone().addScaledVector(d.normalize(), max);
  return PO.reach(a, side, target, opt);
}

// b004–b005: Zoubida whispers to a dark motionless shadow near the doorway, then both step back toward the threshold
const pe1 = staged('chambre_penombre', {
  mohammed: { ...BED, lids: t => t < B(0)[0] + 4 ? .7 : .4, look: [400, 900, 1.2], lookMax: .7 },
  zoubida: {
    height: 1.58, at: [560, 840], face: 'woman1', seed: 7, talk: 0,
    walk: { to: [200, 960], t0: B(1)[0] + 9.4, t1: B(1)[0] + 12.6 },
    look: 'woman1', lookMax: .5,
  },
  woman1: {
    height: 1.6, at: [380, 900], face: [200, 960], seed: 11, talk: 0,
    walk: { to: [140, 980], t0: B(1)[0] + 9.0, t1: B(1)[0] + 12.2 },
    lookMax: .2,
  },
}, {
  light: PEN_LIGHT,
  fx: PEN_FX,
  addressee: { zoubida: 'woman1', woman1: 'zoubida' },
  act(lt, t, S, st, S3) {
    boyBed(S3, st, t, .35);
    const { zoubida: zo, woman1: sh } = st.A, kz = zo.group.scale.y / 1.6;
    dim(sh, .1);
    const gone = t > B(1)[0] + 12.4;
    if (gone) { zo.group.visible = false; sh.group.visible = false; return; }
    const wh = 1 - sm(B(1)[0] + 9.0, B(1)[0] + 9.6, t);
    if (wh > 0) {
      zo.B.spine.rotation.x += .16 * wh;
      zo.B.chest.updateWorldMatrix(false, true);
      const mouthTgt = at(zo, 'head').addScaledVector(dirW(zo, 0, 0, 1), .14 * kz).addScaledVector(dirW(zo, -1, 0, 0), .1 * kz).add(V(0, -.04 * kz, 0));
      reachClamp(zo, 'R', mouthTgt, { grip: .01, pole: [-.4, -.05, .35] });
      PO.fingers(zo, 'R', .15, { spread: .2 });
      const soft = at(zo, 'upperArmL').addScaledVector(dirW(zo, 1, 0, 0), .1 * kz).add(V(0, -.32 * kz, 0));
      reachClamp(zo, 'L', soft, { grip: 0, pole: [.3, .05, -.2] });
      sideArms(sh, t, 0);
    } else { sideArms(zo, t, .05); sideArms(sh, t, .04); }
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
  mohammed: { ...BED, lids: .55, look: [700, 760, 1.1], lookMax: .6 },
  zoubida: {
    height: 1.58, at: [480, 680], face: [1140, 720], seed: 7, talk: 0,
    walk: { to: [1140, 720], t0: B(3)[0] + .2, t1: B(3)[0] + 5.2 },
    look: (t, st) => at(st.A.mohammed, 'head'),
    lookMax: .7,
  },
}, {
  light: PEN_LIGHT,
  fx: PEN_FX,
  act(lt, t, S, st, S3) {
    boyBed(S3, st, t, .4);
    const zo = st.A.zoubida, kz = zo.group.scale.y / 1.6;
    const bend = sm(B(3)[0] + 5.0, B(3)[0] + 6.6, t);
    zo.group.position.y += .035 * (1 - bend);
    zo.B.spine.rotation.x += .22 + .4 * bend;
    zo.B.chest.updateWorldMatrix(false, true);
    const reach = at(zo, 'chest').addScaledVector(dirW(zo, 0, 0, 1), (.28 + .1 * bend) * kz).add(V(0, (-.22 - .16 * bend) * kz, 0));
    reachClamp(zo, 'R', reach, { grip: .02, pole: [-.3, .1, .25] });
    const soft = at(zo, 'upperArmL').addScaledVector(dirW(zo, 1, 0, 0), .12 * kz).add(V(0, -.34 * kz, 0));
    reachClamp(zo, 'L', soft, { grip: 0, pole: [.25, .05, -.15] });
  },
});

// b008–b012: Zoubida kneels close beside the mattress; Mohammed wakes, speaks, she wipes a tear
const pe3 = staged('chambre_penombre', {
  mohammed: {
    ...BED,
    lids: t => IN(4, t) ? .35 : IN(6, t) ? .3 : IN(8, t) ? .28 : .4,
    look: 'zoubida', lookMax: .85,
  },
  zoubida: {
    height: 1.58, at: [1160, 748], face: 'mohammed', pose: 'kneel', hands: false,
    o: { lean: .1 }, seed: 7,
    look: (t, st) => at(st.A.mohammed, 'head'),
    lookMax: .7,
  },
}, {
  light: PEN_LIGHT,
  fx: PEN_FX,
  act(lt, t, S, st, S3) {
    const mo = boyBed(S3, st, t, .5);
    const { zoubida: zo } = st.A, kz = zo.group.scale.y / 1.6;
    if (IN(4, t) || IN(6, t) || IN(8, t)) handToBelly(mo);
    zo.B.chest.rotation.x += .012 * Math.sin(t * 1.4);
    zo.B.chest.updateWorldMatrix(false, true);
    lapRest(zo);
    if (IN(5, t)) {
      const u = sm(B(5)[0], B(5)[0] + .8, t);
      zo.B.spine.rotation.x += .12 * u;
      zo.B.chest.updateWorldMatrix(false, true);
      const brow = at(mo, 'head').add(V(0, .04, .04));
      const lap = PO.hipToWorld(zo, -.16 * kz, .06 * kz, .2 * kz);
      reachClamp(zo, 'R', lap.lerp(brow, u), { grip: .02, pole: [-.35, .1, .3] });
      PO.fingers(zo, 'R', .15, { spread: .15 });
    } else if (IN(7, t)) {
      const wipe = sm(B(7)[0] + .6, B(7)[0] + 1.6, t) * (1 - sm(B(7)[1] - 1.4, B(7)[1] - .3, t));
      zo.B.spine.rotation.x += .06;
      zo.B.chest.updateWorldMatrix(false, true);
      const cheek = at(zo, 'head').addScaledVector(dirW(zo, -1, 0, 0), .1 * kz).addScaledVector(dirW(zo, 0, 0, 1), .08 * kz).add(V(0, .02 * kz, 0));
      const lap = PO.hipToWorld(zo, -.16 * kz, .06 * kz, .2 * kz);
      reachClamp(zo, 'R', lap.lerp(cheek, Math.max(wipe, .15)), { grip: .01, pole: [-.4, .05, .3] });
      PO.fingers(zo, 'R', .18, { spread: .12 });
    }
  },
});

// b013: Zoubida brightens and hurries out toward the kitchen for broth
const pe4 = staged('chambre_penombre', {
  mohammed: { ...BED, lids: .35, look: 'zoubida', lookMax: .7 },
  zoubida: {
    height: 1.58, at: [1120, 760], face: [240, 950], seed: 7, talk: 1,
    walk: { to: [240, 960], t0: B(9)[0] + .25, t1: B(9)[0] + 2.7 },
    look: (t, st) => t < B(9)[0] + 1.1 ? at(st.A.mohammed, 'head') : [240, 960, 1.4],
    lookMax: .6,
  },
}, {
  light: PEN_LIGHT,
  fx: PEN_FX,
  act(lt, t, S, st, S3) {
    boyBed(S3, st, t, .45);
    const zo = st.A.zoubida, kz = zo.group.scale.y / 1.6;
    if (t > B(9)[0] + 2.55) { zo.group.visible = false; return; }
    zo.B.spine.rotation.x += .2;
    zo.B.chest.updateWorldMatrix(false, true);
    sideArms(zo, t, .08);
    if (t < B(9)[0] + 1.0) {
      const wave = at(zo, 'chest').addScaledVector(dirW(zo, -1, 0, 0), .16 * kz).add(V(0, .08 * kz, .1 * kz));
      reachClamp(zo, 'R', wave, { grip: 0, pole: [-.3, .2, .2] });
    }
    const fz = st.faces.find(x => x[0] === zo);
    if (fz) fz[3] = { smile: .45 };
  },
});

// b014: Vertigo painting — room rolls and spins in cosmic darkness
const p02 = {
  load: () => Promise.all([loadStill('p02_chambre_tournante'), loadStill('i_bol_bouillon')]),
  fn(lt, u, t) {
    if (t - B(10)[0] < 1.25) {
      still('i_bol_bouillon', 0, [.5, .5, 1.02, .5, .5, 1.06]);
      return { vignette: .45, paper: .16 };
    }
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
    b007: { shot: 'pe2', size: 'M', on: 'zoubida', pt: [900, 740], z: 1.18, dx: 20, dy: 36 },
    b008: { shot: 'pe3', size: 'CU', on: 'mohammed', z: 2.2, dx: -20, dy: 10 },
    b009: { shot: 'pe3', size: 'CU', on: 'zoubida', z: 1.9, dy: 8 },
    b010: { shot: 'pe3', size: 'M', on: 'zoubida', z: 1.35, dx: 30, dy: 24 },
    b011: { shot: 'pe3', size: 'M', on: 'zoubida', z: 1.35, dx: 30, dy: 24 },
    b012: { shot: 'pe3', size: 'CU', on: 'mohammed', z: 2.2, dx: -10, dy: 10 },
    b013: { shot: 'pe4', size: 'M', on: 'zoubida', pt: [700, 860], z: 1.2, dx: -40, dy: 20 },
    b014: { shot: 'p02' },
  },
});
