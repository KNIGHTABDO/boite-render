// s10: Zoubida calls from the foot of the stairs (l0 sweet, l1 sharp, l2 screaming; escalier, she is on the plate's landing),
// l3 terrace: he freezes at "juif / chien galeux", drops the stick, runs for the stairs door (exit),
// l4 escalier: he arrives, elbow up as a shield, she grips his shoulders and shakes him,
// l5 patio_matin: Zoubida in the white haik adjusts, veils her face with the cotton, they leave by the back door.
// Calibrations are self-seeded (escalier is a rough guess, 1.65 m / horizon 440): the plates have no cal.json entry.
import * as K from '../../../engine/core.js';
import * as PO from '../../../engine/poses.js';
import * as IK from '../../../engine/ik.js';
import { rest, idlePose } from '../../../engine/rig3d.js';
import { travel } from '../../../engine/clips.js';
import { make, st, ac } from './_pt.js';
import { shot, all, breathe, V, role, CAL } from './_3d.js';
import { rod, inHand } from './_props.js';
const { clamp, ease } = K;
const sm = (a, b, x) => ease(clamp((x - a) / (b - a)));
const dirW = (a, x, y, z) => V(x, y, z).normalize().applyAxisAngle(V(0, 1, 0), a.group.rotation.y);
const yawTo = (f, to) => Math.atan2(to.x - f.x, to.z - f.z);

CAL.escalier = { h: 1.65, horizon: 440, fov: 55 };
CAL.patio_matin = { h: 1.19, horizon: 714, fov: 50 };
CAL.terrasse = { h: 1.55, horizon: 400, fov: 50 };
const SC = (await (await fetch(new URL('../timing.json', import.meta.url))).json()).find(s => s.id === 's10_appels');
const L = SC.lines.map(l => [l.start - SC.start, l.start - SC.start + l.dur]);
const LIGHT = { key: 0xfff0d0, keyI: 1.8, dir: [-1.5, 3, 2], sky: 0xc0d0f0, ground: 0xd8b080, fillI: 1.6, rim: 0xffe0a0, rimI: .6, rimDir: [2, 2, -3], shadow: .3, area: 4 };

// ---------- escalier: lines 0-2 (calls) and 4 (shake) ----------
const ARR = L[4][0] + .6, HIT = L[4][0] + 4.2;   // he reaches her / she grabs him
const esc = shot({
  plate: 'escalier', light: { ...LIGHT, keyI: 1.4, shadow: .2 },
  async build(S3) {
    const F = (x, y) => S3.floorAt(x, y), zo = await role('zoubida'), mo = await role('mohammed');
    const zp = F(560, 1050), mp = zp.clone().add(V(.5, 0, .02)), from = F(1750, 1050);
    S3.add(zo, zp.x, zp.z, .75); S3.add(mo, mp.x, mp.z, -1.1);
    return { actors: [zo, mo], zo, mo, zp, mp, from,
      faces: [[zo, 'zoubida', 1, (lt, t) => ({ sad: t > L[1][0] ? -.3 : 0 })], [mo, null, 2, (lt, t) => ({ sad: t > ARR ? .6 : 0 })]] };
  },
  cover: [{ t: 0, size: 'M', on: 'zoubida' }, { t: L[1][0], size: 'CU', on: 'zoubida' }, { t: L[2][0], size: 'M', on: 'zoubida' }, { t: L[2][0] + 3.5, size: 'CU', on: 'zoubida' },
    { t: L[4][0], size: 'W' }, { t: L[4][0] + 3.6, size: 'M', on: 'zoubida', dy: 110 }],
  frame(lt, u, t, S, s) {
    const { zo, mo } = s;
    if (t < L[4][0] - .2) {   // calls: stairs at her right and up, he is out of shot (parked behind the plate edge)
      mo.group.position.copy(s.from); mo.group.visible = false;
      rest(zo.B); idlePose(zo.B, t, .8); zo.group.updateMatrixWorld(true);
      const hd = IK.wpos(zo.B.head), fw = dirW(zo, 0, 0, 1), rt = dirW(zo, -1, 0, 0), up = V(0, 1, 0);
      const ph = t < L[1][0] ? 0 : t < L[2][0] ? 1 : 2, k = Math.sin(t * (ph === 2 ? 11 : 5));
      let tilt = ph === 0 ? .5 : .9, lean = ph === 0 ? .05 : ph === 1 ? .12 : .2;
      zo.B.spine.rotation.x += lean; zo.B.chest.rotation.x += lean * .5;
      zo.group.updateMatrixWorld(true);
      const ch = IK.wpos(zo.B.chest);
      if (ph === 0) {   // sweet: one hand cupped to the mouth, the other open
        PO.reach(zo, 'L', ch.clone().addScaledVector(fw, .24).addScaledVector(up, .26).addScaledVector(rt, -.05));
        PO.reach(zo, 'R', ch.clone().addScaledVector(fw, .28).addScaledVector(rt, .3).addScaledVector(up, -.12 + .05 * k));
      } else if (ph === 1) {   // sharp: arm pointing up the stairs, other fist on the hip
        PO.reach(zo, 'L', ch.clone().addScaledVector(fw, .35).addScaledVector(rt, -.12).addScaledVector(up, .3 + .05 * k));
        PO.reach(zo, 'R', ch.clone().addScaledVector(rt, .36).addScaledVector(fw, .05).addScaledVector(up, -.25));
      } else {   // screaming: both fists shaken in front
        PO.reach(zo, 'L', ch.clone().addScaledVector(fw, .3).addScaledVector(rt, -.2).addScaledVector(up, .12 + .12 * k));
        PO.reach(zo, 'R', ch.clone().addScaledVector(fw, .3).addScaledVector(rt, .2).addScaledVector(up, .12 - .12 * k));
      }
      PO.look(zo, hd.clone().addScaledVector(fw, 1.2).addScaledVector(rt, 1.6).add(V(0, tilt * 1.4, 0)).addScaledVector(fw, -.6), .6);
      breathe(zo, t, ph === 2 ? 1.4 : .8, 1);
      return;
    }
    mo.group.visible = true;
    // he walks in from the right along the foot of the stairs, head low
    travel(mo, [[s.from.x, s.from.z], [s.mp.x, s.mp.z]], t, { t0: L[4][0], speed: (s.from.distanceTo(s.mp)) / (ARR - L[4][0]), gait: 'run' });
    const arrived = t >= ARR, shk = t >= HIT ? Math.sin((t - HIT) * 13) * sm(HIT, HIT + .3, t) : 0;
    if (arrived) { mo.group.position.copy(s.mp); mo.group.rotation.y = -1.1; rest(mo.B); idlePose(mo.B, t, .6); }
    mo.B.head.rotation.x += .35 * sm(ARR - .5, ARR, t); mo.B.spine.rotation.x += .1 * sm(ARR - .5, ARR, t);
    if (arrived) {
      mo.B.root.position.z += .02 * shk; mo.B.spine.rotation.z += .12 * shk; mo.B.head.rotation.z += .35 * shk; mo.B.head.rotation.y += .25 * shk;
      mo.group.updateMatrixWorld(true);
      const hd = IK.wpos(mo.B.head), fw = dirW(mo, 0, 0, 1), rt = dirW(mo, -1, 0, 0);
      // right elbow raised like a shield beside the face (before the grab), left arm hanging
      if (t < HIT) PO.reach(mo, 'R', hd.clone().addScaledVector(fw, .14).addScaledVector(rt, .06).add(V(0, .07, 0)), { pole: [-.2, .35, .1] });
      else PO.reach(mo, 'R', IK.wpos(mo.B.chest).addScaledVector(fw, .1).addScaledVector(rt, .18).add(V(0, -.1, 0)));
    }
    rest(zo.B); idlePose(zo.B, t, .7); zo.group.updateMatrixWorld(true);
    zo.B.spine.rotation.x += .04; zo.B.head.rotation.x += .05; zo.group.updateMatrixWorld(true);
    zo.group.rotation.y = .75;
    if (arrived) {
      const ch = IK.wpos(mo.B.chest), r = dirW(mo, -1, 0, 0), sy = V(0, -.1, 0);   // upper arms, not shoulder tops: from this camera his big head hides the far shoulder
      const grab = sm(HIT - .5, HIT, t);
      const lerpTo = (side, rest_, tgt) => rest_.clone().lerp(tgt, grab);
      const zc = IK.wpos(zo.B.chest), fw = dirW(zo, 0, 0, 1), rt = dirW(zo, -1, 0, 0);
      PO.reach(zo, 'L', lerpTo('L', zc.clone().addScaledVector(fw, .3).addScaledVector(rt, -.2).add(V(0, -.05, 0)), ch.clone().addScaledVector(r, -.17).add(sy)));
      PO.reach(zo, 'R', lerpTo('R', zc.clone().addScaledVector(fw, .3).addScaledVector(rt, .2).add(V(0, -.05, 0)), ch.clone().addScaledVector(r, .17).add(sy)));
      zo.B.head.rotation.x += .1; zo.B.head.rotation.z += .08 * shk;
    }
    breathe(zo, t, 1, 1);
  },
});

// ---------- terrasse: line 3 ----------
const T3 = L[3][0], FREEZE = T3 + 7.0, DROP = T3 + 9.2, RUN = T3 + 9.9;
const ter = shot({
  plate: 'terrasse', light: LIGHT,
  async build(S3) {
    const F = (x, y) => S3.floorAt(x, y), mo = await role('mohammed'), stick = S3.prop(rod());
    const spot = F(1050, 900), door = F(640, 800);
    S3.add(mo, spot.x, spot.z, yawTo(spot, door));
    return { actors: [mo], mo, stick, spot, door, a: F(950, 880), b: F(1230, 930), faces: [[mo, null, 4, (lt, t) => ({ sad: t > FREEZE ? .6 : 0, open: t > RUN ? .8 : 0 })]] };
  },
  cover: [{ t: 0, size: 'W' }],
  view(lt, u, t) {
    const s = ter.st; if (!s || t < T3 || t >= DROP) return null;
    const p = s.mo.group.position, q = ter.S3.project(V(p.x, .75, p.z));
    return [q[0], q[1] + 20, 1.5];
  },
  frame(lt, u, t, S, s) {
    const { mo, stick } = s, palm = () => PO.handPts(mo, 'R').palm;
    const sabre = (tt) => {   // sabre strokes between a and b, until the freeze
      const c = Math.min(tt, FREEZE) - T3 + 0.2, k = Math.floor(c / 1.5), u2 = (c % 1.5) / 1.5;
      const A = k % 2 ? s.b : s.a, B = k % 2 ? s.a : s.b, mv = sm(.3, .62, u2);
      const wind = sm(0, .3, u2) * (1 - sm(.3, .38, u2)), cut = sm(.32, .45, u2) * (1 - sm(.62, .85, u2));
      return { p: A.clone().lerp(B, mv), yaw: yawTo(A, B) + (k % 2 ? .4 : -.4) * (1 - mv), wind, cut };
    };
    const hold = (tt) => {   // freeze pose: stick hanging, head toward the stairs door
      const sp = sabre(FREEZE); mo.group.position.set(sp.p.x, 0, sp.p.z); mo.group.rotation.y = sp.yaw; rest(mo.B); idlePose(mo.B, tt, .5); mo.group.updateMatrixWorld(true);
      const ch = IK.wpos(mo.B.chest), fw = dirW(mo, 0, 0, 1), rt = dirW(mo, -1, 0, 0);
      PO.reach(mo, 'R', ch.clone().addScaledVector(rt, .2).addScaledVector(fw, .05).add(V(0, -.3, 0)));
      PO.look(mo, s.door.clone().add(V(0, 1, 0)), .8);
      return palm();
    };
    if (t < FREEZE) {
      const sp = sabre(t); mo.group.position.set(sp.p.x, 0, sp.p.z); mo.group.rotation.y = sp.yaw; rest(mo.B); idlePose(mo.B, t, 1); mo.group.updateMatrixWorld(true);
      const { wind, cut } = sp;
      mo.B.root.position.y -= .06 * cut; mo.B.spine.rotation.x += .15 * cut; mo.B.chest.rotation.y += -.7 * wind + .9 * cut;
      mo.B.thighL.rotation.x -= .55 * cut; mo.B.shinL.rotation.x += .5 * cut; mo.B.thighR.rotation.x += .3 * cut; mo.group.updateMatrixWorld(true);
      const ch = IK.wpos(mo.B.chest), fw = dirW(mo, 0, 0, 1), rt = dirW(mo, -1, 0, 0), up = V(0, 1, 0);
      const hand = ch.clone().addScaledVector(rt, .28 * (wind - cut)).addScaledVector(fw, .1 + .3 * cut).addScaledVector(up, .3 * wind - .22 * cut - .05);
      PO.reach(mo, 'R', hand, { grip: .02 });
      inHand(stick, palm(), hand.clone().sub(ch.clone().addScaledVector(fw, -.05).add(V(0, .1, 0))));
      PO.reach(mo, 'L', ch.clone().addScaledVector(rt, -.3).addScaledVector(fw, .08).add(V(0, -.1 + .1 * cut, 0)), { grip: .03 });
      PO.look(mo, IK.wpos(mo.B.head).addScaledVector(fw, 2), .5);
    } else {
      const p0 = hold(DROP), fw0 = V(.2, -1, .1);
      if (t < DROP) {   // frozen, listening
        hold(t); inHand(stick, palm(), fw0);
        mo.B.chest.rotation.z += .03 * Math.sin(t * 20);
      } else {
        const d = t - DROP, y = Math.max(.02, p0.y - 4.9 * d * d), lay = sm(0, .4, d);
        stick.position.set(p0.x + .08 * lay, y, p0.z); stick.quaternion.setFromUnitVectors(V(0, 1, 0), fw0.clone().lerp(V(.9, .02, .4), lay).normalize()); stick.updateMatrixWorld(true);
        if (y <= .02) stick.position.y = .02;
        // the run: spin to the door and go (travel exit)
        const sp = sabre(FREEZE);
        travel(mo, [[sp.p.x, sp.p.z], [s.door.x, s.door.z]], t, { t0: RUN, speed: sp.p.distanceTo(s.door) / (L[3][1] - RUN - 1.0), gait: 'run', exit: true });
        if (t < RUN) { hold(t); PO.look(mo, s.door.clone().add(V(0, 1, 0)), .8); }
      }
    }
    breathe(mo, t, .5, 1);
  },
});

// ---------- patio_matin: line 5 ----------
const T5 = L[5][0], VEIL = T5 + 3.5, GO = T5 + 8.2;
const pat = shot({
  plate: 'patio_matin', light: LIGHT,
  async build(S3) {
    const F = (x, y) => S3.floorAt(x, y), zo = await role('zoubida', { costume: 'haik' }), mo = await role('mohammed');
    const zp = F(820, 960), mp = F(1060, 990), door = F(1125, 760);
    S3.add(zo, zp.x, zp.z, .15); S3.add(mo, mp.x, mp.z, -.2);
    return { actors: [zo, mo], zo, mo, zp, mp, door, faces: [[zo, null, 1], [mo, null, 2, () => ({ sad: .3 })]] };
  },
  cover: [{ t: 0, size: 'W' }, { t: T5 + 3, size: 'M', on: 'zoubida', dy: 80 }, { t: GO - .2, size: 'W' }],
  frame(lt, u, t, S, s) {
    const { zo, mo } = s;
    const path = (a, from) => [[from.x, from.z], [s.door.x + (a === zo ? -.25 : .25), s.door.z + .4]];
    for (const [a, from, d] of [[zo, s.zp, 0], [mo, s.mp, .5]]) {
      const walking = t > GO + d;
      if (walking) travel(a, path(a, from), t, { t0: GO + d, speed: 1.0, gait: 'walk', exit: true });
      else { a.group.position.set(from.x, 0, from.z); a.group.rotation.y = a === zo ? .15 : -.2; rest(a.B); idlePose(a.B, t, .8); a.group.updateMatrixWorld(true); a.group.visible = true; }
    }
    if (t <= GO) {
      const hd = IK.wpos(zo.B.head), fw = dirW(zo, 0, 0, 1), rt = dirW(zo, -1, 0, 0), ch = IK.wpos(zo.B.chest);
      const v = sm(VEIL - .8, VEIL, t) * (1 - sm(VEIL + 1.2, VEIL + 2, t)), adj = Math.sin(t * 5) * .03;
      // arms drape the haik over the shoulders, then both hands pull the veil across the face
      const sh = (1 - v);
      PO.reach(zo, 'L', ch.clone().addScaledVector(fw, .2).addScaledVector(rt, -.2 * sh - .08 * v).add(V(0, .12 + .1 * v + adj, 0)).lerp(hd.clone().addScaledVector(fw, .14).addScaledVector(rt, -.09).add(V(0, -.04, 0)), v));
      PO.reach(zo, 'R', ch.clone().addScaledVector(fw, .2).addScaledVector(rt, .2 * sh + .08 * v).add(V(0, .12 + .1 * v - adj, 0)).lerp(hd.clone().addScaledVector(fw, .14).addScaledVector(rt, .09).add(V(0, -.04, 0)), v));
      PO.look(zo, hd.clone().addScaledVector(fw, 2), .3);
      PO.look(mo, IK.wpos(mo.B.head).addScaledVector(dirW(mo, 0, 0, 1), 1.5).add(V(.5, 0, 0)), .4);
    }
    breathe(zo, t, .6, 1); breathe(mo, t, .6, 1);
  },
});

export default make({ preload: all(esc, ter, pat), plate: 'escalier', segs: [ac([0, 0], esc.fn), ac([3, 0], ter.fn), ac([4, 0], esc.fn), ac([5, 0], pat.fn)] });
