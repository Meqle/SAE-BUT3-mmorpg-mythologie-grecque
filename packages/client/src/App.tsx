import React, { useState } from 'react';
import { GodAffinity, ServerInfo } from '@greek-myth/shared';
import { TitleScreen } from './components/Lobby/TitleScreen';
import { GameCanvas } from './components/Game/GameCanvas';

const DEFAULT_SERVERS: ServerInfo[] = [
  {
    id: 'olympus-1',
    name: 'Mont Olympe #1',
    realm: 'olympus',
    description: 'Le sommet céleste des Dieux. Royaume de Zeus & Poséidon.',
    host: 'localhost',
    port: 3001,
    playerCount: 142,
    maxPlayers: 200,
    status: 'online',
    pingMs: 14
  },
  {
    id: 'elysium-1',
    name: 'Champs Élysées #1',
    realm: 'elysium',
    description: 'Terre sacrée des héros légendaires, sanctuaire d\'Athéna et Apollon.',
    host: 'localhost',
    port: 3001,
    playerCount: 88,
    maxPlayers: 200,
    status: 'online',
    pingMs: 18
  },
  {
    id: 'tartarus-1',
    name: 'Gouffre du Tartare #1',
    realm: 'tartarus',
    description: 'Abîme ténébreux gardé par Hadès. Monstres et titans scellés.',
    host: 'localhost',
    port: 3001,
    playerCount: 195,
    maxPlayers: 200,
    status: 'busy',
    pingMs: 25
  }
];

// meme regle que le serveur : pas de caracteres de controle, 20 caracteres max
const MAX_NAME_LENGTH = 20;
const cleanName = (name: string) => name.replace(/[\u0000-\u001f\u007f]/g, '').slice(0, MAX_NAME_LENGTH);

export const App: React.FC = () => {
  const [inGame, setInGame] = useState<boolean>(false);
  const [servers] = useState<ServerInfo[]>(DEFAULT_SERVERS);
  const [selectedServer, setSelectedServer] = useState<ServerInfo>(DEFAULT_SERVERS[0]);
  const [selectedGod, setSelectedGod] = useState<GodAffinity>('ZEUS');
  const [heroName, setHeroName] = useState<string>('Achille');

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {!inGame ? (
        <TitleScreen
          servers={servers}
          selectedServer={selectedServer}
          onSelectServer={setSelectedServer}
          selectedGod={selectedGod}
          onSelectGod={setSelectedGod}
          heroName={heroName}
          onChangeHeroName={(name) => setHeroName(cleanName(name))}
          onEnterGame={() => setInGame(true)}
        />
      ) : (
        <GameCanvas
          server={selectedServer}
          selectedGod={selectedGod}
          heroName={heroName.trim()}
          onLeave={() => setInGame(false)}
        />
      )}
    </div>
  );
};

export default App;
