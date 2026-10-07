// interface affichee par-dessus le jeu (HTML, pas PixiJS)
import { CSSProperties } from 'react';
import { GodLore, ServerInfo, ViewMode } from '@greek-myth/shared';
import { ArrowLeft, Eye, Shield, Zap } from 'lucide-react';

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

const panel: CSSProperties = {
  position: 'absolute',
  background: 'rgba(15, 23, 42, 0.88)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(212, 175, 55, 0.3)',
  borderRadius: 12,
  zIndex: 10
};
const smallTitle: CSSProperties = { fontSize: 11, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: 1 };
const separator: CSSProperties = { height: 24, width: 1, background: 'rgba(255,255,255,0.1)' };

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
          background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: 8, color: '#f8fafc', padding: '6px 12px', display: 'flex', alignItems: 'center',
          gap: 6, cursor: 'pointer', fontSize: 13, fontFamily: 'Outfit, sans-serif'
        }}>
          <ArrowLeft size={16} /> Quitter vers Lobby
        </button>
        <div style={separator} />
        <div>
          <div style={smallTitle}>Serveur Actif</div>
          <div style={{ fontSize: 14, fontWeight: 'bold', color: '#facc15', fontFamily: 'Cinzel, serif' }}>
            {server.name} ({server.realm.toUpperCase()})
          </div>
          <div style={{ fontSize: 11, color: status === 'Connecté' ? '#4ade80' : '#fbbf24' }}>
            Réseau : {status}
          </div>
        </div>
        <div style={separator} />
        <div>
          <div style={smallTitle}>Affinité Divine</div>
          <div style={{ fontSize: 14, fontWeight: 'bold', color: god.color, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Zap size={14} /> {god.name}
          </div>
        </div>
      </div>

      {/* en haut a droite : vue actuelle (elle change avec les portes de la carte) */}
      <div style={{ ...panel, top: 16, right: 20, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px' }}>
        <Eye size={16} color="#facc15" />
        <span style={{ fontSize: 13, fontWeight: 'bold', color: '#facc15', fontFamily: 'Cinzel, serif' }}>
          {topDown ? 'Vue du dessus' : 'Vue de profil'}
        </span>
      </div>

      {/* en bas a gauche : aide des touches */}
      <div style={{ ...panel, bottom: 20, left: 20, padding: '12px 18px', fontSize: 13, color: '#cbd5e1', pointerEvents: 'none', borderRadius: 10 }}>
        <div style={{ fontWeight: 'bold', color: '#facc15', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
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
        <div style={{ marginTop: 4, color: '#94a3b8', fontSize: 11 }}>
          • Passez une <b>porte</b> pour changer de vue
        </div>
      </div>

      {/* en bas a droite : infos techniques */}
      <div style={{ ...panel, bottom: 20, right: 20, padding: '10px 16px', fontSize: 12, color: '#94a3b8', display: 'flex', gap: 16, pointerEvents: 'none', borderRadius: 10 }}>
        <div>X: <span style={{ color: '#fff' }}>{coords.x}</span> Y: <span style={{ color: '#fff' }}>{coords.y}</span></div>
        <div>FPS: <span style={{ color: '#4ade80' }}>{fps}</span></div>
        {/* ping fictif pour l'instant (valeur de la liste des serveurs) */}
        <div>Ping: <span style={{ color: '#38bdf8' }}>{server.pingMs || 15} ms</span></div>
        <div>Rendu: <span style={{ color: '#facc15' }}>PixiJS WebGL</span></div>
      </div>
    </>
  );
}
