import { useState } from 'react';
import { GodAffinity, MAX_NAME_LENGTH, ServerInfo } from '@greek-myth/shared';
import { DEFAULT_SERVERS } from './config/servers';
import { TitleScreen } from './components/Lobby/TitleScreen';
import { GameCanvas } from './components/Game/GameCanvas';

// meme regle que le serveur : pas de caracteres de controle, 20 caracteres max
const cleanName = (name: string) => name.replace(/[\u0000-\u001f\u007f]/g, '').slice(0, MAX_NAME_LENGTH);

export default function App() {
  const [inGame, setInGame] = useState(false);
  const [server, setServer] = useState<ServerInfo>(DEFAULT_SERVERS[0]);
  const [god, setGod] = useState<GodAffinity>('ZEUS');
  const [heroName, setHeroName] = useState('Achille');

  if (inGame) {
    return (
      <GameCanvas
        server={server}
        god={god}
        heroName={heroName.trim()}
        onLeave={() => setInGame(false)}
      />
    );
  }

  return (
    <TitleScreen
      servers={DEFAULT_SERVERS}
      selectedServer={server}
      onSelectServer={setServer}
      selectedGod={god}
      onSelectGod={setGod}
      heroName={heroName}
      onChangeHeroName={(name) => setHeroName(cleanName(name))}
      onEnterGame={() => setInGame(true)}
    />
  );
}
