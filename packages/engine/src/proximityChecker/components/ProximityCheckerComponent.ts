import { createMappedComponent, hasComponent, addComponent, getComponent } from '../../ecs/functions/EntityFunctions'
import { Network } from '../../networking/classes/Network'

export type ProximityCheckerComponentType = {}

export const createProximityCheckerComponent = (eid: number): ProximityCheckerComponentType => {
  console.log('creating proximity checker component')
  if (hasComponent(eid, ProximityCheckerComponent)) return getComponent(eid, ProximityCheckerComponent)
  return addComponent(eid, ProximityCheckerComponent, {})
}

export const ProximityCheckerComponent = createMappedComponent<ProximityCheckerComponentType>()
