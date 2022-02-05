import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { AmbientLight, Color } from 'three'
import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentShouldDeserializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponentCountOfType, getComponent } from '../../../ecs/functions/ComponentFunctions'
import { DisableTransformTagComponent } from '../../../transform/components/DisableTransformTagComponent'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { AmbientLightComponent, AmbientLightComponentType } from '../../components/AmbientLightComponent'
import { Object3DComponent } from '../../components/Object3DComponent'

export const SCENE_COMPONENT_AMBIENT_LIGHT = 'ambient-light'
export const SCENE_COMPONENT_AMBIENT_LIGHT_DEFAULT_VALUES = {
  color: '#ffffff',
  intensity: 1
}

export const deserializeAmbientLight: ComponentDeserializeFunction = (
  entity: Entity,
  json: ComponentJson<AmbientLightComponentType>
) => {
  const light = new AmbientLight()
  const props = parseAmbientLightProperties(json.props)

  addComponent(entity, Object3DComponent, { value: light })
  addComponent(entity, DisableTransformTagComponent, {})
  addComponent(entity, AmbientLightComponent, props)

  if (Engine.isEditor) getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_AMBIENT_LIGHT)

  updateAmbientLight(entity, props)
}

export const updateAmbientLight: ComponentUpdateFunction = (entity: Entity, properties: AmbientLightComponentType) => {
  const component = getComponent(entity, AmbientLightComponent)
  const light = getComponent(entity, Object3DComponent)?.value as AmbientLight

  if (typeof properties.color !== 'undefined') light.color = component.color
  if (typeof properties.intensity !== 'undefined') light.intensity = component.intensity
}

export const serializeAmbientLight: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, AmbientLightComponent) as AmbientLightComponentType
  if (!component) return

  return {
    name: SCENE_COMPONENT_AMBIENT_LIGHT,
    props: {
      color: component.color?.getHex(),
      intensity: component.intensity
    }
  }
}

export const shouldDeserializeAmbientLight: ComponentShouldDeserializeFunction = () => {
  return getComponentCountOfType(AmbientLightComponent) <= 0
}

const parseAmbientLightProperties = (props): AmbientLightComponentType => {
  return {
    color: new Color(props.color ?? SCENE_COMPONENT_AMBIENT_LIGHT_DEFAULT_VALUES.color),
    intensity: props.intensity ?? SCENE_COMPONENT_AMBIENT_LIGHT_DEFAULT_VALUES.intensity
  }
}
