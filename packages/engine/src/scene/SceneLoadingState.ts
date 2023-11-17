import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { defineState } from '@etherealengine/hyperflux'
import { SceneID } from '../schemas/projects/scene.schema'

type LoadingState = Record<
  EntityUUID,
  {
    loadedAmount: number
    totalAmount: number
  }
>

export const SceneState = defineState({
  name: 'SceneState',
  initial: () => ({
    scenes: {} as Record<
      SceneID,
      {
        models: LoadingState
        textures: LoadingState
      }
    >
  })
})
