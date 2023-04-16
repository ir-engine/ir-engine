import { createActionQueue } from '@etherealengine/hyperflux'

import { defineQuery, getComponent, getMutableComponent } from '../ecs/functions/ComponentFunctions'
import { defineSystem } from '../ecs/functions/SystemFunctions'
import { LocalTransformComponent } from '../transform/components/TransformComponent'
import { PersistentAnchorActions, PersistentAnchorComponent } from './XRAnchorComponents'

const vpsAnchorQuery = defineQuery([PersistentAnchorComponent])
const vpsAnchorFoundQueue = createActionQueue(PersistentAnchorActions.anchorFound.matches)
const vpsAnchorUpdatedQueue = createActionQueue(PersistentAnchorActions.anchorUpdated.matches)
const vpsAnchorLostQueue = createActionQueue(PersistentAnchorActions.anchorLost.matches)

const execute = () => {
  const anchors = vpsAnchorQuery()

  for (const action of vpsAnchorFoundQueue()) {
    for (const entity of anchors) {
      const anchor = getMutableComponent(entity, PersistentAnchorComponent)
      if (anchor.name.value === action.name) {
        anchor.active.set(true)
        const localTransform = getComponent(entity, LocalTransformComponent)
        localTransform.position.copy(action.position)
        localTransform.rotation.copy(action.rotation)
      }
    }
  }

  for (const action of vpsAnchorUpdatedQueue()) {
    for (const entity of anchors) {
      const anchor = getMutableComponent(entity, PersistentAnchorComponent)
      if (anchor.name.value === action.name) {
        const localTransform = getComponent(entity, LocalTransformComponent)
        localTransform.position.copy(action.position)
        localTransform.rotation.copy(action.rotation)
      }
    }
  }

  for (const action of vpsAnchorLostQueue()) {
    for (const entity of anchors) {
      const anchor = getMutableComponent(entity, PersistentAnchorComponent)
      if (anchor.name.value === action.name) anchor.active.set(false)
    }
  }
}

export const VPSSystem = defineSystem({
  uuid: 'ee.engine.VPSSystem',
  execute
})
