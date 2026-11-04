// s23 dawn. b086 the Msid door at dawn (msid_facade_aube, no cast): the last oil lights by the door turn yellow and
// weaken; two sparrows flutter round them. Back inside (msid_feerie, the light gone pale): b087 the fqih, eyes to the
// ceiling, hands open in offering, the long invocation; b088 the pupils "Amine !" (heads and hands up); b089 CU the fqih
// without his quince rod, his empty open hands; b090 "trois jours de repos"; b091 "quatre jours !" the pupils cheer.
import * as K from '../../../engine/core.js';
import * as PO from '../../../engine/poses.js';
import { shot } from './_3d.js';
import { beatScene, lines, at, front, dirW, sm, V } from '../lib/beatscene.js';
import { msidCast, msidPose, flicker, CHAND } from './s22_feerie.js';
import { c } from '../../../engine/core.js';

const L = lines('s23_aube');
const LAMPS = [[1385, 560], [1395, 650], [1500, 640]];   // the oil lights left by the door, canvas px
const AMINE = [L[2][0], L[2][1]], CHEER = L[5][0];

const au = shot({
  plate: 'msid_facade_aube',
  async build() { return {}; },
  over(lt, u, t) {
    const f = sm(L[0][0], L[0][1], t);
    c.save(); c.globalCompositeOperation = 'screen';
    LAMPS.forEach(([x, y], i) => {
      const a = (.32 - .26 * f) * (.85 + .15 * K.noise(t * 4, i));
      const g = c.createRadialGradient(x, y, 0, x, y, 90); g.addColorStop(0, `rgba(255,${210 + 30 * f},${120 + 40 * f},${a})`); g.addColorStop(1, 'rgba(255,220,140,0)');
      c.fillStyle = g; c.fillRect(x - 90, y - 90, 180, 180);
    });
    c.restore();
    // two sparrows fluttering round the lights: small dark bodies, wings beating fast
    for (let i = 0; i < 2; i++) {
      const ph = t * (.55 + .12 * i) + i * 2.1;
      const x = 1440 + 110 * Math.sin(ph * 2.1) + 40 * Math.sin(ph * 5.3), y = 560 + 70 * Math.sin(ph * 1.6 + i) + 25 * Math.cos(ph * 4.1);
      const fl = Math.sin(t * 38 + i * 3), dir = Math.cos(ph * 2.1) >= 0 ? 1 : -1;
      c.save(); c.translate(x, y); c.scale(dir, 1);
      c.fillStyle = '#3a2e26';
      c.beginPath(); c.ellipse(0, 0, 13, 8, -.2, 0, Math.PI * 2); c.fill();   // body
      c.beginPath(); c.arc(11, -5, 6, 0, Math.PI * 2); c.fill();              // head
      c.fillStyle = '#5a4434';
      c.beginPath(); c.moveTo(-2, -3); c.lineTo(-14, -3 - 18 * fl); c.lineTo(6, -4); c.fill();   // wing
      c.beginPath(); c.moveTo(-12, 0); c.lineTo(-24, -4); c.lineTo(-22, 4); c.fill();             // tail
      c.restore();
    }
  },
});

const fe = shot({
  plate: 'msid_feerie',
  light: { keyI: .75 },
  async build(S3) {
    const st = await msidCast(S3);
    const up = S3.floorAt(CHAND[1][0], 760).add(V(0, 2.6, 0));
    const open = (a, i) => (lt, t) => {
      if (t >= AMINE[0] && t < AMINE[1] + .2) return { open: .45 + .15 * Math.sin(t * 9 + i) };
      if (t >= CHEER - .1) return { open: .55 };
      return { open: 0 };
    };
    return { ...st, up, actors: [st.fq, ...st.kids], faces: [[st.fq, 'fqih', 5], ...st.kids.map((a, i) => [a, null, i, open(a, i)])] };
  },
  frame(lt, u, t, S, st) {
    const { fq, kids, up } = st;
    msidPose(st, t, t < L[1][0] ? .3 : 0);
    // the fqih: open hands in offering, palms up, eyes to the ceiling (b087, b089, b090 lower to his pupils)
    const kf = fq.group.scale.y / 1.6, o = sm(L[1][0] - .4, L[1][0] + .6, t);
    const toPupils = sm(L[4][0] - .4, L[4][0] + .4, t);
    for (const [s, r] of [['L', -1], ['R', 1]]) PO.reach(fq, s, front(fq, 'root', .22 * kf, .12 * r * kf, .05 * kf).lerp(front(fq, 'chest', .32 * kf, .26 * r * kf, -.02 * kf), o * (1 - .5 * toPupils)), { grip: .06 });
    PO.look(fq, toPupils > .5 ? at(kids[4], 'head') : up, .7);
    // the pupils: b088 heads up, hands lifted; b091 the cheer: arms flung up, bouncing
    const am = sm(AMINE[0] - .2, AMINE[0] + .3, t) * (1 - sm(AMINE[1], AMINE[1] + .6, t)), ch = sm(CHEER - .1, CHEER + .4, t);
    kids.forEach((a, i) => {
      const k = a.group.scale.y / 1.2;
      if (am > 0) for (const [s, r] of [['L', -1], ['R', 1]]) PO.reach(a, s, front(a, 'chest', .25 * k, .2 * r * k, .05 * k).lerp(front(a, 'chest', .25 * k, .22 * r * k, .2 * k), am), { grip: .06 });
      if (ch > 0) {
        const b = Math.abs(Math.sin(t * 7 + i * 1.3));
        for (const [s, r] of [['L', -1], ['R', 1]]) PO.reach(a, s, front(a, 'chest', .1 * k, .18 * r * k, (.15 + .3 * ch + .06 * b) * k), { grip: .03 });
        a.B.spine.rotation.x -= .08 * ch * b; a.B.spine.updateWorldMatrix(false, true);
      }
      PO.look(a, am > 0 ? up : at(fq, 'head'), am > 0 ? .5 : .6);
    });
  },
  over(lt, u, t) {
    flicker(t, .35);   // the oil lights burnt low
    c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = 'rgba(200,210,235,.55)'; c.fillRect(-1920, -1080, 5760, 3240); c.restore();   // pale dawn
  },
});

export { au, fe };
export default beatScene('s23_aube', {
  shots: { au, fe },
  plan: {
    b086: { shot: 'au', size: 'W' },
    b087: { shot: 'fe', size: 'M', on: 'fqih' },
    b088: { shot: 'fe', size: 'W' },
    b089: { shot: 'fe', size: 'CU', on: 'fqih' },
    b090: { shot: 'fe', size: 'M', on: 'fqih' },
    b091: { shot: 'fe', size: 'W' },
  },
});
