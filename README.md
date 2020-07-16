Setup instructions for Dracosis Playet

## Setup Instructions

- Clone the project: https://github.com/xr3ngine/three-volumetric  
  `cd three-volumetric`  
  `npm install`  
  `yarn build`  
  `npm link`

- Clone this project: https://github.com/xr3ngine/dracosis-player  
  `cd dracosis-player`  
  `npm install`  
  `npm link three-volumetric`  
  `yarn start`

- Start the server to serve sample.drcs  
  `cd server`  
  `npm start`

## Issues

- Worker not running on src/Dracosis/Player.ts
- readStream not supported in src/Dracosis/Player.ts. Need to remove 'fs' and move streaming data to server/ and reading streamed data from server to Player.ts
