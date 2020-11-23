Setup instructions for Dracosis Playet

## Setup Instructions

- Clone the project: https://github.com/xr3ngine/three-volumetric  
  `cd three-volumetric`  
  `npm install`  
  `yarn build`  
  `npm link`

- To make any changes to the worker
  `cd three-volumetric/worker`
  `npm install`  
  `npm run build`
  `cp dist/Worker.js ./../dracosis-player/public/`

- Clone this project: https://github.com/xr3ngine/dracosis-player  
  `cd dracosis-player`  
  `npm install`  
  `npm link three-volumetric`  
  `yarn start`

- Start the server to serve sample.drcs  
  `cd server`  
  `npm start`

## Issues

- Decode compressed buffer data to show the mesh
