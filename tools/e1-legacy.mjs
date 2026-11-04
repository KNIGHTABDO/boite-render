// Cloud-only legacy audit: repeat the unchanged source before comparing the E1 source.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import puppeteer from 'puppeteer-core';
import { serve } from './serve.mjs';
if(process.env.GITHUB_ACTIONS!=='true')throw new Error('E1 renders run only in GitHub Actions.');
const before=await fs.readFile(new URL('./fixtures/e1-stage3d.before.js',import.meta.url),'utf8'),after=await fs.readFile('engine/stage3d.js','utf8');
assert.equal(after.replace(/  \/\*\* E1 set pass:[\s\S]*?(?=  \/\*\* screen anchors)/,''),before);
const srv=await serve();let browser;
const samples=[],t=4;
try{
 browser=await puppeteer.launch({executablePath:process.env.CHROME||'/usr/bin/google-chrome',headless:true,timeout:60000,env:{...process.env,XDG_CONFIG_HOME:'/tmp/e1-xdg'},args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-background-networking','--disable-component-update','--no-first-run','--proxy-server=http://127.0.0.1:9','--proxy-bypass-list=localhost;127.0.0.1']});
 const page=await browser.newPage();await page.setViewport({width:1920,height:1080});await page.setCacheEnabled(false);let mode='before',loads=[],servedSourceSha=null;
 await page.setRequestInterception(true);page.on('request',r=>{
  const u=new URL(r.url());if(u.hostname!=='localhost')return void r.abort();
  if(u.pathname==='/engine/stage3d.js'){const body=mode==='before'?before:after;servedSourceSha=crypto.createHash('sha256').update(body).digest('hex');return void r.respond({status:200,contentType:'text/javascript',headers:{'Cache-Control':'no-store'},body});}
  void r.continue();
 });
 page.on('requestfinished',r=>{if(r.url().endsWith('.glb'))loads.push(new URL(r.url()).pathname);});
 page.on('pageerror',e=>console.log('ERROR',e.message));
 await page.evaluateOnNewDocument(()=>{let seed=1729;Math.random=()=>{seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed/4294967296;};localStorage.clear();});
 await fs.mkdir('out/e1/legacy',{recursive:true});
 // Six repeats establish the baseline envelope, rather than accepting a mismatch on the first comparison.
 for(const [kind,count] of [['before',6],['after',3]])for(let i=0;i<count;i++){
  mode=kind;loads=[];servedSourceSha=null;await page.goto(`http://localhost:${srv.address().port}/episodes/ep06/film.html`);await page.waitForFunction('window.ready===true',{timeout:60000});
  const png=await page.evaluate(async t=>{await window.drawAt(t);await window.drawAt(t);return window.cv.toDataURL('image/png');},t);
  const bytes=Buffer.from(png.split(',')[1],'base64'),file=`legacy/${kind}-${i}.png`;
  assert.equal(servedSourceSha,crypto.createHash('sha256').update(kind==='before'?before:after).digest('hex'));
  await fs.writeFile('out/e1/'+file,bytes);samples.push({kind,file,sourceSha256:servedSourceSha,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),modelLoadOrder:[...loads]});
  console.log(kind,i,samples.at(-1).sha256);
 }
 await fs.writeFile('out/e1/legacy-manifest.json',JSON.stringify({episode:'ep06',t,size:[1920,1080],old_draw_source_identical:true,method:'one Chrome; six fresh pre-E1 documents and three current documents, same seed, localStorage reset, second draw in every document',samples},null,2)+'\n');
}finally{if(browser)await browser.close();await new Promise(r=>srv.close(r));}
