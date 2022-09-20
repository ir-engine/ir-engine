import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { defineQuery, getComponent, removeQuery } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { TransformGizmoComponent } from '@xrengine/engine/src/scene/components/TransformGizmo'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'

const GIZMO_SIZE = 10

export default async function GizmoSystem(world: World) {
  const gizmoQuery = defineQuery([TransformGizmoComponent])

  const execute = () => {
    for (const entity of gizmoQuery()) {
      const gizmoTransform = getComponent(entity, TransformComponent)
      const eyeDistance = gizmoTransform.position.distanceTo(Engine.instance.currentWorld.camera.position) / GIZMO_SIZE
      gizmoTransform.scale.set(eyeDistance, eyeDistance, eyeDistance)
    }
  }

  const cleanup = async () => {
    removeQuery(world, gizmoQuery)
  }

  return { execute, cleanup }
}
