// s09 "L'escalier". Mohammed sits alone on tread 3 of the day stair (art/plates/escalier.png), facing down the flight,
// hands on his knees. b044 settles, b045 chin up (the idea deserved silence), b046–b049 paintings (flowers, genies),
// b050 shoulders drop, b051 fists tighten on his knees "à mort", b052 enumeration (pieds / prière / bruit, inserts on the
// words), b053 he repeats his sentence to himself, eyes up the flight, lips moving.
import * as PO from '../../../engine/poses.js';
import { staged } from '../lib/autostage.js';
import { ESCALIER } from '../lib/stairs.js';
import { beatScene, lines, sm, at, V } from '../lib/beatscene.js';

const ID = 's09_escalier', L = lines(ID);
const B = i => L[i] || [0, 0];
const win = (i, a, b, t) => { const [t0, t1] = B(i), D = t1 - t0; return sm(t0 + a * D, t0 + a * D + .5, t) * (1 - sm(t0 + b * D, t0 + b * D + .5, t)); };

export const SEAT = { tread: 3, back: .07, face: 'down', yaw: .55, pose: 'step', o: { fz: .3, lean: .38 }, seed: 3 };   // hips on tread 3, feet on tread 2, turned 3/4 so the bent knees read; hands pinned on the knees (autostage)
// b053: eyes up the flight (screen-left, toward the top landing), lips moving on his sentence
const esc = staged('escalier', { mohammed: { ...SEAT, lookMax: 1.1, mutter: t => win(9, .1, 1.1, t), look: (t, st) => win(9, .1, 1.1, t) > .3 ? st.ST.tread(6).setY(st.ST.y(6) + .9) : null } }, {
  stairs: ESCALIER,
  act(lt, t, S, st, S3) {
    const mo = st.A.mohammed, B_ = mo.B;
    const chin = win(1, .05, .95, t), drop = win(6, .1, 1, t), fist = win(7, .55, 1, t), dream = win(9, .2, 1.1, t);
    B_.neck.rotation.x -= .12 * chin - .16 * drop;
    B_.spine.rotation.x += .1 * drop + .06 * fist; B_.chest.rotation.x += .16 * drop + .08 * fist;   // b050 the whole back slumps; b051 hunched, tense
    if (dream > 0) { B_.head.rotation.z += .05 * Math.sin(t * 1.3) * dream; B_.neck.rotation.x -= .1 * dream; }   // b053: chin lifts
    for (const b of ['spine', 'chest', 'neck']) B_[b]?.updateWorldMatrix(false, true);
    // arms untouched here, so autostage re-pins the palms on the knees after the slump; the fists are finger curls
    if (fist > 0) for (const s of ['L', 'R']) PO.fingers(mo, s, .25 + .75 * fist, { thumb: .6 * fist + .2 });
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
