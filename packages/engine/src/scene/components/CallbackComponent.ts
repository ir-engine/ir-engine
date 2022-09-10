import { Entity } from '../../ecs/classes/Entity'
import { addComponent, createMappedComponent, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'

export const enum StandardCallbacks {
  PLAY = 'xre.play',
  PAUSE = 'xre.pause',
  STOP = 'xre.stop'
}

export const CallbackComponent = createMappedComponent<Map<string, (...params: any) => void>>('CallbackComponent')

export function setCallback(entity: Entity, key: string, callback: (...params: any) => void) {
  if (!hasComponent(entity, CallbackComponent)) addComponent(entity, CallbackComponent, new Map())
  const callbacks = getComponent(entity, CallbackComponent)
  callbacks.set(key, callback)
  callbacks[key] = key // for inspector
}
