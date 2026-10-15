import Phaser from "phaser";
import {
  ENEMY_SPAWN_INTERVAL,
  MAX_ENEMIES,
  SPAWN_MARGIN,
  WORLD_SIZE,
} from "../config/gameConfig";
import { Enemy } from "../entities/Enemy";

export class EnemySpawner {
  readonly enemyGroup: Phaser.Physics.Arcade.Group;
  private readonly activeEnemies = new Set<Enemy>();
  private readonly spawnTimer: Phaser.Time.TimerEvent;

  constructor(private readonly scene: Phaser.Scene) {
    this.enemyGroup = scene.physics.add.group();
    this.spawnTimer = scene.time.addEvent({
      delay: ENEMY_SPAWN_INTERVAL,
      callback: () => this.spawn(),
      loop: true,
    });
  }

  get enemies(): ReadonlySet<Enemy> {
    return this.activeEnemies;
  }

  get count(): number {
    return this.activeEnemies.size;
  }

  private spawn(): void {
    if (this.count >= MAX_ENEMIES) return;
    const view = this.scene.cameras.main.worldView;
    const min = 16;
    const max = WORLD_SIZE - 16;
    const randomX = () =>
      Phaser.Math.Between(
        Math.max(min, Math.ceil(view.left)),
        Math.min(max, Math.floor(view.right)),
      );
    const randomY = () =>
      Phaser.Math.Between(
        Math.max(min, Math.ceil(view.top)),
        Math.min(max, Math.floor(view.bottom)),
      );
    const candidates = [
      { x: randomX(), y: view.top - SPAWN_MARGIN },
      { x: randomX(), y: view.bottom + SPAWN_MARGIN },
      { x: view.left - SPAWN_MARGIN, y: randomY() },
      { x: view.right + SPAWN_MARGIN, y: randomY() },
    ];
    const validCandidates = candidates.filter(
      ({ x, y }) => x >= min && x <= max && y >= min && y <= max,
    );
    if (validCandidates.length === 0) return;
    const point = Phaser.Utils.Array.GetRandom(validCandidates);
    const enemy = new Enemy(this.scene, point.x, point.y);
    this.enemyGroup.add(enemy);
    this.activeEnemies.add(enemy);
    enemy.once(Phaser.GameObjects.Events.DESTROY, () => {
      this.activeEnemies.delete(enemy);
    });
  }

  update(target: { x: number; y: number }): void {
    for (const enemy of this.activeEnemies) enemy.follow(target);
  }

  remove(enemy: Enemy): void {
    enemy.destroy();
  }

  destroy(): void {
    this.scene.time.removeEvent(this.spawnTimer);
    this.spawnTimer.destroy();
    // GameObjects and Groups may already have been destroyed by Phaser.
    for (const enemy of this.activeEnemies) enemy.destroy();
    this.activeEnemies.clear();
    this.enemyGroup.destroy(true);
  }
}
