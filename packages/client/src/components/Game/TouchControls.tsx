import { CSSProperties, PointerEvent } from 'react';
import { ViewMode } from '@greek-myth/shared';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Flame, Hand, Swords } from 'lucide-react';
import { touch } from '../../game/input';
import { COLORS, css } from '../../game/scenes/palette';

const MARBLE = css(COLORS.marble);
const GOLD = css(COLORS.gold);

const buttonStyle: CSSProperties = {
  width: 50,
  height: 50,
  borderRadius: '50%',
  background: 'rgba(31, 53, 80, 0.82)',
  border: `2px solid ${MARBLE}`,
  boxShadow: `inset 0 0 0 2px rgba(31, 53, 80, 0.82), inset 0 0 0 3px ${GOLD}, 0 4px 10px rgba(0, 0, 0, 0.35)`,
  color: MARBLE,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  touchAction: 'none',
  cursor: 'pointer'
};

type Key = keyof typeof touch;

function PadButton({ field, label, children, style }: { field: Key; label: string; children: React.ReactNode; style?: CSSProperties }) {
  const down = (e: PointerEvent) => {
    e.preventDefault();
    touch[field] = true;
  };
  const up = () => {
    touch[field] = false;
  };
  return (
    <button
      aria-label={label}
      style={{ ...buttonStyle, ...style }}
      onPointerDown={down}
      onPointerUp={up}
      onPointerCancel={up}
      onPointerLeave={up}
    >
      {children}
    </button>
  );
}

export function TouchControls({ viewMode }: { viewMode: ViewMode }) {
  const bottom = 'calc(18px + env(safe-area-inset-bottom))';
  const side = 'calc(16px + env(safe-area-inset-left))';
  const right = 'calc(16px + env(safe-area-inset-right))';

  return (
    <>
      {viewMode === 'side-view' ? (
        <div style={{ position: 'absolute', bottom, left: side, display: 'flex', gap: 12, zIndex: 25 }}>
          <PadButton field="left" label="Gauche"><ArrowLeft size={22} /></PadButton>
          <PadButton field="right" label="Droite"><ArrowRight size={22} /></PadButton>
        </div>
      ) : (
        <div style={{
          position: 'absolute', bottom, left: side, zIndex: 25,
          display: 'grid', gridTemplateColumns: 'repeat(3, 48px)', gridTemplateRows: 'repeat(3, 48px)', gap: 4
        }}>
          <div />
          <PadButton field="up" label="Haut" style={{ width: 48, height: 48 }}><ArrowUp size={20} /></PadButton>
          <div />
          <PadButton field="left" label="Gauche" style={{ width: 48, height: 48 }}><ArrowLeft size={20} /></PadButton>
          <div />
          <PadButton field="right" label="Droite" style={{ width: 48, height: 48 }}><ArrowRight size={20} /></PadButton>
          <div />
          <PadButton field="down" label="Bas" style={{ width: 48, height: 48 }}><ArrowDown size={20} /></PadButton>
          <div />
        </div>
      )}

      <div style={{ position: 'absolute', bottom, right, display: 'flex', gap: 10, zIndex: 25, alignItems: 'flex-end' }}>
        <PadButton field="interact" label="Interagir"><Hand size={20} color={GOLD} /></PadButton>
        <PadButton field="special" label="Pouvoir divin"><Flame size={20} color="#f97316" /></PadButton>
        <PadButton field="attack" label="Attaquer" style={{ width: 58, height: 58 }}><Swords size={24} color={GOLD} /></PadButton>
        {viewMode === 'side-view' && (
          <PadButton field="jump" label="Sauter" style={{ width: 58, height: 58 }}><ArrowUp size={24} /></PadButton>
        )}
      </div>
    </>
  );
}
