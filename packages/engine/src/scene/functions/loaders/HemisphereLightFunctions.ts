import { Color, HemisphereLight } from 'three'

import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentShouldDeserializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import {
  addComponent,
  getComponent,
  getComponentCountOfType,
  hasComponent,
  setComponent
} from '../../../ecs/functions/ComponentFunctions'
import {
  HemisphereLightComponent,
  HemisphereLightComponentType,
  SCENE_COMPONENT_HEMISPHERE_LIGHT_DEFAULT_VALUES
} from '../../components/HemisphereLightComponent'
import { Object3DComponent } from '../../components/Object3DComponent'

export const deserializeHemisphereLight: ComponentDeserializeFunction = (
  entity: Entity,
  data: HemisphereLightComponentType
) => {
  const props = parseHemisphereLightProperties(data)
  setComponent(entity, HemisphereLightComponent, props)
}

export const updateHemisphereLight: ComponentUpdateFunction = (entity: Entity) => {
  const component = getComponent(entity, HemisphereLightComponent)

  if (!hasComponent(entity, Object3DComponent)) {
    const light = new HemisphereLight()
    addComponent(entity, Object3DComponent, { value: light })
  }

  const light = getComponent(entity, Object3DComponent)?.value as HemisphereLight

  light.groundColor = component.groundColor
  light.color = component.skyColor
  light.intensity = component.intensity
}

export const serializeHemisphereLight: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, HemisphereLightComponent) as HemisphereLightComponentType
  return {
    skyColor: component.skyColor?.getHex(),
    groundColor: component.groundColor?.getHex(),
    intensity: component.intensity
  }
}

export const shouldDeserializeHemisphereLight: ComponentShouldDeserializeFunction = () => {
  return getComponentCountOfType(HemisphereLightComponent) <= 0
}

const parseHemisphereLightProperties = (props): HemisphereLightComponentType => {
  return {
    skyColor: new Color(props.skyColor ?? SCENE_COMPONENT_HEMISPHERE_LIGHT_DEFAULT_VALUES.skyColor),
    groundColor: new Color(props.groundColor ?? SCENE_COMPONENT_HEMISPHERE_LIGHT_DEFAULT_VALUES.groundColor),
    intensity: props.intensity ?? SCENE_COMPONENT_HEMISPHERE_LIGHT_DEFAULT_VALUES.intensity
  }
}
