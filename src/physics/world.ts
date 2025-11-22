import type { RenderState } from "../canvas/canvas";
import { Vector2 } from "../math/vector2";
import type { Body } from "./bodies";
import { AABBintersectAABB, type Pair, type Manifold } from "./types";

interface PhysicsWorld {
  bodies: Map<string, Body>;

  insertBody: (body: Body) => void;
  removeBody: (id: string) => void;

  update: (dt: number) => void;
  getState: () => Map<string, RenderState>;
}

export class StandardWorld implements PhysicsWorld {
  bodies: Map<string, Body>;
  private collisions = new Set<Manifold>;

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
    if (dt > 0.2) return;
    // update position, velocity, and AABB
    this.bodies.forEach((b) => {
      if (b.isStatic) return;

      b.velocity.y += 40*dt;
      b.position = b.position.add(b.velocity.scalarMul(dt));
      b.boundingBox = {min: b.position.sub(b.size.scalarDiv(2)), max: b.position.add(b.size.scalarDiv(2))};
    });

    this.calculateCollisionInformation();
    this.resolveCollisions();
  }

  private calculateCollisionInformation() {
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

    this.collisions.clear();

    pairs.forEach((pair) => {
      let bodyA = this.bodies.get(pair.a);
      let bodyB = this.bodies.get(pair.b);
      if (!bodyA || !bodyB) return;

      if (bodyA.primitiveType == "rect" && bodyB.primitiveType == "rect") {
        let collisionNormal;
        const overlapX = Math.min(bodyA.boundingBox.max.x, bodyB.boundingBox.max.x) - Math.max(bodyA.boundingBox.min.x, bodyB.boundingBox.min.x);
        const overlapY = Math.min(bodyA.boundingBox.max.y, bodyB.boundingBox.max.y) - Math.max(bodyA.boundingBox.min.y, bodyB.boundingBox.min.y);
        const penetrationDepth = Math.min(overlapX, overlapY);
        if (overlapX < overlapY) {
          collisionNormal = new Vector2(bodyA.position.x < bodyB.position.x ? -1 : 1, 0);
        } else {
          collisionNormal = new Vector2(0, bodyA.position.y < bodyB.position.y ? 1 : -1);
        }

        this.collisions.add({pair, penetration: penetrationDepth, normal: collisionNormal});
      }
    });
  }

  private resolveCollisions() {
    this.collisions.forEach((manifold) => {
      let bodyA = this.bodies.get(manifold.pair.a);
      let bodyB = this.bodies.get(manifold.pair.b);
      if (!bodyA || !bodyB) return;

      let relVelocity = bodyB.velocity.sub(bodyA.velocity);
      let velocityAlongNorm = relVelocity.dot(manifold.normal);
      if (velocityAlongNorm > 0) return; // do not resolve if the bodies are already seperating
  
      let restitution = Math.min(bodyA.restitution, bodyB.restitution);
  
      // impulse scalar
      let iScal = -(1 + restitution) * velocityAlongNorm;
      iScal /= (1/bodyA.mass) + (1/bodyB.mass);
  
      // apply the impulse
      let impulse = manifold.normal.scalarMul(iScal);
      bodyA.velocity = bodyA.velocity.sub(impulse.scalarMul(1/bodyA.mass));
      bodyB.velocity = bodyB.velocity.add(impulse.scalarMul(1/bodyB.mass));
  
      // preform position correction to stop "sinking";
      const percent = 0.8;
      const slop = 0.001;
      
      const depth = Math.max(manifold.penetration - slop, 0);
  
      const invMassA = bodyA.isStatic ? 0 : 1/bodyA.mass;
      const invMassB = bodyB.isStatic ? 0 : 1/bodyB.mass;
  
      const invMassSum = invMassA + invMassB;
      if (invMassSum == 0) return; // both are static bodies
  
      const correctionAmount = (depth * percent)/invMassSum;
      const correction = manifold.normal.scalarMul(correctionAmount);
  
      if (!bodyA.isStatic) {
        bodyA.position = bodyA.position.sub(correction.scalarMul(invMassA));
      }
  
      if (!bodyB.isStatic) {
        bodyB.position = bodyB.position.add(correction.scalarMul(invMassB));
      }
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