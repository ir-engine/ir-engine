import { Color, Vector2, Vector3 } from 'three'

import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../../ecs/functions/ComponentFunctions'
import { Clouds } from '../../classes/Clouds'
import { CloudComponent, CloudComponentType, SCENE_COMPONENT_CLOUD_DEFAULT_VALUES } from '../../components/CloudComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { UpdatableComponent } from '../../components/UpdatableComponent'

export const deserializeCloud: ComponentDeserializeFunction = (entity: Entity, data: CloudComponentType) => {
  const obj3d = new Clouds(entity)
  const props = parseCloudProperties(data)

  addComponent(entity, Object3DComponent, { value: obj3d })
  addComponent(entity, CloudComponent, props)
  addComponent(entity, UpdatableComponent, {})

  updateCloud(entity, props)
}

export const updateCloud: ComponentUpdateFunction = (entity: Entity, properties: CloudComponentType) => {
  const obj3d = getComponent(entity, Object3DComponent).value as Clouds
  const component = getComponent(entity, CloudComponent)

  obj3d.texture = component.texture

  obj3d.worldScale = component.worldScale
  obj3d.dimensions = component.dimensions
  obj3d.noiseZoom = component.noiseZoom
  obj3d.noiseOffset = component.noiseOffset
  obj3d.spriteScaleRange = component.spriteScaleRange
  obj3d.fogRange = component.fogRange
  obj3d.fogColor = component.fogColor
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
