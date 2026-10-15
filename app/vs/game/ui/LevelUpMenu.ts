import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../config/gameConfig";

export type UpgradeType = "damage" | "speed" | "move";

export class LevelUpMenu {
  private objects: Phaser.GameObjects.GameObject[] = [];

  constructor(private readonly scene: Phaser.Scene) {}

  public show(level: number, onSelect: (type: UpgradeType) => void): void {
    this.hide();

    const centerX = GAME_WIDTH / 2;
    const overlay = this.scene.add.rectangle(
      centerX,
      GAME_HEIGHT / 2,
      GAME_WIDTH,
      GAME_HEIGHT,
      0x000000,
      0.8,
    );
    overlay.setScrollFactor(0);
    overlay.setDepth(100);
    overlay.setInteractive();
    this.objects.push(overlay);

    const title = this.scene.add.text(centerX, 130, `LEVEL UP!  Lv.${level}`, {
      fontSize: "38px",
      color: "#ffff66",
      fontStyle: "bold",
    });
    title.setOrigin(0.5);
    title.setScrollFactor(0);
    title.setDepth(101);
    this.objects.push(title);

    const choices: { label: string; type: UpgradeType }[] = [
      { label: "攻撃力 +5", type: "damage" },
      { label: "攻撃速度 +15%", type: "speed" },
      { label: "移動速度 +30", type: "move" },
    ];

    choices.forEach((choice, index) => {
      const button = this.scene.add.text(
        centerX,
        230 + index * 100,
        choice.label,
        {
          fontSize: "26px",
          color: "#ffffff",
          backgroundColor: "#335577",
          padding: { x: 30, y: 15 },
        },
      );
      button.setOrigin(0.5);
      button.setScrollFactor(0);
      button.setDepth(101);
      button.setInteractive({ useHandCursor: true });
      button.on("pointerdown", () => onSelect(choice.type));
      this.objects.push(button);
    });
  }

  public hide(): void {
    this.objects.forEach((object) => object.destroy());
    this.objects = [];
  }

  public destroy(): void {
    this.hide();
  }
}
