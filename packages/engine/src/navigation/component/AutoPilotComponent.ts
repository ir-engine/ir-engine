import { Vector3 } from 'three'

import { State as EntityState } from '../../common/functions/EntityStateMachineFunctions'
import { Entity } from '../../ecs/classes/Entity'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type AutoPilotComponentType = {
  state: EntityState
  navMeshEntities: Entity[]
  closestNavMeshIndex: number
  path: Vector3[]
  pathIndex: number
  speed: number
  maxSpeed: number
  minSpeed: number
}

export const AutoPilotComponent = createMappedComponent<AutoPilotComponentType>('AutoPilotComponent')
