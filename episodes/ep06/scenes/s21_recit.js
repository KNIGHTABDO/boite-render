// s21: the patio from the balconies. The women lean on their rails (Zoubida with Mohammed on a hidden stool, Fatma, Rahma on the
// 2nd floor); Lalla Kanza crosses the patio and spreads an old rug (0); Rahma, seen to the chest, begins her story (1) and drops
// her voice, mock-serious (2). Staging shared with s20 (patioShot): hands on the rail top, rail repainted over the lower bodies.
import { make, ac } from './_pt.js';
import { all, V } from './_3d.js';
import { patioShot, timing } from './s20_chant.js';
const { L } = await timing('s21_recit');
const WALK = 3.5, SPREAD = 8.5, A1 = L[1][0], A2 = L[2][0];
const patio = patioShot([
  { t: 0, v: [1300, 440, 1.4] }, { t: 3, on: 'rahma', z: 2.7, hy: .3, dy: 10 }, { t: 5.5, v: [1150, 650, 1.35] }, { t: 10, on: 'rahma', z: 2.4, hy: .32, dy: 10 }, { t: 11.5, v: [1330, 440, 1.5] },
  { t: A1, on: 'rahma', z: 2.7, hy: .3, dy: 10 }, { t: A1 + 8, on: 'rahma', z: 2.3, hy: .32, dy: 10 }, { t: A2, on: 'rahma', z: 3.0, hy: .3, dy: 10 },
], (t) => {
  const r1 = t >= A1 && t < A1 + L[1][1] - L[1][0], r2 = t >= A2;
  return {
    zoubida: { look: t < A1 ? 'kanza' : 'rahma', laugh: 0 }, mohammed: { look: t < A1 ? 'kanza' : 'rahma' }, fatma: { look: t < A1 ? 'kanza' : 'rahma' },
    rahma: { talk: r1 || r2 ? 1 : 0, look: 'zoubida' }, kanza: { walk: WALK, spread: SPREAD, look: 'rahma' },
  };
});
export default make({ preload: all(patio), plate: 'patio_matin', segs: [ac([0, 0], patio.fn)] });
