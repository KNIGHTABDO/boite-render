// R31AA: Zoubida's scanned shoe triangles (kept by haikCloth) poke out of the mantle hem when she sits cross-legged: drop them.
export function trimShoes(a) {
  const geo = a.mesh?.geometry; if (!geo || !a.haikMantle || geo.userData.shoesTrimmed) return;
  const p = geo.attributes.position, si = geo.attributes.skinIndex, sw = geo.attributes.skinWeight, bones = a.mesh.skeleton.bones;
  const hand = i => { let w = 0; for (let j = 0; j < 4; j++) if (/Hand/.test(bones[si.getComponent(i, j)]?.name || '')) w += sw.getComponent(i, j); return w > .65; };
  const ix = geo.index.array, y = a.S.ankle + .025, head = a.S.neck - .015, kept = [];
  for (let i = 0; i < ix.length; i += 3) {
    const ids = [ix[i], ix[i + 1], ix[i + 2]];
    if (ids.every(j => p.getY(j) < y) && !ids.every(hand) && !ids.every(j => p.getY(j) > head)) continue;
    kept.push(...ids);
  }
  geo.setIndex(kept); geo.userData.shoesTrimmed = true;
}
