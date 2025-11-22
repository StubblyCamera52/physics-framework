import type { RenderState } from "../canvas/canvas";
import type { Body } from "./bodies";

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
    return;
  }

  getState(): Map<string, RenderState> {
    let renderStates = new Map<string, RenderState>;
    this.bodies.forEach((body, id) => {
      renderStates.set(id, body.toRenderState());
    });

    return renderStates;
  }

}