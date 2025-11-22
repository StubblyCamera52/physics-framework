import type { RenderState } from "../canvas/canvas";
import { Vector2 } from "../math/vector2";
import type { Body } from "./bodies";
import { AABBintersectAABB, type Pair } from "./types";

interface PhysicsWorld {
  bodies: Map<string, Body>;

  insertBody: (body: Body) => void;
  removeBody: (id: string) => void;

  update: (dt: number) => void;
  getState: () => Map<string, RenderState>;
}

export class StandardWorld implements PhysicsWorld {
  bodies: Map<string, Body>;

  constructor() {
    this.bodies = new Map<string, Body>;
  }

  insertBody(body: Body): void {
    if (!this.bodies.has(body.id)) {
      this.bodies.set(body.id, body);
    }
  }

  removeBody(id: string): void {
    if (this.bodies.has(id)) {
      this.bodies.delete(id);
    }
  }
  
  update(dt: number): void {
    // update position, velocity, and AABB
    this.bodies.forEach((b) => {
      if (b.isStatic) return;

      b.velocity = b.velocity.add(new Vector2(0, 0/* 9*dt */));
      b.position = b.position.add(b.velocity);
      b.boundingBox = {min: b.position.sub(b.size.scalarDiv(2)), max: b.position.add(b.size.scalarDiv(2))};
    });

    let pairs: Array<Pair> = [];

    const ids = Array.from(this.bodies.keys());

    // i know this is suboptimal ill fix it later
    for (let i = 0; i < ids.length; i++) {
      for (let j = i+1; j < ids.length; j++) {
        pairs.push({a: ids[i], b: ids[j]});
      }
    }

    
    // find colliding aabb
    pairs = pairs.filter((pair) => {
      let aabb1 = this.bodies.get(pair.a)?.boundingBox;
      let aabb2 = this.bodies.get(pair.b)?.boundingBox;
      if (!aabb1 || !aabb2) return false;
      
      return AABBintersectAABB(aabb1, aabb2);
    });

    // console.log(pairs);
    
    pairs.forEach((pair) => {
      let bodyA = this.bodies.get(pair.a);
      let bodyB = this.bodies.get(pair.b);
      if (!bodyA || !bodyB) return;

      const collisionNormal = bodyA.position.sub(bodyB.position).normalize();

      let relVelocity = bodyB.velocity.sub(bodyA.velocity);
      let velocityAlongNorm = relVelocity.dot(collisionNormal);
      if (velocityAlongNorm > 0) return; // do not resolve if the bodies are already seperating

      let restitution = Math.min(bodyA.restitution, bodyB.restitution);

      // impulse scalar
      let iScal = -(1 + restitution) * velocityAlongNorm;
      iScal /= (1/bodyA.mass) + (1/bodyB.mass);

      // apply the impulse
      let impulse = collisionNormal.scalarMul(iScal);
      bodyA.velocity = bodyA.velocity.sub(impulse.scalarMul(1/bodyA.mass));
      bodyB.velocity = bodyB.velocity.add(impulse.scalarMul(1/bodyB.mass));
    });
  }

  getState(): Map<string, RenderState> {
    let renderStates = new Map<string, RenderState>;
    this.bodies.forEach((body, id) => {
      renderStates.set(id, body.toRenderState());
    });

    return renderStates;
  }

}