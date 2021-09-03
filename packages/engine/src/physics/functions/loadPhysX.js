import { receiveWorker } from 'three-physx'
import PHYSX from './physx.release.esm.js'
PHYSX().then(receiveWorker)
