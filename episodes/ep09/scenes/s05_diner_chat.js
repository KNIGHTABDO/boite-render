// s05_diner_chat: Father returns early, silent dinner, and Zineb's frightened cat (chambre_nuit).
// b019 (chambre_nuit + insert i_lampe_petrole): Father enters early from the left while Zoubida kneels by the low
// tabla to light the petrol lamp; warm yellow light floods the room once the wick catches.
// b020 (chambre_nuit): Father kneels beside Mohammed's divan (lieOnBed), pale and hollow-eyed; he reaches gently to
// touch the boy's forehead, nods slowly, then turns his head and shoulders away in silence.
// b021 (chambre_nuit + insert i_plat_safran): Silent dinner around the tabla and brown earthenware saffron dish —
// father kneels on the left, Zoubida kneels on the right, neither eats nor speaks.
// b022 (chambre_nuit): Zineb's tabby cat (cat2, loadAnimal) creeps in from the left toward the two frozen parents,
// pauses to meow timidly, puffs up in sudden fright with wide yellow eyes, and bolts off-frame left.
// b023–b026 (chambre_nuit, tag À RETENIR): Crushed by the silence, Mohammed sobs on the divan; his father stirs out
// of his numbness and speaks gently ("Où as-tu mal... Nous n'avons rien à dire.").
import * as THREE from 'three';
import * as K from '../../../engine/core.js';
import * as PO from '../../../engine/poses.js';
import * as PR from '../../../engine/props3d.js';
import { loadAnimal } from '../../../engine/rig3d.js';
import { staged } from '../lib/autostage.js';
import { dim } from '../lib/fix8_R31AE.js';
import { boyBed, BOY_H, BED_AT, lapRest, sideArms, handsToFace } from '../lib/fix9_A.js';
import { beatScene, lines, sm, at, dirW, yawTo, V } from '../lib/beatscene.js';

const { clamp, glow } = K;
const ID = 's05_diner_chat', L = lines(ID), B = i => L[i] || [0, 0];
const IN = (i, t) => t >= B(i)[0] - .15 && t < (B(i + 1)[0] || B(i)[1] + .3);

const MATTRESS = [[1188, 574], [1450, 574], [1455, 688], [1308, 690]];
const BED = {
  at: BED_AT, face: [1180, 700], pose: 'lie', height: BOY_H, seed: 3, talk: 0,
  o: { top: .28, hands: 'belly', headTurn: .45, pillow: .1, mattress: MATTRESS },
};

function reachClamp(a, side, target, opt = {}) {
  const sh = at(a, 'upperArm' + side), el = at(a, 'foreArm' + side), hd = at(a, 'hand' + side);
  const len = sh.distanceTo(el) + el.distanceTo(hd), d = target.clone().sub(sh), max = len * .85;
  if (d.length() > max) target = sh.clone().addScaledVector(d.normalize(), max);
  return PO.reach(a, side, target, opt);
}

/** Petrol lamp with brass base, glass chimney, and warm flame core. */
function petrolLampProp() {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(.045, .062, .08, 16), PR.toon(0xc89a38));
  base.position.y = .04;
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(.024, .038, .025, 14), PR.toon(0xb8862e));
  collar.position.y = .09;
  const glass = new THREE.Mesh(
    new THREE.CylinderGeometry(.022, .036, .13, 16),
    PR.toon(0xf5ecd6, { opacity: .55, side: THREE.DoubleSide }),
  );
  glass.position.y = .165;
  const flame = new THREE.Mesh(new THREE.SphereGeometry(.014, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffe488 }));
  flame.scale.set(.8, 1.5, .8);
  flame.position.y = .125;
  g.add(base, collar, glass, flame);
  g.userData = { flame };
  g.traverse(o => { if (o.isMesh && o !== flame) o.castShadow = true; });
  return g;
}

/** Brown earthenware dish with saffron stew, meat, and vegetables. */
function platSafranProp() {
  const g = PR.bowl({ r: .16, h: .075, glaze: 0x6a3c22, food: 0xd49628 });
  for (let i = 0; i < 4; i++) {
    const a = i * 1.55, meat = new THREE.Mesh(new THREE.SphereGeometry(.024, 8, 6), PR.toon(0x5c301c));
    meat.scale.set(1.2, .75, 1);
    meat.position.set(Math.cos(a) * .055, .052, Math.sin(a) * .055);
    const veg = new THREE.Mesh(new THREE.SphereGeometry(.018, 8, 6), PR.toon(i % 2 ? 0xd96a24 : 0x5c8432));
    veg.position.set(Math.cos(a + .7) * .078, .052, Math.sin(a + .7) * .078);
    g.add(meat, veg);
  }
  return g;
}

const WARM_LIGHT = { key: '#ffcb7e', keyI: 1.35, sky: '#6b6d8f', ground: '#3b2c26', fillI: .6, shadow: .25, dir: [-1.5, 2.0, 1.2] };

// b019: Father returns early, Zoubida lights the petrol lamp and warm yellow light fills the room
const nu1 = staged('chambre_nuit', {
  mohammed: { ...BED, lids: .4 },
  zoubida: {
    height: 1.6, at: [820, 820], face: 'cam', pose: 'kneel', hands: false,
    o: { grounded: true, lean: .08 }, seed: 7, talk: 0,
    look: (t, st) => t < B(0)[0] + 4.2 ? [660, 740, .7] : 'father',
    lookMax: .25,
  },
  father: {
    height: 1.76, at: [240, 980], face: [560, 840], seed: 5, talk: 0,
    walk: { to: [540, 840], t0: .05, t1: B(0)[0] + 4.6 },
    look: 'zoubida', lookMax: .6, lids: .35,
  },
}, {
  light: WARM_LIGHT,
  act(lt, t, S, st, S3) {
    boyBed(S3, st, t, 1.15);
    const { zoubida: zo, father: fa } = st.A, kz = zo.group.scale.y / 1.6;
    const lp = st.lp ||= S3.floorAt(660, 740);
    st.lamp ||= S3.prop(petrolLampProp());
    st.lamp.userData.ambient = true;
    S3.prop(st.lamp, lp.x, .36, lp.z, 0);
    const lit = sm(B(0)[0] + 3.2, B(0)[0] + 4.4, t);
    st.lamp.userData.flame.visible = lit > .05;
    st.lamp.userData.flame.scale.setScalar(.35 + .55 * lit * (1 + .08 * Math.sin(t * 14)));
    sideArms(fa, t, .07);
    lapRest(zo);
    const reachU = sm(B(0)[0] + .3, B(0)[0] + 1.3, t) * (1 - sm(B(0)[0] + 4.4, B(0)[0] + 5.3, t));
    if (reachU > .02) {
      const lap = PO.hipToWorld(zo, -.16 * kz, .06 * kz, .2 * kz);
      const wick = st.lamp.position.clone().add(V(0, .12, 0));
      reachClamp(zo, 'R', lap.lerp(wick, reachU), { grip: .02, pole: [-.3, .15, .25] });
      PO.fingers(zo, 'R', .4);
    }
    dim(fa, .82 + .18 * lit);
  },
  over(lt, u, t, S, st, S3) {
    const lit = sm(B(0)[0] + 3.2, B(0)[0] + 4.6, t);
    if (st.lamp && lit > 0) {
      const [lx, ly] = S3.project(st.lamp.position.clone().add(V(0, .14, 0)));
      glow(lx, ly, 180, '#ffd068', .32 * lit, 'screen');
      glow(lx, ly, 70, '#fff0b8', .28 * lit, 'lighter');
    }
  },
});

// b020: Pale father kneels by the bed, touches Mohammed's forehead, nods, turns away silently
const nu2 = staged('chambre_nuit', {
  mohammed: { ...BED, lids: .38 },
  father: {
    height: 1.76, at: [1120, 760], face: 'cam', pose: 'kneel', hands: false,
    o: { grounded: true, lean: .08 }, seed: 5, talk: 0, lids: .42,
    lookMax: .25,
    look: (t, st) => {
      const away = sm(B(1)[0] + 11.6, B(1)[0] + 13.2, t);
      if (away > .35) return at(st.A.father, 'head').add(V(-.9, .05, .4));
      return at(st.A.mohammed, 'head');
    },
  },
}, {
  light: WARM_LIGHT,
  act(lt, t, S, st, S3) {
    boyBed(S3, st, t, 1.15);
    const { father: fa, mohammed: mo } = st.A, kf = fa.group.scale.y / 1.6;
    dim(fa, .9);
    const touch = sm(B(1)[0] + 5.2, B(1)[0] + 6.6, t) * (1 - sm(B(1)[0] + 11.2, B(1)[0] + 12.2, t));
    const nod = sm(B(1)[0] + 10.4, B(1)[0] + 11.1, t) * (1 - sm(B(1)[0] + 11.5, B(1)[0] + 12.1, t));
    const away = sm(B(1)[0] + 12.0, B(1)[0] + 13.8, t);
    const cam = S3.cam.position;
    fa.group.rotation.y = Math.atan2(cam.x - fa.group.position.x, cam.z - fa.group.position.z) - .35 * away;
    fa.group.updateMatrixWorld(true);
    fa.B.spine.rotation.x += .16 * touch;
    fa.B.chest.rotation.x += .06 * touch;
    fa.B.neck.rotation.x += .2 * nod;
    fa.B.chest.updateWorldMatrix(false, true);
    lapRest(fa);
    if (touch > .02) {
      const lap = PO.hipToWorld(fa, .28 * kf, .12 * kf, .32 * kf);
      const brow = at(mo, 'head').clone().addScaledVector(dirW(fa, 1, 0, 0), .12 * kf);
      reachClamp(fa, 'L', lap.lerp(brow, touch), { grip: .03, pole: [.6, .15, .2] });
      PO.fingers(fa, 'L', .12, { spread: .15 });
    }
  },
});

// b021–b026: Silent dinner around the tabla + frightened cat2 + Mohammed's sobs & father's comfort
const nu3 = staged('chambre_nuit', {
  mohammed: {
    ...BED,
    lids: t => IN(4, t) || IN(6, t) ? .55 : .4,
  },
  father: {
    height: 1.76, at: [560, 840], face: 'cam', pose: 'kneel', hands: false,
    o: { grounded: true, lean: .08 }, seed: 5, lids: .35,
    lookMax: .25,
    look: (t, st) => t < B(4)[0] ? [760, 900, .4] : at(st.A.mohammed, 'head'),
  },
  zoubida: {
    height: 1.6, at: [980, 840], face: 'cam', pose: 'kneel', hands: false,
    o: { grounded: true, lean: .06 }, seed: 7, lids: .3,
    lookMax: .25,
    look: (t, st) => t < B(4)[0] ? [760, 900, .4] : at(st.A.mohammed, 'head'),
  },
}, {
  light: WARM_LIGHT,
  act(lt, t, S, st, S3) {
    const mo = boyBed(S3, st, t, 1.15);
    const { father: fa, zoubida: zo } = st.A, kf = fa.group.scale.y / 1.6;
    const tbPos = st.tbPos ||= S3.floorAt(760, 900);
    st.tabla ||= S3.prop(PR.tabla({ r: .22, h: .22 }));
    st.plat ||= S3.prop(platSafranProp());
    st.lamp ||= S3.prop(petrolLampProp());
    for (const o of [st.tabla, st.plat, st.lamp]) o.userData.ambient = true;
    S3.prop(st.tabla, tbPos.x, 0, tbPos.z, 0);
    S3.prop(st.plat, tbPos.x, .22, tbPos.z, 0);
    S3.prop(st.lamp, tbPos.x + .16, .22, tbPos.z - .06, 0);
    const heavy = t < B(4)[0] ? 1 : .25;
    fa.B.spine.rotation.x += .06 * heavy;
    fa.B.chest.rotation.x += .02 * Math.sin(t * 1.1);
    zo.B.spine.rotation.x += .05 * heavy;
    zo.B.chest.rotation.x += .02 * Math.sin(t * 1.2 + 1);
    fa.B.chest.updateWorldMatrix(false, true);
    zo.B.chest.updateWorldMatrix(false, true);
    lapRest(fa);
    lapRest(zo);
    if (t >= B(4)[0]) {
      fa.B.spine.rotation.x += .1;
      fa.B.chest.updateWorldMatrix(false, true);
      const offer = PO.hipToWorld(fa, -.3 * kf, .14 * kf, .32 * kf);
      reachClamp(fa, 'R', offer, { grip: .03, pole: [-.6, .12, .18] });
    }
    if (IN(4, t) || IN(6, t)) {
      const sob = .5 + .5 * Math.sin(t * 7.5);
      mo.B.chest.rotation.x += .08 + .04 * sob;
      mo.B.chest.updateWorldMatrix(false, true);
      handsToFace(mo, (.55 + .15 * sob));
      const fmo = st.faces.find(x => x[0] === mo);
      if (fmo) fmo[3] = { sad: .95 };
    }
    // b022 (beat index 3): Zineb's cat creeps in, pauses, puffs up in fright, bolts off-frame
    const cat = st.cat;
    if (cat) {
      const c0 = B(3)[0], dt = t - c0;
      const vis = dt >= -.3 && dt < 17.3;
      cat.root.visible = vis;
      if (vis) {
        const pIn = st.catIn ||= S3.floorAt(160, 940);
        const pStop = st.catStop ||= S3.floorAt(520, 900);
        const pOut = st.catOut ||= S3.floorAt(40, 960);
        const p = pIn.clone();
        const parents = fa.group.position.clone().lerp(zo.group.position, .5);
        let yaw = yawTo(pIn, pStop), sc = .9, br = .7, pitch = .28, bob = 0;
        if (dt < 5.2) {
          const u = clamp(dt / 5.2);
          p.lerp(pStop, K.ease(u));
          bob = u > 0 && u < 1 ? .012 * Math.abs(Math.sin(dt * 8)) : 0;
          pitch = .3;
          br = .62;
          sc = .88;
        } else if (dt < 9.6) {
          p.copy(pStop);
          yaw = yawTo(pStop, parents) + .85;
          const meow = Math.max(0, Math.sin((dt - 5.2) * 2.6));
          pitch = .12 - .2 * meow;
          br = .78;
        } else if (dt < 13.2) {
          const u = clamp((dt - 9.6) / 1.2);
          p.copy(pStop);
          yaw = yawTo(pStop, parents) + .7;
          sc = .95 + .35 * u;
          br = .7 + .85 * u;
          pitch = .15 - .55 * u;
        } else {
          const u = clamp((dt - 13.2) / 3.8), ph = (dt - 13.2) * 16;
          p.copy(pStop).lerp(pOut, u);
          yaw = yawTo(pStop, pOut);
          bob = .05 * Math.abs(Math.sin(ph));
          pitch = .22 * Math.cos(ph);
        }
        cat.pv.rotation.x = -pitch;
        cat.root.position.set(p.x, p.y + bob, p.z);
        cat.root.rotation.y = yaw;
        cat.root.scale.set(sc, sc * br, sc);
        cat.root.updateMatrixWorld(true);
      }
    }
  },
  over(lt, u, t, S, st, S3) {
    if (st.lamp) {
      const [lx, ly] = S3.project(st.lamp.position.clone().add(V(0, .14, 0)));
      glow(lx, ly, 160, '#ffcb68', .22, 'screen');
    }
    if (st.cat && st.cat.root.visible) {
      const dt = t - B(3)[0];
      if (dt >= 8.8 && dt < 13.4) {
        const [cx, cy] = S3.project(st.cat.root.position.clone().add(V(0, .22, 0)));
        glow(cx - 10, cy - 8, 22, '#ffe840', .9, 'lighter');
        glow(cx + 10, cy - 8, 22, '#ffe840', .9, 'lighter');
      }
    }
  },
});

{
  const ld = nu3.load;
  nu3.load = async () => {
    const had = !!nu3.st;
    await ld();
    if (had || nu3.st.cat) return;
    const cat = await loadAnimal('/art/models/cat2__base_basic_pbr.glb', { height: .42 });
    const pv = new THREE.Group(), body = cat.root.children[0];
    cat.root.remove(body); pv.add(body); body.position.z += .08; pv.position.z = -.08;
    cat.root.add(pv); cat.pv = pv;
    cat.root.traverse(o => { if (o.isMesh) o.castShadow = true; });
    nu3.S3.scene.add(cat.root);
    nu3.st.cat = cat;
  };
}

export default beatScene(ID, {
  shots: { nu1, nu2, nu3 },
  plan: {
    b019: { shot: 'nu1', size: 'W', on: 'zoubida' },
    b020: { shot: 'nu2', size: 'M', on: 'father', z: 1.48, dx: 20, dy: 16 },
    b021: { shot: 'nu3', size: 'W', on: 'father' },
    b022: { shot: 'nu3', size: 'W', on: 'father' },
    b023: { shot: 'nu3', size: 'CU', on: 'mohammed', z: 3.3, dx: 40, dy: 8 },
    b024: { shot: 'nu3', size: 'M', on: 'father', z: 1.7, dx: 30, dy: 18 },
    b025: { shot: 'nu3', size: 'CU', on: 'mohammed', z: 3.3, dx: 48, dy: 8 },
    b026: { shot: 'nu3', size: 'M', on: 'father', z: 1.3, dx: 24, dy: 20 },
  },
});
