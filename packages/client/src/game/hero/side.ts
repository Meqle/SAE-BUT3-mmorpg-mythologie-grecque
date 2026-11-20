import { Container, Graphics } from 'pixi.js';
import type { HeroClassId } from '../data/classes';
import { COLORS } from '../scenes/palette';
import { BRONZE, BRONZE_LIT, BRONZE_SHADE, LEATHER, LINE, LINEN, LINEN_SHADE, SKIN, WOOD, darker, dome, lighter, shaded } from './look';

const RING = 0xf2c43c;
const BACK_TINT = 0xb9b3c4;

function limb(g: Graphics, points: number[], width: number, color: number) {
  g.poly(points, false).stroke({ ...LINE, width: width + 1.8 });
  g.poly(points, false).stroke({ width, color, cap: 'round', join: 'round' });
}

function createLeg(x: number) {
  const hip = new Container();
  hip.position.set(x, 4);
  const knee = new Container();
  knee.position.set(0, 5.8);
  const shin = new Graphics();
  limb(shin, [0, 0, 0.3, 4.6], 3.4, SKIN);
  shin.roundRect(-0.1, -0.2, 2.2, 4.4, 1.1).fill(shaded(BRONZE_LIT, BRONZE)).stroke({ ...LINE, width: 0.6 });
  shin.poly([-1.9, 5, 1.6, 4.6, 4.2, 5.4, 4.3, 6.2, -2, 6.2]).fill(LEATHER).stroke({ ...LINE, width: 0.7 });
  knee.addChild(shin);
  const thigh = new Graphics();
  limb(thigh, [0, 0, 0, 5.8], 4, SKIN);
  hip.addChild(knee, thigh);
  return { hip, knee };
}

function createBackArm(heroClass: HeroClassId): Container {
  const arm = new Container();
  arm.position.set(-1, -8.4);
  const g = new Graphics();
  const hand = { x: 4, y: 5 };

  if (heroClass === 'GUERRIER') {
    const d = { x: 0.16, y: -0.987 };
    const at = (t: number) => [hand.x + d.x * t, hand.y + d.y * t];
    const [bx, by] = at(-11);
    const [tx, ty] = at(23);
    g.moveTo(bx, by).lineTo(tx, ty).stroke({ width: 2.3, color: COLORS.ink, cap: 'round' });
    g.moveTo(bx, by).lineTo(tx, ty).stroke({ width: 1.2, color: WOOD, cap: 'round' });
    const [lx, ly] = at(26.5);
    const [px, py] = at(30.5);
    g.poly([tx, ty, lx + 1.7, ly + 0.3, px, py, lx - 1.7, ly - 0.3]).fill(shaded(BRONZE_LIT, BRONZE_SHADE)).stroke({ ...LINE, width: 0.7 });
  } else if (heroClass === 'ASSASSIN') {
    g.poly([hand.x, hand.y, hand.x + 10, hand.y - 3, hand.x + 6, hand.y + 3]).fill(shaded(BRONZE_LIT, BRONZE_SHADE)).stroke({ ...LINE, width: 0.7 });
  }

  limb(g, [0, 0, 0.2, 4.4, hand.x, hand.y], 2.6, SKIN);
  g.circle(hand.x, hand.y, 1.4).fill(SKIN).stroke({ ...LINE, width: 0.7 });
  arm.addChild(g);
  arm.tint = BACK_TINT;
  return arm;
}

function createFrontArm(heroClass: HeroClassId, color: number): Container {
  const arm = new Container();
  arm.position.set(1, -8.6);
  const g = new Graphics();

  if (heroClass === 'GUERRIER') {
    limb(g, [0, 0, 2, 5.2], 2.8, SKIN);
    const cx = 5.6;
    const cy = 6.6;
    g.ellipse(cx + 1, cy + 0.2, 5.4, 7.3).fill(BRONZE_SHADE).stroke(LINE);
    g.ellipse(cx, cy, 5.4, 7.3).fill(shaded(BRONZE_LIT, BRONZE)).stroke(LINE);
    g.ellipse(cx, cy, 4.2, 5.9).fill(dome(lighter(color, 0.45), color, darker(color, 0.4)));
    g.ellipse(cx, cy, 1.1, 1.5).fill(BRONZE_LIT).stroke({ ...LINE, width: 0.5 });
  } else if (heroClass === 'ARCHER') {
    // bras tendu tenant l'arc verticalement devant le heros
    limb(g, [0, 0, 6.5, 2.2], 2.6, SKIN);
    g.moveTo(4, -9).quadraticCurveTo(13, 2, 4, 13).stroke({ width: 3, color: COLORS.ink, cap: 'round' });
    g.moveTo(4, -9).quadraticCurveTo(13, 2, 4, 13).stroke({ width: 1.6, color: WOOD, cap: 'round' });
    g.moveTo(4, -9).lineTo(2.5, 2).lineTo(4, 13).stroke({ width: 0.8, color: COLORS.marbleLit });
    g.moveTo(2.5, 2).lineTo(14.5, 2).stroke({ width: 1.4, color: WOOD });
    g.poly([13.5, 0.6, 17, 2, 13.5, 3.4]).fill(BRONZE_LIT);
  } else if (heroClass === 'MAGE') {
    limb(g, [0, 0, 4.5, 3.6], 2.6, LINEN);
    g.moveTo(6.5, 16).lineTo(9.5, -13).stroke({ width: 2.5, color: COLORS.ink, cap: 'round' });
    g.moveTo(6.5, 16).lineTo(9.5, -13).stroke({ width: 1.4, color: BRONZE, cap: 'round' });
    g.circle(9.8, -15, 5.5).fill({ color, alpha: 0.35 });
    g.circle(9.8, -15, 3.4).fill(dome(COLORS.sun, color, darker(color, 0.4))).stroke({ ...LINE, width: 0.7 });
  } else {
    limb(g, [0, 0, 4.5, 4.4], 2.6, SKIN);
    g.poly([4.5, 4.4, 17, 0.5, 11.5, 7.2]).fill(shaded(0xe2e8f0, 0x64748b)).stroke({ ...LINE, width: 0.9 });
  }

  arm.addChild(g);
  return arm;
}

function createCape(color: number, heroClass: HeroClassId) {
  const c = heroClass === 'ASSASSIN' ? 0x1e1b2e : color;
  const fill = shaded(darker(c, 0.1), darker(c, 0.5));
  const top = new Container();
  top.position.set(-2.2, -9.8);
  const bottom = new Graphics();
  bottom.position.set(-1.6, 7.6);
  bottom.poly([-2.6, -1.4, 2.4, -1.4, 3.2, 8.6, -4.6, 8.6]).fill(fill).stroke(LINE);
  const upper = new Graphics();
  upper.poly([2.6, 0.2, -2.6, 0.4, -4.4, 8, 0.9, 8]).fill(fill).stroke(LINE);
  if (heroClass === 'ARCHER') {
    upper.roundRect(-5.2, -0.5, 3.6, 9, 1.2).fill(LEATHER).stroke({ ...LINE, width: 0.6 });
    upper.circle(-4.2, -2, 1.2).fill(COLORS.marbleLit);
    upper.circle(-2.4, -1.6, 1.2).fill(COLORS.marbleLit);
  }
  top.addChild(bottom, upper);
  return { top, bottom };
}

function createTorso(color: number, heroClass: HeroClassId): Graphics {
  const g = new Graphics();
  g.rect(-1.6, -12.6, 3.2, 3).fill(SKIN);
  g.moveTo(-4.6, -0.5).lineTo(4.6, -0.5).lineTo(6.2, 7.2).quadraticCurveTo(0, 8.4, -6, 7.2).closePath().fill(shaded(LINEN, LINEN_SHADE)).stroke(LINE);
  g.moveTo(5.9, 6.1).quadraticCurveTo(0, 7.3, -5.7, 6.1).stroke({ width: 1.4, color });

  const armorLit =
    heroClass === 'GUERRIER' ? 0xe9b465 :
    heroClass === 'ARCHER' ? COLORS.olive :
    heroClass === 'MAGE' ? LINEN : 0x334155;
  const armorDark =
    heroClass === 'GUERRIER' ? 0x94602c :
    heroClass === 'ARCHER' ? COLORS.oliveDark :
    heroClass === 'MAGE' ? LINEN_SHADE : 0x0f172a;

  g.moveTo(-3.8, -10.4)
    .lineTo(2.2, -10.6)
    .quadraticCurveTo(5.6, -9.5, 5.4, -5.5)
    .quadraticCurveTo(5.2, -2, 4.4, 0.6)
    .lineTo(-4.4, 0.6)
    .quadraticCurveTo(-5.4, -5, -3.8, -10.4)
    .closePath()
    .fill(shaded(armorLit, armorDark))
    .stroke(LINE);
  g.rect(-4.5, -0.6, 9.1, 1.5).fill(LEATHER).stroke({ ...LINE, width: 0.5 });
  return g;
}

function createHeadVisual(heroClass: HeroClassId, color: number): { head: Container; crest: Graphics | null } {
  const head = new Container();
  head.position.set(0.6, -15.2);

  if (heroClass === 'GUERRIER') {
    const crest = new Graphics();
    crest.position.set(0, -5.6);
    crest.moveTo(3.6, 0.4).quadraticCurveTo(2.8, -5.6, -3.2, -6).quadraticCurveTo(-8.2, -5.8, -9.6, -0.9).quadraticCurveTo(-10.6, 3.6, -9.2, 9).quadraticCurveTo(-8.4, 5.6, -6.6, 2.2).quadraticCurveTo(-4.6, -1, -1, -0.7).closePath()
      .fill(shaded(lighter(color, 0.3), darker(color, 0.3))).stroke(LINE);
    const helm = new Graphics();
    helm.circle(0, 0, 5.6).fill(dome(BRONZE_LIT, BRONZE, BRONZE_SHADE)).stroke(LINE);
    helm.moveTo(1.4, 0.2).quadraticCurveTo(3.8, -1, 6, -0.1).lineTo(5.9, 0.9).quadraticCurveTo(3.6, 1.3, 1.4, 0.2).fill(COLORS.ink);
    head.addChild(crest, helm);
    return { head, crest };
  }

  const face = new Graphics();
  face.circle(0, 0, 5.1).fill(dome(0xf3c79e, SKIN, 0xa8714c)).stroke(LINE);
  if (heroClass === 'ASSASSIN') {
    face.arc(0, 0, 5.6, Math.PI * 0.7, Math.PI * 2.15).fill(darker(color, 0.35)).stroke(LINE);
  } else {
    face.arc(0, -0.6, 5.2, Math.PI * 0.85, Math.PI * 2.05).fill(0x2f1e14);
    face.moveTo(-5, -2).lineTo(5, -2).stroke({ width: 1.8, color: heroClass === 'MAGE' ? COLORS.gold : color });
  }
  face.circle(2.5, 0, 0.9).fill(COLORS.ink);
  head.addChild(face);
  return { head, crest: null };
}

export function createSideHero(color: number, isLocal: boolean, heroClass: HeroClassId = 'GUERRIER') {
  const view = new Container();
  const shadow = new Graphics().ellipse(1, 16, 11, 2.6).fill({ color: COLORS.shadow, alpha: 0.28 });
  const ring = new Graphics();
  if (isLocal) {
    ring.ellipse(0, 16, 13.5, 3.6).fill({ color: COLORS.gold, alpha: 0.18 });
    ring.ellipse(0, 16, 13.5, 3.6).stroke({ width: 1.3, color: RING });
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
  const cape = createCape(color, heroClass);
  const backArm = createBackArm(heroClass);
  behind.addChild(cape.top, backArm);
  const backLeg = createLeg(-0.8);
  backLeg.hip.tint = BACK_TINT;
  const frontLeg = createLeg(0.8);
  const { head, crest } = createHeadVisual(heroClass, color);
  const frontArm = createFrontArm(heroClass, color);
  upper.addChild(createTorso(color, heroClass), frontArm, head);
  rig.addChild(behind, backLeg.hip, frontLeg.hip, upper);
  body.addChild(rig);
  view.addChild(shadow, ring, body);

  return {
    view,
    face: (dir: number) => {
      body.scale.x = dir;
    },
    animate: (moving: boolean, airborne: boolean, time: number, attackPulse = 0) => {
      const p = time * 18;
      const s = Math.sin(p);
      const kick = Math.sin(attackPulse * Math.PI);
      let pose: number[];
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
      behind.rotation = upper.rotation = pose[4] + kick * 0.12;
      backArm.rotation = pose[5] - kick * 0.85;
      frontArm.rotation = pose[6] - kick * (heroClass === 'ARCHER' ? 0.18 : 0.75);
      cape.top.rotation = pose[7];
      cape.bottom.rotation = pose[8];
      if (crest) crest.rotation = pose[9];
      rig.y = pose[10];
      if (moving || airborne) upper.y = 4;
      shadow.alpha = airborne ? 0 : 1;
      ring.alpha = (airborne ? 0.2 : 1) * (0.72 + Math.sin(time * 3) * 0.24);
    }
  };
}
