import { Quaternion, Vector3 } from 'three'

import { getState } from '@xrengine/hyperflux'

import { V_111 } from '../common/constants/MathConstants'
import { Engine } from '../ecs/classes/Engine'
import { World } from '../ecs/classes/World'
import { getComponent } from '../ecs/functions/ComponentFunctions'
import { XRState } from '../xr/XRState'
import { TransformComponent } from './components/TransformComponent'
import { computeTransformMatrix } from './systems/TransformSystem'

// TODO: only update the world origin in one place; move logic for moving based on viewer hit into the function above
export const updateWorldOriginFromViewerHit = (
  world: World,
  position: Vector3,
  rotation: Quaternion,
  scale?: Vector3
) => {
  const worldOriginTransform = getComponent(world.originEntity, TransformComponent)
  worldOriginTransform.matrix.compose(position, rotation, V_111)
  worldOriginTransform.matrix.invert()
  if (scale) worldOriginTransform.matrix.scale(scale)
  worldOriginTransform.matrix.decompose(
    worldOriginTransform.position,
    worldOriginTransform.rotation,
    worldOriginTransform.scale
  )
}

export const updateWorldOrigin = () => {
  const world = Engine.instance.currentWorld
  const xrState = getState(XRState)
  if (xrState.localFloorReferenceSpace.value) {
    computeTransformMatrix(world.originEntity, world)
    const originTransform = getComponent(world.originEntity, TransformComponent)
    const xrRigidTransform = new XRRigidTransform(originTransform.position, originTransform.rotation)
    xrState.originReferenceSpace.set(
      xrState.localFloorReferenceSpace.value.getOffsetReferenceSpace(xrRigidTransform.inverse)
    )
  }
}
