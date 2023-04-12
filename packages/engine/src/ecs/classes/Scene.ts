import { Color, Texture } from 'three'

import { SceneData } from '@etherealengine/common/src/interfaces/SceneInterface'
import { defineState } from '@etherealengine/hyperflux'

import { EntityTreeComponent } from '../functions/EntityTree'
import { Entity, UndefinedEntity } from './Entity'

/** @todo support multiple scenes */

export type SceneMetadata<T> = {
  data: T
  default: any
}

export const SceneState = defineState({
  name: 'SceneState',
  initial: () => ({
    sceneData: null as SceneData | null,
    sceneEntity: UndefinedEntity as Entity<[typeof EntityTreeComponent]>,
    background: null as null | Color | Texture,
    sceneMetadataRegistry: {} as Record<string, SceneMetadata<any>>
  })
})
