import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { Entity } from '../../ecs/classes/Entity'
import {
  addComponent,
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction,
  getComponent
} from '../../ecs/functions/ComponentFunctions'
import { MetaDataComponent, MetaDataComponentType } from '../components/MetaDataComponent'
import { ComponentName } from '../../common/constants/ComponentNames'

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
    name: ComponentName.MT_DATA,
    props: {
      meta_data: component.meta_data
    }
  }
}
