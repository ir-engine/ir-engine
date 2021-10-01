import { Engine } from '../classes/Engine'

export function useWorld() {
  let currentWorld = Engine.currentWorld
  if (!currentWorld) {
    // console.trace('Warning: Assuming default world. (It is advisable to only call ECS functions inside a system)')
    currentWorld = Engine.defaultWorld
  }
  return currentWorld!
}
