// s12 "Le souk des bijoux". souk_bijoux: a covered lane receding to a gate (vanishing point ≈ [880,517]); the floor runs
// x≈540–1180 at y700, x≈300–1360 at y900. b074 painting p18. b075 the family walks toward the lens up the lane: father
// and son in front, Zoubida (white haik) and Fatma two steps behind with small steps. b076 souk_bijoux_rev: Mohammed
// alone before a glittering counter, unimpressed: chin tucked, a small slow head shake, lids half down (insert: tin-like
// jewels). b077 a man and a woman by the left stalls hold back tears, heads bowed over a family jewel in his two hands,
// small sniffs lifting the shoulders. b078 painting p20. b079 the dellal (big, loud) shouts a figure, head thrown back,
// mouth wide, the pair of bracelets dangling high from his right hand. b080 the father takes them from his hand (hand to
// hand, chest height) and looks down at them. b081 Zoubida tries them on her wrist again and again (enum "quatre",
// "cinq"), then Fatma does the same. b082 the father lifts two fingers (his signal); the dellal turns and plunges back up
// the lane into the crowd, the hand with the bracelets held up above his head (insert: the hand over the heads).
import * as PO from '../../../engine/poses.js';
import * as PR from '../../../engine/props3d.js';
import { staged, THREE } from '../lib/autostage.js';
import { bracelets } from './s17_retour.js';
import { walk } from '../lib/acts.js';
import { rest } from '../../../engine/rig3d.js';
import { beatScene, lines, sm, front, at, V, yawTo } from '../lib/beatscene.js';

const ID = 's12_souk', L = lines(ID), B = i => L[i] || [0, 0];
const k = a => a.group.scale.y / 1.6;
const f = (i, x) => B(i)[0] + x * (B(i)[1] - B(i)[0]);
const win = (i, a, b, t) => sm(f(i, a) - .3, f(i, a) + .3, t) * (1 - sm(f(i, b), f(i, b) + .5, t));
const wrap = d => Math.atan2(Math.sin(d), Math.cos(d));
/** after a walk the body keeps the walk heading; w → 1 turns it on the spot toward a point */
function turn(a, to, w) {
  if (w <= 0) return; const y0 = a.group.rotation.y, y1 = yawTo(a.group.position, to);
  a.group.rotation.y = y0 + wrap(y1 - y0) * w; a.group.updateMatrixWorld(true);
}

// the lane blocking shared by s13/s14 (where the family ends up after the walk)
export const SOUK = {
  father: [800, 790], mohammed: [650, 830], zoubida: [1030, 800], fatma: [1135, 772], marchand: [1290, 880],   // Argon r7: the dellal on the near right, so the family turns 3/4 to us
  man1: [600, 690], woman2: [668, 676],
};
const WALK = (from, to, t0, t1) => ({ at: from, walk: { to, t0, t1 } });

const la = staged('souk_bijoux', {
  father: { ...WALK([870, 690], SOUK.father, B(1)[0] + .1, B(1)[1] - .4), seed: 5, lookMax: .8,
    look: (t, st) => t > f(6, .2) && t < f(6, .95) ? st.br?.position : t > B(5)[0] ? 'marchand' : null },
  mohammed: { ...WALK([790, 700], SOUK.mohammed, B(1)[0] + .1, B(1)[1] - .4), seed: 3, lookMax: .7,
    look: (t, st) => t > B(5)[0] && st.br?.visible ? st.br.position : null },
  zoubida: { ...WALK([930, 680], SOUK.zoubida, B(1)[0] + .9, B(1)[1] + .4), costume: 'haik', seed: 7, lookMax: .7,
    look: (t, st) => t > B(7)[0] && t < f(7, .75) ? st.br?.position : t > B(5)[0] ? 'marchand' : null },
  fatma: { ...WALK([1000, 670], SOUK.fatma, B(1)[0] + 1.1, B(1)[1] + .5), seed: 11, lookMax: .7,
    look: (t, st) => t > f(7, .4) && t < f(7, .8) ? st.br?.position : t > B(7)[0] ? 'zoubida' : t > B(5)[0] ? 'marchand' : null },
  marchand: { at: SOUK.marchand, face: SOUK.father, seed: 13, talk: 0, lookMax: .8,
    look: t => t > f(8, .3) ? null : t > B(7)[0] ? 'zoubida' : t > B(6)[0] ? 'father' : [905, 900, 2.6],   // b079: up to the sky
    mutter: t => Math.max(win(5, .05, .9, t) * (.75 + .25 * Math.sin(t * 9)), win(8, .3, .85, t) * .6) },
  // b077: two extras by the left stalls, turned toward each other and a little to the lens, heads bowed over the jewel
  man1: { at: SOUK.man1, face: [700, 760], seed: 21, lids: .45, look: (t, st) => st.jw?.position, lookMax: .7, talk: 0 },
  woman2: { at: SOUK.woman2, face: [600, 760], seed: 23, lids: .5, look: (t, st) => st.jw?.position, lookMax: .6, talk: 0 },
  // background life: a woman crossing deep in the lane during the corner beat
  woman1: { ...WALK([1150, 600], [640, 622], B(2)[0], B(4)[0]), seed: 25, talk: 0 },
}, {
  addressee: { marchand: 'father', father: 'marchand' },
  act(lt, t, S, st, S3) {
    const { father: fa, mohammed: mo, zoubida: zo, fatma: ft, marchand: ma, man1: m1, woman2: w2 } = st.A;
    // after the walk: everyone turns toward the dellal when he appears (b079), Zoubida/Fatma toward each other in b081
    const face = sm(B(5)[0] - .6, B(5)[0] + .6, t);
    turn(fa, ma.group.position, face); turn(mo, ma.group.position, .75 * face);
    turn(zo, ma.group.position, .8 * face); turn(ft, ma.group.position, .8 * face);
    ma.group.visible = t > B(5)[0] - .3;
    for (const a of [fa, mo, zo, ft]) a.group.visible = !(t > B(3)[0] - .1 && t < B(3)[1] + .2);   // b077: the couple alone in frame
    // b082 he plunges back up the lane into the crowd, the bracelets held up over his head
    if (t > f(8, .3)) { rest(ma.B); walk(ma, S3.floorAt(...SOUK.marchand), S3.floorAt(950, 575), f(8, .3), B(8)[1] + 1.2, t, { cps: 2.4 }); }

    // ---- the jewel of the grieving couple (always there: they stay in their corner all scene)
    st.jw ||= S3.prop(PR.cabochon({ col: 0xe0b040 }), 0, 0, 0);
    st.jw.scale.setScalar(3.2);
    const k1 = k(m1), rub = Math.sin(t * 2.6);
    for (const s of ['L', 'R']) PO.reach(m1, s, front(m1, 'root', .27 * k1, (s === 'L' ? -.035 : .035) * k1, (.22 + .006 * rub * (s === 'L' ? 1 : -1)) * k1), { grip: .3 });
    st.jw.position.copy(at(m1, 'handL').lerp(at(m1, 'handR'), .5)).add(V(0, .015, 0));
    const k2 = k(w2);   // she holds her own wrist against her chest; a sniff every few seconds lifts the shoulders
    PO.reach(w2, 'R', front(w2, 'chest', .26 * k2, .04 * k2, -.04 * k2), { grip: .2 });
    for (const [a, ph] of [[m1, 0], [w2, 2.1]]) {
      const sn = Math.max(0, Math.sin(t * 1.3 + ph)) ** 8;
      a.B.spine.rotation.x += .14; a.B.chest.rotation.x -= .06 * sn; a.B.neck.rotation.x += .22 + .05 * sn; a.B.spine.updateWorldMatrix(false, true);
    }

    // ---- b079 the dellal shouts: head thrown back, chest out, right hand up with the pair (shoulder height, no overhead)
    const km = k(ma), shout = win(5, 0, .95, t);
    ma.B.spine.rotation.x -= .12 * shout; ma.B.neck.rotation.x -= .38 * shout * (.85 + .15 * Math.sin(t * 6)); ma.B.chest.rotation.x -= .1 * shout;
    ma.B.spine.updateWorldMatrix(false, true);
    const give = sm(f(6, .12), f(6, .4), t) * (1 - sm(f(6, .45), f(6, .7), t));   // b080 the hand comes down and out to the father
    const mid = at(ma, 'chest').lerp(at(fa, 'chest'), .5).add(V(0, -.12, 0));
    const up = front(ma, 'chest', .26 * km, .18 * km, (.42 + .04 * Math.sin(t * 7)) * km);   // high: the pair dangling above the heads
    const dive = sm(f(8, .3), f(8, .45), t);   // b082 back up the lane, the hand high
    if (ma.group.visible) PO.reach(ma, 'R', up.clone().lerp(mid, give).lerp(front(ma, 'chest', .12 * km, .16 * km, .58 * km), dive), { grip: .35 });

    // ---- b080 the father: his right hand meets the dellal's, takes the pair, brings it back to his chest
    const kf = k(fa), take = sm(f(6, .15), f(6, .42), t) * (1 - sm(f(6, .62), f(6, .85), t));
    const keep = sm(f(6, .62), f(6, .85), t) * (1 - sm(B(7)[0] - .4, B(7)[0] + .2, t));
    if (take > 0 || keep > 0) PO.reach(fa, 'R', front(fa, 'root', .26 * kf, .05 * kf, .24 * kf).lerp(mid, take).lerp(front(fa, 'chest', .3 * kf, .02 * kf, -.1 * kf), keep), { grip: .3 });
    // b082 his signal: two fingers lifted, chest height, a short beat
    const sig = win(8, .05, .28, t);
    if (sig > 0) { PO.reach(fa, 'R', front(fa, 'chest', .3 * kf, .16 * kf, (.02 + .03 * sig) * kf), { grip: .05 }); PO.fingers(fa, 'R', .6 * sig, { thumb: .5, spread: .1 }); }
    if (sig > 0) { fa.B.neck.rotation.x += .1 * Math.max(0, Math.sin((t - f(8, .1)) * 6)); fa.B.neck.updateWorldMatrix(false, true); }

    // ---- b081 trying them on: one hand presents the wrist, the other slides the pair over the fingers to the wrist, back off
    const tryOn = (a, w) => {
      if (w <= 0) return; const ka = k(a), p = ((t * .75) % 1), sl = Math.sin(p * Math.PI);   // one try ≈ 1.3 s
      const wrist = front(a, 'chest', .3 * ka, -.04 * ka, -.14 * ka);
      PO.reach(a, 'L', front(a, 'root', .24 * ka, -.1 * ka, .25 * ka).lerp(wrist, w), { grip: .1 });
      const lw = at(a, 'handL'), fwd = lw.clone().sub(at(a, 'foreArmL')).normalize();
      PO.reach(a, 'R', lw.clone().addScaledVector(fwd, (.1 - .16 * sl) * ka).add(V(0, .03 * ka, 0)), { grip: .25 });
    };
    const zTry = win(7, 0, .42, t), fTry = win(7, .44, .8, t);
    tryOn(zo, zTry); tryOn(ft, fTry);
    zo.B.head.rotation.z += .08 * zTry * Math.sin(t * 1.5);   // she turns the wrist in the light, head tilting

    // ---- b076 the boy and the rest of the scene: hands loose; the pair goes from hand to hand
    st.br ||= bracelets(S3);
    const holder = t < B(5)[0] - .3 ? null : t < f(6, .42) ? [ma, 'R'] : t < B(7)[0] ? [fa, 'R'] : t < f(7, .43) ? [zo, 'R'] : t < f(7, .8) ? [ft, 'R'] : t < f(8, .3) ? [fa, 'R'] : [ma, 'R'];
    st.br.visible = !!holder && holder[0].group.visible;
    if (holder) { const h = holder[0].B['hand' + holder[1]]; h.updateWorldMatrix(true, false); st.br.position.copy(at(holder[0], 'hand' + holder[1])).add(V(0, -.035, 0)); st.br.rotation.set(holder[0] === ma ? Math.PI / 2 : 0, holder[0].group.rotation.y, 0); }
    for (const a of [fa, mo, zo, ft, ma, m1, w2]) a.B.chest.updateWorldMatrix(false, true);
  },
});

// b076 the reverse: the boy alone before the shop window, his body 3/4 to the lens, the head turned to the trays
const re = staged('souk_bijoux_rev', {
  mohammed: { at: [1100, 900], face: [700, 1000], seed: 3, lids: .5, look: [930, 800, .95], lookMax: .9, talk: 0 },
}, {
  act(lt, t, S, st) {
    const mo = st.A.mohammed, u = Math.max(0, t - B(2)[0]), no = win(2, .45, 1, t);
    mo.B.neck.rotation.x += .22; mo.B.spine.rotation.x -= .05;   // chin tucked, leaning back from the glitter
    mo.B.head.rotation.y += .14 * no * Math.sin(u * 3.2); mo.B.spine.updateWorldMatrix(false, true);
  },
});

export default beatScene(ID, {
  shots: { la, re },
  plan: {
    b075: { shot: 'la', size: 'W', on: 'zoubida' },
    b076: { shot: 're', size: 'M', on: 'mohammed', z: 1.9, insAt: .5 },
    b077: { shot: 'la', size: 'M', on: 'man1', z: 2.2 },
    b079: { shot: 'la', size: 'M', on: 'marchand', zTo: 2.4, push: 5 },
    b080: { shot: 'la', size: 'M', on: 'father', insAt: .72 },
    b081: { shot: 'la', size: 'M', on: 'zoubida' },
    b082: { shot: 'la', size: 'W', on: 'father', insAt: .6 },
  },
});
