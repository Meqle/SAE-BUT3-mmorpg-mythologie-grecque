// lobby : image de fond pixel art + menu a gauche + onglet actif a droite
import { useState } from 'react';
import { GodAffinity, GODS_LORE, ServerInfo } from '@greek-myth/shared';
import { PlayTab } from './tabs/PlayTab';
import { ServerTab } from './tabs/ServerTab';
import { HeroTab } from './tabs/HeroTab';
import { CreditsTab, FriendsTab, OptionsTab } from './tabs/InfoTabs';

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

// les boutons sont dessines dans lobby-bg.png : on place des zones cliquables par-dessus
// (positions en % de l'image)
const MENU: { id: MenuTab; label: string; top: string }[] = [
  { id: 'play', label: 'PLAY', top: '11.80%' },
  { id: 'serveur', label: 'SERVEUR', top: '24.65%' },
  { id: 'perso', label: 'PERSO', top: '37.33%' },
  { id: 'amis', label: 'AMIS', top: '50.17%' },
  { id: 'option', label: 'OPTION', top: '63.02%' },
  { id: 'credits', label: 'CREDITS', top: '75.87%' }
];

export function TitleScreen(props: TitleScreenProps) {
  const [tab, setTab] = useState<MenuTab>('play');

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#18202d',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    }}>
      {/* image de fond en 16:9, centree */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: 'calc(100vh * (16 / 9))',
        height: '100%',
        maxHeight: 'calc(100vw * (9 / 16))',
        aspectRatio: '16 / 9',
        backgroundImage: "url('/assets/lobby-bg.png')",
        backgroundSize: '100% 100%',
        imageRendering: 'pixelated',
        boxShadow: '0 0 50px rgba(0, 0, 0, 0.9)'
      }}>
        {MENU.map((btn) => {
          const active = tab === btn.id;
          return (
            <button
              key={btn.id}
              title={btn.label}
              onClick={() => setTab(btn.id)}
              style={{
                position: 'absolute',
                left: '6.64%',
                width: '21%',
                top: btn.top,
                height: '10.07%',
                background: active ? 'rgba(250, 204, 21, 0.16)' : 'transparent',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                outline: 'none',
                boxShadow: active ? 'inset 0 0 0 3px #facc15, 0 0 8px rgba(250, 204, 21, 0.4)' : 'none',
                transition: 'all 0.08s'
              }}
            >
              {active && (
                <span style={{ position: 'absolute', right: -12, top: '50%', transform: 'translateY(-50%)', color: '#facc15', fontSize: 13 }}>
                  ▶
                </span>
              )}
            </button>
          );
        })}

        {/* contenu de l'onglet actif */}
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
          {tab === 'play' && (
            <PlayTab
              heroName={props.heroName}
              god={GODS_LORE[props.selectedGod]}
              server={props.selectedServer}
              onEnterGame={props.onEnterGame}
            />
          )}
          {tab === 'serveur' && (
            <ServerTab servers={props.servers} selected={props.selectedServer} onSelect={props.onSelectServer} />
          )}
          {tab === 'perso' && (
            <HeroTab
              heroName={props.heroName}
              onChangeHeroName={props.onChangeHeroName}
              selectedGod={props.selectedGod}
              onSelectGod={props.onSelectGod}
            />
          )}
          {tab === 'amis' && <FriendsTab />}
          {tab === 'option' && <OptionsTab />}
          {tab === 'credits' && <CreditsTab />}
        </div>
      </div>
    </div>
  );
}
