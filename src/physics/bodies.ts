import type { RenderState } from "../canvas/canvas";
import { Vector2 } from "../math/vector2";
import { type AABB } from "./types";

export interface Body {
  id: string;
  position: Vector2;
  velocity: Vector2;
  boundingBox: AABB;
  size: Vector2;
  mass: number;
  restitution: number;

  primitiveType: "circle" | "aabb";

  isStatic: boolean;

  toRenderState: () => RenderState;
}

export class SquareBody implements Body {
  id: string;
  position: Vector2;
  velocity: Vector2;
  boundingBox: AABB;
  size: Vector2;
  isStatic = false;
  mass = 1;
  restitution = 0.2;
  primitiveType = "aabb" as "aabb";

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

export class CircleBody implements Body {
  id: string;
  position: Vector2;
  velocity: Vector2;
  boundingBox: AABB;
  size: Vector2;
  isStatic = false;
  mass = 1;
  restitution = 0;
  primitiveType = "circle" as "circle";

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
  mass = 9999;
  restitution = 0;
  primitiveType = "aabb" as "aabb";

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