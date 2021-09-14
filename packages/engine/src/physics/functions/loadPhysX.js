import { receiveWorker } from 'three-physx/dist/three-physx.umd.js'
import PHYSX from './physx.release.cjs.js'
PHYSX({
  locateFile(path) {
    if(path.endsWith('.wasm')) {
      return '/workers/physx.release.wasm';
    }
    return path;
  }
}).then(receiveWorker).catch(console.log);