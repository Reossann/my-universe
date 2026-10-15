import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

// Load the pure TypeScript module with the project's existing compiler.
const source = readFileSync(new URL("./sectorGeometry.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  },
}).outputText;
const geometryModule = { exports: {} };
runInNewContext(compiled, {
  module: geometryModule,
  exports: geometryModule.exports,
});
const { createSectorPoints, transformSectorPoints, sectorIntersectsRectangle } =
  geometryModule.exports;

const radians = (degrees) => (degrees * Math.PI) / 180;
const fan = createSectorPoints(100, radians(100));

test("creates a filled right-facing sector with both arc endpoints", () => {
  const points = createSectorPoints(100, Math.PI / 2, 4);
  assert.equal(points.length, 6);
  assert.equal(points[0].x, 0);
  assert.equal(points[0].y, 0);
  assert.ok(Math.abs(points[1].x - Math.SQRT1_2 * 100) < 1e-10);
  assert.ok(Math.abs(points[1].y + Math.SQRT1_2 * 100) < 1e-10);
  assert.equal(points[3].x, 100);
  assert.equal(points[3].y, 0);
  assert.ok(Math.abs(points[5].y - Math.SQRT1_2 * 100) < 1e-10);
});

test("hits the front, and misses targets behind or beyond range", () => {
  assert.equal(sectorIntersectsRectangle(fan, { x: 40, y: -8, width: 16, height: 16 }), true);
  assert.equal(sectorIntersectsRectangle(fan, { x: -30, y: -8, width: 16, height: 16 }), false);
  assert.equal(sectorIntersectsRectangle(fan, { x: 111, y: -8, width: 16, height: 16 }), false);
});

test("hits a rectangle whose center is outside the angle but edge is inside", () => {
  const narrowFan = createSectorPoints(100, Math.PI / 2);
  assert.equal(sectorIntersectsRectangle(narrowFan, { x: 35, y: 40, width: 10, height: 10 }), true);
});

test("hits a rectangle whose center is beyond range but near edge overlaps", () => {
  assert.equal(sectorIntersectsRectangle(fan, { x: 95, y: -5, width: 20, height: 10 }), true);
});

test("rejects boxes inside the broadphase bounds but outside the fan", () => {
  assert.equal(sectorIntersectsRectangle(fan, { x: 95, y: 40, width: 10, height: 10 }), false);
  assert.equal(sectorIntersectsRectangle(fan, { x: 0, y: 70, width: 10, height: 10 }), false);
});

test("detects a crossing thin rectangle even when none of its corners are inside", () => {
  assert.equal(sectorIntersectsRectangle(fan, { x: 40, y: -100, width: 1, height: 200 }), true);
});

test("follows downward and left-facing rotations", () => {
  const downward = transformSectorPoints(fan, 0, 0, Math.PI / 2);
  const leftward = transformSectorPoints(fan, 0, 0, Math.PI);
  assert.equal(sectorIntersectsRectangle(downward, { x: -8, y: 40, width: 16, height: 16 }), true);
  assert.equal(sectorIntersectsRectangle(downward, { x: -8, y: -56, width: 16, height: 16 }), false);
  assert.equal(sectorIntersectsRectangle(leftward, { x: -56, y: -8, width: 16, height: 16 }), true);
  assert.equal(sectorIntersectsRectangle(leftward, { x: 40, y: -8, width: 16, height: 16 }), false);
});

test("wraparound directions give the same collisions", () => {
  const direction = -0.1;
  const first = transformSectorPoints(fan, 0, 0, direction);
  const wrapped = transformSectorPoints(fan, 0, 0, direction + Math.PI * 2);
  for (const bounds of [
    { x: 40, y: -10, width: 10, height: 8 },
    { x: -50, y: -10, width: 10, height: 8 },
    { x: 20, y: 65, width: 10, height: 8 },
  ]) {
    assert.equal(
      sectorIntersectsRectangle(first, bounds),
      sectorIntersectsRectangle(wrapped, bounds),
    );
  }
});

test("includes tangent contact at the radius and arc endpoint", () => {
  assert.equal(sectorIntersectsRectangle(fan, { x: 100, y: 0, width: 10, height: 10 }), true);
  assert.equal(sectorIntersectsRectangle(fan, { x: 100.01, y: 0, width: 10, height: 10 }), false);
  const arcEnd = fan[fan.length - 1];
  assert.equal(
    sectorIntersectsRectangle(fan, { x: arcEnd.x, y: arcEnd.y, width: 10, height: 10 }),
    true,
  );
});

test("translates the origin and tests against world-space bounds", () => {
  const translated = transformSectorPoints(fan, 300, 200, Math.PI / 2);
  assert.equal(translated[0].x, 300);
  assert.equal(translated[0].y, 200);
  assert.equal(sectorIntersectsRectangle(translated, { x: 292, y: 240, width: 16, height: 16 }), true);
  assert.equal(sectorIntersectsRectangle(translated, { x: 292, y: 140, width: 16, height: 16 }), false);
});
