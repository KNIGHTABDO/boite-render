// E1: a frozen plate projector, metric proxy surfaces, and depth twins for the actor pass.
// Author floor edges in cropped 1920x1080 canvas px; heights/depths and camera moves are metres.
// orbit is yaw in degrees; orbitAt is [x,y,z] metres. fov overrides the source vertical FOV before crop.
import * as THREE from 'three';
const W = 1920, H = 1080, D2R = Math.PI / 180;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

export function projectedSet(S, img, proxy = S.cal?.proxy) {
  if (!proxy) throw new Error('projectedSet needs cal.proxy');
  const projector = S.cam.clone(); projector.clearViewOffset(); projector.updateMatrixWorld(true);
  const pose = { position: projector.position.clone(), quaternion: projector.quaternion.clone(), fov: projector.fov };
  const matrix = new THREE.Matrix4().multiplyMatrices(projector.projectionMatrix, projector.matrixWorldInverse);
  const texture = new THREE.Texture(img); texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = texture.magFilter = THREE.LinearFilter; texture.generateMipmaps = false; texture.needsUpdate = true;
  const crop = S.cal.crop ?? .035;
  const material = new THREE.ShaderMaterial({
    uniforms: { plate: { value: texture }, projector: { value: matrix }, crop: { value: crop } },
    vertexShader: `uniform mat4 projector; varying vec4 plateClip;
      void main() { vec4 world = modelMatrix * vec4(position, 1.); plateClip = projector * world;
        gl_Position = projectionMatrix * viewMatrix * world; }`,
    fragmentShader: `uniform sampler2D plate; uniform float crop; varying vec4 plateClip;
      void main() { vec2 uv = plateClip.xy / plateClip.w * .5 + .5;
        uv = clamp(vec2(crop) + uv * (1. - 2. * crop), vec2(crop), vec2(1. - crop));
        gl_FragColor = texture2D(plate, uv);
        #include <colorspace_fragment>
      }`,
    side: THREE.DoubleSide, toneMapped: false
  });
  const depth = new THREE.MeshBasicMaterial({ colorWrite: false, side: THREE.DoubleSide });
  const set = new THREE.Group(), holdouts = new THREE.Group(), supports = [], geometries = [];
  set.name = 'projected set'; holdouts.name = 'painted set depth'; S.scene.add(set, holdouts);
  const floor = (p, y = 0) => {
    const v = S.floorAt(...p, y); if (!v) throw new Error('proxy floor point above horizon: ' + p); return v;
  };
  const add = (geo, name, support) => {
    geometries.push(geo);
    const m = new THREE.Mesh(geo, material), twin = new THREE.Mesh(geo, depth);
    m.name = twin.name = name; m.layers.set(1); twin.layers.set(0); twin.renderOrder = -1;
    set.add(m); holdouts.add(twin);
    if (support != null) { twin.userData.support = support; supports.push(twin); }
    if (S.qa) S.qa.covers.push(twin);
    return [m, twin];
  };
  const quad = (pts, name, support) => {
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts.flatMap(v => v.toArray()), 3));
    g.setIndex([0, 1, 2, 0, 2, 3]); g.computeVertexNormals(); return add(g, name, support);
  };
  const wall = (a, b, bottom, top, name) => quad([a.clone().setY(bottom), b.clone().setY(bottom), b.clone().setY(top), a.clone().setY(top)], name);
  // A distant closure fills sky/open borders, without screen-space tricks or invented unseen paint.
  const dir = projector.getWorldDirection(V()), right = V(1).applyQuaternion(pose.quaternion), up = V(0, 1).applyQuaternion(pose.quaternion);
  const far = pose.position.clone().addScaledVector(dir, 50);
  quad([[-1,-1],[1,-1],[1,1],[-1,1]].map(([x,y]) => far.clone().addScaledVector(right,x*100).addScaledVector(up,y*100)), 'far closure');
  const R = proxy.floor?.size ?? 120, C = pose.position;
  quad([V(C.x-R,-.006,C.z-R),V(C.x+R,-.006,C.z-R),V(C.x+R,-.006,C.z+R),V(C.x-R,-.006,C.z+R)], 'floor', 0);
  const room = proxy.room;
  if (room) {
    const [a,b] = room.back.map(p => floor(p)), ceil = room.ceil ?? 3.2;
    wall(a,b,0,ceil,'back wall');
    const near = (v, back) => Array.isArray(v) ? floor(v) : V(v ?? back.x,0,C.z+4);
    const l = near(room.left,a), r = near(room.right,b);
    wall(l,a,0,ceil,'left wall'); wall(b,r,0,ceil,'right wall');
    quad([l,a,b,r].map(p => p.clone().setY(ceil)), 'ceiling');
  }
  for (const box of proxy.boxes || []) {
    const [a,b] = box.front.map(p => floor(p)), edge = b.clone().sub(a).normalize(), back = V(edge.z,0,-edge.x).multiplyScalar(box.d);
    const d = a.clone().add(back), e = b.clone().add(back), h = box.h, name = box.name || 'box';
    wall(a,b,0,h,name+' front'); wall(b,e,0,h,name+' right'); wall(e,d,0,h,name+' back'); wall(d,a,0,h,name+' left');
    quad([a,b,e,d].map(p => p.clone().setY(h)), name+' top', h);
  }
  // Extra wall strips permit a genuine open doorway: front=floor edge, bottom/h=metres, offset=recess along -z.
  // vertices is the escape hatch for ramps or non-vertical surfaces: [canvas x, canvas y, world height].
  for (const p of proxy.planes || []) {
    if (p.vertices) quad(p.vertices.map(([x,y,h]) => floor([x,y],h)), p.name || 'plane', p.support);
    else { const [a,b] = p.front.map(v => floor(v)); a.z -= p.offset || 0; b.z -= p.offset || 0; wall(a,b,p.bottom || 0,(p.bottom || 0)+p.h,p.name || 'plane'); }
  }
  set.updateMatrixWorld(true); holdouts.updateMatrixWorld(true);
  const supportRay = new THREE.Raycaster(), coverRay = new THREE.Raycaster();
  const supportAt = a => {
    const p = a.group.getWorldPosition(V()); p.y += .04; supportRay.set(p,V(0,-1));
    const hit = supportRay.intersectObjects(supports,false)[0]; return hit ? hit.object.userData.support : 0;
  };
  const visible = p => {
    const v = p.isVector3 ? p : V(...p), delta = v.clone().sub(S.cam.position);
    coverRay.set(S.cam.position,delta.clone().normalize()); coverRay.far = delta.length()-.002;
    return !coverRay.intersectObject(holdouts,true).length;
  };
  if (S.qa) { S.qa.supportSurfaces = supports; S.qa.supportAt = supportAt; }
  const defaultAt = S.floorAt(W/2,H/2) || S.floorAt(W/2,Math.max(810,S.cal.horizon+100));
  const P = { projector, set, holdouts, supports, material, texture, supportAt, visible };
  // Decals are painted after the depth pass: mask each eye/mouth against the same set, including partial jamb occlusion.
  P.maskFace = (a, f) => {
    if (!f || !a.S.face) return f;
    const world = p => a.B.head.localToWorld(V(p[0],p[1]-a.S.head,p[2]));
    f.eyeVis = ['eyeL','eyeR'].map((k,i) => (f.eyeVis?.[i] ?? true) && visible(world(a.S.face[k])));
    f.mouthVis = visible(world(a.S.face.mouth)); return f;
  };
  P.move = (m = {}) => {
    for (const k of ['dolly','truck','crane','orbit','fov']) if (m[k] != null && !Number.isFinite(m[k])) throw new Error('invalid move.'+k);
    const cam = S.cam; cam.position.copy(pose.position); cam.quaternion.copy(pose.quaternion); cam.fov = pose.fov;
    // Dolly/truck stay on the ground plane; crane is independent even on a tilted calibration camera.
    const forward = dir.clone().setY(0).normalize(), side = V(1,0,0).applyQuaternion(pose.quaternion).setY(0).normalize();
    cam.position.addScaledVector(forward,m.dolly || 0).addScaledVector(side,m.truck || 0); cam.position.y += m.crane || 0;
    if (m.orbit) {
      const at = m.orbitAt ? (m.orbitAt.isVector3 ? m.orbitAt : V(...m.orbitAt)) : defaultAt;
      if (!at || ![at.x,at.y,at.z].every(Number.isFinite)) throw new Error('invalid move.orbitAt');
      const yaw = new THREE.Quaternion().setFromAxisAngle(V(0,1),m.orbit*D2R);
      cam.position.sub(at).applyQuaternion(yaw).add(at); cam.quaternion.premultiply(yaw);
    }
    if (m.fov != null) {
      if (m.fov <= 1 || m.fov >= 175) throw new Error('move.fov must be between 1 and 175 degrees');
      cam.fov = 2*Math.atan(Math.tan(m.fov*D2R/2)*(1-2*crop))/D2R;
    }
    cam.updateProjectionMatrix(); cam.updateMatrixWorld(true); return P;
  };
  P.draw = o => S.drawSet(o);
  P.dispose = () => {
    S.scene.remove(set,holdouts); geometries.forEach(g => g.dispose()); material.dispose(); depth.dispose(); texture.dispose();
    if (S.qa) { S.qa.covers = S.qa.covers.filter(m => !holdouts.children.includes(m)); delete S.qa.supportAt; delete S.qa.supportSurfaces; }
  };
  return P;
}
