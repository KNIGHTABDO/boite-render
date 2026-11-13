#!/usr/bin/env node
// CPU-only ep08 acting gate. Real scene timelines, GLB meshes, skeletons and IK; no renderer.
// node tools/actcheck8.mjs [--scenes s03,s04] [--out /tmp/actcheck8.json] [--step .5]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { registerHooks } from 'node:module';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { segmentDistance } from './shotcheck-browser.mjs';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const V = (x=0,y=0,z=0) => new THREE.Vector3(x,y,z);
const read = f => JSON.parse(fs.readFileSync(path.join(ROOT,f),'utf8'));
const pos = (a,n) => a.B[n].getWorldPosition(V());
const shown = o => { for (;o;o=o.parent) if (!o.visible) return false; return true; };
const corners = b => Array.from({length:8},(_,i)=>V(i&1?b.max.x:b.min.x,i&2?b.max.y:b.min.y,i&4?b.max.z:b.min.z));
let current=null, building=false, captures=[], calls=[], shots=[], metrics=new Map(), activeBeat=null;
const CAST = read('episodes/ep08/cast.json').characters;
const lieCalls = new WeakMap();
globalThis.__actLie = (a,o) => lieCalls.set(a,o);
const beforeAct=new WeakMap();
globalThis.__actBefore=A=>{for(const a of Object.values(A))beforeAct.set(a,Object.fromEntries(['spine','chest','upperArmL','foreArmL','upperArmR','foreArmR'].map(n=>[n,a.B[n].quaternion.toArray()])));};
// Export hooks cannot be assigned on an ES namespace; instrument the source in memory.
registerHooks({
  load(url,ctx,next) {
    if (!url.startsWith(pathToFileURL(ROOT+'/').href) || url.includes('/node_modules/') || !url.endsWith('.js')) return next(url,ctx);
    let s=fs.readFileSync(fileURLToPath(url),'utf8');
    if (url.endsWith('/poses.js')) s=s.replace('if (natural) return naturalLie', 'globalThis.__actLie(a, { top, turn, pillow, natural, sink, hands }); if (natural) return naturalLie');
    if (url.endsWith('/poses.js')) for (const n of ['reach','grip']) {
      s=s.replace(`export function ${n}(`,`function __${n}(`);
      s+=`\nexport function ${n}(...args) { const error=__${n}(...args); globalThis.__actIK('${n}',args,error); return error; }\n`;
    }
    if (url.endsWith('/ik.js')) for (const n of ['arm','leg','twoBone']) {
      s=s.replace(`export function ${n}(`,`function __${n}(`);
      s+=`\nexport function ${n}(...args) { const error=__${n}(...args); globalThis.__actIK('${n}',args,error); return error; }\n`;
    }
    if(url.endsWith('/autostage.js')) s=s.replace('const camP = S3.cam.position.clone().setY(0), A = {}, P = {};','S3.qa.actMarks=marks; const camP = S3.cam.position.clone().setY(0), A = {}, P = {};').replace('act?.(lt, t, S, st, S3);','globalThis.__actBefore(A); act?.(lt, t, S, st, S3);').replace('const names = Object.keys(marks);','const names = Object.keys(marks); globalThis.__actMarks = marks;').replace('return { actors: names.map', 'for (const n of names) A[n].actMark = marks[n];\n      return { actors: names.map');
    if(url.endsWith('/_3d.js')) s=s.replace('return sh;','globalThis.__actShots.push(sh); return sh;').replace('for (const [a, who, seed, o = {}] of st.faces)', 'for (const [a, who, seed, o = {}] of [])');
    if(url.endsWith('/stage3d.js')) s=s.replace('if (window.QA.noRender) return;','if (window.QA.noRender) { globalThis.__actSample(S); return; }');
    return {format:'module',source:s,shortCircuit:true};
  }
});
globalThis.__actShots=shots;
globalThis.__actIK=(fn,args,error)=> {
  if(!building&&current&&args[0]?.B&&['reach','grip'].includes(fn)){const key=[current.beat,args[0].name,args[1],fn].join(' '),m=metrics.get(key)||{beat:current.beat,actor:args[0].name,side:args[1],kind:fn,max:0,calls:0};m.calls++;m.max=Math.max(m.max,error);metrics.set(key,m);}
  if(!Number.isFinite(error) || error>.03) {
    let [a,side,target]=args;
    if(!a?.B) { const bone=fn==='twoBone'?a:null; a=[...(window.__qa?.actors||[]),...shots.flatMap(s=>s.st?.actors||[])].find(a=>Object.values(a.B).includes(bone)); side=bone?.name; }
    calls.push({target:args[0]?.B&&target?.isVector3?target.toArray():undefined,shoulder:args[0]?.B&&args[0].B['upperArm'+side]?pos(args[0],'upperArm'+side).toArray():undefined,fn,stage:a?.group.parent?.uuid,actor:a?.name||'bone',side,error,build:building,visible:a?shown(a.group):true,caller:new Error().stack.split('\n').slice(3,7).join(' ').replaceAll(ROOT+'/','')});
  }
};
// Only drawing is stubbed. Camera transforms are evaluated from the real coverCam/clampCam.
const noop=()=>{};
function context(canvas) { return new Proxy({canvas,globalAlpha:1,getTransform:()=>({a:1,b:0,c:0,d:1,e:0,f:0}),measureText:()=>({width:1}),createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop}),createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),getImageData:()=>({data:new Uint8ClampedArray(4)}),createPattern:()=>({})},{get:(o,k)=>k in o?o[k]:noop}); }
globalThis.OffscreenCanvas=class { constructor(w,h){this.width=w;this.height=h;this.ctx=context(this);}getContext(){return this.ctx;} };
globalThis.Path2D=class {constructor(){return new Proxy(this,{get:()=>noop});}};
globalThis.Image=class {width=1920;height=1080;naturalWidth=1920;naturalHeight=1080;decode(){return Promise.resolve();}set src(v){this._src=v;queueMicrotask(()=>this.onload?.());}get src(){return this._src;}};
globalThis.window={QA:{noRender:true}};globalThis.location={search:'?nocache'};
globalThis.localStorage={getItem:()=>null,setItem:noop};
globalThis.fetch=async url=>{const u=String(url);const f=u.startsWith('file:')?fileURLToPath(u):path.join(ROOT,u);try{const b=fs.readFileSync(f);return {ok:true,json:async()=>JSON.parse(b),arrayBuffer:async()=>b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),text:async()=>b.toString()};}catch{return {ok:false,json:async()=>({})};}};
// Preserve geometry and skin data, discard image/material payloads before GLTF parse.
GLTFLoader.prototype.loadAsync=async function(url) {
  const b=fs.readFileSync(path.join(ROOT,url)), jsonLength=b.readUInt32LE(12), j=JSON.parse(b.subarray(20,20+jsonLength).toString());
  const imageViews=new Set((j.images||[]).map(x=>x.bufferView)), oldBin=b.subarray(28+jsonLength), chunks=[];let offset=0;
  for(let i=0;i<(j.bufferViews||[]).length;i++){
    const view=j.bufferViews[i];if(imageViews.has(i)){view.byteOffset=0;view.byteLength=0;continue;}
    const bytes=oldBin.subarray(view.byteOffset||0,(view.byteOffset||0)+view.byteLength),pad=Buffer.alloc((4-bytes.length%4)%4);
    view.byteOffset=offset;chunks.push(bytes,pad);offset+=bytes.length+pad.length;
  }
  j.buffers[0].byteLength=offset;j.images=[];j.textures=[];j.materials=(j.materials||[]).map(()=>({}));
  const jb=Buffer.from(JSON.stringify(j)), pad=Buffer.alloc((4-jb.length%4)%4,32), bin=Buffer.concat(chunks), out=Buffer.alloc(28+jb.length+pad.length+bin.length);
  b.copy(out,0,0,20);out.writeUInt32LE(out.length,8);out.writeUInt32LE(jb.length+pad.length,12);jb.copy(out,20);pad.copy(out,20+jb.length);
  out.writeUInt32LE(bin.length,20+jb.length+pad.length);out.writeUInt32LE(0x004e4942,24+jb.length+pad.length);bin.copy(out,28+jb.length+pad.length);
  return this.parseAsync(out.buffer.slice(out.byteOffset,out.byteOffset+out.byteLength),'');
};
const models=new WeakMap();
function model(a) {
  if(models.has(a))return models.get(a);
  const m=a.mesh||(()=>{let m;a.group.traverse(o=>{if(!m&&o.isSkinnedMesh)m=o;});return m;})();
  const p=m.geometry.attributes.position, si=m.geometry.attributes.skinIndex, sw=m.geometry.attributes.skinWeight, parts={body:[],head:[],footL:[],footR:[],pelvis:[],chest:[],kneeL:[],kneeR:[],upper:[]};
  // Indexed triangles only: cut-away vertices must not count as visible body parts.
  const ids=[...new Set(m.geometry.index?.array||Array.from({length:p.count},(_,i)=>i))];
  for(const i of ids) {
    const weights={};for(let k=0;k<4;k++){const n=m.skeleton.bones[si.getComponent(i,k)]?.name;weights[n]=(weights[n]||0)+sw.getComponent(i,k);}
    if(i%8===0)parts.body.push(i);
    const py=p.getY(i), unit=a.S.top-a.S.bottom || 1.6;
    if (Math.abs(py-a.B.root.userData.abs.y)<.035*unit) parts.pelvis.push(i);
    if (Math.abs(py-a.B.chest.userData.abs.y)<.035*unit) parts.chest.push(i);
    if (py>=a.B.root.userData.abs.y && i%4===0) parts.upper.push(i);
    for (const side of ['L','R']) { const b=a.B['shin'+side].userData.abs; if(Math.hypot(p.getX(i)-b.x,py-b.y,p.getZ(i)-b.z)<.065*unit)parts['knee'+side].push(i); }
    if(p.getY(i)>=a.S.neck)parts.head.push(i);
    for(const s of ['L','R']) if((weights[a.B['foot'+s].name]||0)>.4)parts['foot'+s].push(i);
    
  }
  for(const side of ['L','R']) if(!parts['foot'+side].length) for(const i of ids) if(p.getY(i)<=a.S.ankle+.035 && (side==='L'?p.getX(i)>=0:p.getX(i)<0))parts['foot'+side].push(i);
  if(!parts.pelvis.length)for(const i of ids)if(Math.abs(p.getY(i)-a.S.hip)<.08)parts.pelvis.push(i);
  // Bounded stratified samples plus extrema of each bone's dominant-weight region.
  const extremes=new Map();for(const i of ids){let best=0,jj=0;for(let j=0;j<4;j++)if(sw.getComponent(i,j)>best){best=sw.getComponent(i,j);jj=si.getComponent(i,j);}
    let e=extremes.get(jj);if(!e)extremes.set(jj,e=Array(6).fill(i));for(let d=0;d<3;d++){if(p.getComponent(i,d)<p.getComponent(e[d*2],d))e[d*2]=i;if(p.getComponent(i,d)>p.getComponent(e[d*2+1],d))e[d*2+1]=i;}}
  const extra=[...new Set([...extremes.values()].flat())];
  for(const n in parts){const list=parts[n],member=new Set(list),stride=Math.max(1,Math.ceil(list.length/(n==='body'?1000:350))),sample=list.filter((_,i)=>i%stride===0);parts[n]=[...new Set([...sample,...extra.filter(i=>n==='body'||member.has(i))])];}
  const o={m,parts};models.set(a,o);return o;
}
function points(a,part) {const {m,parts}=model(a); return parts[part].map(i=>{const p=V();m.getVertexPosition(i,p);return m.localToWorld(p);});}
function capsules(a) {
 const k=a.group.scale.y/1.6, out=[['torso','root','neck',.13],['head','head','head',.095]];
 for(const s of ['L','R'])out.push(['upperArm'+s,'upperArm'+s,'foreArm'+s,.045],['foreArm'+s,'foreArm'+s,'hand'+s,.035],['hand'+s,'hand'+s,'hand'+s,.035],['thigh'+s,'thigh'+s,'shin'+s,.065],['shin'+s,'shin'+s,'foot'+s,.045]);
 return out.map(([n,x,y,r])=>({n,p:pos(a,x),q:pos(a,y),r:r*k}));
}
function screen(p,S,view) {const q=S.project(p);return [(q[0]-view.x)*view.z+960,(q[1]-view.y)*view.z+540,q[2]];}
function bboxProp(o){let b=new THREE.Box3();o.traverse(m=>{if(m.isMesh&&shown(m)){m.geometry.computeBoundingBox();b.union(m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld));}});return b;}
function reachedDebug(a){return lieCalls.get(a);}
function evaluate(S) {
 const sh=shots.find(x=>x.S3===S), actors=(sh?.st?.actors||[...S.actors]).filter(a=>shown(a.group)&&a.group.parent===S.scene), st=sh?.st, note=st?.actcheck||{};
 const e=sh?.cover?.filter(e=>e.t<=current.t).at(-1), v=sh?.v;
 const view=v?{x:Math.max(960/v[2]+2,Math.min(1920-960/v[2]-2,v[0])),y:Math.max(540/v[2]+2,Math.min(1080-540/v[2]-2,v[1])),z:Math.max(1.06,v[2])}:{x:960,y:540,z:1};
 const boxes=new Map(), inFrame=new Set();
 const out=[], fail=(check,actor,value,limit,detail)=>out.push({...current,check,actor,value:+value.toFixed(5),limit,detail});
 let visible=0;
 for(const a of actors){
  const head=points(a,'head'), hp=head.map(p=>screen(p,S,view)), hb=new THREE.Box3().setFromPoints(hp.map(p=>V(...p)));
  const bp=points(a,'body'), sb=new THREE.Box3().setFromPoints(bp.map(p=>V(...screen(p,S,view))));
  if(sb.max.x>=0&&sb.min.x<=1920&&sb.max.y>=0&&sb.min.y<=1080&&sb.min.z<=1&&sb.max.z>=-1){visible++;inFrame.add(a.name);}
  boxes.set(a,new THREE.Box3().setFromPoints(points(a,'upper').map(p=>V(...screen(p,S,view)))));
  const target=e?.on===a.name || (!e&&actors.length===1);
  if(process.env.ACTCHECK_DEBUG && current.t===0) console.error('geometry',a.name,'root',pos(a,'root').toArray(),'feet',points(a,'footL').reduce((x,p)=>Math.min(x,p.y),Infinity),'pelvis',points(a,'pelvis').reduce((x,p)=>Math.min(x,p.y),Infinity),'engineSeat',globalThis.__PO.lowestOf(a,['root']));
  if(target&&!note.insert){const miss=Math.max(18-hb.min.y,hb.max.y-1062,-hb.min.x,hb.max.x-1920,0);if(miss>0)fail('headroom',a.name,miss,0,'pixels outside frame / 18px headroom');}
  const mark=S.qa?.actMarks?.[a.name]||a.actMark||{}, support=note.supports?.[a.name]??(mark.tread!=null?st?.ST?.y(mark.pose==='step'?mark.tread-1:mark.tread):0)??0;
  const low=bp.reduce((x,p)=>Math.min(x,p.y),Infinity);
  if(low<support-.005){const idx=bp.findIndex(p=>p.y===low), {m,parts}=model(a),id=parts.body[idx],si=m.geometry.attributes.skinIndex,sw=m.geometry.attributes.skinWeight;let j=0;for(let k=1;k<4;k++)if(sw.getComponent(id,k)>sw.getComponent(id,j))j=k;fail('below-floor',a.name,support-low,.005,'skinned '+m.skeleton.bones[si.getComponent(id,j)].name);}
  const feet=['L','R'].map(s=>points(a,'foot'+s).reduce((x,p)=>Math.min(x,p.y),Infinity));
  if(!note.carried?.includes(a.name)&&!['cross','kneel','lie','step'].includes(mark.pose)&&Math.min(...feet)>support+.03)fail('foot-gap',a.name,Math.min(...feet)-support,.03,'lowest sole above support');
  if(['cross','step'].includes(mark.pose)) {
    const seat=mark.o?.seat??0, pel=pos(a,'root').y-.12*a.group.scale.y/1.6;
    if(pel-seat>.04)fail('seat-gap',a.name,pel-seat,.04,'pelvis capsule underside to declared seat (12cm adult radius)');
  }
  const height=CAST[a.name]?.height;
  if(height) { const measured=(a.S.top-a.S.bottom)*(a.mesh||model(a).m).parent.getWorldScale(V()).y, error=Math.abs(measured/height-1); if(error>.05)fail('actor-scale',a.name,error,.05,`bind height ${measured.toFixed(3)}m / cast ${height}m`); }
  const lowPart=n=>points(a,n).reduce((v,p)=>Math.min(v,p.y),Infinity);
  if(mark.pose==='lie') {
    const o=mark.o||{}, top=o.top??0, pillow=o.pillow??.08, reached=lieCalls.get(a);
    if(!o.mattress)fail('bed-footprint-missing',a.name,1,0,'pose lie without o.mattress');
    if(!reached?.natural)fail('lie-option',a.name,1,0,'natural option did not reach PO.lie through staged build');
    for(const [part,surface] of [['pelvis',top],['chest',top],['head',top+pillow],['footL',top],['footR',top]]) {
      const contact=part==='head'?globalThis.__PO.lowestOf(a,['head']):lowPart(part);const gap=Math.abs(contact-surface); if(gap>.03)fail('lie-contact',a.name,gap,.03,part+' to mattress/pillow');
    }
    const axis=pos(a,'neck').sub(pos(a,'root')).normalize(), tilt=Math.asin(Math.abs(axis.y))*180/Math.PI;
    if(tilt>=8)fail('lie-tilt',a.name,tilt,8,'pelvis-to-neck axis vs horizontal mattress');
    if(o.mattress) for(const n of ['root','chest','head','footL','footR']) {
      const p=S.project(pos(a,n).setY(top)), poly=o.mattress;let inside=false;
      for(let i=0,j=poly.length-1;i<poly.length;j=i++)if((poly[i][1]>p[1])!==(poly[j][1]>p[1])&&p[0]<(poly[j][0]-poly[i][0])*(p[1]-poly[i][1])/(poly[j][1]-poly[i][1])+poly[i][0])inside=!inside;
      if(!inside)fail('bed-footprint',a.name,1,0,n+' outside painted mattress top');
    }
    const hy=pos(a,'head').y;
    for(const s of ['L','R']){const dy=pos(a,'hand'+s).y-hy;if(dy>.08)fail('arms-high',a.name+' '+s,dy,.08,'hand above the head while lying');}
  }
  const avoids=[...new Set([...Object.values(S.qa?.actMarks||{}), mark].map(m=>m?.o?.avoid).filter(Array.isArray))];
  for(const poly of avoids) for(const n of ['root','footL','footR']) {
    const p=S.project(pos(a,n).clone().setY(mark.pose==='lie'?(mark.o?.top??0):pos(a,n).y)); let inside=false;
    for(let i=0,j=poly.length-1;i<poly.length;j=i++)if((poly[i][1]>p[1])!==(poly[j][1]>p[1])&&p[0]<(poly[j][0]-poly[i][0])*(p[1]-poly[i][1])/(poly[j][1]-poly[i][1]||1e-9)+poly[i][0])inside=!inside;
    if(inside)fail('prop-overlap',a.name,1,0,n+' inside o.avoid');
  }
  const brief=[activeBeat?.text,activeBeat?.visual,activeBeat?.act,activeBeat?.action,activeBeat?.comment].filter(Boolean).join(' \n ');
  const plain=brief.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase();
  const wantsFace=/tete dans [\w' ]{0,24}mains|visage dans [\w' ]{0,20}mains|face in (both |her |his )?hands|clutches head|enfouit son visage|hands to cheeks|palms to (her |his )?temples|head in both hands/.test(plain);
  if(wantsFace && mark.pose!=='lie') {
    const cast=activeBeat?.cast||[];
    const named=cast.length===1?cast[0]===a.name:plain.includes(String(a.name).toLowerCase());
    if(named) for(const s of ['L','R']){const d=globalThis.__PO.handPts(a,s).palm.distanceTo(pos(a,'head')); if(process.env.DBGH)console.error('HF',activeBeat?.id,s,d.toFixed(3));if(d>.12)fail('hands-face',a.name+' '+s,d,.12,'palm to head');}
  }
  let gaze=mark.look;
  if(typeof gaze==='function'){try{gaze=gaze(current.t);}catch{gaze=null;}}
  if(typeof gaze==='string' && mark.pose!=='lie') {
    const o=actors.find(x=>x.name===gaze);
    if(o){const h=pos(a,'head'),fwd=a.B.head.localToWorld(V(0,0,1)).sub(h),to=pos(o,'head').sub(h); fwd.y=0; to.y=0;
      if(fwd.lengthSq()>1e-6&&to.lengthSq()>1e-6){const ang=fwd.angleTo(to)*180/Math.PI; if(ang>42)fail('gaze',a.name,ang,42,'horizontal face vs '+gaze);}}
  }
  if(mark.pose==='kneel') {
    const seat=mark.o?.seat??support;
    for(const side of ['L','R']) { const gap=Math.abs(lowPart('knee'+side)-seat);if(gap>.03)fail('knee-contact',a.name,gap,.03,side+' knee to support'); }
    const heels=Math.max(pos(a,'footL').y,pos(a,'footR').y), pelvis=pos(a,'root').y;
    if(pelvis<=heels)fail('kneel-pelvis',a.name,heels-pelvis,0,'pelvis must be above heels');
    const pitch=Math.acos(THREE.MathUtils.clamp(pos(a,'neck').sub(pos(a,'root')).normalize().y,-1,1))*180/Math.PI;
    if(!/prostrate/i.test(activeBeat?.comment||'')&&pitch>=35)fail('kneel-upright',a.name,pitch,35,'pelvis-to-neck pitch');
  }
  if(['kneel','cross','step','sit'].includes(mark.pose)) for(let i=0;i<2;i++) {const gap=feet[i]-(mark.pose==='kneel'?mark.o?.seat??support:mark.o?.floor??support);if(gap>.04)fail('hanging-foot',a.name,gap,.04,(i?'R':'L')+' sole above support');}
  const own=capsules(a), torso=own.find(c=>c.n==='torso');
  for(const limb of own.filter(c=>/^(foreArm|hand)/.test(c.n))) {const penetration=torso.r+limb.r-segmentDistance(torso.p,torso.q,limb.p,limb.q);if(penetration>.03)fail('self-intersection',a.name,penetration,.03,limb.n+' inside own torso');}
  if(target&&!note.insert&&!mark.backOk&&!/backs? to (the )?(lens|camera)|de dos|back-to-camera/i.test(activeBeat?.comment||'')) {const face=a.B.head.localToWorld(V(0,0,1)).sub(pos(a,'head')).normalize(), angle=face.angleTo(S.cam.position.clone().sub(pos(a,'head')))*180/Math.PI;if(angle>100)fail('facing',a.name,angle,100,'face normal vs camera');}
  if(process.env.ACTCHECK_DEBUG&&current.t===0)console.error('bed',a.name,mark.pose,'scale',a.group.scale.y,'lie',{...reachedDebug(a),headLow:globalThis.__PO.lowestOf(a,['head'])},'parts',Object.fromEntries(['pelvis','chest','head','footL','footR','kneeL','kneeR'].map(n=>[n,lowPart(n)])),'plate',Object.fromEntries(['root','head','footL','footR'].map(n=>[n,S.project(pos(a,n).setY(mark.o?.top??0))])), 'bones',Object.fromEntries(['root','neck','head','shinL','footL','upperArmL','foreArmL','handL'].map(n=>[n,pos(a,n).toArray()])));
  if(mark.costume==='haik'||a.qa?.model==='zoubida_haik') {
    // Radial shell centred on torso, matched to the unposed cloth's widths at wrist/forearm height.
    for(const s of ['L','R'])for(const n of ['hand'+s,'foreArm'+s]) {
      if(note.exposed?.[a.name]?.includes(n))continue;
      const p=a.group.worldToLocal(pos(a,n)), root=a.group.worldToLocal(pos(a,'root')), neck=a.group.worldToLocal(pos(a,'neck'));
      const u=Math.max(0,Math.min(1,(p.y-root.y)/(neck.y-root.y))), radiusAt=a.haikMantle ? .235-.035*Math.max(0,Math.min(.87,p.y/(neck.y+.018))) : .19-.055*u, rx=radiusAt, rz=a.haikMantle?radiusAt*.86:.19-.065*u;
      const radius=Math.hypot((p.x-root.x)/rx,(p.z-root.z)/rz), excess=(radius-1)*Math.min(rx,rz)*a.group.scale.y;
      if(excess>.03)fail('haik',a.name,excess,.03,n+' outside approximate radial drape');
    }
  }
 }
 // Actors named by the beat's cast/comment must intersect the actual crop, including background witnesses.
 const required=new Set([...(/cutaway/i.test(activeBeat?.comment||'')?[]:activeBeat?.cast||[]),...Object.keys(CAST).filter(n=>new RegExp('\\b'+n+'\\b','i').test(activeBeat?.comment||'')),...(e?.on?[e.on]:[])]);
 for(const n of required)if(!CAST[n]?.voice_only&&!note.insert&&!inFrame.has(n))fail('actor-present',n,1,0,'named beat actor outside frame or absent');
 const caps=new Map(actors.map(a=>[a,capsules(a)]));
 for(const a of actors.filter(a=>a.name===e?.on)) {
   const box=boxes.get(a);if(!box||box.isEmpty())continue;
   const L=Math.max(0,box.min.x),R=Math.min(1920,box.max.x),T=Math.max(0,box.min.y),B=Math.min(1080,box.max.y);let blocked=0,total=0;
   for(let ix=0;ix<20;ix++)for(let iy=0;iy<20;iy++) { const x=L+(ix+.5)*(R-L)/20,y=T+(iy+.5)*(B-T)/20;
     const ndc=V(((x-960)/view.z+view.x)/960-1,1-((y-540)/view.z+view.y)/540,0).unproject(S.cam), end=ndc.sub(S.cam.position).normalize().multiplyScalar(S.cam.position.distanceTo(pos(a,'chest'))).add(S.cam.position);total++;
     if(actors.some(b=>b!==a&&caps.get(b).some(c=>segmentDistance(S.cam.position,end,c.p,c.q)<c.r)))blocked++;
   }
   if(blocked/total>.25)fail('actor-occlusion',a.name,blocked/total,.25,'foreground actor capsules over target head+torso box');
 }
 for(let i=0;i<actors.length;i++)for(let j=i+1;j<actors.length;j++) {
  const a=actors[i],b=actors[j];let worst=null;
  for(const x of caps.get(a))for(const y of caps.get(b)){
   if(note.contacts?.some(c=>c.actors.includes(a.name)&&c.actors.includes(b.name)&&(!c.parts||c.parts.includes(x.n+':'+y.n)||c.parts.includes(y.n+':'+x.n))))continue;
   const d=x.r+y.r-segmentDistance(x.p,x.q,y.p,y.q);if(d>.03&&(!worst||d>worst.d))worst={d,parts:x.n+':'+y.n};
  }
  if(worst)fail('overlap',a.name+'/'+b.name,worst.d,.03,worst.parts);
 }
 for(const r of note.reaches||[]){const a=actors.find(a=>a.name===r.actor);if(a){const error=pos(a,'hand'+r.side).distanceTo(r.target());const key=[current.beat,r.actor,r.side,'final-contact'].join(' '),m=metrics.get(key)||{beat:current.beat,actor:r.actor,side:r.side,kind:'final-contact',max:0,calls:0,purpose:r.purpose};m.max=Math.max(m.max,error);m.calls++;metrics.set(key,m);if(error>.03)fail('contact',r.actor+' '+r.side,error,.03,r.purpose);}}
 for(const o of S.qa?.props||[]) {
  if(!shown(o)||o.userData.ambient)continue; const box=bboxProp(o);if(box.isEmpty())continue;
  const center=box.getCenter(V()), owner=note.props?.find(p=>st?.[p.key]===o);
  let a=actors.find(a=>a.name===(owner?.holder||o.userData.holder));
  if(!a){let d=.22;for(const x of actors)for(const s of ['L','R']){const dd=box.distanceToPoint(pos(x,'hand'+s));if(dd<d){d=dd;a=x;}}}
  if(!a)continue;
  const h=pos(a,'head'), gaze=S.cam.position.clone().sub(h).normalize(), depth=center.clone().sub(h).dot(gaze);
  const face=points(a,'head').map(p=>screen(p,S,view)), fb=new THREE.Box3().setFromPoints(face.map(p=>V(...p))), pb=new THREE.Box3().setFromPoints(corners(box).map(p=>V(...screen(p,S,view))));
  const area=Math.max(0,Math.min(fb.max.x,pb.max.x)-Math.max(fb.min.x,pb.min.x))*Math.max(0,Math.min(fb.max.y,pb.max.y)-Math.max(fb.min.y,pb.min.y));
  if(depth>0&&area>0)fail('prop-face',a.name,area/Math.max(1,(fb.max.x-fb.min.x)*(fb.max.y-fb.min.y)),0,'held bbox overlaps camera-to-face cone ('+(o.name||o.type)+', children='+o.children.length+')');
 }
 if(e&&!note.insert&&(e.size==='M'||e.size==='W'||e.size==='CU')) for(const a of actors) {
  const strict=/s07_lundi|s05_memoire/.test(current?.scene||process.argv.join(' '))&&!process.env.ACT_NO_STRICT_EDGE;   // opt-in (s07): any head that shows at all must be fully in frame
  if(e.size==='CU'&&a.name===e.on&&!strict) continue;
  const hp=points(a,'head').map(p=>screen(p,S,view)); if(!hp.length) continue;
  const hb=new THREE.Box3().setFromPoints(hp.map(p=>V(...p))), cx=(hb.min.x+hb.max.x)/2, cy=(hb.min.y+hb.max.y)/2;
  if(process.env.ACT_DUMP)console.error('HS',current.beat,current.t.toFixed(1),a.name,Math.round(hb.min.x),Math.round(hb.max.x),Math.round(hb.min.y),Math.round(hb.max.y));
  if(strict?(hb.max.x<=0||hb.min.x>=1920||hb.max.y<=0||hb.min.y>=1080):(cx<-30||cx>1950||cy<-30||cy>1110)) continue;
  if(process.env.ACT_DUMP)console.error('HD',current.beat,current.t.toFixed(1),e.size,e.on,a.name,Math.round(hb.min.x),Math.round(hb.max.x),Math.round(hb.min.y),Math.round(hb.max.y),JSON.stringify(view));
  const miss=Math.max(8-hb.min.y,hb.max.y-1072,-hb.min.x,hb.max.x-1920,0);
  if(miss>0)fail('head-crop',a.name,miss,0,(e.size||'shot')+' slices the head');
 }
 if(note.held){const h=note.held, who=actors.find(a=>a.name===h.actor);
  if(who&&h.prop?.visible){const d=h.prop.getWorldPosition(V()).distanceTo(globalThis.__PO.handPts(who,h.side).palm); if(d>(h.max??.06))fail('held-prop',who.name+' '+h.side,d,h.max??.06,'prop off the palm');}
  else if(who&&h.required)fail('held-prop',who.name,1,0,'prop not visible');}
 if(!visible&&!note.insert&&(sh?.st?.actors.length||e?.on))fail('empty','frame',1,0,'no posed body intersects crop');
 captures.push({sh,actors:actors.map(a=>({name:a.name,baseline:beforeAct.get(a),walking:!!(((S.qa?.actMarks?.[a.name]||a.actMark)?.walk&&current.t>=(S.qa?.actMarks?.[a.name]||a.actMark).walk.t0&&current.t<(S.qa?.actMarks?.[a.name]||a.actMark).walk.t1)||((S.qa?.actMarks?.[a.name]||a.actMark)?.climb&&current.t>=(S.qa?.actMarks?.[a.name]||a.actMark).climb.t0&&current.t<(S.qa?.actMarks?.[a.name]||a.actMark).climb.t1)),bones:Object.fromEntries(['spine','chest','upperArmL','foreArmL','upperArmR','foreArmR'].map(n=>[n,a.B[n].quaternion.toArray()])),rest:Object.fromEntries(['spine','chest','upperArmL','foreArmL','upperArmR','foreArmR'].map(n=>[n,a.B[n].userData.rest.toArray()]))}))});
 return out;
}
function frozen(entry,beat){return entry.count>=3&&!entry.walking&&(entry.rest||entry.default||entry.unchanged)&&beat?.cast?.includes(entry.name)&&/reach|grip|slic|clutch|swat|fan|lift|hugg|shov|weigh|sob|cry|slump|bow|bend|kneel|walk|run|hurr/i.test([beat.action,beat.visual,beat.act,beat.comment].join(' '));}
let rows=[];globalThis.__actSample=S=>{rows.push(...evaluate(S));};
async function run(){
 let selected=null,out='/tmp/actcheck8.json',step=1;
 for(let i=2;i<process.argv.length;i++){const f=process.argv[i],v=process.argv[++i];if(f==='--scenes')selected=v.split(',');else if(f==='--out')out=v;else if(f==='--step')step=+v;else throw Error('unknown option '+f);}
 if(!(step>0))throw Error('--step must be positive');
 globalThis.__PO=await import(pathToFileURL(path.join(ROOT,'engine/poses.js')));
 const K=await import(pathToFileURL(path.join(ROOT,'engine/core.js')));K.setCtx(new OffscreenCanvas(1920,1080).getContext('2d'));
 const timing=read('episodes/ep08/timing.json'), beats=read('episodes/ep08/beats.json').beats, stats=[];
 if(selected?.some(x=>!timing.some(s=>s.id===x||s.id.startsWith(x+'_'))))throw Error('Unknown scene selector');
 for(const sc of timing.filter(s=>!selected||selected.some(x=>s.id===x||s.id.startsWith(x+'_')))) {
  window.__qa={actors:[],props:[],stages:[],active:[]};rows=[];calls=[];captures=[];metrics=new Map();
  console.log(sc.id+': loading CPU geometry');
  const started=performance.now(),bs=beats.filter(b=>b.scene===sc.id),source=fs.readFileSync(path.join(ROOT,'episodes/ep08/scenes',sc.id+'.js'),'utf8');
  const comments=(source.match(/\/\/[^\n]*/g)||[]).join('\n');
  for(const b of bs){const k=comments.indexOf(b.id);if(k>=0)b.comment=comments.slice(k+b.id.length).split(/\bb\d{3}\b/)[0].split('\n')[0].slice(0,350);}
  const S={dur:sc.end-sc.start,lines:sc.lines.map(l=>({...l,t0:l.start-sc.start,t1:l.start-sc.start+l.dur,who:l.who||l.speaker,env:[]})),L:i=>{const l=sc.lines[i];return l?[l.start-sc.start,l.start-sc.start+l.dur]:[0,0];}};
  current={scene:sc.id,t:0,beat:'build'};building=true;
  try{
   const mod=(await import(pathToFileURL(path.join(ROOT,'episodes/ep08/scenes',sc.id+'.js')))).default;await mod.preload?.();building=false;
   const buildCalls=calls.splice(0), times=new Set([0]);
   for(let t=0;t<S.dur;t+=step)times.add(+t.toFixed(4));
   for(let i=0;i<sc.lines.length;i++){const [a,b]=S.L(i);times.add(+(a+.02).toFixed(4));for(const u of [.05,.5,.95])times.add(+(a+(b-a)*u).toFixed(4));}
   for(const f of fs.readdirSync(path.join(ROOT,'out/rigqa/argon')).filter(f=>/^r\d+_/.test(f)&&f.includes(sc.id)&&f.endsWith('.json'))){for(const tile of read('out/rigqa/argon/'+f).tiles||[]) {const t=+tile.tile.split(' ').at(-1);if(Number.isFinite(t))times.add(t);}}
   let samples=0,still=0;const freeze=new Map();
   for(const t of [...times].sort((a,b)=>a-b).filter(t=>t<S.dur)) {
    let j=sc.lines.findLastIndex(l=>l.start-sc.start<=t);j=Math.max(0,j);activeBeat=bs[j];current={scene:sc.id,t,beat:bs[j]?.id||'pre'};calls=[];captures=[];window.__qa.active=[];K.setTime(t);
    mod.draw(t,S);samples++;if(!captures.length){still++;continue;}
    for(const c of calls)if(c.visible)rows.push({...current,check:'IK',actor:c.actor,side:c.side,value:c.error,limit:.03,detail:c.fn,caller:c.caller,target:c.target,shoulder:c.shoulder});
    const visibleActors=new Set(captures.flatMap(c=>c.actors.map(a=>a.name)));
    for(const c of buildCalls)if(visibleActors.has(c.actor)&&captures.some(cap=>cap.sh?.S3.scene.uuid===c.stage)&&!rows.some(r=>r.beat===current.beat&&r.check==='IK-build'&&r.actor===c.actor&&r.side===c.side))rows.push({...current,check:'IK-build',actor:c.actor,side:c.side,value:c.error,limit:.03,detail:c.fn,caller:c.caller,target:c.target,shoulder:c.shoulder});
    for(const cap of captures)for(const a of cap.actors){const key=current.beat+':'+a.name,entry=freeze.get(key)||{...current,name:a.name,count:0,rest:true,default:true,walking:false,unchanged:true,first:a.bones};entry.count++;entry.walking ||= a.walking;for(const n in a.bones){const dist=(q,r)=>1-Math.abs(q.reduce((s,x,i)=>s+x*r[i],0));if(dist(a.bones[n],a.rest[n])>1e-7)entry.rest=false;if(!a.baseline||dist(a.bones[n],a.baseline[n])>1e-7)entry.default=false;if(dist(a.bones[n],entry.first[n])>1e-7)entry.unchanged=false;}freeze.set(key,entry);}
   }
   for(const a of freeze.values())if(frozen(a,bs.find(b=>b.id===a.beat)))rows.push({scene:sc.id,t:a.t,beat:a.beat,check:'frozen',actor:a.name,value:a.count,limit:0,detail:a.rest?'arm/spine identical to bind rest for entire sampled beat':a.default?'arm/spine identical to default hang/idle for entire sampled beat':'arm/spine identical for entire sampled beat; verify promised action'});
   // Deduplicate nested IK instrumentation but preserve every call in the machine report.
   const counts={};for(const r of rows)counts[r.check]=(counts[r.check]||0)+1;
   stats.push({scene:sc.id,samples,stills:still,seconds:+((performance.now()-started)/1000).toFixed(2),peakRSSMiB:+(process.resourceUsage().maxRSS/1024).toFixed(1),measurements:[...metrics.values()].map(m=>({...m,max:+m.max.toFixed(6)})),counts});
   const compact=new Map();for(const r of rows){const key=[r.check,r.actor,r.side==='LeftArm'?'L':r.side==='RightArm'?'R':r.side||'',r.check==='haik'?r.detail:''].join(' ');if(!compact.has(key)||r.value>compact.get(key).value)compact.set(key,r);}
   console.log(`\n${sc.id}: ${rows.length?'FAIL':'PASS'} (${samples} samples, ${still} stills, ${stats.at(-1).seconds}s)`);console.log(' beat   time    check          actor / side                 worst    limit');
   for(const r of [...compact.values()].sort((a,b)=>(b.value/(b.limit||1))-(a.value/(a.limit||1))))console.log(` ${r.beat.padEnd(6)} ${r.t.toFixed(2).padStart(6)}  ${r.check.padEnd(14)} ${(r.actor+(r.side?' '+r.side:'')).padEnd(28)} ${r.value.toFixed(4).padStart(8)} ${r.limit} ${r.detail||''}`);
  }catch(e){building=false;rows.push({...current,check:'runtime',actor:'scene',value:1,limit:0,detail:e.stack});console.error(sc.id,e.stack);stats.push({scene:sc.id,error:e.message});}
  fs.mkdirSync(path.dirname(path.resolve(out)),{recursive:true});const prev=globalThis.__allRows||[];prev.push(...rows);globalThis.__allRows=prev;fs.writeFileSync(out,JSON.stringify({limits:{IK:.03,seat:.04,feet:.03,overlap:.03,haik:.03},sampling:{step,beatFractions:[.05,.5,.95],argonTiles:true,geometry:'1000 stratified body vertices + dominant-bone extrema; up to 350 head/sole vertices + extrema',textures:'omitted; actual GLB positions, weights and skeleton retained'},stats,failures:prev},null,2)+'\n');
 }
 console.log('\nJSON: '+out);process.exitCode=globalThis.__allRows?.length?1:0;
}
async function selfTest(){
  const assert=(ok,msg)=>{if(!ok)throw Error('self-test: '+msg);};
  const PO=await import(pathToFileURL(path.join(ROOT,'engine/poses.js')));
  function fixture(name,x=0,y=0){
    const B={},group=new THREE.Group();group.position.set(x,y,0);
    const bone=(n,parent,p)=>{const b=new THREE.Bone();b.name=n;b.userData.abs=V(...p);b.userData.rest=b.quaternion.clone();B[n]=b;(parent?B[parent]:group).add(b);b.position.copy(b.userData.abs).sub(parent?B[parent].userData.abs:V());};
    bone('root',null,[0,.8,0]);bone('spine','root',[0,1,0]);bone('chest','spine',[0,1.2,0]);bone('neck','chest',[0,1.4,0]);bone('head','neck',[0,1.5,0]);
    for(const [s,sign] of [['L',1],['R',-1]]){bone('upperArm'+s,'chest',[sign*.2,1.3,0]);bone('foreArm'+s,'upperArm'+s,[sign*.4,1.1,0]);bone('hand'+s,'foreArm'+s,[sign*.55,1,0]);bone('thigh'+s,'root',[sign*.08,.8,0]);bone('shin'+s,'thigh'+s,[sign*.08,.4,0]);bone('foot'+s,'shin'+s,[sign*.08,.05,.05]);}
    const g=new THREE.BoxGeometry(.2,1.6,.2);g.translate(0,.8,0);const count=g.attributes.position.count;
    g.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(new Uint16Array(count*4),4));const w=new Float32Array(count*4);for(let i=0;i<count;i++)w[i*4]=1;g.setAttribute('skinWeight',new THREE.Float32BufferAttribute(w,4));
    const mesh=new THREE.SkinnedMesh(g,new THREE.MeshBasicMaterial());group.add(mesh);group.updateMatrixWorld(true);mesh.bind(new THREE.Skeleton(Object.values(B)));
    return {name,group,B,mesh,S:{neck:1.3,ankle:.06,hip:.8,hand:[.55,1]}};
  }
  const a=fixture('a'),b=fixture('b',.05),scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(40,1920/1080,.05,80);cam.position.set(0,.8,5);cam.lookAt(0,.8,0);cam.updateMatrixWorld(true);
  const S={scene,cam,actors:new Set(),qa:{props:[]},project:p=>{const v=p.clone().project(cam);return [(v.x+1)*960,(1-v.y)*540,v.z];}};
  const sh={S3:S,st:{actors:[],actcheck:{}},cover:[]};shots.push(sh);current={scene:'fixture',t:1,beat:'test'};
  assert(!evaluate(S).some(r=>r.check==='empty'),'explicit plate-only shot must remain valid');
  sh.cover=[{t:0,on:'a',size:'M'}];assert(evaluate(S).some(r=>r.check==='empty'),'empty crop with a required actor must fail');sh.cover=[];
  for(const actor of [a,b]){scene.add(actor.group);S.actors.add(actor);sh.st.actors.push(actor);}scene.updateMatrixWorld(true);
  assert(evaluate(S).some(r=>r.check==='overlap'),'penetrating limb/torso capsules must fail');
  sh.st.actors=[a];S.actors=new Set([a]);b.group.removeFromParent();a.group.position.y=.12;a.group.updateMatrixWorld(true);
  assert(evaluate(S).some(r=>r.check==='foot-gap'),'floating soles must fail');
  a.group.position.y=-.08;a.group.updateMatrixWorld(true);assert(evaluate(S).some(r=>r.check==='below-floor'),'buried mesh must fail');
  a.group.position.y=.3;a.group.updateMatrixWorld(true);S.qa.actMarks={a:{pose:'step',o:{seat:0}}};assert(evaluate(S).some(r=>r.check==='seat-gap'),'pelvis above seat must fail');
  a.group.position.y=0;a.group.updateMatrixWorld(true);S.qa.actMarks={a:{costume:'haik'}};assert(evaluate(S).some(r=>r.check==='haik'),'hand outside cloth shell must fail');
  S.qa.actMarks={};const prop=new THREE.Mesh(new THREE.BoxGeometry(.22,.2,.12),new THREE.MeshBasicMaterial());prop.position.copy(pos(a,'head')).add(V(0,0,.15));scene.add(prop);scene.updateMatrixWorld(true);S.qa.props=[prop];sh.st.prop=prop;sh.st.actcheck.props=[{key:'prop',holder:'a'}];
  assert(evaluate(S).some(r=>r.check==='prop-face'),'prop in face cone must fail');
  S.qa.props=[];sh.v=[960,900,4];sh.cover=[{t:0,on:'a',size:'CU'}];assert(evaluate(S).some(r=>r.check==='headroom'),'cropped target head must fail');sh.v=null;
  calls=[];const err=PO.reach(a,'R',V(4,1,0),{grip:0});assert(err>.03&&calls.some(c=>c.fn==='reach'&&c.actor==='a'&&c.side==='R'&&c.error===err),'reach wrapper must retain actor, side, caller and exact returned metres');
  calls=[];const grip=PO.grip(a,'L',V(-4,1,0),V(-4,1,.1));assert(grip>.03&&calls.some(c=>c.fn==='grip'&&c.error===grip),'grip wrapper must retain actual palm error');
  assert(segmentDistance(V(0,0,0),V(1,0,0),V(0,.2,0),V(1,.2,0))===.2,'parallel capsule distance');
  const defaultBeat={count:3,walking:false,rest:false,default:true,unchanged:false,name:'a'};assert(frozen(defaultBeat,{cast:['a'],action:'reach'}),'default hang must fail an action beat even with idle sway');assert(!frozen({...defaultBeat,default:false},{cast:['a'],action:'reach'}),'authored motion must not freeze');
  console.log('actcheck8 self-test: PASS (IK, grips, seat, feet, floor, overlap, cloth, face prop, headroom, empty frame, frozen action)');
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){if(process.argv.includes('--self-test'))await selfTest();else await run();}

