// ep09 r03 group M. Bed contact, closed eyes, and a chest clasp for s08 and s14–s16.
import * as THREE from 'three';
import * as K from '../../../engine/core.js';
import * as PO from '../../../engine/poses.js';
import { at, dirW, V } from './beatscene.js';
import { reachHand } from './fix9_B.js';

/**
 * Paint shut eyelids on the rig's own eye anchors.
 * faceFX skips the lids when a boy lying on his back looks at the ceiling (facing < .25),
 * so the texture eyes stay open. Call from over(), after the 3D draw.
 */
export function paintLids(S3, a, amt, skin = '#b88862') {
  if (!(amt > .04) || !a?.group?.visible || !a.S?.face || !a.B?.head) return;
  const Sp = a.S, F = Sp.face;
  const headAbs = new THREE.Vector3(0, Sp.head || 0, 0);
  const rel = p => new THREE.Vector3((p[0] || 0) - headAbs.x, (p[1] || 0) - headAbs.y, (p[2] || 0) - headAbs.z);
  const span = (Sp.top - Sp.bottom) || 1.6;
  const m = (F.eyeR_ || .018) * a.group.scale.y / span;
  const head = a.B.head.getWorldPosition(V());
  const fwd = a.B.head.localToWorld(new THREE.Vector3(0, 0, 1)).sub(head);
  const toCam = S3.cam.position.clone().sub(head);
  const c = K.c;
  c.save();
  for (const p of [F.eyeL, F.eyeR]) {
    if (!p) continue;
    const w = a.B.head.localToWorld(rel(p));
    const side = w.clone().sub(head);
    if (fwd.lengthSq() > 1e-6 && side.lengthSq() > 1e-6 && side.normalize().dot(toCam.clone().normalize()) < -.15) continue;
    const [x, y] = S3.project(w);
    const dist = Math.max(.4, S3.cam.position.distanceTo(w));
    const fpx = (K.H / 2) / Math.tan(S3.cam.fov * Math.PI / 360);
    const r = Math.max(2.5, m * fpx / dist);
    c.globalAlpha = Math.min(1, amt);
    c.fillStyle = skin;
    c.beginPath();
    c.ellipse(x, y, r * 1.55, r * 1.35 * amt + r * .2, 0, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = '#3a2418';
    c.lineWidth = Math.max(1.1, r * .22);
    c.beginPath();
    c.moveTo(x - r * 1.15, y + r * .05);
    c.quadraticCurveTo(x, y + r * (.15 + .2 * amt), x + r * 1.15, y + r * .05);
    c.stroke();
  }
  c.restore();
}

/** Both hands on the upper chest, wide of the torso, below the skull. */
export function claspChest(a) {
  const k = a.group.scale.y / 1.6;
  const chest = at(a, 'chest');
  const headY = at(a, 'head').y;
  for (const [s, sg] of [['L', 1], ['R', -1]]) {
    const tgt = chest.clone().addScaledVector(dirW(a, sg, 0, 0), .14 * k).add(V(0, .03 * k, 0));
    tgt.y = Math.min(tgt.y, headY - .04);
    reachHand(a, s, tgt, { grip: .02, pole: [sg * .55, .18, .28], max: .9 });
    PO.fingers(a, s, .6, { thumb: .42, spread: .08 });
  }
}

/** Slide the pillow disc from the jaw toward the back of the skull. */
export function pillowToSkull(a, pillow, along = .07) {
  if (!pillow) return;
  const head = a.B.head.getWorldPosition(V());
  const back = a.B.head.localToWorld(new THREE.Vector3(0, -.04, -.06)).sub(head);
  if (back.lengthSq() < 1e-8) return;
  back.y = 0;
  back.normalize();
  pillow.position.x += back.x * along;
  pillow.position.z += back.z * along;
}
