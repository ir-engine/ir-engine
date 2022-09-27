import { ComponentDeserializeFunction, ComponentSerializeFunction } from '../../../common/constants/PrefabFunctionType'
import { isClient } from '../../../common/functions/isClient'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, serializeComponent } from '../../../ecs/functions/ComponentFunctions'
import { MediaComponent } from '../../components/MediaComponent'

export const deserializeMedia: ComponentDeserializeFunction = (
  entity: Entity,
  data: ReturnType<typeof MediaComponent.toJSON>
) => {
  if (!isClient) return
  addComponent(entity, MediaComponent, data)
}

export const serializeMedia: ComponentSerializeFunction = (entity) => {
  return serializeComponent(entity, MediaComponent)
}
