// s06 "rêves". b022 the class (s05 layout, mausolee): Mohammed reciting in front, the fqih behind him with the quince rod
// lying across his knee (insert: baguette de cognassier). b023 his programme, two halves cut on the enumeration words:
// "le matin" fervent (fast rock, lips going, eyes on the slate, insert soleil_matin) / "l'après-midi" the rock slows, the
// lips stop, the eyes drift up and away to the light (insert soleil_apresmidi). b024–b026 paintings (p06, p07, p08).
import * as PR from '../../../engine/props3d.js';
import { staged, THREE } from '../lib/autostage.js';
import { beatScene, lines, sm, at, V, ENUM } from '../lib/beatscene.js';
import { CLASS, lapLouha, rock } from './s05_memoire.js';

const ID = 's06_reves', L = lines(ID), B = i => L[i] || [0, 0];
const E = (ENUM.b023 || [[4.55], [9.18]]).map(([x]) => B(1)[0] + x);   // "matin" / "après-midi" (scene-local)
const drift = t => sm(E[1] - .4, E[1] + 1.4, t);   // afternoon: 0 → 1

const cl = staged('mausolee', {
  fqih: { ...CLASS.fqih, lids: .3, talk: 0, look: 'mohammed', lookMax: .5 },
  mohammed: { ...CLASS.mohammed, lids: t => .3 + .25 * drift(t), mutter: t => (t > B(0)[0] - .3 ? 1 : 0) * (1 - drift(t)), lookMax: t => .6 + .25 * drift(t),
    look: (t, st) => drift(t) > .35 ? [420, 640, 2.6] : st.slate },   // eyes off the slate, up to the light over the tomb
}, {
  act(lt, t, S, st, S3) {
    const { fqih: fq, mohammed: mo } = st.A, d = drift(t);
    // morning fervour: a quick deep rock; afternoon: slow and shallow, he is elsewhere
    rock(mo, t, .11 - .07 * d, 4 - 2.4 * d);
    st.lh ||= S3.prop(PR.louha({ col: 0xc9a46a }), 0, 0, 0);
    st.slate = lapLouha(mo, st.lh);
    // the quince rod across the fqih's right knee, its tip toward the boy
    if (!st.rod) {
      const geo = new THREE.CylinderGeometry(.005, .009, .8, 6); geo.translate(0, .4, 0);
      st.rod = S3.prop(new THREE.Mesh(geo, PR.toon(0x6e4a28)), 0, 0, 0); st.rod.castShadow = true;
    }
    const kf = fq.group.scale.y / 1.6, kneeR = at(fq, 'shinR').add(V(0, .045 * kf, 0)), kneeL = at(fq, 'shinL').add(V(0, .045 * kf, 0));
    const dir = kneeR.clone().sub(kneeL).normalize(); st.rod.position.copy(kneeL.addScaledVector(dir, -.12 * kf));
    st.rod.quaternion.setFromUnitVectors(V(0, 1, 0), dir.add(V(0, -.05, 0)).normalize()); st.rod.scale.setScalar(kf); st.rod.updateMatrixWorld(true);
  },
});

export default beatScene(ID, {
  shots: { cl },
  plan: {
    b022: { shot: 'cl', size: 'M', on: 'mohammed', z: 1.9 },   // the fqih and his rod in frame behind the boy
    b023: { shot: 'cl', size: 'M', on: 'mohammed', z: 2.3 },
  },
});
