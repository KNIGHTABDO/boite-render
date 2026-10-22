// s04: the whitewash. P2a cobweb chaos on reeds (line 0), P2b lime-wash splashing (line 1); then 3D in the bare wet Msid:
// the fqih roars from his estrade (2); Mohammed dips a broom in the lime bucket and runs at the wall (3); a rampart of
// arms grabs his broom (4); tug of war, he lets go and lands sitting in a puddle (5); he gets up and throws himself back
// in (6); "Silence !" (7); all frozen, arms out, fingers spread, explaining (8); a boy points at him (9); another clutches
// the broom (10); the verdict, rod to the corner (11); the small ones wait in the corner while the big ones whitewash (12).
// Plate msid_menage (cal h 1.0, horizon 464: checked on the 0.35 m estrade). s01_hook replays lines 3-4 of this shot.
// Contacts (st.M): broom grip in the palm, kids' hands on the broom (grab), broom tip on the wall, bucket dip, seated fall.
import * as K from '../../../engine/core.js';
import * as PO from '../../../engine/poses.js';
import * as IK from '../../../engine/ik.js';
import { rest, idlePose } from '../../../engine/rig3d.js';
import { travel } from '../../../engine/clips.js';
import { make, ac, st } from './_pt.js';
import { shot, all, breathe, V, role, blend } from './_3d.js';
import { balayette, rod, inHand } from './_props.js';
const { clamp, ease } = K;
const sm = (a, b, x) => ease((x - a) / (b - a));
const yawTo = (from, to) => Math.atan2(to.x - from.x, to.z - from.z);
const dirW = (a, x, y, z) => V(x, y, z).normalize().applyAxisAngle(V(0, 1, 0), a.group.rotation.y);

// line starts (scene seconds) straight from timing.json, so s01_hook can replay this shot with its own helper object
const SC = (await (await fetch(new URL('../timing.json', import.meta.url))).json()).find(s => s.id === 's04_badigeon');
export const L = SC.lines.map(l => [l.start - SC.start, l.start - SC.start + l.dur]);
const DIP = L[3][0] + 2, RUN = L[3][0] + 6, GRAB = L[4][0] + 1.5, DROP = L[5][0] + 9, UP = L[6][0] + 2.5, BACK = UP + 1.2;
const LOW_R = [-.1, -.25, -.05], LOW_L = [.1, -.25, -.05];   // elbow tucked down by the ribs: no sleeve web
const FREEZE = L[7][0], ARMS = L[8][0] + 1, CORNER = L[12][0];

const sh = shot({
  plate: 'msid_menage',
  light: { key: 0xffe8c8, keyI: 1.7, dir: [2.5, 3, .8], sky: 0xd8d4c8, ground: 0x8a6a48, fillI: 1.5, rim: 0xffe0a0, rimI: .6, rimDir: [-2, 2, -3], shadow: .3 },
  async build(S3) {
    const M = {}, F = (x, y, h = 0) => S3.floorAt(x, y, h);
    // the left wall's floor line (plate px), its inward normal, and spots along it
    const w0 = F(14, 873), w1 = F(573, 701), wd = w1.clone().sub(w0).normalize(), wn = V(wd.z, 0, -wd.x);
    if (wn.dot(S3.cam.position.clone().setY(0).sub(w0)) < 0) wn.negate();
    const at = (s, n) => w0.clone().lerp(w1, s).addScaledVector(wn, n);
    const bucket = F(336, 802).addScaledVector(wn, .1), dipAt = bucket.clone().addScaledVector(wn, .5).addScaledVector(wd, .25);
    const kids = await Promise.all(['kid1', 'kid2', 'kid3'].map(n => role(n))), [k1, k2, k3] = kids;
    const g1 = await role('grand1'), g2 = await role('grand2'), mo = await role('mohammed'), mos = await role('mohammed', { seat: true, copy: 's' }), fq = await role('fqih');
    const spots = [at(.6, .5), at(.72, .5), at(.84, .55)], scrum = at(.72, 1.15), sitAt = scrum.clone().addScaledVector(wn, .4);
    kids.forEach((a, i) => S3.add(a, spots[i].x, spots[i].z, yawTo(spots[i], at(.6 + .12 * i, 0))));
    [g1, g2].forEach((a, i) => { const p = at(.62 + .16 * i, .55); S3.add(a, p.x, p.z, yawTo(p, at(.62 + .16 * i, 0))); });
    const fqAt = F(1046, 613, .35); S3.add(fq, fqAt.x, fqAt.z, yawTo(fqAt, S3.cam.position.clone().setY(0)) * .7 + yawTo(fqAt, scrum) * .3);
    fq.group.position.y = .35;
    // the corner the small ones are sent to (right of the estrade, by the stacked slates)
    const corner = [F(1250, 800), F(1380, 790), F(1310, 870), F(1170, 860)];
    // Mohammed: build pose at the scrum (coverage frames him there); the fall's seated pose solved once
    S3.add(mo, scrum.x, scrum.z, yawTo(scrum, spots[1]));
    S3.add(mos, scrum.x, scrum.z, yawTo(scrum, spots[1]));   // the seat-rig copy (closed robe skirt) takes over for the fall
    const stand = PO.snap(mos);
    M.sit = +(+PO.crossLegged(mos, { seat: 0, lean: -.12, hands: false }) || 0).toFixed(3);
    const sit = PO.snap(mos); PO.apply(mos, stand);
    const brooms = [0, 1, 2, 3, 4].map(i => S3.prop(balayette({ wet: 1 })));   // 0 Mohammed's, 1-2 kid1/kid3's, 3-4 the big ones'
    const rd = S3.prop(rod());
    return { actors: [k1, k2, k3, g1, g2, mo, mos, fq], M, kids, k1, k2, k3, g1, g2, mo, mos, fq, spots, scrum, sitAt, bucket, dipAt, wd, wn, at, corner, stand, sit, brooms, rd,
      faces: [[fq, 'fqih', 1, (lt, t) => ({ sad: t > FREEZE - .2 ? .2 : 0 })], [k1, 'kid1', 2], [k2, 'kid2', 3], [k3, null, 4], [mo, null, 5, (lt, t) => ({ sad: t > DROP && t < BACK ? .5 : 0 })], [mos, null, 5, { sad: .5 }], [g1, null, 6], [g2, null, 7]] };
  },
  cover: [{ t: L[2][0], size: 'M', on: 'fqih' }, { t: L[3][0], size: 'W' }, { t: RUN + 2.5, size: 'M', on: 'kid2', dx: 60, dy: -110 },
    { t: L[4][0], size: 'CU', on: 'kid2', dx: 40 }, { t: L[4][0] + 7, size: 'CU', on: 'kid1' }, { t: L[5][0], size: 'M', on: 'mohammed', dy: -110 },
    { t: L[6][0], size: 'W' }, { t: L[7][0], size: 'CU', on: 'fqih' }, { t: L[8][0], size: 'W' }, { t: L[8][0] + 6, size: 'M', on: 'kid3', dx: 120, dy: -190 },
    { t: L[9][0], size: 'M', on: 'kid1' }, { t: L[10][0], size: 'M', on: 'kid2' }, { t: L[11][0], size: 'M', on: 'fqih' }, { t: L[11][0] + 6, size: 'W' }, { t: CORNER, size: 'W' }],
  frame(lt, u, t, S, st) {
    const { M, kids, k1, k2, k3, g1, g2, mo, mos, fq, spots, scrum, brooms: [b0, b1, b3, bg1, bg2], wn, wd } = st;
    const corner = t >= CORNER, frozen = t >= FREEZE, palm = (a, s) => PO.handPts(a, s).palm;
    const wallHand = (a, s, ph, br) => {   // whitewash stroke: hand 42 cm off the wall, broom tip sweeping on it
      const base = IK.wpos(a.B.chest), wallP = base.clone().addScaledVector(wn, -base.clone().sub(st.at(0, 0)).dot(wn));
      const tip = wallP.clone().add(V(0, .05 + .25 * Math.sin(ph), 0)).addScaledVector(wd, .1 * Math.cos(ph * .5));
      const hand = tip.clone().addScaledVector(wn, .42).add(V(0, -.18, 0));
      PO.reach(a, s, hand, { grip: .02 }); inHand(br, palm(a, s), tip.clone().sub(palm(a, s)));
      return +br.localToWorld(br.userData.tip.clone()).sub(wallP).dot(wn).toFixed(3);
    };
    const floorBroom = (br, a, side) => { const p = a.group.position.clone().addScaledVector(dirW(a, side, 0, .4), .25).setY(.02); inHand(br, p, dirW(a, 1, 0, .3)); };
    // ---- the big ones: only in the corner beat, whitewashing where the small ones were
    for (const [i, g, br] of [[0, g1, bg1], [1, g2, bg2]]) {
      g.group.visible = br.visible = corner;
      if (corner) { rest(g.B); idlePose(g.B, t, 1); M['g' + i] = wallHand(g, 'R', t * 3.1 + i * 2, br); }
    }
    // ---- the small ones
    kids.forEach((a, i) => {
      rest(a.B); idlePose(a.B, t + i, 1);
      if (corner) {   // sulking in the corner, heads down, facing the room
        const p = st.corner[i]; a.group.position.set(p.x, 0, p.z); a.group.rotation.y = yawTo(p, st.scrum) + (i - 1) * .3;
        a.group.updateMatrixWorld(true); a.B.head.rotation.x += .35; a.B.spine.rotation.x += .08; return;
      }
      const turn = sm(GRAB - 1.2, GRAB, t) * (1 - (frozen ? sm(ARMS - .5, ARMS, t) : 0));   // face Mohammed for the scrum, the fqih when explaining
      const face = frozen && t > ARMS - .5 ? yawTo(a.group.position, fq.group.position) : yawTo(a.group.position, mo.group.position);
      const y0 = st.wallYaw?.[i] ?? a.group.rotation.y; (st.wallYaw ||= [])[i] = y0;
      a.group.rotation.y = frozen && t > ARMS - .5 ? face : y0 + (((face - y0 + Math.PI * 3) % (Math.PI * 2)) - Math.PI) * turn;
      a.group.updateMatrixWorld(true);
    });
    // kid1 and kid3 whitewash with their own brooms until the scrum, then drop them at their feet
    for (const [a, br, k] of [[k1, b1, 'w1'], [k3, b3, 'w3']]) {
      br.visible = !corner;
      if (t < GRAB - 1.2) M[k] = wallHand(a, 'R', t * 3.4 + (a === k1 ? 0 : 2), br); else floorBroom(br, a, a === k1 ? -1 : 1);
    }
    if (t < GRAB - 1.2) { PO.reach(k2, 'R', IK.wpos(k2.B.chest).addScaledVector(dirW(k2, 0, 0, 1), .25).add(V(0, .25 + .08 * Math.sin(t * 3), 0)), { grip: .02 }); }
    // ---- Mohammed
    let mPos, hold = null; mos.group.visible = false; mo.group.visible = true;
    if (corner) {
      const p = st.corner[3]; mo.group.position.set(p.x, 0, p.z); mo.group.rotation.y = yawTo(p, st.scrum) - .2; rest(mo.B); idlePose(mo.B, t, 1);
      mo.B.head.rotation.x += .3; mo.group.updateMatrixWorld(true);
    } else if (t < RUN) {   // at the lime bucket: dips the broom, lifts it dripping, beaming
      mo.group.position.copy(st.dipAt); mo.group.rotation.y = yawTo(st.dipAt, st.bucket); rest(mo.B); idlePose(mo.B, t, 1); mo.group.updateMatrixWorld(true);
      const dip = Math.sin(Math.PI * clamp((t - DIP) / 2.4)), rim = st.bucket.clone().setY(.45);
      const hand = IK.wpos(mo.B.chest).addScaledVector(dirW(mo, 0, 0, 1), .22).add(V(0, -.05, 0)).lerp(rim.clone().add(V(0, .22, 0)).addScaledVector(dirW(mo, 0, 0, -1), .12), dip);
      M.dip = +PO.reach(mo, 'R', hand, { grip: .02, pole: LOW_R }).toFixed(3); hold = rim.clone().add(V(0, -.2, 0)).lerp(hand.clone().add(V(0, .4, 0)), 1 - dip);
    } else if (t < DROP) {   // runs to the wall, then the tug of war
      travel(mo, [[st.dipAt.x, st.dipAt.z], [scrum.x, scrum.z]], t, { t0: RUN, speed: 2.2, gait: 'run' });
      if (t > RUN + 1.6) { mo.group.rotation.y = yawTo(scrum, k2.group.position); mo.group.updateMatrixWorld(true); }
    } else if (t < UP + .6) {   // lets go: falls back and lands sitting in the puddle, then gets up
      const k = clamp((t - DROP) / .5) * (1 - sm(UP, UP + .6, t)), p = scrum.clone().lerp(st.sitAt, clamp((t - DROP) / .45));
      mo.group.visible = false; mos.group.visible = true;
      mos.group.position.set(p.x, 0, p.z); mos.group.rotation.y = yawTo(scrum, k2.group.position); mos.group.updateMatrixWorld(true);
      blend(mos, st.stand, st.sit, k * k);
      if (k > .9) { M.sitLow = +PO.lowestOf(mos, Object.keys(mos.B)).toFixed(3); }
      PO.reach(mos, 'L', st.sitAt.clone().addScaledVector(dirW(mos, 1, 0, -.6), .3).setY(.02), { grip: .02, pole: [.15, -.2, -.1] });
      PO.reach(mos, 'R', st.sitAt.clone().addScaledVector(dirW(mos, -1, 0, -.6), .3).setY(.02), { grip: .02, pole: [-.15, -.2, -.1] });
    } else {   // back into the scrum, then frozen with the others
      travel(mo, [[st.sitAt.x, st.sitAt.z], [scrum.x, scrum.z]], t, { t0: UP + .6, speed: 1.6, gait: 'run' });
      if (t > BACK) { mo.group.rotation.y = frozen && t > ARMS - .5 ? yawTo(scrum, fq.group.position) : yawTo(scrum, k2.group.position); rest(mo.B); idlePose(mo.B, t, 1); mo.group.updateMatrixWorld(true); }
    }
    // the broom fight: Mohammed holds it out, three pairs of hands on it, it jerks back and forth
    if (!corner && t >= RUN && t < DROP) {
      const ch = IK.wpos(mo.B.chest), f = dirW(mo, 0, 0, 1), tug = t > GRAB ? Math.sin((t - GRAB) * 5.5) * .07 + Math.sin((t - GRAB) * 2.3) * .04 : 0;
      const gH = ch.clone().addScaledVector(f, .2 + tug).add(V(0, -.2, 0)), dir = f.clone().add(V(0, .12, 0)).normalize();
      M.moR = +PO.reach(mo, 'R', gH, { grip: .02, pole: LOW_R }).toFixed(3); M.moL = +PO.reach(mo, 'L', ch.clone().addScaledVector(f, .14).addScaledVector(dirW(mo, 1, 0, 0), .2).add(V(0, -.4, 0)), { grip: .02, pole: LOW_L }).toFixed(3);
      inHand(b0, palm(mo, 'R'), dir); hold = null;
      if (t > GRAB - .6) {
        const g = sm(GRAB - .6, GRAB, t);
        for (const [a, s, d] of [[k2, 'R', .3], [k2, 'L', .4], [k1, 'R', .45], [k3, 'L', .36], [k1, 'L', .22]]) {
          const pt = b0.localToWorld(V(0, d, 0)); M['grab' + a.name + s] = +PO.reach(a, s, IK.wpos(a.B['hand' + s]).lerp(pt, g), { grip: .015 }).toFixed(3);
        }
      }
    } else if (hold) inHand(b0, palm(mo, 'R'), hold.clone().sub(palm(mo, 'R')));
    // after the drop the broom is kid2's: pulled away, then clutched to his chest (line 10)
    if (!corner && t >= DROP) {
      const ch = IK.wpos(k2.B.chest), f = dirW(k2, 0, 0, 1), clutch = sm(L[10][0], L[10][0] + .6, t);
      const gH = ch.clone().addScaledVector(f, .3 - .16 * clutch).add(V(0, -.1 + .05 * clutch, 0));
      if (t < ARMS - .5 || clutch > 0) {
        M.k2R = +PO.reach(k2, 'R', gH, { grip: .02 }).toFixed(3); PO.reach(k2, 'L', gH.clone().add(V(0, .07, 0)), { grip: .02 });
        inHand(b0, palm(k2, 'R'), clutch > 0 ? V(0, 1, 0).addScaledVector(f, .15) : f.clone().add(V(0, .15, 0)));
      } else floorBroom(b0, k2, 1);
    }
    b0.visible = !corner;
    // ---- frozen, then all explaining at once: arms out, hands open, jabbing toward the fqih
    if (frozen && !corner) {
      const talk = sm(ARMS - .5, ARMS + .3, t) * (1 - sm(L[9][0] - .3, L[9][0], t) * 0);
      for (const [i, a] of [k1, k2, k3, mo].entries()) {
        if (a === k2 && t > L[10][0]) continue;
        if (a === k1 && t > L[9][0]) continue;
        const ch = IK.wpos(a.B.chest), f = dirW(a, 0, 0, 1), s = dirW(a, 1, 0, 0), j = Math.sin(t * 6 + i * 1.7) * .05;
        const m = a === mo;
        for (const [side, sg] of [['L', 1], ['R', -1]]) PO.reach(a, side, IK.wpos(a.B['hand' + side]).lerp(ch.clone().addScaledVector(f, (m ? .2 : .3) + j).addScaledVector(s, (m ? .14 : .26) * sg).add(V(0, (m ? -.22 : -.1) + j, 0)), talk), { grip: .0, ...(m && { pole: sg > 0 ? LOW_L : LOW_R }) });
        if (t < ARMS - .5) { a.B.chest.rotation.x += Math.sin(t * 30 + i) * .01; a.group.updateMatrixWorld(true); }   // trembling with anger
      }
      if (t > L[9][0]) {   // kid1 points at Mohammed, pleading to the fqih
        const p = sm(L[9][0], L[9][0] + .4, t), mh = IK.wpos(mo.B.head), sh0 = IK.wpos(k1.B.upperArmR);
        PO.reach(k1, 'R', IK.wpos(k1.B.handR).lerp(sh0.clone().add(mh.clone().sub(sh0).setLength(.42)), p), { grip: 0 });
        PO.look(k1, IK.wpos(fq.B.head), .6);
      }
    }
    // ---- the fqih on his estrade: rod at his side; raised on "Doucement", on "Silence", pointing to the corner for the verdict
    rest(fq.B); idlePose(fq.B, t, 1);
    const fch = IK.wpos(fq.B.chest), ff = dirW(fq, 0, 0, 1), fs = dirW(fq, -1, 0, 0);
    const raise = Math.max(sm(L[2][0] + .3, L[2][0] + .8, t) * (1 - sm(L[2][1], L[2][1] + .6, t)), sm(L[7][0] - .2, L[7][0] + .2, t) * (1 - sm(L[8][0] + 2, L[8][0] + 3, t)));
    const point = sm(L[11][0] + 4, L[11][0] + 4.6, t) * (1 - sm(L[11][1], L[11][1] + .8, t));
    const cdir = st.corner[0].clone().setY(1.2).sub(fch).setY(0).normalize();
    let fh = fch.clone().addScaledVector(ff, .18).addScaledVector(fs, .2).add(V(0, -.35, 0));
    fh.lerp(fch.clone().addScaledVector(ff, .28).addScaledVector(fs, .38).add(V(0, .3, 0)), raise).lerp(fch.clone().addScaledVector(cdir, .5).addScaledVector(fs, .12).add(V(0, .05, 0)), point);
    M.fq = +PO.reach(fq, 'R', fh, { grip: .02 }).toFixed(3);
    inHand(st.rd, palm(fq, 'R'), raise > .5 ? V(0, 1, 0).addScaledVector(fs, .35).addScaledVector(ff, .1) : point > .5 ? cdir.clone().add(V(0, .1, 0)) : ff.clone().add(V(0, -.6, 0)));
    PO.look(fq, IK.wpos((t > L[11][0] + 4 && point > .3 ? k3 : mo).B.head), .5);
    breathe(fq, t, 1, 1);
    for (const a of [k1, k2, k3, mo]) if (!corner && t > GRAB - 1.2 && !(a === k1 && t > L[9][0])) PO.look(a, IK.wpos((frozen ? fq : a === mo ? k2 : mo).B.head), .5);
  },
});

export { sh };
window.__s04 = sh;
export default make({ preload: all(sh), plate: 'ep06/msid_menage', segs: [st('p02a_toiles', [0, 0], 'pushL'), st('p02b_chaux', [1, 0], 'panR'), ac([2, 0], sh.fn)] });
