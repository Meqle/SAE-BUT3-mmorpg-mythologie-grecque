// lecture du clavier (fleches, ZQSD / WASD, espace)

export interface Keyboard {
  isUp: () => boolean;
  isDown: () => boolean;
  isLeft: () => boolean;
  isRight: () => boolean;
  isJump: () => boolean;
  dispose: () => void;
}

const WATCHED_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyS', 'KeyA', 'KeyD', 'Space'];

export function createKeyboard(): Keyboard {
  const keys: Record<string, boolean> = {};

  const onKeyDown = (e: KeyboardEvent) => {
    if (WATCHED_KEYS.includes(e.code)) keys[e.code] = true;
  };
  const onKeyUp = (e: KeyboardEvent) => {
    if (WATCHED_KEYS.includes(e.code)) keys[e.code] = false;
  };
  // si la fenetre perd le focus, on relache tout (sinon le perso avance tout seul)
  const releaseAll = () => {
    for (const k in keys) keys[k] = false;
  };
  const onVisibility = () => {
    if (document.hidden) releaseAll();
  };

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', releaseAll);
  document.addEventListener('visibilitychange', onVisibility);

  // KeyW / KeyA = Z / Q sur un clavier AZERTY (on lit la position de la touche)
  const isUp = () => !!(keys.ArrowUp || keys.KeyW);
  return {
    isUp,
    isDown: () => !!(keys.ArrowDown || keys.KeyS),
    isLeft: () => !!(keys.ArrowLeft || keys.KeyA),
    isRight: () => !!(keys.ArrowRight || keys.KeyD),
    isJump: () => !!keys.Space || isUp(),
    dispose: () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', releaseAll);
      document.removeEventListener('visibilitychange', onVisibility);
    }
  };
}
