import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { ComponentDeserializeFunction, ComponentSerializeFunction } from '../../common/constants/PrefabFunctionType'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { createMappedComponent, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'

export const CameraComponent = createMappedComponent<CameraComponentType>('CameraComponent')

export type CameraComponentType = {
  raycasting: boolean
  rayCount: number
  rayLength: number
  rayFrequency: number
}

export const SCENE_COMPONENT_CAMERA = 'camera'

export const SCENE_COMPONENT_CAMERA_DEFAULT_VALUES = {
  raycasting: false,
  rayCount: 1,
  rayLength: 15,
  rayFrequency: 0.5
}
