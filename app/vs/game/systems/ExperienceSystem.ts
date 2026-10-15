import Phaser from "phaser";
import {
  EXP_PER_ENEMY,
  EXP_PICKUP_DISTANCE,
  EXP_REQUIREMENT_INCREASE,
  INITIAL_EXP_TO_NEXT_LEVEL,
  INITIAL_LEVEL,
} from "../config/gameConfig";

export class ExperienceSystem {
  public readonly expGroup: Phaser.GameObjects.Group;

  private currentLevel = INITIAL_LEVEL;
  private currentExp = 0;
  private requiredExp = INITIAL_EXP_TO_NEXT_LEVEL;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly onLevelUp: (level: number) => void,
  ) {
    this.expGroup = scene.add.group();
  }

  public get level(): number {
    return this.currentLevel;
  }

  public get exp(): number {
    return this.currentExp;
  }

  public get expToNextLevel(): number {
    return this.requiredExp;
  }

  public drop(x: number, y: number): void {
    const gem = this.scene.add.rectangle(x, y, 12, 12, 0x00ff88);
    gem.setRotation(Math.PI / 4);
    this.expGroup.add(gem);
  }

  public addExp(amount: number): boolean {
    this.currentExp += amount;

    if (this.currentExp < this.requiredExp) return false;

    // One selection is shown at a time, with excess experience carried over.
    this.currentExp -= this.requiredExp;
    this.currentLevel++;
    this.requiredExp =
      INITIAL_EXP_TO_NEXT_LEVEL +
      (this.currentLevel - INITIAL_LEVEL) * EXP_REQUIREMENT_INCREASE;
    this.onLevelUp(this.currentLevel);

    return true;
  }

  public updatePickup(player: { x: number; y: number }): void {
    const gems = this.expGroup.getChildren();

    for (const gem of gems) {
      if (!(gem instanceof Phaser.GameObjects.Rectangle) || !gem.active) continue;

      const distance = Phaser.Math.Distance.Between(
        player.x,
        player.y,
        gem.x,
        gem.y,
      );

      if (distance <= EXP_PICKUP_DISTANCE) {
        gem.destroy();
        if (this.addExp(EXP_PER_ENEMY)) return;
      }
    }
  }

  public destroy(): void {
    this.expGroup.destroy(true);
  }
}
