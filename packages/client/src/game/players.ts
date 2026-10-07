// dessin des personnages : un hoplite (casque de bronze, tunique et bouclier
// a la couleur du dieu choisi) ; un dessin pour chaque vue
import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { ViewMode } from '@greek-myth/shared';
import { COLORS } from './scenes/palette';

export interface HeroSprite {
  container: Container;
  label: Text;
  labelY: number;
  setView: (mode: ViewMode) => void;
  face: (dx: number) => void; // regarde a gauche (dx < 0) ou a droite (dx > 0)
}

const SKIN = 0xd9a67a;
const OUTLINE = { width: 1.5, color: COLORS.ink };

// vu de dessus : epaules, casque avec cimier, bouclier rond
function drawFromAbove(color: number, isLocal: boolean): Graphics {
  const g = new Graphics();
  g.ellipse(4, 6, 15, 11);
  g.fill({ color: COLORS.shadow, alpha: 0.2 });
  if (isLocal) {
    g.circle(0, 0, 19);
    g.stroke({ width: 2, color: COLORS.gold });
  }
  g.ellipse(0, 0, 13, 9); // epaules
  g.fill({ color });
  g.stroke(OUTLINE);
  g.circle(0, 0, 7.5); // casque
  g.fill({ color: COLORS.bronze });
  g.stroke(OUTLINE);
  g.roundRect(-2, -9, 4, 18, 2); // cimier
  g.fill({ color: COLORS.tile });
  g.circle(-12, 3, 6.5); // bouclier
  g.fill({ color });
  g.stroke({ width: 2, color: COLORS.bronze });
  return g;
}

// vu de profil (tourne vers la droite) : les pieds sont en bas de la hitbox (y = 16)
function drawFromSide(color: number, isLocal: boolean): Graphics {
  const g = new Graphics();
  g.ellipse(0, 16, 12, 3);
  g.fill({ color: COLORS.shadow, alpha: 0.25 });
  if (isLocal) {
    g.ellipse(0, 16, 15, 4);
    g.stroke({ width: 2, color: COLORS.gold });
  }
  g.moveTo(10, -20).lineTo(10, 16); // lance
  g.stroke({ width: 2, color: COLORS.ink });
  g.poly([10, -25, 12.5, -19, 7.5, -19]);
  g.fill({ color: COLORS.bronze });
  g.rect(-5, 6, 4, 10); // jambes
  g.rect(1, 6, 4, 10);
  g.fill({ color: SKIN });
  g.stroke(OUTLINE);
  g.poly([-6, -6, 6, -6, 7, 8, -7, 8]); // tunique
  g.fill({ color });
  g.stroke(OUTLINE);
  g.circle(1, -11, 5.5); // casque
  g.fill({ color: COLORS.bronze });
  g.stroke(OUTLINE);
  g.poly([-6, -13, -3, -20, 5, -20, 7, -15, 1, -15]); // cimier
  g.fill({ color: COLORS.tile });
  g.circle(4, 0, 7); // bouclier
  g.fill({ color });
  g.stroke({ width: 2, color: COLORS.bronze });
  g.circle(4, 0, 2);
  g.fill({ color: COLORS.bronze });
  return g;
}

// le joueur local a un anneau dore a ses pieds
export function createHero(name: string, color: number, isLocal: boolean): HeroSprite {
  const above = drawFromAbove(color, isLocal);
  const side = drawFromSide(color, isLocal);

  const label = new Text({
    text: name,
    style: new TextStyle({
      fontFamily: 'Cinzel, serif',
      fontSize: isLocal ? 14 : 12,
      fontWeight: '700',
      fill: COLORS.marble,
      stroke: { color: COLORS.ink, width: 4 }
    })
  });
  label.anchor.set(0.5, 1);

  const container = new Container();
  container.addChild(above, side, label);

  const hero: HeroSprite = {
    container,
    label,
    labelY: 0,
    setView: (mode) => {
      above.visible = mode === 'top-down';
      side.visible = mode === 'side-view';
      hero.labelY = mode === 'top-down' ? -22 : -24;
      label.position.y = hero.labelY;
    },
    face: (dx) => {
      if (dx > 0.5) side.scale.x = 1;
      if (dx < -0.5) side.scale.x = -1;
    }
  };
  hero.setView('top-down');
  return hero;
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
