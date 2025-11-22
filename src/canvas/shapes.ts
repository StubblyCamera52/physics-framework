import type { Renderer, RenderState } from "./canvas";

export class SquareRenderer implements Renderer {
  id: string;

  constructor(id: string) {
    this.id = id;
  }

  draw(ctx: CanvasRenderingContext2D, state: RenderState): void {
    ctx.fillStyle = "#fff";
    ctx.fillRect(state.x-10, state.y-10, 20, 20);
  }
}