// s09: alone on the terrace. Line 0: Mohammed bursts out of the stair door, runs and sings, then runs along the low parapet
// beating it with the quince stick; line 1: the stick is a sabre (wind-up, cut, lunge, a new enemy every 1.5 s);
// line 2: painting P5 (the horseman, dream). He drops the stick and flees down the stairs in s10 (b057, same plate).
// Plate 'terrasse' (old 2D plate) seeded from ep02 persp(747,370,1000,640): camera 1.55 m, horizon y 400.
// Contacts (st.M): stick grip in the palm, stick tip on the parapet face during the strokes (tipWall, m).
import * as K from '../../../engine/core.js';
import * as PO from '../../../engine/poses.js';
import * as IK from '../../../engine/ik.js';
import { rest, idlePose } from '../../../engine/rig3d.js';
import { travel } from '../../../engine/clips.js';
import { make, st, ac } from './_pt.js';
import { shot, all, breathe, V, role, CAL } from './_3d.js';
import { rod, inHand } from './_props.js';
const { clamp, ease } = K;
const sm = (a, b, x) => ease((x - a) / (b - a));
const dirW = (a, x, y, z) => V(x, y, z).normalize().applyAxisAngle(V(0, 1, 0), a.group.rotation.y);
const yawTo = (from, to) => Math.atan2(to.x - from.x, to.z - from.z);

CAL.terrasse = { h: 1.55, horizon: 400, fov: 50 };
const SC = (await (await fetch(new URL('../timing.json', import.meta.url))).json()).find(s => s.id === 's09_cavalier');
const L = SC.lines.map(l => [l.start - SC.start, l.start - SC.start + l.dur]);
const T0 = .4, TRUN = L[1][0] - .2;   // first run: from the door to the end of line 0

const sh = shot({
  plate: 'terrasse',
  light: { key: 0xfff0d0, keyI: 1.9, dir: [-1.5, 3, 2], sky: 0xc0d0f0, ground: 0xd8b080, fillI: 1.5, rim: 0xffe0a0, rimI: .7, rimDir: [2, 2, -3], shadow: .3, area: 4 },
  async build(S3) {
    const M = {}, F = (x, y) => S3.floorAt(x, y), mo = await role('mohammed'), stick = S3.prop(rod());
    // parapet foot line (plate px) and its camera-side normal
    const w0 = F(1000, 735), w1 = F(1470, 790), wd = w1.clone().sub(w0).normalize(); let wn = V(wd.z, 0, -wd.x);
    if (wn.dot(S3.cam.position.clone().setY(0).sub(w0)) < 0) wn.negate();
    const at = (s, n) => w0.clone().lerp(w1, s).addScaledVector(wn, n);
    const door = F(640, 790), P = [door, F(900, 930), F(1350, 960), at(.1, .55), at(.95, .55), at(.1, .55), at(.95, .55)];
    const cum = [0]; for (let i = 1; i < P.length; i++) cum.push(cum[i - 1] + P[i].distanceTo(P[i - 1]));
    const speed = cum[cum.length - 1] / (TRUN - T0), tAt = i => T0 + cum[i] / speed;
    const spots = [at(.5, 1.3), F(900, 900), F(1150, 960), F(780, 960), F(1000, 880), F(1300, 940), F(700, 880), F(1100, 900)];
    S3.add(mo, door.x, door.z, yawTo(door, P[1]));
    return { actors: [mo], M, mo, stick, wd, wn, at, P, door, speed, tAt, spots, faces: [[mo, null, 4, (lt, t) => ({ open: t > 1.5 && t < L[1][0] ? .5 + .45 * Math.sin(t * 9) : 0, sad: 0 })]] };
  },
  cover: [{ t: 0, size: 'W' }, { t: L[1][0] + 7, size: 'W' }],
  // tracked medium shots (the actor moves): cut in at the parapet run and at the sabre
  view(lt, u, t) {
    const s = sh.st; if (!s) return null;
    let tr = null;
    if (t >= s.tAt(3) - .5 && t < L[1][0] + 7) tr = true;
    if (!tr) return null;
    const p = frame.pos(t), q = sh.S3.project(V(p.x, .75, p.z));
    return [q[0], q[1] + 20, t < L[1][0] ? 1.5 : 1.7];
  },
  frame(lt, u, t, S, st) { return frame.go(t, st); },
});

const frame = {
  pos(t) {   // where he is at time t (cheap, from the same path/slash rules as go)
    const s = sh.st, mo = s.mo;
    if (t < L[1][0] - .2) return travel(mo, s.P.map(p => [p.x, p.z]), t, { t0: T0, speed: s.speed, gait: 'run' }).pos;
    return slashPos(t, s);
  },
  go(t, s) {
    const { mo, stick, M } = s, palm = () => PO.handPts(mo, 'R').palm;
    let dir = null;
    if (t < L[1][0] - .2) {   // running from the door, then along the parapet
      travel(mo, s.P.map(p => [p.x, p.z]), t, { t0: T0, speed: s.speed, gait: 'run' });
      if (t < T0) { rest(mo.B); mo.group.updateMatrixWorld(true); }
      const ch = IK.wpos(mo.B.chest), fw = dirW(mo, 0, 0, 1), rt = dirW(mo, -1, 0, 0), tw = s.tAt(3);
      const run = t > tw ? (((t - tw) * 1.7) % 1) : 0, hit = t > tw ? Math.sin(Math.PI * clamp(run / .55)) : 0;
      // toward the parapet (it is on the -wn side of the runner)
      const toWall = s.wn.clone().negate(), side = toWall.dot(rt) > 0 ? 1 : -1;   // wall on his right (1) or left (-1)
      let hand = ch.clone().addScaledVector(rt, .2).addScaledVector(fw, .25).add(V(0, -.02 + .08 * Math.sin(t * 8), 0)); dir = fw.clone().multiplyScalar(.7).add(V(0, .6, 0));
      if (t > tw && side > 0) {   // the stroke: stick out to the wall, tip on its face
        const wallPt = IK.wpos(mo.B.chest).addScaledVector(toWall, .55 + .0).setY(.62 - .1 * hit);
        hand = ch.clone().addScaledVector(rt, .2 + .15 * hit).addScaledVector(fw, .2).add(V(0, .12 - .25 * hit, 0));
        dir = wallPt.clone().sub(hand).setY(wallPt.y - hand.y).normalize(); M.tipWall = +Math.abs(hit).toFixed(2);
      }
      PO.reach(mo, 'R', hand, { grip: .02 });
      inHand(stick, palm(), dir);
      PO.look(mo, IK.wpos(mo.B.head).addScaledVector(fw, 2).add(V(0, -.1, 0)), .4);
    } else {   // sabre: wind-up, cut, lunge toward the next "enemy"
      const sp = slash(t, s);
      mo.group.position.set(sp.p.x, 0, sp.p.z); mo.group.rotation.y = sp.yaw; rest(mo.B); idlePose(mo.B, t, 1); mo.group.updateMatrixWorld(true);
      const { cut, wind, k } = sp;
      mo.B.root.position.y -= .06 * cut; mo.B.spine.rotation.x += .15 * cut; mo.B.chest.rotation.y += (-.7 * wind + .9 * cut);
      mo.B.thighL.rotation.x -= .55 * cut; mo.B.shinL.rotation.x += .5 * cut; mo.B.thighR.rotation.x += .3 * cut; mo.B.footL.rotation.x += .1 * cut;
      mo.group.updateMatrixWorld(true);
      const ch = IK.wpos(mo.B.chest), fw = dirW(mo, 0, 0, 1), rt = dirW(mo, -1, 0, 0), up = V(0, 1, 0);
      const hand = ch.clone().addScaledVector(rt, .28 * (wind - cut)).addScaledVector(fw, .1 + .3 * cut).addScaledVector(up, .3 * wind - .22 * cut - .05);
      PO.reach(mo, 'R', hand, { grip: .02 });
      dir = hand.clone().sub(ch.clone().addScaledVector(fw, -.05).add(V(0, .1, 0))).normalize();
      inHand(stick, palm(), dir);
      PO.reach(mo, 'L', ch.clone().addScaledVector(rt, -.3).addScaledVector(fw, .08).add(V(0, -.1 + .1 * cut, 0)), { grip: .03 });   // left arm out for balance
      PO.look(mo, IK.wpos(mo.B.head).addScaledVector(fw, 2), .5);
    }
    breathe(mo, t, .6, 1);
  },
};
// slash cycle: 1.5 s per enemy; wind-up .0-.35, cut .35-.6, recover to the next stance
function slash(t, s) {
  const k = Math.floor((t - L[1][0] + .2) / 1.5), u = ((t - L[1][0] + .2) % 1.5) / 1.5, n = s.spots.length;
  const a = s.spots[((k % n) + n) % n], b = s.spots[(((k + 1) % n) + n) % n];
  const wind = sm(.0, .3, u) * (1 - sm(.3, .38, u)), cut = sm(.32, .45, u) * (1 - sm(.62, .85, u)), mv = sm(.3, .62, u);
  const p = a.clone().lerp(b, k < 0 ? 0 : mv), yaw = yawTo(a, b) + (k % 2 ? .4 : -.4) * (1 - mv);
  return { p, yaw, wind, cut, k };
}
function slashPos(t, s) { return slash(t, s).p; }

export default make({ preload: all(sh), plate: 'terrasse', segs: [ac([0, 0], sh.fn), st('p05_cavalier', [2, 0], 'pull')] });
