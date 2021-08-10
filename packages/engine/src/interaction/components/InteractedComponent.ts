import { Entity } from '../../ecs/classes/Entity'
import { ParityValue } from '../../common/enums/ParityValue'
import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

export type InteractedComponentType = {
  interactor: Entity
  parity: ParityValue
}

export const InteractedComponent = createMappedComponent<InteractedComponentType>()
