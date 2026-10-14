import Phaser from "phaser";

// ===== ゲーム設定 =====
const WORLD_SIZE = 2000;
const PLAYER_SPEED = 240;

const ENEMY_SPEED = 90;
const ENEMY_SPAWN_INTERVAL = 1000;
const MAX_ENEMIES = 80;
const SPAWN_MARGIN = 60;

const PLAYER_MAX_HP = 100;
const ENEMY_MAX_HP = 30;
const ATTACK_DAMAGE = 10;
const ATTACK_INTERVAL = 500;
const BULLET_SPEED = 400;
const BULLET_LIFETIME = 2000;

const CONTACT_DAMAGE = 10;
const INVINCIBLE_TIME = 1000;

const EXP_PER_ENEMY = 10;
const EXP_PICKUP_DISTANCE = 28;

const ATTACK_SPEED_UP = 0.85;
const ATTACK_DAMAGE_UP = 5;
const PLAYER_SPEED_UP = 30;

// ===== 敵データの型 =====
type Enemy = {
  sprite: Phaser.GameObjects.Rectangle;
  body: Phaser.Physics.Arcade.Body;
  hp: number;
};

export default class MainScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle;
  private playerBody!: Phaser.Physics.Arcade.Body;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;

  private enemies: Enemy[] = [];
  private enemyGroup!: Phaser.Physics.Arcade.Group;
  private bulletGroup!: Phaser.Physics.Arcade.Group;

  private playerHP = PLAYER_MAX_HP;
  private lastDamageTime = -INVINCIBLE_TIME;
  private killCount = 0;
  private isGameOver = false;

  private positionText!: Phaser.GameObjects.Text;

  // 経験値とレベル
  private level = 1;
  private exp = 0;
  private expToNextLevel = 20;

  // 経験値アイテムの管理
  private expGroup!: Phaser.GameObjects.Group;

  // 強化可能なステータス
  private attackDamage = ATTACK_DAMAGE;
  private attackInterval = ATTACK_INTERVAL;
  private playerSpeed = PLAYER_SPEED;

  // 攻撃タイマー
  private attackTimer!: Phaser.Time.TimerEvent;

  // レベルアップ画面の管理
  private isLevelingUp = false;

  // レベルアップ画面のオブジェクト
  private levelUpUI: Phaser.GameObjects.GameObject[] = [];

  constructor() {
    super({ key: "MainScene" });
  }

  create() {
    // 再スタート時に状態を初期化
    this.enemies = [];
    this.playerHP = PLAYER_MAX_HP;
    this.killCount = 0;
    this.lastDamageTime = -INVINCIBLE_TIME;
    this.isGameOver = false;

    this.level = 1;
    this.exp = 0;
    this.expToNextLevel = 20;

    this.attackDamage = ATTACK_DAMAGE;
    this.attackInterval = ATTACK_INTERVAL;
    this.playerSpeed = PLAYER_SPEED;

    this.isLevelingUp = false;
    this.levelUpUI = [];

    // ===== ① 地面 =====
    const ground = this.add.graphics();

    ground.fillStyle(0x243b32);
    ground.fillRect(0, 0, WORLD_SIZE, WORLD_SIZE);
    ground.lineStyle(1, 0x426052, 0.5);

    for (let i = 0; i <= WORLD_SIZE; i += 64) {
      ground.lineBetween(i, 0, i, WORLD_SIZE);
      ground.lineBetween(0, i, WORLD_SIZE, i);
    }

    // ===== ② プレイヤー =====
    this.player = this.add.rectangle(
      WORLD_SIZE / 2,
      WORLD_SIZE / 2,
      32,
      32,
      0x55aaff,
    );

    this.physics.add.existing(this.player);

    this.playerBody = this.player.body as Phaser.Physics.Arcade.Body;

    this.physics.world.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE);

    this.playerBody.setCollideWorldBounds(true);

    // ===== ③ グループ作成 =====
    this.enemyGroup = this.physics.add.group();
    this.bulletGroup = this.physics.add.group();
    this.expGroup = this.add.group();

    // ===== ④ キーボード =====
    this.keys = this.input.keyboard!.addKeys(
      "W,A,S,D,UP,DOWN,LEFT,RIGHT",
    ) as Record<string, Phaser.Input.Keyboard.Key>;

    // ===== ⑤ カメラ =====
    this.cameras.main.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE);

    this.cameras.main.startFollow(this.player, true, 1, 1);

    // ===== ⑥ UI =====
    this.positionText = this.add.text(16, 16, "", {
      fontSize: "18px",
      color: "#ffffff",
      backgroundColor: "#00000088",
      padding: { x: 10, y: 8 },
    });

    this.positionText.setScrollFactor(0);
    this.positionText.setDepth(10);

    // ===== ⑦ 敵の出現タイマー =====
    this.time.addEvent({
      delay: ENEMY_SPAWN_INTERVAL,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true,
    });

    // ===== ⑧ 自動攻撃タイマー =====

    this.attackTimer = this.time.addEvent({
      delay: this.attackInterval,
      callback: this.shoot,
      callbackScope: this,
      loop: true,
    });

    // ===== ⑨ 弾と敵の当たり判定 =====
    this.physics.add.overlap(
      this.bulletGroup,
      this.enemyGroup,
      (bulletObj, enemyObj) => {
        const bullet = bulletObj as Phaser.GameObjects.Rectangle;
        const enemySprite = enemyObj as Phaser.GameObjects.Rectangle;

        if (!bullet.active || !enemySprite.active) return;

        const enemy = this.enemies.find((e) => e.sprite === enemySprite);

        if (!enemy) return;

        // 弾を消して敵にダメージ
        bullet.destroy();
        this.damageEnemy(enemy, this.attackDamage);
      },
    );

    // ===== ⑩ プレイヤーと敵の当たり判定 =====
    this.physics.add.overlap(this.player, this.enemyGroup, () => {
      this.damagePlayer(CONTACT_DAMAGE);
    });
  }

  // ===== 敵を生成 =====
  private spawnEnemy() {
    if (this.enemies.length >= MAX_ENEMIES) return;

    const view = this.cameras.main.worldView;
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

    const sprite = this.add.rectangle(point.x, point.y, 28, 28, 0xff5555);

    this.physics.add.existing(sprite);

    const body = sprite.body as Phaser.Physics.Arcade.Body;

    body.setAllowGravity(false);

    this.enemyGroup.add(sprite);

    this.enemies.push({
      sprite,
      body,
      hp: ENEMY_MAX_HP,
    });
  }

  // ===== 一番近い敵に自動攻撃 =====
  private shoot() {
    if (this.enemies.length === 0) return;

    let nearest: Enemy | null = null;
    let minDistance = Infinity;

    for (const enemy of this.enemies) {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        enemy.sprite.x,
        enemy.sprite.y,
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearest = enemy;
      }
    }

    if (!nearest) return;

    // 弾を作成
    const bullet = this.add.rectangle(
      this.player.x,
      this.player.y,
      12,
      12,
      0xffff55,
    );

    this.physics.add.existing(bullet);
    this.bulletGroup.add(bullet);

    const body = bullet.body as Phaser.Physics.Arcade.Body;

    body.setAllowGravity(false);

    // 発射時点の敵の位置へ飛ばす
    this.physics.moveToObject(bullet, nearest.sprite, BULLET_SPEED);

    // 命中しなかった弾を一定時間後に削除
    this.time.delayedCall(BULLET_LIFETIME, () => {
      if (bullet.active) {
        bullet.destroy();
      }
    });
  }

  // ===== 敵へのダメージ =====
  private damageEnemy(enemy: Enemy, damage: number) {
    enemy.hp -= damage;

    if (enemy.hp <= 0) {
      const x = enemy.sprite.x;
      const y = enemy.sprite.y;

      // 経験値アイテムを落とす
      this.dropExp(x, y);

      enemy.sprite.destroy();

      this.enemies = this.enemies.filter((e) => e !== enemy);

      this.killCount++;
    } else {
      // 命中したことを色で表現
      enemy.sprite.setFillStyle(0xffffff);

      this.time.delayedCall(100, () => {
        if (enemy.sprite.active) {
          enemy.sprite.setFillStyle(0xff5555);
        }
      });
    }
  }

  // ===== プレイヤーへのダメージ =====
  private damagePlayer(damage: number) {
    if (this.isGameOver) return;

    const now = this.time.now;

    // 無敵時間中はダメージを受けない
    if (now - this.lastDamageTime < INVINCIBLE_TIME) {
      return;
    }

    this.lastDamageTime = now;

    this.playerHP = Math.max(0, this.playerHP - damage);

    // ダメージを受けたら赤くなる
    this.player.setFillStyle(0xff5555);

    this.time.delayedCall(200, () => {
      if (this.player.active) {
        this.player.setFillStyle(0x55aaff);
      }
    });

    if (this.playerHP <= 0) {
      this.gameOver();
    }
  }

  // ===== ゲームオーバー =====
  private gameOver() {
    this.isGameOver = true;
    this.physics.pause();

    const text = this.add.text(
      400,
      300,
      `GAME OVER\n撃破数: ${this.killCount}`,
      {
        fontSize: "40px",
        color: "#ffffff",
        align: "center",
        backgroundColor: "#000000cc",
        padding: { x: 30, y: 20 },
      },
    );

    text.setOrigin(0.5);
    text.setScrollFactor(0);
    text.setDepth(100);

    // 物理演算以外のタイマーも止める
    this.time.paused = true;
  }

  // ===== 敵の追跡AI =====
  private updateEnemies() {
    for (const enemy of this.enemies) {
      const dx = this.player.x - enemy.sprite.x;
      const dy = this.player.y - enemy.sprite.y;

      const distance = Math.hypot(dx, dy);

      if (distance > 1) {
        enemy.body.setVelocity(
          (dx / distance) * ENEMY_SPEED,
          (dy / distance) * ENEMY_SPEED,
        );
      } else {
        enemy.body.setVelocity(0, 0);
      }
    }
  }

  private showLevelUp() {
    this.isLevelingUp = true;

    // 移動とタイマーを一時停止
    this.physics.pause();
    this.time.paused = true;

    const ui: Phaser.GameObjects.GameObject[] = [];

    // 半透明の背景
    const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);
    overlay.setScrollFactor(0);
    overlay.setDepth(100);
    overlay.setInteractive();

    ui.push(overlay);

    // タイトル
    const title = this.add.text(400, 130, `LEVEL UP!  Lv.${this.level}`, {
      fontSize: "38px",
      color: "#ffff66",
      fontStyle: "bold",
    });

    title.setOrigin(0.5);
    title.setScrollFactor(0);
    title.setDepth(101);

    ui.push(title);

    // 強化の選択肢
    const choices = [
      {
        label: "攻撃力 +5",
        type: "damage",
      },
      {
        label: "攻撃速度 +15%",
        type: "speed",
      },
      {
        label: "移動速度 +30",
        type: "move",
      },
    ];

    choices.forEach((choice, index) => {
      const button = this.add.text(400, 230 + index * 100, choice.label, {
        fontSize: "26px",
        color: "#ffffff",
        backgroundColor: "#335577",
        padding: { x: 30, y: 15 },
      });

      button.setOrigin(0.5);
      button.setScrollFactor(0);
      button.setDepth(101);
      button.setInteractive({ useHandCursor: true });

      button.on("pointerdown", () => {
        this.selectUpgrade(choice.type);
      });

      ui.push(button);
    });

    this.levelUpUI = ui;
  }

  private selectUpgrade(type: string) {
    if (!this.isLevelingUp) return;

    switch (type) {
      case "damage":
        this.attackDamage += ATTACK_DAMAGE_UP;
        break;

      case "speed":
        this.attackInterval = Math.max(
          100,
          Math.round(this.attackInterval * ATTACK_SPEED_UP),
        );

        // 古い攻撃タイマーを削除
        this.attackTimer.remove(false);

        // 新しい間隔でタイマーを作成
        this.attackTimer = this.time.addEvent({
          delay: this.attackInterval,
          callback: this.shoot,
          callbackScope: this,
          loop: true,
        });
        break;

      case "move":
        this.playerSpeed += PLAYER_SPEED_UP;
        break;
    }

    // 強化画面を削除
    this.levelUpUI.forEach((obj) => obj.destroy());
    this.levelUpUI = [];

    this.isLevelingUp = false;

    // ゲームを再開
    this.physics.resume();
    this.time.paused = false;

    // 余ったEXPで次のレベルにも到達していたら
    // 再び強化選択を開く
    if (this.exp >= this.expToNextLevel) {
      this.addExp(0);
    }
  }

  private dropExp(x: number, y: number) {
    const gem = this.add.rectangle(x, y, 12, 12, 0x00ff88);

    gem.setRotation(Math.PI / 4);

    // 物理演算は不要
    this.expGroup.add(gem);
  }

  private addExp(amount: number) {
    this.exp += amount;

    if (this.exp >= this.expToNextLevel) {
      // 余った経験値は持ち越す
      this.exp -= this.expToNextLevel;

      this.level++;

      // 次のレベルの必要経験値
      this.expToNextLevel = 20 + (this.level - 1) * 10;

      this.showLevelUp();
    }
  }

  private updateExpPickup() {
    const gems = this.expGroup.getChildren() as Phaser.GameObjects.Rectangle[];

    for (const gem of gems) {
      if (!gem.active) continue;

      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        gem.x,
        gem.y,
      );

      if (distance <= EXP_PICKUP_DISTANCE) {
        // 取得したアイテムを削除
        gem.destroy();

        // 経験値を獲得
        this.addExp(EXP_PER_ENEMY);

        if (this.isLevelingUp) return;
      }
    }
  }

  // ===== 毎フレーム更新 =====
  update() {
    if (this.isGameOver) return;

    let vx = 0;
    let vy = 0;

    if (this.keys.A.isDown || this.keys.LEFT.isDown) vx = -1;

    if (this.keys.D.isDown || this.keys.RIGHT.isDown) vx = 1;

    if (this.keys.W.isDown || this.keys.UP.isDown) vy = -1;

    if (this.keys.S.isDown || this.keys.DOWN.isDown) vy = 1;

    const length = Math.hypot(vx, vy);

    if (length > 0) {
      vx = (vx / length) * this.playerSpeed;
      vy = (vy / length) * this.playerSpeed;
    }

    this.playerBody.setVelocity(vx, vy);

    this.updateEnemies();
    this.updateExpPickup();

    // 情報更新
    this.positionText.setText(
      `HP: ${this.playerHP}/${PLAYER_MAX_HP}\n` +
        `Kills: ${this.killCount}\n` +
        `Enemies: ${this.enemies.length}\n` +
        `X: ${Math.round(this.player.x)} ` +
        `Y: ${Math.round(this.player.y)}`,
    );
  }
}
