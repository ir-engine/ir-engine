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

## Docker

You can run it using docker, if you don't have node installed or need to test.
``` bash
# Build the image
docker build --tag xrchat-client .

# Run the image (deletes itself when you close it)
docker run -d --rm --name client -e "API_SERVER_URL=http://localhost:3030" -p "3000:3000"  xrchat-client

# Stop the server
docker stop client
```

### Docker image configurations

This image uses build-time arguments, they are not used during runtime yet

- `NODE_ENV` controls the config/*.js file to load and build against [default: production]
- `API_SERVER_URL` points to an instance of the xrchat-server [default: http://localhost:3030]
