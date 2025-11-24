import { Vector2 } from "../math/vector2";
import { AABB, AABBintersectAABB } from "../physics/types";

export interface CanvasOptions {
  width?: number;
  height?: number;
  backgroundColor?: string;
}

export interface RenderState {
  id: string; // unique id
  x: number;
  y: number;
  w: number;
  h: number
}

export interface Renderer {
  id: string;
  draw(ctx: CanvasRenderingContext2D, state: RenderState): void;
}

export class Layer {
  renderers: Map<string, Renderer> = new Map();
  states = new Map<string, RenderState>;

  add(renderer: Renderer): void {
    if (this.renderers.has(renderer.id)) return;

    this.renderers.set(renderer.id, renderer);
  }

  remove(id: string): void {
    if (!this.renderers.has(id)) return;

    this.renderers.delete(id);
  }

  clear(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, 600, 600);
  }

  getBodyAtPosition(x: number, y: number): string {
    let testAABB = new AABB(new Vector2(x-2, y-2), new Vector2(x+2, y+2));
    let shapeAABB = new AABB(new Vector2(), new Vector2());
    let bodyId = "";
    let found = false;
    this.states.forEach((state, key) => {
      if (found) return;
      shapeAABB.setFromSize(state.w, state.h);
      shapeAABB.offset(state.x, state.y);
      if (AABBintersectAABB(testAABB, shapeAABB)) {
        bodyId = key;
        found = true;
      }
    });

    return bodyId;
  }

  draw(ctx: CanvasRenderingContext2D, states: Map<string, RenderState>): void {
    this.states = states;
    states.forEach((state, id) => {
        this.renderers.get(id)?.draw(ctx, state);
    });
  }
}