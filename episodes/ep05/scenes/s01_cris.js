// s01: cold open. Women on the terrace walls of the impasse shout "Qui est mort ?" (P1, a crowd: painting), then the
// narrator: death entered the impasse, but it all began that morning with a smile (the same painting, pulled back wide).
import { make, st } from './_pt.js';

export default make({
  plate: 'terrasse', fadeIn: .4,
  segs: [
    st('p01_cris', [0, 0], 'pushL'),
    st('p01_cris', [1, .5], 'pull'),
  ],
});
