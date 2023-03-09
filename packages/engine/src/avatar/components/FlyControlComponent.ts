import { createMappedComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'

export type FlyControlComponentType = {
  moveSpeed: number
  boostSpeed: number
  lookSensitivity: number
  maxXRotation: number
}

/** @todo replace with basic state somewhere instead of a component */
export const FlyControlComponent = createMappedComponent<FlyControlComponentType>('FlyControlComponent')
