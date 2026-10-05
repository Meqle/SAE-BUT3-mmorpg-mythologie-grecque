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

  // Refs pour garder l'accès dans le tick loop sans re-rendre
  const viewModeRef = useRef<ViewMode>('top-down');
  viewModeRef.current = viewMode;

  const godLore = GODS_LORE[selectedGod];

  useEffect(() => {
    if (!canvasContainerRef.current) return;

    let app: Application | null = null;
    let isDestroyed = false;

    // État du joueur local
    const player = {
      x: 400,
      y: 300,
      vx: 0,
      vy: 0,
      speed: 5,
      isGrounded: false,
      color: parseInt(godLore.color.replace('#', '0x'), 16)
    };

    // Gestion des touches
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
        // Raccourci pour basculer la vue
        setViewMode((prev) => (prev === 'top-down' ? 'side-view' : 'top-down'));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (keys.hasOwnProperty(e.code)) keys[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Initialisation PixiJS
    const initPixi = async () => {
      app = new Application();
      await app.init({
        resizeTo: canvasContainerRef.current!,
        backgroundColor: 0x07090e,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true
      });

      if (isDestroyed || !canvasContainerRef.current) {
        app.destroy(true, { children: true });
        return;
      }

      canvasContainerRef.current.appendChild(app.canvas);

      // Scène principale et couches
      const worldContainer = new Container();
      const backgroundLayer = new Graphics();
      const entityLayer = new Container();
      const fxLayer = new Container();

      worldContainer.addChild(backgroundLayer);
      worldContainer.addChild(entityLayer);
      worldContainer.addChild(fxLayer);
      app.stage.addChild(worldContainer);

      // Création du personnage (Héros grec)
      const playerContainer = new Container();
      const playerBody = new Graphics();
      const playerAura = new Graphics();

      // Style du nom au-dessus de la tête
      const nameStyle = new TextStyle({
        fontFamily: 'Outfit, sans-serif',
        fontSize: 13,
        fontWeight: 'bold',
        fill: 0xffffff,
        dropShadow: {
          alpha: 0.8,
          blur: 3,
          color: 0x000000,
          distance: 1
        }
      });
      const nameTag = new Text({ text: `${heroName} [${selectedGod}]`, style: nameStyle });
      nameTag.anchor.set(0.5, 1);
      nameTag.position.set(0, -32);

      playerContainer.addChild(playerAura);
      playerContainer.addChild(playerBody);
      playerContainer.addChild(nameTag);
      entityLayer.addChild(playerContainer);

      // Particules de poussière dorée / étincelles
      const sparks: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: number }[] = [];
      const sparkGraphics = new Graphics();
      fxLayer.addChild(sparkGraphics);

      // Rendu du décor selon la vue
      const renderEnvironment = (mode: ViewMode, width: number, height: number) => {
        backgroundLayer.clear();

        if (mode === 'top-down') {
          // Sol du Temple (Dalles en marbre avec motif grec)
          const tileSize = 60;
          for (let x = -800; x < width + 800; x += tileSize) {
            for (let y = -800; y < height + 800; y += tileSize) {
              const isEven = ((x / tileSize) + (y / tileSize)) % 2 === 0;
              backgroundLayer.rect(x, y, tileSize, tileSize);
              backgroundLayer.fill({ color: isEven ? 0x121724 : 0x0e121d });
              backgroundLayer.stroke({ width: 1, color: 0x1d2436, alpha: 0.4 });
            }
          }

          // Bordures et colonnes sacrées (Pillars)
          const pillars = [
            { x: 150, y: 150 }, { x: 650, y: 150 },
            { x: 150, y: 450 }, { x: 650, y: 450 },
            { x: 400, y: 100 }, { x: 400, y: 500 }
          ];

          pillars.forEach(p => {
            // Ombre de la colonne
            backgroundLayer.circle(p.x, p.y + 6, 26);
            backgroundLayer.fill({ color: 0x000000, alpha: 0.4 });
            // Socle et colonne de marbre dorée
            backgroundLayer.circle(p.x, p.y, 24);
            backgroundLayer.fill({ color: 0xd4af37 });
            backgroundLayer.circle(p.x, p.y, 20);
            backgroundLayer.fill({ color: 0xe2e8f0 });
            backgroundLayer.stroke({ width: 2, color: 0x854d0e });
          });

          // Autel central du Dieu
          backgroundLayer.roundRect(350, 260, 100, 80, 10);
          backgroundLayer.fill({ color: 0x1e293b });
          backgroundLayer.stroke({ width: 3, color: player.color });

        } else {
          // --- SIDE-VIEW (Vue Profil / Plateforme) ---
          const groundY = height * 0.75;

          // Ciel dégradé mythologique
          backgroundLayer.rect(-1000, -500, width + 2000, height + 1000);
          backgroundLayer.fill({ color: 0x090c15 });

          // Montagnes sacrées à l'horizon (parallaxe)
          backgroundLayer.moveTo(-200, groundY);
          backgroundLayer.lineTo(200, groundY - 220);
          backgroundLayer.lineTo(500, groundY - 140);
          backgroundLayer.lineTo(800, groundY - 280);
          backgroundLayer.lineTo(1200, groundY);
          backgroundLayer.fill({ color: 0x111625 });

          // Sol sacré (Plateforme principale)
          backgroundLayer.rect(-1000, groundY, width + 2000, 300);
          backgroundLayer.fill({ color: 0x161d2d });
          backgroundLayer.stroke({ width: 4, color: 0xd4af37 });

          // Colonnes d'arrière-plan en vue de côté
          [-100, 200, 500, 800, 1100].forEach((colX) => {
            backgroundLayer.rect(colX, groundY - 260, 34, 260);
            backgroundLayer.fill({ color: 0x242e44 });
            // Chapiteau
            backgroundLayer.rect(colX - 8, groundY - 275, 50, 15);
            backgroundLayer.fill({ color: 0xd4af37 });
          });

          // Plateformes surélevées flottantes
          const floatPlatforms = [
            { x: 250, y: groundY - 120, w: 160 },
            { x: 550, y: groundY - 180, w: 180 },
            { x: 100, y: groundY - 220, w: 140 }
          ];

          floatPlatforms.forEach(plat => {
            backgroundLayer.roundRect(plat.x, plat.y, plat.w, 16, 6);
            backgroundLayer.fill({ color: 0x242e44 });
            backgroundLayer.stroke({ width: 2, color: 0xd4af37 });
          });
        }
      };

      // Premier rendu d'ambiance
      renderEnvironment(viewModeRef.current, app.screen.width, app.screen.height);

      let lastMode = viewModeRef.current;
      let lastTime = performance.now();
      let frameCount = 0;

      // Boucle de jeu (PixiJS Ticker / 60 FPS)
      app.ticker.add(() => {
        const currentMode = viewModeRef.current;

        // Si la vue a basculé (Top-down <-> Side-view)
        if (currentMode !== lastMode) {
          lastMode = currentMode;
          renderEnvironment(currentMode, app!.screen.width, app!.screen.height);

          // Ajustement doux de la position lors du switch
          if (currentMode === 'side-view') {
            const groundY = app!.screen.height * 0.75;
            player.y = groundY - 30;
            player.vy = 0;
          }
        }

        // Entrées clavier
        const isUp = keys.ArrowUp || keys.KeyW;
        const isDown = keys.ArrowDown || keys.KeyS;
        const isLeft = keys.ArrowLeft || keys.KeyA;
        const isRight = keys.ArrowRight || keys.KeyD;
        const isJump = keys.Space || isUp;

        if (currentMode === 'top-down') {
          // --- PHYSIQUE VUE TOP-DOWN (8 directions) ---
          let targetVx = 0;
          let targetVy = 0;

          if (isLeft) targetVx -= player.speed;
          if (isRight) targetVx += player.speed;
          if (isUp) targetVy -= player.speed;
          if (isDown) targetVy += player.speed;

          // Normalisation diagonale
          if (targetVx !== 0 && targetVy !== 0) {
            targetVx *= 0.7071;
            targetVy *= 0.7071;
          }

          player.vx += (targetVx - player.vx) * 0.2;
          player.vy += (targetVy - player.vy) * 0.2;

          player.x += player.vx;
          player.y += player.vy;

        } else {
          // --- PHYSIQUE VUE DE PROFIL (Platformer / Gravité / Saut) ---
          const groundY = app!.screen.height * 0.75 - 20;

          // Déplacement horizontal
          let targetVx = 0;
          if (isLeft) targetVx -= player.speed;
          if (isRight) targetVx += player.speed;
          player.vx += (targetVx - player.vx) * 0.2;
          player.x += player.vx;

          // Gravité
          player.vy += 0.65;
          player.y += player.vy;

          // Collision avec le sol
          if (player.y >= groundY) {
            player.y = groundY;
            player.vy = 0;
            player.isGrounded = true;
          } else {
            player.isGrounded = false;
          }

          // Saut divin
          if (isJump && player.isGrounded) {
            player.vy = -13;
            player.isGrounded = false;

            // Effet d'impulsion de saut
            for (let i = 0; i < 8; i++) {
              sparks.push({
                x: player.x + (Math.random() - 0.5) * 20,
                y: player.y + 10,
                vx: (Math.random() - 0.5) * 4,
                vy: Math.random() * -2,
                life: 20,
                maxLife: 20,
                color: player.color
              });
            }
          }
        }

        // Mise à jour de l'affichage du joueur
        playerContainer.position.set(player.x, player.y);

        // Dessin du corps du joueur (bouclier divin & halo)
        playerAura.clear();
        playerAura.circle(0, 0, 26);
        playerAura.fill({ color: player.color, alpha: 0.25 });
        playerAura.stroke({ width: 2, color: player.color, alpha: 0.7 });

        playerBody.clear();
        // Corps
        playerBody.circle(0, 0, 16);
        playerBody.fill({ color: 0x1e293b });
        playerBody.stroke({ width: 2.5, color: 0xfacc15 });

        // Symbole / Casque au centre
        playerBody.rect(-6, -8, 12, 16);
        playerBody.fill({ color: player.color });

        // Génération d'étincelles divines en marchant
        if (Math.abs(player.vx) > 0.5 || Math.abs(player.vy) > 0.5) {
          if (Math.random() > 0.5) {
            sparks.push({
              x: player.x + (Math.random() - 0.5) * 16,
              y: player.y + (currentMode === 'top-down' ? 12 : 16),
              vx: (Math.random() - 0.5) * 1.5,
              vy: (Math.random() - 0.5) * 1.5,
              life: 25,
              maxLife: 25,
              color: player.color
            });
          }
        }

        // Mise à jour des particules
        sparkGraphics.clear();
        for (let i = sparks.length - 1; i >= 0; i--) {
          const s = sparks[i];
          s.x += s.vx;
          s.y += s.vy;
          s.life--;

          const alpha = s.life / s.maxLife;
          sparkGraphics.circle(s.x, s.y, 2.5 * alpha);
          sparkGraphics.fill({ color: s.color, alpha });

          if (s.life <= 0) sparks.splice(i, 1);
        }

        // Suivi Caméra fluide
        const targetCamX = app!.screen.width / 2 - player.x;
        const targetCamY = currentMode === 'top-down'
          ? app!.screen.height / 2 - player.y
          : app!.screen.height / 2 - player.y + 60;

        worldContainer.x += (targetCamX - worldContainer.x) * 0.08;
        worldContainer.y += (targetCamY - worldContainer.y) * 0.08;

        // Mise à jour FPS & Coords
        frameCount++;
        const now = performance.now();
        if (now - lastTime >= 500) {
          setFps(Math.round((frameCount * 1000) / (now - lastTime)));
          setCoords({ x: Math.round(player.x), y: Math.round(player.y) });
          frameCount = 0;
          lastTime = now;
        }
      });
    };

    initPixi();

    return () => {
      isDestroyed = true;
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (app) {
        app.destroy(true, { children: true });
      }
    };
  }, [selectedGod, heroName]);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#07090e' }}>
      {/* Conteneur Canvas PixiJS */}
      <div ref={canvasContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Barre d'en-tête & HUD de jeu */}
      <div style={{
        position: 'absolute',
        top: 16,
        left: 20,
        right: 20,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        pointerEvents: 'none'
      }}>
        {/* Infos Héros & Serveur */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          background: 'rgba(15, 20, 32, 0.85)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
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

        {/* Contrôleur de Mode de Vue (Top-Down / Side-View) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: 'rgba(15, 20, 32, 0.85)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
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

      {/* Guide des touches & Coordonnées HUD */}
      <div style={{
        position: 'absolute',
        bottom: 20,
        left: 20,
        background: 'rgba(15, 20, 32, 0.85)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(212, 175, 55, 0.25)',
        borderRadius: 10,
        padding: '12px 18px',
        fontSize: 13,
        color: '#cbd5e1',
        pointerEvents: 'none'
      }}>
        <div style={{ fontWeight: 'bold', color: '#facc15', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Shield size={14} /> Guide de Déplacement ({viewMode === 'top-down' ? 'Top-Down' : 'Side-View'})
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
          • Appuyez sur <b>V</b> pour basculer instantanément la perspective
        </div>
      </div>

      {/* Télémétrie Réseau & Moteur */}
      <div style={{
        position: 'absolute',
        bottom: 20,
        right: 20,
        background: 'rgba(15, 20, 32, 0.85)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(212, 175, 55, 0.25)',
        borderRadius: 10,
        padding: '10px 16px',
        fontSize: 12,
        color: '#94a3b8',
        display: 'flex',
        gap: 16,
        pointerEvents: 'none'
      }}>
        <div>X: <span style={{ color: '#fff' }}>{coords.x}</span> Y: <span style={{ color: '#fff' }}>{coords.y}</span></div>
        <div>FPS: <span style={{ color: '#4ade80' }}>{fps}</span></div>
        <div>Ping: <span style={{ color: '#38bdf8' }}>{server.pingMs || 15} ms</span></div>
        <div>Rendu: <span style={{ color: '#facc15' }}>PixiJS WebGL</span></div>
      </div>
    </div>
  );
};
