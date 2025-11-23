import type { RenderState } from "../canvas/canvas";
import { clamp } from "../math/helper";
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
  private collisions = new Set<Manifold>();

  constructor() {
    this.bodies = new Map<string, Body>();
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

      b.velocity.y += 98 * dt;
      b.position = b.position.add(b.velocity.scalarMul(dt));
      b.boundingBox = {
        min: b.position.sub(b.size.scalarDiv(2)),
        max: b.position.add(b.size.scalarDiv(2)),
      };
    });
    
    for (let i = 0; i < 10; i++) {
      this.calculateCollisionInformation();
      this.resolveCollisions();
      
      this.bodies.forEach((b) => {
        if (b.isStatic) return;
        b.boundingBox = {
          min: b.position.sub(b.size.scalarDiv(2)),
          max: b.position.add(b.size.scalarDiv(2)),
        };
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

      if (bodyA.primitiveType == "aabb" && bodyB.primitiveType == "aabb") {
        let aToB = bodyB.position.sub(bodyA.position);

        let aExtent = (bodyA.boundingBox.max.x - bodyA.boundingBox.min.x) / 2;
        let bExtent = (bodyB.boundingBox.max.x - bodyB.boundingBox.min.x) / 2;

        let overlapX = aExtent + bExtent - Math.abs(aToB.x);

        // SAT test x axis
        if (overlapX > 0) {
          aExtent = (bodyA.boundingBox.max.y - bodyA.boundingBox.min.y) / 2;
          bExtent = (bodyB.boundingBox.max.y - bodyB.boundingBox.min.y) / 2;

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
        bodyA.primitiveType == "circle" &&
        bodyB.primitiveType == "circle"
      ) {
        let radiusA = bodyA.size.x / 2;
        let radiusB = bodyB.size.x / 2;

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
      } else if ((bodyA.primitiveType == "aabb" && bodyB.primitiveType == "circle") || (bodyA.primitiveType == "circle" && bodyB.primitiveType == "aabb")) {
        if (bodyA.primitiveType == "circle") {
          [bodyA, bodyB] = [bodyB, bodyA];
        }
        let aToB = bodyB.position.sub(bodyA.position);

        let closest = new Vector2(aToB.x, aToB.y);

        let xExtent = (bodyA.boundingBox.max.x - bodyA.boundingBox.min.x) / 2;
        let yExtent = (bodyA.boundingBox.max.y - bodyA.boundingBox.min.y) / 2;

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
        let radius = bodyB.size.x/2;

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

      // console.log(manifold);

      
      
      let restitution = Math.min(bodyA.restitution, bodyB.restitution);
      
      const invMassA = bodyA.isStatic ? 0 : 1 / bodyA.mass;
      const invMassB = bodyB.isStatic ? 0 : 1 / bodyB.mass;
      
      const invMassSum = invMassA + invMassB;
      if (invMassSum == 0) return; // both are static bodies
      
      let relVelocity = bodyB.velocity.sub(bodyA.velocity);
      let velocityAlongNorm = relVelocity.dot(manifold.normal);
      // console.log(velocityAlongNorm);

      if (velocityAlongNorm < 0) {
        let iScal = -(1 + restitution) * velocityAlongNorm;
        iScal /= 1 / bodyA.mass + 1 / bodyB.mass;

        // apply the impulse
        let impulse = manifold.normal.scalarMul(iScal);
        if (!bodyA.isStatic) {
          bodyA.velocity = bodyA.velocity.sub(impulse.scalarMul(1 / bodyA.mass));
        }

        if (!bodyB.isStatic) {
          bodyB.velocity = bodyB.velocity.add(impulse.scalarMul(1 / bodyB.mass));
        }
      }

      // preform position correction to stop "sinking";
      const percent = 0.8;
      const slop = 0.001;

      const depth = Math.max(manifold.penetration - slop, 0);

      if (depth > 0) {
        const correctionAmount = (depth * percent) / invMassSum;
        const correction = manifold.normal.scalarMul(correctionAmount);

        if (!bodyA.isStatic) {
          bodyA.position = bodyA.position.sub(correction.scalarMul(invMassA));
        }
  
        if (!bodyB.isStatic) {
          bodyB.position = bodyB.position.add(correction.scalarMul(invMassB));
        }
      }
    });
  }

  getState(): Map<string, RenderState> {
    let renderStates = new Map<string, RenderState>();
    this.bodies.forEach((body, id) => {
      renderStates.set(id, body.toRenderState());
    });

    return renderStates;
  }
}
