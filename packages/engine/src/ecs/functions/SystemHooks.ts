import { useEngine } from '../classes/Engine'

export function useWorld() {
  let currentWorld = useEngine().currentWorld
  if (!currentWorld) {
    // console.trace('Warning: Assuming default world. (It is advisable to only call ECS functions inside a system)')
    currentWorld = useEngine().defaultWorld
  }
  return currentWorld!
}
