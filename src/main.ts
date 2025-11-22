import { Layer } from "./canvas/canvas";
import { RectRenderer } from "./canvas/shapes";
import { SquareBody, StaticRectBody } from "./physics/bodies";
import { StandardWorld } from "./physics/world";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

if (ctx != null) {
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, 300, 300);
}

let world = new StandardWorld();
let baseLayer = new Layer();

let square1 = new SquareBody("0", 50, 50, 20);
let squareRenderer1 = new RectRenderer(square1.id);

let square2 = new SquareBody("1", 50, 20, 20);
let squareRenderer2 = new RectRenderer(square2.id);

baseLayer.add(squareRenderer1);
world.insertBody(square1);
baseLayer.add(squareRenderer2);
world.insertBody(square2);

let ground = new StaticRectBody("ground", 150, 290, 280, 20);
let groundRenderer = new RectRenderer(ground.id);
baseLayer.add(groundRenderer);
world.insertBody(ground);

if (ctx != null) {
  baseLayer.draw(ctx, world.getState());
}

let lastTime = 0;
let frameCount = 0;

function animate(timestamp: number) {
  frameCount += 1;
  const dt = timestamp - lastTime;
  lastTime = timestamp;

  // console.log(dt/1000);

  world.update(dt/1000);

  if (ctx != null) {
    baseLayer.clear(ctx);
    baseLayer.draw(ctx, world.getState());
  }

  if (frameCount > 60) return;

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);