// s17 "Le retour". b109 escalier_nuit: the father climbing (on tread 4, back to us, one step forward over the line).
// b110–b116 chambre_penombre (dark, ep05 plate): the door opens (left, x≈150), he stands black against the grey wall,
// gropes along the shelf (b111), she kneels without looking up (b112), he turns to the mattress where Mohammed lies
// awake (b113–b116). b117–b122 chambre_nuit (the lamp lit): her face streaming; he holds the bracelets out (b118), she
// turns her face away (b119), he insists, palm firm (b120), she takes them without looking and throws them in her chest
// (b121), b122 her hand on her heart: "mon cœur ne ment pas".
import * as PO from '../../../engine/poses.js';
import { staged, approach, sideHold, yawToward } from '../lib/fix8b.js';
import { THREE } from '../lib/autostage.js';
import { toon } from '../../../engine/props3d.js';
import { ESCALIER } from '../lib/stairs.js';
import { beatScene, lines, sm, front, at, V } from '../lib/beatscene.js';

const ID = 's17_retour', L = lines(ID);
const B = i => L[i] || [0, 0];
const win = (i, a, b, t) => { const [t0, t1] = B(i), D = t1 - t0; return sm(t0 + a * D, t0 + a * D + .5, t) * (1 - sm(t0 + b * D, t0 + b * D + .5, t)); };
const k = a => a.group.scale.y / 1.6;
const DARK = { keyI: .35, fillI: .22, sky: '#5a5a78', ground: '#2a2018', key: '#a8b4d8', shadow: .2 };

// he climbs treads 2 → 3 with his back to us while the narrator speaks; a slow push-in on the whole flight
const es = staged('escalier_nuit', { father: { tread: 2, face: 'down', seed: 5, height: 1.76, climb: { to: 3, t0: B(0)[0] + .2, t1: B(0)[1] - .2 } } },
  { stairs: ESCALIER, light: DARK, view: () => [1180, 480, 1.06],
    act(lt, t, S, st, S3) {
      const fa = st.A.father;
      // Climb still carries him up the flight; yaw stays inside the lens so the face reads.
      yawToward(fa, S3.cam, 1.05);
      st.actcheck = { supports: { father: fa.group.position.y } };
    } });
// the ep05 penombre plate is a day room: a multiply grade turns it to night (the father's silhouette reads black on grey)
const NIGHT = { grade: 'rgb(84,94,150)', gradeOp: 'multiply', vignette: .85 };

const pe = staged('chambre_penombre', {
  father: { at: [170, 925], face: 'cam', seed: 5, height: 1.76, walk: { to: [430, 880], t0: B(1)[0] + 1.2, t1: B(1)[0] + 3.2 },
    lookMax: .3, look: t => t > B(4)[0] ? [980, 700, .5] : t > B(2)[0] ? [800, 800, 1.05] : null },
  zoubida: { at: [1170, 880], face: [900, 900], pose: 'kneel', seed: 7, look: [1100, 930, 0] },
  // lying along the mattress (side-on to the lens: feet-first he read as a toddler sitting up), face turned to the room
  mohammed: { at: [980, 700], face: Math.PI / 2, pose: 'lie', o: { top: .2, turn: .45, pillow: .1 }, seed: 3, look: null },
}, {
  light: DARK, fx: NIGHT, addressee: { father: 'zoubida', mohammed: 'father' },
  act(lt, t, S, st, S3) {
    const { father: fa, zoubida: zo } = st.A, kf = k(fa);
    yawToward(fa, S3.cam, 1.0);
    sideHold(zo);
    // The solved skull sits a few centimetres off the pillow once the body has settled. Curl it back down.
    const mo = st.A.mohammed, surface = .3;
    for (let i = 0; i < 5; i++) {
      const gap = PO.lowestOf(mo, ['head']) - surface;
      if (Math.abs(gap) < .012) break;
      mo.B.neck.rotation.x += gap > 0 ? -.12 : .12;
      mo.B.head.rotation.x += gap > 0 ? -.08 : .08;
      mo.B.head.updateWorldMatrix(false, true);
    }
    yawToward(mo, S3.cam, 1.25);   // on his side, face turned enough toward the lens for the close-ups
    const grope = win(2, .2, 1, t);   // left hand sliding along the shelf, out in front of the chest
    if (grope > 0) PO.reach(fa, 'L', front(fa, 'chest', .4 * kf, -.28 * kf + .1 * Math.sin(t * 1.6) * kf, .08 * kf), { grip: .12, pole: [.4, .15, .2] });
  },
});

const nu = staged('chambre_nuit', {
  // Zoubida kneels right of the table, turned three-quarters to the lens (toward him, lower left) so her tears read;
  // he stands in the left foreground, facing her
  father: { at: [430, 1010], face: 'zoubida', seed: 5, height: 1.76 },
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
    const take = win(12, 0, .45, t), toss = win(12, .45, .95, t);   // takes them, throws them into the chest (her right)
    const heart = win(13, .45, 1.1, t);
    sideHold(zo, (take > 0 || toss > 0 || heart > 0) ? ['L'] : ['L', 'R']);
    if (offer > 0 && take <= 0) PO.reach(fa, 'R', front(fa, 'chest', .46 * kf, .16 * kf, -.02 * kf), { grip: .08, pole: [-.35, .12, .2] });
    const away = win(10, 0, 1, t);   // she turns her face away from the jewels
    if (away > 0) { zo.B.neck.rotation.y -= .35 * away; zo.B.neck.updateWorldMatrix(false, true); }
    if (take > 0) {
      // Jewels at her shoulder, in front of her, above his thigh. He steps in until the palm can land.
      const gift = PO.hipToWorld(zo, -.16 * kz, .55 * kz, .32 * kz);
      approach(fa, 'R', gift, .04);
      PO.reach(fa, 'R', gift, { grip: .05, pole: [-.32, .18, .22] });
      PO.reach(zo, 'R', gift, { grip: .05, pole: [-.4, .16, .22] });
    }
    if (toss > 0) PO.reach(zo, 'R', PO.hipToWorld(zo, -.34 * kz, .22 * kz, .3 * kz), { grip: 0, pole: [-.45, .1, .2] });
    if (heart > 0) PO.reach(zo, 'R', PO.hipToWorld(zo, -.26 * kz, .32 * kz, .2 * kz), { grip: .02, pole: [-.42, .16, .22] });   // palm at the right side of the chest, off the spine
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
export function bracelets(S3) {
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
    b111: { shot: 'pe', size: 'M', on: 'father', z: 1.35, dy: 55 },
    b112: { shot: 'pe', size: 'M', on: 'zoubida', z: 1.4, dy: 60 },
    b113: { shot: 'pe', size: 'W', on: 'father' },
    b114: { shot: 'pe', size: 'CU', on: 'mohammed' },
    b115: { shot: 'pe', size: 'CU', on: 'father' },
    b116: { shot: 'pe', size: 'CU', on: 'mohammed' },
    b117: { shot: 'nu', size: 'W', on: 'zoubida' },
    b118: { shot: 'nu', size: 'M', on: 'father', z: 1.4, dx: 100, dy: -55 },
    b119: { shot: 'nu', size: 'CU', on: 'zoubida', z: 1.7, dy: 45 },
    b120: { shot: 'nu', size: 'CU', on: 'father', z: 1.45, dy: -35 },
    b121: { shot: 'nu', size: 'M', on: 'zoubida', z: 1.35, dy: -20 },
    b122: { shot: 'nu', size: 'CU', on: 'zoubida', z: 1.55, dy: 50 },
  },
});
