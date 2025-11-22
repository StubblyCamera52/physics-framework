import type { Renderer, RenderState } from "./canvas";

export class RectRenderer implements Renderer {
  id: string;

  constructor(id: string) {
    this.id = id;
  }

  draw(ctx: CanvasRenderingContext2D, state: RenderState): void {
    ctx.fillStyle = "#fff";
    ctx.fillRect(state.x-(state.w/2), state.y-(state.h/2), state.w, state.h);
  }
}