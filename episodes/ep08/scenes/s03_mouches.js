// s03 flies and bedbugs. b004 painting (summer heat). b005–b009 one bedroom shot (chambre_jour), Zoubida alone at war:
// b005 squints up at the cedar beams (insert: bedbugs), b006 the enumeration "chaux vive, soufre, pétrole" = three inserts
// cut on the words (enum.json), b007 talisman over the door (reach up toward the door, left) then a pinch of powder blown
// (inserts on "talismans" / "poudres"), b008 peering up at the beams (insert: survivors), b009 whipping a dish cloth, flies out.
import * as PO from '../../../engine/poses.js';
import { staged, THREE } from '../lib/autostage.js';
import { beatScene, lines, sm, front, V } from '../lib/beatscene.js';

const ID = 's03_mouches', L = lines(ID), B = i => L[i] || [0, 0];
const IN = (i, t) => t >= B(i)[0] - .2 && t < B(i)[1] + .2;
const beams = [980, 700, 2.55];   // Argon r6: a near, high target cranked the head back 90° → a deeper beam, lower angle

// Argon r4: stiff profile to the left wall, a rigid plank lean that hid her face, no lintel reach, no cloth → she stands
// three-quarter to the lens, looks up by tipping the head (not the whole trunk), a hand at the brow; the talisman goes
// UP on the lintel; b009 a real dish cloth whipped toward the right window (flies out)
const ch = staged('chambre_jour', {
  zoubida: { at: [960, 985], face: [640, 1080], seed: 7, lookMax: t => IN(1, t) || IN(4, t) ? .32 : .7,   // up-looks: the eyes + a chest arch do the rest lids: t => IN(1, t) || IN(4, t) ? .5 : 0,   // Argon r5: squint up at the beams
    walk: { to: [440, 900],   // Argon r6: closer to the door for the lintel reach
      t0: B(3)[0] - 1.2, t1: B(3)[0] + .9 },
    look: t => IN(1, t) || IN(4, t) ? beams : IN(3, t) && t < B(3)[0] + .5 * (B(3)[1] - B(3)[0]) ? [330, 880, 2.15] : IN(5, t) ? [1450, 760, 1.5] : null },
}, {
  act(lt, t, S, st, S3) {
    const zo = st.A.zoubida, k = zo.group.scale.y / 1.6;
    // stills8: after the walk to the door she kept her back to the lens → from b008 she turns back into the room, 3/4 to camera
    const turn = sm(B(4)[0] - .6, B(4)[0] + .4, t);
    if (turn > 0) { const c = S3.cam.position, g = zo.group.position, y1 = Math.atan2(c.x - g.x, c.z - g.z) + .55, y0 = zo.group.rotation.y;
      zo.group.rotation.y = y0 + Math.atan2(Math.sin(y1 - y0), Math.cos(y1 - y0)) * turn; zo.group.updateMatrixWorld(true); }
    const upLook = Math.max(IN(1, t) ? sm(B(1)[0] - .2, B(1)[0] + .4, t) : 0, IN(4, t) ? sm(B(4)[0] - .2, B(4)[0] + .4, t) : 0);
    if (upLook > 0) {   // look up: small trunk extension, the rest in neck/head; a slow searching sway of the head
      zo.B.spine.rotation.x -= .07 * upLook; zo.B.chest.rotation.x -= .08 * upLook;   // Argon r6: the upper back arches (shoulders back), the neck stays easy
      zo.B.head.rotation.y += .12 * upLook * Math.sin(t * .9); zo.B.spine.updateWorldMatrix(false, true);
      PO.reach(zo, 'L', front(zo, 'head', .2 * k, -.05 * k, .27 * k).lerp(front(zo, 'root', .12 * k, -.2 * k, 0), 1 - upLook), { grip: .0, pole: [.45, -.1, -.1] });   // palm flat at the brow, shading
      PO.palmTo(zo, 'L', upLook, V(0, -1, 0)); PO.fingers(zo, 'L', .1, { spread: .2 });
    }
    if (IN(2, t)) {   // b006 "total war": Argon r5 found a mannequin → fists on her hips, elbows out, chin up, eyes sweeping the room
      const w = sm(B(2)[0] - .1, B(2)[0] + .6, t) * (1 - sm(B(2)[1] - .1, B(2)[1] + .4, t));
      zo.B.neck.rotation.x -= .08 * w; zo.B.head.rotation.y += .25 * w * Math.sin((t - B(2)[0]) * 1.1); zo.B.chest.rotation.x -= .05 * w; zo.B.spine.updateWorldMatrix(false, true);
      for (const s of ['L', 'R']) { PO.reach(zo, s, front(zo, 'root', .04 * k, (s === 'L' ? -.17 : .17) * k, .1 * k).lerp(front(zo, 'root', .12 * k, (s === 'L' ? -.2 : .2) * k, 0), 1 - w), { grip: .05, pole: s === 'L' ? [.7, 0, -.3] : [-.7, 0, -.3] }); PO.fingers(zo, s, .6 * w, { thumb: .5 }); }
    }
    if (IN(3, t)) {   // talisman: right hand up to the lintel (above head, slightly forward), then the pinch of powder to the lips
      const D = B(3)[1] - B(3)[0], up = sm(B(3)[0] + .6, B(3)[0] + 1.1, t) * (1 - sm(B(3)[0] + .68 * D, B(3)[0] + .68 * D + .5, t));
      const blow = sm(B(3)[0] + .68 * D, B(3)[0] + .68 * D + .5, t);
      const hand = front(zo, 'head', .3 * k, .1 * k, .42 * k).lerp(front(zo, 'head', .13 * k, 0, -.06 * k), blow);
      if (up > 0) { zo.B.spine.rotation.x -= .05 * up; zo.B.spine.updateWorldMatrix(false, true); }
      if (up + blow > 0) { PO.reach(zo, 'R', front(zo, 'root', .15 * k, .2 * k, 0).lerp(hand, Math.max(up, blow)), { grip: .02, pole: [-.5, -.2, -.1] }); PO.fingers(zo, 'R', .55 * Math.max(up, blow), { thumb: .6 }); PO.reach(zo, 'L', front(zo, 'root', .1 * k, -.24 * k, .02 * k), { grip: .1 }); }   // the other hand clear of the sash
    }
    const cloth = st.cloth ||= S3.prop(dishCloth(), 0, -5, 0), flies = st.flies ||= S3.prop(swarm(), 0, -5, 0);
    cloth.visible = flies.visible = IN(5, t);
    if (IN(5, t)) {   // Argon r5: a rigid plank, no whip, body not turned → the whole body turns to the window, wide lashes with a
      // counterbalancing left arm, a soft cloth that trails the hand (travelling wave), and the flies streaming out
      // Argon r6: only the forearm moved and the cloth sat over her face → a real overhand whip toward the window, repeated:
      // wind-up (hand high behind the shoulder, trunk twisted back) → snap (step in, trunk unwinds, arm extends forward-down
      // toward the window, the cloth cracks out ahead of her) → slow recovery. The hand path never crosses the head.
      const a = sm(B(5)[0] - .1, B(5)[0] + .4, t), win = S3.floorAt(1450, 760), P = 1.15, ph = ((t - B(5)[0]) / P % 1 + 1) % 1;
      const snap = ph < .62 ? -sm(0, .62, ph) : -1 + 2 * sm(.62, .78, ph) - sm(.78, 1, ph) * 1;   // −1 wound up … +1 struck … back to 0
      const g = zo.group.position, y1 = Math.atan2(win.x - g.x, win.z - g.z) - .5, y0 = zo.group.rotation.y;   // 3/4: the window side, face still to us
      zo.group.rotation.y = y0 + Math.atan2(Math.sin(y1 - y0), Math.cos(y1 - y0)) * a;
      const fw = V(Math.sin(zo.group.rotation.y), 0, Math.cos(zo.group.rotation.y)); zo.group.position.addScaledVector(fw, .1 * k * a * Math.max(0, snap)); zo.group.updateMatrixWorld(true);   // the step in
      zo.B.spine.rotation.y += .32 * a * snap; zo.B.chest.rotation.y += .2 * a * snap; zo.B.spine.rotation.x += .14 * a * Math.max(0, snap) - .05 * a * Math.max(0, -snap); zo.B.spine.updateWorldMatrix(false, true);
      const hi = front(zo, 'chest', -.02 * k, .26 * k, .42 * k), lo = front(zo, 'chest', .55 * k, .2 * k, -.05 * k), mid = front(zo, 'chest', .22 * k, .24 * k, .12 * k);
      const hp = snap < 0 ? mid.clone().lerp(hi, -snap) : mid.clone().lerp(lo, snap);
      PO.reach(zo, 'R', hp.lerp(front(zo, 'root', .15 * k, .2 * k, 0), 1 - a), { grip: .02, pole: [-.6, -.2, -.3] });
      PO.reach(zo, 'L', front(zo, 'chest', (.15 - .08 * snap) * k, -.3 * k, (-.1 + .06 * snap) * k).lerp(front(zo, 'root', .12 * k, -.2 * k, 0), 1 - a), { grip: .1, pole: [.5, -.2, -.1] });   // counterbalance
      PO.fingers(zo, 'R', .9, { thumb: .85 });
      const h = PO.handPts(zo, 'R'); cloth.position.copy(h.palm);
      const trail = snap < 0 ? V(0, 1, 0).addScaledVector(fw, -.6) : fw.clone().multiplyScalar(1.4).add(V(0, -.4 + .6 * (1 - snap), 0));   // the free end lags the hand
      cloth.quaternion.setFromUnitVectors(V(0, -1, 0), trail.normalize());
      cloth.scale.setScalar(k); cloth.updateMatrixWorld(true); wave(cloth.children[0], t, Math.abs(snap));
      // flies: smaller, each darting (held, then a jump) inside a cloud that drifts out through the window as she lashes
      const d = win.clone().setY(1.5 * k), hsh = n => (Math.sin(n * 127.1) * 43758.5) % 1;
      flies.children.forEach((f, i) => { const u = Math.min(1, Math.max(0, (t - B(5)[0]) * .3 - i * .03)), j = Math.floor(t * 7 + i * .37), sp = (1 - u) * .5;
        f.visible = u < .97;
        f.position.copy(g).setY(1.7 * k).lerp(d, u).add(V(sp * hsh(i + j * 3.1), sp * .5 * hsh(i * 2.3 + j), sp * hsh(i * 5.7 + j * 1.3))); });
      flies.position.set(0, 0, 0); flies.updateMatrixWorld(true);
    }
  },
});

/** a striped cotton dish cloth hanging from the grip point (local −y): one subdivided sheet bent each frame by wave() */
function dishCloth() {
  const g = new THREE.Group(), geo = new THREE.PlaneGeometry(.26, .44, 6, 16); geo.translate(0, -.22, 0);
  geo.userData.rest = geo.attributes.position.array.slice();
  const N = 32, px = new Uint8Array(4 * N * N);   // cream cotton with two indigo bands (a Moroccan kitchen towel)
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const band = (y > 4 && y < 7) || (y > 24 && y < 27), o = 4 * (y * N + x); px.set(band ? [52, 74, 130, 255] : [226, 214, 186, 255], o); }
  const tx = new THREE.DataTexture(px, N, N); tx.needsUpdate = true;
  const m = new THREE.Mesh(geo, new THREE.MeshToonMaterial({ map: tx, side: THREE.DoubleSide })); m.castShadow = true; g.add(m);
  return g;
}
/** travelling wave down the cloth: the free end lags and flaps (amplitude grows with the distance from the grip and the whip speed) */
function wave(m, t, e = 1) {
  const p = m.geometry.attributes.position, r = m.geometry.userData.rest, A = .5 + e;
  for (let i = 0; i < p.count; i++) { const x = r[i * 3], d = -r[i * 3 + 1] / .44;
    p.setXYZ(i, x * (1 - .3 * d) + .06 * d * d * Math.sin(t * 9 - 3 * d) * A, r[i * 3 + 1] * (1 - .15 * d), .14 * A * d * d * Math.sin(t * 9 - 4 * d + 1) + .3 * x * d * Math.sin(t * 4)); }
  p.needsUpdate = true; m.geometry.computeVertexNormals();
}
/** eighteen house flies: tiny dark bodies with a pale wing blur */
function swarm() {
  const g = new THREE.Group(), m = new THREE.MeshBasicMaterial({ color: 0x14100c }), wm = new THREE.MeshBasicMaterial({ color: 0xcfd6dc, transparent: true, opacity: .45 });
  for (let i = 0; i < 18; i++) { const f = new THREE.Mesh(new THREE.SphereGeometry(.006, 6, 4), m); f.scale.set(1.5, 1, 1); f.add(new THREE.Mesh(new THREE.CircleGeometry(.008, 8), wm)); g.add(f); }
  return g;
}

export default beatScene(ID, {
  shots: { ch },
  plan: {
    b005: { shot: 'ch', size: 'CU', on: 'zoubida', insAt: .45 },
    b006: { shot: 'ch', size: 'M', on: 'zoubida', dx: 0, dy: -70 },   // Argon r6: the headscarf touched the top edge → headroom
    b007: { shot: 'ch', size: 'W', on: 'zoubida' },   // she walks to the door: the cover cam frames build positions only
    b008: { shot: 'ch', size: 'W', on: 'zoubida', insAt: .55 },
    b009: { shot: 'ch', size: 'W', on: 'zoubida' },
  },
});
