// s15 "Le souk des fruits secs". b098 souk_mur, by the bench: the three burst out crying: Zoubida's hand pressed to her
// veil over the mouth, shoulders shaking; Fatma's head bowed, a hand on her chest; the boy wails, chin up, mouth wide,
// eyes screwed shut, arms hanging. b099 W: they come hurrying down the passage from the far gate toward the dried-fruit
// counter, looking left and right (insert: pyramids of dates, figs, almonds). b100 W: life goes on: a seller by the
// counter weighing, turned to a client; two urchins stroll past singing, swinging their arms. b101 CU high on the boy,
// very small, his hand gripping his mother's haik at her hip, his head turning, searching. b102 CU on Zoubida: she
// gives up: a slow defeated nod, eyes down, the shoulders dropping.
import * as PO from '../../../engine/poses.js';
import { staged } from '../lib/autostage.js';
import { MUR } from './s13_attente.js';
import { beatScene, lines, sm, front, at, V } from '../lib/beatscene.js';

const ID = 's15_fruits_secs', L = lines(ID), B = i => L[i] || [0, 0];
const k = a => a.group.scale.y / 1.6;
const f = (i, x) => B(i)[0] + x * (B(i)[1] - B(i)[0]);
const win = (i, a, b, t) => sm(f(i, a) - .3, f(i, a) + .3, t) * (1 - sm(f(i, b), f(i, b) + .5, t));
const sob = (t, ph) => Math.max(0, Math.sin(t * 6.5 + ph)) ** 2 * (.6 + .4 * Math.sin(t * 1.3 + ph));

const mu = staged('souk_mur', {
  zoubida: { at: MUR.zoubida, face: [800, 1000], costume: 'haik', seed: 7, lids: .6, lookMax: .6, look: [700, 960, .3] },
  mohammed: { at: MUR.mohammed, face: [900, 1000], seed: 3, talk: 0, lids: .95, lookMax: .7, look: [900, 900, 3], mutter: t => .7 + .3 * Math.sin(t * 2.2) },
  fatma: { at: MUR.fatma, face: [900, 980], seed: 11, lids: .55, look: [880, 980, .2], lookMax: .6 },
}, {
  act(lt, t, S, st) {
    const { zoubida: zo, mohammed: mo, fatma: ft } = st.A, kz = k(zo), kt = k(ft);
    for (const [a, ph, b] of [[zo, 0, .12], [ft, 1.9, .16], [mo, .8, -.05]]) {
      const s = sob(t, ph);
      a.B.spine.rotation.x += b; a.B.chest.rotation.x += .07 * s; a.B.neck.rotation.x += .05 * s; a.B.chest.rotation.z += .02 * Math.sin(t * 6.5 + ph);
      a.B.spine.updateWorldMatrix(false, true);
    }
    // her right hand pressed to the veil at the mouth (target well out in front of the face: default pole), his arms hang
    PO.reach(zo, 'R', front(zo, 'head', .2 * kz, .02 * kz, -.1 * kz), { grip: .2 });
    PO.reach(ft, 'L', front(ft, 'chest', .27 * kt, -.02 * kt, -.03 * kt), { grip: .15 });
    for (const a of [zo, ft, mo]) a.B.chest.updateWorldMatrix(false, true);
  },
});

const fr = staged('souk_mur', {
  zoubida: { at: [880, 575], costume: 'haik', seed: 7, walk: { to: [935, 790], t0: B(1)[0] - .2, t1: B(1)[0] + 4.2 }, lookMax: .85,
    look: t => t < B(2)[0] ? [880 + 420 * Math.sin(t * .9), 640, 1.4] : t > B(4)[0] ? [935, 1000, 0] : null, lids: t => .5 * win(4, .3, 1.2, t) },
  mohammed: { at: [845, 585], seed: 3, talk: 0, walk: { to: [815, 805], t0: B(1)[0] - .2, t1: B(1)[0] + 4.2 }, lookMax: .6,
    look: t => t > B(3)[0] ? [815 + 650 * Math.sin((t - B(3)[0]) * .9), 860, 1.3] : t > B(2)[0] ? [500, 760, 1.2] : null },
  fatma: { at: [925, 565], seed: 11, walk: { to: [1050, 760], t0: B(1)[0] + .1, t1: B(1)[0] + 4.5 }, lookMax: .8,
    look: t => t < B(2)[0] ? [880 - 420 * Math.sin(t * .8), 640, 1.4] : 'zoubida' },
  // life goes on (b100): a seller by the counter, turned to a client; two urchins stroll by singing
  man1: { at: [1280, 760], face: [1100, 900], seed: 21, talk: 0, look: 'woman1' },
  woman1: { at: [1180, 870], face: [1280, 760], seed: 25, talk: 0, look: 'man1' },
  kid2: { at: [560, 600], seed: 27, talk: 0, walk: { to: [470, 930], t0: B(2)[0], t1: B(2)[1] }, mutter: t => win(2, 0, 1, t) * (.4 + .3 * Math.sin(t * 5)) },
  kid3: { at: [640, 590], seed: 29, talk: 0, walk: { to: [580, 940], t0: B(2)[0] + .5, t1: B(2)[1] + .5 }, mutter: t => win(2, 0, 1, t) * (.4 + .3 * Math.sin(t * 5 + 1)) },
}, {
  addressee: { zoubida: 'fatma' },
  act(lt, t, S, st) {
    const { zoubida: zo, mohammed: mo, fatma: ft, man1: m1, kid2: k2, kid3: k3 } = st.A, km = k(mo), kz = k(zo), k1 = k(m1);
    for (const a of [k2, k3]) a.group.visible = t > B(2)[0] - .2 && t < B(2)[1] + .4;
    for (const a of [m1, st.A.woman1]) a.group.visible = t < B(3)[0];   // the CUs (b101–b102) stay clear of the seller and client
    // the seller lifts a scoop of dates toward the client, a gentle bobbing (he talks prices)
    PO.reach(m1, 'R', front(m1, 'chest', .3 * k1, .08 * k1, (-.06 + .025 * Math.sin(t * 2.4)) * k1), { grip: .4 });
    // b101 the boy grips his mother's haik at her hip (once they have stopped); he shrinks a little against her
    const cling = sm(B(3)[0] - .8, B(3)[0], t);
    if (cling > 0) {
      const hip = at(zo, 'root').add(V(0, .05 * kz, 0)).lerp(at(mo, 'root'), .25);
      PO.reach(mo, 'L', front(mo, 'root', .2 * km, -.12 * km, .1 * km).lerp(hip, cling), { grip: .8 });
      mo.B.spine.rotation.x += .06 * cling; mo.B.spine.updateWorldMatrix(false, true);
    }
    // b102 the defeated nod: two slow dips, eyes down, the shoulders drop
    const no = win(4, .2, 1, t), u = Math.max(0, t - f(4, .2));
    zo.B.neck.rotation.x += no * (.1 + .12 * Math.max(0, Math.sin(u * 2.2))); zo.B.chest.rotation.x += .07 * no; zo.B.spine.updateWorldMatrix(false, true);
    for (const a of [zo, mo, m1]) a.B.chest.updateWorldMatrix(false, true);
  },
});

export default beatScene(ID, {
  shots: { mu, fr },
  plan: {
    b098: { shot: 'mu', size: 'M', on: 'zoubida' },
    b099: { shot: 'fr', size: 'W', on: 'zoubida', insAt: .62 },
    b100: { shot: 'fr', size: 'W', on: 'kid2' },
    b101: { shot: 'fr', size: 'CU', on: 'mohammed', z: 2.3, pt: [815, 805] },
    b102: { shot: 'fr', size: 'CU', on: 'zoubida', z: 2.6, pt: [935, 790] },
  },
});
