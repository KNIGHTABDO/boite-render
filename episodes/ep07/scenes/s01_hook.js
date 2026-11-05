// s01 hook (v2, ep06 pattern): calm narration over two establishing paintings, then the rosette title (s02_titre).
// b000a: the white terraces of Fès in late-afternoon gold, women trying tambourines on the roofs; a slow drift right.
// b000b: night over the medina, a far glow of coloured lights in an alley, a small boy watching from a roof; slow push, fade out.
// No razor here: it first appears at s16 (the v1 cold open was rejected).
import { beatScene } from '../lib/beatscene.js';

export default beatScene('s01_hook', {
  fadeIn: 1.2, fadeOut: 1.0,
  plan: {
    b000a: { shot: 'h01_ville_tambourins', move: 'panR' },
    b000b: { shot: 'h02_nuit_promesse', move: 'push', dissolve: true },
  },
});
