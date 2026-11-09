// s14 "La bagarre". b090 souk_mur: the father has just set the boy down; he straightens, turns and strides off up the
// passage into the crowd, the boy's eyes following him. b091 painting p22 (the sea of heads), b092 painting p23 (the
// stampede). b093 CU low on Zoubida, trampled: a jolt, she hops, her right knee jerks up, the trunk folds toward the foot,
// both hands going down to it. b094 CU on Fatma: her haik is tugged from behind: the chest twists after it, both fists
// clutch the cloth to her breastbone, she looks back over her shoulder. Runners cross deep in the passage behind them.
// b095 souk_bijoux: the father and the dellal pass, gripping each other by the collar, shoving, crossing the lane toward
// the lens-left. b096 CU OTS: face to face, chests heaving (enum: les yeux rouges / l'écume / le turban perdu / le sang:
// a fallen white turban cloth on the paving, a red smear on the dellal's cheek). b097 W high: they shove on up the lane
// and the whole souk follows them, backs to us, receding. TODO: the father's turban is baked into the rig mesh.
import * as PO from '../../../engine/poses.js';
import * as PR from '../../../engine/props3d.js';
import { staged, THREE } from '../lib/autostage.js';
import { walk } from '../lib/acts.js';
import { rest } from '../../../engine/rig3d.js';
import { toon } from '../../../engine/props3d.js';
import { MUR } from './s13_attente.js';
import { beatScene, lines, sm, front, at, V, yawTo } from '../lib/beatscene.js';

const ID = 's14_bagarre', L = lines(ID), B = i => L[i] || [0, 0];
const k = a => a.group.scale.y / 1.6;
const f = (i, x) => B(i)[0] + x * (B(i)[1] - B(i)[0]);
const win = (i, a, b, t) => sm(f(i, a) - .25, f(i, a) + .25, t) * (1 - sm(f(i, b), f(i, b) + .4, t));

const mu = staged('souk_mur', {
  father: { at: [680, 850], face: [1000, 560], seed: 5, talk: 0, walk: { to: [1010, 555], t0: B(0)[0] + 1.1, t1: B(0)[0] + 4.6 } },
  mohammed: { at: MUR.mohammed, face: [900, 1000], seed: 3, talk: 0, lookMax: .85, look: t => t < B(1)[0] ? 'father' : null },
  zoubida: { at: MUR.zoubida, face: [800, 1000], costume: 'haik', seed: 7, lookMax: .7, lids: t => .35 * win(3, 0, 1, t),
    look: t => t > B(3)[0] && t < B(4)[0] ? [560, 980, 0] : t < B(1)[0] ? 'father' : null },
  fatma: { at: MUR.fatma, face: [900, 980], seed: 11, lookMax: .95, look: t => t > B(4)[0] ? [1150, 560, 1.5] : t < B(1)[0] ? 'father' : null },
  man1: { at: [1220, 610], face: [300, 980], seed: 21, talk: 0 },
  kid2: { at: [1300, 640], face: [300, 980], seed: 27, talk: 0 },
}, {
  act(lt, t, S, st, S3) {
    const { father: fa, mohammed: mo, zoubida: zo, fatma: ft, man1: m1, kid2: k2 } = st.A, kz = k(zo), kt = k(ft), kf = k(fa);
    // b090 he rises from setting the boy down (bent at first), then strides away and is swallowed by the passage
    const up = sm(B(0)[0], B(0)[0] + 1, t);
    fa.B.spine.rotation.x += .45 * (1 - up); fa.B.spine.updateWorldMatrix(false, true);
    if (up < 1) PO.reach(fa, 'R', at(mo, 'neck').lerp(front(fa, 'root', .2 * kf, .2 * kf, .2 * kf), up), { grip: .2 });
    fa.group.visible = t < B(1)[0];
    // runners deep in the passage during the trampling (b093–b094)
    const r0 = B(3)[0] - .3, r1 = B(4)[1];
    for (const [a, p0, p1, dt] of [[m1, [1220, 610], [380, 640], 0], [k2, [1300, 640], [420, 680], .9]]) {
      a.group.visible = t > r0 && t < r1 + .3;
      if (a.group.visible) { rest(a.B); walk(a, S3.floorAt(...p0), S3.floorAt(...p1), r0 + dt, r1 + dt, t, { cps: 3, ease: false }); }
    }
    // b093 trampled: jolt, hop on the left foot, right knee up, folding toward it
    const hu = win(3, 0, .95, t), hop = Math.max(0, Math.sin((t - B(3)[0]) * 9)) * hu;
    if (hu > 0) {
      zo.B.thighR.rotation.x -= .55 * hu; zo.B.shinR.rotation.x += 1.0 * hu;
      zo.B.spine.rotation.x += .32 * hu; zo.B.chest.rotation.x += .1 * hu; zo.B.neck.rotation.x -= .2 * hu;
      zo.group.position.y += .045 * hop * kz; zo.group.updateMatrixWorld(true); zo.B.spine.updateWorldMatrix(false, true);
      const foot = at(zo, 'shinR').lerp(at(zo, 'footR'), .5).add(V(0, .05 * kz, 0));
      for (const s of ['L', 'R']) PO.reach(zo, s, front(zo, 'root', .3 * kz, (s === 'L' ? -.1 : .1) * kz, .1 * kz).lerp(foot, .55 * hu), { grip: .3 });
    }
    // b094 the haik tugged from behind: chest twists after it, both fists at the breastbone
    const tug = win(4, 0, 1, t), jerk = Math.max(0, Math.sin((t - B(4)[0]) * 5.5)) ** 3;
    if (tug > 0) {
      ft.B.spine.rotation.y += (.25 + .15 * jerk) * tug; ft.B.spine.rotation.x -= .08 * jerk * tug; ft.group.position.add(V(.03 * jerk * kt, 0, -.04 * jerk * kt));
      ft.group.updateMatrixWorld(true); ft.B.spine.updateWorldMatrix(false, true);
      for (const s of ['L', 'R']) PO.reach(ft, s, front(ft, 'chest', .27 * kt, (s === 'L' ? -.05 : .05) * kt, -.05 * kt), { grip: .7 });
    }
    for (const a of [fa, zo, ft]) a.B.chest.updateWorldMatrix(false, true);
  },
});

// the fight: the pair grips collars and shoves along a path (the walk gives the legs; the bodies face each other)
const PATH = [[1120, 640], [770, 760], [865, 565]];   // in (b095) → held (b096) → away up the lane (b097)
const fi = staged('souk_bijoux', {
  father: { at: PATH[0], seed: 5, talk: 0, look: 'marchand', lookMax: .8 },
  marchand: { at: PATH[0], seed: 13, talk: 0, look: 'father', lookMax: .8, mutter: t => .35 + .2 * Math.sin(t * 7) },
  zoubida: { at: [520, 860], face: [770, 760], costume: 'haik', seed: 7, lookMax: .8, look: 'father' },
  // the procession (b097): they follow from the foreground, backs to us
  man1: { at: [700, 900], seed: 21, talk: 0 }, woman1: { at: [980, 900], seed: 25, talk: 0 },
  woman2: { at: [1150, 860], seed: 23, talk: 0 }, kid2: { at: [840, 940], seed: 27, talk: 0 }, kid3: { at: [560, 940], seed: 29, talk: 0 },
}, {
  act(lt, t, S, st, S3) {
    const { father: fa, marchand: ma, zoubida: zo } = st.A, F = p => S3.floorAt(...p);
    // the pair's centre point along the path
    const a0 = B(5)[0] - .4, a1 = B(5)[1], c0 = B(7)[0] - .2, c1 = B(7)[1] + .6;
    const C = t < a1 ? F(PATH[0]).lerp(F(PATH[1]), sm(a0, a1, t)) : F(PATH[1]).lerp(F(PATH[2]), sm(c0, c1, t));
    const moving = (t > a0 && t < a1) || (t > c0 && t < c1);
    const axis = (st.ax ||= F([700, 760]).sub(F([840, 760])).setY(0).normalize());   // the line between them: across the lens
    const sh = .06 * Math.sin(t * 2.3) + .03 * Math.sin(t * 5.1);   // shove back and forth
    for (const [a, s] of [[fa, 1], [ma, -1]]) {
      const kk = k(a), p = C.clone().addScaledVector(axis, s * (.3 * kk + sh * s));
      rest(a.B);
      if (moving) walk(a, p.clone().addScaledVector(axis, -.01), p, 0, 2 * t, t, { cps: 2.4, ease: false });   // u = .5: a steady stride phase, position set below
      a.group.position.set(p.x, 0, p.z);
      const o = s > 0 ? ma : fa; a.group.rotation.y = yawTo(a.group.position, o.group.position.clone().setY(0)); a.group.updateMatrixWorld(true);
    }
    for (const [a, o] of [[fa, ma], [ma, fa]]) {
      const kk = k(a), heave = Math.sin(t * 3.6 + (a === fa ? 0 : 1.4));
      a.B.spine.rotation.x += .18 + .04 * heave; a.B.chest.rotation.x -= .04 * heave; a.B.neck.rotation.x -= .08; a.B.spine.updateWorldMatrix(false, true);
      const side = V(Math.cos(o.group.rotation.y), 0, -Math.sin(o.group.rotation.y));
      for (const s of ['L', 'R']) PO.reach(a, s, at(o, 'neck').add(V(0, -.07 * k(o), 0)).addScaledVector(side, (s === 'L' ? .08 : -.08) * k(o)), { grip: .75 });
    }
    // the fallen turban (a loose white roll on the paving) and the red smear on the dellal's cheek, from b096 on
    if (!st.tb) {
      st.tb = S3.prop(PR.blanket({ w: .3, l: .55, h: .07, col: 0xf4efe4 }), 0, 0, 0);
      st.bl = new THREE.Mesh(new THREE.SphereGeometry(.022, 12, 8), toon(0x9a1a14)); st.bl.scale.set(1, .55, .25); S3.scene.add(st.bl);
    }
    st.tb.visible = t > B(5)[0]; const tp = F([690, 815]); st.tb.position.set(tp.x, 0, tp.z); st.tb.rotation.y = .7;
    const km = k(ma), hd = ma.B.head; hd.updateWorldMatrix(true, false);
    st.bl.position.copy(front(ma, 'head', .085 * km, .055 * km, -.035 * km)); st.bl.quaternion.copy(hd.getWorldQuaternion(new THREE.Quaternion())); st.bl.visible = t > B(5)[0];
    // the procession: hidden until b097, then they walk away up the lane behind the pair
    const ex = ['man1', 'woman1', 'woman2', 'kid2', 'kid3'];
    for (const [i, n] of ex.entries()) {
      const a = st.A[n], m = [[700, 900], [980, 900], [1150, 860], [840, 940], [560, 940]][i];
      a.group.visible = t > c0 - .2;
      if (a.group.visible) { rest(a.B); walk(a, F(m), F(m).lerp(F(PATH[2]), .62), c0 + .15 * i, c1 + .3 * i, t, { cps: 1.9, ease: false }); }
    }
    zo.group.visible = t < c0;
    for (const a of [fa, ma]) a.B.chest.updateWorldMatrix(false, true);
  },
});

export default beatScene(ID, {
  shots: { mu, fi },
  plan: {
    b090: { shot: 'mu', size: 'M', on: 'father' },
    b093: { shot: 'mu', size: 'CU', on: 'zoubida', z: 2.4 },
    b094: { shot: 'mu', size: 'CU', on: 'fatma', z: 2.5 },
    b095: { shot: 'fi', size: 'M', on: 'father', z: 1.4, pt: [930, 710] },
    b096: { shot: 'fi', size: 'CU', on: 'marchand', z: 2.4, pt: [800, 760] },
    b097: { shot: 'fi', size: 'W', on: 'father' },
  },
});
