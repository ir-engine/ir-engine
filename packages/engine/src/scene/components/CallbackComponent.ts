import { Entity } from '../../ecs/classes/Entity'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type CallbackComponentType = {
  [event: string]: (triggerEntity?: Entity) => void
}

export const CallbackComponent = createMappedComponent<CallbackComponentType>('CallbackComponent')
