// s10 "Au roi". esc (escalier): Mohammed still on tread 3; Zoubida comes to the foot of the flight and looks up at him
// (b054–b058), hands on her hips at "un roi dans l'escalier". pa (patio_matin): the neighbours by the well laugh (b059),
// Rahma teases (b060), the narrator's scorn on Mohammed (b061 back on the stairs), b062 Zoubida's quiet smile, b063 Rahma
// complains with palms up, b064 Zoubida answers, a hand raised, b065 the women together: "Il n'y a de Dieu que Dieu".
import * as PO from '../../../engine/poses.js';
import { staged } from '../lib/autostage.js';
import { ESCALIER } from '../lib/stairs.js';
import { SEAT } from './s09_escalier.js';
import { beatScene, lines, sm, front, V } from '../lib/beatscene.js';

const ID = 's10_roi', L = lines(ID);
const B = i => L[i] || [0, 0];
const win = (i, a, b, t) => { const [t0, t1] = B(i), D = t1 - t0; return sm(t0 + a * D, t0 + a * D + .5, t) * (1 - sm(t0 + b * D, t0 + b * D + .5, t)); };
const k = a => a.group.scale.y / 1.6;
const laugh = (a, w, t, f = 13) => { if (w > 0) { a.B.chest.rotation.x += .05 * Math.sin(t * f) * w; a.B.neck.rotation.x -= .08 * w; a.B.chest.updateWorldMatrix(false, true); } };

const esc = staged('escalier', {
  mohammed: { ...SEAT, look: 'zoubida' },
  zoubida: { tread: 0, off: .55, face: 'mohammed', seed: 7, look: 'mohammed' },
}, {
  stairs: ESCALIER, addressee: { zoubida: 'mohammed', mohammed: 'zoubida' },
  act(lt, t, S, st) {
    const { zoubida: zo, mohammed: mo } = st.A, kz = k(zo);
    const hips = win(4, .3, 1.05, t);   // hands to her hips, amused
    if (hips > 0) for (const s of ['L', 'R']) PO.reach(zo, s, front(zo, 'root', .02 * kz, (s === 'L' ? -.2 : .2) * kz, .08 * kz).lerp(front(zo, 'root', .15 * kz, (s === 'L' ? -.2 : .2) * kz, -.05 * kz), 1 - hips), { grip: .02 });
    laugh(zo, win(4, .75, 1.1, t), t);
    const proud = win(3, 0, 1, t);   // "Au roi.": chin up, chest out
    if (proud > 0) { mo.B.neck.rotation.x -= .12 * proud; mo.B.chest.rotation.x -= .08 * proud; mo.B.chest.updateWorldMatrix(false, true); }
    const scorn = win(7, .1, 1, t);   // b061: he turns his head away from the laughter
    if (scorn > 0) { mo.B.neck.rotation.y += .35 * scorn; mo.B.neck.updateWorldMatrix(false, true); }
  },
});

const pa = staged('patio_matin', {
  zoubida: { at: [760, 975], face: 'rahma', seed: 7 },
  rahma: { at: [1120, 960], face: 'zoubida', seed: 9 },
  woman1: { at: [1400, 990], face: 'zoubida', pose: 'kneel', seed: 11 },
  woman2: { at: [470, 1000], face: 'rahma', pose: 'kneel', seed: 13 },
}, {
  addressee: { rahma: 'zoubida', zoubida: 'rahma', femmes: 'zoubida' },
  act(lt, t, S, st) {
    const { zoubida: zo, rahma: ra, woman1: w1, woman2: w2 } = st.A, kr = k(ra), kz = k(zo);
    const fun = win(5, 0, 1.2, t);
    for (const [a, f] of [[w1, 12], [w2, 15], [ra, 11]]) laugh(a, fun, t, f);
    laugh(ra, win(6, .7, 1.1, t), t, 12);
    const palms = win(9, .45, 1, t);   // "à peine une corde": palms up
    if (palms > 0) for (const s of ['L', 'R']) PO.reach(ra, s, front(ra, 'chest', .3 * kr, (s === 'L' ? -.2 : .2) * kr, -.15 * kr).lerp(front(ra, 'root', .2 * kr, (s === 'L' ? -.2 : .2) * kr, 0), 1 - palms), { grip: 0 });
    const hand = win(10, .5, 1, t);   // "Dieu donne": right hand raised, palm out
    if (hand > 0) PO.reach(zo, 'R', front(zo, 'head', .25 * kz, .15 * kz, .05 * kz).lerp(front(zo, 'root', .2 * kz, .2 * kz, 0), 1 - hand), { grip: 0 });
    const amen = win(11, 0, 1, t);   // the women lower their eyes together
    for (const a of [w1, w2, ra]) if (amen > 0) { a.B.neck.rotation.x += .2 * amen; a.B.neck.updateWorldMatrix(false, true); }
  },
});

export default beatScene(ID, {
  shots: { esc, pa },
  plan: {
    b054: { shot: 'esc', size: 'W', on: 'zoubida' },
    b055: { shot: 'esc', size: 'M', on: 'mohammed' },
    b056: { shot: 'esc', size: 'CU', on: 'zoubida' },
    b057: { shot: 'esc', size: 'M', on: 'mohammed' },
    b058: { shot: 'esc', size: 'M', on: 'zoubida' },
    b059: { shot: 'pa', size: 'W', on: 'rahma' },
    b060: { shot: 'pa', size: 'CU', on: 'rahma' },
    b061: { shot: 'esc', size: 'CU', on: 'mohammed' },
    b062: { shot: 'pa', size: 'M', on: 'zoubida' },
    b063: { shot: 'pa', size: 'CU', on: 'rahma' },
    b064: { shot: 'pa', size: 'CU', on: 'zoubida' },
    b065: { shot: 'pa', size: 'W', on: 'zoubida' },
  },
});
