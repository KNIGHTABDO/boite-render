// s12: downstairs in the barber's house, about twenty women on mattresses and mats, each newcomer announcing herself with
// shrill cries (P7a, crowd); the widow, voice broken, beating her cheeks and thighs (P7b, close-up) for her lament; a
// woman in a haik wails for her own mother (back to the crowd).
import { make, st } from './_pt.js';

export default make({
  plate: 'ep05/maison_coiffeur',
  segs: [
    st('p07a_pleureuses', [0, 0], 'pull'),
    st('p07b_veuve', [1, .35], 'face'),
    st('p07b_veuve', [3, 0], 'pushR'),
    st('p07a_pleureuses', [4, 0], 'panL'),
  ],
});
