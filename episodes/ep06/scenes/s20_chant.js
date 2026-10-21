// s20: the song from the terrace. Zoubida stops chewing in the room (chambre_jour, she and Mohammed on the floor at the
// painted tabla), the empty terrace sings (P: terrasse, no one on it), Zoubida calls out from the gallery rail and Fatma answers
// from her window (galerie_jour / fenetre_fatma, alternating), then the patio: the neighbours laugh at their balconies,
// Rahma teases ("trop longue"), the women beg "Raconte-la !".
// This file also exports the shared pieces for s21-s23: the patio staging (patioShot / patioPose: women leaning on the
// first- and second-floor balconies of patio_matin, Kanza on the ground with her rug) and the gallery shot (galShot / galPose).
// Calibrations for the reused plates, forced here (each scene keeps the values it was staged with, whatever loaded before).
// Contacts (st.M): crossLegged leg IK errors; balcony hands target the rail top (rail polygon redrawn over the legs).
import * as K from '../../../engine/core.js';
import * as PO from '../../../engine/poses.js';
import * as IK from '../../../engine/ik.js';
import { rest, idlePose } from '../../../engine/rig3d.js';
import { travel } from '../../../engine/clips.js';
import * as PR from '../../../engine/props3d.js';
import { plate, drawPlate } from '../../../engine/plates.js';
import { cam } from '../lib/kit.js';
import { make, ac, railing } from './_pt.js';
import { shot, all, breathe, V, role, mouth, CAL, memoPose, skirt } from './_3d.js';
const { clamp, ease } = K;
const sm = (a, b, x) => ease((x - a) / (b - a));
const yawTo = (from, to) => Math.atan2(to.x - from.x, to.z - from.z);
export const loc = (a, x, y, z) => V(x, y, z).applyAxisAngle(V(0, 1, 0), a.group.rotation.y);

for (const [k, v] of Object.entries({
  chambre_jour: { h: 1.1, horizon: 425, fov: 50 }, chambre_nuit: { h: 1.1, horizon: 425, fov: 50 }, terrasse: { h: 1.3, horizon: 400, fov: 50 },
  'ep05/galerie_jour': { h: 1.15, horizon: 471, fov: 45, light: { dir: [-2, 2.5, -1] } }, 'ep04/fenetre_fatma': { h: 1.2, horizon: 470, fov: 50 },
  patio_matin: { h: 1.4, horizon: 770, fov: 55 },
})) CAL[k] = v;

export async function timing(id) {
  const SC = (await (await fetch(new URL('../timing.json', import.meta.url))).json()).find(s => s.id === id);
  return { SC, L: SC.lines.map(l => [l.start - SC.start, l.start - SC.start + l.dur]) };
}
const { L } = await timing('s20_chant');

/** camera cuts: entries { t, on, z, hy, dx, dy } (a head-centred framing, zoom z, head at hy of the frame height) or { t, v: [x, y, zoom] } (explicit wide) */
export function cuts(entries, getSh) {
  const cover = entries.map(e => ({ t: e.t, size: e.v ? 'W' : e.z >= 2 ? 'CU' : 'M', on: e.on }));
  const view = (lt, u, t) => {
    let i = 0; for (let k = 0; k < entries.length; k++) if (t >= entries[k].t) i = k;
    const e = entries[i], t1 = entries[i + 1]?.t ?? e.t + 10, k = clamp((t - e.t) / (t1 - e.t));
    if (e.v) return [e.v[0], e.v[1], e.v[2] * (1 + .04 * k)];
    const sh = getSh(), j = sh.st.actors.findIndex(a => a.name === e.on), h = sh.heads[Math.max(0, j)], z = e.z * (1 + .05 * k);
    return [h[0] + (e.dx || 0), h[1] + (.5 - (e.hy ?? .42)) * K.H / z + (e.dy || 0), z];
  };
  return { cover, view };
}

/** hands gesturing at chest height while talking (k: 1 = right hand, 2 = both) */
export function talkHands(a, t, seed, k) {
  if (!k) return;
  const ch = IK.wpos(a.B.chest), w = Math.sin(t * 4.1 + seed), w2 = Math.sin(t * 3.1 + seed * 2);
  PO.reach(a, 'R', ch.clone().add(loc(a, -.28 - .06 * w, .02 + .1 * w2, .32 + .05 * w)), { grip: .02 });
  if (k > 1) PO.reach(a, 'L', ch.clone().add(loc(a, .28 + .06 * w2, .1 * w, .3)), { grip: .02 });
}
/** laughing: shoulders shaking, head thrown back (call before the arms are solved) */
export function laughBody(a, t, k, seed = 0) {
  if (!k) return;
  const B = a.B, s = Math.sin(t * 15 + seed);
  B.chest.rotation.x += .1 * k * s; B.spine.rotation.x += .05 * k * Math.sin(t * 15 + seed + 1);
  B.head.rotation.x -= .16 * k; B.head.rotation.z += .1 * k * Math.sin(t * 8 + seed);
  a.group.updateMatrixWorld(true);
}
/** mouth/eyes while laughing (used by the faces lists) */
export const laughFace = (k, t, seed = 0) => k > .05 ? { open: k * (.3 + .5 * Math.abs(Math.sin(t * 12 + seed))), lid: k * .55, sad: 0 } : null;

// =============================================================== the room: Zoubida stops chewing
const LIGHT_JOUR = { key: 0xffe0b0, keyI: 1.45, dir: [1.6, 3, 1], sky: 0xd8c0a0, ground: 0xc08850, fillI: 1.35, rim: 0xffd090, rimI: .45, rimDir: [2, 1.5, -2], shadow: .3, area: 3 };
const STOP = L[0][0] + 4.4;
let chCuts;
const chambre = shot({
  plate: 'chambre_jour', light: LIGHT_JOUR,
  async build(S3) {
    const M = {}, F = (x, y) => S3.floorAt(x, y), camP = S3.cam.position.clone().setY(0), tb = F(862, 747);
    const zou = await role('zoubida', { seat: true }), mo = await role('mohammed', { seat: true });
    const zAt = tb.clone().add(V(1.0, 0, .15)), mAt = tb.clone().add(V(-.95, 0, .2));
    S3.add(zou, zAt.x, zAt.z, yawTo(zAt, tb) * .55 + yawTo(zAt, camP) * .45); S3.add(mo, mAt.x, mAt.z, yawTo(mAt, tb) * .5 + yawTo(mAt, camP) * .5);
    M.zou = memoPose('s20zou', zou, [zAt], () => PO.crossLegged(zou, { seat: 0, lean: .12 }).map(e => +e.toFixed(3)));
    const zS = PO.snap(zou), zk = skirt(S3, zou, 0);
    M.mo = memoPose('s20mo', mo, [mAt], () => PO.crossLegged(mo, { seat: 0, lean: .12 }).map(e => +e.toFixed(3)));
    const mS = PO.snap(mo), mk = skirt(S3, mo, 0);
    return { actors: [zou, mo], M, zou, mo, zS, mS, win: V(zAt.x + 2.0, .85, zAt.z - 1.2),
      faces: [[zou, null, 2, (lt, t) => ({ open: t < STOP ? .12 + .3 * Math.abs(Math.sin(t * 7)) : 0 })], [mo, null, 5, (lt, t) => ({ open: t < STOP + 1.2 ? .1 + .25 * Math.abs(Math.sin(t * 6 + 1)) : 0 })]] };
  },
  frame(lt, u, t, S, st) {
    const { zou, mo } = st;
    PO.apply(zou, st.zS); PO.apply(mo, st.mS);
    const hear = sm(STOP, STOP + .7, t);
    zou.B.head.rotation.x += .14 * (1 - hear);   // looking down at the food, then up toward the song
    zou.B.spine.rotation.x -= .05 * hear; zou.group.updateMatrixWorld(true);
    PO.look(zou, st.win, .5 * hear);
    if (hear > .05) PO.reach(zou, 'R', IK.wpos(zou.B.head).add(loc(zou, -.15, -.02, .02)), { grip: .02 });   // hand cupped behind the ear
    PO.look(mo, IK.wpos(zou.B.head), .6 * sm(STOP + .5, STOP + 1.2, t)); breathe(zou, t, 1, 1); breathe(mo, t, 1, 2);
  },
  ...(chCuts = cuts([{ t: 0, v: [960, 540, 1.0] }, { t: 2.4, on: 'zoubida', z: 1.35, hy: .45, dx: -230 }, { t: STOP + .4, on: 'zoubida', z: 1.9, hy: .42, dx: -110 }], () => chambre)),
});

// =============================================================== the gallery: Zoubida calls out across the court
const GAL_LIGHT = { key: 0xffe0b0, keyI: 1.3, dir: [1.5, 2.5, -2], sky: 0xd0c4b0, ground: 0xc88a58, fillI: 1.6, rim: 0xffd090, rimI: .7, rimDir: [1.5, 2, -2], shadow: .3, area: 3 };
export function galShot(entries, act) {
  let me;
  const cu = cuts(entries, () => me), lau = { v: 0 };
  me = shot({
    plate: 'ep05/galerie_jour', light: GAL_LIGHT,
    async build(S3) {
      const zou = await role('zoubida'), p = S3.floorAt(1000, 905); p.y = 0;
      S3.add(zou, p.x, p.z, -.8);
      return { actors: [zou], zou, M: {}, lau, faces: [[zou, 'zoubida', 2, (lt, t) => laughFace(lau.v, t, 1)]] };
    },
    frame(lt, u, t, S, st) { galPose(st, t, act?.(t, st) || {}); },
    cover: cu.cover, view: cu.view,
  });
  return me;
}
/** o: { yaw, call (cupped hand at the mouth, leaning out), laugh, talk, look (world point) } */
export function galPose(st, t, o = {}) {
  const a = st.zou, B = a.B, { call = 0, laugh = 0, talk = 0, yaw = -1.3, look = null } = o;
  rest(B); idlePose(B, t, 1); a.group.rotation.y = yaw; st.lau.v = laugh;
  B.spine.rotation.x += .12 * call; B.head.rotation.x -= .1 * call; laughBody(a, t, laugh, 1); a.group.updateMatrixWorld(true);
  const hd = IK.wpos(B.head);
  if (call > .05) { PO.reach(a, 'R', hd.clone().add(loc(a, -.05, -.08, .17)), { grip: .02 }); PO.reach(a, 'L', hd.clone().add(loc(a, .1, -.2, .2)), { grip: .02 }); }
  else if (laugh > .05) PO.reach(a, 'R', hd.clone().add(loc(a, -.04, -.09, .13)), { grip: .02 });
  else talkHands(a, t, 1, talk);
  if (look) PO.look(a, look, .8);
  breathe(a, t, 1, 1);
}
const gal = galShot([{ t: L[2][0], on: 'zoubida', z: 1.5, hy: .38 }, { t: L[4][0], on: 'zoubida', z: 2.0, hy: .42, dx: -30 }, { t: L[6][0], on: 'zoubida', z: 2.5, hy: .42 }],
  (t, st) => ({
    call: t < L[3][0] ? sm(L[2][0], L[2][0] + .5, t) : 0, yaw: t < L[3][0] ? -.8 : t < L[5][0] ? -.5 : .2,
    look: t < L[3][0] ? V(-12, 2.2, -14) : null, laugh: t > L[6][0] + 2.2 ? .5 : 0,
    talk: t >= L[4][0] && t < L[5][0] ? 1 : t >= L[6][0] && t < L[6][1] ? 1 : 0,
  }));

// =============================================================== Fatma at her window
let fenCuts;
const fen = shot({
  plate: 'ep04/fenetre_fatma', light: { key: 0xffe0b0, keyI: 1.5, dir: [1.5, 2.5, 2], sky: 0xd0d4e8, ground: 0xb08a60, fillI: 1.5, rim: 0xffd090, rimI: .6, rimDir: [-2, 2, -3], shadow: .3, area: 3 },
  async build(S3) {
    const fat = await role('fatma'), p = S3.floorAt(1100, 840, .3); p.y = .3;
    S3.add(fat, p.x, p.z, .15);
    return { actors: [fat], fat, M: {}, lau: { v: 0 }, faces: [[fat, 'fatma', 3, (lt, t) => laughFace(fen.st.lau.v, t, 2)]] };
  },
  frame(lt, u, t, S, st) {
    const a = st.fat, B = a.B, laugh = t >= L[5][0] + 3.5 && t < L[5][1] ? .8 : 0;
    rest(B); idlePose(B, t, 1); st.lau.v = laugh; laughBody(a, t, laugh, 2); a.group.updateMatrixWorld(true);
    const sp = t >= L[3][0] && t < L[3][1] || t >= L[5][0] && t < L[5][1];
    if (laugh > .05) PO.reach(a, 'R', IK.wpos(B.head).add(loc(a, -.04, -.1, .13)), { grip: .02 }); else talkHands(a, t, 3, sp ? (t >= L[5][0] ? 2 : 1) : 0);
    PO.look(a, V(-3, 1.9, 2.5), .35); breathe(a, t, 1, 3);
  },
  ...(fenCuts = cuts([{ t: L[3][0], on: 'fatma', z: 1.5, hy: .4 }, { t: L[5][0], on: 'fatma', z: 1.9, hy: .42 }], () => fen)),
});

// =============================================================== the terrace: empty, the song drifts over it
let terImg = null;
const terrace = (lt, u, t) => {
  K.c.save(); cam(960 - 50 * u + 25, 540, 1.06 + .1 * u); drawPlate(terImg);
  K.dust(t, 22, 0, 150, 1920, 800, '#fff4d0', .45, 4); K.c.restore();
  return { vignette: .5, paper: .24 };
};

// =============================================================== the patio: balconies of patio_matin
export const RAIL = .92, H1 = 4.2, H2 = 7.3;
const BASE1 = [[1000, 585], [1090, 570], [1250, 550], [1400, 537], [1500, 525], [1600, 512], [1660, 505]], TOP1 = [[1000, 523], [1090, 510], [1250, 495], [1400, 470], [1500, 457], [1600, 447], [1660, 442]];
const BASE2 = [[1380, 280], [1450, 275], [1550, 267], [1620, 262]], TOP2 = [[1380, 222], [1450, 210], [1550, 195], [1620, 188]];
const itp = (P, x) => { for (let i = 0; i < P.length - 1; i++) if (x <= P[i + 1][0] || i === P.length - 2) return P[i][1] + (P[i + 1][1] - P[i][1]) * (x - P[i][0]) / (P[i + 1][0] - P[i][0]); };
const poly = (T, B, p0, p1) => [...T.map(([x, y]) => [x, y + p0]), ...B.slice().reverse().map(([x, y]) => [x, y + p1])];
const POLY1 = poly(TOP1, BASE1, -4, 32), POLY2 = poly(TOP2, BASE2, -4, 30);
export const PATIO_LIGHT = { key: 0xffe4b8, keyI: 1.4, dir: [-1.5, 3, 1.5], sky: 0xd6c6b0, ground: 0xd09858, fillI: 1.6, rim: 0xffd090, rimI: .5, rimDir: [-2, 1.5, -2], shadow: .32, area: 4 };

/** the patio with the women on the balconies. entries = camera cuts (see cuts), act(t, st) = per-frame options for patioPose */
export function patioShot(entries, act, { rug = true } = {}) {
  let me;
  const cu = cuts(entries, () => me), lau = {}, lid = {};
  me = shot({
    plate: 'patio_matin', light: PATIO_LIGHT,
    async build(S3) {
      const camP = S3.cam.position.clone().setY(0), F = (x, y) => S3.floorAt(x, y);
      const on = (x, B, H, dy) => { const p = S3.floorAt(x, itp(B, x) + dy, H); p.y = H; return p; };
      const zou = await role('zoubida'), moh = await role('mohammed'), fat = await role('fatma'), rah = await role('rahma'), kan = await role('kanza');
      const pz = on(1450, BASE1, H1, 10), pm = on(1370, BASE1, H1, 10), pf = on(1565, BASE1, H1, 10), pr = on(1500, BASE2, H2, 8);
      S3.add(zou, pz.x, pz.z, yawTo(pz, camP) + .08); S3.add(moh, pm.x, pm.z, yawTo(pm, camP) + .25); S3.add(fat, pf.x, pf.z, yawTo(pf, camP) - .2); S3.add(rah, pr.x, pr.z, yawTo(pr, camP) - .1);
      zou.group.position.y = fat.group.position.y = H1; moh.group.position.y = H1 + .24; rah.group.position.y = H2;
      const rc = F(640, 930), ke = V(rc.x - .65 - .45, 0, rc.z), from = F(1250, 900);
      S3.add(kan, ke.x, ke.z, Math.PI / 2);
      const rugA = S3.prop(PR.mat({ w: 1.3, d: .85, col: 0xa03a4c }), 0, 0, 0), rugB = S3.prop(PR.mat({ w: 1.05, d: .62, col: 0x294a78 }), 0, .006, 0);
      rugA.visible = rugB.visible = false;
      const opt = (name, who, seed) => (lt, t) => { const o = laughFace(lau[name] || 0, t, seed) || {}; const s = me.st.S;
        let open = Math.max(who && s ? mouth(s, who, t) : 0, name !== 'rahma' && s ? mouth(s, 'femmes', t) : 0); if (o.open) open = Math.max(open, o.open);
        return { open, lid: Math.max(o.lid || 0, lid[name] || 0), sad: 0 }; };
      const top = { zoubida: H1 + RAIL + .06, mohammed: H1 + RAIL + .06, fatma: H1 + RAIL + .06, rahma: H2 + RAIL + .06 };
      return { actors: [zou, moh, fat, rah, kan], zou, moh, fat, rah, kan, by: { zoubida: zou, mohammed: moh, fatma: fat, rahma: rah, kanza: kan }, top, base: { zoubida: H1, mohammed: H1 + .24, fatma: H1, rahma: H2 },
        lau, lid, rc, ke, from, rugA, rugB, M: {},
        faces: [[zou, 'zoubida', 2, opt('zoubida', 'zoubida', 1)], [moh, null, 5, opt('mohammed', null, 2)], [fat, 'fatma', 3, opt('fatma', 'fatma', 3)], [rah, 'rahma', 4, opt('rahma', 'rahma', 4)], [kan, null, 6, opt('kanza', null, 5)]] };
    },
    frame(lt, u, t, S, st) { st.S = S; patioPose(st, t, act?.(t, st) || {}); },
    over() { railing(me.img, POLY1); railing(me.img, POLY2); },
    cover: cu.cover, view: cu.view,
  });
  return me;
}
/** one woman on a balcony: hands on the rail top (or gesturing). p: { laugh, talk, look (actor name), bounce, heart, cheer, plead, doze } */
function perch(st, a, t, seed, p = {}) {
  const { laugh = 0, talk = 0, look = null, bounce = 0, heart = 0, cheer = 0, plead = 0, doze = 0 } = p, B = a.B, n = a.name;
  rest(B); idlePose(B, t + seed, 1);
  a.group.position.y = st.base[n] + bounce;
  st.lau[n] = laugh; st.lid[n] = Math.max(doze, 0);
  laughBody(a, t, laugh, seed);
  if (doze) { B.head.rotation.z += .35 * doze; B.head.rotation.x += .22 * doze; B.neck.rotation.z += .1 * doze; }
  a.group.updateMatrixWorld(true);
  const ch = IK.wpos(B.chest), top = st.top[n], on = (sx, fwd) => V(ch.x, top, ch.z).add(loc(a, sx, 0, fwd));
  let hl = on(.2, .3), hr = on(-.2, .3);
  if (talk) { const w = Math.sin(t * 5 + seed), w2 = Math.sin(t * 3.3 + seed); hr = hr.lerp(ch.clone().add(loc(a, -.3 - .08 * w, .1 + .1 * w2, .32)), talk); if (talk > 1) hl = hl.lerp(ch.clone().add(loc(a, .3 + .08 * w2, .05 + .1 * w, .3)), 1); }
  if (heart) hl = hl.lerp(ch.clone().add(loc(a, .08, 0, .15)), heart);
  if (cheer) { hl = hl.lerp(ch.clone().add(loc(a, .3, .4 + .12 * Math.sin(t * 10 + seed), .12)), cheer); hr = hr.lerp(ch.clone().add(loc(a, -.3, .4 + .12 * Math.sin(t * 10 + seed + 2), .12)), cheer); }
  if (plead) { hl = hl.lerp(ch.clone().add(loc(a, .05, .14 + .02 * Math.sin(t * 6 + seed), .28)), plead); hr = hr.lerp(ch.clone().add(loc(a, -.05, .14 + .02 * Math.sin(t * 6 + seed), .28)), plead); }
  if (laugh > .4 && !cheer && !plead && !talk) hr = hr.lerp(IK.wpos(B.head).add(loc(a, -.04, -.1, .13)), .8);   // hand to the mouth
  PO.reach(a, 'L', hl, { grip: .02 }); PO.reach(a, 'R', hr, { grip: .02 });
  if (look && st.by[look]) PO.look(a, IK.wpos(st.by[look].B.head), .6);
  breathe(a, t, 1, seed);
}
/** Kanza on the ground: idle at the rug's left end; k = { walk: t0 (enters from the door at the right), spread: t0 (unrolls the rug over 3.2 s), done (rug already down), laugh, look } */
function kanzaPose(st, t, k = {}) {
  const a = st.kan, B = a.B, ke = st.ke;
  let moving = false;
  if (k.walk != null) {
    a.group.position.set(st.from.x, 0, st.from.z);
    const r = travel(a, [[st.from.x, st.from.z], [ke.x, ke.z]], t, { t0: k.walk, speed: 1.0 }); moving = r.moving;
    if (r.done) a.group.rotation.y = Math.PI / 2; else if (!r.moving) a.group.rotation.y = yawTo(st.from, ke);
  } else { rest(B); a.group.rotation.y = Math.PI / 2; }
  const s = k.done ? 1 : k.spread != null ? clamp((t - k.spread) / 3.2) : 0;
  const bend = k.spread != null && !k.done ? sm(0, .12, s) * (1 - sm(.88, 1, s)) * (s > 0 && s < 1 ? 1 : 0) : 0;
  const ph = a.group.rotation.y;
  if (!moving) idlePose(B, t, 1);
  st.rugA.visible = st.rugB.visible = s > .01;
  const sc = Math.max(.05, ease(s)), x0 = st.rc.x - .65;
  for (const [r, w] of [[st.rugA, 1.3], [st.rugB, 1.05]]) { r.scale.x = sc; r.position.set(x0 + (r === st.rugB ? .125 * sc : 0) + w * sc / 2, r === st.rugB ? .006 : 0, st.rc.z); }
  st.lau.kanza = k.laugh || 0;
  B.spine.rotation.x += .75 * bend; B.chest.rotation.x += .25 * bend; laughBody(a, t, k.laugh || 0, 4); a.group.updateMatrixWorld(true);
  if (bend > .05) {
    const fx = x0 + .12 + .5 * ease(s);
    PO.reach(a, 'L', V(fx, .05, st.rc.z + .2), { grip: .02 }); PO.reach(a, 'R', V(fx, .05, st.rc.z - .2), { grip: .02 });
  }
  if (k.look && st.by[k.look]) PO.look(a, IK.wpos(st.by[k.look].B.head), .7);
  breathe(a, t, 1, 5);
}
/** o: { zoubida, mohammed, fatma, rahma: perch options, kanza: kanzaPose options } */
export function patioPose(st, t, o = {}) {
  perch(st, st.zou, t, 1, o.zoubida); perch(st, st.moh, t, 2, o.mohammed); perch(st, st.fat, t, 3, o.fatma); perch(st, st.rah, t, 4, o.rahma);
  kanzaPose(st, t, o.kanza);
}

const T7 = L[7][0], T8 = L[8][0], T9 = L[9][0];
const patio = patioShot([{ t: T7, v: [1300, 430, 1.5] }, { t: T8, on: 'rahma', z: 3.0, hy: .46, dy: 20 }, { t: T9 - .2, v: [1150, 480, 1.45] }],
  (t) => {
    const lg = t < T8 ? sm(T7, T7 + .6, t) : t < T9 ? .45 : 0, beg = t >= T9 ? sm(T9, T9 + .4, t) : 0;
    return {
      zoubida: { laugh: beg ? 0 : lg, plead: beg, look: 'rahma' }, mohammed: { laugh: beg ? 0 : lg, plead: beg * .6, look: 'rahma' },
      fatma: { laugh: beg ? 0 : lg, plead: beg, look: 'rahma' }, rahma: { talk: t >= T8 && t < T9 ? 1 : 0, laugh: t < T8 ? lg : 0, look: 'zoubida' },
      kanza: { laugh: t < T8 ? lg : 0, look: 'rahma' },
    };
  });

window.__s20 = { chambre, gal, fen, patio };
export { L };
export default make({
  preload: all(chambre, gal, fen, patio, async () => { terImg = await plate('terrasse'); }), plate: 'terrasse',
  segs: [ac([0, 0], chambre.fn), ac([1, 0], terrace), ac([2, 0], gal.fn), ac([3, 0], fen.fn), ac([4, 0], gal.fn), ac([5, 0], fen.fn), ac([6, 0], gal.fn), ac([7, 0], patio.fn)],
});
