import React from 'react';
import { GodAffinity, GODS_LORE, ServerInfo } from '@greek-myth/shared';
import {
  Shield,
  Zap,
  Globe,
  Users,
  Wifi,
  Sparkles,
  ChevronRight
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
      position: 'relative',
      overflow: 'hidden',
      background: 'radial-gradient(ellipse at 50% 20%, #161c2d 0%, #0a0d16 60%, #05070a 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '30px 48px'
    }}>
      <div style={{
        position: 'absolute',
        top: '-150px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(234, 179, 8, 0.15) 0%, rgba(0,0,0,0) 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      <header style={{ textAlign: 'center', position: 'relative', zIndex: 1, marginTop: 10 }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 16px',
          background: 'rgba(234, 179, 8, 0.1)',
          border: '1px solid rgba(234, 179, 8, 0.3)',
          borderRadius: 20,
          color: '#facc15',
          fontSize: 12,
          letterSpacing: 2,
          textTransform: 'uppercase',
          marginBottom: 12
        }}>
          <Sparkles size={14} /> MMORPG 2D
        </div>

        <h1 style={{
          fontFamily: 'Cinzel Decorative, Cinzel, serif',
          fontSize: 54,
          fontWeight: 900,
          letterSpacing: 6,
          background: 'linear-gradient(180deg, #ffffff 20%, #e2e8f0 40%, #d4af37 80%, #854d0e 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 6px 18px rgba(212, 175, 55, 0.3))',
          margin: 0
        }}>
          MYTHOLOGIA
        </h1>

        <p style={{
          fontFamily: 'Cinzel, serif',
          color: '#cbd5e1',
          fontSize: 16,
          letterSpacing: 4,
          textTransform: 'uppercase',
          marginTop: 6,
          opacity: 0.9
        }}>
          L'Aube des Dieux & des Héros
        </p>
      </header>

      <main style={{
        maxWidth: 1200,
        width: '100%',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1fr 1.35fr',
        gap: 32,
        position: 'relative',
        zIndex: 1
      }}>
        <section style={{
          background: 'rgba(15, 20, 32, 0.75)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(212, 175, 55, 0.25)',
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5)'
        }}>
          <h2 style={{
            fontFamily: 'Cinzel, serif',
            color: '#facc15',
            fontSize: 18,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 18,
            letterSpacing: 1
          }}>
            <Shield size={20} /> Profil du Héros
          </h2>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
              Nom d'Aventurier
            </label>
            <input
              type="text"
              value={heroName}
              onChange={(e) => onChangeHeroName(e.target.value)}
              placeholder="Ex: Achille, Persée, Héraclès..."
              style={{
                width: '100%',
                background: 'rgba(5, 8, 14, 0.8)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                borderRadius: 8,
                padding: '10px 14px',
                color: '#fff',
                fontSize: 15,
                outline: 'none',
                fontFamily: 'Outfit, sans-serif'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              Allégeance au Panthéon
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
              {(Object.keys(GODS_LORE) as GodAffinity[]).map((godKey) => {
                const g = GODS_LORE[godKey];
                const isSelected = selectedGod === godKey;
                return (
                  <button
                    key={godKey}
                    onClick={() => onSelectGod(godKey)}
                    style={{
                      background: isSelected ? 'rgba(234, 179, 8, 0.2)' : 'rgba(10, 14, 24, 0.6)',
                      border: isSelected ? `2px solid ${g.color}` : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 10,
                      padding: '10px 6px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s',
                      transform: isSelected ? 'scale(1.03)' : 'none'
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 'bold', color: isSelected ? g.color : '#e2e8f0', fontFamily: 'Cinzel, serif' }}>
                      {g.name}
                    </div>
                    <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2, textTransform: 'capitalize' }}>
                      {g.realm}
                    </div>
                  </button>
                );
              })}
            </div>

            <div style={{
              background: 'rgba(5, 8, 14, 0.6)',
              borderLeft: `4px solid ${godLore.color}`,
              borderRadius: '0 8px 8px 0',
              padding: '12px 16px'
            }}>
              <div style={{ fontSize: 15, fontWeight: 'bold', color: godLore.color, fontFamily: 'Cinzel, serif' }}>
                {godLore.name} — {godLore.title}
              </div>
              <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4, lineHeight: 1.4 }}>
                {godLore.description}
              </p>
              <div style={{ marginTop: 8, fontSize: 12, color: '#facc15', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Zap size={14} /> Don Divin : {godLore.passiveBonus}
              </div>
            </div>
          </div>
        </section>

        <section style={{
          background: 'rgba(15, 20, 32, 0.75)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(212, 175, 55, 0.25)',
          borderRadius: 16,
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5)'
        }}>
          <div>
            <h2 style={{
              fontFamily: 'Cinzel, serif',
              color: '#facc15',
              fontSize: 18,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 18,
              letterSpacing: 1
            }}>
              <Globe size={20} /> Choix du Monde / Serveur
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {servers.map((s) => {
                const isSelected = selectedServer.id === s.id;
                const realmColor = getRealmColor(s.realm);
                return (
                  <div
                    key={s.id}
                    onClick={() => onSelectServer(s)}
                    style={{
                      background: isSelected ? 'rgba(234, 179, 8, 0.12)' : 'rgba(10, 14, 24, 0.6)',
                      border: isSelected ? '2px solid #facc15' : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 12,
                      padding: '14px 18px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s',
                      transform: isSelected ? 'translateX(6px)' : 'none'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: s.status === 'online' ? '#4ade80' : '#f59e0b'
                        }} />
                        <span style={{ fontSize: 16, fontWeight: 'bold', color: '#fff', fontFamily: 'Cinzel, serif' }}>
                          {s.name}
                        </span>
                        <span style={{
                          fontSize: 11,
                          color: realmColor,
                          background: 'rgba(255,255,255,0.05)',
                          padding: '2px 8px',
                          borderRadius: 6,
                          fontWeight: 'bold',
                          textTransform: 'uppercase'
                        }}>
                          {s.realm}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                        {s.description}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ fontSize: 13, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                        <Users size={14} /> {s.playerCount}/{s.maxPlayers}
                      </div>
                      <div style={{ fontSize: 11, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                        <Wifi size={12} /> {s.pingMs} ms
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ marginTop: 24 }}>
            <button
              onClick={onEnterGame}
              disabled={!heroName.trim()}
              style={{
                width: '100%',
                background: heroName.trim()
                  ? 'linear-gradient(135deg, #d4af37 0%, #ca8a04 50%, #854d0e 100%)'
                  : 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: 12,
                color: heroName.trim() ? '#000' : '#64748b',
                fontFamily: 'Cinzel, serif',
                fontSize: 18,
                fontWeight: 'bold',
                padding: '16px',
                cursor: heroName.trim() ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                boxShadow: heroName.trim() ? '0 8px 24px rgba(212, 175, 55, 0.4)' : 'none',
                transition: 'all 0.2s',
                letterSpacing: 2
              }}
            >
              <span>REJOINDRE LE ROYAUME</span>
              <ChevronRight size={22} />
            </button>
            <div style={{ textAlign: 'center', fontSize: 12, color: '#64748b', marginTop: 8 }}>
              {heroName.trim() ? `Prêt à entrer sur ${selectedServer.name}` : "Veuillez saisir un nom de héros"}
            </div>
          </div>
        </section>
      </main>

      <footer style={{
        textAlign: 'center',
        color: '#64748b',
        fontSize: 12,
        position: 'relative',
        zIndex: 1,
        marginBottom: 10
      }}>
        Mythologia 2D — Prototype Client & Moteur
      </footer>
    </div>
  );
};
