import { Container, Graphics } from 'pixi.js';
import type { HeroClassId } from '../data/classes';
import { COLORS } from '../scenes/palette';
import { BRONZE, BRONZE_LIT, BRONZE_SHADE, LEATHER, LINE, LINEN, LINEN_SHADE, SKIN, WOOD, darker, dome, lighter, shaded } from './look';

const RING = 0xf2c43c;

function createCape(color: number, heroClass: HeroClassId): Graphics {
  const g = new Graphics();
  g.position.set(-1, 0);
  const c = heroClass === 'ASSASSIN' ? darker(color, 0.25) : color;
  g.moveTo(1, -8.6)
    .bezierCurveTo(-5, -11, -11.5, -8.5, -12, 0)
    .bezierCurveTo(-11.5, 8.5, -5, 11, 1, 8.6)
    .quadraticCurveTo(-3, 0, 1, -8.6)
    .closePath()
    .fill(shaded(lighter(c, 0.15), darker(c, 0.4)))
    .stroke(LINE);
  for (const y of [-4.5, 0, 4.5]) g.moveTo(-3.5, y * 0.7).lineTo(-10, y * 1.2).stroke({ width: 0.6, color: darker(c, 0.55), alpha: 0.55 });
  if (heroClass === 'ARCHER') {
    g.roundRect(-8.5, -5.2, 5.2, 10.4, 2).fill(LEATHER).stroke({ ...LINE, width: 0.7 });
    for (const fy of [-3, 0, 3]) {
      g.circle(-9.2, fy, 1.3).fill(COLORS.marbleLit).stroke({ ...LINE, width: 0.5 });
    }
  }
  return g;
}

function createFoot(): Graphics {
  const g = new Graphics();
  g.ellipse(0, 0, 3.2, 1.9).fill(LEATHER).stroke({ ...LINE, width: 0.7 });
  g.ellipse(1.4, 0, 1.4, 1.2).fill(SKIN);
  return g;
}

function createRightArm(heroClass: HeroClassId, color: number): Container {
  const arm = new Container();
  arm.position.set(0, 6.6);
  const g = new Graphics();

  if (heroClass === 'GUERRIER') {
    g.moveTo(-10, 2.4).lineTo(12, 2.4).stroke({ width: 2.3, color: COLORS.ink, cap: 'round' });
    g.moveTo(-10, 2.4).lineTo(12, 2.4).stroke({ width: 1.2, color: WOOD, cap: 'round' });
    g.poly([11.5, 2.4, 13.6, 0.8, 17, 2.4, 13.6, 4]).fill(shaded(BRONZE_LIT, BRONZE_SHADE)).stroke({ ...LINE, width: 0.7 });
    g.poly([0, 0, 3.6, 2.2], false).stroke({ ...LINE, width: 4.4 });
    g.poly([0, 0, 3.6, 2.2], false).stroke({ width: 2.6, color: SKIN, cap: 'round' });
    g.circle(3.8, 2.4, 1.5).fill(SKIN).stroke({ ...LINE, width: 0.7 });
  } else if (heroClass === 'ARCHER') {
    // main arriere qui tire la corde et la fleche
    g.poly([0, 0, 2.5, -2.5], false).stroke({ ...LINE, width: 4 });
    g.poly([0, 0, 2.5, -2.5], false).stroke({ width: 2.4, color: SKIN, cap: 'round' });
    g.circle(2.8, -2.6, 1.5).fill(SKIN).stroke({ ...LINE, width: 0.7 });
  } else if (heroClass === 'MAGE') {
    // baton d'oracle avec orbe lumineuse
    g.moveTo(-9, 2.6).lineTo(14, 2.6).stroke({ width: 2.5, color: COLORS.ink, cap: 'round' });
    g.moveTo(-9, 2.6).lineTo(14, 2.6).stroke({ width: 1.4, color: BRONZE, cap: 'round' });
    g.circle(16, 2.6, 4.6).fill({ color, alpha: 0.35 });
    g.circle(16, 2.6, 3.1).fill(dome(COLORS.sun, color, darker(color, 0.4))).stroke({ ...LINE, width: 0.7 });
    g.poly([0, 0, 3.6, 2.4], false).stroke({ ...LINE, width: 4.2 });
    g.poly([0, 0, 3.6, 2.4], false).stroke({ width: 2.5, color: LINEN, cap: 'round' });
    g.circle(3.8, 2.6, 1.4).fill(SKIN).stroke({ ...LINE, width: 0.7 });
  } else {
    // dague courbe droite (Assassin)
    g.poly([3, 2, 12.5, -0.5, 10, 3.8]).fill(shaded(BRONZE_LIT, BRONZE_SHADE)).stroke({ ...LINE, width: 0.8 });
    g.poly([0, 0, 3.6, 2.2], false).stroke({ ...LINE, width: 4 });
    g.poly([0, 0, 3.6, 2.2], false).stroke({ width: 2.4, color: SKIN, cap: 'round' });
    g.circle(3.8, 2.2, 1.4).fill(LEATHER).stroke({ ...LINE, width: 0.7 });
  }

  arm.addChild(g);
  return arm;
}

function createLeftArm(heroClass: HeroClassId, color: number): Container {
  const arm = new Container();
  arm.position.set(0, -6.6);
  const g = new Graphics();

  if (heroClass === 'GUERRIER') {
    const cx = 4;
    const cy = -3.2;
    g.circle(cx + 0.9, cy + 0.9, 6.6).fill(BRONZE_SHADE).stroke(LINE);
    g.circle(cx, cy, 6.6).fill(shaded(BRONZE_LIT, BRONZE)).stroke(LINE);
    g.circle(cx, cy, 5.2).fill(dome(lighter(color, 0.45), color, darker(color, 0.4)));
    g.circle(cx, cy, 3.1).stroke({ width: 0.8, color: darker(color, 0.5), alpha: 0.85 });
    g.circle(cx, cy, 1.3).fill(BRONZE_LIT).stroke({ ...LINE, width: 0.5 });
  } else if (heroClass === 'ARCHER') {
    // bras tendu devant + arc en bois d'olivier + corde + fleche encochée
    g.poly([0, 0, 8.5, 5.2], false).stroke({ ...LINE, width: 4 });
    g.poly([0, 0, 8.5, 5.2], false).stroke({ width: 2.4, color: SKIN, cap: 'round' });
    // bois de l'arc (courbe devant le joueur, centre autour de x=10, y=6.6)
    g.moveTo(5.5, -3.5).quadraticCurveTo(14.5, 6.6, 5.5, 16.5).stroke({ width: 3.1, color: COLORS.ink, cap: 'round' });
    g.moveTo(5.5, -3.5).quadraticCurveTo(14.5, 6.6, 5.5, 16.5).stroke({ width: 1.7, color: WOOD, cap: 'round' });
    // corde
    g.moveTo(5.5, -3.5).lineTo(3.5, 6.6).lineTo(5.5, 16.5).stroke({ width: 0.8, color: COLORS.marbleLit, alpha: 0.9 });
    // fleche pretes a partir
    g.moveTo(3.5, 6.6).lineTo(15.5, 6.6).stroke({ width: 1.4, color: WOOD, cap: 'round' });
    g.poly([14.5, 5.2, 18, 6.6, 14.5, 8]).fill(BRONZE_LIT).stroke({ ...LINE, width: 0.5 });
  } else if (heroClass === 'MAGE') {
    g.poly([0, 0, 5.2, -1.6], false).stroke({ ...LINE, width: 4.2 });
    g.poly([0, 0, 5.2, -1.6], false).stroke({ width: 2.5, color: LINEN, cap: 'round' });
    g.circle(6.5, -1.8, 3.2).fill({ color, alpha: 0.45 });
    g.circle(6.5, -1.8, 1.5).fill(COLORS.sun);
  } else {
    // dague courbe gauche (Assassin)
    g.poly([3, -2, 12.5, 0.5, 10, -3.8]).fill(shaded(BRONZE_LIT, BRONZE_SHADE)).stroke({ ...LINE, width: 0.8 });
    g.poly([0, 0, 3.6, -2.2], false).stroke({ ...LINE, width: 4 });
    g.poly([0, 0, 3.6, -2.2], false).stroke({ width: 2.4, color: SKIN, cap: 'round' });
    g.circle(3.8, -2.2, 1.4).fill(LEATHER).stroke({ ...LINE, width: 0.7 });
  }

  arm.addChild(g);
  return arm;
}

function createTorso(heroClass: HeroClassId, color: number): Graphics {
  const g = new Graphics();
  if (heroClass === 'GUERRIER') {
    g.ellipse(0, 0, 6, 9.8).fill(shaded(0xe9b465, 0x94602c)).stroke(LINE);
    for (const y of [-6.2, 6.2]) g.roundRect(-3.2, y - 2.4, 6.2, 4.8, 2).fill(shaded(0xf3cc85, 0xb27a3a)).stroke({ ...LINE, width: 0.6 });
    g.roundRect(2.4, -3.4, 4.4, 6.8, 2).fill(BRONZE_SHADE).stroke({ ...LINE, width: 0.7 });
  } else if (heroClass === 'ARCHER') {
    g.ellipse(0, 0, 5.4, 8.8).fill(shaded(COLORS.olive, COLORS.oliveDark)).stroke(LINE);
    g.moveTo(-4, -5).lineTo(4, 5).stroke({ width: 2, color: LEATHER });
  } else if (heroClass === 'MAGE') {
    g.ellipse(0, 0, 5.8, 9.4).fill(shaded(LINEN, LINEN_SHADE)).stroke(LINE);
    g.ellipse(0, 0, 3.6, 8).stroke({ width: 1.3, color });
  } else {
    g.ellipse(0, 0, 5.2, 8.6).fill(shaded(0x334155, 0x1e293b)).stroke(LINE);
    g.moveTo(-3, -6).lineTo(3, 6).moveTo(-3, 6).lineTo(3, -6).stroke({ width: 1.4, color: BRONZE });
  }
  return g;
}

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
  return g;
}

function createHead(heroClass: HeroClassId, color: number): { head: Graphics; crest: Graphics | null } {
  const head = new Graphics();
  head.circle(1.2, 1.4, 5.5).fill({ color: COLORS.shadow, alpha: 0.3 });

  if (heroClass === 'GUERRIER') {
    head.circle(0, 0, 5.4).fill(dome(BRONZE_LIT, BRONZE, BRONZE_SHADE)).stroke(LINE);
    head.circle(0, 0, 4.2).stroke({ width: 0.6, color: BRONZE_SHADE, alpha: 0.6 });
    head.arc(0, 0, 3.4, Math.PI * 1.05, Math.PI * 1.45).stroke({ width: 1, color: 0xfff3c8, alpha: 0.75 });
    return { head, crest: createCrest(color) };
  }

  if (heroClass === 'ASSASSIN') {
    head.circle(0, 0, 5.5).fill(dome(lighter(darker(color, 0.3), 0.2), darker(color, 0.35), 0x0f172a)).stroke(LINE);
    head.arc(0, 0, 4.4, -0.7, 0.7).stroke({ width: 1.3, color: BRONZE_LIT });
    return { head, crest: null };
  }

  // Archer ou Mage : tete decouverte avec bandeau ou diademe
  head.circle(0, 0, 5.1).fill(dome(0x4a3525, 0x2f1e14, 0x1a100a)).stroke(LINE);
  head.circle(0, 0, 4.8).stroke({ width: 1.5, color: heroClass === 'MAGE' ? COLORS.gold : color });
  return { head, crest: null };
}

export function createAboveHero(color: number, isLocal: boolean, heroClass: HeroClassId = 'GUERRIER') {
  const view = new Container();
  const shadow = new Graphics().ellipse(3, 3.5, 11.5, 9.5).fill({ color: COLORS.shadow, alpha: 0.2 });
  const ring = new Graphics();
  if (isLocal) {
    ring.circle(0, 0, 16).fill({ color: COLORS.gold, alpha: 0.16 });
    ring.circle(0, 0, 16).stroke({ width: 1.4, color: RING });
  }

  const turn = new Container();
  const cape = createCape(color, heroClass);
  const footA = createFoot();
  const footB = createFoot();
  footA.y = -3.4;
  footB.y = 3.4;
  const rightArm = createRightArm(heroClass, color);
  const leftArm = createLeftArm(heroClass, color);
  turn.addChild(cape, footA, footB, rightArm, createTorso(heroClass, color), leftArm);

  const { head, crest } = createHead(heroClass, color);
  view.addChild(shadow, ring, turn, head);
  if (crest) view.addChild(crest);

  let dir = 1;
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
    setAngle: (a: number) => {
      angle = a;
      seenMotion = true;
      first = false;
    },
    animate: (moving: boolean, time: number, attackPulse = 0) => {
      const parent = view.parent?.parent;
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

      const p = time * 18;
      const s = Math.sin(p);
      const kick = Math.sin(attackPulse * Math.PI);
      if (moving) {
        footA.x = 1 + s * 5;
        footB.x = 1 - s * 5;
        cape.scale.x = 1.15 + Math.sin(time * 11) * 0.07;
        cape.skew.y = Math.sin(time * 9) * 0.05;
      } else {
        const breath = Math.sin(time * 2.4);
        footA.x = footB.x = 0;
        cape.scale.x = 1 + breath * 0.02;
        cape.skew.y = 0;
      }

      if (heroClass === 'ARCHER') {
        rightArm.x = -kick * 4.5;
        leftArm.x = kick * 1.5;
      } else if (heroClass === 'ASSASSIN') {
        rightArm.x = kick * 6;
        leftArm.x = kick * 4;
      } else {
        rightArm.x = (moving ? -s * 1.4 : 0) + kick * 6.5;
        leftArm.x = (moving ? s * 1 : 0) - kick * 1.5;
      }

      turn.rotation = angle;
      if (crest) crest.rotation = angle + (moving ? Math.sin(p * 2) * 0.05 : 0);
      ring.alpha = 0.72 + Math.sin(time * 3) * 0.24;
    }
  };
}
