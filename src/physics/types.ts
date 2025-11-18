interface vec2 {
  x: number;
  y: number;
}

export class Vector2 implements vec2 {
  x = 0;
  y = 0;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

export type AABB = {
  min: Vector2;
  max: Vector2;
}

export function AABBintersectAABB(a: AABB, b: AABB): boolean {
  // seperating axis theorem
  if (a.max.x < b.min.x || a.min.x > b.max.x) return false;
  if (a.max.y < b.min.y || a.min.y > b.max.y) return false;

  return true;
}