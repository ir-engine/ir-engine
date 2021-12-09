import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { Color, HemisphereLight } from 'three'
import { isClient } from '../../common/functions/isClient'
import { Entity } from '../../ecs/classes/Entity'
import {
  addComponent,
  ComponentDeserializeFunction,
  ComponentUpdateFunction,
  getComponent
} from '../../ecs/functions/ComponentFunctions'
import { DisableTransformTagComponent } from '../../transform/components/DisableTransformTagComponent'
import { HemisphereLightComponent } from '../components/HemisphereLightComponent'
import { Object3DComponent } from '../components/Object3DComponent'

export const createHemisphereLight: ComponentDeserializeFunction = (entity: Entity, json: ComponentJson) => {
  if (!isClient || !json) return

  const light = new HemisphereLight()

  addComponent(entity, Object3DComponent, { value: light })
  addComponent(entity, DisableTransformTagComponent, {})
  addComponent(entity, HemisphereLightComponent, {
    ...json.props,
    skyColor: new Color(json.props.skyColor),
    groundColor: new Color(json.props.groundColor)
  })

  updateHemisphereLight(entity)
}

export const updateHemisphereLight: ComponentUpdateFunction = (entity: Entity) => {
  const component = getComponent(entity, HemisphereLightComponent)
  const light = getComponent(entity, Object3DComponent)?.value as HemisphereLight

  light.groundColor = component.groundColor
  light.color = component.skyColor
  light.intensity = component.intensity
}
