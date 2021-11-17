import { createMappedComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'

export type TransformGizmoComponentType = {
  enable: Boolean
  moveSpeed: number
  boostSpeed: number
  lookSensitivity: number
  maxXRotation: number
}

export const FlyControlComponent = createMappedComponent<TransformGizmoComponentType>('FlyControlComponent')
