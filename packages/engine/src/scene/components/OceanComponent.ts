import { createMappedComponent } from '../../ecs/functions/EntityFunctions'
import { Ocean } from '../classes/Ocean'

export type OceanComponentType = {
  mesh: Ocean
}

export const OceanComponent = createMappedComponent<OceanComponentType>()
