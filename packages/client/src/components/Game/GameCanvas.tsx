// ecran de jeu : assemble PixiJS, le clavier, le reseau et le HUD
import { useEffect, useRef, useState } from 'react';
import { Application, Container, Graphics } from 'pixi.js';
import { GodAffinity, GODS_LORE, GROUND_Y, ServerInfo, stepMovement, ViewMode } from '@greek-myth/shared';
import { createKeyboard } from '../../game/input';
import { connect } from '../../game/network';
import { drawWorld } from '../../game/world';
import { createHero, hexColor, HeroSprite, stackLabels } from '../../game/players';
import { createSparks } from '../../game/effects';
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
  const [coords, setCoords] = useState({ x: 400, y: 300 });
  const [loadError, setLoadError] = useState<string | null>(null);

  // le ticker PixiJS lit la vue via une ref (pas de re-rendu React a chaque image)
  const viewModeRef = useRef<ViewMode>('top-down');
  viewModeRef.current = viewMode;
  const connectionRef = useRef<ReturnType<typeof connect> | null>(null);

  const godLore = GODS_LORE[god];
  const toggleView = () => setViewMode((v) => (v === 'top-down' ? 'side-view' : 'top-down'));

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
    const keyboard = createKeyboard(toggleView);

    const start = async () => {
      app = new Application();
      await app.init({
        resizeTo: window,
        backgroundColor: 0x0b0f19,
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

      // calques : fond, decor, personnages, effets
      const world = new Container();
      const background = new Graphics();
      const decor = new Graphics();
      const entities = new Container();
      const color = hexColor(godLore.color);
      const sparks = createSparks(color);
      world.addChild(background, decor, entities, sparks.graphics);
      app.stage.addChild(world);

      const hero = createHero(`${heroName} (${godLore.name})`, color, true);
      entities.addChild(hero.container);
      const others = new Map<string, HeroSprite>();

      // position predite localement, corrigee ensuite par le serveur
      const player = { x: 400, y: 300, vx: 0, vy: 0, isGrounded: false };

      // ajoute / deplace / retire les autres joueurs selon le dernier etat serveur
      const syncOthers = () => {
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

      drawWorld(background, decor, viewModeRef.current, color);
      let lastMode = viewModeRef.current;
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

        // 2. changement de vue : on redessine le decor
        const mode = viewModeRef.current;
        if (mode !== lastMode) {
          lastMode = mode;
          drawWorld(background, decor, mode, color);
          if (mode === 'side-view') {
            player.y = GROUND_Y;
            player.vy = 0;
          }
        }

        // 3. prediction locale (memes regles que le serveur)
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
        }, mode, dt);
        if (mode === 'side-view' && jumpStarted && wasGrounded) sparks.burst(player.x, player.y + 12);
        previousJump = jump;

        // 4. correction douce vers la position du serveur
        const myId = connection.getPlayerId();
        const me = myId ? connection.players.get(myId) : undefined;
        if (me) {
          const k = 1 - Math.pow(0.65, dt * 60);
          player.x += (me.position.x - player.x) * k;
          player.y += (me.position.y - player.y) * k;
          player.vx += (me.position.vx - player.vx) * k;
          player.vy += (me.position.vy - player.vy) * k;
        }

        // 5. affichage
        hero.container.position.set(player.x, player.y);
        syncOthers();
        if (Math.abs(player.vx) > 0.5 || Math.abs(player.vy) > 0.5) {
          sparks.trail(player.x, player.y + (mode === 'top-down' ? 14 : 18));
        }
        sparks.update();

        // 6. camera qui suit le joueur
        const camX = window.innerWidth / 2 - player.x;
        const camY = window.innerHeight / 2 - player.y + (mode === 'top-down' ? 0 : 60);
        world.x += (camX - world.x) * 0.1;
        world.y += (camY - world.y) * 0.1;

        // 7. FPS et coordonnees pour le HUD (2 fois par seconde)
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

  // previent le serveur quand on change de vue
  useEffect(() => {
    connectionRef.current?.sendViewMode(viewMode);
  }, [viewMode]);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#0b0f19' }}>
      <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />
      <Hud
        server={server}
        god={godLore}
        status={status}
        viewMode={viewMode}
        coords={coords}
        fps={fps}
        loadError={loadError}
        onToggleView={toggleView}
        onLeave={onLeave}
      />
    </div>
  );
}
