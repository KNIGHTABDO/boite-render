// s17 "Le retour". b109 escalier_nuit: the father climbing (on tread 4, back to us, one step forward over the line).
// b110–b116 chambre_penombre (dark, ep05 plate): the door opens (left, x≈150), he stands black against the grey wall,
// gropes along the shelf (b111), Zoubida kneels without looking up (b112), he turns to the mattress where Mohammed lies
// awake (b113–b116). b117–b122 chambre_nuit (the lamp lit): her face streaming; he holds the bracelets out (b118), she
// turns her face away (b119), he insists, palm firm (b120), she takes them without looking and throws them in her chest
// (b121), b122 her hand on her heart: "mon cœur ne ment pas".
import * as PO from '../../../engine/poses.js';
import { staged, THREE } from '../lib/autostage.js';
import { toon } from '../../../engine/props3d.js';
import { ESCALIER } from '../lib/stairs.js';
import { beatScene, lines, sm, front, at, V } from '../lib/beatscene.js';

const ID = 's17_retour', L = lines(ID);
const B = i => L[i] || [0, 0];
const win = (i, a, b, t) => { const [t0, t1] = B(i), D = t1 - t0; return sm(t0 + a * D, t0 + a * D + .5, t) * (1 - sm(t0 + b * D, t0 + b * D + .5, t)); };
const k = a => a.group.scale.y / 1.6;
const DARK = { keyI: .35, fillI: .22, sky: '#5a5a78', ground: '#2a2018', key: '#a8b4d8', shadow: .2 };

// he climbs treads 2 → 5 with his back to us while the narrator speaks; a slow push-in on the whole flight
const es = staged('escalier_nuit', { father: { tread: 2, face: 'up', seed: 5, climb: { to: 5, t0: B(0)[0] + .2, t1: B(0)[1] - .2 } } },
  { stairs: ESCALIER, light: DARK, view: (lt, u) => [1180, 560, 1.1 + .12 * u] });
// the ep05 penombre plate is a day room: a multiply grade turns it to night (the father's silhouette reads black on grey)
const NIGHT = { grade: 'rgb(84,94,150)', gradeOp: 'multiply', vignette: .85 };

const pe = staged('chambre_penombre', {
  father: { at: [170, 925], face: [800, 800], seed: 5, walk: { to: [430, 880], t0: B(1)[0] + 1.2, t1: B(1)[0] + 3.2 },
    look: t => t > B(4)[0] ? 'mohammed' : t > B(2)[0] ? [300, 700, 1.5] : null },
  zoubida: { at: [1170, 880], face: [900, 900], pose: 'kneel', seed: 7, look: [1100, 930, 0] },
  // lying along the mattress (side-on to the lens: feet-first he read as a toddler sitting up), face turned to the room
  mohammed: { at: [980, 700], face: Math.PI / 2, pose: 'lie', o: { top: .2, turn: .45 }, seed: 3, lookMax: .8,
    look: t => t > B(4)[0] ? 'father' : [980, 700, 3] },
}, {
  light: DARK, fx: NIGHT, addressee: { father: 'zoubida', mohammed: 'father' },
  act(lt, t, S, st) {
    const { father: fa } = st.A, kf = k(fa);
    const grope = win(2, .2, 1, t);   // left hand sliding along the shelf height
    if (grope > 0) PO.reach(fa, 'L', front(fa, 'chest', .35 * kf, -.25 * kf + .12 * Math.sin(t * 1.6) * kf, .2 * kf).lerp(front(fa, 'root', .15 * kf, -.2 * kf, 0), 1 - grope), { grip: .2 });
  },
});

const nu = staged('chambre_nuit', {
  // Zoubida kneels right of the table, turned three-quarters to the lens (toward him, lower left) so her tears read;
  // he stands in the left foreground, facing her
  father: { at: [430, 1010], face: 'zoubida', seed: 5 },
  // b117 she lifts her wet face to him (a bowed head showed only hair); b119 she turns away from the jewels; b121 to her chest
  zoubida: { at: [1010, 905], face: [560, 1060], pose: 'kneel', seed: 7, lookMax: .95,
    look: t => t >= B(8)[0] && t < B(9)[0] ? 'father' : t > B(10)[0] && t < B(12)[0] ? [1400, 980, .9] : t > B(12)[0] && t < B(13)[0] ? [1450, 950, .5] : null },
  mohammed: { at: [1180, 845], face: Math.PI / 2, pose: 'lie', o: { top: .35, turn: .45 }, look: 'zoubida', lookMax: .8, seed: 3 },
}, {
  light: { keyI: 1.5, key: '#ffc070', fillI: .55 },
  addressee: { father: 'zoubida', zoubida: 'father' },
  act(lt, t, S, st, S3) {

    const { father: fa, zoubida: zo } = st.A, kf = k(fa), kz = k(zo);
    const offer = Math.max(win(9, .7, 1, t), win(10, 0, 1, t), win(11, 0, .6, t));   // bracelets held out on his palm
    if (offer > 0) PO.reach(fa, 'R', front(fa, 'chest', .42 * kf, .08 * kf, -.12 * kf).lerp(front(fa, 'root', .2 * kf, .2 * kf, 0), 1 - offer), { grip: .1 });
    const away = win(10, 0, 1, t);   // she turns her face away from the jewels
    if (away > 0) { zo.B.neck.rotation.y -= .5 * away; zo.B.neck.updateWorldMatrix(false, true); }
    const take = win(12, 0, .45, t), toss = win(12, .45, .95, t);   // takes them (hand to his palm), throws them in the chest (right)
    if (take > 0) PO.reach(zo, 'R', front(fa, 'chest', .42 * kf, .08 * kf, -.12 * kf).lerp(front(zo, 'root', .2 * kz, .2 * kz, 0), 1 - take), { grip: .3 });
    if (toss > 0) PO.reach(zo, 'R', front(zo, 'chest', .3 * kz, .5 * kz, .05 * kz).lerp(front(zo, 'root', .2 * kz, .2 * kz, 0), 1 - toss), { grip: 0 });
    const heart = win(13, .45, 1.1, t);   // hand on her heart
    if (heart > 0) PO.reach(zo, 'R', front(zo, 'neck', .11 * kz, .03 * kz, -.15 * kz).lerp(front(zo, 'root', .2 * kz, .15 * kz, 0), 1 - heart), { grip: .03, pole: [-.3, -.15, -.05] });   // palm flat on the breastbone (as s07 b030)
    // the bracelets: on his palm while he offers them, in her hand while she takes them, then gone into the chest
    const br = st.br ||= bracelets(S3);
    const inHis = offer > .5 && take < .5, inHers = take >= .5 && toss < .6;
    br.visible = inHis || inHers;
    if (br.visible) { const h = (inHis ? fa : zo).B.handR, kk = inHis ? kf : kz; h.updateWorldMatrix(true, false);
      br.position.copy(h.localToWorld(V(0, .07 * kk, .025 * kk))); br.scale.setScalar(Math.max(.75, kk)); br.updateMatrixWorld(true); }
    const sob = win(8, .4, 1.2, t);
    if (sob > 0) { zo.B.chest.rotation.x += .03 * Math.sin(t * 9) * sob; zo.B.chest.updateWorldMatrix(false, true); }
  },
});

/** the sun and moon bracelets: a gold and a silver ring lying crossed on the palm */
function bracelets(S3) {
  const g = new THREE.Group();
  for (const [col, x, ry] of [[0xe0b040, -.012, .3], [0xd8dde4, .012, -.4]]) {
    const r = new THREE.Mesh(new THREE.TorusGeometry(.045, .009, 10, 32), toon(col)); r.rotation.set(Math.PI / 2, ry, 0); r.position.set(x, 0, 0); g.add(r);
  }
  S3.scene.add(g); return g;
}

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
