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
import { castScale, sitStep, pinKnees } from '../lib/fix8c.js';
import { beatScene, lines, sm, front, V } from '../lib/beatscene.js';

const ID = 's10_roi', L = lines(ID);
const B = i => L[i] || [0, 0];
const win = (i, a, b, t) => { const [t0, t1] = B(i), D = t1 - t0; return sm(t0 + a * D, t0 + a * D + .5, t) * (1 - sm(t0 + b * D, t0 + b * D + .5, t)); };
const hold = (t0, t1, t) => sm(t0, t0 + .35, t) * (1 - sm(t1 - .05, t1 + .2, t));
const laugh = (a, w, t, f = 13) => { if (w > 0) { a.B.chest.rotation.x += .06 * Math.sin(t * f) * w; a.B.spine.rotation.x += .04 * w; a.B.neck.rotation.x -= .1 * w; a.B.chest.updateWorldMatrix(false, true); } };
const onKnees = a => { if (!a.pins) return; for (const [s, p] of a.pins) PO.reach(a, s, a.B.root.localToWorld(p.clone()), { grip: .03, pole: s === 'L' ? [.5, .04, -.28] : [-.5, .04, -.28] }); };
const hipsOn = (a, w) => {
  for (const s of ['L', 'R']) handTo(a, s, { fwd: -.02, out: .1, drop: .38, curl: .4 });
  a.B.spine.rotation.z += .03 * w;
};

const esc = staged('escalier', {
  mohammed: { ...SEAT, o: { ...SEAT.o, crouch: true }, talk: 0, lookMax: .75,
    look: (t, st) => {
      if (t >= B(7)[0]) return front(st.A.mohammed, 'head', .5, .48, -.04);
      if (t < B(5)[0] && st.A.zoubida.group.visible) {
        const p = st.A.zoubida.B.head.getWorldPosition(V(0, 0, 0));
        return p.add(V(0, .22 * win(3, 0, 1, t), 0));
      }
      return null;
    } },
  zoubida: { tread: 1, off: .28, face: 'down', seed: 7, look: 'mohammed', lookMax: .7 },
}, {
  stairs: ESCALIER,
  light: { shadow: .07, soft: 14, dir: [.4, 7, .6] },
  addressee: { zoubida: 'mohammed', mohammed: 'zoubida' },
  act(lt, t, S, st, S3) {
    const { zoubida: zo, mohammed: mo } = st.A;
    yawToward(zo, S3.cam, .55);
    castScale(mo);
    sitStep(mo, SEAT.o.seat - .045, SEAT.o.floor);
    zo.group.visible = t < B(5)[0];
    const proud = win(3, 0, 1, t);
    if (proud > 0) { mo.B.chest.rotation.x -= .1 * proud; mo.B.spine.rotation.x -= .04 * proud; mo.B.chest.updateWorldMatrix(false, true); }
    const hips = sm(B(2)[0] - .05, B(2)[0] + .28, t) * (1 - sm(B(4)[1] - .1, B(4)[1], t));
    if (hips > 0 && zo.group.visible) hipsOn(zo, hips);
    laugh(zo, win(4, .35, 1.05, t), t);
    if (!st.scornFace) {
      st.scornFace = true;
      const row = st.faces?.find(f => f[0] === mo);
      if (row) {
        const prev = row[3];
        row[3] = (lt2, t2) => {
          const base = typeof prev === 'function' ? prev(lt2, t2) : { ...prev };
          const w = win(7, .05, 1, t2);
          return { ...base, sad: .85 * w, lid: Math.max(base.lid || 0, .06 * w) };
        };
      }
    }
    pinKnees(mo, 0);
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
  act(lt, t, S, st) {
    const { zoubida: zo, rahma: ra, fatma: fa, woman1: w1, woman2: w2 } = st.A;
    const fun = hold(B(5)[0] - .1, B(5)[1], t);
    for (const [a, f] of [[w1, 12], [w2, 15], [ra, 11], [fa, 14], [zo, 10]]) laugh(a, fun, t, f);
    if (fun > .2) {
      handTo(ra, 'R', { fwd: .14, out: .14, drop: .02, curl: .12, spread: .25 });
      handTo(fa, 'L', { fwd: .12, out: .14, drop: .02, curl: .12, spread: .2 });
    }
    const tease = hold(B(6)[0] - .15, B(6)[1], t);
    if (tease > 0) {
      laugh(ra, tease * .6, t, 9);
      ra.B.spine.rotation.z += .1 * tease; ra.B.chest.rotation.y += .08 * tease; ra.B.spine.updateWorldMatrix(false, true);
      handTo(ra, 'L', { fwd: .05, out: .16, drop: .28, curl: .35 });
      handTo(ra, 'R', { fwd: .16, out: .14, drop: -.04, curl: .12, spread: .3 });
    }
    const envy = win(8, 0, 1, t);
    if (envy > 0) {
      for (const side of ['L', 'R']) handTo(zo, side, { fwd: .14, out: .12, drop: .04, curl: .12, spread: .15 });
      zo.B.chest.rotation.x -= .04 * envy; zo.B.head.rotation.z += .05 * envy;
      ra.B.spine.rotation.z += .08 * envy; ra.B.chest.rotation.y += .06 * envy;
      fa.B.spine.rotation.x += .06 * envy; fa.B.chest.rotation.y -= .05 * envy;
      handTo(fa, 'R', { fwd: .12, out: .14, drop: .08, curl: .2 });
    }
    const palms = sm(B(9)[0] - .4, B(9)[0] + .1, t) * (1 - sm(B(9)[1] - .1, B(9)[1], t));
    if (palms > 0) {
      ra.B.spine.rotation.x += .08 * palms; ra.B.chest.rotation.z += .04 * Math.sin(t * 2.6) * palms;
      for (const s of ['L', 'R']) {
        handTo(ra, s, { fwd: .18, out: .18, drop: .06, curl: .08, spread: .35 });
        PO.palmTo(ra, s, palms, V(0, 1, .15));
      }
    }
    const hand = sm(B(10)[0] - .05, B(10)[0] + .28, t) * (1 - sm(B(10)[1] - .1, B(10)[1], t));
    if (hand > 0) {
      zo.B.spine.rotation.x += .05 * hand;
      handTo(zo, 'R', { fwd: .16, out: .12, drop: -.08, curl: .1, spread: .25 });
      PO.palmTo(zo, 'R', hand, V(0, .3, 1));
      handTo(zo, 'L', { fwd: .06, out: .16, drop: .26, curl: .3 });
      fa.B.chest.rotation.y -= .06 * hand;
    }
    const amen = sm(B(11)[0] - .15, B(11)[0] + .4, t);
    if (amen > 0) {
      for (const a of [zo, ra, fa]) {
        a.B.spine.rotation.x += .04 * amen; a.B.neck.rotation.x += .1 * amen;
        for (const s of ['L', 'R']) {
          handTo(a, s, { fwd: .14, out: .14, drop: .02, curl: .12, spread: .2 });
          PO.palmTo(a, s, amen * .7, V(0, 1, .25));
        }
      }
      for (const a of [w1, w2]) { a.B.neck.rotation.x += .16 * amen; a.B.neck.updateWorldMatrix(false, true); }
    }
    // Listening stance whenever a beat has not taken her hands: weight on one hip, gaze in the group.
    if (fun < .2 && tease <= 0 && envy <= 0 && amen <= 0) {
      fa.B.spine.rotation.z += .05 * Math.sin(t * .8);
      handTo(fa, 'L', { fwd: .06, out: .16, drop: .22, curl: .3 });
      handTo(fa, 'R', { fwd: .1, out: .14, drop: .16, curl: .25 });
    }
  },
});

export default beatScene(ID, {
  shots: { esc, pa },
  plan: {
    b054: { shot: 'esc', size: 'W', on: 'zoubida' },
    b055: { shot: 'esc', size: 'M', on: 'mohammed', z: 1.22, dy: -48 },
    b056: { shot: 'esc', size: 'CU', on: 'zoubida', z: 2.05, dy: -32 },
    b057: { shot: 'esc', size: 'M', on: 'mohammed', z: 1.28, dy: -52 },
    b058: { shot: 'esc', size: 'M', on: 'zoubida', z: 1.28, dy: -40 },
    b059: { shot: 'pa', size: 'W', on: 'rahma' },
    b060: { shot: 'pa', size: 'CU', on: 'rahma', z: 2.25, dx: -120, dy: -42 },
    b061: { shot: 'esc', size: 'CU', on: 'mohammed', z: 2.15, dy: -36 },
    b062: { shot: 'pa', size: 'M', on: 'zoubida', z: 2.05, dx: -70, dy: -36 },
    b063: { shot: 'pa', size: 'CU', on: 'rahma', z: 2.3, dx: -130, dy: -46 },
    b064: { shot: 'pa', size: 'CU', on: 'zoubida', z: 2.15, dx: -90, dy: -34 },
    b065: { shot: 'pa', size: 'W', on: 'zoubida' },
  },
});
