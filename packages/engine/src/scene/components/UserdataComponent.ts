import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

/**
 * @author HydraFire <github.com/HydraFire>
 */

export type UserdataComponentType = {
  data: any
}

export const UserdataComponent = createMappedComponent<UserdataComponentType>()
