// s13 "L'attente". souk_mur: a sunny passage, a long stone bench along the left wall (front edge ≈ (20,750)→(560,560)),
// the dried-fruit counter on the right. The family waits on the floor in front of the bench. b083 CU low on Mohammed:
// the knees give, the trunk sags, a huge yawn (jaw wide, head back, eyes shut), then he leans on his mother's haik.
// b084 souk_bijoux: the dellal comes back down the lane, arm up with the pair, shouts the higher figure; the father's
// small nod; the dellal turns and goes again. b085 W, souk_bijoux: the souk at full boil: the dellal runs up the lane
// dragging a client by the hand, a woman and two urchins hurry the other way. b086 souk_mur: a wave of people rushes past
// in front of them and the three are shoved back against the bench (bodies jolt back, Zoubida's arm goes round the boy).
// b087 CU (OTS): the father has the boy up in his arms, the boy's cheek on his shoulder, the father's chest heaving.
// b088 CU low on Zoubida: sharp head jerks, her right hand slicing the air. b089 souk_bijoux: the father and Zoubida
// scan the crowd, heads turning slowly; nobody.
import * as PO from '../../../engine/poses.js';
import * as IK from '../../../engine/ik.js';
import { staged, THREE } from '../lib/autostage.js';
import { walk } from '../lib/acts.js';
import { rest } from '../../../engine/rig3d.js';
import { role } from './_3d.js';
import { castScale } from '../lib/fix8c.js';
import { liftCloth } from '../lib/fix8_R31J.js';
import { bracelets } from './s17_retour.js';
import { beatScene, lines, sm, front, at, V, yawTo, dirW } from '../lib/beatscene.js';

// Shared only by the repaired ep08 scenes. Keep floor fitting, cloak repair and contact declarations together.
// The scan welded sleeve/hood triangles to several unrelated arm/spine bones. Large bends stretched those
// triangles across the face. Retain the scanned face, hood, hands and shoes; replace its fused body cloth with
// a closed, modestly subdivided mantle. Its rings follow the torso, not the wrists or individual trouser legs.
export function haikCloth(a) {
  if (!a.haikMantle) {
    const mesh = a.mesh, geo = mesh.geometry, p = geo.attributes.position, si = geo.attributes.skinIndex, sw = geo.attributes.skinWeight;
    const bones = mesh.skeleton.bones, isHand = bones.map(b => /Hand/.test(b.name)), head = bones.indexOf(a.B.head), kept = [];
    const hand = i => { let w = 0; for (let j=0;j<4;j++) if(isHand[si.getComponent(i,j)]) w += sw.getComponent(i,j); return w > .65; };
    const ix = geo.index.array;
    for(let i=0;i<ix.length;i+=3) {
      const ids = [ix[i],ix[i+1],ix[i+2]];
      if(ids.every(j=>p.getY(j)>a.S.neck-.015) || ids.every(hand) || ids.every(j=>p.getY(j)<a.S.ankle+.025)) kept.push(...ids);
    }
    // Hood and head rotate as one volume; sleeve weights must never pull the hood over the face.
    for(let i=0;i<p.count;i++) if(p.getY(i)>a.S.neck-.015) {si.setXYZW(i,head,0,0,0);sw.setXYZW(i,1,0,0,0);}
    geo.setIndex(kept); si.needsUpdate=sw.needsUpdate=true;
    a.group.traverse(o=>{if(o.isSkinnedMesh && o.geometry!==geo) o.visible=false;});
    const rings=12, sides=32, g=new THREE.BufferGeometry(), verts=new Float32Array((rings+1)*(sides+1)*3), index=[];
    for(let j=0;j<rings;j++)for(let i=0;i<sides;i++){const n=j*(sides+1)+i;index.push(n,n+sides+1,n+1,n+1,n+sides+1,n+sides+2);}
    g.setAttribute('position',new THREE.BufferAttribute(verts,3));g.setIndex(index);
    const cloth=new THREE.Mesh(g,new THREE.MeshToonMaterial({color:0xeee8db,side:THREE.DoubleSide}));cloth.castShadow=true;cloth.receiveShadow=true;cloth.frustumCulled=false;
    a.group.add(cloth);delete a.floorSamples;a.haikMantle={cloth,rings,sides};
  }
  // per-frame restores (_3d.js) and resetCast drop children added after placement and re-show hidden parts: re-assert both every call
  if(a.haikMantle.cloth.parent!==a.group)a.group.add(a.haikMantle.cloth);
  a.group.traverse(o=>{if(o.isSkinnedMesh && o.geometry!==a.mesh.geometry) o.visible=false;});
  const {cloth,rings,sides}=a.haikMantle, p=cloth.geometry.attributes.position;
  const root=a.group.worldToLocal(at(a,'root')), chest=a.group.worldToLocal(at(a,'chest')), neck=a.group.worldToLocal(at(a,'neck'));
  const bottom=.012, top=neck.y+.018;
  for(let j=0;j<=rings;j++) {
    const u=j/rings,y=bottom+(top-bottom)*u, q=Math.max(0,Math.min(1,(y-root.y)/(neck.y-root.y))), center=root.clone().lerp(chest,Math.min(1,q*1.5)).lerp(neck,Math.max(0,(q-.65)/.35));
    const radius=u>.87 ? .205-(u-.87)/.13*.11 : .235-.035*u;
    for(let i=0;i<=sides;i++){const angle=i/sides*Math.PI*2, fold=1+.025*Math.cos(angle*8);let X=center.x+Math.cos(angle)*radius*fold,Y=y,Z=center.z+Math.sin(angle)*radius*.86*fold;
      const D=a.haikLift;   // opt-in (s14 b093): hem raised and knee bulge on the side facing D.dx/D.dz
      if(D&&D.w>0){const vx=X-center.x,vz=Z-center.z,l=Math.hypot(vx,vz)||1,w=Math.max(0,(vx*D.dx+vz*D.dz)/l)**2*D.w;Y=y+w*D.lift*Math.max(0,1-u/.62);const bu=w*D.bulge*Math.exp(-(((u-.3)/.14)**2));X+=bu*D.dx;Z+=bu*D.dz;}
      p.setXYZ(j*(sides+1)+i,X,Y,Z);}
  }
  p.needsUpdate=true;cloth.geometry.computeVertexNormals();cloth.updateMatrixWorld(true);
}

export function checkedStage(plate, marks, options={}) {
  const act=options.act;
  const sh=staged(plate,marks,{...options,act(lt,t,S,st,S3){
    // Cast heights from cast.json (heightOf() gives every adult 1.62 / child 1.15).
    for(const a of Object.values(st.A))castScale(a);
    act?.(lt,t,S,st,S3);
    const traffic=typeof options.traffic==='function'?options.traffic(t):options.traffic||[];
    // Extras yield a shoulder-width in the lane; linked hands and embraces remain authored contacts.
    for(let pass=0;pass<5;pass++)for(const name of traffic){const a=st.A[name];if(!a?.group.visible)continue;
      for(const [other,b] of Object.entries(st.A)){
        if(other===name||!b.group.visible||st.actcheck?.contacts?.some(c=>c.actors.includes(name)&&c.actors.includes(other)))continue;
        const d=a.group.position.clone().sub(b.group.position).setY(0),space=.62*(a.group.scale.y+b.group.scale.y)/3.2,dist=d.length();
        if(dist<space){if(dist<1e-6)d.set(name<other?1:-1,0,.1);d.normalize();a.group.position.addScaledVector(d,space-dist);a.group.updateMatrixWorld(true);}
      }
    }
    st.actcheck ||= {};
    for(const [name,a] of Object.entries(st.A)) {
      if(!a.group.visible)continue;
      if(marks[name].costume==='haik'||a.qa?.model==='zoubida_haik') {
        for(const side of ['L','R'])if(!st.actcheck.exposed?.[name]?.includes('hand'+side)) {
          PO.reach(a,side,front(a,'chest',(st.actcheck.haikFwd?.[name]??.22)*k(a),(side==='L'?-1:1)*(st.actcheck.haikLat?.[name]??.075)*k(a),-.20*k(a)),{grip:.01,pole:side==='L'?[.12,.08,.04]:[-.12,.08,.04]});
        }
        haikCloth(a);
      }
      if(!['cross','kneel','lie','step'].includes(marks[name].pose)&&!st.actcheck.carried?.includes(name)) {
        // Both a walk cycle and a reaction may bend the legs. Ground the actual posed surface, not the hip.
        let mesh=a.mesh; if(!mesh)a.group.traverse(o=>{if(!mesh&&o.isSkinnedMesh)mesh=o;});
        if(!a.floorSamples){
          const p=mesh.geometry.attributes.position,si=mesh.geometry.attributes.skinIndex,sw=mesh.geometry.attributes.skinWeight,all=[...new Set(mesh.geometry.index.array)],e=new Map();
          for(const i of all){let weight=0,bone=0;for(let j=0;j<4;j++)if(sw.getComponent(i,j)>weight){weight=sw.getComponent(i,j);bone=si.getComponent(i,j);}
            let ex=e.get(bone);if(!ex)e.set(bone,ex=Array(6).fill(i));for(let d=0;d<3;d++){if(p.getComponent(i,d)<p.getComponent(ex[d*2],d))ex[d*2]=i;if(p.getComponent(i,d)>p.getComponent(ex[d*2+1],d))ex[d*2+1]=i;}}
          const body=all.filter(i=>i%8===0),stride=Math.ceil(body.length/1000);a.floorSamples=[...new Set([...body.filter((_,i)=>i%stride===0),...[...e.values()].flat()])];
        }
        const ids=a.floorSamples;
        let low=Infinity;const v=V(0,0,0);a.group.updateMatrixWorld(true);
        for(const i of ids){mesh.getVertexPosition(i,v);mesh.localToWorld(v);low=Math.min(low,v.y);}
        if(Number.isFinite(low)){a.group.position.y+=(st.actcheck.supports?.[name]||0)-low;a.group.updateMatrixWorld(true);}
      }
    }
  }});
  const load=sh.load;
  sh.load=async()=>{
    await load();
    for(const [name,m] of Object.entries(marks))if(m.costume==='haik'&&name==='fatma'&&!sh.st.A[name].haikCopy){
      const old=sh.st.A[name],a=await role('zoubida',{costume:'haik',copy:plate+':fatma'});
      a.name=name;a.actMark=m;a.home=old.home;a.haikCopy=true;
      a.group.position.copy(old.group.position);a.group.rotation.copy(old.group.rotation);a.group.scale.setScalar(1.58);
      old.group.removeFromParent();sh.S3.scene.add(a.group);a.group.updateMatrixWorld(true);
      const i=sh.st.actors.indexOf(old);sh.st.A[name]=a;sh.st.actors[i]=a;
      for(const face of sh.st.faces)if(face[0]===old)face[0]=a;
      const h=at(a,'head');sh.heads[i]=sh.S3.project(h);sh.headOff[i]=h.clone().sub(a.group.position);sh.bodyPx[i]=sh.S3.project(h.clone().add(V(0,-.83*a.group.scale.y,0)))[1]-sh.heads[i][1];
    }
  };
  const draw=sh.fn;
  sh.fn=(...args)=>{
    // Arm lengths are in world metres: the shared cast cache can have been used at another shot's scale.
    for(const a of sh.st.actors)delete a.armLen;
    return draw(...args);
  };
  return sh;
}

const ID = 's13_attente', L = lines(ID), B = i => L[i] || [0, 0];
const k = a => a.group.scale.y / 1.6;
const f = (i, x) => B(i)[0] + x * (B(i)[1] - B(i)[0]);
const win = (i, a, b, t) => sm(f(i, a) - .3, f(i, a) + .3, t) * (1 - sm(f(i, b), f(i, b) + .5, t));

// the wall blocking, shared with s14/s15: backs to the bench, facing the lens and a little right
export const MUR = { zoubida: [420, 790], mohammed: [560, 820], fatma: [700, 735], father: [690, 860] };

// Local spacing leaves the boy a clear silhouette beside the haik; MUR stays shared and unchanged.
const WALL = { zoubida: MUR.zoubida, mohammed: [565, 790], father: [760, 790] };
const LANE = { father: [600, 790], mohammed: [560, 830], zoubida: [700, 790] };
const child = a => { a.group.scale.setScalar(1.1); a.group.updateMatrixWorld(true); };
const sync = (...actors) => actors.forEach(a => a.group.updateMatrixWorld(true));
const scriptedGaze = { apply() {} };
// Haik hands emerge in front of the drape, never through the cloth at the hip.
const closeHaik = a => {
  for (const s of ['L', 'R']) PO.reach(a, s, front(a, 'chest', .14 * k(a), (s === 'R' ? .07 : -.07) * k(a), -.12 * k(a)), { grip: .015 });
};

const mu = checkedStage('souk_mur', {
  zoubida: { at: WALL.zoubida, face: 'cam', yaw: .28, costume: 'haik', pose: 'cross', hands: false, o: { seat: 0, lean: .08, hands: false },
    seed: 7, talk: 0, lookMax: .25,
    look: t => t < B(1)[0] ? 'mohammed' : [1000, 790, 1.5] },
  mohammed: { at: [520, 800], face: 'cam', yaw: .2, pose: 'cross', o: { seat: 0, lean: .3, hands: false }, hands: false, seed: 3, talk: 0, lookMax: 0,
    lids: t => .35 + .65 * win(0, .46, .88, t),
    // mutter's face driver multiplies by .25.. .5: four keeps the yawn wide throughout its hold.
    mutter: t => 14 * win(0, .46, .88, t) },
  father: { at: WALL.father, face: 'cam', yaw: -.35, seed: 5, talk: 0, lookMax: .35, look: [1100, 700, 1.5] },
  fatma: { at: [900, 770], face: 'cam', yaw: -.2, seed: 9, talk: 0, lookMax: .7, look: 'father' },
  man1: { at: [1330, 930], face: [120, 905], seed: 21, talk: 0 },
  fqih: { at: [1330, 980], face: [120, 905], seed: 23, talk: 0 },
  guerrab: { at: [1250, 940], face: [200, 880], seed: 24, talk: 0 },
  driss: { at: [1330, 930], face: [120, 905], seed: 26, talk: 0 },
  woman1: { at: [1250, 940], face: [200, 880], seed: 25, talk: 0 },
}, {
  light: { shadow: .4, area: 6 },
  traffic:['man1','fqih','guerrab','driss','woman1'],
  act(lt, t, S, st, S3) {
    // The later Zoubida line otherwise makes the gaze net turn the boy toward her even in b083.
    st.G = scriptedGaze;
    const { zoubida: zo, mohammed: mo, father: fa, fatma: fm } = st.A;
    child(mo); closeHaik(zo);
    if (fm) { fm.group.visible = t >= B(3)[0] - .3 && t <= B(3)[1]; if (fm.group.visible) { fm.group.position.copy(S3.floorAt(1180, 745)); sync(fm); } }   // R31S: Fatma now her own model (no haik copy of Zoubida = no duplicate). R25I: far right, behind the crowd, never beside Zoubida
    st.actcheck={haikLat:{zoubida:win(3, -.02, .9, t) > 0 ? .10 : .09},haikFwd:{zoubida:.26},exposed:{zoubida:t>=B(3)[0]&&t<B(4)[0]?['handL','foreArmL']:[]},contacts:[]};
    const km = k(mo), kz = k(zo);
    // b083: seated, knees given way, trunk slumped; yawn at ~6.6 s (jaw wide, head tilted back), then he leans on her haik.
    if (t < B(1)[0]) {
      fa.group.position.copy(S3.floorAt(1250, 790));
      const yawn = win(0, .46, .88, t), lean = sm(f(0, .87), B(0)[1], t), sag = sm(B(0)[0] - 1.6, f(0, .18), t);
      mo.B.spine.rotation.x += .18 * sag; mo.B.chest.rotation.x += .12 * sag;   // R31S: sag harder
      mo.B.neck.rotation.x -= 1.0 * yawn; mo.B.head.rotation.x -= .45 * yawn;
      mo.B.spine.rotation.z += .36 * (.4 * sag + lean); mo.B.head.rotation.z += .36 * lean;
      sync(mo);
      if (t < B(1)[0]) mo.group.position.addScaledVector(mo.group.position.clone().sub(zo.group.position).setY(0).normalize(), .03);
      sync(mo);
      const cloth = front(zo, 'root', .22 * kz, -.30 * kz, .30 * kz);
      for (const s of ['L', 'R']) PO.reach(mo, s, front(mo, 'root', .09 * km, s === 'R' ? .09 : -.07, .12 * km), { grip: .01 });   // R31Q: L target closer to the shoulder (IK reach)
      PO.reach(mo, 'R', front(mo, 'root', .09 * km, .09, .12 * km).lerp(cloth, lean), { grip: .01 });
    }

    // b086: five staggered foreground crossings. At most two cross the family together;
    // the family spans 580px, so one passing body cannot erase all three silhouettes.
    // R25I: a real wave: all five within ~1 s, and a second surge so b086's later stills still show crowd.
    const rush = [
      ['man1', [1330, 950], [120, 950], -.35],
      ['fqih', [1330, 985], [200, 950], -.15],
      ['guerrab', [1250, 985], [120, 950], 0],
      ['driss', [1330, 950], [200, 950], .20],
      ['woman1', [1250, 985], [120, 950], .35],
    ];
    for (const [n, p0, p1, delay] of rush) {
      if ((n === 'guerrab' || n === 'man1') && t > B(3)[0] + 2.2) { st.A[n].group.visible = false; continue; }   // gate: M slices his head in the second surge
      const a = st.A[n], w1 = B(3)[0] + .7 + delay + 2.9, w0 = B(3)[0] - .1 + (delay + .35) * .6;   // R31S: wave already crossing at the b086 cut   // R30B: second surge 1 s later, b086's 30.00 sample had it across the father
      let t0 = w0, t1 = t0 + 1.9, q0 = p0, q1 = p1;
      if (t > t1 + .2) { t0 = w1; t1 = t0 + 1.2; q0 = [p0[0], 715]; q1 = [p1[0], 715]; }   // R31C: second surge passes BEHIND the family (lane y715), never over the father   // R31C: faster second surge, clear of the father by b086 30.96
      a.group.visible = t >= t0 && t <= t1;
      if (a.group.visible) {
        rest(a.B); walk(a, S3.floorAt(...q0), S3.floorAt(...q1), t0, t1, t, { cps: 3.8, ease: false });
        a.B.spine.rotation.x += .22;
        if(n==='guerrab')for(const side of ['L','R'])a.B['foot'+side].rotation.x-=.45;
        sync(a);
      }
    }
    const shove = win(3, -.02, .9, t);
    const jolt = shove * (.75 + .25 * Math.max(0, Math.sin((t - B(3)[0]) * 9)));
    for (const a of [zo, mo, fa]) {
      const back = a.group.position.clone().sub(S3.cam.position).setY(0).normalize();
      a.group.position.addScaledVector(back, .2 * jolt);
      a.B.spine.rotation.x -= .30 * jolt; a.B.neck.rotation.x += .12 * jolt;
      if (a === fa) { a.B.thighR.rotation.x += .18 * jolt; a.B.shinR.rotation.x += .25 * jolt; }
    }
    sync(zo, mo, fa);
    if (shove > 0) mo.group.position.addScaledVector(mo.group.position.clone().sub(zo.group.position).setY(0).normalize(), .08 * shove);
    sync(mo);
    if (shove > 0) {
      // Reach to the CHILD's shoulder height, with the elbow outside the haik.
      const wrap = at(mo, 'upperArmR').add(V(0, .03, .03));   // hand on his shoulder, not wrapped round
      wrap.addScaledVector(zo.group.position.clone().sub(mo.group.position).setY(0).normalize(), .055);
      const sh=at(zo,'upperArmL'), len=sh.distanceTo(at(zo,'foreArmL'))+at(zo,'foreArmL').distanceTo(at(zo,'handL'));
      if(sh.distanceTo(wrap)>len*.95){const d=wrap.clone().sub(sh).setY(0).normalize();zo.group.position.addScaledVector(d,sh.distanceTo(wrap)-len*.95);sync(zo);}
      PO.reach(zo, 'L', wrap, { grip: .01, pole: [.45, .12, .2] });
      PO.reach(mo, 'L', front(mo, 'chest', .16, -.12, -.08), { grip: .01 });
      PO.reach(mo, 'R', front(mo, 'chest', .14, .12, -.1), { grip: .01 });
    }

    // b088: shoulder-high cuts, clear of the veil; keep the other palm in front of the cloth.
    if (t >= B(5)[0]) {
      // The family remains beside her, outside this close-up's right edge.
      mo.group.position.copy(S3.floorAt(1000, 790));
      fa.group.position.copy(S3.floorAt(1250, 790));
      const ph = (t - B(5)[0]) * 1.65, cut = Math.sin(ph * Math.PI * 2) ** 3;
      zo.B.head.rotation.y += .30 * Math.sin(ph * 4.2) ** 3;
      zo.B.neck.rotation.x += .17 * Math.max(0, Math.sin(ph * 5.1)) ** 4;
      sync(zo);
      // R25I: the raised hand tore the haik (spikes behind the head, forearm through the chest). The hands now stay in
      // front of the cloth (haikFwd pulses with each cut); the sharp head jerks carry the beat.
      zo.B.head.rotation.y += .18 * Math.sin(ph * 6.3) ** 3;
    }
    // R30B: the cross-legged seat sinks the skirt/robe below the floor; absolute lift (cached base y, so scrubbing is safe)
    { const by = st.baseY ||= { zo: zo.group.position.y, mo: mo.group.position.y };
      zo.group.position.y = by.zo - .01 + (t < B(1)[0] ? .008 : 0); mo.group.position.y = by.mo + .01; }
    if (t < B(1)[0]) { zo.B.thighL.rotation.x -= .03; zo.B.shinL.rotation.x += .10; }
    if (shove > 0 || t >= B(3)[0]) { const w = Math.max(shove, t >= B(3)[0] ? 1 : 0); zo.B.thighL.rotation.x -= .012 * w; zo.B.shinL.rotation.x += .10 * w; }   // R31Q: same lift during the b086 shove   // R31Q: knee up / shin tucked, lifts the left leg off the floor in b083
    sync(zo, mo); liftCloth(zo, t < B(1)[0] ? .14 : t < B(3)[0] ? .09 : .22); liftCloth(mo);   // R31J: seat gap / hanging sole
    sync(zo, mo, fa);
  },
});

// b087: use the standing child rig at its normal 1.10m scale. A floor-seated pose would
// pull the robe down to the floor after lifting it; here the bent legs and robe dangle together.
const ca = checkedStage('souk_mur', {
  father: { at: [1000, 790], face: 'cam', yaw: -.9, seed: 5, talk: 0, lookMax: .12 },
  mohammed: { at: [1180, 820], face: 'cam', seed: 3, lids: .7, talk: 0, lookMax: 0 },
  zoubida: { at: WALL.zoubida, face: 'cam', yaw: .28, costume: 'haik', seed: 7, talk: 0, look: 'mohammed', lookMax: .25 },
}, {
  light: { shadow: .4, area: 6 },
  act(lt, t, S, st) {
    const { father: fa, mohammed: mo, zoubida: zo } = st.A;
    child(mo); closeHaik(zo);
    st.actcheck={carried:['mohammed'],contacts:[{actors:['father','mohammed'],parts:['foreArmR:thighL','foreArmR:thighR','foreArmR:torso','foreArmL:torso','upperArmR:torso','torso:torso','head:upperArmR','head:torso','upperArmL:torso','foreArmL:upperArmR','foreArmL:upperArmL','foreArmR:upperArmR','foreArmR:upperArmL']} ]};
    const kf = k(fa), km = k(mo), lift = sm(B(4)[0] - .5, B(4)[0] + .08, t);
    fa.B.chest.rotation.x -= .065 + .05 * Math.sin((t - B(4)[0]) * 3.4);
    fa.B.neck.rotation.x += .10;
    mo.group.rotation.y = fa.group.rotation.y + Math.PI;
    mo.B.spine.rotation.x += .45;
    mo.B.neck.rotation.x += .12; mo.B.head.rotation.z += .28;
    for (const s of ['L', 'R']) {
      mo.B['thigh' + s].rotation.x -= .20;
      mo.B['shin' + s].rotation.x += .45;
      mo.B['foot' + s].rotation.x += .12;
    }
    sync(fa, mo);
    // Head outside the neck, cheek against the outer shoulder, torso in front of the chest.
    const cheek = at(mo, 'head', [.10, .02, .06]);
    const shoulder = front(fa, 'upperArmR', .08 * kf, .25 * kf, -.08 * kf);
    const delta = shoulder.sub(cheek);
    mo.group.position.x += delta.x; mo.group.position.z += delta.z;
    mo.group.position.y += delta.y * lift;
    // keep the boy's torso outside the father's chest/djellaba: the cheek rests on the shoulder, not inside the neck
    mo.group.position.addScaledVector(dirW(fa, 0, 0, 1), .0 * lift); mo.group.position.y += .0 * lift;   // R31Q: boy held higher, chest forward against father's chest, off the forearm/pelvis
    sync(mo);
    // Low supporting forearm under the pelvis; the other arm wraps the outside of his back.
    // R31J: father's L hand on the boy's side at shoulder width (the side nearer that shoulder), elbow out
    const sideL = () => { const sh = at(fa, 'upperArmL'), a = front(mo, 'chest', -.02 * km, .14 * km, -.04 * km), b = front(mo, 'chest', -.02 * km, -.14 * km, -.04 * km); return sh.distanceTo(a) < sh.distanceTo(b) ? a : b; };
    const seat = front(mo, 'root', .15 * km, .06 * km, 0).add(V(0, .03 * km, 0));
    st.actcheck.reaches=[{actor:'father',side:'R',target:()=>front(mo,'root',.15*km,.06*km,0).add(V(0,.03*km,0)),purpose:'forearm supporting boy pelvis'},{actor:'father',side:'L',target:()=>sideL().addScaledVector(dirW(fa, -1, 0, 0), -.15).addScaledVector(dirW(mo, 0, 0, -1), .10).add(V(0, -.08, 0)),purpose:'arm around boy back'}];
    PO.reach(fa, 'R', seat, { grip: .015, pole: [-.9, -.1, .2] });
    PO.reach(fa, 'L', sideL().addScaledVector(dirW(fa, -1, 0, 0), -.15).addScaledVector(dirW(mo, 0, 0, -1), .10).add(V(0, -.08, 0)), { grip: .015, pole: [1.0, .3, .1] });   // R31Q: hand out from midline
    PO.reach(mo, 'R', front(fa, 'neck', .13, .14 * kf, -.08), { grip: .01 });
    PO.reach(mo, 'L', front(fa, 'upperArmR', .24 * kf, .16 * kf, .05), { grip: .01 });
    sync(fa, mo, zo);
  },
});

// b084/b085/b089: a readable mid-depth lane, with the whole family kept beside it.
const la = checkedStage('souk_bijoux', {
  father: { at: LANE.father, face: 'cam', yaw: 0, seed: 5, talk: 0, lookMax: .95,
    look: (t, st) => t >= B(6)[0] ? front(st.A.father, 'head', 1.8, 2.2 * Math.sin((t - B(6)[0]) * .9 - 1.2), 0) : 'marchand' },
  zoubida: { at: LANE.zoubida, face: 'cam', yaw: .28, costume: 'haik', seed: 7, talk: 0, lookMax: .8,
    look: (t, st) => t >= B(6)[0] ? front(st.A.zoubida, 'head', 1.8, 2.0 * Math.sin(1.2 - (t - B(6)[0]) * .9), 0) : [1180, 720, 1.5] },
  mohammed: { at: LANE.mohammed, face: 'marchand', yaw: .25, seed: 3, lids: .6, talk: 0, look: 'marchand', lookMax: .9 },
  marchand: { at: [1080, 690], face: [700, 790], seed: 13, talk: 1,
    mutter: t => t < B(2)[0] ? 3 * win(1, 0, .66, t) : 2 * win(2, 0, 1.1, t) },
  man1: { at: [880, 830], face: [1180, 720], seed: 21, talk: 0 },
  woman1: { at: [1250, 690], face: [700, 930], seed: 25, talk: 0 },
  kid2: { at: [1180, 720], face: [560, 900], seed: 27, talk: 0 },
  kid3: { at: [1330, 690], face: [700, 930], seed: 29, talk: 0 },
  fqih: { at: [700, 930], face: [1180, 720], seed: 31, talk: 0 },
  woman2: { at: [1180, 720], face: [1250, 940], seed: 33, talk: 0 },
}, {
  light: { shadow: .38, area: 7 },
  traffic:t=>t>=B(6)[0]-.3?['man1','woman1','kid2','kid3','fqih','woman2']:['woman1','kid2','kid3','fqih','woman2'],
  addressee: { marchand: 'father' },
  act(lt, t, S, st, S3) {
    const { father: fa, zoubida: zo, mohammed: mo, marchand: ma, man1: client } = st.A;
    child(mo); closeHaik(zo);
    PO.reach(zo, 'R', front(zo, 'chest', .24 * k(zo), .22 * k(zo), -.12 * k(zo)), { grip: .015 });   // R31Q: R hand out .15 lateral, .1 fwd (forearm out of torso)
    const F = (x, y) => S3.floorAt(x, y), km = k(ma), kf = k(fa);
    const addressYaw = p => {
      const y0 = yawTo(p, S3.cam.position), y1 = yawTo(p, fa.group.position);
      return y0 + Math.atan2(Math.sin(y1 - y0), Math.cos(y1 - y0)) * .55;
    };
    const ta = B(1)[0], tb = f(1, .23), tc = B(1)[0] + 3.1, td = B(1)[1] + .15;
    ma.group.visible = t >= ta - .4 && t <= td;
    rest(ma.B);
    if (t < tb) walk(ma, F(1080, 690), F(1180, 720), ta - .4, tb, t, { cps: 2.5 });
    else if (t < tc) {
      ma.group.position.copy(F(1180, 720));
      ma.group.rotation.y = addressYaw(ma.group.position);
    } else {
      walk(ma, F(1180, 720), F(960, 860), tc, td, t, { cps: 2.9 });
      const turn = sm(tc - .1, tc + .25, t), y0 = addressYaw(F(1180, 720)), y1 = yawTo(F(1180, 720), F(960, 860));
      ma.group.rotation.y = y0 + Math.atan2(Math.sin(y1 - y0), Math.cos(y1 - y0)) * turn;
    }
    const shout = win(1, 0, .66, t);
    ma.B.neck.rotation.x -= .18 * shout; ma.B.spine.rotation.x -= .08 * shout;
    sync(ma);
    if (ma.group.visible) {
      // Above the head, within the measured arm length, pair in the raised right hand.
      const up = 1 - sm(tc, tc + .35, t);   // pair held UP until the turn, then lowered as he leaves
      PO.reach(ma, 'R', front(ma, 'upperArmR', .12 * km, .42 * km, .26 * km * up - .30 * km * (1 - up)), { grip: .01, pole: [.5, 0, 0] });
      PO.fingers(ma, 'R', .65);
    }
    const nod = win(1, .22, .46, t), phase = sm(f(1, .22), f(1, .44), t);
    fa.B.neck.rotation.x += .26 * nod * Math.sin(Math.PI * phase);
    sync(fa);
    if (nod > 0) PO.reach(fa, 'R', front(fa, 'chest', .35 * kf, .16 * kf, -.02), { grip: .01 });

    // Bidirectional traffic stays between y690 and y940, never at the vanishing point.
    st.actcheck={haikFwd:{zoubida:.18},haikLat:{zoubida:.17},contacts:[{actors:['marchand','man1'],parts:['foreArmL:foreArmR','foreArmL:foreArmL','foreArmR:foreArmR','foreArmL:handR','foreArmR:handL','handL:handR','handL:handL','handR:handR','foreArmL:handL','foreArmR:handR']} ]};
    const boil = t >= B(2)[0] - .2 && t < B(3)[0], scan = t >= B(6)[0] - .3;
    for (const n of ['man1', 'woman1', 'kid2', 'kid3', 'fqih', 'woman2']) st.A[n].group.visible = boil || scan;
    if (boil) {
      const t0 = B(2)[0] - .2, t1 = B(3)[0];
      // Common travel vector keeps the clasp within both men's reach for the entire run.
      rest(ma.B); rest(client.B); ma.group.visible = true;
      walk(ma, F(960, 860), F(1200, 700), t0, t1, t, { cps: 4.2, ease: false });
      const off = F(960, 830).sub(F(880, 830)).setLength(.7);
      off.add(V(off.z, 0, -off.x).setLength(.3));
      walk(client, F(960, 860).add(off), F(1200, 700).add(off), t0, t1, t, { cps: 4.0, ease: false });
      ma.B.spine.rotation.x += .32; client.B.spine.rotation.x += .25;
      sync(ma, client);
      { const yc = yawTo(ma.group.position, S3.cam.position), y0 = ma.group.rotation.y; ma.group.rotation.y = y0 + Math.atan2(Math.sin(yc - y0), Math.cos(yc - y0)) * .8; sync(ma); }   // R31S: turn BEFORE the clasp reach (it used to drag the posed arms off the target)
      const nearest=(a,b)=>a.group.worldToLocal(b.group.position.clone()).x>0?'L':'R';
      const drag=st.dragSide=nearest(ma,client), receive=nearest(client,ma);
      const clasp = at(ma, 'upperArm'+drag).lerp(at(client, 'upperArm'+receive), .5);   // R31C: nearer the dragger so the client's forearm leaves his torso
      clasp.y -= .32;
      { const sg = drag === 'L' ? 1 : -1; PO.reach(ma, drag, clasp, { grip: 0, pole: [sg * .7, .1, .3] }); }   // R31J: elbow outward
      PO.reach(client, receive, clasp, { grip: 0, pole: [.3, .05, -.25] });   // R31C: pole flipped
      PO.fingers(ma, drag, .65); PO.fingers(client, receive, .65);
      for (const [n, p0, p1, delay] of [
        ['woman1', [1250, 690], [700, 930], 0],
        ['kid2', [1180, 720], [820, 920], .35],
        ['kid3', [1330, 690], [900, 1000], .6],
        ['fqih', [700, 930], [560, 900], .05],
        ['woman2', [1080, 640], [1180, 720], .18],
      ]) {
        const a = st.A[n]; rest(a.B);
        walk(a, F(...p0), F(...p1), t0 + delay, t1 + delay, t, { cps: n.startsWith('kid') ? 5.4 : 4.6, ease: false });
        a.B.spine.rotation.x += .25; sync(a);
      }
    } else if (scan) {
      // Ordinary shoppers only: the missing dellal never reappears during the search.
      ma.group.visible = false;
      for (const [n, p0, p1] of [
        ['man1', [1080, 690], [1250, 790]],
        ['woman1', [1000, 690], [950, 640]],
        ['kid2', [1180, 720], [1100, 830]],
        ['kid3', [1080, 830], [1250, 690]],
        ['fqih', [1250, 860], [1330, 740]],
        ['woman2', [1250, 940], [1330, 720]],
      ]) {
        const a = st.A[n]; rest(a.B);
        walk(a, F(...p0), F(...p1), B(6)[0] - .3, B(6)[1] + 2.5, t, { cps: 2, ease: false });
      }
    }
    const sl = st.slip ||= (() => { const g = new THREE.Group(); for (const dx of [-1, 1]) { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 8), new THREE.MeshToonMaterial({ color: 0xe3b11c })); m.scale.set(.15, .035, .06); m.position.set(dx * .05, dx * .02, 0); m.rotation.z = dx * .25; g.add(m); const tip = new THREE.Mesh(new THREE.ConeGeometry(.03, .08, 8), new THREE.MeshToonMaterial({ color: 0xc89418 })); tip.rotation.z = Math.PI / 2; tip.position.set(dx * .05 + .17, dx * .02, 0); g.add(tip); } S3.scene.add(g); return g; })();
    sl.visible = ma.group.visible && !boil;
    if (sl.visible) { const hd = ma.B.handR; hd.updateWorldMatrix(true, false); sl.position.copy(hd.localToWorld(V(0, .13, .02))); sl.rotation.set(0, S3.cam.rotation.y, 0); sl.scale.setScalar(k(ma) * .8); sl.updateMatrixWorld(true); }
    const br = st.br ||= bracelets(S3);
    br.visible = ma.group.visible;
    if (br.visible) {
      const side=boil&&st.dragSide==='R'?'L':'R';
      if (boil) PO.reach(ma, side, front(ma, 'chest', .25 * km, .17 * km, .15 * km), { grip: .01 });
      const hand=ma.B['hand'+side];hand.updateWorldMatrix(true, false);
      br.position.copy(hand.localToWorld(V(0, .10, .025)));
      br.quaternion.copy(hand.getWorldQuaternion(br.quaternion));
      br.scale.setScalar(2.4); br.updateMatrixWorld(true);
    }
    sync(fa, zo, mo, ma, client);
  },
});

export default beatScene(ID, {
  shots: { mu, ca, la },
  plan: {
    // dy is in plate PIXELS, positive down. Explicit offsets bypass automatic multi-head reframing.
    b083: { shot: 'mu', size: 'CU', on: 'mohammed', z: 2.3, dx: -30, dy: 15 },
    b084: { shot: 'la', size: 'M', on: 'marchand', z: 1.4, pt: [1080, 790], dx: -150, dy: 55 },
    b085: { shot: 'la', size: 'M', on: 'marchand', z: 1.5, pt: [1070, 775] },
    b086: { shot: 'mu', size: 'M', on: 'father', z: 1.15, dx: -180, dy: 90 },
    b087: { shot: 'ca', size: 'CU', on: 'father', z: 3.3, dx: -65, dy: 10 },
    b088: { shot: 'mu', size: 'CU', on: 'zoubida', z: 3.4, dx: -55, dy: 25 },
    b089: { shot: 'la', size: 'M', on: 'father', z: 1.3, dx: 120, dy: 95 },
  },
});
