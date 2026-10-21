// s06: the patio. Fatma Bziouya scales sardines on her stool over the painted basin; she lays the knife down, wipes her
// hands on the cloth on her knee and waits. Zoubida, on the other stool, leans in and whispers into her ear, then
// tells the rest with big gestures; Fatma nods, sighs, "Allah ! Allah !".
// Contacts (solved in build, numbers in sh.st.M): both women on the painted stools (stool()), the sardine held by the
// tail in Fatma's left palm, the knife tip on the fish (tip error), palms on the cloth, Zoubida's mouth at Fatma's ear.
import * as THREE from 'three';
import * as K from '../../../engine/core.js';
import { cast } from '../../../engine/stage3d.js';
import * as PR from '../../../engine/props3d.js';
import * as PO from '../../../engine/poses.js';
import * as IK from '../../../engine/ik.js';
import { make, ac } from './_pt.js';
import { shot, all, breathe, blend, V, memo, memoPose } from './_3d.js';
const { clamp, ease, lerp, key, noise } = K;
const sm = (a, b, x) => ease((x - a) / (b - a));

/** local (actor frame, x = her left, z = forward) direction -> world */
const dirW = (a, x, y, z) => V(x, y, z).normalize().applyAxisAngle(V(0, 1, 0), a.group.rotation.y);

function knife() {
  const g = new THREE.Group();
  const blade = new THREE.Mesh(new THREE.BoxGeometry(.004, .017, .11), PR.toon(0xc8ccd0)); blade.position.z = .1;
  const handle = new THREE.Mesh(new THREE.BoxGeometry(.017, .021, .09), PR.toon(0x4a2a18)); handle.position.z = 0;
  g.add(blade, handle); g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  g.userData.tip = .155; return g;    // origin = middle of the handle (in the fist), +z = toward the tip
}
function cloth() {
  const g = new THREE.Mesh(new THREE.BoxGeometry(.2, .008, .15), PR.toon(0xd8d0c0)); g.castShadow = true;
  const st = new THREE.Mesh(new THREE.BoxGeometry(.2, .009, .02), PR.toon(0x3a5a9a)); st.position.z = .04; g.add(st);
  return g;
}
/** point an object's +z along dir */
const aimZ = (o, dir) => o.quaternion.setFromUnitVectors(V(0, 0, 1), dir.clone().normalize());

const sh = shot({
  plate: 'patio_vide',
  // the stools stand in the shade under the gallery; the sun patch on the floor in front bounces warm light up
  light: { key: 0xffe0b0, keyI: 1.05, dir: [-1.2, 3, 2.6], sky: 0xd6c6b0, ground: 0xd09858, fillI: 1.75, rim: 0xffd090, rimI: .5, rimDir: [-2, 1.5, -2], shadow: .3, soft: 6, area: 2.2 },
  async build(S3, cal) {
    const M = {};
    // plate patio_vide = patio_poisson with the painted stools + basin removed: the 3D stools stand where the scene needs
    // them (Fatma's on the painted spot, Zoubida's 50 cm to her screen right and 22 cm deeper: leaning to Fatma's far ear
    // her face then turns toward the camera in 3/4 instead of showing the back of her head)
    const s1 = S3.floorAt(...cal.stools[0]), s2 = s1.clone().add(V(.5, 0, -.22));
    for (const p of [s1, s2]) S3.prop(PR.rushStool({ h: cal.stool.h, w: cal.stool.w }), p.x, 0, p.z);
    const fat = await cast('fatma', { seat: true }), zou = await cast('zoubida', { seat: true });
    // open 3/4 to the camera, each turned toward the other; the basin on the floor in front of Fatma's knees (in view:
    // the painted basin between the stools is hidden by the knees at this eye height, so the 3D one comes forward)
    const yF = .4, yZ = -1.1;   // Fatma open 3/4 to the camera, Zoubida turned to her (a forward lean then goes to the ear)
    S3.add(fat, s1.x, s1.z, yF); S3.add(zou, s2.x, s2.z, yZ);
    // basin at her right-front, OUTSIDE the robe silhouette: between the feet the hanging skirt hides fish, knife and hands
    const pb = s1.clone().addScaledVector(dirW(fat, -.75, 0, .66), .4); pb.y = 0;
    const bowl = S3.prop(PR.bowl({ fish: 7, col: 0x8a4a22, glaze: 0xb06a32 }), pb.x, 0, pb.z);
    M.stoolGap = +s1.distanceTo(s2).toFixed(3); M.bowlFromFatma = +s1.distanceTo(pb).toFixed(3);

    // --- Fatma: on the stool leaning over the basin; lap pose recorded for the hand targets
    // slow solves are memoized on their inputs (_3d.js memo): a reload re-solves only what an edit touched
    const dF = [s1, yF, cal.stool.h, .52];
    M.fatSeat = memoPose('fStool', fat, dF, () => PO.stool(fat, { seat: cal.stool.h, lean: .52, hands: true }).err);
    const lapF = memo('lapF', dF, () => lapOn(fat));
    let fBase = PO.snap(fat);
    // cloth on the left knee: on the top of the thigh robe, a third of the way from the knee to the hip
    const knee = IK.wpos(fat.B.shinL), hipF = IK.wpos(fat.B.thighL), clothAt = knee.clone().lerp(hipF, .3);
    clothAt.y = memo('clothY', [dF, clothAt], () => robeTop(fat, clothAt)) + .004;
    const kRest = memo('kRest', [dF, clothAt], () => knifeRest(fat, clothAt, dirW(fat, 1, 0, 0)));
    const cl = S3.prop(cloth(), clothAt.x, clothAt.y, clothAt.z, yF + .2);
    // working point: the sardine over the basin, 36 cm above its rim (just above the knee line, in clear view)
    const rim = bowl.localToWorld(bowl.userData.rim.clone()), toF = s1.clone().sub(pb).setY(0).normalize();
    const work = pb.clone().addScaledVector(toF, -.03); work.y = rim.y + .36;   // over the centre, a hair outward: clear of the robe's side
    const fish = S3.prop(PR.sardine(), work.x, work.y, work.z), kn = S3.prop(knife(), 0, 0, 0);
    // where the knife and the fish end up: in the basin (fish on the others, knife across the far rim)
    // she turns her shoulders toward the basin (it is at her right): twist searched for the closest left-hand reach to the
    // fish hold point (her left arm crosses her body); the stroke then follows wherever the fish really is (frame)
    { const hold = work.clone().addScaledVector(dirW(fat, -1, -.15, .35), -.055); const bt = memo('twist', [dF, work], () => { let bt = [9, 0];
      for (let tw = -.6; tw <= .61; tw += .1) { PO.apply(fat, fBase); fat.B.spine.rotation.y += tw * .5; fat.B.chest.rotation.y += tw * .5; fat.group.updateMatrixWorld(true);
        const e = PO.reach(fat, 'L', hold, { grip: .05 }) + .01 * Math.abs(tw); if (e < bt[0]) bt = [e, tw]; }
      return bt; });
      PO.apply(fat, fBase); fat.B.spine.rotation.y += bt[1] * .5; fat.B.chest.rotation.y += bt[1] * .5; fat.group.updateMatrixWorld(true);
      M.fatTwist = +bt[1].toFixed(2); M.holdReach = +PO.reach(fat, 'L', hold, { grip: .05 }).toFixed(3);
      lapHandsKeep(fat, lapF); fBase = PO.snap(fat); }
    const fishDown = bowl.localToWorld(V(.03, .05, -.02)), knDown = bowl.localToWorld(V(-.02, bowl.userData.h + .006, -.04));

    // --- Zoubida upright on her stool; the hushed talk = both women lean in. The painted stools hold the hips 0.9 m apart:
    // the closest a seated mouth gets to the ear is ~0.5 m (measured), so no ear-whisper: a conspiratorial lean + a hand
    // shielding the mouth, which is what the text says ("à voix basse")
    const dZ = [s2, yZ, cal.stool.h, .15];
    memoPose('zStool', zou, dZ, () => { PO.stool(zou, { seat: cal.stool.h, lean: .15, hands: true }); }); const zBase = PO.snap(zou);
    const lapZ = memo('lapZ', dZ, () => lapOn(zou));
    const sc = a => a.group.scale.y;
    // face points in head-local spec units, the same ones faceFX draws from (stage3d anchors): mouth from the spec, the
    // ear on the side of the skull, level with the eye and one head-radius behind it
    const fp = (a, p) => a.B.head.localToWorld(V(p[0], p[1] - a.S.head, p[2]));
    const hr = a => (a.S.headR ?? .09) * (a.S.top - a.S.bottom);
    const earOf = () => {   // the ear on Zoubida's side (spec eyeL/eyeR are screen-left/right eyes: pick the side by distance)
      const r = hr(fat), z = IK.wpos(zou.B.head), es = [fat.S.face.eyeL, fat.S.face.eyeR].map(e => fp(fat, [e[0] + Math.sign(e[0]) * r * .55, e[1] - r * .1, e[2] - r * 1.05]));
      return es[0].distanceTo(z) < es[1].distanceTo(z) ? es[0] : es[1]; };
    const mouthOf = () => fp(zou, zou.S.face.mouth);
    // Fatma tilts toward Zoubida (side sign picked by measurement), back straighter
    // a listener doesn't face the whisperer: eyes down-ahead (1.2 m in front, on the floor), the ear turned to Zoubida
    const hush = s1.clone().addScaledVector(dirW(fat, -.25, 0, 1), 1.2);
    const fTilt = side => { PO.apply(fat, fBase); fat.B.spine.rotation.x -= .32; fat.B.spine.rotation.z += side; fat.B.chest.rotation.z += side * .6; fat.group.updateMatrixWorld(true); PO.look(fat, hush, .6); };
    const best = memo('tilt', [dF, dZ, M.fatTwist, hush], () => { let best = [9, 0];
      for (const sd of [-.3, -.24, -.18, -.12, -.06, .06, .12, .18, .24, .3]) { fTilt(sd); const d = earOf().distanceTo(IK.wpos(zou.B.head)); if (d < best[0]) best = [d, sd]; }
      return best; });
    fTilt(best[1]); const fListen = PO.snap(fat), ear = earOf(); M.fatTilt = best[1];
    // Zoubida: twist + forward lean + side lean, grid search for the closest mouth-to-ear (small penalty on big angles)
    const zPose = (tw, ln, sd) => { PO.apply(zou, zBase); const B = zou.B;
      B.spine.rotation.y += tw * .5; B.chest.rotation.y += tw * .5; B.spine.rotation.x += ln * .6; B.chest.rotation.x += ln * .4; B.spine.rotation.z += sd; B.chest.rotation.z += sd * .5;
      zou.group.updateMatrixWorld(true); PO.look(zou, ear, .9); };
    const zb = memo('whisper', [dF, dZ, M.fatTwist, best], () => { let zb = null;
    for (let tw = -.6; tw <= .61; tw += .15) for (let ln = 0; ln <= 1.11; ln += .1) for (let sd = -.25; sd <= .26; sd += .05) {
      zPose(tw, ln, sd); const d = mouthOf().distanceTo(ear), dy = Math.abs(mouthOf().y - ear.y), cost = (d > .18 ? 10 * d : 0) + 2 * dy + .1 * (ln + Math.abs(sd) + Math.abs(tw) * .5);   // mouth level with the ear, not at the jaw
      if (!zb || cost < zb.cost) zb = { cost, d, tw, ln, sd };
    }
    return zb; });
    zPose(zb.tw, zb.ln, zb.sd);
    M.whisper = { twist: +zb.tw.toFixed(2), lean: +zb.ln.toFixed(2), side: +zb.sd.toFixed(2), mouthToEar: +zb.d.toFixed(3) };
    M.zouSeatAfterLean = +PO.lowestOf(zou, ['root']).toFixed(3);
    const zWhisper = PO.snap(zou), cup = mouthOf().addScaledVector(ear.clone().sub(mouthOf()).normalize(), .07).add(V(0, -.01, 0));   // the hand shielding her mouth, 7 cm out toward Fatma
    PO.apply(zou, zBase); PO.apply(fat, fBase);
    return { camPos: S3.cam.position.clone(), actors: [fat, zou], faces: [[fat, 'fatma', 3], [zou, 'zoubida', 7]], M, fat, zou, fBase, fListen, zBase, zWhisper, lapF, lapZ, work, fish, kn, fishDown, knDown, clothAt, kRest, cup, ear, bowl, mouthOf };
  },
  frame(lt, u, t, S, st) {
    const { fat, zou, M } = st, [a0, b0] = S.L(0), [a1, b1] = S.L(1), [a2, b2] = S.L(2), [a3, b3] = S.L(3), [a4, b4] = S.L(4);
    const f0 = (t - a0) / (b0 - a0), d2 = (t - a2) / (b2 - a2);
    // ---------------- Fatma
    const listen = clamp(sm(a1 - .6, a1 + .4, t) - sm(b2 - 1, b2, t) * .6);
    blend(fat, st.fBase, st.fListen, listen);
    const k = fat.group.scale.y / 1.6, kF = st.fat.group.rotation.y;
    const ax = dirW(fat, -1, -.15, .35);              // the fish lies from her left hand toward her right, head end out
    const kd = dirW(fat, .15, -.55, .8);              // knife direction, from the fist down-forward to the fish
    // beats on f0 (line 0): scaling until .42; the hands settle 2 cm (.42-.5: her arms are already near full reach over the basin,
    // measured: a deeper sink misses by 6-13 cm) and let go at .5: the fish drops into the basin in free fall (t = sqrt(2h/g));
    // "Elle posa son couteau": the right hand carries the knife to the torchon and lays it flat there (.5-.58); then both hands to the cloth (.53-.62), rub, lap (.86-.93)
    let hl, hr; const holding = f0 < .5, tip = st.kn.userData.tip;
    const low = sm(.42, .5, f0), put = sm(.5, .58, f0), toCloth = sm(.58, .66, f0), toLap = sm(.86, .93, f0), amp = 1 - low;
    const fishC = st.work.clone().add(V(0, -.02 * low, 0));
    hl = fishC.clone().addScaledVector(ax, -.055);
    // the stroke: knife tip runs tail -> head along the fish, lifts and comes back (2.2 strokes/s), dies out as she lowers
    const ph = (t * 2.2) % 1, s = (ph < .7 ? lerp(-.05, .05, ph / .7) : lerp(.05, -.05, (ph - .7) / .3)) * amp, lift = (ph < .7 ? 0 : Math.sin((ph - .7) / .3 * Math.PI) * .025) * amp;
    hr = fishC.clone().addScaledVector(kd, -tip);
    if (!holding) {
      // wipe both hands on the cloth: palms on the cloth top, rubbing 3 cm each side, then back to the lap
      const rub = Math.sin(t * 7) * .03, side = dirW(fat, 1, 0, 0), top = st.clothAt.clone().add(V(0, .03, 0));
      const cL = top.clone().addScaledVector(side, .03 + rub), cR = top.clone().addScaledVector(side, -.03 - rub);
      hl = hl.lerp(cL, toCloth).lerp(st.lapF.L, toLap); hr = hr.lerp(st.kRest.grip, put).lerp(cR, toCloth).lerp(st.lapF.R, toLap);
    }
    if (t > b0) { hl = st.lapF.L.clone(); hr = st.lapF.R.clone(); }
    // "Allah ! Allah !": hands lift off the lap, palms up, then settle
    const al = clamp(sm(a3 - .2, a3 + .5, t) - sm(b3 - .6, b3 + .2, t));
    if (al > 0) { const up = V(0, .14 * al, 0).addScaledVector(dirW(fat, 0, 0, 1), .06 * al); hl.add(up); hr.add(up.clone()); }
    const eL = PO.reach(fat, 'L', hl, { grip: .05 }), pl = PO.handPts(fat, 'L').palm;
    // the stroke runs on the fish where the left hand really holds it (a reach a few mm short moves the fish, not the knife off it)
    const fishAt = pl.clone().addScaledVector(ax, .055), contact = fishAt.clone().addScaledVector(ax, s).add(V(0, .009 + lift, 0));
    if (holding) hr = contact.clone().addScaledVector(kd, -tip);
    M.reachF = [eL, PO.reach(fat, 'R', hr, { grip: .05 })].map(e => +e.toFixed(3));
    // props follow the hands, then fall from the release pose (fixed: the hands' targets at low = 1) into the basin
    const pr = PO.handPts(fat, 'R').palm;
    if (holding) {
      st.fish.position.copy(fishAt); aimZ(st.fish, ax);
      // the knife is placed from its TIP (on the fish skin); the handle then slides at most a few cm in the fist
      const kdir = contact.clone().sub(pr).normalize(); st.kn.position.copy(contact).addScaledVector(kdir, -tip); aimZ(st.kn, kdir);
      M.knifeHandleInFist = +st.kn.position.distanceTo(pr).toFixed(3); M.fishInPalm = +pl.distanceTo(fishAt.clone().addScaledVector(ax, -.055)).toFixed(3);
    } else {
      const fRel = st.work.clone().add(V(0, -.02, 0)), g = clamp((f0 - .5) * (b0 - a0) / Math.sqrt(2 * Math.max(.05, fRel.y - st.fishDown.y) / 9.8)) ** 2;
      st.fish.position.copy(fRel.lerp(st.fishDown, g)); aimZ(st.fish, ax.clone().lerp(ax.clone().setY(0).normalize(), g));
      // the knife rides in the fist until it lies on the cloth, then stays there (handle where the palm let go)
      if (put < 1) { st.kn.position.copy(pr); aimZ(st.kn, kd.clone().lerp(st.kRest.dir, put).normalize()); }
      else { st.kn.position.copy(st.kRest.at); aimZ(st.kn, st.kRest.dir); }
      M.knifeOnCloth = +(st.kn.position.y - st.kRest.top).toFixed(3);
    }
    // head: on the fish while she works, on Zoubida while she listens; nods (L2 second half), "Allah" shakes (L3)
    if (t < b0 * .98 && listen < .1) PO.look(fat, f0 < .55 ? fishC : t < b0 ? st.clothAt.clone().lerp(st.camPos, .25) : IK.wpos(zou.B.head), f0 < .55 ? .8 : .5);   // a glance down at the cloth, the face stays readable
    const nod = sm(a2 + (b2 - a2) * .5, a2 + (b2 - a2) * .55, t) * (1 - sm(b2 - .3, b2, t));
    fat.B.head.rotation.x += Math.max(0, Math.sin(t * 3.2)) * .16 * nod;
    fat.B.head.rotation.y += Math.sin(t * 5) * .14 * clamp(sm(a3, a3 + .3, t) - sm(b3 - .3, b3, t));
    breathe(fat, t, 1, 1.3);
    // ---------------- Zoubida
    const lean = clamp(sm(a1 - .3, a1 + .9, t) * .55 + sm(a2 - .2, a2 + 1, t) * .45 - sm(a2 + (b2 - a2) * .5, a2 + (b2 - a2) * .57, t) * .75 - sm(a4 - .2, a4 + .5, t) * .25);
    blend(zou, st.zBase, st.zWhisper, lean);
    const zk = zou.group.scale.y / 1.6;
    let zl = st.lapZ.L.clone(), zr = st.lapZ.R.clone();
    // whisper: left hand cupped by her mouth, toward the ear (only while fully leaning)
    const cupK = clamp(sm(a2 - .2, a2 + .8, t) - sm(a2 + (b2 - a2) * .46, a2 + (b2 - a2) * .52, t));
    if (cupK > 0 && false) zl.lerp(st.mouthOf().addScaledVector(st.ear.clone().sub(st.mouthOf()).normalize(), .05).addScaledVector(awayCam(zou, st.camPos), .03).add(V(0, -.015, 0)), cupK);   // palm beside the mouth, on the far side (the face stays readable)
    // the big gestures: both arms out in slow arcs in front of the chest (second half of L2), the raised index (L4); they open
    // toward the camera side of her body (straight forward they'd go into Fatma and read as nothing)
    const gK = clamp(sm(a2 + (b2 - a2) * .55, a2 + (b2 - a2) * .6, t) - sm(b2 - .4, b2, t));
    if (gK > 0) {
      const c0 = IK.wpos(zou.B.chest), fw = openFw(zou, st.camPos), sd = V(0, 1, 0).cross(fw).normalize(), w1 = noise(t * .9, 4), w2 = noise(t * .9, 9);
      zl.lerp(c0.clone().addScaledVector(fw, .32).addScaledVector(sd, .22 + .18 * w1).add(V(0, .02 + .1 * w2, 0)), gK);   // chest to shoulder height: never in front of the face
      zr.lerp(c0.clone().addScaledVector(fw, .32).addScaledVector(sd, -.22 - .18 * w2).add(V(0, 0 + .1 * w1, 0)), gK);
    }
    const idx = clamp(sm(a4 + (b4 - a4) * .5, a4 + (b4 - a4) * .56, t) - sm(b4 - .5, b4, t));
    if (idx > 0) zr.lerp(IK.wpos(zou.B.head).addScaledVector(openFw(zou, st.camPos), .3).add(V(0, -.02, 0)), idx);
    M.reachZ = [PO.reach(zou, 'L', zl, { grip: .05 }), PO.reach(zou, 'R', zr, { grip: .05 })].map(e => +e.toFixed(3));
    if (lean < .05) PO.look(zou, t < a1 ? st.fish.position : IK.wpos(fat.B.head), .7);
    // sighs: shoulders rise and fall, matched on both (the narrator: "aux soupirs par des soupirs")
    const sigh = Math.max(0, Math.sin((t - a2) * 1.1)) ** 3 * clamp(sm(a2, a2 + 1, t) - sm(b2 - 1, b2, t));
    for (const a of [fat, zou]) { a.B.chest.rotation.x -= sigh * .05; a.B.chest.updateWorldMatrix(false, true); }
    breathe(zou, t, 1, .2);
  },
  // framing: wide, then the two-shot, closer on Fatma's hands while she scales, back to the pair for the whisper
  view(lt, u, t) {
    return [key(t, [[0, 960], [6, 1000], [9, 950], [20, 1050], [40, 1050], [52, 1030]]), key(t, [[0, 560], [6, 600], [9, 620], [20, 590]]), key(t, [[0, 1.08], [6, 1.45], [9, 1.7], [12, 1.7], [15, 1.5], [24, 1.62], [40, 1.62], [44, 1.5]])];
  },
});

/** palms resting on the thighs: 80 % of the way hip -> knee, 3.5 cm above the robe top (the palm centre sits above the skin) */
function lapOn(a) {
  const o = {};
  for (const s of ['L', 'R']) { const p = IK.wpos(a.B['thigh' + s]).lerp(IK.wpos(a.B['shin' + s]), .8);   // near the knee: forearm flatter, palm down (not fingers up)
    p.y = robeTop(a, p) + .035; o[s] = p;
  }
  return o;
}
/** where the knife is laid: flat on the torchon, 9 cm to her right of its centre, blade pointing forward-out;
 *  grip = palm target holding the handle 1.5 cm above the cloth top */
function knifeRest(a, clothAt, side) {
  const at = clothAt.clone().addScaledVector(side, -.09), top = robeTop(a, at) + .012;   // cloth thickness
  at.y = top + .008;
  const dir = dirW(a, -.5, 0, 1).setY(0).normalize();
  return { at, top, dir, grip: at.clone().add(V(0, .015, 0)) };
}
/** hands back on the lap targets after a body change (both arms re-solved) */
function lapHandsKeep(a, lap) { PO.reach(a, 'L', lap.L, { grip: .05 }); PO.reach(a, 'R', lap.R, { grip: .05 }); }
/** robe surface above a point of the thigh line: raycast down through the skin with both arms lifted out of the way
 *  (the djellaba is bulky: its top is 16-20 cm above the bone line, measured) */
function robeTop(a, p) {
  const sv = ['upperArmL', 'upperArmR'].map(b => [b, a.B[b].quaternion.clone()]);
  a.B.upperArmL.rotation.set(0, 0, 2.6); a.B.upperArmR.rotation.set(0, 0, -2.6); a.group.updateMatrixWorld(true);
  const ms = []; a.group.traverse(o => o.isSkinnedMesh && ms.push(o));
  const hit = new THREE.Raycaster(V(p.x, p.y + .4, p.z), V(0, -1, 0), 0, .8).intersectObjects(ms, false).find(h => h.point.y < p.y + .3);
  for (const [b, q] of sv) a.B[b].quaternion.copy(q); a.group.updateMatrixWorld(true);
  return hit ? hit.point.y : p.y + .15;
}
/** horizontal direction between the actor's forward and the camera (70 % camera): where gestures stay readable */
function openFw(a, cp) { const h = IK.wpos(a.B.chest), c = cp.clone().sub(h).setY(0).normalize(); return dirW(a, 0, 0, 1).setY(0).normalize().lerp(c, .7).normalize(); }
/** actor-side direction pointing away from the camera */
function awayCam(a, cp) { const sd = dirW(a, 1, 0, 0); return sd.dot(cp.clone().sub(IK.wpos(a.B.head))) > 0 ? sd.negate() : sd; }

/** highest vertex of a bone's skin within 6 cm (xz) of a point and < up m above it (p on the bone line): the robe top over the thigh */
function topNear(a, bone, p, up = .13) {
  let y = -9; const v = new THREE.Vector3(), idx = a.B[bone].userData.index;
  a.group.traverse(o => {
    if (!o.isSkinnedMesh) return;
    const pos = o.geometry.attributes.position, si = o.geometry.attributes.skinIndex, sw = o.geometry.attributes.skinWeight;
    const bi = o.skeleton.bones.indexOf(a.B[bone]);
    for (let i = 0; i < pos.count; i += 3) {
      let w = 0; for (let j = 0; j < 4; j++) if (si.getComponent(i, j) === bi) w += sw.getComponent(i, j);
      if (w < .3) continue;
      o.getVertexPosition(i, v); o.localToWorld(v);
      if (Math.hypot(v.x - p.x, v.z - p.z) < .06 && v.y < p.y + up) y = Math.max(y, v.y);   // the robe bulk higher up (the lap drape) doesn't count
    }
  });
  return y > -9 ? y : p.y;
}

window.__s06 = sh;
export default make({ preload: all(sh), plate: 'ep05/patio_vide', segs: [ac([0, 0], sh.fn)] });
