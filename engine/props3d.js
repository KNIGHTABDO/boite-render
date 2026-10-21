// Real-size 3D props for Stage3D (metres). Same toon shading + ink hull as the actors, so they sit in the same world.
// Sizes are real Fassi household objects of the 1920s-30s:
//   tea glass 9.5 cm (rim Ø 6, base Ø 4.5) · teapot (berrad) 22 cm with lid, body Ø 12 · brass tray (siniya) Ø 46
//   tabla (meida) Ø 64, 30 cm high · sedari mattress 190 x 75 x 14 · cushion 50 x 40 x 15 · sheepskin ~ 100 x 70
//   clay brazier (majmar) Ø 30, 20 cm · bier (naach) 190 x 55, poles 260 · babouche 27 cm · louha (planchette) 40 x 26
//   oil lamp (qandil) clay Ø 9 · copper chain links 1.2 cm
// Each factory returns a THREE.Group whose origin is on the floor (or on its base), with userData anchors in local metres
// (e.g. glass.userData.rim, pot.userData.spout) for IK hands and pour streams.
import * as THREE from 'three';

const ramp = (() => { const g = new THREE.DataTexture(new Uint8Array([120, 190, 255]), 3, 1, THREE.RedFormat); g.minFilter = g.magFilter = THREE.NearestFilter; g.needsUpdate = true; return g; })();
const mats = {};
/** toon material by colour (cached). o.opacity for glass */
export const toon = (col, o = {}) => { const k = col + JSON.stringify(o); return mats[k] ||= new THREE.MeshToonMaterial({ color: col, gradientMap: ramp, transparent: o.opacity != null, opacity: o.opacity ?? 1, side: o.side ?? THREE.FrontSide, depthWrite: o.opacity == null || o.opacity > .7 }); };
const inkMat = th => { const m = new THREE.MeshBasicMaterial({ color: 0x1f1612, side: THREE.BackSide }); m.onBeforeCompile = sh => { sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>\n transformed += normalize(objectNormal) * ${th.toFixed(4)};`); }; return m; };
const INKS = {};
/** mesh + inverted-hull ink line (th = line thickness in metres; thin objects need thin lines) */
function M(geo, mat, th = .004, shadow = true) {
  const g = new THREE.Group(), m = new THREE.Mesh(geo, mat); m.castShadow = shadow; m.receiveShadow = true; g.add(m);
  if (th > 0) { const h = new THREE.Mesh(geo, INKS[th] ||= inkMat(th)); g.add(h); }
  return g;
}
/** lathe from a profile of [radius, height] points (metres) */
const lathe = (pts, seg = 40) => { const g = new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg); g.computeVertexNormals(); return g; };
const box = (w, h, d, r = 0) => { const g = r ? roundBox(w, h, d, r) : new THREE.BoxGeometry(w, h, d); g.translate(0, h / 2, 0); return g; };
function roundBox(w, h, d, r) {
  // soft cushion-like box: a box with its vertices pushed toward a rounded shape
  const g = new THREE.BoxGeometry(w, h, d, 10, 4, 10), p = g.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const ix = Math.max(0, Math.abs(v.x) - (w / 2 - r)), iy = Math.max(0, Math.abs(v.y) - (h / 2 - r)), iz = Math.max(0, Math.abs(v.z) - (d / 2 - r));
    const l = Math.hypot(ix, iy, iz); if (l > 0) { const k = r / l; v.x = Math.sign(v.x) * ((w / 2 - r) + ix * k); v.y = Math.sign(v.y) * ((h / 2 - r) + iy * k); v.z = Math.sign(v.z) * ((d / 2 - r) + iz * k); }
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals(); return g;
}

// ---------------------------------------------------------------- tea
/** Fassi tea glass, 9.5 cm. fill 0..1 (tea level), col = tea colour. userData.rim = rim centre (local) */
export function teaGlass({ fill = .7, tea = 0x9a5a1a, band = 0xd8b04a } = {}) {
  const g = new THREE.Group();
  const prof = [[0, 0], [.0225, 0], [.0235, .004], [.026, .03], [.0285, .07], [.030, .095]];
  g.add(M(lathe(prof), toon(0xe8f0ee, { opacity: .45, side: THREE.DoubleSide }), .0012, false));
  const h = .006 + .085 * fill, r = .0225 + (.030 - .0225) * (h / .095) - .0015;
  if (fill > 0) g.add(M(lathe([[0, .005], [.022, .005], [r, h], [0, h]]), toon(tea), 0, false));
  g.add(M(lathe([[.0275, .060], [.0287, .072], [.0281, .074], [.0269, .062]]), toon(band), 0, false));   // gilded band
  g.userData = { rim: new THREE.Vector3(0, .095, 0), h: .095, grip: new THREE.Vector3(0, .05, 0) };
  return g;
}
/** Fassi teapot (berrad), 22 cm to the lid finial. userData.spout = spout tip, handle = grip point */
export function teapot({ col = 0xc9c3b4 } = {}) {
  const g = new THREE.Group(), m = toon(col);
  g.add(M(lathe([[0, 0], [.045, 0], [.047, .008], [.062, .05], [.06, .085], [.045, .11], [.03, .125], [.032, .13], [0, .13]]), m));   // body
  g.add(M(lathe([[0, .13], [.034, .13], [.03, .15], [.016, .17], [.01, .19], [.014, .205], [0, .22]]), m, .003));            // lid + finial
  // spout: a tapered tube rising forward (+z)
  const sp = new THREE.CatmullRomCurve3([new THREE.Vector3(0, .045, .052), new THREE.Vector3(0, .085, .1), new THREE.Vector3(0, .14, .135), new THREE.Vector3(0, .165, .15)]);
  g.add(M(new THREE.TubeGeometry(sp, 16, .008, 10), m, .0025));
  // handle: a loop at the back (-z)
  const hc = new THREE.CatmullRomCurve3([new THREE.Vector3(0, .11, -.04), new THREE.Vector3(0, .135, -.085), new THREE.Vector3(0, .085, -.105), new THREE.Vector3(0, .04, -.07), new THREE.Vector3(0, .03, -.055)]);
  g.add(M(new THREE.TubeGeometry(hc, 20, .0075, 8), m, .0025));
  g.userData = { spout: new THREE.Vector3(0, .165, .15), handle: new THREE.Vector3(0, .1, -.1), h: .22 };
  return g;
}
/** brass tray (siniya) Ø 46 on short feet. userData.top = tray surface height */
export function tray({ r = .23, col = 0xc89a3a } = {}) {
  const g = new THREE.Group();
  g.add(M(lathe([[0, .025], [r - .01, .025], [r, .04], [r - .004, .042], [r - .012, .03], [0, .03]], 60), toon(col), .003));
  for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2, f = M(new THREE.CylinderGeometry(.01, .013, .025, 10).translate(0, .0125, 0), toon(0xa07a2a), .002); f.position.set(Math.cos(a) * r * .6, 0, Math.sin(a) * r * .6); g.add(f); }
  g.userData = { top: .03, r };
  return g;
}
/** round low table (tabla / meida), Ø 64, 30 cm. userData.top = top surface height */
export function tabla({ r = .32, h = .30, col = 0x7a4a26, rimCol = 0x5a321a } = {}) {
  const g = new THREE.Group();
  g.add(M(lathe([[0, h - .025], [r, h - .025], [r + .005, h - .012], [r, h], [0, h]], 64), toon(col), .004));
  g.add(M(lathe([[r * .78, 0], [r * .8, .02], [r * .74, h - .04], [r * .8, h - .025], [r * .7, h - .025], [r * .66, .02], [r * .7, 0]], 48), toon(rimCol), .004));   // turned skirt
  g.userData = { top: h, r };
  return g;
}

// ---------------------------------------------------------------- soft furnishings
/** sedari mattress (along x), 190 x 75 x 14. userData.top = sitting height */
export function mattress({ w = 1.9, d = .75, h = .14, col = 0x8a2a2a } = {}) {
  const g = M(box(w, h, d, .05), toon(col), .004);
  g.userData = { top: h, w, d };
  return g;
}
/** cushion / pillow 50 x 40 x 15 */
export function cushion({ w = .5, d = .4, h = .15, col = 0xb8823a } = {}) { const g = M(box(w, h, d, .06), toon(col), .003); g.userData = { top: h }; return g; }
/** sheepskin on the floor, ~100 x 70, 3 cm thick, irregular outline */
export function sheepskin({ col = 0xe8dcc0, seed = 3 } = {}) {
  const s = new THREE.Shape(), n = 28;
  for (let i = 0; i <= n; i++) { const a = i / n * Math.PI * 2, wob = .85 + .15 * Math.sin(a * 5 + seed) * Math.sin(a * 3 - seed), r = wob * (Math.abs(Math.cos(a)) * .5 + Math.abs(Math.sin(a)) * .35); const x = Math.cos(a) * r, z = Math.sin(a) * r; i ? s.lineTo(x, z) : s.moveTo(x, z); }
  const geo = new THREE.ExtrudeGeometry(s, { depth: .03, bevelEnabled: true, bevelThickness: .01, bevelSize: .02, bevelSegments: 2 }); geo.rotateX(Math.PI / 2); geo.translate(0, .04, 0);
  const g = M(geo, toon(col), .003); g.userData = { top: .035 }; return g;
}
/** straw mat (hasira) rectangle on the floor */
export function mat({ w = 1.8, d = 1.0, col = 0xc8b07a } = {}) { const g = M(box(w, .012, d), toon(col), .002); g.userData = { top: .012 }; return g; }

// ---------------------------------------------------------------- fire, light, house
/** clay brazier (majmar) Ø 30, 20 cm, glowing coals; userData.top = grill height */
export function brazier({ glow = 1 } = {}) {
  const g = new THREE.Group();
  g.add(M(lathe([[.08, 0], [.11, .02], [.1, .08], [.15, .14], [.155, .2], [.14, .2], [.13, .15], [0, .15]], 40), toon(0xa0522d), .004));
  const coal = new THREE.Mesh(new THREE.CircleGeometry(.13, 24).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff6a20).multiplyScalar(.6 + .4 * glow) })); coal.position.y = .17; g.add(coal);
  g.userData = { top: .2, coals: new THREE.Vector3(0, .17, 0) };
  return g;
}
/** small clay oil lamp, Ø 9 cm; userData.flame */
export function oilLamp() {
  const g = new THREE.Group();
  g.add(M(lathe([[0, 0], [.03, 0], [.045, .02], [.04, .035], [.012, .04], [.012, .045], [0, .045]], 24), toon(0xb06a3a), .002));
  g.userData = { flame: new THREE.Vector3(.045, .045, 0), top: .045 };
  return g;
}

// ---------------------------------------------------------------- msid, funeral, small things
/** wooden planchette (louha) 40 x 26 x 1.5 cm with a handle tab; origin = bottom edge centre, board stands in xy */
export function louha({ col = 0xd8b880 } = {}) {
  const s = new THREE.Shape(); s.moveTo(-.13, 0); s.lineTo(.13, 0); s.lineTo(.13, .36); s.quadraticCurveTo(.13, .4, .05, .4); s.lineTo(-.05, .4); s.quadraticCurveTo(-.13, .4, -.13, .36); s.lineTo(-.13, 0);
  const geo = new THREE.ExtrudeGeometry(s, { depth: .015, bevelEnabled: false }); geo.translate(0, 0, -.0075);
  const g = M(geo, toon(col), .002); g.userData = { top: new THREE.Vector3(0, .4, 0) }; return g;
}
/** funeral bier (naach) carried on two poles, body wrapped in white; length along x. userData.grips = 4 pole ends (local) */
export function bier({ len = 1.9, w = .55, pole = 2.6, shroud = 0xf2eee2, cloth = 0x2e5a3a } = {}) {
  const g = new THREE.Group(), wood = toon(0x6a4424);
  for (const z of [-w / 2, w / 2]) { const p = M(new THREE.CylinderGeometry(.022, .022, pole, 10).rotateZ(Math.PI / 2), wood, .003); p.position.set(0, 0, z); g.add(p); }
  for (const x of [-len / 2 + .1, 0, len / 2 - .1]) { const r = M(new THREE.BoxGeometry(.04, .03, w), wood, .002); r.position.set(x, .01, 0); g.add(r); }
  const body = M(box(len * .92, .2, w * .78, .08), toon(shroud), .004); body.position.y = .02; g.add(body);
  const drape = M(box(len * .7, .03, w * .9, .012), toon(cloth), .003); drape.position.y = .21; g.add(drape);
  g.userData = { grips: [[-pole / 2 + .1, 0, -w / 2], [-pole / 2 + .1, 0, w / 2], [pole / 2 - .1, 0, -w / 2], [pole / 2 - .1, 0, w / 2]].map(v => new THREE.Vector3(...v)) };
  return g;
}
/** one babouche (yellow leather slipper), 27 cm along +z; pair() gives two */
export function babouche({ col = 0xe0b030 } = {}) {
  const geo = lathe([[0, 0], [.045, 0], [.048, .02], [.04, .045], [0, .05]], 24); geo.scale(1, 1, 2.8); geo.translate(0, 0, .02);
  const g = M(geo, toon(col), .002); g.userData = { len: .27 }; return g;
}
export function babouches(o) { const g = new THREE.Group(), a = babouche(o), b = babouche(o); a.position.x = -.055; b.position.x = .055; a.rotation.y = .06; b.rotation.y = -.06; g.add(a, b); return g; }
/** thin copper chain hanging between two local points (for the chaînette scene) */
export function chain(a, b, { sag = .05, links = 26, col = 0xc8743a } = {}) {
  const g = new THREE.Group(), A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
  const geo = new THREE.TorusGeometry(.005, .0013, 6, 10), m = toon(col);
  for (let i = 0; i < links; i++) {
    const t = i / (links - 1), p = A.clone().lerp(B, t); p.y -= Math.sin(t * Math.PI) * sag;
    const l = new THREE.Mesh(geo, m); l.position.copy(p); l.rotation.set(0, i % 2 ? Math.PI / 2 : 0, 0); l.castShadow = true; g.add(l);
  }
  return g;
}

/** a pour stream (tea, water): stream() makes the mesh, stream(m, from, to) re-shapes it between two world points */
export function stream(m, a, b, { r = .0028, col = 0xa8641e } = {}) {
  if (!m) { m = new THREE.Mesh(new THREE.BufferGeometry(), toon(col, { opacity: .8 })); m.castShadow = false; return m; }
  m.geometry.dispose(); m.geometry = new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, a.clone().lerp(b, .35), b), 12, r, 6);
  return m;
}

// ---------------------------------------------------------------- ep05 household props (real sizes)
/** low wooden stool (tbourda) 30 x 30, 15 cm. userData.top = seat height */
export function stool({ h = .15, w = .3, col = 0x8a5a32 } = {}) {
  const g = new THREE.Group(), m = toon(col);
  g.add(M(box(w, .025, w), m, .003)); g.children[0].position.y = h - .025;
  for (const [x, z] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) { const l = M(box(.03, h - .025, .03), m, .002); l.position.set(x * (w / 2 - .025), 0, z * (w / 2 - .025)); g.add(l); }
  g.userData = { top: h }; return g;
}
/** woven-rush stool (the painted patio kind): 4 cm square legs, top frame, rush seat woven in two directions, low
 * stretchers. h = seat top (the rush), userData.top = h */
export function rushStool({ h = .26, w = .32, wood = 0x6a4224, rush = 0xc9a764, dark = 0xa88748 } = {}) {
  const g = new THREE.Group(), mw = toon(wood), mr = toon(rush), md = toon(dark), L = .04, fr = .035, sy = h - .018;   // weave top = h
  for (const [x, z] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) { const l = M(box(L, h - .004, L), mw, .003); l.position.set(x * (w / 2 - L / 2), 0, z * (w / 2 - L / 2)); g.add(l); }
  for (const s of [1, -1]) for (const [y, t] of [[sy - fr / 2, fr], [.07, .022]]) {         // top frame rails + low stretchers, both directions
    const a = M(box(w - L, t, .026), mw, .002); a.position.set(0, y - t / 2, s * (w / 2 - L / 2)); g.add(a);
    const b = M(box(.026, t, w - L), mw, .002); b.position.set(s * (w / 2 - L / 2), y - t / 2 + (y < .1 ? .03 : 0), 0); g.add(b);
  }
  const seat = M(box(w - L * .9, .022, w - L * .9), mr, .002); seat.position.y = sy - .008; g.add(seat);
  const n = 9, st = (w - L) / n;                                                              // the weave: alternating darker bands
  for (let i = 0; i < n; i += 2) {
    const a = M(box(w - L, .004, st * .8), md, 0, false); a.position.set(0, sy + .014, -w / 2 + L / 2 + st * (i + .5)); g.add(a);
    const b = M(box(st * .8, .004, w - L), md, 0, false); b.position.set(-w / 2 + L / 2 + st * (i + 1.5), sy + .0145, 0); g.add(b);
  }
  g.userData = { top: h }; return g;
}
/** glazed clay basin (ghtar) Ø 32, 8.5 cm; fish:n small silver sardines in it. userData.rim, inside (centre of the bottom) */
export function bowl({ r = .16, h = .085, col = 0x9a5a2a, glaze = 0x2e6b4a, fish = 0, food = null } = {}) {
  const g = new THREE.Group();
  g.add(M(lathe([[0, 0], [r * .55, 0], [r * .62, .01], [r * .95, h * .8], [r, h], [r * .96, h], [r * .9, h * .8], [r * .55, .015], [0, .015]]), toon(glaze, { side: THREE.DoubleSide }), .003));
  if (food != null) g.add(M(lathe([[0, .016], [r * .8, .016], [r * .88, h * .6], [0, h * .62]]), toon(food), 0, false));
  for (let i = 0; i < fish; i++) { const f = sardine(), a = i * 2.4; f.position.set(Math.cos(a) * r * .3, .025 + i * .007, Math.sin(a) * r * .3); f.rotation.set(0, a + Math.PI / 2 + Math.sin(i * 3.1) * .4, (i % 2 ? 1 : -1) * 1.35); g.add(f); }   // on their sides, tails out, a loose heap
  g.userData = { rim: new THREE.Vector3(0, h, 0), inside: new THREE.Vector3(0, .02, 0), h, r }; return g;
}
/** a sardine 14 cm: silver belly, blue-grey back, forked tail. userData.head / tail for a hand grip */
export function sardine({ col = 0xb4c0ca, back = 0x3e5c74 } = {}) {
  const g = new THREE.Group(), body = new THREE.SphereGeometry(.0125, 12, 8); body.scale(1, .6, 5);
  g.add(M(body, toon(col), .0012, false));
  const top = new THREE.SphereGeometry(.0129, 12, 6, 0, Math.PI * 2, 0, Math.PI * .32); top.scale(1, .62, 5); top.translate(0, .0004, 0);
  g.add(M(top, toon(back), 0, false));
  for (const sd of [1, -1]) { const t = new THREE.ConeGeometry(.008, .022, 3); t.rotateX(Math.PI / 2); t.scale(.25, 1, 1); t.rotateY(sd * .45); t.translate(sd * .004, 0, -.072); g.add(M(t, toon(back), .001, false)); }
  g.userData = { head: new THREE.Vector3(0, 0, .055), tail: new THREE.Vector3(0, 0, -.06), len: .14 }; return g;
}
/** glazed jar (khabia) for khlii, 30 cm, red-brown glaze. userData.mouth */
export function jar({ col = 0x7a2e1a } = {}) {
  const g = new THREE.Group();
  g.add(M(lathe([[0, 0], [.07, 0], [.11, .08], [.12, .15], [.1, .23], [.065, .27], [.06, .3], [0, .3]]), toon(col)));
  for (const s of [1, -1]) { const e = M(new THREE.TorusGeometry(.025, .008, 6, 12, Math.PI), toon(col), .002); e.position.set(s * .1, .24, 0); e.rotation.z = s * -Math.PI / 2; g.add(e); }
  g.userData = { mouth: new THREE.Vector3(0, .3, 0), h: .3 }; return g;
}
/** round flat loaf (khobz) Ø 20, 4 cm */
export function bread({ r = .1, col = 0xc8924a } = {}) {
  const geo = new THREE.SphereGeometry(r, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2); geo.scale(1, .4, 1);
  const g = M(geo, toon(col), .002); g.userData = { top: r * .4 }; return g;
}
/** wooden comb (mchta) 12 x 5 cm, teeth along -y. userData.grip */
export function comb({ col = 0xd0a060 } = {}) {
  const g = new THREE.Group(), m = toon(col); g.add(M(box(.12, .02, .008), m, .0015)); g.children[0].position.y = -.0;
  for (let i = 0; i < 16; i++) { const t = M(box(.003, .03, .006), m, 0, false); t.position.set(-.055 + i * .0073, -.03, 0); g.add(t); }
  g.userData = { grip: new THREE.Vector3(0, .01, 0) }; return g;
}
/** hand bellows (rabouz) 45 cm: two boards hinged at the nozzle; set(o) opens 0..1. userData.grips = [top handle, bottom handle] */
export function bellows({ col = 0x9a6a3a, leather = 0x6a3a22 } = {}) {
  const g = new THREE.Group(), wood = toon(col), board = () => { const s = new THREE.Shape(); s.moveTo(0, -.03); s.lineTo(.26, -.11); s.quadraticCurveTo(.34, 0, .26, .11); s.lineTo(0, .03); s.closePath(); const geo = new THREE.ExtrudeGeometry(s, { depth: .012, bevelEnabled: false }); geo.rotateX(Math.PI / 2); return M(geo, wood, .002); };
  const top = new THREE.Group(), bot = new THREE.Group(); top.add(board()); bot.add(board()); g.add(top, bot);
  for (const b of [top, bot]) { const h = M(new THREE.CylinderGeometry(.012, .012, .1, 8), wood, .002); h.rotation.z = Math.PI / 2; h.position.set(.36, 0, 0); b.add(h); }
  const noz = M(new THREE.CylinderGeometry(.008, .015, .12, 10), toon(0xb08a3a), .002); noz.rotation.z = Math.PI / 2; noz.position.x = -.06; g.add(noz);
  // leather: the board outline, slightly inset, as a wedge whose thickness at x is the gap between the boards (2 x tan(a/2))
  const ls = new THREE.Shape(); ls.moveTo(.02, -.03); ls.lineTo(.25, -.1); ls.quadraticCurveTo(.32, 0, .25, .1); ls.lineTo(.02, .03); ls.closePath();
  const lg = new THREE.ExtrudeGeometry(ls, { depth: 1, bevelEnabled: false, curveSegments: 8 }); lg.translate(0, 0, -.5); lg.rotateX(Math.PI / 2);
  const base = lg.attributes.position.array.slice(), bag = M(lg, toon(leather), .002); g.add(bag);
  g.userData.set = o => { const a = .05 + .3 * o; top.rotation.z = a / 2; bot.rotation.z = -a / 2; top.position.y = .006; bot.position.y = -.006;
    const P = lg.attributes.position; for (let i = 0; i < P.count; i++) { const x = base[i * 3], y = base[i * 3 + 1]; P.setY(i, y * 2 * x * Math.tan(a / 2) * .96); }
    P.needsUpdate = true; lg.computeVertexNormals(); lg.computeBoundingSphere(); g.userData.grips = [top.localToWorld(new THREE.Vector3(.36, .01, 0)), bot.localToWorld(new THREE.Vector3(.36, -.01, 0))]; };
  g.userData.nozzle = new THREE.Vector3(-.12, 0, 0); g.userData.set(.5); return g;
}
/** zinc bucket (stal) Ø 28, 26 cm with bail handle; water:level 0..1. userData.rim */
export function bucket({ water = .7, col = 0x9aa4a8 } = {}) {
  const g = new THREE.Group();
  g.add(M(lathe([[0, 0], [.12, 0], [.14, .26], [.135, .26], [.115, .01], [0, .01]]), toon(col, { side: THREE.DoubleSide }), .003));
  if (water > 0) g.add(M(new THREE.CircleGeometry(.118 + .02 * water, 24).rotateX(-Math.PI / 2).translate(0, .26 * water, 0), toon(0x6a8ea0, { opacity: .8 }), 0, false));
  const bail = M(new THREE.TorusGeometry(.14, .004, 6, 24, Math.PI), toon(0x707a80), .0015); bail.position.y = .26; g.add(bail);
  g.userData = { rim: new THREE.Vector3(0, .26, 0), handle: new THREE.Vector3(0, .4, 0), h: .26 }; return g;
}
/** a bunch of mauve (khobbiza) 30 cm: stems with round leaves */
export function mauve({ col = 0x3a8a3a } = {}) {
  const g = new THREE.Group(), leaf = toon(col), stem = toon(0x5a9a40);
  for (let i = 0; i < 9; i++) {
    const a = i / 9 * Math.PI * 2, s = M(new THREE.CylinderGeometry(.002, .003, .25, 4), stem, 0, false); s.position.set(Math.cos(a) * .015, .12, Math.sin(a) * .015); s.rotation.set(Math.sin(a) * .3, 0, Math.cos(a) * .3); g.add(s);
    const l = M(new THREE.SphereGeometry(.03, 8, 4).scale(1, .2, 1), leaf, .0012, false); l.position.set(Math.cos(a) * .07, .24 + (i % 3) * .02, Math.sin(a) * .07); l.rotation.z = Math.cos(a) * .5; g.add(l);
  }
  g.userData = { grip: new THREE.Vector3(0, .04, 0) }; return g;
}
/** bumblebee 3 cm (body + two blurred wing discs). userData.flap(t) */
export function bee() {
  const g = new THREE.Group(), b = new THREE.SphereGeometry(.009, 10, 8); b.scale(1, 1, 1.6);
  g.add(M(b, toon(0x15131a), .0015, false));
  const wm = toon(0xd8e4ff, { opacity: .45, side: THREE.DoubleSide }), w = [1, -1].map(s => { const m = new THREE.Mesh(new THREE.CircleGeometry(.012, 10), wm); m.position.set(s * .012, .008, 0); m.rotation.x = -Math.PI / 2; g.add(m); return m; });
  g.userData.flap = t => w.forEach((m, i) => { m.rotation.z = (i ? -1 : 1) * Math.sin(t * 140) * .6; });
  return g;
}
/** cut-glass cabochon 2.5 cm (the boy's treasure) */
export function cabochon({ col = 0xd04060 } = {}) { const g = M(new THREE.OctahedronGeometry(.0125, 0), toon(col, { opacity: .8 }), .001, false); g.scale.set(1, .55, 1); return g; }
