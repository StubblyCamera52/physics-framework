import type { RenderState } from "../canvas/canvas";
import { Vector2 } from "../math/vector2";
import { type AABB } from "./types";

export interface Body {
  id: string;
  position: Vector2;
  velocity: Vector2;
  boundingBox: AABB;
  size: Vector2;

  isStatic: boolean;

  toRenderState: () => RenderState;
}

// class CircleBody implements Body {
//   id: string;
//   position: Vector2;
//   velocity: Vector2;
//   boundingBox: AABB;
//   radius: number;

//   constructor(id: string, x: number, y: number, radius: number) {
//     this.id = id;
//     this.position = new Vector2(x, y);
//     this.velocity = new Vector2(0, 0);
//     this.radius = 20;
//     this.boundingBox = {min: new Vector2(x - this.radius, y - this.radius), max: new Vector2(x + this.radius, y + this.radius)}
//   }
// }

export class SquareBody implements Body {
  id: string;
  position: Vector2;
  velocity: Vector2;
  boundingBox: AABB;
  size: Vector2;
  isStatic = false;

  constructor(id: string, x: number, y: number, size: number) {
    this.id = id;
    this.position = new Vector2(x, y);
    this.velocity = new Vector2(0, 0);
    this.size = new Vector2(size, size);
    this.boundingBox = {min: this.position.sub(this.size.scalarDiv(2)), max: this.position.add(this.size.scalarDiv(2))};
  }

  toRenderState(): RenderState {
    return {x: this.position.x, y: this.position.y, w: this.size.x, h: this.size.y, id: this.id} as RenderState;
  }
}

export class StaticRectBody implements Body {
  id: string;
  position: Vector2;
  velocity: Vector2;
  boundingBox: AABB;
  size: Vector2;
  isStatic = true;

  constructor(id: string, x: number, y: number, w: number, h: number) {
    this.id = id;
    this.position = new Vector2(x, y);
    this.velocity = new Vector2(0, 0);
    this.size = new Vector2(w, h);
    this.boundingBox = {min: this.position.sub(this.size.scalarDiv(2)), max: this.position.add(this.size.scalarDiv(2))};
  }

  toRenderState(): RenderState {
    return {x: this.position.x, y: this.position.y, w: this.size.x, h: this.size.y, id: this.id} as RenderState;
  }
}