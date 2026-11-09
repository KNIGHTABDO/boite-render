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
import { staged } from '../lib/autostage.js';
import { walk } from '../lib/acts.js';
import { rest } from '../../../engine/rig3d.js';
import { bracelets } from './s17_retour.js';
import { SOUK } from './s12_souk.js';
import { beatScene, lines, sm, front, at, V } from '../lib/beatscene.js';

const ID = 's13_attente', L = lines(ID), B = i => L[i] || [0, 0];
const k = a => a.group.scale.y / 1.6;
const f = (i, x) => B(i)[0] + x * (B(i)[1] - B(i)[0]);
const win = (i, a, b, t) => sm(f(i, a) - .3, f(i, a) + .3, t) * (1 - sm(f(i, b), f(i, b) + .5, t));

// the wall blocking, shared with s14/s15: backs to the bench, facing the lens and a little right
export const MUR = { zoubida: [420, 790], mohammed: [560, 820], fatma: [700, 735], father: [690, 860] };

const mu = staged('souk_mur', {
  zoubida: { at: MUR.zoubida, face: [800, 1000], costume: 'haik', seed: 7, lookMax: .7,
    look: t => t > B(5)[0] ? [900, 900, 1.6] : t > B(3)[0] ? [1000, 700, 1.5] : 'mohammed' },
  mohammed: { at: MUR.mohammed, face: [900, 1000], seed: 3, talk: 0, lookMax: .7,
    lids: t => Math.max(.3, win(0, .3, .75, t)), mutter: t => win(0, .3, .72, t) * 1.1 },
  fatma: { at: MUR.fatma, face: [900, 980], seed: 11, look: t => t > B(5)[0] ? 'zoubida' : t > B(3)[0] ? [1100, 700, 1.4] : null },
  father: { at: MUR.father, face: [1300, 760], seed: 5, lookMax: .8, look: t => t > B(4)[0] ? 'mohammed' : [1100, 650, 1.6] },
  // the surge (b086): three hurry past in front of them toward the lens-left
  man1: { at: [1250, 640], face: [300, 980], seed: 21, talk: 0 },
  kid2: { at: [1180, 610], face: [300, 980], seed: 27, talk: 0 },
  woman1: { at: [1330, 660], face: [300, 980], seed: 25, talk: 0 },
}, {
  act(lt, t, S, st, S3) {
    const { zoubida: zo, mohammed: mo, fatma: ft, father: fa, man1: m1, kid2: k2, woman1: w1 } = st.A, km = k(mo), kz = k(zo);
    // ---- b083 the yawn and the sag: knees give, trunk folds, head back for the yawn, then a lean on her
    const sag = win(0, .1, 1.2, t), yawn = win(0, .3, .72, t);
    mo.B.spine.rotation.x += .14 * sag; mo.B.chest.rotation.x += .06 * sag; mo.B.neck.rotation.x -= .45 * yawn; mo.B.head.rotation.z += .1 * yawn;
    for (const s of ['L', 'R']) { mo.B['thigh' + s].rotation.x -= .22 * sag; mo.B['shin' + s].rotation.x += .4 * sag; }
    mo.group.position.y = -.035 * sag * km; mo.B.spine.updateWorldMatrix(false, true);
    // b083 end: she draws him against her side (her right hand on his shoulder)
    const hold = sm(f(0, .75), f(0, 1), t);
    if (hold > 0) PO.reach(zo, 'R', front(zo, 'root', .2 * kz, .24 * kz, .25 * kz).lerp(at(mo, 'neck').add(V(0, .03, 0)), hold), { grip: .2 });

    // ---- b086 the surge: they pass in front between .05 and .6 of the line; the family is shoved back against the bench
    const t0 = f(3, .02), t1 = f(3, .6);
    for (const [a, p0, p1, dt] of [[m1, [1250, 640], [180, 990], 0], [k2, [1180, 610], [260, 960], .25], [w1, [1330, 660], [330, 1000], .5]]) {
      a.group.visible = t > t0 - .2 && t < t1 + 1;
      if (a.group.visible) { rest(a.B); walk(a, S3.floorAt(...p0), S3.floorAt(...p1), t0 + dt, t1 + dt, t, { cps: 2.8, ease: false }); }
    }
    const push = win(3, .2, .55, t) * (.8 + .2 * Math.sin(t * 9));
    for (const [a, w] of [[zo, 1], [mo, .7], [ft, 1.1]]) {
      const kk = k(a); a.group.position.add(V(-.07 * w * push * kk, 0, -.12 * w * push * kk));
      a.B.spine.rotation.x -= .16 * w * push; a.B.neck.rotation.x += .12 * w * push; a.group.updateMatrixWorld(true); a.B.spine.updateWorldMatrix(false, true);
    }
    if (push > .05) PO.reach(zo, 'L', front(zo, 'chest', .2 * kz, .3 * kz, -.2 * kz).lerp(at(mo, 'chest'), .7), { grip: .25 });   // her arm goes round the boy
    fa.group.visible = t < B(3)[0] - .2 || t > B(4)[0] - .5;   // the father had stepped away to look for the dellal

    // ---- b088 Zoubida's curse: sharp head jerks, her right hand slicing the air
    const cu = win(5, 0, .95, t);
    if (cu > 0) {
      const ph = (t - B(5)[0]) * 1.6, ch = Math.sin(ph * Math.PI * 2) ** 3;
      zo.B.head.rotation.y += .22 * cu * Math.sin(t * 4.3) ** 3; zo.B.neck.rotation.x += .1 * cu * Math.max(0, Math.sin(t * 5.1)) ** 4; zo.B.neck.updateWorldMatrix(false, true);
      PO.reach(zo, 'R', front(zo, 'chest', .34 * kz, (.06 + .2 * ch) * kz, (-.04 + .04 * ch) * kz), { grip: .05 });
      PO.palmTo(zo, 'R', cu, V(0, -1, 0));
    }
    for (const a of [zo, mo, ft]) a.B.chest.updateWorldMatrix(false, true);
  },
});

// b087 the father holds the boy up against his chest: the boy SITS on his right forearm (a seated pose solved at .45 m,
// lifted to the arm), his face over the father's shoulder toward the lens; the father 3/4 away, chest heaving
const CARRY = 1.12;   // hip height of the boy on the forearm (m), father 1.76 m
const ca = staged('souk_mur', {
  father: { at: [720, 860], face: [380, 640], seed: 5, look: [500, 980, 1.2], lookMax: .5, talk: 0 },
  mohammed: { at: [720, 860], face: 'father', pose: 'step', o: { seat: .45, floor: .08, fz: .22, lean: .32 }, hands: false, seed: 3, lids: .55, talk: 0 },
  zoubida: { at: MUR.zoubida, face: 'father', costume: 'haik', seed: 7, look: 'mohammed', lookMax: .7 },
}, {
  act(lt, t, S, st) {
    const { father: fa, mohammed: mo } = st.A, kf = k(fa), km = k(mo);
    const lift = sm(B(4)[0] - .4, B(4)[0] + .9, t), fy = fa.group.rotation.y;
    // the boy: from his standing height up onto the arm, in front of the father's right chest, facing him
    const base = at(fa, 'root').add(V(Math.sin(fy) * .17 * kf + Math.cos(fy) * -.17 * kf, 0, Math.cos(fy) * .17 * kf - Math.sin(fy) * -.17 * kf));
    if (!st.h0) { st.h0 = at(mo, 'root').y - mo.group.position.y; }
    mo.group.position.set(base.x, (CARRY * kf / 1.1 - st.h0) * lift, base.z); mo.group.rotation.y = fy + Math.PI; mo.group.updateMatrixWorld(true);
    // breathing: the father's chest heaves (he ran), sweat-heavy head bowed a little
    const br = Math.sin(t * 3.4);
    fa.B.chest.rotation.x -= .05 + .03 * br; fa.B.neck.rotation.x += .1; fa.B.spine.updateWorldMatrix(false, true);
    // his right forearm under the boy's seat, his left palm on the boy's back
    PO.reach(fa, 'R', at(mo, 'root').add(V(0, -.07 * km, 0)), { grip: .3 });
    PO.reach(fa, 'L', at(mo, 'chest').lerp(at(mo, 'neck'), .3).addScaledVector(V(Math.sin(fy), 0, Math.cos(fy)), -.08 * km), { grip: .2 });
    // the boy: leaning in, cheek on the shoulder (head turned to the lens side), arms round the father's neck
    mo.B.spine.rotation.x += .06 * lift; mo.B.head.rotation.y += .2 * lift; mo.B.head.rotation.z += .15 * lift; mo.B.spine.updateWorldMatrix(false, true);
    for (const s of ['L', 'R']) PO.reach(mo, s, at(fa, 'neck').add(V(0, -.04, 0)).addScaledVector(V(Math.cos(fy), 0, -Math.sin(fy)), (s === 'L' ? .09 : -.09) * kf), { grip: .3 });
    for (const a of [fa, mo]) a.B.chest.updateWorldMatrix(false, true);
  },
});

// b084/b085/b089 the lane: the dellal's return, the boiling souk, the long empty scan
const la = staged('souk_bijoux', {
  father: { at: SOUK.father, face: [905, 690], seed: 5, lookMax: .85,
    look: t => t > B(6)[0] ? [880 + 380 * Math.sin((t - B(6)[0]) * .7 - .8), 600, 1.6] : t > B(1)[0] ? 'marchand' : null },
  zoubida: { at: [960, 820], face: [905, 690], costume: 'haik', seed: 7, lookMax: .85,
    look: t => t > B(6)[0] ? [880 - 360 * Math.sin((t - B(6)[0]) * .6 - .5), 610, 1.6] : t > B(1)[0] ? 'marchand' : null },
  marchand: { at: [880, 560], face: SOUK.father, seed: 13, talk: 0, mutter: t => win(1, .25, .55, t) * (.75 + .25 * Math.sin(t * 9)) },
  man1: { at: [700, 620], face: [880, 560], seed: 21, talk: 0 },
  woman1: { at: [960, 580], face: [1250, 940], seed: 25, talk: 0 },
  kid3: { at: [820, 590], face: [560, 900], seed: 29, talk: 0 },
}, {
  addressee: { marchand: 'father' },
  act(lt, t, S, st, S3) {
    const { father: fa, marchand: ma, man1: m1, woman1: w1, kid3: k3 } = st.A, km = k(ma), kf = k(fa);
    const F = (px, py) => S3.floorAt(px, py);
    // b084: in from the deep lane, a stop, the shout, the father's nod, about-turn, gone (one leg per walk() call)
    const P = [[880, 560], [905, 690], [880, 545]], ta = B(1)[0], tc = f(1, .62), tb = f(1, .25), td = f(1, .98);
    rest(ma.B);
    if (t < tb) walk(ma, F(...P[0]), F(...P[1]), ta - .4, tb, t, { cps: 2.2 });
    else if (t < tc) { walk(ma, F(...P[0]), F(...P[1]), ta, tb, tb); rest(ma.B); }
    else walk(ma, F(...P[1]), F(...P[2]), tc, td, t, { cps: 2.4 });
    ma.group.visible = t > ta - .4 && t < td + .1;
    const shout = win(1, .25, .55, t);
    ma.B.neck.rotation.x -= .3 * shout; ma.B.spine.rotation.x -= .08 * shout; ma.B.spine.updateWorldMatrix(false, true);
    if (ma.group.visible) PO.reach(ma, 'R', front(ma, 'chest', .26 * km, .2 * km, (.24 + .03 * Math.sin(t * 7)) * km), { grip: .35 });
    st.br ||= bracelets(S3); st.br.visible = ma.group.visible; st.br.position.copy(at(ma, 'handR')).add(V(0, -.035, 0)); st.br.rotation.set(Math.PI / 2, ma.group.rotation.y, 0);
    const nod = win(1, .52, .66, t);   // the father's small nod
    fa.B.neck.rotation.x += .16 * nod * Math.max(0, Math.sin((t - f(1, .52)) * 8)); fa.B.neck.updateWorldMatrix(false, true);
    // b085 the boil: a broker drags a client up the lane by the hand, a woman and an urchin hurry down it
    const r0 = B(2)[0] - .2, r1 = B(2)[1];
    for (const a of [m1, w1, k3]) a.group.visible = t > r0 && t < r1 + .3;
    if (t > r0 && t < r1 + .3) {
      rest(m1.B); walk(m1, F(760, 900), F(900, 560), r0, r1, t, { cps: 2.6, ease: false });
      rest(w1.B); walk(w1, F(960, 580), F(1250, 940), r0 + .3, r1, t, { cps: 2.4, ease: false });
      rest(k3.B); walk(k3, F(820, 590), F(560, 940), r0, r1 - .6, t, { cps: 3.2, ease: false });
      ma.group.visible = true; rest(ma.B); walk(ma, F(820, 840), F(950, 540), r0 + .1, r1 - .2, t, { cps: 2.8, ease: false });
      PO.reach(ma, 'L', at(m1, 'handR').lerp(at(ma, 'chest'), .35), { grip: .3 });   // he pulls the client by the hand
      PO.reach(m1, 'R', at(ma, 'handL'), { grip: .3 });
      st.br.visible = false;
    }
    for (const a of [fa, ma, m1]) a.B.chest.updateWorldMatrix(false, true);
  },
});

export default beatScene(ID, {
  shots: { mu, ca, la },
  plan: {
    b083: { shot: 'mu', size: 'CU', on: 'mohammed', z: 2.6 },
    b084: { shot: 'la', size: 'M', on: 'marchand', z: 1.4, pt: [905, 690] },   // over the father's shoulder onto the dellal's shout
    b085: { shot: 'la', size: 'W', on: 'marchand', z: 1.1, pt: [880, 700] },   // the lane itself, mid-depth: the boil crosses frame
    b086: { shot: 'mu', size: 'M', on: 'zoubida' },
    b087: { shot: 'ca', size: 'CU', on: 'mohammed', z: 2.2 },
    b088: { shot: 'mu', size: 'CU', on: 'zoubida', z: 2.6 },
    b089: { shot: 'la', size: 'M', on: 'father', z: 1.5 },
  },
});
