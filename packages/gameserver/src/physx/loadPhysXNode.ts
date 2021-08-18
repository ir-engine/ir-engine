/* eslint-disable @typescript-eslint/no-var-requires */
import { receiveWorker } from 'three-physx'
import PHYSX from './physx.release.cjs.js'
PHYSX().then(receiveWorker)
