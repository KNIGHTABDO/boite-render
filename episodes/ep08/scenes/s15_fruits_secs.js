// s15 "Le souk des fruits secs". b098 souk_mur, by the bench: the three burst out crying: Zoubida's hand pressed to her
// veil over the mouth, shoulders shaking; Fatma's head bowed, a hand on her chest; the boy wails, chin up, mouth wide,
// eyes screwed shut, arms hanging. b099 W: they come hurrying down the passage from the far gate toward the dried-fruit
// counter, looking left and right (insert: pyramids of dates, figs, almonds). b100 W: life goes on: a seller by the
// counter weighing, turned to a client; two urchins stroll past singing, swinging their arms. b101 CU high on the boy,
// very small, his hand gripping his mother's haik at her hip, his head turning, searching. b102 CU on Zoubida: she
// gives up: a slow defeated nod, eyes down, the shoulders dropping.
import * as PO from '../../../engine/poses.js';
import { staged } from '../lib/autostage.js';
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

const mu = staged('souk_mur', {
  // Local marks only: at least 15 cm of garment clearance on either side of the boy.
  zoubida: { at: [420, 790], face: 'cam', costume: 'haik', seed: 7, talk: 0, lids: .75, lookMax: 0 },
  mohammed: { at: [700, 830], face: 'cam', seed: 3, talk: 0, lids: 1, lookMax: 0, mutter: t => 3.6 + .4 * Math.sin(t * 2.2) },
  fatma: { at: [1000, 790], face: 'cam', seed: 11, talk: 0, lids: .7, lookMax: 0 },
}, {
  light: { shadow: .4, area: 6 },
  act(lt, t, S, st) {
    st.G = gaze;
    const { zoubida: zo, mohammed: mo, fatma: ft } = st.A;
    scale(zo, 1.6); scale(mo, 1.1); scale(ft, 1.58);
    const kz = k(zo), kt = k(ft);
    for (const [a, ph, b] of [[zo, 0, .10], [ft, 1.9, .13], [mo, .8, .02]]) {
      const s = sob(t, ph);
      a.B.spine.rotation.x += b + .025 * s; a.B.chest.rotation.x += .035 + .07 * s;
      a.B.chest.rotation.z += .02 * Math.sin(t * 6.5 + ph);
      if (a.B.LeftShoulder) a.B.LeftShoulder.rotation.z += .045 * s;
      if (a.B.RightShoulder) a.B.RightShoulder.rotation.z -= .045 * s;
    }
    zo.B.neck.rotation.set(.035, 0, 0); zo.B.head.rotation.set(.035, 0, 0);
    ft.B.neck.rotation.set(.16, 0, 0); ft.B.head.rotation.set(.17 + .025 * sob(t, 1.9), 0, 0);
    // Net chin lift stays at 15–20 degrees, with an uneven sobbing rock.
    mo.B.spine.rotation.x = .015; mo.B.chest.rotation.x = .045 + .025 * sob(t, .8);
    mo.B.neck.rotation.set(-.08, 0, 0); mo.B.head.rotation.set(-.30 - .018 * Math.sin(t * 3.1), .025 * Math.sin(t * 2), .025 * Math.sin(t * 4.2));
    sync(zo, ft, mo);
    // Head pivot + mouth height, 11.5 cm in front of the face; a small grip avoids pulling the wrist down to the chest.
    const mouth = at(zo, 'head').add(V(0, .04 * kz, 0)).addScaledVector(dirW(zo, 0, 0, 1), .115);
    st.mouthReach = reachRatio(zo, 'R', mouth, .015);
    PO.reach(zo, 'R', mouth, { grip: .015, pole: [-.42, -.12, .15] });
    PO.fingers(zo, 'R', .08, { spread: .12 }); PO.palmTo(zo, 'R', 1, dirW(zo, 0, 0, -1));
    PO.reach(ft, 'L', front(ft, 'chest', .17 * kt, -.035 * kt, .035 * kt), { grip: .015, pole: [.38, -.08, .1] });
    PO.fingers(ft, 'L', .02); PO.palmTo(ft, 'L', 1, dirW(ft, 0, 0, -1));
    for (const s of ['L', 'R']) PO.reach(mo, s, hanging(mo, s, .012 * Math.sin(t * 8 + (s === 'L' ? 0 : 1.4))), { grip: 0, pole: [s === 'L' ? .3 : -.3, -.1, -.25] });
    sync(zo, ft, mo);
  },
});

const fr = staged('souk_mur', {
  zoubida: { at: [860, 660], costume: 'haik', seed: 7, talk: 0, walk: { to: STOP.zoubida, t0: B(1)[0] - .2, t1: B(1)[0] + 3.4 },
    lookMax: t => t >= B(4)[0] ? .075 : .55,
    look: (t, st) => t >= B(4)[0] ? at(st.A.mohammed, 'head') : [880 + 210 * Math.sin((t - B(1)[0]) * 1.7), 790, 1.4],
    lids: t => .4 + .3 * sm(B(4)[0] - .3, B(4)[0] + .7, t) },
  mohammed: { at: [700, 670], seed: 3, talk: 0, walk: { to: STOP.mohammed, t0: B(1)[0] - .2, t1: B(1)[0] + 3.4 }, lookMax: .65,
    look: (t, st) => {
      const a = st.A.mohammed, h = at(a, 'head');
      // Eye line stays at human height throughout the horizontal search, including the CU.
      return h.addScaledVector(dirW(a, 0, 0, 1), 2.5).addScaledVector(dirW(a, 1, 0, 0), 1.8 * Math.sin((t - B(1)[0]) * 1.1)).setY(1.2);
    } },
  fatma: { at: [1000, 650], seed: 11, talk: 0, walk: { to: STOP.fatma, t0: B(1)[0] + .1, t1: B(1)[0] + 3.7 }, lookMax: .55,
    look: t => [880 - 210 * Math.sin((t - B(1)[0]) * 1.5), 790, 1.4] },
  // the trio stops left of centre so the seller and his client (right, by the counter) never cover them
  // life goes on (b100): a seller by the counter, turned to a client; two urchins stroll by singing
  // Foreground floor marks put the painted counter at waist height, rather than under their chins.
  man1: { at: [1330, 930], face: 'woman1', seed: 21, talk: 0, look: 'woman1', lookMax: .25 },
  woman1: { at: [1220, 1030], face: 'man1', seed: 25, talk: 0, look: 'man1', lookMax: .3 },
  kid2: { at: [620, 740], seed: 27, talk: 0, walk: { to: [330, 1010], t0: B(2)[0] - .3, t1: B(2)[1] + .4 }, mutter: t => win(2, 0, 1, t) * (1.1 + .3 * Math.sin(t * 5)) },
  kid3: { at: [700, 730], seed: 29, talk: 0, walk: { to: [430, 1030], t0: B(2)[0], t1: B(2)[1] + .7 }, mutter: t => win(2, 0, 1, t) * (1.1 + .3 * Math.sin(t * 5 + 1)) },
}, {
  light: { shadow: .4, area: 6 },
  act(lt, t, S, st) {
    st.G = gaze;
    const { zoubida: zo, mohammed: mo, fatma: ft, man1: m1, woman1: w1, kid2: k2, kid3: k3 } = st.A;
    for (const [a, h] of [[zo, 1.6], [mo, 1.1], [ft, 1.58], [m1, 1.72], [w1, 1.6], [k2, 1.3], [k3, 1.28]]) scale(a, h);
    const kz = k(zo), k1 = k(m1);
    // Different action from mu: quick strides and low swinging hands, with no chest/veil reaches.
    const hurry = sm(B(1)[0] - .2, B(1)[0] + .15, t) * (1 - sm(B(1)[0] + 3.1, B(1)[0] + 3.7, t));
    for (const [a, ph] of [[zo, 0], [mo, .8], [ft, 1.7]]) {
      a.B.neck.rotation.set(0, 0, 0); a.B.head.rotation.set(0, 0, 0);
      a.B.spine.rotation.x += .10 * hurry;
      sync(a);
      if (hurry > 0) for (const s of ['L', 'R']) {
        const sw = Math.sin((t - B(1)[0]) * 11 + ph + (s === 'L' ? 0 : Math.PI));
        PO.reach(a, s, hanging(a, s, .16 * sw * hurry), { grip: .01, pole: [s === 'L' ? .32 : -.32, -.1, -.25] });
      }
    }
    for (const a of [k2, k3]) a.group.visible = t > B(2)[0] - .2 && t < B(2)[1] + .4;
    for (const a of [m1, w1]) a.group.visible = t < B(3)[0];
    ft.group.visible = t < B(3)[0];   // neither CU admits a sliced-off neighbour at its edge
    mo.group.visible = t < B(4)[0];   // the mother's reaction has the boy just off screen below her eyeline
    // The strolling boys retain their leg cycle; wrist IK adds a relaxed, plainly visible arm swing.
    for (const [a, ph] of [[k2, 0], [k3, 1.4]]) if (a.group.visible) {
      for (const s of ['L', 'R']) PO.reach(a, s, hanging(a, s, .15 * Math.sin((t - B(2)[0]) * 5.6 + ph + (s === 'L' ? 0 : Math.PI))), { grip: .005, pole: [s === 'L' ? .32 : -.32, -.1, -.25] });
    }
    // Seller alternates a low scoop/weighing movement with an offer toward the client.
    const scoop = .5 + .5 * Math.sin((t - B(2)[0]) * 1.7);
    m1.group.rotation.y = yawTo(m1.group.position, w1.group.position) + .12 * Math.sin(t * 1.7);
    m1.B.spine.rotation.x += .07 * (1 - scoop); m1.B.chest.rotation.y += .09 * Math.sin(t * 1.7);
    w1.B.chest.rotation.x += .045 * Math.sin(t * 1.7 + 1); sync(m1, w1);
    PO.reach(m1, 'R', front(m1, 'root', (.27 + .10 * scoop) * k1, (.12 - .08 * scoop) * k1, (.10 + .16 * scoop) * k1), { grip: .02, pole: [-.4, -.05, .18] });
    PO.reach(m1, 'L', front(m1, 'root', .29 * k1, -.17 * k1, (.12 + .035 * Math.sin(t * 1.7 + .7)) * k1), { grip: .015 });
    PO.fingers(m1, 'R', .5);
    PO.reach(w1, 'R', front(w1, 'root', .25 * k(w1), .12 * k(w1), .12 + .04 * scoop), { grip: .02 });

    // Stopped: both mother's hands remain inside the waist drape, as set by hang('haik').
    // No reach to her chest or mouth is active anywhere in fr.
    const cling = t >= B(3)[0] ? sm(B(3)[0], B(3)[0] + .65, t) : 0;
    if (cling > 0) {
      const zr = at(zo, 'root'), mr = at(mo, 'root'), d = mr.clone().sub(zr).setY(0).normalize();
      mo.B.spine.rotation.x += .035 * cling; sync(mo);
      const rest = hanging(mo, 'L'), hip = zr.clone().addScaledVector(d, .23 * kz);
      hip.y = rest.y + .05;   // own waist, just 5 cm above a hanging hand
      st.gripReach = reachRatio(mo, 'L', hip, .01);
      PO.reach(mo, 'L', rest.lerp(hip, cling), { grip: .01, pole: [.35, -.10, .16] });
      PO.fingers(mo, 'L', .72 * cling);
    }
    // b102: one slow dip and a lasting slump. Keep neck pitch below .1, including the capped gaze after act().
    const defeat = sm(B(4)[0], f(4, .75), t), dip = Math.sin(Math.PI * sm(B(4)[0], B(4)[1], t));
    zo.B.neck.rotation.x = .02 * defeat;
    zo.B.chest.rotation.x += .10 * defeat + .09 * dip; zo.B.spine.rotation.x += .055 * defeat;
    if (zo.B.LeftShoulder) zo.B.LeftShoulder.rotation.z -= .065 * defeat;
    if (zo.B.RightShoulder) zo.B.RightShoulder.rotation.z += .065 * defeat;
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
    b101: { shot: 'fr', size: 'CU', on: 'mohammed', pt: STOP.mohammed, z: 2.3, dx: 55, dy: -10 },   // boy head-to-hip, grip + mother's full head
    b102: { shot: 'fr', size: 'CU', on: 'zoubida', pt: STOP.zoubida, z: 3.6, dx: 0, dy: -10 },   // full hood, headroom, shoulders
  },
});
