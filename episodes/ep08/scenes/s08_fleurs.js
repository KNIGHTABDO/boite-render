// s08 "beau comme les fleurs". Same lunch blocking as s07 (lib/lunch.js). b038 Mohammed searches for the word, eyes
// up-left; b039 the father leans in, amused; b040 he lowers his eyes, hands fidget; b041 the whispered answer, eyes up on
// "fleurs"; b042 both parents rock back laughing, the boy still between them; b043 slow side-eye left, then right.
import { staged } from '../lib/autostage.js';
import { LUNCH } from '../lib/lunch.js';
import { beatScene, lines, sm } from '../lib/beatscene.js';

const ID = 's08_fleurs', L = lines(ID), B = i => L[i] || [0, 0];
const IN = (i, t) => t >= B(i)[0] - .15 && t < (B(i + 1)[0] || B(i)[1] + .3);
const f = (i, x) => B(i)[0] + x * (B(i)[1] - B(i)[0]);

const ch = staged('chambre_jour', {
  ...LUNCH,
  mohammed: { ...LUNCH.mohammed, look: t =>
    IN(0, t) ? [560, 900, 1.25]
    : IN(2, t) ? [850, 1040, .25]
    : IN(3, t) ? (t > f(3, .7) ? [850, 900, 1.15] : [850, 1040, .3])
    : IN(5, t) ? (t < f(5, .5) ? 'father' : 'zoubida') : null },
  father: { ...LUNCH.father, look: t => IN(1, t) || IN(3, t) ? 'mohammed' : IN(4, t) ? 'zoubida' : null },
  zoubida: { ...LUNCH.zoubida, look: t => IN(3, t) ? 'mohammed' : IN(4, t) ? 'father' : null },
}, {
  addressee: { father: 'mohammed', mohammed: 'father' },
  act(lt, t, S, st) {
    const { father: fa, zoubida: zo, mohammed: mo } = st.A;
    const lean = sm(B(1)[0], B(1)[0] + .7, t) * (1 - sm(B(2)[0], B(2)[0] + .6, t));
    fa.B.chest.rotation.x += .16 * lean;
    const laugh = sm(B(4)[0], B(4)[0] + .4, t) * (1 - sm(B(4)[1] - .2, B(4)[1] + .5, t));
    for (const [a, ph] of [[fa, 0], [zo, 1.7]]) a.B.chest.rotation.x += laugh * (-.14 + .05 * Math.sin(t * 13 + ph));
    const fid = IN(2, t) ? 1 : 0;   // hands fidget: small alternate wrist roll
    if (fid) { mo.B.handL && (mo.B.handL.rotation.z += .25 * Math.sin(t * 5)); mo.B.handR && (mo.B.handR.rotation.z -= .25 * Math.sin(t * 5 + 1)); }
    for (const a of [fa, zo, mo]) a.B.chest.updateWorldMatrix(false, true);
  },
});

export default beatScene(ID, {
  shots: { ch },
  plan: {
    b038: { shot: 'ch', size: 'CU', on: 'mohammed' },
    b039: { shot: 'ch', size: 'CU', on: 'father' },
    b040: { shot: 'ch', size: 'CU', on: 'mohammed' },
    b041: { shot: 'ch', size: 'CU', on: 'mohammed' },
    b042: { shot: 'ch', size: 'M', on: 'mohammed' },
    b043: { shot: 'ch', size: 'CU', on: 'mohammed' },
  },
});
