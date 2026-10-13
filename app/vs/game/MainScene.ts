import Phaser from "phaser";

const WORLD_SIZE = 2000;
const PLAYER_SPEED = 240;

export default class MainScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle;
  private playerBody!: Phaser.Physics.Arcade.Body;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private positionText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "MainScene" });
  }

  create() {
    // ① 地面を作る
    const ground = this.add.graphics();

    ground.fillStyle(0x243b32);
    ground.fillRect(0, 0, WORLD_SIZE, WORLD_SIZE);

    // 格子状の模様
    ground.lineStyle(1, 0x426052, 0.5);

    for (let i = 0; i <= WORLD_SIZE; i += 64) {
      ground.lineBetween(i, 0, i, WORLD_SIZE);
      ground.lineBetween(0, i, WORLD_SIZE, i);
    }

    // ② プレイヤーを作る
    this.player = this.add.rectangle(
      WORLD_SIZE / 2,
      WORLD_SIZE / 2,
      32,
      32,
      0x55aaff,
    );

    // 物理演算を有効化
    this.physics.add.existing(this.player);

    this.playerBody = this.player.body as Phaser.Physics.Arcade.Body;

    this.physics.world.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE);

    this.playerBody.setCollideWorldBounds(true);

    // ③ キーボード入力
    this.keys = this.input.keyboard!.addKeys(
      "W,A,S,D,UP,DOWN,LEFT,RIGHT",
    ) as Record<string, Phaser.Input.Keyboard.Key>;

    // ④ カメラをプレイヤーに追従
    this.cameras.main.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE);

    this.cameras.main.startFollow(this.player, true, 1, 1);

    // ⑤ 座標表示（カメラと一緒に動くUI）
    this.positionText = this.add.text(16, 16, "", {
      fontSize: "18px",
      color: "#ffffff",
      backgroundColor: "#00000088",
      padding: { x: 10, y: 8 },
    });

    this.positionText.setScrollFactor(0);
    this.positionText.setDepth(10);
  }

  update() {
    // 移動方向を取得
    let vx = 0;
    let vy = 0;

    if (this.keys.A.isDown || this.keys.LEFT.isDown) {
      vx = -1;
    }
    if (this.keys.D.isDown || this.keys.RIGHT.isDown) {
      vx = 1;
    }
    if (this.keys.W.isDown || this.keys.UP.isDown) {
      vy = -1;
    }
    if (this.keys.S.isDown || this.keys.DOWN.isDown) {
      vy = 1;
    }

    // 斜め移動でも速度が速くならないよう調整
    const length = Math.hypot(vx, vy);

    if (length > 0) {
      vx = (vx / length) * PLAYER_SPEED;
      vy = (vy / length) * PLAYER_SPEED;
    }

    this.playerBody.setVelocity(vx, vy);

    // 現在位置を表示
    this.positionText.setText(
      `X: ${Math.round(this.player.x)} ` + `Y: ${Math.round(this.player.y)}`,
    );
  }
}
