import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { ComponentDeserializeFunction, ComponentSerializeFunction } from '../../common/constants/PrefabFunctionType'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { EntityNodeComponent } from '../../scene/components/EntityNodeComponent'
import { CameraComponent, CameraComponentType } from '../components/CameraComponent'

export const SCENE_COMPONENT_CAMERA = 'camera'
export const SCENE_COMPONENT_CAMERA_DEFAULT_VALUES = {
  raycasting: false,
  rayCount: 1,
  rayLength: 15,
  rayFrequency: 0.5
}

export const getCamComponent = () => getComponent(Engine.instance.activeCameraEntity, CameraComponent)

export const setRayFrequency = (rayFreq) => {
  const camComp = getCamComponent()
  camComp.rayFrequency = rayFreq
}

export const setRayLength = (rayLength) => {
  const camComp = getCamComponent()
  camComp.rayLength = rayLength
}

export const setRayCount = (rayCount) => {
  const camComp = getCamComponent()
  camComp.rayCount = rayCount
}

export const setRaycasting = (raycasting) => {
  const camComp = getCamComponent()
  camComp.raycasting = raycasting
}

export const serializeCamera: ComponentSerializeFunction = (entity: Entity) => {
  if (hasComponent(entity, CameraComponent)) {
    const comp = getComponent(entity, CameraComponent)
    return {
      name: SCENE_COMPONENT_CAMERA,
      props: {
        raycasting: comp.raycasting,
        rayCount: comp.rayCount,
        rayLength: comp.rayLength,
        rayFrequency: comp.rayFrequency
      }
    }
  }
}

export const deserializeCamera: ComponentDeserializeFunction = (
  entity: Entity,
  json: ComponentJson<CameraComponentType>
): void => {
  const props = parseCameraProperties(json.props)
  getComponent(entity, EntityNodeComponent).components.push(SCENE_COMPONENT_CAMERA)
  if (Engine.instance.isEditor) {
    addComponent(entity, CameraComponent, props)
  } else {
    const camComp = getComponent(Engine.instance.activeCameraEntity, CameraComponent)
    Object.entries(props).forEach(([k, v]) => (camComp[k] = v))
  }
}

export const parseCameraProperties = (props): CameraComponentType => {
  return {
    raycasting: props.raycasting ?? SCENE_COMPONENT_CAMERA_DEFAULT_VALUES.raycasting,
    rayCount: props.rayCount ?? SCENE_COMPONENT_CAMERA_DEFAULT_VALUES.rayCount,
    rayLength: props.rayLength ?? SCENE_COMPONENT_CAMERA_DEFAULT_VALUES.rayLength,
    rayFrequency: props.rayFrequency ?? SCENE_COMPONENT_CAMERA_DEFAULT_VALUES.rayFrequency
  }
}
