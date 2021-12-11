import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../../ecs/functions/ComponentFunctions'
import { MetaDataComponent, MetaDataComponentType } from '../../components/MetaDataComponent'
import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/ComponentNames'

export const SCENE_COMPONENT_METADATA = 'mtdata'

export const deserializeMetaData: ComponentDeserializeFunction = (entity: Entity, json: ComponentJson) => {
  //if (isClient && Engine.isBot) {
  addComponent(entity, MetaDataComponent, json.props)
  console.log('scene_metadata|' + json.props.meta_data)
  //}

  updateMetaData(entity)
}

export const updateMetaData: ComponentUpdateFunction = (_: Entity) => {}

export const serializeMetaData: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, MetaDataComponent) as MetaDataComponentType
  if (!component) return

  return {
    name: SCENE_COMPONENT_METADATA,
    props: {
      meta_data: component.meta_data
    }
  }
}
