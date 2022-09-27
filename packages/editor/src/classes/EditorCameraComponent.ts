import { Vector3 } from 'three'

import { createMappedComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/functions/EntityTree'

export type EditorCameraComponentType = {
  center: Vector3
  zoomDelta: number
  focusedObjects: (string | EntityTreeNode)[]
  isPanning: boolean
  cursorDeltaX: number
  cursorDeltaY: number
  isOrbiting: boolean
  refocus?: boolean
}

export const EditorCameraComponent = createMappedComponent<EditorCameraComponentType>('EditorCameraComponent')
