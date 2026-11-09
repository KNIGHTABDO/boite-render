// s13 "L'attente". souk_mur: a sunny passage, a long stone bench along the left wall (front edge ≈ (20,750)→(560,560)),
// the dried-fruit counter on the right. The family waits on the floor in front of the bench. b083 CU low on Mohammed:
// the knees give, the trunk sags, a huge yawn (jaw wide, head back, eyes shut), then he leans on his mother's haik.
// b084 souk_bijoux: the dellal comes back down the lane, arm up with the pair, shouts the higher figure; the father's
// small nod; the dellal turns and goes again. b085 W, souk_bijoux: the souk at full boil: the dellal runs up the lane
// dragging a client by the hand, a woman and two urchins hurry the other way. b086 souk_mur: a wave of people rushes past
// in front of them and the three are shoved back against the bench (bodies jolt back, Zoubida's arm goes round the boy).
// b087 CU (OTS): the father has the boy up in his arms, the boy's cheek on his shoulder, the father's chest heaving.
// b088 CU low on Zoubida: sharp head jerks, her right hand slicing the air. b089 souk_bijoux: the father and Zoubida
// scan the crowd, heads turning slowly; nobody.
import * as PO from '../../../engine/poses.js';
import * as IK from '../../../engine/ik.js';
import { staged } from '../lib/autostage.js';
import { walk } from '../lib/acts.js';
import { rest } from '../../../engine/rig3d.js';
import { bracelets } from './s17_retour.js';
import { beatScene, lines, sm, front, at, V, yawTo } from '../lib/beatscene.js';

const ID = 's13_attente', L = lines(ID), B = i => L[i] || [0, 0];
const k = a => a.group.scale.y / 1.6;
const f = (i, x) => B(i)[0] + x * (B(i)[1] - B(i)[0]);
const win = (i, a, b, t) => sm(f(i, a) - .3, f(i, a) + .3, t) * (1 - sm(f(i, b), f(i, b) + .5, t));

// the wall blocking, shared with s14/s15: backs to the bench, facing the lens and a little right
export const MUR = { zoubida: [420, 790], mohammed: [560, 820], fatma: [700, 735], father: [690, 860] };

// Local spacing leaves the boy a clear silhouette beside the haik; MUR stays shared and unchanged.
const WALL = { zoubida: MUR.zoubida, mohammed: [565, 790], father: [760, 790] };
const LANE = { father: [420, 790], mohammed: [560, 830], zoubida: [700, 790] };
const child = a => { a.group.scale.setScalar(1.1); a.group.updateMatrixWorld(true); };
const sync = (...actors) => actors.forEach(a => a.group.updateMatrixWorld(true));
const scriptedGaze = { apply() {} };
// Haik hands emerge in front of the drape, never through the cloth at the hip.
const closeHaik = a => {
  for (const s of ['L', 'R']) PO.reach(a, s, front(a, 'chest', .28 * k(a), (s === 'R' ? .12 : -.12) * k(a), -.10 * k(a)), { grip: .015 });
};

const mu = staged('souk_mur', {
  zoubida: { at: WALL.zoubida, face: 'cam', yaw: .28, costume: 'haik', seed: 7, talk: 0, lookMax: .25,
    look: t => t < B(1)[0] ? 'mohammed' : [1000, 790, 1.5] },
  mohammed: { at: WALL.mohammed, face: 'cam', yaw: -.12, seed: 3, talk: 0, lookMax: 0,
    lids: t => .35 + .65 * win(0, .46, .88, t),
    // mutter's face driver multiplies by .25.. .5: four keeps the yawn wide throughout its hold.
    mutter: t => 4 * win(0, .46, .88, t) },
  father: { at: WALL.father, face: 'cam', yaw: -.35, seed: 5, talk: 0, lookMax: .35, look: [1100, 700, 1.5] },
  man1: { at: [1330, 930], face: [120, 905], seed: 21, talk: 0 },
  fqih: { at: [1330, 980], face: [120, 905], seed: 23, talk: 0 },
  guerrab: { at: [1250, 940], face: [200, 880], seed: 24, talk: 0 },
  driss: { at: [1330, 930], face: [120, 905], seed: 26, talk: 0 },
  woman1: { at: [1250, 940], face: [200, 880], seed: 25, talk: 0 },
}, {
  light: { shadow: .4, area: 6 },
  act(lt, t, S, st, S3) {
    // The later Zoubida line otherwise makes the gaze net turn the boy toward her even in b083.
    st.G = scriptedGaze;
    const { zoubida: zo, mohammed: mo, father: fa } = st.A;
    child(mo); closeHaik(zo);
    const km = k(mo), kz = k(zo);
    // b083: a planted-foot buckle, already tired during pre-roll, then a deeper collapse.
    if (t < B(1)[0]) {
      fa.group.position.copy(S3.floorAt(1250, 790));
      const sag = .30 + .70 * sm(B(0)[0] - 1.6, f(0, .18), t);
      const yawn = win(0, .46, .88, t), lean = sm(f(0, .87), B(0)[1], t);
      const feet = ['L', 'R'].map(s => at(mo, 'foot' + s));
      const soles = ['L', 'R'].map(s => mo.B['foot' + s].getWorldQuaternion(mo.B['foot' + s].quaternion.clone()));
      PO.setHipY(mo, at(mo, 'root').y - .14 * sag);
      for (const [i, s] of ['L', 'R'].entries()) {
        IK.leg(mo, s, feet[i], front(mo, 'root', .48 * km, (s === 'R' ? .14 : -.14) * km, .04));
        const foot = mo.B['foot' + s], parent = foot.parent.getWorldQuaternion(foot.quaternion.clone());
        foot.quaternion.copy(parent.invert().multiply(soles[i]));
      }
      mo.B.spine.rotation.x += .42 * sag;
      mo.B.chest.rotation.x += .12 * sag;
      mo.B.neck.rotation.x -= .95 * yawn;
      mo.B.head.rotation.x -= .18 * yawn;
      // Only the upper body leans: the shoulder/sleeve retains its clearance from the haik.
      mo.B.spine.rotation.z += .22 * lean;
      mo.B.head.rotation.z += .26 * lean;
      sync(mo);
      for (const s of ['L', 'R']) PO.reach(mo, s, front(mo, 'root', .10, s === 'R' ? .09 : -.09, .06), { grip: .01 });
      if (lean > 0) {
        // His near palm rests on the OUTSIDE of the cloth; neither shoulder moves into it.
        const cloth = front(zo, 'root', .18 * kz, -.29 * kz, .12);
        PO.reach(mo, 'R', front(mo, 'root', .1, .09, .06).lerp(cloth, lean), { grip: .01 });
      }
    }

    // b086: five staggered foreground crossings. At most two cross the family together;
    // the family spans 580px, so one passing body cannot erase all three silhouettes.
    const rush = [
      ['man1', [1330, 930], [120, 905], .00],
      ['fqih', [1330, 980], [200, 930], .16],
      ['guerrab', [1250, 940], [120, 905], .32],
      ['driss', [1330, 930], [200, 930], .48],
      ['woman1', [1250, 940], [120, 905], .64],
    ];
    for (const [n, p0, p1, delay] of rush) {
      const a = st.A[n], t0 = f(3, delay), t1 = t0 + 1.9;
      a.group.visible = t >= t0 && t <= t1;
      if (a.group.visible) {
        rest(a.B); walk(a, S3.floorAt(...p0), S3.floorAt(...p1), t0, t1, t, { cps: 3.8, ease: false });
        a.B.spine.rotation.x += .22; sync(a);
      }
    }
    const shove = win(3, -.02, .9, t);
    const jolt = shove * (.75 + .25 * Math.max(0, Math.sin((t - B(3)[0]) * 9)));
    for (const a of [zo, mo, fa]) {
      const back = a.group.position.clone().sub(S3.cam.position).setY(0).normalize();
      a.group.position.addScaledVector(back, .12 * jolt);
      a.B.spine.rotation.x -= .30 * jolt; a.B.neck.rotation.x += .12 * jolt;
      a.B.thighR.rotation.x += .18 * jolt; a.B.shinR.rotation.x += .25 * jolt;
    }
    sync(zo, mo, fa);
    if (shove > 0) {
      // Reach to the CHILD's shoulder height, with the elbow outside the haik.
      const wrap = at(mo, 'upperArmR').add(V(0, .12, .05));
      wrap.addScaledVector(zo.group.position.clone().sub(mo.group.position).setY(0).normalize(), .055);
      PO.reach(zo, 'L', wrap, { grip: .01, pole: [.45, .12, .2] });
      PO.reach(mo, 'L', front(mo, 'chest', .16, -.12, -.08), { grip: .01 });
    }

    // b088: shoulder-high cuts, clear of the veil; keep the other palm in front of the cloth.
    if (t >= B(5)[0]) {
      // The family remains beside her, outside this close-up's right edge.
      mo.group.position.copy(S3.floorAt(1000, 790));
      fa.group.position.copy(S3.floorAt(1250, 790));
      const ph = (t - B(5)[0]) * 1.65, cut = Math.sin(ph * Math.PI * 2) ** 3;
      zo.B.head.rotation.y += .30 * Math.sin(ph * 4.2) ** 3;
      zo.B.neck.rotation.x += .17 * Math.max(0, Math.sin(ph * 5.1)) ** 4;
      sync(zo);
      PO.reach(zo, 'R', front(zo, 'upperArmR', .34 * kz, (.22 + .12 * cut) * kz, (.05 - .10 * cut) * kz),
        { grip: .01, pole: [-.45, .35, .12] });
      PO.fingers(zo, 'R', .05, { spread: .35 });
      PO.palmTo(zo, 'R', 1, V(0, -1, 0));
      closeHaik(zo);
    }
    sync(zo, mo, fa);
  },
});

// b087: use the standing child rig at its normal 1.10m scale. A floor-seated pose would
// pull the robe down to the floor after lifting it; here the bent legs and robe dangle together.
const ca = staged('souk_mur', {
  father: { at: [1000, 790], face: 'cam', yaw: 2.5, seed: 5, talk: 0, lookMax: .12 },
  mohammed: { at: [1180, 820], face: 'cam', seed: 3, lids: .7, talk: 0, lookMax: 0 },
  zoubida: { at: WALL.zoubida, face: 'cam', yaw: .28, costume: 'haik', seed: 7, talk: 0, look: 'mohammed', lookMax: .25 },
}, {
  light: { shadow: .4, area: 6 },
  act(lt, t, S, st) {
    const { father: fa, mohammed: mo, zoubida: zo } = st.A;
    child(mo); closeHaik(zo);
    const kf = k(fa), km = k(mo), lift = sm(B(4)[0] - .5, B(4)[0] + .08, t);
    fa.B.chest.rotation.x -= .065 + .05 * Math.sin((t - B(4)[0]) * 3.4);
    fa.B.neck.rotation.x += .10;
    mo.group.rotation.y = fa.group.rotation.y + Math.PI;
    mo.B.spine.rotation.x += .45;
    mo.B.neck.rotation.x += .12; mo.B.head.rotation.z += .28;
    for (const s of ['L', 'R']) {
      mo.B['thigh' + s].rotation.x -= .20;
      mo.B['shin' + s].rotation.x += .45;
      mo.B['foot' + s].rotation.x += .12;
    }
    sync(fa, mo);
    // Head outside the neck, cheek against the outer shoulder, torso in front of the chest.
    const cheek = at(mo, 'head', [.10, .02, .06]);
    const shoulder = front(fa, 'upperArmR', .12 * kf, .15 * kf, .04 * kf);
    const delta = shoulder.sub(cheek);
    mo.group.position.x += delta.x; mo.group.position.z += delta.z;
    mo.group.position.y += delta.y * lift;
    sync(mo);
    // Low supporting forearm under the pelvis; the other arm wraps the outside of his back.
    const seat = front(mo, 'root', .14 * km, .02 * km, 0).add(V(0, -.075 * km, 0));
    PO.reach(fa, 'R', seat, { grip: .015, pole: [-.48, -.12, .34] });
    PO.reach(fa, 'L', front(mo, 'chest', -.19 * km, .05 * km, -.06 * km), { grip: .015, pole: [.4, .2, .35] });
    PO.reach(mo, 'R', front(fa, 'neck', .09, .09 * kf, -.08), { grip: .01 });
    PO.reach(mo, 'L', front(fa, 'upperArmR', .16 * kf, .08 * kf, .05), { grip: .01 });
    sync(fa, mo, zo);
  },
});

// b084/b085/b089: a readable mid-depth lane, with the whole family kept beside it.
const la = staged('souk_bijoux', {
  father: { at: LANE.father, face: 'cam', yaw: -.4, seed: 5, talk: 0, lookMax: .42,
    look: (t, st) => t >= B(6)[0] ? front(st.A.father, 'head', 1.8, 1.3 * Math.sin((t - B(6)[0]) * .7 - .9), 0) : 'marchand' },
  zoubida: { at: LANE.zoubida, face: 'cam', yaw: .28, costume: 'haik', seed: 7, talk: 0, lookMax: .32,
    look: (t, st) => t >= B(6)[0] ? front(st.A.zoubida, 'head', 1.8, 1.1 * Math.sin(.9 - (t - B(6)[0]) * .75), 0) : [1180, 720, 1.5] },
  mohammed: { at: LANE.mohammed, face: 'cam', seed: 3, lids: .4, talk: 0, look: 'father', lookMax: .3 },
  marchand: { at: [1080, 690], face: [700, 790], seed: 13, talk: 1,
    mutter: t => t < B(2)[0] ? 3 * win(1, 0, .66, t) : 2 * win(2, 0, 1.1, t) },
  man1: { at: [880, 830], face: [1180, 720], seed: 21, talk: 0 },
  woman1: { at: [1250, 690], face: [700, 930], seed: 25, talk: 0 },
  kid2: { at: [1180, 720], face: [560, 900], seed: 27, talk: 0 },
  kid3: { at: [1330, 690], face: [700, 930], seed: 29, talk: 0 },
  fqih: { at: [700, 930], face: [1180, 720], seed: 31, talk: 0 },
  woman2: { at: [1180, 720], face: [1250, 940], seed: 33, talk: 0 },
}, {
  light: { shadow: .38, area: 7 },
  addressee: { marchand: 'father' },
  act(lt, t, S, st, S3) {
    const { father: fa, zoubida: zo, mohammed: mo, marchand: ma, man1: client } = st.A;
    child(mo); closeHaik(zo);
    const F = (x, y) => S3.floorAt(x, y), km = k(ma), kf = k(fa);
    const addressYaw = p => {
      const y0 = yawTo(p, S3.cam.position), y1 = yawTo(p, fa.group.position);
      return y0 + Math.atan2(Math.sin(y1 - y0), Math.cos(y1 - y0)) * .55;
    };
    const ta = B(1)[0], tb = f(1, .23), tc = f(1, .58), td = B(1)[1] + .15;
    ma.group.visible = t >= ta - .4 && t <= td;
    rest(ma.B);
    if (t < tb) walk(ma, F(1080, 690), F(1180, 720), ta - .4, tb, t, { cps: 2.5 });
    else if (t < tc) {
      ma.group.position.copy(F(1180, 720));
      ma.group.rotation.y = addressYaw(ma.group.position);
    } else {
      walk(ma, F(1180, 720), F(1080, 640), tc, td, t, { cps: 2.9 });
      const turn = sm(tc, tc + .4, t), y0 = addressYaw(F(1180, 720)), y1 = yawTo(F(1180, 720), F(1080, 640));
      ma.group.rotation.y = y0 + Math.atan2(Math.sin(y1 - y0), Math.cos(y1 - y0)) * turn;
    }
    const shout = win(1, 0, .66, t);
    ma.B.neck.rotation.x -= .18 * shout; ma.B.spine.rotation.x -= .08 * shout;
    sync(ma);
    if (ma.group.visible) {
      // Above the head, within the measured arm length, pair in the raised right hand.
      PO.reach(ma, 'R', front(ma, 'upperArmR', .12 * km, .06 * km, .48 * km), { grip: .01 });
      PO.fingers(ma, 'R', .65);
    }
    const nod = win(1, .40, .68, t), phase = sm(f(1, .40), f(1, .64), t);
    fa.B.neck.rotation.x += .26 * nod * Math.sin(Math.PI * phase);
    sync(fa);
    if (nod > 0) PO.reach(fa, 'R', front(fa, 'chest', .35 * kf, .16 * kf, -.02), { grip: .01 });

    // Bidirectional traffic stays between y690 and y940, never at the vanishing point.
    const boil = t >= B(2)[0] - .2 && t < B(3)[0], scan = t >= B(6)[0] - .3;
    for (const n of ['man1', 'woman1', 'kid2', 'kid3', 'fqih', 'woman2']) st.A[n].group.visible = boil || scan;
    if (boil) {
      const t0 = B(2)[0] - .2, t1 = B(3)[0];
      // Common travel vector keeps the clasp within both men's reach for the entire run.
      rest(ma.B); rest(client.B); ma.group.visible = true;
      walk(ma, F(960, 830), F(1180, 720), t0, t1, t, { cps: 3.7, ease: false });
      const off = F(880, 830).sub(F(960, 830));
      walk(client, F(960, 830).add(off), F(1180, 720).add(off), t0, t1, t, { cps: 3.5, ease: false });
      ma.B.spine.rotation.x += .25; client.B.spine.rotation.x += .18;
      sync(ma, client);
      const clasp = at(ma, 'upperArmL').lerp(at(client, 'upperArmR'), .5);
      clasp.y -= .25;
      PO.reach(ma, 'L', clasp, { grip: 0, pole: [.3, .05, -.25] });
      PO.reach(client, 'R', clasp, { grip: 0, pole: [-.3, .05, .25] });
      PO.fingers(ma, 'L', .65); PO.fingers(client, 'R', .65);
      for (const [n, p0, p1, delay] of [
        ['woman1', [1250, 690], [700, 930], 0],
        ['kid2', [1180, 720], [560, 900], .12],
        ['kid3', [1330, 690], [700, 930], .25],
        ['fqih', [700, 930], [1180, 720], .05],
        ['woman2', [1180, 720], [1250, 940], .18],
      ]) {
        const a = st.A[n]; rest(a.B);
        walk(a, F(...p0), F(...p1), t0 + delay, t1 + delay, t, { cps: n.startsWith('kid') ? 4.1 : 3.3, ease: false });
        a.B.spine.rotation.x += .18; sync(a);
      }
    } else if (scan) {
      // Ordinary shoppers only: the missing dellal never reappears during the search.
      ma.group.visible = false;
      for (const [n, p0, p1] of [
        ['man1', [1080, 690], [1250, 790]],
        ['woman1', [1330, 690], [1180, 720]],
        ['kid2', [1180, 720], [1330, 690]],
        ['kid3', [1250, 690], [1330, 720]],
        ['fqih', [1180, 720], [1080, 690]],
        ['woman2', [1330, 720], [1250, 790]],
      ]) {
        const a = st.A[n]; rest(a.B);
        walk(a, F(...p0), F(...p1), B(6)[0] - .3, B(6)[1] + 2.5, t, { cps: 2, ease: false });
      }
    }
    const br = st.br ||= bracelets(S3);
    br.visible = ma.group.visible;
    if (br.visible) {
      if (boil) PO.reach(ma, 'R', front(ma, 'chest', .25 * km, .17 * km, .15 * km), { grip: .01 });
      ma.B.handR.updateWorldMatrix(true, false);
      br.position.copy(ma.B.handR.localToWorld(V(0, .06, .025)));
      br.quaternion.copy(ma.B.handR.getWorldQuaternion(br.quaternion));
      br.scale.setScalar(1.15); br.updateMatrixWorld(true);
    }
    sync(fa, zo, mo, ma, client);
  },
});

export default beatScene(ID, {
  shots: { mu, ca, la },
  plan: {
    // dy is in plate PIXELS, positive down. Explicit offsets bypass automatic multi-head reframing.
    b083: { shot: 'mu', size: 'CU', on: 'mohammed', z: 3.7, dx: 20, dy: 80 },
    b084: { shot: 'la', size: 'M', on: 'marchand', z: 1.4, pt: [1080, 790], dx: -150, dy: 55 },
    b085: { shot: 'la', size: 'W', on: 'marchand' },
    b086: { shot: 'mu', size: 'M', on: 'father', z: 1.15, dx: -180, dy: 90 },
    b087: { shot: 'ca', size: 'CU', on: 'father', z: 2.6, dx: -65, dy: 70 },
    b088: { shot: 'mu', size: 'CU', on: 'zoubida', z: 3.4, dx: -55, dy: 25 },
    b089: { shot: 'la', size: 'M', on: 'father', z: 1.55, dx: 180, dy: 95 },
  },
});
