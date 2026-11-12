// s03 flies and bedbugs. b004 painting (summer heat). b005–b009 one bedroom shot (chambre_jour), Zoubida alone at war:
// b005 squints up at the cedar beams (insert: bedbugs), b006 the enumeration "chaux vive, soufre, pétrole" = three inserts
// cut on the words (enum.json), b007 talisman over the door (reach up toward the door, left) then a pinch of powder blown
// (inserts on "talismans" / "poudres"), b008 peering up at the beams (insert: survivors), b009 whipping a dish cloth, flies out.
import * as PO from '../../../engine/poses.js';
import { staged, THREE } from '../lib/autostage.js';
import { beatScene, lines, sm, front, at, V, heightAt, yawTo } from '../lib/beatscene.js';
import { walk } from '../lib/acts.js';
import { rest } from '../../../engine/rig3d.js';

const ID = 's03_mouches', L = lines(ID), B = i => L[i] || [0, 0];
const IN = (i, t) => t >= B(i)[0] - .2 && t < B(i)[1] + .2;
const beams = [980, 700, 2.55];   // Argon r6: a near, high target cranked the head back 90° → a deeper beam, lower angle

// b007 reaches a fixed point on the painted doorway, b008 steps back into the room, and b009
// walks toward the right window before three broad overhand swats and a held cloth follow-through.
const ch = staged('chambre_jour', {
  zoubida: { at: [960, 985], face: [640, 1080], seed: 7, lookMax: t => IN(1, t) || IN(4, t) ? .32 : IN(5, t) ? .3 : .7,   // up-looks: eyes + head, a chest arch does the rest
    lids: t => IN(1, t) || IN(4, t) ? .9 : 0,   // Argon r5: squint up at the beams (r7: this sat inside a comment → never ran)
    walk: { to: [380, 950], t0: B(3)[0] - 2.4, t1: B(3)[0] - .2 }, // on the doorway threshold before the talisman
    look: t => IN(1, t) ? beams : IN(4, t) ? beams : IN(3, t) && t < B(3)[0] + .5 * (B(3)[1] - B(3)[0]) ? [280, 960, 1.72] : IN(5, t) ? [1450, 760, 1.5] : null },
}, {
  act(lt, t, S, st, S3) {
    const zo = st.A.zoubida, k = zo.group.scale.y / 1.6;
    // Autostage restores its original walk each frame: these later walks must also hold their END marks.
    if (t >= B(5)[0] - 1.6) {
      rest(zo.B); walk(zo, S3.floorAt(440, 900), S3.floorAt(1060, 950), B(5)[0] - 1.6, B(5)[0] + .15, t);
    } else if (t >= B(4)[0] - .4) {
      rest(zo.B); walk(zo, S3.floorAt(380, 950), S3.floorAt(440, 900), B(4)[0] - .4, B(4)[0] + 1.3, t);
    }
    const turn = sm(B(4)[0] - 1.4, B(4)[0] + .4, t);
    if (turn > 0 && t < B(5)[0] - .2) {
      const g = zo.group.position, y1 = yawTo(g, S3.cam.position) - .4, y0 = zo.group.rotation.y;
      zo.group.rotation.y += Math.atan2(Math.sin(y1 - y0), Math.cos(y1 - y0)) * turn;
      zo.group.updateMatrixWorld(true);
    }
    const upLook = Math.max(IN(1, t) ? sm(B(1)[0] - .2, B(1)[0] + .4, t) : 0,
      IN(4, t) ? sm(B(4)[0] - .2, B(4)[0] + .4, t) : 0);
    if (upLook > 0) {
      // Share the upward tilt with the chest; the gaze solver supplies the small remaining neck turn.
      zo.B.spine.rotation.x -= .1 * upLook; zo.B.chest.rotation.x -= .16 * upLook;
      zo.B.neck.rotation.x -= .04 * upLook; zo.B.head.rotation.x -= .025 * upLook;
      zo.B.head.rotation.y += .08 * upLook * Math.sin(t * .9); zo.B.spine.updateWorldMatrix(false, true);
    }
    if (IN(4, t)) {
      const shift = .025 * Math.sin((t - B(4)[0]) * 1.3);
      zo.group.position.add(front(zo, 'root', 0, shift, 0).sub(at(zo, 'root')));
      zo.B.root.rotation.z += .015 * Math.sin((t - B(4)[0]) * 1.3); zo.group.updateMatrixWorld(true);
      PO.reach(zo, 'R', front(zo, 'head', .24 * k, .0 * k, .15 * k), { grip: .015, pole: [-.4, .1, .15] });   // r17: palm just above the brow, not at the temple
      PO.palmTo(zo, 'R', 1, V(0, -1, 0)); PO.fingers(zo, 'R', .05, { spread: .2 });
      PO.reach(zo, 'L', front(zo, 'root', .12 * k, -.24 * k, .1 * k), { grip: .03, pole: [.6, -.1, -.2] }); PO.fingers(zo, 'L', .3, { thumb: .3 });   // r17: relaxed, slightly bent
      zo.B.thighL.rotation.x -= .07; zo.B.shinL.rotation.x += .12; zo.B.root.rotation.z += .02; zo.group.updateMatrixWorld(true);
    }
    if (IN(2, t)) {   // b006 "total war": Argon r5 found a mannequin → fists on her hips, elbows out, chin up, eyes sweeping the room
      const w = sm(B(2)[0] - .1, B(2)[0] + .6, t) * (1 - sm(B(2)[1] - .1, B(2)[1] + .4, t));
      zo.B.neck.rotation.x -= .08 * w; zo.B.head.rotation.y += .25 * w * Math.sin((t - B(2)[0]) * 1.1); zo.B.chest.rotation.x -= .05 * w; zo.B.spine.updateWorldMatrix(false, true);
      for (const s of ['L', 'R']) { PO.reach(zo, s, front(zo, 'root', .07 * k, (s === 'L' ? -.35 : .35) * k, .12 * k).lerp(front(zo, 'root', .12 * k, (s === 'L' ? -.29 : .29) * k, 0), 1 - w), { grip: .05, pole: s === 'L' ? [.9, 0, -.3] : [-.9, 0, -.3] }); PO.fingers(zo, s, .6 * w, { thumb: .5 }); }
    }
    if (IN(3, t)) {
      const D = B(3)[1] - B(3)[0], up = sm(B(3)[0] - .1, B(3)[0] + .5, t)
        * (1 - sm(B(3)[0] + .68 * D, B(3)[0] + .68 * D + .5, t));
      const blow = sm(B(3)[0] + .68 * D, B(3)[0] + .68 * D + .5, t);
      const lintel = S3.floorAt(280, 960).setY(heightAt(S3, 280, 960, 125));
      const sh = at(zo, 'upperArmR'), len = sh.distanceTo(at(zo, 'foreArmR')) + at(zo, 'foreArmR').distanceTo(at(zo, 'handR'));
      // r18: she stands a step off the doorway (not under the lintel) so the arm reaches out and up in front of her, not folded behind her head
      { const d = lintel.clone().sub(sh); if (d.length() > len * .93) lintel.copy(sh).addScaledVector(d.normalize(), len * .93); }
      // 3/4 to the lens: blend from the lens toward the doorway (back to camera failed the acting gate)
      const yd = yawTo(zo.group.position, S3.floorAt(330, 880)), yc = yawTo(zo.group.position, S3.cam.position);
      const yaw = yc + Math.atan2(Math.sin(yd - yc), Math.cos(yd - yc)) * .2;   // r17: more to the lens so the raised arm stays on the door side, off her face
      zo.group.rotation.y = yaw;
      // A small rise onto her toes makes the real lintel reachable without stretching the arm.
      // Keep the soles planted; the lintel target is limited to measured overhead reach.
      zo.B.spine.rotation.x -= .05 * up; zo.group.updateMatrixWorld(true);
      const hand = lintel.clone().lerp(front(zo, 'head', .16 * k, .06 * k, -.02 * k), blow);
      PO.reach(zo, 'R', front(zo, 'root', .18 * k, .3 * k, .06 * k).lerp(hand, Math.max(up, blow)), { grip: .01, pole: [-.9, .1, -.2] });
      // Correct the palm, rather than just the wrist, onto the wood during the held touch.
      if (up > .99 && blow === 0) PO.grip(zo, 'R', lintel, lintel.clone().add(V(0, .08, 0)), { pole: [-.9, .1, -.2] });
      zo.B.thighL.rotation.x -= .05 * up; zo.B.shinL.rotation.x += .1 * up; zo.group.updateMatrixWorld(true);
      PO.fingers(zo, 'R', .3 * blow, { thumb: .5 });
      PO.reach(zo, 'L', front(zo, 'root', .14 * k, -.3 * k, .02 * k), { grip: .015 });
    }
    const cloth = st.cloth ||= S3.prop(dishCloth(), 0, -5, 0), flies = st.flies ||= S3.prop(swarm(), 0, -5, 0), tal = st.tal ||= S3.prop(talisman(), 0, -5, 0);
    const holdingCloth = t >= B(5)[0]; // includes the final line's tail and the pause up to the scene cut
    cloth.userData.holder='zoubida';flies.userData.ambient=true;
    cloth.visible = holdingCloth; flies.visible = true; flies.position.set(0, 0, 0);
    // r17 talisman: in her raised hand while she reaches, then hung over the doorway for the rest of the shot
    {
      const fixed = S3.floorAt(280, 960).setY(heightAt(S3, 280, 960, 80)); fixed.x += .02;
      const carry = sm(B(3)[0] + .3, B(3)[0] + .9, t); tal.visible = t >= B(3)[0] - .2 && t < B(4)[0] - .6;
      const dd = S3.floorAt(200, 960).sub(S3.floorAt(300, 960)).setY(0).normalize(), pal = PO.handPts(zo, 'R').palm.clone().addScaledVector(dd, .12 * k).add(V(0, .05 * k, 0));
      tal.position.copy(pal.lerp(fixed, carry)); tal.scale.setScalar(k); tal.rotation.set(0, yawTo(tal.position, S3.cam.position), 0); tal.updateMatrixWorld(true);
    }
    // r17 swarm: ~24 dark flies fixed in the plate's upper air (placed by canvas px so they stay inside the frame), buzzing in place; they leave through the right window from the line "Elles sortaient"
    {
      const hsh = n => { const x = Math.sin(n * 127.1) * 43758.5; return x - Math.floor(x); };
      const homes = st.fh ||= flies.children.map((_, i) => { const fx = 340 + hsh(i + 1) * 1240, fy = 780 + hsh(i + 5) * 200, py = 190 + hsh(i + 9) * 290; return S3.floorAt(fx, fy).setY(heightAt(S3, fx, fy, py)); });
      const wf = S3.floorAt(1450, 760), wd = wf.clone().setY(heightAt(S3, 1450, 760, 450)), t0 = B(5)[0] + 4.1;
      flies.children.forEach((f, i) => {
        const out = Math.min(1, Math.max(0, (t - t0 - i * .13) / 1.3)), e = out * out * (3 - 2 * out), j = Math.floor(t * 8 + i * .37), sp = .035 * k * (1 - e) + .01 * k;
        f.visible = out < .98; f.scale.setScalar(k);
        f.position.copy(homes[i]).lerp(wd, e).add(V(.07 * k * Math.sin(t * .8 + i * 1.7) * (1 - e) + sp * (hsh(i + j * 3.1) - .5) * 2, .05 * k * Math.sin(t * 1.1 + i * 2.3) * (1 - e) + sp * (hsh(i * 2.3 + j) - .5) * 2, sp * (hsh(i * 5.7 + j * 1.3) - .5) * 2));
        f.children[1].rotation.z = .5 * Math.sin(t * 60 + i); f.children[2].rotation.z = -.5 * Math.sin(t * 60 + i);
      });
      flies.updateMatrixWorld(true);
    }
    if (holdingCloth) {
      const elapsed = t - B(5)[0], a = sm(B(5)[0] - .2, B(5)[0] + .15, t);
      const win = S3.floorAt(1450, 760), g = zo.group.position;
      const yc = yawTo(g, S3.cam.position), yw = yawTo(g, win), y1 = yc + Math.atan2(Math.sin(yw - yc), Math.cos(yw - yc)) * .25,   // r17: turn to the window (screen right)
         y0 = zo.group.rotation.y;
      zo.group.rotation.y += Math.atan2(Math.sin(y1 - y0), Math.cos(y1 - y0)) * a;
      const P = 1.35, done = elapsed >= 4 * P, phase = done ? 1 : (elapsed % P) / P;
      const drive = done ? 0 : sm(.35, .72, phase) * (1 - sm(.72, 1, phase));
      const fw = V(Math.sin(zo.group.rotation.y), 0, Math.cos(zo.group.rotation.y));
      zo.group.position.addScaledVector(fw, .07 * k * drive); 
      zo.B.spine.rotation.y += done ? -.08 : .18 - .36 * sm(.3, .75, phase);
      zo.B.chest.rotation.y -= .1 * drive; zo.B.spine.rotation.x += .1 * drive;
      zo.B.thighR.rotation.x -= .1; zo.B.shinR.rotation.x += .15; zo.B.thighL.rotation.x += .05;   // r17: lead leg bent, weight forward
      for (const side of ['L', 'R']) { zo.B['thigh' + side].rotation.x -= .14 * drive; zo.B['shin' + side].rotation.x += .2 * drive; }
      zo.group.updateMatrixWorld(true);
      // Broad continuous arc: chest-ready -> above/outside the shoulder -> forward toward the window -> recovery.
      const path = ph => {
        const ready = V(.3, -.38, -.1), high = V(.04, -.48, .22), strike = V(.46, -.4, .08), held = V(.3, -.44, -.06);   // r17: cloth in her LEFT hand: on screen-right, so the whip goes toward the window
        return ph < .35 ? ready.lerp(high, sm(0, .35, ph))
          : ph < .72 ? high.lerp(strike, sm(.35, .72, ph)) : strike.lerp(held, sm(.72, 1, ph));
      };
      const p = path(phase), prev = path(Math.max(0, phase - .025));
      const target = q => front(zo, 'chest', q.x * k, q.y * k, q.z * k);
      PO.reach(zo, 'L', target(p), { grip: .015, pole: [.5, .1, -.15] });
      PO.reach(zo, 'R', front(zo, 'root', .1 * k, .3 * k, .16 * k - .1 * k * drive + .02 * k * Math.sin(t * 2)), { grip: .03, pole: [-.7, 0, -.3] });   // r17: loose counter-swing
      PO.fingers(zo, 'R', .35, { thumb: .3 });
      PO.fingers(zo, 'L', 1, { thumb: .95 });
      const h = PO.handPts(zo, 'L'); cloth.position.copy(h.palm);
      const outward = front(zo, 'chest', 0, -1, 0).sub(at(zo, 'chest'));
      const velocity = target(p).sub(target(prev));
      if (velocity.lengthSq() > 1e-8) velocity.normalize();
      // Gravity and lag, constrained outside her right side so even a wind-up cannot sweep through her dress.
      const trail = V(0, -1, 0).addScaledVector(fw, .25).addScaledVector(velocity, done ? 0 : -.8);
      trail.addScaledVector(outward, Math.max(0, (done ? .15 : .35) - trail.dot(outward)));
      cloth.quaternion.setFromUnitVectors(V(0, -1, 0), trail.normalize());
      cloth.scale.setScalar(k); cloth.updateMatrixWorld(true); wave(cloth.children[0], t, done ? .35 : .25 + drive);
    }
    const sole = PO.lowestOf(zo, ['footL', 'footR']);
    if (Number.isFinite(sole)) { zo.group.position.y -= sole; zo.group.updateMatrixWorld(true); }
  },
});

/** a striped cotton dish cloth hanging from the grip point (local −y): one subdivided sheet bent each frame by wave() */
function dishCloth() {
  const g = new THREE.Group(), geo = new THREE.PlaneGeometry(.24, .42, 8, 18); geo.translate(0, -.21, 0);
  geo.userData.rest = geo.attributes.position.array.slice();
  const N = 32, px = new Uint8Array(4 * N * N);   // cream cotton with two indigo bands (a Moroccan kitchen towel)
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const band = (y > 4 && y < 7) || (y > 24 && y < 27), o = 4 * (y * N + x); px.set(band ? [52, 74, 130, 255] : [226, 214, 186, 255], o); }
  const tx = new THREE.DataTexture(px, N, N); tx.needsUpdate = true;
  const m = new THREE.Mesh(geo, new THREE.MeshToonMaterial({ map: tx, side: THREE.DoubleSide })); m.castShadow = true; g.add(m);
  return g;
}
/** travelling wave down the cloth: the free end lags and flaps (amplitude grows with the distance from the grip and the whip speed) */
function wave(m, t, e = 1) {
  const p = m.geometry.attributes.position, r = m.geometry.userData.rest, A = 1.3 + 1.3 * e;
  for (let i = 0; i < p.count; i++) { const x = r[i * 3], d = -r[i * 3 + 1] / .42, w = .3 + .7 * Math.min(1, d * 2.2);   // pinched at the grip, gathered folds across the width
    p.setXYZ(i, x * w * (1 - .25 * d) + .05 * d * d * Math.sin(t * 9 - 3 * d) * A, r[i * 3 + 1] * (1 - .3 * d) - .04 * d * d,
      .05 * A * d * d * Math.sin(t * 9 - 4 * d + 1) + .028 * d * Math.sin(x * 55 + t * 3) + .7 * x * d * Math.sin(t * 4 + d * 3)); }
  p.needsUpdate = true; m.geometry.computeVertexNormals();
}
/** a folded paper talisman on a red thread: parchment with dark script lines and a green seal */
function talisman() {
  const g = new THREE.Group(), N = 32, px = new Uint8Array(4 * N * N);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const ink = (y % 5 === 2 && x > 4 && x < 27) || (x > 12 && x < 19 && y > 22 && y < 28); px.set(ink ? [40, 90, 60, 255] : [232, 214, 166, 255], 4 * (y * N + x)); }
  const tx = new THREE.DataTexture(px, N, N); tx.needsUpdate = true;
  const geo = new THREE.PlaneGeometry(.1, .15); geo.translate(0, -.09, 0);
  g.add(new THREE.Mesh(geo, new THREE.MeshToonMaterial({ map: tx, side: THREE.DoubleSide })));
  const th = new THREE.Mesh(new THREE.CylinderGeometry(.004, .004, .05, 5), new THREE.MeshBasicMaterial({ color: 0xa8201a })); th.position.y = .025; g.add(th);
  return g;
}
/** twenty-four house flies: dark ellipsoid body (readable at 1080p) plus two pale wing blurs */
function swarm() {
  const g = new THREE.Group(), m = new THREE.MeshBasicMaterial({ color: 0x14100c }), wm = new THREE.MeshBasicMaterial({ color: 0xcfd6dc, transparent: true, opacity: .55, side: THREE.DoubleSide });
  for (let i = 0; i < 24; i++) {
    const f = new THREE.Group(), b = new THREE.Mesh(new THREE.SphereGeometry(.016, 7, 5), m); b.scale.set(1, .8, 1.5); f.add(b);
    for (const sd of [1, -1]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(.03, .014), wm); w.position.set(sd * .016, .012, -.004); f.add(w); }
    g.add(f);
  }
  return g;
}

export default beatScene(ID, {
  shots: { ch },
  plan: {
    b005: { shot: 'ch', size: 'CU', on: 'zoubida', z: 2.25, dy: -35, insAt: .45 },
    b006: { shot: 'ch', size: 'M', on: 'zoubida', z: 1.8, dy: -30 }, // clean thigh crop; hands clear of the sash
    b007: { shot: 'ch', size: 'W', on: 'zoubida' },   // she walks to the door: the cover cam frames build positions only
    b008: { shot: 'ch', size: 'W', on: 'zoubida', insAt: .55 },
    b009: { shot: 'ch', size: 'W', on: 'zoubida' },
  },
});
