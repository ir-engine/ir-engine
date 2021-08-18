import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

/**
 * @author HydraFire <github.com/HydraFire>
 */

export type NameComponentType = {
  name: string
}

export const NameComponent = createMappedComponent<NameComponentType>()
