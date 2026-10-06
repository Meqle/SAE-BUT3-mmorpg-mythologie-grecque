import React, { useState } from 'react';
import { GodAffinity, GODS_LORE, ServerInfo } from '@greek-myth/shared';
import {
  Shield,
  Zap,
  Globe,
  Users,
  Wifi,
  Swords,
  Settings,
  HelpCircle,
  Play
} from 'lucide-react';

interface TitleScreenProps {
  servers: ServerInfo[];
  selectedServer: ServerInfo;
  onSelectServer: (server: ServerInfo) => void;
  selectedGod: GodAffinity;
  onSelectGod: (god: GodAffinity) => void;
  heroName: string;
  onChangeHeroName: (name: string) => void;
  onEnterGame: () => void;
}

type MenuTab = 'play' | 'serveur' | 'perso' | 'amis' | 'option' | 'credits';

export const TitleScreen: React.FC<TitleScreenProps> = ({
  servers,
  selectedServer,
  onSelectServer,
  selectedGod,
  onSelectGod,
  heroName,
  onChangeHeroName,
  onEnterGame
}) => {
  const [activeTab, setActiveTab] = useState<MenuTab>('play');
  const godLore = GODS_LORE[selectedGod];

  const getRealmColor = (realm: string) => {
    switch (realm) {
      case 'olympus': return '#facc15';
      case 'elysium': return '#2dd4bf';
      case 'tartarus': return '#ef4444';
      default: return '#38bdf8';
    }
  };

  const menuButtons: { id: MenuTab; label: string; top: string }[] = [
    { id: 'play', label: 'PLAY', top: '11.80%' },
    { id: 'serveur', label: 'SERVEUR', top: '24.65%' },
    { id: 'perso', label: 'PERSO', top: '37.33%' },
    { id: 'amis', label: 'AMIS', top: '50.17%' },
    { id: 'option', label: 'OPTION', top: '63.02%' },
    { id: 'credits', label: 'CREDITS', top: '75.87%' }
  ];

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#18202d',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      fontFamily: 'Silkscreen, monospace'
    }}>
      {/* Conteneur 16:9 pixel-perfect centré */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: 'calc(100vh * (16 / 9))',
        height: '100%',
        maxHeight: 'calc(100vw * (9 / 16))',
        aspectRatio: '16 / 9',
        backgroundImage: "url('/assets/lobby-bg.png')",
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated',
        boxShadow: '0 0 50px rgba(0, 0, 0, 0.9)'
      }}>

        {/* Zones interactives calées au pixel près sur les 6 boutons de la maquette */}
        {menuButtons.map((btn) => {
          const isActive = activeTab === btn.id;
          return (
            <button
              key={btn.id}
              onClick={() => setActiveTab(btn.id)}
              style={{
                position: 'absolute',
                left: '6.64%',
                width: '21.00%',
                top: btn.top,
                height: '10.07%',
                background: isActive ? 'rgba(250, 204, 21, 0.16)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                borderRadius: 4,
                boxShadow: isActive
                  ? 'inset 0 0 0 3px #facc15, 0 0 8px rgba(250, 204, 21, 0.4)'
                  : 'none',
                outline: 'none',
                transition: 'all 0.08s'
              }}
              title={btn.label}
            >
              {isActive && (
                <div style={{
                  position: 'absolute',
                  right: -12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#facc15',
                  fontSize: 13,
                  filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.8))'
                }}>
                  ▶
                </div>
              )}
            </button>
          );
        })}

        {/* Panneau de contenu : réduit en largeur, agrandi en hauteur, détaché du menu gauche */}
        <div style={{
          position: 'absolute',
          left: '35.5%',
          width: '58%',
          top: '10%',
          bottom: '23%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          zIndex: 10
        }}>

          {/* ONGLET PLAY */}
          {activeTab === 'play' && (
            <div style={{
              background: 'rgba(20, 28, 43, 0.95)',
              border: '3px solid #241812',
              boxShadow: 'inset 2px 2px 0 #4a5c78, inset -2px -2px 0 #0f1622, 0 6px 0 rgba(0,0,0,0.6)',
              padding: '24px 28px',
              borderRadius: 4
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #2d3b52', paddingBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase' }}>Héros Prêt au Combat</div>
                  <div style={{ fontSize: 22, color: '#facc15', marginTop: 2, fontWeight: 'bold' }}>
                    {heroName || 'Achille'}
                  </div>
                </div>

                <div style={{
                  background: '#0d131f',
                  border: `2px solid ${godLore.color}`,
                  padding: '6px 12px',
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  <Zap size={14} color={godLore.color} />
                  <span style={{ color: godLore.color, fontSize: 12, fontWeight: 'bold' }}>
                    {godLore.name}
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, margin: '18px 0' }}>
                <div style={{ background: '#0e1522', padding: 12, border: '2px solid #28374e', borderRadius: 4 }}>
                  <div style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase' }}>Royaume Actif</div>
                  <div style={{ color: getRealmColor(selectedServer.realm), fontSize: 13, fontWeight: 'bold', marginTop: 4 }}>
                    {selectedServer.name}
                  </div>
                  <div style={{ fontSize: 9, color: '#cbd5e1', marginTop: 4 }}>
                    Ping: {selectedServer.pingMs}ms • {selectedServer.playerCount}/{selectedServer.maxPlayers}
                  </div>
                </div>

                <div style={{ background: '#0e1522', padding: 12, border: '2px solid #28374e', borderRadius: 4 }}>
                  <div style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase' }}>Bénédiction Divine</div>
                  <div style={{ color: '#facc15', fontSize: 12, fontWeight: 'bold', marginTop: 4 }}>
                    {godLore.passiveBonus}
                  </div>
                  <div style={{ fontSize: 9, color: '#cbd5e1', marginTop: 4 }}>
                    {godLore.title}
                  </div>
                </div>
              </div>

              <button
                onClick={onEnterGame}
                disabled={!heroName.trim()}
                style={{
                  width: '100%',
                  backgroundColor: heroName.trim() ? '#d4af37' : '#574e40',
                  color: heroName.trim() ? '#1a1406' : '#8a8070',
                  border: '3px solid #241812',
                  boxShadow: heroName.trim()
                    ? 'inset 2px 2px 0 #fef08a, inset -2px -2px 0 #854d0e, 0 4px 0 #140d09'
                    : 'none',
                  fontFamily: 'Silkscreen, monospace',
                  fontSize: 16,
                  fontWeight: 'bold',
                  padding: '14px',
                  cursor: heroName.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  borderRadius: 4
                }}
              >
                <Play size={18} fill="#1a1406" />
                <span>REJOINDRE LE ROYAUME</span>
              </button>
            </div>
          )}

          {/* ONGLET SERVEUR */}
          {activeTab === 'serveur' && (
            <div style={{
              background: 'rgba(20, 28, 43, 0.95)',
              border: '3px solid #241812',
              boxShadow: 'inset 2px 2px 0 #4a5c78, inset -2px -2px 0 #0f1622, 0 6px 0 rgba(0,0,0,0.6)',
              padding: '22px 26px',
              borderRadius: 4
            }}>
              <div style={{ fontSize: 15, color: '#facc15', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, fontWeight: 'bold' }}>
                <Globe size={18} /> Choix du Monde
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {servers.map((s) => {
                  const isSelected = selectedServer.id === s.id;
                  const realmColor = getRealmColor(s.realm);
                  return (
                    <div
                      key={s.id}
                      onClick={() => onSelectServer(s)}
                      style={{
                        backgroundColor: isSelected ? '#293a54' : '#0e1522',
                        border: isSelected ? '2px solid #facc15' : '2px solid #28374e',
                        padding: '12px 14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderRadius: 4
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{
                            width: 8,
                            height: 8,
                            backgroundColor: s.status === 'online' ? '#4ade80' : '#f59e0b',
                            borderRadius: '50%'
                          }} />
                          <span style={{ fontSize: 13, fontWeight: 'bold', color: '#fff' }}>
                            {s.name}
                          </span>
                          <span style={{ fontSize: 9, color: realmColor, border: `1px solid ${realmColor}`, padding: '1px 5px', borderRadius: 2 }}>
                            {s.realm.toUpperCase()}
                          </span>
                        </div>
                        <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>
                          {s.description}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', fontSize: 11 }}>
                        <div style={{ color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                          <Users size={12} /> {s.playerCount}/{s.maxPlayers}
                        </div>
                        <div style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end', marginTop: 2 }}>
                          <Wifi size={12} /> {s.pingMs}ms
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ONGLET PERSO */}
          {activeTab === 'perso' && (
            <div style={{
              background: 'rgba(20, 28, 43, 0.95)',
              border: '3px solid #241812',
              boxShadow: 'inset 2px 2px 0 #4a5c78, inset -2px -2px 0 #0f1622, 0 6px 0 rgba(0,0,0,0.6)',
              padding: '20px 24px',
              borderRadius: 4
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ fontSize: 14, color: '#facc15', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 'bold' }}>
                  <Shield size={16} /> Allégeance Divine
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 10, color: '#94a3b8' }}>Nom :</span>
                  <input
                    type="text"
                    value={heroName}
                    onChange={(e) => onChangeHeroName(e.target.value)}
                    style={{
                      backgroundColor: '#0c1320',
                      border: '2px solid #2b3950',
                      color: '#fff',
                      fontFamily: 'Silkscreen, monospace',
                      fontSize: 12,
                      padding: '5px 8px',
                      borderRadius: 4,
                      outline: 'none',
                      width: 150
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
                {(Object.keys(GODS_LORE) as GodAffinity[]).map((godKey) => {
                  const g = GODS_LORE[godKey];
                  const isSelected = selectedGod === godKey;
                  return (
                    <button
                      key={godKey}
                      onClick={() => onSelectGod(godKey)}
                      style={{
                        backgroundColor: isSelected ? '#293a54' : '#0e1522',
                        border: isSelected ? `2px solid ${g.color}` : '2px solid #28374e',
                        padding: '10px 6px',
                        cursor: 'pointer',
                        borderRadius: 4,
                        textAlign: 'center',
                        fontFamily: 'Silkscreen, monospace'
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 'bold', color: isSelected ? g.color : '#e2e8f0' }}>
                        {g.name}
                      </div>
                      <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 2 }}>
                        {g.realm}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div style={{
                backgroundColor: '#0c1320',
                borderLeft: `4px solid ${godLore.color}`,
                borderTop: '2px solid #28374e',
                borderRight: '2px solid #28374e',
                borderBottom: '2px solid #28374e',
                padding: '10px 14px',
                borderRadius: 4
              }}>
                <div style={{ fontSize: 12, fontWeight: 'bold', color: godLore.color }}>
                  {godLore.name} — {godLore.title}
                </div>
                <div style={{ fontSize: 10, color: '#94a3b8', margin: '3px 0' }}>
                  {godLore.description}
                </div>
                <div style={{ fontSize: 11, color: '#facc15', fontWeight: 'bold' }}>
                  Don Divin : {godLore.passiveBonus}
                </div>
              </div>
            </div>
          )}

          {/* ONGLET AMIS (Réservé au pôle Réseau / BDD) */}
          {activeTab === 'amis' && (
            <div style={{
              background: 'rgba(20, 28, 43, 0.95)',
              border: '3px solid #241812',
              boxShadow: 'inset 2px 2px 0 #4a5c78, inset -2px -2px 0 #0f1622, 0 6px 0 rgba(0,0,0,0.6)',
              padding: '24px 26px',
              borderRadius: 4
            }}>
              <div style={{ fontSize: 14, color: '#facc15', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 'bold' }}>
                <Swords size={16} /> Système Social & Amis
              </div>
              <div style={{
                background: '#0e1522',
                border: '2px solid #28374e',
                padding: '18px 20px',
                borderRadius: 4,
                textAlign: 'center'
              }}>
                <div style={{ color: '#38bdf8', fontSize: 12, fontWeight: 'bold', marginBottom: 6 }}>
                  Module réservé aux pôles Réseau & Base de données
                </div>
                <div style={{ color: '#94a3b8', fontSize: 10, lineHeight: 1.5 }}>
                  Ce composant sera branché sur l'API d'amis (PostgreSQL) et sur la présence en ligne temps réel (WebSockets).
                </div>
              </div>
            </div>
          )}

          {/* ONGLET OPTION */}
          {activeTab === 'option' && (
            <div style={{
              background: 'rgba(20, 28, 43, 0.95)',
              border: '3px solid #241812',
              boxShadow: 'inset 2px 2px 0 #4a5c78, inset -2px -2px 0 #0f1622, 0 6px 0 rgba(0,0,0,0.6)',
              padding: '22px 26px',
              borderRadius: 4
            }}>
              <div style={{ fontSize: 14, color: '#facc15', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 'bold' }}>
                <Settings size={16} /> Configuration Client
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ background: '#0e1522', padding: '12px 14px', border: '2px solid #28374e', borderRadius: 4 }}>
                  <div style={{ fontSize: 11, color: '#fff', fontWeight: 'bold' }}>Contrôles du Héros :</div>
                  <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4, lineHeight: 1.5 }}>
                    • <b>Z, Q, S, D</b> ou <b>Flèches</b> : Déplacement 8 directions<br />
                    • <b>Q, D</b> : Course / <b>ESPACE</b> : Saut avec gravité<br />
                    • <b>Touche V</b> : Basculer entre Top-Down et Profil
                  </div>
                </div>
                <div style={{ background: '#0e1522', padding: '10px 14px', border: '2px solid #28374e', borderRadius: 4, display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                  <span style={{ color: '#fff' }}>Rendu Moteur 2D</span>
                  <span style={{ color: '#facc15' }}>PixiJS v8 WebGL</span>
                </div>
              </div>
            </div>
          )}

          {/* ONGLET CREDITS */}
          {activeTab === 'credits' && (
            <div style={{
              background: 'rgba(20, 28, 43, 0.95)',
              border: '3px solid #241812',
              boxShadow: 'inset 2px 2px 0 #4a5c78, inset -2px -2px 0 #0f1622, 0 6px 0 rgba(0,0,0,0.6)',
              padding: '22px 26px',
              borderRadius: 4
            }}>
              <div style={{ fontSize: 14, color: '#facc15', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 'bold' }}>
                <HelpCircle size={16} /> Équipe SAE BUT3
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ background: '#0e1522', padding: '10px 14px', border: '2px solid #28374e', borderRadius: 4 }}>
                  <span style={{ color: '#facc15', fontSize: 11, fontWeight: 'bold' }}>Développement :</span>
                  <span style={{ color: '#cbd5e1', fontSize: 10, marginLeft: 6 }}>PixiJS 2D, Interface Pixel Art, Physique</span>
                </div>
                <div style={{ background: '#0e1522', padding: '10px 14px', border: '2px solid #28374e', borderRadius: 4 }}>
                  <span style={{ color: '#38bdf8', fontSize: 11, fontWeight: 'bold' }}>Réseau :</span>
                  <span style={{ color: '#cbd5e1', fontSize: 10, marginLeft: 6 }}>Serveur WebSocket, Synchronisation d'état</span>
                </div>
                <div style={{ background: '#0e1522', padding: '10px 14px', border: '2px solid #28374e', borderRadius: 4 }}>
                  <span style={{ color: '#a855f7', fontSize: 11, fontWeight: 'bold' }}>Base de Données :</span>
                  <span style={{ color: '#cbd5e1', fontSize: 10, marginLeft: 6 }}>PostgreSQL, Authentification, Inventaires</span>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
