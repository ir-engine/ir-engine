import { ComponentDeserializeFunction } from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, serializeComponent } from '../../../ecs/functions/ComponentFunctions'
import { VideoComponent } from '../../components/VideoComponent'

export const deserializeVideo: ComponentDeserializeFunction = (
  entity: Entity,
  data: ReturnType<typeof VideoComponent.toJSON>
) => {
  addComponent(entity, VideoComponent, data)
}

export const serializeVideo = (entity: Entity) => {
  return serializeComponent(entity, VideoComponent)
}
