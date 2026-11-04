// s25 Lalla Aïcha. The salon after lunch (salon). b094 Aïcha bursts in from the left door; Zoubida meets her mid-room:
// kisses on both cheeks. b095 Zoubida points her to the big divan, the place of honour; Aïcha flops among the cushions.
// From b096 on: Aïcha seated on the back divan, Zoubida kneeling at the low table, Mohammed cross-legged in his corner.
// b096 the Khadijas joke: everybody laughs. b097 Zoubida pours the tea of the great days (insert: sage and wormwood).
// b098 Aïcha proud, the smile fading; b099 CU she falls silent, looks away; b100 CU she leans to Zoubida, hands at
// shoulder height, eyes to the sky: "Ils sont... Ils sont..." (hard silence). b101 Zoubida sends Mohammed up with his
// drum (he stands, takes it, walks off). b102 the terrace at sunset (terrasse_rampe): alone, he beats wild rhythms //
// cross-cut below: the two women bent toward each other, whispering. b103 painting: the sunset terraces.
import * as THREE from 'three';
import * as K from '../../../engine/core.js';
import * as PO from '../../../engine/poses.js';
import * as PR from '../../../engine/props3d.js';
import { shot, role, memoPose, breathe } from './_3d.js';
import { beatScene, lines, put, idle, at, front, dirW, orient, heightAt, sm, V, yawTo } from '../lib/beatscene.js';
import { walk, point, strike } from '../lib/acts.js';
import { bendir } from '../lib/props7.js';

const L = lines('s25_aicha');
const D = j => L[j][1] - L[j][0];
const MEET = L[0][0] + 1.6, SIT = L[1][0] + .62 * D(1), SEATED = L[2][0] - .1;
const POUR = [L[3][0] + .3, L[3][1] + .6], UP = L[7][0] + .5 * D(7);
const laugh = (t, s, a = 1) => ({ open: a * (.2 + .3 * Math.max(0, K.noise(t * 7, s))) });
const LAUGH = [L[2][0] + .55 * D(2), L[2][1] + .8];

const sa = shot({
  plate: 'salon',
  async build(S3) {
    const cam = S3.cam.position.clone().setY(0);
    const aw = await role('aicha'), as = await role('aicha', { seat: true, copy: '_s' });
    const zw = await role('zoubida', { costume: 'fete' }), zk = await role('zoubida', { costume: 'fete', seat: true, copy: '_k' });
    const mo = await role('mohammed', { seat: true, costume: 'fete' }), ms = await role('mohammed', { costume: 'fete', copy: '_w' });
    // the back divan, place of honour: seat front foot y 665, top y 612 at x 1060; she sits 0.3 m in from the edge
    const dh = K.clamp(heightAt(S3, 1060, 665, 612), .25, .45), edge = S3.floorAt(1060, 665);
    const ap = edge.clone().add(edge.clone().sub(cam).setY(0).normalize().multiplyScalar(.3));
    const zp = S3.floorAt(700, 905), mp = S3.floorAt(1330, 975);
    S3.add(as, ap.x, ap.z, yawTo(ap, cam.clone().lerp(zp, .45)));
    memoPose('s25-as', as, [dh], () => PO.crossLegged(as, { seat: dh, lean: .05, hands: false }));
    S3.add(zk, zp.x, zp.z, yawTo(zp, ap.clone().lerp(cam, .4)));
    memoPose('s25-zk', zk, [zp.x, zp.z], () => PO.kneel(zk, { lean: .15, hands: false }));
    S3.add(mo, mp.x, mp.z, yawTo(mp, cam.clone().lerp(ap, .5)));
    memoPose('s25-mo', mo, [mp.x, mp.z], () => PO.crossLegged(mo, { seat: 0, lean: .12 }));
    const P = { as: PO.snap(as), zk: PO.snap(zk), mo: PO.snap(mo) };
    as.name = 'aicha'; zk.name = 'zoubida'; ms.name = 'mohammed_w';
    const sup = S3.qa?.supports || {}; sup.aicha = dh; sup.zoubida = 0; sup.mohammed = 0;
    // the walk-in: the door on the left, the meeting point mid-room
    const door = S3.floorAt(120, 990), meet = S3.floorAt(620, 930), meetZ = S3.floorAt(780, 920);
    S3.add(aw, meet.x, meet.z, yawTo(meet, meetZ)); S3.add(zw, meetZ.x, meetZ.z, yawTo(meetZ, meet));
    aw.name = 'aicha_w'; zw.name = 'zoubida_w';
    S3.add(ms, mp.x, mp.z, yawTo(mp, door));
    // the tea: the table top, a pot and a glass
    const th = K.clamp(heightAt(S3, 920, 885, 715), .22, .4), tc = S3.floorAt(920, 885).addScaledVector(S3.floorAt(920, 885).sub(cam).setY(0).normalize(), .3).setY(th);
    const pot = S3.prop(PR.teapot()), gl = S3.prop(PR.teaGlass({ fill: .2 })), wt = S3.prop(PR.stream(null, null, null, { r: .004 }));
    pot.userData.qa = { grip: true, hand: 'R', owner: 'zoubida' };
    const glp = tc.clone().addScaledVector(dirW(zk, -1, 0, 0), .12); gl.position.copy(glp); gl.updateMatrixWorld(true);
    const dr = S3.prop(bendir()); dr.userData.qa = { grip: true, hand: 'L', owner: 'mohammed_w' };
    const drFloor = mp.clone().addScaledVector(dirW(mo, 1, 0, 0), .35).setY(.19);
    return {
      actors: [as, zk, mo, aw, zw, ms], as, zk, mo, aw, zw, ms, P, ap, zp, mp, door, meet, meetZ, tc, glp, pot, gl, wt, dr, drFloor, cam,
      faces: [
        [as, 'aicha', 7, (lt, t) => ({ ...(t > LAUGH[0] && t < LAUGH[1] ? laugh(t, 7, .7) : {}), ...(t > L[4][0] + .6 * D(4) && t < L[7][0] ? { sad: .5 * sm(L[4][0] + .6 * D(4), L[5][0], t), lid: .15 } : {}) })],
        [zk, 'zoubida', 1, (lt, t) => t > LAUGH[0] && t < LAUGH[1] ? laugh(t, 1, .6) : {}],
        [mo, null, 3, (lt, t) => t > LAUGH[0] - .4 && t < LAUGH[1] ? laugh(t, 3) : {}],
        [aw, 'aicha', 7, { open: .1 }], [zw, 'zoubida', 1], [ms, null, 3],
      ],
    };
  },
  frame(lt, u, t, S, st) {
    const { as, zk, mo, aw, zw, ms, P, ap, zp, mp, door, meet, meetZ, tc, glp, pot, gl, wt, dr, drFloor, cam } = st;
    const seated = t >= SEATED, walkA = t < SIT;
    aw.group.visible = walkA; zw.group.visible = !seated; as.group.visible = !walkA; zk.group.visible = seated;
    const up = t >= UP, gone = t >= L[8][0] - .1;
    mo.group.visible = !up; ms.group.visible = up && !gone; dr.visible = !gone;
    // ---- b094/b095: the arrival, the kisses, the place of honour
    if (!seated) {
      idle(zw, t, 1);
      if (walkA) {
        idle(aw, t, 7);
        const T2 = L[1][0] + .25 * D(1);
        const w = t < T2 ? walk(aw, door, meet, L[0][0] - .6, MEET, t, { cps: 2.4 }) : 1;
        const w2 = t < T2 ? 0 : walk(aw, meet, ap.clone().addScaledVector(ap.clone().sub(cam).setY(0).normalize(), -.45), T2, SIT, t, { cps: 2 });
        if (w2 <= 0) {
          // the kisses: heads lean together, left cheek, right cheek, left
          const kk = sm(MEET, MEET + .3, t) * (1 - sm(L[1][0] - .3, L[1][0], t)), side = Math.sign(Math.sin((t - MEET) * 6)) || 1;
          if (w >= 1) { aw.group.rotation.y = yawTo(aw.group.position, meetZ); aw.group.updateMatrixWorld(true); }
          for (const a of [aw, zw]) { a.B.spine.rotation.x += .12 * kk; a.B.spine.updateWorldMatrix(false, true); a.B.head.rotation.y += .35 * kk * side * (a === aw ? 1 : -1); a.B.head.updateWorldMatrix(false, true); }
          if (kk > 0) for (const [a, o] of [[aw, zw], [zw, aw]]) { PO.reach(a, 'L', at(o, 'upperArmR').add(V(0, -.05, 0)), { grip: .03 }); PO.reach(a, 'R', at(o, 'upperArmL').add(V(0, -.05, 0)), { grip: .03 }); }
          PO.look(aw, at(zw, 'head'), .6); PO.look(zw, at(aw, 'head'), .6);
        } else PO.look(aw, ap.clone().setY(.8), .5);
      }
      // b095: Zoubida points to the divan, insisting
      const pt = sm(L[1][0] + .1, L[1][0] + .6, t) * (1 - sm(SIT + .5, SIT + 1.2, t));
      if (pt > 0) { zw.group.rotation.y = yawTo(zw.group.position, ap.clone().lerp(meet, .5)); zw.group.updateMatrixWorld(true); point(zw, ap.clone().setY(.6), pt); }
      PO.look(zw, walkA ? at(aw, 'head') : at(as, 'head'), .6);
    }
    // ---- seated: Aïcha on the divan, flopping into the cushions as she lands
    if (!walkA) {
      PO.apply(as, P.as); breathe(as, t, 1, 7);
      const flop = Math.max(0, 1 - (t - SIT) / .6);
      as.group.position.y = .06 * flop; as.group.updateMatrixWorld(true);
      const ka = as.group.scale.y / 1.6;
      // hands: talking in her lap; b100 raised to shoulder height, palms up, eyes to the sky; she leans to Zoubida
      const talk = Math.sin(t * 2.6) * (t > L[2][0] && t < L[3][0] || t > L[4][0] && t < L[4][1] - 1 ? 1 : 0);
      const lean = sm(L[6][0] - .3, L[6][0] + .8, t) * (1 - sm(L[7][0] + .3, L[7][0] + 1.2, t)) + (t > L[8][0] - .1 ? 1 : 0);
      const sky = sm(L[6][0] + .5 * D(6), L[6][0] + .62 * D(6), t) * (1 - sm(L[6][1] + .9, L[6][1] + 1.6, t));
      as.B.spine.rotation.x += .22 * lean; { const y = yawTo(as.group.position, zk.group.position) - as.group.rotation.y; as.B.spine.rotation.y += K.clamp(Math.atan2(Math.sin(y), Math.cos(y)), -.4, .4) * .6 * lean; } as.B.spine.updateWorldMatrix(false, true);
      for (const [s, r] of [['L', -1], ['R', 1]]) {
        const lap = front(as, 'root', .25 * ka, .12 * r * ka, .12 * ka), mid = front(as, 'chest', (.28 + .04 * talk) * ka, .2 * r * ka, (-.05 + .05 * talk * r) * ka);
        const shoulder = front(as, 'chest', .25 * ka, .3 * r * ka, .15 * ka);
        PO.reach(as, s, lap.lerp(mid, Math.abs(talk) > 0 ? .7 : 0).lerp(shoulder, sky), { grip: sky > .5 ? .06 : .03 });
      }
      const lookAway = sm(L[5][0] - .2, L[5][0] + .5, t) * (1 - sm(L[6][0], L[6][0] + .5, t));
      const tgt = sky > .3 ? at(as, 'head').add(V(0, 2, 0)).addScaledVector(dirW(as, 0, 0, 1), 1) : lookAway > 0 ? front(as, 'head', 1, -1.2, -.2) : at(zk.group.visible ? zk : zw, 'head');
      PO.look(as, tgt, .7);
      if (LAUGH[0] < t && t < LAUGH[1]) { as.B.chest.rotation.x -= .05 * Math.sin(t * 9); as.B.chest.updateWorldMatrix(false, true); }
    }
    // ---- Zoubida kneeling at the table: pours (b097), listens, leans in to the whisper, sends the boy up (b101)
    if (seated) {
      PO.apply(zk, P.zk); breathe(zk, t, 1, 1);
      const kz = zk.group.scale.y / 1.6;
      const pour = sm(POUR[0], POUR[0] + .5, t) * (1 - sm(POUR[1] - .5, POUR[1], t));
      const rest = tc.clone().addScaledVector(dirW(zk, 1, 0, 0), .1);
      const hp = rest.clone().lerp(glp.clone().add(V(0, .32, 0)).addScaledVector(dirW(zk, 0, 0, -1), .06), pour);
      PO.reach(zk, 'R', hp.clone().add(V(0, .12, 0)), { grip: .02 });
      const palm = PO.handPts(zk, 'R').palm;
      orient(pot, palm.clone().add(V(0, -.12, 0)), V(0, 1, 0).lerp(glp.clone().sub(palm).setY(0).normalize(), .55 * pour).normalize(), glp.clone().sub(palm).setY(0).normalize());
      wt.visible = pour > .7; if (wt.visible) PR.stream(wt, pot.localToWorld(V(0, .1, .1)), glp.clone().add(V(0, .06, 0)), { r: .004 });
      const lean = sm(L[6][0], L[6][0] + .8, t) * (1 - sm(L[7][0] + .3, L[7][0] + 1.2, t)) + (t > L[8][0] - .1 ? 1 : 0);
      zk.B.spine.rotation.x += .2 * lean; zk.B.spine.updateWorldMatrix(false, true);
      const send = sm(L[7][0] + .2, L[7][0] + .7, t) * (1 - sm(UP + .5, UP + 1.2, t));
      if (send > 0) point(zk, door.clone().setY(1.2), send, 'L');
      PO.look(zk, send > .3 ? at(mo.group.visible ? mo : ms, 'head') : at(as, 'head'), .6);
      if (LAUGH[0] < t && t < LAUGH[1]) { zk.B.chest.rotation.x -= .05 * Math.sin(t * 9 + 1); zk.B.chest.updateWorldMatrix(false, true); }
    } else { pot.position.copy(tc.clone().addScaledVector(dirW(zk, 1, 0, 0), .1)); pot.rotation.set(0, 0, 0); pot.updateMatrixWorld(true); wt.visible = false; }
    // ---- Mohammed in his corner: laughing with them (b096), then sent up: he stands with the drum and goes
    if (!up) {
      PO.apply(mo, P.mo); breathe(mo, t, 1, 3);
      orient(dr, drFloor, V(0, 1, 0), dirW(mo, 0, 0, 1));
      if (LAUGH[0] - .4 < t && t < LAUGH[1]) { mo.B.spine.rotation.x += .1 * Math.abs(Math.sin(t * 8)); mo.B.spine.updateWorldMatrix(false, true); }
      PO.look(mo, at(t > L[7][0] ? zk : as.group.visible ? as : aw, 'head'), .6);
    } else if (!gone) {
      idle(ms, t, 3);
      walk(ms, mp, door, UP + .4, L[8][0] + .6, t, { cps: 2.5 });
      const km = ms.group.scale.y / 1.1, h = front(ms, 'chest', .12 * km, -.12 * km, -.1 * km);
      orient(dr, h, dirW(ms, 0, 0, 1), V(0, 1, 0));
      PO.reach(ms, 'L', h.clone().add(V(0, -.05, 0)), { grip: .02 }); PO.reach(ms, 'R', h.clone().addScaledVector(dirW(ms, 0, 0, 1), .06), { grip: .02 });
      PO.look(ms, t < UP + .5 ? at(zk, 'head') : door.clone().setY(1), .6);
    }
  },
});

const te = shot({
  plate: 'terrasse_rampe',
  async build(S3) {
    const cam = S3.cam.position.clone().setY(0);
    const mo = await role('mohammed', { costume: 'fete' });
    put(S3, mo, 960, 960, cam.clone().add(V(1.2, 0, 0)));
    const dr = S3.prop(bendir()); dr.userData.qa = { grip: true, hand: 'L', owner: 'mohammed' };
    return { actors: [mo], mo, dr, cam, faces: [[mo, null, 3, (lt, t) => ({ open: .15 + .25 * Math.max(0, K.noise(t * 4, 3)) })]] };
  },
  frame(lt, u, t, S, st) {
    const { mo, dr, cam } = st;
    idle(mo, t, 3);
    strike(mo, dr, t, { bpm: 190, pat: [1, .3, .9, .2, .6, 1, .4, .1], wild: 1, fwd: .35 });
    mo.B.head.rotation.x += .12 * Math.sin(t * 6.3); mo.B.head.rotation.z += .1 * Math.sin(t * 3.1); mo.B.head.updateWorldMatrix(false, true);
    mo.B.spine.rotation.y += .12 * Math.sin(t * 3.2); mo.B.spine.updateWorldMatrix(false, true);
  },
});

export { sa, te };
export default beatScene('s25_aicha', {
  shots: { sa, te },
  plan: {
    b094: { shot: 'sa', size: 'W', cover: [{ f: .55, size: 'M', on: 'aicha_w' }] },
    b095: { shot: 'sa', size: 'M', on: 'zoubida_w', cover: [{ f: .66, size: 'M', on: 'aicha' }] },
    b096: { shot: 'sa', size: 'M', on: 'aicha', cover: [{ f: .55, size: 'W' }] },
    b097: { shot: 'sa', size: 'M', on: 'zoubida', insAt: .5 },
    b098: { shot: 'sa', size: 'M', on: 'aicha' },
    b099: { shot: 'sa', size: 'CU', on: 'aicha' },
    b100: { shot: 'sa', size: 'CU', on: 'aicha' },
    b101: { shot: 'sa', size: 'M', on: 'zoubida', cover: [{ f: .5, size: 'M', on: 'mohammed' }] },
    b102: { shot: 'te', size: 'M', on: 'mohammed', segs: [[.42, 'sa'], [.72, 'te']], cover: [{ f: .42, size: 'M', on: 'aicha', shot: 'sa' }, { f: .72, size: 'M', on: 'mohammed', shot: 'te' }] },
    b103: { shot: 'p11_terrasses' },
  },
});
