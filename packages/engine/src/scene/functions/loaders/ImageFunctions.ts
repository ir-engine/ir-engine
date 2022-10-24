import { ComponentDeserializeFunction } from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import { serializeComponent, SerializedComponentType, setComponent } from '../../../ecs/functions/ComponentFunctions'
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
