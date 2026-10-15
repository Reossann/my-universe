export type Point = {
  readonly x: number;
  readonly y: number;
};

export type RectangleBounds = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

// A fan of at most 180 degrees is convex, so the same polygon can be drawn
// and checked for collisions with the separating axis theorem below.
export function createSectorPoints(
  radius: number,
  arcRadians: number,
  segments = 16,
): Point[] {
  const points: Point[] = [{ x: 0, y: 0 }];

  for (let index = 0; index <= segments; index++) {
    const angle = -arcRadians / 2 + (arcRadians * index) / segments;
    points.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
  }

  return points;
}

export function transformSectorPoints(
  points: readonly Point[],
  x: number,
  y: number,
  angle: number,
): Point[] {
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);

  return points.map((point) => ({
    x: x + point.x * cosine - point.y * sine,
    y: y + point.x * sine + point.y * cosine,
  }));
}

export function sectorIntersectsRectangle(
  points: readonly Point[],
  bounds: RectangleBounds,
): boolean {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const point of points) {
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
    minY = Math.min(minY, point.y);
    maxY = Math.max(maxY, point.y);
  }

  const right = bounds.x + bounds.width;
  const bottom = bounds.y + bounds.height;

  // This also checks the rectangle's two edge axes before the polygon axes.
  if (maxX < bounds.x || right < minX || maxY < bounds.y || bottom < minY) {
    return false;
  }

  for (let index = 0; index < points.length; index++) {
    const start = points[index];
    const end = points[(index + 1) % points.length];
    const axisX = -(end.y - start.y);
    const axisY = end.x - start.x;
    let polygonMin = Infinity;
    let polygonMax = -Infinity;

    for (const point of points) {
      const projection = point.x * axisX + point.y * axisY;
      polygonMin = Math.min(polygonMin, projection);
      polygonMax = Math.max(polygonMax, projection);
    }

    // Each axis component selects the rectangle corner at either end of its
    // projected interval. No corner needs to lie inside the fan to hit it.
    const rectangleMin =
      (axisX < 0 ? right : bounds.x) * axisX +
      (axisY < 0 ? bottom : bounds.y) * axisY;
    const rectangleMax =
      (axisX < 0 ? bounds.x : right) * axisX +
      (axisY < 0 ? bounds.y : bottom) * axisY;

    // Equal endpoints touch, and count as a hit.
    if (polygonMax < rectangleMin || rectangleMax < polygonMin) return false;
  }

  return true;
}
