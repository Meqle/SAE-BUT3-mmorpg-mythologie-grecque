// la mer Egee autour de l'ile : degrade de profondeur, ecume, reflets du soleil, un petit bateau
import { Container, FillGradient, Graphics } from 'pixi.js';
import { COLORS, mix } from '../palette';
import { H, islandOutline, random, W } from './util';

const LAGOON = 0x48b8c8; // eau turquoise peu profonde
const REEF = 0x7fd3cf; // eau tres claire sur le sable

// zone dessinee : de -700 a +700 autour de la carte
const X0 = -720;
const Y0 = -720;
const SW = W + 1440;
const SH = H + 1440;

export interface Sea {
  view: Container;
  update: (time: number) => void;
}

function drawWater(g: Graphics): void {
  // eau profonde au large, plus claire pres de l'ile
  const deep = new FillGradient({
    type: 'radial',
    center: { x: 0.5, y: 0.5 },
    innerRadius: 0.18,
    outerCenter: { x: 0.5, y: 0.5 },
    outerRadius: 0.62,
    colorStops: [
      { offset: 0, color: COLORS.sea },
      { offset: 0.5, color: mix(COLORS.sea, COLORS.seaDeep, 0.6) },
      { offset: 1, color: COLORS.seaDeep }
    ],
    textureSpace: 'local'
  });
  g.rect(X0, Y0, SW, SH).fill(deep);

  // marches de turquoise de plus en plus clair vers le rivage
  const bands: [number, number, number][] = [
    [150, COLORS.seaLight, 0.25],
    [105, COLORS.seaLight, 0.35],
    [70, LAGOON, 0.45],
    [42, LAGOON, 0.6],
    [20, REEF, 0.55],
    [8, REEF, 0.6]
  ];
  for (const [extra, color, alpha] of bands) g.poly(islandOutline(extra)).fill({ color, alpha });

  // petites vagues au large (traits clairs tres discrets)
  const rand = random(7);
  for (let i = 0; i < 260; i++) {
    const x = X0 + rand() * SW;
    const y = Y0 + rand() * SH;
    if (x > -150 && x < W + 150 && y > -150 && y < H + 150) continue;
    const len = 10 + rand() * 18;
    g.moveTo(x, y).quadraticCurveTo(x + len / 2, y - 3, x + len, y);
  }
  g.stroke({ width: 1.5, color: COLORS.seaLight, alpha: 0.35 });
}

// ligne d'ecume qui suit la cote
function drawFoam(extra: number, width: number, alpha: number): Graphics {
  const g = new Graphics();
  g.poly(islandOutline(extra)).stroke({ width, color: COLORS.foam, alpha, join: 'round' });
  g.pivot.set(W / 2, H / 2);
  g.position.set(W / 2, H / 2);
  return g;
}

// trireme vue du dessus : coque, rames, voile carree
function drawBoat(): Container {
  const boat = new Container();
  const g = new Graphics();
  // sillage
  g.poly([-34, -4, -120, -16, -120, 16, -34, 4]).fill({ color: COLORS.foam, alpha: 0.18 });
  g.poly([-34, -2, -80, -7, -80, 7, -34, 2]).fill({ color: COLORS.foam, alpha: 0.25 });
  // ombre de la coque sur l'eau
  g.poly([-34, -6, 26, -8, 44, 0, 26, 8, -34, 6]).fill({ color: COLORS.shadow, alpha: 0.25 });
  boat.addChild(g);
  // rames (animees)
  const oars = new Graphics();
  for (let i = 0; i < 7; i++) {
    const x = -22 + i * 6;
    oars.moveTo(x, -6).lineTo(x - 4, -17);
    oars.moveTo(x, 6).lineTo(x - 4, 17);
  }
  oars.stroke({ width: 1.2, color: 0x6b4a2e });
  boat.addChild(oars);
  const hull = new Graphics();
  hull.poly([-36, -7, 22, -8, 40, 0, 22, 8, -36, 7, -40, 0]).fill({ color: 0x5a3a24 });
  hull.poly([-33, -5, 20, -6, 34, 0, 20, 6, -33, 5]).fill({ color: 0x8a6440 });
  hull.rect(-28, -4, 46, 8).fill({ color: 0x9d7650 });
  // oeil peint a la proue
  hull.circle(30, -3, 1.4).fill({ color: COLORS.foam });
  hull.circle(30, 3, 1.4).fill({ color: COLORS.foam });
  // voile vue d'en haut : vergue en travers + toile gonflee
  hull.poly([-4, -15, 4, -13, 6, 0, 4, 13, -4, 15, -1, 0]).fill({ color: 0xf3e6c8 });
  hull.poly([-1, -15, 4, -13, 6, 0, 4, 13, -1, 15, 1, 0]).fill({ color: 0xd9c6a0 });
  hull.moveTo(-3, -16).lineTo(-3, 16).stroke({ width: 1.5, color: 0x5a3a24 });
  boat.addChild(hull);
  return boat;
}

export function createSea(): Sea {
  const view = new Container();
  const water = new Graphics();
  drawWater(water);
  view.addChild(water);

  // reflets du soleil qui scintillent (plus nombreux en haut a gauche, cote soleil)
  const glints: Graphics[] = [];
  const rand = random(21);
  while (glints.length < 90) {
    const x = X0 + 40 + rand() * (SW - 80);
    const y = Y0 + 40 + rand() * (SH - 80);
    if (x > -110 && x < W + 110 && y > -110 && y < H + 110) continue;
    const glint = new Graphics();
    const size = 2 + rand() * 4;
    glint.poly([-size, 0, 0, -0.8, size, 0, 0, 0.8]).fill({ color: 0xffffff });
    glint.position.set(x, y);
    glint.alpha = 0;
    view.addChild(glint);
    glints.push(glint);
  }

  // ecume : deux lignes qui respirent avec la houle
  const foamOut = drawFoam(10, 3, 0.35);
  const foam = drawFoam(2, 4, 0.75);
  view.addChild(foamOut, foam);

  const boat = drawBoat();
  view.addChild(boat);
  const oars = boat.children[1];

  const update = (time: number) => {
    // la houle pousse l'ecume vers le large puis la ramene
    const swell = Math.sin(time * 0.9);
    foam.scale.set(1 + 0.004 * swell);
    foam.alpha = 0.8 + 0.2 * swell;
    foamOut.scale.set(1.006 + 0.006 * Math.sin(time * 0.9 - 1.2));
    foamOut.alpha = 0.5 + 0.4 * Math.sin(time * 0.9 - 1.2);
    glints.forEach((glint, i) => {
      const s = Math.sin(time * (1.3 + (i % 5) * 0.35) + i * 2.1);
      glint.alpha = Math.max(0, s) ** 3 * 0.85;
    });
    // le bateau fait lentement le tour de l'ile (visible sur les ecrans tres larges)
    const a = time * 0.03;
    boat.position.set(W / 2 + Math.cos(a) * 780, H / 2 + Math.sin(a) * 560);
    boat.rotation = Math.atan2(Math.cos(a) * 560, -Math.sin(a) * 780);
    oars.rotation = Math.sin(time * 3) * 0.06;
  };
  return { view, update };
}
