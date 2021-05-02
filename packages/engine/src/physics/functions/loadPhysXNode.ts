/* eslint-disable @typescript-eslint/no-var-requires */
const { receiveWorker } = require("three-physx");
const PHYSX = require('three-physx/lib/physx.release.cjs.js');
PHYSX().then(receiveWorker);