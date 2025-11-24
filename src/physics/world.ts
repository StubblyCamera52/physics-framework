// @ts-nocheck
import type { RenderState } from "../canvas/canvas";
import { clamp } from "../math/helper";
import { Vector2 } from "../math/vector2";
import { BodyFlags, type Body } from "./bodies";
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
  private collisions = new Set<Manifold>();

  constructor() {
    this.bodies = new Map<string, Body>();
  }

  getBody(id: string): Body | undefined {
    return this.bodies.get(id);
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

    // integration
    this.bodies.forEach((b) => {
      if ((b.flags & BodyFlags.Static) === BodyFlags.Static) return;
      b.force.y += b.data.mass*98;
    });
    
    // f=ma
    this.bodies.forEach((b) => {
      if ((b.flags & BodyFlags.Static) === BodyFlags.Static) return;
      
      const acceleration = b.force.scalarMul(b.data.invMass);
      b.velocity = b.velocity.add(acceleration.scalarMul(dt));

      b.force.set(0, 0);
    });

    // update position, velocity, and AABB

    this.bodies.forEach((b) => {
      if ((b.flags & BodyFlags.Static) === BodyFlags.Static) return;
      b.position = b.position.add(b.velocity.scalarMul(dt));
      b.shape.calculateAABB();
      b.shape.boundingBox.offset(b.position.x, b.position.y);
    });
    
    for (let i = 0; i < 10; i++) {
      this.calculateCollisionInformation();
      this.resolveCollisions();
      
      this.bodies.forEach((b) => {
        if ((b.flags & BodyFlags.Static) === BodyFlags.Static) return;
        b.shape.calculateAABB();
        b.shape.boundingBox.offset(b.position.x, b.position.y);
      });
      
    }
  }

  private calculateCollisionInformation() {
    let pairs: Array<Pair> = [];

    const ids = Array.from(this.bodies.keys());

    // i know this is suboptimal ill fix it later
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        pairs.push({ a: ids[i], b: ids[j] });
      }
    }

    // find colliding aabb
    pairs = pairs.filter((pair) => {
      let aabb1 = this.bodies.get(pair.a)?.shape.boundingBox;
      let aabb2 = this.bodies.get(pair.b)?.shape.boundingBox;
      if (!aabb1 || !aabb2) return false;

      const intersect =  AABBintersectAABB(aabb1, aabb2);

      // if (
      //   (pair.a === "wall1" || pair.a === "wall2") &&
      //   pair.b.startsWith("ball")
      // ) {
      //   console.log(`${pair.a} vs ${pair.b}: intersects=${intersect}`);
      //   console.log(
      //     `  ${pair.a} bbox: min(${aabb1.min.x}, ${aabb1.min.y}) max(${aabb1.max.x}, ${aabb1.max.y})`
      //   );
      //   console.log(
      //     `  ${pair.b} bbox: min(${aabb2.min.x}, ${aabb2.min.y}) max(${aabb2.max.x}, ${aabb2.max.y})`
      //   );
      // }

      return intersect;
    });

    this.collisions.clear();

    pairs.forEach((pair) => {
      let bodyA = this.bodies.get(pair.a);
      let bodyB = this.bodies.get(pair.b);
      if (!bodyA || !bodyB) return;

      if (bodyA.shape.primitive.type == "rect" && bodyB.shape.primitive.type == "rect") {
        let aToB = bodyB.position.sub(bodyA.position);

        let aExtent = (bodyA.shape.boundingBox.max.x - bodyA.shape.boundingBox.min.x) / 2;
        let bExtent = (bodyB.shape.boundingBox.max.x - bodyB.shape.boundingBox.min.x) / 2;

        let overlapX = aExtent + bExtent - Math.abs(aToB.x);

        // SAT test x axis
        if (overlapX > 0) {
          aExtent = (bodyA.shape.boundingBox.max.y - bodyA.shape.boundingBox.min.y) / 2;
          bExtent = (bodyB.shape.boundingBox.max.y - bodyB.shape.boundingBox.min.y) / 2;

          let overlapY = aExtent + bExtent - Math.abs(aToB.y);

          if (overlapY > 0) {
            // find axis of least penetration
            if (overlapX < overlapY) {
              // point towards B
              if (aToB.x < 0) {
                this.collisions.add({
                  pair,
                  penetration: overlapX,
                  normal: new Vector2(-1, 0),
                });
              } else {
                this.collisions.add({
                  pair,
                  penetration: overlapX,
                  normal: new Vector2(1, 0),
                });
              }
            } else {
              if (aToB.y < 0) {
                this.collisions.add({
                  pair,
                  penetration: overlapY,
                  normal: new Vector2(0, -1),
                });
              } else {
                this.collisions.add({
                  pair,
                  penetration: overlapY,
                  normal: new Vector2(0, 1),
                });
              }
            }
          }
        }
      } else if (
        bodyA.shape.primitive.type == "circle" &&
        bodyB.shape.primitive.type == "circle"
      ) {
        let radiusA = bodyA.shape.primitive.radius;
        let radiusB = bodyB.shape.primitive.radius;

        let aToB = bodyB.position.sub(bodyA.position);

        let r = radiusA + radiusB;
        let r2 = r*r;

        // they have not actually collided
        if (aToB.lengthSquared() > r2) {
          return false;
        }

        let dist = aToB.length();

        if (dist != 0) {
          const penetration = r - dist;
          const collisionNormal = aToB.scalarDiv(dist);

          this.collisions.add({ pair, penetration, normal: collisionNormal });
        } else {
          // circles are same pos
          this.collisions.add({
            pair,
            penetration: radiusA,
            normal: new Vector2(0, -1),
          });
        }
      } else if ((bodyA.shape.primitive.type == "rect" && bodyB.shape.primitive.type == "circle") || (bodyA.shape.primitive.type == "circle" && bodyB.shape.primitive.type == "rect")) {
        if (bodyA.shape.primitive.type == "circle") {
          [bodyA, bodyB] = [bodyB, bodyA];
        }
        let aToB = bodyB.position.sub(bodyA.position);

        let closest = new Vector2(aToB.x, aToB.y);

        let xExtent = bodyA.shape.primitive.width / 2;
        let yExtent = bodyA.shape.primitive.height / 2;

        closest.x = clamp(closest.x, -xExtent, xExtent);
        closest.y = clamp(closest.y, -yExtent, yExtent);

        let inside = false;

        // circle is inside aabb
        if (aToB.x === closest.x && aToB.y === closest.y) {
          inside = true;

          if (Math.abs(aToB.x) > Math.abs(aToB.y)) {
            if (closest.x > 0) {
              closest.x = xExtent;
            } else {
              closest.x = -xExtent;
            }
          } else {
            if (closest.y > 0) {
              closest.y = yExtent;
            } else {
              closest.y = -yExtent;
            }
          }
        }

        let normal = aToB.sub(closest);
        let dist = normal.lengthSquared();
        let radius = bodyB.shape.primitive.radius;

        if (dist > (radius*radius) && !inside) return false;

        dist = Math.sqrt(dist);

        if (inside) {
          this.collisions.add({pair: {a: bodyA.id, b: bodyB.id}, normal: normal.scalarMul(-1).normalize(), penetration: radius-dist});
        } else {
          this.collisions.add({pair: {a: bodyA.id, b: bodyB.id}, normal: normal.normalize(), penetration: radius-dist})
        }
      }
    });
  }

  private resolveCollisions() {
    this.collisions.forEach((manifold) => {
      let bodyA = this.bodies.get(manifold.pair.a);
      let bodyB = this.bodies.get(manifold.pair.b);
      if (!bodyA || !bodyB) return;
      
      let restitution = Math.min(bodyA.properties.restitution, bodyB.properties.restitution);
      let friction = Math.sqrt(bodyA.properties.friction*bodyB.properties.friction);
      
      const invMassA = ((bodyA.flags & BodyFlags.Static) === BodyFlags.Static) ? 0 : bodyA.data.invMass;
      const invMassB = ((bodyB.flags & BodyFlags.Static) === BodyFlags.Static) ? 0 : bodyB.data.invMass;
      
      const invMassSum = invMassA + invMassB;
      if (invMassSum == 0) return; // both are static bodies
      
      let relVelocity = bodyB.velocity.sub(bodyA.velocity);
      let velocityAlongNorm = relVelocity.dot(manifold.normal);

      if (velocityAlongNorm < 0) {
        let iScal = -(1 + restitution) * velocityAlongNorm;
        iScal /= invMassSum;

        // apply the impulse
        let impulse = manifold.normal.scalarMul(iScal);
        if (!((bodyA.flags & BodyFlags.Static) === BodyFlags.Static)) {
          bodyA.velocity = bodyA.velocity.sub(impulse.scalarMul(invMassA));
        }

        if (!((bodyB.flags & BodyFlags.Static) === BodyFlags.Static)) {
          bodyB.velocity = bodyB.velocity.add(impulse.scalarMul(invMassB));
        }

        // friction impulse
        relVelocity = bodyB.velocity.sub(bodyA.velocity);

        let tangent = relVelocity.sub(manifold.normal.scalarMul(relVelocity.dot(manifold.normal)));

        // div/0 is bad
        if (tangent.lengthSquared() > 0.001) {
          tangent = tangent.normalize();

          let frictionMagnitude = -relVelocity.dot(tangent) / invMassSum;

          let normalForce = Math.abs(iScal);
          let maxFriction = friction*normalForce;

          frictionMagnitude = clamp(frictionMagnitude, -maxFriction, maxFriction);

          let frictionImpulse = tangent.scalarMul(frictionMagnitude);

          if (!((bodyA.flags & BodyFlags.Static) == BodyFlags.Static)) {
            bodyA.velocity = bodyA.velocity.sub(frictionImpulse.scalarMul(invMassA));
          }

          if (!((bodyB.flags & BodyFlags.Static) == BodyFlags.Static)) {
            bodyB.velocity = bodyB.velocity.add(frictionImpulse.scalarMul(invMassB))
          }
        }
      }

      // preform position correction to stop "sinking";
      const percent = 0.8;
      const slop = 0.01;

      const depth = Math.max(manifold.penetration - slop, 0);

      if (depth > 0) {
        const correctionAmount = (depth * percent) / invMassSum;
        const correction = manifold.normal.scalarMul(correctionAmount);

        if (!((bodyA.flags & BodyFlags.Static) === BodyFlags.Static)) {
          bodyA.position = bodyA.position.sub(correction.scalarMul(invMassA));
        }
  
        if (!((bodyB.flags & BodyFlags.Static) === BodyFlags.Static)) {
          bodyB.position = bodyB.position.add(correction.scalarMul(invMassB));
        }
      }
    });
  }

  getState(): Map<string, RenderState> {
    let renderStates = new Map<string, RenderState>();
    this.bodies.forEach((body, id) => {
      renderStates.set(id, body.shape.toRenderState(body.position, body.id));
    });

    return renderStates;
  }
}
