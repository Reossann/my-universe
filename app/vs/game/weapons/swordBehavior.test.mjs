import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";
import EventEmitter from "phaser/src/events/EventEmitter.js";
import ts from "typescript";

const gameDirectory = dirname(fileURLToPath(new URL("../MainScene.ts", import.meta.url)));
const compiledSources = new Map();

// These fakes cover the Phaser boundary only. All entities, weapons, geometry,
// config and scene orchestration below are loaded from their real TS modules.
class TestGameObject extends EventEmitter {
  constructor(scene, x = 0, y = 0, width = 0, height = 0) {
    super();
    Object.assign(this, { scene, x, y, width, height, rotation: 0, active: true, alpha: 1 });
  }

  setPosition(x, y) { Object.assign(this, { x, y }); return this; }
  setRotation(rotation) { this.rotation = rotation; return this; }
  setAlpha(alpha) { this.alpha = alpha; return this; }
  setDepth() { return this; }
  setOrigin() { return this; }
  setScrollFactor() { return this; }
  setInteractive() { return this; }
  setFillStyle() { return this; }
  setText(text) { this.text = text; return this; }

  getBounds() {
    return { x: this.x - this.width / 2, y: this.y - this.height / 2, width: this.width, height: this.height };
  }

  destroy(fromScene) {
    if (!this.scene) return;
    this.emit("destroy", this, fromScene);
    this.removeAllListeners();
    this.active = false;
    this.scene = undefined;
  }
}

class TestGraphics extends TestGameObject {
  fillStyle() { return this; }
  fillPoints(points) { this.drawnPoints = points; return this; }
  lineStyle() { return this; }
  strokePoints() { return this; }
  fillRect() { return this; }
  lineBetween() { return this; }
}

class TestGroup {
  constructor(scene) { this.scene = scene; this.children = []; }
  add(child) {
    this.children.push(child);
    child.once("destroy", () => {
      const index = this.children.indexOf(child);
      if (index !== -1) this.children.splice(index, 1);
    });
    return this;
  }
  getChildren() { return this.children; }
  destroy(destroyChildren) {
    if (!this.scene) return;
    if (destroyChildren) for (const child of [...this.children]) child.destroy();
    this.children = [];
    this.scene = undefined;
  }
}

function createClock() {
  return {
    events: new Set(), paused: false, now: 0,
    addEvent(config) {
      const timer = {
        ...config,
        destroyed: false,
        destroy() { this.callback = undefined; this.destroyed = true; },
      };
      this.events.add(timer);
      return timer;
    },
    delayedCall(delay, callback) { return this.addEvent({ delay, callback }); },
    removeEvent(timer) { this.events.delete(timer); },
    fire(timer) {
      if (!this.paused && this.events.has(timer)) timer.callback?.();
    },
    destroy() {
      for (const timer of this.events) timer.destroy();
      this.events.clear();
    },
  };
}

class TestScene {
  constructor() {
    this.objects = [];
    this.events = new EventEmitter();
    this.time = createClock();
    this.keys = new Map();
    this.input = {
      keyboard: {
        addKey: (name) => {
          if (!this.keys.has(name)) this.keys.set(name, { isDown: false });
          return this.keys.get(name);
        },
        removeKey: (key) => {
          for (const [name, candidate] of this.keys) if (candidate === key) this.keys.delete(name);
        },
      },
    };
    const add = (object) => { this.objects.push(object); return object; };
    this.add = {
      existing: add,
      graphics: () => add(new TestGraphics(this)),
      rectangle: (x, y, width, height) => add(new TestGameObject(this, x, y, width, height)),
      triangle: (x, y) => add(new TestGameObject(this, x, y, 10, 12)),
      text: (x, y, text) => add(new TestGameObject(this, x, y).setText(text)),
      group: () => new TestGroup(this),
    };
    const world = { isPaused: false, setBounds() {} };
    this.physics = {
      world,
      pause() { world.isPaused = true; },
      resume() { world.isPaused = false; },
      add: {
        existing: (object) => {
          object.body = {
            velocity: { x: 0, y: 0 },
            setCollideWorldBounds() {},
            setAllowGravity() {},
            setVelocity(x, y) { Object.assign(this.velocity, { x, y }); },
          };
        },
        group: () => new TestGroup(this),
        overlap: () => ({
          world,
          destroy() {
            assert.ok(this.world, "Collider.destroy must not run twice");
            this.world = undefined;
          },
        }),
      },
    };
    this.cameras = { main: { setBounds() {}, startFollow() {} } };
  }
}

function loadGame() {
  const phaser = {
    Scene: TestScene,
    GameObjects: { Rectangle: TestGameObject, Graphics: TestGraphics, Events: { DESTROY: "destroy" } },
    Scenes: { Events: { SHUTDOWN: "shutdown", DESTROY: "destroy" } },
    Math: { DegToRad: (degrees) => degrees * Math.PI / 180 },
  };
  const modules = new Map();
  function load(filename) {
    if (modules.has(filename)) return modules.get(filename).exports;
    if (!compiledSources.has(filename)) {
      compiledSources.set(filename, ts.transpileModule(readFileSync(filename, "utf8"), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
      }).outputText);
    }
    const loaded = { exports: {} };
    modules.set(filename, loaded);
    runInNewContext(compiledSources.get(filename), {
      module: loaded,
      exports: loaded.exports,
      require: (specifier) => specifier === "phaser"
        ? phaser
        : load(resolve(dirname(filename), `${specifier}.ts`)),
    }, { filename });
    return loaded.exports;
  }
  return {
    ...load(resolve(gameDirectory, "config/gameConfig.ts")),
    ...load(resolve(gameDirectory, "entities/Player.ts")),
    ...load(resolve(gameDirectory, "entities/Enemy.ts")),
    ...load(resolve(gameDirectory, "entities/SwordSlash.ts")),
    ...load(resolve(gameDirectory, "weapons/Sword.ts")),
    MainScene: load(resolve(gameDirectory, "MainScene.ts")).default,
  };
}

function createWeapon(game) {
  const scene = new TestScene();
  const player = new game.Player(scene).setPosition(0, 0);
  const enemies = new Set();
  const hits = [];
  const sword = new game.Sword(scene, player, () => enemies, (enemy, damage) => hits.push({ enemy, damage }));
  return { scene, player, enemies, hits, sword };
}

function approximately(actual, expected) {
  assert.ok(Math.abs(actual - expected) < 1e-8, `${actual} should equal ${expected}`);
}

test("player starts facing right, follows diagonal input, and keeps its last idle facing", () => {
  const game = loadGame();
  const { scene, player } = createWeapon(game);
  assert.equal(player.facingAngle, 0);
  scene.keys.get("A").isDown = true;
  scene.keys.get("W").isDown = true;
  player.updateMovement();
  approximately(player.facingAngle, -3 * Math.PI / 4);
  approximately(Math.hypot(player.body.velocity.x, player.body.velocity.y), game.PLAYER_SPEED);
  scene.keys.get("A").isDown = false;
  scene.keys.get("W").isDown = false;
  player.updateMovement();
  approximately(player.facingAngle, -3 * Math.PI / 4);
  assert.deepEqual(player.body.velocity, { x: 0, y: 0 });
  approximately(player.facingIndicator.rotation, player.facingAngle);
});

test("one slash hits multiple active enemies once, including an enemy overlapping the player", () => {
  const game = loadGame();
  const { scene, player, sword, enemies, hits } = createWeapon(game);
  const closeEnemy = new game.Enemy(scene, player.x, player.y);
  const forwardEnemy = new game.Enemy(scene, 60, 10);
  const behindEnemy = new game.Enemy(scene, -40, 0);
  const inactiveEnemy = new game.Enemy(scene, 55, -10);
  inactiveEnemy.active = false;
  for (const enemy of [closeEnemy, forwardEnemy, behindEnemy, inactiveEnemy]) enemies.add(enemy);
  scene.time.fire(sword.attackTimer);
  sword.update(16);
  sword.update(16);
  assert.equal(hits.length, 2);
  assert.deepEqual(new Set(hits.map((hit) => hit.enemy)), new Set([closeEnemy, forwardEnemy]));
  assert.ok(hits.every((hit) => hit.damage === game.SWORD_DAMAGE));
});

test("a later slash can hit the same enemy and applies the current weapon damage", () => {
  const game = loadGame();
  const { scene, sword, enemies, hits } = createWeapon(game);
  enemies.add(new game.Enemy(scene, 60, 0));
  scene.time.fire(sword.attackTimer);
  sword.update(0);
  sword.increaseDamage(5);
  scene.time.fire(sword.attackTimer);
  sword.update(0);
  assert.deepEqual(hits.map((hit) => hit.damage), [game.SWORD_DAMAGE, game.SWORD_DAMAGE + 5]);
});

test("a fired slash snapshots origin and direction while the player moves and turns", () => {
  const game = loadGame();
  const { scene, player, sword } = createWeapon(game);
  player.setPosition(100, 200);
  scene.keys.get("S").isDown = true;
  player.updateMovement();
  scene.time.fire(sword.attackTimer);
  const [slash] = sword.slashes;
  player.setPosition(500, 600);
  scene.keys.get("S").isDown = false;
  scene.keys.get("A").isDown = true;
  player.updateMovement();
  sword.update(50);
  approximately(slash.rotation, Math.PI / 2);
  approximately(slash.x, 100);
  approximately(slash.y, 200 + game.SWORD_START_OFFSET + game.SWORD_SLASH_SPEED * 0.05);
});

test("large delta checks the entire flight and final range before destroying the slash", () => {
  const game = loadGame();
  const scene = new TestScene();
  const slash = new game.SwordSlash(scene, { x: 0, y: 0 }, 0);
  const pathEnemy = new game.Enemy(scene, 130, 0);
  const finalEnemy = new game.Enemy(scene, game.SWORD_RANGE + 10, 0);
  const beyondRange = new game.Enemy(scene, game.SWORD_RANGE + 15, 0);
  const hits = [];
  let destroyed = 0;
  slash.once("destroy", () => destroyed++);
  slash.advance(10_000, new Set([pathEnemy, finalEnemy, beyondRange]), game.SWORD_DAMAGE, (enemy) => hits.push(enemy));
  assert.deepEqual(hits, [pathEnemy, finalEnemy]);
  approximately(slash.x, game.SWORD_RANGE - game.SWORD_SLASH_RADIUS);
  assert.equal(slash.active, false);
  assert.equal(slash.scene, undefined);
  assert.equal(slash.hitEnemies.size, 0);
  slash.destroy();
  assert.equal(destroyed, 1);
});

test("attack speed upgrades replace the timer and clamp its interval", () => {
  const game = loadGame();
  const { scene, sword } = createWeapon(game);
  const previous = sword.attackTimer;
  sword.increaseAttackSpeed(game.ATTACK_SPEED_UP, game.MIN_ATTACK_INTERVAL);
  assert.equal(previous.destroyed, true);
  assert.equal(scene.time.events.has(previous), false);
  assert.equal(sword.attackTimer.delay, Math.max(game.MIN_ATTACK_INTERVAL, Math.round(game.SWORD_ATTACK_INTERVAL * game.ATTACK_SPEED_UP)));
  scene.time.fire(previous);
  assert.equal(sword.slashes.size, 0);
  sword.increaseAttackSpeed(0.001, game.MIN_ATTACK_INTERVAL);
  assert.equal(sword.attackTimer.delay, game.MIN_ATTACK_INTERVAL);
  assert.equal(scene.time.events.size, 1);
});

test("level-up and game-over pause both slash travel and its lifetime", () => {
  const game = loadGame();
  const scene = new game.MainScene();
  scene.create();
  scene.time.fire(scene.weapon.attackTimer);
  const [slash] = scene.weapon.slashes;
  const initialX = slash.x;
  scene.levelUp.show(2);
  scene.time.fire(scene.weapon.attackTimer);
  scene.update(0, 10_000);
  assert.equal(scene.weapon.slashes.size, 1);
  assert.equal(slash.x, initialX);
  assert.equal(slash.traveled, 0);
  assert.equal(slash.active, true);
  scene.levelUp.selectUpgrade("damage");
  scene.update(0, 16);
  assert.ok(slash.x > initialX);
  const resumedX = slash.x;
  scene.gameOver();
  scene.update(0, 10_000);
  assert.equal(slash.x, resumedX);
  assert.equal(slash.active, true);
  scene.events.emit("shutdown");
  assert.equal(scene.weapon.slashes.size, 0);
});

test("weapon cleanup releases every slash and its timer", () => {
  const game = loadGame();
  const { scene, sword } = createWeapon(game);
  scene.time.fire(sword.attackTimer);
  scene.time.fire(sword.attackTimer);
  const slashes = [...sword.slashes];
  assert.equal(slashes.length, 2);
  sword.destroy();
  assert.equal(scene.time.events.size, 0);
  assert.equal(sword.slashes.size, 0);
  assert.ok(slashes.every((slash) => !slash.active && slash.scene === undefined));
  assert.doesNotThrow(() => sword.destroy());
});

test("scene cleanup tolerates display objects and clock already destroyed by Phaser", () => {
  const game = loadGame();
  const scene = new game.MainScene();
  scene.create();
  scene.time.fire(scene.weapon.attackTimer);
  const [slash] = scene.weapon.slashes;
  const enemy = new game.Enemy(scene, slash.x + 50, slash.y);
  slash.advance(0, [enemy], game.SWORD_DAMAGE, () => {});
  assert.equal(slash.hitEnemies.size, 1);
  scene.levelUp.show(2);
  for (const object of [...scene.objects].reverse()) object.destroy(true);
  scene.time.destroy();
  assert.doesNotThrow(() => scene.events.emit("destroy"));
  assert.equal(scene.weapon.slashes.size, 0);
  assert.equal(slash.hitEnemies.size, 0);
  assert.equal(scene.time.events.size, 0);
  assert.equal(scene.keys.size, 0);
  assert.equal(scene.events.listenerCount("shutdown"), 0);
  assert.equal(scene.events.listenerCount("destroy"), 0);
});
