import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import { createMappedComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { Vector3 } from 'three'

export type EditorCameraComponentType = {
  dirty?: boolean
  center: Vector3
  zoomDelta: number
  focusedObjects: EntityTreeNode[]
  isPanning: boolean
  cursorDeltaX: number
  cursorDeltaY: number
  isOrbiting: boolean
  refocus?: boolean
}

export const EditorCameraComponent = createMappedComponent<EditorCameraComponentType>('TransformGizmo')
