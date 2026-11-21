// commandes tactiles : joystick a gauche, bouton de saut a droite (vue de profil)
import { PointerEvent, useRef, useState } from 'react';
import { ViewMode } from '@greek-myth/shared';
import { touch } from '../../game/input';

const STICK_SIZE = 130;
const KNOB_SIZE = 56;

const base = {
  position: 'absolute' as const,
  bottom: 'calc(20px + env(safe-area-inset-bottom))',
  zIndex: 20,
  touchAction: 'none' as const
};

export function TouchControls({ viewMode }: { viewMode: ViewMode }) {
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const [jumping, setJumping] = useState(false);
  const stickRef = useRef<HTMLDivElement>(null);
  const sideView = viewMode === 'side-view';

  const stopStick = () => {
    touch.up = touch.down = touch.left = touch.right = false;
    setKnob({ x: 0, y: 0 });
  };

  // position du doigt par rapport au centre du joystick
  const moveStick = (e: PointerEvent<HTMLDivElement>) => {
    const box = stickRef.current!.getBoundingClientRect();
    const max = STICK_SIZE / 2;
    let dx = e.clientX - (box.left + max);
    let dy = e.clientY - (box.top + max);
    const len = Math.hypot(dx, dy);
    if (len > max) {
      dx = (dx / len) * max;
      dy = (dy / len) * max;
    }
    // le rond jaune reste dans le cercle (l'ecart sert quand meme au calcul)
    const lim = max - KNOB_SIZE / 2;
    const k = len > lim ? lim / len : 1;
    setKnob({ x: dx * k, y: dy * k });
    const dead = max * 0.3;
    touch.left = dx < -dead;
    touch.right = dx > dead;
    // en vue de profil on saute avec le bouton, pas avec le joystick
    touch.up = !sideView && dy < -dead;
    touch.down = !sideView && dy > dead;
  };

  const jump = (down: boolean) => {
    touch.jump = down;
    setJumping(down);
  };

  return (
    <>
      <div
        ref={stickRef}
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); moveStick(e); }}
        onPointerMove={(e) => { if (e.currentTarget.hasPointerCapture(e.pointerId)) moveStick(e); }}
        onPointerUp={stopStick}
        onPointerCancel={stopStick}
        onContextMenu={(e) => e.preventDefault()}
        style={{
          ...base,
          left: 'calc(20px + env(safe-area-inset-left))',
          width: STICK_SIZE,
          height: STICK_SIZE,
          borderRadius: '50%',
          background: 'rgba(31, 53, 80, 0.55)',
          border: '3px solid rgba(244, 236, 216, 0.7)'
        }}
      >
        <div style={{
          position: 'absolute',
          left: STICK_SIZE / 2 - KNOB_SIZE / 2 + knob.x - 3,
          top: STICK_SIZE / 2 - KNOB_SIZE / 2 + knob.y - 3,
          width: KNOB_SIZE,
          height: KNOB_SIZE,
          borderRadius: '50%',
          background: 'rgba(212, 175, 55, 0.9)',
          border: '3px solid #1f3550',
          pointerEvents: 'none'
        }} />
      </div>

      {sideView && (
        <div
          onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); jump(true); }}
          onPointerUp={() => jump(false)}
          onPointerCancel={() => jump(false)}
          onContextMenu={(e) => e.preventDefault()}
          style={{
            ...base,
            right: 'calc(20px + env(safe-area-inset-right))',
            width: 84,
            height: 84,
            borderRadius: '50%',
            background: jumping ? 'rgba(212, 175, 55, 0.95)' : 'rgba(212, 175, 55, 0.7)',
            border: '3px solid #1f3550',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1f3550',
            fontFamily: 'Cinzel, serif',
            fontWeight: 'bold',
            fontSize: 14
          }}
        >
          SAUT
        </div>
      )}
    </>
  );
}
