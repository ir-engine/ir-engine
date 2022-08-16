import { Frustum, Matrix4, PerspectiveCamera, Vector3 } from 'three'

import { dispatchAction, getState } from '@xrengine/hyperflux'

import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { DistanceFromLocalClientComponent } from '../../transform/components/DistanceComponents'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { InteractableComponent } from '../components/InteractableComponent'
import { InteractState } from '../systems/InteractiveSystem'

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

const distanceSort = (a: Entity, b: Entity) => {
  const aDist = DistanceFromLocalClientComponent.squaredDistance[a]
  const bDist = DistanceFromLocalClientComponent.squaredDistance[b]
  return aDist - bDist
}

/**
 * Checks if entity can interact with any of entities listed in 'interactive' array, checking distance, guards and raycast
 * @param {Entity[]} interactables
 */

export const gatherAvailableInteractables = (interactables: Entity[]) => {
  if (!Engine.instance.currentWorld.localClientEntity) return

  const transform = getComponent(Engine.instance.currentWorld.localClientEntity, TransformComponent)
  const controller = getComponent(Engine.instance.currentWorld.localClientEntity, AvatarControllerComponent)

  if (!controller || !transform) return

  const availableInteractable = getState(InteractState).available
  const camera = getComponent(controller.cameraEntity, Object3DComponent).value as PerspectiveCamera

  mat4.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
  frustum.setFromProjectionMatrix(mat4)

  // const available = [] as Entity[]
  // for (const entityIn of interactables) {
  //   const targetTransform = getComponent(entityIn, TransformComponent)
  //   available.push(entityIn)
  // }

  availableInteractable.set([...interactables].sort(distanceSort))
}
