import type { RenderState } from "../canvas/canvas";

interface PhysicsWorld {
  bodies: Map<string, Body>;

  insertBody: (body: Body) => void;
  removeBody: (id: string) => void;

  update: (dt: number) => void;
  getState: () => Map<string, RenderState>;
}