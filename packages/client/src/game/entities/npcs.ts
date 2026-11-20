import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { NPCS, NpcDef } from '../data/story';
import type { NpcQuestBadge } from '../state/gameState';
import { BRONZE, BRONZE_LIT, BRONZE_SHADE, LEATHER, LINE, LINEN, LINEN_SHADE, SKIN, WOOD, darker, dome, lighter, shaded } from '../hero/look';
import { COLORS } from '../scenes/palette';

export interface NpcSprite {
  npcId: string;
  x: number;
  y: number;
  container: Container;
  setBadge: (badge: NpcQuestBadge) => void;
  update: (time: number, nearPlayer: boolean) => void;
}

function makeNameLabel(name: string, role: string): Container {
  const wrap = new Container();
  const title = new Text({
    text: name,
    resolution: 3,
    style: new TextStyle({
      fontFamily: 'Cinzel, serif',
      fontSize: 10.5,
      fontWeight: '700',
      fill: COLORS.marbleLit,
      stroke: { color: COLORS.ink, width: 3, join: 'round' }
    })
  });
  title.anchor.set(0.5, 1);
  title.y = -21;

  const sub = new Text({
    text: role,
    resolution: 3,
    style: new TextStyle({
      fontFamily: 'Outfit, sans-serif',
      fontSize: 8,
      fontWeight: '600',
      fill: COLORS.gold,
      stroke: { color: COLORS.ink, width: 2.4, join: 'round' }
    })
  });
  sub.anchor.set(0.5, 1);
  sub.y = -11;

  wrap.addChild(title, sub);
  return wrap;
}

function drawNpcBody(look: NpcDef['look']): Container {
  const body = new Container();
  const g = new Graphics();

  if (look === 'prometheus') {
    g.circle(0, 0, 22).fill({ color: COLORS.gold, alpha: 0.16 });
    g.circle(0, 0, 14).fill({ color: 0xf97316, alpha: 0.25 });
    g.ellipse(0, 0, 9, 11).fill(shaded(0xffe7a3, 0xd97706)).stroke({ ...LINE, color: 0x9a3412 });
    g.circle(0, -1, 5.5).fill(dome(0xfffbeb, COLORS.gold, 0xd97706)).stroke({ ...LINE, color: 0x9a3412 });
    g.circle(-11, 5, 3).stroke({ width: 1.5, color: BRONZE_SHADE });
    g.circle(11, 5, 3).stroke({ width: 1.5, color: BRONZE_SHADE });
    body.addChild(g);
    return body;
  }

  const cloakColor =
    look === 'messenger' ? COLORS.tile :
    look === 'smith' ? LEATHER :
    look === 'healer' ? COLORS.olive :
    look === 'merchant' ? COLORS.bronze :
    look === 'citizen' ? 0x64748b :
    COLORS.seaDeep;

  g.ellipse(-1, 2, 10.5, 9).fill(shaded(lighter(cloakColor, 0.2), darker(cloakColor, 0.35))).stroke(LINE);
  g.ellipse(0, 0, 8.5, 6.2).fill(shaded(look === 'smith' ? BRONZE : LINEN, look === 'smith' ? BRONZE_SHADE : LINEN_SHADE)).stroke(LINE);

  if (look === 'messenger') {
    g.moveTo(8, 3).lineTo(13, -4).stroke({ width: 2.2, color: WOOD, cap: 'round' });
    g.circle(13.5, -5.5, 4.5).fill({ color: 0xf97316, alpha: 0.65 });
    g.circle(13.5, -5.5, 2.3).fill({ color: 0xfff3c4 });
  } else if (look === 'smith') {
    g.moveTo(7, 2).lineTo(13, -3).stroke({ width: 2, color: WOOD, cap: 'round' });
    g.rect(10.5, -6.5, 5.5, 3.6).fill(shaded(BRONZE_LIT, BRONZE_SHADE)).stroke({ ...LINE, width: 0.7 });
  } else if (look === 'healer') {
    g.ellipse(9.5, 2, 3.2, 4.2).fill(shaded(COLORS.gold, BRONZE_SHADE)).stroke({ ...LINE, width: 0.7 });
  } else if (look === 'merchant') {
    g.circle(9.5, 2, 3.8).fill(COLORS.gold).stroke({ ...LINE, width: 0.7 });
    g.circle(6, 5, 2.5).fill(COLORS.tile).stroke({ ...LINE, width: 0.6 });
  } else if (look === 'guard') {
    g.moveTo(9, -11).lineTo(9, 10).stroke({ width: 2, color: WOOD, cap: 'round' });
    g.poly([9, -15, 11.2, -10.5, 6.8, -10.5]).fill(BRONZE_LIT).stroke({ ...LINE, width: 0.7 });
    g.circle(-9, 1, 6).fill(shaded(BRONZE_LIT, BRONZE)).stroke(LINE);
  }

  if (look === 'guard') {
    g.circle(0, 0, 5.2).fill(dome(BRONZE_LIT, BRONZE, BRONZE_SHADE)).stroke(LINE);
    g.ellipse(0, -1, 1.8, 6.5).fill(COLORS.tile).stroke({ ...LINE, width: 0.6 });
  } else {
    g.circle(0, 0, 5.2).fill(dome(0xf3c79e, SKIN, 0xa8714c)).stroke(LINE);
    const hair = look === 'messenger' ? 0x4b5563 : look === 'citizen' ? 0xd1d5db : 0x261c17;
    g.arc(0, 0, 5.2, Math.PI * 0.9, Math.PI * 2.1).fill(hair);
    if (look === 'healer') g.circle(0, 0, 5.4).stroke({ width: 1.3, color: COLORS.olive });
    if (look === 'merchant') g.circle(0, 0, 5.4).stroke({ width: 1.3, color: COLORS.gold });
  }

  body.addChild(g);
  return body;
}

export function createNpcSprite(npcId: string, x: number, y: number): NpcSprite {
  const def = NPCS[npcId];
  const container = new Container();
  container.position.set(x, y);

  const shadow = new Graphics().ellipse(3, 4, 12, 9).fill({ color: COLORS.shadow, alpha: 0.24 });
  const talkRing = new Graphics();
  talkRing.circle(0, 0, 20).stroke({ width: 1.6, color: COLORS.gold, alpha: 0.7 });
  talkRing.visible = false;

  const body = drawNpcBody(def.look);
  const label = makeNameLabel(def.name, def.role);

  const badgeWrap = new Container();
  badgeWrap.y = -42;
  const badgeBg = new Graphics();
  const badgeText = new Text({
    text: '!',
    resolution: 3,
    style: new TextStyle({
      fontFamily: 'Cinzel, serif',
      fontSize: 15,
      fontWeight: '900',
      fill: COLORS.gold,
      stroke: { color: COLORS.ink, width: 3.5, join: 'round' }
    })
  });
  badgeText.anchor.set(0.5, 0.5);
  badgeWrap.addChild(badgeBg, badgeText);
  badgeWrap.visible = false;

  container.addChild(shadow, talkRing, body, label, badgeWrap);

  return {
    npcId,
    x,
    y,
    container,
    setBadge: (badge) => {
      if (!badge) {
        badgeWrap.visible = false;
        return;
      }
      badgeWrap.visible = true;
      badgeBg.clear();
      if (badge === 'turnin') {
        badgeText.text = '?';
        badgeText.style.fill = COLORS.gold;
        badgeBg.circle(0, 0, 10).fill({ color: COLORS.ink, alpha: 0.85 }).stroke({ width: 1.5, color: COLORS.gold });
      } else if (badge === 'main_available') {
        badgeText.text = '!';
        badgeText.style.fill = COLORS.gold;
        badgeBg.circle(0, 0, 10).fill({ color: COLORS.ink, alpha: 0.85 }).stroke({ width: 1.5, color: COLORS.gold });
      } else if (badge === 'side_available') {
        badgeText.text = '!';
        badgeText.style.fill = COLORS.sky;
        badgeBg.circle(0, 0, 10).fill({ color: COLORS.ink, alpha: 0.85 }).stroke({ width: 1.5, color: COLORS.sky });
      } else {
        badgeText.text = '?';
        badgeText.style.fill = COLORS.marbleShade;
        badgeBg.circle(0, 0, 9).fill({ color: COLORS.ink, alpha: 0.65 }).stroke({ width: 1, color: COLORS.marbleShade });
      }
    },
    update: (time, nearPlayer) => {
      const breath = Math.sin(time * 2.6 + x * 0.05);
      body.scale.set(1 + breath * 0.025);
      if (def.look === 'prometheus') {
        body.alpha = 0.82 + Math.sin(time * 4.5) * 0.14;
        body.y = Math.sin(time * 3) * 3;
      }
      badgeWrap.y = -43 + Math.sin(time * 4.2) * 3.5;
      talkRing.visible = nearPlayer;
      if (nearPlayer) talkRing.scale.set(1 + Math.sin(time * 5) * 0.08);
    }
  };
}
