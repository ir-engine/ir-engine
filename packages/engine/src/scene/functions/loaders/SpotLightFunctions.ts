import { Color, ConeGeometry, DoubleSide, Mesh, MeshBasicMaterial, SpotLight, TorusGeometry, Vector2 } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import {
  ComponentDeserializeFunction,
  ComponentPrepareForGLTFExportFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../../ecs/functions/ComponentFunctions'
import { Object3DComponent } from '../../components/Object3DComponent'
import { SpotLightComponent, SpotLightComponentType } from '../../components/SpotLightComponent'

export const SCENE_COMPONENT_SPOT_LIGHT = 'spot-light'
export const SCENE_COMPONENT_SPOT_LIGHT_DEFAULT_VALUES = {
  color: 0xffffff,
  intensity: 10,
  range: 0,
  decay: 2,
  angle: Math.PI / 3,
  penumbra: 1,
  castShadow: true,
  shadowMapResolution: [256, 256],
  shadowBias: 0,
  shadowRadius: 1
}

export const deserializeSpotLight: ComponentDeserializeFunction = (
  entity: Entity,
  json: ComponentJson<SpotLightComponentType>
) => {
  const light = new SpotLight()
  const props = parseSpotLightProperties(json.props)

  light.target.position.set(0, -1, 0)
  light.target.name = 'light-target'
  light.add(light.target)

  addComponent(entity, Object3DComponent, { value: light })
  addComponent(entity, SpotLightComponent, props)

  updateSpotLight(entity, props)
}

export const updateSpotLight: ComponentUpdateFunction = (entity: Entity, properties: SpotLightComponentType) => {
  const component = getComponent(entity, SpotLightComponent)
  const light = getComponent(entity, Object3DComponent)?.value as SpotLight

  if (typeof properties.color !== 'undefined') light.color.set(component.color)
  if (typeof properties.intensity !== 'undefined') light.intensity = component.intensity
  if (typeof properties.range !== 'undefined') light.distance = component.range
  if (typeof properties.decay !== 'undefined') light.decay = component.decay
  if (typeof properties.penumbra !== 'undefined') light.penumbra = component.penumbra
  if (typeof properties.angle !== 'undefined') light.angle = component.angle
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
}

export const serializeSpotLight: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, SpotLightComponent) as SpotLightComponentType
  if (!component) return

  return {
    name: SCENE_COMPONENT_SPOT_LIGHT,
    props: {
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
