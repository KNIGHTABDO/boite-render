import { checkedStage, haikCloth } from './s13_attente.js';
// s14 "La bagarre". b090 souk_mur: the father has just set the boy down; he straightens, turns and strides off up the
// passage into the crowd, the boy's eyes following him. b091 painting p22 (the sea of heads), b092 painting p23 (the
// stampede). b093 low full-body on Zoubida, trampled: a jolt, she hops, her right knee jerks up, the trunk folds toward the foot,
// both hands going down to it. b094 CU on Fatma: her haik is tugged from behind: the chest twists after it, both fists
// clutch the cloth to her breastbone, she looks back over her shoulder. Runners cross deep in the passage behind them.
// b095 souk_bijoux: the father and the dellal pass, gripping each other by the collar, shoving, crossing the lane toward
// the lens-left. b096 CU OTS: face to face, chests heaving (enum: les yeux rouges / l'écume / le turban perdu / le sang:
// a fallen white turban cloth on the paving, a red smear on the dellal's cheek). b097 W high: they shove on up the lane
// and the whole souk follows them, backs to us, receding. The father's turban is baked into the rig mesh: on the lost-
// turban phrase, cut low to the fallen cloth with his head outside the frame.
import * as IK from '../../../engine/ik.js';
import * as PO from '../../../engine/poses.js';
import { THREE } from '../lib/autostage.js';
import { walk } from '../lib/acts.js';
import { rest, walkPose } from '../../../engine/rig3d.js';
import { toon } from '../../../engine/props3d.js';
import { role } from './_3d.js';
import { beatScene, lines, sm, front, at, V, yawTo } from '../lib/beatscene.js';

const ID = 's14_bagarre', L = lines(ID), B = i => L[i] || [0, 0];
const k = a => a.group.scale.y / 1.6;
const f = (i, x) => B(i)[0] + x * (B(i)[1] - B(i)[0]);
const win = (i, a, b, t) => sm(f(i, a) - .25, f(i, a) + .25, t) * (1 - sm(f(i, b), f(i, b) + .4, t));

// cast.json has no Fatma haik mapping. Borrow a separate copy of the outdoor rig, keeping her role/voice and the
// staged shot's actor references and coverage measurements. The fight also owns its two marked faces, so blood/foam
// cannot leak onto the opening or another scene through the shared cast cache.
function soukCast(sh, copy, fighters = false) {
  const load = sh.load;
  sh.load = async () => {
    await load();
    if (sh.st.fatmaHaik) return;
    const roles = [['fatma', 'zoubida', 'haik'], ...(fighters ? [['father', 'father'], ['marchand', 'marchand']] : [])];
    for (const [name, model, costume] of roles) {
      const old = sh.st.A[name], a = await role(model, { costume, copy: copy + ':' + name });
      a.name = name; a.home = old.home; a.actMark=old.actMark;
      if(costume==='haik')haikCloth(a);
      a.group.position.copy(old.group.position); a.group.rotation.copy(old.group.rotation);
      old.group.removeFromParent(); sh.S3.scene.add(a.group); a.group.updateMatrixWorld(true);
      const i = sh.st.actors.indexOf(old);
      sh.st.A[name] = a; sh.st.actors[i] = a;
      for (const face of sh.st.faces) if (face[0] === old) face[0] = a;
      const h = at(a, 'head'), sole = h.clone().add(V(0, -.83 * a.group.scale.y, 0));
      sh.heads[i] = sh.S3.project(h); sh.headOff[i] = h.clone().sub(a.group.position);
      sh.bodyPx[i] = sh.S3.project(sole)[1] - sh.heads[i][1];
    }
    sh.st.fatmaHaik = true;
  };
  return sh;
}

const mu = soukCast(checkedStage('souk_mur', {
  father: { at: [800, 850], face: [700, 900], seed: 5, talk: 0, walk: { to: [1000, 700], t0: B(0)[0] + .2, t1: B(1)[0] + .3 } },
  mohammed: { at: [700, 900], face: [680, 850], seed: 3, talk: 0, lookMax: 1.1, look: t => t < B(1)[0] ? 'father' : null },
  zoubida: { at: [520, 860], face: [800, 1000], costume: 'haik', seed: 7, talk: 0, lookMax: .7, lids: t => .35 * win(3, 0, 1, t),
    look: t => t > B(3)[0] && t < B(4)[0] ? [560, 980, 0] : t < B(1)[0] ? 'father' : null },
  fatma: { at: [980, 900], face: [900, 980], costume: 'haik', seed: 11, talk: 0, lookMax: .55,
    look: (t, st) => t > B(4)[0] ? front(st.A.fatma, 'chest', -.9, .6, .3) : t < B(1)[0] ? 'father' : null },
  man1: { at: [1220, 610], face: [300, 980], seed: 21, talk: 0 },
  kid2: { at: [1300, 640], face: [300, 980], seed: 27, talk: 0 },
  woman1: { at: [1220, 610], face: [300, 980], seed: 25, talk: 0 },
  kid3: { at: [1300, 640], face: [300, 980], seed: 29, talk: 0 },
}, {
  traffic:['man1','kid2','woman1','kid3'],
  act(lt, t, S, st, S3) {
    st.actcheck={exposed:{zoubida:t>=B(3)[0]&&t<B(4)[0]?['handL','handR','foreArmL','foreArmR']:[],fatma:t>=B(4)[0]?['handL','handR','foreArmL','foreArmR']:[]},contacts:[{actors:['father','mohammed'],parts:['foreArmR:torso','foreArmR:head']}]};
    const { father: fa, mohammed: mo, zoubida: zo, fatma: ft } = st.A, kz = k(zo), kt = k(ft), kf = k(fa);
    // b090 he rises from setting the boy down (bent at first), then strides away and is swallowed by the passage
    const up = sm(0, B(0)[0] + .2, t);
    fa.B.spine.rotation.x += .7 * (1 - up); fa.B.spine.updateWorldMatrix(false, true);
    if (up < 1) PO.reach(fa, 'R', at(mo, 'neck').lerp(front(fa, 'root', .2 * kf, .2 * kf, .2 * kf), up), { grip: .025 });
    fa.group.visible = t < B(1)[0];
    if (t < B(1)[0]) {
      const turn = sm(B(0)[0], B(0)[0] + 1.2, t), initial = yawTo(mo.group.position, S3.floorAt(800, 850));
      const follow = yawTo(mo.group.position, fa.group.position);
      mo.B.spine.rotation.x += .06*(1-turn);mo.B.chest.rotation.y += .12*turn;
      mo.group.rotation.y = initial + Math.atan2(Math.sin(follow - initial), Math.cos(follow - initial)) * turn;
      mo.group.updateMatrixWorld(true);
    }
    // Hold the haiks closed on their outer surface, clear of the waist drape.
    for (const a of [zo, ft]) for (const s of ['L', 'R']) {
      PO.reach(a, s, front(a, 'chest', .13 * k(a), (s === 'L' ? -.065 : .065) * k(a), -.18 * k(a)), { grip: .025 });
    }
    // runners deep in the passage during the trampling (b093–b094)
    const r0 = B(3)[0] - .3;
    for (const [n, p0, p1, dt] of [
      ['man1', [1150, 700], [700, 900], 0], ['kid2', [1300, 640], [1150, 700], .4],
      ['woman1', [1220, 610], [900, 640], 3.1], ['kid3', [1300, 640], [1150, 700], 3.5],
    ]) {
      const a = st.A[n], t0 = r0 + dt, t1 = t0 + 2.9;
      a.group.visible = t > t0 && t < t1;
      if (a.group.visible) { rest(a.B); walk(a, S3.floorAt(...p0), S3.floorAt(...p1), t0, t1, t, { cps: 3.6, ease: false }); }
    }
    // b093 trampled: jolt, hop on the left foot, right knee up, folding toward it
    const hu = win(3, 0, .95, t), hop = Math.max(0, Math.sin((t - B(3)[0]) * 9)) * hu;
    if (hu > 0) {
      zo.B.thighR.rotation.x -= 1.5 * hu; zo.B.shinR.rotation.x += 1.65 * hu;
      zo.B.spine.rotation.x += .82 * hu; zo.B.chest.rotation.x += .12 * hu; zo.B.neck.rotation.x -= .22 * hu;
      zo.group.position.y += .08 * hop * kz; zo.group.updateMatrixWorld(true); zo.B.spine.updateWorldMatrix(false, true);
      // Lift the foot into the measured two-arm workspace before either hand reaches for it.
      const ankle=at(zo,'footR'), lifted=front(zo,'chest',.12*kz,.02*kz,-.28*kz);
      IK.leg(zo,'R',ankle.lerp(lifted,hu),front(zo,'root',.6*kz,.10*kz,.35*kz));
      const foot = front(zo, 'footR', 0, 0, .035 * kz);
      for (const s of ['L', 'R']) PO.reach(zo, s, front(zo, 'chest', .24 * kz, (s === 'L' ? -.06 : .06) * kz, -.18 * kz)
        .lerp(foot.clone().add(V((s === 'L' ? -.035 : .035) * kz, .02 * kz, 0)), hu), { grip: .025 });
    }
    // b094 the haik tugged from behind: chest twists after it, both fists at the breastbone
    const tug = win(4, 0, 1, t), jerk = Math.max(0, Math.sin((t - B(4)[0]) * 5.5)) ** 3;
    if (tug > 0) {
      ft.B.spine.rotation.y += (.35 + .12 * jerk) * tug; ft.B.chest.rotation.y += .18 * tug;
      ft.B.spine.rotation.x -= .08 * jerk * tug; ft.group.position.add(V(.03 * jerk * kt, 0, -.04 * jerk * kt));
      ft.group.updateMatrixWorld(true); ft.B.spine.updateWorldMatrix(false, true);
      const breast = at(ft, 'chest', [0, .025, .14]);
      for (const s of ['L', 'R']) {
        PO.grip(ft, s, breast.clone().addScaledVector(V(-1, 0, 0).applyQuaternion(ft.B.chest.getWorldQuaternion(new THREE.Quaternion())), (s === 'L' ? -.05 : .05) * kt), at(ft, 'chest'));
        PO.fingers(ft, s, .95, { thumb: .85 });
      }
    }
    for (const a of [fa, zo, ft]) a.B.chest.updateWorldMatrix(false, true);
  },
}), ':s14:mu:fatma');

// the fight: the pair grips collars and shoves along a path (the walk gives the legs; the bodies face each other)
const PATH = [[1120, 640], [770, 760], [900, 640]];   // across lens-left → held close → receding, still readable
const FOLLOW = [
  ['man1', [700, 900]], ['woman1', [1050, 860]], ['woman2', [1150, 940]],
  ['kid2', [770, 1000]], ['kid3', [1000, 1030]],
];
const dropAt = f(5, .9), turbanAt = B(6)[0] + 5.05, bloodAt = B(6)[0] + 7.5;
const fi = soukCast(checkedStage('souk_bijoux', {
  father: { at: PATH[0], seed: 5, talk: 0, look: 'marchand', lookMax: .8 },
  marchand: { at: PATH[0], seed: 13, talk: 0, look: 'father', lookMax: .8, mutter: t => .35 + .2 * Math.sin(t * 7) },
  zoubida: { at: [520, 860], face: [770, 760], costume: 'haik', seed: 7, talk: 0, lookMax: .8, look: 'father' },
  mohammed: { at: [560, 940], face: [770, 760], seed: 3, talk: 0, look: 'father' },
  fatma: { at: [1300, 760], face: [770, 760], costume: 'haik', seed: 11, talk: 0, look: 'father' },
  // the procession (b097): they follow from the foreground, backs to us
  man1: { at: FOLLOW[0][1], seed: 21, talk: 0 }, woman1: { at: FOLLOW[1][1], seed: 25, talk: 0 },
  woman2: { at: FOLLOW[2][1], seed: 23, talk: 0 }, kid2: { at: FOLLOW[3][1], seed: 27, talk: 0 }, kid3: { at: FOLLOW[4][1], seed: 29, talk: 0 },
}, {
  traffic:['man1','woman1','woman2','kid2','kid3'],
  // A paving insert on the turban phrase: the baked headwear is entirely above the crop.
  view: (lt, u, t) => t >= turbanAt && t < bloodAt ? [690, 815, 3.8] : null,
  act(lt, t, S, st, S3) {
    st.actcheck={insert:t>=turbanAt&&t<bloodAt,contacts:[{actors:['father','marchand'],parts:['foreArmL:torso','foreArmR:torso','foreArmL:head','foreArmR:head','foreArmL:foreArmR','foreArmL:foreArmL','foreArmR:foreArmR']}]};
    const { father: fa, marchand: ma, zoubida: zo, fatma: ft } = st.A, F = p => S3.floorAt(...p);
    // the pair's centre point along the path
    const a0 = B(5)[0] - .4, a1 = B(5)[1], c0 = B(7)[0] - .2, c1 = B(7)[1] + .6;
    const C = t < a1 ? F(PATH[0]).lerp(F(PATH[1]), sm(a0, a1, t)) : F(PATH[1]).lerp(F(PATH[2]), sm(c0, c1, t));
    const moving = (t > a0 && t < a1) || (t > c0 && t < c1);
    const axis = (st.ax ||= F([700, 760]).sub(F([840, 760])).setY(0).normalize());   // the line between them: across the lens
    const knock = Math.exp(-(((t - dropAt) / .18) ** 2));
    const sh = .045 * Math.sin(t * 2.3) + .025 * Math.sin(t * 5.1) - .07 * knock;
    for (const [a, s] of [[fa, 1], [ma, -1]]) {
      const p = C.clone().addScaledVector(axis, s * .25 + sh);
      rest(a.B);
      if (moving) walkPose(a.B, (t - a0) * 1.2 + (s < 0 ? .5 : 0), .55);
      a.group.position.set(p.x, 0, p.z);
    }
    // Set BOTH positions before turning either man; no previous-frame opponent position enters the facing.
    for (const [a, o] of [[fa, ma], [ma, fa]]) {
      a.group.rotation.y = yawTo(a.group.position, o.group.position);
      const heave = Math.sin(t * 3.6 + (a === fa ? 0 : 1.4));
      a.B.spine.rotation.x += .24 + .07 * heave + .12 * knock;
      a.B.chest.rotation.x -= .055 * heave; a.B.chest.position.z += .012 * heave;
      a.B.neck.rotation.x -= .08; a.group.updateMatrixWorld(true);
    }
    // Palms contact the OTHER man's collar; fingers curl through the cloth, with the wrists outside it.
    for (const [a, o] of [[fa, ma], [ma, fa]]) for (const s of ['L', 'R']) {
      PO.grip(a, s, front(o, 'neck', .14 * k(o), (s === 'L' ? .085 : -.085) * k(o), -.11 * k(o)), at(o, 'chest'));
      PO.fingers(a, s, .95, { thumb: .85 });
    }
    for (const a of [zo, ft]) for (const s of ['L', 'R']) PO.reach(a, s, front(a, 'chest', .13 * k(a), (s === 'L' ? -.065 : .065) * k(a), -.18 * k(a)), { grip: .025 });
    // Knock the loose cloth down late in b095; it stays on the paving through the procession.
    if (!st.tb) {
      const cloth=new THREE.Group();
      for(let j=0;j<5;j++){const fold=new THREE.Mesh(new THREE.TorusGeometry(.075+j*.012,.018,6,18,Math.PI*1.7),toon(0xf4efe4));fold.rotation.set(Math.PI/2+.13*Math.sin(j),.1*j,.7*j);fold.position.set(.035*Math.sin(j*2),.025+.009*j,.025*Math.cos(j));cloth.add(fold);}
      st.tb = S3.prop(cloth, 0, 0, 0);
      // Head-local marks follow the gaze applied after act(), including the dellal's turned cheek.
      st.bl = new THREE.Mesh(new THREE.SphereGeometry(.045, 12, 8), toon(0x9a1a14));
      const face = ma.S.face;
      st.bl.position.set(face.mouth[0] + .065, face.mouth[1] - ma.S.head + .025, face.mouth[2]);
      st.bl.scale.set(.65, 1, .18); ma.B.head.add(st.bl);
      st.strain = [fa, ma].map(a => {
        const g = new THREE.Group(), face = a.S.face, local = p => V(p[0], p[1] - a.S.head, p[2] + .008);
        for (const eye of [face.eyeL, face.eyeR]) {
          const rim = new THREE.Mesh(new THREE.TorusGeometry(face.eyeR_ * 1.05, .0045, 6, 16, Math.PI), toon(0xa1372e));
          rim.position.copy(local(eye)); rim.rotation.z = Math.PI; g.add(rim);
        }
        for (let j = 0; j < 3; j++) {
          const foam = new THREE.Mesh(new THREE.SphereGeometry(.013 - j * .002, 8, 6), toon(0xf6f2e7));
          foam.position.copy(local(face.mouth)).add(V(.028 + j * .007, -.005 - j * .012, .006)); g.add(foam);
        }
        a.B.head.add(g); return g;
      });
    }
    st.tb.visible = t >= dropAt;
    const tp = F([690, 815]), fall = 1 - sm(dropAt, dropAt + .55, t);
    st.tb.position.set(tp.x, .8 * fall, tp.z); st.tb.rotation.set(.8 * fall, .7 + 2 * fall, .5 * fall);
    st.bl.visible = t >= B(6)[0];
    for (const g of st.strain) g.visible = t >= B(6)[0];
    // the procession: hidden until b097, then they walk away up the lane behind the pair
    const travel = F(PATH[2]).sub(F(PATH[1])).multiplyScalar(.35);
    for (const [n, m] of FOLLOW) {
      const a = st.A[n], start = F(m);
      a.group.visible = t > c0 - .2;
      if (a.group.visible) { rest(a.B); walk(a, start, start.clone().add(travel), c0, c1, t, { cps: 1.9, ease: false }); }
    }
    for (const a of [fa, ma]) a.B.chest.updateWorldMatrix(false, true);
  },
}), ':s14:fi', true);

export default beatScene(ID, {
  shots: { mu, fi },
  plan: {
    b090: { shot: 'mu', size: 'W', on: 'mohammed' },   // the boy in frame, the father striding off up the passage
    b093: { shot: 'mu', size: 'M', on: 'zoubida', z: 1.2, dx: 100, dy: 250 },
    b094: { shot: 'mu', size: 'CU', on: 'fatma', z: 2.1, dx: 0, dy: 65 },
    b095: { shot: 'fi', size: 'M', on: 'father', z: 1.4, pt: [930, 710] },
    b096: { shot: 'fi', size: 'CU', on: 'marchand', z: 2.4, pt: [800, 760] },
    b097: { shot: 'fi', size: 'W', on: 'father' },
  },
});
