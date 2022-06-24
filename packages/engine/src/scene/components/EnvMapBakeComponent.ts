import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { EnvMapBakeSettings } from '../types/EnvMapBakeSettings'

export type EnvMapBakeComponentType = {
  options: EnvMapBakeSettings
}

export const EnvMapBakeComponent = createMappedComponent<EnvMapBakeComponentType>('EnvMapBakeComponent')
