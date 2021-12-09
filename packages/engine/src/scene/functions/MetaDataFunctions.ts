import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { Entity } from '../../ecs/classes/Entity'
import {
  addComponent,
  ComponentDeserializeFunction,
  ComponentUpdateFunction
} from '../../ecs/functions/ComponentFunctions'
import { MetaDataComponent } from '../components/MetaDataComponent'

export const createMetaData: ComponentDeserializeFunction = (entity: Entity, json: ComponentJson) => {
  //if (isClient && Engine.isBot) {
  addComponent(entity, MetaDataComponent, json.props)
  console.log('scene_metadata|' + json.props.meta_data)
  //}

  updateMetaData(entity)
}

export const updateMetaData: ComponentUpdateFunction = (_: Entity) => {}
