// s17 "Le retour". b109 escalier_nuit: the father climbing (on tread 4, back to us, one step forward over the line).
// b110–b116 chambre_penombre (dark, ep05 plate): the door opens (left, x≈150), he stands black against the grey wall,
// gropes along the shelf (b111), Zoubida kneels without looking up (b112), he turns to the mattress where Mohammed lies
// awake (b113–b116). b117–b122 chambre_nuit (the lamp lit): her face streaming; he holds the bracelets out (b118), she
// turns her face away (b119), he insists, palm firm (b120), she takes them without looking and throws them in her chest
// (b121), b122 her hand on her heart: "mon cœur ne ment pas".
import * as PO from '../../../engine/poses.js';
import { staged } from '../lib/autostage.js';
import { ESCALIER } from '../lib/stairs.js';
import { beatScene, lines, sm, front, at, V } from '../lib/beatscene.js';

const ID = 's17_retour', L = lines(ID);
const B = i => L[i] || [0, 0];
const win = (i, a, b, t) => { const [t0, t1] = B(i), D = t1 - t0; return sm(t0 + a * D, t0 + a * D + .5, t) * (1 - sm(t0 + b * D, t0 + b * D + .5, t)); };
const k = a => a.group.scale.y / 1.6;
const DARK = { keyI: .7, fillI: .45, sky: '#5a5a78', ground: '#2a2018', key: '#a8b4d8', shadow: .2 };

const es = staged('escalier_nuit', { father: { tread: 4, face: 'up', seed: 5 } }, { stairs: ESCALIER, light: DARK });

const pe = staged('chambre_penombre', {
  father: { at: [170, 925], face: [800, 800], seed: 5, walk: { to: [430, 880], t0: B(1)[0] + 1.2, t1: B(1)[0] + 3.2 },
    look: t => t > B(4)[0] ? 'mohammed' : t > B(2)[0] ? [300, 700, 1.5] : null },
  zoubida: { at: [1250, 870], face: [900, 900], pose: 'kneel', seed: 7, look: [1150, 930, 0] },
  mohammed: { at: [980, 700], face: 0, pose: 'lie', o: { top: .2, turn: .5 }, seed: 3,
    look: t => t > B(4)[0] ? 'father' : [980, 700, 3] },
}, {
  light: DARK, addressee: { father: 'zoubida', mohammed: 'father' },
  act(lt, t, S, st) {
    const { father: fa } = st.A, kf = k(fa);
    const grope = win(2, .2, 1, t);   // left hand sliding along the shelf height
    if (grope > 0) PO.reach(fa, 'L', front(fa, 'chest', .35 * kf, -.25 * kf + .12 * Math.sin(t * 1.6) * kf, .2 * kf).lerp(front(fa, 'root', .15 * kf, -.2 * kf, 0), 1 - grope), { grip: .2 });
  },
});

const nu = staged('chambre_nuit', {
  father: { at: [520, 1000], face: 'zoubida', seed: 5 },
  zoubida: { at: [940, 1030], face: 'father', pose: 'kneel', seed: 7,
    look: t => t > B(10)[0] && t < B(12)[0] ? [1300, 1060, .3] : t > B(12)[0] && t < B(13)[0] ? [1350, 1000, .4] : null },
  mohammed: { at: [1180, 845], face: 0, pose: 'lie', o: { top: .35, turn: .5 }, look: 'zoubida', seed: 3 },
}, {
  light: { keyI: 1.5, key: '#ffc070', fillI: .55 },
  addressee: { father: 'zoubida', zoubida: 'father' },
  act(lt, t, S, st) {
    const { father: fa, zoubida: zo } = st.A, kf = k(fa), kz = k(zo);
    const offer = Math.max(win(9, .7, 1, t), win(10, 0, 1, t), win(11, 0, .6, t));   // bracelets held out on his palm
    if (offer > 0) PO.reach(fa, 'R', front(fa, 'chest', .42 * kf, .08 * kf, -.12 * kf).lerp(front(fa, 'root', .2 * kf, .2 * kf, 0), 1 - offer), { grip: .1 });
    const firm = win(11, .3, 1, t);   // left index raised, firm
    if (firm > 0) PO.reach(fa, 'L', front(fa, 'head', .25 * kf, -.12 * kf, 0).lerp(front(fa, 'root', .2 * kf, -.2 * kf, 0), 1 - firm), { grip: .5 });
    const away = win(10, 0, 1, t);   // she turns her face away from the jewels
    if (away > 0) { zo.B.neck.rotation.y -= .5 * away; zo.B.neck.updateWorldMatrix(false, true); }
    const take = win(12, 0, .45, t), toss = win(12, .45, .95, t);   // takes them (hand to his palm), throws them in the chest (right)
    if (take > 0) PO.reach(zo, 'R', front(fa, 'chest', .42 * kf, .08 * kf, -.12 * kf).lerp(front(zo, 'root', .2 * kz, .2 * kz, 0), 1 - take), { grip: .3 });
    if (toss > 0) PO.reach(zo, 'R', front(zo, 'root', .35 * kz, .45 * kz, .15 * kz).lerp(front(zo, 'root', .2 * kz, .2 * kz, 0), 1 - toss), { grip: 0 });
    const heart = win(13, .45, 1.1, t);   // hand on her heart
    if (heart > 0) PO.reach(zo, 'R', front(zo, 'chest', .07 * kz, .03 * kz, -.02 * kz).lerp(front(zo, 'root', .2 * kz, .15 * kz, 0), 1 - heart), { grip: .02 });
    const sob = win(8, .4, 1.2, t);
    if (sob > 0) { zo.B.chest.rotation.x += .03 * Math.sin(t * 9) * sob; zo.B.chest.updateWorldMatrix(false, true); }
  },
});

export default beatScene(ID, {
  shots: { es, pe, nu },
  plan: {
    b109: { shot: 'es', size: 'W', on: 'father' },
    b110: { shot: 'pe', size: 'W', on: 'father' },
    b111: { shot: 'pe', size: 'M', on: 'father' },
    b112: { shot: 'pe', size: 'M', on: 'zoubida' },
    b113: { shot: 'pe', size: 'M', on: 'father' },
    b114: { shot: 'pe', size: 'CU', on: 'mohammed' },
    b115: { shot: 'pe', size: 'CU', on: 'father' },
    b116: { shot: 'pe', size: 'CU', on: 'mohammed' },
    b117: { shot: 'nu', size: 'CU', on: 'zoubida' },
    b118: { shot: 'nu', size: 'M', on: 'father' },
    b119: { shot: 'nu', size: 'CU', on: 'zoubida' },
    b120: { shot: 'nu', size: 'CU', on: 'father' },
    b121: { shot: 'nu', size: 'M', on: 'zoubida' },
    b122: { shot: 'nu', size: 'CU', on: 'zoubida' },
  },
});
