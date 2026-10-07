// ecran de jeu : assemble PixiJS, le clavier, le reseau et le HUD
import { useEffect, useRef, useState } from 'react';
import { Application, Container, Graphics } from 'pixi.js';
import { GodAffinity, GODS_LORE, MAPS, portalAt, ServerInfo, SPAWN_POINT, stepMovement, ViewMode } from '@greek-myth/shared';
import { cameraOffset } from '../../game/camera';
import { createDust } from '../../game/effects';
import { createKeyboard } from '../../game/input';
import { connect } from '../../game/network';
import { createHero, hexColor, HeroSprite, stackLabels } from '../../game/players';
import { COLORS, css } from '../../game/scenes/palette';
import { drawWorld } from '../../game/scenes';
import { Hud } from './Hud';

interface GameCanvasProps {
  server: ServerInfo;
  god: GodAffinity;
  heroName: string;
  onLeave: () => void;
}

const INPUT_INTERVAL_MS = 50; // envoi des touches 20 fois par seconde

export function GameCanvas({ server, god, heroName, onLeave }: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('top-down');
  const [status, setStatus] = useState('Connexion…');
  const [fps, setFps] = useState(60);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [loadError, setLoadError] = useState<string | null>(null);

  // le ticker PixiJS lit la vue via une ref (pas de re-rendu React a chaque image)
  const viewModeRef = useRef<ViewMode>('top-down');
  viewModeRef.current = viewMode;
  const connectionRef = useRef<ReturnType<typeof connect> | null>(null);

  const godLore = GODS_LORE[god];

  useEffect(() => {
    let app: Application | null = null;
    let cleanedUp = false;

    const connection = connect({
      roomId: server.id,
      username: heroName,
      god,
      getViewMode: () => viewModeRef.current,
      onStatus: (s) => { if (!cleanedUp) setStatus(s); }
    });
    connectionRef.current = connection;
    const keyboard = createKeyboard();

    const start = async () => {
      app = new Application();
      await app.init({
        resizeTo: window,
        backgroundColor: COLORS.glaze,
        antialias: true,
        preference: 'webgl',
        autoDensity: true,
        resolution: window.devicePixelRatio || 1
      });
      if (cleanedUp || !containerRef.current) {
        app.destroy(true, { children: true });
        return;
      }
      app.canvas.style.display = 'block';
      containerRef.current.appendChild(app.canvas);

      // calques : fond, decor, lumiere des portes, personnages, poussiere
      const world = new Container();
      const background = new Graphics();
      const decor = new Graphics();
      const glow = new Graphics();
      const entities = new Container();
      const dust = createDust();
      world.addChild(background, decor, glow, entities, dust.graphics);
      app.stage.addChild(world);

      const hero = createHero(`${heroName} (${godLore.name})`, hexColor(godLore.color), true);
      entities.addChild(hero.container);
      const others = new Map<string, HeroSprite>();

      // position du joueur local : calculee ici (le serveur ne connait pas encore les murs)
      const player = { x: SPAWN_POINT.x, y: SPAWN_POINT.y, vx: 0, vy: 0, isGrounded: false };

      // ajoute / deplace / retire les autres joueurs selon le dernier etat serveur
      const syncOthers = (mode: ViewMode) => {
        const myId = connection.getPlayerId();
        for (const [id, state] of connection.players) {
          if (id === myId) continue;
          let other = others.get(id);
          if (!other) {
            const lore = GODS_LORE[state.god];
            other = createHero(`${state.username} (${lore.name})`, hexColor(lore.color), false);
            entities.addChild(other.container);
            others.set(id, other);
          }
          const c = other.container;
          other.setView(mode);
          other.face(state.position.x - c.x);
          c.position.set(c.x + (state.position.x - c.x) * 0.45, c.y + (state.position.y - c.y) * 0.45);
        }
        for (const [id, other] of others) {
          if (!connection.players.has(id)) {
            other.container.destroy({ children: true });
            others.delete(id);
          }
        }
        stackLabels([hero, ...others.values()]);
      };

      drawWorld(background, decor, glow, viewModeRef.current);
      let snapCamera = true; // true = la camera saute directement au joueur (debut, portail)
      let inputTimer = 0;
      let previousJump = false;
      let frames = 0;
      let lastFpsTime = performance.now();

      app.ticker.add((ticker) => {
        // 1. envoi des touches au serveur
        inputTimer += ticker.deltaMS;
        if (inputTimer >= INPUT_INTERVAL_MS) {
          inputTimer %= INPUT_INTERVAL_MS;
          connection.sendInput({
            up: keyboard.isUp(),
            down: keyboard.isDown(),
            left: keyboard.isLeft(),
            right: keyboard.isRight(),
            jump: keyboard.isJump()
          });
        }

        // 2. deplacement local avec collisions (shared/physics)
        const dt = Math.min(ticker.deltaMS / 1000, 0.05);
        const jump = keyboard.isJump();
        const jumpStarted = jump && !previousJump;
        const wasGrounded = player.isGrounded;
        stepMovement(player, {
          up: keyboard.isUp(),
          down: keyboard.isDown(),
          left: keyboard.isLeft(),
          right: keyboard.isRight(),
          jumpStarted
        }, viewModeRef.current, dt);
        const jumped = jumpStarted && wasGrounded;
        const landed = !wasGrounded && player.isGrounded;
        if (viewModeRef.current === 'side-view' && (jumped || landed)) dust.burst(player.x, player.y + 16);
        previousJump = jump;

        // 3. porte : on change de vue et on repart de l'autre cote
        const portal = portalAt(player, viewModeRef.current);
        if (portal) {
          viewModeRef.current = portal.to;
          setViewMode(portal.to);
          Object.assign(player, { x: portal.spawnX, y: portal.spawnY, vx: 0, vy: 0 });
          drawWorld(background, decor, glow, portal.to);
          dust.clear();
          snapCamera = true;
        }
        const mode = viewModeRef.current;

        // 4. affichage
        hero.setView(mode);
        hero.face(player.vx);
        hero.container.position.set(player.x, player.y);
        syncOthers(mode);
        const moving = Math.abs(player.vx) + Math.abs(player.vy) > 0.5;
        const walking = mode === 'top-down' ? moving : moving && player.isGrounded;
        if (walking) dust.trail(player.x, mode === 'top-down' ? player.y + 8 : player.y + 16);
        dust.update();
        glow.alpha = 0.6 + 0.3 * Math.sin(performance.now() / 400); // les portes respirent

        // 5. camera qui suit le joueur sans sortir de la carte
        const map = MAPS[mode];
        const camX = cameraOffset(player.x, map.width, window.innerWidth);
        const camY = cameraOffset(player.y, map.height, window.innerHeight);
        world.x = snapCamera ? camX : world.x + (camX - world.x) * 0.1;
        world.y = snapCamera ? camY : world.y + (camY - world.y) * 0.1;
        snapCamera = false;

        // 6. FPS et coordonnees pour le HUD (2 fois par seconde)
        frames++;
        const now = performance.now();
        if (now - lastFpsTime >= 500) {
          setFps(Math.round((frames * 1000) / (now - lastFpsTime)));
          setCoords({ x: Math.round(player.x), y: Math.round(player.y) });
          frames = 0;
          lastFpsTime = now;
        }
      });
    };

    start().catch((err) => {
      console.error('Erreur initialisation PixiJS:', err);
      setLoadError(err instanceof Error ? err.message : String(err));
    });

    return () => {
      cleanedUp = true;
      connection.close();
      connectionRef.current = null;
      keyboard.dispose();
      try {
        app?.destroy(true, { children: true });
      } catch {
        // PixiJS pas encore initialise : rien a detruire
      }
    };
  }, [server.id, god, heroName]);

  // previent le serveur quand la vue change (porte)
  useEffect(() => {
    connectionRef.current?.sendViewMode(viewMode);
  }, [viewMode]);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: css(COLORS.glaze) }}>
      <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />
      <Hud
        server={server}
        god={godLore}
        status={status}
        viewMode={viewMode}
        coords={coords}
        fps={fps}
        loadError={loadError}
        onLeave={onLeave}
      />
    </div>
  );
}
