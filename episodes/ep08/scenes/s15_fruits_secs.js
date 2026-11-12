import { checkedStage } from './s13_attente.js';
// s15 "Le souk des fruits secs". b098 souk_mur, by the bench: the three burst out crying: Zoubida's hand pressed to her
// veil over the mouth, shoulders shaking; Fatma's head bowed, a hand on her chest; the boy wails, chin up, mouth wide,
// eyes screwed shut, arms hanging. b099 W: they come hurrying down the passage from the far gate toward the dried-fruit
// counter, looking left and right (insert: pyramids of dates, figs, almonds). b100 W: life goes on: a seller by the
// counter weighing, turned to a client; two urchins stroll past singing, swinging their arms. b101 CU high on the boy,
// very small, his hand gripping his mother's haik at her hip, his head turning, searching. b102 CU on Zoubida: she
// gives up: a slow defeated nod, eyes down, the shoulders dropping.
import * as PO from '../../../engine/poses.js';
import { apart, castScale, sealHaik, stride } from '../lib/fix8c.js';
import { haikTuck, haikOut } from '../lib/fix8_G4.js';
import { beatScene, lines, sm, front, at, V, dirW, yawTo } from '../lib/beatscene.js';

const ID = 's15_fruits_secs', L = lines(ID), B = i => L[i] || [0, 0];
const k = a => a.group.scale.y / 1.6;
const f = (i, x) => B(i)[0] + x * (B(i)[1] - B(i)[0]);
const win = (i, a, b, t) => sm(f(i, a) - .3, f(i, a) + .3, t) * (1 - sm(f(i, b), f(i, b) + .5, t));
const sob = (t, ph) => Math.max(0, Math.sin(t * 6.5 + ph)) ** 2 * (.6 + .4 * Math.sin(t * 1.3 + ph));
const sync = (...aa) => aa.forEach(a => a.group.updateMatrixWorld(true));
const scale = (a, h) => { a.group.scale.setScalar(h); sync(a); };
// These beats author their own eyelines; the dialogue gaze net would turn them sideways afterwards.
const gaze = { apply() {} };
const arm = (a, s) => {
  const sh = at(a, 'upperArm' + s), el = at(a, 'foreArm' + s);
  return { sh, len: sh.distanceTo(el) + el.distanceTo(at(a, 'hand' + s)) };
};
const hanging = (a, s, shake = 0) => {
  const { sh, len } = arm(a, s);
  return sh.addScaledVector(dirW(a, s === 'L' ? 1 : -1, 0, 0), .045 * k(a))
    .addScaledVector(dirW(a, 0, 0, 1), (.035 + shake) * k(a)).add(V(0, -.91 * len, 0));
};
// Measure wrist distance against arm length, including reach()'s grip offset (a ratio below 1 is reachable).
const reachRatio = (a, s, target, grip) => {
  const { sh, len } = arm(a, s);
  return Math.max(0, sh.distanceTo(target) - grip * k(a)) / (len * .999);
};

const STOP = { zoubida: [800, 820], mohammed: [665, 838], fatma: [1000, 790] };

const mu = checkedStage('souk_mur', {
  // Local marks only: at least 15 cm of garment clearance on either side of the boy.
  zoubida: { at: [420, 790], face: 'cam', costume: 'haik', seed: 7, talk: 0, lids: .75, lookMax: 0 },
  mohammed: { at: [700, 830], face: 'cam', seed: 3, talk: 0, lids: 1, lookMax: 0, mutter: t => 3.6 + .4 * Math.sin(t * 2.2) },
  fatma: { at: [1000, 790], face: 'cam', seed: 11, talk: 0, lids: .7, lookMax: 0 },
}, {
  light: { shadow: .4, area: 6 },
  act(lt, t, S, st) {
    st.G = gaze;
    st.actcheck={exposed:{zoubida:['handL','handR','foreArmL','foreArmR']}};
    const { zoubida: zo, mohammed: mo, fatma: ft } = st.A;
    for (const a of [zo, mo, ft]) { castScale(a); if (a.actMark?.costume === 'haik') sealHaik(a); }
    apart(mo, zo, .48); apart(mo, ft, .48);
    const kz = k(zo), kt = k(ft);
    for (const [a, ph, b] of [[zo, 0, .16], [ft, 1.9, .2], [mo, .8, .06]]) {
      const s = sob(t, ph);
      a.B.spine.rotation.x += b + .08 * s; a.B.chest.rotation.x += .06 + .12 * s;
      a.B.chest.rotation.z += .05 * Math.sin(t * 6.5 + ph);
      if (a.B.LeftShoulder) a.B.LeftShoulder.rotation.z += .045 * s;
      if (a.B.RightShoulder) a.B.RightShoulder.rotation.z -= .045 * s;
    }
    zo.B.neck.rotation.set(.035, 0, 0); zo.B.head.rotation.set(.035, 0, 0);
    ft.B.neck.rotation.set(.38, 0, 0); ft.B.head.rotation.set(.28 + .03 * sob(t, 1.9), 0, 0);
    // Net chin lift stays at 15–20 degrees, with an uneven sobbing rock.
    mo.B.spine.rotation.x = .015; mo.B.chest.rotation.x = .045 + .025 * sob(t, .8);
    mo.B.neck.rotation.set(-.12, .04 * Math.sin(t * 2.2), 0);
    mo.B.head.rotation.set(-.38 - .06 * Math.sin(t * 3.1), .08 * Math.sin(t * 2), .04 * Math.sin(t * 4.2));
    sync(zo, ft, mo);
    // Head pivot + mouth height, 11.5 cm in front of the face; a small grip avoids pulling the wrist down to the chest.
    haikTuck(zo); haikTuck(ft);
    // The torso capsule is a sphere around the neck: a palm on the mouth lands inside it.
    // The hand sits on the right cheek, clear of that sphere, still up at the veil.
    const mouth = at(zo, 'head').add(V(0, .01 * kz, 0)).addScaledVector(dirW(zo, -1, 0, 0), .05 * kz).addScaledVector(dirW(zo, 0, 0, 1), .15 * kz);
    st.mouthReach = reachRatio(zo, 'R', mouth, .01);
    PO.reach(zo, 'R', mouth, { grip: .01, pole: [-.6, .0, .3] });
    PO.fingers(zo, 'R', .08, { spread: .12 }); PO.palmTo(zo, 'R', 1, dirW(zo, 0, 0, -1));
    haikOut(ft, 'L', -.1, .04, .215, .15);
    for (const s of ['L', 'R']) PO.reach(mo, s, hanging(mo, s, .012 * Math.sin(t * 8 + (s === 'L' ? 0 : 1.4))), { grip: 0, pole: [s === 'L' ? .3 : -.3, -.1, -.25] });
    sync(zo, ft, mo);
  },
});

const fr = checkedStage('souk_mur', {
  zoubida: { at: [860, 660], costume: 'haik', seed: 7, talk: 0, walk: { to: STOP.zoubida, t0: B(1)[0] - .2, t1: B(1)[1] },
    lookMax: t => t >= B(4)[0] ? .3 : .55,
    look: (t, st) => t >= B(4)[0] ? [STOP.zoubida[0], STOP.zoubida[1] + 140, .45] : [880 + 210 * Math.sin((t - B(1)[0]) * 1.7), 790, 1.4],
    lids: t => .25 + .15 * sm(B(4)[0] - .3, B(4)[0] + .7, t) },
  mohammed: { at: [700, 670], seed: 3, talk: 0, walk: { to: STOP.mohammed, t0: B(1)[0] - .2, t1: B(1)[1] }, lookMax: .65,
    look: (t, st) => {
      const a = st.A.mohammed, h = at(a, 'head');
      // Eye line stays at human height throughout the horizontal search, including the CU.
      return h.addScaledVector(dirW(a, 0, 0, 1), 2.5).addScaledVector(dirW(a, 1, 0, 0), 1.8 * Math.sin((t - B(1)[0]) * 1.1)).setY(1.2);
    } },
  fatma: { at: [1000, 650], seed: 11, talk: 0, walk: { to: STOP.fatma, t0: B(1)[0] + .1, t1: B(1)[1] }, lookMax: .55,
    look: t => [880 - 210 * Math.sin((t - B(1)[0]) * 1.5), 790, 1.4] },
  // the trio stops left of centre so the seller and his client (right, by the counter) never cover them
  // life goes on (b100): a seller by the counter, turned to a client; two urchins stroll by singing
  // Foreground floor marks put the painted counter at waist height, rather than under their chins.
  man1: { at: [1420, 900], face: 'woman1', seed: 21, talk: 0, look: 'woman1', lookMax: .25 },
  woman1: { at: [1220, 1040], face: 'man1', seed: 25, talk: 0, look: 'man1', lookMax: .3 },
  kid2: { at: [470, 740], seed: 27, talk: 0, walk: { to: [120, 1000], t0: B(2)[0] - .3, t1: B(2)[1] + .4 }, mutter: t => win(2, 0, 1, t) * (1.1 + .3 * Math.sin(t * 5)) },
  kid3: { at: [560, 730], seed: 29, talk: 0, walk: { to: [360, 1060], t0: B(2)[0], t1: B(2)[1] + .7 }, mutter: t => win(2, 0, 1, t) * (1.1 + .3 * Math.sin(t * 5 + 1)) },
}, {
  light: { shadow: .4, area: 6 },
  traffic:['kid2','kid3','man1','woman1'],
  act(lt, t, S, st) {
    st.G = gaze;
    st.actcheck = { exposed: { zoubida: ['handL', 'handR', 'foreArmL', 'foreArmR'] } };
    const { zoubida: zo, mohammed: mo, fatma: ft, man1: m1, woman1: w1, kid2: k2, kid3: k3 } = st.A;
    for (const a of [zo, mo, ft, m1, w1, k2, k3]) { castScale(a); if (a.actMark?.costume === 'haik') sealHaik(a); }
    const kz = k(zo), k1 = k(m1);
    // Different action from mu: quick strides and low swinging hands, with no chest/veil reaches.
    const hurry = sm(B(1)[0] - .2, B(1)[0] + .15, t) * (1 - sm(B(1)[1] - .45, B(1)[1], t));
    for (const [a, ph] of [[zo, 0], [mo, .8], [ft, 1.7]]) {
      a.B.neck.rotation.y = .45 * Math.sin((t - B(1)[0]) * 1.7 + ph) * hurry;
      a.B.head.rotation.set(.04 * hurry, .6 * Math.sin((t - B(1)[0]) * 1.7 + ph), 0);
      sync(a);
    }
    for (const a of [k2, k3]) a.group.visible = t > B(2)[0] - .2 && t < B(2)[1] + .4;
    for (const a of [m1, w1]) a.group.visible = t < B(3)[0];
    ft.group.visible = t < B(3)[0];   // neither CU admits a sliced-off neighbour at its edge
    mo.group.visible = t < B(4)[0];   // the mother's reaction has the boy just off screen below her eyeline
    // The strolling boys retain their leg cycle; wrist IK adds a relaxed, plainly visible arm swing.
    for (const [a, ph] of [[k2, 0], [k3, .4]]) if (a.group.visible) stride(a, t, B(2)[0] + ph, 2.1, 1, false);
    // Seller alternates a low scoop/weighing movement with an offer toward the client.
    const scoop = .5 + .5 * Math.sin((t - B(2)[0]) * 2.2);
    m1.group.rotation.y = yawTo(m1.group.position, w1.group.position) + .18 * Math.sin(t * 1.7);
    m1.B.spine.rotation.x += .16 * (1 - scoop); m1.B.chest.rotation.y += .14 * Math.sin(t * 1.7);
    w1.B.chest.rotation.x += .045 * Math.sin(t * 1.7 + 1); sync(m1, w1);
    PO.reach(m1, 'R', front(m1, 'root', (.36 + .12 * scoop) * k1, (.20 - .08 * scoop) * k1, (.16 + .20 * scoop) * k1), { grip: .02, pole: [-.6, -.05, .18] });
    PO.reach(m1, 'L', front(m1, 'root', .40 * k1, -.22 * k1, (.30 + .06 * Math.sin(t * 1.7 + .7)) * k1), { grip: .015, pole: [.6, -.05, .18] });
    PO.fingers(m1, 'R', .5);
    // urchins: plain arm swing, opposite phases
    for (const [a, ph] of [[k2, 0], [k3, .4]]) if (a.group.visible) for (const s of ['L', 'R']) {
      const sw = .13 * Math.sin(t * 5.5 + ph + (s === 'L' ? 0 : Math.PI));
      PO.reach(a, s, hanging(a, s, sw), { grip: 0, pole: [s === 'L' ? .3 : -.3, -.1, -.25] });
    }
    PO.reach(w1, 'R', front(w1, 'root', .25 * k(w1), .12 * k(w1), .12 + .04 * scoop), { grip: .02 });

    // Stopped: both mother's hands remain inside the waist drape, as set by hang('haik').
    // No reach to her chest or mouth is active anywhere in fr.
    const cling = t >= B(3)[0] ? sm(B(3)[0], B(3)[0] + .65, t) : 0;
    if (cling > 0) {
      const zr = at(zo, 'root'), mr = at(mo, 'root'), d = mr.clone().sub(zr).setY(0).normalize();
      // The boy steps beside the hip before reaching; keep his shoulder within his measured arm span.
      const handTarget = zr.clone().addScaledVector(d, .225 * kz);
      handTarget.y = zr.y - .02 * kz;
      const shoulder=at(mo,'upperArmL'),len=arm(mo,'L').len,offset=handTarget.clone().sub(shoulder),dist=offset.length();
      if(dist>len*.90){offset.y=0;mo.group.position.addScaledVector(offset.normalize(),(dist-len*.90)*cling);sync(mo);}
      mo.B.spine.rotation.x += .035 * cling; mo.B.spine.rotation.z += .05 * Math.sin(t * 1.6) * cling;
      mo.B.head.rotation.y = .4 * Math.sin((t - B(3)[0]) * 1.25); sync(mo);
      const rest = hanging(mo, 'L'), hip = handTarget;   // own waist, just 5 cm above a hanging hand
      st.gripReach = reachRatio(mo, 'L', hip, .01);
      PO.reach(mo, 'L', rest.lerp(hip, cling), { grip: .01, pole: [.35, -.10, .16] });
      PO.fingers(mo, 'L', .72 * cling);
    }
    // b102: one slow dip and a lasting slump. Keep neck pitch below .1, including the capped gaze after act().
    const defeat = sm(B(4)[0], f(4, .75), t), dip = Math.sin(Math.PI * sm(B(4)[0], B(4)[1], t));
    zo.B.neck.rotation.x = .03 * defeat;
    zo.B.chest.rotation.x += .2 * defeat + .12 * dip; zo.B.spine.rotation.x += .12 * defeat;
    if (zo.B.LeftShoulder) zo.B.LeftShoulder.rotation.z -= .065 * defeat;
    if (zo.B.RightShoulder) zo.B.RightShoulder.rotation.z += .065 * defeat;
    if (hurry > .2) for (const [a, ph, t0] of [[zo, 0, B(1)[0] - .2], [mo, .8, B(1)[0] - .2], [ft, 1.7, B(1)[0] + .1]]) stride(a, t + ph, t0, 3.4, hurry, true);
    haikTuck(zo); haikTuck(ft);
    sync(zo, mo, m1);
  },
});

export default beatScene(ID, {
  shots: { mu, fr },
  plan: {
    b098: { shot: 'mu', size: 'M', on: 'mohammed', z: 1.2 },   // all three in: mother, boy, neighbour
    b099: { shot: 'fr', size: 'W', on: 'zoubida', insAt: .62 },
    b100: { shot: 'fr', size: 'W', on: 'kid2' },
    // pt follows their final floor marks (coverage otherwise anchors to their distant build positions).
    b101: { shot: 'fr', size: 'CU', on: 'mohammed', pt: STOP.mohammed, z: 2.5, dx: 30, dy: 60 },   // boy head-to-hip, grip in frame
    b102: { shot: 'fr', size: 'CU', on: 'zoubida', pt: STOP.zoubida, z: 2.8, dx: -20, dy: 36 },   // full hood and headroom
  },
});
