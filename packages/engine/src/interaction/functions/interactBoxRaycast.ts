import { Box3, Frustum, Matrix4, Vector3 } from 'three'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { BoundingBoxComponent } from '../components/BoundingBoxComponent'
import { InteractableComponent } from '../components/InteractableComponent'
import { InteractorComponent } from '../components/InteractorComponent'
import { interactiveReachDistance } from '../../avatar/functions/getInteractiveIsInReachDistance'
import { isEntityLocalClient } from '../../networking/functions/isEntityLocalClient'
import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'

const mat4 = new Matrix4()
const projectionMatrix = new Matrix4().makePerspective(
  -0.1, // x1
  0.1, // x2
  -0.1, // y1
  0.1, // y2
  0.1, // near
  2 // far
)
const frustum = new Frustum()
const vec3 = new Vector3()

type RaycastResult = [Entity, boolean, number?, number?]

/**
 * Checks if entity can interact with any of entities listed in 'interactive' array, checking distance, guards and raycast
 * @param {Entity} entity
 * @param {Entity[]} raycastList
 */

export const interactBoxRaycast = (entity: Entity, raycastList: Entity[]): void => {
  const interacts = getComponent(entity, InteractorComponent)
  if (!isEntityLocalClient(entity)) {
    interacts.subFocusedArray = []
    interacts.focusedInteractive = null!
    return
  }

  const transform = getComponent(entity, TransformComponent)
  const controller = getComponent(entity, AvatarControllerComponent)

  if (!controller) return

  if (!raycastList.length) {
    return
  }

  interacts.frustumCamera.updateMatrixWorld()
  interacts.frustumCamera.matrixWorldInverse.copy(interacts.frustumCamera.matrixWorld).invert()

  mat4.multiplyMatrices(projectionMatrix, interacts.frustumCamera.matrixWorldInverse)
  frustum.setFromProjectionMatrix(mat4)

  const subFocusedArray = raycastList
    .map((entityIn): RaycastResult => {
      const boundingBox = getComponent(entityIn, BoundingBoxComponent)
      if (!boundingBox.box) {
        return [entityIn, false, 0]
      }
      if (boundingBox.dynamic) {
        const object3D = getComponent(entityIn, Object3DComponent)
        const aabb = new Box3()
        aabb.copy(boundingBox.box)
        aabb.applyMatrix4(object3D.value.matrixWorld)
        return [entityIn, frustum.intersectsBox(aabb), aabb.distanceToPoint(transform.position)]
      } else {
        return [entityIn, frustum.intersectsBox(boundingBox.box), boundingBox.box.distanceToPoint(transform.position)]
      }
    })
    .filter((value) => value[1])

  if (!subFocusedArray.length) {
    interacts.subFocusedArray = []
    interacts.focusedInteractive = null!
    return
  }

  interacts.subFocusedArray = subFocusedArray.map((v: any) => [getComponent(v[0], Object3DComponent).value, v[3]])

  const [entityInteractable, doesIntersectFrustrum, distanceToPlayer] = subFocusedArray.sort(
    (a: any, b: any) => a[2] - b[2]
  )[0]

  const interactable = getComponent(entityInteractable, InteractableComponent)
  const distance = interactable.data?.interactionDistance ?? interactiveReachDistance

  const resultIsCloseEnough = distanceToPlayer! < distance
  if (resultIsCloseEnough) {
    interacts.focusedInteractive = entityInteractable
  }
}
