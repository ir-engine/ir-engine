import { Color, PointLight, Vector2 } from 'three'

import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { isHMD } from '../../../common/functions/isMobile'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent, setComponent } from '../../../ecs/functions/ComponentFunctions'
import { addObjectToGroup } from '../../components/GroupComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import {
  PointLightComponent,
  PointLightComponentType,
  SCENE_COMPONENT_POINT_LIGHT_DEFAULT_VALUES
} from '../../components/PointLightComponent'

export const deserializePointLight: ComponentDeserializeFunction = (entity: Entity, data: PointLightComponentType) => {
  const props = parsePointLightProperties(data)
  setComponent(entity, PointLightComponent, props)
}

export const updatePointLight: ComponentUpdateFunction = (entity: Entity) => {
  // Point lights enable the dynamic lighting engine, which destroys performance in HMDs
  if (isHMD) return

  const component = getComponent(entity, PointLightComponent)

  if (!component.light) {
    const light = (component.light = new PointLight())
    addObjectToGroup(entity, light)
  }

  const light = component.light

  light.color.set(component.color)
  light.intensity = component.intensity
  light.distance = component.range
  light.decay = component.decay
  light.shadow.bias = component.shadowBias
  light.shadow.radius = component.shadowRadius
  light.castShadow = component.castShadow

  if (!light.shadow.mapSize.equals(component.shadowMapResolution)) {
    light.shadow.mapSize.copy(component.shadowMapResolution)
    light.shadow.map?.dispose()
    light.shadow.map = null as any
    light.shadow.camera.updateProjectionMatrix()
    light.shadow.needsUpdate = true
  }
}

export const serializePointLight: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, PointLightComponent) as PointLightComponentType
  return {
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
