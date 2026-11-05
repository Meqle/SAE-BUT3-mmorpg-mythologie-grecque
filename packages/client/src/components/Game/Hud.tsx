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
  compact: boolean; // petit ecran : une seule barre en haut
  touch: boolean; // ecran tactile : pas d'aide clavier
  onLeave: () => void;
}

const MARBLE = css(COLORS.marble);
const GOLD = css(COLORS.gold);
const SKY = css(COLORS.sky);

// panneau bleu nuit avec un double liseré, texte couleur marbre
const panel: CSSProperties = {
  position: 'absolute',
  background: 'rgba(31, 53, 80, 0.92)',
  border: `2px solid ${MARBLE}`,
  boxShadow: `inset 0 0 0 3px rgba(31, 53, 80, 0.92), inset 0 0 0 4px ${GOLD}, 0 4px 12px rgba(0, 0, 0, 0.25)`,
  borderRadius: 4,
  color: MARBLE,
  zIndex: 10
};
const smallTitle: CSSProperties = { fontSize: 11, textTransform: 'uppercase', color: SKY, letterSpacing: 2 };
const title: CSSProperties = { fontSize: 14, fontWeight: 'bold', fontFamily: 'Cinzel, serif' };
const separator: CSSProperties = { height: 28, width: 1, background: SKY };

export function Hud({ server, god, status, viewMode, coords, fps, loadError, compact, touch, onLeave }: HudProps) {
  const topDown = viewMode === 'top-down';
  const viewName = topDown ? 'Vue du dessus' : 'Vue de profil';

  return (
    <>
      {loadError && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          background: 'rgba(239, 68, 68, 0.9)', padding: '20px 30px', borderRadius: 12,
          color: '#fff', textAlign: 'center', width: 'min(400px, 90vw)', zIndex: 100
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

      {/* petit ecran : une seule barre en haut (quitter, serveur, dieu, vue) */}
      {compact && (
        <div style={{
          ...panel, top: 'calc(8px + env(safe-area-inset-top))', left: 8, right: 8,
          display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', fontSize: 11
        }}>
          <button onClick={onLeave} aria-label="Quitter vers le lobby" style={{
            background: 'transparent', border: `1px solid ${SKY}`, borderRadius: 3, color: MARBLE,
            width: 36, height: 36, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
          }}>
            <ArrowLeft size={18} />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ ...title, fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{server.name}</div>
            <div style={{ fontSize: 10, color: status === 'Connecté' ? MARBLE : GOLD }}>{status}</div>
          </div>
          <div style={{ ...title, fontSize: 12, color: god.color, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Zap size={12} /> {god.name}
          </div>
          <Eye size={14} color={GOLD} aria-label={viewName} />
        </div>
      )}

      {/* en haut a gauche : quitter, serveur, dieu */}
      {!compact && <div style={{ ...panel, top: 16, left: 20, display: 'flex', alignItems: 'center', gap: 16, padding: '10px 18px' }}>
        <button onClick={onLeave} style={{
          background: 'transparent', border: `1px solid ${SKY}`, borderRadius: 3, color: MARBLE,
          padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
          fontSize: 13, fontFamily: 'Cinzel, serif'
        }}>
          <ArrowLeft size={16} /> Quitter vers Lobby
        </button>
        <div style={separator} />
        <div>
          <div style={smallTitle}>Serveur Actif</div>
          <div style={title}>{server.name} ({server.realm.toUpperCase()})</div>
          <div style={{ fontSize: 11, color: status === 'Connecté' ? MARBLE : GOLD }}>
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
      </div>}

      {/* en haut a droite : vue actuelle (elle change avec les portes de la carte) */}
      {!compact && <div style={{ ...panel, top: 16, right: 20, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px' }}>
        <Eye size={16} color={GOLD} />
        <span style={title}>{viewName}</span>
      </div>}

      {/* en bas a gauche : aide des touches (clavier seulement) */}
      {!touch && <div style={{ ...panel, bottom: 20, left: 20, padding: '12px 18px', fontSize: 13, pointerEvents: 'none' }}>
        <div style={{ ...title, fontSize: 13, color: GOLD, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
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
        <div style={{ marginTop: 4, color: SKY, fontSize: 11 }}>
          • Passez une <b>porte</b> pour changer de vue
        </div>
      </div>}

      {/* en bas a droite : infos techniques (pas sur petit ecran) */}
      {!compact && <div style={{ ...panel, bottom: 20, right: 20, padding: '10px 16px', fontSize: 12, color: SKY, display: 'flex', gap: 16, pointerEvents: 'none' }}>
        <div>X: <span style={{ color: MARBLE }}>{coords.x}</span> Y: <span style={{ color: MARBLE }}>{coords.y}</span></div>
        <div>FPS: <span style={{ color: MARBLE }}>{fps}</span></div>
        {/* ping fictif pour l'instant (valeur de la liste des serveurs) */}
        <div>Ping: <span style={{ color: MARBLE }}>{server.pingMs || 15} ms</span></div>
        <div>Rendu: <span style={{ color: MARBLE }}>PixiJS WebGL</span></div>
      </div>}
    </>
  );
}
