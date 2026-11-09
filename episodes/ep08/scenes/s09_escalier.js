// s09 "L'escalier". Mohammed sits alone on tread 3 of the day stair (art/plates/escalier.png), facing down the flight,
// hands on his knees. b044 settles, b045 chin up (the idea deserved silence), b046–b049 paintings (flowers, genies),
// b050 shoulders drop, b051 fists tighten on his knees "à mort", b052 enumeration (pieds / prière / bruit, inserts on the
// words), b053 he repeats his sentence to himself, eyes up the flight, lips moving.
import { staged } from '../lib/autostage.js';
import { ESCALIER } from '../lib/stairs.js';
import { beatScene, lines, sm, at, V } from '../lib/beatscene.js';

const ID = 's09_escalier', L = lines(ID);
const B = i => L[i] || [0, 0];
const win = (i, a, b, t) => { const [t0, t1] = B(i), D = t1 - t0; return sm(t0 + a * D, t0 + a * D + .5, t) * (1 - sm(t0 + b * D, t0 + b * D + .5, t)); };

export const SEAT = { tread: 3, face: 'down', pose: 'step', seed: 3 };
const esc = staged('escalier', { mohammed: { ...SEAT } }, {
  stairs: ESCALIER,
  act(lt, t, S, st, S3) {
    const mo = st.A.mohammed, B_ = mo.B;
    const chin = win(1, .05, .95, t), drop = win(6, .1, 1, t), fist = win(7, .55, 1, t), dream = win(9, .2, 1.1, t);
    B_.neck.rotation.x -= .12 * chin - .1 * drop;
    B_.chest.rotation.x += .1 * drop;
    for (const s of ['L', 'R']) { const h = B_['hand' + s]; if (h) h.rotation.z += (s === 'L' ? .25 : -.25) * fist; }
    if (dream > 0) { B_.head.rotation.z += .05 * Math.sin(t * 1.3) * dream; B_.neck.rotation.x -= .18 * dream; }   // b053: chin lifts, eyes up, dreaming
    for (const b of ['chest', 'neck', 'handL', 'handR']) B_[b]?.updateWorldMatrix(false, true);
  },
});

export default beatScene(ID, {
  shots: { esc },
  plan: {
    b044: { shot: 'esc', size: 'W', on: 'mohammed' },
    b045: { shot: 'esc', size: 'M', on: 'mohammed' },
    b050: { shot: 'esc', size: 'M', on: 'mohammed' },
    b051: { shot: 'esc', size: 'CU', on: 'mohammed' },
    b052: { shot: 'esc', size: 'M', on: 'mohammed' },
    b053: { shot: 'esc', size: 'W', on: 'mohammed' },
  },
});
