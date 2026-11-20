import { useState } from 'react';
import { GodAffinity, GODS_LORE, ServerInfo } from '@greek-myth/shared';
import type { HeroClassId } from '../../game/data/classes';
import { loadGameState } from '../../game/state/gameState';
import { PlayTab } from './tabs/PlayTab';
import { ServerTab } from './tabs/ServerTab';
import { HeroTab } from './tabs/HeroTab';
import { CreditsTab, FriendsTab, OptionsTab } from './tabs/InfoTabs';
import { useScreen } from '../../game/useScreen';

interface TitleScreenProps {
  servers: ServerInfo[];
  selectedServer: ServerInfo;
  onSelectServer: (server: ServerInfo) => void;
  selectedClass: HeroClassId;
  onSelectClass: (cls: HeroClassId) => void;
  selectedGod: GodAffinity;
  onSelectGod: (god: GodAffinity) => void;
  heroName: string;
  onChangeHeroName: (name: string) => void;
  onEnterGame: (forceNew: boolean) => void;
}

type MenuTab = 'play' | 'serveur' | 'perso' | 'amis' | 'option' | 'credits';

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
  const { compact } = useScreen();
  const saved = props.heroName.trim() ? loadGameState(props.heroName) : null;

  const content = (
    <>
      {tab === 'play' && (
        <PlayTab
          heroName={props.heroName}
          heroClass={props.selectedClass}
          god={GODS_LORE[props.selectedGod]}
          server={props.selectedServer}
          hasSave={Boolean(saved)}
          savedLevel={saved?.level}
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
          selectedClass={props.selectedClass}
          onSelectClass={props.onSelectClass}
          selectedGod={props.selectedGod}
          onSelectGod={props.onSelectGod}
        />
      )}
      {tab === 'amis' && <FriendsTab />}
      {tab === 'option' && <OptionsTab />}
      {tab === 'credits' && <CreditsTab />}
    </>
  );

  if (compact) {
    return (
      <div style={{
        width: '100vw',
        height: '100dvh',
        backgroundColor: '#18202d',
        backgroundImage: "url('/assets/lobby-bg.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        imageRendering: 'pixelated',
        display: 'flex',
        flexDirection: 'column',
        padding: 'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)'
      }}>
        <div style={{ display: 'flex', gap: 6, padding: 8, overflowX: 'auto', background: 'rgba(20, 14, 10, 0.85)', flexShrink: 0 }}>
          {MENU.map((btn) => {
            const active = tab === btn.id;
            return (
              <button
                key={btn.id}
                onClick={() => setTab(btn.id)}
                style={{
                  flexShrink: 0,
                  padding: '8px 12px',
                  fontFamily: 'Silkscreen, monospace',
                  fontSize: 11,
                  color: active ? '#1a1406' : '#e2e8f0',
                  backgroundColor: active ? '#d4af37' : '#263245',
                  border: `2px solid ${active ? '#fef08a' : '#4a5568'}`,
                  borderRadius: 4,
                  cursor: 'pointer'
                }}
              >
                {btn.label}
              </button>
            );
          })}
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
          <div style={{ width: '100%', maxWidth: 520 }}>{content}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      width: '100vw',
      height: '100dvh',
      backgroundColor: '#18202d',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      fontFamily: 'Silkscreen, monospace'
    }}>
      <div style={{
        position: 'relative',
        width: 'min(100vw, 177.78vh)',
        height: 'min(100vh, 56.25vw)',
        backgroundImage: "url('/assets/lobby-bg.png')",
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated'
      }}>
        {MENU.map((btn) => {
          const active = tab === btn.id;
          return (
            <button
              key={btn.id}
              onClick={() => setTab(btn.id)}
              title={btn.label}
              style={{
                position: 'absolute',
                left: '6.25%',
                top: btn.top,
                width: '21.75%',
                height: '10.95%',
                background: active ? 'rgba(250, 204, 21, 0.22)' : 'transparent',
                border: active ? '2px solid rgba(250, 204, 21, 0.8)' : 'none',
                borderRadius: 4,
                cursor: 'pointer',
                outline: 'none'
              }}
            />
          );
        })}

        <div style={{
          position: 'absolute',
          left: '34%',
          top: '8%',
          width: '57%',
          height: '82%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ width: '100%', maxHeight: '100%', overflowY: 'auto' }}>{content}</div>
        </div>
      </div>
    </div>
  );
}
