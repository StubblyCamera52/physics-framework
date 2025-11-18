export interface CanvasOptions {
  width?: number;
  height?: number;
  backgroundColor?: string;
}

export interface RenderState {
  id: string; // unique id
  x: number;
  y: number;
}

export interface Renderer {
  id: string;
  draw(ctx: CanvasRenderingContext2D, state: RenderState): void;
}

export class Layer {
  renderers: Map<string, Renderer> = new Map();

  add(renderer: Renderer): void {
    if (this.renderers.has(renderer.id)) return;

    this.renderers.set(renderer.id, renderer);
  }

  remove(id: string): void {
    if (!this.renderers.has(id)) return;

    this.renderers.delete(id);
  }

  draw(ctx: CanvasRenderingContext2D, states: Map<string, RenderState>): void {
    states.forEach((state, id) => {
        this.renderers.get(id)?.draw(ctx, state);
    });
  }
}