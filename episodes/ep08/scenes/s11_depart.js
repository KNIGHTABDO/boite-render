// s11 "L'Aâsser". patio_matin in late-afternoon amber key light. b066 the call to prayer: Mohammed lifts his face to the
// sky, b067 hopeful question, b068 Zoubida points at the stains on his djellaba, b069 Fatma Bziouya leans out of her door
// (right), b070 eager question, b071 Zoubida nods, b072 the father calls from the street door (left) before coming in,
// b073 "Passe": he walks in.
import * as PO from '../../../engine/poses.js';
import { staged, approach, apart, yawToward } from '../lib/fix8b.js';
import { beatScene, lines, sm, at, V, yawTo } from '../lib/beatscene.js';

const ID = 's11_depart', L = lines(ID);
const B = i => L[i] || [0, 0];
const win = (i, a, b, t) => { const [t0, t1] = B(i), D = t1 - t0; return sm(t0 + a * D, t0 + a * D + .5, t) * (1 - sm(t0 + b * D, t0 + b * D + .5, t)); };
const AMBER = { key: '#ffb870', keyI: 1.9, dir: [-3, 1.6, 1], fillI: .9, sky: '#d9b48a' };

const pa = staged('patio_matin', {
  mohammed: { at: [940, 1000], face: 'cam', yaw: -.15, seed: 3,
    look: t => t >= B(6)[0] ? 'father' : t < B(1)[0] ? null : 'zoubida', lookMax: .45 },
  zoubida: { at: [1240, 975], face: 'cam', seed: 7,
    look: t => t >= B(6)[0] + .3 ? 'father' : t > B(3)[0] && t < B(5)[0] + .5 ? 'fatma' : 'mohammed', lookMax: .18 },
  fatma: { at: [1700, 945], face: [1240, 975], seed: 11, look: t => t >= B(6)[0] + .6 ? 'father' : t > B(3)[0] ? 'zoubida' : null },
  father: { at: [160, 955], face: [700, 965], seed: 5, height: 1.76, walk: { to: [560, 965], t0: B(7)[0] + .4, t1: B(7)[0] + 3.4 } },
}, {
  light: AMBER,
  addressee: { mohammed: 'zoubida', zoubida: 'mohammed', fatma: 'zoubida', father: 'zoubida' },
  act(lt, t, S, st, S3) {
    const { mohammed: mo, zoubida: zo, fatma: fa } = st.A;
    // She stands close enough to point, but the fingertip stops in front of his chest.
    st.zy0 ??= zo.group.rotation.y;
    let d = yawTo(zo.group.position, fa.group.position) - st.zy0; d = Math.atan2(Math.sin(d), Math.cos(d));
    const tf = sm(B(3)[0] + .3, B(3)[0] + 1.1, t) * (1 - sm(B(5)[1], B(5)[1] + .8, t));
    zo.group.rotation.y = st.zy0 + .15 * d * tf; zo.group.updateMatrixWorld(true);
    yawToward(zo, S3.cam, .8);
    yawToward(mo, S3.cam, 1.0);
    const point = win(2, .3, 1, t);   // "pleine de taches": index at the stains, short of his body
    if (point > 0) {
      const chest = at(mo, 'chest');
      const dir = chest.clone().sub(at(zo, 'upperArmR')); dir.y = 0;
      const n = dir.length() > 1e-4 ? dir.normalize() : V(1, 0, 0);
      const stain = chest.clone().addScaledVector(n, -.34); stain.y = chest.y - .04;
      approach(zo, 'R', stain, .08);
      apart(zo, mo, .5);
      PO.reach(zo, 'R', stain, { grip: .12 });
    }
    // b066: she hears the call too, settles her weight and acknowledges the boy's upward glance.
    const listen = 1-sm(B(1)[0]-.4,B(1)[0],t);
    zo.B.spine.rotation.z += .035*listen*Math.sin(t*1.6);zo.B.chest.rotation.x -= .045*listen;
    // Fatma only leans out of her doorway from b069 on (before that she is hidden: pushed back out of frame)
    const lean = sm(B(3)[0] + .45 * (B(3)[1] - B(3)[0]), B(3)[0] + .45 * (B(3)[1] - B(3)[0]) + .8, t);
    fa.group.visible = t > B(3)[0];
    fa.B.spine.rotation.z += .22 * lean; fa.B.spine.updateWorldMatrix(false, true);
    const nod = win(5, 0, .35, t);   // Zoubida's nod
    if (nod > 0) { zo.B.neck.rotation.x += .18 * Math.max(0, Math.sin((t - B(5)[0]) * 7)) * nod; zo.B.neck.updateWorldMatrix(false, true); }
    const lookUp = 1 - sm(B(1)[0] - .5, B(1)[0], t);   // b066: chin lifts toward the call, face stays with the lens
    mo.B.neck.rotation.x -= .16 * lookUp; mo.B.chest.rotation.x -= .06 * lookUp; mo.B.chest.updateWorldMatrix(false, true);
    st.A.father.group.visible = t >= B(6)[0];   // he is not in the patio before his call from the street door (b072)
  },
});

export default beatScene(ID, {
  shots: { pa },
  plan: {
    b066: { shot: 'pa', size: 'W', on: 'mohammed' },
    b067: { shot: 'pa', size: 'CU', on: 'mohammed' },
    b068: { shot: 'pa', size: 'M', on: 'zoubida', z: 1.5, dx: -140 },
    b069: { shot: 'pa', size: 'M', on: 'fatma' },
    b070: { shot: 'pa', size: 'CU', on: 'fatma' },
    b071: { shot: 'pa', size: 'M', on: 'zoubida' },
    b072: { shot: 'pa', size: 'M', on: 'father' },
    b073: { shot: 'pa', size: 'W', on: 'father' },
  },
});
