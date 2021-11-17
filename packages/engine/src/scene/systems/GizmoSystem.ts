import { Raycaster } from 'three'
import { Engine } from '../../ecs/classes/Engine'
import { System } from '../../ecs/classes/System'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent } from '../../ecs/functions/ComponentFunctions'
import TransformGizmo from '../classes/TransformGizmo'
import { Object3DComponent } from '../components/Object3DComponent'
import { TransformGizmoComponent } from '../components/TransformGizmo'

const GIZMO_SIZE = 10

/**
 * @author Gheric Speiginer <github.com/speigg>
 */
export default async function GizmoSystem(world: World): Promise<System> {
  const gizmoQuery = defineQuery([TransformGizmoComponent])
  const raycaster = new Raycaster()

  return () => {
    for (const entity of gizmoQuery()) {
      const gizmoObj = getComponent(entity, Object3DComponent)?.value as TransformGizmo
      if (!gizmoObj || !gizmoObj.visible) return

      const eyeDistance = gizmoObj.position.distanceTo(Engine.camera.position) / GIZMO_SIZE
      gizmoObj.scale.set(eyeDistance, eyeDistance, eyeDistance)

      // raycaster.setFromCamera(cursorPosition, camera)
      // gizmoObj.highlightHoveredAxis(raycaster)
    }
  }
}
