import type Phaser from "phaser";
import {
  ATTACK_DAMAGE_UP,
  ATTACK_SPEED_UP,
  MIN_ATTACK_INTERVAL,
  PLAYER_SPEED_UP,
} from "../config/gameConfig";
import type { Player } from "../entities/Player";
import { LevelUpMenu, type UpgradeType } from "../ui/LevelUpMenu";
import type { Weapon } from "../weapons/Weapon";
import type { ExperienceSystem } from "./ExperienceSystem";

export class LevelUpSystem {
  private readonly menu: LevelUpMenu;
  private active = false;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly player: Player,
    private readonly weapon: Weapon,
    private readonly experience: ExperienceSystem,
  ) {
    this.menu = new LevelUpMenu(scene);
  }

  public get isActive(): boolean {
    return this.active;
  }

  public show(level: number): void {
    if (this.active) return;

    this.active = true;
    this.scene.physics.pause();
    this.scene.time.paused = true;
    this.menu.show(level, (type) => this.selectUpgrade(type));
  }

  private selectUpgrade(type: UpgradeType): void {
    if (!this.active) return;

    switch (type) {
      case "damage":
        this.weapon.increaseDamage(ATTACK_DAMAGE_UP);
        break;
      case "speed":
        this.weapon.increaseAttackSpeed(ATTACK_SPEED_UP, MIN_ATTACK_INTERVAL);
        break;
      case "move":
        this.player.increaseSpeed(PLAYER_SPEED_UP);
        break;
    }

    this.menu.hide();
    this.active = false;
    this.scene.physics.resume();
    this.scene.time.paused = false;

    if (this.experience.exp >= this.experience.expToNextLevel) {
      this.experience.addExp(0);
    }
  }

  public destroy(): void {
    this.menu.destroy();
    this.active = false;
  }
}
