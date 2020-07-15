# Armada
A data driven game engine for WebGL, building on Mozilla ECSY with a Behavior pattern to emphasize modularity.

# Why Do I Need This?
Everything you need to get started without having to fuss with writng your own input system, state machine, networking layer, etc.


# Installation
```
npm install @xr3ngine/armada
```

# How to use
```javascript
import { World } from 'ecsy'
import {  initializeInput } from '@xr3ngine/armada'

const world = new World()

const options = {
  debug: true
}

initializeInput(world, options)

world.execute()
```

To make an object receive input:
```javascript
import {  addInputHandlingToEntity } from '@xr3ngine/armada'
const newEntity = addInputHandlingToEntity(world.createEntity())
```

You can override the input mappings per device
Input mappings map device input to abstract, cross-platform input

```javascript
      import { initializeInputSystems } from "../dist/armada.module.js"

      const Input = {
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
          input: {
            0: Actions.PRIMARY
          },
          input: {
            mousePosition: Input.SCREENXY
          }
        },
        keyboard: {
          input: {
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
