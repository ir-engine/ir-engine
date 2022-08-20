import { AmbientLight, Color } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentShouldDeserializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, getComponentCountOfType } from '../../../ecs/functions/ComponentFunctions'
import {
  AmbientLightComponent,
  AmbientLightComponentType,
  SCENE_COMPONENT_AMBIENT_LIGHT_DEFAULT_VALUES
} from '../../components/AmbientLightComponent'
import { Object3DComponent } from '../../components/Object3DComponent'

export const deserializeAmbientLight: ComponentDeserializeFunction = (
  entity: Entity,
  data: AmbientLightComponentType
) => {
  const light = new AmbientLight()
  const props = parseAmbientLightProperties(data)

  addComponent(entity, Object3DComponent, { value: light })
  addComponent(entity, AmbientLightComponent, props)
}

export const updateAmbientLight: ComponentUpdateFunction = (entity: Entity) => {
  const component = getComponent(entity, AmbientLightComponent)
  const light = getComponent(entity, Object3DComponent)?.value as AmbientLight

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
