// Procedural rig for static character meshes (Rodin / Meta GLBs with no skeleton).
// Builds a skeleton from measured joint positions, skins every vertex by distance to bone capsules,
// normalises the model to height 1 with feet at y=0, and exposes pose helpers.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
function segDist(p, a, b) { const ab = b.clone().sub(a), t = Math.max(0, Math.min(1, p.clone().sub(a).dot(ab) / ab.lengthSq())); return p.distanceTo(a.clone().addScaledVector(ab, t)); }

/**
 * spec (model units, as authored):
 *  foot, ankle, knee, hip, legX, hem,          legs (x = +/-legX)
 *  neck, head, shoulder:[x,y], elbow:[x,y], wrist:[x,y], hand:[x,y], armR (arm capsule radius)
 *  top (top of head), bottom (sole)
 */
/** pull muddy grey-brown smudges (baked 'blush' artefacts) back toward the skin tone */
function fixSkin(map, skinHex) {
  const img = map.image, w = img.width, h = img.height, cv = new OffscreenCanvas(w, h), g = cv.getContext('2d');
  g.drawImage(img, 0, 0); const d = g.getImageData(0, 0, w, h), a = d.data;
  const sk = new THREE.Color(skinHex); const [sr, sg, sb] = [sk.r * 255, sk.g * 255, sk.b * 255];
  for (let i = 0; i < a.length; i += 4) {
    const r = a[i], gg = a[i + 1], b = a[i + 2], mx = Math.max(r, gg, b), mn = Math.min(r, gg, b), v = mx / 255, sat = mx ? (mx - mn) / mx : 0;
    if (v > .3 && v < .68 && sat > .08 && sat < .42 && r >= gg && gg >= b - 6) {
      const k = Math.min(1, (.68 - v) / .12) * Math.min(1, (.42 - sat) / .1) * Math.min(1, (v - .3) / .06);
      const lum = v / .62;  // keep relative shading
      a[i] = r + (Math.min(255, sr * lum) - r) * k; a[i + 1] = gg + (Math.min(255, sg * lum) - gg) * k; a[i + 2] = b + (Math.min(255, sb * lum) - b) * k;
    }
  }
  g.putImageData(d, 0, 0);
  const t = new THREE.CanvasTexture(cv); t.flipY = map.flipY; t.colorSpace = THREE.SRGBColorSpace; t.wrapS = map.wrapS; t.wrapT = map.wrapT; return t;
}

export async function loadRigged(url, spec, { outline = .004, ramp = [120, 190, 255], tint, seat = false } = {}) {
  const gltf = await new GLTFLoader().loadAsync(url);
  let src; gltf.scene.traverse(o => { if (o.isMesh && !src) src = o; });
  const geo = src.geometry.clone(); if (!geo.attributes.normal) geo.computeVertexNormals();
  const pos = geo.attributes.position, n = pos.count, V = (x, y, z = 0) => new THREE.Vector3(x, y, z);

  // ---- skeleton
  const B = {};
  const bone = (name, parent, p) => { const b = new THREE.Bone(); b.name = name; b.userData.abs = p.clone(); B[name] = b; if (parent) { parent.add(b); b.position.copy(p.clone().sub(parent.userData.abs)); } else b.position.copy(p); return b; };
  const S = spec;
  bone('root', null, V(0, S.hip));
  bone('spine', B.root, V(0, S.hip + (S.neck - S.hip) * .4));
  bone('chest', B.spine, V(0, S.hip + (S.neck - S.hip) * .78));
  bone('neck', B.chest, V(0, S.neck)); bone('head', B.neck, V(0, S.head));
  for (const [s, k] of [['L', 1], ['R', -1]]) {
    bone('thigh' + s, B.root, V(k * S.legX, S.hip)); bone('shin' + s, B['thigh' + s], V(k * S.legX, S.knee)); bone('foot' + s, B['shin' + s], V(k * S.legX, S.ankle));
    bone('upperArm' + s, B.chest, V(k * S.shoulder[0], S.shoulder[1])); bone('foreArm' + s, B['upperArm' + s], V(k * S.elbow[0], S.elbow[1])); bone('hand' + s, B['foreArm' + s], V(k * S.wrist[0], S.wrist[1]));
  }
  // seat: a lap sheet (hip -> between the knees -> down to the floor) carries the front-centre of a robe
  if (seat) { bone('lap', B.root, V(0, S.hip)); bone('lapD', B.lap, V(0, S.knee)); }
  const list = Object.values(B), idx = Object.fromEntries(list.map((b, i) => [b.name, i]));

  // ---- capsules for the arms (the only parts that need distance-based skinning)
  const cap = [];
  for (const [s, k] of [['L', 1], ['R', -1]]) {
    const sh = V(k * S.shoulder[0], S.shoulder[1]), el = V(k * S.elbow[0], S.elbow[1]), wr = V(k * S.wrist[0], S.wrist[1]), hd = V(k * S.hand[0], S.hand[1]);
    cap.push({ b: 'upperArm' + s, a: sh, z: el, r: S.armR }, { b: 'foreArm' + s, a: el, z: wr, r: S.armR * 1.15 }, { b: 'hand' + s, a: wr, z: hd, r: S.armR * .9 });
  }
  // ---- pass 1: arm weight per vertex (soft capsule membership), then diffuse it over the mesh surface
  const p = new THREE.Vector3(), armSide = new Int8Array(n), armW = new Float32Array(n), along = new Float32Array(n), keep = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    p.set(pos.getX(i), pos.getY(i), 0);
    let best = null, bd = 1e9; for (const c of cap) { const d = segDist(p, c.a, c.z) / c.r; if (d < bd) { bd = d; best = c; } }
    armSide[i] = best.a.x > 0 ? 1 : -1;
    const inner = S.torsoX(p.y), ax = Math.abs(p.x);
    // inside the torso silhouette only the top of the shoulder belongs to the arm
    const gate = p.y > S.shoulder[1] - S.armR * 1.2 ? 1 : ss(inner - S.armR * .6, inner + S.armR * .2, ax);
    armW[i] = (1 - ss(.85, 1.25, bd)) * gate * (ax > S.shoulder[0] * .75 ? 1 : 0);
    // the hand itself is always arm, even where the drawn fingers overlap the robe (gated fingertips stayed on the body and
    // stretched into skin spikes when the hand moved)
    const onHand = best.b.startsWith('hand') && bd < 1;
    if (onHand) armW[i] = Math.max(armW[i], 1 - ss(.85, 1, bd));
    // how much diffused arm weight a vertex may take: robe flanks below the hips stay on the body (raised arms pulled them into spikes)
    keep[i] = (p.y > S.shoulder[1] - S.armR * 1.2 ? 1 : ss(inner - S.armR * 1.6, inner + S.armR * .2, ax)) * (p.y < S.hip + .05 ? 1 - ss(1, 1.6, bd) : 1);
    // cape actors (haik): the arms are hidden under the cloth, only the hands come out, so only they may move
    if (onHand) keep[i] = 1;
    if (S.armMinY != null && p.y > S.armMinY) { armW[i] = 0; keep[i] = 0; }
    // position along the chain: 0 shoulder .. 1 elbow .. 2 wrist .. 3 hand end
    const k = armSide[i], chain = [V(k * S.shoulder[0], S.shoulder[1]), V(k * S.elbow[0], S.elbow[1]), V(k * S.wrist[0], S.wrist[1]), V(k * S.hand[0], S.hand[1])];
    let bestT = 0, bestD = 1e9; for (let sgi = 0; sgi < 3; sgi++) { const A = chain[sgi], Z = chain[sgi + 1], ab = Z.clone().sub(A), t = Math.max(0, Math.min(1, p.clone().sub(A).dot(ab) / ab.lengthSq())), d = p.distanceTo(A.clone().addScaledVector(ab, t)); if (d < bestD) { bestD = d; bestT = sgi + t; } }
    along[i] = bestT;
  }
  // adjacency from triangles (welded by position so UV seams don't split the diffusion)
  const key = i => `${Math.round(pos.getX(i) * 4000)},${Math.round(pos.getY(i) * 4000)},${Math.round(pos.getZ(i) * 4000)}`;
  const weld = new Int32Array(n), wmap = new Map(); for (let i = 0; i < n; i++) { const kk = key(i); if (!wmap.has(kk)) wmap.set(kk, i); weld[i] = wmap.get(kk); }
  const index = geo.index ? geo.index.array : Array.from({ length: n }, (_, i) => i);
  const nb = Array.from({ length: n }, () => []);
  for (let t = 0; t < index.length; t += 3) { const a0 = weld[index[t]], b0 = weld[index[t + 1]], c0 = weld[index[t + 2]]; nb[a0].push(b0, c0); nb[b0].push(a0, c0); nb[c0].push(a0, b0); }
  let cur = Float32Array.from(armW), nxt = new Float32Array(n);
  for (let it = 0; it < (S.smooth ?? 24); it++) {
    for (let i = 0; i < n; i++) { const r = weld[i]; if (r !== i) continue; const L = nb[i]; if (!L.length) { nxt[i] = cur[i]; continue; } let sum = 0; for (const j of L) sum += cur[j]; nxt[i] = cur[i] * .4 + sum / L.length * .6; }
    for (let i = 0; i < n; i++) nxt[i] = nxt[weld[i]];
    [cur, nxt] = [nxt, cur];
  }
  for (let i = 0; i < n; i++) cur[i] = Math.max(armW[i], cur[i] * keep[i]);
  const si = new Uint16Array(n * 4), sw = new Float32Array(n * 4);
  const awH = new Uint8Array(n); let patchGeo = null;
  for (let i = 0; i < n; i++) {
    p.set(pos.getX(i), pos.getY(i), 0); const w = {};
    const add = (k, v) => { if (v > 1e-3) w[k] = (w[k] || 0) + v; };
    let aw = Math.min(1, Math.max(0, cur[i] * 1.15));
    if (S.capeHands) aw = awH[i] = aw > .5 ? 1 : 0;
    if (aw > 0) {
      const s = armSide[i] > 0 ? 'L' : 'R', t = along[i];
      // chain blend: shoulder region shares with chest, elbow/wrist blend smoothly
      const up = 1 - ss(.75, 1.25, t), fo = ss(.75, 1.25, t) * (1 - ss(1.8, 2.2, t)), ha = ss(1.8, 2.2, t);
      const chestShare = 1 - ss(0, .35, t);
      add('chest', aw * up * chestShare * .5); add('upperArm' + s, aw * up * (1 - chestShare * .5)); add('foreArm' + s, aw * fo); add('hand' + s, aw * ha);
    }
    const body = 1 - aw;
    if (body > 0) {
      // seat: the whole skirt/robe below the hips follows the thighs (so a robed actor can fold its legs)
      const legW = seat ? ss(S.hip + .01, S.hip - .1, p.y) : ss(S.hem + .02, S.hem - .1, p.y) * (Math.abs(p.x) < S.legX * 2.6 ? 1 : 0);
      const sideK = seat ? ss(-S.legX * 1.1, S.legX * 1.1, p.x) : ss(-S.legX * .5, S.legX * .5, p.x);
      const headW = ss(S.neck - .01, S.neck + .04, p.y), chestW = ss(S.hip + .1, S.neck - .1, p.y) * (1 - headW), spW = ss(S.hip - .05, S.hip + .1, p.y);
      const upb = body * (1 - legW);
      add('head', upb * headW); add('chest', upb * chestW); add('spine', upb * (1 - headW - chestW) * spW); add('root', upb * (1 - headW - chestW) * (1 - spW));
      // front-centre fabric (between the legs, in front of the body) hangs as a lap sheet instead of tearing
      const lapK = seat ? (1 - ss(S.legX * 1.1, S.legX * 2.6, Math.abs(p.x))) * ss(-.01, .03, pos.getZ(i)) * legW : 0;
      if (lapK > 0) { const kd = ss(S.knee + .06, S.knee - .06, p.y); add('lap', body * lapK * (1 - kd)); add('lapD', body * lapK * kd); }
      for (const [s, k] of [['L', sideK], ['R', 1 - sideK]]) {
        const m = body * legW * k * (1 - lapK); if (m <= 0) continue;
        const fw = ss(S.ankle + .03, S.ankle - .03, p.y), shw = ss(S.knee + .05, S.knee - .05, p.y) * (1 - fw);
        add('foot' + s, m * fw); add('shin' + s, m * shw); add('thigh' + s, m * (1 - fw - shw));
      }
    }
    const top = Object.entries(w).sort((a, b) => b[1] - a[1]).slice(0, 4), tot = top.reduce((a, e) => a + e[1], 0) || 1;
    if (!top.length) { si[i * 4] = idx.root; sw[i * 4] = 1; continue; }
    top.forEach(([k, v], j) => { si[i * 4 + j] = idx[k]; sw[i * 4 + j] = v / tot; });
  }
  // cape hands: cut the triangles joining a hand to the cloth, so a raised hand comes out of the haik instead of dragging a strip of it
  if (S.capeHands) { const ix = geo.index ? geo.index.array : Array.from({ length: n }, (_, i) => i), kept = [];
    for (let t = 0; t < ix.length; t += 3) if (awH[ix[t]] === awH[ix[t + 1]] && awH[ix[t]] === awH[ix[t + 2]]) kept.push(ix[t], ix[t + 1], ix[t + 2]);
    geo.setIndex(kept);
    // and a cloth-coloured patch where the hands were (on the hips, set 4 mm into the body so a resting hand covers it)
    const hk = []; for (let t = 0; t < ix.length; t += 3) if (awH[ix[t]] && awH[ix[t + 1]] && awH[ix[t + 2]]) hk.push(ix[t], ix[t + 1], ix[t + 2]);
    const pg = new THREE.BufferGeometry(), nrm = geo.attributes.normal, pp = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { pp[i * 3] = pos.getX(i) - nrm.getX(i) * .004; pp[i * 3 + 1] = pos.getY(i) - nrm.getY(i) * .004; pp[i * 3 + 2] = pos.getZ(i) - nrm.getZ(i) * .004; }
    pg.setAttribute('position', new THREE.BufferAttribute(pp, 3)); pg.setAttribute('normal', nrm); pg.setIndex(hk);
    pg.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(new Uint16Array(n * 4), 4));   // all on the root (hips)
    const pw = new Float32Array(n * 4); for (let i = 0; i < n; i++) pw[i * 4] = 1; pg.setAttribute('skinWeight', new THREE.Float32BufferAttribute(pw, 4));
    patchGeo = pg; }
  geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(si, 4));
  geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(sw, 4));

  // ---- toon material on the painted texture + inverted-hull ink outline
  const grad = new THREE.DataTexture(new Uint8Array(ramp), ramp.length, 1, THREE.RedFormat); grad.minFilter = grad.magFilter = THREE.NearestFilter; grad.needsUpdate = true;
  let map = src.material.map; if (map) map.colorSpace = THREE.SRGBColorSpace; if (map && spec.fixSkin) map = fixSkin(map, spec.fixSkin);
  const mat = new THREE.MeshToonMaterial({ map, gradientMap: grad, color: tint || 0xffffff, side: THREE.DoubleSide });
  const inkMat = new THREE.MeshBasicMaterial({ color: 0x1f1612, side: THREE.BackSide });
  // ink hull pushed 1.5 cm away from the camera: silhouettes keep their line, but the hull no longer shows as black wedges
  // through open cloth (sleeve gaps against the torso)
  inkMat.onBeforeCompile = sh => { sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>\n transformed += normalize(objectNormal) * ${outline.toFixed(4)};`)
    .replace('#include <project_vertex>', '#include <project_vertex>\n gl_Position = projectionMatrix * (mvPosition + vec4(0., 0., -.015, 0.));'); };
  const skel = new THREE.Skeleton(list);
  const mesh = new THREE.SkinnedMesh(geo, mat), hull = new THREE.SkinnedMesh(geo, inkMat); hull.visible = outline > 0;
  mesh.add(B.root); mesh.bind(skel); hull.bind(skel);
  mesh.frustumCulled = hull.frustumCulled = false;
  // normalise: feet on y=0, height 1
  const inner = new THREE.Group(); inner.add(mesh, hull);
  if (patchGeo) { const pm = new THREE.SkinnedMesh(patchGeo, new THREE.MeshToonMaterial({ color: S.capeColor ?? 0xe6dfcf, gradientMap: grad, side: THREE.DoubleSide })); pm.bind(skel); pm.frustumCulled = false; inner.add(pm); }
  const h = S.top - S.bottom; inner.scale.setScalar(1 / h); inner.position.y = -S.bottom / h;
  const group = new THREE.Group(); group.add(inner);
  for (const b of list) b.userData.rest = b.quaternion.clone();
  return { group, B };
}

/** reset all bones to rest */
export function rest(B) { for (const b of Object.values(B)) { b.quaternion.copy(b.userData.rest); b.position.copy(b.parent?.isBone ? b.userData.abs.clone().sub(b.parent.userData.abs) : b.userData.abs); } }

/** walk cycle. ph in cycles; amt 0..1 blends standing -> walking */
export function walkPose(B, ph, amt = 1, o = {}) {
  const a = ph * Math.PI * 2, k = amt, stride = o.stride ?? .42, lift = o.lift ?? .7, arms = o.arms ?? .5;
  B.thighL.rotation.x = -Math.sin(a) * stride * k; B.thighR.rotation.x = Math.sin(a) * stride * k;
  B.shinL.rotation.x = Math.max(0, Math.sin(a - 1.4)) * lift * k; B.shinR.rotation.x = Math.max(0, -Math.sin(a - 1.4)) * lift * k;
  B.footL.rotation.x = -Math.sin(a) * .2 * k; B.footR.rotation.x = Math.sin(a) * .2 * k;
  B.root.position.y = B.root.userData.abs.y + (Math.abs(Math.cos(a)) * .022 - .014) * k;
  B.root.rotation.z = Math.sin(a) * .035 * k; B.root.rotation.y = Math.sin(a) * .06 * k;
  B.spine.rotation.y = -Math.sin(a) * .05 * k; B.spine.rotation.x = .03 * k;
  B.head.rotation.z = -Math.sin(a) * .025 * k;
  // arms swing opposite to the legs, elbows soften on the forward swing
  B.upperArmL.rotation.x = Math.sin(a) * arms * k; B.upperArmR.rotation.x = -Math.sin(a) * arms * k;
  B.foreArmL.rotation.x = -(.15 + Math.max(0, Math.sin(a)) * .35) * k; B.foreArmR.rotation.x = -(.15 + Math.max(0, -Math.sin(a)) * .35) * k;
}
export function idlePose(B, t, amt = 1) {
  B.chest.rotation.x += Math.sin(t * 1.7) * .015 * amt; B.head.rotation.x += Math.sin(t * 1.7 + .6) * .012 * amt;
  B.upperArmL.rotation.z += Math.sin(t * 1.7) * .02 * amt; B.upperArmR.rotation.z -= Math.sin(t * 1.7) * .02 * amt;
}

/** Pre-skinned, pre-animated GLB (e.g. the Quaternius cat): same toon look (ink hull off by default: flat-shaded split normals tear it), height normalised to `height`,
 *  feet at y=0, facing +z. Returns { root, mixer, play(name, {loop, fade}), at(t) } — `at(t)` sets the mixer time. */
export async function loadAnimal(url, { height = .25, outline = 0, ramp = [120, 190, 255], tint, prefix = '' } = {}) {
  const gltf = await new GLTFLoader().loadAsync(url), root = new THREE.Group(), m = gltf.scene;
  const grad = new THREE.DataTexture(new Uint8Array(ramp), ramp.length, 1, THREE.RedFormat); grad.minFilter = grad.magFilter = THREE.NearestFilter; grad.needsUpdate = true;
  const inkMat = new THREE.MeshBasicMaterial({ color: 0x1f1612, side: THREE.BackSide });
  inkMat.onBeforeCompile = sh => { sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>\n transformed += normalize(objectNormal) * ${outline.toFixed(4)};`); };
  const meshes = []; m.traverse(o => { if (o.isMesh) meshes.push(o); });
  for (const o of meshes) {
    const src = o.material; o.material = new THREE.MeshToonMaterial({ map: src.map || null, color: tint || (src.map ? 0xffffff : src.color), gradientMap: grad });
    if (outline > 0) { const h = o.isSkinnedMesh ? new THREE.SkinnedMesh(o.geometry, inkMat) : new THREE.Mesh(o.geometry, inkMat); if (o.isSkinnedMesh) h.bind(o.skeleton, o.bindMatrix); o.parent.add(h); h.position.copy(o.position); h.quaternion.copy(o.quaternion); h.scale.copy(o.scale); }
  }
  m.updateMatrixWorld(true); const box = new THREE.Box3().setFromObject(m, true), s = height / (box.max.y - box.min.y);
  m.scale.multiplyScalar(s); m.position.set(-(box.min.x + box.max.x) / 2 * s, -box.min.y * s, -(box.min.z + box.max.z) / 2 * s);
  root.add(m);
  const mixer = new THREE.AnimationMixer(m), clips = {}; for (const c of gltf.animations) clips[c.name.replace(prefix, '').split('|').pop()] = c;
  let cur = null;
  const play = (name, { loop = true } = {}) => { const a = mixer.clipAction(clips[name]); a.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce); a.clampWhenFinished = !loop; if (cur && cur !== a) cur.stop(); a.play(); cur = a; return a; };
  return { root, mixer, clips, play, at: t => mixer.setTime(t) };
}
