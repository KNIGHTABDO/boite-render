// s06 "rêves". b022 the class (s05 layout, mausolee): Mohammed reciting in front, the fqih behind him with the quince rod
// lying across his knee (insert: baguette de cognassier). b023 his programme, two halves cut on the enumeration words:
// "le matin" fervent (fast rock, lips going, eyes on the slate, insert soleil_matin) / "l'après-midi" the rock slows, the
// lips stop, the eyes drift up and away to the light (insert soleil_apresmidi). b024–b026 paintings (p06, p07, p08).
import * as PR from '../../../engine/props3d.js';
import { staged } from '../lib/fix8.js';
import { hideHem } from '../lib/fix8a.js';
import { THREE } from '../lib/autostage.js';
import { still, loadStill } from '../lib/stage.js';
import { beatScene, lines, sm, at, V, dirW } from '../lib/beatscene.js';
import { CLASS, lapLouha, rock } from './s05_memoire.js';

const ID = 's06_reves', L = lines(ID), B = i => L[i] || [0, 0];
// afternoon sentence, from the subtitle break (the enum word is later, so the morning plate was still up)
const aft = () => { const [t0, t1] = B(1); return t0 + .463 * (t1 - t0); };
const drift = t => sm(aft() - .3, aft() + .55, t);

function life(a, t, seed = 0) {
  a.B.spine.rotation.z += .04 * Math.sin(t * .5 + seed);
  a.B.chest.rotation.x += .04 * Math.sin(t * 1.5 + seed);
  a.B.spine.updateWorldMatrix(false, true);
}

// paintings: keep the crown inside by sitting on the top of the plate at the minimum zoom
function paint(id) {
  return {
    async load() { await loadStill(id); },
    fn(lt, u) { still(id, u, [.5, .4, 1.06, .5, .45, 1.07]); return { vignette: .5, paper: .2 }; },
  };
}
const p06 = paint('p06_envol'), p07 = paint('p07_homme');
const matin = paint('i_soleil_matin'), apres = paint('i_soleil_apresmidi');

const cl = staged('mausolee', {
  fqih: { ...CLASS.fqih, lids: .3, talk: 0, look: 'mohammed', lookMax: .5 },
  mohammed: { ...CLASS.mohammed, lids: t => .3 + .25 * drift(t),
    mutter: t => (t > B(0)[0] - .3 ? 1 : 0) * (1 - drift(t)),
    lookMax: t => .28 + .35 * drift(t),
    look: (t, st, S3) => { hideHem(S3, st.A.mohammed, st); return drift(t) > .35 ? [420, 620, 2.8] : st.slate; } },
}, {
  act(lt, t, S, st, S3) {
    const { fqih: fq, mohammed: mo } = st.A, d = drift(t), kf = fq.group.scale.y / 1.6;
    life(fq, t, 2); life(mo, t, 5);
    rock(mo, t, .11 - .07 * d, 4 - 2.4 * d);
    st.lh ||= S3.prop(PR.louha({ col: 0xc9a46a }), 0, 0, 0);
    st.slate = lapLouha(mo, st.lh);
    // the quince rod lies ON the right knee and points toward the boy, not back through the hips
    if (!st.rod) {
      const geo = new THREE.CylinderGeometry(.006, .01, .72, 6); geo.translate(0, .36, 0);
      st.rod = S3.prop(new THREE.Mesh(geo, PR.toon(0x6e4a28)), 0, 0, 0); st.rod.castShadow = true;
    }
    const knee = at(fq, 'shinR').add(V(0, .035 * kf, 0));
    const aim = dirW(fq, .15, .08, 1);
    st.rod.position.copy(knee);
    st.rod.quaternion.setFromUnitVectors(V(0, 1, 0), aim);
    st.rod.scale.setScalar(kf);
    st.rod.updateMatrixWorld(true);
    fq.B.upperArmR.rotation.z -= .08;
    fq.B.foreArmL.rotation.x += .06 * Math.sin(t * .9);
  },
});

const scene = beatScene(ID, {
  shots: { cl, p06, p07, matin, apres },
  plan: {
    b022: { shot: 'cl', size: 'M', on: 'mohammed', z: 1.38, dy: -28 },
    b023: { shot: 'cl', size: 'M', on: 'mohammed', z: 2.45, dx: -160, dy: 55, noIns: true,
      segs: [[.177, 'matin'], [.463, 'apres'], [.9, 'cl']] },
    b024: { shot: 'p06' },
    b025: { shot: 'p07' },
  },
});
const draw = scene.draw;
scene.draw = (t, S) => {
  const fin = draw(t, S);
  const [a, b] = B(1);
  scene.noExam = t >= a - .2 && t < b + 1;
  if (globalThis.FRAME8 && cl.v) {
    const v = cl.v, scr = p => { const q = cl.S3.project(p); return [Math.round((q[0] - v[0]) * v[2] + 960), Math.round((q[1] - v[1]) * v[2] + 540)]; };
    console.error('FRAME', t.toFixed(2), 'cl', v.map(x => +x.toFixed(1)).join(','), cl.st.actors.map(ac => ac.name + scr(ac.B.head.getWorldPosition(V())).join(',') + '/f' + scr(ac.B.footL.getWorldPosition(V())).join(',')).join(' '));
  }
  return fin;
};
export default scene;
