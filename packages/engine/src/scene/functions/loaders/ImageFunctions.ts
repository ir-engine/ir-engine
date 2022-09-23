import { ComponentDeserializeFunction } from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import {
  getComponent,
  serializeComponent,
  SerializedComponentType,
  setComponent
} from '../../../ecs/functions/ComponentFunctions'
import { addObjectToGroup } from '../../components/GroupComponent'
import { ImageComponent } from '../../components/ImageComponent'

export const deserializeImage: ComponentDeserializeFunction = (
  entity: Entity,
  data: SerializedComponentType<typeof ImageComponent>
) => {
  if (data['imageSource']) data.source = data['imageSource'] // backwards-compat
  setComponent(entity, ImageComponent, data)
}

export const serializeImage = (entity: Entity) => {
  return serializeComponent(entity, ImageComponent)
}

export const enterImage = (entity: Entity) => {
  const image = getComponent(entity, ImageComponent)
  addObjectToGroup(entity, image.mesh.value)
}
