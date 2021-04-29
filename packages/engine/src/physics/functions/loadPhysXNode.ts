/* eslint-disable @typescript-eslint/no-var-requires */
const { receiveWorker } = require("three-physx");
const PHYSX = require('./physx.umd.js');

PHYSX().then(receiveWorker);