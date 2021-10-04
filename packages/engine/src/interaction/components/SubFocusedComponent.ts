import { Entity } from '../../ecs/Entity'
import { createMappedComponent } from '../../ecs/ComponentFunctions'

/**
 * @author HydraFire <github.com/HydraFire>
 */

export type SubFocusedType = {
  subInteracts: Entity
}

export const SubFocusedComponent = createMappedComponent<SubFocusedType>('SubFocusedComponent')
