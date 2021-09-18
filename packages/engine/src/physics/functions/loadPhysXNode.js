require('ts-node/register')
const { receiveWorker } = require('three-physx')
const PHYSX = require('./physx.release.node.js')
PHYSX().then(receiveWorker)
