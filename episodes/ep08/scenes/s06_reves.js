// s06 "rêves". b022 the class (s05 layout, mausolee): Mohammed reciting in front, the fqih behind him with the quince rod
// lying across his knee (insert: baguette de cognassier). b023 his programme, two halves cut on the enumeration words:
// "le matin" fervent (fast rock, lips going, eyes on the slate, insert soleil_matin) / "l'après-midi" the rock slows, the
// lips stop, the eyes drift up and away to the light (insert soleil_apresmidi). b024–b026 paintings (p06, p07, p08).
import * as PR from '../../../engine/props3d.js';
import { staged } from '../lib/fix8.js';
import { hideHem } from '../lib/fix8a.js';
import { THREE } from '../lib/autostage.js';
import { still, loadStill } from '../lib/stage.js';
import { beatScene, lines, sm, at, V, dirW, front } from '../lib/beatscene.js';
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
function paint(id, cam = [.5, .4, 1.06, .5, .45, 1.07]) {
  return {
    async load() { await loadStill(id); },
    fn(lt, u) { still(id, u, cam); return { vignette: .5, paper: .2 }; },
  };
}
const p06 = paint('p06_envol'), p07 = paint('p07_homme', [.5, .33, 1.03, .5, .38, 1.04]);   // r18: more headroom on the adult man's hair
const matin = paint('i_soleil_matin'), apres = paint('i_soleil_apresmidi');

const cl = staged('mausolee', {
  fqih: { ...CLASS.fqih, lids: .3, talk: 0, look: 'mohammed', lookMax: .5 },
  mohammed: { ...CLASS.mohammed, lids: t => .3 + .25 * drift(t),
    mutter: t => (t > B(0)[0] - .3 ? 1 : 0) * (1 - drift(t)),
    lookMax: t => .28 + .35 * drift(t),
    look: (t, st, S3) => { hideHem(S3, st.A.mohammed, st); if (st.hem) st.hem.visible = false; return drift(t) > .35 ? [420, 620, 2.8] : st.slate.clone().add(V(0, .1, 0)); } },
}, {
  act(lt, t, S, st, S3) {
    const { fqih: fq, mohammed: mo } = st.A, d = drift(t), kf = fq.group.scale.y / 1.6;
    life(fq, t, 2); life(mo, t, 5);
    const ra = .2 - .13 * d, rr = 4.6 - 3 * d, rp = .5 + .5 * Math.sin(t * rr), w = 1 - d;
    rock(mo, t, ra, rr);
    // r18: recitation. The trunk rocks from the hips, the head counter-rotates so the chin stays up (head near level, eyes
    // do the looking down), a small nod rides on top, plus side sway + twist so the torso is never the same twice.
    mo.B.head.rotation.x += -.55 * ra * rp - .1 + (.05 * Math.sin(t * rr * 2 + .5)) * w;
    mo.B.neck.rotation.x += -.25 * ra * rp + .04 * Math.sin(t * rr + .6) * w;
    mo.B.spine.rotation.z += .07 * Math.sin(t * rr * .5 + 1) * w + .02 * Math.sin(t * .8);
    mo.B.spine.rotation.y += .08 * Math.sin(t * rr * .5 + .3) * w;
    mo.B.chest.rotation.z += .05 * Math.sin(t * rr * .5 + 2) * w;
    mo.B.chest.rotation.y += .05 * Math.sin(t * .7 + 1);
    mo.B.spine.updateWorldMatrix(false, true);
    mo.B.neck.updateWorldMatrix(false, true);
    mo.B.head.rotation.z += .05 * Math.sin(t * .9 + 1);
    fq.B.head.rotation.z += .05 * Math.sin(t * .6);
    fq.B.spine.rotation.x += .03 * Math.sin(t * .45);
    if (!st.lh) {
      st.lh = S3.prop(PR.louha({ col: 0xc99a58 }), 0, 0, 0);   // r17: pale wood board with dark writing bars (same as s05)
      for (let i = 0; i < 6; i++) {
        const bar = new THREE.Mesh(new THREE.BoxGeometry(i % 2 ? .15 : .19, .012, .004), PR.toon(0x2a1a10));
        bar.position.set(0, .06 + i * .045, .0095); st.lh.add(bar);
      }
    }
    const sb = 1 - d * .7;   // slate bobs / tips with the rock so the arms move too
    st.slate = lapLouha(mo, st.lh, { f: .02 * Math.sin(t * 4.6 - .8) * sb, x: .018 * Math.sin(t * 2.3 + 1) * sb, y: .015 * Math.sin(t * 4.6 + .4) * sb, tilt: .12 * Math.sin(t * 2.3 + 2) * sb });
    // the quince rod lies across the right knee, a little in front of the lap, not back through the hips
    if (!st.rod) {
      const geo = new THREE.CylinderGeometry(.011, .016, .62, 8);
      st.rod = S3.prop(new THREE.Mesh(geo, PR.toon(0x6e4a28)), 0, 0, 0); st.rod.castShadow = true;
    }
    const knee = front(fq, 'root', .27 * kf, 0, .17 * kf);   // G1: across the lap, centred in front of the crossed shins
    st.rod.position.copy(knee);
    st.rod.quaternion.setFromUnitVectors(V(0, 1, 0), dirW(fq, 1, .02, .1));
    st.rod.scale.setScalar(kf);
    st.rod.updateMatrixWorld(true);
    fq.B.upperArmR.rotation.z -= .08;
    fq.B.foreArmL.rotation.x += .06 * Math.sin(t * .9);
  },
});

const scene = beatScene(ID, {
  shots: { cl, p06, p07, matin, apres },
  plan: {
    b022: { shot: 'cl', size: 'M', on: 'mohammed', z: 1.5, dx: 120, dy: -70 },
    b023: { shot: 'cl', size: 'M', on: 'mohammed', z: 1.75, dx: 120, dy: -75, noIns: true,
      segs: [[.177, 'matin'], [.26, 'cl'], [.463, 'apres'], [.545, 'cl']] },   // r17: the inserts are ~1 s; the painting starts at b024
    b024: { shot: 'p06', segs: [[.42, 'p07']] },
    b025: { shot: 'p07' },
  },
});
const draw = scene.draw;
scene.draw = (t, S) => {
  const fin = draw(t, S);
  const [a, b] = B(1);
  scene.noExam = t >= a - .2 && t < b + 1;
  return fin;
};
export default scene;
