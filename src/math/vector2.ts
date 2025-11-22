interface vec2 {
  x: number;
  y: number;
}

export class Vector2 implements vec2 {
  x = 0;
  y = 0;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  add(b: Vector2): Vector2 {
    return new Vector2(this.x + b.x, this.y + b.y);
  }

  sub(b: Vector2): Vector2 {
    return new Vector2(this.x - b.x, this.y - b.y);
  }

  dot(b: Vector2): number {
    return (this.x * b.x) + (this.y * b.y);
  }

  magnitude(): number {
    return Math.sqrt(this.x*this.x + this.y*this.y);
  }
}