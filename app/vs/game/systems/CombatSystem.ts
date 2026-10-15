import Phaser from "phaser";
import { CONTACT_DAMAGE } from "../config/gameConfig";
import type { Enemy } from "../entities/Enemy";
import type { Player } from "../entities/Player";
import type { EnemySpawner } from "./EnemySpawner";

export class CombatSystem {
  private readonly playerOverlap: Phaser.Physics.Arcade.Collider;
  private killCount = 0;

  constructor(
    scene: Phaser.Scene,
    player: Player,
    private readonly enemies: EnemySpawner,
    private readonly onEnemyDefeated: (x: number, y: number) => void,
    onPlayerDefeated: () => void,
  ) {
    this.playerOverlap = scene.physics.add.overlap(player, enemies.enemyGroup, () => {
      if (player.takeDamage(CONTACT_DAMAGE) && player.hp <= 0) onPlayerDefeated();
    });
  }

  get kills(): number {
    return this.killCount;
  }

  hitEnemy(enemy: Enemy, damage: number): void {
    if (!enemy.active) return;

    if (enemy.takeDamage(damage)) {
      this.onEnemyDefeated(enemy.x, enemy.y);
      this.enemies.remove(enemy);
      this.killCount++;
    }
  }

  destroy(): void {
    // Arcade World shutdown can run before the scene's cleanup listener.
    if (this.playerOverlap.world) this.playerOverlap.destroy();
  }
}
