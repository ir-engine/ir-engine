import { Box3, Frustum, Matrix4, Mesh, Vector3 } from 'three'

import { getEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { dispatchAction } from '@xrengine/hyperflux'

import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'
import { interactiveReachDistance } from '../../avatar/functions/getInteractiveIsInReachDistance'
import { EngineActions } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { isEntityLocalClient } from '../../networking/functions/isEntityLocalClient'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { BoundingBoxComponent } from '../components/BoundingBoxComponent'
import { InteractableComponent } from '../components/InteractableComponent'
import { InteractorComponent } from '../components/InteractorComponent'

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

type RaycastResult = [Entity, boolean, number]

/**
 * Checks if entity can interact with any of entities listed in 'interactive' array, checking distance, guards and raycast
 * @param {Entity} entity
 * @param {Entity[]} raycastList
 */

export const interactBoxRaycast = (entity: Entity, raycastList: Entity[]) => {
  const interactor = getComponent(entity, InteractorComponent)
  const transform = getComponent(entity, TransformComponent)
  const controller = getComponent(entity, AvatarControllerComponent)
  const availableInteractable = getEngineState().availableInteractable.value
  if (!controller) return

  if (!interactor) return

  if (!raycastList.length) return

  interactor.frustumCamera.updateMatrixWorld()
  interactor.frustumCamera.matrixWorldInverse.copy(interactor.frustumCamera.matrixWorld).invert()

  mat4.multiplyMatrices(projectionMatrix, interactor.frustumCamera.matrixWorldInverse)
  frustum.setFromProjectionMatrix(mat4)

  const subFocusedArray = raycastList
    .map((entityIn): RaycastResult => {
      const boundingBox = getComponent(entityIn, BoundingBoxComponent)
      if (!boundingBox.box) return [entityIn, false, 0]
      return [entityIn, frustum.intersectsBox(boundingBox.box), boundingBox.box.distanceToPoint(transform.position)]
    })
    .filter((value) => value[1])

  if (!subFocusedArray.length) {
    interactor.subFocusedArray = []
  }

  interactor.subFocusedArray = subFocusedArray.map((v) => v[0])

  let focussed = interactor.focusedInteractive
  if (!focussed && subFocusedArray.length) {
    const [entityInteractable, doesIntersectFrustrum, distanceToInteractor] = subFocusedArray.sort(
      (a: any, b: any) => a[2] - b[2]
    )[0]

    focussed = entityInteractable
  }

  let resultIsCloseEnough = false
  if (focussed) {
    const interactable = getComponent(focussed, InteractableComponent).value
    const interactDistance = interactable?.interactionDistance ?? interactiveReachDistance
    const boundingBox = getComponent(focussed, BoundingBoxComponent)
    const distance = boundingBox.box.distanceToPoint(transform.position)
    resultIsCloseEnough = distance < interactDistance
  }

  if (focussed && resultIsCloseEnough) {
    interactor.focusedInteractive = focussed
    if (!interactor.subFocusedArray.includes(focussed)) {
      interactor.subFocusedArray.unshift(focussed)
    }
    if (!availableInteractable) {
      dispatchAction(EngineActions.availableInteractable({ availableInteractable: focussed }))
    }
  } else {
    interactor.focusedInteractive = null
    if (availableInteractable) {
      dispatchAction(EngineActions.availableInteractable({ availableInteractable: null }))
    }
  }
}
