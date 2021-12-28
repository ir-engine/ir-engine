import { Box3, Mesh, Vector3 } from 'three'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { isDynamicBody } from '../../physics/classes/Physics'
import { ColliderComponent } from '../../physics/components/ColliderComponent'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { BoundingBoxComponent } from '../components/BoundingBoxComponent'

export const createBoxComponent = (entity: Entity) => {
  const dynamic = hasComponent(entity, ColliderComponent) && isDynamicBody(getComponent(entity, ColliderComponent).body)

  const calcBoundingBox = addComponent(entity, BoundingBoxComponent, { dynamic, box: new Box3() })

  const object3D = getComponent(entity, Object3DComponent).value
  const transform = getComponent(entity, TransformComponent)

  object3D.position.copy(transform.position)
  object3D.rotation.setFromQuaternion(transform.rotation)
  if (!calcBoundingBox.dynamic) object3D.updateMatrixWorld()

  let hasBoxExpanded = false

  // expand bounding box to
  object3D.traverse((obj3d: Mesh) => {
    if (obj3d instanceof Mesh) {
      if (!obj3d.geometry.boundingBox) obj3d.geometry.computeBoundingBox()
      const aabb = new Box3().copy(obj3d.geometry.boundingBox!)
      if (!calcBoundingBox.dynamic) aabb.applyMatrix4(obj3d.matrixWorld)
      if (hasBoxExpanded) {
        calcBoundingBox.box.union(aabb)
      } else {
        calcBoundingBox.box.copy(aabb)
        hasBoxExpanded = true
      }
    }
  })
  // if no meshes, create a small bb so interactables still detect it
  if (!hasBoxExpanded) {
    calcBoundingBox.box = new Box3(
      new Vector3(-0.05, -0.05, -0.05).add(transform.position),
      new Vector3(0.05, 0.05, 0.05).add(transform.position)
    )
  }
}
