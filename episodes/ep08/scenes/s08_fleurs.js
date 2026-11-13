// s08 "beau comme les fleurs". Same lunch blocking as s07 (lib/lunch.js). b038 Mohammed searches for the word, eyes
// up-left, mouth half open; b039 the father leans in, amused, mouth working; b040 he lowers his eyes, hands fidget at
// his chest; b041 the whispered answer, mouth moving, eyes up on "fleurs"; b042 both parents rock back laughing, hands
// off the knees, the boy still between them; b043 slow side-eye left, then right, head level, lids lowered.
import { fitKneel, staged } from '../lib/fix8a.js';
import { palm, settleRobe } from '../lib/fix8g.js';
import { LUNCH } from '../lib/lunch.js';
import { at, beatScene, dirW, lines, sm, V } from '../lib/beatscene.js';
import { mouth } from './_3d.js';
import { fingers, look } from '../../../engine/poses.js';

const ID = 's08_fleurs', L = lines(ID), B = i => L[i] || [0, 0];
const f = (i, x) => B(i)[0] + x * (B(i)[1] - B(i)[0]);
const ramp = (t0, t1, t) => sm(t0 - 0.12, t0 + 0.32, t) * (1 - sm(t1 - 0.12, t1 + 0.4, t));

const ch = staged('chambre_jour', {
  ...LUNCH,
  // Looks are aimed in act(). A marks.look would run after it and pull the head off the beat.
  mohammed: { ...LUNCH.mohammed, look: () => null, lookMax: 0 },
  father: { ...LUNCH.father, height: 1.76, look: () => null, lookMax: 0 },
  zoubida: { ...LUNCH.zoubida, look: () => null, lookMax: 0 },
}, {
  addressee: { father: 'mohammed', mohammed: 'father' },
  act(lt, t, S, st, S3) {
    const { father: fa, zoubida: zo, mohammed: mo } = st.A;
    ZO = zo;
    const k = a => a.group.scale.y / 1.6, kf = k(fa), kz = k(zo), km = k(mo);
    // fix8 drapeLap runs after act and reintroduces the back-hem spike. Settle once that pass is done.
    st.G.apply = () => { for (const a of [fa, mo]) settleRobe(a); settleRobe(zo, 0, { front: { fwd: -0.14, over: -0.03, scale: 0.22 }, flank: 0.6 }); };

    const search = 1 - sm(B(1)[0] - 0.1, B(1)[0] + 0.25, t);
    const lean = ramp(B(1)[0], B(1)[1], t);
    const fidget = sm(B(2)[0] - 0.08, B(2)[0] + 0.2, t) * (1 - sm(B(3)[0] + 0.05, B(3)[0] + 0.5, t));
    const whisper = ramp(B(3)[0], B(3)[1], t);
    // Eyes stay lowered into the start of the whisper, then come up through "fleurs" (still a little shy).
    const rise = sm(B(3)[0] + 0.05, f(3, 0.3), t);
    const down = sm(B(2)[0] - 0.05, B(2)[0] + 0.22, t) * (1 - rise);
    const laugh = sm(B(4)[0] - 0.05, B(4)[0] + 0.28, t) * (1 - sm(B(4)[1] - 0.08, B(4)[1] + 0.28, t));
    const residue = sm(B(4)[0], B(4)[0] + 0.3, t) * (0.62 + 0.38 * (1 - sm(B(4)[1] + 0.2, B(5)[1], t)));
    const side = sm(f(5, 0.36), f(5, 0.58), t);
    const listen = sm(0.2, 2.4, t) * (1 - sm(B(4)[0] - 0.25, B(4)[0] + 0.1, t));
    const sceptical = sm(B(5)[0] - 0.05, B(5)[0] + 0.35, t);

    sway(fa, t, 5, 0.05);
    sway(zo, t, 8.2, 0.046);
    sway(mo, t, 2.4, 0.028 * (1 - sm(B(5)[0] - 0.1, B(5)[0] + 0.3, t)));
    // Listening lean grows through the search, the question leans further, the laugh rocks the torso back ~22°.
    // Father's laugh: the lean back is mostly head/neck/chest so the robe front stays settled on the floor (a big spine swing retracted the hem off the floor).
    fa.B.spine.rotation.x += 0.1 * listen * (1 - lean) + 0.3 * lean - 0.04 * laugh - 0.015 * residue + 0.025 * Math.sin(t * 11.5) * laugh;
    fa.B.chest.rotation.x += 0.06 * listen * (1 - lean) + 0.16 * lean - 0.035 * laugh;
    zo.B.spine.rotation.x += 0.07 * listen * (1 - laugh) - 0.09 * laugh - 0.04 * residue + 0.03 * Math.sin(t * 10.5 + 1) * laugh;
    zo.B.chest.rotation.x += 0.045 * Math.sin(t * 1.1 + 0.7) * listen - 0.07 * laugh;
    // Idles: breath, small head turns, the mother glancing at the boy and away; the boy shifts weight and leans back when the father leans in.
    const breath = Math.sin(t * 2.1);
    fa.B.chest.rotation.x += 0.012 * breath; zo.B.chest.rotation.x += 0.014 * Math.sin(t * 2.3 + 1);
    fa.B.head.rotation.y += 0.07 * Math.sin(t * 0.63 + 0.4) * (1 - laugh);
    zo.B.head.rotation.y += 0.09 * Math.sin(t * 0.47 + 2.0) * (1 - laugh);
    const reactB = sm(B(1)[0] + 0.2, B(1)[0] + 0.55, t) * (1 - sm(B(1)[1] - 0.2, B(1)[1] + 0.3, t));
    mo.B.spine.rotation.x -= 0.07 * reactB;
    mo.B.chest.rotation.x += 0.012 * breath * (1 - reactB);
    mo.B.spine.rotation.z += 0.05 * Math.sin(t * 0.8) * search;
    mo.B.chest.rotation.z += 0.04 * Math.sin(t * 1.3 + 1) * search;
    shrug(fa, t, 0, laugh);
    shrug(zo, t, 1.5, laugh);
    for (const a of [fa, zo, mo]) { a.B.spine.updateWorldMatrix(false, true); fitKneel(a); }

    const raised = laugh + residue * 0.45;
    for (const [a, ph, kk] of [[fa, 0.2, kf], [zo, 1.7, kz]]) {
      palm(a, 'L', handAt(a, 'L', t, ph, kk, raised), { grip: 0.03, pole: [0.6, 0.3, 0.3], gap: 0.14 });
      palm(a, 'R', handAt(a, 'R', t, ph + 0.9, kk, raised), { grip: 0.03, pole: [-0.6, 0.3, 0.3], gap: 0.14 });
    }
    for (const [s, ph] of [['L', 0], ['R', 1.6]]) {
      // Resting hand: flat on the thigh, elbow clearly bent and pushed out (pole), not a straight arm hanging from the shoulder.
      const sg = s === 'L' ? 1 : -1;
      // Searching: the right hand drifts up, fingers working, as if pulling the word out; the left stays on the thigh.
      const gest = s === 'R' ? search * (0.55 + 0.45 * Math.sin(t * 1.9)) * 0.8 : 0;
      // Chest hands sit lower and wider so the forearms do not cross into the torso or past the shoulder line.
      const p = lapHand(mo, s, t, 3, km).lerp(chestHand(mo, s, t, ph, km), Math.max(fidget, gest))
        .addScaledVector(dirW(mo, 0, 0, 1), 0.03 * km * fidget).add(V(0, -0.03 * km * fidget, 0)).addScaledVector(dirW(mo, -sg, 0, 0), -0.05 * km * fidget);
      palm(mo, s, p, { grip: 0.025, pole: [sg * (0.95 - 0.3 * Math.max(fidget, gest)), -0.15 + 0.35 * Math.max(fidget, gest), -0.25 + 0.55 * Math.max(fidget, gest)], gap: 0.16 });
      if (Math.max(fidget, gest) > 0.15) fingers(mo, s, 0.2 + 0.6 * Math.abs(Math.sin(t * 7.6 + ph)), { spread: 0.4 * Math.sin(t * 5.2 + ph) });
    }

    const eye = at(mo, 'head').clone().add(V(0, 0.03 * km, 0));
    if (sceptical < 0.5) {
      // Gaze built in SCREEN space from the scene camera (no actor-axis sign guessing): toward the lens, then camR/camU.
      const cam = S3.cam, camR = V(1, 0, 0).applyQuaternion(cam.quaternion), camU = V(0, 1, 0).applyQuaternion(cam.quaternion);
      const toCam = cam.position.clone().sub(eye).normalize();
      const scr = (r, u, d = 0.5) => eye.clone().addScaledVector(toCam, d).addScaledVector(camR, r).addScaledVector(camU, u);
      const upLeft = scr(-0.2 * km, 0.2 * km);                // searching: up and to screen-LEFT, away from the mother
      const lowered = scr(0.03 * km, -0.26 * km, 0.4);        // eyes dropped to the floor in front of him
      const parents = at(fa, 'head').lerp(at(zo, 'head'), 0.45).add(V(0, 0.42 * km, 0));
      const level = eye.clone().addScaledVector(dirW(mo, 0, 0, 1), 0.6);
      const aim = upLeft.lerp(lowered, down).lerp(parents, rise * (1 - down)).lerp(level, Math.max(laugh, residue * 0.8));
      look(mo, aim, 0.9, { max: 0.22 + 0.5 * search * (1 - down) + 0.2 * rise });
    } else {
      // Eyes only: a small yaw, pitch and roll pinned so the head stays level and the lids do the scepticism.
      const yaw = (0.5 - side) * 0.6;
      mo.B.neck.rotation.set(-0.05, 0, 0);
      mo.B.head.rotation.set(-0.12, yaw * 0.15, 0);
      mo.B.chest.rotation.z = 0; mo.B.spine.rotation.z = 0;
      mo.B.head.updateWorldMatrix(false, true);
    }
    const boy = at(mo, 'head');
    const faUp = at(fa, 'head').add(V(0, 0.03 * kf, 0)).add(V(0, 0.07 * kf, 0)).addScaledVector(dirW(fa, 0, 0, 1), 0.3);
    const zoUp = at(zo, 'head').add(V(0, 0.03 * kz, 0)).add(V(0, 0.16 * kz, 0)).addScaledVector(dirW(zo, 0, 0, 1), 0.28);
    look(fa, boy.clone().lerp(faUp, laugh), 0.85, { max: 0.4 });
    look(zo, boy.clone().lerp(zoUp, laugh), 0.85, { max: 0.38 });
    fa.B.head.rotation.z += 0.16 * lean + 0.08 * listen * (1 - lean);
    fa.B.head.rotation.x -= 0.04 * laugh;
    zo.B.head.rotation.z += 0.12 * Math.sin(t * 0.85 + 0.6) * listen + 0.08 * laugh;
    zo.B.head.rotation.x -= 0.04 * laugh;
    fa.B.neck.rotation.x -= 0.015 * laugh;
    zo.B.neck.rotation.x -= 0.02 * laugh;

    const row = name => st.faces.find(r => r[1] === name);
    const said = mouth(S, 'mohammed', t);
    const asked = mouth(S, 'father', t);
    row('mohammed')[3] = () => ({
      open: Math.max(search * (0.42 + 0.2 * Math.abs(Math.sin(t * 8.4))), search * said, whisper * (0.3 + 0.4 * Math.abs(Math.sin(t * 12.2)))),
      lid: sceptical * 0.55 + down * 0.5,
    });
    row('father')[3] = () => ({
      open: Math.max(sm(B(1)[0] - 0.05, B(1)[0] + 0.1, t) * (1 - sm(B(1)[1] - 0.05, B(1)[1] + 0.15, t)) * (0.4 + 0.3 * Math.abs(Math.sin(t * 13))), lean * (0.58 + 0.32 * Math.abs(Math.sin(t * 15.5))), lean * asked) + laugh * (0.75 + 0.2 * Math.abs(Math.sin(t * 9.2))) + residue * 0.2,
      lid: 0.16 * lean + 0.32 * laugh,
    });
    row('zoubida')[3] = () => ({
      open: laugh * (0.7 + 0.24 * Math.abs(Math.sin(t * 8.4 + 1.2))) + residue * 0.16 + listen * 0.1 * (1 - laugh),
      lid: 0.08 * listen + 0.3 * laugh,
    });
  },
});

let ZO = null;
function sway(a, t, seed, amp) {
  a.B.spine.rotation.y += Math.sin(t * 0.52 + seed) * amp;
  a.B.spine.rotation.z += Math.sin(t * 0.4 + seed * 1.2) * amp * 0.85;
  a.B.spine.rotation.x += Math.sin(t * 1.4 + seed) * amp * 0.55;
  a.B.chest.rotation.z += Math.sin(t * 0.72 + seed) * amp * 0.9;
  a.B.chest.rotation.x += Math.sin(t * 1.6 + seed) * amp * 0.4;
  if (a.B.LeftShoulder) a.B.LeftShoulder.rotation.z += Math.sin(t * 1.02 + seed) * amp;
  if (a.B.RightShoulder) a.B.RightShoulder.rotation.z -= Math.sin(t * 0.9 + seed) * amp * 0.9;
}

function shrug(a, t, ph, laugh) {
  const w = Math.sin(t * 12.5 + ph) * laugh;
  if (a.B.LeftShoulder) a.B.LeftShoulder.rotation.z += 0.16 * w;
  if (a.B.RightShoulder) a.B.RightShoulder.rotation.z -= 0.14 * Math.sin(t * 12.5 + ph + 1.2) * laugh;
}

function kneeHand(a, s, t, seed, k) {
  const sign = s === 'L' ? 1 : -1;
  const w = Math.sin(t * 1.35 + seed + (s === 'L' ? 0 : 1.3));
  return at(a, 'shin' + s).clone()
    .add(V(0, (0.11 + 0.03 * w) * k, 0))
    .addScaledVector(dirW(a, 0, 0, 1), (0.17 + 0.025 * w) * k)
    .addScaledVector(dirW(a, -sign, 0, 0), (0.06 + 0.02 * w) * k);
}

/** Mohammed's resting hand: on the thigh, between hip and knee, a little forward and in. */
function lapHand(a, s, t, seed, k) {
  const sign = s === 'L' ? 1 : -1, w = Math.sin(t * 1.35 + seed + (s === 'L' ? 0 : 1.3));
  const p = at(a, 'shin' + s).clone().lerp(at(a, 'root'), 0.62)
    .add(V(0, (0.15 + 0.01 * w) * k, 0)).addScaledVector(dirW(a, 0, 0, 1), 0.1 * k)
    .addScaledVector(dirW(a, -sign, 0, 0), 0.03 * k);
  // Keep the shoulder-to-palm reach at ~74% of the arm so the elbow stays visibly bent (a full reach reads as a stiff arm).
  const sh = at(a, 'upperArm' + s), len = sh.distanceTo(at(a, 'foreArm' + s)) + at(a, 'foreArm' + s).distanceTo(at(a, 'hand' + s));
  const d = p.clone().sub(sh), m = 0.74 * len;
  return d.length() > m ? sh.clone().addScaledVector(d.normalize(), m) : p;
}

/** Parent's resting hand: flat on the thigh, midway between hip and knee, clear of the knee cloth. */
function thighHand(a, s, t, seed, k) {
  const sign = s === 'L' ? 1 : -1;
  const w = Math.sin(t * 1.35 + seed);
  const lift = a === ZO ? 0.07 : 0.06;   // mother: hands up on the skirt, in front of the orange flap
  return at(a, 'shin' + s).clone().lerp(at(a, 'root'), 0.34)
    .add(V(0, (0.13 + lift + 0.01 * w) * k, 0)).addScaledVector(dirW(a, 0, 0, 1), lift * 0.7 * k)
    .addScaledVector(dirW(a, -sign, 0, 0), 0.03 * k);
}

function handAt(a, s, t, ph, k, up) {
  const sign = s === 'L' ? 1 : -1;
  const bob = Math.sin(t * 10.5 + ph);
  const lap = thighHand(a, s, t, ph, k);
  // Laughing hands come up and out in front of the chest, clear of the torso, never near the knee cloth.
const high = at(a, 'chest').clone()
    .add(V(0, (-0.17 + 0.025 * bob) * k, 0))
    .addScaledVector(dirW(a, 0, 0, 1), (0.22 + 0.015 * bob) * k)
    .addScaledVector(dirW(a, -sign, 0, 0), (0.1 + 0.015 * Math.sin(t * 8.5 + ph)) * k);
  // Right hand slaps the thigh instead (father/mother alternate), rising and falling with the laugh.
  const slap = lap.clone().add(V(0, (0.05 + 0.07 * Math.max(0, bob)) * k, 0));
  if (s === 'R') return lap.lerp(slap, Math.min(1, up));
  return lap.lerp(high, Math.min(1, up));
}

function chestHand(a, s, t, ph, k) {
  const sign = s === 'L' ? 1 : -1;
  const w = Math.sin(t * 6.6 + ph), w2 = Math.sin(t * 3.4 + ph);
  return at(a, 'chest').clone()
    .add(V(0, (-0.03 + 0.02 * w2) * k, 0))
    .addScaledVector(dirW(a, 0, 0, 1), (0.29 + 0.02 * w) * k)
    .addScaledVector(dirW(a, -sign, 0, 0), (0.05 + 0.02 * w) * k);
}

export default beatScene(ID, {
  shots: { ch },
  plan: {
    // M + a hand-set zoom: wide enough for the turban and the boy's hands, without a dead left third.
    // Plate heads sit near y 490–750. A wide M is clamped to the bottom of the plate, so the turban and the hands share the frame.
    b038: { shot: 'ch', size: 'M', on: 'mohammed', z: 1.16, dx: -110, dy: 100 },
    // Father-son two-shot: far enough right to drop the empty door, tight enough that the mother's skirt stays outside.
    b039: { shot: 'ch', size: 'M', on: 'father', z: 1.3, dx: 240, dy: -13 },
    b040: { shot: 'ch', size: 'M', on: 'mohammed', z: 1.14, dx: -100, dy: 110 },
    b041: { shot: 'ch', size: 'M', on: 'mohammed', z: 1.16, dx: -100, dy: 110 },
    b042: { shot: 'ch', size: 'M', on: 'mohammed', z: 1.04, dx: -20, dy: 180 },
    b043: { shot: 'ch', size: 'M', on: 'mohammed', z: 1.16, dx: -90, dy: 100 },
  },
});
