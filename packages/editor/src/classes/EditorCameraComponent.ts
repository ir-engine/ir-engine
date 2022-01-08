import { Vector3 } from 'three'

import { createMappedComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'

export type EditorCameraComponentType = {
  dirty?: boolean
  center?: Vector3

  zoomDelta?: number

  focusedObjects?: any[]

  isPanning?: boolean
  cursorDeltaX?: number
  cursorDeltaY?: number

  isOrbiting?: boolean
}

export const EditorCameraComponent = createMappedComponent<EditorCameraComponentType>('TransformGizmo')
