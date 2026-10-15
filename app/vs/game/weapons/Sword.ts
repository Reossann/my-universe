import Phaser from "phaser";
import { SWORD_ATTACK_INTERVAL, SWORD_DAMAGE } from "../config/gameConfig";
import type { Player } from "../entities/Player";
import type { Enemy } from "../entities/Enemy";
import { SwordSlash } from "../entities/SwordSlash";
import type { Weapon, WeaponHitHandler } from "./Weapon";

export class Sword implements Weapon {
  private attackDamage: number = SWORD_DAMAGE;
  private attackInterval: number = SWORD_ATTACK_INTERVAL;
  private attackTimer: Phaser.Time.TimerEvent;
  private readonly slashes = new Set<SwordSlash>();

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly player: Player,
    private readonly getEnemies: () => Iterable<Enemy>,
    private readonly onHit: WeaponHitHandler,
  ) {
    this.attackTimer = this.createAttackTimer();
  }

  get damage(): number {
    return this.attackDamage;
  }

  private createAttackTimer(): Phaser.Time.TimerEvent {
    return this.scene.time.addEvent({
      delay: this.attackInterval,
      callback: () => this.attack(),
      loop: true,
    });
  }

  private attack(): void {
    const slash = new SwordSlash(this.scene, this.player, this.player.facingAngle);
    this.slashes.add(slash);
    slash.once(Phaser.GameObjects.Events.DESTROY, () => this.slashes.delete(slash));
  }

  update(delta: number): void {
    for (const slash of this.slashes) {
      slash.advance(delta, this.getEnemies(), this.damage, this.onHit);
    }
  }

  increaseDamage(amount: number): void {
    this.attackDamage += amount;
  }

  increaseAttackSpeed(multiplier: number, minimumInterval: number): void {
    this.attackInterval = Math.max(
      minimumInterval,
      Math.round(this.attackInterval * multiplier),
    );
    this.scene.time.removeEvent(this.attackTimer);
    this.attackTimer.destroy();
    this.attackTimer = this.createAttackTimer();
  }

  destroy(): void {
    this.scene.time.removeEvent(this.attackTimer);
    this.attackTimer.destroy();
    for (const slash of this.slashes) slash.destroy();
    this.slashes.clear();
  }
}
