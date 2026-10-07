// interface affichee par-dessus le jeu (HTML, pas PixiJS), memes couleurs que la carte
import { CSSProperties } from 'react';
import { GodLore, ServerInfo, ViewMode } from '@greek-myth/shared';
import { ArrowLeft, Eye, Shield, Zap } from 'lucide-react';
import { COLORS, css } from '../../game/scenes/palette';

interface HudProps {
  server: ServerInfo;
  god: GodLore;
  status: string;
  viewMode: ViewMode;
  coords: { x: number; y: number };
  fps: number;
  loadError: string | null;
  onLeave: () => void;
}

const CREAM = css(COLORS.cream);
const CLAY = css(COLORS.clay);
const CLAY_LIGHT = css(COLORS.clayLight);

// panneau noir avec un double liseré terre cuite, comme le bord d'un vase
const panel: CSSProperties = {
  position: 'absolute',
  background: 'rgba(26, 18, 16, 0.92)',
  border: `2px solid ${CLAY}`,
  boxShadow: `inset 0 0 0 3px rgba(26, 18, 16, 0.92), inset 0 0 0 4px ${css(COLORS.clayDark)}`,
  borderRadius: 4,
  color: CREAM,
  zIndex: 10
};
const smallTitle: CSSProperties = { fontSize: 11, textTransform: 'uppercase', color: CLAY_LIGHT, letterSpacing: 2 };
const title: CSSProperties = { fontSize: 14, fontWeight: 'bold', fontFamily: 'Cinzel, serif' };
const separator: CSSProperties = { height: 28, width: 1, background: CLAY };

export function Hud({ server, god, status, viewMode, coords, fps, loadError, onLeave }: HudProps) {
  const topDown = viewMode === 'top-down';

  return (
    <>
      {loadError && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          background: 'rgba(239, 68, 68, 0.9)', padding: '20px 30px', borderRadius: 12,
          color: '#fff', textAlign: 'center', maxWidth: 400, zIndex: 100
        }}>
          <h3>Erreur de chargement du moteur 2D</h3>
          <p style={{ marginTop: 8, fontSize: 13 }}>{loadError}</p>
          <button onClick={onLeave} style={{
            marginTop: 14, padding: '8px 16px', background: '#fff', color: '#b91c1c',
            border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold'
          }}>
            Retour au Lobby
          </button>
        </div>
      )}

      {/* en haut a gauche : quitter, serveur, dieu */}
      <div style={{ ...panel, top: 16, left: 20, display: 'flex', alignItems: 'center', gap: 16, padding: '10px 18px' }}>
        <button onClick={onLeave} style={{
          background: 'transparent', border: `1px solid ${CLAY}`, borderRadius: 3, color: CREAM,
          padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
          fontSize: 13, fontFamily: 'Cinzel, serif'
        }}>
          <ArrowLeft size={16} /> Quitter vers Lobby
        </button>
        <div style={separator} />
        <div>
          <div style={smallTitle}>Serveur Actif</div>
          <div style={title}>{server.name} ({server.realm.toUpperCase()})</div>
          <div style={{ fontSize: 11, color: status === 'Connecté' ? CREAM : CLAY_LIGHT }}>
            Réseau : {status}
          </div>
        </div>
        <div style={separator} />
        <div>
          <div style={smallTitle}>Affinité Divine</div>
          <div style={{ ...title, color: god.color, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Zap size={14} /> {god.name}
          </div>
        </div>
      </div>

      {/* en haut a droite : vue actuelle (elle change avec les portes de la carte) */}
      <div style={{ ...panel, top: 16, right: 20, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px' }}>
        <Eye size={16} color={CLAY_LIGHT} />
        <span style={title}>{topDown ? 'Vue du dessus' : 'Vue de profil'}</span>
      </div>

      {/* en bas a gauche : aide des touches */}
      <div style={{ ...panel, bottom: 20, left: 20, padding: '12px 18px', fontSize: 13, pointerEvents: 'none' }}>
        <div style={{ ...title, fontSize: 13, color: CLAY_LIGHT, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Shield size={14} /> Contrôles ({topDown ? 'Top-Down' : 'Side-View'})
        </div>
        {topDown ? (
          <div>• <b>Z, Q, S, D</b> ou <b>Flèches</b> : Déplacement 8 directions</div>
        ) : (
          <div>
            • <b>Q, D</b> ou <b>Flèches Gauche/Droite</b> : Courir<br />
            • <b>ESPACE</b> ou <b>Flèche Haut</b> : Sauter avec gravité
          </div>
        )}
        <div style={{ marginTop: 4, color: CLAY_LIGHT, fontSize: 11 }}>
          • Passez une <b>porte</b> pour changer de vue
        </div>
      </div>

      {/* en bas a droite : infos techniques */}
      <div style={{ ...panel, bottom: 20, right: 20, padding: '10px 16px', fontSize: 12, color: CLAY_LIGHT, display: 'flex', gap: 16, pointerEvents: 'none' }}>
        <div>X: <span style={{ color: CREAM }}>{coords.x}</span> Y: <span style={{ color: CREAM }}>{coords.y}</span></div>
        <div>FPS: <span style={{ color: CREAM }}>{fps}</span></div>
        {/* ping fictif pour l'instant (valeur de la liste des serveurs) */}
        <div>Ping: <span style={{ color: CREAM }}>{server.pingMs || 15} ms</span></div>
        <div>Rendu: <span style={{ color: CREAM }}>PixiJS WebGL</span></div>
      </div>
    </>
  );
}
