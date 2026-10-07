// dessin des personnages (joueur local et autres joueurs)
import { Container, Graphics, Text, TextStyle } from 'pixi.js';

export interface HeroSprite {
  container: Container;
  label: Text;
  labelY: number;
}

// le joueur local est un peu plus grand que les autres
export function createHero(name: string, color: number, isLocal: boolean): HeroSprite {
  const size = isLocal ? 18 : 16;
  const labelY = isLocal ? -32 : -27;

  const aura = new Graphics();
  aura.circle(0, 0, isLocal ? 30 : 26);
  aura.fill({ color, alpha: isLocal ? 0.3 : 0.25 });
  if (isLocal) aura.stroke({ width: 2, color, alpha: 0.8 });

  const body = new Graphics();
  body.circle(0, 0, size);
  body.fill({ color: 0x0f172a });
  body.stroke({ width: 3, color: 0xfacc15 });
  body.roundRect(-size / 2 + 1, -size / 2 - 1, size - 2, size + 2, 4);
  body.fill({ color });

  const label = new Text({
    text: name,
    style: new TextStyle({
      fontFamily: 'Outfit, sans-serif',
      fontSize: isLocal ? 14 : 12,
      fontWeight: 'bold',
      fill: 0xffffff,
      dropShadow: { alpha: 0.9, blur: 4, color: 0x000000, distance: 1 }
    })
  });
  label.anchor.set(0.5, 1);
  label.position.set(0, labelY);

  const container = new Container();
  container.addChild(aura, body, label);
  return { container, label, labelY };
}

// decale les noms vers le haut quand des joueurs sont proches (sinon ils se chevauchent)
export function stackLabels(heroes: HeroSprite[]): void {
  const sorted = [...heroes].sort((a, b) => a.container.y - b.container.y);
  sorted.forEach((hero, i) => {
    let shift = 0;
    for (let j = 0; j < i; j++) {
      const other = sorted[j].container;
      const close = Math.abs(hero.container.x - other.x) < 120 && Math.abs(hero.container.y - other.y) < 40;
      if (close) shift++;
    }
    hero.label.position.y = hero.labelY - shift * 18;
  });
}

// "#facc15" -> 0xfacc15
export const hexColor = (color: string) => parseInt(color.replace('#', ''), 16);
