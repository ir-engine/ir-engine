import { Color, SpotLight, Vector2 } from 'three'

import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import { getComponent, setComponent } from '../../../ecs/functions/ComponentFunctions'
import { addObjectToGroup } from '../../components/GroupComponent'
import {
  SCENE_COMPONENT_SPOT_LIGHT_DEFAULT_VALUES,
  SpotLightComponent,
  SpotLightComponentType
} from '../../components/SpotLightComponent'

export const deserializeSpotLight: ComponentDeserializeFunction = (entity: Entity, data: SpotLightComponentType) => {
  const props = parseSpotLightProperties(data)
  setComponent(entity, SpotLightComponent, props)
}

export const updateSpotLight: ComponentUpdateFunction = (entity: Entity) => {
  const component = getComponent(entity, SpotLightComponent)

  if (!component.light) {
    const light = (component.light = new SpotLight())
    light.target.position.set(0, -1, 0)
    light.target.name = 'light-target'
    light.add(light.target)
    addObjectToGroup(entity, light)
  }

  const light = component.light

  light.color.set(component.color)
  light.intensity = component.intensity
  light.distance = component.range
  light.decay = component.decay
  light.penumbra = component.penumbra
  light.angle = component.angle
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

export const serializeSpotLight: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, SpotLightComponent)
  return {
    color: component.color.getHex(),
    intensity: component.intensity,
    range: component.range,
    decay: component.decay,
    angle: component.angle,
    penumbra: component.penumbra,
    castShadow: component.castShadow,
    shadowMapResolution: component.shadowMapResolution?.toArray(),
    shadowBias: component.shadowBias,
    shadowRadius: component.shadowRadius
  }
}

export const parseSpotLightProperties = (props): SpotLightComponentType => {
  return {
    color: new Color(props.color ?? SCENE_COMPONENT_SPOT_LIGHT_DEFAULT_VALUES.color),
    intensity: props.intensity ?? SCENE_COMPONENT_SPOT_LIGHT_DEFAULT_VALUES.intensity,
    range: props.range ?? SCENE_COMPONENT_SPOT_LIGHT_DEFAULT_VALUES.range,
    decay: props.decay ?? SCENE_COMPONENT_SPOT_LIGHT_DEFAULT_VALUES.decay,
    angle: props.angle ?? SCENE_COMPONENT_SPOT_LIGHT_DEFAULT_VALUES.angle,
    penumbra: props.penumbra ?? SCENE_COMPONENT_SPOT_LIGHT_DEFAULT_VALUES.penumbra,
    castShadow: props.castShadow ?? SCENE_COMPONENT_SPOT_LIGHT_DEFAULT_VALUES.castShadow,
    shadowBias: props.shadowBias ?? SCENE_COMPONENT_SPOT_LIGHT_DEFAULT_VALUES.shadowBias,
    shadowRadius: props.shadowRadius ?? SCENE_COMPONENT_SPOT_LIGHT_DEFAULT_VALUES.shadowRadius,
    shadowMapResolution: new Vector2().fromArray(
      props.shadowMapResolution ?? SCENE_COMPONENT_SPOT_LIGHT_DEFAULT_VALUES.shadowMapResolution
    )
  }
}
