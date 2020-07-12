# armada
A simple, cross-platform input system for ECSY

# Why Do I Need This?


Network -- Get latest network state and update world, send and clear message queue out
Input -- Handle user input
AI -- All AI happens here (AI can affect axes, state, arbitrary data)
Action -- Apply current axes from AI and input to state and other components
Navigation -- Compute if and where actors can walk
Collision & Physics -- Compute collision and physics
State -- Compute current state and apply
Subscriptions -- Execute arbitrary behavior subscriptions
Particles -- Execute particle systems
Animation -- Compute current animation
Renderer -- Display final output


# Installation
```
npm install armada
```

# How to use
```javascript
import { World } from 'ecsy'
import {  initializeInputSystems } from 'armada'

const world = new World()

const options = {
  xr: true,
  mouse: true,
  keyboard: true,
  mobile: false,
  gamepad: true,
  debug: true
}

initializeInputSystems(world, options)

world.execute()
```

To make an object receive input:
```javascript
import {  addInputHandlingToEntity } from 'armada'
const newEntity = addInputHandlingToEntity(world.createEntity())
```

You can override the input mappings per device
Input mappings map device input to abstract, cross-platform axes

```javascript
      import { initializeInputSystems } from "../dist/armada.module.js"

      const Axes = {
        SCREENXY: 0
      }

      const Actions = {
        PRIMARY: 0,
        SECONDARY: 0,
        FORWARD: 2,
        BACKWARD: 3,
        LEFT: 6,
        RIGHT: 7
      }

      const inputMap = {
        mouse: {
          axes: {
            0: Actions.PRIMARY
          },
          axes: {
            mousePosition: Axes.SCREENXY
          }
        },
        keyboard: {
          axes: {
            w: Actions.FORWARD,
            a: Actions.LEFT,
            s: Actions.RIGHT,
            d: Actions.BACKWARD
          }
        },
        actionMap: {
          [Actions.FORWARD]: { opposes: [Actions.BACKWARD] },
          [Actions.BACKWARD]: { opposes: [Actions.FORWARD] },
          [Actions.LEFT]: { opposes: [Actions.RIGHT] },
          [Actions.RIGHT]: { opposes: [Actions.LEFT] }
        }
      }

      // Test input
      const inputOptions = {
        mouse: true,
        keyboard: true,
        touchscreen: true,
        gamepad: true,
        debug: true
      }

      const world = new World()
      initializeInputSystems(world, inputOptions, inputMap)
```

# To Build
```
npm run build
```
This will open up the rollup dev server on port 10001
You can see input in the console
