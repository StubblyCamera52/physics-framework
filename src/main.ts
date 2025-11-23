import { Layer } from "./canvas/canvas";
import { CircleRenderer, RectRenderer } from "./canvas/shapes";
import { BodyFlags, BodyShape, GenericBody, PhysicalProperties } from "./physics/bodies";
import { StandardWorld } from "./physics/world";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

if (ctx != null) {
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, 300, 300);
}

let world = new StandardWorld();
let baseLayer = new Layer();

let square1 = new GenericBody("square1", PhysicalProperties.ROCK, BodyShape.SQUARE_20);
square1.setPositition(150, 80);
world.insertBody(square1);
baseLayer.add(new RectRenderer(square1.id));

let ground = new GenericBody("ground", PhysicalProperties.ROCK, new BodyShape({type: "rect", width: 300, height: 20}));
ground.setFlags(BodyFlags.Static);
ground.setPositition(150, 280);
// ground.setVelocity(0, -200);
world.insertBody(ground);
baseLayer.add(new RectRenderer(ground.id));

// let ground = new StaticRectBody("ground", 150, 300, 300, 20);
// let ceiling = new StaticRectBody("ceiling", 150, 0, 300, 20);
// let wall1 = new StaticRectBody("wall1", 0, 150, 20, 300);
// let wall2 = new StaticRectBody("wall2", 300, 150, 20, 300);
// baseLayer.add(new RectRenderer(wall1.id));
// baseLayer.add(new RectRenderer(wall2.id));
// baseLayer.add(new RectRenderer(ground.id));
// baseLayer.add(new RectRenderer(ceiling.id));
// world.insertBody(ground);
// world.insertBody(ceiling);
// world.insertBody(wall1);
// world.insertBody(wall2);

// for (let i = 0; i < 91; i++) {
//   let x = (i % 13)*20 + 30;
//   let y = Math.floor(i/13)*20+30;

//   let ball = new CircleBody("ball".concat(i.toString()), x, y, 20);
//   ball.velocity.x = (Math.random()-0.5)*100 
//   baseLayer.add(new CircleRenderer("ball".concat(i.toString())));
//   world.insertBody(ball);
// }

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
