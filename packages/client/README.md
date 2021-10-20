[![Build Status](https://travis-ci.org/xrengine/xrengine.svg?branch=master)](https://travis-ci.org/xrengine/xrengine)
# XREngine Client
## About

XREngine is an end-to-end solution for hosting humans and non-humans in a virtual space. This project would literally not be possible without the community contributions of Mozilla Hubs, Janus VR, Avaer + Exokit, Mr Doob, Hayden James Lee and many others.

Our goal is an easy-to-use, well documented, end-to-end Javascript (or Typescript) exprience that anyone with a little bit of Javascript and HTML knowledge can dig into, deploy and make meaningful modifications and contributions to. If you fit this category and you are struggling with any aspect of getting started, we want to hear fromm you so that this can be a better exprience.

XREngine is a free, open source, MIT-licensed project. You are welcome to do anything you want with it. We hope that you use it to make something beautiful.

This is the client portion of XREngine. To deploy everything at once with Kubernetes or Docker Compose, check out the branches in xrengine-ops. Or you can start the server with NPM (check out scripts/start-db.sh to get the database runnning), run the xrengine client and everything should connect out of the box.

## Getting Started

To run

```
npm install
npm run build
npm run dev
```

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
docker build --tag xrengine .

# Run the image (deletes itself when you close it)
docker run -d --rm --name client -e "NEXT_PUBLIC_API_SERVER=https://127.0.0.1:3030" -p "3030:3030"  xrengine

# Stop the server
docker stop client
```

### Docker image configurations

This image uses build-time arguments, they are not used during runtime yet

- `APP_ENV` controls the config/*.js file to load and build against [default: production]
- `NEXT_PUBLIC_API_SERVER` points to an instance of the xrengine [default: https://127.0.0.1:3030]

