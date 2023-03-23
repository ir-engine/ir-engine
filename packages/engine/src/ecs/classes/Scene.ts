import { SceneData } from '@etherealengine/common/src/interfaces/SceneInterface'
import { defineState } from '@etherealengine/hyperflux'

import { UndefinedEntity } from './Entity'

/** @todo support multiple scenes */

export type SceneMetadata<T> = {
  data: T
  default: any
}

export const SceneState = defineState({
  name: 'SceneState',
  initial: () => ({
    sceneData: null as SceneData | null,
    sceneEntity: UndefinedEntity,
    sceneMetadataRegistry: {} as Record<string, SceneMetadata<any>>
  })
})
