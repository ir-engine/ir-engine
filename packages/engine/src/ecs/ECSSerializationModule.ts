import { ECSSerializerSystem } from './ECSSerializerSystem'
import { insertSystems, PresentationSystemGroup } from './functions/SystemFunctions'

export const ECSSerializationSystems = () => {
  insertSystems([ECSSerializerSystem], 'after', PresentationSystemGroup)
}
