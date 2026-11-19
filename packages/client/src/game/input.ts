export interface Keyboard {
  isUp: () => boolean;
  isDown: () => boolean;
  isLeft: () => boolean;
  isRight: () => boolean;
  isJump: () => boolean;
  isAttackHeld: () => boolean;
  consumeAttack: () => boolean;
  consumeSpecial: () => boolean;
  consumeInteract: () => boolean;
  consumeDash: () => boolean;
  consumePotion: () => boolean;
  setBlocked: (blocked: boolean) => void;
  dispose: () => void;
}

export const touch = {
  up: false,
  down: false,
  left: false,
  right: false,
  jump: false,
  attack: false,
  special: false,
  interact: false
};

const WATCHED_KEYS = [
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
  'KeyW', 'KeyS', 'KeyA', 'KeyD', 'Space',
  'KeyE', 'KeyJ', 'KeyK', 'KeyR', 'ShiftLeft', 'ShiftRight'
];

export function createKeyboard(): Keyboard {
  const keys: Record<string, boolean> = {};
  let blocked = false;
  let attackQueued = false;
  let specialQueued = false;
  let interactQueued = false;
  let dashQueued = false;
  let potionQueued = false;

  const onKeyDown = (e: KeyboardEvent) => {
    if (blocked) return;
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    if (WATCHED_KEYS.includes(e.code)) {
      if (!keys[e.code]) {
        if (e.code === 'KeyJ') attackQueued = true;
        if (e.code === 'KeyK') specialQueued = true;
        if (e.code === 'KeyE') interactQueued = true;
        if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') dashQueued = true;
        if (e.code === 'KeyR') potionQueued = true;
      }
      keys[e.code] = true;
    }
  };

  const onKeyUp = (e: KeyboardEvent) => {
    if (WATCHED_KEYS.includes(e.code)) keys[e.code] = false;
  };

  const releaseAll = () => {
    for (const k in keys) keys[k] = false;
    touch.up = touch.down = touch.left = touch.right = touch.jump = false;
    touch.attack = touch.special = touch.interact = false;
  };

  const onVisibility = () => {
    if (document.hidden) releaseAll();
  };

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', releaseAll);
  document.addEventListener('visibilitychange', onVisibility);

  const isUp = () => !blocked && !!(keys.ArrowUp || keys.KeyW || touch.up);

  return {
    isUp,
    isDown: () => !blocked && !!(keys.ArrowDown || keys.KeyS || touch.down),
    isLeft: () => !blocked && !!(keys.ArrowLeft || keys.KeyA || touch.left),
    isRight: () => !blocked && !!(keys.ArrowRight || keys.KeyD || touch.right),
    isJump: () => !blocked && (!!keys.Space || touch.jump || isUp()),
    isAttackHeld: () => !blocked && !!(keys.KeyJ || touch.attack),
    consumeAttack: () => {
      if (blocked) return false;
      const v = attackQueued || touch.attack;
      attackQueued = false;
      touch.attack = false;
      return v;
    },
    consumeSpecial: () => {
      if (blocked) return false;
      const v = specialQueued || touch.special;
      specialQueued = false;
      touch.special = false;
      return v;
    },
    consumeInteract: () => {
      if (blocked) return false;
      const v = interactQueued || touch.interact;
      interactQueued = false;
      touch.interact = false;
      return v;
    },
    consumeDash: () => {
      if (blocked) return false;
      const v = dashQueued;
      dashQueued = false;
      return v;
    },
    consumePotion: () => {
      if (blocked) return false;
      const v = potionQueued;
      potionQueued = false;
      return v;
    },
    setBlocked: (b: boolean) => {
      blocked = b;
      if (b) releaseAll();
    },
    dispose: () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', releaseAll);
      document.removeEventListener('visibilitychange', onVisibility);
      releaseAll();
    }
  };
}
