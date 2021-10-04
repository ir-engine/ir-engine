import { Engine } from './Engine'

/**
* Use the world.
* @return {@link Engine.World}
* @throws {@link MaxListenerExceededException}
* Thrown if the event is already assigned to another listener.
* @internal
*/
export function useWorld() {
  let currentWorld = Engine.currentWorld
  if (!currentWorld) {
    // console.trace('Warning: Assuming default world. (It is advisable to only call ECS functions inside a system)')
    currentWorld = Engine.defaultWorld
  }
  return currentWorld!
}
