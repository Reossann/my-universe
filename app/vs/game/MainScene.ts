import Phaser from "phaser";
import { WORLD_SIZE } from "./config/gameConfig";
import { Player } from "./entities/Player";
import { CombatSystem } from "./systems/CombatSystem";
import { EnemySpawner } from "./systems/EnemySpawner";
import { ExperienceSystem } from "./systems/ExperienceSystem";
import { LevelUpSystem } from "./systems/LevelUpSystem";
import { GameHUD } from "./ui/GameHUD";
import { Sword } from "./weapons/Sword";
import type { Weapon } from "./weapons/Weapon";

export default class MainScene extends Phaser.Scene {
  private player!: Player;
  private enemySpawner!: EnemySpawner;
  private weapon!: Weapon;
  private combat!: CombatSystem;
  private experience!: ExperienceSystem;
  private levelUp!: LevelUpSystem;
  private hud!: GameHUD;
  private isGameOver = false;

  constructor() {
    super({ key: "MainScene" });
  }

  create(): void {
    // Scene instances are reused on restart; the Clock keeps its paused flag.
    this.isGameOver = false;
    this.time.paused = false;

    this.createGround();
    this.physics.world.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE);
    this.player = new Player(this);
    this.enemySpawner = new EnemySpawner(this);
    this.experience = new ExperienceSystem(this, (level) => this.levelUp.show(level));
    this.hud = new GameHUD(this);
    // Register weapon collisions before contact damage (also used by BasicGun).
    // Hit callbacks run after create, when CombatSystem has been initialized.
    this.weapon = new Sword(
      this,
      this.player,
      () => this.enemySpawner.enemies,
      (enemy, damage) => this.combat.hitEnemy(enemy, damage),
    );
    this.combat = new CombatSystem(
      this,
      this.player,
      this.enemySpawner,
      (x, y) => this.experience.drop(x, y),
      () => this.gameOver(),
    );
    this.levelUp = new LevelUpSystem(this, this.player, this.weapon, this.experience);

    this.cameras.main.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE);
    this.cameras.main.startFollow(this.player, true, 1, 1);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
    this.events.once(Phaser.Scenes.Events.DESTROY, this.shutdown, this);
  }

  private createGround(): void {
    const ground = this.add.graphics();
    ground.fillStyle(0x243b32);
    ground.fillRect(0, 0, WORLD_SIZE, WORLD_SIZE);
    ground.lineStyle(1, 0x426052, 0.5);

    for (let i = 0; i <= WORLD_SIZE; i += 64) {
      ground.lineBetween(i, 0, i, WORLD_SIZE);
      ground.lineBetween(0, i, WORLD_SIZE, i);
    }
  }

  private gameOver(): void {
    this.isGameOver = true;
    this.physics.pause();
    this.hud.showGameOver(this.combat.kills);
    this.time.paused = true;
  }

  update(_time: number, delta: number): void {
    if (this.isGameOver) return;

    this.player.updateMovement();
    this.enemySpawner.update(this.player);
    // Scene updates continue while physics and timers are paused. Keep one
    // upgrade choice open at a time rather than picking up gems behind it.
    if (!this.levelUp.isActive) {
      this.weapon.update(delta);
      this.experience.updatePickup(this.player);
    }
    this.hud.update(this.player, this.combat.kills, this.enemySpawner.count);
  }

  private shutdown(): void {
    this.events.off(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
    this.events.off(Phaser.Scenes.Events.DESTROY, this.shutdown, this);
    this.combat.destroy();
    this.levelUp.destroy();
    this.weapon.destroy();
    this.enemySpawner.destroy();
    this.experience.destroy();
    this.hud.destroy();
    this.player.destroy();
  }
}
