import { checkedStage } from './s13_attente.js';
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
import { aim } from '../../../engine/ik.js';
import { bracelets } from './s17_retour.js';
import { apart, castScale, faceCam, jewel, sealHaik, stride } from '../lib/fix8c.js';
import { haikTuck, haikOut } from '../lib/fix8_G4.js';
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
// Local blocking: retain SOUK's exported marks for the following scenes. Two depth pairs, not a row across the lane.
const LEAD = { father: [900, 830], mohammed: [740, 850], zoubida: [850, 750], fatma: [1050, 710] };
const DELLAL = [1120, 830], EXIT = [950, 620];
const CROWD = [
  ['man1', [560, 800], [700, 700], 0],
  ['woman2', [1230, 780], [1100, 690], .25],
  ['woman1', [640, 700], [800, 650], .4],
  ['kid1', [700, 780], [820, 670], .1],
  ['kid2', [1250, 720], [1050, 650], .55],
  ['kid3', [760, 650], [930, 640], .7],
];
// The Head joint sits below the eyes: aim a little below the jewel to keep both chins bowed over the palms.
const jewelGaze = (t, st) => t < B(8)[0] ? st.jw?.position.clone().add(V(0, -.14, 0)) : null;

// Measure the arm so the raised wrist stays within reach and above the crown.
function overhead(a, t) {
  const sh = at(a, 'upperArmR'), len = sh.distanceTo(at(a, 'foreArmR')) + at(a, 'foreArmR').distanceTo(at(a, 'handR'));
  const dir = front(a, 'upperArmR', .4, .1, .9).sub(sh).normalize();
  return sh.addScaledVector(dir, len * (.78 + .01 * Math.sin(t * 2)));
}

const la = checkedStage('souk_bijoux', {
  father: { ...WALK([900, 740], LEAD.father, B(1)[0] + .1, B(1)[1] - .4), seed: 5, lookMax: .8,
    look: (t, st, S3) => t >= B(6)[0] && t < B(7)[0] ? st.br?.position : t >= B(8)[0] ? S3.cam.position : t > B(5)[0] ? 'marchand' : null },
  mohammed: { ...WALK([740, 750], LEAD.mohammed, B(1)[0] + .1, B(1)[1] - .4), seed: 3, lookMax: .6,
    look: (t, st) => t >= B(6)[0] ? (t < B(8)[0] && st.br?.visible ? st.br.position : 'father') : null },
  zoubida: { ...WALK([850, 700], LEAD.zoubida, B(1)[0] + .9, B(1)[1] + .4), costume: 'haik', seed: 7, lookMax: 1.35,
    look: (t, st) => t > B(7)[0] && t < f(7, .75) ? st.br?.position : t > B(5)[0] ? 'marchand' : null },
  fatma: { costume:'haik', ...WALK([1000, 690], LEAD.fatma, B(1)[0] + 1.1, B(1)[1] + .5), seed: 11, lookMax: 1.35,
    look: (t, st, S3) => t >= f(7, .48) && t < B(8)[0] ? (S3?.cam?.position || null) : t > f(7, .4) && t < f(7, .8) ? st?.br?.position : t > B(7)[0] ? 'zoubida' : t > B(5)[0] ? 'marchand' : null },
  marchand: { at: DELLAL, face: LEAD.father, seed: 13, talk: 0, lookMax: .8,
    look: (t, st) => t > f(8, .28) ? st.exitLook : t > B(7)[0] && t < B(8)[0] ? 'zoubida' : t > B(6)[0] ? st.br?.position : [905, 900, 2.6],
    mutter: t => Math.max(win(5, .05, .9, t) * (.75 + .25 * Math.sin(t * 9)), win(8, .3, .85, t) * .6) },
  // b077: two extras by the left stalls, turned toward each other and a little to the lens, heads bowed over the jewel
  man1: { at: [610, 800], face: [700, 830], seed: 21, lids: .55, look: jewelGaze, lookMax: .65, talk: 0 },
  woman2: { at: [725, 815], face: [660, 830], seed: 23, lids: .6, look: jewelGaze, lookMax: .65, talk: 0 },
  // Six walkers for the final crowd; no early path through the right stall.
  woman1: { at: [920, 640], face: [800, 740], seed: 25, talk: 0 },
  kid1: { at: [780, 730], face: [880, 650], seed: 26, talk: 0 },
  kid2: { at: [1030, 710], face: [950, 640], seed: 27, talk: 0 },
  kid3: { at: [850, 640], face: [1020, 740], seed: 29, talk: 0 },
}, {
  addressee: { marchand: 'father', father: 'marchand' },
  traffic:['man1','woman1','woman2','kid1','kid2','kid3'],
  act(lt, t, S, st, S3) {
    st.actcheck={exposed:{zoubida:['handL','handR','foreArmL','foreArmR'],fatma:['handL','handR','foreArmL','foreArmR']},
      contacts:[{actors:['father','marchand'],parts:['foreArmR:foreArmR','foreArmL:foreArmR','foreArmR:handR','handR:foreArmR','handR:handR','handR:handL','handR:foreArmL']}]};
    const { father: fa, mohammed: mo, zoubida: zo, fatma: ft, marchand: ma, man1: m1, woman2: w2 } = st.A;
    for (const a of Object.values(st.A)) { castScale(a); if (a.actMark?.costume === 'haik' || a.haikClosed) sealHaik(a); }
    // walking feet: strides on the same windows as the lane marks (small steps for the women)
    for (const [a, w0, w1, cps] of [[fa, B(1)[0] + .1, B(1)[1] - .4, 1.8], [mo, B(1)[0] + .1, B(1)[1] - .4, 2.4],
      [zo, B(1)[0] + .9, B(1)[1] + .4, 1.5], [ft, B(1)[0] + 1.1, B(1)[1] + .5, 1.5]]) {
      if (t > w0 && t < w1 && a.group.visible) stride(a, t, w0, cps, Math.min(1, Math.min(t - w0, w1 - t) * 3));
    }
    // b080: the men meet in the centre, the women stay behind the father. b081: make room for each fitting.
    const move = (a, p0, p1, t0, t1) => {
      if (t < t0) return;
      rest(a.B); walk(a, S3.floorAt(...p0), S3.floorAt(...p1), t0, t1, t, { cps: 1.8 });
    };
    move(fa, LEAD.father, [800, 790], B(7)[0] - 1.6, B(7)[0] - .5);
    move(ma, DELLAL, [1180, 720], B(7)[0] - .7, B(7)[0] + .8);
    move(zo, LEAD.zoubida, [900, 850], B(7)[0] - .7, B(7)[0] + .15);
    move(ft, LEAD.fatma, [1120, 900], f(7, .36), f(7, .49));
    move(fa, [800, 790], LEAD.father, B(8)[0] + .65, B(8)[0] + 1.5);
    move(ma, [1180, 720], DELLAL, B(8)[0] - .6, B(8)[0] + .3);
    if(t<B(8)[0]+.05)move(zo,[900,850],[1000,790],f(7,.94),B(8)[0]+.05);
    else move(zo,[1000,790],LEAD.zoubida,B(8)[0]+.05,B(8)[0]+.6);
    move(ft, [1120, 900], LEAD.fatma, B(8)[0], B(8)[0] + .6);
    const face = sm(B(5)[0] - .6, B(5)[0] + .6, t);
    turn(fa, ma.group.position, face);
    // Full body turn every frame: the original walk heading must never leave the boy looking into the left wall.
    turn(mo, t >= B(7)[0] && t < B(8)[0] ? zo.group.position.clone().lerp(ft.group.position, .5) : fa.group.position.clone().lerp(ma.group.position, .5), face);
    turn(zo, t >= B(7)[0] && t < B(8)[0] ? S3.floorAt(1000, 1000) : ma.group.position, face);
    turn(ft, t >= B(7)[0] && t < B(8)[0] ? S3.floorAt(900, 1000) : ma.group.position, face);
    if (t < B(7)[0]) { faceCam(zo, S3.cam, .8); faceCam(ft, S3.cam, .8); }
    ma.group.visible = t > B(5)[0] - .3;
    for (const a of [fa, mo, zo, ft]) a.group.visible = !(t > B(3)[0] - .1 && t < B(3)[1] + .2);
    if (t < f(8,.28)) turn(ma, fa.group.position, 1);
    st.exitLook ||= S3.floorAt(...EXIT).setY(1.7);
    if (t >= f(8, .28)) turn(ma, st.exitLook, sm(f(8, .28), f(8, .35), t));
    if (t > f(8, .35)) {
      rest(ma.B);const via=S3.floorAt(950,740);
      if(t<f(8,.5))walk(ma,S3.floorAt(...DELLAL),via,f(8,.35),f(8,.5),t,{cps:2.6,ease:false});
      else walk(ma,via,S3.floorAt(...EXIT),f(8,.5),f(8,.88),t,{cps:2.6,ease:false});
    }
    // Gaze is measured against the look string, so the body has to be turned toward that person after the walks.
    if (t >= B(8)[0]) turn(zo, ma.group.position, 1);
    if (t >= B(7)[0] && t < f(7, .48)) turn(ft, zo.group.position, 1);
    if (t >= f(7, .48) && t < B(8)[0]) faceCam(ft, S3.cam, 1.15);
    for (const [name, p0, p1, dt] of CROWD) {
      const a = st.A[name];
      a.group.visible = t >= B(8)[0] || ((name === 'man1' || name === 'woman2') && t >= B(3)[0] - .1 && t < B(3)[1] + .2);
      if (t >= B(8)[0]) { rest(a.B); walk(a, S3.floorAt(...p0), S3.floorAt(...p1), B(8)[0] + dt, B(8)[1] + dt, t, { cps: name.startsWith('kid') ? 2.3 : 1.7 }); }
    }

    // b077: one jewel, not a second pair of bracelets. The auction pair is st.br and is the only pair in a shot.
    st.jw ||= jewel(S3);
    st.jw.visible = m1.group.visible && t >= B(3)[0] - .1 && t < B(3)[1] + .2;
    if (t < B(8)[0] && m1.group.visible && w2.group.visible) {
      apart(m1, w2, .8);
      const mid2 = m1.group.position.clone().lerp(w2.group.position, .5);
      turn(m1, mid2, 1); turn(w2, mid2, 1); faceCam(m1, S3.cam, .85); faceCam(w2, S3.cam, .85);
    }
    const k1 = k(m1), rub = Math.sin(t * 2.6);
    if (t < B(8)[0]) {
      for (const [a, ph] of [[m1, 0], [w2, 2.1]]) {
        const sn = Math.max(0, Math.sin(t * 1.3 + ph)) ** 8;
        a.B.spine.rotation.x += .1; a.B.chest.rotation.x -= .045 * sn; a.B.neck.rotation.x += .2 + .04 * sn;
        a.B.upperArmL.position.y += .008 * sn; a.B.upperArmR.position.y += .008 * sn;
        a.B.spine.updateWorldMatrix(false, true);
      }
      for (const s of ['L', 'R']) {
        PO.reach(m1, s, front(m1, 'chest', .24 * k1, (s === 'L' ? -.05 : .05) * k1, (-.2 + .004 * rub) * k1), { grip: .015 });
        PO.palmTo(m1, s); PO.fingers(m1, s, .32, { thumb: .35 });
      }
      st.jw.position.copy(PO.handPts(m1, 'L').palm.lerp(PO.handPts(m1, 'R').palm, .5)).add(V(0, .018, 0));
      const k2 = k(w2);
      PO.reach(w2, 'R', front(w2, 'chest', .2 * k2, .04 * k2, -.18 * k2), { grip: .015 });
      PO.reach(w2, 'L', front(w2, 'chest', .22 * k2, -.07 * k2, -.2 * k2), { grip: .015 });
    }

    // b079: head back, arm above the crown; b080: lower the hand to meet the father's hand directly.
    const shout = win(5, 0, .95, t);
    ma.B.spine.rotation.x -= .12 * shout; ma.B.neck.rotation.x -= .38 * shout * (.85 + .15 * Math.sin(t * 6)); ma.B.chest.rotation.x -= .1 * shout;
    ma.B.spine.updateWorldMatrix(false, true);
    const give = sm(B(6)[0] - .3, B(6)[0] + .45, t);
    const mid = at(ma, 'chest').lerp(at(fa, 'chest'), .5).add(V(0, -.2, .08));
    if (ma.group.visible && t < f(6, .52)) PO.reach(ma, 'R', overhead(ma, t).lerp(mid, give), { grip: .01 });

    // ---- b080 the father: his right hand meets the dellal's, takes the pair, brings it back to his chest
    const kf = k(fa), take = sm(B(6)[0] + .1, B(6)[0] + .5, t) * (1 - sm(f(6, .42), f(6, .6), t));
    if (t >= B(6)[0] && t < B(7)[0]) {
      PO.reach(fa, 'R', front(fa, 'chest', .3 * kf, .04 * kf, -.25 * kf).lerp(mid, take), { grip: .01 });
      if (t > f(6, .5)) PO.reach(fa, 'L', PO.handPts(fa, 'R').palm.add(V(0, -.03, 0)), { grip: .01 });
      fa.B.neck.rotation.x += .5; fa.B.head.rotation.x += .2; fa.B.neck.updateWorldMatrix(false, true);
    }
    // The bracelets wait in his LEFT hand while his right gives an unmistakable two-finger signal.
    const sig = Math.max(win(7, .94, 1.08, t), win(8, 0, .29, t));
    if (sig > 0) {
      PO.reach(fa, 'R', front(fa, 'chest', .32 * kf, .3 * kf, .16 * kf), { grip: .01 });
      if (t >= B(8)[0] - .2) PO.reach(fa, 'L', front(fa, 'chest', .28 * kf, -.08 * kf, -.28 * kf), { grip: .01 });
      aim(fa.B.handR, PO.handPts(fa, 'R').end, at(fa, 'handR').add(V(0, .25, 0)));
      PO.fingers(fa, 'R', 1, { thumb: .8, each: [1, 0, 0, 1, 1], spread: .45 });
    }
    if (sig > 0) { fa.B.neck.rotation.x += .1 * Math.max(0, Math.sin((t - f(8, .1)) * 6)); fa.B.neck.updateWorldMatrix(false, true); }

    // ---- b081 trying them on: one hand presents the wrist, the other slides the pair over the fingers to the wrist, back off
    const tryOn = (a, w) => {
      if (w <= 0) return 0;
      const ka = k(a), p = ((t - B(7)[0]) * .95) % 1, sl = Math.sin(p * Math.PI);
      const wrist = front(a, 'chest', .36 * ka, -.17 * ka, -.12 * ka);
      PO.reach(a, 'L', front(a, 'root', .1 * ka, -.12 * ka, .1 * ka).lerp(wrist, w), { grip: .01 });
      const lw = at(a, 'handL'), fwd = lw.clone().sub(at(a, 'foreArmL')).normalize();
      PO.reach(a, 'R', PO.hipToWorld(a, -.26 * ka, .06 * ka, .03 * ka).lerp(lw.clone().addScaledVector(fwd, (.07 - .1 * sl) * ka).add(V(0, .025 * ka, 0)), Math.min(1, w * 2.5)), { grip: .01, pole: [-.7, .05, 0] });
      PO.fingers(a, 'L', .12, { spread: .25 }); PO.fingers(a, 'R', .35);
      return sl;
    };
    const zTry = win(7, 0, .47, t), fTry = win(7, .49, .92, t);
    const zSlide = tryOn(zo, zTry), fSlide = tryOn(ft, fTry);
    zo.B.head.rotation.z += .08 * zTry * Math.sin(t * 1.5);   // she turns the wrist in the light, head tilting

    // b082: return the pair, then raise it and turn upstage. Both hands meet before the departure.
    if (t >= f(7, .92) && t < f(8, .27)) {
      const back = sm(f(8, .12), f(8, .22), t);
      PO.reach(fa, 'L', front(fa, 'chest', .28 * kf, -.08 * kf, -.28 * kf).lerp(mid, back), { grip: .01 });
      if (t >= f(8, .12)) PO.reach(ma, 'R', mid, { grip: .01 });
    }
    if (t >= f(8, .27)) PO.reach(ma, 'R', mid.clone().lerp(overhead(ma, t), sm(f(8, .27), f(8, .35), t)), { grip: .01 });

    // The only bracelet pair. It follows one palm; the jewel above is hidden while this pair is out.
    st.br ||= bracelets(S3);
    const holder = t < B(5)[0] - .3 ? null : t < f(6, .32) ? [ma, 'R'] : t < B(7)[0] ? [fa, 'R'] : t < f(7, .48) ? [zo, 'L'] : t < f(7, .92) ? [ft, 'L'] : t < f(8, .25) ? [fa, 'L'] : [ma, 'R'];
    st.br.visible = !!holder && holder[0].group.visible;
    st.br.scale.setScalar(1.1);
    if (holder) {
      const [a, side] = holder, fitting = a === zo || a === ft;
      st.br.position.copy(PO.handPts(a, side).palm); st.br.rotation.set(0, 0, 0);
      for (const [i, ring] of st.br.children.entries()) {
        ring.rotation.set(0, fitting ? 0 : (i ? -.12 : .12), fitting ? 0 : (i ? -.15 : .15));
        ring.position.set(fitting ? 0 : (i ? .03 : -.03), fitting ? 0 : -.055, fitting ? (i ? -.014 : .014) : 0);
      }
      if (fitting) {
        const axis = at(a, 'handL').sub(at(a, 'foreArmL')).normalize(), sl = a === zo ? zSlide : fSlide;
        st.br.position.copy(at(a, 'handL')).addScaledVector(axis, (.08 - .13 * sl) * k(a));
        st.br.quaternion.setFromUnitVectors(V(0, 0, 1), axis);
      }
      st.br.updateMatrixWorld(true);
    }
    if (st.br?.visible) st.jw.visible = false;
    // Closed haik: elbows wide of the ribs. A try-on overwrites this for that woman only.
    if (zTry <= 0) haikTuck(zo);
    if (fTry <= 0) haikTuck(ft);
    if (t >= B(8)[0]) faceCam(fa, S3.cam, .9);
    // The gaze net runs after act and can turn him up the lane; correct the face once it has.
    if (st.G && !st.G._wrapped) {
      const inner = st.G;
      st.G = { _wrapped: true, apply(tt) { inner.apply(tt); if (tt >= B(5)[0] && tt < B(7)[0]) { faceCam(zo, S3.cam, .85); faceCam(ft, S3.cam, .85); } if (tt >= B(8)[0]) faceCam(fa, S3.cam, .85); if (tt >= f(7, .48) && tt < B(8)[0]) faceCam(ft, S3.cam, 1.05); if (tt < B(8)[0] && m1.group.visible) { faceCam(m1, S3.cam, .9); faceCam(w2, S3.cam, .9); } } };
    }
    for (const a of [fa, mo, zo, ft, ma, m1, w2]) a.B.chest.updateWorldMatrix(false, true);
  },
});

// b076 the reverse: the boy alone before the shop window, his body 3/4 to the lens, the head turned to the trays
const re = checkedStage('souk_bijoux_rev', {
  mohammed: { at: [1100, 900], face: [930, 800], seed: 3, lids: .5, look: [930, 800, .7], lookMax: .25, talk: 0 },
}, {
  act(lt, t, S, st, S3) {
    const mo = st.A.mohammed, u = Math.max(0, t - B(2)[0]);
    castScale(mo);
    const closer = S3.floorAt(1100, 980);
    if (closer) mo.group.position.set(closer.x, mo.group.position.y, closer.z);
    const cam = S3.cam.position, yCam = Math.atan2(cam.x - mo.group.position.x, cam.z - mo.group.position.z);
    const yC = Math.atan2(S3.floorAt(930, 800).x - mo.group.position.x, S3.floorAt(930, 800).z - mo.group.position.z), dd = Math.atan2(Math.sin(yC - yCam), Math.cos(yC - yCam));
    mo.group.rotation.y = yCam + dd * .2;
    mo.group.updateMatrixWorld(true);
    mo.B.neck.rotation.x += .28; mo.B.head.rotation.x += .08; mo.B.spine.rotation.x -= .05;
    mo.B.head.rotation.y += .14 * Math.sin(u * 1.6); mo.B.spine.updateWorldMatrix(false, true);
  },
});

export default beatScene(ID, {
  shots: { la, re },
  plan: {
    b075: { shot: 'la', size: 'W', on: 'father' },
    b076: { shot: 're', size: 'M', on: 'mohammed', z: 1.35, dy: 110, insAt: .5 },
    b077: { shot: 'la', size: 'M', on: 'man1', z: 2.2, dx: 35, dy: 25 },
    b079: { shot: 'la', size: 'M', on: 'marchand', z: 1.25, dx: -40, dy: -110 },   // raised hand and the one pair, family still in the lane
    b080: { shot: 'la', size: 'M', on: 'father', pt: LEAD.father, z: 1.5, dx: 110, dy: 20, insAt: .72 },
    b081: { shot: 'la', size: 'M', on: 'zoubida', pt: [900, 850], z: 1.65, dx: 0, dy: 30,
      cover: [{ f: .48, size: 'M', on: 'fatma', pt: [1120, 900], z: 1.85, dx: 0, dy: 40 }] },
  b082: { shot: 'la', size: 'M', on: 'father', pt: LEAD.father, z: 1.6, dx: 100, dy: 0,
    cover: [{ f: .3, size: 'W', on: 'father' }], insAt: .6 },
  },
});
