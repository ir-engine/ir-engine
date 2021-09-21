import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type ProximityComponentType = {
  usersInRange: any[]
  usersInIntimateRange: any[]
  usersInHarassmentRange: any[]
  usersLookingTowards: any[]
}

export const ProximityComponent = createMappedComponent<ProximityComponentType>('ProximityComponent')
