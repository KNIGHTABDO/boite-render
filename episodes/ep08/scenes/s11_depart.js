// s11 "L'Aâsser". patio_matin, late-afternoon amber. b066 Mohammed lifts his face to the sky,
// b067 he looks at his mother and asks, b068 she stays by him and points down at the stains,
// b069 Fatma Bziouya leans out of the right-hand doorway with her little broom, b070 eager question,
// b071 Zoubida keeps her eyes on that doorway and nods, b072 Maâlem Abdeslem calls from the left
// street door, b073 "Passe": only then does he walk in.
import { THREE } from '../lib/fix8_g3.js';
import * as PO from '../../../engine/poses.js';
import { staged, littleBroom, holdBroom, handTo, yawToward } from '../lib/fix8b.js';
import { yawBody } from '../lib/fix8_g3.js';
import { brightBroom, holdBroomFwd } from '../lib/fix8_R16C.js';
import { beatScene, lines, sm, at, V, yawTo, dirW } from '../lib/beatscene.js';

const ID = 's11_depart', L = lines(ID);
const B = i => L[i] || [0, 0];
const skyOf = a => at(a, 'head').add(V(.15, 3.2, .35));
const AMBER = { key: '#ffb870', keyI: 1.7, dir: [-1.2, 5.2, .8], fillI: .85, sky: '#d9b48a', shadow: .26, soft: 10 };
const wrap = d => Math.atan2(Math.sin(d), Math.cos(d));
// Djellaba stains: soft brown/grey blotches (DataTexture, no DOM needed), laid on the robe surface by ray from the lens.
function blotchTex() {
  const N = 64, d = new Uint8Array(N * N * 4);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const u = (x - 31.5) / 31.5, v = (y - 31.5) / 31.5, r = Math.hypot(u * 1.05, v) + .18 * Math.sin(u * 7.1 + v * 3.3) + .1 * Math.sin(v * 9.7 - u * 2.1);
    const a = Math.max(0, Math.min(1, (1 - r) * 2.2)), i = (y * N + x) * 4;
    d[i] = 74; d[i + 1] = 50; d[i + 2] = 30; d[i + 3] = Math.round(Math.min(1, a * 1.6) * 255);
  }
  const t = new THREE.DataTexture(d, N, N, THREE.RGBAFormat); t.needsUpdate = true; return t;
}
function addStains(mo, S3) {
  if (mo.stains) return; mo.stains = true;
  try {
    mo.group.updateMatrixWorld(true);
    const ch = at(mo, 'chest'), u = ch.distanceTo(at(mo, 'root')), cam = S3.cam.position;
    const toCam = cam.clone().sub(ch); toCam.y = 0; toCam.normalize();
    const right = V(0, 1, 0).cross(toCam).normalize();
    const tex = blotchTex(), rc = new THREE.Raycaster();
    const spots = [[-.38, .12, .62, 0], [.3, -.55, .78, 1.1], [-.1, -1.0, .56, 2.3], [.42, -.15, .4, 3.4]];
    for (const [rx, ry, sz, rot] of spots) {
      const target = ch.clone().addScaledVector(right, rx * u).add(V(0, ry * u, 0));
      const o = target.clone().addScaledVector(toCam, 1.2);
      rc.set(o, toCam.clone().negate());
      const hit = rc.intersectObject(mo.group, true).find(h => h.object.isMesh && !h.object.userData.stain);
      if (!hit) continue;
      const n = (hit.face ? hit.face.normal.clone().transformDirection(hit.object.matrixWorld) : toCam.clone());
      if (n.dot(toCam) < 0) n.negate();
      const m = new THREE.Mesh(new THREE.PlaneGeometry(sz * u * 1.6, sz * u * 1.8), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, color: '#ffffff' }));
      m.userData.stain = true; m.renderOrder = 5;
      m.position.copy(hit.point).addScaledVector(n, .006); m.lookAt(hit.point.clone().add(n)); m.rotateZ(rot);
      mo.group.add(m); m.updateMatrixWorld(true); mo.B.chest.attach(m);
    }
  } catch (e) { /* stains are cosmetic */ }
}
const WALK0 = () => B(7)[0] - .1;

const pa = staged('patio_matin', {
  mohammed: { at: [960, 1035], face: 'cam', yaw: 0, seed: 3, talk: 0, lookMax: t => t >= B(6)[0] ? 1.15 : t >= B(3)[0] ? .6 : t >= B(1)[0] - .15 ? .4 : .95,
    look: (t, st) => t >= B(6)[0] ? 'father' : t < B(1)[0] - .15 ? skyOf(st.A.mohammed) : t >= B(2)[0] + .8 && t < B(3)[0] ? at(st.A.mohammed, 'root').add(V(.1, .3, .25)) : 'zoubida' },
  zoubida: { at: [1140, 1015], face: 'cam', yaw: .2, seed: 7, talk: 0,
    lookMax: t => t >= B(6)[0] ? 1.15 : t >= B(3)[0] ? .95 : .45,
    look: (t, st) => {
      if (t >= B(6)[0]) return 'father';
      if (t >= B(3)[0]) {   // R31AK: eyes stay on Fatma's doorway through b070 and b071 (the nod is a neck tilt)
        const p = st.A.fatma.B.head.getWorldPosition(V(0, 0, 0));
        return p;
      }
      return t < B(1)[0] - .1 ? skyOf(st.A.zoubida) : 'mohammed';
    } },
  // Right arcade doorway, facing left into the court — not the foreground bush.
  fatma: { at: [1668, 912], face: [1000, 980], seed: 11, talk: 0, lookMax: .85,
    look: t => t >= B(6)[0] + .4 ? 'father' : 'zoubida' },
  // Left street door. He is outside the court until "Passe", then walks in.
  father: { at: [132, 918], face: [860, 980], seed: 5, height: 1.76, talk: 0, lookMax: .7,
    look: 'zoubida',
    walk: { to: [680, 1005], t0: WALK0(), t1: B(7)[0] + 2.1 } },
}, {
  light: AMBER,
  addressee: { mohammed: 'zoubida', zoubida: 'mohammed', fatma: 'zoubida', father: 'zoubida' },
  act(lt, t, S, st, S3) {
    const { mohammed: mo, zoubida: zo, fatma: fa, father: paFa } = st.A;
    const broom = st.broom ||= S3.prop(brightBroom(), 0, 0, 0);
    const sky = 1 - sm(B(1)[0] - .55, B(1)[0] - .05, t);
    mo.B.spine.rotation.x -= .08 * sky; mo.B.chest.rotation.x -= .1 * sky;
    zo.B.spine.rotation.x -= .04 * sky; zo.B.chest.rotation.x -= .06 * sky;
    mo.B.neck.rotation.x -= .24 * sky; mo.B.head.rotation.x -= .2 * sky;
    mo.B.neck.updateWorldMatrix(false, true);
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
      const target = sh.clone().add(dir); target.y = Math.min(target.y, at(zo, 'chest').y - .3);
      PO.reach(zo, 'R', target, { grip: .01, pole: [-.3, -.05, .15] });
      PO.fingers(zo, 'R', .75, { each: [.7, 0, 1, 1, 1] });
    }
    fa.group.visible = t >= B(3)[0] && t < B(7)[0] + .9;
    const lean = sm(B(3)[0], B(3)[0] + .55, t) * (1 - sm(B(7)[0], B(7)[0] + .45, t) * .65);
    const sway = Math.sin((t - B(3)[0]) * 1.6);
    fa.B.spine.rotation.x += .1 * lean * (1 + sway * .5); fa.B.spine.rotation.z += .07 * lean * sway;
    fa.B.head.rotation.y += (t > B(7)[0] - 1 ? .3 : .12 * Math.sin((t - B(3)[0]) * .7)) * lean;
    fa.B.chest.rotation.y += .1 * lean * Math.sin((t - B(3)[0]) * .5);
    fa.B.neck.rotation.z += .08 * lean * Math.sin((t - B(3)[0]) * 2.1);
    fa.B.spine.rotation.x += .5 * lean; fa.B.chest.rotation.x += .2 * lean; fa.B.spine.rotation.z += .05 * lean * Math.sin(t * .9);
    fa.group.position.addScaledVector(dirW(fa, 0, 0, 1), .16 * lean);   // R31AK: lean out of the doorway toward the court
    fa.B.spine.rotation.x += .12 * lean;
    fa.B.spine.updateWorldMatrix(false, true);
    const eager = sm(B(4)[0] - .12, B(4)[0] + .18, t) * (1 - sm(B(4)[1], B(4)[1] + .25, t));
    if (eager > 0) {
      fa.B.spine.rotation.x += .1 * eager; fa.B.chest.rotation.y += .06 * eager;
      handTo(fa, 'L', { fwd: .12, out: .12, drop: .02, curl: .12, spread: .2 });
      PO.palmTo(fa, 'L', eager, dirW(fa, 0, .2, 1));
    }
    if (t >= B(7)[0]) fa.group.position.addScaledVector(dirW(fa, 0, 0, -1), .5 * sm(B(7)[0] - .6, B(7)[0] + .6, t));
    const nod = sm(B(5)[0], B(5)[0] + .2, t) * (1 - sm(B(5)[1] - .2, B(5)[1], t));
    if (nod > 0) zo.B.chest.rotation.x += .05 * nod;
    const call = t >= B(6)[0] && t < WALK0();
    paFa.group.visible = t >= B(6)[0];
    if (call) {
      const w = sm(B(6)[0] - .1, B(6)[0] + .25, t);
      paFa.B.spine.rotation.x += .22 * w; paFa.B.chest.rotation.x += .06 * w;
      handTo(paFa, 'R', { fwd: .12, out: .34, drop: -.1 + .05 * Math.sin(t * 5), curl: .12, spread: .3 });
      handTo(paFa, 'L', { fwd: .06, out: .14, drop: .22, curl: .25 });
    }
    if (t >= B(6)[0] - .4) {
      const u = sm(B(6)[0] - .4, B(6)[0] - .05, t);
      for (const a of [zo, mo]) {   // half-turn toward him, the rest stays open to the lens so faces read
        const yc = yawTo(a.group.position, S3.cam.position), y = yc + wrap(yawTo(a.group.position, paFa.group.position) - yc) * .5;
        a.group.rotation.y += wrap(y - a.group.rotation.y) * u;
        a.group.updateMatrixWorld(true);
      }
      if (t >= B(7)[0]) {
        const welcome = sm(B(7)[0], B(7)[0] + .35, t);
        handTo(zo, 'R', { fwd: .24, out: .36, drop: -.04, curl: .04, spread: .38 });   // open palm toward the street door (screen-left)
        PO.palmTo(zo, 'R', welcome, V(0, .5, .7));
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
    if (eager > 0) { posed.add('moR'); handTo(mo, 'R', { fwd: .2, out: .1, drop: -.1, curl: .15, spread: .3 }); }
    if (fa.group.visible) posed.add('faR');
    if (call) { posed.add('paR'); posed.add('paL'); }
    if (t >= B(7)[0]) posed.add('zoR');
    const restArm = (a, side, tag) => {
      if (posed.has(tag) || !a.group.visible) return;
      const ph = side === 'L' ? 0 : 1.4, sway = .03 * Math.sin(t * .8 + ph);
      if (a === mo) handTo(a, side, side === 'L' ? { fwd: .07 + .02 * Math.sin(t * 1.7), out: .0, drop: .36 + sway, curl: .5, spread: .05 } : { fwd: .07 + .03 * Math.sin(t * 2.1 + ph), out: .03 + .02 * Math.sin(t * 1.3 + ph), drop: .36 + sway + .04 * Math.sin(t * .6 + ph), curl: .3 + .1 * Math.sin(t * 2.7 + ph), spread: .12 });   // fiddling with the robe
      else if (a === zo) handTo(a, side, side === 'L' ? { fwd: .14, out: .02, drop: .1, curl: .35, spread: .1 } : { fwd: .04, out: .1, drop: .4 + sway * 2, curl: .3, spread: .1 });
      else handTo(a, side, { fwd: .08 + .02 * Math.sin(t * .7 + ph), out: a === zo ? .1 : .06, drop: .26 + sway * 2 + .04 * Math.sin(t * .5 + ph), curl: .3, spread: .1 });
    };
    restArm(mo, 'L', 'moL'); restArm(mo, 'R', 'moR');
    restArm(zo, 'L', 'zoL'); restArm(zo, 'R', 'zoR');
    
    if (fa.group.visible && eager <= 0) restArm(fa, 'L', 'faL');
    if (paFa.group.visible && !call && !walking) { restArm(paFa, 'L', 'paL'); restArm(paFa, 'R', 'paR'); }
    if (t < B(6)[0]) {
      yawBody(zo, S3.cam, t >= B(5)[0] ? .85 : t >= B(3)[0] ? .6 : .6);
      if (t < B(6)[0] - .4) {   // 3/4 toward his mother, never back to the lens
        if (t < B(3)[0]) yawBody(mo, S3.cam, .45);
        else { const yc = yawTo(mo.group.position, S3.cam.position); mo.group.rotation.y = yc + wrap(yawTo(mo.group.position, zo.group.position) - yc) * .25; mo.group.updateMatrixWorld(true); }   // same proven camera-facing clamp as Zoubida: face stays readable
      }
    }
    if (t >= B(6)[0] - .4) yawToward(mo, S3.cam, .9);   // R31AK: head-based yawToward spun him back to the lens during the sky look
    yawToward(zo, S3.cam, t < B(6)[0] ? .9 : .85);
    if (paFa.group.visible && !walking) yawToward(paFa, S3.cam, 1.2);
    if (fa.group.visible) yawToward(fa, S3.cam, .75);
    if (fa.group.visible) {
      holdBroomFwd(fa, broom, S3.scene, 'R');
      broom.updateMatrixWorld(true);
      const bb = new THREE.Box3().setFromObject(broom), fy = fa.group.position.y, dlt = bb.min.y - fy;
      if (globalThis.DBG8) console.error('DBGBROOM', dlt.toFixed(3));
      if (dlt > 0 && dlt < .16) broom.position.y -= dlt;
    } else broom.visible = false;
    // Nod rides on top of the eyeline, after the camera yaw, so it is not pulled back to the lens.
    if (nod > 0) {
      zo.B.neck.rotation.x += .1 * Math.max(0, Math.sin((t - B(5)[0]) * 6.5)) * nod;
      zo.B.neck.updateWorldMatrix(false, true);
    }
  },
});

export default beatScene(ID, {
  shots: { pa },
  plan: {
    b066: { shot: 'pa', size: 'W', on: 'mohammed', dy: 55, dx: 120 },
    b067: { shot: 'pa', size: 'CU', on: 'mohammed', z: 1.45, dy: 190, dx: 40 },
    b068: { shot: 'pa', size: 'M', on: 'zoubida', z: 1.2, dx: -20, dy: 100 },
    b069: { shot: 'pa', size: 'M', on: 'fatma', z: 1.5, dy: 12 },
    b070: { shot: 'pa', size: 'CU', on: 'fatma', z: 1.75, dy: 62, dx: -200 },
    b071: { shot: 'pa', size: 'M', on: 'zoubida', z: 1.5, dx: 40, dy: 70 },
    b072: { shot: 'pa', size: 'M', on: 'father', z: 1.5, dy: 8 },
    b073: { shot: 'pa', size: 'W', on: 'father' },
  },
});
