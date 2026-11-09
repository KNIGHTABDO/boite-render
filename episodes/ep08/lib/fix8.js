// Local support repairs for the seven ep08 acting-gate scenes.
import * as THREE from 'three';
import * as PO from '../../../engine/poses.js';
import * as IK from '../../../engine/ik.js';
import { staged as baseStage } from './autostage.js';
import { at, V, dirW } from './beatscene.js';

// Retain stratified surface samples and every dominant-bone extremum, including robe hems.
const samples = new WeakMap();
function surface(a) {
  if (samples.has(a)) return samples.get(a);
  const m = a.mesh, p = m.geometry.attributes.position, si = m.geometry.attributes.skinIndex, sw = m.geometry.attributes.skinWeight;
  const ids = [...new Set(m.geometry.index?.array || Array.from({length:p.count}, (_,i)=>i))], ex = new Map();
  for (const i of ids) {
    let j=0; for(let k=1;k<4;k++) if(sw.getComponent(i,k)>sw.getComponent(i,j)) j=k;
    const bone=si.getComponent(i,j); let e=ex.get(bone); if(!e)ex.set(bone,e=Array(6).fill(i));
    for(let d=0;d<3;d++){if(p.getComponent(i,d)<p.getComponent(e[d*2],d))e[d*2]=i;if(p.getComponent(i,d)>p.getComponent(e[d*2+1],d))e[d*2+1]=i;}
  }
  const body=ids.filter(i=>i%8===0), stride=Math.max(1,Math.ceil(body.length/1000));
  const out={m,ids:[...new Set([...body.filter((_,i)=>i%stride===0),...[...ex.values()].flat()])]};
  samples.set(a,out); return out;
}
export function ground(a, floor=0) {
  const {m,ids}=surface(a), v=V(0,0,0); let low=Infinity;
  a.group.updateMatrixWorld(true);
  for(const i of ids){m.getVertexPosition(i,v);m.localToWorld(v);low=Math.min(low,v.y);}
  a.group.position.y+=floor+.001-low; a.group.updateMatrixWorld(true);
}

export function staged(plate, source, options={}) {
  // Marks are shared with neighbouring scenes; only this shot owns its declared cushion tops.
  const marks=Object.fromEntries(Object.entries(source).map(([n,m])=>[n,{...m,o:{...m.o},walk:m.walk&&{...m.walk},climb:m.climb&&{...m.climb}}]));
  const act=options.act;
  const sh=baseStage(plate,marks,{...options,act(lt,t,S,st,S3){
    act?.(lt,t,S,st,S3);
    for(const [n,a] of Object.entries(st.A)){
      if(!a.group.visible || marks[n].pose==='lie' || marks[n].pose==='step')continue;
      if(['kneel','cross'].includes(marks[n].pose))PO.drapeLap(a,0);
      const support=st.actcheck?.supports?.[n] ?? (marks[n].tread!=null?st.ST.y(marks[n].tread):0);
      if(marks[n].pose==='kneel')clothFloor(a,support);else ground(a,support);
      if(st.cushions?.[n]){
        // A real compressed floor cushion supports the pelvis, rather than a declared invisible seat.
        const c=st.cushions[n], top=PO.lowestOf(a,['root']);
        c.position.set(at(a,'root').x,top/2,at(a,'root').z);c.scale.y=Math.max(.004,top);
        c.rotation.y=a.group.rotation.y;c.updateMatrixWorld(true);marks[n].o.seat=top;
      }
    }
  }});
  const load=sh.load;
  sh.load=async()=>{
    await load();sh.st.cushions={};
    for(const [n,a] of Object.entries(sh.st.A))if(marks[n].pose==='kneel'){
      kneelFloor(a,marks[n].o);sh.st.snaps[n]=PO.snap(a);
      // Pin the corrected lap, not the old floating thigh frame.
      a.pins=['L','R'].map(side=>[side,a.B.root.worldToLocal(at(a,'thigh'+side).lerp(at(a,'shin'+side),.6).add(V(0,.075*a.group.scale.y/1.6,0)))]);
      const i=sh.st.actors.indexOf(a),h=at(a,'head');sh.heads[i]=sh.S3.project(h);sh.headOff[i]=h.clone().sub(a.group.position);
    }
    for(const [n,a] of Object.entries(sh.st.A)){
      if(marks[n].pose!=='cross')continue;
      ground(a,0);
      const top=PO.lowestOf(a,['root']), k=a.group.scale.y/1.6;
      const geo=new THREE.SphereGeometry(1,24,12);geo.scale(.25*k,.5,.22*k);
      const c=new THREE.Mesh(geo,new THREE.MeshToonMaterial({color:plate==='mausolee'?0x967a52:0x76523c}));
      c.castShadow=c.receiveShadow=true;sh.S3.scene.add(c);sh.st.cushions[n]=c;
      c.position.set(at(a,'root').x,top/2,at(a,'root').z);c.scale.y=top;c.rotation.y=a.group.rotation.y;
      marks[n].o.seat=top;
      const i=sh.st.actors.indexOf(a),h=at(a,'head');
      sh.place[i][0].copy(a.group.position);sh.heads[i]=sh.S3.project(h);sh.headOff[i]=h.clone().sub(a.group.position);
      sh.bodyPx[i]=sh.S3.project(h.clone().add(V(0,-.83*a.group.scale.y,0)))[1]-sh.heads[i][1];
    }
  };
  return sh;
}

// Move the actor in the floor plane until the hand target lies inside its measured arm workspace.
// The target itself is never shortened and the skeleton is never scaled.
export function approach(a, side, target, margin=.045) {
  const sh=at(a,'upperArm'+side), elbow=at(a,'foreArm'+side), hand=at(a,'hand'+side);
  const len=sh.distanceTo(elbow)+elbow.distanceTo(hand)-margin, dy=target.y-sh.y;
  const d=target.clone().sub(sh).setY(0), max=Math.sqrt(Math.max(.001,len*len-dy*dy));
  if(d.length()>max)a.group.position.addScaledVector(d.normalize(),target.clone().sub(sh).setY(0).length()-max);
  a.group.updateMatrixWorld(true);
}

// A measured kneel: knees and insteps on the floor, pelvis resting back above the heels.
function kneelFloor(a,o={}) {
  const k=a.group.scale.y/1.6, root=at(a,'root'), hip=.24*k, state={};
  PO.setHipY(a,hip);
  for(const side of ['L','R']){
    const th=at(a,'thigh'+side), kn=at(a,'shin'+side), ft=at(a,'foot'+side);
    state[side]={lt:th.distanceTo(kn),ls:kn.distanceTo(ft),ky:.09*k,fy:.06*k};
  }
  for(let it=0;it<5;it++)for(const side of ['L','R']){
    const q=state[side], th=at(a,'thigh'+side), dz=Math.sqrt(Math.max(.001,q.lt*q.lt-(th.y-q.ky)**2));
    const knee=th.clone().addScaledVector(dirW(a,0,0,1),dz);knee.y=q.ky;
    const ankle=knee.clone().addScaledVector(dirW(a,0,0,1),-Math.sqrt(Math.max(.001,q.ls*q.ls-(q.ky-q.fy)**2)));ankle.y=q.fy;
    IK.leg(a,side,ankle,knee);
    const foot=a.B['foot'+side];foot.rotation.set(0,0,0);foot.updateWorldMatrix(false,true);
    IK.aim(foot,at(a,'foot'+side,[0,0,1]),ankle.clone().addScaledVector(dirW(a,0,0,1),-1));
    q.ky+=.003-partLow(a,'knee'+side);q.fy+=.003-partLow(a,'foot'+side);
  }
  PO.drapeLap(a,0);clothFloor(a,0);
}
const partIndices=new WeakMap();
function partLow(a,part) {
  let parts=partIndices.get(a);
  if(!parts){
    parts={};const m=a.mesh,p=m.geometry.attributes.position,si=m.geometry.attributes.skinIndex,sw=m.geometry.attributes.skinWeight;
    for(const side of ['L','R']){
      parts['foot'+side]=[];parts['knee'+side]=[];
      for(let i=0;i<p.count;i++){
        let foot=0,knee=0;for(let j=0;j<4;j++){
          const b=m.skeleton.bones[si.getComponent(i,j)];
          if(b===a.B['foot'+side])foot+=sw.getComponent(i,j);
          if(b===a.B['shin'+side])knee+=sw.getComponent(i,j);
        }
        if(foot>.4)parts['foot'+side].push(i);
        if(knee>.4&&Math.abs(p.getY(i)-a.S.knee)<.10)parts['knee'+side].push(i);
      }
    }
    partIndices.set(a,parts);
  }
  const ids=parts[part],v=V(0,0,0);let low=Infinity;a.group.updateMatrixWorld(true);
  for(const i of ids){a.mesh.getVertexPosition(i,v);a.mesh.localToWorld(v);low=Math.min(low,v.y);}return low;
}
function clothFloor(a,floor) {
  // The cloth bones carry the robe hems; lift only a buried hem, leaving planted knees and feet in place.
  const {m,ids}=surface(a),si=m.geometry.attributes.skinIndex,sw=m.geometry.attributes.skinWeight,v=V(0,0,0);
  for(let pass=0;pass<3;pass++){
    const corrections=new Map();a.group.updateMatrixWorld(true);
    for(const i of ids){m.getVertexPosition(i,v);m.localToWorld(v);if(v.y>=floor)continue;
      for(let j=0;j<4;j++){
        const b=m.skeleton.bones[si.getComponent(i,j)],w=sw.getComponent(i,j);
        if(w>.2&&/Skirt|Robe|lap/.test(b.name))corrections.set(b,Math.max(corrections.get(b)||0,(floor+.002-v.y)/w));
      }
    }
    for(const [b,dy] of corrections){const p=b.getWorldPosition(V(0,0,0));p.y+=dy;b.position.copy(b.parent.worldToLocal(p));b.updateWorldMatrix(false,true);}
    if(!corrections.size)break;
  }
}
