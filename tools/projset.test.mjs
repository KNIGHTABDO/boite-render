import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import * as THREE from 'three';
const three = import.meta.resolve('three');
const source = (await fs.readFile(new URL('../engine/projset.js',import.meta.url),'utf8')).replace("from 'three'",`from '${three}'`);
const { projectedSet } = await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
function stage() {
  const cal={h:1,horizon:480,fov:45,crop:.035}, cam=new THREE.PerspectiveCamera(2*Math.atan(Math.tan(Math.PI/8)*.93)*180/Math.PI,1920/1080,.05,80);
  cam.position.set(0,1,0);const f=540/Math.tan(cam.fov*Math.PI/360);cam.rotation.x=Math.atan((480-540)/f);cam.updateMatrixWorld(true);
  const ray=new THREE.Raycaster();
  return {cam,cal,scene:new THREE.Scene(),qa:{covers:[]},floorAt:(x,y,h=0)=>{ray.setFromCamera(new THREE.Vector2(x/960-1,1-y/540),cam);const t=(h-ray.ray.origin.y)/ray.ray.direction.y;return t>0?ray.ray.at(t,new THREE.Vector3()):null;},drawSet:()=>{}};
}
const proxy={room:{back:[[600,750],[1320,750]],left:[0,1080],right:[1920,1080],ceil:2.4},boxes:[{front:[[400,980],[700,980]],h:.4,d:.8,name:'bench'}]};
test('projector and projection matrix stay frozen across absolute, deterministic moves',()=>{
 const s=stage(),p=projectedSet(s,{},proxy),pose=p.projector.matrixWorld.toArray(),uv=p.material.uniforms.projector.value.toArray();
 p.move({dolly:1,truck:.2,crane:.3,orbit:10,orbitAt:[0,0,-3]});const moved=s.cam.matrixWorld.toArray();
 p.move({dolly:1,truck:.2,crane:.3,orbit:10,orbitAt:[0,0,-3]});assert.deepEqual(s.cam.matrixWorld.toArray(),moved);
 assert.deepEqual(p.projector.matrixWorld.toArray(),pose);assert.deepEqual(p.material.uniforms.projector.value.toArray(),uv);
 p.move({});assert.deepEqual(s.cam.matrixWorld.toArray(),pose);p.dispose();
});
test('set meshes are layer 1 and depth twins layer 0; all twins register with QA',()=>{
 const s=stage(),p=projectedSet(s,{},proxy);assert.equal(p.set.children.length,p.holdouts.children.length);
 p.set.children.forEach((m,i)=>{const d=p.holdouts.children[i];assert.equal(m.layers.mask,2);assert.equal(d.layers.mask,1);assert.equal(d.material.colorWrite,false);assert.equal(m.geometry,d.geometry);assert.equal(m.material.toneMapped,false);});
 assert.equal(s.qa.covers.length,p.holdouts.children.length);p.dispose();assert.equal(s.qa.covers.length,0);
});
test('automatic support follows the painted box, while floor remains y=0',()=>{
 const s=stage(),p=projectedSet(s,{},proxy),a={group:new THREE.Group()};a.group.position.copy(s.floorAt(550,980));a.group.position.z-=.2;a.group.position.y=.4;
 assert.equal(s.qa.supportAt(a),.4);a.group.position.set(0,0,-2);assert.equal(s.qa.supportAt(a),0);p.dispose();
});
test('painted platform hides a low target but leaves a standing head visible',()=>{
 const s=stage(),p=projectedSet(s,{},proxy),front=s.floorAt(550,980),point=front.clone();point.z-=.5;point.y=.1;
 assert.equal(p.visible(point),false);point.y=1.62;assert.equal(p.visible(point),true);p.dispose();
});
test('fov override uses the calibration crop; invalid move inputs fail clearly',()=>{
 const s=stage(),fov=s.cam.fov,p=projectedSet(s,{},proxy);p.move({fov:45});assert.equal(s.cam.fov,fov);
 assert.throws(()=>p.move({dolly:NaN}),/invalid move/);assert.throws(()=>p.move({fov:180}),/fov/);
 assert.throws(()=>projectedSet(s,{}),/proxy/);p.dispose();
});
test('free planes and doorway recesses author in floor canvas px without changing the camera',()=>{
 const s=stage(),pose=s.cam.matrixWorld.toArray(),p=projectedSet(s,{}, {planes:[{front:[[700,800],[850,800]],h:3,name:'jamb'},{front:[[850,800],[1050,800]],offset:.5,h:3,name:'door'}]});
 assert.deepEqual(s.cam.matrixWorld.toArray(),pose);assert.ok(p.holdouts.children.some(o=>o.name==='jamb'));p.dispose();
});

test('face decals behind painted geometry are masked individually',()=>{
 const s=stage(),p=projectedSet(s,{},proxy),head=new THREE.Object3D();head.position.copy(s.floorAt(550,980));head.position.z-=.5;head.position.y=.1;head.updateMatrixWorld(true);
 const a={B:{head},S:{head:0,face:{eyeL:[-.01,0,0],eyeR:[.01,0,0],mouth:[0,-.01,0]}}};
 const f=p.maskFace(a,{eyeVis:[true,true]});assert.deepEqual(f.eyeVis,[false,false]);assert.equal(f.mouthVis,false);
 head.position.y=1.62;head.updateMatrixWorld(true);assert.deepEqual(p.maskFace(a,{}).eyeVis,[true,true]);p.dispose();
});
