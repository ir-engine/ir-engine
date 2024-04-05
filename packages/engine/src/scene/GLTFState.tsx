import { defineState, getMutableState } from '@etherealengine/hyperflux'
import { GLTF } from '@gltf-transform/core'

export const GLTFState = defineState({
  name: 'GLTFState',
  initial: {} as Record<string, GLTF.IGLTF>,

  load: (source: string, data: GLTF.IGLTF) => {
    getMutableState(GLTFState)[source].set(data)

    if (!data.scene) return

    const defaultScene = data.scenes?.[data.scene]
    if (!defaultScene) return

    // if (!UUIDComponent.getEntityByUUID(data.root)) {
    //   return createRootEntity(sceneID, data)
    // }
  }
})
