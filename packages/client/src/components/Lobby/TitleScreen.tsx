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

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#253145',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Silkscreen, monospace',
      border: '10px solid #543220',
      boxShadow: 'inset 0 0 0 4px #26150c, inset 0 0 0 8px #6b3e27'
    }}>
      {/* Frise grecque supérieure */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 38,
        backgroundColor: '#1b2331',
        borderBottom: '3px solid #2f3d54',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center'
      }}>
        <svg width="100%" height="28" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="greek-key-top" width="28" height="28" patternUnits="userSpaceOnUse">
              <path d="M0 2h24v24H16v-4h4V6H4v16h8v-4H8v-2h4v8H0z" fill="#3e506d" />
            </pattern>
          </defs>
          <rect width="100%" height="28" fill="url(#greek-key-top)" />
        </svg>
      </div>

      {/* Frise grecque inférieure */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 38,
        backgroundColor: '#1b2331',
        borderTop: '3px solid #2f3d54',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        zIndex: 5
      }}>
        <svg width="100%" height="28" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="greek-key-bot" width="28" height="28" patternUnits="userSpaceOnUse">
              <path d="M0 2h24v24H16v-4h4V6H4v16h8v-4H8v-2h4v8H0z" fill="#3e506d" />
            </pattern>
          </defs>
          <rect width="100%" height="28" fill="url(#greek-key-bot)" />
        </svg>
      </div>

      {/* Plateforme en pierre antique (bas-droite) */}
      <div style={{
        position: 'absolute',
        bottom: 38,
        right: 0,
        width: '54%',
        height: 110,
        zIndex: 4,
        pointerEvents: 'none'
      }}>
        {/* Dalle supérieure de la corniche */}
        <div style={{
          height: 18,
          backgroundColor: '#c7bea8',
          borderTop: '3px solid #dfd8c7',
          borderBottom: '3px solid #9c927f',
          boxShadow: '0 4px 0 #736957'
        }} />

        {/* Bande sculptée / glyphes grecs */}
        <div style={{
          height: 20,
          backgroundColor: '#8a816d',
          borderBottom: '3px solid #615847',
          display: 'flex',
          alignItems: 'center',
          padding: '0 8px',
          overflow: 'hidden'
        }}>
          <div style={{
            fontSize: 11,
            color: '#b0a690',
            letterSpacing: 4,
            whiteSpace: 'nowrap',
            opacity: 0.8
          }}>
            ᚛᚜ 𐌀𐌂𐌇𐌉𐌋𐌋𐌄𐌔 𐌏𐌋𐌙𐌌𐌐𐌖𐌔 𐌐𐌏𐌔𐌄𐌉𐌃𐌏𐌍 𐌇𐌀𐌃𐌄𐌔 ᚛᚜ 𐌀𐌕𐌇𐌄𐌍𐌀 𐌀𐌓𐌄𐌔 𐌀𐌐𐌏𐌋𐌋𐌏 ᚛᚜
          </div>
        </div>

        {/* Blocs de pierre inférieurs et fissures */}
        <div style={{
          height: 72,
          backgroundColor: '#a99f8a',
          backgroundImage: 'radial-gradient(#9c917c 15%, transparent 16%)',
          backgroundSize: '16px 16px',
          borderLeft: '4px solid #756a57'
        }} />
      </div>

      {/* Colonne de Menu Latérale Gauche */}
      <div style={{
        position: 'absolute',
        top: 48,
        left: 36,
        bottom: 48,
        width: 250,
        backgroundColor: '#4a2c1d',
        border: '4px solid #24130b',
        boxShadow: 'inset 0 0 0 4px #6a3e29, 6px 6px 0 rgba(0,0,0,0.5)',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 12,
        zIndex: 10
      }}>
        {/* Rivets décoratifs aux 4 coins */}
        {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner) => (
          <div
            key={corner}
            style={{
              position: 'absolute',
              width: 18,
              height: 18,
              backgroundColor: '#a89e8f',
              border: '3px solid #24130b',
              borderRadius: '50%',
              boxShadow: 'inset 2px 2px 0 #ded7cb, inset -2px -2px 0 #5c5244',
              top: corner.includes('top') ? -9 : 'auto',
              bottom: corner.includes('bottom') ? -9 : 'auto',
              left: corner.includes('left') ? -9 : 'auto',
              right: corner.includes('right') ? -9 : 'auto'
            }}
          />
        ))}

        {/* 6 Boutons Pixel Art */}
        <button
          onClick={() => setActiveTab('play')}
          className={`pixel-menu-btn ${activeTab === 'play' ? 'active' : ''}`}
        >
          PLAY
        </button>

        <button
          onClick={() => setActiveTab('serveur')}
          className={`pixel-menu-btn ${activeTab === 'serveur' ? 'active' : ''}`}
        >
          SERVEUR
        </button>

        <button
          onClick={() => setActiveTab('perso')}
          className={`pixel-menu-btn ${activeTab === 'perso' ? 'active' : ''}`}
        >
          PERSO
        </button>

        <button
          onClick={() => setActiveTab('amis')}
          className={`pixel-menu-btn ${activeTab === 'amis' ? 'active' : ''}`}
        >
          AMIS
        </button>

        <button
          onClick={() => setActiveTab('option')}
          className={`pixel-menu-btn ${activeTab === 'option' ? 'active' : ''}`}
        >
          OPTION
        </button>

        <button
          onClick={() => setActiveTab('credits')}
          className={`pixel-menu-btn ${activeTab === 'credits' ? 'active' : ''}`}
        >
          CREDITS
        </button>
      </div>

      {/* Zone Centrale / Droite de Contenu Dynamique */}
      <div style={{
        position: 'absolute',
        top: 56,
        left: 310,
        right: 40,
        bottom: 56,
        zIndex: 8,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>

        {/* ================= ONGLET PLAY ================= */}
        {activeTab === 'play' && (
          <div style={{
            maxWidth: 680,
            background: 'rgba(23, 32, 48, 0.94)',
            border: '4px solid #241812',
            boxShadow: 'inset 3px 3px 0 #435472, inset -3px -3px 0 #131a26, 0 10px 0 rgba(0,0,0,0.5)',
            padding: 28,
            borderRadius: 4
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '3px solid #2f3e58', paddingBottom: 16 }}>
              <div>
                <span style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Héros Prêt au Combat
                </span>
                <h2 style={{ fontSize: 24, color: '#facc15', margin: '4px 0 0 0' }}>
                  {heroName || 'Achille'}
                </h2>
              </div>

              <div style={{
                background: 'rgba(10, 15, 24, 0.8)',
                border: `2px solid ${godLore.color}`,
                padding: '6px 14px',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <Zap size={16} color={godLore.color} />
                <span style={{ color: godLore.color, fontSize: 13, fontWeight: 'bold' }}>
                  {godLore.name}
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, margin: '20px 0' }}>
              <div style={{ background: 'rgba(14, 20, 31, 0.7)', padding: 14, border: '2px solid #2f3e58', borderRadius: 4 }}>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>Royaume sélectionné</span>
                <div style={{ color: getRealmColor(selectedServer.realm), fontSize: 15, fontWeight: 'bold', marginTop: 4 }}>
                  {selectedServer.name}
                </div>
                <div style={{ fontSize: 11, color: '#cbd5e1', marginTop: 4 }}>
                  {selectedServer.description}
                </div>
              </div>

              <div style={{ background: 'rgba(14, 20, 31, 0.7)', padding: 14, border: '2px solid #2f3e58', borderRadius: 4 }}>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>Don Divin Actif</span>
                <div style={{ color: '#facc15', fontSize: 13, fontWeight: 'bold', marginTop: 4 }}>
                  {godLore.passiveBonus}
                </div>
                <div style={{ fontSize: 11, color: '#cbd5e1', marginTop: 4 }}>
                  {godLore.title}
                </div>
              </div>
            </div>

            <button
              onClick={onEnterGame}
              disabled={!heroName.trim()}
              style={{
                width: '100%',
                backgroundColor: heroName.trim() ? '#d4af37' : '#524b3e',
                color: heroName.trim() ? '#181206' : '#8c8270',
                border: '4px solid #241812',
                boxShadow: heroName.trim()
                  ? 'inset 3px 3px 0 #fef08a, inset -3px -3px 0 #854d0e, 0 6px 0 #18100c'
                  : 'none',
                fontFamily: 'Silkscreen, monospace',
                fontSize: 20,
                fontWeight: 'bold',
                padding: '16px',
                cursor: heroName.trim() ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                borderRadius: 4
              }}
            >
              <Play size={20} fill="#181206" />
              <span>LANCER L'ÉPOPÉE</span>
            </button>
          </div>
        )}

        {/* ================= ONGLET SERVEUR ================= */}
        {activeTab === 'serveur' && (
          <div style={{
            maxWidth: 680,
            background: 'rgba(23, 32, 48, 0.94)',
            border: '4px solid #241812',
            boxShadow: 'inset 3px 3px 0 #435472, inset -3px -3px 0 #131a26, 0 10px 0 rgba(0,0,0,0.5)',
            padding: 24,
            borderRadius: 4
          }}>
            <h3 style={{ fontSize: 18, color: '#facc15', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Globe size={18} /> Sélection des Royaumes
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {servers.map((s) => {
                const isSelected = selectedServer.id === s.id;
                const realmColor = getRealmColor(s.realm);
                return (
                  <div
                    key={s.id}
                    onClick={() => onSelectServer(s)}
                    style={{
                      backgroundColor: isSelected ? '#334460' : 'rgba(15, 22, 34, 0.7)',
                      border: isSelected ? '3px solid #facc15' : '3px solid #2b384e',
                      boxShadow: isSelected ? 'inset 2px 2px 0 #52678c, inset -2px -2px 0 #1a2332' : 'none',
                      padding: '12px 16px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderRadius: 4
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{
                          width: 10,
                          height: 10,
                          backgroundColor: s.status === 'online' ? '#4ade80' : '#f59e0b',
                          border: '2px solid #000'
                        }} />
                        <span style={{ fontSize: 14, fontWeight: 'bold', color: '#fff' }}>
                          {s.name}
                        </span>
                        <span style={{
                          fontSize: 10,
                          color: realmColor,
                          border: `1px solid ${realmColor}`,
                          padding: '1px 6px',
                          borderRadius: 2
                        }}>
                          {s.realm.toUpperCase()}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
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

        {/* ================= ONGLET PERSO ================= */}
        {activeTab === 'perso' && (
          <div style={{
            maxWidth: 680,
            background: 'rgba(23, 32, 48, 0.94)',
            border: '4px solid #241812',
            boxShadow: 'inset 3px 3px 0 #435472, inset -3px -3px 0 #131a26, 0 10px 0 rgba(0,0,0,0.5)',
            padding: 24,
            borderRadius: 4
          }}>
            <h3 style={{ fontSize: 18, color: '#facc15', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Shield size={18} /> Héros & Panthéon
            </h3>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#94a3b8', marginBottom: 6 }}>
                Nom du Personnage :
              </label>
              <input
                type="text"
                value={heroName}
                onChange={(e) => onChangeHeroName(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#0f1726',
                  border: '3px solid #241812',
                  boxShadow: 'inset 2px 2px 0 #070c14, inset -2px -2px 0 #283750',
                  color: '#fff',
                  fontFamily: 'Silkscreen, monospace',
                  fontSize: 14,
                  padding: '8px 12px',
                  outline: 'none',
                  borderRadius: 4
                }}
              />
            </div>

            <label style={{ display: 'block', fontSize: 11, color: '#94a3b8', marginBottom: 6 }}>
              Choisir un Dieu Tutélaire :
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
              {(Object.keys(GODS_LORE) as GodAffinity[]).map((godKey) => {
                const g = GODS_LORE[godKey];
                const isSelected = selectedGod === godKey;
                return (
                  <button
                    key={godKey}
                    onClick={() => onSelectGod(godKey)}
                    style={{
                      backgroundColor: isSelected ? '#334460' : 'rgba(15, 22, 34, 0.7)',
                      border: isSelected ? `3px solid ${g.color}` : '3px solid #2b384e',
                      boxShadow: isSelected ? 'inset 2px 2px 0 #52678c, inset -2px -2px 0 #1a2332' : 'none',
                      padding: '10px 6px',
                      cursor: 'pointer',
                      borderRadius: 4,
                      textAlign: 'center',
                      fontFamily: 'Silkscreen, monospace'
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 'bold', color: isSelected ? g.color : '#e2e8f0' }}>
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
              backgroundColor: '#0f1726',
              borderLeft: `4px solid ${godLore.color}`,
              borderTop: '2px solid #2b384e',
              borderRight: '2px solid #2b384e',
              borderBottom: '2px solid #2b384e',
              padding: '10px 14px',
              borderRadius: 4
            }}>
              <div style={{ fontSize: 13, fontWeight: 'bold', color: godLore.color }}>
                {godLore.name} — {godLore.title}
              </div>
              <p style={{ fontSize: 11, color: '#94a3b8', margin: '4px 0', lineHeight: 1.4 }}>
                {godLore.description}
              </p>
              <div style={{ fontSize: 11, color: '#facc15', fontWeight: 'bold' }}>
                Don Divin : {godLore.passiveBonus}
              </div>
            </div>
          </div>
        )}

        {/* ================= ONGLET AMIS ================= */}
        {activeTab === 'amis' && (
          <div style={{
            maxWidth: 680,
            background: 'rgba(23, 32, 48, 0.94)',
            border: '4px solid #241812',
            boxShadow: 'inset 3px 3px 0 #435472, inset -3px -3px 0 #131a26, 0 10px 0 rgba(0,0,0,0.5)',
            padding: 24,
            borderRadius: 4
          }}>
            <h3 style={{ fontSize: 18, color: '#facc15', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Swords size={18} /> Héros & Guilde
            </h3>
            <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16 }}>
              Liste des aventuriers alliés et compagnons de quête.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ background: '#121927', padding: '10px 14px', border: '2px solid #2f3e58', display: 'flex', justifyContent: 'space-between', borderRadius: 4 }}>
                <span style={{ color: '#fff', fontSize: 12 }}>Patrocle (Niv. 14)</span>
                <span style={{ color: '#4ade80', fontSize: 11 }}>En jeu • Olympe #1</span>
              </div>
              <div style={{ background: '#121927', padding: '10px 14px', border: '2px solid #2f3e58', display: 'flex', justifyContent: 'space-between', borderRadius: 4 }}>
                <span style={{ color: '#fff', fontSize: 12 }}>Ulysse (Niv. 22)</span>
                <span style={{ color: '#94a3b8', fontSize: 11 }}>Hors-ligne</span>
              </div>
              <div style={{ background: '#121927', padding: '10px 14px', border: '2px solid #2f3e58', display: 'flex', justifyContent: 'space-between', borderRadius: 4 }}>
                <span style={{ color: '#fff', fontSize: 12 }}>Hélène (Niv. 9)</span>
                <span style={{ color: '#4ade80', fontSize: 11 }}>En jeu • Élysée #1</span>
              </div>
            </div>
          </div>
        )}

        {/* ================= ONGLET OPTION ================= */}
        {activeTab === 'option' && (
          <div style={{
            maxWidth: 680,
            background: 'rgba(23, 32, 48, 0.94)',
            border: '4px solid #241812',
            boxShadow: 'inset 3px 3px 0 #435472, inset -3px -3px 0 #131a26, 0 10px 0 rgba(0,0,0,0.5)',
            padding: 24,
            borderRadius: 4
          }}>
            <h3 style={{ fontSize: 18, color: '#facc15', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Settings size={18} /> Paramètres de Jeu
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ background: '#121927', padding: '12px 16px', border: '2px solid #2f3e58', borderRadius: 4 }}>
                <div style={{ fontSize: 12, color: '#fff', fontWeight: 'bold' }}>Contrôles en Jeu :</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                  • <b>Z, Q, S, D</b> ou <b>Flèches</b> : Déplacement 8 directions (Vue dessus)<br />
                  • <b>Q, D</b> : Course / <b>ESPACE</b> : Saut avec gravité (Vue profil)<br />
                  • <b>Touche V</b> : Basculer immédiatement entre les deux perspectives
                </div>
              </div>

              <div style={{ background: '#121927', padding: '12px 16px', border: '2px solid #2f3e58', borderRadius: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#fff' }}>Moteur de rendu graphique</span>
                <span style={{ color: '#facc15', fontSize: 11 }}>PixiJS v8 (WebGL)</span>
              </div>

              <div style={{ background: '#121927', padding: '12px 16px', border: '2px solid #2f3e58', borderRadius: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#fff' }}>Résolution native</span>
                <span style={{ color: '#38bdf8', fontSize: 11 }}>Plein écran adaptable</span>
              </div>
            </div>
          </div>
        )}

        {/* ================= ONGLET CREDITS ================= */}
        {activeTab === 'credits' && (
          <div style={{
            maxWidth: 680,
            background: 'rgba(23, 32, 48, 0.94)',
            border: '4px solid #241812',
            boxShadow: 'inset 3px 3px 0 #435472, inset -3px -3px 0 #131a26, 0 10px 0 rgba(0,0,0,0.5)',
            padding: 24,
            borderRadius: 4
          }}>
            <h3 style={{ fontSize: 18, color: '#facc15', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <HelpCircle size={18} /> Crédits & Équipe BUT3
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ background: '#121927', padding: '10px 14px', border: '2px solid #2f3e58', borderRadius: 4 }}>
                <span style={{ color: '#facc15', fontSize: 12, fontWeight: 'bold' }}>Pôle Développement</span>
                <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 2 }}>
                  Moteur PixiJS 2D, interface Lobby pixel art, contrôles et transitions de vue.
                </div>
              </div>

              <div style={{ background: '#121927', padding: '10px 14px', border: '2px solid #2f3e58', borderRadius: 4 }}>
                <span style={{ color: '#38bdf8', fontSize: 12, fontWeight: 'bold' }}>Pôle Réseau</span>
                <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 2 }}>
                  Serveur WebSocket, boucle de synchronisation temps réel et gestion des mondes.
                </div>
              </div>

              <div style={{ background: '#121927', padding: '10px 14px', border: '2px solid #2f3e58', borderRadius: 4 }}>
                <span style={{ color: '#a855f7', fontSize: 12, fontWeight: 'bold' }}>Pôle Base de Données</span>
                <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 2 }}>
                  Modélisation PostgreSQL, persistance des personnages, inventaires et API REST.
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
