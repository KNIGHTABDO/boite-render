// s11 "L'Aâsser". patio_matin, late-afternoon amber. b066 Mohammed lifts his face to the sky,
// b067 he looks at his mother and asks, b068 she stays by him and points down at the stains,
// b069 Fatma Bziouya leans out of the right-hand doorway with her little broom, b070 eager question,
// b071 Zoubida keeps her eyes on that doorway and nods, b072 Maâlem Abdeslem calls from the left
// street door, b073 "Passe": only then does he walk in.
import * as PO from '../../../engine/poses.js';
import { staged, littleBroom, holdBroom, handTo, yawToward } from '../lib/fix8b.js';
import { beatScene, lines, sm, at, V, yawTo, dirW } from '../lib/beatscene.js';

const ID = 's11_depart', L = lines(ID);
const B = i => L[i] || [0, 0];
const skyOf = a => at(a, 'head').add(V(.15, 3.2, .35));
const AMBER = { key: '#ffb870', keyI: 1.7, dir: [-1.2, 5.2, .8], fillI: .85, sky: '#d9b48a', shadow: .26, soft: 10 };
const WALK0 = () => B(7)[0] - .45;

const pa = staged('patio_matin', {
  mohammed: { at: [960, 1035], face: 'cam', yaw: -.2, seed: 3, talk: 0, lookMax: t => t >= B(6)[0] ? 1.15 : .5,
    look: (t, st) => t >= B(6)[0] ? 'father' : t < B(1)[0] - .15 ? skyOf(st.A.mohammed) : 'zoubida' },
  zoubida: { at: [1180, 1015], face: 'cam', yaw: .2, seed: 7, talk: 0,
    lookMax: t => t >= B(6)[0] ? 1.15 : t >= B(5)[0] && t < B(6)[0] ? .32 : t >= B(3)[0] && t < B(6)[0] ? .5 : .45,
    look: (t, st) => {
      if (t >= B(6)[0]) return 'father';
      if (t >= B(3)[0]) {
        const p = st.A.fatma.B.head.getWorldPosition(V(0, 0, 0));
        if (t >= B(5)[0] && t < B(5)[1]) p.y -= .18 * Math.max(0, Math.sin((t - B(5)[0]) * 6.5));
        return p;
      }
      return t < B(1)[0] - .1 ? skyOf(st.A.zoubida) : 'mohammed';
    } },
  // Right arcade doorway, facing left into the court — not the foreground bush.
  fatma: { at: [1500, 860], face: [1000, 980], seed: 11, talk: 0, lookMax: .85,
    look: t => t >= B(6)[0] + .4 ? 'father' : 'zoubida' },
  // Left street door. He is outside the court until "Passe", then walks in.
  father: { at: [300, 830], face: [860, 980], seed: 5, height: 1.76, talk: 0, lookMax: .7,
    look: 'zoubida',
    walk: { to: [680, 1005], t0: WALK0(), t1: B(7)[0] + 2.1 } },
}, {
  light: AMBER,
  addressee: { mohammed: 'zoubida', zoubida: 'mohammed', fatma: 'zoubida', father: 'zoubida' },
  act(lt, t, S, st, S3) {
    const { mohammed: mo, zoubida: zo, fatma: fa, father: paFa } = st.A;
    const broom = st.broom ||= S3.prop(littleBroom(), 0, 0, 0);
    const sky = 1 - sm(B(1)[0] - .55, B(1)[0] - .05, t);
    mo.B.spine.rotation.x -= .14 * sky; mo.B.chest.rotation.x -= .18 * sky;
    zo.B.spine.rotation.x -= .04 * sky; zo.B.chest.rotation.x -= .06 * sky;
    mo.B.chest.updateWorldMatrix(false, true); zo.B.chest.updateWorldMatrix(false, true);
    const ask = sm(B(1)[0] - .3, B(1)[0] + .15, t) * (1 - sm(B(1)[1], B(1)[1] + .2, t));
    if (ask > 0) {
      mo.B.spine.rotation.x += .14 * ask; mo.B.chest.rotation.x += .06 * ask;
      handTo(mo, 'R', { fwd: .14, out: .1, drop: -.02, curl: .08, spread: .3 });
      PO.palmTo(mo, 'R', ask, V(0, .35, 1));
    }
    const reply = sm(B(2)[0] - .1, B(2)[0] + .3, t) * (1 - sm(B(2)[0] + .85, B(2)[0] + 1.15, t));
    if (reply > 0) {
      zo.B.spine.rotation.x += .1 * reply;
      handTo(zo, 'L', { fwd: .14, out: .12, drop: .02, curl: .12, spread: .2 });
      PO.palmTo(zo, 'L', reply, V(0, .2, 1));
    }
    const point = sm(B(2)[0] + .7, B(2)[0] + 1.15, t) * (1 - sm(B(2)[1] - .15, B(2)[1], t));
    if (point > 0) {
      const hem = at(mo, 'root').add(V(0, .28, 0));
      const toward = at(zo, 'chest').sub(hem); toward.y = 0;
      if (toward.lengthSq() > 1e-6) toward.normalize(); else toward.set(1, 0, 0);
      const stain = hem.addScaledVector(toward, .2); stain.y = at(mo, 'root').y + .22;
      const sh = at(zo, 'upperArmR'), dir = stain.clone().sub(sh);
      const arm = sh.distanceTo(at(zo, 'foreArmR')) + at(zo, 'foreArmR').distanceTo(at(zo, 'handR'));
      if (dir.length() > arm * .72) dir.setLength(arm * .72);
      const target = sh.clone().add(dir); target.y = Math.min(target.y, at(zo, 'chest').y - .08);
      PO.reach(zo, 'R', target, { grip: .01, pole: [-.3, -.05, .15] });
      PO.fingers(zo, 'R', .75, { each: [.7, 0, 1, 1, 1] });
    }
    fa.group.visible = t >= B(3)[0];
    const lean = sm(B(3)[0], B(3)[0] + .55, t) * (1 - sm(B(7)[0], B(7)[0] + .45, t) * .65);
    fa.B.spine.rotation.x += .22 * lean; fa.B.chest.rotation.x += .08 * lean;
    fa.B.spine.updateWorldMatrix(false, true);
    const eager = sm(B(4)[0] - .12, B(4)[0] + .18, t) * (1 - sm(B(4)[1], B(4)[1] + .25, t));
    if (eager > 0) {
      fa.B.spine.rotation.x += .1 * eager; fa.B.chest.rotation.y += .06 * eager;
      handTo(fa, 'L', { fwd: .12, out: .12, drop: .02, curl: .12, spread: .2 });
      PO.palmTo(fa, 'L', eager, dirW(fa, 0, .2, 1));
    }
    if (t >= B(7)[0]) fa.group.position.addScaledVector(dirW(fa, 0, 0, -1), .22 * sm(B(7)[0], B(7)[0] + .5, t));
    const nod = sm(B(5)[0], B(5)[0] + .2, t) * (1 - sm(B(5)[1] - .2, B(5)[1], t));
    if (nod > 0) zo.B.chest.rotation.x += .05 * nod;
    const call = t >= B(6)[0] && t < WALK0();
    paFa.group.visible = t >= B(6)[0];
    if (call) {
      const w = sm(B(6)[0] - .1, B(6)[0] + .25, t);
      paFa.B.spine.rotation.x += .22 * w; paFa.B.chest.rotation.x += .06 * w;
      handTo(paFa, 'R', { fwd: .1, out: .08, drop: -.06, curl: .2 });
      handTo(paFa, 'L', { fwd: .06, out: .14, drop: .22, curl: .25 });
    }
    if (t >= B(6)[0] - .4) {
      const u = sm(B(6)[0] - .4, B(6)[0] - .05, t);
      for (const a of [zo, mo]) {
        const y = yawTo(a.group.position, paFa.group.position);
        a.group.rotation.y += Math.atan2(Math.sin(y - a.group.rotation.y), Math.cos(y - a.group.rotation.y)) * u;
        a.group.updateMatrixWorld(true);
      }
      if (t >= B(7)[0]) {
        const welcome = sm(B(7)[0], B(7)[0] + .35, t);
        handTo(zo, 'L', { fwd: .14, out: .12, drop: .02, curl: .12 });
        PO.palmTo(zo, 'L', welcome, V(0, .3, 1));
        mo.B.chest.rotation.y += .08 * welcome;
      }
    }
    // Base arms: soft, off the ribs, unless a gesture already placed that hand.
    const posed = new Set();
    const walking = t >= WALK0() && t < B(7)[0] + 2.1;
    if (ask > 0) posed.add('moR');
    if (reply > 0) posed.add('zoL');
    if (point > 0) posed.add('zoR');
    if (eager > 0) posed.add('faL');
    if (fa.group.visible) posed.add('faR');
    if (call) { posed.add('paR'); posed.add('paL'); }
    if (t >= B(7)[0]) posed.add('zoL');
    const restArm = (a, side, tag) => {
      if (posed.has(tag) || !a.group.visible) return;
      const sway = .01 * Math.sin(t * .7 + (side === 'L' ? 0 : 1.4));
      handTo(a, side, { fwd: .04, out: .1, drop: .2 + sway, curl: .22, spread: .12 });
    };
    restArm(mo, 'L', 'moL'); restArm(mo, 'R', 'moR');
    restArm(zo, 'L', 'zoL'); restArm(zo, 'R', 'zoR');
    if (fa.group.visible && eager <= 0) restArm(fa, 'L', 'faL');
    if (paFa.group.visible && !call && !walking) { restArm(paFa, 'L', 'paL'); restArm(paFa, 'R', 'paR'); }
    if (t < B(6)[0]) {
      yawToward(zo, S3.cam, t >= B(5)[0] ? .65 : t >= B(3)[0] ? .95 : .9);
      yawToward(mo, S3.cam, .85);
    }
    if (paFa.group.visible && !walking) yawToward(paFa, S3.cam, 1.2);
    if (fa.group.visible) yawToward(fa, S3.cam, 1.25);
    if (fa.group.visible) holdBroom(fa, broom, 'R'); else broom.visible = false;
    // Nod rides on top of the eyeline, after the camera yaw, so it is not pulled back to the lens.
    if (nod > 0) {
      zo.B.neck.rotation.x += .2 * Math.max(0, Math.sin((t - B(5)[0]) * 6.5)) * nod;
      zo.B.neck.updateWorldMatrix(false, true);
    }
  },
});

export default beatScene(ID, {
  shots: { pa },
  plan: {
    b066: { shot: 'pa', size: 'W', on: 'mohammed' },
    b067: { shot: 'pa', size: 'CU', on: 'mohammed', z: 2.05, dy: -40 },
    b068: { shot: 'pa', size: 'M', on: 'zoubida', z: 1.28, dx: -20, dy: -28 },
    b069: { shot: 'pa', size: 'M', on: 'fatma', z: 1.55, dy: -36 },
    b070: { shot: 'pa', size: 'CU', on: 'fatma', z: 2.15, dy: -34 },
    b071: { shot: 'pa', size: 'M', on: 'zoubida', z: 1.7, dx: 40, dy: -30 },
    b072: { shot: 'pa', size: 'M', on: 'father', z: 1.55, dy: -32 },
    b073: { shot: 'pa', size: 'W', on: 'father' },
  },
});
