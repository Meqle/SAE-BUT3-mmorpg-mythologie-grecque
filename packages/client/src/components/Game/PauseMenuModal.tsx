import { useEffect, useState } from 'react';
import { Keyboard as KeyboardIcon, LogOut, Play, RotateCcw, Save, Settings, Skull } from 'lucide-react';
import {
  ACTION_LABELS,
  ACTION_ORDER,
  ActionKey,
  DEFAULT_SETTINGS,
  formatKeyEvent,
  GameSettings
} from '../../game/settings';
import { COLORS, css } from '../../game/scenes/palette';
import { BestiaryPanel } from './BestiaryPanel';

interface PauseMenuModalProps {
  settings: GameSettings;
  bestiaryKills?: Record<string, number>;
  onChangeSettings: (next: GameSettings) => void;
  onSaveNow: () => void;
  onResume: () => void;
  onQuitToLobby: () => void;
}

const MARBLE = css(COLORS.marble);
const GOLD = css(COLORS.gold);
const SKY = css(COLORS.sky);

export function PauseMenuModal({
  settings,
  bestiaryKills,
  onChangeSettings,
  onSaveNow,
  onResume,
  onQuitToLobby
}: PauseMenuModalProps) {
  const [view, setView] = useState<'main' | 'bestiary' | 'settings'>('main');
  const [listening, setListening] = useState<ActionKey | null>(null);

  useEffect(() => {
    if (!listening) return;
    const onKey = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.code === 'Escape') {
        setListening(null);
        return;
      }
      const binding = formatKeyEvent(e);
      onChangeSettings({
        ...settings,
        keys: { ...settings.keys, [listening]: binding }
      });
      setListening(null);
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [listening, settings, onChangeSettings]);

  const menuBtnStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px 16px',
    background: 'rgba(12, 22, 38, 0.82)',
    border: `1px solid ${SKY}`,
    borderRadius: 4,
    color: MARBLE,
    fontFamily: 'Cinzel, serif',
    fontSize: 13.5,
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  };

  const modalWidth = view === 'main' ? 'min(390px, 94vw)' : view === 'bestiary' ? 'min(760px, 95vw)' : 'min(640px, 95vw)';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 110,
        background: 'rgba(10, 16, 28, 0.72)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        fontFamily: 'Outfit, sans-serif'
      }}
    >
      <div
        style={{
          width: modalWidth,
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(24, 42, 66, 0.97)',
          border: `2px solid ${MARBLE}`,
          boxShadow: `inset 0 0 0 3px rgba(24, 42, 66, 0.97), inset 0 0 0 4px ${GOLD}, 0 20px 50px rgba(0,0,0,0.65)`,
          borderRadius: 6,
          padding: '22px 24px',
          color: MARBLE
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 20, fontWeight: 700, color: GOLD, letterSpacing: 1.5 }}>
            {view === 'main' ? 'PAUSE' : view === 'bestiary' ? 'BESTIAIRE' : 'PARAMÈTRES'}
          </div>
          {view === 'bestiary' && (
            <div style={{ fontSize: 11.5, color: SKY, marginTop: 3 }}>
              Créatures rencontrées et taux de drop par rareté
            </div>
          )}
        </div>

        {view === 'main' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              onClick={onResume}
              style={{ ...menuBtnStyle, background: GOLD, color: '#1f3550', borderColor: GOLD }}
            >
              <Play size={16} /> Reprendre
            </button>
            <button onClick={() => setView('bestiary')} style={menuBtnStyle}>
              <Skull size={16} /> Bestiaire
            </button>
            <button onClick={() => setView('settings')} style={menuBtnStyle}>
              <Settings size={16} /> Paramètres & Touches
            </button>
            <button onClick={onSaveNow} style={menuBtnStyle}>
              <Save size={16} /> Sauvegarder
            </button>
            <button
              onClick={onQuitToLobby}
              style={{ ...menuBtnStyle, borderColor: '#f87171', color: '#fecaca', marginTop: 6 }}
            >
              <LogOut size={16} /> Quitter vers le menu
            </button>
          </div>
        ) : view === 'bestiary' ? (
          <>
            <div style={{ overflowY: 'auto', flex: 1, paddingRight: 4 }}>
              <BestiaryPanel bestiaryKills={bestiaryKills} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
              <button
                onClick={() => setView('main')}
                style={{ ...menuBtnStyle, width: 'auto', padding: '8px 18px', background: GOLD, color: '#1f3550', borderColor: GOLD }}
              >
                Retour
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ overflowY: 'auto', flex: 1, paddingRight: 4 }}>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 14, padding: '10px 12px', background: 'rgba(12, 22, 38, 0.72)', borderRadius: 4 }}>
                {[
                  { key: 'showMinimap' as const, label: 'Mini-carte' },
                  { key: 'showQuestTracker' as const, label: 'Objectifs' },
                  { key: 'showDamageNumbers' as const, label: 'Dégâts flottants' },
                  { key: 'soundEnabled' as const, label: 'Effets sonores' }
                ].map((opt) => (
                  <label key={opt.key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={settings[opt.key]}
                      onChange={(e) => onChangeSettings({ ...settings, [opt.key]: e.target.checked })}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: SKY, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <KeyboardIcon size={14} /> Raccourcis clavier (cliquez pour modifier)
                </span>
                <button
                  onClick={() => {
                    setListening(null);
                    onChangeSettings(structuredClone(DEFAULT_SETTINGS));
                  }}
                  style={{
                    background: 'transparent',
                    border: `1px solid ${SKY}`,
                    color: SKY,
                    borderRadius: 3,
                    padding: '3px 8px',
                    fontSize: 11,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <RotateCcw size={11} /> Par défaut
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 6 }}>
                {ACTION_ORDER.map((action) => {
                  const isWaiting = listening === action;
                  return (
                    <div
                      key={action}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'rgba(12, 22, 38, 0.72)',
                        border: `1px solid ${isWaiting ? GOLD : 'rgba(143,195,230,0.28)'}`,
                        borderRadius: 4,
                        padding: '6px 10px',
                        fontSize: 12
                      }}
                    >
                      <span>{ACTION_LABELS[action]}</span>
                      <button
                        onClick={() => setListening(isWaiting ? null : action)}
                        style={{
                          background: isWaiting ? GOLD : 'rgba(31, 53, 80, 0.95)',
                          color: isWaiting ? '#1f3550' : GOLD,
                          border: `1px solid ${GOLD}`,
                          borderRadius: 3,
                          padding: '3px 9px',
                          fontSize: 11,
                          fontWeight: 700,
                          minWidth: 64,
                          cursor: 'pointer'
                        }}
                      >
                        {isWaiting ? 'Touche...' : settings.keys[action].label}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
              <button
                onClick={() => {
                  setListening(null);
                  setView('main');
                }}
                style={{ ...menuBtnStyle, width: 'auto', padding: '8px 18px', background: GOLD, color: '#1f3550', borderColor: GOLD }}
              >
                Retour
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
