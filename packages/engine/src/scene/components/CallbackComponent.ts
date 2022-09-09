import { Entity } from '../../ecs/classes/Entity'
import { addComponent, createMappedComponent, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'

export type CallbackComponentType = {
  [event: string]: undefined | ((...params: any) => void) // todo: stronger typing
}

export const CallbackComponent = createMappedComponent<CallbackComponentType>('CallbackComponent')

export function setCallback(entity: Entity, key: string, callback: (...params: any) => void) {
  if (!hasComponent(entity, CallbackComponent)) addComponent(entity, CallbackComponent, {})
  const callbacks = getComponent(entity, CallbackComponent)
  callbacks[key] = callback
}
