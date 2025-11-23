import type { RenderState } from "../canvas/canvas";
import { Vector2 } from "../math/vector2";
import { AABB } from "./types";

export interface Body {
  id: string;
  position: Vector2;
  velocity: Vector2;
  force: Vector2;

  data: BodyData;
  shape: BodyShape;
  properties: PhysicalProperties;
  flags: BodyFlags;
}

export interface BodyData {
  mass: number;
  invMass: number;

  intertia: number;
  invIntertia: number;
}

export class BodyShape {
  primitive: PrimitiveShape;
  boundingBox: AABB;
  area = 1;

  constructor(primitive: PrimitiveShape) {
    this.primitive = primitive;
    this.boundingBox = new AABB();
    this.calculateArea();
    this.calculateAABB();
  }

  static readonly SQUARE_20 = new this({type: "rect", width: 20, height: 20});
  static readonly CIRCLE_20 = new this({type: "circle", radius: 10});

  toRenderState(pos: Vector2, id: string): RenderState {
    switch (this.primitive.type) {
      case "rect":
        return {x: pos.x, y: pos.y, w: this.primitive.width, h: this.primitive.height, id: id} as RenderState;
      case "circle":
        return {x: pos.x, y: pos.y, w: this.primitive.radius, h: this.primitive.radius, id: id} as RenderState;
      case "convexPolygon":
        return {x: pos.x, y: pos.y, w: 20, h: 20, id: id} as RenderState;
    }
  }

  calculateArea() {
    switch (this.primitive.type) {
      case "rect":
        this.area = this.primitive.width * this.primitive.height;
        break;
      case "circle":
        this.area = Math.PI*this.primitive.radius*this.primitive.radius;
        break;
      case "convexPolygon":
        this.area = 1;
        break;
    }
  }

  calculateMass(density: number): number {
    return this.area*density;
  }

  calculateAABB() {
    switch (this.primitive.type) {
      case "rect":
        this.boundingBox.setFromSize(this.primitive.width, this.primitive.height);
        break;
      case "circle":
        this.boundingBox.setFromMinMax({x: -this.primitive.radius, y: -this.primitive.radius}, {x2: this.primitive.radius, y2: this.primitive.radius})
        break;
      case "convexPolygon":
        break;
    }
  }
}

export type PrimitiveShape = 
  | {
    type: "rect";
    width: number;
    height: number;
  } | {
    type: "circle";
    radius: number;
  } | {
    type: "convexPolygon";
    points: {x: number; y: number}[];
  };

// 0000 4 bit flag, 1st bit is static or not. other bits to come later (maybe, depends on what i need)
export enum BodyFlags {
  None = 0,
  Static = 1 << 0,
  All = Static,
}

export class PhysicalProperties {
  restitution: number;
  friction: number;
  density: number;

  constructor(restitution: number, friction: number, density: number) {
    this.restitution = restitution;
    this.friction = friction;
    this.density = density;
  }

  static readonly ROCK = new this(0.1, 0.5, 0.6);
}

export class GenericBody {
  id: string;
  position = new Vector2();
  velocity = new Vector2();
  force = new Vector2();

  data: BodyData;
  shape: BodyShape;
  properties: PhysicalProperties
  flags = BodyFlags.None;

  constructor(id: string, properties: PhysicalProperties, shape: BodyShape) {
    this.id = id;
    this.shape = shape;
    this.properties = properties;

    let mass = this.shape.calculateMass(this.properties.density);
    this.data = {mass, invMass: 1/mass, intertia: 0, invIntertia: 0};
  }

  setFlags(flags: BodyFlags) {
    this.flags = flags;
  }

  orFlags(flags: BodyFlags) {
    this.flags |= flags;
  }

  andFlags(flags: BodyFlags) {
    this.flags &= flags;
  }

  setPositition(x: number, y: number) {
    this.position.x = x;
    this.position.y = y;
  }

  setVelocity(x: number, y: number) {
    this.velocity.x = x;
    this.velocity.y = y;
  }
}



// export class SquareBody implements Body {
//   id: string;
//   position: Vector2;
//   velocity: Vector2;
//   boundingBox: AABB;
//   size: Vector2;
//   isStatic = false;
//   mass = 1;
//   restitution = 0.2;
//   primitiveType = "aabb" as "aabb";

//   constructor(id: string, x: number, y: number, size: number) {
//     this.id = id;
//     this.position = new Vector2(x, y);
//     this.velocity = new Vector2(0, 0);
//     this.size = new Vector2(size, size);
//     this.boundingBox = {min: this.position.sub(this.size.scalarDiv(2)), max: this.position.add(this.size.scalarDiv(2))};
//   }

//   toRenderState(): RenderState {
//     return {x: this.position.x, y: this.position.y, w: this.size.x, h: this.size.y, id: this.id} as RenderState;
//   }
// }

// export class CircleBody implements Body {
//   id: string;
//   position: Vector2;
//   velocity: Vector2;
//   boundingBox: AABB;
//   size: Vector2;
//   isStatic = false;
//   mass = 1;
//   restitution = 1;
//   primitiveType = "circle" as "circle";

//   constructor(id: string, x: number, y: number, size: number) {
//     this.id = id;
//     this.position = new Vector2(x, y);
//     this.velocity = new Vector2(0, 0);
//     this.size = new Vector2(size, size);
//     this.boundingBox = {min: this.position.sub(this.size.scalarDiv(2)), max: this.position.add(this.size.scalarDiv(2))};
//   }

//   toRenderState(): RenderState {
//     return {x: this.position.x, y: this.position.y, w: this.size.x, h: this.size.y, id: this.id} as RenderState;
//   }
// }

// export class StaticRectBody implements Body {
//   id: string;
//   position: Vector2;
//   velocity: Vector2;
//   boundingBox: AABB;
//   size: Vector2;
//   isStatic = true;
//   mass = 1;
//   restitution = 0.2;
//   primitiveType = "aabb" as "aabb";

//   constructor(id: string, x: number, y: number, w: number, h: number) {
//     this.id = id;
//     this.position = new Vector2(x, y);
//     this.velocity = new Vector2(0, 0);
//     this.size = new Vector2(w, h);
//     this.boundingBox = {min: this.position.sub(this.size.scalarDiv(2)), max: this.position.add(this.size.scalarDiv(2))};
//   }

//   toRenderState(): RenderState {
//     return {x: this.position.x, y: this.position.y, w: this.size.x, h: this.size.y, id: this.id} as RenderState;
//   }
// }