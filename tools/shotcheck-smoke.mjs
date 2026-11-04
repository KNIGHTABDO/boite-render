// Single real-rig control, then byte equality with QA hooks disabled. Tiny WebGL only for the equality check.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import puppeteer from 'puppeteer-core';
import {serve} from './serve.mjs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const current=await fs.readFile(root+'/engine/stage3d.js','utf8');
const baseline=current.replace(/^  if \(globalThis.window\?\.QA\) \{\n[\s\S]*?^  \}\n/gm,'')
.replace('  if (!globalThis.window?.QA?.noRender) renderer();','  renderer();')
.replace(' if (S.qa) { S.qa.props.push(o); window.__qa.props.push(o); }','')
.replace(' if (S.qa) S.qa.covers.push(m);','')
.replace(/^    if \(S.qa\) \{\n[\s\S]*?^    \}\n/gm,'')
.replace('    if (S.qa) S.qa.faces.add(a);\n','');
assert.ok(!baseline.includes('S.qa')); assert.ok(!baseline.includes('window?.QA'));
const html=`<!doctype html><canvas id="cv" width="320" height="180"></canvas>
<script type="importmap">{"imports":{"three":"/node_modules/three/build/three.module.js","three/addons/":"/node_modules/three/examples/jsm/"}}</script>
<script type="module">
import * as K from '/engine/core.js';
import {stage,cast} from '/engine/stage3d.js';
import {sample} from '/tools/shotcheck-browser.mjs';
import {rest,idlePose} from '/engine/rig3d.js';
const ctx=document.querySelector('canvas').getContext('2d'); K.setCtx(ctx);K.setTime(0);ctx.scale(1/6,1/6);
ctx.fillStyle='#8a8977';ctx.fillRect(0,0,1920,1080);
const s=stage().lookAt([0,1,4],[0,.8,0],40);s.light({});s.key.shadow.mapSize.set(128,128);
const a=await cast('mohammed');s.add(a);
if(window.QA){
  window.result=[];let previous=null;
  for(let n=0;n<4;n++){
    K.setTime(n/4);rest(a.B);idlePose(a.B,n/4);window.__qa.active=[];s.draw({ink:0});s.anchors(a);
    const r=sample({scene:'clean-real-rig',t:n/4,previous});window.result.push(...r.failures);previous=r;
  }
} else {s.draw({ink:0});window.result=document.querySelector('canvas').toDataURL('image/png');}
window.qaOffClean = !window.QA && !window.__qa;
window.ready=true;
</script>`;
const srv=await serve(), browser=await puppeteer.launch({executablePath:process.env.CHROME || '/usr/bin/google-chrome',headless:true,args:['--disable-gpu-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try {
  const results={};
  for(const mode of ['qa','baseline','hook-off']){
    const page=await browser.newPage();await page.setViewport({width:320,height:180});
    await page.setRequestInterception(true);
    page.on('request',r=>{
      if(r.url().endsWith('/__shotcheck_fixture.html'))return void r.respond({status:200,contentType:'text/html',body:html});
      if(r.url().endsWith('/engine/stage3d.js'))return void r.respond({status:200,contentType:'text/javascript',body:(mode==='baseline'?baseline:current).replace('gl.setSize(W, H, false)','gl.setSize(320, 180, false)')});
      void r.continue();
    });
    if(mode==='qa')await page.evaluateOnNewDocument(()=>window.QA={noRender:true});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(`http://localhost:${srv.address().port}/__shotcheck_fixture.html`);
    await page.waitForFunction('window.ready===true',{timeout:60000});assert.deepEqual(errors,[]);
    const result=await page.evaluate(()=>({result:window.result,qaOffClean:window.qaOffClean}));
    if(mode==='qa'){assert.deepEqual(result.result,[]);results.cleanRealRig='PASS';results.cleanRealRigSamples=4;}
    else {assert.equal(result.qaOffClean,true);results[mode]=crypto.createHash('sha256').update(result.result).digest('hex');}
    await page.close();
  }
  assert.equal(results.baseline,results['hook-off']);console.log(JSON.stringify(results,null,2));
} finally {await browser.close();await new Promise(r=>srv.close(r));}
