import Phaser from "phaser";
import { ATTACK_DAMAGE, ATTACK_INTERVAL } from "../config/gameConfig";
import { Bullet } from "../entities/Bullet";
import { Enemy } from "../entities/Enemy";
import type { Player } from "../entities/Player";
import type { Weapon, WeaponHitHandler } from "./Weapon";

export class BasicGun implements Weapon {
  private readonly bulletGroup: Phaser.Physics.Arcade.Group;
  private readonly bulletOverlap: Phaser.Physics.Arcade.Collider;
  private attackDamage: number = ATTACK_DAMAGE;
  private attackInterval: number = ATTACK_INTERVAL;
  private attackTimer: Phaser.Time.TimerEvent;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly player: Player,
    private readonly getEnemies: () => Iterable<Enemy>,
    enemyGroup: Phaser.Physics.Arcade.Group,
    onHit: WeaponHitHandler,
  ) {
    this.bulletGroup = scene.physics.add.group();
    this.bulletOverlap = scene.physics.add.overlap(
      this.bulletGroup,
      enemyGroup,
      (bullet, enemy) => {
        if (!(bullet instanceof Bullet) || !(enemy instanceof Enemy)) return;
        if (!bullet.active || !enemy.active) return;
        bullet.destroy();
        // Upgrades still affect bullets that were already fired.
        onHit(enemy, this.damage);
      },
    );
    this.attackTimer = this.createAttackTimer();
  }

  get damage(): number {
    return this.attackDamage;
  }

  update(): void {
    // Arcade Physics moves bullets and invokes their overlap callback.
  }

  private createAttackTimer(): Phaser.Time.TimerEvent {
    return this.scene.time.addEvent({
      delay: this.attackInterval,
      callback: () => this.shoot(),
      loop: true,
    });
  }

  private shoot(): void {
    let nearest: Enemy | null = null;
    let minDistance = Infinity;
    for (const enemy of this.getEnemies()) {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        enemy.x,
        enemy.y,
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearest = enemy;
      }
    }
    if (nearest) new Bullet(this.scene, this.bulletGroup, this.player, nearest);
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
    if (this.bulletOverlap.world) this.bulletOverlap.destroy();
    this.scene.time.removeEvent(this.attackTimer);
    this.attackTimer.destroy();
    this.bulletGroup.destroy(true);
  }
}
