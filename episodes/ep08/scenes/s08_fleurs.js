// s08 "beau comme les fleurs". Same lunch blocking as s07 (lib/lunch.js). b038 Mohammed searches for the word, eyes
// up-left, mouth half open; b039 the father leans in, amused, mouth working; b040 he lowers his eyes, hands fidget at
// his chest; b041 the whispered answer, mouth moving, eyes up on "fleurs"; b042 both parents rock back laughing, hands
// off the knees, the boy still between them; b043 slow side-eye left, then right, head level, lids lowered.
import { fitKneel, staged } from '../lib/fix8a.js';
import { palm, settleRobe } from '../lib/fix8g.js';
import { hangSash, tuckMother, tuckFeet } from '../lib/fix8_R31F.js';
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
  // R31N: up-stage a little so the wide shot shows his knees/feet instead of cropping them at the bottom edge.
  mohammed: { ...LUNCH.mohammed, at: [930, 965], look: () => null, lookMax: 0 },
  father: { ...LUNCH.father, height: 1.76, look: () => null, lookMax: 0 },
  zoubida: { ...LUNCH.zoubida, look: () => null, lookMax: 0 },
}, {
  addressee: { father: 'mohammed', mohammed: 'father' },
  act(lt, t, S, st, S3) {
    const { father: fa, zoubida: zo, mohammed: mo } = st.A;
    ZO = zo;
    const k = a => a.group.scale.y / 1.6, kf = k(fa), kz = k(zo), km = k(mo);
    // fix8 drapeLap runs after act and reintroduces the back-hem spike. Settle once that pass is done.
    st.G.apply = () => { settleRobe(mo); settleRobe(fa, 0, { front: { fwd: -0.14, over: -0.03, scale: 0.3 }, flank: 0.7, back: 0.55 }); settleRobe(zo, 0, { front: { fwd: 0.0, over: 0.02, scale: 0.15, s1: 0.8 }, flank: 1.0 }); hangSash(zo); tuckMother(zo); tuckFeet(fa); };

    const search = 1 - sm(B(1)[0] - 0.1, B(1)[0] + 0.25, t);
    const lean = ramp(B(1)[0], B(1)[1], t);
    const fidget = sm(B(2)[0] - 0.08, B(2)[0] + 0.2, t) * (1 - sm(B(3)[0] + 0.05, B(3)[0] + 0.5, t));
    const whisper = ramp(B(3)[0], B(3)[1] + 0.6, t);
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
    fa.B.spine.rotation.x += 0.1 * listen * (1 - lean) + 0.4 * lean - 0.04 * laugh - 0.015 * residue + 0.025 * Math.sin(t * 11.5) * laugh;
    fa.B.chest.rotation.x += 0.06 * listen * (1 - lean) + 0.22 * lean - 0.035 * laugh;
    zo.B.spine.rotation.x += 0.07 * listen * (1 - laugh) - 0.09 * laugh - 0.04 * residue + 0.03 * Math.sin(t * 10.5 + 1) * laugh;
    zo.B.chest.rotation.x += 0.045 * Math.sin(t * 1.1 + 0.7) * listen - 0.07 * laugh;
    // Idles: breath, small head turns, the mother glancing at the boy and away; the boy shifts weight and leans back when the father leans in.
    const breath = Math.sin(t * 2.1);
    fa.B.chest.rotation.x += 0.012 * breath; zo.B.chest.rotation.x += 0.014 * Math.sin(t * 2.3 + 1);
    // R31F: parents are not frozen for seconds: slow weight shifts and head nods (fade out in the laugh).
    fa.B.spine.rotation.z += 0.035 * Math.sin(t * 0.37 + 1.1) * (1 - laugh); fa.B.chest.rotation.y += 0.05 * Math.sin(t * 0.43 + 2.2) * (1 - laugh);
    zo.B.spine.rotation.z += 0.035 * Math.sin(t * 0.33 + 4) * (1 - laugh); zo.B.chest.rotation.y += 0.045 * Math.sin(t * 0.41 + 0.5) * (1 - laugh);
    fa.B.head.rotation.x += 0.05 * Math.sin(t * 0.8 + 1) * (1 - laugh); zo.B.head.rotation.x += 0.045 * Math.sin(t * 0.71 + 3) * (1 - laugh);
    fa.B.head.rotation.y += 0.09 * Math.sin(t * 0.63 + 0.4) * (1 - laugh);
    zo.B.head.rotation.y += 0.09 * Math.sin(t * 0.47 + 2.0) * (1 - laugh) * (1 - 0.4 * sceptical);
    const reactB = sm(B(1)[0] + 0.2, B(1)[0] + 0.55, t) * (1 - sm(B(1)[1] - 0.2, B(1)[1] + 0.3, t));
    mo.B.spine.rotation.x -= 0.07 * reactB;
    mo.B.chest.rotation.x += 0.012 * breath * (1 - reactB);
    mo.B.spine.rotation.z += 0.05 * Math.sin(t * 0.8) * search;
    mo.B.chest.rotation.z += 0.04 * Math.sin(t * 1.3 + 1) * search;
    shrug(fa, t, 0, laugh);
    shrug(zo, t, 1.5, laugh);
    for (const a of [fa, zo, mo]) { a.B.spine.updateWorldMatrix(false, true); fitKneel(a); }

    PHV = sm(B(4)[0] + 0.9, B(4)[0] + 1.1, t);
    const raised = laugh + residue * 0.45;
    for (const [a, ph, kk] of [[fa, 0.2, kf], [zo, 1.7, kz]]) {
      const isZ = a === zo, pL = handAt(a, 'L', t, ph, kk, raised), pR = handAt(a, 'R', t, ph + 0.9, kk, raised);
      // r28: mother's left hand rests forward on the lap (not behind the hip); father's right hand clears the knee fold by ~2.5 cm.
      if (isZ) pL.addScaledVector(dirW(a, 0, 0, 1), 0.07 * kk * (1 - laugh)).addScaledVector(dirW(a, -1, 0, 0), 0.05 * kk * (1 - laugh)).add(V(0, 0.01 * kk, 0));
      else pR.add(V(0, 0.025 * kk, 0));
      // R31F: hands wander a little (not frozen), the mother's right hand moves in and forward off the sash ends, the father's hands clearly lift in the laugh and his right arm opens out.
      const wv = 2.5 * Math.sin(t * 0.6 + (isZ ? 1 : 0)), wv2 = Math.sin(t * 0.47 + 2);
      for (const p of [pL, pR]) p.addScaledVector(dirW(a, 0, 0, 1), 0.02 * kk * wv).add(V(0, 0.012 * kk * wv2, 0));
      if (isZ) pR.addScaledVector(dirW(a, 0, 0, 1), 0.02 * kk * (1 - laugh)).addScaledVector(dirW(a, 1, 0, 0), -0.07 * kk * (1 - laugh)).add(V(0, 0.008 * kk * (1 - laugh), 0)).addScaledVector(at(zo, 'root').clone().sub(pR), 0.2 * (1 - laugh)).lerp(kneeHand(zo, 'R', t, 1, kk).add(V(0, -0.02 * kk, 0)), 0.55 * (1 - laugh));
      else { const lf = Math.min(1, laugh * 1.4 + residue * 0.3); for (const p of [pL, pR]) p.add(V(0, 0.13 * kk * lf, 0)).addScaledVector(dirW(a, 0, 0, 1), 0.0 * kk * lf); pR.addScaledVector(dirW(a, -1, 0, 0), 0.06 * kk); pL.addScaledVector(dirW(a, 1, 0, 0), 0.05 * kk); }
      palm(a, 'L', pL, { grip: 0.03, pole: isZ ? [1.0, 0.1, -0.1] : [0.9, 0.2, 0.1], gap: 0.14 });
      palm(a, 'R', pR, { grip: 0.03, pole: isZ ? [-0.6, 0.3, 0.3] : [-1.1, 0.15, 0.05], gap: 0.14 });
      if (isZ) {
        // soft wrist and loose, slightly curled fingers on the lifted right hand
        const w = Math.sin(t * 2.2);
        if (a.B.handR) { a.B.handR.rotation.x += 0.22 + 0.08 * w; a.B.handR.rotation.z += 0.12 * Math.sin(t * 1.7 + 1); a.B.handR.updateWorldMatrix(false, true); }
        fingers(a, 'R', 0.35 + 0.12 * Math.sin(t * 2.6), { spread: 0.25 + 0.1 * w });
        fingers(a, 'L', 0.25, { spread: 0.18 });
      }
    }
    for (const [s, ph] of [['L', 0], ['R', 1.6]]) {
      // R31S3: no chest clasp. Palms rest on the thighs, hands apart; right hand lifts in a small open-palm gesture on b038 and in the sceptical beat;
      // b040 fidget: the right hand rubs the left forearm while the left is presented forward, all well away from the chest.
      const sg = s === 'L' ? 1 : -1;
      const gest = s === 'R' ? Math.max(search * (0.6 + 0.4 * Math.sin(t * 1.9)) * 0.8, sceptical * 0.6 * (0.5 + 0.5 * Math.sin(t * 0.8))) : 0;
      const base = lapHand(mo, s, t, 3, km).addScaledVector(dirW(mo, sg, 0, 0), 0.045 * km);
      let p = base.clone();
      if (s === 'R') {
        const gp = base.clone().add(V(0, 0.13 * km, 0)).addScaledVector(dirW(mo, 0, 0, 1), 0.1 * km).addScaledVector(dirW(mo, sg, 0, 0), 0.04 * km);
        p.lerp(gp, Math.min(1, gest));
        if (fidget > 0.01) {
          const fa0 = at(mo, 'foreArmL'), ha0 = at(mo, 'handL'), rub = 0.62 + 0.3 * Math.sin(t * 3.6);
          const rp = fa0.clone().lerp(ha0, rub).addScaledVector(dirW(mo, 0, 0, 1), 0.08 * km).addScaledVector(dirW(mo, sg, 0, 0), -0.0 * km).add(V(0, 0.03 * km, 0));
          p.lerp(rp, Math.min(0.85, fidget * 1.2));
        }
      } else {
        p.addScaledVector(dirW(mo, 0, 0, 1), 0.11 * km * fidget).addScaledVector(dirW(mo, sg, 0, 0), 0.03 * km * fidget).add(V(0, 0.05 * km * fidget, 0));
      }
      const act2 = Math.max(gest, fidget);
      palm(mo, s, p, { grip: 0.025, pole: [sg * (1.15 - 0.3 * act2), -0.05 + 0.2 * act2, -0.5 + 0.3 * act2], gap: 0.16 });
      if (s === 'R' && act2 > 0.1) fingers(mo, s, 0.2 + 0.5 * Math.abs(Math.sin(t * (fidget > 0.1 ? 7.6 : 2.2) + ph)), { spread: 0.4 * Math.sin(t * 5.2 + ph) + 0.3 });
    }

    const eye = at(mo, 'head').clone().add(V(0, 0.03 * km, 0));
    if (sceptical < 0.5) {
      // Gaze built in SCREEN space from the scene camera (no actor-axis sign guessing): toward the lens, then camR/camU.
      const cam = S3.cam, camR = V(1, 0, 0).applyQuaternion(cam.quaternion), camU = V(0, 1, 0).applyQuaternion(cam.quaternion);
      const toCam = cam.position.clone().sub(eye).normalize();
      const scr = (r, u, d = 0.5) => eye.clone().addScaledVector(toCam, d).addScaledVector(camR, r).addScaledVector(camU, u);
      const upLeft = scr(-0.4 * km, 0.2 * km);                // searching: up and to screen-LEFT, away from the mother
      const lowered = scr(0.03 * km, -0.26 * km, 0.4);        // eyes dropped to the floor in front of him
      const parents = at(fa, 'head').lerp(at(zo, 'head'), 0.45).add(V(0, 0.42 * km, 0));
      const level = eye.clone().addScaledVector(dirW(mo, 0, 0, 1), 0.6);
      // R31F: end of the whisper the eyes go clearly UP (toward the end of the line); in b039 he looks at his father instead of the lens.
      const upEnd = scr(-0.05 * km, 0.42 * km, 0.5), toFa = at(fa, 'head').clone().add(V(0, 0.05 * km, 0));
      const askLook = sm(B(1)[0] - 0.1, B(1)[0] + 0.1, t) * (1 - sm(B(1)[1] - 0.05, B(1)[1] + 0.2, t));
      const fatherLook = Math.max(lean * (1 - sm(B(2)[0] - 0.1, B(2)[0] + 0.1, t)), askLook);
      const aim = upLeft.lerp(lowered, down).lerp(toFa, fatherLook).lerp(parents.lerp(upEnd, 0.7), rise * (1 - down)).lerp(level, Math.max(laugh, residue * 0.8));
      look(mo, aim, 0.9, { max: 0.22 + 0.1 * search * (1 - down) + 0.2 * rise + 0.6 * askLook });
    } else {
      // Eyes only: a small yaw, pitch and roll pinned so the head stays level and the lids do the scepticism.
      const yaw = (0.5 - side) * 0.6;
      mo.B.neck.rotation.set(-0.05, 0, 0);
      mo.B.head.rotation.set(-0.12 + 0.03 * Math.sin(t * 0.7), yaw * 0.15, 0.07 * Math.sin(t * 0.55 + 1));
      mo.B.chest.rotation.z = 0; mo.B.spine.rotation.z = 0;
      mo.B.head.updateWorldMatrix(false, true);
    }
    const boy = at(mo, 'head');
    const faUp = at(fa, 'head').add(V(0, 0.03 * kf, 0)).add(V(0, 0.02 * kf, 0)).addScaledVector(dirW(fa, 0, 0, 1), 0.3);
    const zoUp = at(zo, 'head').add(V(0, 0.03 * kz, 0)).add(V(0, 0.03 * kz, 0)).addScaledVector(dirW(zo, 0, 0, 1), 0.28);
    look(fa, boy.clone().lerp(faUp, laugh), 0.85, { max: 0.4 });
    const camP = S3.cam.position, zoCam = at(zo, 'head').clone().add(camP.clone().sub(at(zo, 'head')).normalize().multiplyScalar(0.5)).add(V(0, 0.04 * kz, 0));
    look(zo, boy.clone().lerp(zoUp, laugh).lerp(zoCam, 0.6 * laugh), 0.9, { max: 0.75 });
    fa.B.head.rotation.z += 0.16 * lean + 0.08 * listen * (1 - lean);
    fa.B.head.rotation.x -= 0.04 * laugh;
    zo.B.head.rotation.z += 0.12 * Math.sin(t * 0.85 + 0.6) * listen + 0.08 * laugh;
    zo.B.head.rotation.x -= 0.04 * laugh;
    fa.B.neck.rotation.x -= 0.015 * laugh;
    fa.B.head.rotation.z += 0.1 * laugh * (1 - 2 * PHV);
    zo.B.head.rotation.z += 0.1 * laugh * (2 * PHV - 1);
    zo.B.neck.rotation.x -= 0.02 * laugh;

    // R31S: idle life over b038 and the question: boy's head glances, mother tilts toward the speaker and looks between boy and father, father nods.
    const spk = Math.max(sm(0.3, 0.9, t) * (1 - sm(B(1)[0] - 0.2, B(1)[0], t)), 0);
    mo.B.head.rotation.y += 0.07 * Math.sin(t * 1.1 + 0.3) * search; mo.B.head.rotation.x += 0.05 * Math.sin(t * 1.7) * search;
    mo.B.head.rotation.z += 0.04 * Math.sin(t * 0.9 + 2) * (1 - laugh) * (1 - sceptical);
    zo.B.head.rotation.z += 0.2 * spk * (1 - laugh); zo.B.head.rotation.y += 0.12 * Math.sin(t * 0.9 + 1) * spk * (1 - laugh);
    zo.B.head.rotation.x += 0.14 * askLookW(t) * (1 - laugh);
    fa.B.head.rotation.x += 0.04 * Math.sin(t * 1.9 + 0.5) * spk;
    zo.B.chest.rotation.z += 0.08 * askLookW(t);
    if (mo.B.upperArmR && search > 0.2) { mo.B.upperArmR.rotation.x += 0.04 * Math.sin(t * 1.5) * search; mo.B.upperArmR.updateWorldMatrix(false, true); }
    // R31S2: x3 bigger, clearly visible in stills: head turns ~15-20 deg, shoulder shifts.
    fa.B.head.rotation.y += 0.22 * Math.sin(t * 0.63 + 0.4) * (1 - laugh); zo.B.head.rotation.y += 0.42 * Math.sin(t * 0.9) * (1 - laugh) * (1 - 0.6 * sceptical);
    { const g = (c, w) => Math.exp(-(((t - c) / w) ** 2)); const fl = 0.2 * g(1.8, 0.7) - 0.13 * g(5.0, 0.8); fa.B.spine.rotation.x += fl; fa.B.chest.rotation.x += fl * 0.6; fa.B.head.rotation.x += fl * 0.5; zo.B.spine.rotation.x += 0.08 * g(5.0, 0.8); }
    fa.B.spine.rotation.z += 0.06 * Math.sin(t * 0.5 + 2) * (1 - laugh); zo.B.spine.rotation.z += 0.06 * Math.sin(t * 0.45 + 1) * (1 - laugh);
    for (const a of [fa, zo]) { if (a.B.LeftShoulder) a.B.LeftShoulder.rotation.z += 0.07 * Math.sin(t * 0.8 + 1) * (1 - laugh); if (a.B.RightShoulder) a.B.RightShoulder.rotation.z -= 0.07 * Math.sin(t * 0.7) * (1 - laugh); }
    const row = name => st.faces.find(r => r[1] === name);
    const said = mouth(S, 'mohammed', t);
    const asked = mouth(S, 'father', t);
    row('mohammed')[3] = () => ({
      open: Math.max(search * (0.9 + 0.1 * Math.abs(Math.sin(t * 6.4))), search * said, whisper * (0.65 + 0.3 * Math.abs(Math.sin(t * 12.2))), whisper * said),
      lid: sceptical * 0.55 + down * 0.5,
    });
    row('father')[3] = () => ({
      open: Math.max(sm(B(1)[0] - 0.05, B(1)[0] + 0.1, t) * (1 - sm(B(1)[1] - 0.05, B(1)[1] + 0.15, t)) * (0.4 + 0.3 * Math.abs(Math.sin(t * 13))), 0.4 * lean, lean * (0.45 + 0.3 * Math.abs(Math.sin(t * 15.5))), lean * asked, asked * 0.85) + laugh * (0.85 + 0.15 * Math.abs(Math.sin(t * 9.2))) + residue * 0.3,
      lid: 0.04 * lean + 0.32 * laugh,
    });
    row('zoubida')[3] = () => ({
      open: laugh * (0.92 + 0.08 * Math.abs(Math.sin(t * 8.4 + 1.2))) + residue * 0.3 + listen * 0.1 * (1 - laugh),
      lid: 0.08 * listen + 0.3 * laugh,
    });
  },
});

let ZO = null, PHV = 0;
const askLookW = t => sm(B(1)[0] - 0.3, B(1)[0] - 0.05, t) * (1 - sm(B(1)[1] - 0.05, B(1)[1] + 0.3, t));
const PH = () => PHV;
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
  const lift = a === ZO ? 0.035 : 0.04;   // r30G: hands rest on the thighs (front hem flap now collapsed)
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
  // Laughing hands never fold across the chest: right slaps the thigh, left rests on the knee/belly, and the roles swap
  // half-way through the laugh so the two beats read differently.
  const swap = PH();
  const belly = lap.clone().add(V(0, (0.06 + 0.03 * Math.max(0, -bob)) * k, 0)).addScaledVector(dirW(a, 0, 0, 1), 0.05 * k).addScaledVector(dirW(a, sign, 0, 0), 0.07 * k);
  const slapL = lap.clone().add(V(0, (0.05 + 0.07 * Math.max(0, -bob)) * k, 0));
  const lo0 = s === 'R' ? lap.lerp(slap, Math.min(1, up)) : lap.lerp(swap > 0.5 ? slapL : belly, Math.min(1, up) * 0.5);
  const lo = (a === ZO && s === 'L') ? lo0.lerp(high.clone().add(V(0, 0.06 * k, 0)), Math.min(1, up) * 0.5 * (1 - swap)) : lo0;
  if (s === 'R' && swap > 0.5) return lap.lerp(belly.clone().addScaledVector(dirW(a, -sign, 0, 0), -0.14 * k), Math.min(1, up));
  return lo;
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
    b038: { shot: 'ch', size: 'M', on: 'mohammed', z: 1.04, dx: -110, dy: 100 },
    // Father-son two-shot: far enough right to drop the empty door, tight enough that the mother's skirt stays outside.
    b039: { shot: 'ch', size: 'M', on: 'father', z: 1.17, dx: 230, dy: 95 },
    b040: { shot: 'ch', size: 'M', on: 'mohammed', z: 1.02, dx: -100, dy: 110 },
    b041: { shot: 'ch', size: 'M', on: 'mohammed', z: 1.04, dx: -100, dy: 110 },
    b042: { shot: 'ch', size: 'M', on: 'mohammed', z: 0.97, dx: -20, dy: 180 },
    b043: { shot: 'ch', size: 'M', on: 'mohammed', z: 1.04, dx: -90, dy: 100 },
  },
});
