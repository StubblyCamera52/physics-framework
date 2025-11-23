import type { Renderer, RenderState } from "./canvas";

export class RectRenderer implements Renderer {
  id: string;

  constructor(id: string) {
    this.id = id;
  }

  draw(ctx: CanvasRenderingContext2D, state: RenderState): void {
    ctx.fillStyle = "#f00";
    ctx.fillRect(state.x-(state.w/2), state.y-(state.h/2), state.w, state.h);
  }
}

export class CircleRenderer implements Renderer {
  id: string;

  constructor(id: string) {
    this.id = id;
  }

  draw(ctx: CanvasRenderingContext2D, state: RenderState): void {
    ctx.fillStyle = "#00f";
    ctx.beginPath();
    ctx.arc(state.x, state.y, state.w, 0, Math.PI*2);
    ctx.fill();
  }
}