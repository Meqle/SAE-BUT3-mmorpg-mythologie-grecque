// hoplite vu de profil (tourne vers la droite), les pieds en y = 16 (bas de la hitbox)
// chaque partie (jambes, bras, cape, cimier) est un objet a part qu'on fait tourner pour l'animation
import { Container, Graphics } from 'pixi.js';
import { COLORS } from '../scenes/palette';
import { BRONZE, BRONZE_LIT, BRONZE_SHADE, LEATHER, LINE, LINEN, LINEN_SHADE, SKIN, WOOD, darker, dome, lighter, shaded } from './look';

const RING = 0xf2c43c; // anneau du joueur local
const BACK_TINT = 0xb9b3c4; // les membres du cote loin sont un peu dans l'ombre

// membre en forme de "gelule" avec contour (trait epais ink puis trait couleur par dessus)
function limb(g: Graphics, points: number[], width: number, color: number) {
  g.poly(points, false).stroke({ ...LINE, width: width + 1.8 });
  g.poly(points, false).stroke({ width, color, cap: 'round', join: 'round' });
}

// jambe : cuisse + (genou -> tibia avec jambiere en bronze + sandale)
function createLeg(x: number) {
  const hip = new Container();
  hip.position.set(x, 4);
  const knee = new Container();
  knee.position.set(0, 5.8);
  const shin = new Graphics();
  limb(shin, [0, 0, 0.3, 4.6], 3.4, SKIN);
  shin.roundRect(-0.1, -0.2, 2.2, 4.4, 1.1).fill(shaded(BRONZE_LIT, BRONZE)).stroke({ ...LINE, width: 0.6 });
  shin.poly([-1.9, 5, 1.6, 4.6, 4.2, 5.4, 4.3, 6.2, -2, 6.2]).fill(LEATHER).stroke({ ...LINE, width: 0.7 });
  shin.moveTo(-1.6, 3.6).lineTo(1.8, 3.2).stroke({ width: 0.6, color: LEATHER });
  knee.addChild(shin);
  const thigh = new Graphics();
  limb(thigh, [0, 0, 0, 5.8], 4, SKIN);
  hip.addChild(knee, thigh);
  return { hip, knee };
}

// bras qui tient la lance (cote loin, derriere le corps)
function createSpearArm(): Container {
  const arm = new Container();
  arm.position.set(-1, -8.4);
  const g = new Graphics();
  const hand = { x: 4, y: 5 };
  const d = { x: 0.16, y: -0.987 };
  const at = (t: number) => [hand.x + d.x * t, hand.y + d.y * t];
  const [bx, by] = at(-11);
  const [tx, ty] = at(23);
  g.moveTo(bx, by).lineTo(tx, ty).stroke({ width: 2.3, color: COLORS.ink, cap: 'round' });
  g.moveTo(bx, by).lineTo(tx, ty).stroke({ width: 1.2, color: WOOD, cap: 'round' });
  // pointe en feuille de laurier + talon en bronze
  const [lx, ly] = at(26.5);
  const [px, py] = at(30.5);
  g.poly([tx, ty, lx + 1.7, ly + 0.3, px, py, lx - 1.7, ly - 0.3]).fill(shaded(BRONZE_LIT, BRONZE_SHADE)).stroke({ ...LINE, width: 0.7 });
  g.moveTo(tx, ty).lineTo(px, py).stroke({ width: 0.5, color: BRONZE_SHADE });
  const [sx, sy] = at(-13);
  g.poly([bx - 0.9, by, bx + 0.9, by, sx, sy]).fill(BRONZE).stroke({ ...LINE, width: 0.6 });
  limb(g, [0, 0, 0.2, 4.4, hand.x, hand.y], 2.6, SKIN);
  g.circle(hand.x, hand.y, 1.4).fill(SKIN).stroke({ ...LINE, width: 0.7 });
  arm.addChild(g);
  arm.tint = BACK_TINT;
  return arm;
}

// bras du bouclier (cote proche, devant le corps)
function createShieldArm(color: number): Container {
  const arm = new Container();
  arm.position.set(1, -8.6);
  const g = new Graphics();
  limb(g, [0, 0, 2, 5.2], 2.8, SKIN);
  const cx = 5.6;
  const cy = 6.6;
  g.ellipse(cx + 1, cy + 0.2, 5.4, 7.3).fill(BRONZE_SHADE).stroke(LINE); // epaisseur du bouclier
  g.ellipse(cx, cy, 5.4, 7.3).fill(shaded(BRONZE_LIT, BRONZE)).stroke(LINE);
  g.ellipse(cx, cy, 4.2, 5.9).fill(dome(lighter(color, 0.45), color, darker(color, 0.4)));
  g.ellipse(cx, cy, 2.5, 3.5).stroke({ width: 0.8, color: darker(color, 0.5), alpha: 0.85 });
  g.ellipse(cx, cy, 1.1, 1.5).fill(BRONZE_LIT).stroke({ ...LINE, width: 0.5 });
  g.moveTo(cx - 3.4, cy - 2.4).quadraticCurveTo(cx - 2.6, cy - 5.4, cx - 0.2, cy - 5.9).stroke({ width: 0.9, color: 0xffffff, alpha: 0.55 });
  arm.addChild(g);
  return arm;
}

// cape en deux morceaux (haut pivote sur l'epaule, bas pivote au milieu) pour qu'elle ondule
function createCape(color: number) {
  const fill = shaded(darker(color, 0.1), darker(color, 0.5));
  const fold = { width: 0.6, color: darker(color, 0.65), alpha: 0.6 };
  const top = new Container();
  top.position.set(-2.2, -9.8);
  const bottom = new Graphics();
  bottom.position.set(-1.6, 7.6);
  bottom.poly([-2.6, -1.4, 2.4, -1.4, 3.2, 8.6, -4.6, 8.6]).fill(fill);
  bottom.moveTo(-2.6, -1.4).lineTo(-4.6, 8.6).quadraticCurveTo(-3.2, 7.6, -1.8, 8.8).quadraticCurveTo(-0.2, 7.6, 1.2, 8.8).quadraticCurveTo(2.2, 7.8, 3.2, 8.6).lineTo(2.4, -1.4).stroke(LINE);
  bottom.moveTo(-1, 0).lineTo(-1.8, 7.6).stroke(fold);
  const upper = new Graphics();
  upper.poly([2.6, 0.2, -2.6, 0.4, -4.4, 8, 0.9, 8]).fill(fill);
  upper.moveTo(2.6, 0.2).quadraticCurveTo(-0.8, -1.2, -2.6, 0.4).quadraticCurveTo(-3.8, 4, -4.4, 8).stroke(LINE);
  upper.moveTo(2.6, 0.2).quadraticCurveTo(0.8, 4, 0.9, 8).stroke(LINE);
  upper.moveTo(-0.6, 2.4).lineTo(-1.8, 7.4).stroke(fold);
  top.addChild(bottom, upper);
  return { top, bottom };
}

// tunique en lin, pteruges en cuir et cuirasse en bronze
function createTorso(color: number): Graphics {
  const g = new Graphics();
  g.rect(-1.6, -12.6, 3.2, 3).fill(SKIN);
  g.moveTo(-4.6, -0.5).lineTo(4.6, -0.5).lineTo(6.2, 7.2).quadraticCurveTo(0, 8.4, -6, 7.2).closePath().fill(shaded(LINEN, LINEN_SHADE)).stroke(LINE);
  g.moveTo(5.9, 6.1).quadraticCurveTo(0, 7.3, -5.7, 6.1).stroke({ width: 1.4, color });
  for (const [x1, x2] of [[-2.2, -3.2], [0.8, 1], [3.4, 4.6]]) g.moveTo(x1, 3).lineTo(x2, 5.6).stroke({ width: 0.5, color: LINEN_SHADE });
  for (let i = 0; i < 5; i++) g.roundRect(-4.3 + i * 1.8, 0.4, 1.5, 3.6, 0.6).fill(i % 2 ? 0x9a6a3c : 0xb07c46).stroke({ ...LINE, width: 0.45 });
  g.moveTo(-3.8, -10.4)
    .lineTo(2.2, -10.6)
    .quadraticCurveTo(5.6, -9.5, 5.4, -5.5)
    .quadraticCurveTo(5.2, -2, 4.4, 0.6)
    .lineTo(-4.4, 0.6)
    .quadraticCurveTo(-5.4, -5, -3.8, -10.4)
    .closePath()
    .fill(shaded(0xe9b465, 0x94602c))
    .stroke(LINE);
  g.moveTo(1, -7).quadraticCurveTo(3.6, -6.6, 4.3, -4.4).stroke({ width: 0.6, color: BRONZE_SHADE, alpha: 0.7 });
  g.moveTo(-2.6, -9).quadraticCurveTo(-3.6, -5, -2.9, -1.6).stroke({ width: 1, color: 0xfff3c8, alpha: 0.6 });
  g.rect(-4.5, -0.6, 9.1, 1.5).fill(LEATHER).stroke({ ...LINE, width: 0.5 });
  return g;
}

// casque corinthien (centre de la tete en 0,0) : nasal, joues longues, couvre-nuque evase
function createHelmet(): Graphics {
  const g = new Graphics();
  g.moveTo(1.6, 6.4).quadraticCurveTo(5.4, 6.8, 4.8, 9.6).quadraticCurveTo(2.6, 10.2, 1.2, 8).closePath().fill(0x5a3622).stroke({ ...LINE, width: 0.6 }); // barbe
  g.moveTo(-5.6, 3.8)
    .quadraticCurveTo(-6.6, -0.5, -5, -3.6)
    .quadraticCurveTo(-2.8, -6.4, 0.8, -6.2)
    .quadraticCurveTo(5.2, -5.6, 5.8, -1.6)
    .lineTo(6.5, -0.4)
    .lineTo(6.4, 3)
    .lineTo(5.1, 3.3)
    .quadraticCurveTo(5.5, 7, 3.4, 7.7)
    .quadraticCurveTo(1.6, 7.9, 0.6, 5.6)
    .quadraticCurveTo(-0.6, 3.6, -2.4, 4.4)
    .quadraticCurveTo(-4, 5.2, -5.6, 3.8)
    .closePath()
    .fill(dome(BRONZE_LIT, BRONZE, BRONZE_SHADE))
    .stroke(LINE);
  g.moveTo(1.4, 0.2).quadraticCurveTo(3.8, -1, 6.3, -0.1).lineTo(6.2, 0.9).quadraticCurveTo(3.6, 1.3, 1.4, 0.2).fill(COLORS.ink); // fente des yeux
  g.moveTo(5.4, 3.3).lineTo(4.6, 6.6).stroke({ width: 0.9, color: COLORS.ink }); // ouverture de la bouche
  g.moveTo(-5.2, 1.2).quadraticCurveTo(-1.8, -1.4, 1.2, 0).stroke({ width: 0.6, color: BRONZE_SHADE, alpha: 0.7 });
  g.moveTo(-0.4, -2).quadraticCurveTo(3, -3.2, 5.8, -1.7).stroke({ width: 0.7, color: BRONZE_SHADE, alpha: 0.8 });
  g.moveTo(-4.6, -2.2).quadraticCurveTo(-3, -5.2, 0.6, -5.3).stroke({ width: 1.1, color: 0xfff3c8, alpha: 0.8 });
  return g;
}

// cimier en crin a la couleur du dieu (pivot au sommet du casque)
function createCrest(color: number): Graphics {
  const g = new Graphics();
  g.position.set(0, -5.6);
  g.moveTo(3.6, 0.4)
    .quadraticCurveTo(2.8, -5.6, -3.2, -6)
    .quadraticCurveTo(-8.2, -5.8, -9.6, -0.9)
    .quadraticCurveTo(-10.6, 3.6, -9.2, 9)
    .quadraticCurveTo(-8.4, 5.6, -6.6, 2.2)
    .quadraticCurveTo(-4.6, -1, -1, -0.7)
    .closePath()
    .fill(shaded(lighter(color, 0.3), darker(color, 0.3)))
    .stroke(LINE);
  for (const k of [0, 1, 2]) {
    g.moveTo(2 - k * 0.6, -0.6 - k * 0.3)
      .quadraticCurveTo(0.5 - k, -4.4 + k * 0.8, -3.6, -4.8 + k * 1.3)
      .quadraticCurveTo(-7.4 - k * 0.2, -4.4 + k, -8.4 + k * 0.4, 1 + k)
      .stroke({ width: 0.5, color: darker(color, 0.4), alpha: 0.7 });
  }
  g.moveTo(2.4, -1.6).quadraticCurveTo(1, -5, -3.4, -5.2).stroke({ width: 0.9, color: lighter(color, 0.7), alpha: 0.8 });
  return g;
}

export function createSideHero(color: number, isLocal: boolean) {
  const view = new Container();

  // ombre au sol + anneau dore du joueur local (ne se retournent pas)
  const shadow = new Graphics().ellipse(1, 16, 11, 2.6).fill({ color: COLORS.shadow, alpha: 0.28 });
  const ring = new Graphics();
  if (isLocal) {
    ring.ellipse(0, 16, 13.5, 3.6).fill({ color: COLORS.gold, alpha: 0.2 });
    ring.ellipse(0, 16, 13.5, 3.6).stroke({ width: 2.6, color: COLORS.ink, alpha: 0.3 });
    ring.ellipse(0, 16, 13.5, 3.6).stroke({ width: 1.3, color: RING });
    ring.ellipse(0, 16, 15.5, 4.4).stroke({ width: 0.6, color: COLORS.gold, alpha: 0.5 });
  }

  const body = new Container();
  const rig = new Container();
  const lean = () => {
    const c = new Container();
    c.position.set(0, 4);
    c.pivot.set(0, 4);
    return c;
  };
  const behind = lean();
  const upper = lean();
  const cape = createCape(color);
  const spearArm = createSpearArm();
  behind.addChild(cape.top, spearArm);
  const backLeg = createLeg(-0.8);
  backLeg.hip.tint = BACK_TINT;
  const frontLeg = createLeg(0.8);
  const head = new Container();
  head.position.set(0.6, -15.2);
  const crest = createCrest(color);
  head.addChild(crest, createHelmet());
  const shieldArm = createShieldArm(color);
  upper.addChild(createTorso(color), shieldArm, head);
  rig.addChild(behind, backLeg.hip, frontLeg.hip, upper);
  body.addChild(rig);
  view.addChild(shadow, ring, body);

  return {
    view,
    face: (dir: number) => {
      body.scale.x = dir;
    },
    animate: (moving: boolean, airborne: boolean, time: number) => {
      const p = time * 18; // phase de la course
      const s = Math.sin(p);
      let pose: number[]; // [hanche avant, genou avant, hanche arriere, genou arriere, penche, lance, bouclier, cape haut, cape bas, cimier, y]
      if (airborne) {
        pose = [-0.9, 1.3, 0.5, 0.7, -0.04, -0.5, -0.25, 0.7, 0.5 + Math.sin(time * 12) * 0.15, 0.2, -1];
      } else if (moving) {
        const kneeFront = 0.15 + Math.max(0, Math.cos(p)) * 1.1;
        const kneeBack = 0.15 + Math.max(0, -Math.cos(p)) * 1.1;
        pose = [-s * 0.75, kneeFront, s * 0.75, kneeBack, 0.12, -s * 0.35, s * 0.15, 0.3, 0.35 + Math.sin(time * 12) * 0.18, 0.08 + Math.sin(p * 2) * 0.05, Math.abs(s) * 2];
      } else {
        const breath = Math.sin(time * 2.4);
        pose = [0, 0, 0, 0, 0, breath * 0.03, -breath * 0.02, 0.03, 0.04 + Math.sin(time * 1.7) * 0.05, Math.sin(time * 1.7 + 1) * 0.03, 0];
        upper.y = 4 + breath * 0.3;
      }
      frontLeg.hip.rotation = pose[0];
      frontLeg.knee.rotation = pose[1];
      backLeg.hip.rotation = pose[2];
      backLeg.knee.rotation = pose[3];
      behind.rotation = upper.rotation = pose[4];
      spearArm.rotation = pose[5];
      shieldArm.rotation = pose[6];
      cape.top.rotation = pose[7];
      cape.bottom.rotation = pose[8];
      crest.rotation = pose[9];
      rig.y = pose[10];
      if (moving || airborne) upper.y = 4;
      shadow.alpha = airborne ? 0 : 1; // en l'air on ne sait pas ou est le sol
      ring.alpha = (airborne ? 0.2 : 1) * (0.75 + Math.sin(time * 3) * 0.25);
    }
  };
}
