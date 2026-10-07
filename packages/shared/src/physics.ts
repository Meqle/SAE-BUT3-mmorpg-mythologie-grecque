// regles de deplacement communes (memes valeurs que le serveur)
import type { ViewMode } from './types.js';

export const PLAYER_SPEED = 220;
export const GRAVITY = 900;
export const JUMP_VELOCITY = -480;
export const GROUND_Y = 456;
export const MAX_NAME_LENGTH = 20;

export interface MoveInput {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  jumpStarted: boolean;
}

export interface MovingBody {
  x: number;
  y: number;
  vx: number;
  vy: number;
  isGrounded?: boolean;
}

// avance un corps de dt secondes selon les touches et le mode de vue
export function stepMovement(body: MovingBody, input: MoveInput, mode: ViewMode, dt: number): void {
  const horizontal = Number(input.right) - Number(input.left);
  const vertical = Number(input.down) - Number(input.up);
  const acceleration = 1 - Math.pow(0.75, dt * 60);

  if (mode === 'top-down') {
    // diagonale normalisee pour ne pas aller plus vite
    const length = Math.hypot(horizontal, vertical) || 1;
    body.vx += ((horizontal / length) * PLAYER_SPEED - body.vx) * acceleration;
    body.vy += ((vertical / length) * PLAYER_SPEED - body.vy) * acceleration;
    body.x += body.vx * dt;
    body.y += body.vy * dt;
    body.isGrounded = true;
    return;
  }

  // vue de profil : gravite + sol fixe
  body.vx += (horizontal * PLAYER_SPEED - body.vx) * acceleration;
  body.x += body.vx * dt;
  body.vy += GRAVITY * dt;
  body.y += body.vy * dt;
  body.isGrounded = body.y >= GROUND_Y;
  if (body.isGrounded) {
    body.y = GROUND_Y;
    body.vy = 0;
  }
  if (input.jumpStarted && body.isGrounded) {
    body.vy = JUMP_VELOCITY;
    body.isGrounded = false;
  }
}
