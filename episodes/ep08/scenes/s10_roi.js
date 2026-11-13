// s10 "Au roi". esc (escalier): Mohammed crouched on tread 3 (pelvis on the tread, feet on the tread
// below, robe hemmed so the knees stay inside the cloth). Zoubida stands on tread 1 and looks up at him
// (b054–b058), both hands on her hips from "À quoi tu joues ?" through "accroupi sur une marche".
// pa (patio_matin): the neighbours by the well laugh (b059), Rahma teases (b060), the narrator's scorn
// (b061, back on the stairs), b062 Zoubida's quiet smile, b063 Rahma complains with palms up from the
// first word, b064 Zoubida answers with a raised hand, b065 the three women together.
import * as PO from '../../../engine/poses.js';
import { staged, yawToward, handTo } from '../lib/fix8b.js';
import { ESCALIER } from '../lib/stairs.js';
import { SEAT } from './s09_escalier.js';
import { castScale, pinKnees } from '../lib/fix8c.js';
import { sitStepDrop as sitStep } from '../lib/fix8_R15C.js';
import { akimbo } from '../lib/fix8_R16F.js';
import { beatScene, lines, sm, front, V } from '../lib/beatscene.js';

const ID = 's10_roi', L = lines(ID);
const B = i => L[i] || [0, 0];
const win = (i, a, b, t) => { const [t0, t1] = B(i), D = t1 - t0; return sm(t0 + a * D, t0 + a * D + .5, t) * (1 - sm(t0 + b * D, t0 + b * D + .5, t)); };
const hold = (t0, t1, t) => sm(t0, t0 + .35, t) * (1 - sm(t1 - .05, t1 + .2, t));
const laugh = (a, w, t, f = 13) => { if (w > 0) { a.B.chest.rotation.x += .06 * Math.sin(t * f) * w; a.B.spine.rotation.x += .04 * w; a.B.neck.rotation.x -= .1 * w; a.B.chest.updateWorldMatrix(false, true); } };
const onKnees = a => { if (!a.pins) return; for (const [s, p] of a.pins) PO.reach(a, s, a.B.root.localToWorld(p.clone()), { grip: .03, pole: s === 'L' ? [.5, .04, -.28] : [-.5, .04, -.28] }); };
const hipsOn = (a, w) => {
  akimbo(a);
  a.B.spine.rotation.z += .03 * w;
};

// Turn the body to a 3/4-front view of the camera (chest normal `want` rad off the camera axis), whatever the head does.
const open34 = (a, cam, want = .6) => {
  if (!cam) return;
  a.group.updateMatrixWorld(true);
  const c0 = a.B.chest.getWorldPosition(V(0, 0, 0)), f = a.B.chest.localToWorld(V(0, 0, 1)).sub(c0); f.y = 0;
  const to = cam.position.clone().sub(c0); to.y = 0;
  if (f.lengthSq() < 1e-8 || to.lengthSq() < 1e-8) return;
  const d = Math.atan2(to.x, to.z) - Math.atan2(f.x, f.z), turn = Math.atan2(Math.sin(d), Math.cos(d));
  if (Math.abs(turn) > want) { a.group.rotation.y += turn - Math.sign(turn) * want; a.group.updateMatrixWorld(true); }
};
// Conversational arms: one hand low and loose, the other gesturing (palm half up) in time with the speech.
const chat = (a, w, t, seed = 0) => {
  if (w <= 0) return;
  const s1 = Math.sin(t * 2.3 + seed), s2 = Math.sin(t * 1.7 + seed * 2);
  handTo(a, 'R', { fwd: .2 + .05 * s1, out: .12, drop: .12 + .06 * s2, curl: .15, spread: .25 });
  PO.palmTo(a, 'R', .7 * w, V(0, 1, .3));
  handTo(a, 'L', { fwd: .06, out: .15, drop: .27, curl: .3, spread: .12 });
  a.B.spine.rotation.z += .03 * s2 * w; a.B.head.rotation.z += .03 * s1 * w;
};
const esc = staged('escalier', {
  mohammed: { ...SEAT, o: { ...SEAT.o, crouch: true, lean: .42, fz: .1 }, talk: 0, lookMax: .75,
    look: (t, st) => {
      if (t >= B(7)[0]) return front(st.A.mohammed, 'head', .5, .48, -.04);
      if (t < B(5)[0] && st.A.zoubida.group.visible) {
        const p = st.A.zoubida.B.head.getWorldPosition(V(0, 0, 0));
        return p.add(V(0, .22 * win(3, 0, 1, t), 0));
      }
      return null;
    } },
  zoubida: { tread: 0, off: -.7, face: 'cam', seed: 7, lookMax: .42,
    look: (t, st) => { if (!st.A.zoubida.group.visible) return null; const p = st.A.mohammed.B.head.getWorldPosition(V(0, 0, 0)); return p.add(V(0, .2, 0)); } },
}, {
  stairs: ESCALIER,
  light: { shadow: .07, soft: 14, dir: [.4, 7, .6] },
  addressee: { zoubida: 'mohammed', mohammed: 'zoubida' },
  act(lt, t, S, st, S3) {
    const { zoubida: zo, mohammed: mo } = st.A;
    yawToward(zo, S3.cam, .3);
    open34(zo, S3.cam, .55);
    castScale(mo);
    sitStep(mo, SEAT.o.seat - .045, SEAT.o.floor, .5);
    zo.group.visible = t < B(5)[0];
    const proud = win(3, 0, 1, t);
    if (proud > 0) { mo.B.chest.rotation.x -= .1 * proud; mo.B.spine.rotation.x -= .04 * proud;
      mo.B.head.rotation.x -= .08 * proud; mo.B.chest.rotation.y += .1 * proud;
      PO.reach(mo, 'R', mo.B.upperArmR.getWorldPosition(V(0, 0, 0)).add(V(.2 * mo.group.scale.y / 1.6 * proud, .05, .22 * mo.group.scale.y / 1.6)), { grip: .02, pole: [.5, .3, -.3] }); PO.fingers(mo, 'R', .3); mo.B.chest.updateWorldMatrix(false, true); }
    const hips = sm(B(2)[0] - .05, B(2)[0] + .28, t) * (1 - sm(B(4)[1] + .1, B(4)[1] + .3, t));
    // The first questions are open-handed chat (arms away from the hips); the scolding keeps one hand on the hip, the other still talking.
    const scold = zo.group.visible ? hips : 0;
    // Before "À quoi tu joues ?": both hands low and loose, away from her face. From there on to the end of her speech: both hands on the hips.
    if (zo.group.visible) {
      if (t >= B(2)[0] - .05) {
        // R24A: R hand rests on top of the hip (outside the sash); L hand gestures toward the stairs, phrased per beat, settling back on the hip between.
        const g = Math.max(win(2, .1, .85, t), win(3, .05, .9, t), win(4, 0, .6, t) * .7) * (1 - .25 * Math.sin(t * 1.9) ** 2);
        const sv = Math.sin(t * 2.1);
        handTo(zo, 'R', { fwd: -.02, out: .26, drop: .31, curl: .4, spread: .1 });
        handTo(zo, 'L', { fwd: -.02 + g * .02 * sv, out: .26 + g * .2, drop: .31 + g * (.02 - .02 * sv), curl: .35 - .2 * g, spread: .1 + .15 * g });
        if (g > .05) PO.palmTo(zo, 'L', .6 * g, V(.5, .7, .1));
        zo.B.spine.rotation.z += .03; zo.B.chest.rotation.z += .02 * g; zo.B.head.rotation.z += .03 * sv * g;
      }
      else for (const sd of ['L', 'R']) handTo(zo, sd, { fwd: .03, out: .15, drop: .31, curl: .3, spread: .1 });
    }
    laugh(zo, win(4, .35, 1.05, t), t);
    if (!st.scornFace) {
      st.scornFace = true;
      const row = st.faces?.find(f => f[0] === mo);
      if (row) {
        const prev = row[3];
        row[3] = (lt2, t2) => {
          const base = typeof prev === 'function' ? prev(lt2, t2) : { ...prev };
          const w = win(7, .05, 1, t2);
          return { ...base, sad: .85 * w, lid: Math.max(base.lid || 0, .38 * w) };
        };
      }
    }
    // Unmistakable crouch: pelvis on the tread, torso hunched forward over the knees, forearms resting on them.
    const hunch = sm(0, .5, t) * (1 - sm(B(7)[0] - .1, B(7)[0] + .4, t));
    mo.B.spine.rotation.x += .2 * hunch; mo.B.chest.rotation.x += .22 * hunch; mo.B.neck.rotation.x -= .12 * hunch;
    mo.B.spine.updateWorldMatrix(false, true);
    pinKnees(mo, 0);
    onKnees(mo);
  },
});

const pa = staged('patio_matin', {
  zoubida: { at: [680, 1005], face: 'rahma', seed: 7, look: 'rahma', lookMax: .85, talk: 0 },
  rahma: { at: [1100, 990], face: 'zoubida', seed: 9, look: 'zoubida', lookMax: .8, talk: 0 },
  woman1: { at: [1340, 1005], face: 'zoubida', pose: 'kneel', seed: 11 },
  fatma: { at: [890, 955], face: 'zoubida', seed: 17, talk: 0, lookMax: .75,
    look: t => t >= B(9)[0] ? 'rahma' : 'zoubida' },
  woman2: { at: [1520, 1010], face: 'rahma', pose: 'kneel', hands: false, seed: 13 },
}, {
  addressee: { rahma: 'zoubida', zoubida: 'rahma', femmes: 'zoubida' },
  act(lt, t, S, st, S3) {
    const { zoubida: zo, rahma: ra, fatma: fa, woman1: w1, woman2: w2 } = st.A;
    // Dream beats b062-b064 are Rahma and Zoubida alone; b065 is the three women. Others stay hidden so no laughing group leaks in.
    const dream = t >= B(8)[0] && t < B(11)[0], trio = t >= B(11)[0];
    fa.group.visible = zo.group.visible = ra.group.visible = true;
    yawToward(zo, S3.cam, .45);
    for (const a of [w1, w2]) a.group.visible = true;
    open34(zo, S3.cam, .5); open34(ra, S3.cam, .75);
    const fun = hold(B(5)[0] - .1, B(5)[1], t);
    // Staggered, visible laughter: chest shakes, head tipped back, one hand to the mouth or chest, each woman on her own delay.
    for (const [a, f, d, side, mouth] of [[w1, 12, .0, 'R', 1], [w2, 15, .35, 'L', 0], [ra, 11, .15, 'R', 1], [fa, 14, .5, 'L', 0], [zo, 10, .7, 'R', 0]]) {
      const hw = sm(B(5)[0] - .15 + d * .4, B(5)[0] - .02 + d * .4, t) * (1 - sm(B(5)[1] - .05, B(5)[1] + .2, t));
      const w = hw;
      laugh(a, w, t, f);
      if (w > 0) {
        const sh = Math.sin(t * f + d * 7);
        a.B.spine.rotation.x += .03 * sh * w; a.B.chest.rotation.z += .05 * sh * w;
        a.B.neck.rotation.x -= .2 * w; a.B.head.rotation.x -= .22 * w; a.B.spine.rotation.x -= .06 * w; a.B.chest.rotation.x += .1 * sh * w; a.B.head.rotation.z += .12 * (side === 'R' ? 1 : -1) * w;
        a.B.chest.updateWorldMatrix(false, true);
        handTo(a, side, mouth ? { fwd: .2, out: -.02, drop: -.1, curl: .3, spread: .1 } : { fwd: .14, out: .0, drop: .08, curl: .25, spread: .1 });
        if (a !== w1 && a !== w2) handTo(a, side === 'R' ? 'L' : 'R', { fwd: .14, out: .05, drop: .12, curl: .25, spread: .1 });
      }
    }
    for (const [a, ph] of [[w1, 0], [w2, 2]]) { if (fun > .5) continue; const q = Math.sin(t * 1.3 + ph); a.B.chest.rotation.z += .03 * q; a.B.head.rotation.z += .04 * Math.sin(t * .9 + ph); a.B.neck.rotation.x += .03 * (1 + q); a.B.chest.updateWorldMatrix(false, true); if (a === w1) handTo(a, 'R', { fwd: .2, out: -.02, drop: -.05 + .04 * q, curl: .3, spread: .1 }); }
    const tease = hold(B(6)[0] - .15, B(6)[1], t);
    if (tease > 0) {
      laugh(ra, tease * .6, t, 9);
      ra.B.spine.rotation.z += .1 * tease; ra.B.chest.rotation.y += .08 * tease; ra.B.spine.updateWorldMatrix(false, true);
      handTo(ra, 'L', { fwd: .08, out: .2, drop: .1, curl: .2, spread: .3 });
      handTo(ra, 'R', { fwd: .24, out: .16, drop: -.16, curl: .1, spread: .35 });
      ra.B.head.rotation.z += .12 * tease;
    }
    const envy = win(8, 0, 1, t);
    if (envy > 0) {
      for (const side of ['L', 'R']) handTo(zo, side, { fwd: .03, out: .13, drop: .31, curl: .3, spread: .1 });
      zo.B.chest.rotation.x -= .04 * envy; zo.B.head.rotation.z += .05 * envy;
      ra.B.spine.rotation.z += .08 * envy; ra.B.chest.rotation.y += .06 * envy;
      fa.B.spine.rotation.x += .06 * envy; fa.B.chest.rotation.y -= .05 * envy;
      handTo(fa, 'R', { fwd: .12, out: .14, drop: .08, curl: .2 });
    }
    const palms = sm(B(9)[0] - 1.0, B(9)[0] - .5, t) * (1 - sm(B(9)[1] - .1, B(9)[1], t));
    const hand = sm(B(10)[0] - .05, B(10)[0] + .28, t) * (1 - sm(B(10)[1] - .1, B(10)[1], t));
    if (hand > 0) {
      zo.B.spine.rotation.x += .05 * hand;
      handTo(zo, 'R', { fwd: .4, out: .3, drop: .1, curl: .1, spread: .3 });
      const toR = ra.group.position.clone().sub(zo.group.position); toR.y = 0; toR.normalize(); toR.y = .15;
      PO.palmTo(zo, 'R', hand, toR);
      handTo(zo, 'L', { fwd: .02, out: .13, drop: .3, curl: .3, spread: .1 });
      fa.B.chest.rotation.y -= .06 * hand;
    }
    const amen = sm(B(11)[0] - .15, B(11)[0] + .4, t);
    if (amen > 0) {
      let k = 0;
      for (const a of [zo, ra, fa]) {
        const w = sm(B(11)[0] + .1 * k, B(11)[0] + .1 * k + .5, t); k++;
        a.B.spine.rotation.x += .05 * w; a.B.neck.rotation.x += .14 * w;
        handTo(a, 'R', { fwd: .26, out: .12, drop: -.02, curl: .1, spread: .3 });
        handTo(a, 'L', { fwd: .26, out: .12, drop: -.02, curl: .1, spread: .3 });
        PO.palmTo(a, 'R', w, V(0, 1, .15)); PO.palmTo(a, 'L', w, V(0, 1, .15));
        a.B.head.rotation.z += .05 * w * (k % 2 ? 1 : -1);
      }
      for (const a of [w1, w2]) { a.B.neck.rotation.x += .16 * amen; a.B.neck.updateWorldMatrix(false, true); }
    }
    // Listening stance whenever a beat has not taken her hands: weight on one hip, gaze in the group.
    if (fun < .2 && tease <= 0 && envy <= 0 && amen <= 0 && hand <= 0 && palms <= 0) {
      const sw = Math.sin(t * .7);
      // Rahma: hands loosely clasped in front, weight shifting. Zoubida: one hand on the hip, the other low and loose.
      handTo(ra, 'L', { fwd: .24, out: -.08, drop: .24, curl: .4, spread: .05 }); handTo(ra, 'R', { fwd: .26, out: -.06, drop: .22, curl: .4, spread: .05 });
      ra.B.spine.rotation.z += .04 * sw; ra.B.chest.rotation.z -= .02 * sw; ra.B.head.rotation.z += .03 * sw;
      handTo(zo, 'R', { fwd: -.02, out: .26, drop: .31, curl: .4, spread: .1 }); handTo(zo, 'L', { fwd: .1, out: .12, drop: .22, curl: .3, spread: .12 });
      zo.B.spine.rotation.z -= .04 * sw; zo.B.head.rotation.z += .03 * sw;
      for (const a of [ra, zo]) a.B.spine.updateWorldMatrix(false, true);
    }
    if (fun < .2 && tease <= 0 && envy <= 0 && amen <= 0) {
      fa.B.spine.rotation.z += .05 * Math.sin(t * .8);
      handTo(fa, 'L', { fwd: -.02, out: .27, drop: .31, curl: .4 });
      fa.B.chest.rotation.z += .04; fa.B.head.rotation.z -= .04;
      handTo(fa, 'R', { fwd: .1, out: .14, drop: .16, curl: .25 });
    }
    if (palms > 0) {
      ra.B.spine.rotation.x += .08 * palms; ra.B.chest.rotation.z += .04 * Math.sin(t * 2.6) * palms;
      for (const s of ['L', 'R']) {
        for (let r = 0; r < 2; r++) handTo(ra, s, { fwd: .32, out: .3, drop: .1, curl: .05, spread: .4 });
        PO.palmTo(ra, s, palms, V(0, 1, .05));
      }
    }
  },
});

export default beatScene(ID, {
  shots: { esc, pa },
  plan: {
    b054: { shot: 'esc', size: 'W', on: 'zoubida' },
    b055: { shot: 'esc', size: 'M', on: 'mohammed', z: 1.1, dy: 40 },
    b056: { shot: 'esc', size: 'M', on: 'mohammed', z: .95, dx: -70, dy: 10 },
    b057: { shot: 'esc', size: 'M', on: 'mohammed', z: 1.1, dy: 40 },
    b058: { shot: 'esc', size: 'M', on: 'mohammed', z: .95, dx: -70, dy: 10 },
    b059: { shot: 'pa', size: 'M', on: 'rahma', z: 1.5, dy: 50 },
    b060: { shot: 'pa', size: 'M', on: 'rahma', z: 1.8, dx: -90, dy: 75 },
    b061: { shot: 'esc', size: 'CU', on: 'mohammed', z: 1.2, dy: 70 },
    b062: { shot: 'pa', size: 'M', on: 'zoubida', z: 1.9, dy: 60 },
    b063: { shot: 'pa', size: 'M', on: 'rahma', z: 1.5, dy: 60 },
    b064: { shot: 'pa', size: 'M', on: 'fatma', z: 1.9, dy: 40 },
    b065: { shot: 'pa', size: 'M', on: 'fatma', z: .85, dy: 40 },
  },
});
