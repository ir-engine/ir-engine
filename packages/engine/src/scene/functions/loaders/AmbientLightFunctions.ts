import { AmbientLight, Color } from 'three'

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
  AmbientLightComponent,
  AmbientLightComponentType,
  SCENE_COMPONENT_AMBIENT_LIGHT_DEFAULT_VALUES
} from '../../components/AmbientLightComponent'
import { addObjectToGroup } from '../../components/GroupComponent'
import { Object3DComponent } from '../../components/Object3DComponent'

export const deserializeAmbientLight: ComponentDeserializeFunction = (
  entity: Entity,
  data: AmbientLightComponentType
) => {
  const props = parseAmbientLightProperties(data)
  setComponent(entity, AmbientLightComponent, props)
}

export const updateAmbientLight: ComponentUpdateFunction = (entity: Entity) => {
  const component = getComponent(entity, AmbientLightComponent)

  if (!component.light) {
    component.light = new AmbientLight()
    addObjectToGroup(entity, component.light)
  }

  const light = component.light
  light.color = component.color
  light.intensity = component.intensity
}

export const serializeAmbientLight: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, AmbientLightComponent) as AmbientLightComponentType
  if (!component) return

  return {
    color: component.color?.getHex(),
    intensity: component.intensity
  }
}

export const shouldDeserializeAmbientLight: ComponentShouldDeserializeFunction = () => {
  return getComponentCountOfType(AmbientLightComponent) <= 0
}

export const parseAmbientLightProperties = (props): AmbientLightComponentType => {
  return {
    color: new Color(props.color ?? SCENE_COMPONENT_AMBIENT_LIGHT_DEFAULT_VALUES.color),
    intensity: props.intensity ?? SCENE_COMPONENT_AMBIENT_LIGHT_DEFAULT_VALUES.intensity
  }
}
