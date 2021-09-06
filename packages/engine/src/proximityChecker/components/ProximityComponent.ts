import { createMappedComponent, hasComponent, addComponent, getComponent } from '../../ecs/functions/EntityFunctions'

export type ProximityComponentType = {
  usersInRange: any[]
  usersInIntimateRange: any[]
  usersLookingTowards: any[]
}

export const ProximityComponent = createMappedComponent<ProximityComponentType>()
