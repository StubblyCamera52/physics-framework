import { Layer } from "./canvas/canvas";
import { CircleRenderer, RectRenderer } from "./canvas/shapes";
import { CircleBody, SquareBody, StaticRectBody } from "./physics/bodies";
import { StandardWorld } from "./physics/world";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

if (ctx != null) {
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, 300, 300);
}

let world = new StandardWorld();
let baseLayer = new Layer();

let square1 = new SquareBody("1", 150, 250, 20);
square1.velocity.x = 10;
let squareRenderer1 = new RectRenderer(square1.id);

let square2 = new SquareBody("2", 250, 50, 20);
let squareRenderer2 = new RectRenderer(square2.id);

baseLayer.add(squareRenderer1);
world.insertBody(square1);
baseLayer.add(squareRenderer2);
world.insertBody(square2);

let ground = new StaticRectBody("ground", 150, 300, 300, 20);
let wall1 = new StaticRectBody("wall1", 0, 150, 20, 300);
let wall2 = new StaticRectBody("wall2", 300, 150, 20, 300);
baseLayer.add(new RectRenderer(wall1.id));
baseLayer.add(new RectRenderer(wall2.id));
baseLayer.add(new RectRenderer(ground.id));
world.insertBody(ground);
world.insertBody(wall1);
world.insertBody(wall2);

for (let i = 0; i < 20; i++) {
  let x = (i % 5)*60 + 30;
  let y = Math.floor(i/5)*30+15;

  let ball = new CircleBody("ball".concat(i.toString()), x, y, 20);
  baseLayer.add(new CircleRenderer("ball".concat(i.toString())));
  world.insertBody(ball);
}

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

  world.update(dt / 1000);

  if (ctx != null) {
    baseLayer.clear(ctx);
    baseLayer.draw(ctx, world.getState());
  }

  // if (frameCount > 60) return;

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
