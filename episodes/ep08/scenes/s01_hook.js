// s01 hook. b001 noon patio (patio_matin): the father's open hand holds the bracelets out to Zoubida; her eyes go from his
// hand to his face, a small laugh. b002 same evening, chambre_nuit: Zoubida kneels on the floor weeping, face in her hands,
// shoulders shaking; behind her Mohammed lies on the divan, awake, only blinking.
import * as PO from '../../../engine/poses.js';
import { aim } from '../../../engine/ik.js';
import * as PR from '../../../engine/props3d.js';
import { staged } from '../lib/autostage.js';
import { beatScene, lines, sm, front, at, V } from '../lib/beatscene.js';
import { bracelets } from './s17_retour.js';

const ID = 's01_hook', L = lines(ID), B = i => L[i] || [0, 0];

const pa = staged('patio_matin', {
  father: { at: [700, 985], face: 'zoubida', seed: 5, look: 'zoubida', lookMax: .85 },   // Argon r6: his level gaze passed over her scarf → head pitched down to her face
  zoubida: { at: [850, 975], face: 'father', seed: 7,
    look: (t, st) => t < B(0)[0] + .45 * (B(0)[1] - B(0)[0]) ? st.offer : 'father' },
}, {
  act(lt, t, S, st, S3) {
    const fa = st.A.father, zo = st.A.zoubida, k = fa.group.scale.y / 1.6;
    const u = 1;   // Argon r6: the hand was empty at the open → he already holds the bracelets out, waist height, elbow bent and down, palm up
    const p = front(fa, 'chest', .3 * k, .1 * k, -.26 * k).lerp(front(fa, 'root', .15 * k, .2 * k, 0), 1 - u);
    PO.reach(fa, 'R', p, { grip: .08, pole: [-.25, -.5, -.15] }); st.offer = p.clone().add(V(0, .03, 0));
    fa.B.foreArmR.rotation.y -= 1.2 * u; fa.B.foreArmR.updateWorldMatrix(false, true);   // supinate: the palm turns to the sky
    PO.fingers(fa, 'R', 0, { thumb: 0, spread: .15 });   // Argon r6: bracelets clipped the curled thumb/fingers → flat open palm
    const br = st.br ||= bracelets(S3), h = fa.B.handR;   // the sun and moon bracelets lying on his palm
    br.visible = true; h.updateWorldMatrix(true, false);
    br.position.copy(PO.handPts(fa, 'R').palm.add(V(0, .05 * k, 0))); br.scale.setScalar(1.35 * Math.max(.75, k))   /* Argon r5: invisible at patio scale */; br.updateMatrixWorld(true);
    const laugh = sm(B(0)[0] + .55 * (B(0)[1] - B(0)[0]), B(0)[1], t);
    if (laugh > 0) { zo.B.chest.rotation.x += .07 * Math.sin(t * 14) * laugh; zo.B.neck.rotation.x -= .12 * laugh; zo.B.chest.updateWorldMatrix(false, true); }
    // Argon r5: she stood in a stiff A-pose → her hands meet in front of her waist, then rise to her breastbone as she laughs
    const kz = zo.group.scale.y / 1.6, see = sm(B(0)[0] + .2 * (B(0)[1] - B(0)[0]), B(0)[0] + .45 * (B(0)[1] - B(0)[0]), t);
    for (const s of ['L', 'R']) {
      const early = sm(.3, B(0)[0] + .65, t) * (1 - see);   // b001: a small response before the laugh, preserving the opening offer
      PO.reach(zo, s, front(zo, 'root', (.27 + .025 * early) * kz, (s === 'L' ? -.06 : .06) * kz, (.08 + .035 * early) * kz).lerp(front(zo, 'neck', .22 * kz, (s === 'L' ? -.045 : .045) * kz, -.17 * kz), Math.max(.0, see * .8 + .2 * laugh)), { grip: .1 });
      if (early > 0) PO.fingers(zo, s, .16 * early, { spread: .25 });
    }
  },
});

// b002: floor kneel, folded over the padded knees; palms cover the bowed face, elbows down in front.
const nu = staged('chambre_nuit', {
  zoubida: { at: [820, 880], face: 'cam', yaw: .45, pose: 'kneel', o: { lean: 1.5, hip: .18, spread: .065, hands: false },
    seed: 7, hands: false, talk: 0, lids: .95 },
  mohammed: { at: [1240, 800], face: [1560, 900], pose: 'lie', o: { top: .35, turn: .10, headTurn: -.16, hands: 'belly' }, seed: 3, talk: 0 },
}, {
  act(lt, t, S, st, S3) {
    const { zoubida: zo, mohammed: mo } = st.A, k = zo.group.scale.y / 1.6;
    st.G.apply = () => {};   // contact hands and the boy's pillow turn must survive the automatic gaze pass
    if (!st.pillow) {
      st.pillow = PR.cushion({ w: .38, d: .3, h: .08, col: 0x586b8c });
      const p = at(mo, 'head', [0, .1, 0]).setY(.35);   // the same point returned as lie().pillowAt
      S3.prop(st.pillow, p.x, p.y, p.z, mo.group.rotation.y);
    }
    const sob = .025 * Math.max(0, Math.sin(t * 9)) * (Math.sin(t * 1.3) > -.3 ? 1 : 0);
    zo.B.chest.rotation.x += .3 + sob; zo.B.neck.rotation.x -= .35;   // keep the neck long within the deep bow
    zo.B.chest.rotation.z += .015 * Math.sin(t * 1.3); zo.B.spine.updateWorldMatrix(false, true);
    for (const s of ['L', 'R']) {
      const sign = s === 'L' ? 1 : -1;
      const knee = at(zo, 'shin' + s).add(V(0, .10 * k, 0));   // padded knee surface, supporting the elbow
      const pole = knee.sub(at(zo, 'root')).applyAxisAngle(V(0, 1, 0), -zo.group.rotation.y).multiplyScalar(1 / k).toArray();
      const p = at(zo, 'head', [sign * .10, .30, .19]), wrist = p.clone();
      for (let i = 0; i < 3; i++) {
        PO.reach(zo, s, wrist, { grip: 0, pole });
        aim(zo.B['hand' + s], PO.handPts(zo, s).end, at(zo, 'head', [sign * .10, .40, .19]));
        PO.palmTo(zo, s, 1, at(zo, 'head', [sign * .10, .30, 0]).sub(p).normalize());
        wrist.add(p.clone().sub(PO.handPts(zo, s).palm));
      }
      PO.fingers(zo, s, .015, { thumb: .02, spread: .85 });
    }
  },
});

export default beatScene(ID, {
  shots: { pa, nu },
  plan: {
    b001: { shot: 'pa', size: 'CU', on: 'zoubida' },
    b002: { shot: 'nu', size: 'W', on: 'zoubida' },   // Argon r6: the boy awake on the divan behind her must be in frame
  },
});
