import { Vector3 } from 'three'

import { EntityOrObjectUUID } from '@etherealengine/engine/src/ecs/functions/EntityTree'
import { defineState } from '@etherealengine/hyperflux'

export const EditorCameraState = defineState({
  name: 'EditorCameraState',
  initial: {
    zoomDelta: 0,
    focusedObjects: [] as EntityOrObjectUUID[],
    isPanning: false,
    cursorDeltaX: 0,
    cursorDeltaY: 0,
    isOrbiting: false,
    refocus: false
  }
})

export const editorCameraCenter = new Vector3()
