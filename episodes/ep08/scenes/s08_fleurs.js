// s08 "beau comme les fleurs". Same lunch blocking as s07 (lib/lunch.js). b038 Mohammed searches for the word, eyes
// up-left; b039 the father leans in, amused; b040 he lowers his eyes, hands fidget; b041 the whispered answer, eyes up on
// "fleurs"; b042 both parents rock back laughing, the boy still between them; b043 slow side-eye left, then right.
import { staged } from '../lib/fix8.js';
import { lapRest, plant, reachSafe } from '../lib/fix8a.js';
import { LUNCH } from '../lib/lunch.js';
import { beatScene, lines, sm, front } from '../lib/beatscene.js';

const ID = 's08_fleurs', L = lines(ID), B = i => L[i] || [0, 0];
const IN = (i, t) => t >= B(i)[0] - .15 && t < (B(i + 1)[0] || B(i)[1] + .3);
const f = (i, x) => B(i)[0] + x * (B(i)[1] - B(i)[0]);

const ch = staged('chambre_jour', {
  ...LUNCH,
  mohammed: { ...LUNCH.mohammed, look: (t, st) =>
    IN(0, t) ? front(st.A.mohammed, 'head', .9, .35, .22)   // searching for the word: a small glance up and aside, not the ceiling
    : IN(2, t) ? [850, 1040, .25]
    : IN(3, t) ? (t > f(3, .7) ? [850, 900, 1.15] : [850, 1040, .3])
    
    : IN(5, t) ? (t < f(5, .5) ? 'father' : 'zoubida') : null, lookMax: t => IN(5, t) ? .18 : .5 },   // Argon r5: side-eye = head nearly front, the eyes do it   // side-eye at each parent; he faces the lens (LUNCH), the head cap keeps the face to camera
  father: { ...LUNCH.father, height: 1.76, lookMax: .85, look: t => IN(1, t) || IN(3, t) ? 'mohammed' : IN(4, t) ? 'zoubida' : null },
  zoubida: { ...LUNCH.zoubida, look: t => IN(3, t) ? 'mohammed' : IN(4, t) ? 'father' : null },
}, {
  addressee: { father: 'mohammed', mohammed: 'father' },
  act(lt, t, S, st) {
    const { father: fa, zoubida: zo, mohammed: mo } = st.A;
    const k = a => a.group.scale.y / 1.6, kf = k(fa), kz = k(zo), km = k(mo);
    // b039 the father leans in over the boy (spine + chest, ≈ 20°)
    const lean = sm(B(1)[0], B(1)[0] + .7, t) * (1 - sm(B(2)[0], B(2)[0] + .6, t));
    fa.B.spine.rotation.x += .2 * lean; fa.B.chest.rotation.x += .16 * lean; fa.B.neck.rotation.x += .08 * lean;
    // b042 both parents rock back laughing: shoulders bounce, heads tip back
    const laugh = sm(B(4)[0], B(4)[0] + .4, t) * (1 - sm(B(4)[1] - .2, B(4)[1] + .5, t));
    for (const [a, ph] of [[fa, 0], [zo, 1.7]]) { a.B.spine.rotation.x -= (.16 + .05 * Math.sin(t * 2.4 + ph)) * laugh; a.B.chest.rotation.x += laugh * (-.12 + .1 * Math.sin(t * 11 + ph)); a.B.chest.rotation.z += .05 * laugh * Math.sin(t * 3.1 + ph); a.B.neck.rotation.x -= .22 * laugh; a.B.head.rotation.z += .08 * laugh * Math.sin(t * 2.3 + ph); }
    for (const a of [fa, zo, mo]) { a.B.spine.updateWorldMatrix(false, true); plant(a); }
    for (const a of [fa, zo, mo]) for (const s of ['L', 'R']) lapRest(a, s, t);
    if (laugh > 0) {
      // her palm stays in front of the ribs while she laughs; his hand pats the knee
      reachSafe(zo, 'R', front(zo, 'chest', .2 * kz, .05 * kz, .04 * kz), { grip: .03, pole: [-.35, -.1, .15] });
      const slap = Math.max(0, Math.sin(t * 5.5));
      reachSafe(fa, 'L', front(fa, 'root', .18 * kf, .14 * kf, (.06 + .12 * slap) * kf), { grip: .06, pole: [.35, -.05, .1] });
    }
    // b040–b041 the boy's hands fidget in front of his lap (fingers rubbing, thumbs turning)
    const fid = Math.max(win(2, 0, 1), win(3, 0, .65));
    if (fid > 0) for (const [s, ph] of [['L', 0], ['R', 1.3]]) {
      const w = Math.sin(t * 4.2 + ph), sign = s === 'L' ? 1 : -1;
      reachSafe(mo, s, front(mo, 'root', (.16 + .02 * w) * km, sign * (.1 + .02 * w) * km, (.05 + .02 * w) * km), { grip: .04, pole: [sign * .3, -.1, .1] });
    }
    function win(i, a, b) { const [t0, t1] = B(i), D = t1 - t0; return sm(t0 + a * D - .3, t0 + a * D + .2, t) * (1 - sm(t0 + b * D, t0 + b * D + .5, t)); }
  },
});

export default beatScene(ID, {
  shots: { ch },
  plan: {
    b038: { shot: 'ch', size: 'CU', on: 'mohammed', z: 1.8, dy: -60 },
    b039: { shot: 'ch', size: 'CU', on: 'father', z: 1.8, dy: -40 },
    b040: { shot: 'ch', size: 'CU', on: 'mohammed', z: 1.8, dy: -60 },
    b041: { shot: 'ch', size: 'CU', on: 'mohammed', z: 1.8, dy: -60 },
    b042: { shot: 'ch', size: 'W', on: 'mohammed' },   // both parents' heads in frame for the laugh
    b043: { shot: 'ch', size: 'CU', on: 'mohammed', z: 1.8, dy: -60 },
  },
});
