// s10: flashback, the barber Sidi Mohammed ben Tahar (painting P5): all in white, sparse beard, eternal smile; then in
// our impasse with his alfa basket on his arm (vegetables, sometimes a piece of meat).
import { make, st } from './_pt.js';

export default make({
  plate: 'impasse_jour',
  segs: [
    st('p05a_coiffeur', [0, 0], 'push'),
    st('p05b_coiffeur', [1, 0], 'panR'),
  ],
});
