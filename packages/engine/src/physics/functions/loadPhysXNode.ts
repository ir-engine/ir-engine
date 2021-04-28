const { receiveWorker } = require("@xr3ngine/three-physx");
const PHYSX = require('./physx.umd.js');

PHYSX().then(receiveWorker);