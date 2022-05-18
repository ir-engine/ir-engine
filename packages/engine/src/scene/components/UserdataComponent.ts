import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

/**
 * @author HydraFire <github.com/HydraFire>
 */

export type UserdataComponentType = {
  data: any
}

export const UserdataComponent = createMappedComponent<UserdataComponentType>('UserdataComponent')
