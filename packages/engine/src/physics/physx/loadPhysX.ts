import { isClient } from '../../common/functions/isClient'

export const loadPhysX = async () => {
  const PHYSX = (await isClient) ? import('./physx.release.cjs.js') : (import('./physx.release.node.js') as any)
  globalThis.PhysX = await PHYSX({
    locateFile(path) {
      if (isClient && path.endsWith('.wasm')) {
        return '/workers/physx.release.wasm'
      }
      return path
    }
  })
}
