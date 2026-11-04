// E1 browser checks: one Chrome, sequential plates, no remote requests or video encoding.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';
import { serve } from './serve.mjs';
if (process.env.GITHUB_ACTIONS !== 'true') throw new Error('E1 renders run only in the stills.yml GitHub Actions workflow.');
const names=process.argv[2]?.split(',') || ['barbier','msid_feerie','msid_facade'];
const srv=await serve(); let browser;
try {
 browser=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,timeout:60000,env:{...process.env,XDG_CONFIG_HOME:'/tmp/e1-xdg'},args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-background-networking','--disable-component-update','--no-first-run','--proxy-server=http://127.0.0.1:9','--proxy-bypass-list=localhost;127.0.0.1']});
 const page=await browser.newPage();await page.setViewport({width:1920,height:1080});
 await page.setRequestInterception(true);page.on('request',r=>void(new URL(r.url()).hostname==='localhost'?r.continue():r.abort()));
 page.on('pageerror',e=>console.log('ERROR',e.message));const results={};
 for(const name of names){
  console.log('start',name);
  await page.goto(`http://localhost:${srv.address().port}/test/proto/projset.html?p=${name}&qa=1`);await page.waitForFunction('window.ready===true',{timeout:60000});
  const raw=await page.evaluate(()=>{window.reference=true;window.drawAt(0);const reference=window.cv.toDataURL('image/png');window.reference=false;window.setOnly=true;window.drawAt(0);const projected=window.cv.toDataURL('image/png');window.setOnly=false;return {reference,projected};});
  await fs.mkdir('out/e1',{recursive:true});
  for(const [key,png] of Object.entries(raw))await fs.writeFile(`out/e1/${name}-${key}-raw.png`,Buffer.from(png.split(',')[1],'base64'));
  results[name]=await page.evaluate(()=>{
   const sh=window.sh,S=sh.S3,P=sh.projected,T=window.THREE,ctx=window.cv.getContext('2d');
   const identity=window.identity(),croppedIdentity=window.identity({x:1100,y:700,z:1.8});
   const limits=window.pilotCal.move_limits;
   const views=[{}, {dolly:limits.dolly}, {orbit:limits.orbit,orbitAt:sh.orbitAt.toArray()}, {crane:limits.crane}, {truck:limits.truck,fov:40}];
   const aHead=()=>sh.st.actors[0].B.head.getWorldPosition(new T.Vector3());
   const moves=views.map(m=>{window.mv=m;window.drawAt(0);return {move:m,faceErrorPx:window.faceLock(),anchors:window.anchors.face,qa:window.qaSample().failures,camera:S.cam.position.toArray(),coverDriftPx:S.project(aHead()).slice(0,2).map((v,i)=>v-sh.heads[0][i])};});
   P.move({});
   // Depth twins must suppress a marker behind a platform/wall, and produce no alpha or ink by themselves.
   const actor=sh.st.actors[0];actor.group.visible=false;S.catcher.visible=false;S.key.castShadow=false;
   const render=(view=null)=>{ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,1920,1080);ctx.save();if(view){ctx.translate(960,540);ctx.scale(view.z,view.z);ctx.translate(-view.x,-view.y);}S.draw({ink:2.2,view});ctx.restore();const d=ctx.getImageData(0,0,1920,1080).data;let alpha=0;for(let i=3;i<d.length;i+=4)alpha+=d[i];return alpha;};
   const emptyAlpha=render();
   const box=P.supports.find(o=>o.name.endsWith('top'));
   const surface=box || P.holdouts.children.find(o=>o.name==='facade left');
   surface.geometry.computeBoundingBox();const mid=surface.geometry.boundingBox.getCenter(new T.Vector3());
   let front,behind;
   if(box){front=mid.clone();front.y=.8;behind=mid.clone();behind.y=.1;}
   else {behind=mid.clone();behind.y=1;behind.z-=.1;front=behind.clone();front.z+=.4;}
   const marker=new T.Mesh(new T.SphereGeometry(.04,12,8),new T.MeshBasicMaterial({color:0xff0000}));S.scene.add(marker);
   marker.position.copy(behind);const behindAlpha=render();marker.position.copy(front);const frontAlpha=render();
   const view={x:960,y:540,z:1.08},cropFrontAlpha=render(view);marker.position.copy(behind);const cropBehindAlpha=render(view);
   S.scene.remove(marker);const cropEmptyAlpha=render(view);marker.geometry.dispose();marker.material.dispose();actor.group.visible=true;S.catcher.visible=true;
   const support=box?(()=>{const old=actor.group.position.clone();actor.group.position.copy(mid);const h=P.supportAt(actor);actor.group.position.copy(old);return h;})():0;
   return {identity,croppedIdentity,moves,emptyAlpha,behindAlpha,frontAlpha,cropFrontAlpha,cropBehindAlpha,cropEmptyAlpha,boxSupport:support,coverCount:S.qa.covers.length,mask:S.cam.layers.mask,viewCleared:!S.cam.view?.enabled};
  });console.log(name,JSON.stringify({identity:results[name].identity,crop:results[name].croppedIdentity,emptyAlpha:results[name].emptyAlpha,behindAlpha:results[name].behindAlpha,frontAlpha:results[name].frontAlpha}));
 }
 await fs.mkdir('out/e1',{recursive:true});
 await fs.writeFile('out/e1/checks'+(process.argv[2]?'-'+names.join('-'):'')+'.json',JSON.stringify(results,null,2)+'\n');
 for(const name of names){const r=results[name];
  assert.ok(r.identity.mean_abs_255<2,'identity MAE < 2/255');assert.ok(r.croppedIdentity.mean_abs_255<2,'crop identity MAE < 2/255');
  assert.equal(r.identity.holes,0);assert.equal(r.emptyAlpha,0,'no proxy ink');assert.equal(r.behindAlpha,0,'depth occludes marker');assert.ok(r.frontAlpha>0,'foreground marker visible');
  assert.equal(r.cropEmptyAlpha,0);assert.equal(r.cropBehindAlpha,0);assert.ok(r.cropFrontAlpha>0);
  assert.equal(r.mask,1);assert.equal(r.viewCleared,true);for(const m of r.moves){assert.ok(m.faceErrorPx<1e-8,'face anchors stay locked');assert.deepEqual(m.qa,[],'pilot shotcheck');}
 }
 console.log('E1 browser checks PASS');
}finally{if(browser)await browser.close();await new Promise(r=>srv.close(r));}
