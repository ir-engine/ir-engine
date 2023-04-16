import { Color, Vector2, Vector3 } from 'three'

import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import { getComponent, setComponent } from '../../../ecs/functions/ComponentFunctions'
import { Clouds } from '../../classes/Clouds'
import {
  CloudComponent,
  CloudComponentType,
  SCENE_COMPONENT_CLOUD_DEFAULT_VALUES
} from '../../components/CloudComponent'
import { addObjectToGroup } from '../../components/GroupComponent'

export const updateCloud: ComponentUpdateFunction = (entity: Entity) => {
  const component = getComponent(entity, CloudComponent)
  if (!component.clouds) {
    component.clouds = new Clouds(entity)
    addObjectToGroup(entity, component.clouds)
  }
  const clouds = component.clouds
  clouds.texture = component.texture
  clouds.worldScale = component.worldScale
  clouds.dimensions = component.dimensions
  clouds.noiseZoom = component.noiseZoom
  clouds.noiseOffset = component.noiseOffset
  clouds.spriteScaleRange = component.spriteScaleRange
  clouds.fogRange = component.fogRange
  clouds.fogColor = component.fogColor
  clouds.update()
}
