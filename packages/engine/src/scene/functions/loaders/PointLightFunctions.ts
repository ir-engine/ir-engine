import { Color, PointLight, Vector2 } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../../ecs/functions/ComponentFunctions'
import { Object3DComponent } from '../../components/Object3DComponent'
import { PointLightComponent, PointLightComponentType } from '../../components/PointLightComponent'

export const SCENE_COMPONENT_POINT_LIGHT = 'point-light'
export const SCENE_COMPONENT_POINT_LIGHT_DEFAULT_VALUES = {
  color: '#ffffff',
  intensity: 1,
  range: 0,
  decay: 2,
  castShadow: true,
  shadowMapResolution: [256, 256],
  shadowBias: 0.5,
  shadowRadius: 1
}

export const deserializePointLight: ComponentDeserializeFunction = (
  entity: Entity,
  json: ComponentJson<PointLightComponentType>
) => {
  const light = new PointLight()
  const props = parsePointLightProperties(json.props)

  addComponent(entity, Object3DComponent, { value: light })
  addComponent(entity, PointLightComponent, props)

  updatePointLight(entity, props)
}

export const updatePointLight: ComponentUpdateFunction = (entity: Entity, properties: PointLightComponentType) => {
  const component = getComponent(entity, PointLightComponent)
  const light = getComponent(entity, Object3DComponent)?.value as PointLight

  if (typeof properties.color !== 'undefined') light.color.set(component.color)
  if (typeof properties.intensity !== 'undefined') light.intensity = component.intensity
  if (typeof properties.range !== 'undefined') light.distance = component.range
  if (typeof properties.decay !== 'undefined') light.decay = component.decay
  if (typeof properties.shadowBias !== 'undefined') light.shadow.bias = component.shadowBias
  if (typeof properties.shadowRadius !== 'undefined') light.shadow.radius = component.shadowRadius
  if (typeof properties.castShadow !== 'undefined') light.castShadow = component.castShadow

  if (typeof properties.shadowMapResolution !== 'undefined') {
    light.shadow.mapSize.copy(component.shadowMapResolution)
    light.shadow.map?.dispose()
    light.shadow.map = null as any

    light.shadow.camera.updateProjectionMatrix()
    light.shadow.needsUpdate = true
  }

  light.userData.ball.material.color = component.color
  light.userData.rangeBall.material.color = component.color
}

export const serializePointLight: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, PointLightComponent) as PointLightComponentType
  if (!component) return

  return {
    name: SCENE_COMPONENT_POINT_LIGHT,
    props: {
      color: component.color.getHex(),
      intensity: component.intensity,
      range: component.range,
      decay: component.decay,
      castShadow: component.castShadow,
      shadowMapResolution: component.shadowMapResolution?.toArray(),
      shadowBias: component.shadowBias,
      shadowRadius: component.shadowRadius
    }
  }
}

const parsePointLightProperties = (props): PointLightComponentType => {
  return {
    color: new Color(props.color ?? SCENE_COMPONENT_POINT_LIGHT_DEFAULT_VALUES.color),
    intensity: props.intensity ?? SCENE_COMPONENT_POINT_LIGHT_DEFAULT_VALUES.intensity,
    range: props.range ?? SCENE_COMPONENT_POINT_LIGHT_DEFAULT_VALUES.range,
    decay: props.decay ?? SCENE_COMPONENT_POINT_LIGHT_DEFAULT_VALUES.decay,
    castShadow: props.castShadow ?? SCENE_COMPONENT_POINT_LIGHT_DEFAULT_VALUES.castShadow,
    shadowBias: props.shadowBias ?? SCENE_COMPONENT_POINT_LIGHT_DEFAULT_VALUES.shadowBias,
    shadowRadius: props.shadowRadius ?? SCENE_COMPONENT_POINT_LIGHT_DEFAULT_VALUES.shadowRadius,
    shadowMapResolution: new Vector2().fromArray(
      props.shadowMapResolution ?? SCENE_COMPONENT_POINT_LIGHT_DEFAULT_VALUES.shadowMapResolution
    )
  }
}
