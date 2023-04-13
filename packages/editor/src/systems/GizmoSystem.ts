import { useEffect } from 'react'

import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { defineQuery, getComponent, removeQuery } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { defineSystem, PresentationSystemGroup } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { TransformGizmoComponent } from '@etherealengine/engine/src/scene/components/TransformGizmo'
import { TransformComponent } from '@etherealengine/engine/src/transform/components/TransformComponent'

const GIZMO_SIZE = 10

const gizmoQuery = defineQuery([TransformGizmoComponent])

const execute = () => {
  for (const entity of gizmoQuery()) {
    const gizmoTransform = getComponent(entity, TransformComponent)
    const eyeDistance = gizmoTransform.position.distanceTo(Engine.instance.camera.position) / GIZMO_SIZE
    gizmoTransform.scale.set(eyeDistance, eyeDistance, eyeDistance)
  }
}

const reactor = () => {
  useEffect(() => {
    return () => {
      removeQuery(gizmoQuery)
    }
  }, [])
  return null
}

export const GizmoSystem = defineSystem(
  {
    uuid: 'ee.editor.GizmoSystem',
    execute,
    reactor
  },
  { after: [PresentationSystemGroup] }
)
