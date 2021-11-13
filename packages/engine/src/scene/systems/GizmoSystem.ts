import { Engine } from '../../ecs/classes/Engine'
import { System } from '../../ecs/classes/System'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent } from '../../ecs/functions/ComponentFunctions'
import { Object3DComponent } from '../components/Object3DComponent'
import { TransformGizmoComponent } from '../components/TransformGizmo'

/**
 * @author Gheric Speiginer <github.com/speigg>
 */
export default async function GizmoSystem(world: World): Promise<System> {
  const gizmoQuery = defineQuery([TransformGizmoComponent])

  return () => {
    for (const entity of gizmoQuery()) {
      const gizmo = getComponent(entity, Object3DComponent)
      const eyeDistance = gizmo.value.position.distanceTo(Engine.camera.position)
      gizmo.value.scale.set(1, 1, 1).multiplyScalar(eyeDistance / 10)
    }
  }
}
