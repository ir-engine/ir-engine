import { Entity } from '../../ecs/Entity'
import { ParityValue } from '../../common/enums/ParityValue'
import { createMappedComponent } from '../../ecs/ComponentFunctions'

export type InteractedComponentType = {
  interactor: Entity
  parity: ParityValue
}

export const InteractedComponent = createMappedComponent<InteractedComponentType>('InteractedComponent')
