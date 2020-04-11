# XRChat Client

This is the front end for the XRChat client

To run
```
yarn install
yarn build
yarn run dev
```

The client is built on Networked Aframe and React, and uses Nextjs for simplified page routing and Server Side Rendering

Typescript and strict linting are enforced

TODO: Add all dependencies, explain each component and our decision to use, add links to tutorials

## config file

### xr

#### networked-scene

properties for the [NAF](https://github.com/networked-aframe/networked-aframe) networked-scene component

- **app** unique app name (no spaces)
- **room** name of initial room
- **audio** set true to enable audio streaming (if using an adapter that supports it)
- **adapter** which network service to use
- **serverURL** where the WebSocket / signalling server is located

#### avatar

- **defaultAvatarModelSrc** gltf for the default avatar
- **defaultAvatarModelScale** scale for the default avatar

#### environment

##### floor

- **src** source for the floor texture
- **height** height(length) of the floor
- **width** width of the floor

##### skybox

- **src** source for the skybox texture
- **height** height(length) of the skybox texture
- **width** width of the skybox texture
- **radius** radius of the skybox
- **rotation** x,y,z rotation of the skybox
- **thetaLength** [skybox's](https://aframe.io/docs/master/primitives/a-sky.html) [vertical sweep angle size](https://threejs.org/docs/index.html#api/en/geometries/SphereBufferGeometry) in degrees
