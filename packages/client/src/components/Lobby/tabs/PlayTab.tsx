import { GodLore, ServerInfo } from '@greek-myth/shared';
import { Flame, Play, RotateCcw } from 'lucide-react';
import { HERO_CLASSES, HeroClassId } from '../../../game/data/classes';
import { box, Panel, realmColor } from '../Panel';

interface PlayTabProps {
  heroName: string;
  heroClass: HeroClassId;
  god: GodLore;
  server: ServerInfo;
  hasSave: boolean;
  savedLevel?: number;
  onEnterGame: (forceNew: boolean) => void;
}

export function PlayTab({ heroName, heroClass, god, server, hasSave, savedLevel, onEnterGame }: PlayTabProps) {
  const canPlay = heroName.trim().length > 0;
  const cls = HERO_CLASSES[heroClass];

  return (
    <Panel>
      <div style={{ ...box, backgroundColor: '#0c1320', padding: '10px 12px', marginBottom: 12, borderLeft: '3px solid #f97316' }}>
        <div style={{ fontSize: 10, color: '#facc15', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Flame size={13} color="#f97316" /> LA FIN DE LA SOUMISSION
        </div>
        <div style={{ fontSize: 9, color: '#cbd5e1', marginTop: 4, lineHeight: 1.5 }}>
          Zeus a déchaîné les fléaux sur la Grèce. Depuis le Caucase, Prométhée éveille votre Étincelle sur l'Agora de l'Olympe.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        <div style={{ ...box, padding: 10 }}>
          <div style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase' }}>Héros & Classe</div>
          <div style={{ color: '#fff', fontSize: 12, fontWeight: 'bold', marginTop: 4 }}>{heroName || 'Sans nom'}</div>
          <div style={{ fontSize: 9, color: cls.accentColor, marginTop: 3 }}>
            {cls.name} • {hasSave ? `Sauvegarde Niv. ${savedLevel}` : 'Nouveau héros'}
          </div>
        </div>
        <div style={{ ...box, padding: 10 }}>
          <div style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase' }}>Royaume & Étincelle</div>
          <div style={{ color: realmColor[server.realm], fontSize: 11, fontWeight: 'bold', marginTop: 4 }}>{server.name}</div>
          <div style={{ fontSize: 9, color: god.color, marginTop: 3 }}>{god.name} ({god.passiveBonus})</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button
          onClick={() => onEnterGame(false)}
          disabled={!canPlay}
          style={{
            width: '100%',
            backgroundColor: canPlay ? '#d4af37' : '#574e40',
            color: canPlay ? '#1a1406' : '#8a8070',
            border: '3px solid #241812',
            boxShadow: canPlay ? 'inset 2px 2px 0 #fef08a, inset -2px -2px 0 #854d0e, 0 4px 0 #140d09' : 'none',
            fontFamily: 'Silkscreen, monospace',
            fontSize: 14,
            fontWeight: 'bold',
            padding: 13,
            cursor: canPlay ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            borderRadius: 4
          }}
        >
          <Play size={17} fill="#1a1406" />
          <span>{hasSave ? "CONTINUER L'AVENTURE" : "COMMENCER L'AVENTURE"}</span>
        </button>

        {hasSave && canPlay && (
          <button
            onClick={() => onEnterGame(true)}
            style={{
              width: '100%',
              backgroundColor: '#131d2e',
              color: '#cbd5e1',
              border: '2px solid #334155',
              fontFamily: 'Silkscreen, monospace',
              fontSize: 10,
              padding: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              borderRadius: 4
            }}
          >
            <RotateCcw size={12} /> Recommencer depuis le Prologue
          </button>
        )}
      </div>
    </Panel>
  );
}
