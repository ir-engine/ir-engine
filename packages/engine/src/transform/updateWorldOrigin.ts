import { getMutableState } from '@etherealengine/hyperflux'

import { Engine } from '../ecs/classes/Engine'
import { getComponent } from '../ecs/functions/ComponentFunctions'
import { ReferenceSpace, XRState } from '../xr/XRState'
import { TransformComponent } from './components/TransformComponent'
import { computeTransformMatrix } from './systems/TransformSystem'

// TODO: only update the world origin in one place; move logic for moving based on viewer hit into the function above
export const updateWorldOriginFromScenePlacement = () => {
  const xrState = getMutableState(XRState)
  const scenePosition = xrState.scenePosition.value
  const sceneRotation = xrState.sceneRotation.value
  const sceneScale = xrState.sceneScale.value
  const originTransform = getComponent(Engine.instance.originEntity, TransformComponent)
  originTransform.position.copy(scenePosition)
  originTransform.rotation.copy(sceneRotation)
  originTransform.scale.setScalar(sceneScale || 1)
  originTransform.matrixInverse.compose(originTransform.position, originTransform.rotation, originTransform.scale)
  originTransform.matrix
    .copy(originTransform.matrixInverse)
    .invert()
    .decompose(originTransform.position, originTransform.rotation, originTransform.scale)
  if (ReferenceSpace.localFloor) {
    const xrRigidTransform = new XRRigidTransform(scenePosition, sceneRotation)
    ReferenceSpace.origin = ReferenceSpace.localFloor.getOffsetReferenceSpace(xrRigidTransform)
  }
}

export const updateWorldOrigin = () => {
  if (ReferenceSpace.localFloor) {
    const originTransform = getComponent(Engine.instance.originEntity, TransformComponent)
    const xrRigidTransform = new XRRigidTransform(originTransform.position, originTransform.rotation)
    ReferenceSpace.origin = ReferenceSpace.localFloor.getOffsetReferenceSpace(xrRigidTransform.inverse)
  }
}

export const computeAndUpdateWorldOrigin = () => {
  computeTransformMatrix(Engine.instance.originEntity)
  TransformComponent.dirtyTransforms[Engine.instance.originEntity] = false
  updateWorldOrigin()
}

export const updateEyeHeight = () => {
  const xrFrame = Engine.instance.xrFrame
  if (!xrFrame) return
  const viewerPose = xrFrame.getViewerPose(ReferenceSpace.localFloor!)
  if (viewerPose) {
    const xrState = getMutableState(XRState)
    xrState.userEyeLevel.set(viewerPose.transform.position.y)
  }
}
