// hoplite vu de dessus (tourne vers la droite avant rotation) : cape, epaules, bouclier, lance, casque a cimier
// le corps tourne dans le sens de la marche ; le casque et l'ombre ne tournent pas (lumiere fixe en haut a gauche)
import { Container, Graphics } from 'pixi.js';
import { COLORS } from '../scenes/palette';
import { BRONZE, BRONZE_LIT, BRONZE_SHADE, LEATHER, LINE, SKIN, WOOD, darker, dome, lighter, shaded } from './look';

const RING = 0xf2c43c; // anneau du joueur local

function createCape(color: number): Graphics {
  const g = new Graphics();
  g.position.set(-1, 0);
  g.moveTo(1, -8.6)
    .bezierCurveTo(-5, -11, -11.5, -8.5, -12, 0)
    .bezierCurveTo(-11.5, 8.5, -5, 11, 1, 8.6)
    .quadraticCurveTo(-3, 0, 1, -8.6)
    .closePath()
    .fill(shaded(lighter(color, 0.15), darker(color, 0.4)))
    .stroke(LINE);
  for (const y of [-4.5, 0, 4.5]) g.moveTo(-3.5, y * 0.7).lineTo(-10, y * 1.2).stroke({ width: 0.6, color: darker(color, 0.55), alpha: 0.55 });
  return g;
}

function createFoot(): Graphics {
  const g = new Graphics();
  g.ellipse(0, 0, 3.2, 1.9).fill(LEATHER).stroke({ ...LINE, width: 0.7 });
  g.ellipse(1.4, 0, 1.4, 1.2).fill(SKIN);
  return g;
}

// bras droit et lance (cote bas quand il regarde a droite)
function createSpearArm(): Container {
  const arm = new Container();
  arm.position.set(0, 6.6);
  const g = new Graphics();
  g.moveTo(-10, 2.4).lineTo(12, 2.4).stroke({ width: 2.3, color: COLORS.ink, cap: 'round' });
  g.moveTo(-10, 2.4).lineTo(12, 2.4).stroke({ width: 1.2, color: WOOD, cap: 'round' });
  g.poly([11.5, 2.4, 13.6, 0.8, 17, 2.4, 13.6, 4]).fill(shaded(BRONZE_LIT, BRONZE_SHADE)).stroke({ ...LINE, width: 0.7 });
  g.poly([0, 0, 3.6, 2.2], false).stroke({ ...LINE, width: 4.4 });
  g.poly([0, 0, 3.6, 2.2], false).stroke({ width: 2.6, color: SKIN, cap: 'round' });
  g.circle(3.8, 2.4, 1.5).fill(SKIN).stroke({ ...LINE, width: 0.7 });
  arm.addChild(g);
  return arm;
}

// bras gauche et bouclier rond (cote haut)
function createShieldArm(color: number): Container {
  const arm = new Container();
  arm.position.set(0, -6.6);
  const g = new Graphics();
  const cx = 4;
  const cy = -3.2;
  g.circle(cx + 0.9, cy + 0.9, 6.6).fill(BRONZE_SHADE).stroke(LINE);
  g.circle(cx, cy, 6.6).fill(shaded(BRONZE_LIT, BRONZE)).stroke(LINE);
  g.circle(cx, cy, 5.2).fill(dome(lighter(color, 0.45), color, darker(color, 0.4)));
  g.circle(cx, cy, 3.1).stroke({ width: 0.8, color: darker(color, 0.5), alpha: 0.85 });
  g.circle(cx, cy, 1.3).fill(BRONZE_LIT).stroke({ ...LINE, width: 0.5 });
  arm.addChild(g);
  return arm;
}

// epaules : cuirasse en bronze avec les epaulieres
function createTorso(): Graphics {
  const g = new Graphics();
  g.ellipse(0, 0, 6, 9.8).fill(shaded(0xe9b465, 0x94602c)).stroke(LINE);
  for (const y of [-6.2, 6.2]) g.roundRect(-3.2, y - 2.4, 6.2, 4.8, 2).fill(shaded(0xf3cc85, 0xb27a3a)).stroke({ ...LINE, width: 0.6 });
  g.roundRect(2.4, -3.4, 4.4, 6.8, 2).fill(BRONZE_SHADE).stroke({ ...LINE, width: 0.7 }); // joues du casque (devant)
  return g;
}

// cimier en crin (bande de l'avant vers l'arriere, avec une queue qui depasse)
function createCrest(color: number): Graphics {
  const g = new Graphics();
  g.ellipse(-3, 1.4, 7.5, 1.6).fill({ color: COLORS.shadow, alpha: 0.3 });
  g.moveTo(4.6, 0)
    .quadraticCurveTo(4.2, -1.3, 2, -1.3)
    .lineTo(-6, -1.2)
    .quadraticCurveTo(-10, -0.9, -11, 0)
    .quadraticCurveTo(-10, 0.9, -6, 1.2)
    .lineTo(2, 1.3)
    .quadraticCurveTo(4.2, 1.3, 4.6, 0)
    .closePath()
    .fill(shaded(lighter(color, 0.35), darker(color, 0.3)))
    .stroke(LINE);
  for (const y of [-0.6, 0.6]) g.moveTo(4, y).lineTo(-9.5, y * 0.9).stroke({ width: 0.4, color: darker(color, 0.4), alpha: 0.7 });
  g.moveTo(3.4, -0.7).lineTo(-4, -0.7).stroke({ width: 0.7, color: lighter(color, 0.7), alpha: 0.8 });
  return g;
}

export function createAboveHero(color: number, isLocal: boolean) {
  const view = new Container();
  const shadow = new Graphics().ellipse(3, 3.5, 11.5, 9.5).fill({ color: COLORS.shadow, alpha: 0.2 });
  const ring = new Graphics();
  if (isLocal) {
    ring.circle(0, 0, 16).fill({ color: COLORS.gold, alpha: 0.18 });
    ring.circle(0, 0, 16).stroke({ width: 2.8, color: COLORS.ink, alpha: 0.3 });
    ring.circle(0, 0, 16).stroke({ width: 1.4, color: RING });
    ring.circle(0, 0, 18).stroke({ width: 0.6, color: COLORS.gold, alpha: 0.5 });
  }

  const turn = new Container();
  const cape = createCape(color);
  const footA = createFoot();
  const footB = createFoot();
  footA.y = -3.4;
  footB.y = 3.4;
  const spearArm = createSpearArm();
  const shieldArm = createShieldArm(color);
  turn.addChild(cape, footA, footB, spearArm, createTorso(), shieldArm);

  // casque : dome eclaire en haut a gauche (ne tourne pas, il est rond)
  const helmet = new Graphics();
  helmet.circle(1.2, 1.4, 5.6).fill({ color: COLORS.shadow, alpha: 0.3 });
  helmet.circle(0, 0, 5.4).fill(dome(BRONZE_LIT, BRONZE, BRONZE_SHADE)).stroke(LINE);
  helmet.circle(0, 0, 4.2).stroke({ width: 0.6, color: BRONZE_SHADE, alpha: 0.6 });
  helmet.arc(0, 0, 3.4, Math.PI * 1.05, Math.PI * 1.45).stroke({ width: 1, color: 0xfff3c8, alpha: 0.75 });
  const crest = createCrest(color);
  view.addChild(shadow, ring, turn, helmet, crest);

  let dir = 1; // gauche / droite donne par face()
  let angle = 0;
  let lastX = NaN;
  let lastY = NaN;
  let seenMotion = false;
  let first = true;

  return {
    view,
    face: (d: number) => {
      dir = d;
    },
    animate: (moving: boolean, time: number) => {
      // sens de la marche : on compare la position avec celle de l'image d'avant
      const parent = view.parent;
      let target = dir > 0 ? 0 : Math.PI;
      if (parent) {
        const dx = parent.x - lastX;
        const dy = parent.y - lastY;
        if (Math.hypot(dx, dy) > 0.3) {
          seenMotion = true;
          target = Math.atan2(dy, dx);
        } else if (seenMotion) target = angle;
        lastX = parent.x;
        lastY = parent.y;
      }
      let diff = target - angle;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      angle = first ? target : angle + diff * 0.25;
      first = false;

      const p = time * 18; // phase de la course
      const s = Math.sin(p);
      if (moving) {
        footA.x = 1 + s * 5;
        footB.x = 1 - s * 5;
        spearArm.x = -s * 1.4;
        shieldArm.x = s * 1;
        cape.scale.x = 1.15 + Math.sin(time * 11) * 0.07;
        cape.skew.y = Math.sin(time * 9) * 0.05;
        turn.scale.set(1 + Math.abs(s) * 0.03);
      } else {
        const breath = Math.sin(time * 2.4);
        footA.x = footB.x = 0;
        spearArm.x = shieldArm.x = 0;
        cape.scale.x = 1 + breath * 0.02;
        cape.skew.y = 0;
        turn.scale.set(1 + breath * 0.01);
      }
      turn.rotation = angle;
      crest.rotation = angle + (moving ? Math.sin(p * 2) * 0.05 : 0);
      ring.alpha = 0.75 + Math.sin(time * 3) * 0.25;
    }
  };
}
