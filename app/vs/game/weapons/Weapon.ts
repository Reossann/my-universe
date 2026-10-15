import type { Enemy } from "../entities/Enemy";

export type WeaponHitHandler = (enemy: Enemy, damage: number) => void;

export interface Weapon {
  readonly damage: number;
  update(delta: number): void;
  increaseDamage(amount: number): void;
  increaseAttackSpeed(multiplier: number, minimumInterval: number): void;
  destroy(): void;
}
