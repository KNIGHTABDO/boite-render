// s16 back home, the dark. Bedroom by day (chambre_jour): b103 Zoubida sits on the mattress edge (kneel on the floor in
// front of it), head in both hands; b104 CU, only breathing; b105 Mohammed cries then lies down, eyes on the ceiling;
// b106 two-shot, no gaze between them. b107 patio at night (patio_nuit), empty: slow push up to their dark window.
// b108 painting (green sparks).
import * as PO from '../../../engine/poses.js';
import { aim } from '../../../engine/ik.js';
import * as PR from '../../../engine/props3d.js';
import { shot } from './_3d.js';
import { staged } from '../lib/autostage.js';
import { beatScene, lines, sm, front, at, V } from '../lib/beatscene.js';
import * as K from '../../../engine/core.js';

const ID = 's16_noir', L = lines(ID), B = i => L[i] || [0, 0];
const TOP = .26;
// The right mattress runs toward the foreground: hip over its centre, feet toward its front edge.
const MO = { at: [1320, 765], face: [1560, 900], pose: 'lie', o: { top: TOP, turn: .10, headTurn: .08, hands: 'belly' }, seed: 3, talk: 0 };
const ZO = { at: [560, 845], face: 'cam', pose: 'step', o: { seat: .2, floor: 0, spread: .065, fz: .32, lean: .95, hands: false },
  seed: 7, hands: false, talk: 0, lids: .96 };
function mourn(zo, t) {
  const k = zo.group.scale.y / 1.6, sob = .5 + .5 * Math.sin(t * 1.7);
  zo.B.chest.rotation.x += .25 + .012 * sob; zo.B.neck.rotation.x += .28;
  zo.B.chest.updateWorldMatrix(false, true);   // body first: palms follow the bowed face
  for (const s of ['L', 'R']) {
    const sign = s === 'L' ? 1 : -1, p = at(zo, 'head', [sign * .10, .26, .19]);
    const knee = at(zo, 'shin' + s).add(V(0, .04 * k, 0));
    const pole = knee.sub(at(zo, 'root')).applyAxisAngle(V(0, 1, 0), -zo.group.rotation.y).multiplyScalar(1 / k).toArray();
    const wrist = p.clone();
    for (let i = 0; i < 3; i++) {
      PO.reach(zo, s, wrist, { grip: 0, pole });
      aim(zo.B['hand' + s], PO.handPts(zo, s).end, at(zo, 'head', [sign * .10, .36, .19]));
      PO.palmTo(zo, s, 1, at(zo, 'head', [sign * .10, .26, 0]).sub(p).normalize());
      wrist.add(p.clone().sub(PO.handPts(zo, s).palm));
    }
    PO.fingers(zo, s, .015, { thumb: .02, spread: .85 });
  }
}
function tears(lt, t, S, st, S3) {
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
  mohammed: { at: MO.at, face: MO.face, pose: 'kneel', o: { seat: TOP, lean: .4, spread: .045, hands: false },
    hands: false, seed: 3, talk: 0, lids: .85 },
}, {
  over: tears,
  act(lt, t, S, st) {
    st.G.apply = () => {}; mourn(st.A.zoubida, t);
    const mo = st.A.mohammed, k = mo.group.scale.y / 1.6;
    mo.B.neck.rotation.x += .25; mo.B.chest.rotation.x += .025 * Math.sin(t * 9); mo.B.chest.updateWorldMatrix(false, true);
    for (const s of ['L', 'R']) {
      const sign = s === 'L' ? 1 : -1;
      PO.reach(mo, s, front(mo, 'head', .15 * k, -sign * .085 * k, .01 * k), { grip: .02, pole: [sign * .22, -.12, .24] });
      PO.fingers(mo, s, .06, { spread: .5 });
    }
  },
});

const win = shot({ plate: 'patio_nuit', async build() { return {}; },
  view: (lt, u, t) => [1100, 420 - 150 * sm(B(4)[0] + .9, B(4)[1], t), 1.04 + .16 * K.ease(u)] });

export default beatScene(ID, {
  shots: { ch, cry, win },
  plan: {
    b103: { shot: 'ch', size: 'M', on: 'zoubida', z: 2.6, dy: -35 },
    b104: { shot: 'ch', size: 'CU', on: 'zoubida', z: 3.1, dy: -30 },
    b105: { shot: 'cry', size: 'M', on: 'mohammed', z: 3.4, dy: -15,
      segs: [[.32, 'ch']], cover: [{ f: .32, shot: 'ch', size: 'M', on: 'mohammed', z: 4.2, dx: 45, dy: -20 }] },
    b106: { shot: 'ch', size: 'M', on: 'zoubida', z: 1.5, dx: 380, dy: 20 },
    b107: { shot: 'win' },
  },
});
