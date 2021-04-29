import { receiveWorker } from "three-physx";
import PHYSX from './physx.release.js';
// import physxModule from './physx.release.wasm';

PHYSX({
  locateFile(path) {
    if(globalThis.process?.env?.NODE_ENV !== 'development' && path.endsWith('.wasm')) {
      return 'https://unpkg.com/three-physx/lib/physx.release.wasm';
    }
    return path;
  }
}).then(receiveWorker);