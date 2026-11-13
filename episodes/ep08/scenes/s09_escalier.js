// s09 "L'escalier". Mohammed sits alone on tread 3 of the day stair (art/plates/escalier.png), facing down the flight,
// hands on his knees. b044 settles, b045 chin up (the idea deserved silence), b046–b049 paintings (flowers, genies),
// b050 shoulders drop, b051 fists tighten on his knees "à mort", b052 enumeration (pieds / prière / bruit, feet and hush
// inserts), b053 he repeats his sentence to himself, eyes up the flight, lips moving.
import { castScale, reachClamp } from '../lib/fix8c.js';
import * as THREE from 'three';
import * as IK from '../../../engine/ik.js';
import * as PO from '../../../engine/poses.js';
import { sitStepDrop as sitStep } from '../lib/fix8_R15C.js';
import { staged } from '../lib/autostage.js';
import { c } from '../../../engine/core.js';
import { ESCALIER } from '../lib/stairs.js';
import { beatScene as makeBeatScene, ENUM, lines, sm, at, V, front } from '../lib/beatscene.js';

const ID = 's09_escalier', L = lines(ID);
const B = i => L[i] || [0, 0];
const win = (i, a, b, t) => { const [t0, t1] = B(i), D = t1 - t0; return sm(t0 + a * D, t0 + a * D + .5, t) * (1 - sm(t0 + b * D, t0 + b * D + .5, t)); };

// Absolute support heights: autostage places the group on tread 2, but PO.stool solves in WORLD metres.
// Shorten the ankle reach for this child's legs: .24 gives ~90° knees and level thighs; .087 puts the soles on .40.
export const SEAT = { tread: 3, back: .28, face: 'down', yaw: .35, pose: 'step', hands: 'knees',
  o: { seat: .6, floor: .4, fz: .2, ankle: .087, spread: .12, lean: .18 }, seed: 3 };
const esc = staged('escalier', { mohammed: { ...SEAT, talk: 0, lookMax: .8,
  mutter: t => sm(B(9)[0], B(9)[0] + .25, t),
  look: (t, st) => t >= B(9)[0]
    ? at(st.A.mohammed, 'head').addScaledVector(st.ST.up, .35).addScaledVector(st.ST.side, .6).add(V(0, 1.2, 0))
    : win(0, .4, 1.1, t) > .2 ? front(st.A.mohammed, 'head', .55, 0, -.4) : null,
} }, {
  stairs: ESCALIER,
  light: { shadow: .11, soft: 8, dir: [1, 6, 1] },
  act(lt, t, S, st) {
    const mo = st.A.mohammed, b = mo.B;
    // b052's cast is the three insert images (mother, father, neighbour), not people on the stair.
    st.actcheck = { insert: t >= B(8)[0] && t < B(8)[1] + .8 };
    castScale(mo);
    // R24C: back .28, seat -.075, reach 1.0 (pelvis lower/further back, feet not overstretched). R23C: pelvis moved back so the seat rests behind tread 3's nosing; longer reach puts soles on tread 2.
    // Stool planted the knees on tread 3 and left the pelvis at tread 4. Sit the capsule on tread 3.
    sitStep(mo, SEAT.o.seat - .075, SEAT.o.floor, 1.0);
    const think = win(0, .4, 1.1, t), chin = win(1, .05, .95, t);
    // Hold the deflated pose through b050's tail and the pause before b051.
    const drop = sm(B(6)[0], B(6)[0] + .65, t) * (1 - sm(B(7)[0], B(7)[0] + .6, t));
    const fist = sm(B(7)[0] + .1 * (B(7)[1] - B(7)[0]), B(7)[0] + .2 * (B(7)[1] - B(7)[0]), t)
      * (1 - sm(B(8)[0], B(8)[0] + .4, t));
    const dream = sm(B(9)[0] - .35, B(9)[0] + .1, t), settle = sm(0, 2.4, t);
    b.spine.rotation.x += .07 * settle + .08 * think + .16 * drop + .1 * fist;
    b.chest.rotation.x += .06 * settle + .08 * think + .2 * drop + .12 * fist;
    b.neck.rotation.x += .18 * think - .42 * chin + .18 * drop;
    b.head.rotation.x += .1 * think - .2 * chin + .12 * drop;
    b.head.rotation.z += .06 * think;
    // Turn left through the upper body as well as the head, toward the upper railing/landing.
    b.spine.rotation.y -= .03 * dream; b.chest.rotation.y -= .02 * dream;   // R25C: the big turn showed the back of his head; keep the face to camera
    b.chest.rotation.z += .012 * Math.sin(t * 17) * fist;
    // R20A: head starts rising ~1.4 s before b053 and ends clearly up the flight.
    const up53 = sm(B(9)[0] - 1.4, B(9)[0] + .3, t);
    b.neck.rotation.x -= (.08 + .08 * dream) * up53; b.head.rotation.x -= (.06 + .1 * dream) * up53;
     b.spine.rotation.x -= .06 * dream; b.chest.rotation.x -= .06 * dream;
    // R25C: "à mort" - tense shoulders (clavicles up) with the fists.
    for (const sd of ['L', 'R']) if (b['clavicle' + sd]) b['clavicle' + sd].rotation.z += (sd === 'L' ? 1 : -1) * .06 * fist;
    for (const n of ['spine', 'chest', 'neck']) b[n].updateWorldMatrix(false, true);
    // After the lean, put the palms back on the kneecaps. Fists close on "à mort".
    pinKneesOut(mo, fist);
  },
});

// This scene owns its enumeration overlay: the shared film overlay cannot be positioned per shot.
// Keep the normal beatScene module contract; suppress the film overlay only while drawing a replacement.
function beatScene(id, options) {
  const scene = makeBeatScene(id, options), draw = scene.draw;
  scene.noExam = false;
  scene.draw = (t, S) => {
    const finish = draw(t, S);
    scene.noExam = false; // all other beats, including the passing field-flower painting, retain the shared overlay
    for (const [i, key] of [[3, 'b047'], [8, 'b052']]) {
      const start = B(i)[0] + (key === 'b047' ? ENUM[key][0][0] - .1 : 0);
      if (t < start || t >= B(i)[1] + .8) continue;
      scene.noExam = true;
      const items = ENUM[key], local = t - B(i)[0];
      let active = 0; items.forEach(([when], j) => { if (local >= when - .08) active = j; });
      c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.scale(c.canvas.width / 1920, c.canvas.width / 1920);
      const x = 110, y = 130, w = 470, row = 64;
      c.fillStyle = 'rgba(20,13,8,.88)'; c.fillRect(x, y, w, row * items.length + 24);
      c.textAlign = 'left'; c.textBaseline = 'middle'; c.font = 'bold 46px Georgia, serif';
      items.forEach(([, word], j) => {
        const cy = y + 12 + row * (j + .5);
        if (j === active) { c.fillStyle = '#6b4725'; c.fillRect(x + 10, cy - 29, w - 20, 58); }
        c.fillStyle = j === active ? '#ffdc86' : '#f6e9cc'; c.fillText(word, x + 28, cy);
      });
      c.restore();
    }
    return finish;
  };
  return scene;
}

export default beatScene(ID, {
  shots: { esc },
  plan: {
    // Lower, wider seated coverage keeps both soles and their tread contact above the bottom matte.
    b044: { shot: 'esc', size: 'W', on: 'mohammed', cover: [{ f: .45, size: 'M', on: 'mohammed', z: 1.5, dy: 90 }] },
    b045: { shot: 'esc', size: 'M', on: 'mohammed', z: 1.5, dy: 50 },
    b048: { move: 'forge' },
    b049: { move: 'princess' },
    b050: { shot: 'esc', size: 'M', on: 'mohammed', z: 1.55, dy: 60 },
    b051: { shot: 'esc', size: 'M', on: 'mohammed', z: 1.5, dy: 50 },
    // Keep the feet visible beneath the list; omit the prayer painting with the extra painted digit.
    b052: { shot: 'esc', size: 'M', on: 'mohammed', z: 1.55, dy: 80, noIns: true, segs: [
      [(3.22 - .08) / (B(8)[1] - B(8)[0]), 'i_bassine_pieds'],
      [(3.22 + .92) / (B(8)[1] - B(8)[0]), 'esc'],
      [(10.01 - .08) / (B(8)[1] - B(8)[0]), 'i_doigt_levres'],
    ] },
    b053: { shot: 'esc', size: 'M', on: 'mohammed', z: 1.5, dy: 90 },
  },
});

// R21D: hands rest on the tops of the knees (apart, not tucked in the lap); fists clench tight and press down on "à mort".
function pinKneesOut(a, curl) {
  const k = a.group.scale.y / 1.6, B = a.B;
  a.group.updateMatrixWorld(true);
  const fwd = new THREE.Vector3(Math.sin(a.group.rotation.y), 0, Math.cos(a.group.rotation.y));
  const lat = IK.wpos(B.shinL).sub(IK.wpos(B.shinR)); lat.y = 0; lat.normalize();
  for (const [side, sign] of [['L', 1], ['R', -1]]) {
    const kn = IK.wpos(B['shin' + side]), hip = IK.wpos(B.root);
    const tgt = kn.clone();
    tgt.y = Math.min(hip.y - .03, kn.y + .035 * k) - .012 * k * curl;
    tgt.addScaledVector(fwd, .05 * k).addScaledVector(lat, sign * (.035 + .02 * curl) * k);
    reachClamp(a, side, tgt, { grip: .015, pole: [sign * .45, .08, .15] });
    PO.fingers(a, side, .12 + .88 * Math.min(1, curl * 1.15), { thumb: .15 + .85 * curl });
    for (const n of ['shoulder', 'clavicle']) if (B[n + side]) B[n + side].rotation.z += sign * .05 * curl;
  }
}
