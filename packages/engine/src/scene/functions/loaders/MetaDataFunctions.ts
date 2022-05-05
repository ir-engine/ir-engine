import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../../ecs/functions/ComponentFunctions'
import { useWorld } from '../../../ecs/functions/SystemHooks'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { MetaDataComponent, MetaDataComponentType } from '../../components/MetaDataComponent'

export const SCENE_COMPONENT_METADATA = 'mtdata'

export const deserializeMetaData: ComponentDeserializeFunction = (
  entity: Entity,
  json: ComponentJson<MetaDataComponentType>
) => {
  addComponent(entity, MetaDataComponent, { meta_data: json.props.meta_data ?? '' })

  getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_METADATA)

  updateMetaData(entity)
}

export const updateMetaData: ComponentUpdateFunction = (entity: Entity) => {
  console.log('updateMetaData', getComponent(entity, MetaDataComponent))
  if (!Engine.instance.isEditor) useWorld().sceneMetadata = getComponent(entity, MetaDataComponent).meta_data
}

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
