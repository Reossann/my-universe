import Phaser from "phaser";
import {
  INVINCIBLE_TIME,
  PLAYER_MAX_HP,
  PLAYER_SPEED,
  WORLD_SIZE,
} from "../config/gameConfig";

type MovementKey = "W" | "A" | "S" | "D" | "UP" | "DOWN" | "LEFT" | "RIGHT";

export class Player extends Phaser.GameObjects.Rectangle {
  // The constructor always attaches a dynamic Arcade body.
  declare body: Phaser.Physics.Arcade.Body;

  readonly maxHP = PLAYER_MAX_HP;
  private currentHP: number = PLAYER_MAX_HP;
  private speed: number = PLAYER_SPEED;
  private lastDamageTime = -INVINCIBLE_TIME;
  private currentFacingAngle = 0;
  private readonly facingIndicator: Phaser.GameObjects.Triangle;
  private readonly keys: Record<MovementKey, Phaser.Input.Keyboard.Key>;
  private readonly flashTimers = new Set<Phaser.Time.TimerEvent>();

  constructor(scene: Phaser.Scene) {
    super(scene, WORLD_SIZE / 2, WORLD_SIZE / 2, 32, 32, 0x55aaff);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setCollideWorldBounds(true);

    const keyboard = scene.input.keyboard;
    if (!keyboard) throw new Error("The survivor game requires keyboard input.");
    this.keys = {
      W: keyboard.addKey("W"),
      A: keyboard.addKey("A"),
      S: keyboard.addKey("S"),
      D: keyboard.addKey("D"),
      UP: keyboard.addKey("UP"),
      DOWN: keyboard.addKey("DOWN"),
      LEFT: keyboard.addKey("LEFT"),
      RIGHT: keyboard.addKey("RIGHT"),
    };

    this.facingIndicator = scene.add.triangle(
      this.x + 23,
      this.y,
      0, 0,
      10, 6,
      0, 12,
      0xffe6a3,
    );
    this.facingIndicator.setDepth(2);
  }

  get hp(): number {
    return this.currentHP;
  }

  /** Radians: 0 is right, PI / 2 is down in Phaser's screen coordinates. */
  get facingAngle(): number {
    return this.currentFacingAngle;
  }

  updateMovement(): void {
    let vx = 0;
    let vy = 0;
    if (this.keys.A.isDown || this.keys.LEFT.isDown) vx = -1;
    if (this.keys.D.isDown || this.keys.RIGHT.isDown) vx = 1;
    if (this.keys.W.isDown || this.keys.UP.isDown) vy = -1;
    if (this.keys.S.isDown || this.keys.DOWN.isDown) vy = 1;
    const length = Math.hypot(vx, vy);
    if (length > 0) {
      // Keep the last direction when movement keys are released.
      this.currentFacingAngle = Math.atan2(vy, vx);
      vx = (vx / length) * this.speed;
      vy = (vy / length) * this.speed;
    }
    this.body.setVelocity(vx, vy);
    this.facingIndicator.setPosition(
      this.x + Math.cos(this.currentFacingAngle) * 23,
      this.y + Math.sin(this.currentFacingAngle) * 23,
    );
    this.facingIndicator.setRotation(this.currentFacingAngle);
  }

  takeDamage(damage: number): boolean {
    if (this.currentHP <= 0) return false;
    const now = this.scene.time.now;
    if (now - this.lastDamageTime < INVINCIBLE_TIME) return false;
    this.lastDamageTime = now;
    this.currentHP = Math.max(0, this.currentHP - damage);
    this.setFillStyle(0xff5555);
    const timer = this.scene.time.delayedCall(200, () => {
      this.flashTimers.delete(timer);
      if (this.active) this.setFillStyle(0x55aaff);
    });
    this.flashTimers.add(timer);
    return true;
  }

  increaseSpeed(amount: number): void {
    this.speed += amount;
  }

  override destroy(fromScene?: boolean): void {
    if (!this.scene) return;
    for (const timer of this.flashTimers) {
      this.scene.time.removeEvent(timer);
      timer.destroy();
    }
    this.flashTimers.clear();
    this.facingIndicator.destroy();
    const keyboard = this.scene.input.keyboard;
    if (keyboard) {
      for (const key of Object.values(this.keys)) keyboard.removeKey(key, true);
    }
    super.destroy(fromScene);
  }
}
