// s01 hook. b001 noon patio (patio_matin): the father's open hand holds the bracelets out to Zoubida; her eyes go from his
// hand to his face, a small laugh. b002 same evening, chambre_nuit: Zoubida kneels on the floor weeping, face in her hands,
// shoulders shaking; behind her Mohammed lies on the divan, awake, only blinking.
import * as PO from '../../../engine/poses.js';
import { staged } from '../lib/autostage.js';
import { beatScene, lines, sm, front, V, dirW } from '../lib/beatscene.js';
import { bracelets } from './s17_retour.js';

const ID = 's01_hook', L = lines(ID), B = i => L[i] || [0, 0];

const pa = staged('patio_matin', {
  father: { at: [700, 985], face: 'zoubida', seed: 5 },
  zoubida: { at: [850, 975], face: 'father', seed: 7,
    look: (t, st) => t < B(0)[0] + .45 * (B(0)[1] - B(0)[0]) ? st.offer : 'father' },
}, {
  act(lt, t, S, st, S3) {
    const fa = st.A.father, zo = st.A.zoubida, k = fa.group.scale.y / 1.6;
    const u = sm(B(0)[0] - .2, B(0)[0] + .8, t);   // the hand comes forward at waist height, elbow bent and down, palm up
    const p = front(fa, 'chest', .3 * k, .1 * k, -.26 * k).lerp(front(fa, 'root', .15 * k, .2 * k, 0), 1 - u);
    PO.reach(fa, 'R', p, { grip: .08, pole: [-.25, -.5, -.15] }); st.offer = p.clone().add(V(0, .03, 0));
    fa.B.foreArmR.rotation.y -= 1.2 * u; fa.B.foreArmR.updateWorldMatrix(false, true);   // supinate: the palm turns to the sky
    const br = st.br ||= bracelets(S3), h = fa.B.handR;   // the sun and moon bracelets lying on his palm
    br.visible = u > .5; h.updateWorldMatrix(true, false);
    br.position.copy(PO.handPts(fa, 'R').palm.add(V(0, .03 * k, 0))); br.scale.setScalar(1.6 * Math.max(.75, k))   /* Argon r5: invisible at patio scale */; br.updateMatrixWorld(true);
    const laugh = sm(B(0)[0] + .55 * (B(0)[1] - B(0)[0]), B(0)[1], t);
    if (laugh > 0) { zo.B.chest.rotation.x += .07 * Math.sin(t * 14) * laugh; zo.B.neck.rotation.x -= .12 * laugh; zo.B.chest.updateWorldMatrix(false, true); }
    // Argon r5: she stood in a stiff A-pose → her hands meet in front of her waist, then rise to her breastbone as she laughs
    const kz = zo.group.scale.y / 1.6, see = sm(B(0)[0] + .2 * (B(0)[1] - B(0)[0]), B(0)[0] + .45 * (B(0)[1] - B(0)[0]), t);
    for (const s of ['L', 'R']) PO.reach(zo, s, front(zo, 'root', .2 * kz, (s === 'L' ? -.05 : .05) * kz, .08 * kz).lerp(front(zo, 'neck', .14 * kz, (s === 'L' ? -.03 : .03) * kz, -.15 * kz), Math.max(.0, see * .8 + .2 * laugh)), { grip: .1 });
  },
});

const nu = staged('chambre_nuit', {
  zoubida: { at: [760, 1030], face: 'cam', yaw: .45, pose: 'kneel', seed: 7 },   // stills7: back to lens → 3/4 front, the bowed face in her palms reads
  mohammed: { at: [1240, 672], face: Math.PI / 2, pose: 'lie', o: { top: .2, turn: .45 }, look: (t, st, S3) => S3.cam.position.clone(), lookMax: .7, seed: 3 }   // Argon r5: his open eyes must read → head rolled toward the lens,
}, {
  act(lt, t, S, st) {
    const zo = st.A.zoubida, k = zo.group.scale.y / 1.6;
    // Argon r4: hands stayed on the thighs → bow + sob FIRST, then the palms go over the (already bowed) face; the
    // targets sit on the face plane (cheekbones), elbows down and in, fingers slightly curled
    zo.B.spine.rotation.x += .12; zo.B.neck.rotation.x += .35; zo.B.chest.rotation.x += .18 + .035 * Math.max(0, Math.sin(t * 9)) * (Math.sin(t * 1.3) > -.3 ? 1 : 0);   // sobs
    zo.B.spine.updateWorldMatrix(false, true);
    for (const s of ['L', 'R']) { PO.reach(zo, s, front(zo, 'head', .09 * k, (s === 'L' ? -.04 : .04) * k, .02 * k), { grip: .0, pole: s === 'L' ? [.15, -.4, .05] : [-.15, -.4, .05] }); PO.palmTo(zo, s, 1, dirW(zo, 0, 0, -1)); PO.fingers(zo, s, .25, { thumb: .2 }); }
  },
});

export default beatScene(ID, {
  shots: { pa, nu },
  plan: {
    b001: { shot: 'pa', size: 'CU', on: 'zoubida' },
    b002: { shot: 'nu', size: 'M', on: 'zoubida' },
  },
});
