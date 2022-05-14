import { Color, Fog, FogExp2 } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../../ecs/functions/ComponentFunctions'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { FogComponent, FogComponentType } from '../../components/FogComponent'
import { FogType } from '../../constants/FogType'

export const SCENE_COMPONENT_FOG = 'fog'
export const SCENE_COMPONENT_FOG_DEFAULT_VALUES = {
  type: FogType.Linear,
  color: '#FFFFFF',
  density: 0.000025,
  near: 1,
  far: 1000
}

export const deserializeFog: ComponentDeserializeFunction = (entity: Entity, json: ComponentJson<FogComponentType>) => {
  const props = parseFogProperties(json.props)
  addComponent(entity, FogComponent, props)

  getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_FOG)

  updateFog(entity, props)
}

export const updateFog: ComponentUpdateFunction = (entity: Entity, _properties: FogComponentType) => {
  const component = getComponent(entity, FogComponent)

  switch (component.type) {
    case FogType.Linear:
      if (Engine.instance.currentWorld.scene.fog instanceof Fog) {
        Engine.instance.currentWorld.scene.fog.color = component.color
        Engine.instance.currentWorld.scene.fog.near = component.near
        Engine.instance.currentWorld.scene.fog.far = component.far
      } else {
        Engine.instance.currentWorld.scene.fog = new Fog(component.color, component.near, component.far)
      }
      break

    case FogType.Exponential:
      if (Engine.instance.currentWorld.scene.fog instanceof FogExp2) {
        Engine.instance.currentWorld.scene.fog.color = component.color
        Engine.instance.currentWorld.scene.fog.density = component.density
      } else {
        Engine.instance.currentWorld.scene.fog = new FogExp2(component.color.getHexString(), component.density)
      }
      break

    default:
      Engine.instance.currentWorld.scene.fog = null
      break
  }
}

export const serializeFog: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, FogComponent) as FogComponentType
  if (!component) return

  return {
    name: SCENE_COMPONENT_FOG,
    props: {
      type: component.type,
      color: component.color.getHex(),
      near: component.near,
      far: component.far,
      density: component.density
    }
  }
}

const parseFogProperties = (props): FogComponentType => {
  return {
    type: props.type ?? SCENE_COMPONENT_FOG_DEFAULT_VALUES.type,
    color: new Color(props.color ?? SCENE_COMPONENT_FOG_DEFAULT_VALUES.color),
    density: props.density ?? SCENE_COMPONENT_FOG_DEFAULT_VALUES.density,
    near: props.near ?? SCENE_COMPONENT_FOG_DEFAULT_VALUES.near,
    far: props.far ?? SCENE_COMPONENT_FOG_DEFAULT_VALUES.far
  }
}
