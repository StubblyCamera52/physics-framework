import { Vector2 } from "../math/vector2";

export class AABB {
  min: Vector2;
  max: Vector2;

  constructor(min?: Vector2, max?: Vector2) {
    this.min = min ?? new Vector2();
    this.max = max ?? new Vector2();
  }

  setFromSize(w: number, h: number) {
    this.min.set(-w/2, -h/2);
    this.max.set(w/2, h/2);
  }

  setFromMinMax({x, y}: {x: number, y: number}, {x2, y2}: {x2: number, y2: number}) {
    this.min.set(x, y);
    this.max.set(x2, y2);
  }

  offset(x: number, y: number) {
    this.min = this.min.add(new Vector2(x, y));
    this.max = this.max.add(new Vector2(x, y));
  }
}

export function AABBintersectAABB(a: AABB, b: AABB): boolean {
  // seperating axis theorem
  if (a.max.x < b.min.x || a.min.x > b.max.x) return false;
  if (a.max.y < b.min.y || a.min.y > b.max.y) return false;

  return true;
}

export type Pair = {
  a: string; // id
  b: string;
}

export type Manifold = {
  pair: Pair;
  penetration: number;
  normal: Vector2;
}