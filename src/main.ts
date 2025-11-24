import { Layer } from "./canvas/canvas";
import { CircleRenderer, RectRenderer } from "./canvas/shapes";
import {
  BodyFlags,
  BodyShape,
  GenericBody,
  PhysicalProperties,
} from "./physics/bodies";
import { StandardWorld } from "./physics/world";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

if (ctx != null) {
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, 300, 300);
}

let world = new StandardWorld();
let baseLayer = new Layer();

// let square1 = new GenericBody("square1", PhysicalProperties.BOUNCY, BodyShape.SQUARE_20);
// square1.setPositition(150, 80);
// world.insertBody(square1);
// baseLayer.add(new RectRenderer(square1.id));

let ground = new GenericBody(
  "ground",
  PhysicalProperties.ROCK,
  new BodyShape({ type: "rect", width: 300, height: 20 }),
);
ground.setFlags(BodyFlags.Static);
ground.setPositition(150, 280);
// ground.setVelocity(0, -200);
world.insertBody(ground);
baseLayer.add(new RectRenderer(ground.id));
let ceiling = new GenericBody(
  "ceiling",
  PhysicalProperties.ROCK,
  new BodyShape({ type: "rect", width: 300, height: 20 }),
);
ceiling.setFlags(BodyFlags.Static);
ceiling.setPositition(150, 20);
world.insertBody(ceiling);
baseLayer.add(new RectRenderer(ceiling.id));
let wall1 = new GenericBody(
  "wall1",
  PhysicalProperties.ROCK,
  new BodyShape({ type: "rect", width: 20, height: 300 }),
);
wall1.setFlags(BodyFlags.Static);
wall1.setPositition(280, 150);
world.insertBody(wall1);
baseLayer.add(new RectRenderer(wall1.id));
let wall2 = new GenericBody(
  "wall2",
  PhysicalProperties.ROCK,
  new BodyShape({ type: "rect", width: 20, height: 300 }),
);
wall2.setFlags(BodyFlags.Static);
wall2.setPositition(20, 150);
world.insertBody(wall2);
baseLayer.add(new RectRenderer(wall2.id));

for (let i = 0; i < 70; i++) {
  let x = (i % 7) * 30 + 60;
  let y = Math.floor(i / 7) * 20 + 60;

  let ball = new GenericBody(
    "ball".concat(i.toString()),
    PhysicalProperties.ROCK,
    new BodyShape({type: "circle", radius: 10}),
  );
  ball.velocity.x = (Math.random() - 0.5) * 100;
  ball.setPositition(x+Math.random(), y+Math.random());
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
