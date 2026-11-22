// s05_diner_chat: Father returns early, silent dinner, and Zineb's frightened cat (chambre_nuit).
// b019 (chambre_nuit + insert i_lampe_petrole): Father enters early from the left while Zoubida kneels by the low
// tabla to light the petrol lamp; warm yellow light floods the room once the wick catches.
// b020 (chambre_nuit): Father kneels beside Mohammed's divan (lieOnBed), pale and hollow-eyed; he reaches gently to
// touch the boy's forehead, nods slowly, then turns his head and shoulders away in silence.
// b021 (chambre_nuit + insert i_plat_safran): Silent dinner around the tabla and brown earthenware saffron dish —
// father sits cross-legged on the left, Zoubida kneels on the right, neither eats nor speaks.
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
import { lieOnBed, pillowUnder } from '../lib/fix8_lie.js';
import { beatScene, lines, sm, at, dirW, yawTo, V } from '../lib/beatscene.js';

const { clamp, glow } = K;
const ID = 's05_diner_chat', L = lines(ID), B = i => L[i] || [0, 0];
const IN = (i, t) => t >= B(i)[0] - .15 && t < (B(i + 1)[0] || B(i)[1] + .3);

const MATTRESS = [[1188, 574], [1450, 574], [1455, 688], [1308, 690]];
const CHEST = [[1450, 580], [1830, 580], [1830, 850], [1450, 850]];
const BED = {
  at: [1350, 694], face: [1336, 754], pose: 'lie', height: 1.1, seed: 3, talk: 0,
  o: { top: .26, turn: .12, hands: 'belly', headTurn: -.2, pillow: .08, mattress: MATTRESS, avoid: CHEST },
};

function reachClamp(a, side, target, opt = {}) {
  const sh = at(a, 'upperArm' + side), el = at(a, 'foreArm' + side), hd = at(a, 'hand' + side);
  const len = sh.distanceTo(el) + el.distanceTo(hd), d = target.clone().sub(sh), max = len * .85;
  if (d.length() > max) target = sh.clone().addScaledVector(d.normalize(), max);
  return PO.reach(a, side, target, opt);
}

function bed(S3, st, t, headTurn = -.2) {
  const mo = st.A.mohammed;
  lieOnBed(mo, {
    top: .26, feet: [.5, .87],
    origin: (st.mo0 ||= mo.group.position.clone()).clone().add(V(.04, 0, 0)),
    hands: 'belly', pillow: .08, tuck: .22, headTurn,
  });
  pillowUnder(S3, st, mo, { top: .26, h: .08, col: 0x45566e });
  st.cover ||= PR.blanket({ w: .38, l: .54, h: .06, col: 0x8a3d34 });
  const hp = mo.B.root.getWorldPosition(V(0, 0, 0)), ry = mo.group.rotation.y;
  S3.prop(st.cover, hp.x + Math.sin(ry) * .28, .26 + .03 - .004, hp.z + Math.cos(ry) * .28, ry);
  st.cover.visible = true;
  mo.B.chest.rotation.x += .012 * Math.sin(t * 1.5);
  mo.B.chest.updateWorldMatrix(false, true);
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
  mohammed: { ...BED, lids: .45 },
  zoubida: {
    height: 1.6, at: [790, 880], face: [900, 860], pose: 'kneel',
    o: { grounded: true, lean: .08, avoid: CHEST }, seed: 7, talk: 0,
    look: (t, st) => t < B(0)[0] + 4.4 ? [900, 860, .4] : at(st.A.father, 'head'),
    lookMax: .7,
  },
  father: {
    height: 1.76, at: [440, 895], face: [900, 860], seed: 5, talk: 0,
    walk: { to: [610, 895], t0: B(0)[0] + .6, t1: B(0)[0] + 5.2 },
    look: 'zoubida', lookMax: .65, lids: .35,
  },
}, {
  light: WARM_LIGHT,
  act(lt, t, S, st, S3) {
    bed(S3, st, t, -.24);
    const { zoubida: zo, father: fa } = st.A, kz = zo.group.scale.y / 1.6;
    const tbPos = st.tbPos ||= S3.floorAt(900, 855);
    st.tabla ||= S3.prop(PR.tabla({ r: .24, h: .24 }));
    S3.prop(st.tabla, tbPos.x, 0, tbPos.z, 0);
    st.lamp ||= S3.prop(petrolLampProp());
    S3.prop(st.lamp, tbPos.x, .24, tbPos.z, 0);
    const lit = sm(B(0)[0] + 3.4, B(0)[0] + 4.5, t);
    st.lamp.userData.flame.visible = lit > .05;
    st.lamp.userData.flame.scale.setScalar(.4 + .7 * lit * (1 + .08 * Math.sin(t * 14)));
    // Zoubida reaches gently toward the lamp to light it, then lowers hand to lap
    const reachU = sm(B(0)[0] + .4, B(0)[0] + 1.4, t) * (1 - sm(B(0)[0] + 4.2, B(0)[0] + 5.2, t));
    if (reachU > .02) {
      const restR = PO.hipToWorld(zo, -.18 * kz, .1 * kz, .25 * kz);
      const wick = st.lamp.position.clone().add(V(0, .14, 0));
      reachClamp(zo, 'R', restR.lerp(wick, reachU), { grip: .02, pole: [-.35, .1, .25] });
      PO.fingers(zo, 'R', .35);
    }
    dim(fa, .75 + .25 * lit);
  },
  over(lt, u, t, S, st, S3) {
    const lit = sm(B(0)[0] + 3.4, B(0)[0] + 4.6, t);
    if (st.lamp && lit > 0) {
      const [lx, ly] = S3.project(st.lamp.position.clone().add(V(0, .14, 0)));
      glow(lx, ly, 760, '#ffd068', .48 * lit, 'screen');
      glow(lx, ly, 220, '#fff0b8', .36 * lit, 'lighter');
    }
  },
});

// b020: Pale father kneels by the bed, touches Mohammed's forehead, nods, turns away silently
const nu2 = staged('chambre_nuit', {
  mohammed: { ...BED, lids: .42 },
  father: {
    height: 1.76, at: [1175, 745], face: 'cam', yaw: .72, pose: 'kneel',
    o: { grounded: true, lean: .08, avoid: CHEST }, seed: 5, talk: 0, lids: .42,
    lookMax: .85,
    look: (t, st) => {
      const away = sm(B(1)[0] + 10.6, B(1)[0] + 12.0, t);
      if (away > .4) return at(st.A.father, 'head').add(V(-.8, -.1, .9));
      const p = at(st.A.mohammed, 'head').clone();
      p.y = Math.max(p.y, at(st.A.father, 'head').y - .18);
      return p;
    },
  },
}, {
  light: WARM_LIGHT,
  act(lt, t, S, st, S3) {
    bed(S3, st, t, -.18);
    const { father: fa, mohammed: mo } = st.A, kf = fa.group.scale.y / 1.6;
    dim(fa, .88);
    const touch = sm(B(1)[0] + 4.0, B(1)[0] + 5.2, t) * (1 - sm(B(1)[0] + 8.0, B(1)[0] + 9.2, t));
    const nod = sm(B(1)[0] + 8.6, B(1)[0] + 9.3, t) * (1 - sm(B(1)[0] + 9.7, B(1)[0] + 10.4, t));
    const away = sm(B(1)[0] + 10.5, B(1)[0] + 12.2, t);
    st.fy0 ??= fa.group.rotation.y;
    fa.group.rotation.y = st.fy0 - .75 * away;
    fa.group.updateMatrixWorld(true);
    fa.B.chest.rotation.x += .08 * touch + .012 * Math.sin(t * 1.4);
    fa.B.neck.rotation.x += .14 * nod;
    fa.B.chest.updateWorldMatrix(false, true);
    if (touch > .02) {
      const restL = PO.hipToWorld(fa, .18 * kf, .1 * kf, .25 * kf);
      const brow = at(mo, 'head').add(V(-.02, .07, .02));
      reachClamp(fa, 'L', restL.lerp(brow, touch), { grip: .01, pole: [.45, .15, .45] });
      PO.fingers(fa, 'L', .12, { spread: .2 });
    }
  },
});

// b021–b026: Silent dinner around the tabla + frightened cat2 + Mohammed's sobs & father's comfort
const nu3 = staged('chambre_nuit', {
  mohammed: {
    ...BED,
    lids: t => IN(4, t) || IN(6, t) ? .78 : .42,
  },
  father: {
    height: 1.76, at: [560, 890], face: 'cam', yaw: .55, pose: 'cross',
    o: { grounded: true, seat: 0, lean: .08, avoid: CHEST }, seed: 5, lids: .35,
    lookMax: .8,
    look: (t, st) => t < B(4)[0] + 4.5
      ? at(st.A.father, 'head').add(V(.3, -.35, .6))
      : at(st.A.mohammed, 'head').clone().setY(at(st.A.father, 'head').y - .18),
  },
  zoubida: {
    height: 1.6, at: [1040, 890], face: 'cam', yaw: -.5, pose: 'kneel',
    o: { grounded: true, lean: .08, avoid: CHEST }, seed: 7, lids: .3,
    lookMax: .8,
    look: (t, st) => t < B(4)[0] + 4.0
      ? at(st.A.zoubida, 'head').add(V(-.3, -.35, .6))
      : at(st.A.mohammed, 'head').clone().setY(at(st.A.zoubida, 'head').y - .15),
  },
}, {
  light: WARM_LIGHT,
  addressee: { father: 'mohammed', mohammed: 'father', zoubida: 'mohammed' },
  act(lt, t, S, st, S3) {
    const moTurn = t >= B(4)[0] ? -.22 : -.18;
    bed(S3, st, t, moTurn);
    const { father: fa, zoubida: zo, mohammed: mo } = st.A;
    // Tabla + saffron dish + lit petrol lamp between the parents
    const tbPos = st.tbPos ||= S3.floorAt(820, 885);
    st.tabla ||= S3.prop(PR.tabla({ r: .26, h: .24 }));
    S3.prop(st.tabla, tbPos.x, 0, tbPos.z, 0);
    st.plat ||= S3.prop(platSafranProp());
    S3.prop(st.plat, tbPos.x - .03, .24, tbPos.z + .03, 0);
    st.lamp ||= S3.prop(petrolLampProp());
    S3.prop(st.lamp, tbPos.x + .12, .24, tbPos.z - .08, 0);
    // Subtle breathing / heavy stillness on parents; sob trembling on Mohammed in b023 & b025
    const heavy = t < B(4)[0] + 4.5 ? 1 : .4;
    fa.B.chest.rotation.x += .04 * heavy + .012 * Math.sin(t * 1.2);
    fa.B.neck.rotation.x += .12 * heavy;
    zo.B.chest.rotation.x += .03 * heavy + .012 * Math.sin(t * 1.3 + 1);
    zo.B.neck.rotation.x += .1 * heavy;
    fa.B.chest.updateWorldMatrix(false, true);
    zo.B.chest.updateWorldMatrix(false, true);
    if (IN(4, t) || IN(6, t)) {
      const sob = Math.abs(Math.sin(t * 7.5)) * .035;
      mo.B.chest.rotation.x += sob;
      mo.B.chest.rotation.z += .02 * Math.sin(t * 5.2);
      mo.B.chest.updateWorldMatrix(false, true);
      const fmo = st.faces.find(x => x[0] === mo);
      if (fmo) fmo[3] = { sad: .95 };
    }
    // b022 (beat index 3): Zineb's cat creeps in, pauses, puffs up in fright, bolts off-frame
    const cat = st.cat;
    if (cat) {
      const c0 = B(3)[0], dt = t - c0;
      const vis = dt >= -.3 && dt < 14.8;
      cat.root.visible = vis;
      if (vis) {
        const pIn = st.catIn ||= S3.floorAt(270, 955);
        const pStop = st.catStop ||= S3.floorAt(755, 945);
        const pOut = st.catOut ||= S3.floorAt(-160, 955);
        const p = pIn.clone();
        let yaw = yawTo(pIn, pStop), sc = 1, br = 1 + .02 * Math.sin(t * 3), pitch = 0, bob = 0;
        if (dt < 4.8) {
          const u = clamp(dt / 4.8);
          p.lerp(pStop, K.ease(u));
          bob = u > 0 && u < 1 ? .008 * Math.abs(Math.sin(dt * 7)) : 0;
          pitch = .04 * Math.sin(dt * 7);
        } else if (dt < 8.6) {
          p.copy(pStop);
          yaw = yawTo(pStop, fa.group.position.clone().lerp(zo.group.position, .5));
          const meow = Math.max(0, Math.sin((dt - 4.8) * 2.6));
          pitch = -.14 * meow;
        } else if (dt < 11.4) {
          const u = clamp((dt - 8.6) / 1.2);
          p.copy(pStop);
          yaw = yawTo(pStop, fa.group.position.clone().lerp(zo.group.position, .5)) - .45 * u;
          sc = 1 + .2 * u * (1 + .15 * Math.sin(t * 24));
          br = 1 + .14 * Math.sin(u * Math.PI);
          pitch = -.12 * u + .05 * Math.sin(t * 28) * u;
        } else {
          const u = clamp((dt - 11.4) / 2.6), ph = (dt - 11.4) * 16;
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
      glow(lx, ly, 620, '#ffcb68', .28, 'screen');
    }
    if (st.cat && st.cat.root.visible) {
      const dt = t - B(3)[0];
      if (dt >= 8.6 && dt < 11.4) {
        const [cx, cy] = S3.project(st.cat.root.position.clone().add(V(0, .2, 0)));
        glow(cx - 8, cy - 6, 16, '#ffe840', .75, 'lighter');
        glow(cx + 8, cy - 6, 16, '#ffe840', .75, 'lighter');
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
    const cat = await loadAnimal('/art/models/cat2__base_basic_pbr.glb', { height: .27 });
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
    b020: { shot: 'nu2', size: 'M', on: 'father', z: 1.55, dx: 45, dy: -15 },
    b021: { shot: 'nu3', size: 'M', on: 'father', z: 1.25, dx: 110, dy: -20 },
    b022: { shot: 'nu3', size: 'W', on: 'father' },
    b023: { shot: 'nu3', size: 'CU', on: 'mohammed', z: 1.55, dx: -40, dy: -20 },
    b024: { shot: 'nu3', size: 'CU', on: 'father', z: 1.75, dy: -15 },
    b025: { shot: 'nu3', size: 'CU', on: 'mohammed', z: 1.55, dx: -40, dy: -20 },
    b026: { shot: 'nu3', size: 'M', on: 'father', z: 1.38, dx: 60, dy: -20 },
  },
});
