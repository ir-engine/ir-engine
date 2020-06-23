# ecsy-input
A simple, cross-platform input system for ECSY

# example tutorial
We start by importing the required modules from three.js and ECSY
```javascript
import * as THREE from 'https://unpkg.com/three/build/three.module.js';
import { Component, System, World } from 'https://unpkg.com/ecsy/build/ecsy.module.js';
```

Now we import some components and systems exported by `ecsy-input`:
```javascript
import {
  initializeInputSystem,
  InputSystem
} from '../build/ecsy-input.module-unpkg.js';
```

Now let's create a new world and register our custom system:
```javascript
const world = new World();

const options = {
  vr: true,
  ar: false,
  mouse: true,
  keyboard: true,
  touchscreen: false,
  gamepad: true
}

initializeInputSystems(world, options);

world.execute();
```