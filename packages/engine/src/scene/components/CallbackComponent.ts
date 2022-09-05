import { Entity } from '../../ecs/classes/Entity'
import { addComponent, createMappedComponent, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'

export type CallbackComponentType = {
  [event: string]: undefined | ((triggerEntity?: Entity) => void)
}

export const CallbackComponent = createMappedComponent<CallbackComponentType>('CallbackComponent')

export function setCallbacks(entity: Entity, map: { [event: string]: (triggerEntity?: Entity) => void }) {
  if (!hasComponent(entity, CallbackComponent)) addComponent(entity, CallbackComponent, {})
  const callbacks = getComponent(entity, CallbackComponent)
  Object.assign(callbacks, map)
}
