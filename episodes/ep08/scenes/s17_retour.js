// s17 "Le retour". b109 escalier_nuit: the father climbing (on tread 4, back to us, one step forward over the line).
// b110–b116 chambre_penombre (dark, ep05 plate): the door opens (left, x≈150), he stands black against the grey wall,
// gropes along the shelf (b111), she kneels without looking up (b112), he turns to the mattress where Mohammed lies
// awake (b113–b116). b117–b122 chambre_nuit (the lamp lit): her face streaming; he holds the bracelets out (b118), she
// turns her face away (b119), he insists, palm firm (b120), she takes them without looking and throws them in her chest
// (b121), b122 her hand on her heart: "mon cœur ne ment pas".
import * as PO from '../../../engine/poses.js';
import * as IK from '../../../engine/ik.js';
import { approach, yawToward, staged as stagedFix } from '../lib/fix8b.js';
import { staged, THREE } from '../lib/autostage.js';
import { toon } from '../../../engine/props3d.js';
import { ESCALIER } from '../lib/stairs.js';
import { beatScene, lines, sm, front, at, dirW, V } from '../lib/beatscene.js';

const ID = 's17_retour', L = lines(ID);
const B = i => L[i] || [0, 0];
const win = (i, a, b, t) => { const [t0, t1] = B(i), D = t1 - t0; return sm(t0 + a * D, t0 + a * D + .5, t) * (1 - sm(t0 + b * D, t0 + b * D + .5, t)); };
const k = a => a.group.scale.y / 1.6;
const DARK = { keyI: .35, fillI: .22, sky: '#5a5a78', ground: '#2a2018', key: '#a8b4d8', shadow: .2 };

// he climbs treads 2 → 3 with his back to us while the narrator speaks; a slow push-in on the whole flight
const es = stagedFix('escalier_nuit', { father: { tread: 2, face: 'down', seed: 5, height: 1.76, climb: { to: 3, t0: B(0)[0] + .2, t1: B(0)[1] - .2 } } },
  { stairs: ESCALIER, light: DARK, view: () => [1180, 480, 1.06],
    act(lt, t, S, st, S3) {
      const fa = st.A.father;
      // Mostly his back: only enough yaw that the face stays inside the gate's 100° budget.
      yawToward(fa, S3.cam, 1.55);
      st.actcheck = { supports: { father: fa.group.position.y } };
    } });
// the ep05 penombre plate is a day room: a multiply grade turns it to night (the father's silhouette reads black on grey)
const NIGHT = { grade: 'rgb(84,94,150)', gradeOp: 'multiply', vignette: .85 };

const PEN_BED = [[900, 575], [1185, 575], [1185, 665], [900, 670]];   // centre/left divan, same layout as jour
const CHEST_J = [[1450, 580], [1830, 580], [1830, 850], [1450, 850]];
const NUIT_BED = [[1055, 588], [1412, 588], [1420, 772], [1148, 748]];
const CHEST_N = [[1418, 585], [1830, 585], [1830, 890], [1418, 890]];
// Hands on the thighs. The wide side-hold read as arms stuck straight out.
function lap(a) {
  const kk = k(a);
  for (const [s, sign] of [['L', 1], ['R', -1]]) PO.reach(a, s, PO.hipToWorld(a, sign * .12 * kk, .05 * kk, .22 * kk), { grip: .03, pole: [sign * .28, .04, .1] });
}
// Only pull a skirt panel down when it is sticking out behind the shoulders as a rigid plank.
function veilDown(a) {
  const B = a.B; if (!B.SkirtBack2) return;
  const hip = at(a, 'root'), tip = IK.wpos(B.SkirtBack2, [0, -1, 0]);
  const back = tip.clone().sub(hip); back.y = 0;
  if (back.length() > .22 && tip.y > .16) IK.aim(B.SkirtBack2, IK.wpos(B.SkirtBack2, [0, -1, 0]), hip.clone().addScaledVector(back.normalize(), .08).setY(.03));
}
const pe = staged('chambre_penombre', {
  father: { at: [170, 925], face: [1000, 640], seed: 5, height: 1.76, walk: { to: [430, 860], t0: B(1)[0] + 1.2, t1: B(1)[0] + 3.2 },
    lookMax: .95, look: t => t > B(4)[0] ? 'mohammed' : t > B(2)[0] ? [800, 760, 1.05] : null },
  zoubida: { at: [1170, 860], face: [700, 900], pose: 'kneel', o: { grounded: true, lean: .1, hands: false }, seed: 7, hands: false, look: [1000, 700, .4] },
  // left divan: head toward the back cushions, feet down the cloth, not spun toward the lens (that walked him off the bed)
  mohammed: { at: [1011, 662], face: [812, 683], pose: 'lie', o: { top: .2, turn: .12, pillow: .1, hands: 'belly', mattress: PEN_BED, avoid: CHEST_J }, seed: 3, look: null },
}, {
  light: DARK, fx: NIGHT, addressee: { father: 'zoubida', mohammed: 'father' },
  act(lt, t, S, st, S3) {
    const { father: fa, zoubida: zo } = st.A, kf = k(fa);
    yawToward(fa, S3.cam, 1.5);
    lap(zo); veilDown(zo);
    const mo = st.A.mohammed, surface = .3;
    for (let i = 0; i < 5; i++) {
      const gap = PO.lowestOf(mo, ['head']) - surface;
      if (Math.abs(gap) < .012) break;
      mo.B.neck.rotation.x += gap > 0 ? -.12 : .12;
      mo.B.head.rotation.x += gap > 0 ? -.08 : .08;
      mo.B.head.updateWorldMatrix(false, true);
    }
    const grope = win(2, .2, 1, t);
    if (grope > 0) PO.reach(fa, 'L', front(fa, 'chest', .34 * kf, -.22 * kf + .06 * Math.sin(t * 1.6) * kf, .02 * kf), { grip: .08, pole: [.35, .1, .15] });
  },
});

const nu = staged('chambre_nuit', {
  // Zoubida kneels right of the table, turned three-quarters to the lens (toward him, lower left) so her tears read;
  // he stands in the left foreground, facing her
  father: { at: [430, 1010], face: 'zoubida', seed: 5, height: 1.76 },
  // b117 she lifts her wet face to him (a bowed head showed only hair); b119 she turns away from the jewels; b121 to her chest
  zoubida: { at: [980, 880], face: [560, 1000], pose: 'kneel', o: { grounded: true, lean: .08, hands: false }, seed: 7, hands: false, lookMax: 1.15,
    look: t => t >= B(8)[0] && t < B(10)[0] ? 'father' : t >= B(10)[0] ? [1680, 760, .7] : null },
  mohammed: { at: [1301, 764], face: [1384, 841], pose: 'lie', o: { top: .35, turn: .12, pillow: .08, hands: 'belly', mattress: NUIT_BED, avoid: CHEST_N }, seed: 3, talk: 0 },
}, {
  light: { keyI: 1.5, key: '#ffc070', fillI: .55 },
  addressee: { father: 'zoubida', zoubida: 'father' },
  act(lt, t, S, st, S3) {

    const { father: fa, zoubida: zo } = st.A, kf = k(fa), kz = k(zo);
    const offer = Math.max(win(9, .5, 1, t), win(10, 0, 1, t), win(11, 0, .55, t));
    const take = win(12, 0, .4, t), toss = win(12, .4, 1, t);
    const heart = win(13, .3, 1.2, t);
    lap(zo);
    if (offer > 0 && take <= 0) {
      PO.reach(fa, 'R', front(fa, 'chest', .42 * kf, .18 * kf, -.04 * kf), { grip: 0, pole: [-.32, .06, .16] });
      PO.fingers(fa, 'R', 0, { thumb: 0, spread: .25 });
    }
    if (take > 0) {
      const gift = PO.hipToWorld(zo, -.1 * kz, .42 * kz, .28 * kz);
      approach(fa, 'R', gift, .05);
      PO.reach(fa, 'R', gift, { grip: 0, pole: [-.3, .12, .18] });
      PO.fingers(fa, 'R', 0, { spread: .2 });
      PO.reach(zo, 'R', gift, { grip: .02, pole: [-.32, .1, .16] });
    }
    if (toss > 0) {
      const aim = S3.floorAt(1620, 700); aim.y = at(zo, 'chest').y + .05 * kz;
      const shoulder = at(zo, 'upperArmR'), dir = aim.clone().sub(shoulder);
      const len = shoulder.distanceTo(at(zo, 'foreArmR')) + at(zo, 'foreArmR').distanceTo(at(zo, 'handR'));
      if (dir.length() > len * .82) dir.setLength(len * .82);
      PO.reach(zo, 'R', shoulder.clone().add(dir), { grip: 0, pole: [-.3, .15, .2] });
    }
    if (heart > 0) {
      PO.reach(zo, 'R', PO.hipToWorld(zo, -.06 * kz, .38 * kz, .16 * kz), { grip: 0, pole: [-.28, .12, .14] });
      PO.fingers(zo, 'R', .05, { spread: .2 });
    }
    const br = st.br ||= bracelets(S3);
    const inHis = offer > .5 && take < .5, inHers = take >= .5 && toss < .35;
    br.visible = inHis || inHers;
    if (br.visible) {
      const who = inHis ? fa : zo, side = 'R';
      PO.fingers(who, side, 0, { thumb: .05, spread: .3 });
      const palm = PO.handPts(who, side).palm;
      br.position.copy(palm).add(V(0, .015 * k(who), 0));
      br.scale.setScalar(1.15 * Math.max(.85, k(who)));
      br.updateMatrixWorld(true);
    }
    veilDown(zo);
    const holder = inHis ? 'father' : 'zoubida';
    st.actcheck = (inHis || inHers) ? { held: { actor: holder, side: 'R', prop: br, max: .08, required: true } } : {};
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
    b111: { shot: 'pe', size: 'M', on: 'father', z: 1.3, dy: 20 },
    b112: { shot: 'pe', size: 'M', on: 'zoubida', z: 1.35, dx: -40, dy: -30 },
    b113: { shot: 'pe', size: 'W', on: 'father' },
    b114: { shot: 'pe', size: 'CU', on: 'mohammed', z: 3.2, dy: -40 },
    b115: { shot: 'pe', size: 'CU', on: 'father', z: 1.7, dy: -50 },
    b116: { shot: 'pe', size: 'CU', on: 'mohammed', z: 3.2, dy: -40 },
    b117: { shot: 'nu', size: 'W', on: 'zoubida' },
    b118: { shot: 'nu', size: 'M', on: 'father', z: 1.35, dx: 40, dy: -40 },
    b119: { shot: 'nu', size: 'CU', on: 'zoubida', z: 1.85, dy: -35 },
    b120: { shot: 'nu', size: 'CU', on: 'father', z: 1.7, dy: -45 },
    b121: { shot: 'nu', size: 'M', on: 'zoubida', z: 1.4, dx: 80, dy: -30 },
    b122: { shot: 'nu', size: 'CU', on: 'zoubida', z: 1.85, dy: -30 },
  },
});
