import Phaser from "phaser";
import { ENEMY_MAX_HP, ENEMY_SPEED } from "../config/gameConfig";

export class Enemy extends Phaser.GameObjects.Rectangle {
  declare body: Phaser.Physics.Arcade.Body;

  private hp: number = ENEMY_MAX_HP;
  private readonly flashTimers = new Set<Phaser.Time.TimerEvent>();

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 28, 28, 0xff5555);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setAllowGravity(false);
  }

  follow(target: { x: number; y: number }): void {
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const distance = Math.hypot(dx, dy);
    if (distance > 1) {
      this.body.setVelocity(
        (dx / distance) * ENEMY_SPEED,
        (dy / distance) * ENEMY_SPEED,
      );
    } else {
      this.body.setVelocity(0, 0);
    }
  }

  /** Returns whether this hit defeated the enemy. */
  takeDamage(damage: number): boolean {
    this.hp -= damage;
    if (this.hp <= 0) return true;
    this.setFillStyle(0xffffff);
    const timer = this.scene.time.delayedCall(100, () => {
      this.flashTimers.delete(timer);
      if (this.active) this.setFillStyle(0xff5555);
    });
    this.flashTimers.add(timer);
    return false;
  }

  override destroy(fromScene?: boolean): void {
    if (!this.scene) return;
    for (const timer of this.flashTimers) {
      this.scene.time.removeEvent(timer);
      timer.destroy();
    }
    this.flashTimers.clear();
    super.destroy(fromScene);
  }
}
