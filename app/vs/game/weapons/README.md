# 武器を作るコードを読む

`/vs` の剣は「向き → 発生 → 描画・移動 → 命中 → ダメージ」の順で動きます。
まず `MainScene.ts` で全体のつながりを確認し、以下の順に読むと理解しやすくなります。

## 1. Player が向きを覚える

`../entities/Player.ts` の `facingAngle` はプレイヤーの向きです。
単位はラジアンで、`0` が右、`Math.PI / 2` が下です。
画面では Y 座標が下向きに増えるので、数学の図と上下が逆になります。

外部には `facingAngle` getter で公開し、移動入力のあるときだけ内部の値を更新します。

```ts
this.currentFacingAngle = Math.atan2(vy, vx);
```

入力がない間は最後の向きを保ち、開始直後は右を向きます。
プレイヤー付近の小さな目印も同じ向きを表示します。
敵の位置で向きは変わらないため、移動方向を使って剣を狙えます。

## 2. Sword が攻撃を発生させる

`Sword.ts` は武器本体です。攻撃力、攻撃間隔、タイマー、発生中の斬撃を管理します。
Phaser の `scene.time.addEvent` を使い、一定間隔で `SwordSlash` を作ります。
攻撃ボタンはなく、自動で攻撃します。

斬撃を作るときに、プレイヤーの座標と `facingAngle` を渡します。
ここで保存した位置と向きを使うため、発生後にプレイヤーが曲がっても、
飛んでいる斬撃は向きを変えずに進みます。

`Sword.update(delta)` は発生中の斬撃を進め、敵との命中を調べます。
`delta` は前のフレームからの経過時間で、単位はミリ秒です。
フレーム数ではなく時間を使うことで、描画速度が変わっても移動速度を保ちます。

## 3. SwordSlash が形と移動を持つ

`../entities/SwordSlash.ts` は、1 回分の斬撃を表す `Phaser.GameObjects.Graphics` です。
扇形の輪郭を点の列で作り、その多角形を描画します。
剣の柄や物理弾を表示しているわけではなく、扇形の斬撃そのものが前に飛びます。

進む方向は、発生時に保存した角度から求めます。

```ts
this.directionX = Math.cos(angle);
this.directionY = Math.sin(angle);
```

この方向に `速度 × 経過秒数` だけ進めます。
斬撃の中心はプレイヤーの少し前から始まり、設定した射程に達すると破棄されます。
射程は「発生時のプレイヤー位置から、最も遠い斬撃の先端まで」の距離です。
そのため、中心の移動距離は `射程 - 半径 - 開始オフセット` になります。

## 4. 描いた形を使って命中させる

`sectorGeometry.ts` は Phaser に依存しない座標計算と衝突判定です。
描画した扇形の多角形と、`enemy.getBounds()` が返す敵の矩形を調べます。
敵の中心点だけを判定しないため、斬撃の縁に敵の一部が触れても当たります。

判定には SAT（分離軸判定）を使います。
多角形の各辺に直交する方向へ両方の形を投影し、
どこか 1 方向でも重ならなければ、離れていると判断します。
描画と判定で同じ頂点を使うので、見た目と判定の形がそろいます。

1 フレームの移動が長い場合は、最大 12 px ずつに分割して判定します。
描画が遅いフレームで、敵の手前から奥へ飛び越えることを防ぎます。
発生時の位置でも判定するので、近くの敵も対象になります。

斬撃は命中した敵を `Set<Enemy>` に記録します。
同じ敵には 1 回の斬撃で 1 度だけダメージを与えます。
別の敵にはそのまま当たるため、複数の敵をまとめて攻撃できます。
次に発生した斬撃は別の記録を持つので、同じ敵にも再び当たります。

## 5. CombatSystem と MainScene につなぐ

武器は敵の HP や経験値を直接管理しません。
`Weapon.ts` のコールバックで「誰に何ダメージ当たったか」を通知します。

```ts
export type WeaponHitHandler = (enemy: Enemy, damage: number) => void;
```

`../systems/CombatSystem.ts` の `hitEnemy(enemy, damage)` が、
HP の減少、撃破、敵の削除、経験値ドロップ、撃破数の更新をまとめて行います。
プレイヤーと敵の接触ダメージも、このシステムの担当です。

`../MainScene.ts` は依存する部品を作り、コールバックでつなぎます。

```ts
this.weapon = new Sword(
  this,
  this.player,
  () => this.enemySpawner.enemies,
  (enemy, damage) => this.combat.hitEnemy(enemy, damage),
);
```

敵の一覧を関数で渡すので、攻撃時には現在の生存中の敵を取得できます。
命中通知は生成時に渡し、実際に敵へ当たった時点で呼び出されます。
武器は `MainScene` クラスを import する必要がなく、循環参照も避けられます。
`BasicGun.ts` も同じ命中通知を使い、弾の Group と overlap を自身で管理します。
既定の武器は剣ですが、銃の実装も残っています。武器を選ぶ画面はありません。

銃を試す場合は `MainScene.ts` で `BasicGun` を import し、生成箇所を次に置き換えます。
銃の物理判定には、4 番目の引数として敵の Physics Group も必要です。

```ts
this.weapon = new BasicGun(
  this,
  this.player,
  () => this.enemySpawner.enemies,
  this.enemySpawner.enemyGroup,
  (enemy, damage) => this.combat.hitEnemy(enemy, damage),
);
```

## 数値を変える場所

調整値は `../config/gameConfig.ts` にあります。

| 定数 | 初期値 | 意味 |
| --- | ---: | --- |
| `SWORD_DAMAGE` | 30 | 1 回の命中で与えるダメージ |
| `SWORD_ATTACK_INTERVAL` | 700 | 攻撃間隔（ミリ秒） |
| `SWORD_RANGE` | 240 | 発生位置から斬撃先端までの最大距離（px） |
| `SWORD_SLASH_RADIUS` | 80 | 扇形の半径（px） |
| `SWORD_ARC_DEGREES` | 100 | 扇形の開き角（度） |
| `SWORD_SLASH_SPEED` | 420 | 斬撃の移動速度（px/秒） |
| `SWORD_START_OFFSET` | 8 | プレイヤーから発生位置までの距離（px） |

現在の SAT は凸多角形を前提にしているため、開き角は 180 度以下にします。
レベルアップ時は共通の `increaseDamage` と `increaseAttackSpeed` を呼びます。
武器ごとの内部実装を、強化画面が知る必要はありません。

## 一時停止と後始末

レベルアップ中とゲームオーバー中は攻撃用の Phaser タイマーが停止します。
さらに `MainScene` は武器の `update(delta)` を呼ばず、飛んでいる斬撃も止めます。
斬撃は実時刻ではなく、渡された `delta` だけで進むことがポイントです。

`destroy()` では攻撃タイマーと残った斬撃を片付けます。
銃も自身の overlap、弾の Group、弾を片付けます。
Scene の終了時にこれらを呼び、再開始後へ古い攻撃が残らないようにします。

## 別の武器を追加するとき

1. `Weapon` を実装するクラスを作ります。
2. 攻撃の発生、見た目、移動、命中判定をその武器で管理します。
3. 命中時は `WeaponHitHandler` を呼び、ダメージの共通処理へ渡します。
4. `update(delta)`、強化用メソッド、`destroy()` を実装します。
5. `MainScene` の生成箇所を新しい武器につなぎます。

斬撃の形だけ変えるなら `SwordSlash`、間隔や威力なら `gameConfig`、
撃破時の共通処理なら `CombatSystem` を読むと、変更する場所を絞れます。

形状計算と衝突判定のテストは、プロジェクトのルートから実行できます。

```sh
node --test app/vs/game/weapons/*.test.mjs
```
