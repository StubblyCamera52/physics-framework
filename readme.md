# typescript physics framework

<img width="601" height="605" alt="Screenshot 2025-11-24 at 6 42 34 PM" src="https://github.com/user-attachments/assets/891c1cbf-f02d-48fe-85b7-daad314f3b5d" />

## About


I wanted to make a physics "engine" so I can learn how they work, and the theme of this week was framework so this is a perfect project for that. I ran into 4000 bugs while doing this (not all of them were fixed). I was a nightmare, however I did learn how the basics of physics engines work so I gained something.

## How it works

Every single body has properties and the solver uses those properties to figure out where the body should go next. (Side note: this physics framework actually has another framework inside of it, used for drawing shapes to the canvas.) Everything is typed so I know what the properties are.

## Usage
If you want to see the demo just go to https://stubblycamera52.github.io/physics-framework.
click and drag the balls or squares to move them.

Otherwise to use this in your own script (if you even wanted to). You can look at main.ts to see an example.

Creating a physics world is as easy as calling `new StandardWorld()`  
If you want to render anything, you also need to create a Layer: `new Layer()`  
All objects and bodies are assigned ids, and their id between the `StandardWorld` and the `Layer` must match if you want the properties to update correctly.  

You can create a physics body using:

```typescript
let body = new GenericBody("bodyid", PhysicalProperties.ROCK, new BodyShape({type: "rect", width: 20, height: 50}));
// set body flags using
body.setFlags(BodyFlags.Static);
// set position with
body.setPosition(300, 300);
// and inster the body into the world (world is named world in this case)
world.instertBody(body);
// make sure to create a renderer for it too. (layer is called layer in this case)
layer.add(new RectRenderer(ground.id));
```

Then call `world.update(dt);` every frame (dt is in seconds).  

to draw, call `layer.clear(ctx);` (ctx is your canvas context), and `layer.draw(ctx, world.getState());`

Thats all the tutorial for now, check the code to see what else exists.

## Features
- Currently only has Rectangles/Squares and Circle type bodies. (i might add convex shapes in the future).
- No rotation (maybe later)
- Euler integration.
- Very unoptimized.
