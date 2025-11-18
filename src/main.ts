const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

if (ctx != null) {
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, 300, 300);
}