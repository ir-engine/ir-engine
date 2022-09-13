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

export const deserializeCloud: ComponentDeserializeFunction = (entity: Entity, data: CloudComponentType) => {
  const props = parseCloudProperties(data)
  setComponent(entity, CloudComponent, props)
}

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

export const serializeCloud: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, CloudComponent)
  return {
    texture: component.texture,
    worldScale: component.worldScale,
    dimensions: component.dimensions,
    noiseZoom: component.noiseZoom,
    noiseOffset: component.noiseOffset,
    spriteScaleRange: component.spriteScaleRange,
    fogColor: component.fogColor?.getHex(),
    fogRange: component.fogRange
  }
}

export const parseCloudProperties = (props: any): CloudComponentType => {
  const result = {
    texture: props.texture ?? SCENE_COMPONENT_CLOUD_DEFAULT_VALUES.texture,
    fogColor: new Color(props.fogColor ?? SCENE_COMPONENT_CLOUD_DEFAULT_VALUES.fogColor)
  } as CloudComponentType

  let tempV3 = props.worldScale ?? SCENE_COMPONENT_CLOUD_DEFAULT_VALUES.worldScale
  result.worldScale = new Vector3(tempV3.x, tempV3.y, tempV3.z)

  tempV3 = props.dimensions ?? SCENE_COMPONENT_CLOUD_DEFAULT_VALUES.dimensions
  result.dimensions = new Vector3(tempV3.x, tempV3.y, tempV3.z)

  tempV3 = props.noiseZoom ?? SCENE_COMPONENT_CLOUD_DEFAULT_VALUES.noiseZoom
  result.noiseZoom = new Vector3(tempV3.x, tempV3.y, tempV3.z)

  tempV3 = props.noiseOffset ?? SCENE_COMPONENT_CLOUD_DEFAULT_VALUES.noiseOffset
  result.noiseOffset = new Vector3(tempV3.x, tempV3.y, tempV3.z)

  let tempV2 = props.spriteScaleRange ?? SCENE_COMPONENT_CLOUD_DEFAULT_VALUES.spriteScaleRange
  result.spriteScaleRange = new Vector2(tempV2.x, tempV2.y)

  tempV2 = props.fogRange ?? SCENE_COMPONENT_CLOUD_DEFAULT_VALUES.fogRange
  result.fogRange = new Vector2(tempV2.x, tempV2.y)

  return result
}
