import { isClient } from '../../common/functions/isClient'

export const loadPhysX = async () => {
  const { default: PHYSX } = (await (isClient
    ? import('./physx.release.esm.js')
    : import('./physx.release.cjs.js'))) as any
  let pathLib = isClient ? undefined : ((await import('path')) as any)
  globalThis.PhysX = await PHYSX({
    locateFile(path) {
      if (path.endsWith('.wasm')) {
        if (!isClient) {
          return pathLib.resolve(__dirname, './physx.release.wasm')
        }
        return '/workers/physx.release.wasm'
      }
      return path
    }
  })
}
