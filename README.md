# ecsy-input
A simple, cross-platform input system for ECSY

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
  vr: true,
  ar: false,
  mouse: true,
  keyboard: true,
  touchscreen: false,
  gamepad: true,
  debug: true
}

initializeInputSystems(world, options)

world.execute()
```

You can override the input mappings per device
Input mappings map device input to abstract, cross-platform actions

```
const KeyboardInputMap = {
  w: ActionType.FORWARD,
  a: ActionType.LEFT,
  s: ActionType.RIGHT,
  d: ActionType.BACKWARD
}

initializeInputSystems(world, options, KeyboardInputMap)
``

# To Build
```
npm run build
```
This will open up the rollup dev server on port 10001
You can see input in the console
