import { createMappedComponent, hasComponent, addComponent, getComponent } from '../../ecs/functions/EntityFunctions'

export type ProximityCheckerComponentType = {}

export const createProximityCheckerComponent = (eid: number) => {
  return addComponent(eid, ProximityCheckerComponent, {})
}

export const ProximityCheckerComponent = createMappedComponent<ProximityCheckerComponentType>()
