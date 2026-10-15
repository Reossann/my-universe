import Phaser from "phaser";
import { BULLET_LIFETIME, BULLET_SPEED } from "../config/gameConfig";

export class Bullet extends Phaser.GameObjects.Rectangle {
  declare body: Phaser.Physics.Arcade.Body;
  private lifetimeTimer?: Phaser.Time.TimerEvent;

  constructor(
    scene: Phaser.Scene,
    group: Phaser.Physics.Arcade.Group,
    origin: { x: number; y: number },
    target: Phaser.GameObjects.GameObject,
  ) {
    super(scene, origin.x, origin.y, 12, 12, 0xffff55);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    group.add(this);
    this.body.setAllowGravity(false);
    // Group insertion resets body defaults; set flight velocity afterward.
    scene.physics.moveToObject(this, target, BULLET_SPEED);
    this.lifetimeTimer = scene.time.delayedCall(BULLET_LIFETIME, () => {
      // Let the clock finish removing the currently executing event.
      this.lifetimeTimer = undefined;
      if (this.active) this.destroy();
    });
  }

  override destroy(fromScene?: boolean): void {
    if (!this.scene) return;
    if (this.lifetimeTimer) {
      this.scene.time.removeEvent(this.lifetimeTimer);
      this.lifetimeTimer.destroy();
      this.lifetimeTimer = undefined;
    }
    super.destroy(fromScene);
  }
}
