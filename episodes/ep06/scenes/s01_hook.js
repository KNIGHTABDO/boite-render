// s01: the hook. Replays the s04 whitewash shot from the broom dip to the rampart of arms (s04 lines 3-4),
// under the narrator's teaser line. Same stage, same coverage camera, just a time offset.
import { make, ac } from './_pt.js';
import { all } from './_3d.js';
import { sh, L } from './s04_badigeon.js';
const T0 = L[3][0] + 5.5;   // just before the run, so the grab lands before the end of the hook
export default make({ preload: all(sh), plate: 'ep06/msid_menage', segs: [ac([0, 0], (lt, u, t, S) => sh.fn(lt + T0, u, t + T0, S))] });
