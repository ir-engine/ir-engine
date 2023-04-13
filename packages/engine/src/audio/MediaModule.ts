import { insertSystems, PresentationSystemGroup } from '../ecs/functions/SystemFunctions'
import { MediaSystem } from './systems/MediaSystem'
import { PositionalAudioSystem } from './systems/PositionalAudioSystem'

export const MediaSystems = () => {
  insertSystems([MediaSystem], 'before', PresentationSystemGroup)
  insertSystems([PositionalAudioSystem], 'after', PresentationSystemGroup)
}
