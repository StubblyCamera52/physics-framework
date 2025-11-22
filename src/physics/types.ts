import { Vector2 } from "../math/vector2";

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