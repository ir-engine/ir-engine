/* eslint-disable @typescript-eslint/no-var-requires */
const { receiveWorker } = require('three-physx')
const PHYSX = require('./physx.release.cjs.js')
PHYSX().then(receiveWorker)
