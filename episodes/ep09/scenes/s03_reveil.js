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
import { boyBed, BOY_H, BED_AT, lapRest, handToBelly } from '../lib/fix9_A.js';
import { reachClamp, turnToward, carryHand } from '../lib/fix9_K.js';
import { beatScene, lines, sm, at, front, V } from '../lib/beatscene.js';

const { c, W, H, hash, glow } = K;
const ID = 's03_reveil', L = lines(ID), B = i => L[i] || [0, 0];
const IN = (i, t) => t >= B(i)[0] - .15 && t < (B(i + 1)[0] || B(i)[1] + .3);

const MATTRESS = [[1188, 574], [1450, 574], [1455, 688], [1308, 690]];
const BED = {
  at: BED_AT, face: [1180, 700], pose: 'lie', height: BOY_H, seed: 3, talk: 0,
  o: { top: .28, hands: 'belly', headTurn: .4, pillow: .1, mattress: MATTRESS },
};

const PEN_LIGHT = { key: '#ffd8b0', keyI: 1.05, sky: '#5a5e80', ground: '#2a2220', fillI: .62, shadow: .08, dir: [.4, 4.2, .3] };
const PEN_FX = { grade: 'rgba(42, 46, 78, 0.32)', gradeOp: 'multiply', vignette: .62 };

// b004–b005: Zoubida whispers to a dark motionless shadow near the doorway, then both drift to the threshold
const pe1 = staged('chambre_penombre', {
  mohammed: { ...BED, lids: t => t < B(0)[0] + 4 ? .7 : .4 },
  zoubida: {
    height: 1.58, at: [720, 820], face: 'woman1', seed: 7, talk: 0,
    walk: { to: [520, 880], t0: B(1)[0] + 5.5, t1: B(1)[0] + 11.2 },
    look: (t, st) => t < B(1)[0] + 5.5 ? 'woman1' : [360, 960, 1.45],
    lookMax: .6,
  },
  woman1: {
    height: 1.6, at: [430, 900], face: 'zoubida', seed: 11, talk: 0,
    walk: { to: [360, 940], t0: B(1)[0] + 5.2, t1: B(1)[0] + 10.8 },
    lookMax: .25,
  },
}, {
  light: PEN_LIGHT,
  fx: PEN_FX,
  addressee: { zoubida: 'woman1', woman1: 'zoubida' },
  act(lt, t, S, st, S3) {
    boyBed(S3, st, t, 1.15);
    const { zoubida: zo, woman1: sh } = st.A, kz = zo.group.scale.y / 1.6;
    dim(sh, .1);
    // Stay visible through the painting dissolve; hiding her makes the gate miss a named actor.
    const gone = t > B(2)[0] + 1.2;
    if (gone) { zo.group.visible = false; sh.group.visible = false; return; }
    const wh = 1 - sm(B(1)[0] + 5.2, B(1)[0] + 5.8, t);
    if (wh > 0) {
      zo.B.spine.rotation.x += .14 * wh;
      zo.B.chest.updateWorldMatrix(false, true);
      const mouthTgt = front(zo, 'head', .12 * kz, -.1 * kz, -.05 * kz);
      reachClamp(zo, 'R', mouthTgt, { grip: .01, pole: [-.35, -.04, .3] });
      PO.fingers(zo, 'R', .15, { spread: .2 });
      carryHand(zo, 'L', 1, { fwd: .04, out: .16, drop: .34 });
      carryHand(sh, 'R', -1, { fwd: .04, out: .14, drop: .38 });
      carryHand(sh, 'L', 1, { fwd: .04, out: .14, drop: .38 });
    } else {
      carryHand(zo, 'R', -1, { fwd: .06, out: .16, drop: .36 });
      carryHand(zo, 'L', 1, { fwd: .06, out: .16, drop: .36 });
      carryHand(sh, 'R', -1, { fwd: .04, out: .14, drop: .38 });
      carryHand(sh, 'L', 1, { fwd: .04, out: .14, drop: .38 });
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
  mohammed: { ...BED, lids: .55 },
  zoubida: {
    // Open floor in front of the divans, same depth the whole way so she does not shrink.
    height: 1.58, at: [620, 900], face: [1040, 860], seed: 7, talk: 0,
    walk: { to: [1020, 860], t0: B(3)[0] + .25, t1: B(3)[0] + 5.2 },
    look: (t, st) => at(st.A.mohammed, 'head'),
    lookMax: .4,
  },
}, {
  light: PEN_LIGHT,
  fx: PEN_FX,
  act(lt, t, S, st, S3) {
    const mo = boyBed(S3, st, t, 1.15);
    const zo = st.A.zoubida, kz = zo.group.scale.y / 1.6;
    // Three-quarter toward the bed, not square to the lens.
    turnToward(zo, S3.cam.position, mo.group.position, .38);
    const bend = sm(B(3)[0] + 4.4, B(3)[0] + 6.2, t);
    zo.B.spine.rotation.x += .08 + .16 * bend;
    zo.B.chest.rotation.x += .04 * bend;
    zo.B.chest.updateWorldMatrix(false, true);
    const toward = front(zo, 'chest', .26 * kz, .16 * kz, -.02 * kz);
    const park = front(zo, 'root', .1 * kz, .18 * kz, -.3 * kz);
    reachClamp(zo, 'R', park.clone().lerp(toward, .4 + .6 * bend), { grip: .02, pole: [-.35, .02, .1] });
    carryHand(zo, 'L', 1, { fwd: .06, out: .14, drop: .34 });
    PO.fingers(zo, 'R', .2, { spread: .1 });
  },
});

// b008–b012: Zoubida kneels close beside the mattress; Mohammed wakes, speaks, she wipes a tear
const pe3 = staged('chambre_penombre', {
  mohammed: {
    ...BED,
    lids: t => IN(4, t) ? .35 : IN(6, t) ? .3 : IN(8, t) ? .28 : .4,
  },
  zoubida: {
    height: 1.58, at: [1100, 800], face: 'cam', pose: 'kneel', hands: false,
    o: { grounded: true, lean: .2 }, seed: 7,
    look: (t, st) => at(st.A.mohammed, 'head'),
    lookMax: .45,
  },
}, {
  light: PEN_LIGHT,
  fx: PEN_FX,
  act(lt, t, S, st, S3) {
    const mo = boyBed(S3, st, t, 1.15);
    const { zoubida: zo } = st.A, kz = zo.group.scale.y / 1.6;
    turnToward(zo, S3.cam.position, mo.group.position, .35);
    if (IN(4, t) || IN(6, t) || IN(8, t)) handToBelly(mo);
    zo.B.chest.rotation.x += .012 * Math.sin(t * 1.4);
    zo.B.chest.updateWorldMatrix(false, true);
    lapRest(zo);
    if (IN(5, t)) {
      const u = sm(B(5)[0], B(5)[0] + .8, t);
      zo.B.spine.rotation.x += .1 * u;
      zo.B.chest.updateWorldMatrix(false, true);
      const lap = PO.hipToWorld(zo, -.16 * kz, .06 * kz, .16 * kz);
      const offer = front(zo, 'chest', .22 * kz, .2 * kz, -.04 * kz);
      reachClamp(zo, 'R', lap.lerp(offer, u), { grip: .02, pole: [-.34, .02, .08] });
      PO.fingers(zo, 'R', .2, { spread: .1 });
    } else if (IN(7, t)) {
      const wipe = sm(B(7)[0] + .4, B(7)[0] + 1.4, t) * (1 - sm(B(7)[1] - 1.2, B(7)[1] - .2, t));
      zo.B.spine.rotation.x += .05;
      zo.B.chest.updateWorldMatrix(false, true);
      // In front of the cheek, clear of the scarf.
      const cheek = front(zo, 'head', .12 * kz, .16 * kz, -.04 * kz);
      const lap = PO.hipToWorld(zo, -.16 * kz, .06 * kz, .18 * kz);
      reachClamp(zo, 'R', lap.lerp(cheek, Math.max(wipe, .2)), { grip: .01, pole: [-.25, .02, .2] });
      PO.fingers(zo, 'R', .18, { spread: .12 });
    }
  },
});

// b013: Zoubida brightens and hurries out toward the kitchen for broth
const pe4 = staged('chambre_penombre', {
  mohammed: { ...BED, lids: .35 },
  zoubida: {
    height: 1.58, at: [1120, 760], face: [240, 950], seed: 7, talk: 1,
    walk: { to: [480, 900], t0: B(9)[0] + .2, t1: B(9)[0] + 2.6 },
    look: (t, st) => t < B(9)[0] + .35 ? at(st.A.mohammed, 'head') : [400, 960, 1.5],
    lookMax: .7,
  },
}, {
  light: PEN_LIGHT,
  fx: PEN_FX,
  act(lt, t, S, st, S3) {
    boyBed(S3, st, t, 1.15);
    const zo = st.A.zoubida;
    // Lean into the hurry. Hands stay wide of the sash.
    zo.B.spine.rotation.x += .16;
    zo.B.chest.rotation.x -= .04;
    zo.B.chest.updateWorldMatrix(false, true);
    carryHand(zo, 'R', -1, { fwd: .04, out: .38, drop: .44 });
    carryHand(zo, 'L', 1, { fwd: .02, out: .4, drop: .46 });
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
    b007: { shot: 'pe2', size: 'M', on: 'zoubida', pt: [860, 880], z: 1.45, dy: 28 },
    b008: { shot: 'pe3', size: 'CU', on: 'mohammed', z: 3.9, dx: 110, dy: 24 },
    b009: { shot: 'pe3', size: 'CU', on: 'zoubida', z: 2.45, dx: -30, dy: 12 },
    b010: { shot: 'pe3', size: 'CU', on: 'mohammed', z: 3.9, dx: 110, dy: 24 },
    b011: { shot: 'pe3', size: 'M', on: 'zoubida', z: 1.7, dx: 20, dy: 40 },
    b012: { shot: 'pe3', size: 'CU', on: 'mohammed', z: 3.9, dx: 110, dy: 24 },
    b013: { shot: 'pe4', size: 'M', on: 'zoubida', pt: [780, 880], z: 1.45, dy: 24 },
    b014: { shot: 'p02' },
  },
});
