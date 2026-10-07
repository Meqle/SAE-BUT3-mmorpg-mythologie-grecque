// dessin des personnages : un guerrier en figure noire, avec la couleur du dieu
// sur le cimier et le bouclier ; un dessin pour chaque vue
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

// vu de dessus : epaules, casque avec cimier, bouclier rond
function drawFromAbove(color: number, isLocal: boolean): Graphics {
  const g = new Graphics();
  g.ellipse(3, 5, 15, 11);
  g.fill({ color: COLORS.shadow, alpha: 0.25 });
  if (isLocal) {
    g.circle(0, 0, 19);
    g.stroke({ width: 2, color: COLORS.cream, alpha: 0.9 });
  }
  g.ellipse(0, 0, 13, 9);
  g.circle(0, 0, 8);
  g.fill({ color: COLORS.glaze });
  g.roundRect(-2, -9, 4, 18, 2); // cimier
  g.fill({ color });
  g.circle(-12, 3, 6); // bouclier
  g.fill({ color });
  g.stroke({ width: 2, color: COLORS.glaze });
  return g;
}

// vu de profil (tourne vers la droite) : les pieds sont en bas de la hitbox (y = 16)
function drawFromSide(color: number, isLocal: boolean): Graphics {
  const g = new Graphics();
  g.ellipse(0, 16, 12, 3);
  g.fill({ color: COLORS.shadow, alpha: 0.3 });
  if (isLocal) {
    g.ellipse(0, 16, 15, 4);
    g.stroke({ width: 2, color: COLORS.cream, alpha: 0.9 });
  }
  g.rect(-5, 5, 4, 11); // jambes
  g.rect(1, 5, 4, 11);
  g.poly([-6, -6, 6, -6, 5, 7, -5, 7]); // corps
  g.circle(1, -11, 5); // tete
  g.fill({ color: COLORS.glaze });
  g.moveTo(9, -18).lineTo(9, 16); // lance
  g.stroke({ width: 2, color: COLORS.glaze });
  g.poly([-6, -13, -3, -20, 5, -20, 7, -15, 1, -15]); // cimier
  g.fill({ color });
  g.circle(4, 0, 7); // bouclier
  g.fill({ color });
  g.stroke({ width: 2, color: COLORS.glaze });
  g.circle(4, 0, 2);
  g.fill({ color: COLORS.cream });
  return g;
}

// le joueur local a un anneau creme a ses pieds
export function createHero(name: string, color: number, isLocal: boolean): HeroSprite {
  const above = drawFromAbove(color, isLocal);
  const side = drawFromSide(color, isLocal);

  const label = new Text({
    text: name,
    style: new TextStyle({
      fontFamily: 'Cinzel, serif',
      fontSize: isLocal ? 14 : 12,
      fontWeight: '700',
      fill: COLORS.cream,
      stroke: { color: COLORS.glaze, width: 4 }
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
