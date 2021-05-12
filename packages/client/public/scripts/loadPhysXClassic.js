importScripts('/scripts/three-physx.umd.js');
importScripts('/scripts/physx.release.cjs.js');
const THREE_PHYSX = globalThis["three-physx"];
PHYSX({
  locateFile(path) {
    if(path.endsWith('.wasm')) {
      return '/scripts/physx.release.wasm';
    }
    return path;
  }
}).then(THREE_PHYSX.receiveWorker).catch(console.log);