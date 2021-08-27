/* eslint-disable @typescript-eslint/no-var-requires */
// @ts-ignore
const { receiveWorker } = require('three-physx')
const PHYSX = require('./physx.release.cjs.js')
PHYSX().then(receiveWorker)
