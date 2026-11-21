// mer Egee : degrade turquoise, reflets du soleil qui scintillent, bateaux et mouettes
import { Container, Graphics } from 'pixi.js';
import { COLORS, mix } from '../palette';
import { band, LEFT, Part, rnd, WIDE } from './draw';
import { SUN_X } from './sky';

export const HORIZON = 322;
const SEA_DEPTH = 0.45;
const GLINT = 0xfff4d2;
const HULL = 0x6a4a36;
const SAIL = 0xf4e6c6;

function drawWater(g: Graphics): void {
  band(g, [
    [HORIZON, mix(COLORS.seaLight, COLORS.skyHorizon, 0.6)],
    [HORIZON + 10, mix(COLORS.seaLight, COLORS.sky, 0.3)],
    [HORIZON + 45, 0x3c95bd],
    [HORIZON + 120, COLORS.sea],
    [HORIZON + 220, COLORS.seaDeep],
    [700, COLORS.seaDeep]
  ]);
  g.rect(LEFT, HORIZON, WIDE, 1.5).fill({ color: 0xfff3dc, alpha: 0.7 });
  // vagues : traits fins, plus serres pres de l'horizon (perspective)
  for (let j = 0; j < 46; j++) {
    const y = HORIZON + 3 + Math.pow(j, 1.45) * 1.6;
    const len = 8 + j * 1.3;
    for (let x = LEFT + rnd(j) * 120; x < LEFT + WIDE; x += 60 + j * 4 + rnd(x + j) * 80) {
      const light = (x + j) % 3 < 1.5;
      g.rect(x, y, len * (0.5 + rnd(x) * 0.8), j < 10 ? 1 : 1.5).fill({ color: light ? COLORS.foam : COLORS.seaDeep, alpha: light ? 0.18 : 0.22 });
    }
  }
}

// trireme vue de cote, proue a droite
function drawBoat(g: Graphics, haze: number): void {
  const hull = mix(HULL, COLORS.far, haze);
  const sail = mix(SAIL, COLORS.skyHorizon, haze);
  const stripe = mix(COLORS.tile, COLORS.far, haze);
  for (let i = 0; i < 9; i++) g.moveTo(-22 + i * 5.5, 2).lineTo(-25 + i * 5.5, 9);
  g.stroke({ width: 1, color: hull, alpha: 0.8 });
  g.moveTo(-34, -8)
    .quadraticCurveTo(-30, -2, -24, 0)
    .lineTo(26, 0)
    .lineTo(34, 3)
    .lineTo(28, 4)
    .quadraticCurveTo(0, 6, -26, 4)
    .quadraticCurveTo(-34, 0, -36, -9)
    .fill({ color: hull });
  g.rect(-24, -2, 48, 1.5).fill({ color: stripe });
  g.rect(-1, -36, 2, 36).fill({ color: hull });
  g.moveTo(-14, -34).quadraticCurveTo(0, -30, 14, -34).lineTo(15, -10).quadraticCurveTo(0, -6, -13, -10).fill({ color: sail });
  g.moveTo(3, -32).lineTo(14, -34).lineTo(15, -10).lineTo(3, -7).fill({ color: mix(sail, COLORS.far, 0.35) });
  g.rect(-13.5, -24, 28, 3).fill({ color: stripe, alpha: 0.8 });
  // reflet dans l'eau
  g.rect(-24, 7, 40, 1.2).fill({ color: COLORS.seaDeep, alpha: 0.25 });
  g.rect(-10, 10, 20, 1.2).fill({ color: sail, alpha: 0.2 });
}

// mouette : deux ailes en arc
function drawGull(g: Graphics): void {
  g.moveTo(-7, 0).quadraticCurveTo(-4, -4, 0, 0).quadraticCurveTo(4, -4, 7, 0).stroke({ width: 1.6, color: 0x40506a, cap: 'round' });
}

// petits eclats de lumiere dans quelques groupes qui clignotent a tour de role
function glints(count: number, place: (i: number) => [number, number, number], alpha: number): Graphics[] {
  const groups = [new Graphics(), new Graphics(), new Graphics()];
  for (let i = 0; i < count; i++) {
    const [x, y, len] = place(i);
    groups[i % 3].rect(x, y, len, 1.4).fill({ color: GLINT, alpha });
  }
  return groups;
}

export function createSea(): Part[] {
  const sea = new Container();
  const water = new Graphics();
  drawWater(water);
  sea.addChild(water);

  // eclats partout sur la mer
  const sparkles = glints(220, (i) => {
    const d = rnd(i * 3);
    return [LEFT + rnd(i) * WIDE, HORIZON + 4 + d * d * 180, 2 + d * 8];
  }, 0.45);
  sea.addChild(...sparkles);

  const boats = [new Graphics(), new Graphics()];
  drawBoat(boats[0], 0.55);
  drawBoat(boats[1], 0.3);
  boats[0].scale.set(0.45);
  boats[1].scale.set(0.75);
  boats[0].y = HORIZON + 9;
  boats[1].y = HORIZON + 30;
  sea.addChild(...boats);

  // chemin de lumiere sous le soleil (fixe a l'ecran comme le soleil)
  const glare = new Container();
  const path = glints(160, (i) => {
    const d = Math.pow(rnd(i * 5), 1.3);
    const spread = 14 + d * 150;
    return [SUN_X + (rnd(i * 7) - 0.5) * spread * 2, HORIZON + 2 + d * 150, 3 + d * 16 * rnd(i)];
  }, 0.85);
  glare.addChild(...path);
  glare.blendMode = 'add';

  const birds = new Container();
  const gulls: Graphics[] = [];
  for (let i = 0; i < 5; i++) {
    const gull = new Graphics();
    drawGull(gull);
    gull.scale.set(0.7 + rnd(i) * 0.6);
    gulls.push(gull);
    birds.addChild(gull);
  }

  const twinkle = (groups: Graphics[], time: number, speed: number) =>
    groups.forEach((g, k) => (g.alpha = 0.25 + 0.75 * Math.max(0, Math.sin(time * speed + k * 2.1))));

  return [
    {
      layer: sea,
      depth: SEA_DEPTH,
      animate: (time) => {
        twinkle(sparkles, time, 1.7);
        boats[0].x = 200 + ((time * 2.2) % 1600);
        boats[1].x = 1500 - ((time * 3) % 1800);
        boats[1].scale.x = -0.75;
        boats[0].y = HORIZON + 9 + Math.sin(time * 1.3) * 0.4;
        boats[1].y = HORIZON + 30 + Math.sin(time * 1.1 + 1) * 0.7;
      }
    },
    {
      layer: glare,
      depth: 0,
      animate: (time, view) => {
        glare.y = -view.y * SEA_DEPTH * view.zoom;
        twinkle(path, time, 2.6);
      }
    },
    {
      layer: birds,
      depth: 0.5,
      animate: (time) => {
        gulls.forEach((gull, i) => {
          const t = time * (0.18 + rnd(i * 4) * 0.08) + i * 1.7;
          gull.x = 150 + i * 230 + Math.sin(t) * 120;
          gull.y = 150 + rnd(i * 2) * 80 + Math.sin(t * 2.1) * 18;
          gull.scale.y = (0.7 + rnd(i) * 0.6) * (0.55 + 0.45 * Math.sin(time * (5 + i) + i));
        });
      }
    }
  ];
}
