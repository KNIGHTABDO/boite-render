// s16: the father's story (paintings P9): the pious slipper-seller in the busy souk who closes his shop to follow a
// beggar's bier nobody follows (P9a/P9b); his neighbours gossip (P9c); his answer: behind the bier walked angels of
// light (P9d); since then, Mohammed greets every passing bier, whispering the formula (P9e: the boy in the impasse,
// hand on his heart, as two bearers go by).
import { make, st } from './_pt.js';

export default make({
  plate: 'impasse_jour',
  segs: [
    st('p09a_boutiquier', [0, 0], 'push'),
    st('p09b_civiere', [1, 0], 'panR'),
    st('p09c_boutiquiers', [2, 0], 'face'),
    st('p09d_anges', [3, 0], 'rise'),
    st('p09d_anges', [4, 0], 'pull'),
    st('p09e_salut', [5, 0], 'pushL'),
  ],
});
