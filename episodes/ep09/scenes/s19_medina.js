// s19 "À travers la médina".
// Rooms: rue_tijani (b116–b118, b122–b126), rue_legumes (b119–b121).
//   tj1: Mohammed walks ahead; Zoubida stops at the right zellige wall and puts her hand in the bronze grille,
//        then presses her cheek to the carved frame while Mohammed kisses the dado.
//   lg:  Zoubida at the vegetable stall, the marchand leaning in; then she turns away and Mohammed tugs her haik.
//   tj2: both look up at the left bronze portal; Mohammed points at it; Zoubida tugs him clear of it.
import * as PO from '../../../engine/poses.js';
import { staged } from '../lib/autostage.js';
import { castScale, sealHaik } from '../lib/fix8c.js';
import { beatScene, lines, sm, at, front, dirW, heightAt, V } from '../lib/beatscene.js';
import { contact, easeClose, yawTo, armsDown } from '../lib/fix9_F.js';
import { clearArms, faceLens, keepFacing, pointClamp, slideOff } from '../lib/fix9_J.js';

const ID = 's19_medina', L = lines(ID), B = i => L[i] || [0, 0];

function spot(S3, st, key, fx, fy, topPy) {
  st.spots ||= {};
  if (!st.spots[key]) {
    const h = heightAt(S3, fx, fy, topPy);
    st.spots[key] = S3.floorAt(fx, fy).setY(h);
  }
  return st.spots[key];
}

// b116–b118: rue_tijani, right zellige wall and the bronze offering grille.
const tj1 = staged('rue_tijani', {
  mohammed: {
    at: [960, 760], face: [1200, 880], seed: 3,
    walk: { to: [1180, 890], t0: B(0)[0] + .2, t1: B(0)[0] + 4.6 },
    look: (t, st, S3) => t >= B(1)[0] && t < B(2)[0] ? spot(S3, st, 'dado', 1600, 920, 620) : null,
    lookMax: t => t >= B(1)[0] && t < B(2)[0] ? .4 : .45,
  },
  zoubida: {
    at: [1220, 730], face: [1560, 900], costume: 'haik', seed: 7,
    walk: { to: [1500, 905], t0: B(0)[0] + .35, t1: B(0)[0] + 5.2 },
    look: (t, st, S3) => {
      if (t >= B(2)[0]) return 'mohammed';
      if (t >= B(1)[0]) return spot(S3, st, 'wood', 1580, 910, 340);
      if (t >= B(0)[0] + 5.2) return spot(S3, st, 'grille', 1560, 910, 380);
      return null;
    },
    lookMax: .7,
  },
}, {
  addressee: { zoubida: 'mohammed', narrator: 'zoubida' },
  act(lt, t, S, st, S3) {
    const { mohammed: mo, zoubida: zo } = st.A;
    castScale(mo); castScale(zo);
    sealHaik(zo);
    st.actcheck = { exposed: { zoubida: ['handR', 'foreArmR'] } };
    const hole = spot(S3, st, 'grille', 1560, 910, 380);
    const wood = spot(S3, st, 'wood', 1580, 910, 340);
    const dado = spot(S3, st, 'dado', 1600, 920, 620);

    clearArms(zo);
    if (t < B(0)[0] + 5.3) return;   // the walk owns the legs until they arrive

    armsDown(mo);

    // b116: right hand into the offering hole, body 3/4 to the grille.
    if (t < B(1)[0]) {
      easeClose(zo, hole, .4, sm(B(0)[0] + 5.2, B(0)[0] + 5.7, t));
      yawTo(zo, hole, .8);
      zo.B.spine.rotation.x += .06;
      zo.B.chest.updateWorldMatrix(false, true);
      contact(zo, 'R', hole, { grip: .005, pole: [-.55, .25, .35] });
      PO.fingers(zo, 'R', .12, { spread: .18 });
      return;
    }
    // b117: cheek on the carved frame; the boy, too short for the grille, kisses the dado.
    if (t < B(2)[0]) {
      const u = sm(B(1)[0], B(1)[0] + .28, t);
      easeClose(zo, wood, .34, u);
      yawTo(zo, wood, .62);
      zo.B.spine.rotation.x += .2 * u;
      zo.B.spine.rotation.z -= .16 * u;
      zo.B.head.rotation.z -= .38 * u;
      zo.B.chest.updateWorldMatrix(false, true);
      easeClose(mo, dado, .42, u);
      slideOff(mo, zo, .62);
      yawTo(mo, dado, .9);
      mo.B.spine.rotation.x += .82 * u;
      mo.B.neck.rotation.x += .28 * u;
      mo.B.chest.updateWorldMatrix(false, true);
      armsDown(mo);
      return;
    }
    // b118: she turns back down to him.
    yawTo(zo, mo.group.position, .7);
    zo.B.neck.rotation.x += .1;
    zo.B.chest.updateWorldMatrix(false, true);
  },
});

// b119–b121: the pepper and tomato stall.
const lg = staged('rue_legumes', {
  marchand: { at: [1380, 830], face: 'zoubida', seed: 13, look: 'zoubida', lookMax: .6 },
  zoubida: {
    at: [1160, 890], face: 'cam', costume: 'haik', seed: 7, lookMax: .32,
    look: (t, st, S3) => t < B(5)[0] ? spot(S3, st, 'crate', 1520, 860, 640) : null,
  },
  mohammed: {
    at: [960, 905], face: 'zoubida', seed: 3, lookMax: .55,
    look: t => t < B(5)[0] ? 'zoubida' : 'zoubida',
  },
}, {
  addressee: { marchand: 'zoubida', zoubida: 'marchand', narrator: 'zoubida' },
  act(lt, t, S, st, S3) {
    const { marchand: ma, zoubida: zo, mohammed: mo } = st.A;
    castScale(ma); castScale(zo); castScale(mo);
    sealHaik(zo);
    st.actcheck = { exposed: { zoubida: ['handR', 'foreArmR'] } };
    const crate = spot(S3, st, 'crate', 1520, 860, 640);
    clearArms(zo);
    armsDown(mo);

    // b119: she pokes the pyramids; he leans in and blocks her.
    if (t < B(4)[0]) {
      const u = sm(B(3)[0], B(3)[0] + .3, t);
      easeClose(zo, crate, .48, u);
      yawTo(zo, crate, .85);
      zo.B.spine.rotation.x += .1 * u;
      zo.B.chest.updateWorldMatrix(false, true);
      const bob = crate.clone().add(V(0, .035 * Math.sin(t * 5.2), 0));
      contact(zo, 'R', bob, { grip: .01, pole: [-.45, .15, .3] });
      PO.fingers(zo, 'R', .3, { spread: .22 });
      faceLens(zo, S3.cam.position, 28);
      easeClose(ma, zo.group.position, .72, u);
      yawTo(ma, zo.group.position, 1);
      ma.B.spine.rotation.x += .3 * u;
      ma.B.chest.updateWorldMatrix(false, true);
      const k = ma.group.scale.y / 1.6;
      for (const [s, sg] of [['L', 1], ['R', -1]]) {
        const wave = .05 * Math.sin(t * 7 + sg);
        contact(ma, s, front(ma, 'chest', .34 * k, -sg * .16 * k, .06 * k + wave), { grip: 0, pole: [sg * .4, .12, .2] });
        PO.fingers(ma, s, .12, { spread: .4 });
      }
      return;
    }
    // b120: he stays furious (coverage is his close-up).
    if (t < B(5)[0]) {
      yawTo(ma, zo.group.position, 1);
      ma.B.spine.rotation.x += .26;
      ma.B.head.rotation.y += .06 * Math.sin(t * 8);
      ma.B.chest.updateWorldMatrix(false, true);
      const k = ma.group.scale.y / 1.6;
      for (const [s, sg] of [['L', 1], ['R', -1]]) {
        const wave = .07 * Math.sin(t * 8 + sg * 1.4);
        contact(ma, s, front(ma, 'chest', .32 * k, -sg * .18 * k, .1 * k + wave), { grip: 0, pole: [sg * .45, .1, .2] });
        PO.fingers(ma, s, .1, { spread: .45 });
      }
      faceLens(zo, S3.cam.position, 28);
      return;
    }
    // b121: she turns away, chin up; he stands against her and tugs the haik toward screen-left.
    const u = sm(B(5)[0], B(5)[0] + .3, t);
    const away = S3.floorAt(620, 800);
    // A full turn away from the stall puts both faces past the lens. They still shift
    // screen-left, chin up, and the boy still grips the haik; the bodies stay on the camera.
    yawTo(zo, away, u * .15);
    faceLens(zo, S3.cam.position, 1);
    zo.B.spine.rotation.x -= .06 * u;
    zo.B.neck.rotation.x -= .1 * u;
    zo.B.chest.updateWorldMatrix(false, true);
    zo.group.position.x -= .16 * u;
    easeClose(mo, zo.group.position, .48, u);
    mo.group.position.x -= .16 * u;
    slideOff(mo, zo, .5);
    faceLens(mo, S3.cam.position, 1);
    mo.group.updateMatrixWorld(true);
    const hip = at(zo, 'root'), to = mo.group.position.clone().sub(hip).setY(0);
    if (to.lengthSq() > 1e-6) to.normalize();
    // His own right-front, not a reach across the chest (that put the forearm through the torso).
    const cloth = at(mo, 'upperArmR').clone()
      .addScaledVector(dirW(mo, -1, 0, 0), .14)
      .addScaledVector(dirW(mo, 0, 0, 1), .18)
      .add(V(0, -.02, 0));
    if (to.lengthSq() > .5) cloth.addScaledVector(to, -.08);
    contact(mo, 'R', cloth, { grip: 0, pole: [-.55, .4, .25], frac: .86 });
    PO.fingers(mo, 'R', .72);
    mo.B.spine.rotation.z += .12 * u;
    mo.B.chest.updateWorldMatrix(false, true);
    yawTo(ma, zo.group.position, 1);
  },
});

// b122–b126: the monumental bronze portal on the left.
const tj2 = staged('rue_tijani', {
  zoubida: {
    at: [1120, 860], face: 'cam', yaw: -.4, costume: 'haik', seed: 7,
    look: (t, st, S3) => {
      if (t < B(8)[0]) return spot(S3, st, 'portal', 480, 750, 185);
      if (t >= B(10)[0]) {
        const head = st.A.mohammed.B.head.getWorldPosition(V(0, 0, 0));
        const hers = st.A.zoubida.B.head.getWorldPosition(V(0, 0, 0));
        head.y = Math.max(head.y, hers.y - .1);
        return head;
      }
      return 'mohammed';
    },
    lookMax: t => t < B(8)[0] ? .5 : .4,
  },
  mohammed: {
    at: [970, 875], face: 'cam', yaw: -.15, seed: 3,
    look: (t, st, S3) => t < B(8)[0] ? spot(S3, st, 'portal', 480, 750, 185) : 'zoubida',
    lookMax: t => t < B(8)[0] ? .5 : .7,
  },
}, {
  addressee: { mohammed: 'zoubida', zoubida: 'mohammed', narrator: 'mohammed' },
  act(lt, t, S, st, S3) {
    const { zoubida: zo, mohammed: mo } = st.A;
    castScale(zo); castScale(mo);
    sealHaik(zo);
    st.actcheck = { exposed: { zoubida: ['handR', 'foreArmR'] } };
    const door = spot(S3, st, 'portal', 480, 750, 185);
    // Hands stay inside the haik, on the belly, so a close-up doesn't crop a claw at the frame edge.
    clearArms(zo);
    armsDown(mo);

    // b122: a small turn toward the portal, still on the camera, then the head looks up.
    if (t < B(7)[0]) {
      yawTo(mo, door, .38);
      yawTo(zo, door, .32);
      keepFacing(mo, S3.cam.position, 46);
      keepFacing(zo, S3.cam.position, 46);
      return;
    }
    // b123: right arm stays the screen-left one (he still faces the camera) and points up at the portal.
    if (t < B(8)[0]) {
      const u = sm(B(7)[0], B(7)[0] + .22, t);
      yawTo(mo, door, .3);
      keepFacing(mo, S3.cam.position, 46);
      keepFacing(zo, S3.cam.position, 46);
      pointClamp(mo, door, u, 'R');
      PO.fingers(mo, 'R', .85, { each: [.7, 0, 1, 1, 1] });
      return;
    }
    // b126: she grips his shoulder and draws him in. Head stays high enough that the veil doesn't cover her eyes.
    if (t >= B(10)[0]) {
      const u = sm(B(10)[0], B(10)[0] + .25, t);
      easeClose(mo, zo.group.position, .38, u);
      yawTo(zo, mo.group.position, .55);
      const sleeve = at(mo, 'upperArmR');
      contact(zo, 'R', sleeve, { grip: .0, pole: [-.35, .12, .25], frac: .98 });
      PO.fingers(zo, 'R', .5);
      zo.B.spine.rotation.z += .06 * u;
      zo.B.chest.updateWorldMatrix(false, true);
    }
    // b124 is a close-up on her. Step him sideways out of that crop so his head is not sliced.
    if (t >= B(8)[0] && t < B(9)[0]) {
      const cam = S3.cam.position, away = mo.group.position.clone().sub(cam);
      away.y = 0;
      if (away.lengthSq() > 1e-4) {
        away.normalize();
        mo.group.position.addScaledVector(V(-away.z, 0, away.x), 1.7);
        mo.group.updateMatrixWorld(true);
      }
    }
  },
});

export default beatScene(ID, {
  shots: { tj1, lg, tj2 },
  plan: {
    b116: { shot: 'tj1', size: 'W', on: 'zoubida', insAt: .62 },
    b117: { shot: 'tj1', size: 'W', on: 'zoubida' },
    b118: { shot: 'tj1', size: 'W', on: 'zoubida' },
    b119: { shot: 'lg', size: 'W', on: 'zoubida' },
    b120: { shot: 'lg', size: 'M', on: 'marchand', z: 1.45, dy: -85 },
    b121: { shot: 'lg', size: 'W', on: 'zoubida' },
    b122: { shot: 'tj2', size: 'W', on: 'mohammed', insAt: .45 },
    b123: { shot: 'tj2', size: 'CU', on: 'mohammed', dx: -110 },
    b124: { shot: 'tj2', size: 'CU', on: 'zoubida' },
    b125: { shot: 'tj2', size: 'CU', on: 'mohammed' },
    b126: { shot: 'tj2', size: 'M', on: 'zoubida', z: 1.4, dx: -160 },
  },
});
