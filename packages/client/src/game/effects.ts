// petites etincelles quand le joueur bouge ou saute
import { Graphics } from 'pixi.js';

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

export function createSparks(color: number) {
  const sparks: Spark[] = [];
  const graphics = new Graphics();

  const add = (x: number, y: number, vx: number, vy: number, life: number) => {
    sparks.push({ x, y, vx, vy, life, maxLife: life });
  };

  return {
    graphics,
    // trainee derriere le joueur
    trail: (x: number, y: number) => {
      if (Math.random() > 0.4) {
        add(x + (Math.random() - 0.5) * 16, y, (Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5, 24);
      }
    },
    // gerbe au moment du saut
    burst: (x: number, y: number) => {
      for (let i = 0; i < 10; i++) {
        add(x + (Math.random() - 0.5) * 20, y, (Math.random() - 0.5) * 5, Math.random() * -3, 20);
      }
    },
    update: () => {
      graphics.clear();
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life--;
        const alpha = s.life / s.maxLife;
        graphics.circle(s.x, s.y, 3 * alpha);
        graphics.fill({ color, alpha });
        if (s.life <= 0) sparks.splice(i, 1);
      }
    }
  };
}
