import { createMappedComponent, hasComponent, addComponent, getComponent } from '../../ecs/functions/EntityFunctions'

export type ProximityCheckerComponentType = {}

export const ProximityCheckerComponent = createMappedComponent<ProximityCheckerComponentType>()
