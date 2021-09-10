import { createMappedComponent, hasComponent, addComponent, getComponent } from '../../ecs/functions/ComponentFunctions'

export type ProximityCheckerComponentType = {}

export const ProximityCheckerComponent = createMappedComponent<ProximityCheckerComponentType>()
