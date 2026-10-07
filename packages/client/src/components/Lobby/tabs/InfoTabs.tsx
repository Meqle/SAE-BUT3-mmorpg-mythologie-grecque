// onglets d'information du lobby : AMIS, OPTION, CREDITS
import { HelpCircle, Settings, Swords } from 'lucide-react';
import { box, Panel } from '../Panel';

export function FriendsTab() {
  return (
    <Panel title="Système Social & Amis" icon={<Swords size={16} />}>
      <div style={{ ...box, padding: '18px 20px', textAlign: 'center' }}>
        <div style={{ color: '#38bdf8', fontSize: 12, fontWeight: 'bold', marginBottom: 6 }}>
          Module réservé aux pôles Réseau & Base de données
        </div>
        <div style={{ color: '#94a3b8', fontSize: 10, lineHeight: 1.5 }}>
          Ce composant sera branché sur l'API d'amis (PostgreSQL) et sur la présence en ligne temps réel (WebSockets).
        </div>
      </div>
    </Panel>
  );
}

export function OptionsTab() {
  return (
    <Panel title="Configuration Client" icon={<Settings size={16} />}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ ...box, padding: '12px 14px' }}>
          <div style={{ fontSize: 11, color: '#fff', fontWeight: 'bold' }}>Contrôles du Héros :</div>
          <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4, lineHeight: 1.5 }}>
            • <b>Z, Q, S, D</b> ou <b>Flèches</b> : Déplacement 8 directions<br />
            • En vue de profil : <b>Q, D</b> pour courir, <b>ESPACE</b> pour sauter<br />
            • <b>Touche V</b> : Basculer entre Top-Down et Profil
          </div>
        </div>
        <div style={{ ...box, display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
          <span style={{ color: '#fff' }}>Rendu Moteur 2D</span>
          <span style={{ color: '#facc15' }}>PixiJS v8 WebGL</span>
        </div>
      </div>
    </Panel>
  );
}

const TEAM = [
  { pole: 'Développement', color: '#facc15', detail: 'PixiJS 2D, Interface Pixel Art, Physique' },
  { pole: 'Réseau', color: '#38bdf8', detail: "Serveur WebSocket, Synchronisation d'état" },
  { pole: 'Base de Données', color: '#a855f7', detail: 'PostgreSQL, Authentification, Inventaires' }
];

export function CreditsTab() {
  return (
    <Panel title="Équipe SAE BUT3" icon={<HelpCircle size={16} />}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {TEAM.map((t) => (
          <div key={t.pole} style={box}>
            <span style={{ color: t.color, fontSize: 11, fontWeight: 'bold' }}>{t.pole} :</span>
            <span style={{ color: '#cbd5e1', fontSize: 10, marginLeft: 6 }}>{t.detail}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}
