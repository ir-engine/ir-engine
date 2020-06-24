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

initializeInputSystems(world, options)

world.execute()
```

# To Build
```
npm run build
```
This will open up the rollup dev server on port 10001
You can see input in the console

# TO-DO
Convert actions from strings to enums for typed evaluation
Test gamepad
Examine viability of implementing WebXR controllers and HMD pose without three.js