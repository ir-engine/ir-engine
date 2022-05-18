import { createMappedComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'

export type FlyControlComponentType = {
  enable: boolean
  moveSpeed: number
  boostSpeed: number
  lookSensitivity: number
  maxXRotation: number
}

export const FlyControlComponent = createMappedComponent<FlyControlComponentType>('FlyControlComponent')
