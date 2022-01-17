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
import { CloudComponent, CloudComponentType, CloudSchema } from '../../components/CloudComponent'
import { resolveMedia } from '../../../common/functions/resolveMedia'
import { isClient } from '../../../common/functions/isClient'
import { Clouds } from '../../classes/Clouds'
import { UpdatableComponent } from '../../components/UpdatableComponent'
import { parseProperties } from '../../../common/functions/deserializers'

export const SCENE_COMPONENT_CLOUD = 'cloud'

export const deserializeCloud: ComponentDeserializeFunction = (
  entity: Entity,
  json: ComponentJson<CloudComponentType>
) => {
  if (!isClient) return

  const obj3d = new Clouds()
  const props = parseProperties(json.props, CloudSchema)

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

  if (properties.hasOwnProperty('worldScale')) obj3d.worldScale = component.worldScale
  if (properties.hasOwnProperty('dimensions')) obj3d.dimensions = component.dimensions
  if (properties.hasOwnProperty('noiseZoom')) obj3d.noiseZoom = component.noiseZoom
  if (properties.hasOwnProperty('noiseOffset')) obj3d.noiseOffset = component.noiseOffset
  if (properties.hasOwnProperty('spriteScaleRange')) obj3d.spriteScaleRange = component.spriteScaleRange
  if (properties.hasOwnProperty('fogRange')) obj3d.fogRange = component.fogRange
  if (properties.hasOwnProperty('fogColor')) obj3d.fogColor = component.fogColor
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
