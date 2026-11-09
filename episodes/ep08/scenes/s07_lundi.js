// s07 "Un lundi". b027 patio (patio_matin): against all habit the father walks in at noon, Mohammed (kneeling by the
// well, slate on his knees) looks up. b028–b037 bedroom lunch (chambre_jour): father kneels left, Zoubida right, Mohammed
// between them, nearer the lens. Acting beats: b030 Zoubida's hand to her chest at "bracelets", b031 painting (sun/moon,
// enumeration), b032 father lowers his eyes, b034 palms up at "miséricorde", b035 Mohammed sits up, b036 hand on his head.
import * as PO from '../../../engine/poses.js';
import { staged } from '../lib/autostage.js';
import { LUNCH } from '../lib/lunch.js';
import { beatScene, lines, sm, at, front, V } from '../lib/beatscene.js';

const ID = 's07_lundi', L = lines(ID);
const B = i => L[i] || [0, 0];
const win = (i, a, b, t) => { const [t0, t1] = B(i), D = t1 - t0; return sm(t0 + a * D, t0 + a * D + .5, t) * (1 - sm(t0 + b * D, t0 + b * D + .5, t)); };

const pa = staged('patio_matin', {
  father: { at: [330, 960], face: [800, 960], walk: { to: [760, 965], t0: B(0)[0] + .4, t1: B(0)[0] + 3.6 } },
  mohammed: { at: [1080, 1010], face: [760, 965], pose: 'kneel', look: 'father' },
}, { addressee: { narrator: 'mohammed' } });

const ch = staged('chambre_jour', { ...LUNCH }, {
  addressee: { father: 'zoubida', zoubida: 'father', mohammed: 'father' },
  act(lt, t, S, st) {
    const { father: fa, zoubida: zo, mohammed: mo } = st.A;
    const kz = zo.group.scale.y / 1.6, kf = fa.group.scale.y / 1.6, km = mo.group.scale.y / 1.6;
    // b030: breath stops, right hand to her chest from the word "bracelets" (≈ 45 % of the line) to the end
    const chest = win(3, .42, 1.05, t);
    if (chest > 0) PO.reach(zo, 'R', front(zo, 'chest', .07 * kz, .03 * kz, -.02 * kz).lerp(front(zo, 'root', .2 * kz, .15 * kz, 0), 1 - chest), { grip: .02 });
    // b032: father lowers his eyes (head pitch down on top of the gaze net, applied after it via fixed look below)
    // b034: palms up briefly at "miséricorde" (last third)
    const palms = win(7, .6, .95, t);
    if (palms > 0) for (const s of ['L', 'R']) PO.reach(fa, s, front(fa, 'chest', .3 * kf, (s === 'L' ? -.18 : .18) * kf, -.12 * kf).lerp(front(fa, 'root', .2 * kf, (s === 'L' ? -.2 : .2) * kf, 0), 1 - palms), { grip: 0 });
    // b035: Mohammed sits up straight, chest back
    const up = win(8, 0, .95, t);
    if (up > 0) { mo.B.chest.rotation.x -= .12 * up; mo.B.chest.updateWorldMatrix(false, true); }
    // b036: the father's right hand comes to rest on the boy's head (reach clamps if too far; stills show it)
    const pat = win(9, .15, .9, t);
    if (pat > 0) {
      const top = at(mo, 'head').add(V(0, .13 * km, 0));
      PO.reach(fa, 'R', front(fa, 'chest', .25 * kf, .1 * kf, -.15 * kf).lerp(top, pat), { grip: .02 });
      PO.look(mo, at(fa, 'head'), .8 * pat);
    }
  },
});

export default beatScene(ID, {
  shots: { pa, ch },
  plan: {
    b027: { shot: 'pa', size: 'W', on: 'father' },
    b028: { shot: 'ch', size: 'M', on: 'father', insAt: .55 },
    b029: { shot: 'ch', size: 'CU', on: 'father' },
    b030: { shot: 'ch', size: 'CU', on: 'zoubida' },
    b032: { shot: 'ch', size: 'M', on: 'father' },
    b033: { shot: 'ch', size: 'CU', on: 'zoubida' },
    b034: { shot: 'ch', size: 'CU', on: 'father' },
    b035: { shot: 'ch', size: 'CU', on: 'mohammed' },
    b036: { shot: 'ch', size: 'M', on: 'mohammed' },
    b037: { shot: 'ch', size: 'CU', on: 'father' },
  },
});
