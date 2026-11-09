// s09 "L'escalier". Mohammed sits alone on tread 3 of the day stair (art/plates/escalier.png), facing down the flight,
// hands on his knees. b044 settles, b045 chin up (the idea deserved silence), b046–b049 paintings (flowers, genies),
// b050 shoulders drop, b051 fists tighten on his knees "à mort", b052 enumeration (pieds / prière / bruit, inserts on the
// words), b053 he repeats his sentence to himself, eyes up the flight, lips moving.
import * as PO from '../../../engine/poses.js';
import { staged } from '../lib/autostage.js';
import { ESCALIER } from '../lib/stairs.js';
import { beatScene, lines, sm, at, V, front } from '../lib/beatscene.js';

const ID = 's09_escalier', L = lines(ID);
const B = i => L[i] || [0, 0];
const win = (i, a, b, t) => { const [t0, t1] = B(i), D = t1 - t0; return sm(t0 + a * D, t0 + a * D + .5, t) * (1 - sm(t0 + b * D, t0 + b * D + .5, t)); };

export const SEAT = { tread: 3, back: .15, face: 'down', yaw: .55, pose: 'step', o: { fz: .3, lean: .38 }, seed: 3 };   // Argon r6: hips were perched on the nosing → 8 cm further back onto the tread. hips on tread 3, feet on tread 2, turned 3/4 so the bent knees read; hands pinned on the knees (autostage)
// b053: eyes up the flight (screen-left, toward the top landing), lips moving on his sentence
const esc = staged('escalier', { mohammed: { ...SEAT, lookMax: 1.1, mutter: t => win(9, .1, 1.1, t), look: (t, st) => win(9, .1, 1.1, t) > .3 ? front(st.A.mohammed, 'head', 1.2, .35, .8) : win(0, .45, 1, t) > .3 ? front(st.A.mohammed, 'head', 1, -.45, -.5) : null } }, {   // Argon r6: the flight is behind him (head can't turn 180°) → b053 eyes lift up and out; b044 thinking: eyes down-aside
  stairs: ESCALIER,
  act(lt, t, S, st, S3) {
    const mo = st.A.mohammed, B_ = mo.B;
    const chin = win(1, .05, .95, t), drop = win(6, .1, 1, t), fist = win(7, .55, 1, t), dream = win(9, .2, 1.1, t);
    // Argon r5: the crouch read as a hovering pelvis under a bolt-upright torso → a child sitting on a step rounds forward
    // over his knees all the time (lower back + chest), head counter-tilted so the face stays up to the lens
    B_.spine.rotation.x += .2; B_.chest.rotation.x += .16; B_.neck.rotation.x -= .18;
    // Argon r6: the poses read identical beat to beat → bigger, distinct attitudes: b044 settles deeper into thought, b045 chin
    // well up (serious as a judge), b050 head and back sag, b051 hunched and tense with a small tremor
    const think = win(0, .45, 1, t);
    B_.spine.rotation.x += .08 * think; B_.head.rotation.z += .1 * think;
    B_.neck.rotation.x -= .3 * chin - .3 * drop; B_.head.rotation.x -= .12 * chin - .12 * drop;
    if (fist > 0) B_.chest.rotation.z += .015 * Math.sin(t * 17) * fist;
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
    // Argon r6: the auto zoom on a crouched boy hit 4.5× (head cropped, hands out): hand-set zooms, knees and hands in frame
    b044: { shot: 'esc', size: 'W', on: 'mohammed', cover: [{ f: .45, size: 'M', on: 'mohammed', z: 2.2 }] },
    b045: { shot: 'esc', size: 'M', on: 'mohammed', z: 2.8 },
    b048: { move: 'forge' },
    b049: { move: 'princess' },
    b050: { shot: 'esc', size: 'M', on: 'mohammed', z: 2.6 },
    b051: { shot: 'esc', size: 'M', on: 'mohammed', z: 2.3 },
    b052: { shot: 'esc', size: 'M', on: 'mohammed', z: 2.6 },
    b053: { shot: 'esc', size: 'M', on: 'mohammed', z: 2.4 },
  },
});
