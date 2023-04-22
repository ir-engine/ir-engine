import { Color, Texture } from 'three'

import { SceneData } from '@etherealengine/common/src/interfaces/SceneInterface'
import { defineState, State } from '@etherealengine/hyperflux'

import { UndefinedEntity } from './Entity'

/** @todo support multiple scenes */

export type SceneMetadata<T> = {
  data: () => T
  dataState: () => State<T>
  default: any
}

export const SceneState = defineState({
  name: 'SceneState',
  initial: () => ({
    sceneData: null as SceneData | null,
    sceneEntity: UndefinedEntity,
    background: null as null | Color | Texture,
    sceneMetadataRegistry: {} as Record<string, SceneMetadata<any>>
  })
})
