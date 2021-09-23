import { createMappedComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'

export type ProximityComponentType = {
  usersInRange: any[]
  usersInIntimateRange: any[]
  usersInHarassmentRange: any[]
  usersLookingTowards: any[]
}

export const ProximityComponent = createMappedComponent<ProximityComponentType>('ProximityComponent')
