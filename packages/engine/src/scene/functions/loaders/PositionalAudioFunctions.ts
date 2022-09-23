import { PositionalAudioComponent } from '../../../audio/components/PositionalAudioComponent'
import { Entity } from '../../../ecs/classes/Entity'
import {
  addComponent,
  getComponent,
  serializeComponent,
  SerializedComponentType
} from '../../../ecs/functions/ComponentFunctions'
import { MediaComponent } from '../../components/MediaComponent'

export const deserializePositionalAudio = (
  entity: Entity,
  data: SerializedComponentType<typeof PositionalAudioComponent>
) => {
  addComponent(entity, PositionalAudioComponent, data)
  // backwards-compat
  const media = getComponent(entity, MediaComponent)
  if (media) {
    if (data['isMusic']) media.isMusic.set(data['isMusic'])
  }
}

export const serializePositionalAudio = (entity: Entity) => {
  return serializeComponent(entity, PositionalAudioComponent)
}
