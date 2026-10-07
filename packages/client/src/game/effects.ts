// petits nuages de poussiere quand le joueur marche, saute ou atterrit
import { Graphics } from 'pixi.js';
import { COLORS } from './scenes/palette';

interface Puff {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

export function createDust() {
  const puffs: Puff[] = [];
  const graphics = new Graphics();

  const add = (x: number, y: number, vx: number, vy: number, life: number) => {
    puffs.push({ x, y, vx, vy, life, maxLife: life });
  };

  return {
    graphics,
    // poussiere derriere les pieds
    trail: (x: number, y: number) => {
      if (Math.random() > 0.75) add(x + (Math.random() - 0.5) * 12, y, (Math.random() - 0.5) * 0.6, -0.3, 22);
    },
    // nuage sur les cotes (saut, atterrissage)
    burst: (x: number, y: number) => {
      for (let i = 0; i < 8; i++) {
        const dir = i % 2 === 0 ? 1 : -1;
        add(x + dir * 6, y, dir * (1 + Math.random() * 1.5), -Math.random() * 0.8, 20);
      }
    },
    // efface tout (changement de vue)
    clear: () => {
      puffs.length = 0;
    },
    update: () => {
      graphics.clear();
      for (let i = puffs.length - 1; i >= 0; i--) {
        const p = puffs[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        const t = p.life / p.maxLife;
        graphics.circle(p.x, p.y, 2 + (1 - t) * 4);
        graphics.fill({ color: COLORS.marble, alpha: t * 0.6 });
        if (p.life <= 0) puffs.splice(i, 1);
      }
    }
  };
}
