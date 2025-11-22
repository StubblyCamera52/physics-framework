import { Layer } from "./canvas/canvas";
import { SquareRenderer } from "./canvas/shapes";
import { SquareBody } from "./physics/bodies";
import { StandardWorld } from "./physics/world";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

if (ctx != null) {
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, 300, 300);
}

let world = new StandardWorld();
let baseLayer = new Layer();

let square1 = new SquareBody("123", 50, 50, 20);
let squareRenderer1 = new SquareRenderer(square1.id);

baseLayer.add(squareRenderer1);
world.insertBody(square1);

if (ctx != null) {
  baseLayer.draw(ctx, world.getState());
}