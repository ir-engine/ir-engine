# ecsy-input
A simple, cross-platform input system for ECSY

# Installation
```
npm install ecsy-input
```

# How to use
```javascript
import { World } from 'ecsy';
import {  initializeInputSystems } from 'ecsy-input';

const world = new World();

const options = {
  vr: true,
  ar: false,
  mouse: true,
  keyboard: true,
  touchscreen: false,
  gamepad: true,
  debug: true
}

initializeInputSystems(world, options);

world.execute();
```