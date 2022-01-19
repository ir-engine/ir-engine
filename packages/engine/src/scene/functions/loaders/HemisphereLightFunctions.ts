import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { Color, HemisphereLight } from 'three'
import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentShouldDeserializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, getComponentCountOfType } from '../../../ecs/functions/ComponentFunctions'
import { DisableTransformTagComponent } from '../../../transform/components/DisableTransformTagComponent'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { HemisphereLightComponent, HemisphereLightComponentType } from '../../components/HemisphereLightComponent'
import { Object3DComponent } from '../../components/Object3DComponent'

export const SCENE_COMPONENT_HEMISPHERE_LIGHT = 'hemisphere-light'
export const SCENE_COMPONENT_HEMISPHEREL_LIGHT_DEFAULT_VALUES = {
  skyColor: '#ffffff',
  groundColor: '#ffffff',
  intensity: 1
}

export const deserializeHemisphereLight: ComponentDeserializeFunction = (
  entity: Entity,
  json: ComponentJson<HemisphereLightComponentType>
) => {
  const light = new HemisphereLight()
  const props = parseHemisphereLightProperties(json.props)

  addComponent(entity, Object3DComponent, { value: light })
  addComponent(entity, DisableTransformTagComponent, {})
  addComponent(entity, HemisphereLightComponent, props)

  if (Engine.isEditor) getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_HEMISPHERE_LIGHT)

  updateHemisphereLight(entity, props)
}

export const updateHemisphereLight: ComponentUpdateFunction = (
  entity: Entity,
  properties: HemisphereLightComponentType
) => {
  const component = getComponent(entity, HemisphereLightComponent)
  const light = getComponent(entity, Object3DComponent)?.value as HemisphereLight

  if (typeof properties.groundColor !== 'undefined') light.groundColor = component.groundColor
  if (typeof properties.skyColor !== 'undefined') light.color = component.skyColor
  if (typeof properties.intensity !== 'undefined') light.intensity = component.intensity
}

export const serializeHemisphereLight: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, HemisphereLightComponent) as HemisphereLightComponentType
  if (!component) return

  return {
    name: SCENE_COMPONENT_HEMISPHERE_LIGHT,
    props: {
      skyColor: component.skyColor?.getHex(),
      groundColor: component.groundColor?.getHex(),
      intensity: component.intensity
    }
  }
}

export const shouldDeserializeHemisphereLight: ComponentShouldDeserializeFunction = () => {
  return getComponentCountOfType(HemisphereLightComponent) <= 0
}

const parseHemisphereLightProperties = (props): HemisphereLightComponentType => {
  return {
    skyColor: new Color(props.skyColor ?? SCENE_COMPONENT_HEMISPHEREL_LIGHT_DEFAULT_VALUES.skyColor),
    groundColor: new Color(props.groundColor ?? SCENE_COMPONENT_HEMISPHEREL_LIGHT_DEFAULT_VALUES.groundColor),
    intensity: props.intensity ?? SCENE_COMPONENT_HEMISPHEREL_LIGHT_DEFAULT_VALUES.intensity
  }
}
