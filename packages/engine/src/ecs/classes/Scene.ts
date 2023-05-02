import { Color, Texture } from 'three'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { SceneData } from '@etherealengine/common/src/interfaces/SceneInterface'
import { defineState, getState } from '@etherealengine/hyperflux'

import { UUIDComponent } from '../../scene/components/UUIDComponent'
import { UndefinedEntity } from './Entity'

/** @todo support multiple scenes */

export const SceneState = defineState({
  name: 'SceneState',
  initial: () => ({
    sceneData: null as SceneData | null,
    sceneEntity: UndefinedEntity,
    sceneEntities: {} as Record<string /* SceneID */, EntityUUID>,
    background: null as null | Color | Texture
  })
})

// export const

export const getActiveSceneEntity = () => {
  const state = getState(SceneState)
  return UUIDComponent.entitiesByUUID[state.sceneEntities[state.sceneEntity]]
}
