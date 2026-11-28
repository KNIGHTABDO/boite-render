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
import { boyBed, BOY_H, BED_AT, lapRest, handsToFace } from '../lib/fix9_A.js';
import { reachClamp, turnToward, carryHand } from '../lib/fix9_K.js';
import { beatScene, lines, sm, at, front, yawTo, V } from '../lib/beatscene.js';

const { clamp, glow } = K;
const ID = 's05_diner_chat', L = lines(ID), B = i => L[i] || [0, 0];
const IN = (i, t) => t >= B(i)[0] - .15 && t < (B(i + 1)[0] || B(i)[1] + .3);

const MATTRESS = [[1188, 574], [1450, 574], [1455, 688], [1308, 690]];
const BED = {
  at: BED_AT, face: [1180, 700], pose: 'lie', height: BOY_H, seed: 3, talk: 0,
  o: { top: .28, hands: 'belly', headTurn: .45, pillow: .1, mattress: MATTRESS },
};

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
    height: 1.6, at: [790, 800], face: [660, 740], pose: 'kneel', hands: false,
    o: { grounded: true, lean: .2 }, seed: 7, talk: 0,
    look: () => [660, 760, .6],
    lookMax: .28,
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
    S3.prop(st.lamp, lp.x, .42, lp.z, 0);
    // Wick catches on the lighting line, not before the father is in the room.
    const lit = sm(B(0)[0] + 5.4, B(0)[0] + 6.8, t);
    st.lamp.userData.flame.visible = lit > .04;
    st.lamp.userData.flame.scale.setScalar(.3 + .6 * lit * (1 + .08 * Math.sin(t * 14)));
    carryHand(fa, 'R', -1, { fwd: .06, out: .2, drop: .52 });
    carryHand(fa, 'L', 1, { fwd: .06, out: .2, drop: .52 });
    turnToward(zo, S3.cam.position, st.lamp.position, .22);
    const reachU = sm(B(0)[0] - .4, B(0)[0] + 1.2, t) * (1 - sm(B(0)[0] + 7.2, B(0)[0] + 8.4, t));
    zo.B.spine.rotation.x += .1 * Math.max(reachU, .35);
    zo.B.chest.updateWorldMatrix(false, true);
    const down = front(zo, 'root', .12 * kz, .22 * kz, -.34 * kz);
    const wick = st.lamp.position.clone().add(V(.02, .08, .02));
    reachClamp(zo, 'R', down.lerp(wick, Math.max(reachU, .45)), { grip: .02, pole: [-.35, .02, .1] });
    PO.fingers(zo, 'R', .45);
    lapRest(zo);
    dim(fa, .72 + .28 * lit);
    dim(zo, .75 + .25 * lit);
  },
  over(lt, u, t, S, st, S3) {
    const lit = sm(B(0)[0] + 5.4, B(0)[0] + 6.8, t);
    if (lit < .98) {
      K.c.fillStyle = `rgba(6, 10, 24, ${(0.5 * (1 - lit)).toFixed(3)})`;
      K.c.fillRect(0, 0, K.W, K.H);
    }
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
    height: 1.76, at: [1290, 772], face: [1420, 760], pose: 'kneel', hands: false,
    o: { grounded: true, lean: .22 }, seed: 5, talk: 0, lids: .5,
    lookMax: .42,
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
    turnToward(fa, S3.cam.position, mo.group.position, away > .5 ? .3 : .8);
    fa.B.spine.rotation.x += .2 * touch;
    fa.B.chest.rotation.x += .06 * touch;
    fa.B.neck.rotation.x += .2 * nod;
    fa.B.chest.updateWorldMatrix(false, true);
    lapRest(fa);
    if (touch > .02) {
      const lap = PO.hipToWorld(fa, .16 * kf, .08 * kf, .2 * kf);
      const brow = at(mo, 'head').clone().add(V(0, .02, 0));
      reachClamp(fa, 'L', lap.lerp(brow, touch), { grip: .02, pole: [.2, .02, .12] });
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
    height: 1.76, at: [600, 880], face: [760, 1080], pose: 'kneel', hands: false,
    o: { grounded: true, lean: .2 }, seed: 5, lids: .35,
    lookMax: .38,
    look: (t, st) => t < B(4)[0] ? [780, 940, .55] : at(st.A.mohammed, 'head'),
  },
  zoubida: {
    height: 1.6, at: [960, 910], face: [780, 940], pose: 'kneel', hands: false,
    o: { grounded: true, lean: .18 }, seed: 7, lids: .3,
    lookMax: .38,
    look: (t, st) => t < B(4)[0] ? [780, 940, .45] : at(st.A.mohammed, 'head'),
  },
}, {
  light: WARM_LIGHT,
  act(lt, t, S, st, S3) {
    const mo = boyBed(S3, st, t, t >= B(4)[0] ? .35 : 1.15);
    const { father: fa, zoubida: zo } = st.A, kf = fa.group.scale.y / 1.6;
    const tbPos = st.tbPos ||= S3.floorAt(780, 940);
    st.tabla ||= S3.prop(PR.tabla({ r: .28, h: .24 }));
    st.plat ||= S3.prop(platSafranProp());
    st.lampPt ||= S3.floorAt(660, 740).add(V(0, .56, 0));
    for (const o of [st.tabla, st.plat]) o.userData.ambient = true;
    S3.prop(st.tabla, tbPos.x, 0, tbPos.z, 0);
    S3.prop(st.plat, tbPos.x, .24, tbPos.z + .02, 0);
    const toBoy = t >= B(4)[0];
    if (toBoy) {
      turnToward(fa, S3.cam.position, mo.group.position, .45);
      turnToward(zo, S3.cam.position, mo.group.position, .35);
    }
    const heavy = toBoy ? .3 : 1;
    fa.B.spine.rotation.x += .05 * heavy;
    fa.B.chest.rotation.x += .02 * Math.sin(t * 1.1);
    zo.B.spine.rotation.x += .04 * heavy;
    zo.B.chest.rotation.x += .02 * Math.sin(t * 1.2 + 1);
    fa.B.chest.updateWorldMatrix(false, true);
    zo.B.chest.updateWorldMatrix(false, true);
    lapRest(fa);
    lapRest(zo);
    if (t >= B(5)[0]) {
      fa.B.chest.updateWorldMatrix(false, true);
      const offer = front(fa, 'chest', .18 * kf, .22 * kf, -.1 * kf);
      reachClamp(fa, 'R', offer, { grip: .02, pole: [-.34, .02, .08] });
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
        const pIn = st.catIn ||= S3.floorAt(180, 980);
        const pStop = st.catStop ||= S3.floorAt(460, 980);
        const pOut = st.catOut ||= S3.floorAt(60, 1000);
        const p = pIn.clone();
        const parents = fa.group.position.clone().lerp(zo.group.position, .5);
        let yaw = yawTo(pIn, pStop), sc = .9, fluff = 1, pitch = .28, bob = 0;
        if (dt < 5.2) {
          const u = clamp(dt / 5.2);
          p.lerp(pStop, K.ease(u));
          bob = u > 0 && u < 1 ? .012 * Math.abs(Math.sin(dt * 8)) : 0;
          pitch = .3;
          sc = .88;
        } else if (dt < 9.6) {
          p.copy(pStop);
          yaw = yawTo(pStop, parents) + .4;
          const meow = Math.max(0, Math.sin((dt - 5.2) * 2.6));
          pitch = .12 - .15 * meow;
        } else if (dt < 13.2) {
          const u = clamp((dt - 9.6) / 1.2);
          p.copy(pStop);
          yaw = yawTo(pStop, parents) + .35;
          fluff = 1 + .45 * u;
          sc = .9 + .12 * u;
          pitch = .1 - .4 * u;
        } else {
          const u = clamp((dt - 13.2) / 3.8), ph = (dt - 13.2) * 16;
          p.copy(pStop).lerp(pOut, u);
          yaw = yawTo(pStop, pOut);
          bob = .04 * Math.abs(Math.sin(ph));
          pitch = .18 * Math.cos(ph);
          fluff = 1.1;
        }
        cat.pv.rotation.x = -pitch;
        cat.root.position.set(p.x, p.y + bob, p.z);
        cat.root.rotation.y = yaw;
        cat.root.scale.set(sc * fluff, sc, sc * fluff);
        cat.root.updateMatrixWorld(true);
      }
    }
  },
  over(lt, u, t, S, st, S3) {
    if (st.lampPt) {
      const [lx, ly] = S3.project(st.lampPt);
      glow(lx, ly, 160, '#ffcb68', .22, 'screen');
    }
    if (st.cat && st.cat.root.visible) {
      const dt = t - B(3)[0];
      if (dt >= 8.8 && dt < 13.4) {
        const [cx, cy] = S3.project(st.cat.root.position.clone().add(V(0, .22, 0)));
        glow(cx - 8, cy - 6, 10, '#ffe070', .4, 'lighter');
        glow(cx + 8, cy - 6, 10, '#ffe070', .4, 'lighter');
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
    b019: { shot: 'nu1', size: 'M', on: 'zoubida', pt: [640, 800], z: 1.2, dy: 30, segs: [[.3, 'i_lampe_petrole', { move: 'push' }]] },
    b020: { shot: 'nu2', size: 'M', on: 'father', z: 1.85, dx: 10, dy: 28 },
    b021: { shot: 'nu3', size: 'M', on: 'father', pt: [780, 900], z: 1.35, dy: 24, segs: [[.55, 'i_plat_safran', { move: 'push' }]] },
    b022: { shot: 'nu3', size: 'W', on: 'father' },
    b023: { shot: 'nu3', size: 'CU', on: 'mohammed', z: 4.05, dx: 24, dy: 40 },
    b024: { shot: 'nu3', size: 'M', on: 'father', pt: [960, 780], z: 1.05, dy: 10 },
    b025: { shot: 'nu3', size: 'CU', on: 'mohammed', z: 4.05, dx: 24, dy: 40 },
    b026: { shot: 'nu3', size: 'M', on: 'father', pt: [960, 780], z: 1.05, dy: 10 },
  },
});
