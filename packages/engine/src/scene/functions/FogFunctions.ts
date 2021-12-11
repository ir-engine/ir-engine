import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { Color, Fog, FogExp2 } from 'three'
import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../common/constants/ComponentNames'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../ecs/functions/ComponentFunctions'
import { FogComponent, FogComponentType } from '../components/FogComponent'
import { FogType } from '../constants/FogType'

export const SCENE_COMPONENT_FOG = 'fog'

export const deserializeFog: ComponentDeserializeFunction = (entity: Entity, json: ComponentJson) => {
  addComponent(entity, FogComponent, {
    ...json.props,
    color: new Color(json.props.color)
  })

  updateFog(entity)
}

export const updateFog: ComponentUpdateFunction = (entity: Entity) => {
  const component = getComponent(entity, FogComponent)

  switch (component.type) {
    case FogType.Linear:
      if (Engine.scene.fog instanceof Fog) {
        Engine.scene.fog.color = component.color
        Engine.scene.fog.near = component.near
        Engine.scene.fog.far = component.far
      } else {
        Engine.scene.fog = new Fog(component.color, component.near, component.far)
      }
      break

    case FogType.Exponential:
      if (Engine.scene.fog instanceof FogExp2) {
        Engine.scene.fog.color = component.color
        Engine.scene.fog.density = component.density
      } else {
        Engine.scene.fog = new FogExp2(component.color.getHexString(), component.density)
      }
      break

    default:
      Engine.scene.fog = null
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
      color: component.color,
      near: component.near,
      far: component.far,
      density: component.density
    }
  }
}
