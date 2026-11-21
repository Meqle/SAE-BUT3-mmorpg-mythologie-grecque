// personnages : un hoplite (casque corinthien, cape, cimier et bouclier a la couleur du dieu choisi)
// le dessin de chaque vue est dans hero/side.ts (profil) et hero/above.ts (dessus)
import { Container, Text, TextStyle } from 'pixi.js';
import { ViewMode } from '@greek-myth/shared';
import { COLORS } from './scenes/palette';
import { createAboveHero } from './hero/above';
import { createSideHero } from './hero/side';

export interface HeroSprite {
  container: Container;
  label: Text;
  labelY: number;
  setView: (mode: ViewMode) => void;
  face: (dx: number) => void; // regarde a gauche (dx < 0) ou a droite (dx > 0)
  animate: (moving: boolean, airborne: boolean, time: number) => void; // pas, saut (time en secondes)
}

// nom au-dessus de la tete : lettres gravees claires avec contour bleu nuit et petite ombre
function createLabel(name: string, isLocal: boolean): Text {
  const label = new Text({
    text: name,
    resolution: 3,
    style: new TextStyle({
      fontFamily: 'Cinzel, serif',
      fontSize: isLocal ? 11 : 10,
      fontWeight: '700',
      letterSpacing: 0.4,
      fill: isLocal ? 0xffe7a3 : COLORS.marbleLit,
      stroke: { color: COLORS.ink, width: 3, join: 'round' },
      dropShadow: { color: COLORS.shadow, alpha: 0.45, blur: 1.5, distance: 1.2, angle: Math.PI / 3 }
    })
  });
  label.anchor.set(0.5, 1);
  return label;
}

export function createHero(name: string, color: number, isLocal: boolean): HeroSprite {
  const above = createAboveHero(color, isLocal);
  const side = createSideHero(color, isLocal);
  const label = createLabel(name, isLocal);
  const container = new Container();
  container.addChild(above.view, side.view, label);
  let mode: ViewMode = 'top-down';

  const hero: HeroSprite = {
    container,
    label,
    labelY: 0,
    setView: (m) => {
      mode = m;
      above.view.visible = m === 'top-down';
      side.view.visible = m === 'side-view';
      hero.labelY = m === 'top-down' ? -20 : -33;
      label.position.y = hero.labelY;
    },
    face: (dx) => {
      if (Math.abs(dx) < 0.5) return;
      side.face(Math.sign(dx));
      above.face(Math.sign(dx));
    },
    animate: (moving, airborne, time) => {
      if (mode === 'top-down') above.animate(moving, time);
      else side.animate(moving, airborne, time);
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
    hero.label.position.y = hero.labelY - shift * 14;
  });
}

// "#facc15" -> 0xfacc15
export const hexColor = (color: string) => parseInt(color.replace('#', ''), 16);
