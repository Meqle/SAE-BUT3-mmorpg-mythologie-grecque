import { useState } from 'react';
import { GodAffinity, MAX_NAME_LENGTH, ServerInfo } from '@greek-myth/shared';
import { DEFAULT_SERVERS } from './config/servers';
import type { HeroClassId } from './game/data/classes';
import { clearSavedGameState, createNewGameState, GameProgressState, loadGameState } from './game/state/gameState';
import { TitleScreen } from './components/Lobby/TitleScreen';
import { GameCanvas } from './components/Game/GameCanvas';

const cleanName = (name: string) => name.replace(/[\u0000-\u001f\u007f]/g, '').slice(0, MAX_NAME_LENGTH);

export default function App() {
  const [activeState, setActiveState] = useState<GameProgressState | null>(null);
  const [server, setServer] = useState<ServerInfo>(DEFAULT_SERVERS[0]);
  const [heroClass, setHeroClass] = useState<HeroClassId>('GUERRIER');
  const [god, setGod] = useState<GodAffinity>('ZEUS');
  const [heroName, setHeroName] = useState('Achille');

  const handleEnterGame = (forceNew: boolean) => {
    const clean = heroName.trim();
    if (!clean) return;
    if (forceNew) {
      clearSavedGameState(clean);
      setActiveState(createNewGameState(clean, heroClass, god));
      return;
    }
    const loaded = loadGameState(clean);
    if (loaded) {
      setActiveState(loaded);
    } else {
      setActiveState(createNewGameState(clean, heroClass, god));
    }
  };

  if (activeState) {
    return (
      <GameCanvas
        server={server}
        initialState={activeState}
        onLeave={() => setActiveState(null)}
      />
    );
  }

  return (
    <TitleScreen
      servers={DEFAULT_SERVERS}
      selectedServer={server}
      onSelectServer={setServer}
      selectedClass={heroClass}
      onSelectClass={setHeroClass}
      selectedGod={god}
      onSelectGod={setGod}
      heroName={heroName}
      onChangeHeroName={(name) => setHeroName(cleanName(name))}
      onEnterGame={handleEnterGame}
    />
  );
}
