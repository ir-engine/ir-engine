import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { Color, Fog, FogExp2 } from 'three'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import {
  addComponent,
  ComponentDeserializeFunction,
  ComponentUpdateFunction,
  getComponent
} from '../../ecs/functions/ComponentFunctions'
import { FogComponent } from '../components/FogComponent'
import { FogType } from '../constants/FogType'

export const setFog: ComponentDeserializeFunction = (entity: Entity, json: ComponentJson) => {
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
