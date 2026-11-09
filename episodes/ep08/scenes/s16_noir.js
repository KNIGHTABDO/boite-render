// s16 back home, the dark. Bedroom by day (chambre_jour): b103 Zoubida sits on the mattress edge (kneel on the floor in
// front of it), head in both hands; b104 CU, only breathing; b105 Mohammed cries then lies down, eyes on the ceiling;
// b106 two-shot, no gaze between them. b107 patio at night (patio_nuit), empty: slow push up to their dark window.
// b108 painting (green sparks).
import * as PO from '../../../engine/poses.js';
import { aim } from '../../../engine/ik.js';
import * as PR from '../../../engine/props3d.js';
import { shot } from './_3d.js';
import { staged, palmsOnFace } from '../lib/autostage.js';
import { beatScene, lines, sm, front, at, V } from '../lib/beatscene.js';
import * as K from '../../../engine/core.js';

const ID = 's16_noir', L = lines(ID), B = i => L[i] || [0, 0];
const TOP = .26;
const MATTRESS = [[1188, 574], [1450, 574], [1455, 688], [1308, 690]];   // right divan, clockwise from back-left
const CHEST = [[1450, 580], [1830, 580], [1830, 850], [1450, 850]];
// Head on the back cushions, feet further down the same cloth. Zoubida sits on the left mattress.
const MO = { at: [1350, 694], face: [1336, 754], pose: 'lie', o: { top: TOP, turn: .12, headTurn: .08, hands: 'belly', mattress: MATTRESS, avoid: CHEST }, seed: 3, talk: 0 };
const ZO = { at: [1011, 679], face: 'cam', yaw: .25, pose: 'kneel', o: { grounded: true, seat: TOP, lean: .28, spread: .07, hands: false, avoid: CHEST },
  seed: 7, hands: false, talk: 0, lids: .96 };
function mourn(zo, t) {
  const sob = .5 + .5 * Math.sin(t * 1.7);
  zo.B.chest.rotation.x += .015 * sob;
  palmsOnFace(zo, 'face');
}
function tears(lt, u, t, S, st, S3) {   // over() hook signature (lt, u, t, S, st, S3)
  const zo = st.A.zoubida, c = K.c;
  c.save(); c.strokeStyle = 'rgba(180,212,230,.7)'; c.lineWidth = 1.8; c.lineCap = 'round';
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
    st.A.mohammed.B.chest.rotation.x += .01 * Math.sin(t * 1.6);
    if (!st.pillow) {
      st.pillow = PR.cushion({ w: .38, d: .3, h: .08, col: 0x647c7c });
      const p = at(st.A.mohammed, 'head', [0, .1, 0]).setY(TOP);   // lie().pillowAt
      S3.prop(st.pillow, p.x, p.y, p.z, st.A.mohammed.group.rotation.y);
    }
  },
});
// b105 begins with him upright, curled over his knees crying. Cut on "Puis je m'étendis" to the settled bed pose;
// both contact poses are solved by staged() at build, rather than sweeping his feet through the mattress in a blend.
const cry = staged('chambre_jour', {
  zoubida: ZO,
  mohammed: { at: MO.at, face: MO.face, pose: 'kneel', o: { grounded: true, seat: TOP, lean: .22, spread: .045, hands: false, avoid: CHEST },
    hands: false, seed: 3, talk: 0, lids: .85 },
}, {
  over: tears,
  act(lt, t, S, st) {
    st.G.apply = () => {}; mourn(st.A.zoubida, t);
    const mo = st.A.mohammed;
    mo.B.chest.rotation.x += .02 * Math.sin(t * 9);
    palmsOnFace(mo, 'face', { bow: .32 });
  },
});

const win = shot({ plate: 'patio_nuit', async build() { return {}; },
  view: (lt, u, t) => [1100, 380 - 200 * sm(B(4)[0], B(4)[0] + 1.4, t), 1.08 + .4 * sm(B(4)[0], B(4)[1], t)] });

export default beatScene(ID, {
  shots: { ch, cry, win },
  plan: {
    b103: { shot: 'ch', size: 'M', on: 'zoubida', z: 2.15, dy: -70 },
    b104: { shot: 'ch', size: 'CU', on: 'zoubida', z: 4.4, dy: -35 },
    b105: { shot: 'cry', size: 'M', on: 'mohammed', z: 2.3, dy: -55,
      segs: [[.32, 'ch']], cover: [{ f: .32, shot: 'ch', size: 'M', on: 'mohammed', z: 2.5, dx: 20, dy: -50 }] },
    b106: { shot: 'ch', size: 'M', on: 'zoubida', z: 1.28, dx: 70, dy: -30 },
    b107: { shot: 'win' },
  },
});
