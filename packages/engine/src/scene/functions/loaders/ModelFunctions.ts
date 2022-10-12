import { ComponentDeserializeFunction, ComponentSerializeFunction } from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import { serializeComponent, setComponent } from '../../../ecs/functions/ComponentFunctions'
import { ModelComponent, ModelComponentType } from '../../components/ModelComponent'
import { SceneAssetPendingTagComponent } from '../../components/SceneAssetPendingTagComponent'

export const deserializeModel: ComponentDeserializeFunction = (entity: Entity, data: ModelComponentType) => {
  setComponent(entity, ModelComponent, data)
  /**
   * Add SceneAssetPendingTagComponent to tell scene loading system we should wait for this asset to load
   */
  setComponent(entity, SceneAssetPendingTagComponent, true)
}

export const serializeModel: ComponentSerializeFunction = (entity) => {
  return serializeComponent(entity, ModelComponent)
}
