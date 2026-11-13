// s16 back home, the dark. Bedroom by day (chambre_jour): b103 Zoubida sits on the mattress edge (kneel on the floor in
// front of it), head in both hands; b104 CU, only breathing; b105 Mohammed cries then lies down, eyes on the ceiling;
// b106 two-shot, no gaze between them. b107 patio at night (patio_nuit), empty: slow push up to their dark window.
// b108 painting (green sparks).
import * as PO from '../../../engine/poses.js';
import { aim } from '../../../engine/ik.js';
import * as PR from '../../../engine/props3d.js';
import { shot } from './_3d.js';
import { staged } from '../lib/autostage.js';
import { lieOnBed, pillowUnder, cradleFace } from '../lib/fix8_lie.js';
import { beatScene, lines, sm, front, at, V } from '../lib/beatscene.js';
import * as K from '../../../engine/core.js';
import * as THREE from 'three';

const ID = 's16_noir', L = lines(ID), B = i => L[i] || [0, 0];
const TOP = .26;
const MATTRESS = [[1188, 574], [1450, 574], [1455, 688], [1308, 690]];   // right divan, clockwise from back-left
const CHEST = [[1450, 580], [1830, 580], [1830, 850], [1450, 850]];
// Head on the back cushions, feet further down the same cloth. Zoubida sits on the left mattress.
const MO = { at: [1325, 636], face: [1430, 672], pose: 'lie', o: { top: TOP, turn: .12, headTurn: .08, hands: 'belly', pillow: .12, mattress: MATTRESS, avoid: CHEST }, seed: 3, talk: 0, };
const ZO = { at: [1050, 748], face: 'cam', yaw: .25, pose: 'kneel', o: { grounded: true, seat: 0, lean: .28, spread: .07, hands: false, avoid: CHEST },
  seed: 7, hands: false, talk: 0, lids: .96 };
function mourn(zo, t) {
  const sob = .5 + .5 * Math.sin(t * 1.7);
  zo.noDarkLid = true;   // stage3d lid sampler: never paint the lids with hair/ink (black patch on the left eye)
  const sh = Math.max(0, Math.sin(t * 1.7 + .6)) ** 3;   // sob: a quick shoulder rise, then a slow settle
  zo.B.chest.rotation.x += .06 + .015 * sob;   // bowed forward, face down into both palms
  zo.B.neck.rotation.z += .035 * Math.sin(t * .55) + .02 * sh; zo.B.head.rotation.y += .05 * Math.sin(t * .37 + 1);   // slow small head shake
  for (const s of ['L', 'R']) zo.B['clavicle' + s] && (zo.B['clavicle' + s].rotation.z += (s === 'L' ? 1 : -1) * .05 * sh);
  zo.B.chest.rotation.x -= .075;   // r30: less folded, so the forearms clear her own torso (b103 2.98)
  cradleFace(zo, { mode: 'cradle', bow: .08 + .02 * sob, u: sob });
  {   // R31A: one hand to the cheek (right), the left arm down with its hand resting on the lap, clear of the torso
    const B = zo.B, k = zo.group.scale.y / 1.6;
    zo.group.updateMatrixWorld(true);
    const skin = () => B.head.localToWorld(V(-.055, .06, .072)), wrist = skin();
    for (let i = 0; i < 4; i++) { const p = skin(); PO.reach(zo, 'R', wrist, { grip: 0, pole: [-2.6, .3, .2] }); wrist.add(p.sub(PO.handPts(zo, 'R').palm)); }
    aim(B.handR, PO.handPts(zo, 'R').end, B.head.localToWorld(V(-.025, .2, .1)));
    PO.fingers(zo, 'R', .1, { thumb: .04, spread: .1 });
    {   // left hand: fingers on the forehead/hairline, elbow raised and out (clear of the torso)
      const sk2 = () => B.head.localToWorld(V(.045, .15, .07)), w2 = sk2();
      for (let i = 0; i < 4; i++) { const p = sk2(); PO.reach(zo, 'L', w2, { grip: 0, pole: [1.5, .8, 0] }); w2.add(p.sub(PO.handPts(zo, 'L').palm)); }
      PO.fingers(zo, 'L', .45, { thumb: .3, spread: .05 });
    }
  }
}
function tears(lt, u, t, S, st, S3) {   // over() hook signature (lt, u, t, S, st, S3)
  const zo = st.A.zoubida, c = K.c;
  c.save(); c.strokeStyle = 'rgba(180,212,230,.32)'; c.lineWidth = 1.1; c.lineCap = 'round';
  for (const sign of [-1, 1]) {
    const pts = [[sign * .045, .10, .17], [sign * .043, .035, .175], [sign * .025, -.025, .15]].map(p => S3.project(at(zo, 'head', p)).slice(0, 2));
    c.beginPath(); c.moveTo(...pts[0]); c.quadraticCurveTo(...pts[1], ...pts[2]); c.stroke();
  }
  c.restore();
}
const ch = staged('chambre_jour', { zoubida: ZO, mohammed: MO }, {
  over: tears,
  act(lt, t, S, st, S3) {
    st.G.apply = () => {};   // b106 explicitly has no exchanged gaze; don't lift her face out of her palms
    mourn(st.A.zoubida, t);
    // he is still crying upright (the 'cry' shot) until "Puis je m'étendis": b103/b104 show only her
    const mo = st.A.mohammed, lieT = B(2)[0] + .32 * (B(2)[1] - B(2)[0]), here = t >= lieT - .05;
    mo.group.visible = here;
    if (st.pillow) st.pillow.visible = here;
    lieOnBed(mo, { top: TOP, feet: [.45, .89], hands: 'belly', pillow: .12, tuck: .22, headTurn: .08 });   // r15: flat on the cloth, full cast scale
    pillowUnder(S3, st, mo, { top: TOP, h: .12 }); st.pillow.visible = here;
    mo.B.chest.rotation.x += .01 * Math.sin(t * 1.6); mo.B.chest.updateWorldMatrix(false, true);
  },
});
// b105 begins with him upright, curled over his knees crying. Cut on "Puis je m'étendis" to the settled bed pose;
// both contact poses are solved by staged() at build, rather than sweeping his feet through the mattress in a blend.
const cry = staged('chambre_jour', {
  zoubida: ZO,
  mohammed: { at: [1350, 694], face: [1336, 754], pose: 'kneel', o: { grounded: true, seat: TOP, lean: .22, spread: .045, hands: false, avoid: CHEST },
    hands: false, seed: 3, talk: 0, lids: .85, },
}, {
  over: tears,
  act(lt, t, S, st, S3) {
    st.G.apply = () => {}; mourn(st.A.zoubida, t);
    const mo = st.A.mohammed;
    // r28: lift him so the hem rests ON the mattress top (it cut flat into it), with a soft contact blob under him.
    if (st.y0 == null) st.y0 = mo.group.position.y;
    mo.group.position.y = st.y0 + .004;   // r30: was .014; the L knee floated 3.9 cm over the mattress at b105 30.0 (limit 3)
    if (!st.blob) {
      const N = 64, d = new Uint8Array(N * N * 4);
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const r = Math.hypot(x - 31.5, y - 31.5) / 32, v = Math.max(0, 1 - r); const i = (y * N + x) * 4; d[i] = 40; d[i + 1] = 18; d[i + 2] = 10; d[i + 3] = Math.round(255 * .6 * v * v * (3 - 2 * v)); }
      const tex = new THREE.DataTexture(d, N, N, THREE.RGBAFormat); tex.needsUpdate = true; tex.magFilter = tex.minFilter = THREE.LinearFilter;
      st.blob = new THREE.Mesh(new THREE.PlaneGeometry(.62, .46), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
      st.blob.rotation.x = -Math.PI / 2; st.blob.renderOrder = 2;
    }
    S3.prop(st.blob, mo.group.position.x, TOP + .004, mo.group.position.z, 0);
    // natural posture: weight shifted onto one hip, head tilted, shoulders uneven
    const wsh = Math.sin(t * .45);
    mo.B.spine.rotation.z += .05 + .02 * wsh; mo.B.chest.rotation.z -= .035;
    mo.B.head.rotation.z += .09 + .02 * Math.sin(t * .7); mo.B.head.rotation.y += .05 * Math.sin(t * .31);
    if (mo.B.LeftShoulder) mo.B.LeftShoulder.rotation.z += .05;
    if (mo.B.RightShoulder) mo.B.RightShoulder.rotation.z -= .02 * Math.sin(t * 1.3);
    mo.B.chest.rotation.x += .06 + .02 * Math.sin(t * 9);   // hunched, shoulders heaving
    cradleFace(mo, { mode: 'eyes', bow: .3, u: .5 });
  },
});

// b107: the house lights up (all but their own dark window, upper floor centre), then a slow push up to it.
// Window spots were read off the 960-wide stills (view at the beat start: centre 1045,502, zoom 1.08) -> plate px.
const FP = (fx, fy) => [1045 + (fx - 480) * 1.852, 502 + (fy - 270) * 1.852];
const LIT = [[308, 105, 42, 68, 'a'], [574, 105, 42, 68, 'a'], [326, 240, 40, 62, 'r'], [553, 243, 38, 56, 'r'],
  [193, 105, 30, 54, 'a'], [105, 148, 28, 52, 'a'], [688, 102, 30, 54, 'a'], [782, 145, 28, 50, 'a'], [160, 330, 26, 44, 'r'], [722, 330, 26, 44, 'r']];
function houseLights(lt, u, t) {
  const t0 = B(4)[0], c = K.c;
  c.save(); c.globalCompositeOperation = 'lighter';
  LIT.forEach(([fx, fy, w, h, k], i) => {
    const on = sm(t0 - .1 + i * .12, t0 + .5 + i * .12, t); if (on <= 0) return;
    const [x, y] = FP(fx, fy), W = w * 1.75, H = h * 1.75, fl = 1 + .04 * Math.sin(t * 7 + i * 2);
    const g = c.createRadialGradient(x, y, 2, x, y, Math.max(W, H) * 1.5);
    g.addColorStop(0, `rgba(255,190,90,${.55 * on * fl})`); g.addColorStop(1, 'rgba(255,150,40,0)');
    c.fillStyle = g; c.fillRect(x - W * 2, y - H * 2, W * 4, H * 4);
    c.fillStyle = `rgba(255,196,105,${.62 * on * fl})`; c.beginPath();
    if (k === 'a') { c.moveTo(x - W / 2, y + H / 2); c.lineTo(x - W / 2, y - H * .1); c.quadraticCurveTo(x - W / 2, y - H / 2, x, y - H / 2); c.quadraticCurveTo(x + W / 2, y - H / 2, x + W / 2, y - H * .1); c.lineTo(x + W / 2, y + H / 2); }
    else c.rect(x - W / 2, y - H / 2, W, H);
    c.closePath(); c.fill();
  });
  c.restore();
}
const win = shot({ plate: 'patio_nuit', async build() { return {}; },
  under: houseLights,
  view: (lt, u, t) => { const a = sm(B(4)[0] + .4, B(4)[1] - .3, t); return [1045 + (971 - 1045) * a, 520 + (272 - 520) * a, 1.08 + 1.0 * a]; } });

export default beatScene(ID, {
  shots: { ch, cry, win },
  plan: {
    b103: { shot: 'ch', size: 'M', on: 'zoubida', z: 2.15, dy: -30 },
    b104: { shot: 'ch', size: 'CU', on: 'zoubida', z: 4.0, dy: 10 },
    b105: { shot: 'cry', size: 'M', on: 'mohammed', z: 2.3, dy: -55,
      segs: [[.32, 'ch']], cover: [{ f: .32, shot: 'ch', size: 'M', on: 'mohammed', z: 1.45, dx: 10, dy: -80 }] },
    b106: { shot: 'ch', size: 'M', on: 'zoubida', z: 1.28, dx: 70, dy: -30 },
    b107: { shot: 'win' },
  },
});
