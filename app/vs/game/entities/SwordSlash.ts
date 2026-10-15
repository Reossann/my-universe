import Phaser from "phaser";
import {
  SWORD_ARC_DEGREES,
  SWORD_RANGE,
  SWORD_SLASH_RADIUS,
  SWORD_SLASH_SPEED,
  SWORD_START_OFFSET,
} from "../config/gameConfig";
import type { Enemy } from "./Enemy";
import type { WeaponHitHandler } from "../weapons/Weapon";
import {
  createSectorPoints,
  sectorIntersectsRectangle,
  transformSectorPoints,
} from "../weapons/sectorGeometry";

/** One flying slash; the weapon owns its creation and per-frame updates. */
export class SwordSlash extends Phaser.GameObjects.Graphics {
  private readonly points = createSectorPoints(
    SWORD_SLASH_RADIUS,
    Phaser.Math.DegToRad(SWORD_ARC_DEGREES),
  );
  private readonly hitEnemies = new Set<Enemy>();
  private readonly directionX: number;
  private readonly directionY: number;
  private readonly startX: number;
  private readonly startY: number;
  private readonly maxTravel =
    SWORD_RANGE - SWORD_SLASH_RADIUS - SWORD_START_OFFSET;
  private traveled = 0;

  constructor(scene: Phaser.Scene, origin: { x: number; y: number }, angle: number) {
    super(scene);
    this.directionX = Math.cos(angle);
    this.directionY = Math.sin(angle);
    this.startX = origin.x + this.directionX * SWORD_START_OFFSET;
    this.startY = origin.y + this.directionY * SWORD_START_OFFSET;
    this.setPosition(this.startX, this.startY);
    this.setRotation(angle);
    this.setDepth(1);

    // The collision polygon uses these exact same points.
    this.fillStyle(0xa7edff, 0.25);
    this.fillPoints(this.points, true);
    const arcPoints = this.points.slice(1);
    this.lineStyle(6, 0x99e8ff, 0.45);
    this.strokePoints(arcPoints, false);
    this.lineStyle(2, 0xffffff, 1);
    this.strokePoints(arcPoints, false);
    scene.add.existing(this);
  }

  advance(
    delta: number,
    enemies: Iterable<Enemy>,
    damage: number,
    onHit: WeaponHitHandler,
  ): void {
    const distance = Math.min(
      SWORD_SLASH_SPEED * Math.max(0, delta) / 1000,
      this.maxTravel - this.traveled,
    );
    // Small steps also check the path between frames, preventing fast slashes
    // from jumping over enemies when the frame rate drops.
    const steps = Math.max(1, Math.ceil(distance / 12));
    for (let step = 0; step <= steps; step++) {
      const travel = this.traveled + distance * step / steps;
      this.setPosition(
        this.startX + this.directionX * travel,
        this.startY + this.directionY * travel,
      );
      const worldPoints = transformSectorPoints(
        this.points, this.x, this.y, this.rotation,
      );

      for (const enemy of enemies) {
        if (!enemy.active || this.hitEnemies.has(enemy)) continue;
        if (!sectorIntersectsRectangle(worldPoints, enemy.getBounds())) continue;
        this.hitEnemies.add(enemy);
        onHit(enemy, damage);
      }
    }

    this.traveled += distance;
    this.setAlpha(1 - this.traveled / this.maxTravel * 0.65);
    if (this.traveled >= this.maxTravel) this.destroy();
  }

  override destroy(fromScene?: boolean): void {
    if (!this.scene) return;
    this.hitEnemies.clear();
    super.destroy(fromScene);
  }
}
