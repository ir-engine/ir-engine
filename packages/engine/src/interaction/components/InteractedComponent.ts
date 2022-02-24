import { ParityValue } from '../../common/enums/ParityValue'
import { Entity } from '../../ecs/classes/Entity'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type InteractedComponentType = {
  interactor: Entity
  parity: ParityValue
}

export const InteractedComponent = createMappedComponent<InteractedComponentType>('InteractedComponent')
