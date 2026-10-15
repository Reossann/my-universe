import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../config/gameConfig";
import type { Player } from "../entities/Player";

export class GameHUD {
  private readonly positionText: Phaser.GameObjects.Text;
  private gameOverText?: Phaser.GameObjects.Text;

  constructor(private readonly scene: Phaser.Scene) {
    this.positionText = scene.add.text(16, 16, "", {
      fontSize: "18px",
      color: "#ffffff",
      backgroundColor: "#00000088",
      padding: { x: 10, y: 8 },
    });
    this.positionText.setScrollFactor(0).setDepth(10);
  }

  update(player: Player, killCount: number, enemyCount: number): void {
    this.positionText.setText(
      `HP: ${player.hp}/${player.maxHP}\n` +
        `Kills: ${killCount}\n` +
        `Enemies: ${enemyCount}\n` +
        `X: ${Math.round(player.x)} Y: ${Math.round(player.y)}`,
    );
  }

  showGameOver(killCount: number): void {
    this.gameOverText = this.scene.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      `GAME OVER\n撃破数: ${killCount}`,
      {
        fontSize: "40px",
        color: "#ffffff",
        align: "center",
        backgroundColor: "#000000cc",
        padding: { x: 30, y: 20 },
      },
    );
    this.gameOverText.setOrigin(0.5).setScrollFactor(0).setDepth(100);
  }

  destroy(): void {
    this.positionText.destroy();
    this.gameOverText?.destroy();
    this.gameOverText = undefined;
  }
}
