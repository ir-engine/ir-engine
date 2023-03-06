import { Vector3 } from 'three'

import { createMappedComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { EntityOrObjectUUID } from '@etherealengine/engine/src/ecs/functions/EntityTree'

export type EditorCameraComponentType = {
  center: Vector3
  zoomDelta: number
  focusedObjects: EntityOrObjectUUID[]
  isPanning: boolean
  cursorDeltaX: number
  cursorDeltaY: number
  isOrbiting: boolean
  refocus?: boolean
}

export const EditorCameraComponent = createMappedComponent<EditorCameraComponentType>('EditorCameraComponent')
