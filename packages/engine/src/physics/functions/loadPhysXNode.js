const { receiveWorker } = require('three-physx')
const PHYSX = require('./physx.release.cjs.js')
PHYSX().then(receiveWorker)
