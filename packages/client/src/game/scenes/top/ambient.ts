// premier plan de la vue du dessus : ombres de nuages qui glissent, mouettes, lumiere chaude du soir
import { Container, FillGradient, Graphics } from 'pixi.js';
import { COLORS } from '../palette';
import { H, random, W } from './util';

export interface Ambient {
  view: Container;
  update: (time: number) => void;
}

// tache douce (degrade radial vers le transparent)
function soft(radius: number, color: number, alpha: number): Graphics {
  const rgb = `${color >> 16},${(color >> 8) & 255},${color & 255}`;
  const fill = new FillGradient({
    type: 'radial',
    center: { x: 0.5, y: 0.5 },
    innerRadius: 0,
    outerCenter: { x: 0.5, y: 0.5 },
    outerRadius: 0.5,
    colorStops: [
      { offset: 0, color: `rgba(${rgb},${alpha})` },
      { offset: 0.6, color: `rgba(${rgb},${alpha * 0.6})` },
      { offset: 1, color: `rgba(${rgb},0)` }
    ],
    textureSpace: 'local'
  });
  return new Graphics().circle(0, 0, radius).fill(fill);
}

// mouette vue du dessus : corps blanc, ailes grises au bout noir ; son ombre plus bas sur le sol
function gull(): Container {
  const bird = new Container();
  const shadow = new Graphics();
  const wings = new Graphics();
  const body = new Graphics();
  for (const [g, color, a] of [[shadow, COLORS.shadow, 0.18], [wings, 0xdfe3e6, 1]] as [Graphics, number, number][]) {
    g.poly([0, -2, -6, -16, -3, -21, 3, -4]).fill({ color, alpha: a });
    g.poly([0, 2, -6, 16, -3, 21, 3, 4]).fill({ color, alpha: a });
  }
  wings.poly([-6, -16, -3, -21, -1.5, -18]).fill({ color: 0x2b2f36 });
  wings.poly([-6, 16, -3, 21, -1.5, 18]).fill({ color: 0x2b2f36 });
  shadow.ellipse(0, 0, 8, 2.5).fill({ color: COLORS.shadow, alpha: 0.18 });
  shadow.position.set(42, 26);
  body.ellipse(0, 0, 8, 2.6).fill({ color: 0xffffff });
  body.circle(6, 0, 2.2).fill({ color: 0xffffff });
  body.poly([8, -0.7, 11, 0, 8, 0.7]).fill({ color: COLORS.gold });
  body.poly([-8, -2, -11, 0, -8, 2]).fill({ color: 0xd5d9dc });
  bird.addChild(shadow, wings, body);
  return bird;
}

export function createAmbient(): Ambient {
  const view = new Container();

  // lumiere chaude du soleil couchant, plus forte en haut a gauche
  const sun = new Graphics();
  const warm = new FillGradient({
    type: 'linear',
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    colorStops: [
      { offset: 0, color: 'rgba(255,214,150,0.16)' },
      { offset: 0.5, color: 'rgba(255,214,150,0.04)' },
      { offset: 1, color: 'rgba(60,70,140,0.08)' }
    ],
    textureSpace: 'local'
  });
  sun.rect(-700, -700, W + 1400, H + 1400).fill(warm);
  view.addChild(sun);

  // ombres de nuages : grosses taches douces qui traversent lentement
  const rand = random(17);
  const clouds: Container[] = [];
  for (let i = 0; i < 5; i++) {
    const cloud = new Container();
    for (let k = 0; k < 5; k++) {
      const blob = soft(120 + rand() * 120, COLORS.shadow, 0.09);
      blob.position.set((rand() - 0.5) * 300, (rand() - 0.5) * 140);
      cloud.addChild(blob);
    }
    cloud.y = -300 + i * 260 + rand() * 80;
    view.addChild(cloud);
    clouds.push(cloud);
  }

  const gulls: Container[] = [];
  for (let i = 0; i < 3; i++) {
    const g = gull();
    view.addChild(g);
    gulls.push(g);
  }

  const update = (time: number) => {
    clouds.forEach((cloud, i) => {
      // de gauche a droite, puis on recommence de l'autre cote
      cloud.x = -900 + ((time * 9 + i * 640) % 2800);
    });
    gulls.forEach((g, i) => {
      // chaque mouette traverse en diagonale, avec une longue pause entre deux passages
      const t = (time * 45 + i * 1300) % 3900;
      const a = -0.35 + i * 0.3;
      g.position.set(-500 + t * Math.cos(a), 150 + i * 160 + t * Math.sin(a));
      g.rotation = a;
      const flap = Math.sin(time * (5 + i) + i);
      (g.children[1] as Graphics).scale.y = 0.55 + 0.45 * Math.abs(flap);
      (g.children[0] as Graphics).scale.y = 0.55 + 0.45 * Math.abs(flap);
    });
  };
  return { view, update };
}
