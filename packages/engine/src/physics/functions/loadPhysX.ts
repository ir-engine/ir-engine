import { receiveWorker } from "three-physx";
import PHYSX from './physx.release.esm.js';
PHYSX(
  // {
  // locateFile(path) {
  //   if(globalThis.process?.env?.NODE_ENV !== 'development' && path.endsWith('.wasm')) {
  //     return './physx.release.wasm';
  //   }
  //   return path;
  // }
// }
).then(receiveWorker);