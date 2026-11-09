// s03 flies and bedbugs. b004 painting (summer heat). b005–b009 one bedroom shot (chambre_jour), Zoubida alone at war:
// b005 squints up at the cedar beams (insert: bedbugs), b006 the enumeration "chaux vive, soufre, pétrole" = three inserts
// cut on the words (enum.json), b007 talisman over the door (reach up toward the door, left) then a pinch of powder blown
// (inserts on "talismans" / "poudres"), b008 peering up at the beams (insert: survivors), b009 whipping a dish cloth, flies out.
import * as PO from '../../../engine/poses.js';
import { staged, THREE } from '../lib/autostage.js';
import { beatScene, lines, sm, front, V } from '../lib/beatscene.js';

const ID = 's03_mouches', L = lines(ID), B = i => L[i] || [0, 0];
const IN = (i, t) => t >= B(i)[0] - .2 && t < B(i)[1] + .2;
const beams = [980, 930, 2.9];

// Argon r4: stiff profile to the left wall, a rigid plank lean that hid her face, no lintel reach, no cloth → she stands
// three-quarter to the lens, looks up by tipping the head (not the whole trunk), a hand at the brow; the talisman goes
// UP on the lintel; b009 a real dish cloth whipped toward the right window (flies out)
const ch = staged('chambre_jour', {
  zoubida: { at: [960, 985], face: [640, 1080], seed: 7, lookMax: 1.1, walk: { to: [520, 905], t0: B(3)[0] - 1.2, t1: B(3)[0] + .9 },
    look: t => IN(1, t) || IN(4, t) ? beams : IN(3, t) && t < B(3)[0] + .5 * (B(3)[1] - B(3)[0]) ? [330, 880, 2.15] : IN(5, t) ? [1450, 760, 1.5] : null },
}, {
  act(lt, t, S, st, S3) {
    const zo = st.A.zoubida, k = zo.group.scale.y / 1.6;
    const upLook = Math.max(IN(1, t) ? sm(B(1)[0] - .2, B(1)[0] + .4, t) : 0, IN(4, t) ? sm(B(4)[0] - .2, B(4)[0] + .4, t) : 0);
    if (upLook > 0) {   // look up: small trunk extension, the rest in neck/head; a slow searching sway of the head
      zo.B.spine.rotation.x -= .04 * upLook; zo.B.chest.rotation.x -= .06 * upLook; zo.B.neck.rotation.x -= .22 * upLook;
      zo.B.head.rotation.y += .12 * upLook * Math.sin(t * .9); zo.B.spine.updateWorldMatrix(false, true);
      PO.reach(zo, 'L', front(zo, 'head', .1 * k, -.05 * k, .1 * k).lerp(front(zo, 'root', .12 * k, -.2 * k, 0), 1 - upLook), { grip: .0, pole: [.45, -.1, -.1] });   // palm flat at the brow, shading
      PO.palmTo(zo, 'L', upLook, V(0, -1, 0)); PO.fingers(zo, 'L', .1, { spread: .2 });
    }
    if (IN(3, t)) {   // talisman: right hand up to the lintel (above head, slightly forward), then the pinch of powder to the lips
      const D = B(3)[1] - B(3)[0], up = sm(B(3)[0] + .9, B(3)[0] + 1.5, t) * (1 - sm(B(3)[0] + .5 * D, B(3)[0] + .5 * D + .5, t));
      const blow = sm(B(3)[0] + .5 * D, B(3)[0] + .5 * D + .5, t);
      const hand = front(zo, 'head', .3 * k, .08 * k, .28 * k).lerp(front(zo, 'head', .13 * k, 0, -.06 * k), blow);
      if (up > 0) { zo.B.spine.rotation.x -= .05 * up; zo.B.spine.updateWorldMatrix(false, true); }
      if (up + blow > 0) { PO.reach(zo, 'R', front(zo, 'root', .15 * k, .2 * k, 0).lerp(hand, Math.max(up, blow)), { grip: .02, pole: [-.5, -.2, -.1] }); PO.fingers(zo, 'R', .55 * Math.max(up, blow), { thumb: .6 }); }
    }
    const cloth = st.cloth ||= S3.prop(dishCloth(), 0, -5, 0);
    cloth.visible = IN(5, t);
    if (IN(5, t)) {   // whipping the cloth toward the window: wide fast arcs out to her right, body turning with each lash
      const w = Math.sin(t * 7), a = sm(B(5)[0] - .1, B(5)[0] + .4, t);
      zo.B.spine.rotation.y -= .18 * a * (.6 + .4 * w); zo.B.chest.rotation.y -= .12 * a * w; zo.B.spine.updateWorldMatrix(false, true);
      PO.reach(zo, 'R', front(zo, 'chest', (.3 + .1 * w) * k, (.2 + .25 * w) * k, (.12 + .18 * Math.max(0, w)) * k).lerp(front(zo, 'root', .15 * k, .2 * k, 0), 1 - a), { grip: .02, pole: [-.5, -.1, -.1] });
      PO.fingers(zo, 'R', .85, { thumb: .8 });
      const h = PO.handPts(zo, 'R'); cloth.position.copy(h.palm);
      cloth.quaternion.setFromUnitVectors(V(0, -1, 0), h.end.clone().sub(h.wrist).normalize().lerp(V(-.6 * Math.cos(t * 7), -.4, 0), .6).normalize());
      cloth.scale.setScalar(k); cloth.updateMatrixWorld(true);
    }
  },
});

/** a faded cotton dish cloth hanging from the grip point (local −y), a little twisted */
function dishCloth() {
  const g = new THREE.Group(), m = new THREE.MeshToonMaterial({ color: 0xd9c9a4, side: THREE.DoubleSide });
  for (let i = 0; i < 4; i++) { const p = new THREE.Mesh(new THREE.PlaneGeometry(.2 - .02 * i, .09), m); p.position.y = -.045 - .085 * i; p.rotation.y = .25 * i; p.rotation.x = .12 * (i % 2 ? 1 : -1); p.castShadow = true; g.add(p); }
  const s = new THREE.Mesh(new THREE.PlaneGeometry(.2, .012), new THREE.MeshToonMaterial({ color: 0x7a3a2a, side: THREE.DoubleSide })); s.position.set(0, -.1, .002); g.add(s);
  return g;
}

export default beatScene(ID, {
  shots: { ch },
  plan: {
    b005: { shot: 'ch', size: 'CU', on: 'zoubida', insAt: .45 },
    b006: { shot: 'ch', size: 'M', on: 'zoubida' },
    b007: { shot: 'ch', size: 'W', on: 'zoubida' },   // she walks to the door: the cover cam frames build positions only
    b008: { shot: 'ch', size: 'W', on: 'zoubida', insAt: .55 },
    b009: { shot: 'ch', size: 'W', on: 'zoubida' },
  },
});
