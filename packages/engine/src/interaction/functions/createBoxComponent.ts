import { Box3, Mesh, Vector3 } from 'three'

import { Entity } from '../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { RigidBodyDynamicTagComponent } from '../../physics/components/RigidBodyDynamicTagComponent'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { BoundingBoxComponent } from '../components/BoundingBoxComponent'
import { BoundingBoxDynamicTagComponent } from '../components/BoundingBoxDynamicTagComponent'

// TODO: Move all logic into a system.
// This code breaks if the entity does not immediately have Object3DComponent or TransformComponent components added.

export const createBoxComponent = (entity: Entity) => {
  const dynamic = hasComponent(entity, RigidBodyDynamicTagComponent)

  if (dynamic) addComponent(entity, BoundingBoxDynamicTagComponent, true)

  const calcBoundingBox = addComponent(entity, BoundingBoxComponent, { box: new Box3() })

  const object3D = getComponent(entity, Object3DComponent).value

  const transform = getComponent(entity, TransformComponent)
  object3D.position.copy(transform.position)
  object3D.rotation.setFromQuaternion(transform.rotation)
  object3D.scale.copy(transform.scale)

  if (!calcBoundingBox.dynamic) object3D.updateMatrixWorld()

  let hasBoxExpanded = false

  // expand bounding box to
  object3D.traverse((obj3d: Mesh) => {
    if (obj3d.isMesh) {
      obj3d.geometry.computeBoundingBox()
      const aabb = new Box3().copy(obj3d.geometry.boundingBox!)
      aabb.applyMatrix4(obj3d.matrixWorld)
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
    calcBoundingBox.box.set(
      new Vector3(-0.05, -0.05, -0.05).add(transform.position),
      new Vector3(0.05, 0.05, 0.05).add(transform.position)
    )
  }
}
