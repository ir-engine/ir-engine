import { Entity } from '../../ecs/classes/Entity'
import { addComponent, defineComponent, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'

export const enum StandardCallbacks {
  PLAY = 'xre.play',
  PAUSE = 'xre.pause',
  STOP = 'xre.stop'
}

export const CallbackComponent = defineComponent({
  name: 'CallbackComponent',
  onInit: (entity) => new Map<string, (...params: any) => void>()
})

export function setCallback(entity: Entity, key: string, callback: (...params: any) => void) {
  if (!hasComponent(entity, CallbackComponent)) addComponent(entity, CallbackComponent, new Map())
  const callbacks = getComponent(entity, CallbackComponent)
  callbacks.set(key, callback)
  callbacks[key] = key // for inspector
}

export function getCallback(entity: Entity, key: string): ((...params: any) => void) | undefined {
  if (!hasComponent(entity, CallbackComponent)) return undefined
  return getComponent(entity, CallbackComponent).get(key)
}
