// s22: Rahma tells the story of Si Othman and the butcher. 3D cut-backs on the patio (Rahma mimes the basket with a hand on her
// heart (0), the women laugh to tears (3), Rahma mimes the dozing butcher (5), Mohammed cheers beside his laughing mother (7)),
// Zoubida on the gallery "Continue !" (8); everything else is the p09a..g paintings.
import { make, ac, st } from './_pt.js';
import { all, V } from './_3d.js';
import { patioShot, galShot, galPose, timing } from './s20_chant.js';
const { L } = await timing('s22_othman');
const [T0, T3, T5, T7] = [L[0][0], L[3][0], L[5][0], L[7][0]], T8 = L[8][0];
const rug = { done: true };
const patio = patioShot([
  { t: T0, on: 'rahma', z: 2.4, hy: .33, dy: 10 }, { t: T0 + 6, on: 'rahma', z: 3.0, hy: .3, dy: 10 },
  { t: T3, v: [1150, 650, 1.35] },
  { t: T5, on: 'rahma', z: 3.0, hy: .3, dy: 10 }, { t: T5 + 9, on: 'rahma', z: 2.3, hy: .32, dy: 10 },
  { t: T7, on: 'mohammed', z: 2.1, hy: .5, dx: 70 },
], (t) => {
  const lg3 = t >= T3 && t < T3 + 5.5 ? .85 : 0, ch = t >= T7 && t < T8 ? 1 : 0, sp = t >= T5 && t < T5 + 16.8;
  return {
    zoubida: { look: 'rahma', laugh: lg3 || ch * .6 }, mohammed: { look: 'rahma', laugh: lg3, cheer: ch, bounce: ch * .07 * Math.abs(Math.sin(t * 8)) }, fatma: { look: 'rahma', laugh: lg3 },
    rahma: { talk: t < T3 || sp ? 1 : 0, heart: t < T3 ? 1 : 0, laugh: lg3 * .6, doze: sp && t < T5 + 9 ? 1 : 0, look: 'zoubida' }, kanza: { ...rug, laugh: lg3, look: 'rahma' },
  };
});
const gal = galShot([{ t: T8, on: 'zoubida', z: 2.4, hy: .42 }], (t) => ({ yaw: -.4, laugh: 0, talk: 1, call: .3 }));
export default make({
  preload: all(patio, gal), plate: 'patio_matin',
  segs: [ac([0, 0], patio.fn), st('p09a_joutyia', [1, 0], 'push'), st('p09b_salem', [2, 0], 'pushL'), ac([3, 0], patio.fn), st('p09c_chien', [4, 0], 'panR'),
    ac([5, 0], patio.fn), st('p09d_fondouk', [6, 0], 'pushR'), ac([7, 0], patio.fn), ac([8, 0], gal.fn), st('p09e_rose', [9, 0], 'pull'),
    st('p09f_porte', [10, 0], 'panL'), st('p09g_sourire', [11, 0], 'push')],
});
