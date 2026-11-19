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
  face: (dx: number) => void;
  animate: (moving: boolean, airborne: boolean, time: number) => void;
  setHitFlash: (active: boolean) => void;
  pulseAttack: () => void;
}

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
  const bodyWrap = new Container();
  bodyWrap.addChild(above.view, side.view);
  const container = new Container();
  container.addChild(bodyWrap, label);
  let mode: ViewMode = 'top-down';
  let attackKick = 0;

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
      if (attackKick > 0) {
        attackKick = Math.max(0, attackKick - 0.14);
        const s = 1 + attackKick * 0.18;
        bodyWrap.scale.set(s);
      } else {
        bodyWrap.scale.set(1);
      }
    },
    setHitFlash: (active) => {
      bodyWrap.tint = active ? 0xffb4b4 : 0xffffff;
    },
    pulseAttack: () => {
      attackKick = 1;
    }
  };
  hero.setView('top-down');
  return hero;
}

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

export const hexColor = (color: string) => parseInt(color.replace('#', ''), 16);
