import { Frustum, Matrix4, PerspectiveCamera, Vector3 } from 'three'

import { getEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { dispatchAction } from '@xrengine/hyperflux'

import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'
import { EngineActions } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { InteractorComponent } from '../components/InteractorComponent'

const mat4 = new Matrix4()
// const projectionMatrix = new Matrix4().makePerspective(
//   -0.1, // x1
//   0.1, // x2
//   -0.1, // y1
//   0.1, // y2
//   0.1, // near
//   2 // far
// )
const frustum = new Frustum()

const distanceSort = (a: any, b: any) => a[1] - b[1]

/**
 * Checks if entity can interact with any of entities listed in 'interactive' array, checking distance, guards and raycast
 * @param {Entity} entity
 * @param {Entity[]} raycastList
 */

export const gatherFocussedInteractives = (entity: Entity, raycastList: Entity[]) => {
  const interactor = getComponent(entity, InteractorComponent)
  const transform = getComponent(entity, TransformComponent)
  const controller = getComponent(entity, AvatarControllerComponent)
  const availableInteractable = getEngineState().availableInteractable.value

  if (!controller || !interactor || !raycastList.length) return

  const frustumCamera = getComponent(interactor.frustumCameraEntity, Object3DComponent).value as PerspectiveCamera

  frustumCamera.updateMatrixWorld()
  frustumCamera.matrixWorldInverse.copy(frustumCamera.matrixWorld).invert()

  mat4.multiplyMatrices(frustumCamera.projectionMatrix, frustumCamera.matrixWorldInverse)
  frustum.setFromProjectionMatrix(mat4)

  const subFocusedArray = [] as [Entity, number][]

  for (const entityIn of raycastList) {
    const targetTransform = getComponent(entityIn, TransformComponent)
    if (frustum.containsPoint(targetTransform.position))
      subFocusedArray.push([entityIn, transform.position.distanceTo(targetTransform.position)])
  }

  interactor.subFocusedArray = subFocusedArray.map((v) => v[0])

  const focussed = subFocusedArray.length && subFocusedArray.sort(distanceSort)[0][0]

  if (focussed && interactor.focusedInteractive !== focussed && interactor.subFocusedArray.length) {
    interactor.focusedInteractive = focussed
    if (!interactor.subFocusedArray.includes(focussed)) {
      interactor.subFocusedArray.unshift(focussed)
    }
    if (!availableInteractable) {
      dispatchAction(EngineActions.availableInteractable({ availableInteractable: focussed }))
    }
  }

  if (!focussed && interactor.focusedInteractive && !interactor.subFocusedArray.length) {
    interactor.focusedInteractive = null
    if (availableInteractable) {
      dispatchAction(EngineActions.availableInteractable({ availableInteractable: null }))
    }
  }
}
