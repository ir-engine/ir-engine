import { matches, matchesEntity } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { Entity, UndefinedEntity } from '@etherealengine/engine/src/ecs/classes/Entity'
import { defineComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { defineState } from '@etherealengine/hyperflux'
import { Vector3 } from 'three'

export const ActiveOrbitCamera = defineState({
  name: 'OrbitCameraState',
  initial: () => {
    return Engine.instance.cameraEntity as Entity
  }
})

export const CameraOrbitComponent = defineComponent({
  name: 'CameraOrbitComponent',

  onInit: (entity) => {
    return {
      zoomDelta: 0,
      focusedObjects: [] as Entity[],
      isPanning: false,
      cursorDeltaX: 0,
      cursorDeltaY: 0,
      isOrbiting: false,
      refocus: false,
      cameraOrbitCenter: new Vector3(),
      inputEntity: UndefinedEntity
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (matches.number.test(json.zoomDelta)) component.zoomDelta.set(json.zoomDelta)
    if (json.focusedObjects) component.focusedObjects.set(json.focusedObjects)
    if (matches.boolean.test(json.isPanning)) component.isPanning.set(json.isPanning)
    if (matches.number.test(json.cursorDeltaX)) component.cursorDeltaX.set(json.cursorDeltaX)
    if (matches.number.test(json.cursorDeltaY)) component.cursorDeltaY.set(json.cursorDeltaY)
    if (matches.boolean.test(json.isOrbiting)) component.isOrbiting.set(json.isOrbiting)
    if (matches.boolean.test(json.refocus)) component.refocus.set(json.refocus)
    if (matchesEntity.test(json.inputEntity)) component.inputEntity.set(json.inputEntity)
  }
})
