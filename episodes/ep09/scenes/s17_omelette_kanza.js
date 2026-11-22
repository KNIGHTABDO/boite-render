// s17 "L'omelette et la histoire de Tante Kanza".
// b102 chambre_jour (fadeIn 0.7): Zoubida kneels beside the right divan and taps Mohammed awake; he yawns in the morning sun.
// b103 chambre_jour: Mohammed sits up eagerly on the divan ("œufs à l'huile, piment rouge et persil"); auto-insert omelette_epices.
// b104 chambre_jour: Zoubida smiles indulgently ("une pincée de cumin").
// b105 patio_matin: Rahma laughs merrily in the sunlit courtyard calling up toward Zoubida's window ("une omelette juive !").
// b106 chambre_jour: Zoubida chuckles warmly back toward the window ("envies comme une femme enceinte").
// b107 patio_matin: two distinct courtyard neighbours (woman1 taller terracotta, woman2 shorter sage-teal) laugh together as Kanza tells her tale.
// b108 painting p13_laitier_fromage: the stingy milkman and the baby marked with white cheese.
// b109 patio_matin: voisine (distinct indigo-plum woman1 variant) delivers her deadpan serious nod and quip.
import * as PO from '../../../engine/poses.js';
import * as PR from '../../../engine/props3d.js';
import { staged, THREE } from '../lib/autostage.js';
import { lieOnBed, pillowUnder } from '../lib/fix8_lie.js';
import { beatScene, lines, sm, at, front, V } from '../lib/beatscene.js';

const ID = 's17_omelette_kanza', L = lines(ID), B = i => L[i] || [0, 0];
const IN = (i, t) => t >= B(i)[0] - .15 && t < (B(i + 1)[0] || B(i)[1] + .3);

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

function tintRobe(a, hex, amt = .75) {
  if (a._tintedHex === hex) return;
  a._tintedHex = hex;
  const [tr, tg, tb] = [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255];
  a.group.traverse(o => {
    if (!o.isMesh || !o.material.map || o.material.side === THREE.BackSide) return;
    const img = o.material.map.image, w = img.width, h = img.height;
    const cv = new OffscreenCanvas(w, h), g = cv.getContext('2d');
    g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, w, h), px = d.data;
    for (let i = 0; i < px.length; i += 4) {
      const r = px[i], gg = px[i + 1], b = px[i + 2];
      const mx = Math.max(r, gg, b), mn = Math.min(r, gg, b), v = mx / 255, sat = mx ? (mx - mn) / mx : 0;
      if (v < .55 || sat > .36 || sat < .05) continue;
      const k = amt * Math.min(1, (v - .55) / .12) * Math.min(1, (.36 - sat) / .08), lum = (r + gg + b) / 3 / 225;
      px[i] = r + (Math.min(255, tr * lum) - r) * k;
      px[i + 1] = gg + (Math.min(255, tg * lum) - gg) * k;
      px[i + 2] = b + (Math.min(255, tb * lum) - b) * k;
    }
    g.putImageData(d, 0, 0);
    const tex = new THREE.CanvasTexture(cv), m0 = o.material.map;
    tex.flipY = m0.flipY; tex.colorSpace = THREE.SRGBColorSpace; tex.wrapS = m0.wrapS; tex.wrapT = m0.wrapT;
    const m = o.material.clone(); m.map = tex; m.needsUpdate = true; o.material = m;
  });
}

// b102: Zoubida wakes Mohammed gently in the morning sun
const ch1 = staged('chambre_jour', {
  mohammed: {
    at: [1350, 694], face: [1336, 754], pose: 'lie',
    o: { top: TOP, turn: .12, hands: 'belly', headTurn: -.16, mattress: MATTRESS, avoid: CHEST },
    seed: 3, talk: 0,
    lids: t => .88 * (1 - sm(B(0)[0] + 1.8, B(0)[0] + 4.2, t)),
  },
  zoubida: {
    at: [1100, 780], face: 'cam', yaw: .55, pose: 'kneel',
    o: { grounded: true, lean: .08, avoid: CHEST },
    seed: 7,
    look: (t, st) => {
      const p = at(st.A.mohammed, 'head').clone();
      p.y = Math.max(p.y, at(st.A.zoubida, 'head').y - .22);
      return p;
    },
    lookMax: .7,
  },
}, {
  addressee: { zoubida: 'mohammed' },
  act(lt, t, S, st, S3) {
    const { mohammed: mo, zoubida: zo } = st.A, kz = zo.group.scale.y / 1.6;
    lieOnBed(mo, {
      top: TOP, feet: [.5, .87],
      origin: (st.mo0 ||= mo.group.position.clone()).clone().add(V(.04, 0, 0)),
      hands: 'belly', pillow: .085, tuck: .22, headTurn: -.14,
    });
    pillowUnder(S3, st, mo, { top: TOP, h: .085, col: 0x3b5875 });
    st.cover ||= PR.blanket({ w: .4, l: .56, h: .06, col: 0xb24a34 });
    const hp = mo.B.root.getWorldPosition(V(0, 0, 0)), ry = mo.group.rotation.y;
    S3.prop(st.cover, hp.x + Math.sin(ry) * .28, TOP + .03 - .004, hp.z + Math.cos(ry) * .28, ry);
    st.cover.visible = true;

    const wake = sm(B(0)[0] + 1.5, B(0)[0] + 4.5, t);
    mo.B.chest.rotation.x += .015 * Math.sin(t * 1.6);
    mo.B.head.rotation.y -= .12 * wake;
    mo.B.chest.updateWorldMatrix(false, true);

    const tap = sm(B(0)[0] + .2, B(0)[0] + .9, t) * (1 - sm(B(0)[0] + 2.8, B(0)[0] + 3.8, t));
    const pat = .025 * Math.sin(t * 9) * tap;
    zo.B.chest.rotation.x += .07 * tap;
    zo.B.chest.rotation.z += .02 * Math.sin(t * 1.1);
    zo.B.chest.updateWorldMatrix(false, true);
    lap(zo, 'R', kz, .01 * Math.sin(t * 1.2));
    const shTg = at(mo, 'upperArmL').clone().add(V(0, .08 + pat, .03));
    const restL = PO.hipToWorld(zo, .15 * kz, .06 * kz, .21 * kz);
    clampReach(zo, 'L', restL.clone().lerp(shTg, tap), { grip: .02, pole: [.45, .12, .25] });
    PO.fingers(zo, 'L', .22, { spread: .16 });
  },
});

// b103, b104, b106: Mohammed seated eagerly on the divan, Zoubida smiling & chuckling warmly
const ch2 = staged('chambre_jour', {
  mohammed: {
    at: [1340, 640], face: 'zoubida', yaw: -.2, pose: 'kneel',
    o: { grounded: true, seat: TOP, lean: .08, avoid: CHEST },
    seed: 3, look: 'zoubida', lookMax: .7,
  },
  zoubida: {
    at: [1045, 790], face: 'cam', yaw: .52, pose: 'kneel',
    o: { grounded: true, lean: .08, avoid: CHEST },
    seed: 7,
    look: t => IN(4, t) ? [720, 620, 1.35] : 'mohammed',
    lookMax: .75,
  },
}, {
  addressee: { mohammed: 'zoubida', zoubida: 'mohammed' },
  act(lt, t, S, st, S3) {
    const { mohammed: mo, zoubida: zo } = st.A;
    const km = mo.group.scale.y / 1.6, kz = zo.group.scale.y / 1.6;
    pillowUnder(S3, st, mo, { top: TOP, h: .07, col: 0x3b5875 });
    st.pillow.visible = false;

    const eager = IN(1, t) ? 1 : 0;
    const grin = IN(2, t) ? 1 : 0;
    const chuckle = IN(4, t) ? 1 : 0;

    if (eager) {
      const bob = Math.sin(t * 3.4);
      mo.B.chest.rotation.x -= .04 * (.5 + .5 * bob);
      mo.B.head.rotation.z += .05 * Math.sin(t * 2.1);
      for (const [sd, sg] of [['L', 1], ['R', -1]]) {
        const tg = front(mo, 'chest', .22 * km, sg * .14 * km, (-.06 + .04 * (sg > 0 ? bob : -bob)) * km);
        clampReach(mo, sd, tg, { grip: .02, pole: [sg * .4, -.1, .2] });
        PO.fingers(mo, sd, .18, { spread: .25 });
      }
    } else {
      mo.B.head.rotation.x += .04 * Math.sin(t * 1.4);
      lap(mo, 'L', km, .01 * Math.sin(t * .9));
      lap(mo, 'R', km, .01 * Math.sin(t * .9 + 1.4));
    }
    mo.B.chest.updateWorldMatrix(false, true);

    if (chuckle) {
      const sh = Math.sin(t * 11);
      zo.B.chest.rotation.x += .04 * sh;
      zo.B.chest.rotation.z += .03 * Math.sin(t * 2.2);
      zo.B.head.rotation.x -= .06;
      const waveR = front(zo, 'chest', .24 * kz, -.16 * kz, -.02 * kz + .03 * Math.sin(t * 3.2) * kz);
      clampReach(zo, 'R', waveR, { grip: .02, pole: [-.45, -.1, .2] });
      PO.palmTo(zo, 'R', .7, V(0, 1, .2));
      PO.fingers(zo, 'R', .14, { spread: .3 });
      lap(zo, 'L', kz, .01 * Math.sin(t * 1.3));
    } else if (grin) {
      zo.B.head.rotation.z += .06 * Math.sin(t * 1.6);
      zo.B.chest.rotation.x += .02 * Math.sin(t * 1.2);
      const gestL = front(zo, 'chest', .22 * kz, .12 * kz, -.06 * kz + .02 * Math.sin(t * 2.6) * kz);
      clampReach(zo, 'L', gestL, { grip: .02, pole: [.42, -.1, .2] });
      PO.fingers(zo, 'L', .2, { spread: .25 });
      lap(zo, 'R', kz, .01 * Math.sin(t * 1.1));
    } else {
      zo.B.chest.rotation.z += .025 * Math.sin(t * .9);
      lap(zo, 'L', kz, .01 * Math.sin(t * 1.1));
      lap(zo, 'R', kz, .01 * Math.sin(t * 1.1 + 1.5));
    }
    zo.B.chest.updateWorldMatrix(false, true);
  },
});

// b105: Rahma in the sunlit courtyard calling up toward Zoubida's window
const pa1 = staged('patio_matin', {
  rahma: {
    at: [1100, 960], face: 'cam', yaw: -.22, seed: 9,
    look: [760, 820, 2.05], lookMax: .7,
  },
}, {
  addressee: { rahma: 'zoubida' },
  act(lt, t, S, st) {
    const ra = st.A.rahma, k = ra.group.scale.y / 1.6;
    const sh = Math.sin(t * 10);
    ra.B.spine.rotation.x += .06;
    ra.B.chest.rotation.x += .04 * sh;
    ra.B.head.rotation.x -= .08;
    ra.B.head.rotation.z += .05 * Math.sin(t * 2.4);
    ra.B.chest.updateWorldMatrix(false, true);
    const tgR = front(ra, 'chest', .26 * k, -.14 * k, (-.04 + .03 * Math.sin(t * 3.1)) * k);
    const tgL = front(ra, 'chest', .24 * k, .14 * k, (-.08 + .02 * Math.cos(t * 2.6)) * k);
    clampReach(ra, 'R', tgR, { grip: .02, pole: [-.45, -.1, .2] });
    clampReach(ra, 'L', tgL, { grip: .02, pole: [.45, -.1, .2] });
    PO.palmTo(ra, 'R', .7, V(0, 1, .2));
    PO.fingers(ra, 'R', .12, { spread: .3 });
    PO.fingers(ra, 'L', .2, { spread: .2 });
  },
});

// b107: Courtyard neighbours woman1 + woman2 (varied height & robe tint) laughing together
const pa2 = staged('patio_matin', {
  woman1: {
    at: [790, 990], face: 'woman2', yaw: -.28, height: 1.64, seed: 11, talk: 0,
    look: 'woman2', lookMax: .65,
  },
  woman2: {
    at: [1220, 995], face: 'woman1', yaw: .28, height: 1.55, seed: 13, talk: 0,
    look: 'woman1', lookMax: .65,
  },
}, {
  act(lt, t, S, st) {
    const { woman1: w1, woman2: w2 } = st.A;
    tintRobe(w1, 0xb25442, .75);
    tintRobe(w2, 0x457a70, .75);
    for (const [a, ph, f, sd] of [[w1, 0, 11, 'R'], [w2, 1.4, 13, 'L']]) {
      const k = a.group.scale.y / 1.6, osd = sd === 'L' ? 'R' : 'L';
      const sg = sd === 'L' ? 1 : -1, osg = -sg;
      const sh = Math.sin(t * f + ph);
      a.B.chest.rotation.x += .05 * sh;
      a.B.chest.rotation.z += .04 * Math.sin(t * 2.1 + ph);
      a.B.neck.rotation.x -= .10;
      a.B.head.rotation.z += sg * .08;
      a.B.chest.updateWorldMatrix(false, true);
      const hi = front(a, 'chest', .2 * k, sg * .06 * k, (.03 + .02 * sh) * k);
      const lo = front(a, 'root', .16 * k, osg * .12 * k, (.06 + .015 * Math.cos(t * 2.5 + ph)) * k);
      clampReach(a, sd, hi, { grip: .02, pole: [sg * .45, -.1, .2] });
      clampReach(a, osd, lo, { grip: .02, pole: [osg * .4, -.1, .1] });
      PO.fingers(a, sd, .22, { spread: .22 });
      PO.fingers(a, osd, .32, { spread: .12 });
    }
  },
});

// b109: Distinct extra woman1 variant (voisine) with deadpan serious nod
const pa3 = staged('patio_matin', {
  voisine: {
    at: [960, 985], face: 'cam', yaw: .18, height: 1.56, seed: 19, lids: .22,
  },
}, {
  act(lt, t, S, st) {
    const vo = st.A.voisine, k = vo.group.scale.y / 1.6;
    tintRobe(vo, 0x4f4578, .8);
    const nod = Math.max(0, Math.sin((t - B(7)[0]) * 2.2)) * sm(B(7)[0] + .3, B(7)[0] + .8, t);
    vo.B.neck.rotation.x += .12 * nod;
    vo.B.head.rotation.x += .14 * nod;
    vo.B.head.rotation.z += .04;
    vo.B.chest.rotation.z += .02 * Math.sin(t * .9);
    vo.B.chest.updateWorldMatrix(false, true);
    const lTg = front(vo, 'root', .18 * k, .10 * k, .05 * k);
    const rTg = front(vo, 'chest', .22 * k, -.12 * k, (-.10 + .02 * Math.sin(t * 2.0)) * k);
    clampReach(vo, 'L', lTg, { grip: .02, pole: [.38, -.1, .15] });
    clampReach(vo, 'R', rTg, { grip: .02, pole: [-.42, -.1, .18] });
    PO.fingers(vo, 'L', .34, { spread: .1 });
    PO.fingers(vo, 'R', .2, { spread: .2 });
  },
});

export default beatScene(ID, {
  shots: { ch1, ch2, pa1, pa2, pa3 },
  fadeIn: .7,
  plan: {
    b102: { shot: 'ch1', size: 'M', on: 'zoubida', z: 1.65, dx: 95, dy: -20 },
    b103: { shot: 'ch2', size: 'CU', on: 'mohammed', z: 2.8, dy: -30 },
    b104: { shot: 'ch2', size: 'CU', on: 'zoubida', z: 2.5, dx: 40, dy: -30 },
    b105: { shot: 'pa1', size: 'M', on: 'rahma', z: 1.75, dy: -20 },
    b106: { shot: 'ch2', size: 'M', on: 'zoubida', z: 1.65, dx: 70, dy: -25 },
    b107: { shot: 'pa2', size: 'M', on: 'woman1', z: 1.35, dx: 160, dy: -20 },
    b108: { move: 'push' },
    b109: { shot: 'pa3', size: 'CU', on: 'voisine', z: 2.6, dy: -25 },
  },
});
