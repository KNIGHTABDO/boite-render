// Per-character skeleton specs (auto-estimated by tools/autospec.mjs, with manual overrides).
const auto = await (await fetch(new URL('./specs.auto.json', import.meta.url))).json();
const OVERRIDE = {
  mohammed: { shoulder: [.17, .34], elbow: [.27, .06], headR: .1, fixSkin: '#d99c70' },
  zineb: { headR: .1, fixSkin: '#d9a078' },
  zoubida: { neck: .48, head: .54 },
  father: { neck: .48, head: .54 },
  rahma: { neck: .54, head: .6 },
  chouafa: { neck: .53, head: .59, shoulder: [.2, .5], elbow: [.34, .18], wrist: [.45, -.1], hand: [.5, -.24], armR: .08 },
  fqih: { neck: .57, head: .63 },
  abdallah: { neck: .61, head: .67 },
  woman1: { neck: .58, head: .64 },
  woman2: { neck: .57, head: .63, fixSkin: '#c8946e' },
  man1: { neck: .52, head: .58 },
  aicha: { neck: .53, head: .56 },
  fatma: { neck: .53, head: .59 },
  driss: { neck: .52, head: .57 },
  moqadma: { neck: .53, head: .59 },
  zoubida_haik: { neck: .48, head: .54, armMinY: .02, smooth: 2, armR: .05, capeHands: true, elbow: [.29, .2], wrist: [.31, -.01], hand: [.34, -.17] },
  aicha_haik: { neck: .53, head: .56 },
  mohammed_gris: { shoulder: [.17, .34], elbow: [.27, .06], headR: .1, fixSkin: '#d99c70' },
  guerrab: { neck: .41, head: .46 },
  kid1: { headR: .1 },
  kid2: { headR: .1 },
  kid3: { headR: .1 },
  grand1: { headR: .09 },
  grand2: { headR: .09 },
  mohammed_rodin: { shoulder: [.17, .34], elbow: [.27, .06], headR: .1, fixSkin: '#d99c70' },
};
function torsoFn(tab) {
  return y => { if (y >= tab[0][0]) return tab[0][1]; for (let i = 1; i < tab.length; i++) if (y >= tab[i][0]) { const [a, va] = tab[i - 1], [b, vb] = tab[i]; return vb + (va - vb) * (y - b) / (a - b); } return tab[tab.length - 1][1]; };
}
export const SPECS = {};
for (const [k, v] of Object.entries(auto)) { const s = { headR: .07, ...v, ...(OVERRIDE[k] || {}) }; s.torsoX = torsoFn(s.torso); SPECS[k] = s; }
