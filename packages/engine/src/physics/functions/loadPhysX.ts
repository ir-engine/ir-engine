import { receiveWorker } from 'three-physx'
import PHYSX from './physx.release.esm.js'
PHYSX({
  locateFile(path) {
    if (path.endsWith('.wasm')) {
      return location.origin + '/scripts/physx.release.wasm'
    }
    return path
  }
}).then(receiveWorker)
