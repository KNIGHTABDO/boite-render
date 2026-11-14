// fix8_R31AE.js: s17 helpers. glow(): per-actor material clone with a lifted emissive so a small dark figure stays readable.
// dim(): per-actor multiply of the colour (father reads as a dark silhouette at the door), restored by dim(a, 1).
export function matOf(a) {
  const m = a.mesh; if (!m || !m.material) return null;
  if (!m.userData.r31ae) { m.userData.r31ae = true; m.material = Array.isArray(m.material) ? m.material.map(x => x.clone()) : m.material.clone(); m.userData.r31c = (Array.isArray(m.material) ? m.material : [m.material]).map(x => x.color ? x.color.clone() : null); }
  return Array.isArray(m.material) ? m.material : [m.material];
}
export function glow(a, v) { const ms = matOf(a); if (!ms) return; for (const x of ms) if (x.emissive) { x.emissive.setRGB(v, v * .95, v * .85); } }
export function dim(a, f) { const ms = matOf(a); if (!ms) return; const o = a.mesh.userData.r31c; ms.forEach((x, i) => { if (x.color && o[i]) x.color.copy(o[i]).multiplyScalar(f); }); }
