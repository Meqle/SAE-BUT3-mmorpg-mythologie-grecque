import React, { useEffect, useRef, useState } from 'react';
import { Application, Graphics, Container, Text, TextStyle } from 'pixi.js';
import { GodAffinity, GODS_LORE, ServerInfo, ViewMode } from '@greek-myth/shared';
import { ArrowLeft, Eye, Zap, Shield } from 'lucide-react';

interface GameCanvasProps {
  server: ServerInfo;
  selectedGod: GodAffinity;
  heroName: string;
  onLeave: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  server,
  selectedGod,
  heroName,
  onLeave
}) => {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('top-down');
  const [fps, setFps] = useState<number>(60);
  const [coords, setCoords] = useState<{ x: number; y: number }>({ x: 400, y: 300 });
  const [loadError, setLoadError] = useState<string | null>(null);

  const viewModeRef = useRef<ViewMode>('top-down');
  viewModeRef.current = viewMode;

  const godLore = GODS_LORE[selectedGod];

  useEffect(() => {
    if (!canvasContainerRef.current) return;

    let app: Application | null = null;
    let isCleanedUp = false;

    const player = {
      x: 400,
      y: 300,
      vx: 0,
      vy: 0,
      speed: 6,
      isGrounded: false,
      color: parseInt(godLore.color.replace('#', '0x'), 16)
    };

    const keys: Record<string, boolean> = {
      ArrowUp: false,
      ArrowDown: false,
      ArrowLeft: false,
      ArrowRight: false,
      KeyW: false,
      KeyS: false,
      KeyA: false,
      KeyD: false,
      Space: false
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (keys.hasOwnProperty(e.code)) keys[e.code] = true;
      if (e.code === 'KeyV') {
        setViewMode((prev) => (prev === 'top-down' ? 'side-view' : 'top-down'));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (keys.hasOwnProperty(e.code)) keys[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const initPixi = async () => {
      try {
        app = new Application();
        await app.init({
          resizeTo: window,
          backgroundColor: 0x0b0f19,
          antialias: true,
          preference: 'webgl',
          autoDensity: true,
          resolution: window.devicePixelRatio || 1
        });

        if (isCleanedUp || !canvasContainerRef.current) {
          app.destroy(true, { children: true });
          return;
        }

        const container = canvasContainerRef.current;
        container.innerHTML = '';

        app.canvas.style.position = 'absolute';
        app.canvas.style.top = '0';
        app.canvas.style.left = '0';
        app.canvas.style.width = '100%';
        app.canvas.style.height = '100%';
        app.canvas.style.display = 'block';
        container.appendChild(app.canvas);

        const worldContainer = new Container();
        const backgroundLayer = new Graphics();
        const decorLayer = new Graphics();
        const entityLayer = new Container();
        const fxLayer = new Container();

        worldContainer.addChild(backgroundLayer);
        worldContainer.addChild(decorLayer);
        worldContainer.addChild(entityLayer);
        worldContainer.addChild(fxLayer);
        app.stage.addChild(worldContainer);

        const playerContainer = new Container();
        const playerAura = new Graphics();
        const playerBody = new Graphics();

        const nameStyle = new TextStyle({
          fontFamily: 'Outfit, sans-serif',
          fontSize: 14,
          fontWeight: 'bold',
          fill: 0xffffff,
          dropShadow: {
            alpha: 0.9,
            blur: 4,
            color: 0x000000,
            distance: 1
          }
        });
        const nameTag = new Text({ text: `${heroName} (${godLore.name})`, style: nameStyle });
        nameTag.anchor.set(0.5, 1);
        nameTag.position.set(0, -32);

        playerContainer.addChild(playerAura);
        playerContainer.addChild(playerBody);
        playerContainer.addChild(nameTag);
        entityLayer.addChild(playerContainer);

        const sparks: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: number }[] = [];
        const sparkGraphics = new Graphics();
        fxLayer.addChild(sparkGraphics);

        const renderEnvironment = (mode: ViewMode) => {
          backgroundLayer.clear();
          decorLayer.clear();

          if (mode === 'top-down') {
            const tileSize = 64;
            const areaSize = 2400;

            for (let x = -areaSize / 2; x < areaSize / 2; x += tileSize) {
              for (let y = -areaSize / 2; y < areaSize / 2; y += tileSize) {
                const isEven = Math.floor((x + y) / tileSize) % 2 === 0;
                backgroundLayer.rect(x, y, tileSize, tileSize);
                backgroundLayer.fill({ color: isEven ? 0x1e293b : 0x151f30 });
                backgroundLayer.stroke({ width: 1, color: 0x334155, alpha: 0.5 });
              }
            }

            decorLayer.circle(400, 300, 180);
            decorLayer.fill({ color: 0x0f172a, alpha: 0.6 });
            decorLayer.stroke({ width: 4, color: 0xd4af37, alpha: 0.8 });

            decorLayer.circle(400, 300, 120);
            decorLayer.stroke({ width: 2, color: player.color, alpha: 0.9 });

            const pillars = [
              { x: 100, y: 100 }, { x: 700, y: 100 },
              { x: 100, y: 500 }, { x: 700, y: 500 },
              { x: 400, y: 50 },  { x: 400, y: 550 },
              { x: -100, y: 300 }, { x: 900, y: 300 }
            ];

            pillars.forEach(p => {
              decorLayer.circle(p.x, p.y + 10, 34);
              decorLayer.fill({ color: 0x000000, alpha: 0.45 });

              decorLayer.circle(p.x, p.y, 30);
              decorLayer.fill({ color: 0xca8a04 });

              decorLayer.circle(p.x, p.y, 24);
              decorLayer.fill({ color: 0xf1f5f9 });
              decorLayer.stroke({ width: 3, color: 0x854d0e });

              decorLayer.circle(p.x, p.y, 8);
              decorLayer.fill({ color: player.color });
            });

          } else {
            const groundY = 480;

            backgroundLayer.rect(-2000, -1000, 4000, 2000);
            backgroundLayer.fill({ color: 0x0b1120 });

            decorLayer.moveTo(-800, groundY);
            decorLayer.lineTo(-200, groundY - 260);
            decorLayer.lineTo(200, groundY - 180);
            decorLayer.lineTo(600, groundY - 320);
            decorLayer.lineTo(1200, groundY - 140);
            decorLayer.lineTo(1800, groundY);
            decorLayer.fill({ color: 0x1e293b, alpha: 0.7 });

            decorLayer.rect(-1500, groundY, 3000, 400);
            decorLayer.fill({ color: 0x1e293b });
            decorLayer.stroke({ width: 4, color: 0xd4af37 });

            [-300, 100, 400, 700, 1100].forEach((colX) => {
              decorLayer.rect(colX, groundY - 280, 40, 280);
              decorLayer.fill({ color: 0x334155 });
              decorLayer.stroke({ width: 2, color: 0x64748b });

              decorLayer.rect(colX - 8, groundY - 295, 56, 18);
              decorLayer.fill({ color: 0xfacc15 });
            });

            const platforms = [
              { x: 200, y: groundY - 110, w: 180 },
              { x: 500, y: groundY - 170, w: 200 },
              { x: 100, y: groundY - 240, w: 160 },
              { x: 650, y: groundY - 260, w: 180 }
            ];

            platforms.forEach(plat => {
              decorLayer.roundRect(plat.x, plat.y, plat.w, 18, 6);
              decorLayer.fill({ color: 0x1e293b });
              decorLayer.stroke({ width: 3, color: 0xfacc15 });
            });
          }
        };

        renderEnvironment(viewModeRef.current);

        let lastMode = viewModeRef.current;
        let lastTime = performance.now();
        let frameCount = 0;

        app.ticker.add(() => {
          const currentMode = viewModeRef.current;

          if (currentMode !== lastMode) {
            lastMode = currentMode;
            renderEnvironment(currentMode);

            if (currentMode === 'side-view') {
              player.y = 480 - 24;
              player.vy = 0;
            }
          }

          const isUp = keys.ArrowUp || keys.KeyW;
          const isDown = keys.ArrowDown || keys.KeyS;
          const isLeft = keys.ArrowLeft || keys.KeyA;
          const isRight = keys.ArrowRight || keys.KeyD;
          const isJump = keys.Space || isUp;

          if (currentMode === 'top-down') {
            let targetVx = 0;
            let targetVy = 0;

            if (isLeft) targetVx -= player.speed;
            if (isRight) targetVx += player.speed;
            if (isUp) targetVy -= player.speed;
            if (isDown) targetVy += player.speed;

            if (targetVx !== 0 && targetVy !== 0) {
              targetVx *= 0.7071;
              targetVy *= 0.7071;
            }

            player.vx += (targetVx - player.vx) * 0.25;
            player.vy += (targetVy - player.vy) * 0.25;

            player.x += player.vx;
            player.y += player.vy;

          } else {
            const groundY = 480 - 24;

            let targetVx = 0;
            if (isLeft) targetVx -= player.speed;
            if (isRight) targetVx += player.speed;
            player.vx += (targetVx - player.vx) * 0.25;
            player.x += player.vx;

            player.vy += 0.7;
            player.y += player.vy;

            if (player.y >= groundY) {
              player.y = groundY;
              player.vy = 0;
              player.isGrounded = true;
            } else {
              player.isGrounded = false;
            }

            if (isJump && player.isGrounded) {
              player.vy = -14;
              player.isGrounded = false;

              for (let i = 0; i < 10; i++) {
                sparks.push({
                  x: player.x + (Math.random() - 0.5) * 20,
                  y: player.y + 12,
                  vx: (Math.random() - 0.5) * 5,
                  vy: Math.random() * -3,
                  life: 20,
                  maxLife: 20,
                  color: player.color
                });
              }
            }
          }

          playerContainer.position.set(player.x, player.y);

          playerAura.clear();
          playerAura.circle(0, 0, 30);
          playerAura.fill({ color: player.color, alpha: 0.3 });
          playerAura.stroke({ width: 2, color: player.color, alpha: 0.8 });

          playerBody.clear();
          playerBody.circle(0, 0, 18);
          playerBody.fill({ color: 0x0f172a });
          playerBody.stroke({ width: 3, color: 0xfacc15 });

          playerBody.roundRect(-8, -10, 16, 20, 4);
          playerBody.fill({ color: player.color });

          if (Math.abs(player.vx) > 0.5 || Math.abs(player.vy) > 0.5) {
            if (Math.random() > 0.4) {
              sparks.push({
                x: player.x + (Math.random() - 0.5) * 16,
                y: player.y + (currentMode === 'top-down' ? 14 : 18),
                vx: (Math.random() - 0.5) * 1.5,
                vy: (Math.random() - 0.5) * 1.5,
                life: 24,
                maxLife: 24,
                color: player.color
              });
            }
          }

          sparkGraphics.clear();
          for (let i = sparks.length - 1; i >= 0; i--) {
            const s = sparks[i];
            s.x += s.vx;
            s.y += s.vy;
            s.life--;

            const alpha = s.life / s.maxLife;
            sparkGraphics.circle(s.x, s.y, 3 * alpha);
            sparkGraphics.fill({ color: s.color, alpha });

            if (s.life <= 0) sparks.splice(i, 1);
          }

          const targetCamX = (window.innerWidth / 2) - player.x;
          const targetCamY = currentMode === 'top-down'
            ? (window.innerHeight / 2) - player.y
            : (window.innerHeight / 2) - player.y + 60;

          worldContainer.x += (targetCamX - worldContainer.x) * 0.1;
          worldContainer.y += (targetCamY - worldContainer.y) * 0.1;

          frameCount++;
          const now = performance.now();
          if (now - lastTime >= 500) {
            setFps(Math.round((frameCount * 1000) / (now - lastTime)));
            setCoords({ x: Math.round(player.x), y: Math.round(player.y) });
            frameCount = 0;
            lastTime = now;
          }
        });

      } catch (err) {
        console.error('Erreur initialisation PixiJS:', err);
        setLoadError(err instanceof Error ? err.message : String(err));
      }
    };

    initPixi();

    return () => {
      isCleanedUp = true;
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (app) {
        try {
          app.destroy(true, { children: true });
        } catch (e) {
          // ignore cleanup error
        }
      }
    };
  }, [selectedGod, heroName]);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#0b0f19' }}>
      <div ref={canvasContainerRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />

      {loadError && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(239, 68, 68, 0.9)',
          padding: '20px 30px',
          borderRadius: 12,
          color: '#fff',
          textAlign: 'center',
          maxWidth: 400,
          zIndex: 100
        }}>
          <h3>Erreur de chargement du moteur 2D</h3>
          <p style={{ marginTop: 8, fontSize: 13 }}>{loadError}</p>
          <button
            onClick={onLeave}
            style={{
              marginTop: 14,
              padding: '8px 16px',
              background: '#fff',
              color: '#b91c1c',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Retour au Lobby
          </button>
        </div>
      )}

      <div style={{
        position: 'absolute',
        top: 16,
        left: 20,
        right: 20,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        pointerEvents: 'none',
        zIndex: 10
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          background: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(212, 175, 55, 0.35)',
          borderRadius: 12,
          padding: '10px 18px',
          pointerEvents: 'auto'
        }}>
          <button
            onClick={onLeave}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: 8,
              color: '#f8fafc',
              padding: '6px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              fontSize: 13,
              fontFamily: 'Outfit, sans-serif'
            }}
          >
            <ArrowLeft size={16} /> Quitter vers Lobby
          </button>

          <div style={{ height: 24, width: 1, background: 'rgba(255,255,255,0.1)' }} />

          <div>
            <div style={{ fontSize: 11, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: 1 }}>
              Serveur Actif
            </div>
            <div style={{ fontSize: 14, fontWeight: 'bold', color: '#facc15', fontFamily: 'Cinzel, serif' }}>
              {server.name} ({server.realm.toUpperCase()})
            </div>
          </div>

          <div style={{ height: 24, width: 1, background: 'rgba(255,255,255,0.1)' }} />

          <div>
            <div style={{ fontSize: 11, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: 1 }}>
              Affinité Divine
            </div>
            <div style={{ fontSize: 14, fontWeight: 'bold', color: godLore.color, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Zap size={14} /> {godLore.name}
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(212, 175, 55, 0.35)',
          borderRadius: 12,
          padding: '8px 14px',
          pointerEvents: 'auto'
        }}>
          <span style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>
            Mode Caméra (Touche V) :
          </span>
          <button
            onClick={() => setViewMode(prev => prev === 'top-down' ? 'side-view' : 'top-down')}
            style={{
              background: viewMode === 'top-down' ? 'linear-gradient(135deg, #d4af37, #ca8a04)' : 'linear-gradient(135deg, #6366f1, #4338ca)',
              border: 'none',
              borderRadius: 8,
              color: '#000',
              fontWeight: 'bold',
              padding: '6px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              fontFamily: 'Cinzel, serif',
              fontSize: 13,
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
            }}
          >
            <Eye size={16} color="#000" />
            {viewMode === 'top-down' ? 'Vue du Dessus (Top-Down)' : 'Vue Profil (Side-View)'}
          </button>
        </div>
      </div>

      <div style={{
        position: 'absolute',
        bottom: 20,
        left: 20,
        background: 'rgba(15, 23, 42, 0.88)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(212, 175, 55, 0.25)',
        borderRadius: 10,
        padding: '12px 18px',
        fontSize: 13,
        color: '#cbd5e1',
        pointerEvents: 'none',
        zIndex: 10
      }}>
        <div style={{ fontWeight: 'bold', color: '#facc15', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Shield size={14} /> Contrôles ({viewMode === 'top-down' ? 'Top-Down' : 'Side-View'})
        </div>
        {viewMode === 'top-down' ? (
          <div>• <b>Z, Q, S, D</b> ou <b>Flèches</b> : Déplacement 8 directions</div>
        ) : (
          <div>
            • <b>Q, D</b> ou <b>Flèches Gauche/Droite</b> : Courir<br />
            • <b>ESPACE</b> ou <b>Flèche Haut</b> : Sauter avec gravité
          </div>
        )}
        <div style={{ marginTop: 4, color: '#94a3b8', fontSize: 11 }}>
          • Appuyez sur <b>V</b> pour basculer la perspective
        </div>
      </div>

      <div style={{
        position: 'absolute',
        bottom: 20,
        right: 20,
        background: 'rgba(15, 23, 42, 0.88)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(212, 175, 55, 0.25)',
        borderRadius: 10,
        padding: '10px 16px',
        fontSize: 12,
        color: '#94a3b8',
        display: 'flex',
        gap: 16,
        pointerEvents: 'none',
        zIndex: 10
      }}>
        <div>X: <span style={{ color: '#fff' }}>{coords.x}</span> Y: <span style={{ color: '#fff' }}>{coords.y}</span></div>
        <div>FPS: <span style={{ color: '#4ade80' }}>{fps}</span></div>
        <div>Ping: <span style={{ color: '#38bdf8' }}>{server.pingMs || 15} ms</span></div>
        <div>Rendu: <span style={{ color: '#facc15' }}>PixiJS WebGL</span></div>
      </div>
    </div>
  );
};
