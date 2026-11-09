// s11 "L'Aâsser". patio_matin in late-afternoon amber key light. b066 the call to prayer: Mohammed lifts his face to the
// sky, b067 hopeful question, b068 Zoubida points at the stains on his djellaba, b069 Fatma Bziouya leans out of her door
// (right), b070 eager question, b071 Zoubida nods, b072 the father calls from the street door (left) before coming in,
// b073 "Passe": he walks in.
import * as PO from '../../../engine/poses.js';
import { staged } from '../lib/autostage.js';
import { beatScene, lines, sm, front, at, V } from '../lib/beatscene.js';

const ID = 's11_depart', L = lines(ID);
const B = i => L[i] || [0, 0];
const win = (i, a, b, t) => { const [t0, t1] = B(i), D = t1 - t0; return sm(t0 + a * D, t0 + a * D + .5, t) * (1 - sm(t0 + b * D, t0 + b * D + .5, t)); };
const k = a => a.group.scale.y / 1.6;
const AMBER = { key: '#ffb870', keyI: 1.9, dir: [-3, 1.6, 1], fillI: .9, sky: '#d9b48a' };

const pa = staged('patio_matin', {
  mohammed: { at: [940, 1000], face: 'zoubida', seed: 3,
    look: t => t < B(1)[0] ? [940, 600, 6] : 'zoubida' },
  zoubida: { at: [1240, 975], face: 'mohammed', seed: 7,
    look: t => t > B(3)[0] && t < B(5)[0] + .5 ? 'fatma' : 'mohammed' },
  fatma: { at: [1700, 945], face: [1240, 975], seed: 11 },
  father: { at: [160, 955], face: [700, 965], seed: 5, walk: { to: [560, 965], t0: B(7)[0] + .4, t1: B(7)[0] + 3.4 } },
}, {
  light: AMBER,
  addressee: { mohammed: 'zoubida', zoubida: 'mohammed', fatma: 'zoubida', father: 'zoubida' },
  act(lt, t, S, st) {
    const { mohammed: mo, zoubida: zo, fatma: fa } = st.A, kz = k(zo);
    const point = win(2, .55, 1, t);   // "pleine de taches": index at the stains on his chest
    if (point > 0) PO.reach(zo, 'R', front(zo, 'chest', .25 * kz, .1 * kz, -.1 * kz).lerp(at(mo, 'chest').add(V(0, -.05, 0)), .6 * point), { grip: .4 });
    // Fatma only leans out of her doorway from b069 on (before that she is hidden: pushed back out of frame)
    const lean = sm(B(3)[0] + .45 * (B(3)[1] - B(3)[0]), B(3)[0] + .45 * (B(3)[1] - B(3)[0]) + .8, t);
    fa.group.visible = t > B(3)[0];
    fa.B.spine.rotation.z += .22 * lean; fa.B.spine.updateWorldMatrix(false, true);
    const nod = win(5, 0, .35, t);   // Zoubida's nod
    if (nod > 0) { zo.B.neck.rotation.x += .18 * Math.max(0, Math.sin((t - B(5)[0]) * 7)) * nod; zo.B.neck.updateWorldMatrix(false, true); }
    const lookUp = 1 - sm(B(1)[0] - .5, B(1)[0], t);   // chin lifted to the call
    mo.B.neck.rotation.x -= .15 * lookUp; mo.B.neck.updateWorldMatrix(false, true);
  },
});

export default beatScene(ID, {
  shots: { pa },
  plan: {
    b066: { shot: 'pa', size: 'W', on: 'mohammed' },
    b067: { shot: 'pa', size: 'CU', on: 'mohammed' },
    b068: { shot: 'pa', size: 'M', on: 'zoubida' },
    b069: { shot: 'pa', size: 'M', on: 'fatma' },
    b070: { shot: 'pa', size: 'CU', on: 'fatma' },
    b071: { shot: 'pa', size: 'M', on: 'zoubida' },
    b072: { shot: 'pa', size: 'M', on: 'father' },
    b073: { shot: 'pa', size: 'W', on: 'father' },
  },
});
