// s17 "Le retour". b109 escalier_nuit: the father climbing (on tread 4, back to us, one step forward over the line).
// b110–b116 chambre_penombre (dark, ep05 plate): the door opens (left, x≈150), he stands black against the grey wall,
// gropes along the shelf (b111), she kneels without looking up (b112), he turns to the mattress where Mohammed lies
// awake (b113–b116). b117–b122 chambre_nuit (the lamp lit): her face streaming; he holds the bracelets out (b118), she
// turns her face away (b119), he insists, palm firm (b120), she takes them without looking and throws them in her chest
// (b121), b122 her hand on her heart: "mon cœur ne ment pas".
import * as PO from '../../../engine/poses.js';
import * as IK from '../../../engine/ik.js';
import { approach, yawToward, staged as stagedFix } from '../lib/fix8b.js';
import { bareHead } from '../lib/fix8_g5.js';
import { staged, THREE } from '../lib/autostage.js';
import { toon } from '../../../engine/props3d.js';
import { ESCALIER } from '../lib/stairs.js';
import { settleRobe } from '../lib/fix8g.js';
import { armToward } from '../lib/fix8_R15E.js';
import { beatScene, lines, sm, front, at, V, yawTo } from '../lib/beatscene.js';

const ID = 's17_retour', L = lines(ID);
const B = i => L[i] || [0, 0];
const win = (i, a, b, t) => { const [t0, t1] = B(i), D = t1 - t0; return sm(t0 + a * D, t0 + a * D + .5, t) * (1 - sm(t0 + b * D, t0 + b * D + .5, t)); };
const k = a => a.group.scale.y / 1.6;
const DARK = { keyI: .35, fillI: .22, sky: '#5a5a78', ground: '#2a2018', key: '#a8b4d8', shadow: .2 };

// he climbs treads 2 → 3 with his back to us while the narrator speaks; a slow push-in on the whole flight
const es = stagedFix('escalier_nuit', { father: { backOk: true, tread: 2, face: 'up', seed: 5, height: 1.76, climb: { to: 3, t0: .1, t1: B(0)[1] - .3 } } },
  { stairs: ESCALIER, light: DARK, view: () => [1180, 105, 1.04],
    act(lt, t, S, st, S3) {
      const fa = st.A.father; bareHead(fa);
      // R25M: back to the lens, climbing UP the flight; arms swing in counter-phase with the stride
      { const kk = k(fa), w = Math.sin((t - .1) * 4.2), sg = [1, -1];
        ['L', 'R'].forEach((sd, i) => PO.reach(fa, sd, PO.hipToWorld(fa, sg[i] * .17 * kk, (-.04) * kk, (.07 + .13 * w * sg[i]) * kk), { grip: .1, pole: [sg[i] * .2, -.3, -.1] })); }
      settleRobe(fa);
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
  father: { at: [400, 890], face: [1000, 800], seed: 5, height: 1.76, walk: { to: [450, 870], t0: B(1)[0] + 1.2, t1: B(1)[0] + 3.2 },
    lookMax: .9, look: (t, st) => {
      if (!(t > B(4)[0])) return null;
      const p = at(st.A.mohammed, 'head').clone();
      p.y = Math.max(p.y, at(st.A.father, 'head').y - .22);
      return p;
    } },
  zoubida: { at: [720, 950], face: 'cam', yaw: .45, pose: 'kneel', o: { grounded: true, lean: .1, hands: false }, seed: 7, hands: false, lookMax: .6, look: null },   // R25M: head forced down in act (below)
  // left divan: head toward the back cushions, feet down the cloth, not spun toward the lens (that walked him off the bed)
  mohammed: { at: [1011, 662], face: [812, 683], pose: 'lie', o: { top: .2, turn: .12, headTurn: .15, pillow: .1, hands: 'belly', mattress: PEN_BED, avoid: CHEST_J }, seed: 3, look: null, height: 1.1 },
}, {
  light: DARK, fx: NIGHT, addressee: { father: 'zoubida', mohammed: 'father' },
  act(lt, t, S, st, S3) {
    const { father: fa, zoubida: zo } = st.A, kf = k(fa); bareHead(fa);
    if (t < B(4)[0] - .05) yawToward(fa, S3.cam, 1.6);
    // R25M b113: from the mattress line on he turns his body toward Mohammed's divan
    if (t < B(4)[0] - .05) st.fy0 = fa.group.rotation.y;
    else if (st.fy0 != null) {
      const d = yawTo(fa.group.position, st.A.mohammed.group.position) - st.fy0, w = sm(B(4)[0] - .1, B(4)[0] + .6, t);
      fa.group.rotation.y = st.fy0 + Math.atan2(Math.sin(d), Math.cos(d)) * w * 1.0; fa.group.updateMatrixWorld(true);
    }
    lap(zo); veilDown(zo);
    if (!st.zwrap) { st.zwrap = true; const o = st.G.apply; st.G.apply = tt => { o(tt); const h = zo.B.head, n = zo.B.neck; n.rotation.x += .3; h.rotation.x += .35; h.rotation.y += .25; h.updateWorldMatrix(false, true); }; }
    // R25M: relaxed free arm, small talk motion
    { const sg = -1, w = Math.sin(t * 1.3 + 1); if (!(win(2, .2, 1, t) > 0)) PO.reach(fa, 'R', PO.hipToWorld(fa, sg * .16 * kf, (-.05 + .02 * w) * kf, .08 * kf), { grip: .12, pole: [sg * .15, -.3, -.1] });
      PO.reach(fa, 'L', PO.hipToWorld(fa, .16 * kf, -.06 * kf, .07 * kf), { grip: .1, pole: [.15, -.3, -.1] }); }
    const mo = st.A.mohammed, surface = .3;
    mo.B.chest.rotation.x += .01 * Math.sin(t * 1.5);
    for (let i = 0; i < 5; i++) {
      const gap = PO.lowestOf(mo, ['head']) - surface;
      if (Math.abs(gap) < .012) break;
      mo.B.neck.rotation.x += gap > 0 ? -.12 : .12;
      mo.B.head.rotation.x += gap > 0 ? -.08 : .08;
      mo.B.head.updateWorldMatrix(false, true);
    }
    const grope = win(2, .2, 1, t);
    // R25M: a plain shelf (plank + tea box) on the wall at his hand height; fixed once he has stopped walking
    if (t >= B(2)[0] - .3) {
      if (!st.shelf) {
        const R = V(1, 0, 0).applyQuaternion(S3.cam.quaternion).setY(0).normalize(), c = at(fa, 'chest').clone().addScaledVector(R, -.5).addScaledVector(V(0, 0, 1).applyQuaternion(S3.cam.quaternion).setY(0).normalize(), -.15).add(V(0, -.02, 0)), g = new THREE.Group();
        const plank = new THREE.Mesh(new THREE.BoxGeometry(.7, .025, .16), toon(0xe8c078)); g.add(plank);
        const box = new THREE.Mesh(new THREE.BoxGeometry(.14, .12, .12), toon(0xb0402a)); box.position.set(-.2, .08, 0); g.add(box);
        g.position.copy(c); g.rotation.y = Math.atan2(S3.cam.position.x - c.x, S3.cam.position.z - c.z); S3.scene.add(g); st.shelf = g;
      }
    }
    if (grope > 0 && st.shelf) { const R = V(1, 0, 0).applyQuaternion(S3.cam.quaternion).setY(0).normalize(); PO.reach(fa, 'R', st.shelf.position.clone().addScaledVector(R, .12 * Math.sin(t * 1.4)).add(V(0, .03, 0)), { grip: .08, pole: [-.35, .1, .15] }); }
    else if (grope > 0) { const sd = armToward(fa, zo) === 'L' ? 'R' : 'L', sg = sd === 'L' ? 1 : -1; PO.reach(fa, sd, front(fa, 'chest', .44 * kf, sg * (.06 + .1 * Math.sin(t * 1.6)) * kf, .12 * kf), { grip: .08, pole: [sg * .35, .1, .15] }); }
  },
});

const nu = staged('chambre_nuit', {
  // Zoubida kneels right of the table, turned three-quarters to the lens (toward him, lower left) so her tears read;
  // he stands in the left foreground, facing her
  father: { at: [480, 900], face: 'cam', yaw: .2, seed: 5, height: 1.76, lookMax: .35,
    look: (t, st) => { const p = at(st.A.zoubida, 'head').clone(); p.y = Math.max(p.y, at(st.A.father, 'head').y - .18); return p; } },
  // b117 she lifts her face toward him; from b119 she glances toward the chest without turning her back on the lens
  zoubida: { at: [1010, 905], face: 'cam', yaw: -.7, seed: 7, hands: false, lookMax: .6,
    look: (t, st, S3) => {
      if (t >= B(8)[0] && t < B(10)[0]) { const p = at(st.A.father, 'head').clone(); p.y = Math.max(p.y, at(st.A.zoubida, 'head').y - .15); return p; }
      if (t >= B(10)[0]) { const h = at(st.A.zoubida, 'head'), R = V(1, 0, 0).applyQuaternion(S3.cam.quaternion); R.y = 0; R.normalize(); return h.clone().addScaledVector(R, 1.2).add(V(0, -.18, 0)); }   // R25M: away from him, screen right, level (not the ceiling)
      return null;
    } },
  mohammed: { at: [1170, 665], face: [1290, 690], pose: 'lie', o: { top: .35, turn: .12, pillow: .08, hands: 'belly', mattress: NUIT_BED, avoid: CHEST_N }, seed: 3, talk: 0, height: 1.1 },
}, {
  light: { keyI: 1.5, key: '#ffc070', fillI: .55 },
  addressee: { father: 'zoubida', zoubida: 'father' },
  act(lt, t, S, st, S3) {

    const { father: fa, zoubida: zo } = st.A, kf = k(fa), kz = k(zo); bareHead(fa);
    st.A.mohammed.B.chest.rotation.x += .01 * Math.sin(t * 1.5);
    st.zy0 ??= zo.group.rotation.y;
    { // R25M: body turns away from him (b119/b120), to the chest (b121 toss), half back to us for her heart (b122)
      const yc = yawTo(zo.group.position, S3.floorAt(1560, 800)), d0 = Math.atan2(Math.sin(yc - st.zy0), Math.cos(yc - st.zy0));
      const w = Math.min(1, Math.max((win(10, .05, 1, t) + win(11, 0, 1, t)) * .62, .3 * win(12, 0, .4, t) + .5 * win(12, .3, 1, t), .3 * win(13, 0, 1, t)));
      zo.group.rotation.y = st.zy0 + d0 * w; zo.group.updateMatrixWorld(true);
    }
    st.z0 ??= zo.group.position.clone();
    { const g = S3.floorAt(1400, 840), s2 = sm(B(12)[0] + .45 * (B(12)[1] - B(12)[0]), B(12)[0] + .45 * (B(12)[1] - B(12)[0]) + 1, t) * (1 - sm(B(13)[0] - .3, B(13)[0], t));
      zo.group.position.set(st.z0.x + (g.x - st.z0.x) * s2, st.z0.y, st.z0.z + (g.z - st.z0.z) * s2); zo.group.updateMatrixWorld(true); }
    // the surface lowers Mohammed's head onto the pillow
    { const mo = st.A.mohammed;
      for (let i = 0; i < 5; i++) { const gap = PO.lowestOf(mo, ['head']) - .45; if (Math.abs(gap) < .012) break; mo.B.neck.rotation.x += gap > 0 ? -.12 : .12; mo.B.head.rotation.x += gap > 0 ? -.08 : .08; mo.B.head.updateWorldMatrix(false, true); } }
    // father steps in so the hand-over is within arm's reach
    st.gap0 ??= Math.hypot(zo.group.position.x - fa.group.position.x, zo.group.position.z - fa.group.position.z);
    { const dv = zo.group.position.clone().sub(fa.group.position).setY(0).normalize(), s = Math.max(0, st.gap0 - 1.0) * sm(B(11)[0] + .3, B(11)[0] + 1.3, t) * (1 - sm(B(12)[0] + .5 * (B(12)[1] - B(12)[0]), B(13)[0], t));
      st.fx0 ??= fa.group.position.clone(); fa.group.position.set(st.fx0.x + dv.x * s, st.fx0.y, st.fx0.z + dv.z * s); fa.group.updateMatrixWorld(true); }
    const toZ = () => { const sh = at(fa, 'upperArmR'), tgt = at(zo, 'chest').clone().sub(sh).setY(0).normalize(); return sh.clone().addScaledVector(tgt, 1).setY(sh.y); };
    const offer = Math.max(win(9, .05, 1, t), win(10, 0, 1, t), win(11, 0, .55, t));
    const take = win(12, 0, .4, t), toss = win(12, .4, 1, t);
    const heart = win(13, .3, 1.2, t);
    if (!(offer > 0 || take > 0 || toss > 0 || heart > 0)) for (const [sd, sg] of [['L', 1], ['R', -1]]) PO.reach(zo, sd, PO.hipToWorld(zo, sg * .15 * kz, (-.03 + .015 * Math.sin(t * 1.2 + sg)) * kz, .08 * kz), { grip: .1, pole: [sg * .15, -.3, -.1] });
    PO.reach(fa, 'L', PO.hipToWorld(fa, .16 * kf, -.05 * kf, .07 * kf), { grip: .1, pole: [.15, -.3, -.1] });
    if (!(offer > 0 || take > 0)) PO.reach(fa, 'R', PO.hipToWorld(fa, -.16 * kf, (-.04 + .02 * Math.sin(t * 1.5)) * kf, .08 * kf), { grip: .12, pole: [-.15, -.3, -.1] });
    if (offer > 0 && take <= 0) {
      const sh = at(fa, 'upperArmR'), reach = .46 * kf;   // R25M: held out toward her, palm open and firm (b120 reaches further)
      const p = sh.clone().addScaledVector(toZ().sub(sh).normalize(), reach * (1 + .1 * win(11, 0, 1, t))); p.y = sh.y - .22 * kf;
      PO.reach(fa, 'R', p, { grip: 0, pole: [-.6, .15, .1] });
      PO.fingers(fa, 'R', 0, { thumb: 0, spread: .25 });
    }
    if (take > 0) {
      // Meet between them. Stepping into her put his legs through her lap and his arm through his own chest.
      const clamp = (a, side, target) => {
        const sh = at(a, 'upperArm' + side), len = sh.distanceTo(at(a, 'foreArm' + side)) + at(a, 'foreArm' + side).distanceTo(at(a, 'hand' + side));
        const d = target.clone().sub(sh); if (d.length() > len * .86) target = sh.clone().addScaledVector(d.normalize(), len * .86);
        return target;
      };
      const shf = at(fa, 'upperArmR'), offer = shf.clone().addScaledVector(toZ().sub(shf).normalize(), .57 * kf); offer.y = shf.y - .2 * kf;
      PO.reach(fa, 'R', clamp(fa, 'R', offer), { grip: 0, pole: [-.6, .15, .1] });
      PO.fingers(fa, 'R', 0, { spread: .25 });
      const palmF = PO.handPts(fa, 'R').palm;   // her hand goes to his hand
      PO.reach(zo, 'R', clamp(zo, 'R', palmF.clone().add(V(0, .05, 0))), { grip: 0, pole: [-.4, .18, .16] });
    }
    if (toss > 0) {
      const aim = S3.floorAt(1580, 800) || at(zo, 'chest').clone(); aim.y = .75 + .1 * Math.sin(t * 9) * .0;   // R25M: arm toward the chest, flung out to its near end
      const shoulder = at(zo, 'upperArmR'), dir = aim.clone().sub(shoulder);
      const len = shoulder.distanceTo(at(zo, 'foreArmR')) + at(zo, 'foreArmR').distanceTo(at(zo, 'handR'));
      if (dir.length() > len * .95) dir.setLength(len * .95);
      PO.reach(zo, 'R', shoulder.clone().add(dir), { grip: 0, pole: [-1.1, .3, 2.2] });   // R31C: pole pushed further out, the forearm crossed his own torso at b121
    }
    if (heart > 0) {
      PO.reach(zo, 'R', front(zo, 'chest', .15 * kz, -.07 * kz, -.2 * kz), { grip: 0, pole: [-.8, .05, -.1] });   // R25M: flat on the heart, below the collarbone
      PO.fingers(zo, 'R', .05, { spread: .2 });
    }
    if (heart > 0 || take > 0 || toss > 0) PO.reach(zo, 'L', PO.hipToWorld(zo, .15 * kz, -.03 * kz, .08 * kz), { grip: .1, pole: [.15, -.3, -.1] });
    const br = st.br ||= bracelets(S3);
    const inHis = t >= B(9)[0] && take < .5 && toss <= 0, inHers = take >= .5 && toss < .6 && t < B(13)[0];
    br.visible = inHis || inHers;
    if (br.visible) {
      const who = inHis ? fa : zo;
      PO.fingers(who, 'R', 0, { thumb: .05, spread: .3 });
      const palm = PO.handPts(who, 'R').palm;
      br.position.copy(palm).add(V(0, .05 * k(who), 0));
      br.lookAt(S3.cam.position); br.scale.setScalar(1.6 * Math.max(.85, k(who)));
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
    const r = new THREE.Mesh(new THREE.TorusGeometry(.045, .011, 10, 40), toon(col)); r.material.emissive?.setHex(col); if (r.material.emissiveIntensity != null) r.material.emissiveIntensity = .3; r.rotation.set(0, ry * .3, 0); r.position.set(x * 3, x * 1.5, 0); g.add(r);
  }
  S3.scene.add(g); return g;
}

export default beatScene(ID, {
  shots: { es, pe, nu },
  plan: {
    b109: { shot: 'es', size: 'W', on: 'father' },
    b110: { shot: 'pe', size: 'W', on: 'zoubida', z: 1.1, dx: 60, dy: 30 },
    b111: { shot: 'pe', size: 'W', on: 'father', z: 1.0 },
    b112: { shot: 'pe', size: 'W', on: 'zoubida', z: 1.0, dx: -60 },
    b113: { shot: 'pe', size: 'W', on: 'father' },
    b114: { shot: 'pe', size: 'CU', on: 'mohammed', z: 3.2, dy: -50 },
    b115: { shot: 'pe', size: 'W', on: 'father', z: 1.0 },
    b116: { shot: 'pe', size: 'CU', on: 'mohammed', z: 3.2, dy: -50 },
    b117: { shot: 'nu', size: 'M', on: 'zoubida', z: 1.6, dx: -120, dy: -80 },
    b118: { shot: 'nu', size: 'M', on: 'father', z: 1.5, dx: 120, dy: -50 },
    b119: { shot: 'nu', size: 'CU', on: 'zoubida', z: 2.1, dx: 140, dy: -55 },
    b120: { shot: 'nu', size: 'M', on: 'father', z: 1.5, dx: 130, dy: -50 },
    b121: { shot: 'nu', size: 'M', on: 'zoubida', z: 1.1, dx: 120, dy: -70 },
    b122: { shot: 'nu', size: 'CU', on: 'zoubida', z: 1.8, dx: 230, dy: -50 },
  },
});
