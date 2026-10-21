// s19: the fever dream (paintings): through his lashes, angels come down from the ceiling (R1); one sets his Boîte à
// Merveilles on the bed and it grows into a palace (R2); inside, a garden smelling of roses and orange blossom (R3); two
// sparrows on a wall chatter about dried figs (R4, held through their five lines).
import { make, st } from './_pt.js';

export default make({
  plate: 'ep05/chambre_penombre',
  segs: [
    st('r1_anges', [0, 0], 'sink'),
    st('r2_boite', [1, 0], 'pull'),
    st('r3_jardin', [2, 0], 'panR'),
    st('r4_moineaux', [3, 0], 'push'),
    st('r4_moineaux', [6, 0], 'faceL'),
  ],
});
