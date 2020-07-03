# ecsy-input
A simple, cross-platform input system for ECSY

# Why Do I Need This?
Mapping a WASD keyboard to drive movement or state is easy enough for a few inputs-- but once you start developing complex behaviors, and you need them accounted for across multiple platforms or input types, it quickly becomes a monstrous task to maintain or add additional functionality to your input <-> response loops without having to test for lots of unintended consequences, often marking up your code with conditionals to prevent unwanted state from these new actions (as an example-- some people want crouching + jumping to be simultaneous and some people want to prevent the mid-air crouch)

ecsy-input abstracts the complexity of the input layer down to "actions". All input is collected, mapped to actions, and then validated at the action layer-- opposing, overriding and blocking actions are considered and then pushed to any entity with an ActionListener component attached. While default input mappings are provided, ecsy-input can be initialized with custom input mappings, so you can decide what inputs map to what actions and how actions relate to each other.

ecsy-input is not tied to any particular game engine, so you can use it anywhere you use ECSY.

# Installation
```
npm install ecsy-input
```

# How to use
```javascript
import { World } from 'ecsy'
import {  initializeInputSystems } from 'ecsy-input'

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
import {  addInputHandlingToEntity } from 'ecsy-input'
const newEntity = addInputHandlingToEntity(world.createEntity())
```

You can override the input mappings per device
Input mappings map device input to abstract, cross-platform actions

```javascript
      import { initializeInputSystems } from "../dist/ecsy-input.module.js"

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
          actions: {
            0: Actions.PRIMARY
          },
          axes: {
            mousePosition: Axes.SCREENXY
          }
        },
        keyboard: {
          actions: {
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
``

# To Build
```
npm run build
```
This will open up the rollup dev server on port 10001
You can see input in the console
