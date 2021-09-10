import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

/**
 * @author HydraFire <github.com/HydraFire>
 */

export type NameComponentType = {
  name: string
}

export const NameComponent = createMappedComponent<NameComponentType>()
