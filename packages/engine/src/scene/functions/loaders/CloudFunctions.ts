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
import { Object3DComponent } from '../../components/Object3DComponent'
import { CloudComponent, CloudComponentType } from '../../components/CloudComponent'
import { resolveMedia } from '../../../common/functions/resolveMedia'
import { isClient } from '../../../common/functions/isClient'
import { Clouds } from '../../classes/Clouds'
import { UpdatableComponent } from '../../components/UpdatableComponent'
import { Color, Vector2, Vector3 } from 'three'

export const SCENE_COMPONENT_CLOUD = 'cloud'
export const SCENE_COMPONENT_CLOUD_DEFAULT_VALUES = {
  texture: '/clouds/cloud.png',
  worldScale: { x: 1000, y: 150, z: 1000 },
  dimensions: { x: 8, y: 4, z: 8 },
  noiseZoom: { x: 7, y: 11, z: 7 },
  noiseOffset: { x: 0, y: 4000, z: 3137 },
  spriteScaleRange: { x: 50, y: 100 },
  fogColor: 0x4584b4,
  fogRange: { x: -100, y: 3000 }
}

export const deserializeCloud: ComponentDeserializeFunction = (
  entity: Entity,
  json: ComponentJson<CloudComponentType>
) => {
  if (!isClient) return

  const obj3d = new Clouds()
  const props = parseCloudProperties(json.props)

  addComponent(entity, Object3DComponent, { value: obj3d })
  addComponent(entity, CloudComponent, props)
  addComponent(entity, UpdatableComponent, {})

  if (Engine.isEditor) {
    getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_CLOUD)

    obj3d.userData.disableOutline = true
  }

  updateCloud(entity, props)
}

export const updateCloud: ComponentUpdateFunction = async (entity: Entity, properties: CloudComponentType) => {
  const obj3d = getComponent(entity, Object3DComponent).value as Clouds
  const component = getComponent(entity, CloudComponent)

  if (properties.texture) {
    try {
      const { url } = await resolveMedia(component.texture)
      obj3d.texture = url
    } catch (error) {
      console.error(error)
    }
  }

  if (typeof properties.worldScale !== 'undefined') obj3d.worldScale = component.worldScale
  if (typeof properties.dimensions !== 'undefined') obj3d.dimensions = component.dimensions
  if (typeof properties.noiseZoom !== 'undefined') obj3d.noiseZoom = component.noiseZoom
  if (typeof properties.noiseOffset !== 'undefined') obj3d.noiseOffset = component.noiseOffset
  if (typeof properties.spriteScaleRange !== 'undefined') obj3d.spriteScaleRange = component.spriteScaleRange
  if (typeof properties.fogRange !== 'undefined') obj3d.fogRange = component.fogRange
  if (typeof properties.fogColor !== 'undefined') obj3d.fogColor = component.fogColor
}

export const serializeCloud: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, CloudComponent) as CloudComponentType
  if (!component) return

  return {
    name: SCENE_COMPONENT_CLOUD,
    props: {
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
}

const parseCloudProperties = (props: any): CloudComponentType => {
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
