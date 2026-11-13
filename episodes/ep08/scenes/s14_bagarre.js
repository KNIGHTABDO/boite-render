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
import { apart, castScale, faceCam, reachClamp, sealHaik, stride } from '../lib/fix8c.js';
import { haikTuck, haikOut, behind } from '../lib/fix8_G4.js';
import { bareHead } from '../lib/fix8_g5.js';
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
  father: { at: [800, 850], face: [700, 900], seed: 5, talk: 0, walk: { to: [770, 630], t0: B(0)[0] + .2, t1: B(0)[1] - .15 } },
  mohammed: { at: [700, 900], face: [680, 850], seed: 3, talk: 0, lookMax: .15, look: () => null },
  zoubida: { at: [520, 860], face: [800, 1000], costume: 'haik', seed: 7, talk: 0, lookMax: .9, lids: t => .35 * win(3, 0, 1, t),
    look: t => t > B(3)[0] && t < B(4)[0] ? [560, 980, 0] : t < B(1)[0] ? 'father' : null },
  fatma: { at: [980, 900], face: [900, 980], costume: 'haik', seed: 11, talk: 0, lookMax: 1.7,
    look: (t, st, S3) => t > B(4)[0] ? S3.cam.position : t < B(1)[0] ? 'father' : null },
  man1: { at: [1220, 610], face: [300, 980], seed: 21, talk: 0 },
  kid2: { at: [1300, 640], face: [300, 980], seed: 27, talk: 0 },
  woman1: { at: [1220, 610], face: [300, 980], seed: 25, talk: 0 },
  kid3: { at: [1300, 640], face: [300, 980], seed: 29, talk: 0 },
  woman2: { at: [1220, 610], face: [300, 980], seed: 23, talk: 0 },
  kid1: { at: [1300, 640], face: [300, 980], seed: 26, talk: 0 },
}, {
  traffic:['man1','kid2','woman1','kid3','woman2','kid1'],
  act(lt, t, S, st, S3) {
    st.actcheck={exposed:{zoubida:['handL','handR','foreArmL','foreArmR'],fatma:['handL','handR','foreArmL','foreArmR']},contacts:[{actors:['father','mohammed'],parts:['foreArmR:torso','foreArmR:head']}]};
    const { father: fa, mohammed: mo, zoubida: zo, fatma: ft } = st.A, kz = k(zo), kt = k(ft), kf = k(fa);
    for (const a of Object.values(st.A)) { castScale(a); if (a.actMark?.costume === 'haik' || a.haikClosed) sealHaik(a); }
    apart(mo, zo, .42); apart(mo, ft, .42);
    // b090: the father is bigger at depth than the plain perspective read (stall counters beside him)
    fa.group.scale.multiplyScalar(1.04); fa.group.updateMatrixWorld(true);
    // Closed haik, elbows outside the ribs. The hop and the tug replace this below.
    // runners deep in the passage during the trampling (b093–b094)
    const r0 = B(3)[0] - .3;
    for (const [n, p0, p1, dt] of [
      ['woman1', [1300, 690], [900, 690], 3.5], ['kid3', [1350, 700], [900, 710], 4.4], ['woman2', [420, 700], [1300, 700], 3.9],
    ]) {
      const a = st.A[n], t0 = r0 + dt, t1 = t0 + 2.9;
      a.group.visible = t > t0 && t < t1;
      if (a.group.visible) { rest(a.B); walk(a, S3.floorAt(...p0), S3.floorAt(...p1), t0, t1, t, { cps: 3.2, ease: false }); stride(a, t, t0, 3.2, 1, true); }
    }
    // b090: a crowd up the passage that he walks into (heads-down shoppers crossing, slowly)
    for (const [n, p0, p1] of [['man1', [960, 700], [650, 690]], ['woman2', [600, 690], [950, 720]], ['kid1', [900, 760], [660, 750]], ['woman1', [720, 640], [860, 650]], ['kid3', [1000, 680], [780, 670]], ['kid2', [800, 650], [700, 640]]]) {
      const a = st.A[n], u0 = 0, u1 = B(1)[0] + .2;
      if (t >= u1) { if (['man1', 'kid1', 'kid2'].includes(n)) a.group.visible = false; }
      else { a.group.visible = true; rest(a.B); walk(a, S3.floorAt(...p0), S3.floorAt(...p1), u0, u1, t, { cps: 1.4, ease: false }); stride(a, t, u0, 1.4, .8, false); }
    }
    // b090 he rises from setting the boy down (bent at first), then strides away and is swallowed by the passage
    const up = sm(0, B(0)[0] + .2, t);
    if (t >= B(0)[0] + .2 && t < B(0)[1]) stride(fa, t, B(0)[0] + .2, 2.6, 1, true);
    fa.B.spine.rotation.x += .55 * (1 - up); fa.B.spine.updateWorldMatrix(false, true);
    if (up < 1) reachClamp(fa, 'R', at(mo, 'neck').lerp(front(fa, 'root', .2 * kf, .2 * kf, .2 * kf), up), { grip: .025, pole: [-.42, .12, .22] });
    fa.group.visible = t < B(1)[0];
    if (t < B(1)[0]) {
      const turn = sm(B(0)[0], B(0)[0] + 1.2, t), initial = yawTo(mo.group.position, S3.floorAt(800, 850));
      const follow = yawTo(mo.group.position, fa.group.position);
      mo.B.spine.rotation.x += .06*(1-turn);mo.B.chest.rotation.y += .12*turn;
      const cam = S3.cam.position, yCam = Math.atan2(cam.x - mo.group.position.x, cam.z - mo.group.position.z);
      let y = initial + Math.atan2(Math.sin(follow - initial), Math.cos(follow - initial)) * turn;
      const off = Math.atan2(Math.sin(y - yCam), Math.cos(y - yCam));
      if (Math.abs(off) > 1.05) y = yCam + Math.sign(off) * 1.05;
      mo.group.rotation.y = y;
      mo.group.updateMatrixWorld(true);
      faceCam(mo, S3.cam, 1.15);
      if (st.G && !st.G._wrapped) {
        const inner = st.G;
        st.G = { _wrapped: true, apply(tt) { inner.apply(tt); if (tt < B(1)[0]) faceCam(mo, S3.cam, 1.05); } };
      }
    }
    // b093 trampled: jolt, hop on the left foot, right knee up, folding toward it
    const hu = win(3, 0, .95, t), hop = Math.max(0, Math.sin((t - B(3)[0]) * 9)) * hu;
    { const dd = Math.hypot(-.5, .86); zo.haikLift = { w: hu, dx: -.5 / dd, dz: .86 / dd, lift: .5 / zo.group.scale.y, bulge: .1 / zo.group.scale.y }; }
    if (hu > 0) {
      zo.B.thighR.rotation.x -= 1.15 * hu; zo.B.shinR.rotation.x += 1.35 * hu;
      zo.B.spine.rotation.x += .7 * hu; zo.B.chest.rotation.x += .4 * hu; zo.B.neck.rotation.x += .1 * hu; zo.B.head.rotation.x += .2 * hu;
      zo.group.position.y += .08 * hop * kz; zo.group.updateMatrixWorld(true); zo.B.spine.updateWorldMatrix(false, true);
      // Lift the foot into the measured two-arm workspace before either hand reaches for it.
      const ankle=at(zo,'footR'), lifted=front(zo,'root',.16*kz,.05*kz,-.4*kz);
      IK.leg(zo,'R',ankle.lerp(lifted,hu),front(zo,'root',.5*kz,.12*kz,-.1*kz));
      const foot = front(zo, 'footR', -.02 * kz, 0, .035 * kz);
      for (const s of ['L', 'R']) reachClamp(zo, s, front(zo, 'root', .12 * kz, (s === 'L' ? -.3 : .3) * kz, .1 * kz)
        .lerp(foot.clone().add(V((s === 'L' ? -.04 : .04) * kz, .02 * kz, 0)), hu), { grip: .02, pole: [s === 'L' ? .7 : -.7, 0, .1] });
    }
    // b094 the haik tugged from behind: chest twists after it, both fists at the breastbone
    const tug = win(4, 0, 1, t), jerk = Math.max(0, Math.sin((t - B(4)[0]) * 5.5)) ** 3;
    if (tug > 0) {
      // Back half-turned to the lens (she was walking on); the chest twists after the tug until her face and the cloth she clutches face us.
      ft.group.rotation.y = yawTo(ft.group.position, S3.cam.position) + 2.2; ft.group.updateMatrixWorld(true);
      ft.B.spine.rotation.y -= (.7 + .1 * jerk) * tug; ft.B.chest.rotation.y -= .6 * tug; ft.B.neck.rotation.y -= .45 * tug;
      ft.B.spine.rotation.x -= .08 * jerk * tug; ft.group.position.add(V(.03 * jerk * kt, 0, -.04 * jerk * kt));
      ft.group.updateMatrixWorld(true); ft.B.spine.updateWorldMatrix(false, true);
      // fists ON the cloth surface at the breastbone, where the chest points (not inside the cylinder)
      const cq = ft.B.chest.getWorldQuaternion(new THREE.Quaternion()), gq = ft.group.getWorldQuaternion(new THREE.Quaternion()).invert();
      const dl = S3.cam.position.clone().sub(ft.group.position); dl.y = 0; dl.normalize().applyQuaternion(gq); dl.y = 0; dl.normalize();
      const sd = V(dl.z, 0, -dl.x);
      const sc = ft.group.scale.y, ch = ft.group.worldToLocal(at(ft, 'chest')), rt = ft.group.worldToLocal(at(ft, 'root'));
      const nk = ft.group.worldToLocal(at(ft, 'neck')), yy = ch.y - .2 / ft.group.scale.y, uu = Math.min(.85, Math.max(.1, (yy - .012) / (nk.y + .006))), R = .235 - .035 * uu;
      const cx = rt.x + (ch.x - rt.x) * .75, cz = rt.z + (ch.z - rt.z) * .75;
      const rr = 1 / Math.sqrt((dl.x / R) ** 2 + (dl.z / (.86 * R)) ** 2);
      for (const s of ['L', 'R']) {
        const off = (s === 'L' ? 1 : -1) * .05 / sc, o = ft.group.localToWorld(V(cx + dl.x * (rr + .012) + sd.x * off, yy, cz + dl.z * (rr + .012) + sd.z * off));
        PO.grip(ft, s, o, at(ft, 'chest'), { pole: [s === 'L' ? .6 : -.6, -.2, .2] });
        PO.fingers(ft, s, .95, { thumb: .85 });
      }
    }
    if (hu <= 0) haikTuck(zo);
    if (tug <= 0) haikTuck(ft);
    if (t < B(1)[0] && fa.group.visible) { ft.group.rotation.y = yawTo(ft.group.position, fa.group.position); ft.group.updateMatrixWorld(true); }
    // The close-up is Fatma alone; a neighbour's head must not sit cut on the frame edge.
    if (t >= B(3)[0] && t < B(4)[0] - .1) ft.group.visible = false; else ft.group.visible = true;
    if (t >= B(4)[0] && t < B(4)[1]) { mo.group.visible = false; zo.group.visible = false; }
    for (const a of [fa, zo, ft]) a.B.chest.updateWorldMatrix(false, true);
  },
}), ':s14:mu:fatma');

// the fight: the pair grips collars and shoves along a path (the walk gives the legs; the bodies face each other)
const PATH = [[1120, 640], [770, 760], [800, 690]];   // across lens-left → held close → still in front of the crowd
const FOLLOW = [
  ['man1', [600, 800]], ['woman1', [1000, 780]], ['woman2', [1120, 770]],
  ['kid2', [700, 830]], ['kid3', [900, 810]], ['kid1', [850, 860]],
];
const dropAt = f(5, .9), turbanAt = B(6)[0] + 5.05, bloodAt = B(6)[0] + 7.5;
const fi = soukCast(checkedStage('souk_bijoux', {
  father: { at: PATH[0], seed: 5, talk: 0, look: null, lookMax: .1 },
  marchand: { at: PATH[0], seed: 13, talk: 0, look: null, lookMax: .1, mutter: t => .35 + .2 * Math.sin(t * 7) },
  // Up the lane from the pair, so a foreground haik does not cover the grapple.
  zoubida: { at: [640, 660], face: [770, 760], costume: 'haik', seed: 7, talk: 0, lookMax: .8, look: 'father' },
  mohammed: { at: [560, 700], face: [770, 760], seed: 3, talk: 0, look: 'father' },
  fatma: { at: [1220, 680], face: [770, 760], costume: 'haik', seed: 11, talk: 0, look: 'father' },
  // the procession (b097): they follow from the foreground, backs to us
  man1: { at: FOLLOW[0][1], seed: 21, talk: 0 }, woman1: { at: FOLLOW[1][1], seed: 25, talk: 0 },
  woman2: { at: FOLLOW[2][1], seed: 23, talk: 0 }, kid2: { at: FOLLOW[3][1], seed: 27, talk: 0 }, kid3: { at: FOLLOW[4][1], seed: 29, talk: 0 }, kid1: { at: FOLLOW[5][1], seed: 26, talk: 0 },
}, {
  traffic:['man1','woman1','woman2','kid2','kid3','kid1'],
  // A paving insert on the turban phrase: the baked headwear is entirely above the crop.
  view: (lt, u, t) => t >= turbanAt && t < bloodAt ? [690, 815, 3.8] : null,
  act(lt, t, S, st, S3) {
    st.actcheck={insert:t>=turbanAt&&t<bloodAt,contacts:[{actors:['father','marchand'],parts:['foreArmL:torso','foreArmR:torso','foreArmL:head','foreArmR:head','foreArmL:foreArmR','foreArmL:foreArmL','foreArmR:foreArmR','foreArmL:handR','handR:foreArmL','foreArmR:handL','handL:foreArmR','handL:handR','handR:handL','foreArmL:upperArmR','upperArmR:foreArmL','foreArmR:upperArmL','upperArmL:foreArmR','upperArmL:upperArmR','foreArmL:upperArmL','foreArmR:upperArmR']}]};
    const { father: fa, marchand: ma, zoubida: zo, fatma: ft, mohammed: mo } = st.A, F = p => S3.floorAt(...p);
    for (const a of Object.values(st.A)) { castScale(a); if (a.actMark?.costume === 'haik' || a.haikClosed) sealHaik(a); }
    // the pair's centre point along the path
    const a0 = B(5)[0] - .4, a1 = B(5)[1], c0 = B(7)[0] - .2, c1 = B(7)[1] + .6;
    const rec = sm(c0, c1, t);
    const C = t < a1 ? F(PATH[0]).lerp(F(PATH[1]), sm(a0, a1, t)) : F(PATH[1]).lerp(F(PATH[2]), rec);
    const moving = (t > a0 && t < a1) || (t > c0 && t < c1);
    const axis0 = (st.ax ||= F([700, 760]).sub(F([840, 760])).setY(0).normalize());   // the line between them: across the lens
    // b097: the pair turns to a line along the lane (father nearer the lens, back to us) as they shove up the souk
    const axis = axis0.clone().lerp(F([800, 880]).sub(F([800, 640])).setY(0).normalize(), rec * .45).normalize();
    const UP = false;
    const upDir = F([800, 640]).sub(F([800, 880])).setY(0).normalize();
    const knock = Math.exp(-(((t - dropAt) / .18) ** 2));
    const sh = .09 * Math.sin(t * 2.6) + .04 * Math.sin(t * 5.1) - .07 * knock;
    for (const [a, s] of [[fa, 1], [ma, -1]]) {
      const p = UP ? C.clone().addScaledVector(upDir, s > 0 ? -.3 : .3) : C.clone().addScaledVector(axis, s * .27 + sh);
      rest(a.B);
      if (moving) walkPose(a.B, (t - a0) * 1.2 + (s < 0 ? .5 : 0), .55);
      a.group.position.set(p.x, 0, p.z);
    }
    // Set BOTH positions before turning either man; no previous-frame opponent position enters the facing.
    for (const [a, o] of [[fa, ma], [ma, fa]]) {
      a.group.rotation.y = UP ? Math.atan2(upDir.x, upDir.z) : yawTo(a.group.position, o.group.position);
      const heave = Math.sin(t * 3.6 + (a === fa ? 0 : 1.4));
      a.B.spine.rotation.x += .3 + .08 * heave + .12 * knock; a.B.chest.rotation.y += (a === fa ? .18 : -.18) * Math.sin(t * 2.6);
      a.B.chest.rotation.x -= .055 * heave; a.B.chest.position.z += .012 * heave;
      a.B.neck.rotation.x -= .04; a.group.updateMatrixWorld(true);
      if (!UP) faceCam(a, S3.cam, a === fa && rec > .25 ? 1.68 : 1.55);
    }
    if (st.G && !st.G._wrapped) {
      const inner = st.G;
      st.G = { _wrapped: true, apply(tt) { inner.apply(tt); { faceCam(fa, S3.cam, sm(c0, c1, tt) > .25 ? 1.68 : 1.55); faceCam(ma, S3.cam, 1.55); } } };
    }
    // the turban is lost on b096's phrase: from then on he is bareheaded (baked into the mesh, so swap the geometry)
    { const m = fa.mesh; if (m) { if (!m.userData.r15Orig && m.geometry !== m.userData.bareGeo) m.userData.r15Orig = m.geometry; if (t >= turbanAt) bareHead(fa); else if (m.userData.r15Orig) m.geometry = m.userData.r15Orig; } }
    // Palms contact the OTHER man's collar; fingers curl through the cloth, with the wrists outside it.
    for (const [a, o] of [[fa, ma], [ma, fa]]) for (const s of ['L', 'R']) {
      if (UP && a === ma) { PO.reach(ma, s, front(ma, 'chest', .1 * k(ma), (s === 'L' ? -.2 : .2) * k(ma), -.4 * k(ma)), { grip: .01 }); continue; }
      PO.grip(a, s, front(o, 'neck', UP ? -.1 * k(o) : .12 * k(o), (s === 'L' ? .08 : -.08) * k(o), -.09 * k(o)), at(o, 'chest'), { pole: [s === 'L' ? .5 : -.5, .0, .3] });
      PO.fingers(a, s, .95, { thumb: .85 });
    }
    st.actcheck.exposed = { ...(st.actcheck.exposed || {}), zoubida: ['handL', 'handR', 'foreArmL', 'foreArmR'], fatma: ['handL', 'handR', 'foreArmL', 'foreArmR'] };
    if (zo.group.visible) haikTuck(zo);
    if (ft.group.visible) haikTuck(ft);
    apart(zo, ft, 1.2);
    for (const [a, c, sc] of [[zo, 0xd9a21b, 1], [ft, 0x9b4a2a, .98]]) {
      if (!a.shoeM || a.shoeM.parent !== a.group) { for (const sx of [-.075, .075]) { const m = new THREE.Mesh(new THREE.SphereGeometry(.05, 10, 8), toon(c)); m.scale.set(.8, .4, 1.4); m.position.set(sx, .02, .17); a.group.add(m); a.shoeM = m; } }
      a.group.scale.multiplyScalar(sc); a.group.updateMatrixWorld(true);
    }
    zo.group.rotation.y = yawTo(zo.group.position, F([770, 760])) + .35; ft.group.rotation.y = yawTo(ft.group.position, F([770, 760])) - .3; zo.group.updateMatrixWorld(true); ft.group.updateMatrixWorld(true);
    // Knock the loose cloth down late in b095; it stays on the paving through the procession.
    if (!st.tb) {
      const cloth=new THREE.Group(), rnd=(x=>()=>(x=(x*16807)%2147483647)/2147483647)(77);
      // a crumpled heap of flattened lumps with two unwound strips trailing off it
      for(let j=0;j<8;j++){const lump=new THREE.Mesh(new THREE.SphereGeometry(.04+.03*rnd(),10,8),toon(j%3?0xf4efe4:0xe6dfcf));lump.scale.set(1+.6*rnd(),.32+.2*rnd(),.8+.5*rnd());lump.position.set((rnd()-.5)*.17,.012+.012*rnd(),(rnd()-.5)*.12);lump.rotation.y=rnd()*3;cloth.add(lump);}
      for(const [yaw,len] of [[.5,.34],[-.9,.26]]){const strip=new THREE.Mesh(new THREE.BoxGeometry(len,.004,.05),toon(0xf0eadc));strip.position.set(Math.cos(yaw)*(len/2+.05),.006,Math.sin(yaw)*(len/2+.05));strip.rotation.set(0,-yaw,.04*Math.sign(yaw));cloth.add(strip);}
      st.tb = S3.prop(cloth, 0, 0, 0);
      // Head-local marks follow the gaze applied after act(), including the dellal's turned cheek.
      st.bl = new THREE.Mesh(new THREE.SphereGeometry(.06, 12, 8), toon(0xb01a12));
      const face = ma.S.face;
      st.bl.position.set(face.mouth[0] + .065, face.mouth[1] - ma.S.head + .025, face.mouth[2]);
      st.bl.scale.set(.65, 1, .18); ma.B.head.add(st.bl);
      st.strain = [fa, ma].map(a => {
        const g = new THREE.Group(), face = a.S.face, local = p => V(p[0], p[1] - a.S.head, p[2] + .008);
        for (const eye of [face.eyeL, face.eyeR]) {
          const rim = new THREE.Mesh(new THREE.TorusGeometry(face.eyeR_ * 1.05, .008, 6, 16, Math.PI * 2), toon(0xc9261c));
          rim.position.copy(local(eye)); rim.rotation.z = Math.PI; g.add(rim);
        }
        for (let j = 0; j < 3; j++) {
          const foam = new THREE.Mesh(new THREE.SphereGeometry(.021 - j * .003, 8, 6), toon(0xf6f2e7));
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
    const travel = F(PATH[2]).sub(F(PATH[1])).multiplyScalar(.7);
    for (const [n, m] of FOLLOW) {
      const a = st.A[n], start = F(m);
      a.group.visible = t > c0 - .2;
      if (a.group.visible) { rest(a.B); walk(a, start, start.clone().add(travel), c0, c1, t, { cps: 1.9, ease: false }); stride(a, t, c0, 1.9, 1, false); }
    }
    for (const a of [zo, ft, mo]) a.group.visible = t < c0 - .15;
    for (const a of [fa, ma]) a.B.chest.updateWorldMatrix(false, true);
  },
}), ':s14:fi', true);

const scene = beatScene(ID, {
  shots: { mu, fi },
  plan: {
    b090: { shot: 'mu', size: 'W', on: 'mohammed' },   // the boy in frame, the father striding off up the passage
    b093: { shot: 'mu', size: 'M', on: 'zoubida', z: 1.3, dx: -40, dy: 260 },
    b094: { shot: 'mu', size: 'CU', on: 'fatma', z: 3.2, dx: 0, dy: 20 },
    b095: { shot: 'fi', size: 'M', on: 'father', z: 1.4, pt: [930, 710] },
    b096: { shot: 'fi', size: 'CU', on: 'marchand', z: 3.4, dx: -70, dy: 0, pt: [830, 760] },
    b097: { shot: 'fi', size: 'W', on: 'father' },
  },
});
const draw = scene.draw;
scene.draw = (t, S) => { const fin = draw(t, S); scene.noExam = t >= B(6)[0] - .2 && t < B(6)[1] + 1; return fin; };
export default scene;
