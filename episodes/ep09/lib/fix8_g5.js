// fix8_g5.js: s17/s19 father without his turban (lost in the s14 fight; cast.json). The turban is baked into the rig mesh and
// its texture, so the turban vertices (father_bare.json, found from the texture colour, head-bound, above the brow) are
// pulled in to a skull-sized cap and their UV is moved to a black hair texel. Done once per actor, on the shared geometry.
const BARE = await (await fetch(new URL('./father_bare.json', import.meta.url))).json();

export function bareHead(a) {
  const mesh = a.mesh; if (!mesh) return a;
  // swap in a bare clone instead of editing the shared geometry: resetCast / the per-frame restore put the turban back for other scenes
  if (mesh.userData.bareGeo) { if (mesh.geometry !== mesh.userData.bareGeo) mesh.geometry = mesh.userData.bareGeo; return a; }
  if (mesh.geometry.attributes.position.count !== 333269) return a;   // only the father rig
  const geo = mesh.geometry.clone(), pos = geo.attributes.position, uv = geo.attributes.uv;
  const CX = -.02, CZ = -.03;
  for (const i of BARE.idx) {
    let x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    x = CX + (x - CX) * .8; z = CZ + (z - CZ) * .8;
    if (y > .8) y = .8 + (y - .8) * .62;
    pos.setXYZ(i, x, y, z); uv.setXY(i, BARE.uv[0], BARE.uv[1]);
  }
  pos.needsUpdate = uv.needsUpdate = true; geo.computeBoundingSphere?.();
  mesh.userData.bareGeo = geo; mesh.geometry = geo; return a;
}
