// Pilot captures go through shot.mjs, sequentially. Never launch a second Chrome while one is active.
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
if (process.env.GITHUB_ACTIONS !== 'true') throw new Error('E1 renders run only in the stills.yml GitHub Actions workflow.');
const mode=process.argv[2] || 'stills', plates=process.argv[3]?[process.argv[3]]:['barbier','msid_feerie','msid_facade'];
fs.mkdirSync('out/e1',{recursive:true});
function capture(page,out,times,width=1920){
 const mem=spawnSync('free',['-h'],{encoding:'utf8'});process.stdout.write(mem.stdout);
 const r=spawnSync(process.execPath,['tools/shot.mjs',page,out,times],{stdio:'inherit',env:{...process.env,CHROME_EXTRA:'--no-sandbox --use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader',SHOT_WIDTH:String(width)}});
 if(r.status!==0)throw new Error('shot.mjs failed: '+out);
}
if(mode==='stress'){
 const moves=[{dolly:1},{dolly:1.2},{dolly:1.5},{dolly:2},{orbit:-10},{orbit:10},{orbit:15},{crane:.1},{crane:.3},{truck:.1},{truck:.3}];
 for(const n of plates)capture('test/proto/projset.html?p='+n+'&samples='+encodeURIComponent(JSON.stringify(moves)),`out/e1/${n}-stress.jpg`,moves.map((_,i)=>i).join(','),960);
}else if(mode==='range'){
 const moves=[{dolly:.5},{dolly:1},{orbit:-3},{orbit:3},{crane:.1},{truck:.1}];
 for(const n of plates)capture('test/proto/projset.html?p='+n+'&samples='+encodeURIComponent(JSON.stringify(moves)),`out/e1/${n}-range.jpg`,'0,1,2,3,4,5',960);
}else if(mode==='stills'){
 for(const n of plates)capture('test/proto/projset.html?p='+n+'&suite=1&view='+encodeURIComponent('[960,540,1.08]'),`out/e1/${n}.png`,'-1,0,1,2,3,4,5');
}else if(mode==='motion'){
 fs.mkdirSync('out/e1/barbier-push',{recursive:true});
 const times=Array.from({length:36},(_,i)=>(i/12).toFixed(6));
 capture('test/proto/projset.html?p=barbier&anim=1&view='+encodeURIComponent('[960,540,1.08]'),'out/e1/barbier-push/frame.jpg',times.join(','),854);
 times.forEach((t,i)=>fs.renameSync(`out/e1/barbier-push/frame_${t}.jpg`,`out/e1/barbier-push/frame_${String(i).padStart(3,'0')}.jpg`));
}else if(mode==='legacy')capture('episodes/ep06/film.html','out/e1/legacy-after.png','4');
else throw new Error('mode: stress | range | stills | motion | legacy');
